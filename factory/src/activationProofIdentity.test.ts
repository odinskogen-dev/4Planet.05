import test from "node:test";
import assert from "node:assert/strict";
import {
  ACTIVATION_PROOF_BASE_IDS,
  POST_ACTIVATION_TORTURE_BASE_IDS,
  activationProofBuildKey,
  activationProofId,
  activationProofIds,
  isCurrentActivationProofId,
} from "./activationProofIdentity";

const BUILD_A = "a".repeat(40);
const BUILD_B = "b".repeat(40);

test("bounded ACTIVE boot proof ID is bound to exact Factory build identity", () => {
  const idsA = activationProofIds(BUILD_A);
  const idsB = activationProofIds(BUILD_B);
  assert.equal(idsA.length, 1);
  assert.equal(idsB.length, 1);
  assert.notDeepEqual(idsA, idsB);
  assert.equal(idsA[0], "factory-real-species-evidence-affordance-aaaaaaaaaaaa");
  assert.deepEqual(POST_ACTIVATION_TORTURE_BASE_IDS, [
    "factory-real-bay-accessibility-01",
    "factory-real-actor-relationship-a11y-01",
  ]);
});

test("an old blocked or accepted boot proof can never certify a later Factory build", () => {
  const oldId = activationProofId(ACTIVATION_PROOF_BASE_IDS[0], BUILD_A);
  assert.equal(isCurrentActivationProofId(oldId, BUILD_A), true);
  assert.equal(isCurrentActivationProofId(oldId, BUILD_B), false);
});

test("invalid build identity fails closed", () => {
  assert.throws(() => activationProofBuildKey("latest"), /BUILD_SHA_INVALID/);
  assert.throws(() => activationProofId("proof-without-version", BUILD_A), /BASE_ID_INVALID/);
});
