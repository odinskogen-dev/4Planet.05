import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const orcaHtml = readFileSync('public/journey/orca/index.html', 'utf8');
const ecosystemHtml = readFileSync('public/ecosystem/bay-of-biscay/index.html', 'utf8');
const js = readFileSync('public/xr/orca/orca-biscay-gold-20.js', 'utf8');
const css = readFileSync('public/xr/orca/orca-biscay-gold-20.css', 'utf8');
const wbs = readFileSync('docs/orca/ORCA_BAY_OF_BISCAY_GOLD_WBS.md', 'utf8');

test('Bay of Biscay is a first-class ecosystem route linked from Orca without duplicating the Journey engine', () => {
  assert.match(orcaHtml, /\/ecosystem\/bay-of-biscay\//);
  assert.match(orcaHtml, /BAY OF BISCAY ECOSYSTEM/);
  assert.match(ecosystemHtml, /4PLANET ECOSYSTEM_/);
  assert.match(ecosystemHtml, /Bay of Biscay\./);
  assert.match(ecosystemHtml, /ENTER ORCA JOURNEY/);
  assert.doesNotMatch(ecosystemHtml, /nature-journey-engine\.js/);
  assert.doesNotMatch(js, /new maplibregl\.Map/);
});

test('pilot corridor is never presented as an Orca migration track', () => {
  assert.match(ecosystemHtml, /PILOT CORRIDOR ≠ MIGRATION TRACK/);
  assert.match(ecosystemHtml, /does not represent the movement path of any whale or dolphin/i);
  assert.match(js, /PILOT CORRIDOR ≠ ORCA MIGRATION TRACK/);
  assert.match(js, /EXACT SURVEY ROUTE TO VERIFY/);
  assert.match(wbs, /No implication that the corridor is an Orca migration route/);
  assert.doesNotMatch(js, /live migration/i);
});

test('Bay of Biscay has a direct TEST KING product boundary and Orca keeps its existing deep-link donor', () => {
  assert.match(orcaHtml, /href="\/ecosystem\/bay-of-biscay\/"/);
  assert.match(ecosystemHtml, /href="\/journey\/orca\/"/);
  assert.match(js, /#bay-of-biscay/);
  assert.match(js, /openDirectBiscay/);
  assert.match(js, /scrollIntoView/);
  assert.match(js, /direct: true/);
});

test('standalone ecosystem card carries corridor, effort, cetacean context, pressure, monitoring and action seams', () => {
  for (const marker of [
    'England',
    'Bay of Biscay',
    'Spain',
    'SURVEY EFFORT',
    'CETACEAN CONTEXT',
    'PRESSURE',
    'MONITORING LOGIC',
    'SOURCE SEAMS',
    'ACTION HANDOFF',
    'Fund monitoring. Report what was delivered'
  ]) assert.match(ecosystemHtml, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

  // Contract the semantics, not one frozen sentence order: the standalone
  // ecosystem must expose route geometry, hours and distance as the three
  // survey-effort dimensions while keeping them separate from sightings.
  assert.match(ecosystemHtml, /route geometry/i);
  assert.match(ecosystemHtml, /hours/i);
  assert.match(ecosystemHtml, /distance/i);
  assert.match(ecosystemHtml, /Sightings provide biological observations; they are not a success metric by themselves/i);
  assert.match(ecosystemHtml, /Delivery evidence must remain separate from ecological outcome claims/i);
});

test('existing Orca Bay donor still carries geography, habitat, species and source seams', () => {
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

test('ecosystem experience and embedded donor support mobile and reduced-motion states', () => {
  assert.match(ecosystemHtml, /@media\(max-width:760px\)/);
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test('WBS explicitly pairs Bay of Biscay and Amazonia for cross-learning', () => {
  assert.match(wbs, /one ocean, one land/i);
  assert.match(wbs, /Every Amazonia improvement must be evaluated for transfer back to Bay of Biscay/);
});