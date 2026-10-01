import test from "node:test";import assert from "node:assert/strict";import{readFileSync}from"node:fs";const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8"),inv=JSON.parse(read("src/data/discoveryInventory.json")),router=read("src/routes/router.tsx"),map=read("scripts/generate-sitemap.mjs"),pre=read("scripts/prerender-discovery-seo.mjs"),sr=read("src/pages/integrated/SpeciesRoute.tsx"),robots=read("public/robots.txt"),idx=read("index.html"),analytics=read("src/analytics/Analytics.tsx");
test("inventory",()=>{assert.ok(inv.places.some(p=>p.slug==="kenya"&&p.indexable));assert.ok(inv.species.length>=25);assert.ok(inv.species.filter(s=>s.indexable).length>=20);for(const slug of["african-savanna-elephant","lion","cheetah","blue-whale","asian-elephant","tiger","polar-bear","giant-panda","whale-shark","green-sea-turtle"])assert.ok(inv.species.some(s=>s.slug===slug&&s.indexable===true&&s.state==="CURATED"))});
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
