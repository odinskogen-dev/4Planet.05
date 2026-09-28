import test from "node:test";
import assert from "node:assert/strict";
import { judgeLearningEval } from "./learningEvalJudge";

test("hidden Judge accepts scoped evidence discipline with explicit learning receipt", () => {
  const result = judgeLearningEval({
    expectedDecision: "INSUFFICIENT_EVIDENCE",
    actualDecision: "INSUFFICIENT_EVIDENCE",
    rationale: "The supplied view is filtered to pull-request-triggered runs and cannot establish completeness across push event types.",
    evidenceNeeded: ["Query authoritative raw Actions workflow runs for the exact commit SHA and traverse pagination."],
    requiredSignals: ["filtered|pull-request-triggered", "push|event types", "authoritative|raw", "exact sha|commit sha", "pagination|first page"],
    forbiddenSignals: ["absence proven"],
    selectedLearningIds: ["brain-learning-evidence-scope-v1"],
    appliedLearningIds: ["brain-learning-evidence-scope-v1"],
  });
  assert.equal(result.passed, true);
});

test("Judge rejects a plausible answer that fails to receipt selected learning", () => {
  const result = judgeLearningEval({
    expectedDecision: "INSUFFICIENT_EVIDENCE",
    actualDecision: "INSUFFICIENT_EVIDENCE",
    rationale: "The filtered first page cannot prove absence.",
    evidenceNeeded: ["Query authoritative raw workflow runs across push events for the exact SHA."],
    requiredSignals: ["filtered", "first page", "raw", "push", "exact sha"],
    forbiddenSignals: [],
    selectedLearningIds: ["brain-learning-evidence-scope-v1"],
    appliedLearningIds: [],
  });
  assert.equal(result.passed, false);
  assert.equal(result.learningReceiptPass, false);
});

test("Judge rejects universal absence overclaim even when other signals are present", () => {
  const result = judgeLearningEval({
    expectedDecision: "INSUFFICIENT_EVIDENCE",
    actualDecision: "INSUFFICIENT_EVIDENCE",
    rationale: "This is filtered and first-page only, but no workflow ran.",
    evidenceNeeded: ["Query raw workflow runs across push events for exact SHA."],
    requiredSignals: ["filtered", "first page", "raw", "push", "exact sha"],
    forbiddenSignals: ["no workflow ran"],
    selectedLearningIds: [],
    appliedLearningIds: [],
  });
  assert.equal(result.passed, false);
  assert.deepEqual(result.forbiddenHits, ["no workflow ran"]);
});
