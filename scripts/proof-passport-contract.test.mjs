import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/impact/proofPassport.ts", import.meta.url), "utf8");
const withoutTypeImport = source.replace(/import type[^;]+;\n/, "");
const transpiled = ts.transpileModule(withoutTypeImport, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const proof = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);

function records(environment = "TEST") {
  const contribution = {
    recordType: "CONTRIBUTION",
    id: "contribution:test:1",
    unitId: "impact-unit:4p:test:plastic",
    quantity: 1,
    status: "CONFIRMED",
    environment,
    createdAt: "2026-09-07T00:00:00Z",
    idempotencyKey: "test:1",
  };
  const delivery = {
    recordType: "DELIVERY",
    id: "delivery:test:1",
    contributionId: contribution.id,
    providerId: "provider:test",
    status: "NOT_DELIVERED",
    environment,
    providerReference: "TEST_ONLY",
    evidenceRefs: [],
  };
  const outcome = {
    recordType: "OUTCOME",
    id: "outcome:test:1",
    deliveryId: delivery.id,
    status: "NOT_ASSESSED",
    claim: null,
    evidenceRefs: [],
  };
  const impact = {
    recordType: "IMPACT",
    id: "impact:test:1",
    outcomeIds: [outcome.id],
    status: "NOT_ASSESSED",
    claim: null,
    method: null,
  };
  return { contribution, delivery, outcome, impact };
}

function passportInput(overrides = {}) {
  const base = records(overrides.environment ?? "TEST");
  return {
    id: "passport:test:1",
    actionId: "action:test:plastic:1",
    providerId: "provider:test",
    interventionType: "PLASTIC_RECOVERY",
    unitDefinition: "kg plastic recovery",
    quantity: 1,
    geography: null,
    ...base,
    evidenceItems: [],
    limitations: ["Synthetic contract test only."],
    ...overrides,
  };
}

test("TEST/FIXTURE state is pinned to D0 regardless of local confirmed contribution", () => {
  const passport = proof.createProofPassport(passportInput());
  assert.equal(passport.claimDistance, "D0");
  assert.match(passport.disclosure, /NO REAL PURCHASE OR PHYSICAL DELIVERY/i);
  assert.equal(passport.deliveryClaim, null);
  assert.equal(passport.outcomeClaim, null);
  assert.equal(passport.impactClaim, null);
  assert.equal(proof.proofPassportCanClaimImpact(passport), false);
});

test("production contribution confirmation alone reaches at most D1", () => {
  const base = records("PRODUCTION");
  const passport = proof.createProofPassport(passportInput({ environment: "PRODUCTION", ...base }));
  assert.equal(passport.claimDistance, "D1");
  assert.equal(passport.deliveryClaim, null);
  assert.equal(proof.proofPassportCanClaimImpact(passport), false);
});

test("delivery requires attached evidence before D2", () => {
  const base = records("PRODUCTION");
  base.delivery.status = "PROVIDER_REPORTED";
  assert.equal(proof.deriveClaimDistance(base), "D1");
  base.delivery.status = "EVIDENCE_ATTACHED";
  base.delivery.evidenceRefs = ["evidence:delivery:1"];
  assert.equal(proof.deriveClaimDistance(base), "D2");
});

test("evidenced outcome can reach D3 but never becomes verified impact", () => {
  const base = records("PRODUCTION");
  base.delivery.status = "EVIDENCE_ATTACHED";
  base.delivery.evidenceRefs = ["evidence:delivery:1"];
  base.outcome.status = "INDEPENDENTLY_REVIEWED";
  base.outcome.claim = "A bounded proximate outcome was observed.";
  base.outcome.evidenceRefs = ["evidence:outcome:1"];
  const passport = proof.createProofPassport(passportInput({ environment: "PRODUCTION", ...base }));
  assert.equal(passport.claimDistance, "D3");
  assert.match(passport.outcomeClaim, /proximate outcome/i);
  assert.equal(passport.impactClaim, null);
  assert.equal(proof.proofPassportCanClaimImpact(passport), false);
});

test("D4 requires verified impact claim + method and passport evidence", () => {
  const base = records("PRODUCTION");
  base.delivery.status = "EVIDENCE_ATTACHED";
  base.delivery.evidenceRefs = ["evidence:delivery:1"];
  base.outcome.status = "INDEPENDENTLY_REVIEWED";
  base.outcome.claim = "A bounded proximate outcome was observed.";
  base.outcome.evidenceRefs = ["evidence:outcome:1"];
  base.impact.status = "VERIFIED";
  base.impact.claim = "Verified bounded impact claim.";
  base.impact.method = "Independent attribution method v1";
  const passport = proof.createProofPassport(passportInput({
    environment: "PRODUCTION",
    ...base,
    evidenceItems: [{
      id: "evidence:verification:1",
      kind: "VERIFICATION",
      sourceRef: "source:independent:1",
      capturedAt: "2026-09-07T00:00:00Z",
      verifierClass: "THIRD_PARTY",
      rights: "TEST_FIXTURE",
      limitations: [],
    }],
  }));
  assert.equal(passport.claimDistance, "D4");
  assert.match(passport.impactClaim, /verified bounded impact/i);
  assert.equal(proof.proofPassportCanClaimImpact(passport), true);
});

test("proof law hard-codes payment/delivery/outcome/impact separation", () => {
  assert.deepEqual(proof.PROOF_STATE_LAW, {
    paymentIsDelivery: false,
    deliveryIsOutcome: false,
    outcomeIsVerifiedImpact: false,
    testCanClaimPhysicalDelivery: false,
    testCanClaimImpact: false,
  });
});
