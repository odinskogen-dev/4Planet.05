export interface LearningEvalJudgeInput {
  expectedDecision: string;
  actualDecision: string;
  rationale: string;
  evidenceNeeded: string[];
  requiredSignals: string[];
  forbiddenSignals: string[];
  selectedLearningIds: string[];
  appliedLearningIds: string[];
}

export interface LearningEvalJudgement {
  passed: boolean;
  decisionPass: boolean;
  missingSignals: string[];
  forbiddenHits: string[];
  learningReceiptPass: boolean;
  evidence: string[];
}

function normaliseSignal(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function signalPresent(haystack: string, signal: string): boolean {
  const normalisedHaystack = normaliseSignal(haystack);
  return signal
    .split("|")
    .map((part) => normaliseSignal(part))
    .filter(Boolean)
    .some((part) => normalisedHaystack.includes(part));
}

/**
 * Independent deterministic Judge for internal learning evals.
 * Hidden expectations are never included in the Maker prompt.
 */
export function judgeLearningEval(input: LearningEvalJudgeInput): LearningEvalJudgement {
  const combined = [
    input.actualDecision,
    input.rationale,
    ...input.evidenceNeeded,
  ].join("\n").toLowerCase();
  const missingSignals = input.requiredSignals.filter((signal) => !signalPresent(combined, signal));
  const forbiddenHits = input.forbiddenSignals.filter((signal) => signalPresent(combined, signal));
  const decisionPass = input.actualDecision.trim().toLowerCase() === input.expectedDecision.trim().toLowerCase();
  const applied = new Set(input.appliedLearningIds);
  const learningReceiptPass = input.selectedLearningIds.every((id) => applied.has(id));
  const passed = decisionPass && missingSignals.length === 0 && forbiddenHits.length === 0 && learningReceiptPass;

  return {
    passed,
    decisionPass,
    missingSignals,
    forbiddenHits,
    learningReceiptPass,
    evidence: [
      `decision-match ${decisionPass ? "PASS" : "FAIL"}`,
      ...input.requiredSignals.map((signal) => `required-signal ${signal}=${signalPresent(combined, signal) ? "PASS" : "FAIL"}`),
      ...input.forbiddenSignals.map((signal) => `forbidden-signal ${signal}=${signalPresent(combined, signal) ? "FAIL" : "PASS"}`),
      `selected-learning ${input.selectedLearningIds.join(",") || "NONE"}`,
      `applied-learning ${input.appliedLearningIds.join(",") || "NONE"}`,
      `learning-receipt ${learningReceiptPass ? "PASS" : "FAIL"}`,
    ],
  };
}
