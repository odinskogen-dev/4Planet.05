import type { CanonicalSolutionType, EvidenceDirection, EvidenceStrength, ReviewStatus } from "./contracts";

/**
 * First bounded PSI decision-grade vertical seam for Living Systems.
 * This is a small read model, not a second data store. IDs resolve to BRAIN records
 * when the private PSI package is mounted/ingested. No provider offering is invented.
 */
export const POLLINATION_FOOD_VERTICAL = {
  id: "VERT-POLLINATION-FOOD-001",
  status: "DECISION_GRADE_V1_CONTEXTUAL_NOT_EXPERT_VALIDATED",
  problemRef: "4P-PX-0021",
  functionRef: "function:animal-mediated-pollination",
  ecosystemServiceRef: "service:crop-pollination",
  livingSystemRefs: ["taxon:gbif:1341976", "taxon-group:wild-bees-bumblebees"],
  humanDependencies: [
    { ref: "human-system:food-production", label: "Food production" },
    { ref: "human-system:dietary-diversity", label: "Dietary diversity" },
    { ref: "human-system:farm-livelihoods", label: "Farm livelihoods" },
  ],
  interventionRefs: ["4P-SOL-000086", "4P-SOL-000068", "4P-SOL-000087"],
  decisionQuestions: [
    "Should habitat enhancement be treated as universally yield-positive?",
    "Can threshold-based IPM reduce insecticide use without sacrificing production in some field systems?",
    "Should pollinator habitat and pesticide-risk measures be evaluated together?",
    "What must be monitored before transferring an intervention to another crop or place?",
  ],
  truthBoundary: {
    universalBestSolution: false,
    solutionRelevanceIsEffectiveness: false,
    implementationIsOutcome: false,
    policyIsResult: false,
    honeyBeeIsAllPollinators: false,
    humanExpertValidationCompleted: false,
  },
} as const;

export interface PollinationEvidenceSummary {
  solutionRef: string;
  canonicalType: CanonicalSolutionType;
  evidenceStrength: EvidenceStrength;
  reviewStatus: ReviewStatus;
  supports: string[];
  qualifies: string[];
  challenges: string[];
  sourceRefs: string[];
}

export const POLLINATION_INTERVENTION_EVIDENCE: PollinationEvidenceSummary[] = [
  {
    solutionRef: "4P-SOL-000086",
    canonicalType: "INTERVENTION",
    evidenceStrength: "MODERATE",
    reviewStatus: "LITERATURE_CHECKED",
    supports: ["Flower-rich habitat can improve pollination/pest-control service delivery in some agricultural contexts."],
    qualifies: ["Effects vary with crop, distance, age/perenniality, floral diversity and landscape context."],
    challenges: ["A universal claim that flower strips reliably increase crop yield is not supported."],
    sourceRefs: ["SRC-POLL-ALBRECHT-2020", "SRC-POLL-MELON-MARGINS-2024", "SRC-POLL-BLUEBERRY-PESTICIDE-2024"],
  },
  {
    solutionRef: "4P-SOL-000068",
    canonicalType: "INTERVENTION",
    evidenceStrength: "STRONG",
    reviewStatus: "LITERATURE_CHECKED",
    supports: ["A replicated four-year US field experiment found threshold-based IPM reduced insecticide treatments while retaining corn yield and increasing watermelon pollination/yield in that system."],
    qualifies: ["Crop, pest, pesticide, climate and management context constrain transferability."],
    challenges: ["IPM is not pollinator-friendly by definition; design must explicitly protect pollinators."],
    sourceRefs: ["SRC-POLL-IPM-PNAS-2021", "SRC-POLL-IPM-BEE-HEALTH-2023"],
  },
  {
    solutionRef: "4P-SOL-000087",
    canonicalType: "INTERVENTION",
    evidenceStrength: "STRONG",
    reviewStatus: "LITERATURE_CHECKED",
    supports: ["Field evidence supports pesticide hazard/exposure as a material wild-bee pressure and supports joint habitat + pesticide-risk design."],
    qualifies: ["Exposure and effects vary among bee taxa; managed bees are not universal wild-bee proxies."],
    challenges: ["Pollinator plantings beside conventionally managed fields do not necessarily reduce pesticide exposure."],
    sourceRefs: ["SRC-POLL-RUNDLOF-2015", "SRC-POLL-BLUEBERRY-PESTICIDE-2024", "SRC-POLL-GLOBAL-HAZARD-2026", "SRC-POLL-EXPOSURE-2026"],
  },
];

export const POLLINATION_PLACE_PROOF = [
  { place: "Morocco", role: "IMPLEMENTATION_STUDY_CONTEXT", outcomeStatus: "OBSERVED_STUDY_OUTCOMES", precision: "FOUR_AGRO_ECOSYSTEMS" },
  { place: "Midwestern United States", role: "IPM_FIELD_EXPERIMENT_CONTEXT", outcomeStatus: "OBSERVED_STUDY_OUTCOMES", precision: "MULTI_SITE_REGION" },
  { place: "England", role: "POLICY_FINANCING_CONTEXT", outcomeStatus: "NOT_INFERRED", precision: "ADMINISTRATIVE" },
  { place: "European Union", role: "MONITORING_INFRASTRUCTURE_CONTEXT", outcomeStatus: "MONITORING_CAPABILITY_ONLY", precision: "MULTI_COUNTRY" },
  { place: "Norway", role: "PUBLIC_DECISION_CONTEXT", outcomeStatus: "NOT_INFERRED", precision: "ADMINISTRATIVE" },
] as const;

export const pollinationEvidenceByDirection = (direction: EvidenceDirection) =>
  POLLINATION_INTERVENTION_EVIDENCE.flatMap((item) => {
    const statements = direction === "SUPPORTS" ? item.supports : direction === "QUALIFIES" ? item.qualifies : item.challenges;
    return statements.map((statement) => ({ solutionRef: item.solutionRef, direction, statement, sourceRefs: item.sourceRefs }));
  });
