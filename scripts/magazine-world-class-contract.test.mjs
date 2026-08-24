import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { readSignals, readStories } from "./magazine-content.mjs";

const read = (path) => fs.readFileSync(path, "utf8");
const shell = read("src/components/magazine/MagazineShell.tsx");
const home = read("src/pages/v5/Magazine.tsx");
const article = read("src/pages/v5/StoryArticle.tsx");
const editorial = read("src/components/Editorial.tsx");
const library = read("src/pages/v5/MagazineLibrary.tsx");
const signalPage = read("src/pages/v5/MagazineSignal.tsx");
const experience = read("src/content/magazineExperience.ts");
const reader = read("src/content/magazineReader.ts");
const featureReported = read("src/content/magazineFeaturesReported.ts");
const featureExplainers = read("src/content/magazineFeaturesExplainers.ts");
const featureIndex = read("src/content/magazineFeatures.ts");
const featureLayer = `${featureReported}\n${featureExplainers}`;
const magazineVisuals = read("src/content/magazineVisuals.ts");
const articleRound06 = read("src/styles/magazine-article-round-06.css");
const router = read("src/routes/router.tsx");
const sitemap = read("scripts/generate-sitemap.mjs");
const prerender = read("scripts/prerender-magazine-seo.mjs");
const quality = read("scripts/magazine-quality-gate.mjs");
const gold02 = read("src/styles/magazine-gold-02.css");
const liveRound = read("src/styles/magazine-live-round-01.css");
const liveRound02 = read("src/styles/magazine-live-round-02.css");
const liveRound04 = read("src/styles/magazine-live-round-04.css");
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
  assert.equal((shell.match(/mag-world-masthead-word/g) || []).length, 2);
  assert.match(shell, /magazine-live-round-04\.css/);
  assert.doesNotMatch(shell, /PublicShell/);
});

test("World-class home is curated, source-dense and long enough to feel editorial", () => {
  assert.ok(stories.length >= 10, "at least ten substantial stories are required");
  assert.ok(signals.length >= 10, "at least ten fast source-bounded signals are required");
  assert.ok(stories.length + signals.length >= 24, "launch density must reach at least 24 real editorial objects");
  assert.match(home, /HOME_STORY_LIMIT = 12/);
  assert.match(home, /HOME_SIGNAL_LIMIT = 4/);
  assert.match(home, /PLANET SIGNAL/);
  assert.match(home, /RECURRING EDITORIAL/);
  assert.match(home, /mag-story-mosaic/);
  assert.match(home, /mag-story-stream/);
  assert.match(home, /mag-atlas-embed/);
  assert.doesNotMatch(home, /LIVE DEVELOPMENT/);
  assert.doesNotMatch(home, /EDITORIAL LAB/);
  assert.doesNotMatch(home, /Math\.random/);
});

