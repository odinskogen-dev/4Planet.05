import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('src/pages/v5/PitchHub.tsx');
const router = read('src/routes/router.tsx');
const css = read('src/styles/pitch-hub.css');

test('private Proof Hub is routed once and remains noindex', () => {
  assert.match(router, /path="\/present"/);
  assert.match(router, /path="\/pitch" element={<Navigate to="\/present" replace \/>}/);
  assert.match(page, /robots="noindex,follow"/);
  assert.match(page, /PRIVATE PROOF/);
});

test('Proof Hub links the leading Orca proof to the actual Human Gold journey', () => {
  assert.match(page, /href: "\/journey\/orca\/"/);
  assert.match(page, /state: "HUMAN GOLD CANDIDATE"/);
  assert.doesNotMatch(page, /state: "AVAILABLE"/);
});

test('Proof Hub preserves maturity and truth boundaries instead of pitch inflation', () => {
  assert.match(page, /IN DEVELOPMENT/);
  assert.match(page, /DELIVERY GATED/);
  assert.match(page, /contribution, delivery, evidence and ecological outcome as separate states/i);
  assert.match(page, /without turning a profile into a partnership/i);
});

test('Proof Hub keeps all five audience paths and the shared intelligence loop', () => {
  for (const audience of ['capital', 'field', 'science', 'companies', 'collaborators']) assert.match(page, new RegExp(`${audience}:`));
  for (const step of ['SEE', 'UNDERSTAND', 'CHOOSE', 'ACT', 'PROVE', 'LEARN']) assert.match(page, new RegExp(`key: "${step}"`));
});

test('Proof Hub has explicit mobile and reduced-motion treatment', () => {
  assert.match(css, /@media\(max-width:820px\)/);
  assert.match(css, /@media\(max-width:520px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /focus-visible/);
});
