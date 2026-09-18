import test from "node:test";
import assert from "node:assert/strict";
import type { Outcome, WorkPackage } from "./contracts";
import {
  AI_COST_CONTROL,
  evaluateGuardian,
  evaluateKaizenRule,
  independentQualityDecision,
  releaseAuthorityFor,
} from "./worldClassControl";

const basePackage: WorkPackage = {
  id: "test-browser",
  projectId: "test-project",
  title: "Read-only browser evidence",
  section: "CODE_QA",
  priority: "INCUBATING",
  goalLink: "test",
  gapClosed: "test",
  deliverables: ["evidence"],
  dependencies: [],
  writeScopes: [],
  definitionOfDone: ["browser evidence captured"],
  requiredEvidence: ["PASS"],
  createdAt: "2026-09-01T00:00:00.000Z",
  estimatedValue: 1,
  criticalPath: 1,
  dependencyUnlock: 1,
  proofValue: 1,
  cashValue: 0,
  learningValue: 1,
  risk: 0,
  founderBurden: 0,
  concurrencyCost: 1,
  status: "READY",
  execution: {
    kind: "BROWSER_QA",
    targetUrl: "https://example.com",
    allowedHosts: ["example.com"],
    viewport: { width: 390, height: 844 },
  },
};

const baseOutcome: Outcome = {
  workPackageId: basePackage.id,
  status: "ACCEPTED",
  evidence: ["browser snapshot PASS https://example.com", "viewport 390x844", "snapshot-sha256 abc"],
  materialDelta: "Verified a real rendered browser surface without changing the target.",
  expected: "browser evidence captured",
  actual: "Browser evidence captured successfully.",
  completedAt: "2026-09-01T00:01:00.000Z",
};

test("independent quality authority accepts complete bounded browser evidence", () => {
  const result = independentQualityDecision(basePackage, baseOutcome);
  assert.equal(result.decision, "ACCEPT");
  assert.ok(result.evidence.some((item) => item.includes("QUALITY-AUTHORITY PASS")));
});

test("independent quality authority corrects incomplete browser evidence", () => {
  const result = independentQualityDecision(basePackage, { ...baseOutcome, evidence: ["browser snapshot PASS https://example.com"] });
  assert.equal(result.decision, "CORRECT");
});

test("read-only evidence can never authorize LIVE release", () => {
  assert.equal(releaseAuthorityFor(basePackage, baseOutcome), "SHADOW_EVIDENCE_ONLY");
});

test("Guardian stops a line when founder-locked five-item WIP is breached", () => {
  const guardian = evaluateGuardian({
    mode: "SHADOW",
    hourlyScheduleConfigured: true,
    noLiveAuthority: true,
    queueCounts: [{ status: "RUNNING", count: 6 }],
    workerCount: 9,
  });
  assert.equal(guardian.severity, "RED");
  assert.equal(guardian.lineStop, true);
  assert.ok(guardian.reasons.some((reason) => reason.includes("5-package")));
});

test("Guardian allows exactly five in-flight packages", () => {
  const guardian = evaluateGuardian({
    mode: "SHADOW",
    hourlyScheduleConfigured: true,
    noLiveAuthority: true,
    queueCounts: [{ status: "RUNNING", count: 5 }],
    workerCount: 9,
  });
  assert.equal(guardian.severity, "GREEN");
  assert.equal(guardian.lineStop, false);
});

test("Guardian remains green when the safe runtime has no deterministic abnormality", () => {
  const guardian = evaluateGuardian({
    mode: "SHADOW",
    hourlyScheduleConfigured: true,
    noLiveAuthority: true,
    queueCounts: [{ status: "READY", count: 4 }],
    workerCount: 9,
  });
  assert.equal(guardian.severity, "GREEN");
  assert.equal(guardian.andon, false);
});

test("Kaizen cannot globalise a one-off observation", () => {
  const result = evaluateKaizenRule({
    rule: "Use progressive reveal before dense evidence panels",
    instanceIds: ["orca"],
    evidenceRefs: ["review:orca-01"],
    strengthensExistingGate: true,
  });
  assert.equal(result.readyForGovernedPromotion, false);
});

test("Kaizen can only become promotion-ready after repeated distinct evidence and a stronger gate", () => {
  const result = evaluateKaizenRule({
    rule: "Use progressive reveal before dense evidence panels",
    instanceIds: ["orca", "jaguar"],
    evidenceRefs: ["review:orca-01", "review:jaguar-01"],
    strengthensExistingGate: true,
  });
  assert.equal(result.readyForGovernedPromotion, true);
});

test("Factory AI model spend is fail-closed until a gateway budget/provider is intentionally bound", () => {
  assert.equal(AI_COST_CONTROL.modelSpendAllowed, false);
  assert.equal(AI_COST_CONTROL.spendLimitRequiredBeforeModelTraffic, true);
});

test("every intentional Factory cash cost remains Founder-gated and fail-closed by default", () => {
  assert.equal(AI_COST_CONTROL.policy, "FOUNDER_APPROVAL_REQUIRED_FOR_EVERY_CASH_COST");
  assert.equal(AI_COST_CONTROL.authorisedRecurringBaseUsd, 0);
  assert.equal(AI_COST_CONTROL.authorisedUsageOverageUsd, 0);
  assert.equal(AI_COST_CONTROL.explicitFounderApprovalRequired, true);
  assert.equal(AI_COST_CONTROL.subscriptionApprovalDoesNotAuthoriseOverage, true);
  assert.equal(AI_COST_CONTROL.paidFeaturesAllowed, false);
  assert.equal(AI_COST_CONTROL.autoUpgradeAllowed, false);
  assert.equal(AI_COST_CONTROL.automaticCapacityPurchaseAllowed, false);
  assert.equal(AI_COST_CONTROL.onCapacityLimit, "WAIT_OR_BLOCK_NEVER_SPEND_WITHOUT_NEW_APPROVAL");
});
