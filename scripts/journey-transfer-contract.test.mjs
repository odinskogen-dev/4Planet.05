import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const context = read('public/xr/engine/nature-journey-context-v16.js');
const contextCss = read('public/xr/engine/nature-journey-context-v16.css');
const premium = read('public/xr/engine/nature-journey-premium-v17.js');
const premiumCss = read('public/xr/engine/nature-journey-premium-v17.css');
const jaguarBoot = read('public/journey/jaguar/jaguar-journey.js');
const jaguarHtml = read('public/journey/jaguar/index.html');
const jaguarPremium = JSON.parse(read('public/journey/jaguar/premium-v17.json'));

test('shared Journey context is species-agnostic and manifest-driven', () => {
  assert.doesNotMatch(context, /jaguar|orca|panthera|gbif:5219426/i);
  assert.match(context, /manifest\.environment/);
  assert.match(context, /node\.relationClass \|\| node\.kind/);
  assert.match(context, /node\.truthState/);
  assert.match(context, /node\.boundary/);
  assert.match(context, /node\.source\?\.url/);
  assert.match(context, /\/atlas\?journey=/);
});

test('shared premium sensory renderer stays species-agnostic and config-driven', () => {
  assert.doesNotMatch(premium, /jaguar|orca|panthera|orcinus|gbif:5219426|gbif:2440483/i);
  assert.match(premium, /data-premium-config/);
  assert.match(premium, /config\?\.scenes/);
  assert.match(premium, /scene\?\.hotspots/);
  assert.match(premium, /scene\?\.modules/);
  assert.match(premium, /scene\?\.actorRoles/);
  assert.match(premium, /4planet:nature-journey-scene/);
});

test('Jaguar consumes shared context and premium sensory layers rather than duplicating engines', () => {
  assert.match(jaguarBoot, /NatureJourneyContext\?\.render\(\{ root, manifest \}\)/);
  assert.match(jaguarHtml, /nature-journey-context-v16\.css/);
  assert.match(jaguarHtml, /nature-journey-context-v16\.js/);
  assert.match(jaguarHtml, /nature-journey-premium-v17\.css/);
  assert.match(jaguarHtml, /nature-journey-premium-v17\.js/);
  assert.match(jaguarHtml, /data-premium-config="\/journey\/jaguar\/premium-v17\.json"/);
});

test('Jaguar premium configuration covers the complete five-frame journey and truthful response machinery', () => {
  assert.deepEqual(Object.keys(jaguarPremium.scenes).sort(), ['dependency','habitat','identity','pressure','response']);
  assert.ok(jaguarPremium.scenes.identity.hotspots.length >= 3);
  assert.ok(jaguarPremium.scenes.habitat.hotspots.length >= 4);
  assert.ok(jaguarPremium.scenes.pressure.hotspots.length >= 3);
  assert.ok(jaguarPremium.scenes.response.modules.length >= 3);
  assert.ok(jaguarPremium.scenes.response.actorRoles.length >= 3);
  const response = JSON.stringify(jaguarPremium.scenes.response);
  assert.match(response, /NOT PARTNERSHIPS|No partnership|NO DELIVERY CLAIM|no impact claim/i);
  assert.doesNotMatch(response, /hectares protected|tons co2|solutions activated|communities supported/i);
});

test('shared Journey visual layers preserve accessibility, mobile and reduced-motion controls', () => {
  assert.match(context, /aria-label', 'Journey context and evidence'/);
  assert.match(contextCss, /@media\(max-width:820px\)/);
  assert.match(contextCss, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(contextCss, /safe-area-inset/);
  assert.match(premium, /aria-label/);
  assert.match(premiumCss, /@media\(max-width:760px\)/);
  assert.match(premiumCss, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(premiumCss, /safe-area-inset/);
});
