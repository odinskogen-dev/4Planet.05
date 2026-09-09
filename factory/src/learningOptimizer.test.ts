import test from "node:test";
import assert from "node:assert/strict";
import { evaluateOptimizerCandidate, learningDatasetReadyForOptimisation, type OptimizerCandidate, type OptimizerDataset } from "./learningOptimizer";

const dataset: OptimizerDataset = {
  datasetId: "factory-learning-01",
  station: "WORK_PACKAGE_COMPILER",
  curatedExamples: 40,
  trainExamples: 20,
  validationExamples: 10,
  heldOutExamples: 10,
  distinctProjects: 3,
  poisonedExamplesRemoved: 2,
  approvedByHuman: true,
};

const candidate: OptimizerCandidate = {
  candidateId: "dspy-shadow-01",
  baselineVersion: "wp-v1",
  candidateVersion: "wp-v2",
  baselineScore: 0.72,
  validationScore: 0.81,
  heldOutScore: 0.79,
  deterministicRegressionsPassed: true,
  independentAuditPassed: true,
  weakensSafetyGate: false,
  changesAuthority: false,
  evidenceRefs: ["eval:validation", "eval:heldout"],
};

test("curated cross-project dataset can enter optimisation", () => {
  assert.deepEqual(learningDatasetReadyForOptimisation(dataset), { ready: true, reasons: [] });
});

test("optimiser candidate can only become a canary candidate, never self-promote production", () => {
  assert.deepEqual(evaluateOptimizerCandidate("SHADOW_ONLY", dataset, candidate), {
    decision: "CANARY_CANDIDATE",
    reasons: ["HELD_OUT_IMPROVEMENT_PROVEN", "SAFETY_AND_AUTHORITY_UNCHANGED"],
  });
  assert.equal(evaluateOptimizerCandidate("PRODUCTION", dataset, candidate).decision, "KEEP_BASELINE");
});

test("held-out regression or safety weakening keeps baseline", () => {
  const worse = evaluateOptimizerCandidate("SHADOW_ONLY", dataset, { ...candidate, heldOutScore: 0.70 });
  assert.equal(worse.decision, "KEEP_BASELINE");
  assert.ok(worse.reasons.includes("NO_HELD_OUT_IMPROVEMENT"));

  const unsafe = evaluateOptimizerCandidate("SHADOW_ONLY", dataset, { ...candidate, weakensSafetyGate: true });
  assert.equal(unsafe.decision, "KEEP_BASELINE");
  assert.ok(unsafe.reasons.includes("SAFETY_GATE_WEAKENING_FORBIDDEN"));
});

test("single-project learning cannot become a reusable optimiser candidate", () => {
  const result = evaluateOptimizerCandidate("SHADOW_ONLY", { ...dataset, distinctProjects: 1 }, candidate);
  assert.equal(result.decision, "KEEP_BASELINE");
  assert.ok(result.reasons.includes("CROSS_PROJECT_EVIDENCE_REQUIRED"));
});