test("founder visual passes preserve deterministic layout and official palette", () => {
  assert.match(liveRound, /--mw-bg: #ffffff/);
  assert.match(liveRound02, /--4p-blue: #2E2EFF/);
  assert.match(liveRound02, /--4p-green: #3AE86F/);
  assert.match(liveRound02, /--4p-red: #FF4D22/);
  assert.match(liveRound02, /--4p-pink: #FF5ACD/);
  assert.match(liveRound02, /--4p-amber: #FF7D50/);
  assert.match(liveRound02, /mag-signal-card\[data-accent="pink"\]:hover/);
  assert.match(liveRound02, /mag-story-drift-02 54s linear infinite/);
  assert.match(liveRound04, /Every desktop row resolves to 12 columns/);
  assert.match(liveRound04, /mag-signal-card--lead/);
  assert.match(liveRound04, /background: var\(--4p-white\) !important/);
  assert.match(home, /mag-home-hero-visual/);
  assert.match(home, /Meet 4PLANET ATLAS/);
  assert.match(home, /interactive planetary interface we built/);
  assert.doesNotMatch(home, /Math\.random/);
});

test("every full story has a human-first longform feature layer", () => {
  assert.equal(stories.length, 13, "article sprint expects all 13 launch stories");
  for (const story of stories) assert.ok(featureLayer.includes(`\"${story.slug}\"`), `${story.slug} is missing its longform feature`);
  assert.match(featureIndex, /featureForStory/);
  assert.match(featureIndex, /featureReadMins/);
  assert.match(article, /featureForStory/);
  assert.match(article, /articleBlocks/);
  assert.match(article, /mag-article-inline-visual/);
  assert.match(article, /reveal=\{false\}/);
  assert.match(editorial, /data-editorial-reveal/);
  assert.match(editorial, /reveal = true/);
  assert.match(articleRound06, /Core copy is fail-open/);
  assert.match(articleRound06, /mag-article-inline-visual/);
});

test("front-page image direction avoids duplicate editorial imagery", () => {
  assert.match(home, /HOME_STORY_IMAGE_OVERRIDES/);
  assert.match(home, /"sea-pen-instead-of-tank": "rewildMarineHero"/);
  assert.match(home, /"the-four-domains": "heroEarth"/);
  assert.match(home, /featureForStory/);
  for (const key of ["foodHero", "en3rgyHero", "f4shionHero", "artHero"]) assert.match(home, new RegExp(`\"${key}\"`));
});

test("mobile home restores 4PLANET strictness and avoids desktop mosaic assumptions", () => {
  assert.match(gold02, /@media \(max-width: 700px\)/);
  assert.match(gold02, /\.mag-story-mosaic \{ display: grid !important; grid-template-columns: 1fr !important/);
  assert.match(gold02, /\.mag-world-masthead \.mag-world-masthead-word/);
  assert.match(gold02, /font-size: clamp\(31px, 9\.1vw, 39px\)/);
  assert.match(gold02, /scroll-snap-type: x mandatory/);
  assert.match(gold02, /\.mag-topic-grid \{ grid-template-columns: 1fr 1fr !important/);
});

test("Planet Signals remain source-bounded fast journalism with distinct visuals", () => {
  for (const signal of signals) {
    assert.match(signal.sourceUrl, /^https:\/\//, `${signal.slug} needs exact HTTPS source`);
    assert.ok(signal.boundary.length >= 100, `${signal.slug} needs explicit anti-overclaim boundary`);
    assert.ok(signal.whyItMatters.length >= 100, `${signal.slug} needs useful interpretation`);
    assert.ok(signal.topics.length >= 3, `${signal.slug} needs useful topic graph`);
    assert.ok(magazineVisuals.includes(`\"${signal.slug}\"`), `${signal.slug} needs a dedicated signal visual`);
  }
  assert.match(signalPage, /signalImageKey/);
  assert.match(signalPage, /VISUAL CONTEXT/);
  assert.match(signalPage, /DO NOT OVER-READ THIS/);
  assert.match(signalPage, /OPEN SOURCE/);
  assert.match(signalPage, /FAST \/ SOURCE-BOUNDED/);
});

test("premium story modes remain explicit while the reader always reaches the story first", () => {
  for (const mode of ["ARTICLE", "VISUAL_ESSAY", "INTELLIGENCE_STORY", "JOURNEY_FEATURE"]) assert.match(experience, new RegExp(mode));
  assert.match(article, /mag-experience--/);
  assert.match(article, /mag-premium-reader/);
  assert.match(article, /mag-article-world-dek/);
  assert.match(article, /mag-article-world-body/);
  assert.match(article, /mag-article-inline-visual/);
  assert.doesNotMatch(article, /mag-intelligence-strip/);
  assert.doesNotMatch(article, /mag-journey-gateway/);
  assert.doesNotMatch(article, /mag-visual-breath/);
  assert.doesNotMatch(experience, /Math\.random/);
});

test("reader product supports search save recent resume and text size without an account", () => {
  for (const key of ["SAVED_KEY", "RECENT_KEY", "RESUME_KEY"]) assert.match(reader, new RegExp(key));
  assert.match(library, /MagazineSearch/);
  assert.match(library, /MagazineSaved/);
  assert.match(library, /MagazineArchive/);
  assert.match(library, /featureForStory/);
  assert.match(article, /SAVE \+/);
  assert.match(article, /TEXT A\+/);
  assert.match(article, /recordMagazineRecent/);
  assert.match(article, /recordMagazineResume/);
  for (const route of ["/magazine/search", "/magazine/saved", "/magazine/archive", "/magazine/topics/:topic", "/magazine/series/:series", "/magazine/signals/:slug"]) assert.ok(router.includes(`path=\"${route}\"`), `missing route ${route}`);
});

test("SEO engine emits archive and signal routes without polluting News sitemap", () => {
  assert.match(sitemap, /readSignals/);
  assert.match(sitemap, /\/magazine\/signals\//);
  assert.match(sitemap, /\/magazine\/archive/);
  assert.match(prerender, /readSignals/);
  assert.match(prerender, /citation: signal\.sourceUrl/);
  assert.match(prerender, /PLANET SIGNAL/);
  assert.match(sitemap, /const newsStories = stories\.filter/);
  assert.match(sitemap, /if \(!story\.publishedAt\) return false/);
  assert.match(sitemap, /48 \* 60 \* 60 \* 1000/);
  assert.doesNotMatch(sitemap, /signals\.filter\([^\n]*publishedAt/);
});

test("quality engine enforces content density sources and reader product", () => {
  assert.match(quality, /World-Class review needs at least 24 real editorial objects/);
  assert.match(quality, /Planet Signal source must be an exact HTTPS URL/);
  assert.match(quality, /anti-overclaim boundary/);
  assert.match(quality, /all four premium story experience contracts are required/);
  assert.match(quality, /reader utility routes must be exposed/);
});
