import assert from "node:assert/strict";
import test from "node:test";
import { createRealProjectProofCases } from "./realProjectProof";

test("real activation proof keeps each package to one bounded mutation attempt", () => {
  const cases = createRealProjectProofCases("a".repeat(40), "2026-09-02T00:00:00.000Z");

  assert.equal(cases.length, 3);
  for (const proof of cases) {
    assert.equal(proof.pkg.autonomous?.maxCorrectionAttempts, 1);
  }
});
