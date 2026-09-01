import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('public/journey/orca/index.html');
const humanGold = read('public/xr/orca/orca-human-gold-01.js');
const humanGoldCss = read('public/xr/orca/orca-human-gold-01.css');
const lume = read('public/xr/orca/orca-lume-19.js');
const lumeCss = read('public/xr/orca/orca-lume-19.css');
const motionCss = read('public/xr/orca/orca-lume-19-motion.css');
const room = read('public/xr/orca/orca-lume-room-21.js');
const roomCss = read('public/xr/orca/orca-lume-room-21.css');
const audio = read('public/xr/engine/nature-audio-v06.js');
const manifest = JSON.parse(read('public/xr/scenes/orca.json'));

test('ORCA Human Gold keeps the shared Journey truth engine but removes stacked legacy presentation from the active route', () => {
  assert.match(html, /nature-scene-adapter\.js/);
  assert.match(html, /nature-journey-engine\.js/);
  assert.match(html, /nature-browser\.js/);
  assert.match(html, /orca-human-gold-01\.css/);
  assert.match(html, /orca-human-gold-01\.js/);
  assert.doesNotMatch(html, /orca-lume-19\.(?:js|css)/);
  assert.doesNotMatch(html, /orca-lume-room-21\.(?:js|css)/);
  assert.doesNotMatch(html, /jaguar-(?:xr|awe|journey|premium|gold)/);
});

test('historical LUME assets remain preserved as donor evidence instead of being deleted', () => {
  assert.match(lume, /NatureAudioV06/);
  assert.match(lume, /GBIF 2440483/);
  assert.match(lumeCss, /--lume-blue:#8de8ff/);
  assert.match(motionCss, /prefers-reduced-motion:reduce/);
  assert.match(room, /orca-lume-room21__back/);
  assert.match(roomCss, /perspective:900px/);
});

test('Human Gold composition preserves canonical Orca identity and hard truth boundaries', () => {
  assert.equal(manifest.entity.id, 'taxon:gbif:2440483');
  assert.equal(manifest.entity.gbifKey, 2440483);
  assert.match(html, /NOT LIVE TRACKING/);
  assert.match(humanGold, /AI-GENERATED SPECIES VISUALISATION · NOT EVIDENCE \/ NOT A PHOTOGRAPH/);
  assert.match(humanGold, /lume-orca-v1\.png/);
  assert.match(manifest.truthBoundary, /NOT LIVE TRACKING/);
});

test('Orca now opens with the animal rather than a LUME control plane', () => {
  assert.match(html, />Meet the orca\.</);
  assert.match(html, />MEET THE ORCA</);
  assert.doesNotMatch(html, /data-lume-default/);
  assert.doesNotMatch(html, /LIGHT LENS|LUME ROOM 21/);
  assert.match(humanGold, /humanQualityAuthority = 'founder-first'/);
});

test('Human Gold keeps intentional mobile, focus, evidence and reduced-motion states', () => {
  assert.match(humanGoldCss, /@media\(max-width:760px\)/);
  assert.match(humanGoldCss, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(humanGoldCss, /focus-visible/);
  assert.match(humanGoldCss, /nature-chapter/);
  assert.match(humanGoldCss, /nature-subject__image/);
});

test('audio remains shared and explicitly procedural until a bounded field-audio choice is made', () => {
  assert.match(html, /nature-audio-v06\.js/);
  assert.match(audio, /ocean/);
  assert.match(audio, /procedural-v06/);
  assert.match(audio, /4planet:nature-browser-enter/);
});