import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read=(p)=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const data=JSON.parse(read("src/data/discoveryTopics.json"));
const router=read("src/routes/router.tsx");
const page=read("src/pages/discovery/DiscoveryEngine.tsx");
const shell=read("src/components/layout/PublicShell.tsx");
const css=read("src/styles/human-first-public.css");
const sitemap=read("scripts/generate-sitemap.mjs");
const prerender=read("scripts/prerender-discovery-seo.mjs");
const pkg=JSON.parse(read("package.json"));

const REQUIRED=["wildfires","earthquakes","climate-change","biodiversity","deforestation","plastic-pollution","coral-bleaching","air-quality","orca","whales","bees","amazon-rainforest","oslofjord","renewable-energy","solar-energy","food-waste","fast-fashion","rewilding","climate-solutions","environmental-jobs"];

test("LIVE carrier contains Earth Now and exactly 20 permanent discovery topics",()=>{
  assert.equal(data.topics.length,20);
  assert.deepEqual(data.topics.map(x=>x.slug),REQUIRED);
  assert.equal(data.earthNow.signals.length,8);
  assert.match(data.earthNow.truthBoundary,/latest available/i);
  assert.match(data.earthNow.truthBoundary,/not one synchronized real-time Earth/i);
});

test("LIVE router exposes canonical topic URLs without replacing ATLAS",()=>{
  assert.match(router,/path="\/now"/);
  assert.match(router,/path="\/earth-now"/);
  assert.match(router,/DISCOVERY_TOPIC_SLUGS\.map/);
  assert.match(router,/path="\/atlas"/);
  assert.match(page,/https:\/\/4planetatlas\.com\/\?/);
  assert.doesNotMatch(page,/new maplibregl\.Map/);
});

test("search surfaces are generated from the canonical registry",()=>{
  assert.match(sitemap,/discoveryTopics\.json/);
  assert.match(sitemap,/\/now/);
  assert.match(sitemap,/discoveryTopics\.topics/);
  assert.match(prerender,/discoveryTopics\.json/);
  assert.match(prerender,/write\("\/now"/);
  assert.match(prerender,/for\(const t of dt\)/);
  assert.match(prerender,/What the sources establish/);
  assert.match(prerender,/What they do not establish/);
});

test("Master Brand OS and public navigation remain the presentation authority",()=>{
  assert.match(page,/<PublicShell>/);
  assert.match(shell,/\["EARTH NOW", "WHAT IS HAPPENING", "\/now"\]/);
  assert.match(css,/DISCOVERY ENGINE 01/);
  assert.match(css,/--discovery-accent:#2E2EFF/);
  assert.match(css,/background:#080808/);
});

test("source and uncertainty boundaries remain explicit",()=>{
  for(const t of data.topics){
    assert.equal(t.indexable,true);
    assert.ok(t.sources.length>=1);
    assert.ok(t.keyFacts.length>=3);
    assert.ok(t.sourceEstablishes.length>30);
    assert.ok(t.sourceDoesNotEstablish.length>30);
    for(const s of t.sources){
      assert.match(s.url,/^https:\/\//);
      assert.equal(s.checkedAt,data.updatedAt);
    }
  }
});

test("LIVE carrier uses patched React Router",()=>{
  assert.equal(pkg.dependencies["react-router-dom"],"7.18.4");
});
