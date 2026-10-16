import type {
  LearnerCapabilitySnapshot,
  LearnerCapabilityStage,
  LearnerEvidenceKind,
  LearningCandidate,
  LearningKnowledgeLifecycle,
  RuntimeLearningContext,
  RuntimeLearningItem,
  WorkPackage,
} from "./contracts";

export interface LearnerEvidenceRecord {
  id: string;
  learnerId: string;
  capabilityId: string;
  kind: LearnerEvidenceKind;
  contextKey: string;
  outcome: "PASS" | "FAIL";
  evidenceRefs: string[];
  occurredAt: string;
  failureClass?: string;
}

export interface FailureCurriculumPlan {
  capabilityId: string;
  learningObjective: string;
  retrievalPrompt: string;
  practicePrompt: string;
  heldOutRequirement: string;
  transferRequirement: string;
  regressionRequirement: string;
  sourceLearningIds: string[];
}

const ACTIVE_LIFECYCLES = new Set<LearningKnowledgeLifecycle>(["KEEP", "MODIFY"]);
const DAY_MS = 24 * 60 * 60 * 1000;

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function occurred(record: LearnerEvidenceRecord): number {
  const parsed = Date.parse(record.occurredAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

function highestPassedStage(records: LearnerEvidenceRecord[]): LearnerCapabilityStage {
  const passed = records.filter((record) => record.outcome === "PASS");
  if (passed.some((record) => record.kind === "TRANSFER")) return "TRANSFER_PROVEN";
  if (passed.some((record) => record.kind === "REAL_WORK")) return "REAL_WORK_PASS";
  if (passed.some((record) => record.kind === "HELD_OUT")) return "FRESH_HELD_OUT_PASS";
  if (passed.some((record) => record.kind === "PRACTICE" || record.kind === "REGRESSION")) return "MASTERY_STANDARD_PASS";
  return records.length > 0 ? "PRACTISING" : "UNASSESSED";
}

function nextNeed(stage: LearnerCapabilityStage, failures: string[]): string {
  if (failures.length > 0) return `Resolve and re-test failure class: ${failures[0]}`;
  switch (stage) {
    case "UNASSESSED": return "Establish a baseline on one bounded real or diagnostic task.";
    case "PRACTISING": return "Reach the explicit mastery standard, then take a fresh held-out evaluation.";
    case "MASTERY_STANDARD_PASS": return "Run a fresh held-out evaluation not used during teaching or practice.";
    case "FRESH_HELD_OUT_PASS": return "Demonstrate the capability in real work with the same acceptance contract.";
    case "REAL_WORK_PASS": return "Transfer the learning to a materially different context before generalising.";
    case "TRANSFER_PROVEN": return "Retest after meaningful time/tool/product drift; do not assume permanent competence.";
    case "STALE": return "Revalidate the capability on a fresh task before relying on it.";
  }
}

export function deriveLearnerCapabilityState(
  learnerId: string,
  capabilityId: string,
  evidence: LearnerEvidenceRecord[],
  nowIso = new Date().toISOString(),
  staleAfterDays = 45,
): LearnerCapabilitySnapshot {
  const records = evidence
    .filter((record) => record.learnerId === learnerId && record.capabilityId === capabilityId)
    .sort((a, b) => occurred(a) - occurred(b));

  if (records.length === 0) {
    return {
      learnerId,
      capabilityId,
      stage: "UNASSESSED",
      evidenceRefs: [],
      knownFailureClasses: [],
      nextLearningNeed: nextNeed("UNASSESSED", []),
    };
  }

  const latest = records.at(-1)!;
  const lastPass = [...records].reverse().find((record) => record.outcome === "PASS");
  const failures = unique(
    records
      .filter((record) => record.outcome === "FAIL" && record.failureClass)
      .map((record) => record.failureClass!),
  );

  let stage = highestPassedStage(records);
  if (latest.outcome === "FAIL" && (!lastPass || occurred(latest) >= occurred(lastPass))) {
    stage = "PRACTISING";
  }

  const lastVerifiedAt = lastPass?.occurredAt;
  const now = Date.parse(nowIso);
  const verified = lastVerifiedAt ? Date.parse(lastVerifiedAt) : Number.NaN;
  if (
    lastVerifiedAt
    && Number.isFinite(now)
    && Number.isFinite(verified)
    && now - verified > staleAfterDays * DAY_MS
  ) {
    stage = "STALE";
  }

  return {
    learnerId,
    capabilityId,
    stage,
    evidenceRefs: unique(records.flatMap((record) => record.evidenceRefs)),
    knownFailureClasses: failures,
    lastVerifiedAt,
    nextLearningNeed: nextNeed(stage, latest.outcome === "FAIL" ? failures : []),
  };
}

function candidateActive(candidate: LearningCandidate, nowIso: string): boolean {
  if (candidate.status !== "PROMOTED") return false;
  const lifecycle = candidate.knowledgeLifecycle ?? "KEEP";
  if (!ACTIVE_LIFECYCLES.has(lifecycle)) return false;
  if (candidate.reviewAt) {
    const reviewAt = Date.parse(candidate.reviewAt);
    const now = Date.parse(nowIso);
    if (Number.isFinite(reviewAt) && Number.isFinite(now) && reviewAt <= now) return false;
  }
  return true;
}

function runtimeItem(candidate: LearningCandidate, capabilityId: string): RuntimeLearningItem {
  return {
    learningId: candidate.id,
    capabilityId,
    lesson: candidate.ruleProposal?.trim() || candidate.lesson,
    evidenceRefs: [...candidate.evidence],
    lifecycle: candidate.knowledgeLifecycle ?? "KEEP",
    regressionEval: candidate.regressionEval,
  };
}

/**
 * Runtime selection is intentionally narrow. Only governed PROMOTED learning in
 * KEEP/MODIFY state can enter task context. CANDIDATE, REJECTED, EXPIRED,
 * SUPERSEDE/EXPIRE/REJECT and review-due learning fail closed.
 */
export function selectRuntimeLearningContext(
  pkg: WorkPackage,
  learnerId: string,
  evidence: LearnerEvidenceRecord[],
  candidates: LearningCandidate[],
  nowIso = new Date().toISOString(),
): RuntimeLearningContext {
  const requiredCapabilities = unique(pkg.requiredCapabilities ?? []);
  const capabilityStates = requiredCapabilities.map((capabilityId) =>
    deriveLearnerCapabilityState(learnerId, capabilityId, evidence, nowIso)
  );

  const selectedLearning: RuntimeLearningItem[] = [];
  for (const capabilityId of requiredCapabilities) {
    const eligible = candidates
      .filter((candidate) =>
        candidateActive(candidate, nowIso)
        && (candidate.capabilityIds ?? []).includes(capabilityId)
      )
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    // Minimum relevant context: newest governed rule per capability.
    if (eligible[0]) selectedLearning.push(runtimeItem(eligible[0], capabilityId));
  }

  return {
    learnerId,
    requiredCapabilities,
    capabilityStates,
    selectedLearning,
    generatedAt: nowIso,
  };
}

export function compileFailureCurriculum(
  pkg: WorkPackage,
  candidate: LearningCandidate,
  state: LearnerCapabilitySnapshot,
): FailureCurriculumPlan | undefined {
  const capabilityId = (candidate.capabilityIds ?? pkg.requiredCapabilities ?? [])[0];
  if (!capabilityId) return undefined;
  if (!candidate.lesson.includes("FAILURE CHAIN OPEN") && candidate.status !== "REJECTED") return undefined;

  return {
    capabilityId,
    learningObjective: state.nextLearningNeed,
    retrievalPrompt: `Without rereading the answer, state the current rule or mechanism that should prevent recurrence of ${candidate.observation}.`,
    practicePrompt: `Apply the rule to a bounded variant of ${pkg.title}. Preserve the original acceptance, truth and authority gates.`,
    heldOutRequirement: "Judge a fresh case that was not used in teaching or practice. Same capability; different concrete inputs.",
    transferRequirement: "After held-out PASS, demonstrate the mechanism on a materially different real work package before generalising it.",
    regressionRequirement: candidate.regressionEval || "Create a deterministic regression/control where technically possible; otherwise record why it cannot be automated.",
    sourceLearningIds: [candidate.id],
  };
}
