import test from "node:test";
import assert from "node:assert/strict";
import { selectHourlyBatch } from "./batcher";
import type { ProjectProjection, Section, WorkPackage } from "./contracts";

const NOW = Date.parse("2026-09-01T00:00:00Z");

function project(id: string, priority: ProjectProjection["priority"], hoursAgo: number): ProjectProjection {
  return {
    id,
    name: id,
    northStar: "4PLANET North Star",
    goal: `Advance ${id}`,
    current: "Working candidate",
    gold: "Verified material proof",
    gap: "Material gap remains",
    priority,
    lastMaterialProgressAt: new Date(NOW - hoursAgo * 60 * 60 * 1000).toISOString(),
  };
}

function pkg(id: string, projectId: string, priority: WorkPackage["priority"], section: Section, value = 5): WorkPackage {
  return {
    id,
    projectId,
    title: id,
    section,
    priority,
    goalLink: `Advance ${projectId}`,
    gapClosed: "Close one material gap",
    deliverables: ["Material deliverable"],
    dependencies: [],
    writeScopes: [`scope/${id}`],
    preservation: {
      mustNotLose: ["accepted current behaviour"],
      regressionRisks: ["bounded mutation may regress accepted behaviour"],
      rollbackRef: "0123456789abcdef0123456789abcdef01234567",
    },
    definitionOfDone: ["Material result exists"],
    requiredEvidence: ["runtime PASS"],
    learningQuestion: "What made the result materially better?",
    createdAt: new Date(NOW - 2 * 60 * 60 * 1000).toISOString(),
    estimatedValue: value,
    criticalPath: value,
    dependencyUnlock: value,
    proofValue: value,
    cashValue: 0,
    learningValue: value,
    risk: 1,
    founderBurden: 0,
    concurrencyCost: 1,
    status: "READY",
  };
}

test("hourly batch protects P0 while rescuing overdue P1/P2 projects", () => {
  const projects = new Map<string, ProjectProjection>([
    ["JAGUAR", project("JAGUAR", "P0", 2)],
    ["S4PIENS", project("S4PIENS", "P1", 30)],
    ["ACTORS", project("ACTORS", "P2", 80)],
    ["MAG", project("MAG", "P1", 8)],
  ]);

  const packages = [
    pkg("jaguar-a", "JAGUAR", "P0", "PRODUCT_DESIGN", 10),
    pkg("jaguar-b", "JAGUAR", "P0", "CODE_QA", 9),
    pkg("jaguar-c", "JAGUAR", "P0", "RESEARCH_DATA", 8),
    pkg("s4piens-a", "S4PIENS", "P1", "PRODUCT_DESIGN", 4),
    pkg("actors-a", "ACTORS", "P2", "USER_DISTRIBUTION", 3),
    pkg("mag-a", "MAG", "P1", "USER_DISTRIBUTION", 7),
  ];

  const batch = selectHourlyBatch(projects, packages, 5, NOW);
  const ids = batch.packages.map((item) => item.id);

  assert.ok(ids.includes("jaguar-a"), "strongest P0 should be present");
  assert.ok(ids.includes("s4piens-a"), "P1 beyond 24h should receive a protected slot");
  assert.ok(ids.includes("actors-a"), "P2 beyond 72h should receive a protected slot");
  assert.deepEqual(new Set(batch.serviceLevelProtected), new Set(["S4PIENS", "ACTORS"]));
  assert.ok(batch.packages.length <= 5);
  assert.equal(batch.rejectedForControl?.length, 0);
});

test("conflicting writes remain serialized even for overdue projects", () => {
  const projects = new Map<string, ProjectProjection>([
    ["A", project("A", "P1", 30)],
    ["B", project("B", "P1", 40)],
  ]);
  const a = pkg("a", "A", "P1", "CODE_QA");
  const b = pkg("b", "B", "P1", "CODE_QA");
  a.writeScopes = ["src/shared"];
  b.writeScopes = ["src/shared/component"];

  const batch = selectHourlyBatch(projects, [a, b], 5, NOW);
  assert.equal(batch.packages.length, 1);
  assert.equal(batch.serviceLevelProtected?.length, 1);
  assert.equal(batch.serviceLevelDeferred?.length, 1);
  assert.equal(batch.rejectedForConflict.length, 1);
});

test("unprotected mutation is rejected before scoring or dispatch", () => {
  const projects = new Map<string, ProjectProjection>([["A", project("A", "P0", 1)]]);
  const unsafe = pkg("unsafe", "A", "P0", "CODE_QA");
  delete unsafe.preservation;

  const batch = selectHourlyBatch(projects, [unsafe], 5, NOW);
  assert.equal(batch.packages.length, 0);
  assert.equal(batch.rejectedForControl?.length, 1);
  assert.match(batch.rejectedForControl?.[0] ?? "", /PRESERVE|MUST-NOT-LOSE|Mutation/);
});
