import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/data/providers/gbifTaxonAdapter.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const runtime = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const checkedAt = new Date().toISOString();
const result = await runtime.fetchGbifTaxonSnapshot(5184657, checkedAt, {
  signal: AbortSignal.timeout(15000),
});

if (!result.snapshot.available) {
  console.error(JSON.stringify({
    proof: 'LIVE_GBIF_SOURCE_CHECK',
    checkedAt,
    provider: result.provider,
    providerId: result.providerId,
    status: 'UNAVAILABLE',
    error: result.error ?? 'Provider unavailable',
  }));
  process.exit(2);
}

assert.equal(result.provider, 'GBIF Species API v1');
assert.equal(result.providerId, 'GBIF:species:5184657');
assert.equal(result.normalized?.key, 5184657);
assert.equal(result.snapshot.verification, 'VERIFIED');
assert.equal(result.snapshot.available, true);
assert.match(result.snapshot.fingerprint, /^GBIF:species-semantic-v1:/);

const scientificName = result.normalized?.scientificName ?? '';
const canonicalName = result.normalized?.canonicalName ?? '';
assert.ok(
  scientificName.toLowerCase().includes('acropora palmata') || canonicalName.toLowerCase() === 'acropora palmata',
  `Unexpected GBIF identity: ${scientificName || canonicalName || 'missing'}`,
);

console.log(JSON.stringify({
  proof: 'LIVE_GBIF_SOURCE_CHECK',
  checkedAt,
  provider: result.provider,
  providerId: result.providerId,
  canonicalLocator: result.canonicalLocator,
  key: result.normalized?.key,
  scientificName,
  canonicalName,
  taxonomicStatus: result.normalized?.taxonomicStatus ?? null,
  fingerprint: result.snapshot.fingerprint,
  verification: result.snapshot.verification,
  available: result.snapshot.available,
  truthBoundary: 'Provider identity verified; no factual claim is auto-updated by this live check.',
}, null, 2));
