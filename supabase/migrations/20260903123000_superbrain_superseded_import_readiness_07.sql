-- 4PLANET SUPERBRAIN — SUPERSEDED IMPORT READINESS 07
--
-- Migration law:
-- - immutable legacy import evidence is never rewritten or deleted;
-- - an AUTHORITY_DATA import from a SUPERSEDED source may stop blocking cutover
--   only when that source names an ACTIVE canonical replacement and the exact
--   immutable source-revision content hash is present under that replacement;
-- - the replacement import remains independently subject to STAGED/AMBIGUOUS
--   hydration blocking, so supersession cannot be used as a bypass;
-- - missing registry/revision/replacement evidence fails closed.

begin;

create or replace view cns.v_effective_authority_imports
with (security_invoker=true) as
select q.*
from cns.legacy_import_queue q
left join cns.source_registry old_source
  on old_source.source_id=q.source_id
where q.import_purpose='AUTHORITY_DATA'
  and not (
    old_source.state='SUPERSEDED'
    and nullif(old_source.metadata->>'superseded_by','') is not null
    and exists (
      select 1
      from cns.source_registry replacement_source
      join cns.source_revisions old_revision
        on old_revision.source_id=q.source_id
       and old_revision.revision=q.source_revision
      join cns.source_revisions replacement_revision
        on replacement_revision.source_id=replacement_source.source_id
       and replacement_revision.content_hash=old_revision.content_hash
      where replacement_source.source_id=old_source.metadata->>'superseded_by'
        and replacement_source.state='ACTIVE'
        and exists (
          select 1
          from cns.legacy_import_queue replacement_import
          where replacement_import.source_id=replacement_source.source_id
            and replacement_import.source_revision=replacement_revision.revision
            and replacement_import.import_purpose='AUTHORITY_DATA'
        )
    )
  );

-- Fail closed if any row would be excluded merely because a source says it is
-- SUPERSEDED without a complete ACTIVE same-hash replacement chain.
do $$
begin
  if exists (
    select 1
    from cns.legacy_import_queue q
    join cns.source_registry old_source on old_source.source_id=q.source_id
    where q.import_purpose='AUTHORITY_DATA'
      and old_source.state='SUPERSEDED'
      and not exists (
        select 1
        from cns.source_registry replacement_source
        join cns.source_revisions old_revision
          on old_revision.source_id=q.source_id
         and old_revision.revision=q.source_revision
        join cns.source_revisions replacement_revision
          on replacement_revision.source_id=replacement_source.source_id
         and replacement_revision.content_hash=old_revision.content_hash
        where replacement_source.source_id=old_source.metadata->>'superseded_by'
          and replacement_source.state='ACTIVE'
          and exists (
            select 1
            from cns.legacy_import_queue replacement_import
            where replacement_import.source_id=replacement_source.source_id
              and replacement_import.source_revision=replacement_revision.revision
              and replacement_import.import_purpose='AUTHORITY_DATA'
          )
      )
  ) then
    raise notice 'SUPERBRAIN readiness: one or more superseded imports lack a verified active same-hash replacement and remain blocking by design.';
  end if;
end $$;

-- Rebuild readiness on effective authority imports only. The positive hydration
-- receipt is still mandatory; an empty or superseded queue can never self-certify.
drop view if exists cns.v_superbrain_operating_readiness;
drop view if exists cns.v_cutover_readiness;

create view cns.v_cutover_readiness with (security_invoker=true) as
select
  (exists(select 1 from cns.parity_results)
    and not exists(select 1 from cns.parity_results where result<>'MATCH')) as parity_green,
  (
    coalesce((select (value->>'verified')::boolean from cns.system_meta where key='brain_hydration_complete'),false)
    and exists(select 1 from cns.v_effective_authority_imports)
    and not exists(
      select 1 from cns.v_effective_authority_imports
      where state in ('STAGED','AMBIGUOUS')
    )
  ) as hydration_green,
  coalesce((select state='PASS' from cns.dual_read_runs order by finished_at desc nulls last,started_at desc limit 1),false) as dual_read_green,
  not exists(select 1 from cns.health_incidents where state in ('OPEN','ACKNOWLEDGED') and severity='P0') as no_open_p0,
  not exists(select 1 from cns.doctor_violations_v3 where severity='P0') as invariants_green,
  coalesce((select (value->>'verified')::boolean from cns.system_meta where key='remote_readback'),false) as remote_readback_green,
  coalesce((select (value->>'verified')::boolean from cns.system_meta where key='backup_restore'),false) as backup_restore_green,
  coalesce((select (value->>'verified')::boolean from cns.system_meta where key='fresh_session'),false) as fresh_session_green,
  coalesce((select (value->>'verified')::boolean from cns.system_meta where key='security_review'),false) as security_green,
  coalesce((select (value->>'verified')::boolean from cns.system_meta where key='golden_eval'),false) as golden_eval_green,
  coalesce((select (value->>'verified')::boolean from cns.system_meta where key='truth_model'),false) as truth_model_green,
  coalesce((select value->>'mode' from cns.system_meta where key='authority_mode'),'UNKNOWN') as authority_mode,
  coalesce((select (value->>'cutover_authorized')::boolean from cns.system_meta where key='authority_mode'),false) as cutover_authorized;

create view cns.v_superbrain_operating_readiness with (security_invoker=true) as
select r.*,
  coalesce((select c.state='PASS' and c.finished_at>clock_timestamp()-interval '1 hour'
            from cns.control_cycles c
            where c.cycle_kind='AUDITOR'
            order by c.started_at desc,c.control_cycle_id desc limit 1),false) as control_of_control_green,
  (select c.finished_at
   from cns.control_cycles c
   where c.cycle_kind='AUDITOR'
   order by c.started_at desc,c.control_cycle_id desc limit 1) as last_meta_audit_at
from cns.v_cutover_readiness r;

revoke all on cns.v_effective_authority_imports from public,anon,authenticated;
grant select on cns.v_effective_authority_imports,cns.v_cutover_readiness,cns.v_superbrain_operating_readiness to service_role;

commit;
