import test from "node:test";
import assert from "node:assert/strict";
import type { WorkPackage } from "./contracts";
import {
  AMENDMENT_M_KERNEL_REVISION,
  buildTaskContractV1,
  canonicalJson,
  requireAutonomyLevel,
  sha256Text,
  TASK_CONTRACT_V1_KEYS,
  verifyIndependentReadback,
  verifyRuntimeSnapshot,
  verifyWriteSet,
  verifyBoundTaskContract,
  assertUniqueDispatchKeys,
  assertResourceUseWithinBudget,
} from "./amendmentMRuntime";

const A = "a".repeat(40);
const B = "b".repeat(40);
const C = "c".repeat(40);

function pkg(overrides: Partial<WorkPackage> = {}): WorkPackage {
  return {
    id: "night-core-main-mobile",
    projectId: "FACTORY_ACTIVE_01",
    title: "Night CORE main mobile evidence",
    section: "CODE_QA",
    priority: "P0",
    goalLink: "FACTORY_ACTIVE_01",
    gapClosed: "Prove bounded current production evidence without mutation.",
    deliverables: ["browser evidence"],
    dependencies: [],
    writeScopes: [],
    definitionOfDone: ["render succeeds", "no mutation"],
    requiredEvidence: ["snapshot hash"],
    execution: { kind: "BROWSER_QA", targetUrl: "https://4planet.org/", allowedHosts: ["4planet.org"], viewport: { width: 390, height: 844 } },
    resourceBudget: { maxAttempts: 1, maxBrowserCalls: 1, maxModelCalls: 0, maxGithubCalls: 0, maxQueueRetries: 3, maxWallClockMinutes: 5 },
    run: { runId: "night", attemptId: "01", idempotencyKey: "night:1", inputStateHash: "legacy", expectedBaseSha: A, workerId: "factory-night", createdAt: "2026-09-09T00:00:00.000Z" },
    learningQuestion: "Can bounded production evidence complete safely?",
    createdAt: "2026-09-09T00:00:00.000Z",
    estimatedValue: 10,
    criticalPath: 10,
    dependencyUnlock: 10,
    proofValue: 10,
    cashValue: 0,
    learningValue: 10,
    risk: 1,
    founderBurden: 0,
    concurrencyCost: 0,
    status: "READY",
    ...overrides,
  };
}

async function bound(overrides: Record<string, unknown> = {}) {
  return buildTaskContractV1(pkg(), {
    founderAuthorityRevision: "FOUNDER_M_L_CURRENT",
    programmeStateRevision: "CSR-2026-09-08-05",
    factoryBuildSha: B,
    receiverRef: "king/test",
    receiverSha: A,
    liveControlRef: "release/one-interface-sprint2-6bbfebb",
    liveControlSha: C,
    makerId: "FACTORY_WORKER:CODE_QA",
    evaluatorId: "AXE_PROGRAMME_QA_INDEPENDENT",
    physicalEnvironmentContainmentVerified: false,
    ...overrides,
  } as any);
}

const fresh = {
  founder_authority_revision: "FOUNDER_M_L_CURRENT",
  programme_state_revision: "CSR-2026-09-08-05",
  receiver_ref: "king/test",
  receiver_sha: A,
  live_control_ref: "release/one-interface-sprint2-6bbfebb",
  live_control_sha: C,
};

test("Task Contract V1 has exactly the eight Amendment-M top-level fields", async () => {
  const result = await bound();
  assert.deepEqual(Object.keys(result.contract).sort(), [...TASK_CONTRACT_V1_KEYS].sort());
  assert.equal(result.contract.context.kernel_manifest_revision, AMENDMENT_M_KERNEL_REVISION);
});

test("context hash is deterministic and binds desired state + acceptance", async () => {
  const first = await bound();
  const second = await bound();
  assert.equal(first.fingerprint.context_hash, second.fingerprint.context_hash);
  const changedPkg = pkg({ definitionOfDone: ["changed acceptance"] });
  const changed = await buildTaskContractV1(changedPkg, {
    founderAuthorityRevision: "FOUNDER_M_L_CURRENT", programmeStateRevision: "CSR-2026-09-08-05", factoryBuildSha: B,
    receiverRef: "king/test", receiverSha: A, liveControlRef: fresh.live_control_ref, liveControlSha: C,
    makerId: "FACTORY_WORKER:CODE_QA", evaluatorId: "AXE_PROGRAMME_QA_INDEPENDENT", physicalEnvironmentContainmentVerified: false,
  });
  assert.notEqual(first.fingerprint.context_hash, changed.fingerprint.context_hash);
});

test("canonical JSON is key-order invariant", async () => {
  assert.equal(await sha256Text(canonicalJson({ b: 2, a: 1 })), await sha256Text(canonicalJson({ a: 1, b: 2 })));
});

