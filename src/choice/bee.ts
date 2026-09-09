export const BEE_STAGES = [
  { id: "SCOUT", detail: "Find credible options and sources." },
  { id: "EVIDENCE", detail: "Separate facts, claims, contradictions and unknowns." },
  { id: "COMPARE", detail: "Test options against explicit criteria and personal constraints." },
  { id: "QUORUM", detail: "Conclude only when evidence coverage is sufficient." },
  { id: "LEARN", detail: "Record outcomes without rewriting the evidence that existed at decision time." },
] as const;

export type BeeStage = (typeof BEE_STAGES)[number]["id"];

export type BeeEvidenceClass =
  | "PRIMARY"
  | "INDEPENDENT"
  | "SELF_REPORTED"
  | "DERIVED"
  | "UNKNOWN";

export type BeeEvidenceDirection = "SUPPORT" | "STOP" | "NEUTRAL";

export type BeeCriterion = {
  id: string;
  label: string;
  hardConstraint?: boolean;
};

export type BeeOption = {
  id: string;
  label: string;
};

export type BeeEvidence = {
  id: string;
  optionId: string;
  criterionId: string;
  sourceId: string;
  /**
   * Sources that ultimately depend on the same underlying evidence must share
   * the same independence key. This prevents derivative articles, mirrors or
   * summaries from manufacturing "corroboration".
   */
  independenceKey: string;
  evidenceClass: BeeEvidenceClass;
  direction: BeeEvidenceDirection;
  publicSafe: boolean;
  note?: string;
};

export type BeeQuorumPolicy = {
  /** Share of criteria that need public-safe evidence before an option is ready. */
  minimumCriterionCoverage: number;
  /** Unique non-derived evidence families required across the option. */
  minimumIndependentEvidenceFamilies: number;
};

export type BeeCriterionAssessment = {
  criterionId: string;
  state: "SUPPORTED" | "CONTRADICTED" | "MIXED" | "UNKNOWN";
  evidenceIds: string[];
  independentEvidenceFamilies: number;
};

export type BeeOptionAssessment = {
  optionId: string;
  status: "READY" | "INSUFFICIENT_EVIDENCE" | "HARD_STOP";
  criterionCoverage: number;
  independentEvidenceFamilies: number;
  unknownCriteria: string[];
  hardStops: string[];
  criteria: BeeCriterionAssessment[];
};

export type BeeQuorumResult = {
  status: "QUORUM" | "NO_QUORUM";
  options: BeeOptionAssessment[];
  readyOptionIds: string[];
  limitations: string[];
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function independentFamilyCount(evidence: BeeEvidence[]) {
  return new Set(
    evidence
      .filter((item) => item.publicSafe && item.evidenceClass !== "DERIVED" && item.evidenceClass !== "UNKNOWN")
      .map((item) => item.independenceKey),
  ).size;
}

function assessCriterion(criterion: BeeCriterion, evidence: BeeEvidence[]): BeeCriterionAssessment {
  const publicEvidence = evidence.filter((item) => item.publicSafe);
  const supports = publicEvidence.some((item) => item.direction === "SUPPORT");
  const stops = publicEvidence.some((item) => item.direction === "STOP");

  let state: BeeCriterionAssessment["state"] = "UNKNOWN";
  if (supports && stops) state = "MIXED";
  else if (supports) state = "SUPPORTED";
  else if (stops) state = "CONTRADICTED";

  return {
    criterionId: criterion.id,
    state,
    evidenceIds: publicEvidence.map((item) => item.id),
    independentEvidenceFamilies: independentFamilyCount(publicEvidence),
  };
}

/**
 * BEE is an evidence-sufficiency gate, not a universal moral score.
 *
 * Category adapters (FOOD, HOME, CAR, MONEY, INVEST, S4PIENS Company Engine)
 * decide what criteria mean and how trade-offs should be presented. BEE only
 * protects the cross-product discipline: scout broadly, keep provenance,
 * preserve contradictions and UNKNOWN, respect hard stops, and require a
 * bounded quorum before a recommendation is eligible.
 */
export function evaluateBeeQuorum(
  options: BeeOption[],
  criteria: BeeCriterion[],
  evidence: BeeEvidence[],
  policy: BeeQuorumPolicy,
): BeeQuorumResult {
  const minimumCoverage = clamp01(policy.minimumCriterionCoverage);
  const minimumFamilies = Math.max(0, Math.floor(policy.minimumIndependentEvidenceFamilies));

  const assessments = options.map<BeeOptionAssessment>((option) => {
    const optionEvidence = evidence.filter((item) => item.optionId === option.id);
    const criterionAssessments = criteria.map((criterion) =>
      assessCriterion(
        criterion,
        optionEvidence.filter((item) => item.criterionId === criterion.id),
      ),
    );

    const covered = criterionAssessments.filter((item) => item.state !== "UNKNOWN").length;
    const criterionCoverage = criteria.length === 0 ? 0 : covered / criteria.length;
    const independentEvidenceFamilies = independentFamilyCount(optionEvidence);
    const unknownCriteria = criterionAssessments
      .filter((item) => item.state === "UNKNOWN")
      .map((item) => item.criterionId);
    const hardStops = criteria
      .filter((criterion) => criterion.hardConstraint)
      .filter((criterion) => {
        const assessment = criterionAssessments.find((item) => item.criterionId === criterion.id);
        return assessment?.state === "CONTRADICTED" || assessment?.state === "MIXED";
      })
      .map((criterion) => criterion.id);

    let status: BeeOptionAssessment["status"] = "READY";
    if (hardStops.length > 0) status = "HARD_STOP";
    else if (criterionCoverage < minimumCoverage || independentEvidenceFamilies < minimumFamilies) {
      status = "INSUFFICIENT_EVIDENCE";
    }

    return {
      optionId: option.id,
      status,
      criterionCoverage,
      independentEvidenceFamilies,
      unknownCriteria,
      hardStops,
      criteria: criterionAssessments,
    };
  });

  const readyOptionIds = assessments.filter((item) => item.status === "READY").map((item) => item.optionId);
  const limitations: string[] = [];
  if (readyOptionIds.length < 2) limitations.push("Fewer than two options have sufficient evidence for a bounded comparison.");
  if (assessments.some((item) => item.unknownCriteria.length > 0)) limitations.push("One or more criteria remain UNKNOWN.");
  if (assessments.some((item) => item.hardStops.length > 0)) limitations.push("One or more options trigger an explicit hard constraint.");

  return {
    status: readyOptionIds.length >= 2 ? "QUORUM" : "NO_QUORUM",
    options: assessments,
    readyOptionIds,
    limitations,
  };
}

export type BeeRecommendation<T> = {
  status: "RECOMMENDATION_ELIGIBLE" | "WITHHELD";
  value?: T;
  reason: string;
};

/**
 * Domain-specific ranking may only surface a recommendation after BEE quorum.
 * This makes "we do not know enough" a first-class product outcome.
 */
export function gateBeeRecommendation<T>(quorum: BeeQuorumResult, candidate: T): BeeRecommendation<T> {
  if (quorum.status !== "QUORUM") {
    return {
      status: "WITHHELD",
      reason: "Insufficient independent evidence for a bounded recommendation.",
    };
  }

  return {
    status: "RECOMMENDATION_ELIGIBLE",
    value: candidate,
    reason: "Evidence quorum reached. Recommendation remains conditional on the category-specific comparison logic.",
  };
}
