import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

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
