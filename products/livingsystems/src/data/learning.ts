// ============================================================================
// LEARNING + OUTCOME INTELLIGENCE DATA (v1.2)
// Structured learning EXAMPLES for the existing proof cases — not live impact
// reports, and not a claim that 4PLANET has implemented these actions. Cautious
// language; honest uncertainty. Each record closes one loop:
//   Decision → Expected Outcome → Observed Outcome → Learning → (Confidence).
// ============================================================================

import type {
  ExpectedOutcome,
  ObservedOutcome,
  LearningRecord,
  ConfidenceUpdate,
} from "@/types";

export const EXPECTED_OUTCOMES: ExpectedOutcome[] = [
  {
    id: "EO_PROTECTED_AREAS",
    title: "Protected areas may reduce forest conversion",
    description:
      "Where effectively governed, protected areas may help reduce ecosystem conversion and support carbon storage and biodiversity habitat.",
    decisionSignalId: "DS_PROTECTED_AREAS",
    solutionPathwayId: "PW_DEFOR_PROTECTED",
    ecosystemIds: ["EC_AMAZON_RAINFOREST"],
    expectedDirection: "Protect",
    timeHorizon: "Long-term",
    confidence: "Medium",
    assumptions: [
      "Protection is paired with adequate governance and enforcement.",
      "Local context and pressures are accounted for.",
    ],
    sourceIds: ["WWF_AMAZON", "RAISG"],
    reviewStatus: "Reviewed",
    dataGaps: ["Outcomes vary by enforcement and governance quality."],
  },
  {
    id: "EO_INDIGENOUS",
    title: "Indigenous stewardship may support forest integrity",
    description:
      "Indigenous stewardship may support forest protection and ecosystem integrity in many contexts.",
    decisionSignalId: "DS_INDIGENOUS",
    solutionPathwayId: "PW_LANDUSE_INDIGENOUS",
    ecosystemIds: ["EC_AMAZON_RAINFOREST"],
    expectedDirection: "Protect",
    timeHorizon: "Long-term",
    confidence: "Medium",
    assumptions: [
      "Land rights and territorial recognition are in place.",
      "External pressure is not overwhelming.",
    ],
    sourceIds: ["RAISG", "WWF_AMAZON"],
    reviewStatus: "Reviewed",
    dataGaps: ["Outcomes vary by legal recognition and governance context."],
  },
  {
    id: "EO_MONITORING",
    title: "Monitoring may improve early detection",
    description:
      "Monitoring systems may improve early detection of fire, illegal mining and forest degradation.",
    decisionSignalId: "DS_MONITORING",
    solutionPathwayId: "PW_FIRE_MONITORING",
    ecosystemIds: ["EC_AMAZON_RAINFOREST"],
    expectedDirection: "Improve",
    timeHorizon: "Immediate",
    confidence: "Medium",
    assumptions: ["Detection is connected to response capacity."],
    sourceIds: ["INPE", "MAPBIOMAS"],
    reviewStatus: "Reviewed",
    dataGaps: ["Detection alone does not create enforcement."],
  },
  {
    id: "EO_RESTORATION",
    title: "Restoration may rebuild carbon and habitat over time",
    description:
      "Forest restoration may support carbon storage and biodiversity habitat over time.",
    decisionSignalId: "DS_RESTORATION",
    solutionPathwayId: "PW_DEGRAD_RESTORATION",
    ecosystemIds: ["EC_AMAZON_RAINFOREST"],
    expectedDirection: "Restore",
    timeHorizon: "Long-term",
    confidence: "Medium",
    assumptions: [
      "Restored areas are protected from future disturbance.",
      "Method suits the land-use history.",
    ],
    sourceIds: ["AMAZON_INSTITUTIONAL"],
    reviewStatus: "Draft",
    dataGaps: ["Recovery is slow and condition-dependent."],
  },
  {
    id: "EO_PESTICIDE_REDUCTION",
    title: "Pesticide reduction may support pollinator health",
    description:
      "Reducing harmful pesticide pressure may support pollinator health and pollination resilience.",
    decisionSignalId: "DS_PESTICIDE_REDUCTION",
    solutionPathwayId: "PW_PESTICIDES_REDUCTION",
    speciesIds: ["SP_HONEY_BEE"],
    expectedDirection: "Improve",
    timeHorizon: "Short-term",
    confidence: "Medium",
    assumptions: [
      "Reduction is meaningful relative to exposure.",
      "Forage and habitat are also available.",
    ],
    sourceIds: ["IPBES"],
    reviewStatus: "Reviewed",
    dataGaps: ["Effects depend on pesticide type and farm management."],
  },
  {
    id: "EO_POLLINATOR_HABITAT",
    title: "Pollinator habitat may support pollination resilience",
    description:
      "Pollinator habitat may support pollinator populations and pollination services.",
    decisionSignalId: "DS_POLLINATOR_HABITAT",
    solutionPathwayId: "PW_HABITAT_POLLINATOR",
    speciesIds: ["SP_HONEY_BEE"],
    expectedDirection: "Improve",
    timeHorizon: "Short-term",
    confidence: "Medium",
    assumptions: ["Habitat has quality, connectivity and plant diversity."],
    sourceIds: ["IPBES"],
    reviewStatus: "Reviewed",
    dataGaps: ["Area alone is a weak proxy for habitat value."],
  },
];

