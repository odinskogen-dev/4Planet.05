import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync(new URL("../public/xr/scenes/jaguar.json", import.meta.url), "utf8"));
const renderer = readFileSync(new URL("../public/xr/engine/nature-renderer.js", import.meta.url), "utf8");
const browserRenderer = readFileSync(new URL("../public/xr/engine/nature-browser.js", import.meta.url), "utf8");
const journeyRenderer = readFileSync(new URL("../public/xr/engine/nature-journey-engine.js", import.meta.url), "utf8");
const cinematicRenderer = readFileSync(new URL("../public/xr/engine/nature-cinematic-journey-v11.js", import.meta.url), "utf8");
const interactionRenderer = readFileSync(new URL("../public/xr/engine/nature-interaction-v13.js", import.meta.url), "utf8");
const audioRenderer = readFileSync(new URL("../public/xr/engine/nature-audio-v05.js", import.meta.url), "utf8");
const viewportGuard = readFileSync(new URL("../public/xr/engine/nature-viewport-guard-v12.js", import.meta.url), "utf8");
const premiumCss = readFileSync(new URL("../public/xr/jaguar/jaguar-premium-v12.css", import.meta.url), "utf8");
const goldCss = readFileSync(new URL("../public/xr/jaguar/jaguar-gold-v13.css", import.meta.url), "utf8");
const journeyHtml = readFileSync(new URL("../public/journey/jaguar/index.html", import.meta.url), "utf8");
const adapter = readFileSync(new URL("../public/xr/engine/nature-scene-adapter.js", import.meta.url), "utf8");
const generator = readFileSync(new URL("./build-xr-canonical-data.mjs", import.meta.url), "utf8");
const speciesSource = readFileSync(new URL("../src/data/species.ts", import.meta.url), "utf8");
const livingSystemsSource = readFileSync(new URL("../src/data/livingSystems.ts", import.meta.url), "utf8");
const relationshipSource = readFileSync(new URL("../src/data/speciesRelationships.ts", import.meta.url), "utf8");
const allowedRelationClasses = new Set(["DEPENDENCY", "PRESSURE", "RESPONSE"]);

test("Nature Journey v1.1 stays attached to canonical Jaguar identity", () => {
  assert.equal(manifest.version, "v1.1");
  assert.equal(manifest.entity.id, "taxon:gbif:5219426");
  assert.equal(manifest.entity.gbifKey, 5219426);
  assert.match(speciesSource, /taxon:gbif:5219426/);
  assert.match(speciesSource, /gbifKey:\s*5219426/);
  assert.match(manifest.truthBoundary, /NOT A LIVE HABITAT/);
  assert.match(manifest.truthBoundary, /NOT A PRECISE ECOLOGICAL SIMULATION/);
});

test("Every Journey node binds truth canonically while choreography stays presentation-only", () => {
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
    assert.ok(node.scene?.media?.backgroundSrc, `${node.id} requires authored chapter media`);
    assert.ok(node.scene?.interaction?.type, `${node.id} requires one authored world interaction`);
    assert.ok(node.scene?.interaction?.primaryAction, `${node.id} requires an authored primary action`);
    assert.equal(typeof node.scene?.markerPosition?.x, "number", `${node.id} requires an authored marker position`);
    if (node.relationClass !== null && node.relationClass !== undefined) assert.ok(allowedRelationClasses.has(node.relationClass));
  }
});

