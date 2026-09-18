import type { LearningCandidate, Outcome, WorkPackage } from "./contracts";
import type { MaterialProgressEvaluation } from "./evaluator";

export interface LearningCompilation {
  candidate?: LearningCandidate;
  accepted: boolean;
  reasons: string[];
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
const defaultFailureQuestion = "What must change so this failure becomes less likely to recur?";

export function compileLearningCandidate(
  pkg: WorkPackage,
  outcome: Outcome,
  evaluation: MaterialProgressEvaluation,
): LearningCompilation {
  const expected = outcome.expected.trim();
  const actual = outcome.actual.trim();
  const scope = `${pkg.projectId}/${pkg.section}`;

  /**
   * COMPOUND LEARNING — FD-2026-09-02.
   * Any non-accepted OR evaluator-corrective outcome is persisted as an OPEN,
   * scoped, non-authoritative failure-learning candidate. Root cause, changed
   * rule and regression control may remain UNKNOWN/PENDING, but the failure may
   * not disappear. Missing evidence remains missing; it is never fabricated.
   */
  if (outcome.status !== "ACCEPTED" || evaluation.decision !== "ACCEPT" || !evaluation.material) {
    const question = pkg.learningQuestion?.trim() || defaultFailureQuestion;
    const failureKind = outcome.status !== "ACCEPTED" ? outcome.status : "CORRECTION_REQUIRED";
    const candidate: LearningCandidate = {
      id: `lf-${normalize(pkg.id)}-${normalize(outcome.completedAt)}`,
      workPackageId: pkg.id,
      observation: actual || `${failureKind}: no actual-result detail supplied`,
      expectedVsActual: `EXPECTED: ${expected || "UNKNOWN"}\nACTUAL: ${actual || "UNKNOWN"}`,
      evidence: [...outcome.evidence],
      causeHypothesis: outcome.limitation?.trim() || "Root cause remains UNKNOWN and must be resolved before this failure is considered closed.",
      lesson: `FAILURE CHAIN OPEN. Learning question “${question}”. Current bounded observation: ${outcome.materialDelta || failureKind}.`,
      scope,
      confidence: "LOW",
      ruleProposal: "PENDING — resolve/evidence root cause, then persist the reusable changed rule/contract/work order; no autonomous gate weakening or Canon promotion.",
      regressionEval: outcome.evidence.length > 0
        ? `PENDING — convert this repeatable failure class into a regression test or machine control where technically possible; otherwise record an explicit non-automatable reason before closure.`
        : `PENDING — inspectable failure evidence is missing; capture evidence before retry/closure, then add the regression/control or explicit non-automatable reason.`,
      nextTest: `Reproduce or falsify the failure cause, apply the bounded correction, and rerun the same acceptance contract before closure for ${scope}.`,
      status: "CANDIDATE",
      createdAt: outcome.completedAt,
    };
    return {
      accepted: true,
      candidate,
      reasons: [
        "non-accepted/corrective outcome preserved as failure-learning candidate",
        "root cause may remain UNKNOWN but may not disappear",
        "changed rule/regression control remain PENDING until evidenced",
        "promotion remains governed and non-authoritative",
      ],
    };
  }

  const question = pkg.learningQuestion?.trim();
  if (!question) return { accepted: false, reasons: ["learning question required"] };

  if (expected.length < 8 || actual.length < 8 || expected === actual) {
    return { accepted: false, reasons: ["non-trivial expected-vs-actual comparison required"] };
  }

  if (outcome.evidence.length === 0) {
    return { accepted: false, reasons: ["evidence required"] };
  }

  const candidate: LearningCandidate = {
    id: `lc-${normalize(pkg.id)}-${normalize(outcome.completedAt)}`,
    workPackageId: pkg.id,
    observation: actual,
    expectedVsActual: `EXPECTED: ${expected}\nACTUAL: ${actual}`,
    evidence: [...outcome.evidence],
    causeHypothesis: outcome.limitation?.trim() || "Cause remains UNKNOWN pending a dedicated comparison test.",
    lesson: `Candidate answer to “${question}”: ${outcome.materialDelta}`,
    scope,
    confidence: evaluation.score >= 9 && outcome.evidence.length >= 2 ? "MEDIUM" : "LOW",
    regressionEval: `Repeat the same evidence contract before widening beyond ${scope}.`,
    nextTest: `Test whether the observed delta repeats in a second comparable case for ${scope}.`,
    status: "CANDIDATE",
    createdAt: outcome.completedAt,
  };

  return {
    accepted: true,
    candidate,
    reasons: [
      "material outcome accepted",
      "explicit learning question present",
      "expected-vs-actual evidence present",
      "candidate remains non-authoritative",
    ],
  };
}
