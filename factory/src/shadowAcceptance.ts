import type { ShadowBatchComparison } from "./shadowComparison";

export interface ShadowAcceptancePolicy {
  minimumRuns: number;
  minimumPrecision: number;
  minimumRecall: number;
  requireNoEmptyReferenceRuns: boolean;
}

export interface ShadowAcceptanceResult {
  mode: "SHADOW_ACCEPTANCE";
  readOnly: true;
  ready: boolean;
  runCount: number;
  averagePrecision: number;
  averageRecall: number;
  exactMatchRate: number;
  emptyReferenceRuns: number;
  missing: string[];
  policy: ShadowAcceptancePolicy;
}

export const DEFAULT_SHADOW_ACCEPTANCE_POLICY: ShadowAcceptancePolicy = Object.freeze({
  minimumRuns: 3,
  minimumPrecision: 0.8,
  minimumRecall: 0.8,
  requireNoEmptyReferenceRuns: true,
});

const mean = (values: number[]) => values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * Read-only, deterministic gate for deciding whether Factory shadow selection
 * is consistently close enough to the current ChatGPT Symphony Conductor to be
 * eligible for a later activation review. This does not activate Factory,
 * mutate BRAIN, dispatch work, or grant release authority.
 */
export function evaluateShadowAcceptance(
  comparisons: ShadowBatchComparison[],
  policy: ShadowAcceptancePolicy = DEFAULT_SHADOW_ACCEPTANCE_POLICY,
): ShadowAcceptanceResult {
  const valid = comparisons.filter((comparison) => comparison?.mode === "SHADOW_COMPARISON" && comparison.readOnly === true);
  const runCount = valid.length;
  const averagePrecision = mean(valid.map((comparison) => comparison.precision));
  const averageRecall = mean(valid.map((comparison) => comparison.recall));
  const exactMatchRate = runCount === 0 ? 0 : valid.filter((comparison) => comparison.exactMatch).length / runCount;
  const emptyReferenceRuns = valid.filter((comparison) => comparison.referencePackageIds.length === 0).length;
  const missing: string[] = [];

  if (runCount < policy.minimumRuns) missing.push(`MINIMUM_SHADOW_RUNS:${policy.minimumRuns}`);
  if (averagePrecision < policy.minimumPrecision) missing.push(`MINIMUM_PRECISION:${policy.minimumPrecision}`);
  if (averageRecall < policy.minimumRecall) missing.push(`MINIMUM_RECALL:${policy.minimumRecall}`);
  if (policy.requireNoEmptyReferenceRuns && emptyReferenceRuns > 0) missing.push("NON_EMPTY_REFERENCE_BATCHES");

  return Object.freeze({
    mode: "SHADOW_ACCEPTANCE" as const,
    readOnly: true as const,
    ready: missing.length === 0,
    runCount,
    averagePrecision,
    averageRecall,
    exactMatchRate,
    emptyReferenceRuns,
    missing,
    policy: Object.freeze({ ...policy }),
  });
}
