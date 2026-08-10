import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const router = read("src/routes/router.tsx");
const home = read("src/pages/credibility/PublicCredibilityHome.tsx");
const orca = read("src/pages/credibility/OrcaGold.tsx");
const oslo = read("src/pages/credibility/OslofjordGold.tsx");
const bee = read("src/pages/credibility/BeePollinationFoodGold.tsx");
const species = read("src/pages/credibility/SpeciesCredibility.tsx");
const impact = read("src/pages/integrated/ImpactPrototype.tsx");

const bannedFirstImpression = [
  "SOURCE-GROUNDED CANDIDATE",
  "ONE INTERFACE / FOUR PUBLIC JOBS",
  "DEEP WORLDS / SHARED TRUTH",
  "ACT + PROVE",
  "Act with proof",
];

test("root route is the global 4PLANET credibility front door", () => {
  assert.match(router, /path="\/" element={<PublicCredibilityHome \/>}/);
  assert.doesNotMatch(router, /Phase04FrontDoor/);
  assert.doesNotMatch(router, /OslofjordenJourney/);
  assert.match(home, /LIVING PLANET INTELLIGENCE/);
  assert.match(home, /For a[\s\S]*Living Planet/);
  for (const phrase of bannedFirstImpression) assert.doesNotMatch(home, new RegExp(phrase.replace(/[+]/g, "\\+"), "i"));
});

test("three gold verticals have dedicated public routes", () => {
  assert.match(router, /path="\/species\/orca" element={<OrcaGold \/>}/);
  assert.match(router, /path="\/place\/oslofjorden" element={<OslofjordGold \/>}/);
  assert.match(router, /path="\/living-systems\/bee-pollination-food" element={<BeePollinationFoodGold \/>}/);
});

test("legacy live-labelled species surface is not publicly routed", () => {
  assert.doesNotMatch(router, /pages\/integrated\/Species/);
  assert.doesNotMatch(species, /LIVE OCCURRENCE READ/);
  assert.doesNotMatch(species, /status:\s*"LIVE"/);
  assert.match(species, /Source records, not live tracking/);
});

test("orca distinguishes observation from live tracking and holds un-cleared documentary media", () => {
  assert.match(orca, /not a live whale/i);
  assert.match(orca, /source-reported Orca record/i);
  assert.match(orca, /Held back from this candidate until one exact Orca asset/i);
  assert.match(orca, /does not currently claim a universal Orca intervention/i);
  assert.match(orca, /Impact pathways in development/i);
});

test("bee vertical preserves the bounded pollination claim", () => {
  assert.match(bee, /not the only ones/i);
  assert.match(bee, /not a claim that all crops, calories or food depend/i);
  assert.match(bee, /‘no bees = no food’/i);
  assert.match(bee, /Original 4PLANET relationship diagram/i);
});

test("Oslofjorden is presented as a differentiated place, not a synthetic score", () => {
  assert.match(oslo, /A fjord is not one score/i);
  assert.match(oslo, /A model, a measurement and an ecological observation are not the same thing/i);
  assert.match(oslo, /not an affiliation, endorsement or 4PLANET partnership/i);
});

test("Impact public surface remains explicitly non-production", () => {
  assert.match(impact, /No production pathway is open yet/);
  assert.match(impact, /nothing here takes payment/i);
  assert.match(impact, /No provider agreement or public contribution route is in place/);
});
