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

const SIM_NOW_ISO = "2026-09-01T07:00:00.000Z";
const SIM_NOW_MS = Date.parse(SIM_NOW_ISO);
const VALID_FACTORY_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const VALID_TEST_KING_SHA = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const OTHER_VALID_TEST_KING_SHA = "cccccccccccccccccccccccccccccccccccccccc";

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
  exactFactorySha: VALID_FACTORY_SHA,
  factoryTestKingBaseSha: VALID_TEST_KING_SHA,
  currentTestKingSha: VALID_TEST_KING_SHA,
  evidencedAt: SIM_NOW_ISO,
});

export function runActivationGateSimulation(): ActivationSimulationResult {
  const cases: ActivationSimulationCase[] = [
    { name: "complete-evidence-is-ready", evidence: { ...FULL_EVIDENCE }, expectedReady: true, expectedMissing: [] },
    {
      name: "missing-one-interface-convergence-does-not-block-bounded-active-boot",
      evidence: { ...FULL_EVIDENCE, convergencePassed: false },
      expectedReady: true,
      expectedMissing: [],
    },
    { name: "missing-zero-loss-fails-closed", evidence: { ...FULL_EVIDENCE, zeroLossLawEnabled: false }, expectedReady: false, expectedMissing: ["ZERO_LOSS_LAW"] },
    { name: "missing-outcome-parity-fails-closed", evidence: { ...FULL_EVIDENCE, outcomeQualityParityPassed: false }, expectedReady: false, expectedMissing: ["OUTCOME_QUALITY_PARITY"] },
    { name: "missing-founder-release-gate-fails-closed", evidence: { ...FULL_EVIDENCE, externalReleaseFounderGated: false }, expectedReady: false, expectedMissing: ["FOUNDER_RELEASE_GATE"] },
    { name: "missing-shadow-comparison-fails-closed", evidence: { ...FULL_EVIDENCE, shadowComparisonPassed: false }, expectedReady: false, expectedMissing: ["SHADOW_COMPARISON_PASS"] },
    { name: "stale-test-king-base-flag-fails-closed", evidence: { ...FULL_EVIDENCE, testKingBaseCurrent: false }, expectedReady: false, expectedMissing: ["CURRENT_TEST_KING_BASE"] },
    { name: "missing-factory-test-king-base-sha-fails-closed", evidence: { ...FULL_EVIDENCE, factoryTestKingBaseSha: "" }, expectedReady: false, expectedMissing: ["FACTORY_TEST_KING_BASE_SHA"] },
    { name: "invalid-factory-test-king-base-sha-fails-closed", evidence: { ...FULL_EVIDENCE, factoryTestKingBaseSha: "not-a-sha" }, expectedReady: false, expectedMissing: ["INVALID_FACTORY_TEST_KING_BASE_SHA"] },
    { name: "factory-test-king-base-mismatch-fails-closed", evidence: { ...FULL_EVIDENCE, factoryTestKingBaseSha: OTHER_VALID_TEST_KING_SHA }, expectedReady: false, expectedMissing: ["TEST_KING_BASE_SHA_MISMATCH"] },
    { name: "missing-current-test-king-sha-fails-closed", evidence: { ...FULL_EVIDENCE, currentTestKingSha: "" }, expectedReady: false, expectedMissing: ["CURRENT_TEST_KING_SHA"] },
    { name: "invalid-current-test-king-sha-fails-closed", evidence: { ...FULL_EVIDENCE, currentTestKingSha: "not-a-sha" }, expectedReady: false, expectedMissing: ["INVALID_TEST_KING_SHA"] },
    { name: "missing-exact-sha-fails-closed", evidence: { ...FULL_EVIDENCE, exactFactorySha: "" }, expectedReady: false, expectedMissing: ["EXACT_FACTORY_SHA"] },
    { name: "invalid-exact-sha-fails-closed", evidence: { ...FULL_EVIDENCE, exactFactorySha: "SIMULATED" }, expectedReady: false, expectedMissing: ["INVALID_FACTORY_SHA"] },
    { name: "stale-evidence-fails-closed", evidence: { ...FULL_EVIDENCE, evidencedAt: "2026-09-01T04:00:00.000Z" }, expectedReady: false, expectedMissing: ["STALE_ACTIVATION_EVIDENCE"] },
    { name: "future-evidence-fails-closed", evidence: { ...FULL_EVIDENCE, evidencedAt: "2026-09-01T07:06:00.000Z" }, expectedReady: false, expectedMissing: ["FUTURE_ACTIVATION_EVIDENCE"] },
    { name: "invalid-timestamp-fails-closed", evidence: { ...FULL_EVIDENCE, evidencedAt: "not-a-date" }, expectedReady: false, expectedMissing: ["INVALID_EVIDENCE_TIMESTAMP"] },
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
    const gate = evaluateFactoryActivation(testCase.evidence, SIM_NOW_MS);
    const expectedMissing = [...(testCase.expectedMissing ?? [])].sort();
    const actualMissing = [...gate.missing].sort();
    const passed = gate.ready === testCase.expectedReady && JSON.stringify(actualMissing) === JSON.stringify(expectedMissing);
    return Object.freeze({ name: testCase.name, ready: gate.ready, missing: gate.missing, passed });
  });

  return Object.freeze({ passed: results.every((result) => result.passed), cases: results });
}
