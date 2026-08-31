import { evaluateFactoryActivation, type FactoryActivationEvidence } from "./activationGate";

export interface ActivationSimulationCase {
  name: string;
  evidence: FactoryActivationEvidence;
  expectedReady: boolean;
  expectedMissing?: string[];
}

export interface ActivationSimulationResult {
  passed: boolean;
  cases: Array<{
    name: string;
    ready: boolean;
    missing: string[];
    passed: boolean;
  }>;
}

const FULL_EVIDENCE: FactoryActivationEvidence = Object.freeze({
  shadowCiPassed: true,
  convergencePassed: true,
  brainProjectionReadOnly: true,
  sectionAdaptersBounded: true,
  evaluatorMaterialGateEnabled: true,
  learningCompilerEnabled: true,
  zeroLossLawEnabled: true,
  deterministicSimulationPassed: true,
  shadowComparisonPassed: true,
  outcomeQualityParityPassed: true,
  dedicatedRuntimeShadowDeployed: true,
  subAgentWorkflowRoundTripPassed: true,
  githubCodeAdapterProven: true,
  visualQaAdapterProven: true,
  researchDataAdapterProven: true,
  governedBrainWritebackProven: true,
  noProductionDeploy: true,
  externalReleaseFounderGated: true,
  testKingBaseCurrent: true,
  exactFactorySha: "SIMULATED_FACTORY_SHA",
  currentTestKingSha: "SIMULATED_CURRENT_TEST_KING_SHA",
  evidencedAt: "2026-09-01T00:00:00.000Z",
});

export function runActivationGateSimulation(): ActivationSimulationResult {
  const cases: ActivationSimulationCase[] = [
    { name: "complete-evidence-is-ready", evidence: { ...FULL_EVIDENCE }, expectedReady: true, expectedMissing: [] },
    { name: "missing-zero-loss-fails-closed", evidence: { ...FULL_EVIDENCE, zeroLossLawEnabled: false }, expectedReady: false, expectedMissing: ["ZERO_LOSS_LAW"] },
    { name: "missing-outcome-parity-fails-closed", evidence: { ...FULL_EVIDENCE, outcomeQualityParityPassed: false }, expectedReady: false, expectedMissing: ["OUTCOME_QUALITY_PARITY"] },
    { name: "missing-founder-release-gate-fails-closed", evidence: { ...FULL_EVIDENCE, externalReleaseFounderGated: false }, expectedReady: false, expectedMissing: ["FOUNDER_RELEASE_GATE"] },
    { name: "missing-shadow-comparison-fails-closed", evidence: { ...FULL_EVIDENCE, shadowComparisonPassed: false }, expectedReady: false, expectedMissing: ["SHADOW_COMPARISON_PASS"] },
    { name: "stale-test-king-base-fails-closed", evidence: { ...FULL_EVIDENCE, testKingBaseCurrent: false }, expectedReady: false, expectedMissing: ["CURRENT_TEST_KING_BASE"] },
    { name: "missing-current-test-king-sha-fails-closed", evidence: { ...FULL_EVIDENCE, currentTestKingSha: "" }, expectedReady: false, expectedMissing: ["CURRENT_TEST_KING_SHA"] },
    { name: "missing-exact-sha-fails-closed", evidence: { ...FULL_EVIDENCE, exactFactorySha: "" }, expectedReady: false, expectedMissing: ["EXACT_FACTORY_SHA"] },
    { name: "production-deploy-present-fails-closed", evidence: { ...FULL_EVIDENCE, noProductionDeploy: false }, expectedReady: false, expectedMissing: ["NO_PRODUCTION_DEPLOY"] },
    { name: "missing-read-only-brain-boundary-fails-closed", evidence: { ...FULL_EVIDENCE, brainProjectionReadOnly: false }, expectedReady: false, expectedMissing: ["READ_ONLY_BRAIN_PROJECTION"] },
    { name: "pages-preview-is-not-runtime", evidence: { ...FULL_EVIDENCE, dedicatedRuntimeShadowDeployed: false }, expectedReady: false, expectedMissing: ["DEDICATED_RUNTIME_SHADOW_DEPLOY"] },
    { name: "missing-github-execution-fails-closed", evidence: { ...FULL_EVIDENCE, githubCodeAdapterProven: false }, expectedReady: false, expectedMissing: ["GITHUB_CODE_ADAPTER_PROOF"] },
    { name: "missing-visual-qa-fails-closed", evidence: { ...FULL_EVIDENCE, visualQaAdapterProven: false }, expectedReady: false, expectedMissing: ["VISUAL_QA_ADAPTER_PROOF"] },
    { name: "missing-research-adapter-fails-closed", evidence: { ...FULL_EVIDENCE, researchDataAdapterProven: false }, expectedReady: false, expectedMissing: ["RESEARCH_DATA_ADAPTER_PROOF"] },
    { name: "missing-governed-writeback-fails-closed", evidence: { ...FULL_EVIDENCE, governedBrainWritebackProven: false }, expectedReady: false, expectedMissing: ["GOVERNED_BRAIN_WRITEBACK_PROOF"] },
    { name: "missing-durable-roundtrip-fails-closed", evidence: { ...FULL_EVIDENCE, subAgentWorkflowRoundTripPassed: false }, expectedReady: false, expectedMissing: ["SUBAGENT_WORKFLOW_ROUNDTRIP"] },
  ];

  const results = cases.map((testCase) => {
    const gate = evaluateFactoryActivation(testCase.evidence);
    const expectedMissing = [...(testCase.expectedMissing ?? [])].sort();
    const actualMissing = [...gate.missing].sort();
    const passed = gate.ready === testCase.expectedReady && JSON.stringify(actualMissing) === JSON.stringify(expectedMissing);
    return Object.freeze({ name: testCase.name, ready: gate.ready, missing: gate.missing, passed });
  });

  return Object.freeze({ passed: results.every((result) => result.passed), cases: results });
}
