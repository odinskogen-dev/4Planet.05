import type { LearningCandidate, Outcome, WorkPackage } from "./contracts";
import type { MaterialProgressEvaluation } from "./evaluator";

export interface LearningCompilation {
  candidate?: LearningCandidate;
  accepted: boolean;
  reasons: string[];
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64);

export function compileLearningCandidate(
  pkg: WorkPackage,
  outcome: Outcome,
  evaluation: MaterialProgressEvaluation,
): LearningCompilation {
  if (evaluation.decision !== "ACCEPT" || !evaluation.material || outcome.status !== "ACCEPTED") {
    return { accepted: false, reasons: ["material acceptance required"] };
  }

  const question = pkg.learningQuestion?.trim();
  if (!question) return { accepted: false, reasons: ["learning question required"] };

  const expected = outcome.expected.trim();
  const actual = outcome.actual.trim();
  if (expected.length < 8 || actual.length < 8 || expected === actual) {
    return { accepted: false, reasons: ["non-trivial expected-vs-actual comparison required"] };
  }

  if (outcome.evidence.length === 0) {
    return { accepted: false, reasons: ["evidence required"] };
  }

  const scope = `${pkg.projectId}/${pkg.section}`;
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
