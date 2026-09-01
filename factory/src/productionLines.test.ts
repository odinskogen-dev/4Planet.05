import test from "node:test";
import assert from "node:assert/strict";
import type { ProjectProjection } from "./contracts";
import {
  compileProductionLinePackages,
  evaluateCompounding,
  getProductionLineTemplate,
  type ProductionLineIntake,
  type ProductionLineMetric,
} from "./productionLines";

const project: ProjectProjection = {
  id: "EAR-SPECIES-01",
  name: "SPECIES",
  northStar: "Living Planet Intelligence",
  goal: "Prove a reusable Species/Journey production method",
  current: "Jaguar and Orca exist as current product evidence",
  gold: "Reference plus two structurally different transfers compound",
  gap: "Production method and transfer economics must be machine-verifiable",
  priority: "P0",
  authorityRefs: ["Founder 2026-09-01 First-Plank Production Lines"],
};

const speciesInputs = [
  "identity",
  "taxonomy",
  "geography",
  "habitat",
  "observations",
  "ecological_role",
  "relationships",
  "pressures",
  "conservation_state",
  "credible_research",
  "media_rights",
  "uncertainty",
  "provenance",
];

function speciesIntake(role: ProductionLineIntake["role"] = "TRANSFER_02"): ProductionLineIntake {
  return {
    lineId: "SPECIES_JOURNEY",
    instanceId: role === "REFERENCE" ? "jaguar" : role === "TRANSFER_01" ? "orca" : "acropora",
    role,
    availableInputs: speciesInputs,
    sourceRefs: ["BRAIN:EAR-SPECIES-01", "TEST-KING:SPECIES"],
    writeScopesBySection: {
      RESEARCH_DATA: ["src/data/species"],
      PRODUCT_DESIGN: ["src/features/species"],
      CODE_QA: ["tests/species"],
      USER_DISTRIBUTION: ["public/analytics/species"],
      LEARNING: ["factory/production-lines/species"],
    },
  };
}

test("Species/Journey line compiles a real staged transfer rather than a cloned page", () => {
  const result = compileProductionLinePackages(project, "P0", "2026-09-01T09:00:00Z", speciesIntake());
  assert.equal(result.template.referenceSet[0]?.instanceId, "jaguar");
  assert.equal(result.template.referenceSet[1]?.instanceId, "orca");
  assert.equal(result.template.referenceSet[2]?.instanceId, "acropora");
  assert.equal(result.missingInputs.length, 0);
  assert.equal(result.packages.length, 6);
  assert.equal(result.packages[0]?.status, "READY");
  assert.equal(result.packages[1]?.status, "BLOCKED");
  assert.equal(result.packages[2]?.productionLine?.stage, "EXPERIENCE");
  assert.match(result.packages[2]?.definitionOfDone.join(" ") ?? "", /not a Jaguar clone/i);
});

test("Production line fails closed on incomplete source input", () => {
  const intake = speciesIntake();
  intake.availableInputs = speciesInputs.filter((field) => field !== "media_rights" && field !== "uncertainty");
  const result = compileProductionLinePackages(project, "P0", "2026-09-01T09:00:00Z", intake);
  assert.deepEqual(result.missingInputs.sort(), ["media_rights", "uncertainty"]);
  assert.equal(result.packages[0]?.status, "BLOCKED");
});

test("Learning can strengthen the next transfer only after evidence from two instances", () => {
  const intake = speciesIntake();
  intake.validatedRules = [
    {
      id: "species-mobile-single-authority-01",
      lineId: "SPECIES_JOURNEY",
      stageId: "EXPERIENCE",
      confidence: "HIGH",
      evidenceInstanceIds: ["jaguar", "orca"],
      authorityRef: "BRAIN:learning/species-mobile-01",
      appendDefinitionOfDone: ["Mobile keeps one dominant narrative authority at a time"],
      appendRequiredEvidence: ["390 and 430 px proof with no stacked persistent narrative panels"],
    },
  ];
  const result = compileProductionLinePackages(project, "P0", "2026-09-01T09:00:00Z", intake);
  const experience = result.packages.find((pkg) => pkg.productionLine?.stage === "EXPERIENCE");
  assert.ok(experience?.definitionOfDone.includes("Mobile keeps one dominant narrative authority at a time"));
  assert.deepEqual(result.appliedRuleIds, ["species-mobile-single-authority-01"]);
});

test("One-instance anecdotes cannot silently become production rules", () => {
  const intake = speciesIntake();
  intake.validatedRules = [
    {
      id: "weak-rule",
      lineId: "SPECIES_JOURNEY",
      stageId: "QA",
      confidence: "MEDIUM",
      evidenceInstanceIds: ["jaguar"],
      authorityRef: "BRAIN:learning/weak",
      appendDefinitionOfDone: ["New gate"],
      appendRequiredEvidence: [],
    },
  ];
  assert.throws(
    () => compileProductionLinePackages(project, "P0", "2026-09-01T09:00:00Z", intake),
    /at least two distinct instances/,
  );
});

test("Ecosystem and Story are operative lines; Actor/Solution/Choice/Capital remain NEXT", () => {
  assert.equal(getProductionLineTemplate("ECOSYSTEM_PLACE").referenceSet[0]?.instanceId, "bay-of-biscay");
  assert.equal(getProductionLineTemplate("STORY").id, "STORY");
  assert.throws(() => getProductionLineTemplate("ACTOR"), /NEXT production contract/);
  assert.throws(() => getProductionLineTemplate("CAPITAL"), /NEXT production contract/);
});

function metric(overrides: Partial<ProductionLineMetric> = {}): ProductionLineMetric {
  return {
    lineId: "SPECIES_JOURNEY",
    instanceId: "jaguar",
    role: "REFERENCE",
    totalMinutes: 100,
    aiMinutes: 80,
    founderMinutes: 20,
    correctionCount: 5,
    manualInterventions: 4,
    reusedComponents: 0,
    totalComponents: 10,
    evidenceCompleteness: 0.9,
    productQuality: 8,
    mobileQuality: 8,
    userComprehension: 8,
    accepted: true,
    evidenceRefs: ["proof:jaguar"],
    ...overrides,
  };
}

test("Compounding passes only when the next accepted instance is cheaper and at least as good", () => {
  const reference = metric();
  const transfer = metric({
    instanceId: "orca",
    role: "TRANSFER_01",
    totalMinutes: 60,
    aiMinutes: 52,
    founderMinutes: 8,
    reusedComponents: 7,
    totalComponents: 10,
    evidenceCompleteness: 0.95,
    productQuality: 8.2,
    mobileQuality: 8.1,
    userComprehension: 8.3,
    evidenceRefs: ["proof:orca"],
  });
  const result = evaluateCompounding(reference, transfer);
  assert.equal(result.pass, true);
  assert.equal(result.cheaper, true);
  assert.equal(result.fasterForFounder, true);
  assert.ok(result.reuseRate >= 0.7);
});

test("Faster output does not count as compounding when quality falls", () => {
  const reference = metric();
  const transfer = metric({
    instanceId: "acropora",
    role: "TRANSFER_02",
    totalMinutes: 45,
    founderMinutes: 5,
    reusedComponents: 8,
    totalComponents: 10,
    productQuality: 6,
    mobileQuality: 7,
    userComprehension: 6,
    evidenceRefs: ["proof:acropora"],
  });
  const result = evaluateCompounding(reference, transfer);
  assert.equal(result.cheaper, true);
  assert.equal(result.atLeastAsGood, false);
  assert.equal(result.pass, false);
});
