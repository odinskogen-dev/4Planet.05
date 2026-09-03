import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import type { Outcome } from "./contracts";
import { isPendingCiOutcome } from "./workflow";

function outcome(overrides: Partial<Outcome> = {}): Outcome {
  return {
    workPackageId: "wp-test",
    status: "CORRECT",
    evidence: [],
    materialDelta: "candidate created",
    expected: "accepted candidate",
    actual: "Candidate remains isolated on factory-candidate-test; commit abc; registered checks are still pending.",
    limitation: "Workflow must durably re-observe the same candidate. Pending evidence must never be treated as failure, completion or a trigger for a new AI write.",
    completedAt: "2026-09-03T00:00:00.000Z",
    ...overrides,
  };
}

test("pending CI is explicitly non-terminal for WorkPackageWorkflow", () => {
  assert.equal(isPendingCiOutcome(outcome()), true);
  assert.equal(isPendingCiOutcome(outcome({ status: "ACCEPTED" })), false);
  assert.equal(isPendingCiOutcome(outcome({ actual: "GitHub checks passed" })), false);
  assert.equal(isPendingCiOutcome(outcome({ limitation: "different CORRECT reason" })), false);
});

test("pending CI uses durable Workflow sleep and bounded re-observation", async () => {
  const source = await readFile(new URL("./workflow.ts", import.meta.url), "utf8");
  assert.match(source, /const MAX_PENDING_CI_REOBSERVATIONS = 12;/);
  assert.match(source, /const PENDING_CI_SLEEP = "2 minutes";/);
  assert.match(source, /await step\.sleep\(`await-pending-ci-\$\{observation\}`/);
  assert.match(source, /reobserve-pending-ci-\$\{observation\}/);
  assert.match(source, /persist-outcome/);
  assert.ok(
    source.indexOf("persist-outcome") > source.indexOf("reobserve-pending-ci-${observation}"),
    "pending candidate must be re-observed before final persistence",
  );
});