export const OBSERVED_OUTCOMES: ObservedOutcome[] = [
  {
    id: "OO_PROTECTED_AREAS",
    expectedOutcomeId: "EO_PROTECTED_AREAS",
    title: "Protection outcomes are context-dependent",
    description:
      "Across the literature, protected-area outcomes vary, and governance quality appears to matter substantially.",
    observedDirection: "Mixed",
    evidenceSummary:
      "Evidence is context-dependent; protection status alone does not guarantee reduced conversion.",
    sourceIds: ["WWF_AMAZON", "RAISG"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Quantitative effect sizes vary by region and dataset."],
  },
  {
    id: "OO_INDIGENOUS",
    expectedOutcomeId: "EO_INDIGENOUS",
    title: "Strong potential, governance-dependent",
    description:
      "Many studies associate Indigenous territories with lower deforestation, though outcomes vary with recognition and pressure.",
    observedDirection: "Improved",
    evidenceSummary:
      "Association observed in many regions; not uniform, and dependent on rights and governance.",
    sourceIds: ["RAISG", "WWF_AMAZON"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Causal attribution is difficult; context varies."],
  },
  {
    id: "OO_MONITORING",
    expectedOutcomeId: "EO_MONITORING",
    title: "Detection improves; enforcement is the bottleneck",
    description:
      "Monitoring can surface alerts quickly, but detection does not automatically lead to enforcement or restoration.",
    observedDirection: "Mixed",
    evidenceSummary:
      "Detection capability is strong; outcomes depend on the response that follows.",
    sourceIds: ["INPE", "MAPBIOMAS"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Response capacity is not modelled here."],
  },
  {
    id: "OO_RESTORATION",
    expectedOutcomeId: "EO_RESTORATION",
    title: "Recovery is slow and conditional",
    description:
      "Restoration outcomes depend on method, land-use history and protection from future disturbance, and unfold over long timeframes.",
    observedDirection: "Unknown",
    evidenceSummary:
      "Long-horizon pathway; not yet observable as a completed outcome in this dataset.",
    sourceIds: ["AMAZON_INSTITUTIONAL"],
    confidence: "Low",
    reviewStatus: "NeedsSource",
    dataGaps: ["No observed time-series in the system yet."],
  },
  {
    id: "OO_PESTICIDE_REDUCTION",
    expectedOutcomeId: "EO_PESTICIDE_REDUCTION",
    title: "Effect depends on the wider system",
    description:
      "Reducing pesticide pressure appears beneficial, but effects depend on pesticide type, exposure, habitat and farm management.",
    observedDirection: "Mixed",
    evidenceSummary:
      "Beneficial direction, but strongly conditioned by landscape and management factors.",
    sourceIds: ["IPBES"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Field vs laboratory effect sizes differ."],
  },
  {
    id: "OO_POLLINATOR_HABITAT",
    expectedOutcomeId: "EO_POLLINATOR_HABITAT",
    title: "Quality and connectivity drive results",
    description:
      "Habitat appears to support pollinators where quality, connectivity and plant diversity are present, not from area alone.",
    observedDirection: "Improved",
    evidenceSummary:
      "Habitat value, not area, appears to drive pollinator outcomes.",
    sourceIds: ["IPBES"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Wild vs managed pollinator dynamics not fully mapped."],
  },
];

export const LEARNING_RECORDS: LearningRecord[] = [
  {
    id: "LR_PROTECTED_AREAS",
    title: "Protection status alone is not enough",
    expectedOutcomeId: "EO_PROTECTED_AREAS",
    observedOutcomeIds: ["OO_PROTECTED_AREAS"],
    decisionSignalIds: ["DS_PROTECTED_AREAS"],
    solutionPathwayIds: ["PW_DEFOR_PROTECTED"],
    ecosystemIds: ["EC_AMAZON_RAINFOREST"],
    whatWasExpected:
      "Protected areas may reduce conversion and support carbon and habitat.",
    whatWasObserved:
      "Outcomes are context-dependent; governance and enforcement appear decisive.",
    whatWeLearned:
      "Protection status alone is not enough — governance, enforcement and local context shape outcomes.",
    assumptionStatus: "PartlySupported",
    confidenceBefore: "Medium",
    confidenceAfter: "Medium",
    confidenceChange: "Unchanged",
    decisionImplication:
      "Treat protected areas as necessary but not sufficient; weight governance alongside designation.",
    sourceIds: ["WWF_AMAZON", "RAISG"],
    reviewStatus: "Reviewed",
    lastReviewed: "2026-06-09",
    dataGaps: ["Quantitative effect sizes vary by region."],
  },
  {
    id: "LR_INDIGENOUS",
    title: "Rights and governance are key conditions",
    expectedOutcomeId: "EO_INDIGENOUS",
    observedOutcomeIds: ["OO_INDIGENOUS"],
    decisionSignalIds: ["DS_INDIGENOUS"],
    solutionPathwayIds: ["PW_LANDUSE_INDIGENOUS"],
    ecosystemIds: ["EC_AMAZON_RAINFOREST"],
    whatWasExpected:
      "Indigenous stewardship may support forest protection and integrity.",
    whatWasObserved:
      "Strong association in many regions, varying with recognition and pressure.",
    whatWeLearned:
      "Legal recognition, rights and territorial protection are important contextual conditions for outcomes.",
    assumptionStatus: "Supported",
    confidenceBefore: "Medium",
    confidenceAfter: "Medium",
    confidenceChange: "Unchanged",
    decisionImplication:
      "Support rights recognition and governance as part of the pathway, not just designation.",
    sourceIds: ["RAISG", "WWF_AMAZON"],
    reviewStatus: "Reviewed",
    lastReviewed: "2026-06-09",
  },
  {
    id: "LR_MONITORING",
    title: "Monitoring needs a response attached",
    expectedOutcomeId: "EO_MONITORING",
    observedOutcomeIds: ["OO_MONITORING"],
    decisionSignalIds: ["DS_MONITORING"],
    solutionPathwayIds: ["PW_FIRE_MONITORING"],
    ecosystemIds: ["EC_AMAZON_RAINFOREST"],
    whatWasExpected: "Monitoring may improve early detection of loss.",
    whatWasObserved:
      "Detection is strong, but does not by itself create enforcement or restoration.",
    whatWeLearned:
      "Monitoring is most useful when connected to response capacity and governance.",
    assumptionStatus: "PartlySupported",
    confidenceBefore: "Medium",
    confidenceAfter: "Medium",
    confidenceChange: "Unchanged",
    decisionImplication:
      "Pair monitoring investments with response capacity to realise value.",
    sourceIds: ["INPE", "MAPBIOMAS"],
    reviewStatus: "Reviewed",
    lastReviewed: "2026-06-09",
    dataGaps: ["Response capacity not modelled."],
  },
  {
    id: "LR_RESTORATION",
    title: "Restoration is long-term, not a substitute for protection",
    expectedOutcomeId: "EO_RESTORATION",
    observedOutcomeIds: ["OO_RESTORATION"],
    decisionSignalIds: ["DS_RESTORATION"],
    solutionPathwayIds: ["PW_DEGRAD_RESTORATION"],
    ecosystemIds: ["EC_AMAZON_RAINFOREST"],
    whatWasExpected: "Restoration may rebuild carbon and habitat over time.",
    whatWasObserved:
      "Recovery is slow and depends on method, history and future protection; not yet observable here.",
    whatWeLearned:
      "Restoration is a long-term resilience pathway, not an immediate substitute for protecting intact ecosystems.",
    assumptionStatus: "NotYetObserved",
    confidenceBefore: "Medium",
    confidenceAfter: "Low",
    confidenceChange: "Decreased",
    decisionImplication:
      "Prioritise protecting intact forest first; treat restoration as a slower, complementary pathway.",
    sourceIds: ["AMAZON_INSTITUTIONAL"],
    reviewStatus: "Draft",
    lastReviewed: "2026-06-09",
    dataGaps: ["No observed time-series in the system yet."],
  },
  {
    id: "LR_PESTICIDE_REDUCTION",
    title: "Pesticide reduction works best with habitat",
    expectedOutcomeId: "EO_PESTICIDE_REDUCTION",
    observedOutcomeIds: ["OO_PESTICIDE_REDUCTION"],
    decisionSignalIds: ["DS_PESTICIDE_REDUCTION"],
    solutionPathwayIds: ["PW_PESTICIDES_REDUCTION"],
    speciesIds: ["SP_HONEY_BEE"],
    whatWasExpected:
      "Reducing pesticide pressure may support pollinator health and pollination.",
    whatWasObserved:
      "Beneficial direction, conditioned by pesticide type, exposure, habitat and management.",
    whatWeLearned:
      "Pesticide reduction is stronger when combined with habitat and landscape-level measures.",
    assumptionStatus: "PartlySupported",
    confidenceBefore: "Medium",
    confidenceAfter: "Medium",
    confidenceChange: "Unchanged",
    decisionImplication:
      "Combine pesticide reduction with habitat measures rather than treating it as a standalone fix.",
    sourceIds: ["IPBES"],
    reviewStatus: "Reviewed",
    lastReviewed: "2026-06-09",
    dataGaps: ["Field vs laboratory effect sizes differ."],
  },
  {
    id: "LR_POLLINATOR_HABITAT",
    title: "Habitat quality matters more than area",
    expectedOutcomeId: "EO_POLLINATOR_HABITAT",
    observedOutcomeIds: ["OO_POLLINATOR_HABITAT"],
    decisionSignalIds: ["DS_POLLINATOR_HABITAT"],
    solutionPathwayIds: ["PW_HABITAT_POLLINATOR"],
    speciesIds: ["SP_HONEY_BEE"],
    whatWasExpected:
      "Pollinator habitat may support pollinator populations and pollination.",
    whatWasObserved:
      "Outcomes appear driven by habitat quality, connectivity and plant diversity.",
    whatWeLearned:
      "Habitat interventions should focus on quality and connectivity, not only area.",
    assumptionStatus: "Supported",
    confidenceBefore: "Medium",
    confidenceAfter: "Medium",
    confidenceChange: "Unchanged",
    decisionImplication:
      "Design habitat for quality and connectivity; measure value, not hectares alone.",
    sourceIds: ["IPBES"],
    reviewStatus: "Reviewed",
    lastReviewed: "2026-06-09",
  },
];

export const CONFIDENCE_UPDATES: ConfidenceUpdate[] = [
  {
    id: "CU_RESTORATION",
    targetType: "ExpectedOutcome",
    targetId: "EO_RESTORATION",
    previousConfidence: "Medium",
    updatedConfidence: "Low",
    reason:
      "Restoration outcomes proved slower and more condition-dependent than initially assumed; no observed time-series yet.",
    sourceIds: ["AMAZON_INSTITUTIONAL"],
    reviewStatus: "Draft",
  },
  {
    id: "CU_MONITORING",
    targetType: "DecisionSignal",
    targetId: "DS_MONITORING",
    previousConfidence: "Medium",
    updatedConfidence: "Medium",
    reason:
      "Confidence held, but the limiting factor shifted from detection to enforcement and response capacity.",
    sourceIds: ["INPE"],
    reviewStatus: "Reviewed",
  },
];
