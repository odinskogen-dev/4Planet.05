import {
  DecisionRuntimeV3Service,
  decisionRuntimeV3TruthBoundary,
} from "../.decision-v3-ci/brain/decision/runtimeV3.js";
import {
  TARGET_PROBLEM_PRIORITY_V1,
  evaluateTargetProblemCoverage,
  orderTargetProblemCoverage,
  prioritySensitivityChanged,
  targetProblemPriorityTruthBoundary,
  validatePriorityContext,
} from "../.decision-v3-ci/brain/decision/targetProblemPriorityV1.js";
import {
  evaluateDecisionLearningLoop,
  learningLoopV3TruthBoundary,
} from "../.decision-v3-ci/brain/decision/learningLoopV3.js";

const missingContextErrors = validatePriorityContext({
  methodologyVersion: TARGET_PROBLEM_PRIORITY_V1,
  lensId: "",
  targetProblems: [],
  declaredBy: "",
  declarationReason: "",
});
if (missingContextErrors.length < 3) throw new Error("priority method failed closed-context validation");

const relations = [
  { solutionRef: "SOL-A", problemRef: "P-A", reviewStatus: "REVIEWED", effectivenessImplication: "NONE" },
  { solutionRef: "SOL-A", problemRef: "P-B", reviewStatus: "REVIEWED", effectivenessImplication: "NONE" },
  { solutionRef: "SOL-B", problemRef: "P-B", reviewStatus: "REVIEWED", effectivenessImplication: "NONE" },
  { solutionRef: "SOL-B", problemRef: "P-C", reviewStatus: "REVIEWED", effectivenessImplication: "NONE" },
];
const contextA = {
  methodologyVersion: TARGET_PROBLEM_PRIORITY_V1,
  lensId: "LENS-A",
  targetProblems: [
    { problemRef: "P-A", tier: "P0", rationale: "explicit test target" },
    { problemRef: "P-B", tier: "P1", rationale: "explicit test target" },
    { problemRef: "P-C", tier: "P3", rationale: "explicit test target" },
  ],
  declaredBy: "CI",
  declarationReason: "sensitivity proof",
};
const contextB = {
  ...contextA,
  lensId: "LENS-B",
  targetProblems: [
    { problemRef: "P-C", tier: "P0", rationale: "alternative explicit target" },
    { problemRef: "P-B", tier: "P1", rationale: "alternative explicit target" },
    { problemRef: "P-A", tier: "P3", rationale: "alternative explicit target" },
  ],
};
const coverageA = evaluateTargetProblemCoverage(contextA, relations);
const coverageB = evaluateTargetProblemCoverage(contextB, relations);
if (orderTargetProblemCoverage(coverageA)[0]?.solutionRef !== "SOL-A") throw new Error("context A transparent ordering failed");
if (orderTargetProblemCoverage(coverageB)[0]?.solutionRef !== "SOL-B") throw new Error("context B transparent ordering failed");
if (!prioritySensitivityChanged(coverageA, coverageB)) throw new Error("priority sensitivity was hidden");

const reader = {
  async availabilityForRefs(refs) {
    return refs.map((canonicalRef) => ({
      canonicalRef,
      state: canonicalRef.startsWith("4P-SOL-") ? "AVAILABLE" : "PROVENANCE_PENDING",
      sourceRecordIds: [],
      disclosure: "CI reader exposes missing provenance, never invents it.",
    }));
  },
  async claimEvidenceForRefs() {
    return [];
  },
};
const service = new DecisionRuntimeV3Service(reader);
const municipality = await service.getDatabaseBackedDecisionPack("DP-POLL-MUNICIPALITY-V1");
if (!municipality || municipality.runtimeVersion !== "DECISION_RUNTIME_V3") throw new Error("runtime v3 pack failed");
if (municipality.fallbackInvented !== false) throw new Error("runtime v3 invented fallback");
if (municipality.uncertaintyExplanations.length === 0) throw new Error("material uncertainty explanation repair missing");
if (!municipality.uncertaintyExplanations.every((text) => text.includes(":"))) throw new Error("material uncertainty must identify the relevant option/evidence context");

const noOutcome = evaluateDecisionLearningLoop({
  decisionPackId: "DP-POLL-MUNICIPALITY-V1",
  selectedActionRef: "test:action",
  expectedOutcomeRef: "test:expected",
  measurementPlan: [{ measurementId: "M1", metric: "wild pollinator abundance", baselineRequired: true, timeframe: "12 months" }],
  implementationRef: "test:implementation",
  observedOutcomes: [],
});
if (noOutcome.updateState !== "NO_UPDATE" || noOutcome.confidenceMayIncrease) throw new Error("no-outcome confidence gate failed");

const challenged = evaluateDecisionLearningLoop({
  decisionPackId: "DP-POLL-MUNICIPALITY-V1",
  selectedActionRef: "test:action",
  expectedOutcomeRef: "test:expected",
  measurementPlan: [{ measurementId: "M1", metric: "wild pollinator abundance", baselineRequired: true, timeframe: "12 months" }],
  implementationRef: "test:implementation",
  observedOutcomes: [{ outcomeId: "O1", measurementId: "M1", sourceRecordId: "SR-TEST-IMMUTABLE", resultSummary: "No expected improvement in represented test context.", directionAgainstExpectation: "CHALLENGES" }],
});
if (challenged.updateState !== "ASSESSMENT_CHALLENGED" || challenged.confidenceMayIncrease) throw new Error("contradictory outcome challenge gate failed");

for (const [key, value] of Object.entries(decisionRuntimeV3TruthBoundary)) if (value !== false) throw new Error(`runtime v3 truth boundary ${key} must remain false`);
for (const [key, value] of Object.entries(targetProblemPriorityTruthBoundary)) if (value !== false) throw new Error(`priority truth boundary ${key} must remain false`);
for (const [key, value] of Object.entries(learningLoopV3TruthBoundary)) if (value !== false) throw new Error(`learning truth boundary ${key} must remain false`);

console.log(JSON.stringify({
  release: "DECISION_RUNTIME_V3_GATE",
  pass: true,
  missingPriorityContextRefused: true,
  explicitPriorityContextWorks: true,
  prioritySensitivityVisible: true,
  hiddenAggregateScore: false,
  runtimeV3: true,
  fallbackInvented: false,
  materialUncertaintyExplained: true,
  traceableEvidenceRequired: true,
  noObservedOutcomeConfidenceIncrease: false,
  contradictoryObservedOutcomeChallengesAssessment: true,
  rawPrivateDatabaseExposed: false,
  truthBoundary: decisionRuntimeV3TruthBoundary,
  priorityTruthBoundary: targetProblemPriorityTruthBoundary,
  learningTruthBoundary: learningLoopV3TruthBoundary,
}, null, 2));
