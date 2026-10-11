import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(p)=>fs.readFileSync(p,"utf8");
const data=JSON.parse(read("src/data/discoveryTopics.json"));
const router=read("src/routes/router.tsx");
const sitemap=read("scripts/generate-sitemap.mjs");
const prerender=read("scripts/prerender-discovery-seo.mjs");
const middleware=read("functions/_middleware.js");

test("MAX EXPOSURE discovery topics are source-grounded and indexable only with useful public value",()=>{
  assert.ok(Array.isArray(data.topics) && data.topics.length >= 20);
  assert.ok(data.earthNow?.title && data.earthNow?.answer && data.earthNow?.truthBoundary);
  for(const topic of data.topics){
    assert.equal(topic.indexable,true,`${topic.slug}: topic must be explicitly indexable`);
    for(const field of ["slug","name","title","description","answer","happening","whyItMatters","sourceEstablishes","sourceDoesNotEstablish","atlasHref"]){
      assert.ok(topic[field],`${topic.slug}: missing ${field}`);
    }
    assert.ok(Array.isArray(topic.keyFacts) && topic.keyFacts.length>0,`${topic.slug}: key facts missing`);
    assert.ok(Array.isArray(topic.sources) && topic.sources.length>0,`${topic.slug}: sources missing`);
    for(const source of topic.sources){
      assert.match(source.url,/^https:\/\//,`${topic.slug}: source URL must be public https`);
      assert.ok(source.authority && source.label,`${topic.slug}: source identity missing`);
    }
  }
});

test("4planet.org sitemap owns Discovery Guides but not standalone ATLAS Place or SPECIES canonicals",()=>{
  assert.match(sitemap,/discoveryTopics/);
  assert.match(sitemap,/"\/now"/);
  assert.match(sitemap,/discoveryTopics\.topics/);
  assert.doesNotMatch(sitemap,/discoveryInventory\.places/);
  assert.doesNotMatch(sitemap,/discoveryInventory\.species/);
  assert.match(sitemap,/Canonical PLACE ownership lives on 4planetatlas\.com/);
});

test("Discovery Guides have human routes and server-readable prerender",()=>{
  assert.match(router,/DiscoveryTopicPage/);
  assert.match(router,/EarthNowPage/);
  assert.match(router,/path="\/now"/);
  assert.match(router,/path="\/earth-now"/);
  assert.match(router,/DISCOVERY_TOPIC_SLUGS\.map/);
  assert.match(prerender,/src\/data\/discoveryTopics\.json/);
  assert.match(prerender,/write\("\/now"/);
  assert.match(prerender,/What the sources establish/);
  assert.match(prerender,/What they do not establish/);
  assert.match(prerender,/application\/ld\+json/);
  assert.match(prerender,/canonical/);\n  assert.match(prerender,/guideHref/);\n  assert.match(prerender,/origin\+\"\\/og\\.png\"/);
  assert.match(prerender,/Explore in 4PLANET ATLAS/);
});

test("No programmatic-thin-page escape hatch is introduced",()=>{
  assert.doesNotMatch(sitemap,/10,000|10000|programmatic seo/i);
  assert.ok(data.publicationLaw?.length>20);
});


test("canonical transport and Living Systems authority are fail-closed",()=>{
  assert.match(middleware,/canonicalHttpsHosts/);
  assert.match(middleware,/url\.protocol !== "https:"/);
  assert.match(middleware,/\["\/living-systems\/", "\/livingsystems\/"\]/);
  assert.match(middleware,/\["\/living-systems\/oslofjorden", "\/living-systems\/oslofjord"\]/);
  assert.match(middleware,/\["\/livingsystems\/oslofjord", "\/living-systems\/oslofjord"\]/);
  assert.match(middleware,/\["\/livingsystems\/great-barrier-reef", "\/living-systems\/great-barrier-reef"\]/);
  assert.match(middleware,/url\.pathname === "\/livingsystems\/"/);
  assert.match(middleware,/Living Systems Intelligence \| 4PLANET/);
  assert.match(middleware,/CollectionPage/);
  assert.match(middleware,/max-image-preview:large/);
});
