import test from "node:test";
import assert from "node:assert/strict";
import {
  compileFailureCurriculum,
  deriveLearnerCapabilityState,
  selectRuntimeLearningContext,
  type LearnerEvidenceRecord,
} from "./learningEngine";
import type { LearningCandidate, WorkPackage } from "./contracts";

const pkg: WorkPackage = {
  id: "learn-engine-proof",
  projectId: "SYS-P00-BRAIN",
  title: "Use current learning on a bounded Factory task",
  section: "CODE_QA",
  priority: "P0",
  goalLink: "SELF-IMPROVING COMPANY",
  gapClosed: "Runtime must retrieve only current governed learning.",
  deliverables: ["bounded proof"],
  dependencies: [],
  writeScopes: ["factory/src/"],
  definitionOfDone: ["current learning selected", "stale learning suppressed"],
  requiredEvidence: ["deterministic test"],
  requiredCapabilities: ["C06_AI_NATIVE_EXECUTION_RELIABILITY"],
  learningQuestion: "Does capability-aware retrieval improve the next run without stale context?",
  createdAt: "2026-09-28T00:00:00Z",
  estimatedValue: 10,
  criticalPath: 10,
  dependencyUnlock: 10,
  proofValue: 10,
  cashValue: 0,
  learningValue: 10,
  risk: 2,
  founderBurden: 0,
  concurrencyCost: 1,
  status: "READY",
};

function candidate(id: string, overrides: Partial<LearningCandidate> = {}): LearningCandidate {
  return {
    id,
    workPackageId: "prior-work",
    observation: "Observed bounded runtime failure.",
    expectedVsActual: "EXPECTED: valid JSON\nACTUAL: empty response",
    evidence: ["trace:prior-work"],
    causeHypothesis: "Response parser did not recover a valid final answer.",
    lesson: "Use strict parse fallback and preserve fail-closed evidence.",
    scope: "FACTORY/CODE_QA",
    confidence: "MEDIUM",
    ruleProposal: "Recover only parseable bounded final output; otherwise fail closed with preserved evidence.",
    regressionEval: "Empty/reasoning-only response must fail closed and remain inspectable.",
    nextTest: "Fresh JSON response variant.",
    status: "PROMOTED",
    capabilityIds: ["C06_AI_NATIVE_EXECUTION_RELIABILITY"],
    knowledgeLifecycle: "KEEP",
    createdAt: "2026-09-27T00:00:00Z",
    ...overrides,
  };
}

test("learner state requires fresh held-out and transfer evidence to progress", () => {
  const evidence: LearnerEvidenceRecord[] = [
    {
      id: "practice",
      learnerId: "code-qa-1",
      capabilityId: "C06_AI_NATIVE_EXECUTION_RELIABILITY",
      kind: "PRACTICE",
      contextKey: "practice-json-a",
      outcome: "PASS",
      evidenceRefs: ["eval:practice"],
      occurredAt: "2026-09-27T10:00:00Z",
    },
  ];
  assert.equal(
    deriveLearnerCapabilityState("code-qa-1", "C06_AI_NATIVE_EXECUTION_RELIABILITY", evidence, "2026-09-28T00:00:00Z").stage,
    "MASTERY_STANDARD_PASS",
  );

  evidence.push({
    id: "heldout",
    learnerId: "code-qa-1",
    capabilityId: "C06_AI_NATIVE_EXECUTION_RELIABILITY",
    kind: "HELD_OUT",
    contextKey: "fresh-json-b",
    outcome: "PASS",
    evidenceRefs: ["eval:heldout"],
    occurredAt: "2026-09-27T12:00:00Z",
  });
  assert.equal(
    deriveLearnerCapabilityState("code-qa-1", "C06_AI_NATIVE_EXECUTION_RELIABILITY", evidence, "2026-09-28T00:00:00Z").stage,
    "FRESH_HELD_OUT_PASS",
  );

  evidence.push({
    id: "real",
    learnerId: "code-qa-1",
    capabilityId: "C06_AI_NATIVE_EXECUTION_RELIABILITY",
    kind: "REAL_WORK",
    contextKey: "real-work-c",
    outcome: "PASS",
    evidenceRefs: ["outcome:real"],
    occurredAt: "2026-09-27T14:00:00Z",
  });
  assert.equal(
    deriveLearnerCapabilityState("code-qa-1", "C06_AI_NATIVE_EXECUTION_RELIABILITY", evidence, "2026-09-28T00:00:00Z").stage,
    "REAL_WORK_PASS",
  );

  evidence.push({
    id: "transfer",
    learnerId: "code-qa-1",
    capabilityId: "C06_AI_NATIVE_EXECUTION_RELIABILITY",
    kind: "TRANSFER",
    contextKey: "materially-different-d",
    outcome: "PASS",
    evidenceRefs: ["outcome:transfer"],
    occurredAt: "2026-09-27T16:00:00Z",
  });
  assert.equal(
    deriveLearnerCapabilityState("code-qa-1", "C06_AI_NATIVE_EXECUTION_RELIABILITY", evidence, "2026-09-28T00:00:00Z").stage,
    "TRANSFER_PROVEN",
  );
});

