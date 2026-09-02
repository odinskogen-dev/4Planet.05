import test from "node:test";
import assert from "node:assert/strict";
import { evaluateProductionGrade, type ProductionGradeEvidence } from "./productionGradeGate";

const now = Date.parse("2026-09-03T00:00:00.000Z");

function complete(): ProductionGradeEvidence {
  return {
    activeInternalTestProductionProven: true,
    transactionInvariantsProven: true,
    runLedgerRecoveryProven: true,
    idempotencyProven: true,
    leaseFencingProven: true,
    concurrencySafetyProven: true,
    sandboxIsolationProven: true,
    sandboxEgressPolicyProven: true,
    supplyChainDefenceProven: true,
    modelFailureHandlingProven: true,
    makerJudgeSeparationProven: true,
    promptInjectionDefenceProven: true,
    watchdogRecoveryProven: true,
    staleEvidenceRejected: true,
    resourceBudgetsProven: true,
    chaosSuiteProven: true,
    multiProjectProductionProven: true,
    multiWorkerProductionProven: true,
    learningDatasetOperational: true,
    noLiveAuthority: true,
    noCanonAuthority: true,
    noExternalSendAuthority: true,
    noPaymentAuthority: true,
    exactFactorySha: "a".repeat(40),
    exactTestKingSha: "b".repeat(40),
    evidencedAt: "2026-09-02T23:59:00.000Z",
  };
}

test("Level 3 certification fails closed when any critical proof is absent", () => {
  const evidence = complete();
  evidence.leaseFencingProven = false;
  evidence.sandboxIsolationProven = false;
  const result = evaluateProductionGrade(evidence, now);
  assert.equal(result.ready, false);
  assert.ok(result.missing.includes("LEASE_FENCING"));
  assert.ok(result.missing.includes("SANDBOX_ISOLATION"));
});

test("old evidence cannot certify 24/7 production-grade state", () => {
  const evidence = complete();
  evidence.evidencedAt = "2026-09-02T20:00:00.000Z";
  const result = evaluateProductionGrade(evidence, now);
  assert.equal(result.ready, false);
  assert.ok(result.missing.includes("STALE_OR_FUTURE_EVIDENCE"));
});

test("complete fresh evidence is the only route to Level 3", () => {
  assert.deepEqual(evaluateProductionGrade(complete(), now), {
    level: "24_7_PRODUCTION_GRADE_INTERNAL",
    ready: true,
    missing: [],
  });
});
