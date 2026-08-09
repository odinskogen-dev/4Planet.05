import type { RuntimeClaimGate } from "@/planet/runtimeTruth";

/*
 * 4PLANET_ CLAIM-FIRST RUNTIME EXPORT v1.0
 *
 * DERIVATIVE BUILD ARTIFACT — NOT A PARALLEL SOURCE OF TRUTH.
 * Canonical authority remains the 4PLANET Knowledge OS / Atomic Programme Register.
 * Export basis: controlled material Claim baseline checked 2026-08-09.
 * Regenerate/review when canonical wording, source links or review state changes.
 */

export const RUNTIME_CLAIM_EXPORT = {
  version: "runtime-claims-v1.0.0",
  canonicalBasisDate: "2026-08-09",
  canonicalSystem: "4PLANET Knowledge OS / Atomic Programme Register",
  status: "DERIVATIVE",
} as const;

export interface RuntimeClaimControl {
  claimId: string;
  claimVersion: string;
  publicSafeWording: string;
  supportingSourceIds: string[];
  evidenceStrength: "strong" | "moderate";
  reviewState: "SOURCE-CHECKED" | "RECOVERED" | "DERIVED" | "VERIFIED";
  gate: RuntimeClaimGate;
  limitations: string[];
}

/**
 * Exact mapping for the 13 seeded relation IDs currently used by the shared
 * Living Systems prototype. The graph remains a prototype reasoning surface;
 * this mapping only prevents the runtime from silently strengthening wording.
 */
export const RELATION_CLAIMS: Record<string, RuntimeClaimControl> = {
  "r-bee-performs-pollination": {
    claimId: "CLM-W02-LSI-011", claimVersion: "v1",
    publicSafeWording: "Western honey bees can perform pollination while foraging by transferring pollen among flowers.",
    supportingSourceIds: ["SRC-W02-USDA-HONEY-POLL-001"], evidenceStrength: "strong", reviewState: "SOURCE-CHECKED", gate: "CLAIM-FIRST OK",
    limitations: ["Do not infer that honey bees are the dominant or optimal pollinator in every ecosystem or crop."],
  },
  "r-bumble-performs-pollination": {
    claimId: "CLM-W02-LSI-014", claimVersion: "v2",
    publicSafeWording: "Bumblebees in the B. terrestris/lucorum group have been observed beginning foraging at lower temperatures than honey bees in comparative field analyses.",
    supportingSourceIds: ["SRC-W02-CORBET-TEMP-001", "SRC-W02-BUMBLE-TEMP-001"], evidenceStrength: "strong", reviewState: "RECOVERED", gate: "CLAIM-FIRST OK",
    limitations: ["Do not claim a universal exact species threshold or ignore microclimate and taxonomic grouping."],
  },
  "r-pollination-supports-reproduction": {
    claimId: "CLM-W02-LSI-012", claimVersion: "v1",
    publicSafeWording: "Pollination enables seed and fruit formation in animal-pollinated flowering plants; the degree of dependence varies among plant and crop species.",
    supportingSourceIds: ["SRC-W02-USDA-HONEY-POLL-001", "SRC-W02-KLEIN-POLLINATION-001"], evidenceStrength: "strong", reviewState: "SOURCE-CHECKED", gate: "CLAIM-FIRST OK",
    limitations: ["Do not imply all flowering plants require animal pollination."],
  },
  "r-reproduction-supports-food-production": {
    claimId: "CLM-W02-LSI-001", claimVersion: "v1",
    publicSafeWording: "Animal pollination supports reproduction and production in many important crops, with dependence varying substantially by crop.",
    supportingSourceIds: ["SRC-W02-KLEIN-POLLINATION-001"], evidenceStrength: "strong", reviewState: "RECOVERED", gate: "CLAIM-FIRST OK",
    limitations: ["Do not convert crop-category dependence into a universal food-volume percentage or a honey-bee-specific claim."],
  },
  "r-food-production-supports-food-system": {
    claimId: "CLM-W02-LSI-009", claimVersion: "v1",
    publicSafeWording: "Changes in crop production can affect food-system price, availability and nutrition through trade, substitution, policy and other mediating factors.",
    supportingSourceIds: ["SRC-W02-KLEIN-POLLINATION-001"], evidenceStrength: "moderate", reviewState: "DERIVED", gate: "CLAIM-FIRST OK",
    limitations: ["This is a 4PLANET systems interpretation, not a linear sourced ecological law."],
  },
  "r-pesticide-affects-bee": {
    claimId: "CLM-W02-LSI-003", claimVersion: "v1",
    publicSafeWording: "Certain neonicotinoid exposures were associated with negative bee outcomes in large field experiments, with effects varying by country and species.",
    supportingSourceIds: ["SRC-W02-WOODCOCK-NEONIC-001"], evidenceStrength: "strong", reviewState: "RECOVERED", gate: "CLAIM-FIRST OK",
    limitations: ["Do not generalise to all pesticides, all bees or all landscapes."],
  },
  "r-habitat-affects-bee": {
    claimId: "CLM-W02-LSI-008", claimVersion: "v2",
    publicSafeWording: "Loss or degradation of floral and nesting habitat can reduce habitat quality for bumblebees; abundance and richness responses vary among species and landscapes.",
    supportingSourceIds: ["SRC-W02-BUMBLE-HABITAT-001", "SRC-W02-FAO-IPBES-POLL-001"], evidenceStrength: "strong", reviewState: "RECOVERED", gate: "CLAIM-FIRST OK",
    limitations: ["Do not present one grassland study as a universal quantitative effect."],
  },
  "r-primary-supports-cod": {
    claimId: "CLM-W02-LSI-010", claimVersion: "v2",
    publicSafeWording: "Primary production can propagate through zooplankton and prey availability to cod production in documented shelf ecosystems.",
    supportingSourceIds: ["SRC-W02-FAROE-COD-PP-001"], evidenceStrength: "strong", reviewState: "RECOVERED", gate: "CLAIM-FIRST OK",
    limitations: ["Do not universalise Faroe Shelf magnitude or pathway to all Atlantic cod stocks."],
  },
  "r-humpback-performs-nutrient": {
    claimId: "CLM-W02-LSI-002", claimVersion: "v1",
    publicSafeWording: "Whales can contribute to nutrient recycling in documented feeding systems; local magnitude must be sourced to the relevant ecosystem and population.",
    supportingSourceIds: ["SRC-W02-ROMAN-WHALE-PUMP-001"], evidenceStrength: "strong", reviewState: "RECOVERED", gate: "CLAIM-FIRST OK",
    limitations: ["Do not universalise quantified Gulf of Maine effects globally."],
  },
  "r-cod-supports-fisheries": {
    claimId: "CLM-W02-LSI-013", claimVersion: "v1",
    publicSafeWording: "Atlantic cod supports economically and culturally important regional fisheries in parts of the North Atlantic.",
    supportingSourceIds: ["SRC-W02-NOAA-COD-001", "SRC-W02-DFO-NORTHERN-COD-001"], evidenceStrength: "strong", reviewState: "RECOVERED", gate: "CLAIM-FIRST OK",
    limitations: ["Quantify economic share only with region-specific current data."],
  },
  "r-warming-affects-coastal": {
    claimId: "CLM-W02-LSI-006", claimVersion: "v1",
    publicSafeWording: "Warming is changing distributions of plankton and fish in the Greater North Sea; direction and magnitude vary among taxa.",
    supportingSourceIds: ["SRC-W02-ICES-NORTHSEA-001"], evidenceStrength: "strong", reviewState: "RECOVERED", gate: "CLAIM-FIRST OK",
    limitations: ["Do not simplify heterogeneous responses to a universal poleward shift."],
  },
  "r-overexploit-affects-cod": {
    claimId: "CLM-W02-LSI-007", claimVersion: "v1",
    publicSafeWording: "Fishing pressure can contribute to stock depletion or collapse, but collapse and recovery claims must identify the cod stock, geography, assessment date and current status.",
    supportingSourceIds: ["SRC-W02-NOAA-COD-001", "SRC-W02-DFO-NORTHERN-COD-001"], evidenceStrength: "strong", reviewState: "RECOVERED", gate: "CLAIM-FIRST OK",
    limitations: ["Do not repeat the legacy unqualified sentence that a Grand Banks stock 'has still not recovered'."],
  },
  "r-warming-affects-coral": {
    claimId: "CLM-W02-SCI-001", claimVersion: "v1",
    publicSafeWording: "Satellite heat-stress conditions indicate bleaching risk under NOAA Coral Reef Watch methodology; they are not field observations of bleaching or mortality.",
    supportingSourceIds: ["SRC-W02-NOAA-CRW-METHOD-001"], evidenceStrength: "strong", reviewState: "RECOVERED", gate: "CLAIM-FIRST OK",
    limitations: ["Use field or reef-survey evidence for observed bleaching claims."],
  },
};