test("a later failure reopens the capability instead of preserving a paper mastery badge", () => {
  const evidence: LearnerEvidenceRecord[] = [
    {
      id: "heldout-pass",
      learnerId: "code-qa-1",
      capabilityId: "C06_AI_NATIVE_EXECUTION_RELIABILITY",
      kind: "HELD_OUT",
      contextKey: "fresh-a",
      outcome: "PASS",
      evidenceRefs: ["eval:pass"],
      occurredAt: "2026-09-27T10:00:00Z",
    },
    {
      id: "later-fail",
      learnerId: "code-qa-1",
      capabilityId: "C06_AI_NATIVE_EXECUTION_RELIABILITY",
      kind: "REAL_WORK",
      contextKey: "real-b",
      outcome: "FAIL",
      failureClass: "STALE_CONTEXT",
      evidenceRefs: ["eval:fail"],
      occurredAt: "2026-09-27T11:00:00Z",
    },
  ];
  const state = deriveLearnerCapabilityState("code-qa-1", "C06_AI_NATIVE_EXECUTION_RELIABILITY", evidence, "2026-09-28T00:00:00Z");
  assert.equal(state.stage, "PRACTISING");
  assert.deepEqual(state.knownFailureClasses, ["STALE_CONTEXT"]);
  assert.match(state.nextLearningNeed, /STALE_CONTEXT/);
});

test("runtime retrieval selects only newest promoted KEEP or MODIFY learning", () => {
  const context = selectRuntimeLearningContext(pkg, "code-qa-1", [], [
    candidate("old-keep", { createdAt: "2026-09-25T00:00:00Z" }),
    candidate("new-keep", { createdAt: "2026-09-27T00:00:00Z" }),
    candidate("candidate-only", { status: "CANDIDATE", createdAt: "2026-09-28T00:00:00Z" }),
    candidate("rejected-lifecycle", { knowledgeLifecycle: "REJECT", createdAt: "2026-09-29T00:00:00Z" }),
  ], "2026-09-28T01:00:00Z");

  assert.deepEqual(context.selectedLearning.map((item) => item.learningId), ["new-keep"]);
});

test("review-due, superseded, expired and rejected learning are suppressed", () => {
  for (const lifecycle of ["SUPERSEDE", "EXPIRE", "REJECT"] as const) {
    const context = selectRuntimeLearningContext(pkg, "code-qa-1", [], [candidate(`bad-${lifecycle}`, { knowledgeLifecycle: lifecycle })], "2026-09-28T01:00:00Z");
    assert.equal(context.selectedLearning.length, 0);
  }
  const reviewDue = selectRuntimeLearningContext(pkg, "code-qa-1", [], [
    candidate("review-due", { reviewAt: "2026-09-28T00:30:00Z" }),
  ], "2026-09-28T01:00:00Z");
  assert.equal(reviewDue.selectedLearning.length, 0);
});

test("stale capability is explicit instead of silently assumed mastered", () => {
  const evidence: LearnerEvidenceRecord[] = [{
    id: "old-transfer",
    learnerId: "code-qa-1",
    capabilityId: "C06_AI_NATIVE_EXECUTION_RELIABILITY",
    kind: "TRANSFER",
    contextKey: "old-context",
    outcome: "PASS",
    evidenceRefs: ["old-eval"],
    occurredAt: "2026-01-01T00:00:00Z",
  }];
  const state = deriveLearnerCapabilityState("code-qa-1", "C06_AI_NATIVE_EXECUTION_RELIABILITY", evidence, "2026-09-28T00:00:00Z");
  assert.equal(state.stage, "STALE");
});

test("failure compiler creates retrieval, practice, fresh held-out, transfer and regression steps", () => {
  const failure = candidate("failure", {
    status: "CANDIDATE",
    lesson: "FAILURE CHAIN OPEN. Learning question: prevent recurrence.",
  });
  const state = deriveLearnerCapabilityState("code-qa-1", "C06_AI_NATIVE_EXECUTION_RELIABILITY", [{
    id: "fail",
    learnerId: "code-qa-1",
    capabilityId: "C06_AI_NATIVE_EXECUTION_RELIABILITY",
    kind: "REAL_WORK",
    contextKey: "real-failure",
    outcome: "FAIL",
    failureClass: "EMPTY_AI_RESPONSE",
    evidenceRefs: ["trace:empty"],
    occurredAt: "2026-09-28T00:00:00Z",
  }], "2026-09-28T01:00:00Z");

  const plan = compileFailureCurriculum(pkg, failure, state);
  assert.ok(plan);
  assert.match(plan!.retrievalPrompt, /Without rereading/);
  assert.match(plan!.heldOutRequirement, /fresh case/i);
  assert.match(plan!.transferRequirement, /materially different/i);
  assert.match(plan!.regressionRequirement, /fail closed/i);
});
