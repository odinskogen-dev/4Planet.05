import type { Outcome, PreservationEvidence, Section, WorkPackage } from "./contracts";

export const REQUIRED_MULTI_GIGA_04_AUTHORITY_REF = "1lktKB_uU0CQxRYNwiIqa-pHE74LeBpI_4QbYDrC3Dcw";
export const SOLE_INTEGRATION_RECEIVER = "king/test";
export const DEFAULT_EXECUTION_LINE_WIP_LIMIT = 5;

export interface MaterialFailureClosure {
  failureId: string;
  rootCause: string;
  learning: string;
  changedRuleOrContract: string;
  regressionControlRef?: string;
  regressionControlNotPossibleReason?: string;
  verificationRef: string;
  writebackRef: string;
}

export interface FailureRecord {
  id: string;
  workPackageId: string;
  status: "OPEN" | "CLOSED";
  expected: string;
  actual: string;
  materialDelta: string;
  evidence: string[];
  createdAt: string;
  closure?: MaterialFailureClosure;
  closedAt?: string;
}

export interface FounderInsightPropagationReceipt {
  insightId: string;
  founderDecisionRef: string;
  approvedAt: string;
  strategicStatement: string;
  affectedSystems: string[];
  wbsIds: string[];
  changedRulesOrContracts: string[];
  buildOrTestRefs: string[];
  evidenceRefs: string[];
  writebackRefs: string[];
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmpty(values: readonly string[] | undefined): boolean {
  return Array.isArray(values) && values.some((value) => text(value));
}

export function assertRequiredAuthorityRefs(sourceRefs: readonly string[]): void {
  if (!sourceRefs.some((ref) => ref.includes(REQUIRED_MULTI_GIGA_04_AUTHORITY_REF))) {
    throw new Error(`Factory authority projection missing required Founder Decision ${REQUIRED_MULTI_GIGA_04_AUTHORITY_REF}`);
  }
}

/**
 * Factory-level NO ORPHANS gate. A WorkPackage's execution owner is its Section;
 * current state is its status; next action is the bounded package/deliverable;
 * its gate is DoD + required evidence. The authoritative Project owner/state still
 * lives in BRAIN/WBS and is checked separately by SUPERBRAIN.
 */
export function assertWorkPackageControl(pkg: WorkPackage): void {
  const missing: string[] = [];
  if (!text(pkg.id)) missing.push("id");
  if (!text(pkg.projectId)) missing.push("projectId");
  if (!text(pkg.title)) missing.push("nextAction/title");
  if (!text(pkg.section)) missing.push("owner/section");
  if (!text(pkg.status)) missing.push("currentState/status");
  if (!nonEmpty(pkg.deliverables)) missing.push("deliverables");
  if (!nonEmpty(pkg.definitionOfDone)) missing.push("gate/definitionOfDone");
  if (!nonEmpty(pkg.requiredEvidence)) missing.push("gate/requiredEvidence");
  if (!text(pkg.goalLink)) missing.push("goalLink");
  if (!text(pkg.gapClosed)) missing.push("gapClosed");
  if (missing.length > 0) throw new Error(`ORPHANED work package ${pkg.id || "UNKNOWN"}: missing ${missing.join(", ")}`);
}

export function assertSoleIntegrationReceiver(receiver: string): void {
  if (receiver !== SOLE_INTEGRATION_RECEIVER) {
    throw new Error(`Competing integration receiver rejected: ${receiver || "EMPTY"}; required=${SOLE_INTEGRATION_RECEIVER}`);
  }
}

function explicitPreservationReady(preservation: PreservationEvidence | undefined): boolean {
  return Boolean(
    preservation &&
      nonEmpty(preservation.mustNotLose) &&
      nonEmpty(preservation.regressionRisks) &&
      text(preservation.rollbackRef),
  );
}

/**
 * PRESERVE BEFORE MUTATE. A write-scoped package must either carry an explicit
 * preservation declaration or already satisfy the stronger ZERO LOSS donor gate.
 */
export function assertMutationPreservation(pkg: WorkPackage): void {
  if (pkg.writeScopes.length === 0) return;
  const zeroLossReady = Boolean(
    pkg.zeroLoss?.required &&
      pkg.zeroLoss.orphanCount === 0 &&
      nonEmpty(pkg.zeroLoss.winnerParityEvidence) &&
      pkg.zeroLoss.dispositions.every((record) => nonEmpty(record.evidence)),
  );
  if (!explicitPreservationReady(pkg.preservation) && !zeroLossReady) {
    throw new Error(`Mutation ${pkg.id} rejected: missing MUST-NOT-LOSE/regression/rollback declaration or complete ZERO LOSS evidence`);
  }
}

export function assertAcceptedOutcomeEvidence(outcome: Outcome): void {
  if (outcome.status !== "ACCEPTED") return;
  const missing: string[] = [];
  if (!nonEmpty(outcome.evidence)) missing.push("evidence");
  if (!text(outcome.materialDelta)) missing.push("materialDelta");
  if (!text(outcome.expected)) missing.push("expected");
  if (!text(outcome.actual)) missing.push("actual");
  if (!text(outcome.completedAt) || !Number.isFinite(Date.parse(outcome.completedAt))) missing.push("completedAt");
  if (missing.length > 0) throw new Error(`DONE=EVIDENCE gate failed for ${outcome.workPackageId}: missing ${missing.join(", ")}`);
}

export function failureRecordFromOutcome(outcome: Outcome): FailureRecord | undefined {
  if (outcome.status === "ACCEPTED") return undefined;
  return {
    id: `failure:${outcome.workPackageId}:${outcome.completedAt}`,
    workPackageId: outcome.workPackageId,
    status: "OPEN",
    expected: outcome.expected,
    actual: outcome.actual,
    materialDelta: outcome.materialDelta,
    evidence: [...outcome.evidence],
    createdAt: outcome.completedAt,
  };
}

export function assertMaterialFailureClosure(closure: MaterialFailureClosure): void {
  const missing: string[] = [];
  if (!text(closure.failureId)) missing.push("failureId");
  if (!text(closure.rootCause)) missing.push("rootCause");
  if (!text(closure.learning)) missing.push("learning");
  if (!text(closure.changedRuleOrContract)) missing.push("changedRuleOrContract");
  if (!text(closure.verificationRef)) missing.push("verificationRef");
  if (!text(closure.writebackRef)) missing.push("writebackRef");
  if (!text(closure.regressionControlRef) && !text(closure.regressionControlNotPossibleReason)) {
    missing.push("regressionControlRef|regressionControlNotPossibleReason");
  }
  if (missing.length > 0) throw new Error(`FAILURE→TEST closure rejected: missing ${missing.join(", ")}`);
}

export function closeFailureRecord(record: FailureRecord, closure: MaterialFailureClosure, closedAt = new Date().toISOString()): FailureRecord {
  if (record.status !== "OPEN") throw new Error(`Failure ${record.id} is not OPEN`);
  if (closure.failureId !== record.id) throw new Error(`Failure closure id mismatch: ${closure.failureId} != ${record.id}`);
  assertMaterialFailureClosure(closure);
  if (!Number.isFinite(Date.parse(closedAt))) throw new Error("Failure closedAt must be an ISO-compatible timestamp");
  return { ...record, status: "CLOSED", closure: { ...closure }, closedAt };
}

export function assertFounderInsightPropagation(receipt: FounderInsightPropagationReceipt): void {
  const missing: string[] = [];
  if (!text(receipt.insightId)) missing.push("insightId");
  if (!text(receipt.founderDecisionRef)) missing.push("founderDecisionRef");
  if (!text(receipt.approvedAt) || !Number.isFinite(Date.parse(receipt.approvedAt))) missing.push("approvedAt");
  if (!text(receipt.strategicStatement)) missing.push("strategicStatement");
  if (!nonEmpty(receipt.affectedSystems)) missing.push("affectedSystems");
  if (!nonEmpty(receipt.wbsIds)) missing.push("wbsIds");
  if (!nonEmpty(receipt.changedRulesOrContracts)) missing.push("changedRulesOrContracts");
  if (!nonEmpty(receipt.buildOrTestRefs)) missing.push("buildOrTestRefs");
  if (!nonEmpty(receipt.evidenceRefs)) missing.push("evidenceRefs");
  if (!nonEmpty(receipt.writebackRefs)) missing.push("writebackRefs");
  if (missing.length > 0) throw new Error(`INSIGHT→WBS propagation rejected for ${receipt.insightId || "UNKNOWN"}: missing ${missing.join(", ")}`);
}

export function assertExecutionLineWip(packages: readonly WorkPackage[], limit = DEFAULT_EXECUTION_LINE_WIP_LIMIT): void {
  if (!Number.isInteger(limit) || limit < 1) throw new Error("WIP limit must be a positive integer");
  const active = packages.filter((pkg) => pkg.status === "DISPATCHED" || pkg.status === "RUNNING");
  const counts = new Map<Section, number>();
  for (const pkg of active) counts.set(pkg.section, (counts.get(pkg.section) ?? 0) + 1);
  const breaches = [...counts.entries()].filter(([, count]) => count > limit);
  if (breaches.length > 0) {
    throw new Error(`WIP limit exceeded: ${breaches.map(([section, count]) => `${section}=${count}/${limit}`).join(", ")}`);
  }
}
