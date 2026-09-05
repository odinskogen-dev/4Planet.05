import type { Outcome, WorkPackage } from "./contracts";
import { evaluateMaterialProgress } from "./evaluator";

export interface ConductorRunEvidence {
  runId: string;
  packages: WorkPackage[];
  outcomes: Outcome[];
}

export interface OutcomeParityResult {
  ready: boolean;
  missing: string[];
  referenceRuns: number;
  factoryRuns: number;
  referenceSettledRuns: number;
  factorySettledRuns: number;
  referenceMaterialRate: number;
  factoryMaterialRate: number;
  referenceEvidenceRate: number;
  factoryEvidenceRate: number;
  referenceFounderBurden: number;
  factoryFounderBurden: number;
}

function mean(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

interface RunMetrics {
  settledRuns: number;
  materialRate: number;
  evidenceRate: number;
  founderBurden: number;
}

/**
 * A parity run is only admissible when every selected package has exactly one
 * matching terminal outcome and there are no outcomes for packages outside the
 * run. Otherwise an empty or partially completed run could make quality rates
 * look artificially good and satisfy ACTIVE evidence without real execution.
 */
function metrics(runs: ConductorRunEvidence[]): RunMetrics {
  const material: number[] = [];
  const evidence: number[] = [];
  const burdens: number[] = [];
  let settledRuns = 0;

  for (const run of runs) {
    if (run.packages.length === 0) continue;

    const packages = new Map(run.packages.map((pkg) => [pkg.id, pkg] as const));
    if (packages.size !== run.packages.length) continue;

    const outcomes = new Map<string, Outcome>();
    let invalidOutcome = false;
    for (const outcome of run.outcomes) {
      if (!packages.has(outcome.workPackageId) || outcomes.has(outcome.workPackageId)) {
        invalidOutcome = true;
        break;
      }
      outcomes.set(outcome.workPackageId, outcome);
    }
    if (invalidOutcome || outcomes.size !== packages.size) continue;

    settledRuns += 1;
    for (const pkg of run.packages) {
      const outcome = outcomes.get(pkg.id);
      if (!outcome) continue;
      const evaluation = evaluateMaterialProgress(pkg, outcome);
      material.push(evaluation.material && evaluation.decision === "ACCEPT" ? 1 : 0);
      evidence.push(outcome.evidence.length > 0 ? 1 : 0);
      burdens.push(pkg.founderBurden);
    }
  }

  return {
    settledRuns,
    materialRate: mean(material),
    evidenceRate: mean(evidence),
    founderBurden: mean(burdens),
  };
}

/**
 * ACTIVE means "at least as good", not merely "chose similar tasks".
 * Factory must first prove enough fully-settled real runs, then meet or beat
 * the reference conductor on material accepted outcomes and evidence coverage,
 * while not increasing founder burden.
 */
export function evaluateOutcomeParity(
  reference: ConductorRunEvidence[],
  factory: ConductorRunEvidence[],
  minimumRuns = 3,
): OutcomeParityResult {
  const ref = metrics(reference);
  const fac = metrics(factory);
  const missing: string[] = [];

  if (ref.settledRuns < minimumRuns) missing.push(`REFERENCE_SETTLED_RUNS:${minimumRuns}`);
  if (fac.settledRuns < minimumRuns) missing.push(`FACTORY_SETTLED_RUNS:${minimumRuns}`);
  if (fac.materialRate + 1e-9 < ref.materialRate) missing.push("MATERIAL_OUTCOME_PARITY");
  if (fac.evidenceRate + 1e-9 < ref.evidenceRate) missing.push("EVIDENCE_QUALITY_PARITY");
  if (fac.founderBurden > ref.founderBurden + 1e-9) missing.push("FOUNDER_BURDEN_PARITY");

  return Object.freeze({
    ready: missing.length === 0,
    missing,
    referenceRuns: reference.length,
    factoryRuns: factory.length,
    referenceSettledRuns: ref.settledRuns,
    factorySettledRuns: fac.settledRuns,
    referenceMaterialRate: ref.materialRate,
    factoryMaterialRate: fac.materialRate,
    referenceEvidenceRate: ref.evidenceRate,
    factoryEvidenceRate: fac.evidenceRate,
    referenceFounderBurden: ref.founderBurden,
    factoryFounderBurden: fac.founderBurden,
  });
}
