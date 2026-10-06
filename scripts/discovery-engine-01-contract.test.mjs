import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const data = JSON.parse(read("src/data/discoveryTopics.json"));
const router = read("src/routes/router.tsx");
const page = read("src/pages/discovery/DiscoveryEngine.tsx");
const sitemap = read("scripts/generate-sitemap.mjs");
const prerender = read("scripts/prerender-discovery-seo.mjs");
const shell = read("src/components/layout/PublicShell.tsx");
const css = read("src/styles/human-first-public.css");

const REQUIRED = [
  "wildfires",
  "earthquakes",
  "climate-change",
  "biodiversity",
  "deforestation",
  "plastic-pollution",
  "coral-bleaching",
  "air-quality",
  "orca",
  "whales",
  "bees",
  "amazon-rainforest",
  "oslofjord",
  "renewable-energy",
  "solar-energy",
  "food-waste",
  "fast-fashion",
  "rewilding",
  "climate-solutions",
  "environmental-jobs",
];

test("Discovery Engine 01 publishes exactly the first 20 canonical topics", () => {
  assert.equal(data.topics.length, 20);
  assert.deepEqual(data.topics.map((topic) => topic.slug), REQUIRED);
  for (const topic of data.topics) {
    assert.equal(topic.indexable, true);
    assert.ok(topic.title.length > 20);
    assert.ok(topic.description.length > 60);
    assert.ok(topic.answer.length > 80);
    assert.ok(topic.keyFacts.length >= 3);
    assert.ok(topic.sources.length >= 1);
    assert.ok(topic.related.length >= 3);
    assert.match(topic.atlasHref, /^\/atlas\?/);
    assert.ok(topic.atlasContextNote.length > 20);
    for (const source of topic.sources) {
      assert.match(source.url, /^https:\/\//);
      assert.equal(source.checkedAt, data.updatedAt);
    }
  }
});

test("Earth Now is a bounded latest-available surface, not a fake real-time claim", () => {
  assert.equal(data.earthNow.signals.length, 8);
  assert.match(data.earthNow.truthBoundary, /latest available/i);
  assert.match(data.earthNow.truthBoundary, /not one synchronized real-time Earth/i);
  assert.match(data.earthNow.atlasHref, /^\/atlas\?/);
  assert.equal(data.earthNow.embedKind, "NEWS");
});

test("routes, sitemap and prerender all consume the same canonical discovery registry", () => {
  assert.match(router, /path="\/now"/);
  assert.match(router, /DISCOVERY_TOPIC_SLUGS\.map/);
  assert.match(sitemap, /discoveryTopics/);
  assert.match(sitemap, /"\/now"/);
  assert.match(prerender, /discoveryTopics\.json/);
  assert.match(prerender, /writeRoute\("\/now"/);
  assert.match(prerender, /for \(const topic of discoveryTopics\)/);
});

test("every discovery page uses the shared ATLAS embed seam and public shell", () => {
  assert.match(page, /<PublicShell>/);
  assert.match(page, /<iframe/);
  assert.match(page, /params\.set\("embed", embedKind\.toLowerCase\(\)\)/);
  assert.match(page, /What the sources establish/);
  assert.match(page, /What they do not establish/);
  assert.match(page, /LAST CHECKED/);
});

test("discovery embeds the canonical ATLAS host instead of creating a second map runtime", () => {
  assert.match(page, /https:\/\/4planetatlas\.com\/\?/);
  assert.match(page, /params\.set\("embed", embedKind\.toLowerCase\(\)\)/);
  assert.doesNotMatch(page, /new maplibregl\.Map/);
});

test("Earth Now is discoverable through the existing Master Brand OS navigation", () => {
  assert.match(shell, /\["EARTH NOW", "WHAT IS HAPPENING", "\/now"\]/);
  assert.match(shell, /pathname === "\/now"/);
  assert.match(css, /DISCOVERY ENGINE 01/);
  assert.match(css, /--discovery-accent:#2E2EFF/);
  assert.match(css, /background:#080808/);
  assert.doesNotMatch(css.match(/\/\* DISCOVERY ENGINE 01[\s\S]*$/)?.[0] ?? "", /glassmorphism/i);
});
