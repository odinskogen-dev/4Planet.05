import type { CanonicalFoodProduct } from "./core.js";

export interface PickHealthProfile {
  id: string;
  family: string;
  label: string;
  directness: string;
}

export interface PickEvidenceSource {
  id: string;
  title: string;
  sourceClass: string;
  url: string;
  checkedAt: string;
}

export interface PickHealthResult {
  version: string;
  profile: PickHealthProfile;
  state: string;
  confidence: string;
  directness: string;
  summary: string;
  evidence: PickEvidenceSource[];
  limitations: string[];
  composition: string[];
}

export interface PickHealthMetric {
  key: "sugars" | "salt" | "fibre" | "saturatedFat";
  direction: "higher" | "lower";
  label: string;
}

export const PICK_HEALTH_VERSION: string;
export const HEALTH_SOURCES: Record<string, PickEvidenceSource>;
export function classifyHealthProfile(product?: CanonicalFoodProduct | null): PickHealthProfile;
export function evaluateHealth(product?: CanonicalFoodProduct | null): PickHealthResult;
export function healthComparisonMetrics(profileId: string): PickHealthMetric[];
