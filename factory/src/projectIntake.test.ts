import test from "node:test";
import assert from "node:assert/strict";
import { compileApprovedProjectIntake } from "./projectIntake";

test("BUILD-approved idea compiles into one project and bounded queue", () => {
  const result = compileApprovedProjectIntake({
    approval: "BUILD_APPROVED",
    authorityRef: "FOUNDER_DECISION:test-build",
    approvedAt: "2026-09-01T00:00:00Z",
    projectId: "TEST-IDEA-01",
    name: "Test Idea",
    northStar: "Move verified value toward a living planet.",
    user: "A concrete human user.",
    goal: "Reach a reviewable proof.",
    current: "Approved concept only.",
    gold: "Reviewable evidence-backed prototype.",
    gap: "No implementation or proof yet.",
    priority: "P1",
    workstreams: [
      {
        section: "PRODUCT_DESIGN",
        title: "First product proof",
        gapClosed: "Create a reviewable first experience.",
        deliverables: ["Prototype"],
        writeScopes: ["public/test-idea/"],
        definitionOfDone: ["Prototype is directly reviewable"],
        requiredEvidence: ["before/after runtime screenshot"],
        learningQuestion: "Does the first interaction make the value obvious?",
      },
      {
        section: "RESEARCH_DATA",
        title: "Truth seam",
        gapClosed: "Ground the prototype in evidence.",
        deliverables: ["Source contract"],
        writeScopes: ["docs/research/test-idea/"],
        definitionOfDone: ["Every material claim has provenance"],
        requiredEvidence: ["source URL and provenance"],
        learningQuestion: "Which evidence is necessary for trust?",
      },
    ],
  });

  assert.equal(result.project.id, "TEST-IDEA-01");
  assert.equal(result.project.authorityRefs?.[0], "FOUNDER_DECISION:test-build");
  assert.equal(result.packages.length, 2);
  assert.deepEqual(result.packages.map((pkg) => pkg.status), ["READY", "READY"]);
  assert.equal(new Set(result.packages.map((pkg) => pkg.id)).size, 2);
  assert.equal(result.receipt.type, "FOUNDER_APPROVED_PROJECT_INTAKE");
});

test("Founder-approved new species request is recognised as the reusable Species production line", () => {
  const result = compileApprovedProjectIntake({
    approval: "BUILD_APPROVED",
    authorityRef: "FOUNDER_DECISION:first-plank-lines-2026-09-01",
    approvedAt: "2026-09-01T09:00:00Z",
    projectId: "EAR-SPECIES-ACROPORA-01",
    name: "Elkhorn Coral transfer",
    northStar: "Living Planet Intelligence",
    user: "A non-expert trying to understand a living organism and its ecosystem relationships.",
    goal: "Stress-test the reusable Species/Journey production method on a sessile colonial organism.",
    current: "Source envelope exists; universal species architecture exists.",
    gold: "Truthful, organism-specific transfer with Gold evidence and measured reuse.",
    gap: "Production-line sequence and transfer proof must be executed without cloning Jaguar.",
    priority: "P0",
    productionLine: {
      lineId: "SPECIES_JOURNEY",
      instanceId: "acropora",
      role: "TRANSFER_02",
      availableInputs: [
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
      ],
      sourceRefs: ["BRAIN:EAR-SPECIES-01", "TEST-KING:speciesSourceEnvelope/Acropora-palmata"],
      writeScopesBySection: {
        RESEARCH_DATA: ["src/data/species"],
        PRODUCT_DESIGN: ["src/pages/integrated/species"],
        CODE_QA: ["tests/species"],
        USER_DISTRIBUTION: ["public/analytics/species"],
        LEARNING: ["factory/production-lines/species"],
      },
    },
  });

  assert.equal(result.project.productionLine?.lineId, "SPECIES_JOURNEY");
  assert.equal(result.project.productionLine?.role, "TRANSFER_02");
  assert.equal(result.receipt.productionLine?.templateVersion, "01");
  assert.deepEqual(result.receipt.productionLine?.missingInputs, []);
  assert.equal(result.packages.length, 6);
  assert.equal(result.packages[0]?.productionLine?.stage, "SOURCE_VERIFY");
  assert.equal(result.packages[0]?.status, "READY");
  assert.equal(result.packages[1]?.status, "BLOCKED");
});

test("project intake forbids mixing bespoke workstreams and production-line authority", () => {
  assert.throws(() => compileApprovedProjectIntake({
    approval: "BUILD_APPROVED",
    authorityRef: "FOUNDER_DECISION:mixed",
    approvedAt: "2026-09-01T09:00:00Z",
    projectId: "MIXED-01",
    name: "Mixed",
    northStar: "Test",
    user: "Test",
    goal: "Test",
    current: "Test",
    gold: "Test",
    gap: "Test",
    priority: "P1",
    workstreams: [{
      section: "LEARNING",
      title: "Manual",
      gapClosed: "Manual",
      deliverables: ["Manual"],
      writeScopes: ["factory/"],
      definitionOfDone: ["Manual"],
      requiredEvidence: ["Manual"],
    }],
    productionLine: {
      lineId: "STORY",
      instanceId: "mixed",
      role: "TRANSFER_01",
      availableInputs: ["story_question", "audience", "entities", "source_refs", "claim_refs", "limitations", "rights_assets", "intelligence_origin"],
      sourceRefs: ["BRAIN:story"],
      writeScopesBySection: {},
    },
  }), /exactly one execution method/);
});

test("idea without explicit BUILD authority fails closed", () => {
  assert.throws(() => compileApprovedProjectIntake({
    approval: "IDEA_ONLY" as never,
    authorityRef: "chat:idea",
    approvedAt: "2026-09-01T00:00:00Z",
    projectId: "NO-BUILD",
    name: "No Build",
    northStar: "Test",
    user: "Test user",
    goal: "Test goal",
    current: "Idea",
    gold: "Gold",
    gap: "Gap",
    priority: "P1",
    workstreams: [],
  }), /BUILD_APPROVED/);
});
