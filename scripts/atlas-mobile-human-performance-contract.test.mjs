import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const world = read("src/earth/World.tsx");
const worldCss = read("src/earth/world.css");
const leadingCss = read("src/earth/atlas-leading.css");
const publicWorld = read("src/earth/PublicWorld.tsx");
const saved = read("src/earth/AtlasSavedViews.tsx");
const time = read("src/earth/AtlasTimeControls.tsx");
const evidence = read("src/earth/AtlasLiveEvidenceBridge.tsx");
const migration = read("supabase/migrations/20261007122600_four_planet_atlas_state.sql");

test("mobile search is integrated into the canonical React surface", () => {
  assert.doesNotMatch(publicWorld, /<AtlasSearchIntentBridge\s*\/>/);
  assert.match(world, /atlasLayerIntentMatches/);
  assert.match(world, /search-active/);
  assert.match(world, /layerHits\.map/);
});

test("ATLAS eliminates the worst invisible recurring work", () => {
  assert.doesNotMatch(world, /setInterval\([^\n]*1000\)/);
  assert.match(world, /setInterval\(tick, 30000\)/);
  assert.match(world, /maxTileCacheSize: window\.matchMedia/);
  assert.doesNotMatch(time, /setInterval\(readActive, 600\)/);
  assert.match(time, /style\.load/);
  assert.doesNotMatch(evidence, /setInterval\(refresh, 900\)/);
  assert.match(evidence, /setInterval\(refresh, 15000\)/);
  assert.match(world, /ONE SIGNAL POOL, ON DEMAND/);
  assert.match(world, /ensureSignalPool/);
  assert.match(world, /if \(lens === "EARTH"\) return/);
});

test("one mobile work surface owns the viewport and controls are rounded", () => {
  for (const token of [
    "body:has(.world.search-active)",
    "body:has(.world.context-active)",
    "body:has(.world.lens-active)",
    "body:has(.world.layers-active)",
    "border-radius: 999px",
  ]) assert.ok(worldCss.includes(token), `missing ${token}`);
  assert.match(leadingCss, /atlas-saved-views\.open/);
  assert.match(leadingCss, /body:has\(\.atlas-saved-views\.open\)/);
  assert.match(worldCss, /height:\s*100dvh/);
  assert.match(world, /window\.visualViewport\?\.addEventListener\("resize"/);
  assert.match(saved, /4p:atlas-surface-open/);
  assert.match(time, /4p:atlas-surface-open/);
  assert.doesNotMatch(time, /"sourcedata"/);
});

test("My Atlas remains anonymous-capable but syncs through user-owned RLS when signed in", () => {
  assert.match(saved, /identityLoginUrl/);
  assert.match(saved, /readAtlasAccountState/);
  assert.match(saved, /writeAtlasAccountState/);
  assert.match(migration, /four_planet_atlas_state_owner/);
  assert.match(migration, /to authenticated/);
  assert.match(migration, /revoke all .* from anon/i);
});
