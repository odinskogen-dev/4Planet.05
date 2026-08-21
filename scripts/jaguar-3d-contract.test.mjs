import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const manifest = JSON.parse(readFileSync(new URL('../public/xr/scenes/jaguar.json', import.meta.url), 'utf8'));
const creature = JSON.parse(readFileSync(new URL('../public/journey/jaguar/creature-v19.json', import.meta.url), 'utf8'));
const html = readFileSync(new URL('../public/journey/jaguar/index.html', import.meta.url), 'utf8');
const renderer = readFileSync(new URL('../public/xr/engine/nature-jaguar-3d-v19.js', import.meta.url), 'utf8');
const choreography = readFileSync(new URL('../public/xr/engine/nature-creature-choreography-v19.js', import.meta.url), 'utf8');
const fieldAudio = readFileSync(new URL('../public/xr/engine/nature-field-audio-v19.js', import.meta.url), 'utf8');
const legacyCss = readFileSync(new URL('../public/xr/jaguar/jaguar-3d-v14.css', import.meta.url), 'utf8');
const cinematicCss = readFileSync(new URL('../public/xr/jaguar/jaguar-cinematic-v17.css', import.meta.url), 'utf8');
const goldCss = readFileSync(new URL('../public/xr/jaguar/jaguar-gold-v19.css', import.meta.url), 'utf8');
const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');

const sourceCommit = '728230086493b1f1cee6a410d0a8ea7c0991f6ff';

test('Ear Rodriguez is locked as preferred free prototype creature without pretending the binary is controlled', () => {
  assert.equal(creature.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.equal(creature.actor.preferred.role, 'PREFERRED_FREE_PROTOTYPE_CREATURE');
  assert.equal(creature.actor.preferred.binaryState, 'NOT_YET_LOCAL');
  assert.equal(creature.actor.preferred.rightsState, 'VERIFY_AT_BINARY_INGEST');
  assert.match(creature.actor.preferred.sourcePage, /sketchfab\.com\/3d-models\/jaguar-91c61c329d2a4668816f81f08dfcd492/);
  assert.equal(creature.actor.preferred.runtimePath, '/assets/species/jaguar/jaguar-ear-rodriguez.glb');
  assert.match(renderer, /preferred\.binaryState !== 'CONTROLLED_LOCAL'/);
  assert.match(renderer, /preferred GLB failed closed; using controlled fallback/i);
});

test('controlled fallback remains immutable, rights-labelled and subordinate to the preferred creature gate', () => {
  assert.equal(creature.actor.fallback.sourceCommit, sourceCommit);
  assert.equal(creature.actor.fallback.licence, 'CC BY 3.0');
  assert.match(renderer, new RegExp(sourceCommit));
  assert.match(renderer, /poly\.pizza\/m\/4fb-oMr2uUF/);
  assert.equal(manifest.subject.modelGate.status, 'PENDING_CONTROLLED_ANIMATED_GLB');
  assert.doesNotMatch(html, /<iframe|sketchfab\.com/i);
});

test('Gold v19 uses a reusable creature choreography engine instead of Jaguar-only timer choreography', () => {
  assert.match(html, /nature-creature-choreography-v19\.js/);
  assert.match(html, /nature-jaguar-3d-v19\.js/);
  assert.doesNotMatch(html, /nature-jaguar-3d-v17\.js/);
  assert.deepEqual(creature.choreography.map((step) => step.phase), ['emerge', 'walk', 'stop', 'breathe', 'observe', 'reveal', 'hold']);
  assert.match(choreography, /registerActor/);
  assert.match(choreography, /4planet:nature-creature-phase/);
  assert.match(choreography, /--creature-reveal/);
  assert.match(choreography, /prefers-reduced-motion: reduce/);
  assert.match(renderer, /GLTFLoader/);
  assert.match(renderer, /AnimationMixer/);
  assert.match(renderer, /findAction\('walk', 'prowl', 'move'\)/);
});

test('Jaguar runtime keeps progressive enhancement and controlled media fallback', () => {
  assert.match(html, /jaguar-3d-v14\.css/);
  assert.match(html, /jaguar-cinematic-v17\.css/);
  assert.match(html, /jaguar-gold-v19\.css/);
  assert.match(renderer, /MTLLoader/);
  assert.match(renderer, /OBJLoader/);
  assert.match(renderer, /fullTier/);
  assert.match(renderer, /dataset\.jaguar3d/);
  assert.match(renderer, /failed closed; controlled photographic subject remains/i);
  assert.match(legacyCss, /data-performance-tier=lite/);
  assert.match(cinematicCss, /@media\(max-width:760px\).*nature-3d-subject--v17\{display:none!important\}/s);
});

test('Gold v19 builds a layered rainforest depth room with mobile and reduced-motion controls', () => {
  assert.match(html, /nature-depth-room__far/);
  assert.match(html, /nature-depth-room__mid/);
  assert.match(html, /nature-depth-room__foreground-left/);
  assert.match(html, /nature-depth-room__fog/);
  assert.match(goldCss, /am4zonia\/hero\.jpg/);
  assert.match(goldCss, /am4zonia\/detail-01\.jpg/);
  assert.match(goldCss, /data-creature-reveal/);
  assert.match(goldCss, /jaguarScanV19/);
  assert.match(goldCss, /@media\(max-width:760px\)/);
  assert.match(goldCss, /@media\(prefers-reduced-motion:reduce\)/);
});

test('Amazon field ambience is verified media while Jaguar presence cue remains explicitly designed', () => {
  assert.equal(creature.audio.fieldAmbience.kind, 'FIELD_RECORDING');
  assert.equal(creature.audio.fieldAmbience.creator, 'Felix Blume');
  assert.equal(creature.audio.fieldAmbience.licence, 'CC0 1.0');
  assert.match(creature.audio.fieldAmbience.mediaUrl, /^https:\/\/upload\.wikimedia\.org\//);
  assert.equal(creature.audio.creatureCue.kind, 'DESIGNED_AUDIO');
  assert.match(creature.audio.creatureCue.label, /NOT FIELD AUDIO/);
  assert.match(fieldAudio, /nature-audio-provenance-v19/);
  assert.match(fieldAudio, /JAGUAR PRESENCE CUE · DESIGNED · NOT FIELD AUDIO/);
  assert.match(fieldAudio, /playDesignedPresenceCue/);
  assert.match(html, /FELIX BLUME · CC0/);
});

test('Three.js and Wikimedia audio stay inside the existing narrow Jaguar Journey CSP', () => {
  assert.match(html, /three@0\.185\.1\/build\/three\.module\.js/);
  assert.match(html, /three@0\.185\.1\/examples\/jsm\//);
  assert.match(headers, /\/journey\/jaguar\/\*/);
  assert.match(headers, /script-src 'self'[^\n]*https:\/\/cdn\.jsdelivr\.net/);
  assert.match(headers, /connect-src 'self' https:\/\/raw\.githubusercontent\.com https:\/\/cdn\.jsdelivr\.net/);
  assert.match(headers, /media-src 'self' blob: https:\/\/upload\.wikimedia\.org/);
});
