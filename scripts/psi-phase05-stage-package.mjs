#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const dir = process.env.PSI_PACKAGE_DIR;
if (!dir) throw new Error('PSI_PACKAGE_DIR is required');
const mode = process.env.PSI_STAGE_MODE ?? 'audit'; // audit | stage
const batchKey = process.env.PSI_BATCH_KEY ?? 'psi-production-validation-v1';
const dbUrl = process.env.PSI_DATABASE_URL;

const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const filePath = (name) => path.join(dir, name);
const readBuf = (name) => readFile(filePath(name));
const readJson = async (name) => JSON.parse((await readBuf(name)).toString('utf8'));
const readJsonl = async (name) => (await readBuf(name)).toString('utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);

const stageManifest = await readJson('STAGING_DATA_MANIFEST.json');
const verified = [];
for (const [name, meta] of Object.entries(stageManifest.files ?? {})) {
  const buf = await readBuf(name);
  const actualSha = sha(buf);
  const actualBytes = (await stat(filePath(name))).size;
  const rows = name.endsWith('.jsonl') ? (await readJsonl(name)).length : (await readJson(name)).length;
  const ok = actualSha === meta.sha256 && actualBytes === meta.bytes && rows === meta.records;
  verified.push({ name, ok, expectedSha: meta.sha256, actualSha, expectedBytes: meta.bytes, actualBytes, expectedRecords: meta.records, actualRecords: rows });
  if (!ok) throw new Error(`Staging manifest mismatch for ${name}`);
}
const packageDigest = sha(await readBuf('STAGING_DATA_MANIFEST.json'));

const arrayRows = async (name) => await readJson(name);
const jsonlRows = async (name) => await readJsonl(name);
const specs = [
  ['OBJECT', 'objects.jsonl', jsonlRows, (r) => r['Source ref'], () => 'VALID'],
  ['SOLUTION_IDENTITY', 'canonical_solution_identity_1000.json', arrayRows, (r) => r.public_ref, () => 'VALID'],
  ['LEGACY_VARIANT_RELATION', 'legacy_variant_relations_40.json', arrayRows, (r) => `${r.source_ref}:${r.predicate}:${r.parent_ref}`, () => 'VALID'],
  ['HIERARCHY', 'hierarchy.jsonl', jsonlRows, (r) => `HIER:${r['Child ref']}:${r.Relation}:${r['Parent ref']}:${r.Role ?? ''}`, () => 'VALID'],
  ['CAUSAL_EDGE', 'causal_edges.jsonl', jsonlRows, (r) => r['Edge ID'], () => 'VALID'],
  ['CLAIM', 'claims.jsonl', jsonlRows, (r) => r['Claim ID'], () => 'VALID'],
  ['SOLUTION_PROBLEM_RELATION', 'solution_problem_m2m.jsonl', jsonlRows, (r) => r['Relation ID'], (r) => r['Mapping confidence'] === 'LOW' ? 'QUARANTINED' : 'VALID'],
  ['COVERAGE', 'coverage_matrix.jsonl', jsonlRows, (r) => `COV:${r['Problem Complex ID']}`, () => 'VALID'],
  ['SEVERITY_ASSESSMENT', 'severity_assessments_1500.json', arrayRows, (r) => r.assessment_ref, () => 'VALID'],
  ['LEVERAGE_ASSESSMENT', 'leverage_assessments_1500.json', arrayRows, (r) => r.assessment_ref, () => 'VALID'],
  ['RANKING_ENTRY', 'ranking_entries_200.json', arrayRows, (r) => r.assessment_ref, () => 'VALID'],
  ['GAP', 'gap_intel_v2_25.json', arrayRows, (r) => r['Gap ID'], () => 'VALID'],
  ['NEXUS_CHAIN', 'nexus_v2_12.json', arrayRows, (r) => r['Nexus ID'], () => 'VALID'],
  ['SOURCE_REGISTRY', 'source_registry_v2_34.json', arrayRows, (r) => r['Source ID'], () => 'VALID'],
  ['CLAIM_SOURCE_RESOLUTION', 'claim_source_resolution_queue.json', arrayRows, (r) => `${r.claim_ref}:${r.source_id}`, () => 'PENDING'],
];

const records = [];
for (const [family, file, reader, refFn, statusFn] of specs) {
  for (const parsed of await reader(file)) {
    const sourceRef = refFn(parsed);
    if (!sourceRef) throw new Error(`Missing source ref in ${file}`);
    const raw = JSON.stringify(parsed);
    records.push({ family, sourceRef, raw, payloadSha: sha(Buffer.from(raw, 'utf8')), status: statusFn(parsed) });
  }
}
const statusCounts = records.reduce((a, r) => (a[r.status] = (a[r.status] ?? 0) + 1, a), {});
const expected = stageManifest.expected_stage_counts ?? {};
if ((expected.VALID ?? statusCounts.VALID) !== statusCounts.VALID ||
    (expected.QUARANTINED ?? statusCounts.QUARANTINED) !== statusCounts.QUARANTINED ||
    (expected.PENDING_SOURCE_RECORD_RESOLUTION ?? statusCounts.PENDING) !== statusCounts.PENDING ||
    (expected.TOTAL ?? records.length) !== records.length) {
  throw new Error(`Stage count mismatch: ${JSON.stringify(statusCounts)} total=${records.length}`);
}

const summary = {
  mode,
  release: stageManifest.release,
  packageDigest,
  basePackageDigest: stageManifest.base_package_digest,
  verifiedFiles: verified.length,
  stagedRecordCandidates: records.length,
  statusCounts,
  truthBoundary: {
    packageIntegrityIsDatabaseIngest: false,
    stagingIsPromotion: false,
    sourceRegistryIsSourceRecord: false,
    pendingSourceResolutionIsClaimEvidence: false,
    relationRelevanceIsEffectiveness: false,
    lowConfidenceAutoPromoted: false,
  },
};

if (mode === 'audit') {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}
if (mode !== 'stage') throw new Error(`Unsupported PSI_STAGE_MODE=${mode}`);
if (!dbUrl) throw new Error('PSI_DATABASE_URL is required for PSI_STAGE_MODE=stage');

function lit(value) { return `'${String(value).replaceAll("'", "''")}'`; }
function jsonDollar(raw, tag) {
  const safeTag = `j${tag.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 28)}`;
  return `$${safeTag}$${raw}$${safeTag}$`;
}

const sql = ['\\set ON_ERROR_STOP on', 'begin;'];
sql.push(`do $$ begin
  if not exists(select 1 from public.brain_canon_decisions where decision_id='FD-06') then
    raise exception 'Founder-approved PSI canon migration is not installed';
  end if;
end $$;`);
sql.push(`insert into public.brain_import_batches(batch_key,source_release,package_sha256,status,founder_release)
values(${lit(batchKey)},${lit(stageManifest.release)},${lit(packageDigest)},'CREATED',false)
on conflict(batch_key) do update set source_release=excluded.source_release,package_sha256=excluded.package_sha256
where public.brain_import_batches.package_sha256=excluded.package_sha256;`);
sql.push(`do $$ begin
  if not exists(select 1 from public.brain_import_batches where batch_key=${lit(batchKey)} and package_sha256=${lit(packageDigest)}) then
    raise exception 'Batch key exists with a different package digest';
  end if;
end $$;`);

for (const r of records) {
  const tag = r.payloadSha.slice(0, 16);
  const validationStatus = r.status === 'PENDING' ? 'PENDING' : r.status;
  const errors = r.status === 'QUARANTINED'
    ? "array['LOW_CONFIDENCE_DERIVED_ADDRESSES_REQUIRES_HUMAN_REVIEW']::text[]"
    : r.status === 'PENDING'
      ? "array['SOURCE_RECORD_ID_RESOLUTION_REQUIRED_BEFORE_CLAIM_EVIDENCE']::text[]"
      : "'{}'::text[]";
  sql.push(`with staged as (
    select public.stage_brain_record(${lit(batchKey)},${lit(r.family)},${lit(r.sourceRef)},${jsonDollar(r.raw, tag)}::jsonb,${lit(r.payloadSha)}) as id
  )
  update public.brain_staging_records s set validation_status=${lit(validationStatus)},validation_errors=${errors}
  from staged where s.id=staged.id;`);
  if (r.status === 'QUARANTINED') {
    sql.push(`insert into public.brain_quarantine_records(staging_record_id,reason_codes,details)
      select id,array['LOW_CONFIDENCE_DERIVED_ADDRESSES_REQUIRES_HUMAN_REVIEW']::text[],'Held by Phase 05 audit; no silent promotion.'
      from public.brain_staging_records
      where batch_id=(select id from public.brain_import_batches where batch_key=${lit(batchKey)})
        and record_family=${lit(r.family)} and source_ref=${lit(r.sourceRef)} and payload_sha256=${lit(r.payloadSha)}
      on conflict(staging_record_id) do update set reason_codes=excluded.reason_codes,details=excluded.details;`);
  }
}

sql.push(`update public.brain_import_batches b set
  status=case
    when exists(select 1 from public.brain_staging_records s where s.batch_id=b.id and s.validation_status='QUARANTINED') then 'QUARANTINED'
    when exists(select 1 from public.brain_staging_records s where s.batch_id=b.id and s.validation_status='PENDING') then 'STAGED'
    else 'VALIDATED' end,
  validated_at=now(),
  counts=jsonb_build_object(
    'VALID',(select count(*) from public.brain_staging_records s where s.batch_id=b.id and s.validation_status='VALID'),
    'QUARANTINED',(select count(*) from public.brain_staging_records s where s.batch_id=b.id and s.validation_status='QUARANTINED'),
    'PENDING',(select count(*) from public.brain_staging_records s where s.batch_id=b.id and s.validation_status='PENDING'),
    'TOTAL',(select count(*) from public.brain_staging_records s where s.batch_id=b.id)
  )
where b.batch_key=${lit(batchKey)};`);
sql.push('commit;');
sql.push(`select jsonb_build_object(
  'batch_key',b.batch_key,'source_release',b.source_release,'package_sha256',b.package_sha256,'status',b.status,
  'founder_release',b.founder_release,'counts',b.counts,'promotion_performed',false
)::text from public.brain_import_batches b where b.batch_key=${lit(batchKey)};`);

const u = new URL(dbUrl);
const pgEnv = { ...process.env, PGHOST: u.hostname, PGPORT: u.port || '5432', PGDATABASE: decodeURIComponent(u.pathname.replace(/^\//, '')), PGUSER: decodeURIComponent(u.username), PGPASSWORD: decodeURIComponent(u.password) };
if (u.searchParams.get('sslmode')) pgEnv.PGSSLMODE = u.searchParams.get('sslmode');
const result = spawnSync('psql', ['-qAt'], { input: sql.join('\n'), encoding: 'utf8', env: pgEnv, maxBuffer: 40 * 1024 * 1024 });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
console.error(JSON.stringify(summary));
