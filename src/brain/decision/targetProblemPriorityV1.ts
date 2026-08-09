export const TARGET_PROBLEM_PRIORITY_V1 = "TARGET_PROBLEM_PRIORITY_V1" as const;

export type TargetPriorityTier = "P0" | "P1" | "P2" | "P3";
export type RelationReviewStatus =
  | "UNREVIEWED"
  | "SOURCE_CHECKED"
  | "LITERATURE_CHECKED"
  | "REVIEWED"
  | "EXPERT_REVIEWED"
  | "REJECTED";

export interface TargetProblem {
  problemRef: string;
  tier: TargetPriorityTier;
  rationale: string;
}

export interface TargetProblemPriorityContext {
  methodologyVersion: typeof TARGET_PROBLEM_PRIORITY_V1;
  lensId: string;
  targetProblems: TargetProblem[];
  declaredBy: string;
  declarationReason: string;
}

export interface SolutionProblemRelationInput {
  solutionRef: string;
  problemRef: string;
  reviewStatus: RelationReviewStatus;
  relationConfidence?: string;
  effectivenessImplication: "NONE";
}

export interface TargetProblemCoverageResult {
  solutionRef: string;
  coveredProblems: string[];
  coveredByTier: Record<TargetPriorityTier, string[]>;
  reviewedRelationCount: number;
  relationCount: number;
  disclosure: string;
}

const tierOrder: TargetPriorityTier[] = ["P0", "P1", "P2", "P3"];
const eligibleReview = new Set<RelationReviewStatus>([
  "SOURCE_CHECKED",
  "LITERATURE_CHECKED",
  "REVIEWED",
  "EXPERT_REVIEWED",
]);

export function validatePriorityContext(context: TargetProblemPriorityContext): string[] {
  const errors: string[] = [];
  if (context.methodologyVersion !== TARGET_PROBLEM_PRIORITY_V1) errors.push("methodology version mismatch");
  if (!context.lensId.trim()) errors.push("explicit lensId required");
  if (!context.declaredBy.trim() || !context.declarationReason.trim()) errors.push("declaration provenance required");
  if (context.targetProblems.length === 0) errors.push("at least one explicit target problem is required");
  const refs = new Set<string>();
  for (const target of context.targetProblems) {
    if (!target.problemRef.trim() || !target.rationale.trim()) errors.push("every target problem needs ref + rationale");
    if (refs.has(target.problemRef)) errors.push(`duplicate target problem ${target.problemRef}`);
    refs.add(target.problemRef);
  }
  return errors;
}

/**
 * Transparent target-set coverage only. This is NOT an effectiveness score and NOT
 * a global 4PLANET ranking. Rejected/unreviewed relations cannot improve coverage.
 */
export function evaluateTargetProblemCoverage(
  context: TargetProblemPriorityContext,
  relations: SolutionProblemRelationInput[],
): TargetProblemCoverageResult[] {
  const errors = validatePriorityContext(context);
  if (errors.length) throw new Error(`TARGET_PROBLEM_PRIORITY_V1 invalid context: ${errors.join("; ")}`);
  const targetByRef = new Map(context.targetProblems.map((p) => [p.problemRef, p]));
  const bySolution = new Map<string, SolutionProblemRelationInput[]>();
  for (const relation of relations) {
    if (relation.effectivenessImplication !== "NONE") throw new Error("ADDRESSES relation cannot carry effectiveness implication");
    if (!targetByRef.has(relation.problemRef) || !eligibleReview.has(relation.reviewStatus)) continue;
    const rows = bySolution.get(relation.solutionRef) ?? [];
    rows.push(relation);
    bySolution.set(relation.solutionRef, rows);
  }
  return [...bySolution.entries()].map(([solutionRef, rows]) => {
    const unique = [...new Set(rows.map((r) => r.problemRef))];
    const coveredByTier = Object.fromEntries(tierOrder.map((tier) => [tier, []])) as Record<TargetPriorityTier, string[]>;
    for (const ref of unique) coveredByTier[targetByRef.get(ref)!.tier].push(ref);
    return {
      solutionRef,
      coveredProblems: unique.sort(),
      coveredByTier,
      reviewedRelationCount: rows.length,
      relationCount: unique.length,
      disclosure: "Lens-bound semantic target coverage only. Coverage does not imply effectiveness, recommendation or universal priority.",
    };
  });
}

/**
 * Deterministic presentation order with no hidden weights: P0 coverage, then P1,
 * P2, P3, then total distinct target coverage, then stable public_ref. Consumers
 * MUST display the full tuple and lens context; it is not an aggregate score.
 */
export function orderTargetProblemCoverage(rows: TargetProblemCoverageResult[]): TargetProblemCoverageResult[] {
  return [...rows].sort((a, b) => {
    for (const tier of tierOrder) {
      const delta = b.coveredByTier[tier].length - a.coveredByTier[tier].length;
      if (delta) return delta;
    }
    const breadth = b.relationCount - a.relationCount;
    if (breadth) return breadth;
    return a.solutionRef.localeCompare(b.solutionRef);
  });
}

export function prioritySensitivityChanged(
  a: TargetProblemCoverageResult[],
  b: TargetProblemCoverageResult[],
): boolean {
  return orderTargetProblemCoverage(a).map((x) => x.solutionRef).join("|") !==
    orderTargetProblemCoverage(b).map((x) => x.solutionRef).join("|");
}

export const targetProblemPriorityTruthBoundary = {
  globalPriorityScore: false,
  universalBestSolution: false,
  relevanceIsEffectiveness: false,
  hiddenWeights: false,
  missingLensMayBeInferred: false,
} as const;
