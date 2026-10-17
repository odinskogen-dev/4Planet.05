import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

test("PLACE CELL composes existing source adapters and stays partial/fail-honest",async()=>{
  const api=await readFile(new URL("../functions/api/place-intelligence.ts",import.meta.url),"utf8");
  assert.match(api,/\/api\/gem-assets/);
  assert.match(api,/\/api\/climate-trace/);
  assert.match(api,/REGISTERED_NOT_ACTIVE/);
  assert.match(api,/not a complete assessment/i);
  assert.match(api,/Missing records mean source coverage or query absence, not real-world absence/i);
});

test("Oslofjord public PLACE route exposes one shared intelligence object and S4PIENS boundary",async()=>{
  const page=await readFile(new URL("../src/pages/integrated/Places.tsx",import.meta.url),"utf8");
  const panel=await readFile(new URL("../src/components/place/PlaceLiveIntelligence.tsx",import.meta.url),"utf8");
  assert.match(page,/PlaceLiveIntelligence/);
  assert.match(page,/gem-energy-no/);
  assert.match(panel,/Understand this place/);
  assert.match(panel,/WorldPop/);
  assert.match(panel,/AlphaEarth/);
  assert.doesNotMatch(panel,/4SAPIEN/i);
});
