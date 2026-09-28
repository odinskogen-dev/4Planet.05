import test from "node:test";
import assert from "node:assert/strict";
import {
  BRAIN_LEARNING_ID,
  CAPABILITY_ID,
  LEARNER_ID,
  brainDerivedLearningCandidate,
  createSelfImprovementProofPackages,
} from "./learningProofWorkflow";
import type { Outcome } from "./contracts";

test("proof packages use one Learning worker capability and no product write scopes", () => {
  const packages = createSelfImprovementProofPackages("2026-09-28T00:00:00Z");
  for (const pkg of Object.values(packages)) {
    assert.equal(pkg.section, "LEARNING");
    assert.deepEqual(pkg.requiredCapabilities, [CAPABILITY_ID]);
    assert.deepEqual(pkg.writeScopes, []);
    assert.equal(pkg.execution?.kind, "INTERNAL_LEARNING_EVAL");
    assert.equal(pkg.resourceBudget?.maxModelCalls, 1);
  }
  assert.equal(LEARNER_ID, "learning-1");
  assert.equal(packages.baseline.learningEvaluation?.kind, "REAL_WORK");
  assert.equal(packages.heldOut.learningEvaluation?.kind, "HELD_OUT");
  assert.equal(packages.transfer.learningEvaluation?.kind, "TRANSFER");
});

test("BRAIN-derived runtime lesson is explicit, governed in scope and never Canon", () => {
  const baseline: Outcome = {
    workPackageId: "baseline",
    status: "REJECTED",
    evidence: ["learning-eval FAIL"],
    materialDelta: "Preserved a genuine gap.",
    expected: "bounded evidence",
    actual: "overclaim",
    completedAt: "2026-09-28T00:00:00Z",
  };
  const candidate = brainDerivedLearningCandidate(baseline, "2026-09-28T00:01:00Z");
  assert.equal(candidate.id, BRAIN_LEARNING_ID);
  assert.equal(candidate.status, "PROMOTED");
  assert.equal(candidate.knowledgeLifecycle, "KEEP");
  assert.deepEqual(candidate.capabilityIds, [CAPABILITY_ID]);
  assert.match(candidate.scope, /runtime cache/i);
  assert.doesNotMatch(candidate.scope, /Canon promotion/i);
});
