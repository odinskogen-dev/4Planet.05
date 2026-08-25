import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const engine = read("src/content/actorGold.ts");
const page = read("src/pages/v5/ActorGold.tsx");
const css = read("src/styles/actor-gold.css");
const router = read("src/routes/router.tsx");

test("Actor Intelligence keeps one shared premium identity and truth grammar", () => {
  for (const token of ["ACTOR_GOLD_REQUIRED_SECTIONS", "ACTOR_GOLD_VISUAL_LADDER", "IDENTITY_FIELD", "ATLAS_PLACE", "RELATIONSHIP_GRAPH", "SOURCE_DATA"]) assert.match(engine, new RegExp(token));
  assert.match(engine, /Every profile must work without partner photography or logo permissions/i);
  assert.match(engine, /a photograph is not/i);
  assert.match(engine, /Synthetic photoreal media must never imply documentary field evidence/i);
  assert.match(engine, /Human visual\/editorial judgement remains a release gate for GOLD/i);
});

test("five unlike canonical Actor Gold profiles stress-test the same schema", () => {
  for (const id of ["P17-A036", "P17-A307", "P17-A296", "P17-A1798", "P17-A1787"]) assert.ok(engine.includes(id), `missing canonical actor ${id}`);
  for (const slug of ["orca", "veritree", "institute-of-marine-research", "bergen-kommune", "handelens-miljofond"]) assert.ok(engine.includes(`slug: "${slug}"`), `missing actor slug ${slug}`);
  assert.match(page, /One intelligence schema\. Unlike actors\./i);
  assert.match(page, /Monitoring, implementation, research, government and capital/i);
});

test("ORCA remains truth-bounded and field/update feed fails closed", () => {
  assert.match(engine, /DIRECT_DIALOGUE/);
  assert.match(engine, /Bay of Biscay/);
  assert.match(engine, /not an Orca migration track/i);
  assert.match(engine, /fieldFeed: \[\]/);
  assert.match(engine, /Fund a survey/);
  assert.match(engine, /state: "LOCKED"/);
  assert.match(engine, /does not imply a signed delivery partnership/i);
  assert.match(page, /NO PUBLIC DISPATCHES YET/);
  assert.match(page, /Empty is better than invented/i);
});

test("Actor page exposes work, place, system context, evidence and contextual action", () => {
  for (const token of ["WHAT THEY ACTUALLY DO", "PLACE / JURISDICTION", "SYSTEM CONTEXT", "LIVE / UPDATE FEED", "RESEARCH / DECISIONS / PROJECTS", "GET INVOLVED", "SOURCE AUTHORITY", "CORRECTIONS"]) assert.match(page, new RegExp(token.replace(/[\/]/g, "\\/")));
  assert.match(router, /path="\/actors"/);
  assert.match(router, /path="\/actors\/:slug"/);
});

test("Actor Gold keeps responsive rights-safe signature visuals", () => {
  assert.match(page, /actor-gold-route/);
  assert.match(page, /ActorSignatureVisual/);
  assert.match(css, /actor-gold-corridor/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("identity debt is visible instead of silently duplicating a research institution", () => {
  assert.match(engine, /P17-A296/);
  assert.match(engine, /P17-A399 appears to duplicate/i);
  assert.match(engine, /must be reconciled before scale/i);
});
