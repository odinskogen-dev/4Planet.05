import type { WorkPackage } from "./contracts";

export const AUTOMATION_NOT_SIMPLIFIED = "AUTOMATION_REJECTED — PROCESS NOT SIMPLIFIED";

export interface AutomationPreflightEvidence {
  requirement: string;
  delete: {
    candidatesConsidered: string[];
    removedOrRejected: string[];
  };
  simplify: {
    beforeSteps: number;
    afterSteps: number;
    changes: string[];
  };
  reuse: string[];
  cycleBaseline: string;
  minimalLoop: string[];
  automationJustification: string;
  proofRefs: string[];
  rollbackRef: string;
  learningWritebackRef: string;
}

export type AutomationPreflightWorkPackage = WorkPackage & {
  automationPreflight?: AutomationPreflightEvidence;
};

export type AutomationPreflightDecision =
  | { ok: true; evidence: AutomationPreflightEvidence }
  | { ok: false; code: typeof AUTOMATION_NOT_SIMPLIFIED; reasons: string[] };

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function texts(values: unknown): values is string[] {
  return Array.isArray(values) && values.length > 0 && values.every(text);
}

/**
 * SpaceX simplify-before-automate gate.
 * This does not decide candidate authority and does not reserve resources.
 * It is consumed by the shared SectionWorker dispatch boundary after live
 * candidate-authority proof and before any model/resource reservation or
 * autonomous/specialist execution.
 */
export function evaluateAutomationPreflight(pkg: AutomationPreflightWorkPackage): AutomationPreflightDecision {
  const evidence = pkg.automationPreflight;
  const reasons: string[] = [];

  if (!evidence) {
    return { ok: false, code: AUTOMATION_NOT_SIMPLIFIED, reasons: ["automationPreflight evidence is missing"] };
  }

  if (!text(evidence.requirement)) reasons.push("requirement not questioned/declared");
  if (!texts(evidence.delete?.candidatesConsidered)) reasons.push("DELETE candidates not considered");
  if (!texts(evidence.delete?.removedOrRejected)) reasons.push("DELETE produced no demonstrated removal/rejection");

  const before = evidence.simplify?.beforeSteps;
  const after = evidence.simplify?.afterSteps;
  if (!Number.isInteger(before) || !Number.isInteger(after) || before < 2 || after < 1 || after >= before) {
    reasons.push("SIMPLIFY did not demonstrate a smaller executable process");
  }
  if (!texts(evidence.simplify?.changes)) reasons.push("SIMPLIFY change evidence missing");
  if (!texts(evidence.reuse)) reasons.push("REUSE evaluation missing");
  if (!text(evidence.cycleBaseline)) reasons.push("cycle baseline missing");
  if (!texts(evidence.minimalLoop)) reasons.push("minimal loop missing");
  if (!text(evidence.automationJustification)) reasons.push("automation justification missing");
  if (!texts(evidence.proofRefs)) reasons.push("proof reference missing");
  if (!text(evidence.rollbackRef)) reasons.push("rollback reference missing");
  if (!text(evidence.learningWritebackRef)) reasons.push("learning writeback reference missing");

  return reasons.length > 0
    ? { ok: false, code: AUTOMATION_NOT_SIMPLIFIED, reasons }
    : { ok: true, evidence };
}
