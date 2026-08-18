import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const speciesSource = readFileSync(new URL("../src/data/species.ts", import.meta.url), "utf8");

test("Jaguar public profile does not overstate ecological condition from presence", () => {
  assert.doesNotMatch(speciesSource, /whose presence signals connected, functioning forest/i);
  assert.match(speciesSource, /Local population status and ecological condition require place-specific evidence/i);
  assert.match(speciesSource, /occurrence record alone cannot show whether a corridor is functional/i);
});

test("Jaguar Gold truth carries a current named source and explicit occurrence boundary", () => {
  assert.match(speciesSource, /Panthera Jaguar Program/);
  assert.match(speciesSource, /checkedAt: "2026-08-18"/);
  assert.match(speciesSource, /does not establish current presence, abundance or population status at a particular mapped point/i);
});
