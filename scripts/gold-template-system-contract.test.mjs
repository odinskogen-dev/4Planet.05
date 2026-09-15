import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const data = read("src/content/goldTemplateSystem.ts");
const page = read("src/pages/labs/GoldTemplateSystem.tsx");
const routes = read("src/routes/router.tsx");
const css = read("src/styles/gold-template-system.css");

const objectKinds = ["SPECIES", "PLACE", "LIVING_SYSTEM", "ACTOR", "SOLUTION", "SIGNAL", "PROOF"];
const storyFormats = ["NEWS", "EXPLAINER", "FEATURE", "PROFILE", "VISUAL_STORY", "FIELD", "SOLUTIONS", "BIG_QUESTION", "GUIDE"];
const proofObjects = ["blue-whale", "oslofjord", "eelgrass-restoration"];
const proofStories = ["news-august-2026", "explainer-1-5c", "feature-blue-whale", "visual-blue-whale"];

test("Object Gold contract contains all seven reusable object kinds", () => {
  for (const kind of objectKinds) assert.ok(data.includes(`\"${kind}\"`), `missing object kind ${kind}`);
  assert.match(data, /GoldObjectProof/);
  assert.match(data, /GoldRelationship/);
  assert.match(data, /GoldSource/);
});

test("first Species Gold proof is Blue Whale while ORCA remains donor only", () => {
  assert.match(data, /slug:\s*\"blue-whale\"/);
  assert.match(data, /title:\s*\"Blue whale\"/);
  assert.match(data, /Balaenoptera musculus/);
  assert.match(data, /ORCA is used only as a capability donor/);
  assert.match(data, /No Orca copy or species-specific claims are reused/);
});

test("representative object proofs are source-bounded and do not imply delivery", () => {
  for (const slug of proofObjects) assert.ok(data.includes(`slug: \"${slug}\"`), `missing object proof ${slug}`);
  assert.match(data, /NOAA Fisheries/);
  assert.match(data, /Klima- og miljødepartementet/);
  assert.match(data, /Miljødirektoratet/);
  assert.match(data, /NIVA/);
  assert.match(data, /UNIVERSAL SUCCESS RATE[\s\S]*UNKNOWN/);
  assert.match(data, /does not claim that 4PLANET delivers eelgrass restoration/);
  assert.match(data, /DECISION ≠ DELIVERY ≠ ECOLOGICAL OUTCOME/);
});

test("Magazine Story Gold contract contains nine distinct journalist jobs", () => {
  for (const format of storyFormats) assert.ok(data.includes(`\"${format}\"`), `missing story format ${format}`);
  assert.match(data, /WHAT HAPPENED → WHY IT MATTERS → WHAT WE KNOW → WHAT NEXT/);
  assert.match(data, /QUESTION → SHORT ANSWER → HOW IT WORKS → WHY NOW → UNCERTAINTY/);
  assert.match(data, /SCENE → CHARACTER \/ PLACE → CONFLICT → CONTEXT → EVIDENCE → CONSEQUENCE/);
});

test("four representative story formats are real world stories, not 4PLANET news", () => {
  for (const slug of proofStories) assert.ok(data.includes(`slug: \"${slug}\"`), `missing story proof ${slug}`);
  assert.match(data, /August just became the hottest August ever recorded/);
  assert.match(data, /The planet crossed 1\.5°C again/);
  assert.match(data, /The largest animal ever known is built on a world of krill/);
  assert.match(data, /A blue whale, in six numbers/);
  assert.match(data, /Copernicus Climate Change Service/);
  assert.match(data, /World Meteorological Organization/);
});

test("all seven representative proof surfaces are routed under controlled LABS state", () => {
  assert.match(routes, /path=\"\/labs\/gold\"/);
  assert.match(routes, /path=\"\/labs\/gold\/object\/:slug\"/);
  assert.match(routes, /path=\"\/labs\/gold\/story\/:slug\"/);
  assert.match(page, /CONTROLLED TEST/);
  assert.match(page, /NO LIVE RELEASE/);
  assert.match(page, /noindex,nofollow,noarchive,nosnippet/);
});

test("proof surfaces expose provenance, truth boundaries and second-object handoffs", () => {
  assert.match(page, /SOURCES \/ PROVENANCE/);
  assert.match(page, /TRUTH BOUNDARY/);
  assert.match(page, /EDITORIAL BOUNDARY/);
  assert.match(page, /SECOND OBJECT/);
  assert.match(page, /HOW WE KNOW/);
  assert.match(page, /UNKNOWN STAYS UNKNOWN/);
  assert.match(page, /Designed in-system visual/);
});

test("Gold visual system is responsive and format-specific rather than one generic card grid", () => {
  assert.match(css, /gold-story--news/);
  assert.match(css, /gold-story--explainer/);
  assert.match(css, /gold-story--feature/);
  assert.match(css, /gold-story--visual_story/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(page, /CardGrid|generic-card/i);
});
