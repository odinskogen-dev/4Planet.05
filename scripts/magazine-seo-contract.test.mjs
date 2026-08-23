import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const magazine = read("src/pages/v5/Magazine.tsx");
const editorial = read("src/content/magazineEditorial.ts");
const router = read("src/routes/router.tsx");
const story = read("src/pages/v5/StoryArticle.tsx");
const analytics = read("src/analytics/Analytics.tsx");
const seo = read("src/components/Seo.tsx");
const privacy = read("src/pages/v5/Privacy.tsx");
const sitemap = read("scripts/generate-sitemap.mjs");

test("M4GAZINE Founding Edition remains truthfully pre-publication", () => {
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
  assert.match(magazine, /Organisational stories, clearly separated from M4GAZINE editorial/);
  assert.match(story, /ORGANISATIONAL CONTENT — NOT M4GAZINE INDEPENDENT EDITORIAL/);
});

test("required magazine transparency routes exist", () => {
  assert.match(router, /path="\/magazine\/about"/);
  assert.match(router, /path="\/magazine\/sources"/);
  assert.match(router, /path="\/magazine\/corrections"/);
});

test("permanent story pages carry SEO and Article structured data", () => {
  assert.match(story, /<Seo/);
  assert.match(story, /"@type": "Article"/);
  assert.match(seo, /link\[rel="canonical"\]/);
  assert.match(seo, /application\/ld\+json/);
});

test("analytics is consent-first and advertising signals stay disabled", () => {
  assert.match(analytics, /consent !== "granted"/);
  assert.match(analytics, /allow_google_signals: false/);
  assert.match(analytics, /allow_ad_personalization_signals: false/);
  assert.match(analytics, /VITE_ANALYTICS_DOMAINS/);
  assert.match(privacy, /Optional usage analytics/);
});

test("sitemap generator includes magazine index, transparency and public story routes", () => {
  assert.match(sitemap, /\/magazine\/about/);
  assert.match(sitemap, /\/magazine\/sources/);
  assert.match(sitemap, /\/magazine\/corrections/);
  assert.match(sitemap, /storySlugs\.map/);
});
