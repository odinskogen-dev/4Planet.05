import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const context = read('public/xr/engine/nature-journey-context-v16.js');
const contextCss = read('public/xr/engine/nature-journey-context-v16.css');
const premium = read('public/xr/engine/nature-journey-premium-v17.js');
const premiumCss = read('public/xr/engine/nature-journey-premium-v17.css');
const goldCss = read('public/xr/engine/nature-journey-gold-v18.css');
const browser = read('public/xr/engine/nature-browser.js');
const audio = read('public/xr/engine/nature-audio-v06.js');
const jaguarBoot = read('public/journey/jaguar/jaguar-journey.js');
const jaguarHtml = read('public/journey/jaguar/index.html');
const jaguarManifest = JSON.parse(read('public/xr/scenes/jaguar.json'));
const jaguarPremium = JSON.parse(read('public/journey/jaguar/premium-v17.json'));
const jaguarRoom = read('public/xr/engine/nature-jaguar-local-v26.js');
const jaguarMasterCss = read('public/xr/jaguar/jaguar-master-v26.css');
const orcaBoot = read('public/journey/orca/orca-journey.js');
const orcaHtml = read('public/journey/orca/index.html');
const orcaManifest = JSON.parse(read('public/xr/scenes/orca.json'));
const orcaPremium = JSON.parse(read('public/journey/orca/premium-v17.json'));
const orcaCss = read('public/xr/orca/orca-cinematic-v17.css');
const generator = read('scripts/build-xr-canonical-data.mjs');
const solutionsHtml = read('public/journey/solutions/index.html');
const solutionsJs = read('public/journey/solutions/solutions-intelligence-v1.js');

test('shared Journey context is species-agnostic and manifest-driven', () => {
  assert.doesNotMatch(context, /jaguar|orca|panthera|orcinus|gbif:5219426|gbif:2440483/i);
  assert.match(context, /manifest\.environment/);
  assert.match(context, /node\.relationClass \|\| node\.kind/);
  assert.match(context, /node\.truthState/);
  assert.match(context, /node\.boundary/);
  assert.match(context, /node\.source\?\.url/);
  assert.match(context, /\/atlas\?journey=/);
});

test('shared premium sensory renderer stays species-agnostic and config-driven', () => {
  assert.doesNotMatch(premium, /jaguar|orca|panthera|orcinus|gbif:5219426|gbif:2440483/i);
  assert.match(premium, /dataset\?\.premiumConfig|dataset\.premiumConfig/);
  assert.match(premium, /config\?\.scenes/);
  assert.match(premium, /scene\?\.hotspots/);
  assert.match(premium, /scene\?\.modules/);
  assert.match(premium, /scene\?\.actorRoles/);
  assert.match(premium, /4planet:nature-journey-scene/);
});

test('Jaguar and Orca both consume the same context, premium, Gold cleanup and audio engines', () => {
  assert.match(jaguarBoot, /NatureJourneyContext\?\.render\(\{ root, manifest \}\)/);
  assert.match(orcaBoot, /NatureJourneyContext\?\.render\(\{ root, manifest \}\)/);
  for (const html of [jaguarHtml, orcaHtml]) {
    assert.match(html, /nature-journey-context-v16\.css/);
    assert.match(html, /nature-journey-context-v16\.js/);
    assert.match(html, /nature-journey-premium-v17\.css/);
    assert.match(html, /nature-journey-premium-v17\.js/);
    assert.match(html, /nature-journey-gold-v18\.css/);
    assert.match(html, /nature-audio-v06\.js/);
    assert.match(html, /SOUND ON BY DEFAULT AFTER ENTRY/);
  }
  assert.match(browser, /TURN SOUND OFF/);
  assert.match(browser, /TURN SOUND ON/);
  assert.match(goldCss, /nature-nodes/);
  assert.match(goldCss, /nature-premium__audio[\s\S]{0,220}display:none!important/);
  assert.match(jaguarHtml, /data-premium-config="\/journey\/jaguar\/premium-v17\.json"/);
  assert.match(orcaHtml, /data-premium-config="\/journey\/orca\/premium-v17\.json"/);
  assert.match(orcaHtml, /data-audio-world="ocean"/);
  assert.match(audio, /dataset\.audioWorld/);
  assert.match(audio, /forest/);
  assert.match(audio, /ocean/);
  assert.match(audio, /AudioContext|webkitAudioContext/);
  assert.match(audio, /4planet:nature-browser-enter/);
  assert.match(audio, /ctx\.resume\(\)/);
  assert.match(audio, /dataset\.audioPlaying/);
  assert.match(audio, /PROFILES|WORLD_PROFILES/);
});

