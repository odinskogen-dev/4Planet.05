import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const engine = read("src/content/actorGold.ts");
const page = read("src/pages/v5/ActorGold.tsx");
const css = read("src/styles/actor-gold.css");
const router = read("src/routes/router.tsx");

test("Actor Engine has one shared premium profile grammar and no photo dependency", () => {
  assert.match(engine, /ACTOR_GOLD_REQUIRED_SECTIONS/);
  assert.match(engine, /ACTOR_GOLD_VISUAL_LADDER/);
  assert.match(engine, /IDENTITY_FIELD/);
  assert.match(engine, /ATLAS_PLACE/);
  assert.match(engine, /RELATIONSHIP_GRAPH/);
  assert.match(engine, /SOURCE_DATA/);
  assert.match(engine, /Every profile must work without partner photography or logo permissions/i);
  assert.match(engine, /a photograph is not/i);
  assert.match(engine, /Synthetic photoreal media must never imply documentary field evidence/i);
});

test("ORCA Gold remains truth-bounded and field feed fails closed", () => {
  assert.match(engine, /P17-A036/);
  assert.match(engine, /DIRECT_DIALOGUE/);
  assert.match(engine, /Bay of Biscay/);
  assert.match(engine, /not an Orca migration track/i);
  assert.match(engine, /fieldFeed: \[\]/);
  assert.match(engine, /Fund a survey/);
  assert.match(engine, /state: "LOCKED"/);
  assert.match(engine, /does not imply a signed delivery partnership/i);
  assert.match(page, /NO PUBLIC FIELD DISPATCHES YET/);
  assert.match(page, /Intake → source QA → editorial review → public/);
});

test("Gold 02 veritree preserves active relationship but does not manufacture a pilot", () => {
  assert.match(engine, /P17-A307/);
  assert.match(engine, /slug: "veritree"/);
  assert.match(engine, /active direct relationship/i);
  assert.match(engine, /draft \/ not sent/i);
  assert.match(engine, /does not imply pilot acceptance, contract, funding, delivery or endorsement/i);
  assert.match(engine, /Activate a 4PLANET pilot/);
  assert.match(engine, /Founder release, actor acceptance/i);
});

test("NatureMetrics proves public-record mode without implying relationship", () => {
  assert.match(engine, /P17-A310/);
  assert.match(engine, /slug: "naturemetrics"/);
  assert.match(engine, /PUBLIC_RECORD_ONLY/);
  assert.match(engine, /No direct 4PLANET relationship/i);
  assert.match(engine, /eDNA/);
  assert.match(engine, /NatureMetrics public product pages/);
});

test("Actor Gold page exposes work place living context editorial proof source and action layers", () => {
  for (const token of [
    "WHAT THEY ACTUALLY DO",
    "PLACES / ATLAS",
    "LIVING CONTEXT",
    "FIELD FEED",
    "MAGAZINE",
    "PROJECTS / DATA / PROOF",
    "SOURCES",
    "FOLLOW / SUPPORT / ACT",
    "RELATIONSHIP / EDITORIAL DISCLOSURE",
  ]) assert.match(page, new RegExp(token.replace(/[\/]/g, "\\/")));
  assert.match(page, /OPEN SOURCE/);
  assert.match(router, /path="\/actors"/);
  assert.match(router, /path="\/actors\/:slug"/);
});

test("Actor Gold has responsive rights-safe signature visuals for unlike actor types", () => {
  assert.match(page, /actor-gold-route/);
  assert.match(page, /Illustrative monitoring corridor/);
  assert.match(page, /GenericSignatureVisual/);
  assert.match(page, /Abstract evidence relationship visual/);
  assert.match(css, /actor-gold-corridor/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("Actor scale strategy is torture-test-first not x100 generation", () => {
  assert.match(engine, /ACTOR_TORTURE_TEST_ARCHETYPES/);
  assert.match(page, /ORCA is Gold 01/);
  assert.match(page, /veritree is Gold 02/);
  assert.match(page, /NatureMetrics is the first public-record nature-intelligence torture test/i);
  assert.match(page, /One exceptional system\. Ten unlike actors\. Then scale\./i);
});
