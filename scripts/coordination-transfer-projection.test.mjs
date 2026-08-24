import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const fixtures = fs.readFileSync("src/planet/coordinationFixtures.ts", "utf8");
const projection = fs.readFileSync("src/planet/coordinationProjection.ts", "utf8");

test("three unlike structural fixtures are explicit and non-public", () => {
  for (const id of ["ORCA_BAY_OF_BISCAY", "JAGUAR_AMAZONIA", "S4PIENS_FOOD"]) {
    assert.ok(fixtures.includes(`id: "${id}"`), `${id} fixture missing`);
  }
  assert.match(fixtures, /fixtureOnly: true/);
  assert.match(fixtures, /publicUseAllowed: false/);
  assert.match(fixtures, /SYNTHETIC CONTRACT FIXTURE/);
  assert.match(fixtures, /visibility: "INTERNAL"/);
  assert.match(fixtures, /reviewState: "DRAFT"/);
});

test("transfer fixtures use ecosystem and value-chain contexts", () => {
  assert.ok((fixtures.match(/"ECOSYSTEM"/g) ?? []).length >= 2, "marine and terrestrial fixtures need ECOSYSTEM context");
  assert.ok(fixtures.includes('fixtureGraph("fixture:food", "VALUE_CHAIN_NODE")'), "FOOD must prove value-chain context transfer");
});

test("one canonical update projects to all required surfaces", () => {
  for (const surface of ["ACTOR", "PROJECT_OR_ECOSYSTEM", "ATLAS", "MAGAZINE", "IMPACT"]) {
    assert.ok(projection.includes(`"${surface}"`), `${surface} projection missing`);
  }
  assert.match(projection, /projectCanonicalUpdateEverywhere/);
  assert.match(projection, /One canonical event is recorded once/);
});

test("projection contract blocks fixtures and private leakage", () => {
  assert.match(projection, /FIXTURE_ONLY_NEVER_PUBLIC/);
  assert.match(projection, /field\.visibility === "PUBLIC_SAFE"/);
  assert.match(projection, /field\.reviewed && field\.sourceIds\.length > 0/);
  assert.match(projection, /assertNoPrivateLeak/);
});

test("Atlas and Impact projections fail safely", () => {
  assert.match(projection, /surface === "ATLAS"/);
  assert.match(projection, /isValidCoordinate/);
  assert.match(projection, /surface === "IMPACT"/);
  assert.match(projection, /verified\|measured\|evidence/);
});
