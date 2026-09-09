import type { WorkPackage } from "./contracts";

export type FactoryFailureSeverity = "P0" | "P1" | "P2" | "P3";

export interface VerifiedFactoryFailure {
  failureId: string;
  sourceWorkPackageId: string;
  sourceRunId: string;
  projectId: string;
  observedAt: string;
  exactFactorySha: string;
  exactTestKingSha: string;
  severity: FactoryFailureSeverity;
  expected: string;
  actual: string;
  evidenceRefs: string[];
  rootCause: string;
  rootCauseVerified: boolean;
  candidateChange: string;
  writeScopes: string[];
  regressionTests: string[];
  rollbackRef: string;
  repeatedFailureCount: number;
  requiresPaidCapability?: boolean;
  paidCapabilityFounderApproved?: boolean;
}

export interface FactoryImprovementControl {
  kind: "FACTORY_IMPROVEMENT";
  sourceFailureId: string;
  sourceWorkPackageId: string;
  sourceRunId: string;
  exactFactorySha: string;
  exactTestKingSha: string;
  regressionTests: string[];
  rollbackRef: string;
  selfPromotionAllowed: false;
  promotionAuthority: "INDEPENDENT_QA_AND_PROGRAMME_GATE";
}

export type FactoryImprovementWorkPackage = WorkPackage & {
  factoryImprovement: FactoryImprovementControl;
};

export type FactoryImprovementCompilation =
  | { status: "READY"; workPackage: FactoryImprovementWorkPackage }
  | { status: "PARK"; reasons: string[] };

const SHA40 = /^[0-9a-f]{40}$/i;
const FACTORY_WORKFLOW_WRITE_ALLOWLIST = new Set([
  ".github/workflows/production-factory-shadow-ci.yml",
  ".github/workflows/production-factory-shadow-deploy.yml",
]);

function required(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`FACTORY_IMPROVEMENT_INVALID:${field}`);
  return trimmed;
}

function safeId(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
  if (!slug) throw new Error("FACTORY_IMPROVEMENT_INVALID:failureId");
  return slug;
}