test("Jaguar Journey v1.1 uses genuinely distinct visual chapters instead of one moving background", () => {
  const backgrounds = manifest.nodes.map((node) => node.scene.media.backgroundSrc);
  assert.ok(new Set(backgrounds).size >= 4, "journey must use at least four distinct chapter backgrounds");
  assert.match(backgrounds[1], /River_RP\.jpg/);
  assert.match(backgrounds[2], /Amazon_CIAT/);
  assert.match(backgrounds[3], /Amazon_Deforestation/);
  for (const node of manifest.nodes.slice(1, 4)) {
    assert.ok(node.scene.media.credit?.label, `${node.id} external media must expose attribution`);
    assert.ok(node.scene.media.credit?.url, `${node.id} external media must expose source URL`);
    assert.ok(node.scene.media.credit?.license, `${node.id} external media must expose licence`);
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
  assert.equal(prey.scene.interaction.type, "relationship");
  assert.match(prey.scene.interaction.media.src, /Capybara/);
  assert.match(prey.scene.interaction.media.credit.license, /CC BY-SA 4\.0/);

  assert.match(relationshipSource, /relationship:4p:jaguar-capybara-prey-southern-pantanal/);
  assert.match(relationshipSource, /relationClass:\s*"DEPENDENCY"/);
  assert.match(relationshipSource, /state:\s*"KNOWN"/);
  assert.match(relationshipSource, /commonName:\s*"Capybara"/);
  assert.match(relationshipSource, /scientificName:\s*"Hydrochoerus hydrochaeris"/);
  assert.match(relationshipSource, /PERILLI ET AL\. 2016 · PLOS ONE/);
  assert.match(relationshipSource, /does not imply the same dietary importance elsewhere/i);
  assert.match(adapter, /relatedEntity/);
  assert.match(adapter, /relationship\.commonName/);
  assert.match(adapter, /relationship\.scientificName/);
});

test("Nature, Journey, cinematic and interaction renderers stay species-agnostic", () => {
  for (const source of [renderer, browserRenderer, journeyRenderer, cinematicRenderer, interactionRenderer]) {
    assert.doesNotMatch(source, /Panthera onca/i);
    assert.doesNotMatch(source, /5219426/);
  }
  assert.match(renderer, /manifest\.nodes\.forEach/);
  assert.match(renderer, /canonical-adapter/);
  assert.match(browserRenderer, /manifest\.entity\.id/);
  assert.match(browserRenderer, /manifest\.nodes/);
  assert.match(browserRenderer, /NatureJourneyEngine/);
  assert.match(browserRenderer, /4planet:nature-browser-ready/);
  assert.match(journeyRenderer, /node\.scene/);
  assert.match(journeyRenderer, /4planet:nature-journey-scene/);
  assert.match(cinematicRenderer, /scene\.media/);
  assert.match(cinematicRenderer, /nature-cinematic__scene/);
  assert.match(interactionRenderer, /relatedEntity/);
  assert.match(interactionRenderer, /scene\?\.interaction/);
  assert.match(interactionRenderer, /data-world-action/);
});

test("Browser Journey is scene-first, evidence-secondary, performance-tiered and commit-fail-safe", () => {
  assert.match(browserRenderer, /const goTo/);
  assert.match(browserRenderer, /closeChapter\(\);\s*applyScene/);
  assert.match(browserRenderer, /nature-journey-hud__evidence/);
  assert.match(browserRenderer, /openEvidence/);
  assert.match(browserRenderer, /performanceTier/);
  assert.match(browserRenderer, /requestAnimationFrame\(commitLook\)/);
  assert.doesNotMatch(browserRenderer, /setTimeout\(\(\) => openNode/);
  assert.match(cinematicRenderer, /preload/);
  assert.match(cinematicRenderer, /fallbackSrc|manifest\?\.environment/);
  assert.match(cinematicRenderer, /COMMIT_FALLBACK_MS/);
  assert.match(cinematicRenderer, /const commitFallback = window\.setTimeout\(commit, COMMIT_FALLBACK_MS\)/);
  assert.match(cinematicRenderer, /if \(committed \|\| token !== sceneToken\) return/);
  assert.match(cinematicRenderer, /window\.clearTimeout\(commitFallback\)/);
  assert.match(cinematicRenderer, /root\.dataset\.chapterMediaReady = 'true';[\s\S]*root\.dataset\.cinematicSettled = 'true';/);
  assert.match(cinematicRenderer, /root\.dataset\.cinematicSettledIndex = String\(index\);/);
  assert.match(cinematicRenderer, /const cleanupDelay = reducedMotion\(\) \? 0 : TRANSITION_SETTLE_MS;/);
  assert.match(cinematicRenderer, /outgoing\.classList\.remove\('is-leaving'\)/);
});

test("Gold interaction pass adds in-world actions without turning cards into a second truth store", () => {
  assert.match(journeyHtml, /jaguar-gold-v13\.css/);
  assert.match(journeyHtml, /nature-interaction-v13\.js/);
  assert.match(interactionRenderer, /node\.body/);
  assert.match(interactionRenderer, /node\.truthState/);
  assert.match(interactionRenderer, /node\.relatedEntity/);
  assert.match(interactionRenderer, /HOW DO WE KNOW\?/);
  assert.match(goldCss, /data-world-interaction=trace/);
  assert.match(goldCss, /data-world-interaction=pressure/);
  assert.match(goldCss, /data-tone=response/);
  assert.doesNotMatch(interactionRenderer, /Capybara|Hydrochoerus|Jaguar/i);
});

test("Premium pass protects viewport safety and keeps uncontrolled 3D viewers out of the primary journey", () => {
  assert.match(journeyHtml, /jaguar-premium-v12\.css/);
  assert.match(journeyHtml, /nature-viewport-guard-v12\.js/);
  assert.match(premiumCss, /max-width:calc\(100vw/);
  assert.match(premiumCss, /data-cinematic-scene=response/);
  assert.match(viewportGuard, /window\.scrollTo\(0, 0\)/);
  assert.match(viewportGuard, /data\.viewportSafe|viewportSafe/);
  assert.equal(manifest.subject.modelGate.status, "PENDING_CONTROLLED_ANIMATED_GLB");
  assert.doesNotMatch(journeyHtml, /sketchfab\.com|<iframe/i);
});

test("Browser-first experience uses explicit user activation for chaptered Amazonia audio", () => {
  assert.match(manifest.browser.entryCta, /ENTER THE LIVING SYSTEM/i);
  assert.match(manifest.browser.ambientLabel, /NOT FIELD AUDIO/i);
  assert.match(browserRenderer, /entryButton\?\.addEventListener\('click', enter\)/);
  assert.match(browserRenderer, /4planet:nature-browser-enter/);
  assert.match(audioRenderer, /AudioContext|webkitAudioContext/);
  assert.match(audioRenderer, /ctx\.resume\(\)/);
  assert.match(audioRenderer, /amazonia-procedural-v11/);
  assert.match(audioRenderer, /4planet:nature-journey-scene/);
  assert.match(audioRenderer, /sceneGain/);
  assert.match(audioRenderer, /sceneMix/);
  assert.match(audioRenderer, /water:\s*\.78/);
  assert.match(audioRenderer, /no synthetic Jaguar roar/i);
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
  assert.equal(response.scene.interaction.primaryAction, "next");
  assert.ok(response.href);
});