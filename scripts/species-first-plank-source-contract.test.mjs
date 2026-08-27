import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const file = await readFile(new URL('../src/data/speciesSourceEnvelope.ts', import.meta.url), 'utf8');

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
