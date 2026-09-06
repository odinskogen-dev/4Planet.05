import test from "node:test";
import assert from "node:assert/strict";
import {
  createPortfolioFallbackQueue,
  isOnlyReceiverWriterConflict,
  PORTFOLIO_FALLBACK_LEASE,
} from "./portfolioFallback";

const TEST_SHA = "ce532830640817f83c11923bdfb4c394f222baad";
const FACTORY_SHA = "eff122f67a9e99cc5749b5b23609afd6b33d89d6";

test("portfolio fallback stays inside current Conductor Lane D and remains read-only", () => {
  const queue = createPortfolioFallbackQueue(TEST_SHA, FACTORY_SHA, "2026-09-06T14:45:00.000Z");

  assert.deepEqual(queue.projects.map((project) => project.id), ["PLANET_GBR_TRANSFER_02"]);
  assert.equal(queue.projects[0].authorityRefs.includes(PORTFOLIO_FALLBACK_LEASE), true);
  assert.equal(queue.packages.length, 2);
  assert.equal(queue.packages.some((pkg) => pkg.projectId === "PLANET_AMAZONIA_TRANSFER_03"), false);

  for (const pkg of queue.packages) {
    assert.equal(pkg.projectId, "PLANET_GBR_TRANSFER_02");
    assert.equal(pkg.status, "READY");
    assert.deepEqual(pkg.writeScopes, []);
    assert.equal(pkg.section, "RESEARCH_DATA");
    assert.equal(pkg.execution?.kind, "HTTP_SOURCE_CHECK");
    assert.equal(pkg.resourceBudget?.maxModelCalls, 0);
    assert.equal(pkg.run?.expectedBaseSha, TEST_SHA);
  }
});

test("portfolio fallback recognises only the proven receiver-writer conflict as a safe trigger", () => {
  assert.equal(isOnlyReceiverWriterConflict({
    error: "ACTIVATION_PREFLIGHT_BLOCKED",
    preflight: {
      authority: [
        { code: "RECEIVER_SINGLE_WRITER_CONFLICT" },
        { code: "RECEIVER_SINGLE_WRITER_CONFLICT" },
      ],
    },
  }), true);

  assert.equal(isOnlyReceiverWriterConflict({
    error: "ACTIVATION_PREFLIGHT_BLOCKED",
    preflight: { authority: [{ code: "TEST_KING_MOVED" }] },
  }), false);
  assert.equal(isOnlyReceiverWriterConflict({ error: "OTHER" }), false);
});

test("portfolio fallback binds outcome identity to exact TEST and Factory state", () => {
  const first = createPortfolioFallbackQueue(TEST_SHA, FACTORY_SHA, "2026-09-06T14:45:00.000Z");
  const changedTest = `a${TEST_SHA.slice(1)}`;
  const changedFactory = `a${FACTORY_SHA.slice(1)}`;
  const second = createPortfolioFallbackQueue(changedTest, FACTORY_SHA, "2026-09-06T14:45:00.000Z");
  const third = createPortfolioFallbackQueue(TEST_SHA, changedFactory, "2026-09-06T14:45:00.000Z");

  assert.notEqual(first.packages[0].id, second.packages[0].id);
  assert.notEqual(first.packages[0].id, third.packages[0].id);
  assert.equal(first.packages[0].run?.inputStateHash.includes(`test=${TEST_SHA}`), true);
  assert.equal(first.packages[0].run?.inputStateHash.includes(`factory=${FACTORY_SHA}`), true);
  assert.equal(second.packages[0].run?.inputStateHash.includes(`test=${changedTest}`), true);
  assert.equal(third.packages[0].run?.inputStateHash.includes(`factory=${changedFactory}`), true);
});
