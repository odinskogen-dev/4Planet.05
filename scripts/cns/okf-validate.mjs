#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { extractFlatControlFields, splitFrontmatter, sha256, TERMINAL_MIGRATION_STATES } from './okf-lib.mjs';

const [inventoryPath, sourceRoot, ledgerPathArg] = process.argv.slice(2);
if (!inventoryPath || !sourceRoot) {
  console.error('Usage: node scripts/cns/okf-validate.mjs <inventory.json> <source-root> [migration-ledger.json]');
  process.exit(2);
}
const ledgerPath = ledgerPathArg || `${inventoryPath.replace(/\.json$/i, '')}.migration-ledger.json`;
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : { ledger: [] };
const documents = inventory.documents || [];
const rows = ledger.ledger || [];
const failures = [];
const warnings = [];

const byProvider = new Map();
for (const row of rows) {
  const id = row.provider_id;
  if (id && byProvider.has(id)) failures.push({ code: 'DUPLICATE_LEDGER_ROW', id });
  if (id) byProvider.set(id, row);
}
for (const doc of documents) {
  const provider = doc.provider_id || doc.drive_id || doc.path;
  if (!provider) failures.push({ code: 'INVENTORY_ID_MISSING', title: doc.title });
  if (!byProvider.has(provider)) failures.push({ code: 'UNACCOUNTED_DOCUMENT', id: provider, title: doc.title });
}
for (const row of rows) {
  if (!documents.some(d => (d.provider_id || d.drive_id || d.path) === row.provider_id)) failures.push({ code: 'LEDGER_ORPHAN', id: row.provider_id });
}

const knowledgeIds = new Map();
for (const row of rows) {
  if (!row.knowledge_id) continue;
  if (knowledgeIds.has(row.knowledge_id)) failures.push({ code: 'DUPLICATE_KNOWLEDGE_ID', id: row.knowledge_id, a: knowledgeIds.get(row.knowledge_id), b: row.provider_id });
  else knowledgeIds.set(row.knowledge_id, row.provider_id);
}

const required = ['type','title','status','knowledge_id','schema_version','authority','authority_level','canon_state','review_status','evidence_strength','interpretation_status','provenance_state','writeback_state','sensitivity','lifecycle_state','migration_status','last_validated'];
for (const doc of documents) {
  const provider = doc.provider_id || doc.drive_id || doc.path;
  const row = byProvider.get(provider);
  if (!row) continue;
  if (row.status === 'MIGRATED' && doc.path) {
    const absolute = path.resolve(sourceRoot, doc.path);
    if (!fs.existsSync(absolute)) { failures.push({ code: 'MIGRATED_FILE_MISSING', id: provider, path: doc.path }); continue; }
    const text = fs.readFileSync(absolute, 'utf8');
    const split = splitFrontmatter(text);
    if (!split.hasFrontmatter) { failures.push({ code: 'MISSING_FRONTMATTER', id: provider, path: doc.path }); continue; }
    const fields = extractFlatControlFields(split.frontmatter);
    for (const key of required) if (!fields[key]) failures.push({ code: 'REQUIRED_FIELD_MISSING', id: provider, path: doc.path, field: key });
    if (fields.schema_version && fields.schema_version !== '4planet-okf-1.0') failures.push({ code: 'UNKNOWN_SCHEMA_VERSION', id: provider, value: fields.schema_version });
    if (fields.knowledge_id && row.knowledge_id && fields.knowledge_id !== row.knowledge_id) failures.push({ code: 'ID_LEDGER_MISMATCH', id: provider, metadata: fields.knowledge_id, ledger: row.knowledge_id });
    if (row.body_sha256 && sha256(split.body) !== row.body_sha256) failures.push({ code: 'BODY_CORRUPTION', id: provider, path: doc.path });
  }
  if (row.status !== 'MIGRATED' && row.status !== 'DRY_RUN_MIGRATABLE' && !TERMINAL_MIGRATION_STATES.has(row.status)) {
    failures.push({ code: 'NON_TERMINAL_MIGRATION_STATUS', id: provider, status: row.status });
  }
  if (row.status === 'BLOCKED_WITH_EXACT_REASON' && !row.reason) failures.push({ code: 'BLOCKED_REASON_MISSING', id: provider });
}

const supersedes = new Map();
for (const doc of documents) {
  const from = doc.knowledge_id;
  for (const to of doc.supersedes || []) {
    if (!supersedes.has(from)) supersedes.set(from, []);
    supersedes.get(from).push(to);
  }
}
function visit(id, active = new Set(), done = new Set()) {
  if (active.has(id)) { failures.push({ code: 'CIRCULAR_SUPERSESSION', id }); return; }
  if (done.has(id)) return;
  active.add(id);
  for (const to of supersedes.get(id) || []) visit(to, active, done);
  active.delete(id); done.add(id);
}
for (const id of supersedes.keys()) visit(id);

const terminalRows = rows.filter(r => TERMINAL_MIGRATION_STATES.has(r.status) || r.status === 'MIGRATED').length;
const report = {
  schema_version: '4planet-okf-1.0',
  source_count: documents.length,
  ledger_count: rows.length,
  terminal_rows: terminalRows,
  unaccounted: failures.filter(f => f.code === 'UNACCOUNTED_DOCUMENT').length,
  duplicate_ids: failures.filter(f => f.code === 'DUPLICATE_KNOWLEDGE_ID').length,
  schema_failures: failures.filter(f => ['MISSING_FRONTMATTER','REQUIRED_FIELD_MISSING','UNKNOWN_SCHEMA_VERSION','ID_LEDGER_MISMATCH'].includes(f.code)).length,
  body_corruption: failures.filter(f => f.code === 'BODY_CORRUPTION').length,
  failures,
  warnings,
  verdict: failures.length === 0 && documents.length === rows.length && terminalRows === documents.length ? 'ZERO_OMISSION_PASS' : 'ZERO_OMISSION_FAIL'
};
const reportPath = `${inventoryPath.replace(/\.json$/i, '')}.validation-report.json`;
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ reportPath, ...Object.fromEntries(Object.entries(report).filter(([k]) => !['failures','warnings'].includes(k))) }, null, 2));
if (report.verdict !== 'ZERO_OMISSION_PASS') process.exitCode = 1;
