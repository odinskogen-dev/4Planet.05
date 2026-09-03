import assert from "node:assert/strict";
import test from "node:test";
import type { WorkPackage } from "./contracts";
import {
  buildClaudeWorkOrder,
  executeClaudeProductReview,
  extractResultWorkOrderId,
  extractWorkOrderId,
  isClaudeProductWorkPackage,
  type ClaudeRoutedWorkPackage,
} from "./claudeProductWorker";

function packageFixture(): ClaudeRoutedWorkPackage {
  return {
    id: "CLAUDE-RUNTIME-TEST-01",
    projectId: "4P-FACTORY",
    title: "Review the current product surface",
    section: "PRODUCT_DESIGN",
    priority: "P0",
    goalLink: "Improve product quality without parallel architecture.",
    gapClosed: "Independent product/interface review is missing.",
    deliverables: ["Compact evidence-backed review"],
    dependencies: [],
    writeScopes: [],
    definitionOfDone: ["Claude returns a correlated Factory-ingestible result"],
    requiredEvidence: ["Repository evidence"],
    createdAt: "2026-09-03T00:00:00.000Z",
    estimatedValue: 9,
    criticalPath: 8,
    dependencyUnlock: 8,
    proofValue: 10,
    cashValue: 2,
    learningValue: 9,
    risk: 2,
    founderBurden: 0,
    concurrencyCost: 1,
    status: "READY",
    specialist: {
      provider: "CLAUDE",
      role: "PRODUCT_INTERFACE",
      mode: "REVIEW_ONLY",
      sourceRefs: ["TEST KING"],
    },
  };
}

test("routes only explicitly governed Product/Interface packages to Claude", () => {
  const pkg = packageFixture();
  assert.equal(isClaudeProductWorkPackage(pkg), true);
  assert.equal(isClaudeProductWorkPackage({ ...pkg, section: "CODE_QA" } as WorkPackage), false);
  assert.equal(isClaudeProductWorkPackage({ ...pkg, specialist: undefined } as WorkPackage), false);
});

test("renders a bounded work order with authority and correlation id", () => {
  const pkg = packageFixture();
  const order = buildClaudeWorkOrder(pkg);
  assert.equal(extractWorkOrderId(order), pkg.id);
  assert.match(order, /READ \/ REVIEW ONLY/);
  assert.match(order, /No LIVE/);
  assert.match(order, /TEST KING remains the integration receiver/);
  assert.match(order, /Founder release gates remain intact/);
});

test("extracts only the correlated result work-order id", () => {
  assert.equal(extractResultWorkOrderId("# RESULT\nwork_order_id: CLAUDE-RUNTIME-TEST-01\n"), "CLAUDE-RUNTIME-TEST-01");
  assert.equal(extractResultWorkOrderId("# RESULT\nqueue_sha: abc\n"), undefined);
});

test("fails closed when Factory GitHub bridge token is absent", async () => {
  const outcome = await executeClaudeProductReview({} as Cloudflare.Env, packageFixture());
  assert.equal(outcome.status, "BLOCKED");
  assert.match(outcome.materialDelta, /FACTORY_GITHUB_TOKEN is not configured/);
  assert.match(outcome.limitation ?? "", /do not move CLAUDE_CODE_OAUTH_TOKEN into Cloudflare/);
});
