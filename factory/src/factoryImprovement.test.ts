import test from "node:test";
import assert from "node:assert/strict";
import { compileFactoryImprovement, type VerifiedFactoryFailure } from "./factoryImprovement";

function failure(overrides: Partial<VerifiedFactoryFailure> = {}): VerifiedFactoryFailure {
  return {
    failureId: "queue-duplicate-write-01",
    sourceWorkPackageId: "factory-real-actor-01",
    sourceRunId: "run-actor-01",
    projectId: "4planet-factory",
    observedAt: "2026-09-03T00:00:00.000Z",
    exactFactorySha: "a".repeat(40),
    exactTestKingSha: "b".repeat(40),
    severity: "P0",
    expected: "duplicate Queue delivery produces one GitHub effect",
    actual: "same logical delivery attempted the effect twice",
    evidenceRefs: ["run:1", "github:1"],
    rootCause: "adapter had no persisted side-effect receipt",
    rootCauseVerified: true,
    candidateChange: "persist STARTED/COMMITTED side-effect receipts around GitHub writes",
    writeScopes: ["factory/src/"],
    regressionTests: ["duplicate Queue delivery yields exactly one committed GitHub effect"],
    rollbackRef: "commit:before-idempotency-runtime",
    repeatedFailureCount: 1,
    ...overrides,
  };
}

test("verified failure compiles to a bounded Factory-only self-improvement package", () => {
  const compiled = compileFactoryImprovement(failure());
  assert.equal(compiled.status, "READY");
  if (compiled.status !== "READY") return;
  assert.equal(compiled.workPackage.section, "CODE_QA");
  assert.equal(compiled.workPackage.priority, "P0");
  assert.equal(compiled.workPackage.status, "READY");
  assert.equal(compiled.workPackage.factoryImprovement.selfPromotionAllowed, false);
  assert.equal(compiled.workPackage.factoryImprovement.promotionAuthority, "INDEPENDENT_QA_AND_PROGRAMME_GATE");
  assert.ok(compiled.workPackage.requiredEvidence.includes("independent-audit:required"));
});

test("compiler fails closed on unverified root cause, weak evidence or missing regression", () => {
  assert.throws(() => compileFactoryImprovement(failure({ rootCauseVerified: false })), /rootCauseUnverified/);
  assert.throws(() => compileFactoryImprovement(failure({ evidenceRefs: ["one"] })), /evidenceRefs/);
  assert.throws(() => compileFactoryImprovement(failure({ regressionTests: [] })), /regressionTests/);
});

test("Factory improvement cannot write public product or arbitrary workflow scopes", () => {
  assert.throws(() => compileFactoryImprovement(failure({ writeScopes: ["src/pages/species/"] })), /writeScope/);
  assert.throws(() => compileFactoryImprovement(failure({ writeScopes: [".github/workflows/deploy-live.yml"] })), /writeScope/);
});

test("exact state identity is mandatory", () => {
  assert.throws(() => compileFactoryImprovement(failure({ exactFactorySha: "short" })), /exactFactorySha/);
  assert.throws(() => compileFactoryImprovement(failure({ exactTestKingSha: "short" })), /exactTestKingSha/);
});

test("paid-capability improvement parks instead of silently spending", () => {
  const compiled = compileFactoryImprovement(failure({ requiresPaidCapability: true, paidCapabilityFounderApproved: false }));
  assert.deepEqual(compiled, { status: "PARK", reasons: ["PAID_CAPABILITY_FOUNDER_APPROVAL_REQUIRED"] });
});

test("same failure identity compiles deterministically and repeated failures increase learning value", () => {
  const first = compileFactoryImprovement(failure());
  const repeated = compileFactoryImprovement(failure({ repeatedFailureCount: 4 }));
  assert.equal(first.status, "READY");
  assert.equal(repeated.status, "READY");
  if (first.status === "READY" && repeated.status === "READY") {
    assert.equal(first.workPackage.id, repeated.workPackage.id);
    assert.ok(repeated.workPackage.learningValue > first.workPackage.learningValue);
  }
});
