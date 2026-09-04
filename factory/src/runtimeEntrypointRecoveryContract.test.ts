import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const runtimeSource = readFileSync(new URL("./runtimeEntrypoint.ts", import.meta.url), "utf8");

test("public SHADOW canary re-observes build-bound READY recovery after underlying canary work", () => {
  const calls = runtimeSource.match(/recoverBuildBoundReadyOrchestra\(env\)/g) ?? [];
  assert.equal(calls.length, 2);
  assert.match(runtimeSource, /const before = await recoverBuildBoundReadyOrchestra\(env\)/);
  assert.match(runtimeSource, /const after = await recoverBuildBoundReadyOrchestra\(env\)/);
  assert.match(runtimeSource, /exactBuildReadyRecovery: \{ before, after \}/);
});

test("READY recovery remains fail-closed and bounded to exact build plus allowlisted orchestra packages", () => {
  assert.match(runtimeSource, /SHA40\.test\(buildSha\)/);
  assert.match(runtimeSource, /orchestraPackageIds: ORCHESTRA_PACKAGE_IDS/);
  assert.match(runtimeSource, /status: "DISPATCHED"/);
  assert.match(runtimeSource, /status: "READY"/);
  assert.match(runtimeSource, /FACTORY_QUEUE\.sendBatch/);
});

test("activation start proves both exact-head gates before candidate/capacity preflight can dispatch proof work", () => {
  assert.match(runtimeSource, /"Production Factory Shadow CI"/);
  assert.match(runtimeSource, /"ONE INTERFACE Convergence Gate"/);
  assert.match(runtimeSource, /run\.status !== "completed" \|\| run\.conclusion !== "success"/);
  const gateIndex = runtimeSource.indexOf("await requireExactHeadActivationGates(env, buildSha)");
  const capacityIndex = runtimeSource.indexOf("await agent.attestActivationPreflight");
  assert.ok(gateIndex >= 0, "exact-head gate check missing from activation start");
  assert.ok(capacityIndex > gateIndex, "candidate/capacity preflight must come after exact-head gate proof");
});
