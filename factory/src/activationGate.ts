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
  exactFactorySha?: string;
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
];

/**
 * Fail-closed activation boundary. This does not grant authority or activate
 * anything; it only answers whether the explicit V01 preconditions are all
 * evidenced. Founder/BRAIN release authority remains external to the Factory.
 */
export function evaluateFactoryActivation(evidence: FactoryActivationEvidence): FactoryActivationGate {
  const missing = REQUIRED
    .filter(([key]) => evidence[key] !== true)
    .map(([, label]) => label);

  if (!evidence.exactFactorySha?.trim()) missing.push("EXACT_FACTORY_SHA");
  if (!evidence.evidencedAt?.trim()) missing.push("EVIDENCE_TIMESTAMP");

  return Object.freeze({
    ready: missing.length === 0,
    missing,
    evidence: Object.freeze({ ...evidence }),
  });
}
