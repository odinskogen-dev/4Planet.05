import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { WorkPackage } from "./contracts";
import {
  AUTOMATION_NOT_SIMPLIFIED,
  evaluateAutomationPreflight,
  type AutomationPreflightEvidence,
  type AutomationPreflightWorkPackage,
} from "./automationPreflight";

function pkg(overrides: Partial<AutomationPreflightWorkPackage> = {}): AutomationPreflightWorkPackage {
  const base: WorkPackage = {
    id: "factory-preflight-proof-01",
    projectId: "ATLAS",
    title: "Bounded automated proof",
    section: "PRODUCT_DESIGN",
    priority: "P0",
    goalLink: "Prove simplify before automate",
    gapClosed: "Automation could run without simplification proof",
    deliverables: ["bounded proof"],
    dependencies: [],
    writeScopes: ["src/earth"],
    definitionOfDone: ["unsimplified automation is rejected before execution"],
    requiredEvidence: ["deterministic regression"],
    createdAt: "2026-09-04T00:00:00Z",
    estimatedValue: 8,
    criticalPath: 8,
    dependencyUnlock: 8,
    proofValue: 10,
    cashValue: 0,
    learningValue: 10,
    risk: 2,
    founderBurden: 0,
    concurrencyCost: 1,
    status: "READY",
  };
  return { ...base, ...overrides };
}

const simplified: AutomationPreflightEvidence = {
  requirement: "Preserve current ATLAS behaviour while reducing duplicate control work.",
  delete: {
    candidatesConsidered: ["duplicate status reconstruction", "second candidate branch"],
    removedOrRejected: ["second candidate branch rejected"],
  },
  simplify: {
    beforeSteps: 6,
    afterSteps: 3,
    changes: ["reuse current candidate authority and existing QA instead of rebuilding them"],
  },
  reuse: ["PROJECT_CANDIDATE_AUTHORITY", "existing exact-head gates"],
  cycleBaseline: "baseline=6 manual/control steps before automated execution",
  minimalLoop: ["authority", "bounded mutation", "proof"],
  automationJustification: "The remaining deterministic three-step loop is repetitive and already governed.",
  proofRefs: ["factory/src/automationPreflight.test.ts"],
  rollbackRef: "exact-parent-sha",
  learningWritebackRef: "SYSTEM_PROGRAM_LOG",
};

test("negative proof: unsimplified automation is rejected with exact fail-closed code", () => {
  const decision = evaluateAutomationPreflight(pkg());
  assert.equal(decision.ok, false);
  if (!decision.ok) {
    assert.equal(decision.code, AUTOMATION_NOT_SIMPLIFIED);
    assert.match(decision.reasons.join("; "), /missing/);
  }
});

test("negative proof: paperwork without actual step reduction is still rejected", () => {
  const decision = evaluateAutomationPreflight(pkg({
    automationPreflight: {
      ...simplified,
      simplify: { beforeSteps: 4, afterSteps: 4, changes: ["renamed steps only"] },
    },
  }));
  assert.equal(decision.ok, false);
  if (!decision.ok) assert.match(decision.reasons.join("; "), /smaller executable process/);
});

test("positive proof: a bounded process with demonstrated delete+simplify evidence passes", () => {
  const decision = evaluateAutomationPreflight(pkg({ automationPreflight: simplified }));
  assert.equal(decision.ok, true);
});

test("shared worker wiring orders authority -> simplification -> reservation/execution", () => {
  const source = readFileSync(new URL("./workers.ts", import.meta.url), "utf8");

  const autonomousStart = source.indexOf("if (autonomous) {");
  assert.ok(autonomousStart >= 0, "autonomous dispatch boundary missing");
  const autonomousSource = source.slice(autonomousStart, source.indexOf("try {\n      const executed = await executeReadOnlyPackage", autonomousStart));
  const authority = autonomousSource.indexOf("candidateAuthorityBlock(");
  const preflight = autonomousSource.indexOf("automationPreflightBlock(");
  const reservation = autonomousSource.indexOf("reserveAiBudget(");
  const execution = autonomousSource.indexOf("executeAutonomousPackage(");
  assert.ok(authority >= 0 && preflight > authority, "automation preflight must follow live candidate authority");
  assert.ok(reservation > preflight, "automation preflight must precede resource reservation");
  assert.ok(execution > reservation, "autonomous execution must follow reservation");

  const claudeStart = source.indexOf('if (pkg.specialist.mode === "BOUNDED_CODE")');
  assert.ok(claudeStart >= 0, "Claude bounded-code dispatch boundary missing");
  const claudeSource = source.slice(claudeStart, source.indexOf("const autonomous =", claudeStart));
  const claudeAuthority = claudeSource.indexOf("candidateAuthorityBlock(");
  const claudePreflight = claudeSource.indexOf("automationPreflightBlock(");
  const claudeExecution = claudeSource.indexOf("executeClaudeProductReview(");
  assert.ok(claudeAuthority >= 0 && claudePreflight > claudeAuthority, "Claude preflight must follow authority");
  assert.ok(claudeExecution > claudePreflight, "Claude execution must follow simplification preflight");
});
