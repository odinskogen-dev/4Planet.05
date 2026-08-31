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
