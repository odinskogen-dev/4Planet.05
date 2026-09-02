import test from "node:test";
import assert from "node:assert/strict";
import {
  ACTIVATION_PROOF_BASE_IDS,
  activationProofBuildKey,
  activationProofId,
  activationProofIds,
  isCurrentActivationProofId,
} from "./activationProofIdentity";

const BUILD_A = "a".repeat(40);
const BUILD_B = "b".repeat(40);

test("activation proof IDs are bound to exact Factory build identity", () => {
  const idsA = activationProofIds(BUILD_A);
  const idsB = activationProofIds(BUILD_B);
  assert.equal(idsA.length, 3);
  assert.equal(idsB.length, 3);
  assert.notDeepEqual(idsA, idsB);
  assert.equal(idsA[0], "factory-real-species-evidence-affordance-aaaaaaaaaaaa");
});

test("an old blocked or accepted proof can never certify a later Factory build", () => {
  const oldId = activationProofId(ACTIVATION_PROOF_BASE_IDS[1], BUILD_A);
  assert.equal(isCurrentActivationProofId(oldId, BUILD_A), true);
  assert.equal(isCurrentActivationProofId(oldId, BUILD_B), false);
});

test("invalid build identity fails closed", () => {
  assert.throws(() => activationProofBuildKey("latest"), /BUILD_SHA_INVALID/);
  assert.throws(() => activationProofId("proof-without-version", BUILD_A), /BASE_ID_INVALID/);
});
