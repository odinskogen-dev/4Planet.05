import test from "node:test";
import assert from "node:assert/strict";
import {
  createStartedReceipt,
  decideSideEffectReplay,
  sideEffectIdempotencyKey,
  type SideEffectIntent,
  type SideEffectReceipt,
} from "./idempotency";

const intent: SideEffectIntent = {
  workPackageId: "factory-real-species-04",
  runId: "run-04-1",
  inputStateHash: "test-king:abc123|brain:brain123",
  kind: "GITHUB_CONTENT_WRITE",
  target: "odinskogen-dev/4Planet.05:factory-candidate-species:src/species.ts",
  operationVersion: "github-content-v1",
};

const nowIso = "2026-09-03T00:00:00.000Z";
const now = Date.parse(nowIso);
const policy = { nowMs: now, staleAfterMs: 5 * 60 * 1000, maxAttempts: 3 };

test("identical side-effect intent receives the same SHA-256 idempotency key", async () => {
  const first = await sideEffectIdempotencyKey(intent);
  const second = await sideEffectIdempotencyKey({ ...intent });
  assert.equal(first, second);
  assert.match(first, /^factory-idem-v1-[0-9a-f]{64}$/);
});

test("changed run, input state or target cannot replay old side-effect evidence", async () => {
  const base = await sideEffectIdempotencyKey(intent);
  assert.notEqual(await sideEffectIdempotencyKey({ ...intent, runId: "run-04-2" }), base);
  assert.notEqual(await sideEffectIdempotencyKey({ ...intent, inputStateHash: "test-king:def456|brain:brain123" }), base);
  assert.notEqual(await sideEffectIdempotencyKey({ ...intent, target: `${intent.target}.other` }), base);
});

test("duplicate delivery after committed effect becomes a recorded no-op", async () => {
  const key = await sideEffectIdempotencyKey(intent);
  const receipt: SideEffectReceipt = {
    ...createStartedReceipt(intent, key, nowIso),
    state: "COMMITTED",
    providerReceipt: "github-commit:deadbeef",
  };
  assert.deepEqual(decideSideEffectReplay(intent, receipt, policy), {
    action: "RETURN_RECORDED",
    reason: "ALREADY_COMMITTED",
    providerReceipt: "github-commit:deadbeef",
  });
});

test("fresh in-flight duplicate waits while stale in-flight delivery is recovered", async () => {
  const key = await sideEffectIdempotencyKey(intent);
  const fresh = createStartedReceipt(intent, key, "2026-09-02T23:59:00.000Z");
  assert.deepEqual(decideSideEffectReplay(intent, fresh, policy), { action: "WAIT", reason: "IN_FLIGHT" });
  const stale = { ...fresh, lastProgressAt: "2026-09-02T23:00:00.000Z" };
  assert.deepEqual(decideSideEffectReplay(intent, stale, policy), { action: "RECOVER", reason: "STALE_IN_FLIGHT" });
});

test("retryable failure respects hard attempt ceiling", async () => {
  const key = await sideEffectIdempotencyKey(intent);
  const base = createStartedReceipt(intent, key, nowIso);
  assert.deepEqual(decideSideEffectReplay(intent, { ...base, state: "FAILED_RETRYABLE", attempt: 2 }, policy), {
    action: "RETRY",
    reason: "RETRYABLE_FAILURE",
  });
  assert.deepEqual(decideSideEffectReplay(intent, { ...base, state: "FAILED_RETRYABLE", attempt: 3 }, policy), {
    action: "PARK",
    reason: "RETRY_BUDGET_EXHAUSTED",
  });
});

test("receipt bound to different state fails closed instead of being trusted", async () => {
  const key = await sideEffectIdempotencyKey(intent);
  const receipt = createStartedReceipt(intent, key, nowIso);
  const moved = { ...intent, inputStateHash: "test-king:moved" };
  assert.deepEqual(decideSideEffectReplay(moved, receipt, policy), { action: "PARK", reason: "RECEIPT_MISMATCH" });
});
