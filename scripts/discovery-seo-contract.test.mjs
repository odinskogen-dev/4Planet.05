import test from "node:test";import assert from "node:assert/strict";import{readFileSync}from"node:fs";const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8"),inv=JSON.parse(read("src/data/discoveryInventory.json")),atlas=JSON.parse(read("src/data/atlasDiscovery.json")),router=read("src/routes/router.tsx"),atlasPage=read("src/pages/integrated/AtlasDiscoveryPage.tsx"),map=read("scripts/generate-sitemap.mjs"),pre=read("scripts/prerender-discovery-seo.mjs"),sr=read("src/pages/integrated/SpeciesRoute.tsx"),robots=read("public/robots.txt"),idx=read("index.html"),analytics=read("src/analytics/Analytics.tsx");
test("inventory",()=>{assert.ok(inv.places.some(p=>p.slug==="kenya"&&p.indexable));assert.ok(inv.species.length>=25);assert.equal(inv.species.filter(s=>s.indexable).length,25);assert.equal(inv.species.filter(s=>!s.indexable).length,0);for(const slug of["african-savanna-elephant","lion","cheetah","blue-whale","asian-elephant","tiger","polar-bear","giant-panda","whale-shark","green-sea-turtle","leopard","eastern-gorilla","chimpanzee","bornean-orangutan","emperor-penguin"])assert.ok(inv.species.some(s=>s.slug===slug&&s.indexable===true&&s.state==="CURATED"))});
test("routes",()=>{assert.match(router,/path="\/places"/);assert.match(router,/path="\/place\/:slug"/);assert.match(map,/discoveryInventory/);assert.match(pre,/Prerendered discovery HTML/)});
test("quality threshold",()=>assert.match(sr,/curated \? "index,follow,max-image-preview:large" : "noindex,follow"/));
test("crawler policy",()=>{for(const b of["OAI-SearchBot","Googlebot","Bingbot"])assert.ok(robots.includes(`User-agent: ${b}`));for(const p of["/labs","/os","/sandbox","/checkout","/api"])assert.ok(robots.includes(`Disallow: ${p}`));assert.match(idx,/host-indexing-policy\.js/)});
test("measurement isolation",()=>{const d=analytics.match(/const DEFAULT_ANALYTICS_DOMAINS = \[([\s\S]*?)\] as const;/)?.[1]||"";assert.doesNotMatch(d,/"test\.4planet\.org"/);assert.match(d,/"4sapien\.com"/);assert.match(d,/"4brands\.org"/)});

test("IndexNow is prepared but fails closed without explicit Founder release", () => {
  const indexNow = read("scripts/submit-indexnow.mjs");
  assert.match(indexNow, /FOUNDER_INDEXNOW_RELEASE/);
  assert.match(indexNow, /ENIG_INDEXNOW/);
  assert.match(indexNow, /https:\/\/api\.indexnow\.org\/indexnow/);
  assert.match(indexNow, /item\.indexable === true/);
  assert.equal(read("public/8f4c2d91a7b64e3fa1c9d0b6e5274a83.txt").trim(), "8f4c2d91a7b64e3fa1c9d0b6e5274a83");
});

test("owned return route is noindex and deliberately excluded from discovery sitemap",()=>{const router=read("src/routes/router.tsx");const page=read("src/pages/v5/PlanetSignal.tsx");const map=read("scripts/generate-sitemap.mjs");assert.match(router,/path="\/signal"/);assert.match(page,/robots="noindex,follow"/);assert.doesNotMatch(map,/^\s*"\/signal",?$/m);});

test("phase 02 place inventory is source-qualified and graph-connected",()=> {
  for (const slug of ["kenya","serengeti","costa-rica","great-barrier-reef","norway"]) {
    const place=inv.places.find((item)=>item.slug===slug);
    assert.ok(place?.indexable===true, `missing indexable place: ${slug}`);
    assert.ok(place.sources.length>=3, `insufficient sources: ${slug}`);
    assert.ok(place.relatedSpecies.some((item)=>item.state==="CURATED"&&item.slug), `missing curated species graph: ${slug}`);
  }
  const registry=read("src/planet/places.ts");
  assert.match(registry,/placeId\("serengeti"\)/);
  assert.match(registry,/placeId\("costa-rica"\)/);
});

