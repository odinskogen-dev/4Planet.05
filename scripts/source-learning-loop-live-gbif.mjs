import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/data/providers/gbifTaxonAdapter.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const runtime = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const cases = [
  { key: 2440483, name: 'Orcinus orca' },
  { key: 5219426, name: 'Panthera onca' },
  { key: 5184657, name: 'Acropora palmata' },
];

const checkedAt = new Date().toISOString();
const proofs = [];

for (const item of cases) {
  const result = await runtime.fetchGbifTaxonSnapshot(item.key, checkedAt, {
    signal: AbortSignal.timeout(15000),
  });

  if (!result.snapshot.available) {
    console.error(JSON.stringify({
      proof: 'LIVE_GBIF_SOURCE_CHECK',
      checkedAt,
      provider: result.provider,
      providerId: result.providerId,
      key: item.key,
      expectedName: item.name,
      status: 'UNAVAILABLE',
      error: result.error ?? 'Provider unavailable',
    }));
    process.exit(2);
  }

  assert.equal(result.provider, 'GBIF Species API v1');
  assert.equal(result.providerId, `GBIF:species:${item.key}`);
  assert.equal(result.normalized?.key, item.key);
  assert.equal(result.snapshot.verification, 'VERIFIED');
  assert.equal(result.snapshot.available, true);
  assert.match(result.snapshot.fingerprint, /^GBIF:species-semantic-v1:/);

  const scientificName = result.normalized?.scientificName ?? '';
  const canonicalName = result.normalized?.canonicalName ?? '';
  const expectedName = item.name.toLowerCase();
  assert.ok(
    scientificName.toLowerCase().includes(expectedName) || canonicalName.toLowerCase() === expectedName,
    `Unexpected GBIF identity for ${item.key}: ${scientificName || canonicalName || 'missing'}`,
  );

  proofs.push({
    key: result.normalized?.key,
    expectedName: item.name,
    scientificName,
    canonicalName,
    taxonomicStatus: result.normalized?.taxonomicStatus ?? null,
    providerId: result.providerId,
    canonicalLocator: result.canonicalLocator,
    fingerprint: result.snapshot.fingerprint,
    verification: result.snapshot.verification,
    available: result.snapshot.available,
  });
}

assert.equal(proofs.length, cases.length);
assert.equal(new Set(proofs.map((proof) => proof.providerId)).size, cases.length);
assert.equal(new Set(proofs.map((proof) => proof.fingerprint)).size, cases.length);

console.log(JSON.stringify({
  proof: 'LIVE_GBIF_SPECIES_TRANSFER_SOURCE_CHECK',
  checkedAt,
  provider: 'GBIF Species API v1',
  cases: proofs,
  coverage: `${proofs.length}/${cases.length}`,
  truthBoundary: 'Provider identity and source fingerprint verified for each bounded transfer case; no factual claim is auto-updated by this live check.',
}, null, 2));
