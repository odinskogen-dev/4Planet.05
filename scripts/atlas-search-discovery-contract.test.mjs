import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const connectors = read("src/planet/connectors.ts");
const worldSource = read("src/earth/World.tsx");
const dedupeSource = connectors.match(/export const deduplicateTaxonHitsByCanonicalId[\s\S]*?\n};/)?.[0];
assert.ok(dedupeSource, "canonical taxon dedupe helper must exist");
const dedupeRuntime = await import(`data:text/javascript;base64,${Buffer.from(ts.transpileModule(dedupeSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText).toString("base64")}`);

test("ATLAS carries explicit search metadata in the actual public route", () => {
  const world = read("src/earth/PublicWorld.tsx");
  assert.match(world, /4PLANET ATLAS — Planetary Intelligence Map/);
  assert.match(world, /<Seo/);
  assert.match(world, /path="\/atlas"/);
  assert.match(world, /"@type": "WebApplication"/);
  assert.match(world, /Biodiversity observations/);
});

test("ATLAS is prerendered as useful raw HTML, not only a JavaScript map shell", () => {
  const prerender = read("scripts/prerender-atlas-seo.mjs");
  assert.match(prerender, /dist, "atlas"/);
  assert.match(prerender, /One planet\. Many ways to see it\./);
  assert.match(prerender, /NASA Earthdata\/GIBS/);
  assert.match(prerender, /GBIF/);
  assert.match(prerender, /OBIS/);
  assert.match(prerender, /rel="canonical"/);
  assert.match(prerender, /index,follow,max-image-preview:large/);
});

test("build, sitemap and crawler policy make ATLAS discoverable", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.scripts.build, /prerender-atlas-seo\.mjs/);
  assert.ok(pkg.scripts["test:smoke"].includes("atlas-search-discovery-contract.test.mjs"));
  const sitemap = read("scripts/generate-sitemap.mjs");
  assert.match(sitemap, /"\/atlas"/);
  const robots = read("public/robots.txt");
  assert.match(robots, /User-agent: Googlebot\nAllow: \//);
  assert.match(robots, /Sitemap: https:\/\/4planet\.org\/sitemap\.xml/);
});

test("ATLAS taxon search deduplicates canonical identity, never scientific-name homonyms", () => {
  const base = {
    scientificName: "Aus bus",
    rank: "SPECIES",
    kingdom: "Animalia",
  };
  const sameCanonical = [
    { ...base, id: "taxon:gbif:100", gbifKey: 100, commonName: "Example one" },
    { ...base, id: "taxon:gbif:100", gbifKey: 100, commonName: "Provider synonym" },
  ];
  const homonyms = [
    { ...base, id: "taxon:gbif:100", gbifKey: 100 },
    { ...base, id: "taxon:gbif:200", gbifKey: 200, kingdom: "Plantae" },
  ];
  const invalidIdentity = [{ ...base, id: "", gbifKey: 300 }];

  assert.equal(dedupeRuntime.deduplicateTaxonHitsByCanonicalId(sameCanonical).length, 1);
  assert.equal(dedupeRuntime.deduplicateTaxonHitsByCanonicalId(homonyms).length, 2);
  assert.equal(dedupeRuntime.deduplicateTaxonHitsByCanonicalId(invalidIdentity).length, 0);
  assert.match(worldSource, /setTaxaHits\(deduplicateTaxonHitsByCanonicalId\(r\.data\)\)/);
  assert.doesNotMatch(worldSource, /String\(hit\.scientificName \|\| hit\.id\)/);
  assert.match(worldSource, /GBIF \{h\.gbifKey\}/);
  assert.match(worldSource, /h\.rank \|\| "taxon"/);
  assert.match(worldSource, /h\.kingdom \|\| "KINGDOM UNKNOWN"/);
});

test("ATLAS distinguishes verified empty life search from partial and total GBIF failure", () => {
  assert.match(connectors, /const failed = responses\.filter/);
  assert.match(connectors, /partial: true/);
  assert.match(connectors, /if \(!result\.partial\) taxonSearchCache\.set/);
  assert.match(connectors, /if \(!successful\.length\) return \{ ok: false, error: "GBIF unreachable" \}/);
  assert.match(worldSource, /setTaxaSearchPartial\(r\.ok && Boolean\(r\.partial\)\)/);
  assert.match(worldSource, /GBIF PARTIAL RESPONSE/);
  assert.match(worldSource, /an empty life\s*list is not a verified empty result/);
  assert.match(worldSource, /!taxaSearchFailed && !taxaSearchPartial/);
  assert.match(worldSource, /if \(text\.length < 3\)[\s\S]*setTaxaSearchPartial\(false\)/);
});
