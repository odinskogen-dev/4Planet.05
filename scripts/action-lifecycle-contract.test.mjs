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

function productionRecord(overrides = {}) {
  return {
    actionId: "action:production:plastic:1",
    providerPatternId: action.PLASTIC_BANK_FIXED_CONTRIBUTION_PATTERN.id,
    environment: "PRODUCTION",
    state: "PAID",
    quantity: 5000,
    unit: "bottles",
    geography: null,
    providerReference: "provider:pending",
    idempotencyKey: "4p-production-plastic-1",
    proofClaimDistance: "D1",
    evidenceRefs: [],
    limitations: [],
    ...overrides,
  };
}

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

test("provider candidates remain diligence records and fixed tier never inherits enterprise capabilities", () => {
  const bank = action.PLASTIC_BANK_FIXED_CONTRIBUTION_PATTERN;
  assert.equal(bank.supportsTestMode, false);
  assert.equal(bank.unitMinimum, 5000);
  assert.match(bank.reportingApi, /NOT_VERIFIED_FOR_FIXED_CONTRIBUTION/i);
  assert.ok(bank.limitations.some((item) => /Candidate only/i.test(item)));
  assert.ok(bank.limitations.some((item) => /Enterprise audit trail/i.test(item)));

  const fischer = action.PLASTIC_FISCHER_CERTIFICATE_PATTERN;
  assert.equal(fischer.unitMinimum, 5);
  assert.match(fischer.reportingApi, /NO PUBLIC BUYER API VERIFIED/i);

  const cleanhub = action.CLEANHUB_RECOVERY_PATTERN;
  assert.match(cleanhub.reportingApi, /exact access contract/i);
  assert.ok(cleanhub.limitations.some((item) => /Process verification does not by itself/i.test(item)));
});

test("payment success plus delivery failure remains PAID/D1 and cannot self-promote", () => {
  const record = productionRecord({ integrity: { deliveryState: "FAILED" } });
  assert.deepEqual(action.validateActionLifecycleRecord(record), []);
  const illegal = { ...record, state: "DELIVERED", proofClaimDistance: "D2", evidenceRefs: ["evidence:fake-delivery"] };
  assert.ok(action.validateActionLifecycleRecord(illegal).includes("delivery_state_conflict"));
});

test("partial or incorrect quantity is surfaced and cannot be verified as complete", () => {
  const record = productionRecord({
    state: "VERIFIED",
    proofClaimDistance: "D3",
    evidenceRefs: ["evidence:provider"],
    integrity: { expectedQuantity: 5000, reportedQuantity: 4200, deliveryState: "PARTIAL" },
  });
  const failures = action.validateActionLifecycleRecord(record);
  assert.ok(failures.includes("partial_delivery"));
  assert.ok(failures.includes("quantity_mismatch"));
  assert.ok(failures.includes("partial_delivery_cannot_verify"));
});

test("missing evidence blocks delivered/verified states", () => {
  const record = productionRecord({ state: "DELIVERED", proofClaimDistance: "D2", evidenceRefs: [] });
  assert.ok(action.validateActionLifecycleRecord(record).includes("missing_delivery_or_outcome_evidence"));
});

test("contradictory or provider-only evidence cannot be called VERIFIED", () => {
  const contradictory = productionRecord({
    state: "VERIFIED",
    proofClaimDistance: "D3",
    evidenceRefs: ["evidence:provider"],
    integrity: { contradictoryEvidence: true },
  });
  assert.ok(action.validateActionLifecycleRecord(contradictory).includes("contradictory_evidence_cannot_verify"));

  const providerOnly = productionRecord({
    state: "VERIFIED",
    proofClaimDistance: "D3",
    evidenceRefs: ["evidence:provider"],
    integrity: { providerClaimOnly: true },
  });
  assert.ok(action.validateActionLifecycleRecord(providerOnly).includes("provider_claim_not_independent"));
});

test("refund preserves history and requires invalidated/remedied state", () => {
  const refunded = productionRecord({ integrity: { refundState: "CONFIRMED" } });
  assert.ok(action.validateActionLifecycleRecord(refunded).includes("refund_requires_remedy_state"));
  const remedied = { ...refunded, state: "INVALIDATED_REMEDIED", proofClaimDistance: "D0" };
  assert.ok(!action.validateActionLifecycleRecord(remedied).includes("refund_requires_remedy_state"));
});

test("stale evidence is rejected at the configured evidence-age boundary", () => {
  const record = productionRecord({
    integrity: { evidenceObservedAt: "2026-09-01T00:00:00Z", evidenceMaxAgeHours: 24 },
  });
  assert.ok(action.validateActionLifecycleRecord(record, new Date("2026-09-08T00:00:00Z")).includes("stale_evidence"));
});

test("repeated submission is detectable by idempotency key before provider mutation", () => {
  const first = productionRecord();
  const second = { ...productionRecord(), actionId: "action:production:plastic:2" };
  assert.deepEqual(action.duplicateIdempotencyKeys([first, second]), ["4p-production-plastic-1"]);
});
