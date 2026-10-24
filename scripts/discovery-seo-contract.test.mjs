import test from "node:test";import assert from "node:assert/strict";import{mkdtempSync,readFileSync,rmSync,writeFileSync}from"node:fs";import{execFileSync}from"node:child_process";import{tmpdir}from"node:os";import{join}from"node:path";import{fileURLToPath,pathToFileURL}from"node:url";const ROOT=new URL("..",import.meta.url),read=p=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8"),inv=JSON.parse(read("src/data/discoveryInventory.json")),atlas=JSON.parse(read("src/data/atlasDiscovery.json")),router=read("src/routes/router.tsx"),atlasPage=read("src/pages/integrated/AtlasDiscoveryPage.tsx"),map=read("scripts/generate-sitemap.mjs"),pre=read("scripts/prerender-discovery-seo.mjs"),sr=read("src/pages/integrated/SpeciesRoute.tsx"),robots=read("public/robots.txt"),idx=read("index.html"),analytics=read("src/analytics/Analytics.tsx"),speciesMedia=read("src/data/speciesMedia.ts"),sourceEnvelopes=read("src/data/speciesSourceEnvelope.ts");

async function buildReviewWorker(registry,heirSha){
  const dir=mkdtempSync(join(tmpdir(),"4planet-atlas-dispatch-"));
  const sandboxes=Object.fromEntries(Object.entries(registry.products||{}).filter(([,item])=>item.sandbox).map(([product])=>[product,{origin:"https://sandbox.example",render_origin:"https://sandbox-render.example",sha:"sandbox-fixture"}]));
  writeFileSync(join(dir,"registry.json"),JSON.stringify(registry));
  writeFileSync(join(dir,"runtime.json"),JSON.stringify({heir:{origin:"https://heir.example",render_origin:"https://heir-render.example",sha:heirSha},sandboxes}));
  execFileSync(process.execPath,[fileURLToPath(new URL("./build-four-state-review-worker.mjs",import.meta.url)),"registry.json","runtime.json","worker.mjs"],{cwd:dir,stdio:"pipe"});
  const worker=(await import(`${pathToFileURL(join(dir,"worker.mjs")).href}?sha=${heirSha}`)).default;
  return{worker,cleanup:()=>rmSync(dir,{recursive:true,force:true})};
}

