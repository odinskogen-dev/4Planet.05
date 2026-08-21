import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const manifest = JSON.parse(readFileSync(new URL('../public/xr/scenes/jaguar.json', import.meta.url), 'utf8'));
const creature = JSON.parse(readFileSync(new URL('../public/journey/jaguar/creature-v19.json', import.meta.url), 'utf8'));
const html = readFileSync(new URL('../public/journey/jaguar/index.html', import.meta.url), 'utf8');
const renderer = readFileSync(new URL('../public/xr/engine/nature-jaguar-3d-v19.js', import.meta.url), 'utf8');
const liveBridge = readFileSync(new URL('../public/xr/engine/nature-jaguar-sketchfab-v23.js', import.meta.url), 'utf8');
const choreography = readFileSync(new URL('../public/xr/engine/nature-creature-choreography-v19.js', import.meta.url), 'utf8');
const fieldAudio = readFileSync(new URL('../public/xr/engine/nature-field-audio-v19.js', import.meta.url), 'utf8');
const legacyCss = readFileSync(new URL('../public/xr/jaguar/jaguar-3d-v14.css', import.meta.url), 'utf8');
const goldCss = readFileSync(new URL('../public/xr/jaguar/jaguar-gold-v19.css', import.meta.url), 'utf8');
const perfCss = readFileSync(new URL('../public/xr/jaguar/jaguar-performance-v21.css', import.meta.url), 'utf8');
const liveCss = readFileSync(new URL('../public/xr/jaguar/jaguar-ear-live-v23.css', import.meta.url), 'utf8');
const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');

