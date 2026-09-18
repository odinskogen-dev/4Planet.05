import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./index.ts", import.meta.url), "utf8");

test("in-flight recovery persists exact work-package to workflow identity", () => {
  assert.match(source, /CREATE TABLE IF NOT EXISTS workflow_bindings/);
  assert.match(source, /work_package_id TEXT PRIMARY KEY/);
  assert.match(source, /workflow_id TEXT NOT NULL/);
  assert.match(source, /this\.bindWorkflow\(pkg\.id, workflowId\)/);
  assert.match(source, /ON CONFLICT\(work_package_id\) DO UPDATE SET workflow_id = excluded\.workflow_id/);
});

test("recovery refreshes and supplies authoritative workflow status instead of using time alone", () => {
  assert.match(source, /await this\.recoverInterruptedWork\(\)/);
  assert.match(source, /SELECT workflow_id FROM workflow_bindings WHERE work_package_id = \$\{pkg\.id\}/);
  assert.match(source, /await this\.getWorkflowStatus\("WORK_PACKAGE_WORKFLOW", binding\.workflow_id\)/);
  assert.match(source, /workflowStatus,/);
  assert.doesNotMatch(
    source,
    /decideInFlightRecovery\(\s*\{ status: pkg\.status, updatedAt: row\.updated_at, hasRecordedOutcome: Boolean\(recorded\) \}/,
  );
});

test("missing or non-terminal workflow identity remains fail-closed; final outcomes remain idempotent", () => {
  assert.match(source, /if \(!workflowId\) return undefined/);
  assert.match(source, /TRACKED_WORKFLOW_STATUSES\.has/);
  assert.match(source, /ON CONFLICT\(work_package_id\) DO UPDATE SET payload = excluded\.payload, completed_at = excluded\.completed_at/);
  assert.match(source, /const recorded = this\.getRecordedOutcome\(workPackageId\);\s*if \(recorded\) return recorded;/);
});
