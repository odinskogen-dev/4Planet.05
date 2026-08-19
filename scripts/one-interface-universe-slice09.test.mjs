import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const router = read("src/routes/router.tsx");
const missions = read("src/components/MissionStrip.tsx");
const missionAtlas = read("src/components/MissionAtlasWindow.tsx");
const human = read("src/pages/integrated/HomoSapiensWorld.tsx");
const atlasHero = read("src/pages/v5/AtlasHero.tsx");
const universeCss = read("src/styles/one-interface-universe.css");

test("Homo sapiens is a first-class bounded SPECIES route before the generic species route", () => {
  const exact = router.indexOf('path="/species/homo-sapiens"');
  const generic = router.indexOf('path="/species/:slug"');
  assert.ok(exact >= 0, "Homo sapiens route is missing");
  assert.ok(generic >= 0, "Generic species route is missing");
  assert.ok(exact < generic, "Homo sapiens route must resolve before generic species route");
  assert.match(human, /taxon:gbif:10856082/);
  assert.match(human, /UNKNOWN/);
  assert.match(human, /cannot infer an individual's footprint/i);
});

test("Missions preserve one connected ATLAS → SPECIES → LIVING SYSTEMS → IMPACT journey", () => {
  assert.match(missions, /SEE IT IN ATLAS/);
  assert.match(missions, /MEET THE LIFE INSIDE IT|MEET THE SPECIES INSIDE IT/);
  assert.match(missions, /UNDERSTAND THE SYSTEM/);
  assert.match(missions, /FIND A WAY TO HELP/);
  assert.match(missions, /journey: slug/);
  assert.match(missions, /START HERE/);
  assert.match(missions, /How can we feed ourselves without breaking the living systems food depends on\?/);
});

test("relevant Missions embed the proven shared Atlas Window instead of a second map engine", () => {
  assert.match(missions, /<MissionAtlasWindow missionSlug=\{slug\} accent=\{accent\}/);
  assert.match(missionAtlas, /SpeciesAtlasWindow/);
  assert.match(missionAtlas, /speciesSlug: "orca"/);
  assert.match(missionAtlas, /speciesSlug: "jaguar"/);
  assert.match(missionAtlas, /speciesSlug: "western-honey-bee"/);
  assert.match(missionAtlas, /speciesSlug: "blue-mussel"/);
  assert.match(missionAtlas, /SHARED ATLAS ENGINE/);
  assert.match(missionAtlas, /OCCURRENCE ≠ RANGE \/ POPULATION \/ LIVE TRACKING/);
  assert.doesNotMatch(missionAtlas, /new maplibre\.Map/);
});

test("front-door awe stays atmospheric rather than masquerading as live ATLAS data", () => {
  assert.match(atlasHero, /planet-awe/);
  assert.match(atlasHero, /ATLAS itself owns the live[\s*]+map engine/);
  assert.match(atlasHero, /Everything you love is connected/);
});

test("M4GAZINE has a real editorial entry instead of redirecting to the homepage", () => {
  assert.match(router, /path="\/magazine" element=\{<Stories \/>\}/);
  assert.match(router, /path="\/magazine\/:slug" element=\{<StoryArticle \/>\}/);
  assert.doesNotMatch(router, /path="\/magazine" element=\{toHome\}/);
});

test("new motion has an explicit reduced-motion boundary", () => {
  assert.match(universeCss, /prefers-reduced-motion:\s*reduce/);
  assert.match(universeCss, /animation:\s*none/);
});

test("new cross-product bridges preserve a visible keyboard focus indicator", () => {
  assert.match(universeCss, /\.mission-world-bridge__link:focus-visible\s*\{[\s\S]*?outline:\s*3px solid currentColor/);
  assert.match(universeCss, /\.human-dependency-grid\s*>\s*a:focus-visible\s*\{[\s\S]*?outline:\s*3px solid currentColor/);
  assert.doesNotMatch(universeCss, /:focus-visible\s*\{[\s\S]{0,180}?outline:\s*none/);
});
