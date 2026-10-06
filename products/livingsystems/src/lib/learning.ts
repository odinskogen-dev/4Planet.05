// ============================================================================
// LEARNING + OUTCOME INTELLIGENCE HELPERS (v1.2)
// Simple, readable resolvers over the learning data.
// ============================================================================

import type {
  ExpectedOutcome,
  ObservedOutcome,
  LearningRecord,
  ConfidenceUpdate,
  ReviewStatus,
} from "@/types";
import {
  EXPECTED_OUTCOMES,
  OBSERVED_OUTCOMES,
  LEARNING_RECORDS,
  CONFIDENCE_UPDATES,
} from "@/data/learning";

export {
  EXPECTED_OUTCOMES,
  OBSERVED_OUTCOMES,
  LEARNING_RECORDS,
  CONFIDENCE_UPDATES,
};

export const getExpectedOutcomesForDecision = (id: string): ExpectedOutcome[] =>
  EXPECTED_OUTCOMES.filter((e) => e.decisionSignalId === id);
export const getExpectedOutcomesForSolutionPathway = (id: string): ExpectedOutcome[] =>
  EXPECTED_OUTCOMES.filter((e) => e.solutionPathwayId === id);
export const getExpectedOutcome = (id: string): ExpectedOutcome | undefined =>
  EXPECTED_OUTCOMES.find((e) => e.id === id);

export const getObservedOutcomesForExpectedOutcome = (id: string): ObservedOutcome[] =>
  OBSERVED_OUTCOMES.filter((o) => o.expectedOutcomeId === id);

export const getLearningRecordsForDecision = (id: string): LearningRecord[] =>
  LEARNING_RECORDS.filter((l) => (l.decisionSignalIds ?? []).includes(id));
export const getLearningRecordsForSolutionPathway = (id: string): LearningRecord[] =>
  LEARNING_RECORDS.filter((l) => (l.solutionPathwayIds ?? []).includes(id));
export const getLearningRecordsForEcosystem = (id: string): LearningRecord[] =>
  LEARNING_RECORDS.filter((l) => (l.ecosystemIds ?? []).includes(id));
export const getLearningRecordsForSpecies = (id: string): LearningRecord[] =>
  LEARNING_RECORDS.filter((l) => (l.speciesIds ?? []).includes(id));

export const getConfidenceUpdatesForTarget = (targetType: string, targetId: string): ConfidenceUpdate[] =>
  CONFIDENCE_UPDATES.filter((c) => c.targetType === targetType && c.targetId === targetId);

export function getLearningSummaryForDecision(id: string) {
  const expected = getExpectedOutcomesForDecision(id);
  const learning = getLearningRecordsForDecision(id);
  const observed = expected.flatMap((e) => getObservedOutcomesForExpectedOutcome(e.id));
  return { expected, observed, learning };
}

export const getLearningRecordsByAssumptionStatus = (): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const l of LEARNING_RECORDS) out[l.assumptionStatus] = (out[l.assumptionStatus] ?? 0) + 1;
  return out;
};
export const getLearningRecordsByConfidenceChange = (): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const l of LEARNING_RECORDS) out[l.confidenceChange] = (out[l.confidenceChange] ?? 0) + 1;
  return out;
};

export const getLearningDataGaps = (): string[] =>
  Array.from(
    new Set([
      ...EXPECTED_OUTCOMES.flatMap((e) => e.dataGaps ?? []),
      ...OBSERVED_OUTCOMES.flatMap((o) => o.dataGaps ?? []),
      ...LEARNING_RECORDS.flatMap((l) => l.dataGaps ?? []),
    ])
  );

const weak = (r: ReviewStatus) =>
  r === "NeedsSource" || r === "NeedsUpdate" || r === "Draft";

export const learningIntegrity = () => ({
  expectedCount: EXPECTED_OUTCOMES.length,
  observedCount: OBSERVED_OUTCOMES.length,
  learningCount: LEARNING_RECORDS.length,
  confidenceUpdateCount: CONFIDENCE_UPDATES.length,
  byAssumption: getLearningRecordsByAssumptionStatus(),
  byConfidenceChange: getLearningRecordsByConfidenceChange(),
  recordsNeedingSources: LEARNING_RECORDS.filter(
    (l) => (l.sourceIds ?? []).length === 0 || weak(l.reviewStatus)
  ),
  dataGaps: getLearningDataGaps(),
});
