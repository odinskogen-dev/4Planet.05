import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { enrichLivingSystemsHtml } from "./enhance-living-systems-seo.mjs";
import { LIVING_SYSTEMS_SEARCH_PAGES, livingSystemsPublicRoutes, LIVING_SYSTEMS_CANONICAL_PREFIX } from "./living-systems-search-surfaces.mjs";

const fixture = '<!doctype html><html><head><title>Old title</title><meta name="description" content="Old boilerplate"/></head><body><header>LIVING SYSTEMS INTELLIGENCE</header><h1>Amazon Rainforest</h1><p>Amazon rainfall and biodiversity</p></body></html>';

test("twelve canonical LSI pages are unique, bounded and source-faithful",()=>{
  assert.equal(LIVING_SYSTEMS_SEARCH_PAGES.length,12);
  assert.equal(new Set(LIVING_SYSTEMS_SEARCH_PAGES.map(p=>p.path)).size,12);
  for(const p of LIVING_SYSTEMS_SEARCH_PAGES){
    assert.match(p.path,/^\/[A-Za-z0-9/_-]+\/$/);
    assert.ok(p.title.includes("4PLANET"));
    assert.ok(p.description.length>=95&&p.description.length<=175,p.path+" description length "+p.description.length);
    assert.doesNotMatch(p.description,/proven|guaranteed|live animal position/i);
    assert.equal(LIVING_SYSTEMS_CANONICAL_PREFIX+p.path,"https://4planet.org"+livingSystemsPublicRoutes.find(x=>x.endsWith(p.path)));
  }
});
test("HTML enrichment keeps the original visible article unchanged",()=>{
  const p=LIVING_SYSTEMS_SEARCH_PAGES.find(x=>x.path.startsWith("/ecosystems/EC_"));
  const html=enrichLivingSystemsHtml(fixture,p);
  assert.match(html,/<link rel="canonical" href="https:\/\/4planet.org\/livingsystems\/ecosystems\/EC_AMAZON_RAINFOREST\/"/);
  assert.match(html,/name="description" content="Explore how the Amazon rainforest supports rainfall/);
  assert.match(html,/name="robots" content="index,follow,max-image-preview:large"/);
  assert.match(html,/<h1>Amazon Rainforest<\/h1><p>Amazon rainfall and biodiversity<\/p>/);
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert.equal((html.match(/name="description"/g)||[]).length,1);
  assert.equal((html.match(/type="application\/ld\+json"/g)||[]).length,1);
});
test("conflicting canonical, noindex and missing substantive H1 refuse patch",()=>{
  const p=LIVING_SYSTEMS_SEARCH_PAGES[0];
  assert.throws(()=>enrichLivingSystemsHtml(fixture.replace("</head>",'<link rel="canonical" href="https://elsewhere.example/path"/></head>'),p),/CONFLICTING_CANONICAL/);
  assert.throws(()=>enrichLivingSystemsHtml(fixture.replace("</head>",'<meta name="robots" content="noindex"/></head>'),p),/EXISTING_NOINDEX/);
  assert.throws(()=>enrichLivingSystemsHtml(fixture.replace("<h1>Amazon Rainforest</h1>",""),p),/MISSING_HEAD_OR_VISIBLE_H1/);
});
test("published entries augment the existing canonical sitemap without replacing its generator",()=>{
  const script=readFileSync(new URL("./generate-sitemap.mjs",import.meta.url),"utf8");
  const build=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));
  assert.match(script,/livingSystemsPublicRoutes/);
  assert.match(script,/\/livingsystems\//);
  assert.match(build.scripts.prebuild,/build-living-systems-v142\.mjs && node scripts\/enhance-living-systems-seo\.mjs/);
  assert.match(build.scripts.prebuild,/living-systems-v142-zero-loss.test.mjs/);
});