export const RUNTIME_TRUTH_GATES = {
  occurrenceRecords: {
    claimId: "CLM-DATA-009",
    gate: "CLAIM-FIRST OK" as RuntimeClaimGate,
    rule: "Occurrence record count is not a population estimate; preserve upstream dataset/provider and licence.",
  },
  coralHeatStress: {
    claimId: "CLM-W02-SCI-001",
    gate: "CLAIM-FIRST OK" as RuntimeClaimGate,
    rule: "DHW/heat stress is not an observed bleaching or mortality event.",
  },
  inaturalistMedia: {
    claimId: "CLM-W02-DATA-003",
    gate: "PUBLIC-USE BLOCK" as RuntimeClaimGate,
    rule: "Exact item-level media licence is required before public/commercial use.",
  },
  sensitiveCoordinates: {
    claimId: "CLM-W02-DATA-004",
    gate: "CLAIM-FIRST OK" as RuntimeClaimGate,
    rule: "Obscured/source-suppressed coordinates are not exact locations and must not be reconstructed.",
  },
  impactTest: {
    claimId: "CLM-IMPACT-001",
    gate: "CLAIM-FIRST OK" as RuntimeClaimGate,
    rule: "TEST records do not prove payment, physical delivery, outcome or ecological impact.",
  },
  providerStatus: {
    claimId: "CLM-IMPACT-002",
    gate: "CLAIM-FIRST OK" as RuntimeClaimGate,
    rule: "Research/diligence candidate is not a qualified or contracted 4PLANET partner.",
  },
} as const;

export const claimForRelation = (relationId: string) => RELATION_CLAIMS[relationId];