test("A stale Founder revision fails closed", async () => {
  const result = await bound();
  assert.deepEqual(verifyRuntimeSnapshot(result.contract, { ...fresh, founder_authority_revision: "NEW" }), ["STALE_FOUNDER_AUTHORITY"]);
});

test("B stale Programme revision fails closed", async () => {
  const result = await bound();
  assert.deepEqual(verifyRuntimeSnapshot(result.contract, { ...fresh, programme_state_revision: "NEW" }), ["STALE_PROGRAMME_STATE"]);
});

test("C/D HEIR movement pre-dispatch or terminal fails closed", async () => {
  const result = await bound();
  assert.deepEqual(verifyRuntimeSnapshot(result.contract, { ...fresh, receiver_sha: "d".repeat(40) }), ["HEIR_DRIFT"]);
});

test("LIVE drift fails closed for production-observation work", async () => {
  const result = await bound();
  assert.deepEqual(verifyRuntimeSnapshot(result.contract, { ...fresh, live_control_sha: "d".repeat(40) }), ["LIVE_DRIFT"]);
});

test("E/F second writer or write-set escape cannot mutate read-only contract", async () => {
  const result = await bound();
  assert.throws(() => verifyWriteSet(result.contract, "src/App.tsx"), /WRITE_SET_ESCAPE/);
});

test("G RED action is rejected", async () => {
  await assert.rejects(() => buildTaskContractV1(pkg({ writeScopes: ["LIVE/production"] }), {
    founderAuthorityRevision: "FOUNDER_M_L_CURRENT", programmeStateRevision: "CSR-2026-09-08-05", factoryBuildSha: B,
    receiverRef: "king/test", receiverSha: A, liveControlRef: fresh.live_control_ref, liveControlSha: C,
    makerId: "FACTORY_WORKER:CODE_QA", evaluatorId: "AXE_PROGRAMME_QA_INDEPENDENT", physicalEnvironmentContainmentVerified: false,
  }), /RED_WRITE_SCOPE_FORBIDDEN/);
});

test("I/O maker self-approval or missing evaluator fails closed", async () => {
  await assert.rejects(() => bound({ evaluatorId: "FACTORY_WORKER:CODE_QA" }), /MAKER_JUDGE_COLLISION/);
  await assert.rejects(() => bound({ evaluatorId: "" }), /INVALID_TASK_CONTRACT_EVALUATOR_IDENTITY/);
});

test("Q clean behavioural loop cannot automatically grant B1 while containment is open", async () => {
  const result = await bound();
  assert.equal(result.autonomy_ceiling, "B0.5");
  assert.throws(() => requireAutonomyLevel(result.contract, "B1"), /B1_PHYSICAL_ENVIRONMENT_BLOCKED/);
});

test("B1 is only structurally possible when physical containment is independently marked verified", async () => {
  const result = await bound({ physicalEnvironmentContainmentVerified: true });
  assert.equal(requireAutonomyLevel(result.contract, "B1"), "B1");
});

test("H/P worker self-report cannot serve as independent readback", () => {
  assert.throws(() => verifyIndependentReadback({ source: "WORKER_SELF_REPORT", workerClaimHash: "x", independentObservedHash: "x", canonicalWritebackHash: "x", independentReadbackHash: "x" }), /WORKER_SELF_READBACK_FORBIDDEN/);
});

test("J terminal readback parity mismatch fails closed", () => {
  assert.throws(() => verifyIndependentReadback({ source: "AXE_PROGRAMME_QA", workerClaimHash: "x", independentObservedHash: "x", canonicalWritebackHash: "y", independentReadbackHash: "x" }), /INDEPENDENT_READBACK_PARITY_MISMATCH/);
});

test("context fingerprint corruption fails closed", async () => {
  const result = await bound();
  const corrupted = { ...result, fingerprint: { ...result.fingerprint, context_hash: "0".repeat(64) } };
  await assert.rejects(() => verifyBoundTaskContract(corrupted), /CONTEXT_HASH_MISMATCH/);
});

test("duplicate dispatch identity fails closed", () => {
  assert.throws(() => assertUniqueDispatchKeys(["a", "a"]), /QUEUE_DUPLICATION/);
  assert.doesNotThrow(() => assertUniqueDispatchKeys(["a", "b"]));
});

test("retry and browser resource exhaustion fail closed", async () => {
  const result = await bound();
  assert.throws(() => assertResourceUseWithinBudget(result.contract, { queueRetries: 4 }), /QUEUE_RETRY_EXHAUSTION/);
  assert.throws(() => assertResourceUseWithinBudget(result.contract, { browserCalls: 2 }), /RESOURCE_BUDGET_EXCEEDED:BROWSER_CALLS/);
  assert.doesNotThrow(() => assertResourceUseWithinBudget(result.contract, { queueRetries: 3, browserCalls: 1, modelCalls: 0 }));
});