test('Jaguar master is one eight-frame end-to-end Gold Journey with truthful action boundaries', () => {
  assert.equal(jaguarManifest.nodes.length, 8);
  assert.deepEqual(jaguarManifest.nodes.map((node) => node.scene.state), ['identity','dependency','habitat','pressure','response','actors','action','proof']);
  assert.deepEqual(Object.keys(jaguarPremium.scenes).sort(), ['action','actors','dependency','habitat','identity','pressure','proof','response']);
  assert.match(jaguarHtml, /data-master-line="PR79"/);
  assert.match(jaguarHtml, /nature-jaguar-local-v26\.js/);
  assert.match(jaguarHtml, /jaguar-master-v26\.css/);
  assert.match(jaguarRoom, /jaguar-authored-jungle-room-v26/);
  assert.match(jaguarRoom, /InstancedMesh/);
  assert.match(jaguarRoom, /FogExp2/);
  assert.match(jaguarMasterCss, /repeat\(8,minmax\(0,1fr\)\)/);
  assert.ok(jaguarPremium.scenes.identity.hotspots.length >= 3);
  assert.ok(jaguarPremium.scenes.habitat.hotspots.length >= 4);
  assert.ok(jaguarPremium.scenes.pressure.hotspots.length >= 3);
  assert.ok(jaguarPremium.scenes.response.modules.length >= 3);
  assert.ok(jaguarPremium.scenes.response.actorRoles.length >= 3);
  assert.ok(jaguarPremium.scenes.actors.actorRoles.length >= 3);
  const response = JSON.stringify(jaguarPremium.scenes.response);
  const actors = JSON.stringify(jaguarPremium.scenes.actors);
  const action = JSON.stringify(jaguarPremium.scenes.action);
  const proof = JSON.stringify(jaguarPremium.scenes.proof);
  assert.match(response, /SOLUTION CLASS|NO DELIVERY CLAIM|review required/i);
  assert.match(actors, /NOT PARTNERSHIPS|No partnership|verify/i);
  assert.match(action, /NO VERIFIED UNIT ACTIVE|FAIL-CLOSED|not active/i);
  assert.match(proof, /Evidence precedes|EVIDENCE BEFORE OUTCOME|monitoring supports/i);
  assert.doesNotMatch(`${response}${actors}${action}${proof}`, /hectares protected|tons co2|solutions activated|communities supported/i);
  for (const state of ['identity','dependency','habitat','pressure','response','actors','action','proof']) {
    assert.match(audio, new RegExp(`${state}:\\s*\\{`), `audio profile missing for ${state}`);
  }
});

test('Orca transfer preserves canonical identity, rights-safe media and population-specific truth boundaries', () => {
  assert.equal(orcaManifest.entity.id, 'taxon:gbif:2440483');
  assert.equal(orcaManifest.entity.gbifKey, 2440483);
  assert.match(orcaManifest.subject.mediaSrc, /orca\/illustration\.jpg/);
  assert.match(orcaManifest.subject.boundaryLabel, /ILLUSTRATION · NOT A PHOTOGRAPH/);
  assert.doesNotMatch(JSON.stringify(orcaManifest), /\/assets\/species\/orca\/hero\.jpg/);
  assert.deepEqual(orcaManifest.nodes.map((node) => node.scene.state), ['identity','dependency','habitat','pressure','response']);
  assert.ok(orcaManifest.nodes.every((node) => node.canonicalBinding));
  assert.match(orcaManifest.nodes[1].canonicalBinding, /living\.DEPENDS ON\.0/);
  assert.match(orcaManifest.nodes[3].canonicalBinding, /living\.UNDER PRESSURE\.1/);
  assert.match(orcaManifest.nodes[4].canonicalBinding, /living\.RESPONSE\.0/);
  const copy = JSON.stringify(orcaPremium);
  assert.match(copy, /POPULATION-SPECIFIC|population-specific/i);
  assert.match(copy, /NO UNIVERSAL FIX|No single intervention/i);
  assert.match(copy, /not partnerships|not a photograph/i);
});

test('canonical generator now emits both Gold-reference feeds without weakening Jaguar relationship requirements', () => {
  assert.match(generator, /slug: "jaguar"/);
  assert.match(generator, /slug: "orca"/);
  assert.match(generator, /taxon:gbif:5219426/);
  assert.match(generator, /taxon:gbif:2440483/);
  assert.match(generator, /jaguar-canonical\.json/);
  assert.match(generator, /orca-canonical\.json/);
  assert.match(generator, /requireSpeciesRelationships: true/);
});

test('Solutions Intelligence is a derived response surface, not a second actor or impact truth store', () => {
  assert.match(solutionsHtml, /SOLUTIONS INTELLIGENCE/);
  assert.match(solutionsHtml, /NOT A PARTNER|NOT A PHOTOGRAPH|SPECIFIC ACTORS REQUIRE VERIFICATION|SELECTED, FUNDED, CONTRACTED OR DELIVERED/i);
  assert.match(solutionsJs, /ALLOWED/);
  assert.match(solutionsJs, /premium-v17\.json/);
  assert.match(solutionsJs, /config\?\.scenes\?\.response/);
  assert.match(solutionsJs, /ROLE CATEGORY · NOT A PARTNER, ENDORSEMENT OR DELIVERY CLAIM/);
  assert.doesNotMatch(solutionsJs, /hectares protected|tons co2|partnered with|verified impact/i);
});

test('transfer keeps bespoke craft in skins/config while shared scientific and interaction machinery remains common', () => {
  assert.match(orcaCss, /ocean-specific visual craft/i);
  assert.doesNotMatch(premium, /Orcinus|Panthera|killer whale|capybara/i);
  assert.doesNotMatch(context, /Orcinus|Panthera|killer whale|capybara/i);
  assert.doesNotMatch(audio, /Orcinus|Panthera|killer whale|jaguar roar/i);
  assert.match(orcaBoot, /\/xr\/scenes\/orca\.json/);
  assert.match(orcaBoot, /\/xr\/generated\/orca-canonical\.json/);
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
  assert.match(goldCss, /@media\(max-width:760px\)/);
  assert.match(goldCss, /safe-area-inset/);
  assert.match(orcaCss, /@media\(max-width:760px\)/);
  assert.match(orcaCss, /@media\(prefers-reduced-motion:reduce\)/);
});
