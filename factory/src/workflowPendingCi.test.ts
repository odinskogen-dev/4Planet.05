import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("pending external evidence is explicitly non-terminal for WorkPackageWorkflow", async () => {
  const source = await readFile(new URL("./workflow.ts", import.meta.url), "utf8");
  const pendingGuard = source.indexOf("export function isPendingCiOutcome");
  const persist = source.indexOf("persist-outcome");

  assert.ok(pendingGuard > 0, "pending evidence guard must exist");
  assert.match(source, /outcome\.status !== "CORRECT"/);
  assert.match(source, /registered checks are still pending/);
  assert.match(source, /durably re-observe the same candidate/);
  assert.match(source, /Claude specialist result is still pending/);
  assert.match(source, /CLAUDE_SPECIALIST_PENDING/);
  assert.ok(persist > pendingGuard, "pending state must be classified before final persistence");
});

test("pending external evidence uses durable Workflow sleep and bounded re-observation", async () => {
  const source = await readFile(new URL("./workflow.ts", import.meta.url), "utf8");
  assert.match(source, /const MAX_PENDING_CI_REOBSERVATIONS = 12;/);
  assert.match(source, /const PENDING_CI_SLEEP = "2 minutes";/);
  assert.match(source, /await step\.sleep\(`await-pending-evidence-\$\{observation\}`/);
  assert.match(source, /reobserve-pending-evidence-\$\{observation\}/);
  assert.match(source, /persist-outcome/);
  assert.ok(
    source.indexOf("persist-outcome") > source.indexOf("reobserve-pending-evidence-${observation}"),
    "pending external evidence must be re-observed before final persistence",
  );
});
