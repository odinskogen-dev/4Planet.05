import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const manifest = JSON.parse(read('public/xr/scenes/jaguar.json'));
const creature = JSON.parse(read('public/journey/jaguar/creature-v19.json'));
const html = read('public/journey/jaguar/index.html');
const localRenderer = read('public/xr/engine/nature-jaguar-local-v26.js');
const localCss = read('public/xr/jaguar/jaguar-master-v26.css');
const choreography = read('public/xr/engine/nature-creature-choreography-v19.js');
const fieldAudio = read('public/xr/engine/nature-field-audio-v19.js');
const goldCss = read('public/xr/jaguar/jaguar-gold-v19.css');
const headers = read('public/_headers');

test('Founder-supplied Ear Rodriguez asset metadata and licence are locked', () => {
  assert.equal(creature.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.equal(creature.actor.preferred.rightsState, 'CC_BY_4_0_VERIFIED_FROM_DOWNLOADED_LICENSE');
  assert.equal(creature.actor.preferred.licence, 'CC BY 4.0');
  assert.equal(creature.actor.preferred.triangles, 25900);
  assert.equal(creature.actor.preferred.vertices, 13500);
  assert.equal(creature.actor.preferred.uploadedCandidate.profile, '1K_RUNTIME');
  assert.equal(creature.actor.preferred.uploadedCandidate.bytes, 7198456);
  assert.equal(creature.actor.preferred.uploadedCandidate.sha256, '8225124ef8370f7798c437b8ade8651d420e1ec0155ecbbb529058c586b89f13');
  assert.equal(creature.actor.preferred.uploadedCandidate.animations, 1);
  assert.equal(creature.actor.preferred.uploadedCandidate.animationDurationSeconds, 14.667);
});

test('Journey uses first-party local Three.js creature runtime inside the authored v26 jungle room rather than a blocked iframe', () => {
  assert.match(html, /jaguar-master-v26\.css/);
  assert.match(html, /jaguar-ear-proxy-v25\.js/);
  assert.match(html, /nature-jaguar-local-v26\.js/);
  assert.doesNotMatch(html, /nature-jaguar-sketchfab-v23\.js|jaguar-ear-live-v23\.css|<iframe/i);
  assert.match(localRenderer, /new THREE\.WebGLRenderer/);
  assert.match(localRenderer, /JaguarEarProxyV25/);
  assert.match(localRenderer, /jaguar-authored-jungle-room-v26/);
  assert.match(localRenderer, /local-room-ready/);
});

test('local creature exposes bounded interactions and shared choreography', () => {
  assert.deepEqual(creature.choreography.map((step) => step.phase), ['emerge', 'walk', 'stop', 'breathe', 'observe', 'reveal', 'hold']);
  assert.match(choreography, /registerActor/);
  assert.match(choreography, /4planet:nature-creature-phase/);
  assert.match(localRenderer, /data-jaguar-action="observe"/);
  assert.match(localRenderer, /data-jaguar-action="move"/);
  assert.match(localRenderer, /pointerdown/);
  assert.match(localRenderer, /pointermove/);
  assert.match(localRenderer, /manualMode === 'observe'/);
  assert.match(localRenderer, /manualMode === 'move'/);
  assert.match(localRenderer, /setReveal/);
});

test('mobile and lite runtime keep the creature and simplify secondary effects', () => {
  assert.match(localRenderer, /runtimeBudget\(\) === 'full' \? 1000 \/ 40 : runtimeBudget\(\) === 'balanced' \? 1000 \/ 30 : 1000 \/ 24/);
  assert.match(localRenderer, /return Math\.min\(dpr, \.82\)/);
  assert.match(localCss, /@media\(max-width:760px\)[\s\S]*nature-3d-subject--room-v26/);
  assert.match(localCss, /data-runtime-budget="lite"[\s\S]*nature-3d-subject--room-v26\{display:block!important/);
  assert.doesNotMatch(localCss, /@media\(max-width:760px\)[\s\S]*nature-3d-subject--room-v26\{[^}]*display:none!important/);
});

test('locally controlled 3D retires photo and remains grounded inside the premium room', () => {
  assert.equal(manifest.subject.modelGate.status, 'PENDING_CONTROLLED_ANIMATED_GLB');
  assert.match(localCss, /data-jaguar3d="local-room-ready"[\s\S]*nature-subject[\s\S]*visibility:hidden!important/);
  assert.match(localCss, /nature-depth-room__foreground-left/);
  assert.match(localCss, /nature-depth-room__canopy/);
  assert.match(goldCss, /am4zonia\/hero\.jpg/);
});

test('Amazon field ambience remains verified and Jaguar cue remains explicitly designed', () => {
  assert.equal(creature.audio.fieldAmbience.kind, 'FIELD_RECORDING');
  assert.equal(creature.audio.fieldAmbience.creator, 'Felix Blume');
  assert.equal(creature.audio.fieldAmbience.licence, 'CC0 1.0');
  assert.equal(creature.audio.creatureCue.kind, 'DESIGNED_AUDIO');
  assert.match(fieldAudio, /JAGUAR PRESENCE CUE · DESIGNED · NOT FIELD AUDIO/);
});

test('Jaguar route permits only the origins still required by the local runtime', () => {
  assert.match(html, /three@0\.185\.1\/build\/three\.module\.js/);
  assert.match(headers, /\/journey\/jaguar\/\*/);
  assert.match(headers, /media-src 'self' blob: https:\/\/upload\.wikimedia\.org/);
});
