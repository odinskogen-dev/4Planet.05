import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const inv = JSON.parse(read("src/data/discoveryInventory.json"));
const atlas = JSON.parse(read("src/data/atlasDiscovery.json"));
const router = read("src/routes/router.tsx");
const sitemap = read("scripts/generate-sitemap.mjs");
const prerender = read("scripts/prerender-discovery-seo.mjs");
const speciesRoute = read("src/pages/integrated/SpeciesRoute.tsx");
const atlasPage = read("src/pages/integrated/AtlasDiscoveryPage.tsx");
const robots = read("public/robots.txt");
const index = read("index.html");
const analytics = read("src/analytics/Analytics.tsx");

test("discovery inventory keeps only source-threshold species and places indexable", () => {
  assert.ok(inv.places.some((p) => p.slug === "kenya" && p.indexable));
  assert.ok(inv.species.length >= 25);
  assert.ok(inv.species.filter((s) => s.indexable).length >= 13);
  for (const slug of ["african-savanna-elephant", "lion", "cheetah"]) {
    assert.ok(inv.species.some((s) => s.slug === slug && s.indexable === true && s.state === "CURATED"));
  }
});

test("first ATLAS useful internet objects are source-grounded and bounded", () => {
  assert.deepEqual(atlas.objects.map((item) => item.slug).sort(), ["earth", "fires", "whales"]);
  const fires = atlas.objects.find((item) => item.slug === "fires");
  const whales = atlas.objects.find((item) => item.slug === "whales");
  assert.match(fires.limitations.join(" "), /not proof of a wildfire/i);
  assert.match(whales.limitations.join(" "), /not live animal positions/i);
  for (const item of atlas.objects) {
    assert.ok(item.atlasHref.startsWith("/atlas?"));
    assert.ok(item.sources.length >= 1);
    assert.ok(item.limitations.length >= 1);
  }
});

test("discovery routes, sitemap and prerender stay inside the shared product family", () => {
  assert.match(router, /path="\/places"/);
  assert.match(router, /path="\/place\/:slug"/);
  assert.match(router, /path="\/atlas\/:objectSlug"/);
  assert.match(sitemap, /"\/atlas\/earth"/);
  assert.match(sitemap, /"\/atlas\/fires"/);
  assert.match(sitemap, /"\/atlas\/whales"/);
  assert.match(prerender, /atlasDiscovery\.json/);
  assert.match(prerender, /atlasObjects\.length/);
  assert.match(atlasPage, /OPEN LIVE ATLAS/);
  assert.match(atlasPage, /SOURCES \/ PROVENANCE/);
});

test("universal species stay noindex until curated", () => {
  assert.match(speciesRoute, /curated \? "index,follow,max-image-preview:large" : "noindex,follow"/);
});

test("crawler policy allows discovery while protecting internal surfaces", () => {
  for (const bot of ["OAI-SearchBot", "Googlebot", "Bingbot"]) assert.ok(robots.includes(`User-agent: ${bot}`));
  for (const p of ["/labs", "/os", "/sandbox", "/checkout", "/api"]) assert.ok(robots.includes(`Disallow: ${p}`));
  assert.match(index, /host-indexing-policy\.js/);
});

test("measurement isolation and public-host attribution are explicit", () => {
  const domains = analytics.match(/const DEFAULT_ANALYTICS_DOMAINS = \[([\s\S]*?)\] as const;/)?.[1] || "";
  assert.doesNotMatch(domains, /"test\.4planet\.org"/);
  for (const host of ["4sapien.com", "4brands.org", "4nation.org", "4species.com", "4planetmagazine.com"]) {
    assert.match(domains, new RegExp(`"${host.replaceAll(".", "\\.")}"`));
  }
  assert.match(analytics, /host === "4nation\.org".*return "4nation"/);
  assert.match(analytics, /host === "4species\.com".*return "species"/);
  assert.match(analytics, /host === "4planetmagazine\.com".*return "magazine"/);
  assert.match(analytics, /Deliberately exclude query strings and fragments from analytics/);
});

test("IndexNow is prepared but fails closed without explicit Founder release", () => {
  const indexNow = read("scripts/submit-indexnow.mjs");
  assert.match(indexNow, /FOUNDER_INDEXNOW_RELEASE/);
  assert.match(indexNow, /ENIG_INDEXNOW/);
  assert.match(indexNow, /https:\/\/api\.indexnow\.org\/indexnow/);
  assert.match(indexNow, /item\.indexable === true/);
  assert.equal(read("public/8f4c2d91a7b64e3fa1c9d0b6e5274a83.txt").trim(), "8f4c2d91a7b64e3fa1c9d0b6e5274a83");
});
