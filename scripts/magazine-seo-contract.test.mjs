import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const magazine = read("src/pages/v5/Magazine.tsx");
const editorial = read("src/content/magazineEditorial.ts");
const operating = read("src/content/magazineOperating.ts");
const engine = read("src/content/magazineEngine.ts");
const stories = read("src/content/stories.ts");
const router = read("src/routes/router.tsx");
const story = read("src/pages/v5/StoryArticle.tsx");
const storyRecord = read("src/pages/v5/MagazineStoryRecord.tsx");
const shell = read("src/components/magazine/MagazineShell.tsx");
const worldCss = read("src/styles/magazine-world.css");
const analytics = read("src/analytics/Analytics.tsx");
const magazineAnalytics = read("src/analytics/MagazineAnalytics.ts");
const seo = read("src/components/Seo.tsx");
const magazineSeo = read("src/components/MagazineSeo.tsx");
const privacy = read("src/pages/v5/Privacy.tsx");
const headers = read("public/_headers");
const sitemap = read("scripts/generate-sitemap.mjs");
const prerender = read("scripts/prerender-magazine-seo.mjs");
const contentReader = read("scripts/magazine-content.mjs");
const qualityGate = read("scripts/magazine-quality-gate.mjs");
const packageJson = read("package.json");

test("Founding Edition records remain separate from the reader-facing feed", () => {
  assert.match(magazine, /EDITORIAL LAB \/ NOT THE PUBLIC FEED/);
  assert.match(magazine, /FOUNDING_EDITION\.items/);
  assert.match(editorial, /responsible editor \/ editorial lead must be designated/i);
  assert.match(storyRecord, /PRE-PUBLICATION RECORD/);
  assert.match(storyRecord, /robots="noindex,follow"/);
  assert.match(storyRecord, /A record is not an article/);
  assert.doesNotMatch(storyRecord, /"@type"\s*:\s*"Article"/);
});

test("Magazine has its own editorial world, persistent theme and footer", () => {
  assert.match(magazine, /MagazineShell/);
  assert.match(story, /MagazineShell/);
  assert.doesNotMatch(magazine, /PublicShell/);
  assert.doesNotMatch(story, /PublicShell/);
  assert.match(shell, /4planet-magazine-theme/);
  assert.match(shell, /aria-pressed/);
  assert.match(shell, /mag-world-footer/);
  assert.match(shell, /INNOVATION/);
  assert.match(worldCss, /data-mag-theme="dark"/);
  assert.match(worldCss, /prefers-reduced-motion/);
});

test("editorial taxonomy mixes living planet, culture, engineering and design", () => {
  for (const token of ["NATURE", "OCEAN", "INNOVATION", "TECHNOLOGY", "DESIGN", "SCIENCE", "FIELD", "PEOPLE", "SOLUTIONS", "CLIMATE", "CITIES", "FOOD", "CULTURE"]) {
    assert.match(operating, new RegExp(`\\"${token}\\"`));
  }
  assert.match(operating, /National Geographic/);
  assert.match(operating, /Vogue/);
  assert.match(operating, /Guardian/);
  assert.match(operating, /Monocle/);
  assert.match(operating, /WIRED/);
});

test("homepage uses deterministic asymmetric editorial mosaic, not random card-wall motion", () => {
  assert.match(magazine, /MOSAIC_SIZES/);
  assert.match(magazine, /MOSAIC_COLORS/);
  assert.match(magazine, /mag-story-mosaic/);
  assert.match(magazine, /mag-story-tile--/);
  assert.match(magazine, /useSearchParams/);
  assert.doesNotMatch(magazine, /Math\.random/);
  assert.match(worldCss, /grid-auto-flow: dense/);
  assert.match(worldCss, /mag-story-tile--green/);
  assert.match(worldCss, /mag-story-tile--pink/);
  assert.match(worldCss, /mag-story-tile--yellow/);
});

