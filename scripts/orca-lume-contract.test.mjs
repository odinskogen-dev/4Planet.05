import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('public/journey/orca/index.html');
const lume = read('public/xr/orca/orca-lume-19.js');
const lumeCss = read('public/xr/orca/orca-lume-19.css');
const motionCss = read('public/xr/orca/orca-lume-19-motion.css');
const room = read('public/xr/orca/orca-lume-room-21.js');
const roomCss = read('public/xr/orca/orca-lume-room-21.css');
const lightLens = read('public/xr/engine/nature-light-lens-v18.js');
const audio = read('public/xr/engine/nature-audio-v06.js');
const premium = JSON.parse(read('public/journey/orca/premium-v17.json'));
const manifest = JSON.parse(read('public/xr/scenes/orca.json'));

test('ORCA LUME stays inside the existing shared Journey and Light Lens architecture', () => {
  assert.match(html, /nature-light-lens-v18\.js/);
  assert.match(html, /orca-lume-19\.js/);
  assert.match(html, /orca-lume-19\.css/);
  assert.match(html, /orca-lume-19-motion\.css/);
  assert.match(html, /orca-lume-room-21\.js/);
  assert.match(html, /orca-lume-room-21\.css/);
  assert.match(html, /data-premium-config="\/journey\/orca\/premium-v17\.json"/);
  assert.match(lightLens, /4planet:nature-journey-scene/);
  assert.doesNotMatch(lume, /new AudioContext|new webkitAudioContext|createOscillator|createBufferSource/);
  assert.doesNotMatch(room, /new AudioContext|new webkitAudioContext|createOscillator|createBufferSource/);
  assert.match(lume, /NatureAudioV06/);
});

test('ORCA LUME preserves canonical Orca identity and population-specific truth boundaries', () => {
  assert.equal(manifest.entity.id, 'taxon:gbif:2440483');
  assert.equal(manifest.entity.gbifKey, 2440483);
  assert.match(lume, /GBIF 2440483/);
  assert.match(lume, /POPULATION \/ POD','UNKNOWN','NOT INFERRED/);
  assert.match(lume, /OCCURRENCE ≠ RANGE · ABUNDANCE · LIVE POSITION/);
  assert.match(lume, /MIGRATION \/ ROUTE','NOT INFERRED','NO FAKE TRACK/);
  assert.match(JSON.stringify(premium), /population-specific|POPULATION-SPECIFIC/);
  assert.match(html, /NOT LIVE TRACKING/);
});

test('real Orca photo base is rights-labelled and fails closed to wireframe', () => {
  assert.match(lume, /Orcinus_orca_NOAA\.jpg/);
  assert.match(lume, /credit: 'NOAA'/);
  assert.match(lume, /rights: 'PUBLIC DOMAIN'/);
  assert.match(lume, /PROJECTION TREATMENT IS INTERPRETIVE/);
  assert.match(lume, /PHOTO BASE UNAVAILABLE · WIREFRAME FALLBACK/);
  assert.match(lume, /unavailable-wireframe-fallback/);
  assert.match(motionCss, /unavailable-wireframe-fallback/);
});

test('LUME is the branch default while real-world mode remains reversible', () => {
  assert.match(html, /data-lume-default="true"/);
  assert.match(lume, /activateDefaultLume/);
  assert.match(lume, /toggle\.click\(\)/);
  assert.match(lightLens, /toggle\.textContent = enabled \? 'REAL WORLD' : 'LIGHT LENS'/);
  assert.match(room, /root\.dataset\.lightLens === 'true' \? 'REAL WORLD' : 'LUME ROOM'/);
  assert.match(room, /Return to real-world journey state/);
  assert.match(room, /Enter Orca LUME intelligence room/);
});

test('LUME Room 21 is a bounded dark marine room with back, floor and side depth planes', () => {
  assert.match(room, /orca-lume-room21__back/);
  assert.match(room, /orca-lume-room21__floor/);
  assert.match(room, /orca-lume-room21__side--left/);
  assert.match(room, /orca-lume-room21__side--right/);
  assert.match(room, /orca-lume-room21__volume/);
  assert.match(roomCss, /perspective:900px/);
  assert.match(roomCss, /rotateX\(68deg\)/);
  assert.match(roomCss, /rotateY\(64deg\)/);
  assert.match(roomCss, /rotateY\(-64deg\)/);
  assert.match(roomCss, /--orca-room-yaw/);
  assert.match(roomCss, /@media\(max-width:760px\)/);
  assert.match(roomCss, /@media\(prefers-reduced-motion:reduce\)/);
});

test('projected intelligence is explicit about acoustic and ecological interpretation', () => {
  assert.match(lume, /PROCEDURAL · NOT FIELD AUDIO/);
  assert.match(lume, /PRESSURE CATEGORY ≠ EXPOSURE LEVEL OR EFFECT/);
  assert.match(lume, /NO UNIVERSAL FIX · NO OUTCOME CLAIM/);
  assert.match(lume, /interpretive:true/);
  assert.match(audio, /ocean/);
  assert.match(audio, /4planet:nature-browser-enter/);
});

test('LUME provides mobile, focus, media-fallback and reduced-motion controls', () => {
  assert.match(lumeCss, /@media\(max-width:760px\)/);
  assert.match(lumeCss, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(motionCss, /@media\(max-width:760px\)/);
  assert.match(motionCss, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(motionCss, /focus-visible/);
  assert.match(lume, /prefers-reduced-motion: reduce/);
  assert.match(room, /prefers-reduced-motion: reduce/);
  assert.match(lume, /addEventListener\('error'/);
});

test('LUME colour grammar is predominantly ice-blue and white rather than v18 green', () => {
  assert.match(lumeCss, /--lume-white:#f7fdff/);
  assert.match(lumeCss, /--lume-blue:#8de8ff/);
  assert.match(lumeCss, /--light-lens-accent:var\(--lume-blue\)!important/);
  assert.match(lumeCss, /\.light-lens-colour\{display:none!important\}/);
});
