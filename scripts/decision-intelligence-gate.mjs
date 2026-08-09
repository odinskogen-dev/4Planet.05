import {
  BoundedDecisionIntelligenceService,
  DECISION_INTELLIGENCE_EVALUATION_V1,
  POLLINATION_DECISION_PACKS,
  buildLensSensitivityView,
  evaluateCaseBehaviour,
  projectDecisionPackForLivingSystems,
  validateDecisionPack,
} from "../.decision-ci/brain/decision/index.js";

const service = new BoundedDecisionIntelligenceService();
const packs = Object.values(POLLINATION_DECISION_PACKS);
const packResults = packs.map((pack) => ({ id: pack.id, ...validateDecisionPack(pack) }));
const invalidPacks = packResults.filter((result) => !result.valid);

const cases = [];
for (const testCase of DECISION_INTELLIGENCE_EVALUATION_V1) {
  const result = await service.resolveQuestion(testCase.question, testCase.actorType);
  cases.push({ id: testCase.id, runtimeStatus: result.status, result: evaluateCaseBehaviour(result, testCase) });
}
const failedCases = cases.filter((item) => item.result !== "PASS");

const farm = POLLINATION_DECISION_PACKS.FARM;
const livingProjection = projectDecisionPackForLivingSystems(farm);
if (livingProjection.sections.length < 7) throw new Error("Living Systems projection lost required progressive-disclosure sections");
if (livingProjection.deepMode.sourceRegistryOnlyCount < 1) throw new Error("Provenance boundary disappeared from Decision Pack projection");

const lens = buildLensSensitivityView(farm.options, "EVIDENCE_CONFIDENCE");
if ("score" in lens || "totalScore" in lens) throw new Error("LENS_SENSITIVITY_V1 must not expose aggregate scores");
if (!lens.disclosure.includes("does not calculate a universal score")) throw new Error("Lens disclosure missing universal-score boundary");

const best = await service.resolveQuestion("Which pollinator intervention is best overall?", "LAND_MANAGER");
if (best.status !== "INSUFFICIENT_EVIDENCE") throw new Error("Universal-best request was not refused");
const coral = await service.resolveQuestion("What should we do about coral bleaching?", "RESEARCHER");
if (coral.status !== "NOT_FOUND") throw new Error("Bounded v1 fabricated a non-pollination Decision Pack");

const report = {
  capability: "DECISION_INTELLIGENCE_FOR_A_LIVING_PLANET_V1",
  packs: packResults.map(({ id, valid, warnings }) => ({ id, valid, warningCount: warnings.length })),
  evaluation: { pass: cases.filter((x) => x.result === "PASS").length, total: cases.length, failed: failedCases },
  livingSystemsProjection: { sections: livingProjection.sections.length, registryOnlyProvenancePointers: livingProjection.deepMode.sourceRegistryOnlyCount },
  lens: { methodologyVersion: lens.methodologyVersion, comparisons: lens.comparisons.length, aggregateScore: false },
  truthBoundary: {
    universalBestRefusal: best.status === "INSUFFICIENT_EVIDENCE",
    nonPollinationBoundedRefusal: coral.status === "NOT_FOUND",
    sourceRegistryIsSourceRecord: false,
    decisionSupportIsAutomatedDecision: false,
  },
};
console.log(JSON.stringify(report, null, 2));
if (invalidPacks.length || failedCases.length) process.exit(1);
