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
    createdAt: "2026-09-08T00:00:00Z",
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

const providerEvidence = {
  id: "evidence:provider:1",
  kind: "DELIVERY",
  sourceRef: "source:provider:1",
  capturedAt: "2026-09-08T00:00:00Z",
  actionId: "action:test:plastic:1",
  providerId: "provider:test",
  verifierClass: "PROVIDER",
  relationship: "DELIVERY_LINKED",
  rights: "INTERNAL_TEST",
  limitations: ["Provider-originated evidence."],
};

const independentVerification = {
  id: "evidence:verification:1",
  kind: "VERIFICATION",
  sourceRef: "source:independent:1",
  capturedAt: "2026-09-08T00:00:00Z",
  actionId: "action:test:plastic:1",
  providerId: "provider:test",
  impactId: "impact:test:1",
  verifierClass: "THIRD_PARTY",
  relationship: "IMPACT_LINKED",
  rights: "INTERNAL_TEST",
  limitations: [],
};

test("TEST/FIXTURE state is pinned to D0 and Passport LITE", () => {
  const passport = proof.createProofPassport(passportInput());
  assert.equal(passport.claimDistance, "D0");
  assert.equal(passport.depth, "LITE");
  assert.match(passport.disclosure, /NO REAL PURCHASE OR PHYSICAL DELIVERY/i);
  assert.equal(passport.deliveryClaim, null);
  assert.equal(passport.outcomeClaim, null);
  assert.equal(passport.impactClaim, null);
  assert.equal(proof.proofPassportCanClaimImpact(passport), false);
  assert.deepEqual(proof.validateProofPassport(passport), []);
});