test("engineering and innovation are first-class editorial beats", () => {
  assert.match(magazine, /ENGINEERING THE LIVING WORLD/);
  assert.match(magazine, /Air filters that remember biodiversity/);
  assert.match(stories, /air-filter-biodiversity-time-machine/);
  assert.match(stories, /ai-coral-photomosaics/);
  assert.match(stories, /roads-that-warn-cars-about-moose/);
  assert.match(stories, /SOURCE_REPORTED_EDITORIAL/);
  assert.match(stories, /sourceLinks:/);
  assert.match(stories, /reportingNote:/);
});

test("article template is long-form, source-visible and topic-aware", () => {
  assert.match(story, /mag-article-world-header/);
  assert.match(story, /mag-article-world-dek/);
  assert.match(story, /HOW WE KNOW/);
  assert.match(story, /mag-source-list/);
  assert.match(story, /OPEN SOURCE/);
  assert.match(story, /mag-article-topics/);
  assert.match(story, /Context image; not evidence/);
  assert.match(story, /ONE USEFUL NEXT OBJECT/);
  assert.match(story, /Keep reading/);
  assert.match(story, /SHARE/);
  assert.match(stories, /relatedStories/);
});

test("strict article engine still protects franchise and field boundaries", () => {
  assert.match(engine, /FROM THE FIELD/);
  assert.match(engine, /THE LIVING WORLD/);
  assert.match(engine, /PLANET EXPLAINED/);
  assert.match(engine, /WHAT WORKS/);
  assert.match(engine, /CHOICE/);
  assert.match(engine, /IMAGE \/ MAP OF THE DAY/);
  assert.match(engine, /MAGAZINE_EDITORIAL_GOLD_DIMENSIONS/);
  assert.match(engine, /FIELD_PARTNER_DISPATCHES: FieldPartnerDispatch\[\] = \[\]/);
  assert.match(engine, /Empty until real field material passes source \+ rights \+ editorial gates/i);
});

test("required Magazine transparency routes remain inside the publication", () => {
  assert.match(router, /path="\/magazine\/about"/);
  assert.match(router, /path="\/magazine\/sources"/);
  assert.match(router, /path="\/magazine\/corrections"/);
  assert.match(router, /path="\/magazine\/stories\/:id"/);
});

test("Magazine Gold content gate is fail-closed and mandatory before builds", () => {
  assert.match(contentReader, /ts\.isCallExpression/);
  assert.match(qualityGate, /MAGAZINE GOLD FAIL/);
  assert.match(qualityGate, /source-reported editorial requires at least one exact source link/i);
  assert.match(qualityGate, /headline must not begin with an internal mission\/product code/i);
  assert.match(qualityGate, /dedicated Magazine shell/i);
  assert.match(packageJson, /magazine-quality-gate\.mjs/);
  assert.match(packageJson, /quality:magazine/);
});

test("analytics measures reading, second object, sharing and return without pre-consent tracking", () => {
  assert.match(analytics, /consent !== "granted"/);
  assert.match(analytics, /allow_google_signals: false/);
  assert.match(analytics, /allow_ad_personalization_signals: false/);
  assert.match(story, /magazine_engaged_read/);
  assert.match(story, /magazine_read_depth/);
  assert.match(story, /magazine_read_complete/);
  assert.match(magazineAnalytics, /if \(!window\.gtag\) return/);
  assert.match(magazineAnalytics, /magazine_relevant_second_object/);
  assert.match(magazineAnalytics, /magazine_share/);
  assert.match(magazineAnalytics, /visitor_state/);
  assert.match(privacy, /Privacy-first site measurement/);
  assert.match(headers, /cloudflareinsights\.com/);
});

test("search foundation keeps sitemap, RSS, static route metadata and canonical support", () => {
  assert.match(sitemap, /\/magazine\/about/);
  assert.match(sitemap, /news-sitemap\.xml/);
  assert.match(sitemap, /rss\.xml/);
  assert.match(contentReader, /readFoundingEdition/);
  assert.match(prerender, /readStories/);
  assert.match(prerender, /application\/ld\+json/);
  assert.match(prerender, /Article/);
  assert.match(prerender, /canonical/);
  assert.match(magazineSeo, /siteName="4PLANET MAGAZINE"/);
  assert.match(seo, /og:site_name/);
  assert.ok(prerender.includes('writeRoute(`/magazine/${story.slug}`'), "prerender must emit a static HTML document for every story route");
});
