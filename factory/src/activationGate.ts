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
  dedicatedRuntimeShadowDeployed: boolean;
  subAgentWorkflowRoundTripPassed: boolean;
  githubCodeAdapterProven: boolean;
  visualQaAdapterProven: boolean;
  researchDataAdapterProven: boolean;
  governedBrainWritebackProven: boolean;
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
  ["dedicatedRuntimeShadowDeployed", "DEDICATED_RUNTIME_SHADOW_DEPLOY"],
  ["subAgentWorkflowRoundTripPassed", "SUBAGENT_WORKFLOW_ROUNDTRIP"],
  ["githubCodeAdapterProven", "GITHUB_CODE_ADAPTER_PROOF"],
  ["visualQaAdapterProven", "VISUAL_QA_ADAPTER_PROOF"],
  ["researchDataAdapterProven", "RESEARCH_DATA_ADAPTER_PROOF"],
  ["governedBrainWritebackProven", "GOVERNED_BRAIN_WRITEBACK_PROOF"],
  ["noProductionDeploy", "NO_PRODUCTION_DEPLOY"],
  ["externalReleaseFounderGated", "FOUNDER_RELEASE_GATE"],
  ["testKingBaseCurrent", "CURRENT_TEST_KING_BASE"],
];

/**
 * Fail-closed GLOBAL ACTIVE boundary.
 *
 * Selection overlap alone is not enough. Factory must prove real execution
 * paths, durable round-trips, outcome quality, governed learning/writeback and
 * current TEST authority. A Pages preview is not a dedicated Agents runtime.
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
