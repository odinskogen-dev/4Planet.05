/**
 * FOOD adapter for the Embla Choice Intelligence contract.
 *
 * This is the first domain implementation of `contract.ts`. It reuses the
 * existing P18-FOOD truth path without weakening it:
 * - `normaliseSourceEnvelope` keeps source provenance and data quality;
 * - `rankAlternatives` remains the authority on comparison ELIGIBILITY,
 *   controlled categories, allergen exclusion and fair-comparison state;
 * - this file adds the human decision layer on top: per-dimension movement,
 *   visible trade-offs and an explainable verdict.
 *
 * It never invents price, availability, sourcing, footprint or health claims.
 */

import {
  normalizeGtin,
  normaliseSourceEnvelope,
  rankAlternatives,
  type CanonicalFoodProduct,
  type FoodPreferences,
  type RankedAlternative,
} from "../food/core.js";
import { FOOD_FIXTURES } from "../food/fixtures.js";
import {
  buildDimension,
  decideChoice,
  scoreOption,
  type ChoiceDecision,
  type ChoiceOption,
  type ChoicePriority,
} from "./contract";

export type FoodReadState = "idle" | "loading" | "found" | "not_found" | "source_error" | "malformed";

export interface FoodRead {
  state: FoodReadState;
  product: CanonicalFoodProduct | null;
  alternatives: CanonicalFoodProduct[];
  message: string;
  isFixture: boolean;
  retrievedAt: string;
  sourceId: string;
  sourceApi: string;
  licence: string;
  alternativeState: string;
  alternativeMessage: string;
}

export interface FoodChoiceContext {
  priorities: string[];
  avoidAllergens: string[];
}

export interface FoodChoice {
  decision: ChoiceDecision;
  /** Every candidate the source returned, including the ones excluded and why. */
  considered: ChoiceOption[];
  selectedPriorities: ChoicePriority[];
  fairComparison: boolean;
}

export const SAMPLE_FOOD_BARCODE = "7038010055652";

export const FOOD_PRIORITIES: ChoicePriority[] = [
  { id: "lowerSugar", label: "Lower sugar", shortLabel: "sugar", direction: "lower" },
  { id: "lowerSalt", label: "Lower salt", shortLabel: "salt", direction: "lower" },
  { id: "higherProtein", label: "More protein", shortLabel: "protein", direction: "higher" },
];

/** Tag values match the normalised Open Food Facts allergen taxonomy. */
export const FOOD_ALLERGENS = [
  { id: "milk", label: "Milk" },
  { id: "gluten", label: "Gluten" },
  { id: "eggs", label: "Eggs" },
  { id: "nuts", label: "Nuts" },
  { id: "peanuts", label: "Peanuts" },
  { id: "soybeans", label: "Soya" },
];

type NutrientKey = keyof CanonicalFoodProduct["nutrients"];

const DIMENSIONS: Array<{
  id: string;
  key: NutrientKey;
  label: string;
  unit: string;
  priorityId: string | null;
  direction: "lower" | "higher" | "none";
}> = [
  { id: "sugar", key: "sugars", label: "Sugar", unit: "g", priorityId: "lowerSugar", direction: "lower" },
  { id: "salt", key: "salt", label: "Salt", unit: "g", priorityId: "lowerSalt", direction: "lower" },
  { id: "protein", key: "protein", label: "Protein", unit: "g", priorityId: "higherProtein", direction: "higher" },
  { id: "saturated-fat", key: "saturatedFat", label: "Saturated fat", unit: "g", priorityId: null, direction: "none" },
  { id: "energy", key: "energyKcal", label: "Energy", unit: "kcal", priorityId: null, direction: "none" },
  { id: "fibre", key: "fibre", label: "Fibre", unit: "g", priorityId: null, direction: "none" },
];

const emptyRead = (state: FoodReadState, message = ""): FoodRead => ({
  state,
  product: null,
  alternatives: [],
  message,
  isFixture: false,
  retrievedAt: "",
  sourceId: "",
  sourceApi: "",
  licence: "",
  alternativeState: "not_run",
  alternativeMessage: "",
});

export function foodProductTitle(product: CanonicalFoodProduct | null): string {
  if (!product) return "this product";
  return product.name || (product.gtin ? `GTIN ${product.gtin}` : "this product");
}

export function foodProductSubtitle(product: CanonicalFoodProduct): string {
  return [product.brand || "Brand not in the record", product.quantity || "Size not in the record"].join(" · ");
}

function readEnvelope(envelope: Record<string, unknown>): FoodRead {
  const normalised = normaliseSourceEnvelope(envelope);
  const source = (envelope.source ?? {}) as { id?: string; apiVersion?: string; licence?: { database?: string } };
  const licence = typeof source.licence?.database === "string" ? source.licence.database : "Licence not reported";
  const base: FoodRead = {
    state: normalised.state,
    product: (normalised.product as CanonicalFoodProduct | undefined) ?? null,
    alternatives: (normalised.alternatives as CanonicalFoodProduct[] | undefined) ?? [],
    message: typeof normalised.message === "string" ? normalised.message : "",
    isFixture: envelope.fixture === true,
    retrievedAt: typeof envelope.retrievedAt === "string" ? envelope.retrievedAt : "",
    sourceId: source.id ?? "open_food_facts",
    sourceApi: source.apiVersion ?? "unknown",
    licence,
    alternativeState: typeof normalised.alternativeState === "string" ? normalised.alternativeState : "not_run",
    alternativeMessage: typeof normalised.alternativeMessage === "string" ? normalised.alternativeMessage : "",
  };
  return base;
}

