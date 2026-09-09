import test from "node:test";
import assert from "node:assert/strict";
import {
  createPortfolioFallbackQueue,
  isOnlyReceiverWriterConflict,
  PORTFOLIO_FALLBACK_LEASE,
  PORTFOLIO_OSLOFJORD_REVIEW_LEASE,
} from "./portfolioFallback";

const TEST_SHA = "ce532830640817f83c11923bdfb4c394f222baad";
const FACTORY_SHA = "8b203ae4c383d3663571719d47309664322ef780";

test("production-ramp queue puts one focused read-only Oslofjord material review ahead of GBR source proof", () => {
  const queue = createPortfolioFallbackQueue(TEST_SHA, FACTORY_SHA, "2026-09-06T20:45:00.000Z");

  assert.deepEqual(queue.projects.map((project) => project.id), [
    "PLANET_GOLD_01_OSLOFJORD",
    "PLANET_GBR_TRANSFER_02",
  ]);
  assert.equal(queue.projects[0].authorityRefs?.includes(PORTFOLIO_OSLOFJORD_REVIEW_LEASE), true);
  assert.equal(queue.projects[1].authorityRefs?.includes(PORTFOLIO_FALLBACK_LEASE), true);
  assert.equal(queue.packages.length, 3);

  const review = queue.packages[0];
  assert.equal(review.projectId, "PLANET_GOLD_01_OSLOFJORD");
  assert.equal(review.section, "PRODUCT_DESIGN");
  assert.equal(review.specialist?.provider, "CLAUDE");
  assert.equal(review.specialist?.role, "PRODUCT_INTERFACE");
  assert.equal(review.specialist?.mode, "REVIEW_ONLY");
  assert.equal(review.specialist?.model, "claude-opus-5");
  assert.deepEqual(review.writeScopes, []);
  assert.equal(review.execution, undefined);
  assert.equal(review.run?.expectedBaseSha, TEST_SHA);
  assert.equal(review.deliverables.length, 3);
  assert.equal(review.specialist?.sourceRefs?.some((ref) => ref.includes("ONE_PASS_ONE_DELIVERABLE")), true);
});

test("production-ramp queue preserves bounded read-only GBR source checks after the material review", () => {
  const queue = createPortfolioFallbackQueue(TEST_SHA, FACTORY_SHA, "2026-09-06T20:45:00.000Z");

  for (const pkg of queue.packages.slice(1)) {
    assert.equal(pkg.projectId, "PLANET_GBR_TRANSFER_02");
    assert.equal(pkg.status, "READY");
    assert.deepEqual(pkg.writeScopes, []);
    assert.equal(pkg.section, "RESEARCH_DATA");
    assert.equal(pkg.execution?.kind, "HTTP_SOURCE_CHECK");
    assert.equal(pkg.resourceBudget?.maxModelCalls, 0);
    assert.equal(pkg.run?.expectedBaseSha, TEST_SHA);
  }

  assert.equal(queue.packages.some((pkg) => pkg.projectId === "PLANET_AMAZONIA_TRANSFER_03"), false);
  assert.equal(queue.packages.some((pkg) => pkg.specialist?.mode === "BOUNDED_CODE"), false);
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

test("production-ramp outcome identity stays bound to exact TEST and Factory state", () => {
  const first = createPortfolioFallbackQueue(TEST_SHA, FACTORY_SHA, "2026-09-06T20:45:00.000Z");
  const changedTest = `a${TEST_SHA.slice(1)}`;
  const changedFactory = `a${FACTORY_SHA.slice(1)}`;
  const second = createPortfolioFallbackQueue(changedTest, FACTORY_SHA, "2026-09-06T20:45:00.000Z");
  const third = createPortfolioFallbackQueue(TEST_SHA, changedFactory, "2026-09-06T20:45:00.000Z");

  assert.notEqual(first.packages[0].id, second.packages[0].id);
  assert.notEqual(first.packages[0].id, third.packages[0].id);
  assert.equal(first.packages[0].run?.inputStateHash.includes(`test=${TEST_SHA}`), true);
  assert.equal(first.packages[0].run?.inputStateHash.includes(`factory=${FACTORY_SHA}`), true);
  assert.equal(second.packages[0].run?.inputStateHash.includes(`test=${changedTest}`), true);
  assert.equal(third.packages[0].run?.inputStateHash.includes(`factory=${changedFactory}`), true);
});
