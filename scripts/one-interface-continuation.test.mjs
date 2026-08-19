import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const shell = read("src/components/layout/PublicShell.tsx");
const culture = read("src/pages/v5/Culture.tsx");
const story = read("src/pages/v5/StoryArticle.tsx");
const home = read("src/pages/v5/Home.tsx");
const missionStrip = read("src/components/MissionStrip.tsx");
const missions = read("src/pages/v5/Missions.tsx");
const atlasHero = read("src/pages/v5/AtlasHero.tsx");
const atlasShowcase = read("src/components/HomeAtlasShowcase.tsx");

test("navigation points to premium top-level destinations instead of stale anchors", () => {
  assert.match(shell, /\["THE STORY", "\/about\/story"\]/);
  assert.match(shell, /\["THE SYSTEM", "\/about\/system"\]/);
  assert.match(shell, /\["THE FOUNDER", "\/about\/founder"\]/);
  assert.match(shell, /\["M4GAZINE", "\/magazine"\]/);
  assert.match(shell, /rgba\(5,5,6,\.985\)/);
});

test("M4GAZINE is a real editorial universe with visible stories and long-form routes", () => {
  assert.match(culture, /M4GAZINE_/);
  assert.match(culture, /COVER STORY/);
  assert.match(culture, /LATEST/);
  assert.match(culture, /FIELD NOTES/);
  assert.match(culture, /to=\{`\/magazine\/\$\{slug\}`\}/);
  assert.match(story, /CONTINUE THROUGH THE SYSTEM/);
  assert.match(story, /\/magazine\/\$\{m\.slug\}/);
});

test("homepage now surfaces the best connected parts of the system and stronger culture", () => {
  assert.match(home, /BEST OF 4PLANET/);
  assert.match(home, /Jaguar/);
  assert.match(home, /Orca/);
  assert.match(home, /Homo sapiens/);
  assert.match(home, /cultureAnchor/);
  assert.match(home, /healthy living planet is infrastructure for human life/i);
  assert.match(home, /ACTION PATHWAYS · CURRENT PUBLIC STATUS/);
});

test("Mission journeys expose Species Lens and Amazon deep context", () => {
  assert.match(missionStrip, /OPEN THE SPECIES LENS/);
  assert.match(missionStrip, /JAGUAR GOLD STANDARD/);
  assert.match(missionStrip, /AMAZON RAINFOREST/);
  assert.match(missionStrip, /ORCA GOLD STANDARD/);
  assert.match(missionStrip, /DEEPER CONTEXT/);
});

test("all Mission articles gain a colour narrative beat and provenance presentation", () => {
  assert.match(missions, /THE RELATIONSHIP/);
  assert.match(missions, /PROVENANCE/);
  assert.match(missions, /PUBLIC EVIDENCE STATE/);
  assert.match(missions, /SOURCES \/ PUBLIC EVIDENCE/);
  assert.match(missions, /replace\(\/\^\\\/stories\/, "\/magazine"\)/);
});

test("homepage Atlas remains a real source-aware shared-engine showcase", () => {
  assert.match(atlasHero, /HomeAtlasShowcase/);
  assert.match(atlasShowcase, /SpeciesAtlasWindow/);
  assert.match(atlasShowcase, /AMAZONIA · JAGUAR/);
  assert.match(atlasShowcase, /OCEAN · ORCA/);
  assert.match(atlasShowcase, /FOOD · POLLINATOR/);
  assert.match(atlasShowcase, /occurrence/i);
});
