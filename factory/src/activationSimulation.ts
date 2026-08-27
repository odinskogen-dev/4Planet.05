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
  deterministicSimulationPassed: true,
  shadowComparisonPassed: true,
  noProductionDeploy: true,
  exactFactorySha: "SIMULATED_FACTORY_SHA",
  evidencedAt: "2026-08-27T00:00:00.000Z",
});

/**
 * Deterministic, side-effect-free activation-gate simulation.
 *
 * This never changes Factory mode and never grants release authority. It proves
 * that the fail-closed gate rejects incomplete evidence and only reports ready
 * when every explicit V01 prerequisite is present. Founder/BRAIN release remains
 * external even when this simulation passes.
 */
export function runActivationGateSimulation(): ActivationSimulationResult {
  const cases: ActivationSimulationCase[] = [
    {
      name: "complete-evidence-is-ready",
      evidence: { ...FULL_EVIDENCE },
      expectedReady: true,
      expectedMissing: [],
    },
    {
      name: "missing-shadow-comparison-fails-closed",
      evidence: { ...FULL_EVIDENCE, shadowComparisonPassed: false },
      expectedReady: false,
      expectedMissing: ["SHADOW_COMPARISON_PASS"],
    },
    {
      name: "missing-exact-sha-fails-closed",
      evidence: { ...FULL_EVIDENCE, exactFactorySha: "" },
      expectedReady: false,
      expectedMissing: ["EXACT_FACTORY_SHA"],
    },
    {
      name: "production-deploy-present-fails-closed",
      evidence: { ...FULL_EVIDENCE, noProductionDeploy: false },
      expectedReady: false,
      expectedMissing: ["NO_PRODUCTION_DEPLOY"],
    },
    {
      name: "missing-read-only-brain-boundary-fails-closed",
      evidence: { ...FULL_EVIDENCE, brainProjectionReadOnly: false },
      expectedReady: false,
      expectedMissing: ["READ_ONLY_BRAIN_PROJECTION"],
    },
  ];

  const results = cases.map((testCase) => {
    const gate = evaluateFactoryActivation(testCase.evidence);
    const expectedMissing = [...(testCase.expectedMissing ?? [])].sort();
    const actualMissing = [...gate.missing].sort();
    const passed = gate.ready === testCase.expectedReady
      && JSON.stringify(actualMissing) === JSON.stringify(expectedMissing);
    return Object.freeze({
      name: testCase.name,
      ready: gate.ready,
      missing: gate.missing,
      passed,
    });
  });

  return Object.freeze({
    passed: results.every((result) => result.passed),
    cases: results,
  });
}
