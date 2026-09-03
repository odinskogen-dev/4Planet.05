import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import type { Outcome } from "./contracts";
import { isClaudeCapacityPausedOutcome, isPendingCiOutcome } from "./workflowOutcomeState";

function outcome(values: Partial<Outcome>): Outcome {
  return {
    workPackageId: "wp-1",
    status: "CORRECT",
    evidence: [],
    materialDelta: "pending",
    expected: "done",
    actual: "pending",
    completedAt: "2026-09-03T00:00:00.000Z",
    ...values,
  };
}

test("pending external evidence is explicitly non-terminal for WorkPackageWorkflow", async () => {
  const workflowSource = await readFile(new URL("./workflow.ts", import.meta.url), "utf8");
  const stateSource = await readFile(new URL("./workflowOutcomeState.ts", import.meta.url), "utf8");
  const pendingUse = workflowSource.indexOf("isPendingCiOutcome(outcome)");
  const persist = workflowSource.indexOf("persist-outcome");

  assert.ok(pendingUse > 0, "pending evidence classifier must be used by Workflow before persistence");
  assert.match(stateSource, /outcome\.status !== "CORRECT"/);
  assert.match(stateSource, /registered checks are still pending/);
  assert.match(stateSource, /durably re-observe the same candidate/);
  assert.match(stateSource, /Claude specialist result is still pending/);
  assert.match(stateSource, /CLAUDE_SPECIALIST_PENDING/);
  assert.ok(persist > pendingUse, "pending state must be classified before final persistence");
});

test("pending external evidence uses durable Workflow sleep and bounded re-observation", async () => {
  const source = await readFile(new URL("./workflow.ts", import.meta.url), "utf8");
  assert.match(source, /const MAX_PENDING_CI_REOBSERVATIONS = 12;/);
  assert.match(source, /const PENDING_CI_SLEEP = "2 minutes";/);
  assert.match(source, /await step\.sleep\(`await-pending-evidence-\$\{pendingObservation\}`/);
  assert.match(source, /reobserve-pending-evidence-\$\{pendingObservation\}/);
  assert.match(source, /persist-outcome/);
  assert.ok(
    source.indexOf("persist-outcome") > source.indexOf("reobserve-pending-evidence-${pendingObservation}"),
    "pending external evidence must be re-observed before final persistence",
  );
});

test("Claude provider capacity is a distinct durable pause, not ordinary short polling", async () => {
  const paused = outcome({
    actual: "Claude specialist provider capacity is paused: bounded-code subscription/session capacity unavailable.",
    limitation: "CLAUDE_PROVIDER_CAPACITY_PAUSED: preserve the exact work package and durably re-observe it after the retry window; do not fail, duplicate, broaden, or spend to bypass subscription capacity.",
  });

  assert.equal(isClaudeCapacityPausedOutcome(paused), true);
  assert.equal(isPendingCiOutcome(paused), false);

  const source = await readFile(new URL("./workflow.ts", import.meta.url), "utf8");
  assert.match(source, /const MAX_CLAUDE_CAPACITY_REOBSERVATIONS = 48;/);
  assert.match(source, /const CLAUDE_CAPACITY_SLEEP = "1 hour";/);
  assert.match(source, /await step\.sleep\(`await-claude-capacity-\$\{capacityObservation\}`/);
  assert.match(source, /reobserve-claude-capacity-\$\{capacityObservation\}/);
});

test("normal Claude specialist pending state retains short polling", () => {
  const pending = outcome({
    actual: "Claude specialist result is still pending: work order wp-1 is dispatched.",
    limitation: "CLAUDE_SPECIALIST_PENDING: Factory Workflow must durably re-observe the same work package; do not redispatch a duplicate job.",
  });

  assert.equal(isClaudeCapacityPausedOutcome(pending), false);
  assert.equal(isPendingCiOutcome(pending), true);
});
