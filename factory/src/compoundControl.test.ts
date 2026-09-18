import assert from "node:assert/strict";
import test from "node:test";
import type { Outcome, WorkPackage } from "./contracts";
import {
  REQUIRED_MULTI_GIGA_04_AUTHORITY_REF,
  assertAcceptedOutcomeEvidence,
  assertExecutionLineWip,
  assertFounderInsightPropagation,
  assertMaterialFailureClosure,
  assertMutationPreservation,
  assertRequiredAuthorityRefs,
  assertSoleIntegrationReceiver,
  assertWorkPackageControl,
  closeFailureRecord,
  failureRecordFromOutcome,
} from "./compoundControl";

function pkg(overrides: Partial<WorkPackage> = {}): WorkPackage {
  return {
    id: "wp-01",
    projectId: "SYS-P00-BRAIN",
    title: "Implement compound control",
    section: "BRAIN_CONTROL",
    priority: "P0",
    goalLink: "Compound intelligence",
    gapClosed: "Control rules are not machine-enforced",
    deliverables: ["control gate"],
    dependencies: [],
    writeScopes: [],
    definitionOfDone: ["negative tests reject invalid state"],
    requiredEvidence: ["test result"],
    createdAt: "2026-09-02T00:00:00Z",
    estimatedValue: 10,
    criticalPath: 10,
    dependencyUnlock: 10,
    proofValue: 10,
    cashValue: 5,
    learningValue: 10,
    risk: 2,
    founderBurden: 0,
    concurrencyCost: 1,
    status: "READY",
    ...overrides,
  };
}

function outcome(overrides: Partial<Outcome> = {}): Outcome {
  return {
    workPackageId: "wp-01",
    status: "ACCEPTED",
    evidence: ["exact test PASS"],
    materialDelta: "A hard control now rejects invalid state.",
    expected: "Invalid state must fail closed.",
    actual: "Invalid state failed closed in the regression test.",
    completedAt: "2026-09-02T00:30:00Z",
    ...overrides,
  };
}

test("required Founder Decision cannot disappear from Factory authority projection", () => {
  assert.throws(() => assertRequiredAuthorityRefs(["old-control"]), /missing required Founder Decision/);
  assert.doesNotThrow(() => assertRequiredAuthorityRefs([`drive:${REQUIRED_MULTI_GIGA_04_AUTHORITY_REF}`]));
});

test("NO ORPHANS rejects active package with no evidence gate", () => {
  assert.throws(() => assertWorkPackageControl(pkg({ requiredEvidence: [] })), /ORPHANED/);
});

test("DONE=EVIDENCE rejects agent acceptance without inspectable evidence", () => {
  assert.throws(() => assertAcceptedOutcomeEvidence(outcome({ evidence: [] })), /DONE=EVIDENCE/);
});

test("ONE CODE RIVER rejects competing integration receiver", () => {
  assert.throws(() => assertSoleIntegrationReceiver("feature/new-king"), /Competing integration receiver rejected/);
  assert.doesNotThrow(() => assertSoleIntegrationReceiver("king/test"));
});

test("PRESERVE BEFORE MUTATE rejects a write with no preservation or ZERO LOSS evidence", () => {
  assert.throws(() => assertMutationPreservation(pkg({ writeScopes: ["src"] })), /missing MUST-NOT-LOSE/);
  assert.doesNotThrow(() =>
    assertMutationPreservation(
      pkg({
        writeScopes: ["src"],
        preservation: {
          mustNotLose: ["accepted navigation"],
          regressionRisks: ["mobile route regression"],
          rollbackRef: "ead7715a5d426058ea9107dbbe3d3ab3ce55528c",
        },
      }),
    ),
  );
});

test("FAILURE→TEST cannot close without a changed rule and regression control or explicit impossibility", () => {
  const failed = outcome({ status: "CORRECT", actual: "Regression reproduced.", materialDelta: "Candidate regressed." });
  const record = failureRecordFromOutcome(failed);
  assert.ok(record);
  assert.throws(
    () =>
      assertMaterialFailureClosure({
        failureId: record.id,
        rootCause: "Missing invariant",
        learning: "Protect accepted behaviour before mutation",
        changedRuleOrContract: "Require preservation declaration",
        verificationRef: "test:compound-control",
        writebackRef: "BRAIN:learning-01",
      }),
    /regressionControlRef/,
  );
  const closed = closeFailureRecord(record, {
    failureId: record.id,
    rootCause: "Missing invariant",
    learning: "Protect accepted behaviour before mutation",
    changedRuleOrContract: "Require preservation declaration",
    regressionControlRef: "factory/src/compoundControl.test.ts",
    verificationRef: "test:compound-control:PASS",
    writebackRef: "BRAIN:learning-01",
  });
  assert.equal(closed.status, "CLOSED");
});

test("INSIGHT→WBS rejects an approved insight that is not mapped into build/test evidence", () => {
  assert.throws(
    () =>
      assertFounderInsightPropagation({
        insightId: "FD-2026-09-02",
        founderDecisionRef: REQUIRED_MULTI_GIGA_04_AUTHORITY_REF,
        approvedAt: "2026-09-02T00:00:00Z",
        strategicStatement: "Understanding → decision → incentive → action → proof → learning",
        affectedSystems: ["SUPERBRAIN", "FACTORY"],
        wbsIds: [],
        changedRulesOrContracts: ["INSIGHT→WBS"],
        buildOrTestRefs: ["factory/src/compoundControl.test.ts"],
        evidenceRefs: ["Atomic:MULTI-GIGA 04"],
        writebackRefs: ["decisions.md"],
      }),
    /wbsIds/,
  );
});

test("bounded WIP rejects more than five in-flight packages on one execution line", () => {
  const packages = Array.from({ length: 6 }, (_, index) =>
    pkg({ id: `wp-${index}`, status: "RUNNING", section: "CODE_QA" }),
  );
  assert.throws(() => assertExecutionLineWip(packages), /WIP limit exceeded/);
});
