import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

test("GEM Atlas slice is bounded and exposes ownership without overclaiming",async()=>{
  const assets=await readFile(new URL("../functions/api/gem-assets.ts",import.meta.url),"utf8");
  const ownership=await readFile(new URL("../functions/api/gem-ownership.ts",import.meta.url),"utf8");
  const layer=await readFile(new URL("../src/earth/atlasResourceExtensions.ts",import.meta.url),"utf8");
  assert.match(assets,/api\.globalenergymonitor\.org/);
  assert.match(assets,/Global Energy Monitor/);
  assert.match(assets,/do not by themselves establish current operation, emissions, legal responsibility or ecological effect/i);
  assert.match(ownership,/\/ownership\/graph/);
  assert.match(ownership,/LEI\/PermID/);
  assert.match(layer,/country=Norway/);
  assert.match(layer,/OWNER/);
  assert.match(layer,/ownershipEndpoint/);
  assert.doesNotMatch(layer,/owner ≠ responsibility/i); // UI uses uppercase factual boundaries instead of Unicode inequality.
});

test("S4PIENS owns human-system ATLAS domain; resource extension never names 4SAPIEN",async()=>{
  const layer=await readFile(new URL("../src/earth/atlasResourceExtensions.ts",import.meta.url),"utf8");
  assert.match(layer,/dom:"S4PIENS"/);
  assert.doesNotMatch(layer,/4SAPIEN/i);
});
