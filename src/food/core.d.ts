import type { CategoryControlResult, ComparisonRelation } from "./category-control.js";

export type DataConfidence = "high" | "medium" | "low" | "conflicted";
export type ProductState = "complete" | "incomplete" | "conflicted" | "malformed";

export interface SourceReference {
  sourceId: string;
  apiVersion: string;
  schemaVersion: number | null;
  endpoint: string;
  retrievedAt: string;
  licence: unknown;
}

export interface CanonicalFoodProduct {
  modelVersion: string;
  id: string;
  gtin: string;
  name: string;
  brand: string;
  quantity: string;
  ingredientsText: string;
  allergenTags: string[];
  traceTags: string[];
  allergenDataPresent: boolean;
  nutrients: {
    energyKj: number | null;
    energyKcal: number | null;
    fat: number | null;
    saturatedFat: number | null;
    carbohydrates: number | null;
    sugars: number | null;
    fibre: number | null;
    protein: number | null;
    salt: number | null;
    sodium: number | null;
  };
  categoryTags: string[];
  sourceComparisonCategory: string | null;
  comparisonCategory: string | null;
  comparisonFamily: string | null;
  categoryControl: CategoryControlResult;
  marketTags: string[];
  imageUrl: string;
  sourceRevision: number | null;
  sourceModifiedAt: number | null;
  sourceTags: string[];
  sourceRef: SourceReference | null;
  isFixture: boolean;
  dataQuality: {
    state: ProductState;
    confidence: DataConfidence;
    completeness: number;
    missingFields: string[];
    conflicts: string[];
  };
}

export interface FoodPreferences {
  avoidAllergens?: string[];
  lowerSugar?: boolean;
  lowerSalt?: boolean;
  higherProtein?: boolean;
}

export interface RankedAlternative {
  product: CanonicalFoodProduct;
  relation: ComparisonRelation;
  eligible: boolean;
  exclusions: string[];
  explanations: string[];
  favourableCount: number;
  knownCount: number;
  selectedPriorityCount: number;
}

export const FOOD_MODEL_VERSION: string;
export const COMPARISON_MODEL_VERSION: string;
export function normalizeGtin(input: unknown): { ok: boolean; normalized: string; error: string | null };
export function selectComparisonCategory(tags: unknown): string | null;
export function normaliseProduct(raw: unknown, options?: Record<string, unknown>): CanonicalFoodProduct;
export function normaliseSourceEnvelope(envelope: unknown): Record<string, unknown> & {
  state: "found" | "not_found" | "source_error" | "malformed";
  product?: CanonicalFoodProduct;
  alternatives?: CanonicalFoodProduct[];
  alternativeState?: string;
  alternativeMessage?: string;
  alternativeAttempts?: unknown[];
  sourceSearchCategory?: string | null;
};
export function rankAlternatives(
  baseline: CanonicalFoodProduct,
  alternatives: CanonicalFoodProduct[],
  preferences?: FoodPreferences,
): {
  modelVersion: string;
  preferences: Required<FoodPreferences>;
  fairComparison: boolean;
  limitations: string[];
  eligible: RankedAlternative[];
  adjacent: RankedAlternative[];
  unsuitable: RankedAlternative[];
  excluded: RankedAlternative[];
};
export function canonicalJson(value: unknown): string;
