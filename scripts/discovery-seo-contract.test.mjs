import test from "node:test";import assert from "node:assert/strict";import{readFileSync}from"node:fs";const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8"),inv=JSON.parse(read("src/data/discoveryInventory.json")),atlas=JSON.parse(read("src/data/atlasDiscovery.json")),router=read("src/routes/router.tsx"),atlasPage=read("src/pages/integrated/AtlasDiscoveryPage.tsx"),map=read("scripts/generate-sitemap.mjs"),pre=read("scripts/prerender-discovery-seo.mjs"),sr=read("src/pages/integrated/SpeciesRoute.tsx"),robots=read("public/robots.txt"),idx=read("index.html"),analytics=read("src/analytics/Analytics.tsx"),speciesMedia=read("src/data/speciesMedia.ts"),sourceEnvelopes=read("src/data/speciesSourceEnvelope.ts");
test("inventory",()=>{assert.ok(inv.places.some(p=>p.slug==="kenya"&&p.indexable));assert.ok(inv.species.length>=26);assert.equal(inv.species.filter(s=>s.indexable).length,26);assert.equal(inv.species.filter(s=>!s.indexable).length,0);for(const slug of["african-savanna-elephant","lion","cheetah","blue-whale","asian-elephant","tiger","polar-bear","giant-panda","whale-shark","green-sea-turtle","leopard","eastern-gorilla","chimpanzee","bornean-orangutan","emperor-penguin","acropora-palmata"])assert.ok(inv.species.some(s=>s.slug===slug&&s.indexable===true&&s.state==="CURATED"))});
test("routes",()=>{assert.match(router,/path="\/places"/);assert.match(router,/path="\/place\/:slug"/);assert.match(map,/discoveryInventory/);assert.match(pre,/Prerendered discovery HTML/)});
test("quality threshold",()=>assert.match(sr,/curated \? "index,follow,max-image-preview:large" : "noindex,follow"/));
test("crawler policy",()=>{for(const b of["OAI-SearchBot","Googlebot","Bingbot"])assert.ok(robots.includes(`User-agent: ${b}`));for(const p of["/labs","/os","/sandbox","/checkout","/api"])assert.ok(robots.includes(`Disallow: ${p}`));assert.match(idx,/host-indexing-policy\.js/)});
test("measurement isolation",()=>{const d=analytics.match(/const DEFAULT_ANALYTICS_DOMAINS = \[([\s\S]*?)\] as const;/)?.[1]||"";assert.doesNotMatch(d,/"test\.4planet\.org"/);assert.match(d,/"4sapien\.com"/);assert.match(d,/"4brands\.org"/)});

