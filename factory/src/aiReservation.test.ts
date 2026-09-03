import assert from "node:assert/strict";
import test from "node:test";
import { factoryCandidateBranch, shouldReserveAiForCandidate } from "./aiReservation";

const BASE = "a".repeat(40);
const CANDIDATE = "b".repeat(40);

test("AI reservation is required before a first material candidate mutation", () => {
  assert.equal(shouldReserveAiForCandidate(undefined, BASE), true);
  assert.equal(shouldReserveAiForCandidate(BASE, BASE), true);
});

test("pure CI/browser re-observation does not consume another AI reservation", () => {
  assert.equal(shouldReserveAiForCandidate(CANDIDATE, BASE), false);
});

test("unknown or malformed candidate identity fails closed to reservation", () => {
  assert.equal(shouldReserveAiForCandidate("not-a-sha", BASE), true);
  assert.equal(shouldReserveAiForCandidate(CANDIDATE, "bad-base"), true);
});

test("candidate branch derivation exactly preserves Factory namespace and slug bound", () => {
  assert.equal(
    factoryCandidateBranch("factory-real-actor-relationship-a11y-7a99244c189f"),
    "factory-candidate-factory-real-actor-relationship-a11y-7a99244c189f".slice(0, "factory-candidate-".length + 50),
  );
  assert.equal(factoryCandidateBranch("ignored", "factory-candidate-explicit"), "factory-candidate-explicit");
});
