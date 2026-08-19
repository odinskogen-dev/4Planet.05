import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync(new URL("../public/xr/scenes/jaguar.json", import.meta.url), "utf8"));
const journey = JSON.parse(readFileSync(new URL("../public/xr/scenes/jaguar-journey-v11.json", import.meta.url), "utf8"));
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
const truthIds = new Set(manifest.nodes.map((node) => node.id));

test("Nature XR truth layout stays attached to canonical Jaguar identity", () => {
  assert.equal(manifest.entity.id, "taxon:gbif:5219426");
  assert.equal(manifest.entity.gbifKey, 5219426);
  assert.match(speciesSource, /taxon:gbif:5219426/);
  assert.match(speciesSource, /gbifKey:\s*5219426/);
  assert.match(manifest.truthBoundary, /NOT A LIVE HABITAT/);
  assert.match(manifest.truthBoundary, /NOT A PRECISE ECOLOGICAL SIMULATION/);
});

test("All rendered truth nodes bind canonically", () => {
  assert.ok(manifest.nodes.length >= 5);
  for (const node of manifest.nodes) {
    assert.ok(node.id);
    assert.ok(node.kind);
    assert.ok(node.canonicalBinding, `${node.id} must bind to canonical truth`);
    if (node.relationClass !== null && node.relationClass !== undefined) assert.ok(allowedRelationClasses.has(node.relationClass));
  }
});

test("Jaguar Journey v1.1 is a six-chapter authored journey, not six copies of one screen", () => {
  assert.equal(journey.version, "v1.1");
  assert.equal(journey.chapters.length, 6);
  assert.deepEqual(journey.chapters.map((chapter) => chapter.id), [
    "enter-canopy", "meet-jaguar", "follow-prey", "connected-habitat", "under-pressure", "respond"
  ]);
  const backgrounds = new Set(journey.chapters.map((chapter) => chapter.media?.background));
  assert.ok(backgrounds.size >= 4, "Journey must use materially different scene media");
  for (const chapter of journey.chapters) {
    assert.ok(chapter.stageLabel);
    assert.ok(chapter.title);
    assert.ok(chapter.cue);
    assert.ok(chapter.media?.background);
    assert.ok(chapter.media?.mediaBoundary);
    assert.equal(typeof chapter.camera?.scale, "number");
    assert.ok(chapter.audio?.profile);
    assert.ok(chapter.transition?.type);
    assert.ok(chapter.transition?.durationMs >= 1000);
    assert.ok(chapter.transition?.holdMs >= 800);
    assert.ok((chapter.nodeLayout || []).length <= 2, `${chapter.id} may surface at most two nodes`);
    for (const placement of chapter.nodeLayout || []) {
      assert.ok(truthIds.has(placement.id), `${chapter.id} references unknown truth node ${placement.id}`);
      assert.equal(typeof placement.x, "number");
      assert.equal(typeof placement.y, "number");
    }
  }
});

test("3D Jaguar is a bounded attributed prototype embed, not a silently copied asset", () => {
  assert.equal(journey.model.provider, "Sketchfab");
  assert.equal(journey.model.uid, "91c61c329d2a4668816f81f08dfcd492");
  assert.match(journey.model.creator, /Ear\.Rodriguez/);
  assert.match(journey.model.licence, /Creative Commons Attribution/i);
  assert.match(journey.model.productionState, /PROTOTYPE EMBED ONLY/i);
  assert.match(journey.model.embedUrl, /dnt=1/);
  assert.match(journey.model.embedUrl, /max_texture_size=1024/);
  assert.ok(journey.chapters.find((chapter) => chapter.id === "meet-jaguar")?.subject?.model);
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
});

test("Nature and Journey renderers remain species-agnostic", () => {
  for (const source of [renderer, browserRenderer, journeyRenderer]) {
    assert.doesNotMatch(source, /Panthera onca/i);
    assert.doesNotMatch(source, /5219426/);
  }
  assert.match(renderer, /manifest\.nodes\.forEach/);
  assert.match(browserRenderer, /suppliedJourney/);
  assert.match(browserRenderer, /journey\.chapters/);
  assert.match(browserRenderer, /requestAnimationFrame/);
  assert.match(browserRenderer, /detectTier/);
  assert.match(browserRenderer, /preloadChapter/);
  assert.match(journeyRenderer, /applyChapter/);
  assert.match(journeyRenderer, /4planet:nature-journey-chapter/);
});

test("Browser journey is scene-first and evidence is secondary", () => {
  assert.match(browserRenderer, /transitionScene/);
  assert.match(browserRenderer, /goToChapter/);
  assert.match(browserRenderer, /nature-journey-hud__evidence/);
  assert.match(browserRenderer, /openEvidence/);
  assert.match(browserRenderer, /renderNodes\(chapter\)/);
  assert.doesNotMatch(browserRenderer, /button\.addEventListener\('click', openEvidence\)/);
});

test("Amazonia audio is user-activated, chapter-aware and never presented as field audio", () => {
  assert.match(manifest.browser.entryCta, /ENTER THE LIVING SYSTEM/i);
  assert.match(manifest.browser.ambientLabel, /NOT FIELD AUDIO/i);
  assert.match(browserRenderer, /4planet:nature-browser-enter/);
  assert.match(audioRenderer, /AudioContext|webkitAudioContext/);
  assert.match(audioRenderer, /4planet:nature-journey-chapter/);
  assert.match(audioRenderer, /PROFILE/);
  assert.match(audioRenderer, /water-edge/);
  assert.match(audioRenderer, /pressure/);
  assert.match(audioRenderer, /amazonia-procedural-v11/);
  assert.match(audioRenderer, /Never label these as real species recordings/i);
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
  assert.equal(manifest.nodes.filter((node) => node.canonicalBinding).length, manifest.nodes.length);
});

test("Journey ends in RESPONSE / Solutions rather than awareness", () => {
  const response = manifest.nodes.find((node) => node.kind === "RESPONSE");
  const finalChapter = journey.chapters.at(-1);
  assert.ok(response);
  assert.match(response.title, /HOW DO WE SOLVE THIS/i);
  assert.equal(finalChapter.id, "respond");
  assert.equal(finalChapter.sceneType, "RESPONSE");
  assert.ok(finalChapter.handoff);
  assert.ok(finalChapter.nodes.includes(response.id));
});
