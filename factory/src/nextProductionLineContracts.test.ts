import test from "node:test";
import assert from "node:assert/strict";
import { getNextProductionLineContract } from "./nextProductionLineContracts";

test("next production lines reuse existing authorities instead of creating parallel systems", () => {
  const actor = getNextProductionLineContract("ACTOR");
  const solution = getNextProductionLineContract("SOLUTION");
  const choice = getNextProductionLineContract("CHOICE");
  const capital = getNextProductionLineContract("CAPITAL");

  assert.match(actor.authority, /ACTOR GRAPH/i);
  assert.match(solution.forbiddenParallelSystem, /No solution catalogue/i);
  assert.match(choice.authority, /FOOD|S4PIENS|EMBLA/i);
  assert.match(capital.authority, /Capital Conversion Factory/i);
  assert.match(capital.activationGate.join(" "), /Founder release/i);
});

test("operative First-Plank lines cannot be mistaken for NEXT contracts", () => {
  assert.throws(() => getNextProductionLineContract("SPECIES_JOURNEY"), /already an operative/);
  assert.throws(() => getNextProductionLineContract("ECOSYSTEM_PLACE"), /already an operative/);
  assert.throws(() => getNextProductionLineContract("STORY"), /already an operative/);
});
