import test from "node:test";
import assert from "node:assert/strict";
import { createNightShiftPortfolio, NIGHT_SHIFT_PROJECT_ID } from "./nightShiftPortfolio";

const TEST_SHA = "a".repeat(40);
const FACTORY_SHA = "b".repeat(40);

test("night shift is one existing FACTORY_ACTIVE_01 projection with seven read-only CORE packages", () => {
  const queue = createNightShiftPortfolio(TEST_SHA, FACTORY_SHA, "2026-09-09T00:00:00.000Z");
  assert.deepEqual(queue.projects.map((project) => project.id), [NIGHT_SHIFT_PROJECT_ID]);
  assert.equal(queue.packages.length, 7);
  for (const pkg of queue.packages) {
    assert.equal(pkg.projectId, NIGHT_SHIFT_PROJECT_ID);
    assert.equal(pkg.section, "CODE_QA");
    assert.deepEqual(pkg.writeScopes, []);
    assert.equal(pkg.execution?.kind, "BROWSER_QA");
    assert.equal(pkg.execution?.allowedHosts[0], "4planet.org");
    assert.equal(pkg.resourceBudget?.maxModelCalls, 0);
    assert.equal(pkg.resourceBudget?.maxBrowserCalls, 1);
    assert.equal(pkg.resourceBudget?.maxAttempts, 1);
    assert.equal(pkg.run?.expectedBaseSha, TEST_SHA);
  }
});

test("night shift identity changes with HEIR or Factory state", () => {
  const first = createNightShiftPortfolio(TEST_SHA, FACTORY_SHA, "2026-09-09T00:00:00.000Z");
  const second = createNightShiftPortfolio("c".repeat(40), FACTORY_SHA, "2026-09-09T00:00:00.000Z");
  const third = createNightShiftPortfolio(TEST_SHA, "d".repeat(40), "2026-09-09T00:00:00.000Z");
  assert.notEqual(first.packages[0].id, second.packages[0].id);
  assert.notEqual(first.packages[0].id, third.packages[0].id);
});
