import type { CanonicalFoodProduct } from "./core.js";
import type { PickHealthProfile } from "./pick-health.js";

export interface PickPlanetEvidenceSource {
  id: string;
  title: string;
  sourceClass: string;
  url: string;
  checkedAt: string;
}

export interface PickPlanetResult {
  version: string;
  profile: PickHealthProfile;
  state: string;
  confidence: string;
  directness: string;
  summary: string;
  evidence: PickPlanetEvidenceSource[];
  limitation: string;
  exactSkuFootprint: boolean;
}

export const PICK_PLANET_VERSION: string;
export const PLANET_SOURCES: Record<string, PickPlanetEvidenceSource>;
export function evaluatePlanet(product?: CanonicalFoodProduct | null): PickPlanetResult;
export function comparePlanet(a?: PickPlanetResult | null, b?: PickPlanetResult | null): { known: boolean; explanation: string };
