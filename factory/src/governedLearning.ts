import type { Outcome, WorkPackage } from "./contracts";

export type LearningWritebackTarget = "FACTORY_RECIPE" | "FACTORY_TEST_GATE" | "BRAIN_REVIEW";

export interface GovernedLearningProposal {
  id: string;
  workPackageId: string;
  projectId: string;
  target: LearningWritebackTarget;
  observation: string;
  evidence: string[];
  proposedChange: string;
  distinctInstanceCount: number;
  safetyCorrection: boolean;
  weakensTruthOrSafety: boolean;
  promotesCanon: boolean;
  status: "PROPOSED" | "ELIGIBLE" | "FOUNDER_REVIEW" | "REJECTED";
}

export interface GovernedLearningDecision {
  accepted: boolean;
  destination: "FACTORY_INTERNAL" | "BRAIN_REVIEW" | "NONE";
  reasons: string[];
  proposal: GovernedLearningProposal;
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 56);

export function proposalFromRealOutcome(
  pkg: WorkPackage,
  outcome: Outcome,
  options: {
    target?: LearningWritebackTarget;
    proposedChange?: string;
    distinctInstanceCount?: number;
    safetyCorrection?: boolean;
  } = {},
): GovernedLearningProposal {
  const target = options.target ?? "FACTORY_RECIPE";
  return {
    id: `learning-writeback-${slug(pkg.id)}-${Date.now()}`,
    workPackageId: pkg.id,
    projectId: pkg.projectId,
    target,
    observation: `${outcome.status}: ${outcome.materialDelta}`,
    evidence: [...outcome.evidence],
    proposedChange: options.proposedChange ?? `Use the evidenced outcome from ${pkg.id} to strengthen future ${pkg.productionLine?.lineId ?? pkg.section} production checks; do not weaken existing gates.`,
    distinctInstanceCount: options.distinctInstanceCount ?? 1,
    safetyCorrection: options.safetyCorrection ?? false,
    weakensTruthOrSafety: false,
    promotesCanon: false,
    status: "PROPOSED",
  };
}

export function evaluateGovernedLearning(proposal: GovernedLearningProposal): GovernedLearningDecision {
  const reasons: string[] = [];
  if (!proposal.evidence.length) reasons.push("EVIDENCE_REQUIRED");
  if (!proposal.proposedChange.trim()) reasons.push("PROPOSED_CHANGE_REQUIRED");
  if (proposal.weakensTruthOrSafety) reasons.push("TRUTH_OR_SAFETY_WEAKENING_FORBIDDEN");
  if (proposal.promotesCanon) reasons.push("AUTONOMOUS_CANON_PROMOTION_FORBIDDEN");
  if (!proposal.safetyCorrection && proposal.distinctInstanceCount < 2) reasons.push("REPEATED_DISTINCT_INSTANCE_REQUIRED");

  if (reasons.length > 0) {
    const reviewOnly = reasons.length === 1 && reasons[0] === "REPEATED_DISTINCT_INSTANCE_REQUIRED";
    return {
      accepted: false,
      destination: reviewOnly ? "BRAIN_REVIEW" : "NONE",
      reasons,
      proposal: { ...proposal, status: reviewOnly ? "FOUNDER_REVIEW" : "REJECTED" },
    };
  }

  return {
    accepted: true,
    destination: proposal.target === "BRAIN_REVIEW" ? "BRAIN_REVIEW" : "FACTORY_INTERNAL",
    reasons: ["EVIDENCE_PRESENT", proposal.safetyCorrection ? "SAFETY_CORRECTION_EXCEPTION" : "TWO_DISTINCT_INSTANCES", "NO_GATE_WEAKENING", "NO_CANON_PROMOTION"],
    proposal: { ...proposal, status: proposal.target === "BRAIN_REVIEW" ? "FOUNDER_REVIEW" : "ELIGIBLE" },
  };
}

export function proveGovernedLearningContract(): { passed: boolean; evidence: string[] } {
  const base: GovernedLearningProposal = {
    id: "proof",
    workPackageId: "proof-a",
    projectId: "factory-proof",
    target: "FACTORY_TEST_GATE",
    observation: "Repeated mobile failure required a stronger gate.",
    evidence: ["instance-a", "instance-b"],
    proposedChange: "Strengthen mobile gate; never weaken truth or safety.",
    distinctInstanceCount: 2,
    safetyCorrection: false,
    weakensTruthOrSafety: false,
    promotesCanon: false,
    status: "PROPOSED",
  };
  const accepted = evaluateGovernedLearning(base);
  const weakening = evaluateGovernedLearning({ ...base, id: "proof-weak", weakensTruthOrSafety: true });
  const canon = evaluateGovernedLearning({ ...base, id: "proof-canon", promotesCanon: true });
  const anecdote = evaluateGovernedLearning({ ...base, id: "proof-one", distinctInstanceCount: 1 });
  const passed = accepted.accepted && !weakening.accepted && !canon.accepted && !anecdote.accepted;
  return {
    passed,
    evidence: [
      `accepted-repeat=${accepted.accepted}`,
      `weakening-blocked=${!weakening.accepted}`,
      `canon-blocked=${!canon.accepted}`,
      `single-anecdote-blocked=${!anecdote.accepted}`,
    ],
  };
}
