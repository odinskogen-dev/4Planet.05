export type LearningOptimizerMode = "SHADOW_ONLY" | "CANARY" | "PRODUCTION";

export interface OptimizerDataset {
  datasetId: string;
  station: string;
  curatedExamples: number;
  trainExamples: number;
  validationExamples: number;
  heldOutExamples: number;
  distinctProjects: number;
  poisonedExamplesRemoved: number;
  approvedByHuman: boolean;
}

export interface OptimizerCandidate {
  candidateId: string;
  baselineVersion: string;
  candidateVersion: string;
  baselineScore: number;
  validationScore: number;
  heldOutScore: number;
  deterministicRegressionsPassed: boolean;
  independentAuditPassed: boolean;
  weakensSafetyGate: boolean;
  changesAuthority: boolean;
  evidenceRefs: string[];
}

export interface OptimizerPromotionDecision {
  decision: "KEEP_BASELINE" | "SHADOW_MORE" | "CANARY_CANDIDATE";
  reasons: string[];
}

/**
 * DSPy/GEPA or any later optimiser may propose a program; it never owns runtime
 * promotion. Evaluation must use curated data and a held-out set and must never
 * weaken safety/truth/authority controls.
 */
export function evaluateOptimizerCandidate(
  mode: LearningOptimizerMode,
  dataset: OptimizerDataset,
  candidate: OptimizerCandidate,
): OptimizerPromotionDecision {
  const reasons: string[] = [];
  if (mode === "PRODUCTION") reasons.push("OPTIMIZER_DIRECT_PRODUCTION_MUTATION_FORBIDDEN");
  if (!dataset.approvedByHuman) reasons.push("DATASET_NOT_CURATED_APPROVED");
  if (dataset.heldOutExamples < 1) reasons.push("HELD_OUT_SET_REQUIRED");
  if (dataset.validationExamples < 1) reasons.push("VALIDATION_SET_REQUIRED");
  if (dataset.distinctProjects < 2) reasons.push("CROSS_PROJECT_EVIDENCE_REQUIRED");
  if (candidate.validationScore <= candidate.baselineScore) reasons.push("NO_VALIDATION_IMPROVEMENT");
  if (candidate.heldOutScore <= candidate.baselineScore) reasons.push("NO_HELD_OUT_IMPROVEMENT");
  if (!candidate.deterministicRegressionsPassed) reasons.push("DETERMINISTIC_REGRESSION_FAILURE");
  if (!candidate.independentAuditPassed) reasons.push("INDEPENDENT_AUDIT_REQUIRED");
  if (candidate.weakensSafetyGate) reasons.push("SAFETY_GATE_WEAKENING_FORBIDDEN");
  if (candidate.changesAuthority) reasons.push("AUTHORITY_CHANGE_FORBIDDEN");
  if (candidate.evidenceRefs.length < 2) reasons.push("INSUFFICIENT_EVIDENCE");

  if (reasons.length > 0) return { decision: "KEEP_BASELINE", reasons };
  if (dataset.curatedExamples < 30) return { decision: "SHADOW_MORE", reasons: ["INSUFFICIENT_SAMPLE_FOR_CANARY"] };
  return { decision: "CANARY_CANDIDATE", reasons: ["HELD_OUT_IMPROVEMENT_PROVEN", "SAFETY_AND_AUTHORITY_UNCHANGED"] };
}

export function learningDatasetReadyForOptimisation(dataset: OptimizerDataset): { ready: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!dataset.approvedByHuman) reasons.push("CURATION_APPROVAL_REQUIRED");
  if (dataset.trainExamples < 1) reasons.push("TRAIN_SET_REQUIRED");
  if (dataset.validationExamples < 1) reasons.push("VALIDATION_SET_REQUIRED");
  if (dataset.heldOutExamples < 1) reasons.push("HELD_OUT_SET_REQUIRED");
  if (dataset.distinctProjects < 2) reasons.push("AT_LEAST_TWO_PROJECTS_REQUIRED");
  if (dataset.curatedExamples !== dataset.trainExamples + dataset.validationExamples + dataset.heldOutExamples) reasons.push("DATASET_SPLIT_COUNT_MISMATCH");
  return { ready: reasons.length === 0, reasons };
}
