import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/data/sourceRefresh.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const runtime = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const { evaluateSourceRefresh, propagateVerifiedSourceMetadata } = runtime;

const baseRecord = () => ({
  id: 'source-1',
  checkedAt: '2026-08-28T06:00:00Z',
  providerId: 'GBIF:species:5184657',
  sourceFingerprint: 'fp-old',
  sourceFingerprintMethod: 'SEMANTIC_VERSION',
  sourceVersion: 'v1',
});

const context = {
  provider: 'GBIF Species API v1',
  providerId: 'GBIF:species:5184657',
  canonicalLocator: 'https://api.gbif.org/v1/species/5184657',
  canonicalObjectIds: ['taxon:gbif:5184657'],
  affectedClaimIds: ['claim:taxonomy:accepted-name'],
};

const snapshot = (overrides = {}) => ({
  checkedAt: '2026-08-28T07:00:00Z',
  fingerprint: 'fp-new',
  fingerprintMethod: 'SEMANTIC_VERSION',
  sourceVersion: 'v2',
  verification: 'REVIEW_REQUIRED',
  available: true,
  providerId: 'GBIF:species:5184657',
  changeScope: 'METADATA_ONLY',
  changedFields: ['sourceVersion'],
  ...overrides,
});

test('UNCHANGED records a new audit event without changing claims', () => {
  const result = evaluateSourceRefresh(baseRecord(), snapshot({
    fingerprint: 'fp-old',
    sourceVersion: 'v1',
    verification: 'VERIFIED',
    changedFields: [],
  }), context);
  assert.equal(result.audit.status, 'UNCHANGED');
  assert.equal(result.audit.truthEffect, 'NONE');
  assert.equal(result.publicUpdateAllowed, false);
  assert.equal(result.record.refreshHistory.length, 1);
});

test('CHANGED plus unverified is fail-closed and preserves current source state', () => {
  const result = evaluateSourceRefresh(baseRecord(), snapshot(), context);
  assert.equal(result.audit.status, 'CHANGED');
  assert.equal(result.audit.verification, 'REVIEW_REQUIRED');
  assert.equal(result.publicUpdateAllowed, false);
  assert.equal(result.record.sourceFingerprint, 'fp-old');
  assert.equal(result.record.sourceVersion, 'v1');
  assert.match(result.audit.actionNotTaken, /Did not update/);
});

test('review can reject a detected change while preserving append-only history', () => {
  const pending = evaluateSourceRefresh(baseRecord(), snapshot(), context);
  const rejected = evaluateSourceRefresh(pending.record, snapshot({ verification: 'REJECTED' }), context);
  assert.equal(rejected.audit.decision, 'REJECT');
  assert.equal(rejected.record.sourceFingerprint, 'fp-old');
  assert.equal(rejected.record.refreshHistory.length, 2);
  assert.equal(rejected.record.refreshHistory[0].verification, 'REVIEW_REQUIRED');
});

test('verified metadata-only change can update source metadata and preserves previous state', () => {
  const pending = evaluateSourceRefresh(baseRecord(), snapshot(), context);
  const accepted = evaluateSourceRefresh(pending.record, snapshot({
    checkedAt: '2026-08-28T08:00:00Z',
    verification: 'VERIFIED',
  }), context);
  assert.equal(accepted.publicUpdateAllowed, true);
  assert.equal(accepted.record.sourceFingerprint, 'fp-new');
  assert.equal(accepted.audit.previousFingerprint, 'fp-old');
  assert.equal(accepted.audit.previousSourceVersion, 'v1');
  assert.equal(accepted.record.refreshHistory.length, 2);
});

test('verified rights or licence metadata drift is review-gated and cannot propagate', () => {
  for (const changedField of ['rightsOrTerms', 'license', 'licence', 'attribution', 'copyright', 'usageRights']) {
    const result = evaluateSourceRefresh(baseRecord(), snapshot({
      verification: 'VERIFIED',
      changeScope: 'METADATA_ONLY',
      changedFields: [changedField],
    }), context);
    assert.equal(result.audit.status, 'CHANGED');
    assert.equal(result.audit.verification, 'VERIFIED');
    assert.equal(result.audit.truthEffect, 'REVIEW_REQUIRED');
    assert.equal(result.audit.decision, 'PENDING');
    assert.equal(result.publicUpdateAllowed, false);
    assert.equal(result.record.sourceFingerprint, 'fp-old');
    assert.match(result.audit.note, /rights|licence|terms/i);
  }
});

