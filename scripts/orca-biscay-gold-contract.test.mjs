import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('public/journey/orca/index.html', 'utf8');
const js = readFileSync('public/xr/orca/orca-biscay-gold-20.js', 'utf8');
const css = readFileSync('public/xr/orca/orca-biscay-gold-20.css', 'utf8');
const wbs = readFileSync('docs/orca/ORCA_BAY_OF_BISCAY_GOLD_WBS.md', 'utf8');

test('Bay of Biscay Gold stays inside existing Orca Journey', () => {
  assert.match(html, /orca-biscay-gold-20\.css/);
  assert.match(html, /orca-biscay-gold-20\.js/);
  assert.match(html, /ORCA LUME 19 · BAY OF BISCAY GOLD 20/);
  assert.doesNotMatch(js, /new maplibregl\.Map/);
});

test('pilot corridor is never presented as an Orca migration track', () => {
  assert.match(js, /PILOT CORRIDOR ≠ ORCA MIGRATION TRACK/);
  assert.match(js, /EXACT SURVEY ROUTE TO VERIFY/);
  assert.match(wbs, /No implication that the corridor is an Orca migration route/);
  assert.doesNotMatch(js, /live migration/i);
});

test('Bay of Biscay has a direct TEST KING deep link without creating a second product route', () => {
  assert.match(js, /#bay-of-biscay/);
  assert.match(js, /openDirectBiscay/);
  assert.match(js, /scrollIntoView/);
  assert.match(js, /direct: true/);
  assert.doesNotMatch(html, /\/bay-of-biscay\/index\.html/);
});

test('ecosystem card carries geography, habitat, species and source seams', () => {
  for (const marker of [
    'Bay of Biscay',
    'ENGLAND → BAY OF BISCAY → SPAIN',
    'CONTINENTAL SHELF',
    'SHELF EDGE / SLOPE',
    'DEEP OCEAN',
    'Orcinus orca',
    'Delphinus delphis',
    'Globicephala melas',
    'Balaenoptera physalus',
    'Ziphius cavirostris',
    'OSPAR REGION IV',
    'ICES JCDP'
  ]) assert.match(js, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('ecosystem card supports mobile and reduced-motion states', () => {
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test('WBS explicitly pairs Bay of Biscay and Amazonia for cross-learning', () => {
  assert.match(wbs, /one ocean, one land/i);
  assert.match(wbs, /Every Amazonia improvement must be evaluated for transfer back to Bay of Biscay/);
});
