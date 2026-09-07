import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/impact/actionLifecycle.ts", import.meta.url), "utf8");
const withoutTypeImport = source.replace(/import type[^;]+;\n/, "");
const transpiled = ts.transpileModule(withoutTypeImport, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const action = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);

test("canonical action lifecycle preserves payment/delivery/outcome/impact separation", () => {
  assert.deepEqual(action.ACTION_LIFECYCLE, [
    "DISCOVERED", "DILIGENCED", "SELECTED", "COMMITTED", "PAID", "ALLOCATED",
    "IN_DELIVERY", "DELIVERED", "EVIDENCED", "VERIFIED", "OUTCOME_OBSERVED",
    "IMPACT_CLAIM_ELIGIBLE", "INVALIDATED_REMEDIED",
  ]);
  assert.equal(action.maxClaimDistanceForActionState("PAID"), "D1");
  assert.equal(action.maxClaimDistanceForActionState("DELIVERED"), "D2");
  assert.equal(action.maxClaimDistanceForActionState("OUTCOME_OBSERVED"), "D3");
  assert.equal(action.maxClaimDistanceForActionState("IMPACT_CLAIM_ELIGIBLE"), "D4");
});

test("forward lifecycle advances one state at a time and supports invalidation/remedy", () => {
  assert.equal(action.canTransitionAction("DISCOVERED", "DILIGENCED"), true);
  assert.equal(action.canTransitionAction("DISCOVERED", "SELECTED"), false);
  assert.equal(action.canTransitionAction("PAID", "DELIVERED"), false);
  assert.equal(action.canTransitionAction("DELIVERED", "INVALIDATED_REMEDIED"), true);
  assert.equal(action.canTransitionAction("INVALIDATED_REMEDIED", "VERIFIED"), false);
});

test("Ecologi sandbox request is forced to test:true and never executes", () => {
  const request = action.buildEcologiHabitatRestorationTestRequest(1.5, "4p-test-001", "4PLANET TEST");
  assert.equal(request.method, "POST");
  assert.equal(request.url, "https://public.ecologi.com/impact/habitat-restoration");
  assert.equal(request.requiresBearerToken, true);
  assert.equal(request.body.number, 1.5);
  assert.equal(request.body.test, true);
  assert.equal(request.execution, "NOT_EXECUTED");
});

test("Ecologi sandbox rejects sub-minimum quantity and missing idempotency", () => {
  assert.throws(() => action.buildEcologiHabitatRestorationTestRequest(0.09, "x"), /at least 0.1/i);
  assert.throws(() => action.buildEcologiHabitatRestorationTestRequest(1, ""), /Idempotency key/i);
});

test("TEST lifecycle remains D0 and cannot imply commitment, payment or delivery", () => {
  const record = action.createEcologiTestLifecycleRecord(2, "4p-test-002");
  assert.equal(record.environment, "TEST");
  assert.equal(record.state, "SELECTED");
  assert.equal(record.proofClaimDistance, "D0");
  assert.deepEqual(action.validateActionLifecycleRecord(record), []);

  const illegal = { ...record, state: "DELIVERED", proofClaimDistance: "D2", evidenceRefs: ["provider:test"] };
  assert.ok(action.validateActionLifecycleRecord(illegal).includes("test_state_boundary"));
  assert.ok(action.validateActionLifecycleRecord(illegal).includes("test_claim_boundary"));
});

test("provider pattern remains diligence, not partnership or independent verification", () => {
  const pattern = action.ECOLOGI_HABITAT_RESTORATION_PATTERN;
  assert.equal(pattern.supportsTestMode, true);
  assert.equal(pattern.unit, "m² habitat restoration funded");
  assert.match(pattern.doubleCountTreatment, /UNRESOLVED/i);
  assert.ok(pattern.limitations.some((item) => /No Ecologi partnership/i.test(item)));
  assert.ok(pattern.limitations.some((item) => /No real request/i.test(item)));
});
