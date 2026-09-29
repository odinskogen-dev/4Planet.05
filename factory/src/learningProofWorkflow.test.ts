import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "learningProofWorkflow.ts"), "utf8");

test("proof contract keeps one actual LEARNING worker capability and no product write scopes", () => {
  assert.match(source, /export const LEARNER_ID = "learning-1"/);
  assert.match(source, /export const CAPABILITY_ID = "C06_EVIDENCE_SCOPE_DISCIPLINE"/);
  assert.match(source, /section: "LEARNING"/);
  assert.match(source, /writeScopes: \[\]/);
  assert.match(source, /kind: "INTERNAL_LEARNING_EVAL"/);
  assert.match(source, /maxModelCalls: 1/);
  assert.match(source, /"REAL_WORK"[\s\S]*baseline-github-filtered-workflow-view/);
  assert.match(source, /"HELD_OUT"[\s\S]*heldout-bounded-knowledge-search/);
  assert.match(source, /"TRANSFER"[\s\S]*transfer-bounded-communication-search/);
  assert.match(source, /learn-proof-practice-retry-actions-b4/);
  assert.match(source, /practice-retry-explicit-three-check-procedure/);
});

test("BRAIN-derived runtime lesson is evidence-scoped and never claims model-weight learning", () => {
  assert.match(source, /export const BRAIN_LEARNING_ID = "brain-learning-evidence-scope-v1"/);
  assert.match(source, /status: "PROMOTED"/);
  assert.match(source, /knowledgeLifecycle: "KEEP"/);
  assert.match(source, /BRAIN:4PLANET LEARNING ENGINE DEEP STUDY 01/);
  assert.match(source, /WORKFLOW_RUN_OBSERVABILITY_FALSE_NEGATIVE/);
  assert.match(source, /Never infer absence or completeness from a bounded, filtered, scoped or first-page evidence view/);
  assert.match(source, /runtime cache/);
  assert.match(source, /Model weights are unchanged/);
});

test("proof stops rather than inventing improvement when baseline has no genuine gap or is blocked", () => {
  assert.match(source, /NO_GENUINE_GAP_OBSERVED/);
  assert.match(source, /self-improvement is not claimed/);
  assert.match(source, /BASELINE_BLOCKED/);
  assert.match(source, /No curriculum is inferred from a capacity\/runtime blocker/);
});

test("proof requires later wake, runtime retrieval and materially different transfer before ACTIVE", () => {
  assert.match(source, /step\.sleep\("later-independent-learning-wake", "1 minute"\)/);
  assert.match(source, /getLearningRetrievalReceipts/);
  assert.match(source, /runtimeSelectionProven/);
  assert.match(source, /learnerState\?\.stage === "TRANSFER_PROVEN"/);
  assert.match(source, /RUNTIME_TRANSFER_PROVEN_BRAIN_WRITEBACK_REQUIRED/);
  assert.match(source, /accepted\(practiceRetry \?\? practice\)/);
  assert.match(source, /correctionAttempts:[\s\S]*practiceRetry3/);
});
