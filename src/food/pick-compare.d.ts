import type { CanonicalFoodProduct } from "./core.js";
import type { PickHealthResult, PickHealthProfile } from "./pick-health.js";

export interface PickMetricComparison {
  known: boolean;
  favourable: boolean;
  adverse: boolean;
  label: string;
  text: string;
}

export interface PickAlternativeEvaluation {
  product: CanonicalFoodProduct;
  eligible: boolean;
  relation: string;
  reason: string;
  profile: PickHealthProfile;
  health: PickHealthResult;
  comparisons: PickMetricComparison[];
  state: string;
}

export const PICK_COMPARE_VERSION: string;
export function compareHealthAlternative(baseline: CanonicalFoodProduct, candidate: CanonicalFoodProduct): Omit<PickAlternativeEvaluation, "product">;
export function rankPickAlternatives(baseline: CanonicalFoodProduct, alternatives: CanonicalFoodProduct[]): PickAlternativeEvaluation[];
