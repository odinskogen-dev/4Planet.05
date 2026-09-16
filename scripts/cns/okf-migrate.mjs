#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { metadataFromInventory, migrateText, sha256, stableKnowledgeId, SCHEMA_VERSION, PRODUCER_PROFILE, UPSTREAM_OKF } from './okf-lib.mjs';

function usage() {
  console.error('Usage: node scripts/cns/okf-migrate.mjs <inventory.json> <source-root> [--write]');
  process.exit(2);
}

const [inventoryPath, sourceRoot, ...flags] = process.argv.slice(2);
if (!inventoryPath || !sourceRoot) usage();
const write = flags.includes('--write');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
if (!Array.isArray(inventory.documents)) throw new Error('inventory.documents must be an array');

const ledger = [];
const ids = new Map();
for (const record of inventory.documents) {
  const knowledgeId = stableKnowledgeId(record);
  if (ids.has(knowledgeId)) {
    ledger.push({ provider_id: record.provider_id || record.drive_id || record.path, knowledge_id: knowledgeId, status: 'BLOCKED_WITH_EXACT_REASON', reason: `DUPLICATE_KNOWLEDGE_ID:${ids.get(knowledgeId)}` });
    continue;
  }
  ids.set(knowledgeId, record.provider_id || record.drive_id || record.path);

  if (record.file_or_folder === 'folder') {
    ledger.push({ provider_id: record.provider_id || record.drive_id, knowledge_id: knowledgeId, status: 'NON_KNOWLEDGE_EXCLUDED_WITH_REASON', reason: 'FOLDER_INVENTORY_NODE' });
    continue;
  }
  if (record.migration_status && record.migration_status !== 'MIGRATED') {
    ledger.push({ provider_id: record.provider_id || record.drive_id || record.path, knowledge_id: knowledgeId, status: record.migration_status, reason: record.migration_note || '' });
    continue;
  }
  if (!record.path) {
    ledger.push({ provider_id: record.provider_id || record.drive_id, knowledge_id: knowledgeId, status: 'BLOCKED_WITH_EXACT_REASON', reason: 'NO_LOCAL_PATH_FOR_TEXT_MIGRATION' });
    continue;
  }

  const absolute = path.resolve(sourceRoot, record.path);
  if (!fs.existsSync(absolute)) {
    ledger.push({ provider_id: record.provider_id || record.drive_id || record.path, knowledge_id: knowledgeId, status: 'BLOCKED_WITH_EXACT_REASON', reason: 'SOURCE_FILE_NOT_FOUND' });
    continue;
  }
  const before = fs.readFileSync(absolute, 'utf8');
  const metadata = metadataFromInventory({ ...record, migration_status: 'MIGRATED' });
  const result = migrateText(before, metadata, { replaceExisting: false });
  if (result.bodyHashBefore !== result.bodyHashAfter) {
    ledger.push({ provider_id: record.provider_id || record.drive_id || record.path, knowledge_id: knowledgeId, status: 'BLOCKED_WITH_EXACT_REASON', reason: 'BODY_HASH_CHANGED' });
    continue;
  }
  if (result.reason === 'EXISTING_FRONTMATTER_REQUIRES_MERGE_REVIEW') {
    ledger.push({ provider_id: record.provider_id || record.drive_id || record.path, knowledge_id: knowledgeId, status: 'BLOCKED_WITH_EXACT_REASON', reason: result.reason, source_sha256: sha256(before) });
    continue;
  }
  if (write && result.changed) fs.writeFileSync(absolute, result.output, 'utf8');
  ledger.push({
    provider_id: record.provider_id || record.drive_id || record.path,
    knowledge_id: knowledgeId,
    status: write ? 'MIGRATED' : 'DRY_RUN_MIGRATABLE',
    changed: result.changed,
    source_sha256: sha256(before),
    final_sha256: sha256(result.output),
    body_sha256: result.bodyHashAfter
  });
}

const counts = ledger.reduce((acc, row) => { acc[row.status] = (acc[row.status] || 0) + 1; return acc; }, {});
const output = {
  schema_version: SCHEMA_VERSION,
  producer_profile: PRODUCER_PROFILE,
  upstream_okf: UPSTREAM_OKF,
  write,
  source_count: inventory.documents.length,
  ledger_count: ledger.length,
  counts,
  unaccounted: inventory.documents.length - ledger.length,
  ledger
};
const outPath = `${inventoryPath.replace(/\.json$/i, '')}.migration-ledger.json`;
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ outPath, schema_version: output.schema_version, producer_profile: output.producer_profile, source_count: output.source_count, ledger_count: output.ledger_count, unaccounted: output.unaccounted, counts }, null, 2));
if (output.unaccounted !== 0) process.exitCode = 1;
