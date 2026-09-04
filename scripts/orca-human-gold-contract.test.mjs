import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../public/journey/orca/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/xr/orca/orca-human-gold-01.css', import.meta.url), 'utf8');
const composition = readFileSync(new URL('../public/xr/orca/orca-human-gold-01.js', import.meta.url), 'utf8');

test('Orca Human Gold 01 is one clean presentation composition over shared Journey truth', () => {
  const stylesheets = [...page.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(stylesheets, ['/xr/orca/orca-human-gold-01.css']);
  assert.match(page, /\/xr\/engine\/nature-scene-adapter\.js/);
  assert.match(page, /\/xr\/engine\/nature-journey-engine\.js/);
  assert.match(page, /\/xr\/engine\/nature-browser\.js/);
  assert.match(page, /\/journey\/orca\/orca-journey\.js/);
  assert.doesNotMatch(page, /jaguar-|orca-lume-|orca-biscay-gold-|orca-founder-reset-|orca-composition-reset-|orca-focus-sheet-/);
});

test('Orca Human Gold 01 puts the animal before interface architecture', () => {
  assert.match(page, />Meet the orca\.</);
  assert.match(page, />MEET THE ORCA</);
  assert.match(composition, /lume-orca-v1\.png/);
  assert.match(composition, /humanQualityAuthority = 'founder-first'/);
  assert.match(composition, /AI-GENERATED SPECIES VISUALISATION · NOT EVIDENCE \/ NOT A PHOTOGRAPH/);
  assert.doesNotMatch(page, /BAY OF BISCAY ECOSYSTEM →/);
});

test('Human Gold composition supports intentional mobile and reduced-motion states', () => {
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /nature-chapter/);
  assert.match(css, /nature-subject__image/);
  assert.match(css, /nature-journey-hud/);
});