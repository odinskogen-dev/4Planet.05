-- Regression fix found during first canonical GIGA shadow hydration.
-- Supabase installs pgcrypto.digest in the extensions schema; the prior function
-- searched only cns/public and failed before staging any canonical records.

create or replace function cns.stage_legacy_entity(
  p_source_id text,
  p_source_revision text,
  p_entity_type text,
  p_entity_key text,
  p_payload jsonb
) returns uuid
language plpgsql
security definer
set search_path = cns, public, extensions
as $$
declare v_id uuid; v_fp text;
begin
  v_fp := encode(extensions.digest(p_payload::text, 'sha256'), 'hex');
  insert into cns.legacy_import_queue(
    source_id, source_revision, entity_type, entity_key, raw_payload, raw_fingerprint
  ) values (
    p_source_id, p_source_revision, p_entity_type, p_entity_key, p_payload, v_fp
  )
  on conflict(source_id, source_revision, entity_type, entity_key)
  do update set
    raw_payload = excluded.raw_payload,
    raw_fingerprint = excluded.raw_fingerprint,
    staged_at = now()
  returning import_id into v_id;
  return v_id;
end;
$$;

-- Expected: one STAGED record with a non-null fingerprint; never hydrates authority.
select cns.stage_legacy_entity(
  'giga-goals-2026-09-02',
  'GIGA-PLAN-2026-09-02-v3',
  'CONTROL_TEST',
  'superbrain-import-regression',
  jsonb_build_object('expected','stage only','authority','legacy remains authoritative')
);
