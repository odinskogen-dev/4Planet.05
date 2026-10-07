import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const views = read("src/planet/atlasViews.ts");
const ui = read("src/earth/AtlasSavedViews.tsx");
const publicWorld = read("src/earth/PublicWorld.tsx");
const world = read("src/earth/World.tsx");
const connectors = read("src/planet/connectors.ts");

test("V37CX layer/search capability already present in current Earth", () => {
  for (const token of ["ISOLATE", "WHAT IS HAPPENING HERE", "NDVI", "SEA ICE", "PRECIPITATION", "ACTIVE FIRES"]) assert.match(world, new RegExp(token));
  assert.match(connectors, /AbortController/);
  assert.match(connectors, /searchTaxa/);
});

test("My Atlas remains local-first and adds optional 4PLANET ID persistence", () => {
  assert.match(views, /4planet-atlas-saved-views-v1/);
  assert.match(views, /readAtlasSavedViews/);
  assert.match(views, /captureAtlasView/);
  assert.match(views, /4p:atlas-views/);
  assert.match(views, /malformed|catch/i);
  assert.match(ui, /MY ATLAS/);
  assert.match(ui, /SAVE VIEW/);
  assert.match(ui, /4PLANET ID/);
  assert.match(ui, /readAtlasAccountState/);
  assert.match(ui, /writeAtlasAccountState/);
  assert.match(publicWorld, /<AtlasSavedViews/);
});
