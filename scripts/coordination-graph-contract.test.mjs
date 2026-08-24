import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const coordination = fs.readFileSync("src/planet/coordinationGraph.ts", "utf8");
const sourceGraph = fs.readFileSync("src/planet/sourceGraph.ts", "utf8");

test("Problem is upstream and actionable gaps are derived", () => {
  const problem = coordination.indexOf('"PROBLEM",\n  "PLACE / ECOSYSTEM / VALUE_CHAIN_NODE"');
  const gap = coordination.indexOf('"ACTIONABLE_GAP",\n  "SOLUTION / INNOVATION"');
  const action = coordination.indexOf('"PROJECT / ACTION",\n  "RESULT"');
  assert.ok(problem >= 0, "Problem-first chain must exist");
  assert.ok(gap > problem, "Actionable gap must follow Problem/context/evidence");
  assert.ok(action > gap, "Action must follow gap/solution/actor/capital");
  assert.match(coordination, /DERIVES_GAP: \{ from: \["PROBLEM"\], to: \["ACTIONABLE_GAP"\] \}/);
  assert.match(coordination, /ORPHAN_ACTIONABLE_GAP/);
});

test("capital object types stay distinct", () => {
  for (const kind of ["CAPITAL_ACTOR", "CAPITAL_INSTRUMENT", "CAPITAL_NEED"]) {
    assert.ok(coordination.includes(`"${kind}"`), `${kind} must be first-class`);
  }
  assert.match(coordination, /A large capital opportunity never overrides failed eligibility or failed delivery truth/);
});

test("matching is explainable and fails closed", () => {
  for (const gate of ["ELIGIBILITY", "DELIVERY_TRUTH", "RIGHTS", "FRESHNESS", "AUTHORITY"]) {
    assert.ok(coordination.includes(`"${gate}"`), `${gate} hard gate missing`);
  }
  assert.match(coordination, /gate\.state !== "PASS"/);
  assert.match(coordination, /blockers\.length \? "BLOCKED" : "ELIGIBLE_FOR_REVIEW"/);
  assert.match(coordination, /hasOpaqueCompositeScore/);
});

test("public projection is allowlisted and provenance-bearing", () => {
  assert.match(coordination, /publicCoordinationProjection/);
  assert.match(coordination, /node\.visibility === "PUBLIC_SAFE"/);
  assert.match(coordination, /edge\.sourceIds\.length > 0/);
  assert.match(coordination, /PUBLIC_EDGE_LEAK/);
});

test("three unlike Gold transfer contexts are explicit", () => {
  assert.match(coordination, /ORCA_BAY_OF_BISCAY/);
  assert.match(coordination, /JAGUAR_AMAZONIA/);
  assert.match(coordination, /S4PIENS_FOOD/);
});

test("recovered Source Graph retains semantic hard stops", () => {
  for (const statement of [
    "Institution is not a dataset.",
    "Observation is not a model output.",
    "No record is not confirmed absence.",
    "Attribution is not partnership.",
    "Public data is not proof of 4PLANET impact.",
  ]) {
    assert.ok(sourceGraph.includes(statement), `missing source hard stop: ${statement}`);
  }
  assert.match(sourceGraph, /validateSourceGraph/);
});
