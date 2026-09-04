import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const preflightPath = fileURLToPath(new URL("./activationPreflightRuntime.ts", import.meta.url));
const runtimePath = fileURLToPath(new URL("./runtimeEntrypoint.ts", import.meta.url));
const workersPath = fileURLToPath(new URL("./workers.ts", import.meta.url));
const preflight = readFileSync(preflightPath, "utf8");
const runtime = readFileSync(runtimePath, "utf8");
const workers = readFileSync(workersPath, "utf8");

function position(source: string, fragment: string): number {
  const index = source.indexOf(fragment);
  assert.notEqual(index, -1, `Expected source to contain: ${fragment}`);
  return index;
}

test("activation start is fail-closed behind exact receiver plus read-only preflight", () => {
  const start = position(runtime, 'url.pathname === "/__factory/activation-proof/start"');
  const receiver = runtime.indexOf('requireCurrentReceiver(baseSha, currentTestSha, "ACTIVATION_PREFLIGHT")', start);
  const preflightCall = runtime.indexOf("await agent.attestActivationPreflight", start);
  const block = runtime.indexOf('error: "ACTIVATION_PREFLIGHT_BLOCKED"', start);
  const delegate = runtime.indexOf("return activeRuntime.fetch(request, env, ctx);", start);
  assert.ok(receiver > start);
  assert.ok(preflightCall > receiver);
  assert.ok(block > preflightCall);
  assert.ok(delegate > block, "activation runtime must not receive the start request until preflight passed");
});

test("candidate authority is proven before capacity is inspected", () => {
  const authority = position(preflight, "await resolveLiveCandidateAuthority");
  const authorityGate = position(preflight, "if (authorityReady) {");
  const capacity = position(preflight, "getAiCapacitySnapshot(group.requestedCalls)");
  assert.ok(authorityGate > authority);
  assert.ok(capacity > authorityGate);
});

test("capacity attestation is non-consuming and bound to exact Factory and TEST identities", () => {
  assert.ok(position(preflight, "exactFactorySha") >= 0);
  assert.ok(position(preflight, "exactTestKingSha") >= 0);
  assert.ok(position(preflight, "readOnly: true as const") >= 0);
  assert.equal(preflight.includes("reserveAiBudget("), false, "preflight must never reserve AI capacity");
});

test("activation worker identity stays aligned with the dispatch worker-slot formula", () => {
  const formula = 'const hash = [...workPackageId].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);';
  const slot = 'const slot = section === "PRODUCT_DESIGN" || section === "CODE_QA" ? (hash % 2) + 1 : 1;';
  assert.ok(preflight.includes(formula));
  assert.ok(preflight.includes(slot));
  assert.ok(workers.includes(formula));
  assert.ok(workers.includes(slot));
});
