import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflowSource = readFileSync(new URL("./workflow.ts", import.meta.url), "utf8");
const runtimeSource = readFileSync(new URL("./portfolioRuntimeEntrypoint.ts", import.meta.url), "utf8");

test("portfolio fallback carries exact lineage and ordered packages into the durable workflow", () => {
  assert.match(runtimeSource, /portfolioFallback:\s*\{\s*exactFactorySha,\s*exactTestSha,\s*index,\s*packages: queue\.packages,/s);
  assert.match(runtimeSource, /terminalContinuation: true/);
  assert.match(workflowSource, /PORTFOLIO_CONTINUATION_EXACT_LINEAGE_INVALID/);
  assert.match(workflowSource, /PORTFOLIO_CONTINUATION_CURRENT_PACKAGE_MISMATCH/);
  assert.match(workflowSource, /PORTFOLIO_CONTINUATION_MUTABLE_PACKAGE_FORBIDDEN/);
  assert.match(workflowSource, /PORTFOLIO_CONTINUATION_TEST_LINEAGE_MISMATCH/);
  assert.match(workflowSource, /PORTFOLIO_CONTINUATION_FACTORY_LINEAGE_MISMATCH/);
});

test("Claude capacity pause is local and starts the next read-only package without cancelling durable retry", () => {
  assert.match(workflowSource, /continue-after-local-provider-pause/);
  assert.match(workflowSource, /dispatchNextReadOnlyPortfolioPackage/);
  assert.match(workflowSource, /await step\.sleep\(`await-claude-capacity-/);
  assert.match(workflowSource, /MAX_CLAUDE_CAPACITY_REOBSERVATIONS = 48/);
});

test("terminal work continues the same deterministic portfolio chain and refuses duplicate workflow ids", () => {
  assert.match(workflowSource, /continue-after-terminal/);
  assert.match(workflowSource, /const workflowId = `factory-portfolio-fallback-\$\{next\.id\}`/);
  assert.match(workflowSource, /const tracked = await factory\.getWorkflow\?\.\(workflowId\)/);
  assert.match(workflowSource, /status: "ALREADY_TRACKED"/);
  assert.match(workflowSource, /factory\.runWorkflow\(\s*"WORK_PACKAGE_WORKFLOW"/s);
});

test("continuation remains read-only and never introduces LIVE or TEST mutation authority", () => {
  assert.match(workflowSource, /if \(pkg\.writeScopes\.length !== 0\) throw new Error\("PORTFOLIO_CONTINUATION_MUTABLE_PACKAGE_FORBIDDEN"\)/);
  assert.match(workflowSource, /readOnly: true/);
  assert.doesNotMatch(workflowSource, /LIVE_DEPLOY|CANON_PROMOTION|king\/test.*update|force:\s*true/);
});