test("IndexNow is prepared but fails closed without explicit Founder release", () => {
  const indexNow = read("scripts/submit-indexnow.mjs");
  assert.match(indexNow, /FOUNDER_INDEXNOW_RELEASE/);
  assert.match(indexNow, /ENIG_INDEXNOW/);
  assert.match(indexNow, /https:\/\/api\.indexnow\.org\/indexnow/);
  // Verify the canonical sitemap as the sole eligible URL source; no submission here.
  assert.match(indexNow, /sitemapPath/);
  assert.match(indexNow, /sitemap\.matchAll/);
  assert.match(indexNow, /new URL\(url\)\.origin === origin/);
  assert.match(indexNow, /new Set\(urlList\)/);
  assert.match(indexNow, /uniqueUrls\.length === 0/);
  assert.match(indexNow, /release !== RELEASE_TOKEN/);
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

test("PLACE discovery separates source curation from Founder release and canonical ownership",()=> {
  const publicOrigin="https://4planet.org";
  const released=(item)=>item.indexable===true&&item.publicationState==="READY_FOR_FOUNDER_RELEASE"&&item.canonicalOrigin===publicOrigin;
  assert.equal(inv.places.filter((item)=>item.indexable===true).length,10);
  assert.equal(inv.places.filter((item)=>item.publicationState==="READY_FOR_FOUNDER_RELEASE").length,1);
  assert.equal(inv.places.filter(released).length,0,"canonical ownership is intentionally unresolved");
  assert.ok(inv.places.every((item)=>item.canonicalOrigin===null));
  assert.equal(released({...inv.places[0],canonicalOrigin:publicOrigin}),true,"positive fixture requires all three gates");
  assert.equal(released({...inv.places[0],publicationState:"HEIR_CANDIDATE",canonicalOrigin:publicOrigin}),false,"candidate state cannot publish");
  assert.equal(released({...inv.places[0],indexable:false,canonicalOrigin:publicOrigin}),false,"uncurated object cannot publish");
  assert.equal(released({...inv.places[0],canonicalOrigin:"https://example.org"}),false,"canonical mismatch cannot publish");
  assert.match(inv.publicationLaw,/source\/usefulness curation only/);
  assert.match(inv.publicationLaw,/Missing or conflicting release\/canonical authority fails closed/);
  assert.match(map,/filter\(placeIsReleasedForOrigin\)/);
  assert.match(pre,/filter\(placeIsReleasedForOrigin\)/);
  const placesPage=read("src/pages/integrated/Places.tsx");
  assert.match(placesPage,/placeIsReleasedForOrigin/);
  assert.match(placesPage,/canonical=\{released\}/);
  assert.match(placesPage,/jsonLd=\{released \?/);
  assert.match(sr,/place\.publicationState === "READY_FOR_FOUNDER_RELEASE"/);
  assert.match(sr,/place\.canonicalOrigin === publicOrigin/);
});

test("generated sitemap fails closed for PLACE candidates without canonical authority",async()=> {
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath,["scripts/generate-sitemap.mjs"],{cwd:new URL("..",import.meta.url),stdio:"pipe"});
  const sitemap=read("public/sitemap.xml");
  assert.doesNotMatch(sitemap,/\/place\//);
  assert.match(sitemap,/\/species\/orca/);
});


test("first ATLAS useful internet objects are source-grounded, indexable and bounded",()=>{
  assert.deepEqual(atlas.objects.map((item)=>item.slug).sort(),["earth","fires","whales"]);
  for(const item of atlas.objects){assert.equal(item.indexable,true);assert.ok(item.atlasHref.startsWith("/atlas?"));assert.ok(item.sources.length>=1);assert.ok(item.limitations.length>=1)}
  assert.match(atlas.objects.find((item)=>item.slug==="fires").limitations.join(" "),/not proof of a wildfire/i);
  assert.match(atlas.objects.find((item)=>item.slug==="whales").limitations.join(" "),/not live animal positions/i);
});

test("ATLAS useful objects are routed, searchable and prerendered from one inventory",()=>{
  assert.ok(router.includes('path="/atlas/:objectSlug"'));
  assert.ok(map.includes("atlasDiscovery"));
  assert.ok(map.includes("item.indexable === true"));
  assert.ok(pre.includes("atlasDiscovery"));
  assert.ok(pre.includes("atlasObjects"));
  assert.ok(atlasPage.includes('object.indexable ? "index,follow,max-image-preview:large" : "noindex,follow"'));
  assert.ok(atlasPage.includes("OPEN LIVE ATLAS"));
  assert.ok(atlasPage.includes("SOURCES / PROVENANCE"));
});

test("public product-host attribution includes 4NATION, SPECIES and MAGAZINE",()=>{
  for(const host of ["4nation.org","4species.com","4planetmagazine.com"]) assert.ok(analytics.includes(`"${host}"`));
  assert.ok(analytics.includes('host === "4nation.org"'));
  assert.ok(analytics.includes('return "4nation"'));
  assert.ok(analytics.includes('host === "4species.com"'));
  assert.ok(analytics.includes('return "species"'));
  assert.ok(analytics.includes('host === "4planetmagazine.com"'));
  assert.ok(analytics.includes('return "magazine"'));
});


test("Orca discovery object carries a reusable search, share and AI-retrieval projection",()=>{
  const orca=inv.species.find((item)=>item.slug==="orca");
  assert.equal(orca?.indexable,true);
  assert.equal(orca?.state,"CURATED");
  assert.match(orca?.title||"",/Orca \(Orcinus orca\).*Killer whale/i);
  assert.match(orca?.description||"",/source-grounded evidence/i);
  assert.equal(orca?.image,"/assets/species/orca/hero.jpg");
  assert.equal(orca?.atlasHref,"/atlas/whales");
  assert.deepEqual(orca?.sourceUrls,[
    "https://www.gbif.org/species/2440483",
    "https://obis.org/taxon/137102",
    "https://www.fisheries.noaa.gov/species/killer-whale",
  ]);
  assert.ok((orca?.limitations||[]).some((item)=>/not live animal positions/i.test(item)));
  for(const url of orca?.sourceUrls||[]) assert.ok(sourceEnvelopes.includes(url), `Orca discovery source must exist in canonical source envelope: ${url}`);
  assert.match(speciesMedia,/localPath: "\/assets\/species\/orca\/hero\.jpg"/);
  assert.match(speciesMedia,/rightsStatus: "LICENCE_VERIFIED"/);
});

test("Orca discovery metadata preserves citations, Taxon identity, limits and ATLAS journey in client and prerender",()=>{
  for(const token of ['"@type": "Taxon"',"citation: sourceUrls","scientificName: curated.scientificName",'limitations.join(" ")',"image={media?.localPath}"]) assert.ok(sr.includes(token), `client metadata missing ${token}`);
  for(const token of ['"@type": "Taxon"',"citation: sourceUrls","What this does not establish","image: item.image","atlasHref"]) assert.ok(pre.includes(token), `prerender metadata missing ${token}`);
  assert.match(pre,/selector\.indexOf\(":"\)/);
  assert.doesNotMatch(pre,/selector\.split\(":"\)/);
});


test("P0 crawler policy excludes private OS without blocking public Oslofjord", () => {
  const robots = read("public/robots.txt");
  const groups = robots.split(/(?=^User-agent: )/m).filter((line) => line.startsWith("User-agent: "));
  const agents = ["OAI-SearchBot", "Googlebot", "Bingbot", "*"];
  assert.equal(groups.length, agents.length);
  for (const agent of agents) {
    const group = groups.find((entry) => entry.startsWith("User-agent: " + agent + "\n"));
    assert.ok(group, "missing crawler group " + agent);
    const rules = group.split(/\r?\n/).filter((line) => line.startsWith("Disallow: ")).map((line) => line.slice("Disallow: ".length));
    const blocked = (url) => rules.some((rule) => rule.endsWith("$") ? url === rule.slice(0, -1) : url.startsWith(rule));
    for (const path of [
      "/os", "/os/", "/os/projects", "/os?debug=1", "/labs", "/sandbox", "/checkout", "/api", "/4nation",
      "/admin", "/admin/users", "/auth", "/auth/callback", "/account", "/account/profile", "/saved", "/saved/items",
      "/id", "/id/profile", "/oauth", "/oauth/callback",
    ]) {
      assert.ok(blocked(path), agent + " should exclude " + path);
    }
    for (const path of ["/oslofjord", "/oslofjord/", "/oslofjord-restoration", "/living-systems/oslofjord"]) {
      assert.ok(!blocked(path), agent + " should permit " + path);
    }
    assert.ok(!rules.includes("/os"), "broad /os prohibition must not return");
  }
  const generator = read("scripts/generate-sitemap.mjs");
  assert.match(generator, /robotsDisallow/);
  for (const pattern of [
    "/os$", "/os/", "/os?", "/admin", "/auth", "/account", "/saved", "/id", "/oauth",
  ]) assert.ok(generator.includes(JSON.stringify(pattern)));
  for (const agent of agents) assert.ok(generator.includes(JSON.stringify(agent)));
});

test("generated robots artifact stays byte-identical to the checked-in crawler policy", async () => {
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/generate-sitemap.mjs"], {
    cwd: new URL("..", import.meta.url),
    stdio: "pipe",
  });
  assert.equal(read("public/robots.txt"), robots);
});


test("IndexNow canonical sitemap source",()=>{const indexNow=read("scripts/submit-indexnow.mjs");assert.ok(indexNow.includes("public"));assert.ok(indexNow.includes("sitemap.xml"));assert.ok(indexNow.includes("matchAll"));});


test("about trailing slash canonical",()=>{const redirects=read("public/_redirects");assert.ok(redirects.includes("/about/  /about  301"));});
