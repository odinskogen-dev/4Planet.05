// ============================================================================
// IMPACT OPPORTUNITY REGISTRY
// The bridge from intelligence to capital. An ImpactOpportunity is a specific
// intervention that can receive funding and produce measurable outcomes, wired
// into the same graph (ecosystems, species, threats, solutions).
// Architecture exists now; lightly populated.
// ============================================================================

import type { ImpactOpportunity } from "@/types";
import { eid, sid, tid, solid } from "@/types";

export const IMPACT_OPPORTUNITIES: Record<string, ImpactOpportunity> = {
  IO_AMAZON_INDIGENOUS_HECTARE: {
    id: "IO_AMAZON_INDIGENOUS_HECTARE",
    title: "Protect 1 hectare of Indigenous-managed rainforest",
    description:
      "Support Indigenous stewardship of intact Amazon rainforest that overlaps with critical jaguar habitat.",
    ecosystemIds: [eid("EC_AMAZON_RAINFOREST")],
    speciesIds: [sid("SP_JAGUAR")],
    threatIds: [tid("TH_HABITAT_LOSS")],
    solutionIds: [solid("SO_INDIGENOUS_STEWARDSHIP"), solid("SO_HABITAT_PROTECTION")],
    expectedOutcomes: [
      "Hectares of intact habitat kept under protection",
      "Maintained connectivity for wide-ranging species",
    ],
    measurementMethod: "Satellite forest-cover monitoring + partner reporting.",
    costModel: "Per-hectare annual stewardship support.",
    confidence: "Medium",
  },
  IO_RANGER_TEAM: {
    id: "IO_RANGER_TEAM",
    title: "Fund one anti-poaching ranger team",
    description:
      "Resource a ranger team protecting savanna elephants from poaching for ivory.",
    ecosystemIds: [eid("EC_AFRICAN_SAVANNA")],
    speciesIds: [sid("SP_ELEPHANT")],
    threatIds: [tid("TH_POACHING"), tid("TH_IVORY_TRADE")],
    solutionIds: [solid("SO_ANTI_POACHING")],
    expectedOutcomes: [
      "Patrol coverage of a protected area",
      "Reduced poaching incidents (partner-reported)",
    ],
    measurementMethod: "Patrol logs + incident reporting from the managing authority.",
    costModel: "Annual cost per ranger team (salaries, equipment, logistics).",
    confidence: "Medium",
  },
};
