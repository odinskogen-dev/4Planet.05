import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const context = read('public/xr/engine/nature-journey-context-v16.js');
const css = read('public/xr/engine/nature-journey-context-v16.css');
const jaguarBoot = read('public/journey/jaguar/jaguar-journey.js');
const jaguarHtml = read('public/journey/jaguar/index.html');

test('shared Journey context is species-agnostic and manifest-driven', () => {
  assert.doesNotMatch(context, /jaguar|orca|panthera|gbif:5219426/i);
  assert.match(context, /manifest\.environment/);
  assert.match(context, /node\.relationClass \|\| node\.kind/);
  assert.match(context, /node\.truthState/);
  assert.match(context, /node\.boundary/);
  assert.match(context, /node\.source\?\.url/);
  assert.match(context, /\/atlas\?journey=/);
});

test('Jaguar consumes the shared context layer rather than bespoke context code', () => {
  assert.match(jaguarBoot, /NatureJourneyContext\?\.render\(\{ root, manifest \}\)/);
  assert.match(jaguarHtml, /nature-journey-context-v16\.css/);
  assert.match(jaguarHtml, /nature-journey-context-v16\.js/);
});

test('context layer preserves accessibility, mobile and reduced-motion controls', () => {
  assert.match(context, /aria-label', 'Journey context and evidence'/);
  assert.match(css, /@media\(max-width:820px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /safe-area-inset/);
});