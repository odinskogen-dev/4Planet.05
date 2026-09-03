import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("pending CI is explicitly non-terminal for WorkPackageWorkflow", async () => {
  const source = await readFile(new URL("./workflow.ts", import.meta.url), "utf8");
  const pendingGuard = source.indexOf("export function isPendingCiOutcome");
  const persist = source.indexOf("persist-outcome");

  assert.ok(pendingGuard > 0, "pending CI guard must exist");
  assert.match(source, /outcome\.status === "CORRECT"/);
  assert.match(source, /registered checks are still pending/);
  assert.match(source, /durably re-observe the same candidate/);
  assert.ok(persist > pendingGuard, "pending state must be classified before final persistence");
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
