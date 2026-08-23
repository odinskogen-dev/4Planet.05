import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { readSignals, readStories } from "./magazine-content.mjs";

const read = (path) => fs.readFileSync(path, "utf8");
const shell = read("src/components/magazine/MagazineShell.tsx");
const home = read("src/pages/v5/Magazine.tsx");
const article = read("src/pages/v5/StoryArticle.tsx");
const library = read("src/pages/v5/MagazineLibrary.tsx");
const signalPage = read("src/pages/v5/MagazineSignal.tsx");
const experience = read("src/content/magazineExperience.ts");
const reader = read("src/content/magazineReader.ts");
const router = read("src/routes/router.tsx");
const sitemap = read("scripts/generate-sitemap.mjs");
const prerender = read("scripts/prerender-magazine-seo.mjs");
const quality = read("scripts/magazine-quality-gate.mjs");
const stories = readStories();
const signals = readSignals();

test("Magazine has a dedicated premium world and calm primary navigation", () => {
  assert.match(shell, /4PLANET/);
  assert.match(shell, /MAGAZINE/);
  assert.match(shell, /LIGHT|DARK/);
  assert.match(shell, /LATEST/);
  assert.match(shell, /LIFE/);
  assert.match(shell, /PLANET/);
  assert.match(shell, /INNOVATION/);
  assert.match(shell, /PEOPLE/);
  assert.match(shell, /CULTURE/);
  assert.match(shell, /IDEAS/);
  assert.match(shell, /SEARCH/);
  assert.match(shell, /SAVED/);
  assert.match(shell, /mag-world-footer/);
  assert.doesNotMatch(shell, /PublicShell/);
});

test("World-class home has source density without a random card wall", () => {
  assert.ok(stories.length >= 10, "at least ten substantial stories are required");
  assert.ok(signals.length >= 10, "at least ten fast source-bounded signals are required");
  assert.ok(stories.length + signals.length >= 24, "launch density must reach at least 24 real editorial objects");
  assert.match(home, /PLANET SIGNAL/);
  assert.match(home, /FOUR READING MODES/);
  assert.match(home, /mag-story-mosaic/);
  assert.doesNotMatch(home, /Math\.random/);
});

test("Planet Signals remain source-bounded fast journalism", () => {
  for (const signal of signals) {
    assert.match(signal.sourceUrl, /^https:\/\//, `${signal.slug} needs exact HTTPS source`);
    assert.ok(signal.boundary.length >= 100, `${signal.slug} needs explicit anti-overclaim boundary`);
    assert.ok(signal.whyItMatters.length >= 100, `${signal.slug} needs useful interpretation`);
    assert.ok(signal.topics.length >= 3, `${signal.slug} needs useful topic graph`);
  }
  assert.match(signalPage, /DO NOT OVER-READ THIS/);
  assert.match(signalPage, /OPEN SOURCE/);
  assert.match(signalPage, /FAST \/ SOURCE-BOUNDED/);
});

test("four premium story experiences are explicit and non-random", () => {
  for (const mode of ["ARTICLE", "VISUAL_ESSAY", "INTELLIGENCE_STORY", "JOURNEY_FEATURE"]) assert.match(experience, new RegExp(mode));
  assert.match(article, /mag-experience--/);
  assert.match(article, /mag-intelligence-strip/);
  assert.match(article, /mag-journey-gateway/);
  assert.match(article, /mag-visual-breath/);
  assert.doesNotMatch(experience, /Math\.random/);
});

test("reader product supports search save recent resume and text size without an account", () => {
  for (const key of ["SAVED_KEY", "RECENT_KEY", "RESUME_KEY"]) assert.match(reader, new RegExp(key));
  assert.match(library, /MagazineSearch/);
  assert.match(library, /MagazineSaved/);
  assert.match(library, /MagazineArchive/);
  assert.match(article, /SAVE \+/);
  assert.match(article, /TEXT A\+/);
  assert.match(article, /recordMagazineRecent/);
  assert.match(article, /recordMagazineResume/);
  for (const route of ["/magazine/search", "/magazine/saved", "/magazine/archive", "/magazine/signals/:slug"]) assert.ok(router.includes(`path=\"${route}\"`), `missing route ${route}`);
});

test("SEO engine emits archive and signal routes without polluting News sitemap", () => {
  assert.match(sitemap, /readSignals/);
  assert.match(sitemap, /\/magazine\/signals\//);
  assert.match(sitemap, /\/magazine\/archive/);
  assert.match(prerender, /readSignals/);
  assert.match(prerender, /citation: signal\.sourceUrl/);
  assert.match(prerender, /PLANET SIGNAL/);
  assert.match(sitemap, /News sitemap remains deliberately strict/);
});

test("quality engine enforces content density sources and reader product", () => {
  assert.match(quality, /World-Class review needs at least 24 real editorial objects/);
  assert.match(quality, /Planet Signal source must be an exact HTTPS URL/);
  assert.match(quality, /anti-overclaim boundary/);
  assert.match(quality, /all four premium story experience contracts are required/);
  assert.match(quality, /reader utility routes must be exposed/);
});
