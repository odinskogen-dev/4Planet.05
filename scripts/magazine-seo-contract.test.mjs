import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const magazine = read("src/pages/v5/Magazine.tsx");
const editorial = read("src/content/magazineEditorial.ts");
const operating = read("src/content/magazineOperating.ts");
const stories = read("src/content/stories.ts");
const router = read("src/routes/router.tsx");
const story = read("src/pages/v5/StoryArticle.tsx");
const storyRecord = read("src/pages/v5/MagazineStoryRecord.tsx");
const analytics = read("src/analytics/Analytics.tsx");
const magazineAnalytics = read("src/analytics/MagazineAnalytics.ts");
const seo = read("src/components/Seo.tsx");
const magazineSeo = read("src/components/MagazineSeo.tsx");
const privacy = read("src/pages/v5/Privacy.tsx");
const headers = read("public/_headers");
const sitemap = read("scripts/generate-sitemap.mjs");
const prerender = read("scripts/prerender-magazine-seo.mjs");
const packageJson = read("package.json");

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

test("global media doctrine is encoded without copying a single publisher", () => {
  assert.match(operating, /National Geographic/);
  assert.match(operating, /BBC/);
  assert.match(operating, /VICE/);
  assert.match(operating, /Vogue/);
  assert.match(operating, /TIME/);
  assert.match(operating, /Guardian/);
  assert.match(operating, /AWE GETS ATTENTION/);
  assert.match(operating, /LIFE/);
  assert.match(operating, /PLANET/);
  assert.match(operating, /HUMAN/);
  assert.match(operating, /SOLUTIONS/);
  assert.match(operating, /PEOPLE/);
  assert.match(operating, /CULTURE/);
});

test("editorial and organisational content are visibly separated", () => {
  assert.match(magazine, /4PLANET-owned explainers|4PLANET-owned explanatory/i);
  assert.match(story, /ORGANISATIONAL CONTENT — NOT INDEPENDENT EDITORIAL/);
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

test("public explainers are complete first-touch front doors", () => {
  assert.match(story, /MagazineSeo/);
  assert.match(story, /"@type": "Article"/);
  assert.match(story, /HOW WE KNOW/);
  assert.match(story, /ONE USEFUL NEXT STEP/);
  assert.match(story, /Related by subject, not popularity/);
  assert.match(story, /SHARE/);
  assert.match(stories, /relatedStories/);
  assert.match(stories, /pathway:/);
  assert.match(magazineSeo, /og:site_name/);
  assert.match(seo, /link\[rel="canonical"\]/);
});

test("analytics measures reading, relevant second object, share and return without pre-consent tracking", () => {
  assert.match(analytics, /consent !== "granted"/);
  assert.match(analytics, /allow_google_signals: false/);
  assert.match(analytics, /allow_ad_personalization_signals: false/);
  assert.match(analytics, /VITE_ANALYTICS_DOMAINS/);
  assert.match(story, /magazine_engaged_read/);
  assert.match(story, /magazine_read_depth/);
  assert.match(story, /magazine_read_complete/);
  assert.match(magazineAnalytics, /if \(!window\.gtag\) return/);
  assert.match(magazineAnalytics, /magazine_relevant_second_object/);
  assert.match(magazineAnalytics, /magazine_share/);
  assert.match(magazineAnalytics, /visitor_state/);
  assert.match(privacy, /Privacy-first site measurement/);
  assert.match(privacy, /Optional product analytics/);
  assert.match(headers, /static\.cloudflareinsights\.com/);
  assert.match(headers, /cloudflareinsights\.com/);
  assert.match(headers, /www\.googletagmanager\.com/);
  assert.match(headers, /www\.google-analytics\.com/);
});

test("search foundation generates sitemap, News sitemap, RSS and static route metadata", () => {
  assert.match(sitemap, /\/magazine\/about/);
  assert.match(sitemap, /news-sitemap\.xml/);
  assert.match(sitemap, /rss\.xml/);
  assert.match(sitemap, /robots\.txt/);
  assert.match(prerender, /readStories/);
  assert.match(prerender, /readImages/);
  assert.match(prerender, /application\/ld\+json/);
  assert.match(prerender, /Article/);
  assert.match(prerender, /canonical/);
  assert.match(prerender, /magazine\/${story\.slug}/);
  assert.match(packageJson, /prerender-magazine-seo\.mjs/);
});
