import test from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionRun,
  createRunEntry,
  duplicateDeliveryDecision,
  transitionRun,
  type RunLedgerEntry,
} from "./runLedger";

const createdAt = "2026-09-03T00:00:00.000Z";

function run(overrides: Partial<RunLedgerEntry> = {}): RunLedgerEntry {
  return {
    runId: "run-1",
    workPackageId: "wp-1",
    attemptId: "01",
    idempotencyKey: "wp-1:state-a",
    inputStateHash: "state-a",
    expectedBaseSha: "a".repeat(40),
    state: "QUEUED",
    createdAt,
    lastProgressAt: createdAt,
    ...overrides,
  };
}

test("run cannot jump from QUEUED directly to ACCEPTED", () => {
  assert.equal(canTransitionRun("QUEUED", "ACCEPTED"), false);
  assert.throws(() => transitionRun(run(), "ACCEPTED"), /RUN_TRANSITION_FORBIDDEN/);
});

test("normal production route is explicit and terminal outcome cannot mutate", () => {
  let entry = run();
  entry = transitionRun(entry, "LEASED", { leaseGeneration: 1 }, "2026-09-03T00:01:00.000Z");
  entry = transitionRun(entry, "RUNNING", { workerId: "code-1" }, "2026-09-03T00:02:00.000Z");
  entry = transitionRun(entry, "TESTING", {}, "2026-09-03T00:03:00.000Z");
  entry = transitionRun(entry, "EVALUATING", {}, "2026-09-03T00:04:00.000Z");
  entry = transitionRun(entry, "PROVEN", { resultRef: "evidence:1" }, "2026-09-03T00:05:00.000Z");
  entry = transitionRun(entry, "ACCEPTED", {}, "2026-09-03T00:06:00.000Z");
  assert.equal(entry.startedAt, "2026-09-03T00:02:00.000Z");
  assert.equal(entry.finishedAt, "2026-09-03T00:06:00.000Z");
  assert.throws(() => transitionRun(entry, "RUNNING"), /RUN_TRANSITION_FORBIDDEN/);
});

test("duplicate active delivery is ignored and duplicate terminal delivery reuses terminal result", () => {
  const active = run({ state: "RUNNING" });
  const terminal = run({ state: "ACCEPTED", resultRef: "outcome:1" });
  const incoming = { idempotencyKey: "wp-1:state-a", inputStateHash: "state-a", expectedBaseSha: "a".repeat(40) };
  assert.equal(duplicateDeliveryDecision(active, incoming), "IGNORE_DUPLICATE_ACTIVE");
  assert.equal(duplicateDeliveryDecision(terminal, incoming), "RETURN_TERMINAL");
});

test("same logical idempotency key against changed state must be recompiled as a new run", () => {
  const old = run({ state: "ACCEPTED" });
  const changed = { idempotencyKey: old.idempotencyKey, inputStateHash: "state-b", expectedBaseSha: "b".repeat(40) };
  assert.equal(duplicateDeliveryDecision(old, changed), "RECOMPILE_NEW_RUN");
});

test("new run requires complete identity", () => {
  assert.throws(() => createRunEntry({
    runId: "",
    workPackageId: "wp-1",
    attemptId: "01",
    idempotencyKey: "key",
    inputStateHash: "state",
    createdAt,
  }), /RUN_IDENTITY_INCOMPLETE/);
});
