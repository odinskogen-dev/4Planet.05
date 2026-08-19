import type { CanonicalFoodProduct } from "./core.js";
import type { PickWalletResult } from "./pick-wallet.js";
import type { PickPlanetResult } from "./pick-planet.js";

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
  evidence: Array<Record<string, unknown>>;
}

export interface PickTruthSummary {
  confidence: string;
  completeness: number;
  conflicts: string[];
  missing: string[];
}

export interface PickTruthPassport {
  source: { id: string; class: string; licence: string; apiVersion?: string; endpoint?: string };
  directness: string;
  freshness: { state: string; detail: string };
  completeness: number;
  conflictState: string;
  facts: Array<{ id: string; label: string; available: boolean; directness: string; interpretation: string }>;
  evidenceSources: Array<Record<string, unknown>>;
  chain: string[];
}

export interface PickDecisionContext {
  wallet?: PickWalletResult | null;
  planet?: PickPlanetResult | null;
}

export const PICK_MODEL_VERSION: string;
export function buildDecisionAxes(product?: CanonicalFoodProduct | null, context?: PickDecisionContext): PickDecisionAxis[];
export function unknownAxis(id: PickAxisId, label: PickDecisionAxis["label"], reason: string): PickDecisionAxis;
export function buildProductTruthSummary(product?: CanonicalFoodProduct | null): PickTruthSummary;
export function buildTruthPassport(product?: CanonicalFoodProduct | null, context?: PickDecisionContext): PickTruthPassport;