test('Founder-supplied Ear Rodriguez GLB metadata is locked without pretending repository binary ingest is complete', () => {
  assert.equal(creature.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.equal(creature.actor.preferred.role, 'PREFERRED_FREE_PROTOTYPE_CREATURE');
  assert.equal(creature.actor.preferred.binaryState, 'FOUNDER_SUPPLIED_VERIFIED_PENDING_REPO_BINARY_INGEST');
  assert.equal(creature.actor.preferred.rightsState, 'CC_BY_4_0_VERIFIED_FROM_DOWNLOADED_LICENSE');
  assert.equal(creature.actor.preferred.licence, 'CC BY 4.0');
  assert.equal(creature.actor.preferred.triangles, 25900);
  assert.equal(creature.actor.preferred.vertices, 13500);
  assert.equal(creature.actor.preferred.uploadedCandidate.profile, '1K_RUNTIME');
  assert.equal(creature.actor.preferred.uploadedCandidate.bytes, 7198456);
  assert.equal(creature.actor.preferred.uploadedCandidate.sha256, '8225124ef8370f7798c437b8ade8651d420e1ec0155ecbbb529058c586b89f13');
  assert.equal(creature.actor.preferred.uploadedCandidate.animations, 1);
  assert.equal(creature.actor.preferred.uploadedCandidate.animationDurationSeconds, 14.667);
  assert.equal(creature.actor.preferred.uploadedCandidate.largestTexture, '1024x1024 JPEG');
  assert.match(creature.actor.preferred.sourcePage, /sketchfab\.com\/3d-models\/jaguar-91c61c329d2a4668816f81f08dfcd492/);
  assert.equal(creature.actor.preferred.runtimePath, '/assets/species/jaguar/jaguar-ear-rodriguez.glb');
  assert.match(renderer, /preferred\.binaryState !== 'CONTROLLED_LOCAL'/);
});

test('live bridge uses exact Ear model with official animation semantics and multiple bounded interactions', () => {
  assert.match(html, /nature-jaguar-sketchfab-v23\.js/);
  assert.match(html, /jaguar-ear-live-v23\.css/);
  assert.match(liveBridge, /91c61c329d2a4668816f81f08dfcd492/);
  assert.match(liveBridge, /getAnimations/);
  assert.match(liveBridge, /setCurrentAnimationByUID/);
  assert.match(liveBridge, /seekTo/);
  assert.match(liveBridge, /setCameraLookAt/);
  assert.match(liveBridge, /setCycleMode\?\.\('loopOne'\)/);
  assert.doesNotMatch(liveBridge, /setCycleMode\?\.\('loop'\)/);
  assert.match(liveBridge, /setBackground\?\.\(\{ color:/);
  assert.match(liveBridge, /addEventListener\?\.\('click'/);
  assert.match(liveBridge, /LOOK AT ME/);
  assert.match(liveBridge, /MOVE/);
  assert.match(liveBridge, /DRAG JAGUAR TO TURN/);
  assert.match(liveCss, /data-runtime-budget="lite"/);
});

test('low-fidelity Poly WebGL fallback remains retired in favour of controlled photo fail-closed fallback', () => {
  assert.equal(creature.actor.fallback.status, 'PHOTO_ONLY_NO_WEBGL');
  assert.equal(creature.actor.fallback.id, 'controlled-jaguar-species-media');
  assert.doesNotMatch(renderer, /MTLLoader|OBJLoader|FALLBACK_BASE|poly\.pizza/);
  assert.equal(manifest.subject.modelGate.status, 'PENDING_CONTROLLED_ANIMATED_GLB');
  assert.match(perfCss, /jaguarPhotoBreathV21/);
});

test('Gold runtime uses reusable creature choreography and can map real GLB clips or reactive bones', () => {
  assert.match(html, /nature-creature-choreography-v19\.js/);
  assert.match(html, /nature-jaguar-3d-v19\.js/);
  assert.deepEqual(creature.choreography.map((step) => step.phase), ['emerge', 'walk', 'stop', 'breathe', 'observe', 'reveal', 'hold']);
  assert.match(choreography, /registerActor/);
  assert.match(choreography, /4planet:nature-creature-phase/);
  assert.match(choreography, /--creature-reveal/);
  assert.match(renderer, /GLTFLoader/);
  assert.match(renderer, /AnimationMixer/);
  assert.match(renderer, /findAction\('walk', 'prowl', 'move'/);
  assert.match(renderer, /detectReactiveBones/);
});

test('Jaguar runtime remains progressive and performance bounded', () => {
  assert.match(html, /jaguar-performance-v21\.css/);
  assert.match(renderer, /runtimeBudget/);
  assert.match(renderer, /rendererPixelRatio/);
  assert.match(renderer, /renderInterval/);
  assert.match(renderer, /dataset\.jaguar3d/);
  assert.match(legacyCss, /data-performance-tier=lite/);
  assert.match(liveBridge, /budgetAllows/);
  assert.match(liveBridge, /api\?\.pause/);
  assert.match(liveBridge, /window\.innerWidth > 760/);
});

test('Gold room keeps layered rainforest depth and live creature occlusion', () => {
  assert.match(html, /nature-depth-room__far/);
  assert.match(html, /nature-depth-room__foreground-left/);
  assert.match(goldCss, /am4zonia\/hero\.jpg/);
  assert.match(goldCss, /data-creature-reveal/);
  assert.match(liveCss, /nature-depth-room__foreground-left/);
  assert.match(liveCss, /nature-depth-room__canopy/);
});

test('Amazon field ambience is verified media while Jaguar presence cue remains explicitly designed', () => {
  assert.equal(creature.audio.fieldAmbience.kind, 'FIELD_RECORDING');
  assert.equal(creature.audio.fieldAmbience.creator, 'Felix Blume');
  assert.equal(creature.audio.fieldAmbience.licence, 'CC0 1.0');
  assert.equal(creature.audio.creatureCue.kind, 'DESIGNED_AUDIO');
  assert.match(fieldAudio, /JAGUAR PRESENCE CUE · DESIGNED · NOT FIELD AUDIO/);
  assert.match(html, /FELIX BLUME · CC0/);
});

test('Jaguar CSP narrowly allows jsDelivr, Wikimedia and official Sketchfab bridge only', () => {
  assert.match(html, /three@0\.185\.1\/build\/three\.module\.js/);
  assert.match(headers, /\/journey\/jaguar\/\*/);
  assert.match(headers, /script-src 'self'[^\n]*https:\/\/cdn\.jsdelivr\.net[^\n]*https:\/\/static\.sketchfab\.com/);
  assert.match(headers, /frame-src 'self' https:\/\/sketchfab\.com https:\/\/\*\.sketchfab\.com/);
  assert.match(headers, /media-src 'self' blob: https:\/\/upload\.wikimedia\.org/);
});
