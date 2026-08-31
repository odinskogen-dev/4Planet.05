export interface FactoryActivationEvidence {
  shadowCiPassed: boolean;
  convergencePassed: boolean;
  brainProjectionReadOnly: boolean;
  sectionAdaptersBounded: boolean;
  evaluatorMaterialGateEnabled: boolean;
  learningCompilerEnabled: boolean;
  zeroLossLawEnabled: boolean;
  deterministicSimulationPassed: boolean;
  shadowComparisonPassed: boolean;
  outcomeQualityParityPassed: boolean;
  noProductionDeploy: boolean;
  externalReleaseFounderGated: boolean;
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
  ["zeroLossLawEnabled", "ZERO_LOSS_LAW"],
  ["deterministicSimulationPassed", "DETERMINISTIC_SIMULATION_PASS"],
  ["shadowComparisonPassed", "SHADOW_COMPARISON_PASS"],
  ["outcomeQualityParityPassed", "OUTCOME_QUALITY_PARITY"],
  ["noProductionDeploy", "NO_PRODUCTION_DEPLOY"],
  ["externalReleaseFounderGated", "FOUNDER_RELEASE_GATE"],
  ["testKingBaseCurrent", "CURRENT_TEST_KING_BASE"],
];

/**
 * Fail-closed ACTIVE boundary.
 *
 * Selection overlap alone is not enough. Factory must prove that its actual
 * outcomes are at least as good as the reference conductor on materiality,
 * evidence quality and founder burden. ZERO LOSS is mandatory for material
 * product writes. External release remains Founder-gated even after internal
 * ACTIVE execution is allowed.
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
