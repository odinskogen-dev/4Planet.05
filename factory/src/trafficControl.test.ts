import assert from "node:assert/strict";
import test from "node:test";
import { selectHourlyBatch } from "./batcher";
import type { ProjectProjection, Section, WorkPackage } from "./contracts";
import { buildTrafficControlSnapshot } from "./trafficControl";

const NOW = Date.parse("2026-09-03T12:30:00Z");

function project(id: string): ProjectProjection {
  return {
    id,
    name: id,
    northStar: "4PLANET North Star",
    goal: `Advance ${id}`,
    current: "Ready work exists",
    gold: "Material result with evidence",
    gap: "Execution remains",
    priority: "P1",
    lastMaterialProgressAt: new Date(NOW - 26 * 60 * 60 * 1000).toISOString(),
  };
}

function pkg(index: number, scope: string): WorkPackage {
  const projectId = `PROJECT-${String(index + 1).padStart(2, "0")}`;
  const sections: Section[] = [
    "PRODUCT_DESIGN",
    "CODE_QA",
    "RESEARCH_DATA",
    "USER_DISTRIBUTION",
    "LEARNING",
  ];
  return {
    id: `wp-${String(index + 1).padStart(2, "0")}`,
    projectId,
    title: `Work package ${index + 1}`,
    section: sections[index % sections.length],
    priority: index < 2 ? "P0" : "P1",
    goalLink: `Advance ${projectId}`,
    gapClosed: "Close one material gap",
    deliverables: ["Material deliverable"],
    dependencies: [],
    writeScopes: [scope],
    preservation: {
      mustNotLose: ["accepted current behaviour"],
      regressionRisks: ["parallel work may collide"],
      rollbackRef: "0123456789abcdef0123456789abcdef01234567",
    },
    definitionOfDone: ["Material result exists"],
    requiredEvidence: ["test PASS"],
    learningQuestion: "What should the Factory learn from this run?",
    createdAt: new Date(NOW - index * 60_000).toISOString(),
    estimatedValue: 20 - index,
    criticalPath: index < 2 ? 10 : 4,
    dependencyUnlock: 5,
    proofValue: 5,
    cashValue: 0,
    learningValue: 4,
    risk: 1,
    founderBurden: 0,
    concurrencyCost: 1,
    status: "READY",
  };
}

test("traffic police preserves all 20 simultaneous work packages while running only conflict-free WIP", () => {
  const packages = Array.from({ length: 20 }, (_, index) => {
    if (index >= 5 && index < 10) return pkg(index, `product/shared-${index - 5}/child`);
    if (index < 5) return pkg(index, `product/shared-${index}`);
    return pkg(index, `independent/lane-${index}`);
  });

  const projects = new Map(packages.map((item) => [item.projectId, project(item.projectId)] as const));
  const batch = selectHourlyBatch(projects, packages, 5, NOW);
  const traffic = buildTrafficControlSnapshot(packages, batch);

  assert.equal(traffic.total, 20);
  assert.equal(traffic.integrity.uniqueInputIds, 20);
  assert.equal(traffic.integrity.representedIds, 20);
  assert.deepEqual(traffic.integrity.lostWorkPackageIds, []);
  assert.ok(batch.packages.length <= 5);
  assert.equal(traffic.active, batch.packages.length);
  assert.equal(traffic.active + traffic.waiting + traffic.blocked + traffic.done, 20);
  assert.ok(traffic.waiting >= 15, "non-selected work must remain explicitly waiting");

  for (const selected of batch.packages) {
    assert.equal(
      traffic.items.find((item) => item.workPackageId === selected.id)?.disposition,
      "SELECTED",
    );
  }

  for (const deferredId of batch.rejectedForConflict) {
    assert.equal(
      traffic.items.find((item) => item.workPackageId === deferredId)?.disposition,
      "WAITING_CONFLICT",
    );
  }
});

test("traffic projection never treats control-blocked work as deleted", () => {
  const unsafe = pkg(0, "factory/shared");
  delete unsafe.preservation;
  const projects = new Map([[unsafe.projectId, project(unsafe.projectId)]]);
  const batch = selectHourlyBatch(projects, [unsafe], 5, NOW);
  const traffic = buildTrafficControlSnapshot([unsafe], batch);

  assert.equal(traffic.total, 1);
  assert.deepEqual(traffic.integrity.lostWorkPackageIds, []);
  assert.equal(traffic.items[0]?.disposition, "BLOCKED_CONTROL");
});
