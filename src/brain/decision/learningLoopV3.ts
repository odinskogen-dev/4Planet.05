export type LearningEvidenceDirection = "SUPPORTS" | "QUALIFIES" | "CHALLENGES";
export type LearningUpdateState = "NO_UPDATE" | "CONFIDENCE_SUPPORTED" | "CONFIDENCE_QUALIFIED" | "ASSESSMENT_CHALLENGED";

export interface LearningMeasurementPlan {
  measurementId: string;
  metric: string;
  baselineRequired: boolean;
  timeframe: string;
}

export interface LearningObservedOutcome {
  outcomeId: string;
  measurementId: string;
  sourceRecordId: string;
  resultSummary: string;
  directionAgainstExpectation: LearningEvidenceDirection;
}

export interface DecisionLearningLoopInput {
  decisionPackId: string;
  selectedActionRef: string;
  expectedOutcomeRef: string;
  measurementPlan: LearningMeasurementPlan[];
  implementationRef?: string;
  observedOutcomes: LearningObservedOutcome[];
}

export interface DecisionLearningLoopResult {
  updateState: LearningUpdateState;
  confidenceMayIncrease: boolean;
  observedOutcomeCount: number;
  rationale: string;
  futureDecisionPackRule: string;
}

/**
 * Minimal learning contract. Absence of an observed outcome never increases confidence.
 * A contradictory observed outcome can qualify or challenge the prior assessment.
 */
export function evaluateDecisionLearningLoop(input: DecisionLearningLoopInput): DecisionLearningLoopResult {
  if (input.observedOutcomes.length === 0) {
    return {
      updateState: "NO_UPDATE",
      confidenceMayIncrease: false,
      observedOutcomeCount: 0,
      rationale: "No observed outcome exists. Implementation/measurement intent is not evidence of result.",
      futureDecisionPackRule: "Retain prior confidence and expose NO_OBSERVED_OUTCOME until legitimate measurement evidence exists.",
    };
  }
  if (input.observedOutcomes.some((x) => !x.sourceRecordId.trim())) throw new Error("observed outcome requires immutable Source Record provenance");
  if (input.observedOutcomes.some((x) => x.directionAgainstExpectation === "CHALLENGES")) {
    return {
      updateState: "ASSESSMENT_CHALLENGED",
      confidenceMayIncrease: false,
      observedOutcomeCount: input.observedOutcomes.length,
      rationale: "At least one sourced observed outcome challenges the expected result; prior confidence must not increase automatically.",
      futureDecisionPackRule: "Expose CHALLENGES evidence and trigger reassessment before future recommendation strength can increase.",
    };
  }
  if (input.observedOutcomes.some((x) => x.directionAgainstExpectation === "QUALIFIES")) {
    return {
      updateState: "CONFIDENCE_QUALIFIED",
      confidenceMayIncrease: false,
      observedOutcomeCount: input.observedOutcomes.length,
      rationale: "Observed evidence qualifies the expectation; context/limitations must remain visible.",
      futureDecisionPackRule: "Update the assessment with qualifiers; do not generalise beyond measured Place/context.",
    };
  }
  return {
    updateState: "CONFIDENCE_SUPPORTED",
    confidenceMayIncrease: true,
    observedOutcomeCount: input.observedOutcomes.length,
    rationale: "Sourced observed outcomes support the expectation in the represented implementation context.",
    futureDecisionPackRule: "Confidence may increase only within the measured context and evidence-strength methodology; no universal transfer is implied.",
  };
}

export const learningLoopV3TruthBoundary = {
  selectedActionIsOutcome: false,
  implementationIsObservedOutcome: false,
  expectedIsObserved: false,
  noObservedOutcomeMayIncreaseConfidence: false,
  syntheticRecordIsFieldImpact: false,
  localOutcomeIsUniversalEffectiveness: false,
} as const;
