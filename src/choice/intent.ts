/**
 * INTENT seam — what is this person trying to decide?
 *
 * Routing only. Recognising a topic never implies that Embla can answer it:
 * for FOOD the answer still depends on the exact product record that gets read.
 *
 * `resolveEmblaIntake` remains the bounded domain router for the decisions whose
 * evidence adapters do not exist yet (HOME, CAR, FINANCE, unclassified). This
 * layer adds the everyday grocery language that sends someone into the FOOD
 * decision surface instead of a fail-closed message.
 */

import { listControlledCategoryProfiles } from "../food/category-control.js";
import type { ChoiceDomain } from "./contract";
import { resolveEmblaIntake, type EmblaIntakeResult } from "./embla";

/** Everyday words for things people buy in a shop, English and Norwegian. */
const FOOD_TERMS = [
  "yoghurt", "yogurt", "yoghurten", "skyr", "kesam", "kefir", "cottage",
  "cereal", "cereals", "granola", "muesli", "müsli", "musli", "corn flakes", "cornflakes",
  "oats", "havregryn", "porridge", "grøt", "frokostblanding",
  "crisps", "chips", "potetgull", "snack", "snacks", "tortilla", "nachos",
  "soda", "cola", "brus", "drink", "energidrikk", "energy drink", "juice", "beverage",
  "pizza", "frozen", "frossen", "dinner", "middag", "lunch", "breakfast", "frokost",
  "bread", "brød", "cheese", "ost", "yoghurts", "pasta", "rice", "ris", "cereal bar",
  "shop", "supermarket", "butikken", "handle", "buy this", "this product", "groceries",
];

const CATEGORY_LABELS = listControlledCategoryProfiles().map((profile) => profile.label);

export interface ChoiceIntent {
  domain: ChoiceDomain;
  /** Exactly what the person typed or tapped. Never rewritten. */
  label: string;
  intake: EmblaIntakeResult;
}

/** The comparison groups FOOD actually controls today, for honest guidance. */
export function controlledComparisonGroups(): string[] {
  return [...new Set(CATEGORY_LABELS)];
}

export function resolveChoiceIntent(input: string): ChoiceIntent | null {
  const label = input.trim();
  if (!label) return null;

  const intake = resolveEmblaIntake(label);
  const value = label.toLowerCase();
  // Single words are matched whole, so "cost" never reads as Norwegian "ost"
  // and "risk" never reads as "ris". Phrases are matched as written.
  const words = new Set(value.split(/[^\p{L}]+/u).filter(Boolean));
  const looksLikeFood =
    intake.domain === "FOOD"
    || FOOD_TERMS.some((term) => (term.includes(" ") ? value.includes(term) : words.has(term)));

  return {
    domain: looksLikeFood ? "FOOD" : intake.domain,
    label,
    intake,
  };
}
