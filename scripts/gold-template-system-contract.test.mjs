import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const data = read("src/content/goldTemplateSystem.ts");
const completion = read("src/content/goldTemplateCompletion.ts");
const page = read("src/pages/labs/GoldTemplateSystem.tsx");
const review = read("src/pages/labs/SandboxGoldReview.tsx");
const sandboxRoutes = read("src/pages/labs/SandboxGoldRoutes.tsx");
const routes = read("src/routes/router.tsx");
const actor = read("src/content/actorGold.ts");
const css = read("src/styles/gold-template-system.css");

const objectKinds = ["SPECIES", "PLACE", "LIVING_SYSTEM", "ACTOR", "SOLUTION", "SIGNAL", "PROOF"];
const storyFormats = ["NEWS", "EXPLAINER", "FEATURE", "PROFILE", "VISUAL_STORY", "FIELD", "SOLUTIONS", "BIG_QUESTION", "GUIDE"];
const baseObjects = ["blue-whale", "oslofjord", "eelgrass-restoration"];
const completionObjects = ["oslofjord-living-system", "oslofjord-plan-2026", "eelgrass-proof-record"];
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

test("all seven object jobs have a founder-reviewable representative", () => {
  for (const slug of baseObjects) assert.ok(data.includes(`slug: \"${slug}\"`), `missing base object ${slug}`);
  for (const slug of completionObjects) assert.ok(completion.includes(`slug: \"${slug}\"`), `missing completion object ${slug}`);
  assert.match(actor, /slug:\s*\"orca\"/);
  assert.match(actor, /ACTOR_GOLD_REQUIRED_SECTIONS/);
  assert.match(review, /SPECIES/);
  assert.match(review, /PLACE/);
  assert.match(review, /LIVING SYSTEM/);
  assert.match(review, /ACTOR/);
  assert.match(review, /SOLUTION/);
  assert.match(review, /SIGNAL/);
  assert.match(review, /PROOF/);
});

test("object proofs are source-bounded and outcome claims fail closed", () => {
  const combined = `${data}\n${completion}`;
  assert.match(combined, /NOAA Fisheries/);
  assert.match(combined, /Klima- og miljødepartementet/);
  assert.match(combined, /Miljødirektoratet/);
  assert.match(combined, /NIVA/);
  assert.match(combined, /UNKNOWN STAYS UNKNOWN|outcome deliberately left open|ECOLOGICAL OUTCOME/);
  assert.match(combined, /DECISION ≠ DELIVERY ≠ ECOLOGICAL OUTCOME/);
  assert.match(completion, /ACTIVITY IS NOT IMPACT/);
});

test("Magazine Story Gold contract contains nine distinct journalist jobs", () => {
  for (const format of storyFormats) assert.ok(data.includes(`\"${format}\"`), `missing story format ${format}`);
  assert.match(data, /WHAT HAPPENED → WHY IT MATTERS → WHAT WE KNOW → WHAT NEXT/);
  assert.match(data, /QUESTION → SHORT ANSWER → HOW IT WORKS → WHY NOW → UNCERTAINTY/);
  assert.match(data, /SCENE → CHARACTER \/ PLACE → CONFLICT → CONTEXT → EVIDENCE → CONSEQUENCE/);
});

test("four representative story formats are real-world stories, not 4PLANET news", () => {
  for (const slug of proofStories) assert.ok(data.includes(`slug: \"${slug}\"`), `missing story proof ${slug}`);
  assert.match(data, /August just became the hottest August ever recorded/);
  assert.match(data, /The planet crossed 1\.5°C again/);
  assert.match(data, /The largest animal ever known is built on a world of krill/);
  assert.match(data, /A blue whale, in six numbers/);
  assert.match(data, /Copernicus Climate Change Service/);
  assert.match(data, /World Meteorological Organization/);
});

test("Founder Review is exposed only through controlled sandbox routes", () => {
  assert.match(routes, /path=\"\/sandbox\/gold\/\*\"/);
  for (const segment of ["species", "place", "living-system", "actor", "solution", "signal", "proof", "magazine"]) {
    assert.ok(sandboxRoutes.includes(`path=\"${segment}/:slug\"`), `missing sandbox route ${segment}`);
  }
  assert.match(review, /CONTROLLED TEST/);
  assert.match(review, /NO LIVE RELEASE/);
  assert.match(review, /noindex,nofollow,noarchive,nosnippet/);
  assert.match(review, /Founder approval is the final gate/);
});

test("proof surfaces expose provenance, truth boundaries and connected handoffs", () => {
  const combinedPage = `${page}\n${review}`;
  assert.match(combinedPage, /SOURCES \/ PROVENANCE/);
  assert.match(combinedPage, /TRUTH BOUNDARY/);
  assert.match(combinedPage, /EDITORIAL BOUNDARY|editorial/i);
  assert.match(combinedPage, /HOW WE KNOW|PROVENANCE ATTACHED/);
  assert.match(combinedPage, /UNKNOWN STAYS UNKNOWN/);
  assert.match(combinedPage, /Designed in-system visual/);
});

test("Gold visual system remains responsive and format-specific", () => {
  assert.match(css, /gold-story--news/);
  assert.match(css, /gold-story--explainer/);
  assert.match(css, /gold-story--feature/);
  assert.match(css, /gold-story--visual_story/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(review, /CardGrid|generic-card/i);
});
