import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const workersPath = fileURLToPath(new URL("./workers.ts", import.meta.url));
const source = readFileSync(workersPath, "utf8");

function position(fragment: string): number {
  const index = source.indexOf(fragment);
  assert.notEqual(index, -1, `Expected workers.ts to contain: ${fragment}`);
  return index;
}

test("autonomous product candidate authority runs before AI reservation or candidate execution", () => {
  const autonomousBlock = position("const autonomous = (pkg as AutonomousWorkPackage).autonomous;");
  const authority = source.indexOf("await this.candidateAuthorityBlock(pkg, autonomous.expectedBaseSha, autonomous.baseBranch)", autonomousBlock);
  const reservation = source.indexOf("await this.needsAiReservation(pkg, autonomous)", autonomousBlock);
  const execution = source.indexOf("await executeAutonomousPackage(this.env, boundedPkg)", autonomousBlock);
  assert.ok(authority > autonomousBlock, "candidate authority must be invoked in autonomous dispatch block");
  assert.ok(reservation > authority, "candidate authority must run before any AI reservation");
  assert.ok(execution > authority, "candidate authority must run before candidate execution");
});

test("Claude bounded-code candidate authority runs before Claude candidate dispatch", () => {
  const claudeBlock = position("if (isClaudeProductWorkPackage(pkg)) {");
  const authority = source.indexOf("await this.candidateAuthorityBlock(pkg, baseSha, TEST_BRANCH)", claudeBlock);
  const execution = source.indexOf("await executeClaudeProductReview(this.env, pkg)", claudeBlock);
  assert.ok(authority > claudeBlock, "candidate authority must be invoked for Claude bounded code");
  assert.ok(execution > authority, "candidate authority must run before Claude bounded-code dispatch");
});

test("candidate authority failure is persisted as BLOCKED before any candidate mutation", () => {
  const helper = position("private async candidateAuthorityBlock");
  assert.ok(source.indexOf("CANDIDATE_AUTHORITY_FAIL_CLOSED", helper) > helper);
  assert.ok(source.indexOf("No candidate branch/PR/write created", helper) > helper);
});
