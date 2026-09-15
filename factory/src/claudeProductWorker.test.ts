import assert from "node:assert/strict";
import test from "node:test";
import type { WorkPackage } from "./contracts";
import {
  buildClaudeCodeWorkOrder,
  buildClaudeWorkOrder,
  executeClaudeProductReview,
  extractClaudeStatus,
  extractDispatchAttempt,
  extractResultWorkOrderId,
  extractRetryAfter,
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

function codePackageFixture(): ClaudeRoutedWorkPackage {
  const pkg = packageFixture();
  return {
    ...pkg,
    id: "CLAUDE-CODE-TEST-01",
    title: "Build one bounded product component",
    gapClosed: "A proven product seam is not yet implemented.",
    writeScopes: ["src/components/species/SpeciesWorldSeam.tsx", "scripts/species-first-plank-source-contract.test.mjs"],
    preservation: {
      mustNotLose: ["UNKNOWN stays UNKNOWN", "TEST KING remains untouched"],
      regressionRisks: ["truth qualifier loss"],
      rollbackRef: "327a4ee39e337301adbb83995126e21391d0dc2d",
    },
    specialist: {
      provider: "CLAUDE",
      role: "PRODUCT_INTERFACE",
      mode: "BOUNDED_CODE",
      baseSha: "327a4ee39e337301adbb83995126e21391d0dc2d",
      testProfile: "PRODUCT_UI",
      model: "claude-opus-5",
      sourceRefs: ["SPECIES Human Gold review"],
    },
  };
}

test("routes only explicitly governed Product/Interface packages to Claude", () => {
  const pkg = packageFixture();
  assert.equal(isClaudeProductWorkPackage(pkg), true);
  assert.equal(isClaudeProductWorkPackage(codePackageFixture()), true);
  assert.equal(isClaudeProductWorkPackage({ ...pkg, section: "CODE_QA" } as WorkPackage), false);
  assert.equal(isClaudeProductWorkPackage({ ...pkg, specialist: undefined } as WorkPackage), false);
});

test("renders a bounded review work order with authority, attempt and correlation id", () => {
  const pkg = packageFixture();
  const order = buildClaudeWorkOrder(pkg);
  assert.equal(extractWorkOrderId(order), pkg.id);
  assert.equal(extractDispatchAttempt(order), 1);
  assert.match(order, /READ \/ REVIEW ONLY/);
  assert.match(order, /No LIVE/);
  assert.match(order, /TEST KING remains the integration receiver/);
  assert.match(order, /Founder release gates remain intact/);
});

test("renders bounded code work order from exact Factory contract", () => {
  const pkg = codePackageFixture();
  const order = buildClaudeCodeWorkOrder(pkg);
  assert.equal(extractWorkOrderId(order), pkg.id);
  assert.equal(extractDispatchAttempt(order), 1);
  assert.match(order, /base_sha: 327a4ee39e337301adbb83995126e21391d0dc2d/);
  assert.match(order, /test_profile: PRODUCT_UI/);
  assert.match(order, /model: claude-opus-5/);
  assert.match(order, /write_scope: src\/components\/species\/SpeciesWorldSeam\.tsx/);
  assert.match(order, /write_scope: scripts\/species-first-plank-source-contract\.test\.mjs/);
  assert.match(order, /UNKNOWN stays UNKNOWN/);
  assert.match(order, /BOUNDED CODE CANDIDATE ONLY/);
  assert.match(order, /No TEST KING mutation/);
});

test("extracts correlated result and provider-capacity state", () => {
  const result = `# RESULT\nwork_order_id: CLAUDE-RUNTIME-TEST-01\nstatus: CAPACITY_PAUSED\ndispatch_attempt: 3\nretry_after: 2026-09-03T16:00:00Z\n`;
  assert.equal(extractResultWorkOrderId(result), "CLAUDE-RUNTIME-TEST-01");
  assert.equal(extractClaudeStatus(result), "CAPACITY_PAUSED");
  assert.equal(extractDispatchAttempt(result), 3);
  assert.equal(extractRetryAfter(result), "2026-09-03T16:00:00Z");
  assert.equal(extractResultWorkOrderId("# RESULT\nqueue_sha: abc\n"), undefined);
});

test("fails closed when Factory GitHub bridge token is absent for review", async () => {
  const outcome = await executeClaudeProductReview({} as Cloudflare.Env, packageFixture());
  assert.equal(outcome.status, "BLOCKED");
  assert.match(outcome.materialDelta, /FACTORY_GITHUB_TOKEN is not configured/);
  assert.match(outcome.limitation ?? "", /do not move CLAUDE_CODE_OAUTH_TOKEN into Cloudflare/);
});

test("fails closed when Factory GitHub bridge token is absent for bounded code", async () => {
  const outcome = await executeClaudeProductReview({} as Cloudflare.Env, codePackageFixture());
  assert.equal(outcome.status, "BLOCKED");
  assert.match(outcome.materialDelta, /FACTORY_GITHUB_TOKEN is not configured/);
  assert.match(outcome.limitation ?? "", /do not move CLAUDE_CODE_OAUTH_TOKEN into Cloudflare/);
});