function scopeAllowed(scope: string): boolean {
  const clean = scope.replace(/^\.\//, "").replace(/^\//, "");
  if (clean === "factory" || clean.startsWith("factory/")) return true;
  return FACTORY_WORKFLOW_WRITE_ALLOWLIST.has(clean);
}

function priorityFor(severity: FactoryFailureSeverity): WorkPackage["priority"] {
  if (severity === "P0") return "P0";
  if (severity === "P1") return "P1";
  return "P2";
}

/**
 * Compile only verified production evidence into bounded self-improvement work.
 * The compiler can create work for the Factory; it never grants the Factory
 * authority to accept/promote its own modification.
 */
export function compileFactoryImprovement(failure: VerifiedFactoryFailure): FactoryImprovementCompilation {
  required(failure.failureId, "failureId");
  required(failure.sourceWorkPackageId, "sourceWorkPackageId");
  required(failure.sourceRunId, "sourceRunId");
  required(failure.projectId, "projectId");
  required(failure.expected, "expected");
  required(failure.actual, "actual");
  required(failure.rootCause, "rootCause");
  required(failure.candidateChange, "candidateChange");
  required(failure.rollbackRef, "rollbackRef");
  if (!SHA40.test(failure.exactFactorySha)) throw new Error("FACTORY_IMPROVEMENT_INVALID:exactFactorySha");
  if (!SHA40.test(failure.exactTestKingSha)) throw new Error("FACTORY_IMPROVEMENT_INVALID:exactTestKingSha");
  if (!Number.isFinite(Date.parse(failure.observedAt))) throw new Error("FACTORY_IMPROVEMENT_INVALID:observedAt");
  if (!failure.rootCauseVerified) throw new Error("FACTORY_IMPROVEMENT_INVALID:rootCauseUnverified");
  if (failure.evidenceRefs.length < 2 || failure.evidenceRefs.some((item) => !item.trim())) {
    throw new Error("FACTORY_IMPROVEMENT_INVALID:evidenceRefs");
  }
  if (failure.regressionTests.length < 1 || failure.regressionTests.some((item) => !item.trim())) {
    throw new Error("FACTORY_IMPROVEMENT_INVALID:regressionTests");
  }
  if (failure.writeScopes.length < 1 || failure.writeScopes.some((scope) => !scopeAllowed(scope))) {
    throw new Error("FACTORY_IMPROVEMENT_INVALID:writeScope");
  }
  if (!Number.isInteger(failure.repeatedFailureCount) || failure.repeatedFailureCount < 1) {
    throw new Error("FACTORY_IMPROVEMENT_INVALID:repeatedFailureCount");
  }

  if (failure.requiresPaidCapability && !failure.paidCapabilityFounderApproved) {
    return { status: "PARK", reasons: ["PAID_CAPABILITY_FOUNDER_APPROVAL_REQUIRED"] };
  }

  const id = `factory-improvement-${safeId(failure.failureId)}`;
  const createdAt = new Date(Date.parse(failure.observedAt)).toISOString();
  const workPackage: FactoryImprovementWorkPackage = {
    id,
    projectId: failure.projectId,
    title: `Factory improvement — ${failure.failureId}`,
    section: "CODE_QA",
    priority: priorityFor(failure.severity),
    goalLink: "CORPORATE_AUTONOMOUS_OS/FACTORY_IMPROVEMENT",
    gapClosed: failure.candidateChange,
    deliverables: [
      failure.candidateChange,
      ...failure.regressionTests.map((test) => `Regression: ${test}`),
    ],
    dependencies: [],
    writeScopes: [...failure.writeScopes],
    definitionOfDone: [
      "Root-cause correction implemented only inside declared Factory scopes.",
      "Every declared regression test passes and the original failure is no longer reproducible.",
      "Exact Factory and TEST KING state are revalidated before mutation and before acceptance.",
      "Independent QA/programme gate reviews evidence; Factory does not self-promote.",
      "Rollback remains executable and no LIVE/Canon/outreach/payment authority is introduced.",
    ],
    requiredEvidence: [
      ...failure.evidenceRefs,
      `source-run:${failure.sourceRunId}`,
      `factory-sha:${failure.exactFactorySha}`,
      `test-king-sha:${failure.exactTestKingSha}`,
      ...failure.regressionTests.map((test) => `regression:${test}`),
      `rollback:${failure.rollbackRef}`,
      "independent-audit:required",
    ],
    preservation: {
      mustNotLose: ["Single Factory lineage", "TEST KING sole receiver", "fail-closed authority boundaries"],
      regressionRisks: [failure.actual],
      rollbackRef: failure.rollbackRef,
      checkedAt: createdAt,
    },
    resourceBudget: {
      maxAttempts: 2,
      maxCorrectionAttempts: 2,
      maxModelCalls: 2,
      maxQueueRetries: 2,
    },
    learningQuestion: `Does correcting verified failure ${failure.failureId} reduce recurrence without weakening safety, authority or quality?`,
    createdAt,
    estimatedValue: failure.severity === "P0" ? 10 : failure.severity === "P1" ? 8 : 5,
    criticalPath: failure.severity === "P0" ? 10 : failure.severity === "P1" ? 8 : 4,
    dependencyUnlock: Math.min(10, 3 + failure.repeatedFailureCount),
    proofValue: 9,
    cashValue: 0,
    learningValue: Math.min(10, 5 + failure.repeatedFailureCount),
    risk: failure.severity === "P0" ? 10 : failure.severity === "P1" ? 7 : 4,
    founderBurden: 0,
    concurrencyCost: 2,
    status: "READY",
    factoryImprovement: {
      kind: "FACTORY_IMPROVEMENT",
      sourceFailureId: failure.failureId,
      sourceWorkPackageId: failure.sourceWorkPackageId,
      sourceRunId: failure.sourceRunId,
      exactFactorySha: failure.exactFactorySha.toLowerCase(),
      exactTestKingSha: failure.exactTestKingSha.toLowerCase(),
      regressionTests: [...failure.regressionTests],
      rollbackRef: failure.rollbackRef,
      selfPromotionAllowed: false,
      promotionAuthority: "INDEPENDENT_QA_AND_PROGRAMME_GATE",
    },
  };
  return { status: "READY", workPackage };
}
