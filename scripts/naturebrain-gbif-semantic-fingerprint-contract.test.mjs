import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL('../supabase/migrations/20261009062500_naturebrain_gbif_semantic_fingerprint_v02.sql', import.meta.url),
  'utf8',
);

const stable = (value) => JSON.stringify(
  Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'last_interpreted').sort()),
);
const fingerprint = (value) => createHash('md5').update(stable(value)).digest('hex');

test('migration excludes volatile last_interpreted from scientific change identity', () => {
  assert.match(migration, /sem:=n-'last_interpreted';/);
  assert.match(migration, /fp:=md5\(sem::text\);/);
  assert.match(migration, /md5\(\(old-'last_interpreted'\)::text\)<>fp/);
  assert.match(migration, /values\(rec,fp,sem\) on conflict\(record_id,fingerprint\) do nothing/);
});

test('metadata-only refresh preserves current provider metadata without claim invalidation', () => {
  const semanticBranch = migration.indexOf("elsif md5((old-'last_interpreted')::text)<>fp then");
  const metadataBranch = migration.indexOf('else', semanticBranch);
  const revisionInsert = migration.indexOf('insert into planetbrain.source_record_revisions', metadataBranch);
  const semanticSql = migration.slice(semanticBranch, metadataBranch);
  const metadataSql = migration.slice(metadataBranch, revisionInsert);

  assert.match(semanticSql, /changed:=changed\+1;/);
  assert.match(semanticSql, /interpretation_status='source_updated_pending_review'/);
  assert.match(metadataSql, /normalised_payload=n/);
  assert.match(metadataSql, /dupes:=dupes\+1;/);
  assert.doesNotMatch(metadataSql, /source_updated_pending_review|changed:=changed\+1/);
});

test('last_interpreted-only change is a no-op; ecological field change is positive', () => {
  const a = { gbif_key: '1', event_date: '2026-09-01', country_code: 'NO', last_interpreted: '2026-10-08T00:00:00Z' };
  const metadataOnly = { ...a, last_interpreted: '2026-10-09T00:00:00Z' };
  const semanticChange = { ...metadataOnly, event_date: '2026-09-02' };

  assert.equal(fingerprint(a), fingerprint(metadataOnly));
  assert.notEqual(fingerprint(a), fingerprint(semanticChange));
});

test('bounded ingest and lease gates remain fail-closed', () => {
  assert.match(migration, /jsonb_array_length\(p_items\)>20/);
  assert.match(migration, /run lease\/cursor mismatch/);
  assert.match(migration, /t<>'2440483'/);
  assert.match(migration, /no abundance inference/);
});
