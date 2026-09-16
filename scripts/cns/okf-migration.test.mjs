import test from 'node:test';
import assert from 'node:assert/strict';
import { metadataFromInventory, migrateText, splitFrontmatter, stableKnowledgeId } from './okf-lib.mjs';

test('Drive ID produces stable path-independent case-preserving knowledge ID', () => {
  const a = stableKnowledgeId({ drive_id: 'ABC123_XyZ', path: 'old/name.md' });
  const b = stableKnowledgeId({ drive_id: 'ABC123_XyZ', path: 'new/name.md' });
  assert.equal(a, 'kp:gdrive:ABC123_XyZ');
  assert.equal(a, b);
});

test('Google Drive provider_id also produces stable provider identity', () => {
  assert.equal(stableKnowledgeId({ provider: 'GOOGLE_DRIVE', provider_id: 'ID_Case9' }), 'kp:gdrive:ID_Case9');
});

test('GitHub identity preserves case-sensitive path', () => {
  assert.equal(
    stableKnowledgeId({ github_repo: 'odinskogen-dev/4Planet.05', path: 'WIKI/Canon.md' }),
    'kp:github:odinskogen-dev/4Planet.05:WIKI/Canon.md'
  );
});

test('migration adds v1.1 producer-profile frontmatter without changing body bytes', () => {
  const original = '# Title\n\nBody line.\n';
  const metadata = metadataFromInventory({
    drive_id: 'DOC1', title: 'Title', document_class: 'Knowledge Article', authority: 'WIKI', authority_level: 'DOMAIN_AUTHORITY', canon_state: 'NON_CANON', review_status: 'REVIEWED', evidence_strength: 'MODERATE', interpretation_status: 'SOURCE_REPORTED', provenance_state: 'COMPLETE', writeback_state: 'WRITEBACK_COMPLETE', sensitivity: 'INTERNAL', lifecycle_state: 'CURRENT', freshness_state: 'CURRENT', trust_domain: '4PLANET_INTERNAL', migration_status: 'MIGRATED'
  }, '2026-09-16T15:00:00.000Z');
  const result = migrateText(original, metadata);
  assert.equal(result.changed, true);
  assert.equal(result.bodyHashBefore, result.bodyHashAfter);
  assert.equal(splitFrontmatter(result.output).body, original);
  assert.match(result.output, /knowledge_id: kp:gdrive:DOC1/);
  assert.match(result.output, /schema_version: 4planet-okf-1\.1/);
  assert.match(result.output, /producer_profile: 4PLANET_OKF_1\.1/);
  assert.match(result.output, /upstream_okf: 0\.2/);
  assert.match(result.output, /freshness_state: CURRENT/);
  assert.match(result.output, /trust_domain: 4PLANET_INTERNAL/);
  assert.match(result.output, /^verified: \[\]$/m);
  assert.match(result.output, /^sources: \[\]$/m);
  assert.doesNotMatch(result.output, /^\s+\[\]$/m);
});

test('OKF source entries without required resource are omitted fail-closed', () => {
  const metadata = metadataFromInventory({
    drive_id: 'DOC-SOURCES', title: 'Sources', migration_status: 'MIGRATED',
    sources: [
      { id: 'bad', title: 'No resource' },
      { id: 'good', resource: 'https://example.org/original', title: 'Original' }
    ]
  }, '2026-09-16T15:00:00.000Z');
  assert.deepEqual(metadata.sources, [{ id: 'good', resource: 'https://example.org/original', title: 'Original' }]);
});

test('private boundary defaults to ODIN_PRIVATE trust domain', () => {
  const metadata = metadataFromInventory({ drive_id: 'DOC-PRIVATE', title: 'Private', sensitivity: 'PRIVATE_BOUNDARY', migration_status: 'MIGRATED' }, '2026-09-16T15:00:00.000Z');
  assert.equal(metadata.brain.trust_domain, 'ODIN_PRIVATE');
});

test('ACTOR_PRIVATE metadata retains explicit workspace', () => {
  const metadata = metadataFromInventory({ drive_id: 'DOC-ACTOR', title: 'Actor', trust_domain: 'ACTOR_PRIVATE', workspace_id: 'workspace:1', actor_ids: ['actor:1'], migration_status: 'MIGRATED' }, '2026-09-16T15:00:00.000Z');
  assert.equal(metadata.brain.workspace_id, 'workspace:1');
  assert.deepEqual(metadata.brain.actor_ids, ['actor:1']);
});

test('migration is fail-closed when frontmatter already exists', () => {
  const original = '---\ntitle: Existing\n---\n# Existing\n';
  const metadata = metadataFromInventory({ drive_id: 'DOC2', title: 'Existing' }, '2026-09-16T15:00:00.000Z');
  const result = migrateText(original, metadata);
  assert.equal(result.changed, false);
  assert.equal(result.reason, 'EXISTING_FRONTMATTER_REQUIRES_MERGE_REVIEW');
  assert.equal(result.output, original);
});

test('BOM and CRLF body are preserved', () => {
  const original = '\uFEFF# Title\r\n\r\nBody\r\n';
  const metadata = metadataFromInventory({ drive_id: 'DOC3', title: 'Title', migration_status: 'MIGRATED' }, '2026-09-16T15:00:00.000Z');
  const result = migrateText(original, metadata);
  const split = splitFrontmatter(result.output);
  assert.equal(split.bom, '\uFEFF');
  assert.equal(split.body, '# Title\r\n\r\nBody\r\n');
  assert.equal(result.bodyHashBefore, result.bodyHashAfter);
});
