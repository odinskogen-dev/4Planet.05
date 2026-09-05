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

test("bounded ACTIVE boot proves Factory-specific exact-head CI before candidate/capacity preflight can dispatch worker compute", () => {
  assert.match(runtimeSource, /const REQUIRED_ACTIVATION_WORKFLOWS = \[\s*"Production Factory Shadow CI",\s*\] as const;/);
  assert.doesNotMatch(runtimeSource, /"ONE INTERFACE Convergence Gate"/);
  assert.match(runtimeSource, /run\.status !== "completed" \|\| run\.conclusion !== "success"/);

  const receiverIndex = runtimeSource.indexOf('requireCurrentReceiver(baseSha, currentTestSha, "ACTIVATION_PREFLIGHT")');
  const gateIndex = runtimeSource.indexOf("await requireExactHeadActivationGates(env, buildSha)");
  const capacityIndex = runtimeSource.indexOf("await agent.attestActivationPreflight");
  assert.ok(receiverIndex >= 0, "current TEST receiver authority check missing from activation start");
  assert.ok(gateIndex > receiverIndex, "Factory exact-head CI must come after current receiver authority proof");
  assert.ok(capacityIndex > gateIndex, "candidate/capacity preflight must come after Factory exact-head CI proof");

  assert.match(runtimeSource, /const bootIds = new Set\(activationProofIds\(buildSha\)\)/);
  assert.match(runtimeSource, /\.filter\(\(pkg\) => bootIds\.has\(pkg\.id\)\)/);
});
