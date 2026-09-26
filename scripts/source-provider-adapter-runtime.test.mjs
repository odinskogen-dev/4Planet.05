import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/data/providers/gbifTaxonAdapter.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const runtime = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const { fetchGbifTaxonSnapshot, normalizeGbifTaxon, fingerprintGbifTaxon } = runtime;

const okResponse = (payload) => ({
  ok: true,
  status: 200,
  json: async () => payload,
});

const coral = {
  key: 5184657,
  scientificName: 'Acropora palmata (Lamarck, 1816)',
  canonicalName: 'Acropora palmata',
  rank: 'SPECIES',
  taxonomicStatus: 'ACCEPTED',
  familyKey: 7689,
  genusKey: 2252180,
  speciesKey: 5184657,
};

test('GBIF adapter fetches JSON from the official Species API locator and returns a verified semantic snapshot', async () => {
  let requestedUrl = '';
  const result = await fetchGbifTaxonSnapshot(5184657, '2026-08-28T09:00:00Z', {
    fetcher: async (url) => {
      requestedUrl = String(url);
      return okResponse(coral);
    },
  });
  assert.equal(requestedUrl, 'https://api.gbif.org/v1/species/5184657');
  assert.equal(result.provider, 'GBIF Species API v1');
  assert.equal(result.snapshot.available, true);
  assert.equal(result.snapshot.verification, 'VERIFIED');
  assert.equal(result.snapshot.providerId, 'GBIF:species:5184657');
  assert.match(result.snapshot.fingerprint, /^GBIF:species-semantic-v1:/);
});

test('irrelevant provider payload fields do not change the semantic fingerprint', () => {
  const a = normalizeGbifTaxon({ ...coral, irrelevantUiField: 'A' });
  const b = normalizeGbifTaxon({ ...coral, irrelevantUiField: 'B', anotherUnusedField: 123 });
  assert.equal(fingerprintGbifTaxon(a), fingerprintGbifTaxon(b));
});

test('scientific-name mismatch is surfaced as a conflict, not silently accepted', async () => {
  const result = await fetchGbifTaxonSnapshot(5184657, '2026-08-28T09:00:00Z', {
    expectedScientificName: 'Panthera onca',
    fetcher: async () => okResponse(coral),
  });
  assert.equal(result.snapshot.available, true);
  assert.equal(result.snapshot.verification, 'REVIEW_REQUIRED');
  assert.match(result.snapshot.conflict, /Expected Panthera onca/);
});

test('HTTP rate limit or upstream failure becomes UNAVAILABLE input instead of fabricated data', async () => {
  const result = await fetchGbifTaxonSnapshot(5184657, '2026-08-28T09:00:00Z', {
    fetcher: async () => ({ ok: false, status: 429, json: async () => ({}) }),
  });
  assert.equal(result.snapshot.available, false);
  assert.equal(result.snapshot.verification, 'REVIEW_REQUIRED');
  assert.match(result.error, /HTTP 429/);
});

test('malformed provider payload becomes unavailable and cannot masquerade as a verified taxon', async () => {
  const result = await fetchGbifTaxonSnapshot(5184657, '2026-08-28T09:00:00Z', {
    fetcher: async () => okResponse({ key: 5184657 }),
  });
  assert.equal(result.snapshot.available, false);
  assert.equal(result.snapshot.verification, 'REVIEW_REQUIRED');
  assert.match(result.error, /Malformed GBIF taxon payload/);
});

test('network timeout/rejection becomes unavailable and preserves the error for audit', async () => {
  const result = await fetchGbifTaxonSnapshot(5184657, '2026-08-28T09:00:00Z', {
    fetcher: async () => { throw new Error('timeout'); },
  });
  assert.equal(result.snapshot.available, false);
  assert.equal(result.error, 'timeout');
});