test("production contribution confirmation alone reaches at most D1 and remains LITE without evidence identity", () => {
  const base = records("PRODUCTION");
  const passport = proof.createProofPassport(passportInput({ environment: "PRODUCTION", ...base }));
  assert.equal(passport.claimDistance, "D1");
  assert.equal(passport.depth, "LITE");
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

test("production delivery + unique allocation + provider evidence can become STANDARD but not VERIFIED", () => {
  const base = records("PRODUCTION");
  base.delivery.status = "EVIDENCE_ATTACHED";
  base.delivery.evidenceRefs = ["evidence:delivery:1"];
  const passport = proof.createProofPassport(passportInput({
    environment: "PRODUCTION",
    ...base,
    evidenceItems: [providerEvidence],
    uniqueClaimOrAllocationId: "claim:unique:1",
    doubleCountState: "UNIQUE_CLAIM_ID",
  }));
  assert.equal(passport.claimDistance, "D2");
  assert.equal(passport.depth, "STANDARD");
  assert.equal(proof.proofPassportCanClaimImpact(passport), false);
  assert.deepEqual(proof.validateProofPassport(passport), []);
});

test("provider-labelled verification can never self-promote Passport VERIFIED", () => {
  const base = records("PRODUCTION");
  base.delivery.status = "EVIDENCE_ATTACHED";
  base.delivery.evidenceRefs = ["evidence:delivery:1"];
  const providerVerification = { ...independentVerification, id: "evidence:provider-verification:1", verifierClass: "PROVIDER" };
  const passport = proof.createProofPassport(passportInput({
    environment: "PRODUCTION",
    ...base,
    evidenceItems: [providerVerification],
    uniqueClaimOrAllocationId: "claim:unique:1",
    doubleCountState: "INDEPENDENTLY_CHECKED",
    lastVerifiedAt: "2026-09-08T00:00:00Z",
  }));
  assert.equal(passport.depth, "STANDARD");
  assert.equal(proof.proofPassportCanClaimImpact(passport), false);
});

test("context-only third-party evidence cannot self-promote Passport VERIFIED or impact eligibility", () => {
  const base = records("PRODUCTION");
  base.delivery.status = "EVIDENCE_ATTACHED";
  base.delivery.evidenceRefs = ["evidence:delivery:1"];
  base.outcome.status = "INDEPENDENTLY_REVIEWED";
  base.outcome.claim = "A bounded proximate outcome was observed.";
  base.outcome.evidenceRefs = ["evidence:outcome:1"];
  base.impact.status = "VERIFIED";
  base.impact.claim = "Verified bounded impact claim.";
  base.impact.method = "Independent attribution method v1";
  const contextOnly = { ...independentVerification, id: "evidence:context:1", relationship: "CONTEXT_ONLY" };
  const passport = proof.createProofPassport(passportInput({
    environment: "PRODUCTION",
    ...base,
    evidenceItems: [providerEvidence, contextOnly],
    uniqueClaimOrAllocationId: "claim:unique:1",
    doubleCountState: "INDEPENDENTLY_CHECKED",
    lastVerifiedAt: "2026-09-08T00:00:00Z",
  }));
  assert.equal(passport.depth, "STANDARD");
  assert.equal(proof.proofPassportCanClaimImpact(passport), false);
});

test("context-only evidence alone cannot advance proof depth or emit an impact claim", () => {
  const base = records("PRODUCTION");
  base.delivery.status = "EVIDENCE_ATTACHED";
  base.delivery.evidenceRefs = ["evidence:delivery:1"];
  base.outcome.status = "INDEPENDENTLY_REVIEWED";
  base.outcome.claim = "A bounded proximate outcome was observed.";
  base.outcome.evidenceRefs = ["evidence:outcome:1"];
  base.impact.status = "VERIFIED";
  base.impact.claim = "Verified bounded impact claim.";
  base.impact.method = "Independent attribution method v1";
  const contextOnly = { ...independentVerification, id: "evidence:context-only:1", relationship: "CONTEXT_ONLY" };
  const passport = proof.createProofPassport(passportInput({
    environment: "PRODUCTION",
    ...base,
    evidenceItems: [contextOnly],
    uniqueClaimOrAllocationId: "claim:unique:1",
    doubleCountState: "UNIQUE_CLAIM_ID",
  }));
  assert.equal(passport.claimDistance, "D4");
  assert.equal(passport.depth, "LITE");
  assert.equal(passport.impactClaim, null);
  assert.equal(proof.proofPassportCanClaimImpact(passport, base), false);
});

test("evidenced outcome can reach D3 without becoming verified impact", () => {
  const base = records("PRODUCTION");
  base.delivery.status = "EVIDENCE_ATTACHED";
  base.delivery.evidenceRefs = ["evidence:delivery:1"];
  base.outcome.status = "INDEPENDENTLY_REVIEWED";
  base.outcome.claim = "A bounded proximate outcome was observed.";
  base.outcome.evidenceRefs = ["evidence:outcome:1"];
  const passport = proof.createProofPassport(passportInput({
    environment: "PRODUCTION",
    ...base,
    evidenceItems: [providerEvidence],
    uniqueClaimOrAllocationId: "claim:unique:1",
    doubleCountState: "UNIQUE_CLAIM_ID",
  }));
  assert.equal(passport.claimDistance, "D3");
  assert.equal(passport.depth, "STANDARD");
  assert.match(passport.outcomeClaim, /proximate outcome/i);
  assert.equal(passport.impactClaim, null);
  assert.equal(proof.proofPassportCanClaimImpact(passport), false);
});

test("D4 claim eligibility requires Passport VERIFIED + third-party verification + independent double-count check", () => {
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
    evidenceItems: [providerEvidence, independentVerification],
    uniqueClaimOrAllocationId: "claim:unique:1",
    doubleCountState: "INDEPENDENTLY_CHECKED",
    lastVerifiedAt: "2026-09-08T00:00:00Z",
  }));
  assert.equal(passport.claimDistance, "D4");
  assert.equal(passport.depth, "VERIFIED");
  assert.match(passport.impactClaim, /verified bounded impact/i);
  assert.equal(proof.proofPassportCanClaimImpact(passport, base), true);
  assert.deepEqual(proof.validateProofPassport(passport), []);

  const unsafeVariants = [
    ["missing verification timestamp", { evidenceItems: [{ ...independentVerification, capturedAt: null }] }],
    ["invalid verification timestamp", { evidenceItems: [{ ...independentVerification, capturedAt: "not-a-date" }] }],
    ["future verification timestamp", { evidenceItems: [{ ...independentVerification, capturedAt: "2099-01-01T00:00:00Z" }] }],
    ["missing review timestamp", { lastVerifiedAt: null }],
    ["invalid review timestamp", { lastVerifiedAt: "2026-02-30T00:00:00Z" }],
    ["future review timestamp", { lastVerifiedAt: "2099-01-01T00:00:00Z" }],
    ["review predates evidence", { lastVerifiedAt: "2026-09-07T23:59:59Z" }],
    ["foreign action evidence", { evidenceItems: [{ ...independentVerification, actionId: "action:other" }] }],
    ["foreign provider evidence", { evidenceItems: [{ ...independentVerification, providerId: "provider:other" }] }],
    ["foreign impact evidence", { evidenceItems: [{ ...independentVerification, impactId: "impact:other" }] }],
  ];

  for (const [label, changes] of unsafeVariants) {
    const unsafe = { ...passport, ...changes };
    assert.equal(proof.proofPassportCanClaimImpact(unsafe, base), false, label);
    assert.ok(proof.validateProofPassport(unsafe).length > 0, label);
  }

  const callerForged = {
    ...passport,
    doubleCountState: "UNIQUE_CLAIM_ID",
  };
  assert.equal(proof.proofPassportCanClaimImpact(callerForged, base), false, "caller flags cannot bypass independent double-count control");
  assert.equal(proof.proofPassportCanClaimImpact(passport), false, "caller flags without canonical source records cannot claim impact");
  assert.equal(proof.proofPassportCanClaimImpact(passport, {
    ...base,
    delivery: { ...base.delivery, providerId: "provider:other" },
  }), false, "foreign delivery provider cannot claim impact");

  assert.equal(proof.proofPassportCanClaimImpact({
    ...passport,
    impactClaim: "A different impact claim.",
  }, base), false, "displayed impact claim must match the canonical impact record");
  assert.equal(proof.proofPassportCanClaimImpact({
    ...passport,
    quantity: passport.quantity + 1,
  }, base), false, "displayed quantity must match the canonical contribution record");
  assert.equal(proof.proofPassportCanClaimImpact({
    ...passport,
    evidenceItems: [{ ...independentVerification, sourceRef: "" }],
  }, base), false, "independent verification requires a source reference");
});

