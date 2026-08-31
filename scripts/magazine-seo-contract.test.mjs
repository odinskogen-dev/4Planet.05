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
const mazeCss = read("src/styles/magazine-maze.css");
const articleGoldCss = read("src/styles/magazine-article-gold.css");
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

test("strict article engine encodes franchises, editorial Gold and partner-feed truth boundaries", () => {
  assert.match(engine, /FROM THE FIELD/);
  assert.match(engine, /THE LIVING WORLD/);
  assert.match(engine, /PLANET EXPLAINED/);
  assert.match(engine, /WHAT WORKS/);
  assert.match(engine, /CHOICE/);
  assert.match(engine, /IMAGE \/ MAP OF THE DAY/);
  assert.match(engine, /MAGAZINE_ARTICLE_GOLD_GRAMMAR/);
  assert.match(engine, /MAGAZINE_EDITORIAL_GOLD_DIMENSIONS/);
  assert.match(engine, /MAGAZINE_EDITORIAL_JUDGEMENTS/);
  assert.match(engine, /MAGAZINE_LAUNCH_STORY_QUEUE/);
  assert.match(engine, /FIELD_PARTNER_INTAKE_CONTRACT/);
  assert.match(engine, /FIELD_PARTNER_DISPATCHES: FieldPartnerDispatch\[\] = \[\]/);
  assert.match(engine, /Empty until real field material passes source \+ rights \+ editorial gates/i);
  assert.match(engine, /Optimise templates and distribution against downstream reader behaviour and editorial quality together/i);
  assert.match(engine, /buildPartnerSharePath/);
  assert.match(stories, /franchise:/);
  assert.match(stories, /editorialType:/);
  assert.match(stories, /byline:/);
});

test("Magazine homepage uses a functional dark-mode 4PLANET colour maze without card-wall navigation", () => {
  assert.match(magazine, /SIX WAYS IN/);
  assert.match(magazine, /One planet\. Enter where it matters to you\./);
  assert.match(magazine, /mag-maze-tile/);
  assert.match(mazeCss, /#3ae86f/);
  assert.match(mazeCss, /#2e2eff/);
  assert.match(mazeCss, /#ff4d22/);
  assert.match(mazeCss, /#ff5acd/);
  assert.match(mazeCss, /prefers-reduced-motion/);
});

test("editorial and organisational content are visibly separated", () => {
  assert.match(magazine, /4PLANET-owned explainers|4PLANET-owned explanatory/i);
  assert.match(story, /ORGANISATIONAL CONTENT — NOT INDEPENDENT EDITORIAL/);
  assert.match(story, /editorialType/);
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
  assert.match(story, /Do one useful thing more/);
  assert.match(story, /Related by subject, not popularity/);
  assert.match(story, /SHARE/);
  assert.match(stories, /relatedStories/);
  assert.match(stories, /franchiseMatch/);
  assert.match(stories, /pathway:/);
  assert.match(articleGoldCss, /mag-end-rail/);
  assert.match(magazineSeo, /siteName="4PLANET MAGAZINE"/);
  assert.match(seo, /og:site_name/);
  assert.match(seo, /link\[rel="canonical"\]/);
});

test("Magazine Gold content gate is fail-closed and mandatory before builds", () => {
  assert.match(contentReader, /ts\.isCallExpression/);
  assert.match(qualityGate, /MAGAZINE GOLD FAIL/);
  assert.match(qualityGate, /every launch article needs one bounded relevant second object/i);
  assert.match(qualityGate, /explicit recurring franchise\/template identity/i);
  assert.match(qualityGate, /visible authorship\/byline required/i);
  assert.match(packageJson, /magazine-quality-gate\.mjs/);
  assert.match(packageJson, /quality:magazine/);
});

test("analytics measures reading, relevant second object, share, partner attribution and return without pre-consent tracking", () => {
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
  assert.match(magazineAnalytics, /acquisition_source/);
  assert.match(magazineAnalytics, /magazine_partner_loop/);
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
  assert.match(contentReader, /readFoundingEdition/);
  assert.match(prerender, /readStories/);
  assert.match(prerender, /readImages/);
  assert.match(prerender, /readFoundingEdition/);
  assert.match(prerender, /application\/ld\+json/);
  assert.match(prerender, /Article/);
  assert.match(prerender, /canonical/);
  assert.match(prerender, /noindex,follow,noarchive,max-image-preview:large/);
  assert.match(prerender, /WebPage/);
  assert.ok(prerender.includes('writeRoute(`/magazine/${story.slug}`'), "prerender must emit a static HTML document for every public story route");
  assert.ok(prerender.includes('const route = `/magazine/stories/${record.id}`'), "prerender must emit a static noindex HTML document for every pre-publication record");
  assert.match(packageJson, /prerender-magazine-seo\.mjs/);
});
