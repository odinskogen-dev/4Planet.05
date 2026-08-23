import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const magazine = read("src/pages/v5/Magazine.tsx");
const editorial = read("src/content/magazineEditorial.ts");
const router = read("src/routes/router.tsx");
const story = read("src/pages/v5/StoryArticle.tsx");
const storyRecord = read("src/pages/v5/MagazineStoryRecord.tsx");
const analytics = read("src/analytics/Analytics.tsx");
const seo = read("src/components/Seo.tsx");
const privacy = read("src/pages/v5/Privacy.tsx");
const headers = read("public/_headers");
const sitemap = read("scripts/generate-sitemap.mjs");

test("4PLANET MAGAZINE Founding Edition remains truthfully pre-publication", () => {
  assert.match(magazine, /4PLANET MAGAZINE/);
  assert.match(magazine, /WHAT HOLDS|FOUNDING_EDITION\.workingTitle/);
  assert.match(magazine, /PRE-PUBLICATION/);
  assert.match(editorial, /responsible editor \/ editorial lead must be designated/i);
  assert.match(editorial, /THE BLOOM AROUND A BREAKING ICEBERG/);
  assert.match(editorial, /THEY KEPT THEIR PLACES/);
  assert.match(editorial, /OSLOFJORDEN: WHERE THE NITROGEN COMES FROM/);
  assert.match(editorial, /ADD THEM HERE\. REMOVE THEM THERE\./);
  assert.match(editorial, /WHAT WE KNOW\. WHAT WE DON’T\. WHAT CHANGED\./);
});

test("editorial and organisational content are visibly separated", () => {
  assert.match(magazine, /Organisational stories, clearly separated from independent Magazine editorial/);
  assert.match(story, /ORGANISATIONAL CONTENT — NOT 4PLANET MAGAZINE INDEPENDENT EDITORIAL/);
});

test("required magazine transparency routes exist", () => {
  assert.match(router, /path="\/magazine\/about"/);
  assert.match(router, /path="\/magazine\/sources"/);
  assert.match(router, /path="\/magazine\/corrections"/);
});

test("Founding Edition records have permanent routes without pretending to be published articles", () => {
  assert.match(router, /path="\/magazine\/stories\/:id"/);
  assert.match(magazine, /\/magazine\/stories\/\$\{item\.id\}/);
  assert.match(storyRecord, /PRE-PUBLICATION STORY RECORD/);
  assert.match(storyRecord, /robots="noindex,follow"/);
  assert.match(storyRecord, /A permanent record is not a published article/);
  assert.match(storyRecord, /SOURCE STATE/);
  assert.match(storyRecord, /RIGHTS STATE/);
  assert.match(storyRecord, /RESPONSIBILITY STATE/);
  assert.doesNotMatch(storyRecord, /"@type"\s*:\s*"Article"/);
});

test("permanent public explainer pages carry SEO and Article structured data", () => {
  assert.match(story, /<Seo/);
  assert.match(story, /"@type": "Article"/);
  assert.match(seo, /link\[rel="canonical"\]/);
  assert.match(seo, /application\/ld\+json/);
});

test("analytics is consent-first, privacy-bounded and browser-permitted", () => {
  assert.match(analytics, /consent !== "granted"/);
  assert.match(analytics, /allow_google_signals: false/);
  assert.match(analytics, /allow_ad_personalization_signals: false/);
  assert.match(analytics, /VITE_ANALYTICS_DOMAINS/);
  assert.match(story, /magazine_engaged_read/);
  assert.match(story, /magazine_read_depth/);
  assert.match(story, /magazine_read_complete/);
  assert.match(privacy, /Privacy-first site measurement/);
  assert.match(privacy, /Optional product analytics/);
  assert.match(headers, /static\.cloudflareinsights\.com/);
  assert.match(headers, /cloudflareinsights\.com/);
  assert.match(headers, /www\.googletagmanager\.com/);
  assert.match(headers, /www\.google-analytics\.com/);
});

test("sitemap generator includes magazine index, transparency and public story routes", () => {
  assert.match(sitemap, /\/magazine\/about/);
  assert.match(sitemap, /\/magazine\/sources/);
  assert.match(sitemap, /\/magazine\/corrections/);
  assert.match(sitemap, /storySlugs\.map/);
});