test("VVL maturity is sequential and cannot skip missing earlier value gates", () => {
  const none = {
    externalValueEvidence: false,
    decisionChanged: false,
    economicOrOperationalValueMeasured: false,
    realResourceFlow: false,
    deliveryDocumented: false,
    outcomeObserved: false,
    learningReturned: false,
    mechanismReplicated: false,
    thirdPartyDependency: false,
  };
  assert.equal(proof.deriveVvlLevel(none), 0);
  assert.equal(proof.deriveVvlLevel({ ...none, realResourceFlow: true, deliveryDocumented: true }), 0);
  assert.equal(proof.deriveVvlLevel({ ...none, externalValueEvidence: true }), 1);
  assert.equal(proof.deriveVvlLevel({
    ...none,
    externalValueEvidence: true,
    decisionChanged: true,
    economicOrOperationalValueMeasured: true,
    realResourceFlow: true,
    deliveryDocumented: true,
  }), 5);
});

test("DecisionTrace is a projection and advances only when referenced states exist", () => {
  const pre = {
    id: "decision-trace:test:1",
    cellId: "cell:test:1",
    inputRealityIds: ["need:test:1"],
    sourceRefs: ["source:test:1"],
    interpretationRefs: [],
    alternatives: ["do nothing", "fund recovery"],
    constraints: ["test only"],
    incentives: [],
    decision: null,
    resourceFlowId: null,
    executionId: null,
    resultId: null,
    evidenceRefs: [],
    learningRecordId: null,
  };
  assert.equal(proof.createDecisionTrace(pre).status, "PRE_DECISION");
  assert.equal(proof.createDecisionTrace({ ...pre, decision: "fund recovery" }).status, "DECIDED");
  assert.equal(proof.createDecisionTrace({ ...pre, decision: "fund recovery", executionId: "execution:1" }).status, "EXECUTED");
  assert.equal(proof.createDecisionTrace({ ...pre, decision: "fund recovery", executionId: "execution:1", resultId: "result:1", evidenceRefs: ["evidence:1"] }).status, "EVIDENCED");
  assert.equal(proof.createDecisionTrace({ ...pre, learningRecordId: "learning:1" }).status, "LEARNED");
});

test("proof law hard-codes payment/delivery/outcome/impact and provider-verification separation", () => {
  assert.deepEqual(proof.PROOF_STATE_LAW, {
    paymentIsDelivery: false,
    deliveryIsOutcome: false,
    outcomeIsVerifiedImpact: false,
    providerClaimIsIndependentVerification: false,
    testCanClaimPhysicalDelivery: false,
    testCanClaimImpact: false,
  });
});
