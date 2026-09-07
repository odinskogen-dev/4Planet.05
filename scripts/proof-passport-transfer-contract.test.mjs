import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/impact/proofPassport.ts", import.meta.url), "utf8");
const withoutTypeImport = source.replace(/import type[^;]+;\n/, "");
const transpiled = ts.transpileModule(withoutTypeImport, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const proof = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);

function fixture(interventionType, unitDefinition, quantity, providerId) {
  const contribution = {
    recordType: "CONTRIBUTION",
    id: `contribution:test:${interventionType}`,
    unitId: `unit:test:${interventionType}`,
    quantity,
    status: "CREATED",
    environment: "TEST",
    createdAt: "2026-09-08T00:00:00Z",
    idempotencyKey: `test:${interventionType}`,
  };
  const delivery = {
    recordType: "DELIVERY",
    id: `delivery:test:${interventionType}`,
    contributionId: contribution.id,
    providerId,
    providerReference: "NO_PROVIDER_REQUEST",
    status: "NOT_DELIVERED",
    environment: "TEST",
    evidenceRefs: [],
  };
  const outcome = {
    recordType: "OUTCOME",
    id: `outcome:test:${interventionType}`,
    deliveryId: delivery.id,
    status: "NOT_ASSESSED",
    claim: null,
    evidenceRefs: [],
  };
  const impact = {
    recordType: "IMPACT",
    id: `impact:test:${interventionType}`,
    outcomeIds: [outcome.id],
    status: "NOT_ASSESSED",
    claim: null,
    method: null,
  };
  return proof.createProofPassport({
    id: `passport:test:${interventionType}`,
    actionId: `action:test:${interventionType}`,
    providerId,
    interventionType,
    unitDefinition,
    quantity,
    geography: null,
    contribution,
    delivery,
    outcome,
    impact,
    limitations: ["TEST transfer fixture only; no physical action."],
  });
}

test("the same Proof Passport runtime schema represents plastic and terrestrial interventions without redesign", () => {
  const plastic = fixture("VERIFIED_PLASTIC_RECOVERY", "test kg plastic recovery", 5, "provider:candidate:plastic");
  const terrestrial = fixture("INVASIVE_THREAT_REMOVAL", "test bounded treatment-area unit", 1, "actor:existing-restoration-program-context");

  assert.equal(plastic.claimDistance, "D0");
  assert.equal(terrestrial.claimDistance, "D0");
  assert.equal(plastic.depth, "LITE");
  assert.equal(terrestrial.depth, "LITE");
  assert.deepEqual(proof.validateProofPassport(plastic), []);
  assert.deepEqual(proof.validateProofPassport(terrestrial), []);
  assert.deepEqual(Object.keys(terrestrial).sort(), Object.keys(plastic).sort());
});

test("terrestrial Decision Trace preserves treatment→recovery claim distance rather than inventing a new state machine", () => {
  const trace = proof.createDecisionTrace({
    id: "DT-TC02-TEST",
    cellId: "CELL-TC02-INVASIVE-THREAT-REMOVAL",
    inputRealityIds: ["baseline:open-calcareous-ground"],
    sourceRefs: ["miljodirektoratet:open-calcareous-ground-monitoring"],
    interpretationRefs: [],
    alternatives: ["continue existing management", "adjust treatment", "no new 4PLANET intervention"],
    constraints: [
      "TREATED != TARGET REDUCED",
      "TARGET REDUCED != NATIVE RESPONSE",
      "NATIVE RESPONSE != ESTABLISHED",
      "ESTABLISHED != ECOSYSTEM RECOVERY",
    ],
    incentives: ["reuse existing monitoring and actor authority"],
    decision: null,
    resourceFlowId: null,
    executionId: null,
    resultId: null,
    evidenceRefs: [],
    learningRecordId: null,
  });
  assert.equal(trace.status, "PRE_DECISION");
  assert.equal(trace.cellId, "CELL-TC02-INVASIVE-THREAT-REMOVAL");
});
