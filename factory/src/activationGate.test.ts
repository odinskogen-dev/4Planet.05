import test from "node:test";
import assert from "node:assert/strict";
import { runActivationGateSimulation } from "./activationSimulation";

test("global ACTIVE gate fails closed for every simulated missing proof", () => {
  const result = runActivationGateSimulation();
  const failures = result.cases.filter((item) => !item.passed);
  assert.equal(result.passed, true, JSON.stringify(failures, null, 2));
  assert.ok(result.cases.length >= 10);
});
