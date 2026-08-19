import type { CanonicalFoodProduct } from "./core.js";

export type PickAxisId = "health" | "wallet" | "planet";
export type PickConfidence = "HIGH" | "MODERATE" | "LIMITED" | "UNKNOWN";

export interface PickDecisionAxis {
  id: PickAxisId;
  label: "HEALTH" | "WALLET" | "PLANET";
  state: string;
  confidence: PickConfidence | string;
  directness: string;
  summary: string;
  limitation: string;
}

export interface PickTruthSummary {
  confidence: string;
  completeness: number;
  conflicts: string[];
  missing: string[];
}

export const PICK_MODEL_VERSION: string;
export function buildDecisionAxes(product?: CanonicalFoodProduct | null): PickDecisionAxis[];
export function unknownAxis(id: PickAxisId, label: PickDecisionAxis["label"], reason: string): PickDecisionAxis;
export function buildProductTruthSummary(product?: CanonicalFoodProduct | null): PickTruthSummary;
