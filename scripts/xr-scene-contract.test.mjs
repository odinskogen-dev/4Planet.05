import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync(new URL("../public/xr/scenes/jaguar.json", import.meta.url), "utf8"));
const renderer = readFileSync(new URL("../public/xr/engine/nature-renderer.js", import.meta.url), "utf8");
const browserRenderer = readFileSync(new URL("../public/xr/engine/nature-browser.js", import.meta.url), "utf8");
const journeyRenderer = readFileSync(new URL("../public/xr/engine/nature-journey-engine.js", import.meta.url), "utf8");
const audioRenderer = readFileSync(new URL("../public/xr/engine/nature-audio-v05.js", import.meta.url), "utf8");
const adapter = readFileSync(new URL("../public/xr/engine/nature-scene-adapter.js", import.meta.url), "utf8");
const generator = readFileSync(new URL("./build-xr-canonical-data.mjs", import.meta.url), "utf8");
const speciesSource = readFileSync(new URL("../src/data/species.ts", import.meta.url), "utf8");
const livingSystemsSource = readFileSync(new URL("../src/data/livingSystems.ts", import.meta.url), "utf8");
const relationshipSource = readFileSync(new URL("../src/data/speciesRelationships.ts", import.meta.url), "utf8");
const allowedRelationClasses = new Set(["DEPENDENCY", "PRESSURE", "RESPONSE"]);

test("Nature XR layout stays attached to canonical Jaguar identity", () => {
  assert.equal(manifest.version, "v1.0");
  assert.equal(manifest.entity.id, "taxon:gbif:5219426");
  assert.equal(manifest.entity.gbifKey, 5219426);
  assert.match(speciesSource, /taxon:gbif:5219426/);
  assert.match(speciesSource, /gbifKey:\s*5219426/);
  assert.match(manifest.truthBoundary, /NOT A LIVE HABITAT/);
  assert.match(manifest.truthBoundary, /NOT A PRECISE ECOLOGICAL SIMULATION/);
});

test("Every Journey node binds truth canonically while scene choreography stays presentation-only", () => {
  assert.ok(manifest.nodes.length >= 5);
  for (const node of manifest.nodes) {
    assert.ok(node.id);
    assert.ok(node.kind);
    assert.ok(node.canonicalBinding, `${node.id} must bind to canonical truth`);
    assert.equal(typeof node.browserPosition?.x, "number");
    assert.equal(typeof node.browserPosition?.y, "number");
    assert.ok(node.scene?.state, `${node.id} requires a scene state`);
    assert.ok(node.scene?.stageLabel, `${node.id} requires a human journey stage`);
    assert.ok(node.scene?.sceneTitle, `${node.id} requires scene narrative copy`);
    if (node.relationClass !== null && node.relationClass !== undefined) assert.ok(allowedRelationClasses.has(node.relationClass));
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

test("Nature and Journey renderers stay species-agnostic", () => {
  for (const source of [renderer, browserRenderer, journeyRenderer]) {
    assert.doesNotMatch(source, /Panthera onca/i);
    assert.doesNotMatch(source, /5219426/);
  }
  assert.match(renderer, /manifest\.nodes\.forEach/);
  assert.match(renderer, /canonical-adapter/);
  assert.match(browserRenderer, /manifest\.entity\.id/);
  assert.match(browserRenderer, /manifest\.nodes/);
  assert.match(browserRenderer, /browserPosition/);
  assert.match(browserRenderer, /NatureJourneyEngine/);
  assert.match(browserRenderer, /4planet:nature-browser-ready/);
  assert.match(journeyRenderer, /node\.scene/);
  assert.match(journeyRenderer, /4planet:nature-journey-scene/);
});

test("Browser journey is scene-first and evidence is explicitly secondary", () => {
  assert.match(browserRenderer, /const goTo/);
  assert.match(browserRenderer, /closeChapter\(\);\s*applyScene/);
  assert.match(browserRenderer, /nature-journey-hud__evidence/);
  assert.match(browserRenderer, /openEvidence/);
  assert.doesNotMatch(browserRenderer, /setTimeout\(\(\) => openNode/);
});

test("Browser-first experience uses explicit user activation for Amazonia audio", () => {
  assert.match(manifest.browser.entryCta, /ENTER THE LIVING SYSTEM/i);
  assert.match(manifest.browser.ambientLabel, /NOT FIELD AUDIO/i);
  assert.match(browserRenderer, /entryButton\?\.addEventListener\('click', enter\)/);
  assert.match(browserRenderer, /4planet:nature-browser-enter/);
  assert.match(audioRenderer, /AudioContext|webkitAudioContext/);
  assert.match(audioRenderer, /ctx\.resume\(\)/);
  assert.match(audioRenderer, /amazonia-procedural-v05/);
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
  assert.equal(bound.length, manifest.nodes.length, "all Journey truth nodes must bind to canonical feeds");
  assert.ok(bound.some((node) => node.canonicalBinding === "species.identity"));
  assert.ok(bound.some((node) => node.canonicalBinding === "species.publicClaims.1"));
  assert.ok(bound.some((node) => node.canonicalBinding === "living.RESPONSE.0"));
  assert.ok(bound.some((node) => node.canonicalBinding.startsWith("relationships.")));
});

test("Jaguar Journey reaches a RESPONSE handoff rather than ending at awareness", () => {
  const response = manifest.nodes.find((node) => node.kind === "RESPONSE");
  assert.ok(response);
  assert.match(response.title, /HOW DO WE SOLVE THIS/i);
  assert.equal(response.scene.state, "response");
  assert.ok(response.href);
});
