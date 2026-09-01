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
   * COMPOUND LEARNING: non-accepted outcomes are never allowed to disappear as
   * mere execution history. They create a scoped, non-authoritative Learning
   * Candidate even when root cause is still UNKNOWN. Promotion still requires
   * evidence and the governed multi-instance rule; this only guarantees capture.
   */
  if (outcome.status !== "ACCEPTED") {
    const question = pkg.learningQuestion?.trim() || defaultFailureQuestion;
    const candidate: LearningCandidate = {
      id: `lf-${normalize(pkg.id)}-${normalize(outcome.completedAt)}`,
      workPackageId: pkg.id,
      observation: actual || `${outcome.status}: no actual-result detail supplied`,
      expectedVsActual: `EXPECTED: ${expected || "UNKNOWN"}\nACTUAL: ${actual || "UNKNOWN"}`,
      evidence: outcome.evidence.length > 0 ? [...outcome.evidence] : [`CONTROL GAP: ${outcome.status} outcome supplied no evidence`],
      causeHypothesis: outcome.limitation?.trim() || "Root cause remains UNKNOWN and must be resolved before this failure is considered closed.",
      lesson: `Failure-learning question “${question}”. Current bounded observation: ${outcome.materialDelta || outcome.status}.`,
      scope,
      confidence: "LOW",
      ruleProposal: "FAILURE→TEST gate: resolve root cause, persist the reusable changed rule/contract, add a regression test or machine control where possible, verify it, then write back.",
      regressionEval: `Do not treat ${pkg.id} as learned-from until the changed rule/control is exercised against this failure class.`,
      nextTest: `Reproduce or falsify the failure cause, then run the new regression/control before closure for ${scope}.`,
      status: "CANDIDATE",
      createdAt: outcome.completedAt,
    };
    return {
      accepted: true,
      candidate,
      reasons: [
        "non-accepted outcome preserved as failure-learning candidate",
        "root cause may remain UNKNOWN but may not disappear",
        "promotion remains governed and non-authoritative",
      ],
    };
  }

  if (evaluation.decision !== "ACCEPT" || !evaluation.material) {
    return { accepted: false, reasons: ["material acceptance required"] };
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
