import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const router = read('src/routes/router.tsx');
const shell = read('src/components/layout/PublicShell.tsx');
const front = read('src/pages/phase04/FrontDoor.tsx');
const fjord = read('src/pages/phase04/OslofjordenJourney.tsx');
const fjordIdentity = read('src/phase04/oslofjorden.ts');
const fjordProof = read('src/data/oslofjordenProof.ts');
const fjordSpatial = read('src/data/oslofjordenSpatial.ts');
const spatialLife = read('src/components/place/OslofjordSpatialLifeEvidence.tsx');
const placeModel = read('src/planet/placeModel.ts');
const living = read('src/pages/v5/LivingSystems.tsx');
const missions = read('src/pages/phase04/MissionUniverse.tsx');
const proof = read('src/components/phase04/ProvenanceBar.tsx');
const signal = read('src/components/phase04/SignalCard.tsx');

test('root converges to Phase 04 living-place front door without removing product routes', () => {
  assert.match(router, /path="\/" element={<Phase04FrontDoor/);
  for (const route of ['/atlas', '/species', '/impact', '/living-systems']) assert.ok(router.includes(`path="${route}"`), route);
  assert.match(front, /What is<br \/>happening<br \/>here\?/);
  for (const job of ['ATLAS', 'SPECIES', 'LIVING SYSTEMS', 'IMPACT']) assert.ok(front.includes(`"${job}"`), job);
});

test('Oslofjorden separates semantic identity from display, biodiversity-query, scientific, waterbody and regulatory geometry', () => {
  assert.match(router, /path="\/place\/oslofjorden"/);
  assert.match(fjordIdentity + fjordProof + fjordSpatial, /MRGID 3379/);
  for (const role of ['SEMANTIC_IDENTITY', 'DISPLAY', 'BIODIVERSITY_QUERY', 'SCIENTIFIC_AREA', 'WATERBODY_STATUS', 'REGULATORY', 'ADMINISTRATIVE']) assert.ok(placeModel.includes(`"${role}"`), role);
  assert.match(fjordSpatial, /id: "oslofjord-display"[\s\S]*availability: "NOT_SELECTED"/);
  assert.match(fjordSpatial, /role: "BIODIVERSITY_QUERY"[\s\S]*availability: "RUNTIME_SOURCE"/);
  assert.match(fjordSpatial, /role: "WATERBODY_STATUS"[\s\S]*availability: "RUNTIME_SOURCE"/);
  assert.match(fjordSpatial, /id: "oslofjord-regulatory-fisheries"[\s\S]*availability: "SOURCE_AVAILABLE_NOT_INGESTED"/);
  assert.match(fjord, /does not turn that polygon into a universal fjord outline/i);
  assert.match(spatialLife, /Registration ≠ current position/);
  assert.match(spatialLife, /Loaded count ≠ abundance/);
  assert.doesNotMatch(fjordSpatial, /role: "DISPLAY"[\s\S]{0,300}availability: "INGESTED"/);
});

test('Relationship Reveal and Living Systems remain one shared engine, not a fifth app', () => {
  for (const mode of ['THREAD', 'ORBIT', 'CONSTELLATION']) assert.ok(read('src/components/phase04/RelationshipReveal.tsx').includes(`"${mode}"`), mode);
  assert.match(living, /not a fifth app/i);
  assert.match(living, /SOURCE REVIEW PENDING/);
});

test('Proof grammar keeps partner report separate from verification', () => {
  assert.match(proof, /PARTNER REPORT/);
  assert.match(proof, /not independent verification/i);
  for (const field of ['STATE', 'ACTOR', 'TIME', 'LIMIT']) assert.ok(proof.includes(`"${field}"`), field);
});

test('Signal presentation contains required semantic fields', () => {
  for (const field of ['dataState', 'when', 'confidence', 'where', 'what', 'source', 'relationship', 'followNext']) assert.ok(signal.includes(`signal.${field}`), field);
});

test('three deep mission worlds retain plain descriptors and 4PLANET endorsement', () => {
  for (const route of ['am4zonia', 'wh4les', 'clim4te']) assert.match(router, new RegExp(`missions\\/${route}`));
  for (const label of ['Amazon Rainforest Mission', 'Whale Protection Mission', 'Climate Mission']) assert.ok(missions.includes(label), label);
  assert.match(missions, /A 4PLANET mission/);
});

test('visible shell uses canonical locked 4x4 names rather than legacy Phase 02 names', () => {
  const required = ['CLE4N_', 'WH4LES_', 'COR4L_', 'RE:WILD_ MARINE', 'CLIM4TE_', 'AM4ZONIA_', 'SPECIES_', 'RE:WILD_ LAND', 'FOOD_', 'EN4RGY_', 'CIRCULAR CITY_', 'F4SHION_', 'M4GAZINE_', '4FILM_', '4RT_', '4PLAY_'];
  for (const label of required) assert.ok(shell.includes(label), label);
  for (const legacy of ['PL4STIC_', 'EN3RGY_', '4NTARCTICA_', '4TELIER_']) assert.ok(!shell.includes(legacy), legacy);
});
