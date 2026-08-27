export interface FactoryActivationEvidence {
  shadowCiPassed: boolean;
  convergencePassed: boolean;
  brainProjectionReadOnly: boolean;
  sectionAdaptersBounded: boolean;
  evaluatorMaterialGateEnabled: boolean;
  learningCompilerEnabled: boolean;
  deterministicSimulationPassed: boolean;
  shadowComparisonPassed: boolean;
  noProductionDeploy: boolean;
  testKingBaseCurrent: boolean;
  exactFactorySha?: string;
  currentTestKingSha?: string;
  evidencedAt?: string;
}

export interface FactoryActivationGate {
  ready: boolean;
  missing: string[];
  evidence: FactoryActivationEvidence;
}

const REQUIRED: Array<[keyof FactoryActivationEvidence, string]> = [
  ["shadowCiPassed", "SHADOW_CI_PASS"],
  ["convergencePassed", "CONVERGENCE_PASS"],
  ["brainProjectionReadOnly", "READ_ONLY_BRAIN_PROJECTION"],
  ["sectionAdaptersBounded", "BOUNDED_SECTION_ADAPTERS"],
  ["evaluatorMaterialGateEnabled", "MATERIAL_PROGRESS_EVALUATOR"],
  ["learningCompilerEnabled", "LEARNING_COMPILER"],
  ["deterministicSimulationPassed", "DETERMINISTIC_SIMULATION_PASS"],
  ["shadowComparisonPassed", "SHADOW_COMPARISON_PASS"],
  ["noProductionDeploy", "NO_PRODUCTION_DEPLOY"],
  ["testKingBaseCurrent", "CURRENT_TEST_KING_BASE"],
];

/**
 * Fail-closed activation boundary. This does not grant authority or activate
 * anything; it only answers whether the explicit V01 preconditions are all
 * evidenced. Founder/BRAIN release authority remains external to the Factory.
 *
 * Factory activation also requires evidence that the shadow runtime has been
 * reconciled against the CURRENT TEST KING integration line. A green shadow
 * run on a stale product base is not activation evidence.
 */
export function evaluateFactoryActivation(evidence: FactoryActivationEvidence): FactoryActivationGate {
  const missing = REQUIRED
    .filter(([key]) => evidence[key] !== true)
    .map(([, label]) => label);

  if (!evidence.exactFactorySha?.trim()) missing.push("EXACT_FACTORY_SHA");
  if (!evidence.currentTestKingSha?.trim()) missing.push("CURRENT_TEST_KING_SHA");
  if (!evidence.evidencedAt?.trim()) missing.push("EVIDENCE_TIMESTAMP");

  return Object.freeze({
    ready: missing.length === 0,
    missing,
    evidence: Object.freeze({ ...evidence }),
  });
}
