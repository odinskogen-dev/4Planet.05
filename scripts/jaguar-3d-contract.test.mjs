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
const goldCss = readFileSync(new URL('../public/xr/jaguar/jaguar-gold-v19.css', import.meta.url), 'utf8');
const perfCss = readFileSync(new URL('../public/xr/jaguar/jaguar-performance-v21.css', import.meta.url), 'utf8');
const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');

test('Ear Rodriguez is the only preferred 3D prototype creature without pretending the binary is controlled', () => {
  assert.equal(creature.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.equal(creature.actor.preferred.role, 'PREFERRED_FREE_PROTOTYPE_CREATURE');
  assert.equal(creature.actor.preferred.binaryState, 'NOT_YET_LOCAL');
  assert.equal(creature.actor.preferred.rightsState, 'CC_ATTRIBUTION_METADATA_CONFIRMED_BINARY_RECORD_PENDING');
  assert.equal(creature.actor.preferred.triangles, 25900);
  assert.equal(creature.actor.preferred.vertices, 13500);
  assert.match(creature.actor.preferred.sourcePage, /sketchfab\.com\/3d-models\/jaguar-91c61c329d2a4668816f81f08dfcd492/);
  assert.equal(creature.actor.preferred.runtimePath, '/assets/species/jaguar/jaguar-ear-rodriguez.glb');
  assert.match(renderer, /preferred\.binaryState !== 'CONTROLLED_LOCAL'/);
  assert.match(renderer, /preferred-pending/);
});

test('low-fidelity Poly WebGL fallback is retired in favour of controlled photo fallback', () => {
  assert.equal(creature.actor.fallback.status, 'PHOTO_ONLY_NO_WEBGL');
  assert.equal(creature.actor.fallback.id, 'controlled-jaguar-species-media');
  assert.doesNotMatch(renderer, /MTLLoader|OBJLoader|FALLBACK_BASE|poly\.pizza/);
  assert.equal(manifest.subject.modelGate.status, 'PENDING_CONTROLLED_ANIMATED_GLB');
  assert.doesNotMatch(html, /<iframe|sketchfab\.com/i);
  assert.match(perfCss, /jaguarPhotoBreathV21/);
});

test('Gold runtime uses reusable creature choreography and can map real GLB clips or reactive bones', () => {
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
  assert.match(renderer, /findAction\('walk', 'prowl', 'move'/);
  assert.match(renderer, /detectReactiveBones/);
  assert.match(renderer, /jaguarMotionCapability/);
});

test('Jaguar runtime remains progressive but protects performance before 3D fidelity is ready', () => {
  assert.match(html, /jaguar-3d-v14\.css/);
  assert.match(html, /jaguar-gold-v19\.css/);
  assert.match(html, /jaguar-performance-v21\.css/);
  assert.match(renderer, /runtimeBudget/);
  assert.match(renderer, /rendererPixelRatio/);
  assert.match(renderer, /renderInterval/);
  assert.match(renderer, /dataset\.jaguar3d/);
  assert.match(renderer, /photographic creature remains/i);
  assert.match(legacyCss, /data-performance-tier=lite/);
});

test('Gold room keeps layered rainforest depth, scene reveal and adaptive controls', () => {
  assert.match(html, /nature-depth-room__far/);
  assert.match(html, /nature-depth-room__mid/);
  assert.match(html, /nature-depth-room__foreground-left/);
  assert.match(html, /nature-depth-room__fog/);
  assert.match(goldCss, /am4zonia\/hero\.jpg/);
  assert.match(goldCss, /am4zonia\/detail-01\.jpg/);
  assert.match(goldCss, /data-creature-reveal/);
  assert.match(goldCss, /jaguarScanV19/);
  assert.match(perfCss, /data-runtime-budget="balanced"/);
  assert.match(perfCss, /@media\(max-width:760px\)/);
  assert.match(perfCss, /@media\(prefers-reduced-motion:reduce\)/);
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
  assert.match(headers, /media-src 'self' blob: https:\/\/upload\.wikimedia\.org/);
});
