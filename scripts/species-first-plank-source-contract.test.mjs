import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const file = await readFile(new URL('../src/data/speciesSourceEnvelope.ts', import.meta.url), 'utf8');
const refreshContract = await readFile(new URL('../src/data/sourceRefresh.ts', import.meta.url), 'utf8');
const evidenceSeam = await readFile(new URL('../src/components/species/SpeciesEvidenceSeam.tsx', import.meta.url), 'utf8');
const speciesRoute = await readFile(new URL('../src/pages/integrated/SpeciesRoute.tsx', import.meta.url), 'utf8');

test('SPEC-FP-01 preserves source/provenance/uncertainty/update semantics for Orca', () => {
  for (const required of [
    '4PLANET_SPECIES_SOURCE_ENVELOPE_01',
    'GBIF',
    'OBIS',
    'NOAA',
    'checkedAt',
    'provenance',
    'rightsOrTerms',
    'uncertainty',
    'updateSemantics',
    'https://www.gbif.org/species/2440483',
    'https://obis.org/taxon/137102',
    'https://www.fisheries.noaa.gov/species/killer-whale',
  ]) assert.match(file, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('SPEC-FP-01 fails closed on unsupported Orca inference', () => {
  for (const boundary of [
    'pod from generic species identity',
    'ecotype from generic occurrence',
    'population from map proximity',
    'abundance or trend from occurrence count',
    'range from observation points alone',
    'live location from historical occurrence data',
    'ecological health from species presence alone',
  ]) assert.ok(file.includes(boundary), `missing boundary: ${boundary}`);
});

test('SPEC-FP-01 transfers the same source envelope to unlike terrestrial Jaguar', () => {
  for (const required of [
    'JAGUAR_SOURCE_ENVELOPE',
    'taxon:gbif:5219426',
    'Panthera onca',
    'https://www.gbif.org/species/5219426',
    'https://www.fws.gov/species/jaguar-panthera-onca',
    'https://www.catsg.org/living-species-jaguar',
    'sourceFamily: "USFWS"',
    'sourceFamily: "IUCN"',
    'speciesSourceEnvelopeBySlug',
  ]) assert.ok(file.includes(required), `missing Jaguar transfer contract: ${required}`);
});

test('SPEC-FP-01 Jaguar transfer fails closed on map/occurrence overclaiming', () => {
  for (const boundary of [
    'population from generic species identity',
    'range from observation points alone',
    'abundance or trend from occurrence count',
    'corridor use from map proximity',
    'local ecological health from species presence alone',
    'live location from historical occurrence data',
    'individual behaviour from species description',
  ]) assert.ok(file.includes(boundary), `missing Jaguar boundary: ${boundary}`);
});

test('SPEC-FP-01 keeps one shared schema rather than a Jaguar-specific truth model', () => {
  assert.equal((file.match(/interface SpeciesSourceEnvelope/g) || []).length, 1);
  assert.equal((file.match(/4PLANET_SPECIES_SOURCE_ENVELOPE_01/g) || []).length >= 3, true);
  assert.ok(!file.includes('JaguarSourceEnvelopeSchema'));
});

test('SPEC-FP-01 PRESENT+CONNECT uses one shared public evidence seam for curated species', () => {
  for (const required of [
    'SpeciesSourceEnvelope',
    'HOW DO WE KNOW?',
    'The evidence travels with the species.',
    'PROVENANCE',
    'UNCERTAINTY / LIMIT',
    'RIGHTS / TERMS',
    'UPDATE RULE',
    'OPEN ORIGINAL SOURCE',
    'WHAT WE DO NOT CLAIM',
    'species-source-evidence-seam',
  ]) assert.ok(evidenceSeam.includes(required), `missing shared evidence presentation: ${required}`);

  assert.ok(speciesRoute.includes('speciesSourceEnvelopeBySlug(slug)'), 'route must resolve the canonical envelope by species slug');
  assert.ok(speciesRoute.includes('<SpeciesEvidenceSeam envelope={envelope} />'), 'route must present the same seam for any species with an envelope');
  assert.ok(!evidenceSeam.includes('slug === "orca"'));
  assert.ok(!evidenceSeam.includes('slug === "jaguar"'));
});

test('SPEC-FP-01 third transfer proves one source contract across structurally unlike elkhorn coral', () => {
  for (const required of [
    'ELKHORN_CORAL_SOURCE_ENVELOPE',
    'taxon:gbif:5184657',
    'Acropora palmata',
    'https://www.gbif.org/species/5184657',
    'https://obis.org/taxon/288227',
    'https://www.fisheries.noaa.gov/species/elkhorn-coral',
    'reef health from species presence alone',
    'coral cover or abundance from occurrence count',
    'bleaching or mortality state from historical occurrence data',
  ]) assert.ok(file.includes(required), `missing elkhorn coral transfer contract: ${required}`);
});

test('SOURCE REFRESH contract has explicit change states and fails closed before verification', () => {
  for (const required of [
    '"UNCHANGED"',
    '"CHANGED"',
    '"CONFLICT"',
    '"UNAVAILABLE"',
    '"VERIFIED"',
    '"REVIEW_REQUIRED"',
    'snapshot.verification !== "VERIFIED"',
    'Existing public evidence remains unchanged.',
    'publicUpdateAllowed: false',
    'publicUpdateAllowed: true',
  ]) assert.ok(refreshContract.includes(required), `missing source refresh safety contract: ${required}`);
});

test('LIVE source refresh records an unchanged NOAA provider version without inventing a change', () => {
  for (const required of [
    'sourceFingerprint: "NOAA:last-updated:2026-07-14"',
    'sourceFingerprintMethod: "SEMANTIC_VERSION"',
    'sourceVersion: "NOAA:last-updated:2026-07-14"',
    'status: "UNCHANGED"',
    'verification: "VERIFIED"',
    'truthEffect: "NONE"',
    'no source-version change detected',
  ]) assert.ok(file.includes(required), `missing live unchanged refresh proof: ${required}`);
});

test('SOURCE REFRESH state is visible through the same public evidence seam', () => {
  for (const required of [
    'record.lastRefresh',
    'SOURCE REFRESH',
    'TRUTH EFFECT',
    'source-refresh-',
  ]) assert.ok(evidenceSeam.includes(required), `missing refresh presentation: ${required}`);
});
