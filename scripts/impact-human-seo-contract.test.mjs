import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(p)=>fs.readFileSync(p,"utf8");
const home=read("src/impact/ui/HomeTemplate.tsx");
const actor=read("src/impact/ui/ActorTemplate.tsx");
const issue=read("src/impact/ui/IssueTemplate.tsx");
const solution=read("src/impact/ui/SolutionTemplate.tsx");
const primitives=read("src/impact/ui/primitives.tsx");
const css=read("src/styles/impact-living-action-network.css");
const discovery=read("scripts/prerender-discovery-seo.mjs");
const seo=read("scripts/prerender-impact-seo.mjs");
const sitemap=read("scripts/generate-sitemap.mjs");

test("IMPACT home stays human-first as the graph scales",()=>{
  assert.match(home,/issuesWithProjects/);
  assert.match(home,/issuesWithoutProjects/);
  assert.match(home,/primaryActors/);
  assert.match(home,/primarySolutions/);
  assert.match(home,/source-aware public records/);
  assert.match(home,/open the map for geographic context rather than a long place list/);
  assert.match(home,/className="iu-home-jumps"/);
  assert.match(home,/className="iu-more"/);
  assert.match(css,/\.iu-home-jumps/);
  assert.match(css,/\.iu-more/);
});

test("profiles expose usable in-page navigation and truthful states",()=>{
  assert.match(actor,/OnThisPage/);
  assert.match(actor,/const next = \(\) => String\(\+\+sectionNumber\)/);
  assert.match(issue,/source-backed claim/);
  assert.match(issue,/no published project linked yet/);
  assert.match(issue,/const next = \(\) => String\(\+\+sectionNumber\)/);
  assert.match(solution,/OnThisPage/);
  assert.match(solution,/Method · public record/);
  assert.doesNotMatch(solution,/Method · early record/);
  assert.match(primitives,/Published by 4PLANET · source-aware record from NATUREBRAIN/);
});

test("crawlable IMPACT pages emit strong discovery metadata",()=>{
  for(const token of [
    '"property:og:image"', '"property:og:image:alt"', '"property:og:locale"',
    '"name:twitter:card"', '"name:twitter:image"'
  ]) assert.ok(discovery.includes(token),token);
  assert.match(discovery,/summary_large_image/);
  assert.match(seo,/const metaDescription/);
  assert.match(seo,/publisher/);
  assert.match(seo,/"@graph"/);
  assert.match(seo,/mainEntity/);
  assert.match(seo,/inLanguage: "en-GB"/);
  assert.doesNotMatch(seo,/nofollow/);
});

test("IMPACT discovery stays crawlable and independently monitorable",()=>{
  assert.match(sitemap,/impact-sitemap\.xml/);
  assert.match(sitemap,/impactSitemapRoutes/);
  assert.match(sitemap,/OAI-SearchBot/);
  assert.match(sitemap,/Googlebot/);
  assert.match(sitemap,/Bingbot/);
});
