import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAutomationPreflight } from "./automationPreflight";
import { createRealProjectProofCases } from "./realProjectProof";

test("real activation proof keeps each package to one bounded mutation attempt", () => {
  const cases = createRealProjectProofCases("a".repeat(40), "2026-09-02T00:00:00.000Z");

  assert.equal(cases.length, 3);
  for (const proof of cases) {
    assert.equal(proof.pkg.autonomous?.maxCorrectionAttempts, 1);
  }
});

test("real activation proof carries valid QUESTION DELETE SIMPLIFY evidence into every package", () => {
  const cases = createRealProjectProofCases("a".repeat(40), "2026-09-02T00:00:00.000Z");

  for (const proof of cases) {
    const decision = evaluateAutomationPreflight(proof.pkg);
    assert.equal(decision.ok, true, `${proof.project.id} must pass automation preflight before resource reservation`);
  }
});
