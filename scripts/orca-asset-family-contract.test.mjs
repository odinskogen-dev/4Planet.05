import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

test("Orca has one canonical asset family across SPECIES and ATLAS",async()=>{
  const family=await readFile(new URL("../src/data/orcaAssetFamily.ts",import.meta.url),"utf8");
  const species=await readFile(new URL("../src/pages/integrated/Species.tsx",import.meta.url),"utf8");
  const layers=await readFile(new URL("../src/earth/layers.ts",import.meta.url),"utf8");
  const manifest=JSON.parse(await readFile(new URL("../public/assets/species/orca/ASSET-MANIFEST.json",import.meta.url),"utf8"));
  assert.equal(manifest.assetId,"4p:species:orca:asset-pack:v1");
  assert.match(family,/4p:species:orca:asset-pack:v1/);
  assert.match(species,/ORCA_ASSET_FAMILY\.id/);
  assert.match(species,/OPEN ASSET MANIFEST/);
  assert.match(layers,/isOrcaScientificName/);
  assert.match(layers,/REPRESENTATION CONTEXT, NOT OCCURRENCE EVIDENCE/);
});

test("Orca manifest preserves reconstructed vs measured truth boundary",async()=>{
  const manifest=JSON.parse(await readFile(new URL("../public/assets/species/orca/ASSET-MANIFEST.json",import.meta.url),"utf8"));
  assert.match(manifest.truthBoundary,/not automatically.*scientifically measured/i);
  assert.match(manifest.surfaceProof.truthBoundary,/does not prove identical geometry/i);
  const gameMesh=manifest.runtimeAssets.find((x)=>x.class==="reference_grounded_game_3d");
  assert.ok(gameMesh);
  assert.match(gameMesh.note,/Not measured anatomy/i);
});