test('claim-relevant provider change remains review-gated even after provider verification', () => {
  const result = evaluateSourceRefresh(baseRecord(), snapshot({
    verification: 'VERIFIED',
    changeScope: 'CLAIM_RELEVANT',
    changedFields: ['scientificName'],
  }), context);
  assert.equal(result.audit.status, 'CHANGED');
  assert.equal(result.audit.truthEffect, 'REVIEW_REQUIRED');
  assert.equal(result.publicUpdateAllowed, false);
  assert.equal(result.record.sourceFingerprint, 'fp-old');
});

test('CONFLICT never propagates', () => {
  const result = evaluateSourceRefresh(baseRecord(), snapshot({ conflict: 'two provider states disagree' }), context);
  assert.equal(result.audit.status, 'CONFLICT');
  assert.equal(result.publicUpdateAllowed, false);
  assert.equal(result.record.sourceFingerprint, 'fp-old');
});

test('UNAVAILABLE never deletes or rewrites existing evidence', () => {
  const result = evaluateSourceRefresh(baseRecord(), snapshot({ available: false }), context);
  assert.equal(result.audit.status, 'UNAVAILABLE');
  assert.equal(result.publicUpdateAllowed, false);
  assert.equal(result.record.sourceFingerprint, 'fp-old');
});

test('older source snapshots cannot roll canonical state backwards', () => {
  const result = evaluateSourceRefresh(baseRecord(), snapshot({ checkedAt: '2026-08-27T07:00:00Z' }), context);
  assert.equal(result.audit.status, 'CONFLICT');
  assert.equal(result.record.checkedAt, '2026-08-28T06:00:00Z');
  assert.equal(result.record.sourceFingerprint, 'fp-old');
});

test('provider identifier changes cannot silently rebind a source', () => {
  const result = evaluateSourceRefresh(baseRecord(), snapshot({ providerId: 'GBIF:species:999' }), context);
  assert.equal(result.audit.status, 'CONFLICT');
  assert.equal(result.publicUpdateAllowed, false);
});

test('reported field changes without fingerprint change are treated as a conflict', () => {
  const result = evaluateSourceRefresh(baseRecord(), snapshot({
    fingerprint: 'fp-old',
    verification: 'VERIFIED',
    changedFields: ['scientificName'],
    changeScope: 'CLAIM_RELEVANT',
  }), context);
  assert.equal(result.audit.status, 'CONFLICT');
  assert.equal(result.publicUpdateAllowed, false);
});

test('duplicate audit event is idempotent and does not duplicate history', () => {
  const first = evaluateSourceRefresh(baseRecord(), snapshot(), context);
  const duplicate = evaluateSourceRefresh(first.record, snapshot(), context);
  assert.equal(duplicate.record.refreshHistory.length, 1);
});

test('synthetic CHANGED fixture is permanently blocked from public propagation', () => {
  const result = evaluateSourceRefresh(baseRecord(), snapshot({ verification: 'VERIFIED' }), {
    ...context,
    syntheticFixture: true,
  });
  assert.equal(result.audit.status, 'CHANGED');
  assert.equal(result.audit.syntheticFixture, true);
  assert.equal(result.publicUpdateAllowed, false);
  assert.equal(result.record.sourceFingerprint, 'fp-old');
});

test('verified metadata propagation updates canonical source once and preserves factual claims untouched', () => {
  const refresh = evaluateSourceRefresh(baseRecord(), snapshot({ verification: 'VERIFIED' }), context);
  const claims = Object.freeze([{ id: 'claim-1', text: 'Existing factual claim' }]);
  const object = {
    id: 'taxon:gbif:5184657',
    sourceRecords: [baseRecord()],
    claims,
  };
  const propagated = propagateVerifiedSourceMetadata(object, refresh);
  assert.equal(propagated.propagated, true);
  assert.equal(propagated.object.sourceRecords[0].sourceFingerprint, 'fp-new');
  assert.strictEqual(propagated.object.claims, claims);
  assert.equal(propagated.object.evidenceUpdatedAt, '2026-08-28T07:00:00Z');
});

test('historical audit entries cannot be overwritten through returned frozen history', () => {
  const result = evaluateSourceRefresh(baseRecord(), snapshot(), context);
  assert.equal(Object.isFrozen(result.record.refreshHistory), true);
  assert.equal(Object.isFrozen(result.record.refreshHistory[0]), true);
  assert.throws(() => result.record.refreshHistory.push({}), TypeError);
});