test("Place schema uses citations rather than claiming sources are sameAs identities",()=> {
  const page=read("src/pages/integrated/Places.tsx");
  const prerender=read("scripts/prerender-discovery-seo.mjs");
  assert.match(page,/citation:place\.sources\.map/);
  assert.doesNotMatch(page,/sameAs:place\.sources/);
  assert.match(prerender,/citation: place\.sources\.map/);
  assert.match(prerender,/Related species/);
  assert.match(prerender,/\/species\/\$\{esc\(item\.slug\)\}/);
});

test("Species graph links back to qualifying Places",()=> {
  const route=read("src/pages/integrated/SpeciesRoute.tsx");
  assert.match(route,/relatedPlaces/);
  assert.match(route,/EXPLORE WHERE IT LIVES/);
  const envelopes=read("src/data/speciesSourceEnvelope.ts");
  for (const token of ["LEOPARD_SOURCE_ENVELOPE","EASTERN_GORILLA_SOURCE_ENVELOPE","CHIMPANZEE_SOURCE_ENVELOPE","BORNEAN_ORANGUTAN_SOURCE_ENVELOPE","EMPEROR_PENGUIN_SOURCE_ENVELOPE"]) assert.match(envelopes,new RegExp(token));
});

test("phase 03 expands discovery through existing ATLAS identities without a second Place engine",()=> {
  const expected=["amazon-basin","congo-basin","borneo","svalbard","oslofjord"];
  assert.equal(inv.places.filter((p)=>p.indexable).length,10);
  for(const slug of expected){
    const place=inv.places.find((p)=>p.slug===slug);
    assert.ok(place?.indexable===true, `missing phase03 place ${slug}`);
    assert.ok(place.sources.length>=3, `source threshold failed ${slug}`);
    assert.ok(place.relatedSpecies.some((item)=>item.state==="CURATED"&&item.slug), `species graph failed ${slug}`);
  }
  const registry=read("src/planet/places.ts");
  for(const id of ["amazon","congo-basin","borneo","svalbard","oslofjord"]) assert.ok(registry.includes(`placeId("${id}")`), `registry missing ${id}`);
});


test("first ATLAS useful internet objects are source-grounded, indexable and bounded",()=>{
  assert.deepEqual(atlas.objects.map((item)=>item.slug).sort(),["earth","fires","whales"]);
  for(const item of atlas.objects){assert.equal(item.indexable,true);assert.ok(item.atlasHref.startsWith("/atlas?"));assert.ok(item.sources.length>=1);assert.ok(item.limitations.length>=1)}
  assert.match(atlas.objects.find((item)=>item.slug==="fires").limitations.join(" "),/not proof of a wildfire/i);
  assert.match(atlas.objects.find((item)=>item.slug==="whales").limitations.join(" "),/not live animal positions/i);
});

test("ATLAS useful objects are routed, searchable and prerendered from one inventory",()=>{
  assert.match(router,/path="\\/atlas\\/:objectSlug"/);
  assert.match(map,/atlasDiscovery/);
  assert.match(map,/item\.indexable === true/);
  assert.match(pre,/atlasDiscovery/);
  assert.match(pre,/atlasObjects/);
  assert.match(atlasPage,/object\.indexable \? "index,follow,max-image-preview:large" : "noindex,follow"/);
  assert.match(atlasPage,/OPEN LIVE ATLAS/);
  assert.match(atlasPage,/SOURCES \/ PROVENANCE/);
});

test("public product-host attribution includes 4NATION, SPECIES and MAGAZINE",()=>{
  const d=analytics.match(/const DEFAULT_ANALYTICS_DOMAINS = \\[([\\s\\S]*?)\\] as const;/)?.[1]||"";
  for(const host of ["4nation.org","4species.com","4planetmagazine.com"]) assert.match(d,new RegExp(`"${host.replaceAll(".","\\\\.")}"`));
  assert.match(analytics,/host === "4nation\\.org".*return "4nation"/);
  assert.match(analytics,/host === "4species\\.com".*return "species"/);
  assert.match(analytics,/host === "4planetmagazine\\.com".*return "magazine"/);
});
