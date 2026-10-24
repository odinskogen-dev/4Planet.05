-- 4PLANET SUPERBRAIN — CUTOVER HYDRATION GATE 05
-- Keeps synthetic/control-test staging evidence from blocking cutover forever,
-- while making it impossible for a partially registered BRAIN slice to make
-- hydration appear complete.

begin;

alter table cns.legacy_import_queue
  add column if not exists import_purpose text not null default 'AUTHORITY_DATA';

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='cns.legacy_import_queue'::regclass
      and conname='legacy_import_queue_import_purpose_check'
  ) then
    alter table cns.legacy_import_queue
      add constraint legacy_import_queue_import_purpose_check
      check (import_purpose in ('AUTHORITY_DATA','CONTROL_TEST'));
  end if;
end $$;

update cns.legacy_import_queue
set import_purpose='CONTROL_TEST'
where entity_type='CONTROL_TEST';

insert into cns.system_meta(key,value)
values(
  'brain_hydration_complete',
  '{"verified":false,"state":"IN_PROGRESS","rule":"All required current BRAIN/Knowledge OS sources must be copied, fingerprinted, mapped where understood, and parity-tested before cutover."}'::jsonb
)
on conflict(key) do nothing;

-- Rebuild the gate with a positive completeness receipt. Merely emptying the
-- currently-known queue can never certify BRAIN migration completeness.
drop view if exists cns.v_superbrain_operating_readiness;
drop view if exists cns.v_cutover_readiness;

create view cns.v_cutover_readiness with (security_invoker=true) as
select
  (exists(select 1 from cns.parity_results)
    and not exists(select 1 from cns.parity_results where result<>'MATCH')) as parity_green,
  (
    coalesce((select (value->>'verified')::boolean from cns.system_meta where key='brain_hydration_complete'),false)
    and exists(select 1 from cns.legacy_import_queue where import_purpose='AUTHORITY_DATA')
    and not exists(
      select 1 from cns.legacy_import_queue
      where import_purpose='AUTHORITY_DATA' and state in ('STAGED','AMBIGUOUS')
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

revoke all on cns.legacy_import_queue from public,anon,authenticated;
grant select,insert,update on cns.legacy_import_queue to service_role;
grant select on cns.v_cutover_readiness,cns.v_superbrain_operating_readiness to service_role;

commit;
