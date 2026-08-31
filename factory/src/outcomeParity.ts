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

function metrics(runs: ConductorRunEvidence[]) {
  const material: number[] = [];
  const evidence: number[] = [];
  const burdens: number[] = [];

  for (const run of runs) {
    const packages = new Map(run.packages.map((pkg) => [pkg.id, pkg] as const));
    for (const outcome of run.outcomes) {
      const pkg = packages.get(outcome.workPackageId);
      if (!pkg) continue;
      const evaluation = evaluateMaterialProgress(pkg, outcome);
      material.push(evaluation.material && evaluation.decision === "ACCEPT" ? 1 : 0);
      evidence.push(outcome.evidence.length > 0 ? 1 : 0);
      burdens.push(pkg.founderBurden);
    }
  }

  return {
    materialRate: mean(material),
    evidenceRate: mean(evidence),
    founderBurden: mean(burdens),
  };
}

/**
 * ACTIVE means "at least as good", not merely "chose similar tasks".
 * Factory must meet or beat the reference conductor on material accepted
 * outcomes and evidence coverage, while not increasing founder burden.
 */
export function evaluateOutcomeParity(
  reference: ConductorRunEvidence[],
  factory: ConductorRunEvidence[],
  minimumRuns = 3,
): OutcomeParityResult {
  const ref = metrics(reference);
  const fac = metrics(factory);
  const missing: string[] = [];

  if (reference.length < minimumRuns) missing.push(`REFERENCE_RUNS:${minimumRuns}`);
  if (factory.length < minimumRuns) missing.push(`FACTORY_RUNS:${minimumRuns}`);
  if (fac.materialRate + 1e-9 < ref.materialRate) missing.push("MATERIAL_OUTCOME_PARITY");
  if (fac.evidenceRate + 1e-9 < ref.evidenceRate) missing.push("EVIDENCE_QUALITY_PARITY");
  if (fac.founderBurden > ref.founderBurden + 1e-9) missing.push("FOUNDER_BURDEN_PARITY");

  return Object.freeze({
    ready: missing.length === 0,
    missing,
    referenceRuns: reference.length,
    factoryRuns: factory.length,
    referenceMaterialRate: ref.materialRate,
    factoryMaterialRate: fac.materialRate,
    referenceEvidenceRate: ref.evidenceRate,
    factoryEvidenceRate: fac.evidenceRate,
    referenceFounderBurden: ref.founderBurden,
    factoryFounderBurden: fac.founderBurden,
  });
}
