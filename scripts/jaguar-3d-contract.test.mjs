import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const manifest = JSON.parse(read('public/xr/scenes/jaguar.json'));
const creature = JSON.parse(read('public/journey/jaguar/creature-v19.json'));
const html = read('public/journey/jaguar/index.html');
const bridge = read('public/xr/engine/nature-jaguar-sketchfab-v23.js');
const bridgeCss = read('public/xr/jaguar/jaguar-ear-live-v23.css');
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
  assert.equal(creature.actor.preferred.binaryState, 'FOUNDER_SUPPLIED_VERIFIED_PENDING_REPO_BINARY_INGEST');
});

test('Journey rejects the degraded proxy and uses the official Ear source model bridge until the verified GLB is actually ingested', () => {
  assert.match(html, /jaguar-ear-live-v23\.css/);
  assert.match(html, /nature-jaguar-sketchfab-v23\.js/);
  assert.doesNotMatch(html, /jaguar-ear-proxy-v25\.js|nature-jaguar-local-v26\.js/);
  assert.match(bridge, /91c61c329d2a4668816f81f08dfcd492/);
  assert.match(bridge, /sketchfab\.com\/models/);
  assert.match(bridge, /ear-rodriguez-jaguar/);
  assert.match(bridgeCss, /nature-ear-live-v23/);
});

test('real-source bridge stays bounded to the encounter and mobile fails closed to controlled species media', () => {
  assert.match(bridge, /window\.innerWidth > 760/);
  assert.match(bridge, /const viewerAllowed = \(\) => desktopViewport\(\)/);
  assert.match(bridge, /identityScene/);
  assert.match(bridge, /data-jaguar3d|dataset\.jaguar3d/);
  assert.match(bridge, /ear-direct-embed|ear-live-bridge/);
  assert.match(bridge, /4planet:nature-journey-scene/);
  assert.match(bridgeCss, /@media\(max-width:760px\)/);
  assert.match(choreography, /registerActor/);
  assert.match(choreography, /4planet:nature-creature-phase/);
});

test('controlled photo remains the truthful fallback while self-hosted binary ingest is unresolved', () => {
  assert.equal(manifest.subject.modelGate.status, 'PENDING_CONTROLLED_ANIMATED_GLB');
  assert.match(goldCss, /am4zonia\/hero\.jpg/);
  assert.match(creature.actor.preferred.runtimePath, /jaguar-ear-rodriguez\.glb/);
  assert.match(creature.actor.preferred.liveBridge.status, /ACTIVE_UNTIL_LOCAL_BINARY_COMMIT/);
});

test('Amazon field ambience remains verified and Jaguar cue remains explicitly designed', () => {
  assert.equal(creature.audio.fieldAmbience.kind, 'FIELD_RECORDING');
  assert.equal(creature.audio.fieldAmbience.creator, 'Felix Blume');
  assert.equal(creature.audio.fieldAmbience.licence, 'CC0 1.0');
  assert.equal(creature.audio.creatureCue.kind, 'DESIGNED_AUDIO');
  assert.match(fieldAudio, /JAGUAR PRESENCE CUE · DESIGNED · NOT FIELD AUDIO/);
});

test('Jaguar route permits only origins required by the current real-source bridge and media', () => {
  assert.match(headers, /\/journey\/jaguar\/\*/);
  assert.match(headers, /frame-src 'self' https:\/\/sketchfab\.com/);
  assert.match(headers, /media-src 'self' blob: https:\/\/upload\.wikimedia\.org/);
});
