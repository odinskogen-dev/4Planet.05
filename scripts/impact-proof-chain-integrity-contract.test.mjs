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

function completeProductionChain() {
  const contribution = {
    recordType: "CONTRIBUTION",
    id: "contribution:production:1",
    unitId: "impact-unit:plastic:1",
    quantity: 100,
    status: "CONFIRMED",
    environment: "PRODUCTION",
    createdAt: "2026-10-03T00:00:00Z",
    idempotencyKey: "impact-chain-integrity:1",
  };
  const delivery = {
    recordType: "DELIVERY",
    id: "delivery:production:1",
    contributionId: contribution.id,
    providerId: "provider:production:1",
    status: "EVIDENCE_ATTACHED",
    environment: "PRODUCTION",
    providerReference: "provider-reference:1",
    evidenceRefs: ["evidence:delivery:1"],
  };
  const outcome = {
    recordType: "OUTCOME",
    id: "outcome:production:1",
    deliveryId: delivery.id,
    status: "INDEPENDENTLY_REVIEWED",
    claim: "A bounded proximate outcome was observed.",
    evidenceRefs: ["evidence:outcome:1"],
  };
  const impact = {
    recordType: "IMPACT",
    id: "impact:production:1",
    outcomeIds: [outcome.id],
    status: "VERIFIED",
    claim: "A bounded impact claim was independently verified.",
    method: "Independent attribution method v1",
  };
  return { contribution, delivery, outcome, impact };
}

test("delivery evidence from another contribution cannot advance this passport beyond D1", () => {
  const chain = completeProductionChain();
  chain.delivery.contributionId = "contribution:another-action";
  assert.equal(proof.deriveClaimDistance(chain), "D1");
});

test("outcome evidence from another delivery cannot advance this passport beyond D2", () => {
  const chain = completeProductionChain();
  chain.outcome.deliveryId = "delivery:another-action";
  assert.equal(proof.deriveClaimDistance(chain), "D2");
});

test("impact evidence that excludes this outcome cannot advance this passport beyond D3", () => {
  const chain = completeProductionChain();
  chain.impact.outcomeIds = ["outcome:another-action"];
  assert.equal(proof.deriveClaimDistance(chain), "D3");
});

test("verified impact metadata cannot skip missing delivery and outcome proof gates", () => {
  const chain = completeProductionChain();
  chain.delivery.status = "NOT_DELIVERED";
  chain.delivery.evidenceRefs = [];
  chain.outcome.status = "NOT_ASSESSED";
  chain.outcome.claim = null;
  chain.outcome.evidenceRefs = [];
  assert.equal(proof.deriveClaimDistance(chain), "D1");
});

test("an intact linked production chain reaches D4", () => {
  assert.equal(proof.deriveClaimDistance(completeProductionChain()), "D4");
});

test("test records remain D0 even with later proof metadata", () => {
  const chain = completeProductionChain();
  chain.contribution.environment = "TEST";
  chain.delivery.environment = "TEST";
  assert.equal(proof.deriveClaimDistance(chain), "D0");
});

test("production chain advances sequentially through D0, D1, D2 and D3", () => {
  const chain = completeProductionChain();
  chain.contribution.status = "CREATED";
  assert.equal(proof.deriveClaimDistance(chain), "D0");

  chain.contribution.status = "CONFIRMED";
  chain.delivery.status = "SCHEDULED";
  chain.delivery.evidenceRefs = [];
  assert.equal(proof.deriveClaimDistance(chain), "D1");

  chain.delivery.status = "EVIDENCE_ATTACHED";
  chain.delivery.evidenceRefs = ["evidence:delivery:1"];
  chain.outcome.status = "NOT_ASSESSED";
  chain.outcome.claim = null;
  chain.outcome.evidenceRefs = [];
  assert.equal(proof.deriveClaimDistance(chain), "D2");

  chain.outcome.status = "INDEPENDENTLY_REVIEWED";
  chain.outcome.claim = "A bounded proximate outcome was observed.";
  chain.outcome.evidenceRefs = ["evidence:outcome:1"];
  chain.impact.status = "EVIDENCED";
  assert.equal(proof.deriveClaimDistance(chain), "D3");
});
