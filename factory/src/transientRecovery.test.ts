import assert from "node:assert/strict";
import test from "node:test";
import type { Outcome, WorkPackage } from "./contracts";
import { decideStaleShadowQueueRecovery, retryableTransientCapacityPackage } from "./transientRecovery";

const pkg = {
  id: "orch-test",
  projectId: "orch-project",
  priority: "INCUBATING",
  goalLink: "Factory recovery regression",
  gapClosed: "Transient Browser capacity recovery",
  title: "Transient Browser recovery",
  section: "CODE_QA",
  deliverables: [],
  dependencies: [],
  writeScopes: [],
  definitionOfDone: [],
  requiredEvidence: [],
  zeroLoss: { required: false, donorUniverseRefs: [], dispositions: [], orphanCount: 0, winnerParityEvidence: [], checkedAt: "2026-09-02T00:00:00.000Z" },
  createdAt: "2026-09-02T00:00:00.000Z",
  estimatedValue: 1,
  criticalPath: 1,
  dependencyUnlock: 1,
  proofValue: 1,
  cashValue: 0,
  learningValue: 1,
  risk: 1,
  founderBurden: 0,
  concurrencyCost: 1,
  status: "RUNNING",
  execution: { kind: "BROWSER_QA", targetUrl: "https://example.com", allowedHosts: ["example.com"], viewport: { width: 390, height: 844, deviceScaleFactor: 1 } },
  learningQuestion: "Does transient Browser capacity recover without becoming product evidence?",
} satisfies WorkPackage;

const outcome = (evidence: string[], status: Outcome["status"] = "BLOCKED"): Outcome => ({
  workPackageId: pkg.id,
  status,
  evidence,
  actual: "temporary capacity result",
  limitation: "transient",
  materialDelta: "none",
  completedAt: "2026-09-02T00:01:00.000Z",
  expected: "bounded browser evidence",
});

test("HTTP 429 returns a stranded RUNNING package to READY for queue retry", () => {
  const recovered = retryableTransientCapacityPackage(pkg, outcome(["HTTP 429"]));
  assert.ok(recovered);
  assert.equal(recovered.status, "READY");
  assert.equal(pkg.status, "RUNNING");
});

test("non-429 blocked outcomes are not rewritten as retryable capacity", () => {
  assert.equal(retryableTransientCapacityPackage(pkg, outcome(["HTTP 503"])), undefined);
});

test("429 evidence cannot override a non-BLOCKED specialist outcome", () => {
  assert.equal(retryableTransientCapacityPackage(pkg, outcome(["HTTP 429"], "CORRECT")), undefined);
});

test("stale SHADOW queue RUNNING state with no outcome becomes retryable", () => {
  const now = Date.parse("2026-09-02T01:00:00.000Z");
  assert.equal(
    decideStaleShadowQueueRecovery({ status: "RUNNING", updatedAt: "2026-09-02T00:00:00.000Z", hasRecordedOutcome: false }, now),
    "RECOVER_TO_READY",
  );
});

test("recent SHADOW queue RUNNING state stays fail-closed", () => {
  const now = Date.parse("2026-09-02T01:00:00.000Z");
  assert.equal(
    decideStaleShadowQueueRecovery({ status: "RUNNING", updatedAt: "2026-09-02T00:45:00.000Z", hasRecordedOutcome: false }, now),
    "LEAVE",
  );
});

test("recorded outcome prevents stale queue re-execution", () => {
  const now = Date.parse("2026-09-02T01:00:00.000Z");
  assert.equal(
    decideStaleShadowQueueRecovery({ status: "RUNNING", updatedAt: "2026-09-02T00:00:00.000Z", hasRecordedOutcome: true }, now),
    "LEAVE",
  );
});

test("only RUNNING queue state is recoverable", () => {
  const now = Date.parse("2026-09-02T01:00:00.000Z");
  assert.equal(
    decideStaleShadowQueueRecovery({ status: "READY", updatedAt: "2026-09-02T00:00:00.000Z", hasRecordedOutcome: false }, now),
    "LEAVE",
  );
});

test("invalid or implausibly future timestamps fail closed", () => {
  const now = Date.parse("2026-09-02T01:00:00.000Z");
  assert.equal(
    decideStaleShadowQueueRecovery({ status: "RUNNING", updatedAt: "not-a-date", hasRecordedOutcome: false }, now),
    "LEAVE",
  );
  assert.equal(
    decideStaleShadowQueueRecovery({ status: "RUNNING", updatedAt: "2026-09-02T01:06:00.000Z", hasRecordedOutcome: false }, now),
    "LEAVE",
  );
});
