// ============================================================================
// SOLUTION + DECISION INTELLIGENCE HELPERS (v1.1)
// Simple, readable resolvers over SOLUTION_PATHWAYS + DECISION_SIGNALS.
// ============================================================================

import type { SolutionPathway, DecisionSignal, ReviewStatus } from "@/types";
import { SOLUTION_PATHWAYS, DECISION_SIGNALS } from "@/data/solutionIntel";

export const pathwaysForThreat = (id: string) =>
  SOLUTION_PATHWAYS.filter((p) => p.threatId === id);
export const pathwaysForSolution = (id: string) =>
  SOLUTION_PATHWAYS.filter((p) => p.solutionId === id);
export const pathwaysForEcosystem = (id: string) =>
  SOLUTION_PATHWAYS.filter((p) => (p.ecosystemIds ?? []).includes(id));

/** All pathways that touch a node in any role (threat/solution/service/human/eco). */
export const pathwaysForNode = (id: string): SolutionPathway[] =>
  SOLUTION_PATHWAYS.filter(
    (p) =>
      p.threatId === id ||
      p.solutionId === id ||
      p.strengthenedServiceIds.includes(id) ||
      p.supportedHumanSystemIds.includes(id) ||
      (p.ecosystemIds ?? []).includes(id)
  );

export const decisionSignalsForSolution = (id: string) =>
  DECISION_SIGNALS.filter((d) => d.solutionId === id);
export const decisionSignalsForEcosystem = (id: string) =>
  DECISION_SIGNALS.filter((d) => (d.ecosystemIds ?? []).includes(id));

/** Decision signals touching a node in any role. */
export const decisionSignalsForNode = (id: string): DecisionSignal[] =>
  DECISION_SIGNALS.filter(
    (d) =>
      d.solutionId === id ||
      d.threatIds.includes(id) ||
      (d.ecosystemIds ?? []).includes(id) ||
      (d.serviceIds ?? []).includes(id) ||
      (d.humanSystemIds ?? []).includes(id)
  );

// --- /trust integration -----------------------------------------------------
const weak = (r: ReviewStatus) =>
  r === "NeedsSource" || r === "NeedsUpdate" || r === "Draft";

export const solutionIntelligenceIntegrity = () => {
  const signalsNeedingSources = DECISION_SIGNALS.filter(
    (d) => (d.sourceIds ?? []).length === 0 || weak(d.reviewStatus) || d.confidence === "Low"
  );
  const pathwaysNeedingEvidence = SOLUTION_PATHWAYS.filter(
    (p) => (p.claimIds ?? []).length === 0 || weak(p.reviewStatus) || p.confidence === "Low"
  );
  return {
    pathwaysCount: SOLUTION_PATHWAYS.length,
    signalsCount: DECISION_SIGNALS.length,
    signalsNeedingSources,
    pathwaysNeedingEvidence,
  };
};

export { SOLUTION_PATHWAYS, DECISION_SIGNALS };
