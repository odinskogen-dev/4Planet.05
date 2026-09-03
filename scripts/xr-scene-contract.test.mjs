import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync(new URL("../public/xr/scenes/jaguar.json", import.meta.url), "utf8"));
const renderer = readFileSync(new URL("../public/xr/engine/nature-renderer.js", import.meta.url), "utf8");
const browserRenderer = readFileSync(new URL("../public/xr/engine/nature-browser.js", import.meta.url), "utf8");
const adapter = readFileSync(new URL("../public/xr/engine/nature-scene-adapter.js", import.meta.url), "utf8");
const generator = readFileSync(new URL("./build-xr-canonical-data.mjs", import.meta.url), "utf8");
const speciesSource = readFileSync(new URL("../src/data/species.ts", import.meta.url), "utf8");
const livingSystemsSource = readFileSync(new URL("../src/data/livingSystems.ts", import.meta.url), "utf8");
const relationshipSource = readFileSync(new URL("../src/data/speciesRelationships.ts", import.meta.url), "utf8");
const allowedRelationClasses = new Set(["DEPENDENCY", "PRESSURE", "RESPONSE"]);

test("Nature XR layout stays attached to canonical Jaguar identity", () => {
  assert.equal(manifest.version, "v0.4");
  assert.equal(manifest.entity.id, "taxon:gbif:5219426");
  assert.equal(manifest.entity.gbifKey, 5219426);
  assert.match(speciesSource, /taxon:gbif:5219426/);
  assert.match(speciesSource, /gbifKey:\s*5219426/);
  assert.match(manifest.truthBoundary, /NOT A LIVE HABITAT/);
  assert.match(manifest.truthBoundary, /NOT A PRECISE ECOLOGICAL SIMULATION/);
});

test("XR nodes either carry bounded truth directly or bind to canonical truth", () => {
  assert.ok(manifest.nodes.length >= 5);
  for (const node of manifest.nodes) {
    assert.ok(node.id);
    assert.ok(node.kind);
    assert.equal(typeof node.browserPosition?.x, "number");
    assert.equal(typeof node.browserPosition?.y, "number");

    if (node.canonicalBinding) {
      assert.ok(typeof node.canonicalBinding === "string");
    } else {
      assert.ok(node.source?.label);
      assert.ok(node.source?.url);
      assert.ok(node.boundary);
      assert.ok(node.truthState);
      if (node.relationClass !== null) assert.ok(allowedRelationClasses.has(node.relationClass));
    }
  }
});

test("Canonical Jaguar–capybara relationship owns prey truth, source, boundary and relation class", () => {
  const prey = manifest.nodes.find((node) => node.id === "jaguar-capybara-prey");
  assert.ok(prey);
  assert.equal(prey.canonicalBinding, "relationships.relationship:4p:jaguar-capybara-prey-southern-pantanal");
  assert.equal(prey.body, undefined);
  assert.equal(prey.source, undefined);
  assert.equal(prey.boundary, undefined);
  assert.equal(prey.truthState, undefined);
  assert.equal(prey.relationClass, undefined);

  assert.match(relationshipSource, /relationship:4p:jaguar-capybara-prey-southern-pantanal/);
  assert.match(relationshipSource, /relationClass:\s*"DEPENDENCY"/);
  assert.match(relationshipSource, /state:\s*"KNOWN"/);
  assert.match(relationshipSource, /PERILLI ET AL\. 2016 · PLOS ONE/);
  assert.match(relationshipSource, /does not imply the same dietary importance elsewhere/i);
});

test("Nature renderers stay species-agnostic rather than becoming second Jaguar pages", () => {
  for (const source of [renderer, browserRenderer]) {
    assert.doesNotMatch(source, /Panthera onca/i);
    assert.doesNotMatch(source, /5219426/);
    assert.match(source, /manifest\.entity\.id/);
  }
  assert.match(renderer, /manifest\.nodes\.forEach/);
  assert.match(renderer, /canonical-adapter/);
  assert.match(browserRenderer, /manifest\.nodes/);
  assert.match(browserRenderer, /browserPosition/);
  assert.match(browserRenderer, /4planet:nature-browser-ready/);
});

test("Browser-first experience uses explicit user activation for procedural ambience", () => {
  assert.match(manifest.browser.entryCta, /ENTER THE LIVING SYSTEM/i);
  assert.match(manifest.browser.ambientLabel, /NOT FIELD AUDIO/i);
  assert.match(browserRenderer, /entryButton\?\.addEventListener\('click', enter\)/);
  assert.match(browserRenderer, /AudioContext|webkitAudioContext/);
  assert.match(browserRenderer, /ctx\.resume\(\)/);
});

test("P4B adapter consumes canonical SPECIES, Living Systems and relationship feeds", () => {
  assert.match(generator, /src\/data\/species\.ts/);
  assert.match(generator, /src\/data\/livingSystems\.ts/);
  assert.match(generator, /src\/data\/speciesRelationships\.ts/);
  assert.match(generator, /SPECIES_PROFILES/);
  assert.match(generator, /LIVING_SYSTEM_ANCHORS/);
  assert.match(generator, /SPECIES_RELATIONSHIPS/);
  assert.match(adapter, /species\.publicClaims/);
  assert.match(adapter, /livingSystemAnchor/);
  assert.match(adapter, /speciesRelationships/);
  assert.match(adapter, /canonicalBinding/);
  assert.match(livingSystemsSource, /export const LIVING_SYSTEM_ANCHORS/);
  assert.match(relationshipSource, /export const SPECIES_RELATIONSHIPS/);

  const bound = manifest.nodes.filter((node) => node.canonicalBinding);
  assert.equal(bound.length, manifest.nodes.length, "all XR truth nodes must bind to canonical data");
  assert.ok(bound.some((node) => node.canonicalBinding === "species.identity"));
  assert.ok(bound.some((node) => node.canonicalBinding === "species.publicClaims.1"));
  assert.ok(bound.some((node) => node.canonicalBinding === "living.RESPONSE.0"));
  assert.ok(bound.some((node) => node.canonicalBinding.startsWith("relationships.")));
});

test("Jaguar XR reaches a RESPONSE handoff rather than ending at awareness", () => {
  const response = manifest.nodes.find((node) => node.kind === "RESPONSE");
  assert.ok(response);
  assert.match(response.title, /HOW DO WE SOLVE THIS/i);
  assert.ok(response.href);
});
