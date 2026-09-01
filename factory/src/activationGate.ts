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

const SHA_40 = /^[0-9a-f]{40}$/i;
const MAX_EVIDENCE_AGE_MS = 2 * 60 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;

/**
 * Fail-closed GLOBAL ACTIVE boundary.
 *
 * Selection overlap alone is not enough. Factory must prove real execution
 * paths, durable round-trips, outcome quality, governed learning/writeback and
 * current TEST authority. A Pages preview is not a dedicated Agents runtime.
 * Evidence is short-lived and commit-addressed so a stale boolean bundle cannot
 * silently activate after TEST KING or Factory has moved.
 */
export function evaluateFactoryActivation(
  evidence: FactoryActivationEvidence,
  nowMs = Date.now(),
): FactoryActivationGate {
  const missing = REQUIRED
    .filter(([key]) => evidence[key] !== true)
    .map(([, label]) => label);

  const factorySha = evidence.exactFactorySha?.trim() ?? "";
  const testKingSha = evidence.currentTestKingSha?.trim() ?? "";
  const evidencedAt = evidence.evidencedAt?.trim() ?? "";

  if (!factorySha) missing.push("EXACT_FACTORY_SHA");
  else if (!SHA_40.test(factorySha)) missing.push("INVALID_FACTORY_SHA");

  if (!testKingSha) missing.push("CURRENT_TEST_KING_SHA");
  else if (!SHA_40.test(testKingSha)) missing.push("INVALID_TEST_KING_SHA");

  if (!evidencedAt) {
    missing.push("EVIDENCE_TIMESTAMP");
  } else {
    const evidenceMs = Date.parse(evidencedAt);
    if (!Number.isFinite(evidenceMs)) missing.push("INVALID_EVIDENCE_TIMESTAMP");
    else if (evidenceMs > nowMs + MAX_FUTURE_SKEW_MS) missing.push("FUTURE_ACTIVATION_EVIDENCE");
    else if (nowMs - evidenceMs > MAX_EVIDENCE_AGE_MS) missing.push("STALE_ACTIVATION_EVIDENCE");
  }

  return Object.freeze({
    ready: missing.length === 0,
    missing,
    evidence: Object.freeze({ ...evidence }),
  });
}
