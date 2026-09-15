import test from "node:test";
import assert from "node:assert/strict";
import {
  createPortfolioFallbackQueue,
  isOnlyReceiverWriterConflict,
  PORTFOLIO_CURRENT_CORE_AUTHORITY,
  PORTFOLIO_FALLBACK_LEASE,
  PORTFOLIO_OSLOFJORD_REVIEW_LEASE,
} from "./portfolioFallback";

const TEST_SHA = "ce532830640817f83c11923bdfb4c394f222baad";
const FACTORY_SHA = "8b203ae4c383d3663571719d47309664322ef780";
// Activation marker is intentionally attached only after current HEIR was re-read unchanged.
const CURRENT_ATLAS_STATE_URL = "https://4planet.org/atlas?l=bluemarble,fires,biodiv&z=1.65&c=5,18";

test("fallback queue spends blocked-receiver capacity on current ATLAS proof before older proof lanes", () => {
  const queue = createPortfolioFallbackQueue(TEST_SHA, FACTORY_SHA, "2026-09-15T18:30:00.000Z");

  assert.deepEqual(queue.projects.map((project) => project.id), [
    "FACTORY_CURRENT_CORE_PROOF",
    "PLANET_GOLD_01_OSLOFJORD",
    "PLANET_GBR_TRANSFER_02",
  ]);
  assert.equal(queue.projects[0].authorityRefs?.includes(PORTFOLIO_CURRENT_CORE_AUTHORITY), true);
  assert.equal(queue.projects[1].authorityRefs?.includes(PORTFOLIO_OSLOFJORD_REVIEW_LEASE), true);
  assert.equal(queue.projects[2].authorityRefs?.includes(PORTFOLIO_FALLBACK_LEASE), true);
  assert.equal(queue.packages.length, 4);

  const atlas = queue.packages[0];
  assert.equal(atlas.projectId, "FACTORY_CURRENT_CORE_PROOF");
  assert.equal(atlas.section, "CODE_QA");
  assert.equal(atlas.execution?.kind, "BROWSER_QA");
  assert.equal(atlas.execution?.targetUrl, CURRENT_ATLAS_STATE_URL);
  assert.equal(atlas.execution?.viewport?.width, 390);
  assert.equal(atlas.execution?.viewport?.height, 844);
  assert.deepEqual(atlas.writeScopes, []);
  assert.equal(atlas.resourceBudget?.maxModelCalls, 0);
  assert.equal(atlas.resourceBudget?.maxBrowserCalls, 1);
  assert.equal(atlas.run?.expectedBaseSha, TEST_SHA);
});

test("fallback queue preserves bounded Oslofjord review and GBR source checks after current CORE proof", () => {
  const queue = createPortfolioFallbackQueue(TEST_SHA, FACTORY_SHA, "2026-09-15T18:30:00.000Z");

  const review = queue.packages[1];
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

  for (const pkg of queue.packages.slice(2)) {
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

test("fallback outcome identity stays bound to exact TEST and Factory state", () => {
  const first = createPortfolioFallbackQueue(TEST_SHA, FACTORY_SHA, "2026-09-15T18:30:00.000Z");
  const changedTest = `a${TEST_SHA.slice(1)}`;
  const changedFactory = `a${FACTORY_SHA.slice(1)}`;
  const second = createPortfolioFallbackQueue(changedTest, FACTORY_SHA, "2026-09-15T18:30:00.000Z");
  const third = createPortfolioFallbackQueue(TEST_SHA, changedFactory, "2026-09-15T18:30:00.000Z");

  assert.notEqual(first.packages[0].id, second.packages[0].id);
  assert.notEqual(first.packages[0].id, third.packages[0].id);
  assert.equal(first.packages[0].run?.inputStateHash.includes(`test=${TEST_SHA}`), true);
  assert.equal(first.packages[0].run?.inputStateHash.includes(`factory=${FACTORY_SHA}`), true);
  assert.equal(second.packages[0].run?.inputStateHash.includes(`test=${changedTest}`), true);
  assert.equal(third.packages[0].run?.inputStateHash.includes(`factory=${changedFactory}`), true);
});