/** The bounded local test record. Always surfaced to the person as test data. */
export function readSampleFoodProduct(): FoodRead {
  const fixture = FOOD_FIXTURES.complete;
  return readEnvelope(fixture.envelope);
}

export async function readFoodProduct(barcode: string): Promise<FoodRead> {
  const gtin = normalizeGtin(barcode);
  if (!gtin.ok) {
    return emptyRead(
      "malformed",
      gtin.error === "invalid_check_digit"
        ? "That barcode's check digit does not add up. Retype the digits under the bars."
        : "A barcode has 8, 12, 13 or 14 digits. Enter all of them.",
    );
  }

  try {
    const response = await fetch(`/api/food?barcode=${encodeURIComponent(gtin.normalized)}`, {
      headers: { accept: "application/json" },
    });
    const envelope = (await response.json()) as Record<string, unknown>;
    return readEnvelope(envelope);
  } catch {
    return emptyRead(
      "source_error",
      "The product source could not be reached from this device. Nothing has been guessed in its place.",
    );
  }
}

export function toFoodPreferences(context: FoodChoiceContext): FoodPreferences {
  return {
    avoidAllergens: context.avoidAllergens,
    lowerSugar: context.priorities.includes("lowerSugar"),
    lowerSalt: context.priorities.includes("lowerSalt"),
    higherProtein: context.priorities.includes("higherProtein"),
  };
}

function toOption(item: RankedAlternative, baseline: CanonicalFoodProduct, context: FoodChoiceContext): ChoiceOption {
  const product = item.product;
  const dimensions = DIMENSIONS.map((dimension) =>
    buildDimension({
      id: dimension.id,
      label: dimension.label,
      unit: dimension.unit,
      direction: dimension.direction,
      priority: dimension.priorityId !== null && context.priorities.includes(dimension.priorityId),
      baseline: baseline.nutrients[dimension.key],
      candidate: product.nutrients[dimension.key],
      scope: "per 100 g/ml",
    }),
  );

  const notes: string[] = [];
  if (context.avoidAllergens.length > 0 && product.allergenDataPresent) {
    notes.push("None of the allergens you avoid are listed in this record — still check the physical pack.");
  }

  const option: ChoiceOption = {
    id: product.gtin || product.id,
    title: foodProductTitle(product),
    subtitle: foodProductSubtitle(product),
    relationKind: item.relation.kind,
    relationLabel: item.relation.label,
    relationReason: item.relation.reason,
    eligible: item.eligible,
    exclusions: item.exclusions,
    confidence: product.dataQuality.confidence,
    completeness: Math.round(product.dataQuality.completeness * 100),
    missing: product.dataQuality.missingFields,
    isFixture: product.isFixture,
    dimensions,
    notes,
    score: 0,
  };
  option.score = scoreOption(option);
  return option;
}

export function buildFoodChoice(read: FoodRead, context: FoodChoiceContext): FoodChoice | null {
  const baseline = read.product;
  if (!baseline) return null;

  const ranking = rankAlternatives(baseline, read.alternatives, toFoodPreferences(context));
  const eligible = ranking.eligible.map((item) => toOption(item, baseline, context));
  const excluded = ranking.excluded.map((item) => toOption(item, baseline, context));
  const limitations = [...ranking.limitations];

  if (read.alternativeState === "source_error") {
    limitations.push("The alternative search did not return a usable response, so the candidate set may be incomplete.");
  }
  if (read.alternativeState === "not_found" && read.alternatives.length === 0) {
    limitations.push("The source returned no same-category candidates for this market. That is a source result, not proof that none exist.");
  }

  const decision = decideChoice({
    baselineTitle: foodProductTitle(baseline),
    options: eligible,
    priorities: FOOD_PRIORITIES.filter((priority) => context.priorities.includes(priority.id)),
    comparable: ranking.fairComparison,
    limitations,
    counts: {
      eligible: eligible.length,
      adjacent: ranking.adjacent.length,
      unsuitable: ranking.unsuitable.length,
    },
  });

  return {
    decision,
    considered: [...eligible, ...excluded],
    selectedPriorities: FOOD_PRIORITIES.filter((priority) => context.priorities.includes(priority.id)),
    fairComparison: ranking.fairComparison,
  };
}

/** What this comparison structurally cannot answer, stated before anyone asks. */
export const FOOD_CHOICE_BLIND_SPOTS = [
  "Price — no shelf price is read, so no cheaper claim is made.",
  "Availability — market tags are not proof that your shop stocks it today.",
  "Taste, texture and what your household will actually eat.",
  "Farming, packaging and transport footprint — not yet in this evidence path.",
];