function atlasIframePathFromComponent(item,source=atlasPage){
  const iframeSource=source.match(/<iframe[\s\S]*?\bsrc=\{([A-Za-z_$][\w$]*)\}[\s\S]*?\/>/);
  assert.ok(iframeSource,`${item.slug}: ATLAS iframe must bind src to a component variable`);
  const bindingName=iframeSource[1];
  const assignment=source.match(new RegExp(`\\bconst\\s+${bindingName}\\s*=\\s*([^;]+);`));
  assert.ok(assignment,`${item.slug}: ${bindingName} must have a component assignment`);
  const expression=assignment[1].trim();
  if(expression==="atlasEmbedHref(object.atlasHref)"){
    const params=new URLSearchParams(new URL(item.atlasHref,"https://4planet.org").search);
    params.set("embed","news");
    params.set("surface","atlas-discovery");
    return `/atlas?${params.toString()}`;
  }
  const literal=expression.match(/^(["'])(.*?)\1$/);
  if(literal)return literal[2];
  assert.fail(`${item.slug}: unsupported ATLAS iframe binding ${expression}`);
}
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

test("ATLAS useful objects expose the governed first-party map journey and human data note",()=>{
  assert.match(atlasPage,/function atlasEmbedHref\(atlasHref: string\)/);
  assert.match(atlasPage,/return `\/atlas\?\$\{params\.toString\(\)\}`/);
  assert.doesNotMatch(atlasPage,/return `\/embed\/atlas\?/);
  assert.match(atlasPage,/<iframe/);
  assert.match(atlasPage,/aria-label="ATLAS embed fallback"/);
  assert.match(atlasPage,/If the embedded map is unavailable/);
  assert.match(atlasPage,/A note on the data/);
  assert.doesNotMatch(atlasPage,/>Read this correctly</);
});

test("ATLAS discovery routes execute through the real four-state worker registry",async()=>{
  const registry=JSON.parse(read("docs/control/PRODUCT_SURFACE_REGISTRY.json"));
  const currentHead=execFileSync("git",["rev-parse","HEAD"],{cwd:ROOT,encoding:"utf8"}).trim();
  const actual=await buildReviewWorker(registry,currentHead);
  const mismatched=structuredClone(registry);
  mismatched.products.ATLAS.heir.review_path="/atlas-registration-removed";
  const negative=await buildReviewWorker(mismatched,currentHead);
  const staleSha=`${currentHead[0]==="0"?"1":"0"}${currentHead.slice(1)}`;
  const stale=await buildReviewWorker(registry,staleSha);
  const originalFetch=globalThis.fetch;
  try{
    for(const item of atlas.objects){
      const pageUrl=new URL(`https://test.4planet.org/atlas/${item.slug}/`);
      const iframePath=atlasIframePathFromComponent(item);
      const upstream=[];
      globalThis.fetch=async(request)=>{upstream.push(new URL(request.url).pathname+new URL(request.url).search);return new Response("ATLAS HEIR",{status:200})};
      const response=await actual.worker.fetch(new Request(new URL(iframePath,pageUrl).href));
      assert.equal(response.status,200);
      assert.deepEqual(upstream,[iframePath],`${item.slug} must proxy through the registered ATLAS route`);
      assert.doesNotMatch(await response.text(),/4PLANET_ PRODUCT CONTROL/);
      assert.equal(response.headers.get("x-4planet-review-source"),`heir-${currentHead.slice(0,12)}`);

      upstream.length=0;
      const rejected=await negative.worker.fetch(new Request(new URL(iframePath,pageUrl).href));
      assert.deepEqual(upstream,[],`${item.slug} must not proxy when ATLAS registration is missing`);
      assert.match(await rejected.text(),/4PLANET_ PRODUCT CONTROL/);
    }

    const brokenBinding=atlasPage.replace(
      "const embedHref = atlasEmbedHref(object.atlasHref);",
      'const embedHref = "/_control";',
    );
    assert.notEqual(brokenBinding,atlasPage,"negative control must mutate the component iframe binding");
    for(const item of atlas.objects){
      const iframePath=atlasIframePathFromComponent(item,brokenBinding);
      const upstream=[];
      globalThis.fetch=async(request)=>{upstream.push(new URL(request.url).pathname);return new Response("ATLAS HEIR",{status:200})};
      const rejected=await actual.worker.fetch(new Request(new URL(iframePath,`https://test.4planet.org/atlas/${item.slug}/`).href));
      assert.deepEqual(upstream,[],`${item.slug} broken iframe binding must not reach ATLAS`);
      assert.match(await rejected.text(),/4PLANET_ PRODUCT CONTROL/);
    }

    globalThis.fetch=async()=>new Response("ATLAS HEIR",{status:200});
    const staleResponse=await stale.worker.fetch(new Request("https://test.4planet.org/atlas?embed=news&surface=atlas-discovery"));
    assert.notEqual(staleResponse.headers.get("x-4planet-review-source"),`heir-${currentHead.slice(0,12)}`,"stale review runtime SHA must be detectable");
  }finally{
    globalThis.fetch=originalFetch;
    actual.cleanup();negative.cleanup();stale.cleanup();
  }
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

test("About Story organic entry is server-readable, canonical and discoverable", () => {
  const about = read("src/pages/v5/AboutPages.tsx");
  const serverTitle = pre.match(/const aboutStoryTitle = "([^"]+)";/)?.[1] + " | 4PLANET";
  const serverDescription = pre.match(/const aboutStoryDescription = "([^"]+)";/)?.[1];
  const storySeo = about.match(/<Seo[\s\S]*?\/>/)?.[0] || "";
  const clientTitle = storySeo.match(/title="([^"]+)"/)?.[1];
  const clientDescription = storySeo.match(/description="([^"]+)"/)?.[1];
  assert.match(router, /path="\/about\/story" element={<AboutStory \/>}/);
  assert.match(map, /^\s*"\/about\/story",?$/m);
  assert.match(pre, /writeRoute\(aboutStoryPath, pageHtml/);
  assert.match(pre, /"@type": "AboutPage"/);
  assert.match(about, /<Seo[\s\S]*path="\/about\/story"/);
  assert.match(about, /"@type": "AboutPage"/);
  assert.equal(clientTitle, serverTitle, "Story title must not change during hydration");
  assert.equal(clientDescription, serverDescription, "Story description must not change during hydration");
  for (const phrase of [
    "The living planet is not an abstract issue.",
    "Human life sits inside living systems.",
    "Care is everywhere. Connection is not.",
    "Make the living planet easier to see, understand and help.",
  ]) {
    assert.ok(about.includes(phrase), "client Story missing: " + phrase);
    assert.ok(pre.includes(phrase), "server Story missing: " + phrase);
  }
});



test("all locally owned canonical missions are included in the generated sitemap, excluding external hand-offs", () => {
  const missionSource = read("src/content/missions.ts");
  const slugs = [...missionSource.matchAll(/^\s*slug:\s*"([a-z0-9-]+)",\s*domain:/gm)].map((match) => match[1]);
  assert.equal(slugs.length, 16, "Review sitemap policy when the canonical mission roster changes");
  assert.match(map, /missionRoutesFromCanonicalContent/);
  assert.match(map, /ts\.createSourceFile/);
  execFileSync(process.execPath, ["scripts/generate-sitemap.mjs"], {
    cwd: ROOT, stdio: "pipe",
    env: { ...process.env, PUBLIC_SITE_ORIGIN: "https://4planet.org", VITE_PUBLIC_SITE_ORIGIN: "https://4planet.org" },
  });
  const sitemap = read("public/sitemap.xml");
  const handOffs = new Set(["m4gazine", "4film"]);
  for (const slug of slugs) {
    const loc = `<loc>https://4planet.org/missions/${slug}</loc>`;
    assert.equal(sitemap.includes(loc), !handOffs.has(slug), `Unexpected sitemap state: ${slug}`);
  }
  assert.equal(slugs.filter((slug) => !handOffs.has(slug)).length, 14);
});

test("Mission discovery is present in server HTML and hydrated client metadata", () => {
  const missionPrerender = read("scripts/prerender-discovery-seo.mjs");
  const missionClient = read("src/pages/v5/Missions.tsx");
  const missionExtractor = read("scripts/mission-content.mjs");
  assert.match(missionExtractor, /MISSION_CONTENT/);
  assert.match(missionExtractor, /EXTERNAL_HANDOFF_SLUGS/);
  assert.match(missionExtractor, /ts\.createSourceFile/);
  assert.match(missionPrerender, /data-4planet-prerender-content='mission'/);
  assert.match(missionPrerender, /data-4planet-prerender-content='missions-index'/);
  assert.match(missionPrerender, /readLocalMissionRecords/);
  assert.match(missionPrerender, /Current development status/);
  assert.match(missionPrerender, /What this mission addresses/);
  assert.match(missionClient, /<Seo title=\{m\.name/);
});
