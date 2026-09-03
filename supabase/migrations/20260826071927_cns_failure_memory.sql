-- RECOVERED FROM APPLIED 4PLANET-STAGING MIGRATION JOURNAL 2026-09-03
-- SUPERBRAIN FAILURE MEMORY + SOURCE IMPACT
-- A detected incident is not a learned failure. Closure requires verified repair + passing regression evidence.

begin;

create table if not exists cns.failure_records (
  failure_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  incident_id bigint references cns.health_incidents(incident_id) on delete restrict,
  failure_class text not null,
  title text not null,
  observed_failure jsonb not null,
  expected_behavior jsonb not null default '{}'::jsonb,
  root_cause jsonb not null default '{}'::jsonb,
  why_not_caught_earlier jsonb not null default '{}'::jsonb,
  affected_scope jsonb not null default '[]'::jsonb,
  fix_refs jsonb not null default '[]'::jsonb,
  verification_refs jsonb not null default '[]'::jsonb,
  regression_evaluation_run_id uuid references cns.evaluation_runs(evaluation_run_id) on delete restrict,
  recurrence_count integer not null default 0 check (recurrence_count>=0),
  recurrence_last_at timestamptz,
  prevention_rule_refs jsonb not null default '[]'::jsonb,
  state text not null default 'OPEN' check (state in ('OPEN','DIAGNOSED','FIXED_UNVERIFIED','VERIFIED','RECURRENT','SUPERSEDED')),
  opened_at timestamptz not null default clock_timestamp(),
  diagnosed_at timestamptz,
  fixed_at timestamptz,
  verified_at timestamptz,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp()
);
create index if not exists cns_failure_records_project_state_idx on cns.failure_records(project_id,state,updated_at desc);
create index if not exists cns_failure_records_class_idx on cns.failure_records(failure_class,state,updated_at desc);
create table if not exists cns.failure_recurrences(failure_recurrence_id bigint generated always as identity primary key,failure_id text not null references cns.failure_records(failure_id) on delete restrict,detected_at timestamptz not null default clock_timestamp(),evidence jsonb not null,event_id bigint references cns.events(event_id) on delete restrict);

create or replace function cns.guard_failure_closure() returns trigger language plpgsql as $$
declare v_eval_state text;
begin
  if new.state='VERIFIED' and old.state is distinct from 'VERIFIED' then
    if jsonb_array_length(new.fix_refs)=0 then raise exception 'CNS_FAILURE_VERIFY_REQUIRES_FIX_REF'; end if;
    if jsonb_array_length(new.verification_refs)=0 then raise exception 'CNS_FAILURE_VERIFY_REQUIRES_READBACK_EVIDENCE'; end if;
    if new.regression_evaluation_run_id is null then raise exception 'CNS_FAILURE_VERIFY_REQUIRES_REGRESSION_EVAL'; end if;
    select state into v_eval_state from cns.evaluation_runs where evaluation_run_id=new.regression_evaluation_run_id;
    if v_eval_state is distinct from 'PASS' then raise exception 'CNS_FAILURE_VERIFY_REQUIRES_PASSING_REGRESSION'; end if;
    if jsonb_typeof(new.root_cause)<>'object' or new.root_cause='{}'::jsonb then raise exception 'CNS_FAILURE_VERIFY_REQUIRES_ROOT_CAUSE'; end if;
    if jsonb_typeof(new.why_not_caught_earlier)<>'object' or new.why_not_caught_earlier='{}'::jsonb then raise exception 'CNS_FAILURE_VERIFY_REQUIRES_CONTROL_GAP_ANALYSIS'; end if;
    new.verified_at:=coalesce(new.verified_at,clock_timestamp());
  end if;
  new.updated_at:=clock_timestamp(); return new;
end; $$;
drop trigger if exists cns_failure_closure_guard on cns.failure_records;
create trigger cns_failure_closure_guard before update on cns.failure_records for each row execute function cns.guard_failure_closure();

create or replace function cns.record_failure_recurrence(p_failure_id text,p_evidence jsonb,p_event_id bigint default null) returns bigint language plpgsql security definer set search_path=cns,public as $$
declare v_id bigint; begin insert into cns.failure_recurrences(failure_id,evidence,event_id) values(p_failure_id,coalesce(p_evidence,'{}'::jsonb),p_event_id) returning failure_recurrence_id into v_id; update cns.failure_records set recurrence_count=recurrence_count+1,recurrence_last_at=clock_timestamp(),state='RECURRENT',updated_at=clock_timestamp() where failure_id=p_failure_id; if not found then raise exception 'CNS_FAILURE_NOT_FOUND'; end if; return v_id; end; $$;

create or replace view cns.v_source_health with (security_invoker=true) as select s.source_id,s.name,s.state,s.current_revision,s.freshness_seconds,s.last_verified_at,case when s.state in ('INACTIVE','ARCHIVED','SUPERSEDED') then 'UNAVAILABLE' when s.state='DEGRADED' then 'DEGRADED' when s.state='ACTIVE' and s.freshness_seconds is not null and s.last_verified_at is null then 'UNVERIFIED' when s.state='ACTIVE' and s.freshness_seconds is not null and s.last_verified_at+make_interval(secs=>s.freshness_seconds)<=clock_timestamp() then 'STALE' when s.state='ACTIVE' then 'FRESH' else 'UNKNOWN' end as health_state from cns.source_registry s;
create or replace view cns.v_source_dependents with (security_invoker=true) as select c.source_id,'CLAIM'::text dependent_type,c.claim_id::text dependent_id,c.project_id,c.state::text dependent_state from cns.claims c where c.source_id is not null and c.state in ('ACTIVE','DISPUTED') union all select e.source_id,'EVIDENCE',e.evidence_id,e.project_id,e.state from cns.evidence e where e.source_id is not null and e.state in ('ACTIVE','DISPUTED') union all select o.source_id,'OBSERVATION',o.observation_id,o.project_id,o.state from cns.observations o where o.source_id is not null and o.state in ('ACTIVE','DISPUTED') union all select sr.source_id,'CONTEXT',cs.context_snapshot_id::text,cs.project_id,case when cs.invalidated_at is null and cs.expires_at>clock_timestamp() then 'ACTIVE' else 'INACTIVE' end from cns.context_snapshots cs cross join lateral jsonb_object_keys(cs.source_revisions) sr(source_id) where cs.invalidated_at is null and cs.expires_at>clock_timestamp();
create or replace view cns.v_source_impact with (security_invoker=true) as select h.source_id,h.name,h.health_state,d.dependent_type,d.dependent_id,d.project_id,d.dependent_state from cns.v_source_health h join cns.v_source_dependents d using(source_id) where h.health_state in ('UNAVAILABLE','DEGRADED','UNVERIFIED','STALE','UNKNOWN');
create or replace function cns.require_source_fresh(p_source_id text,p_allow_degraded boolean default false) returns text language plpgsql security definer set search_path=cns,public as $$ declare v_state text; begin select health_state into v_state from cns.v_source_health where source_id=p_source_id; if not found then raise exception 'CNS_SOURCE_NOT_FOUND'; end if; if v_state='FRESH' then return v_state; end if; if p_allow_degraded and v_state='DEGRADED' then return v_state; end if; raise exception 'CNS_SOURCE_NOT_FRESH:%',v_state; end; $$;

create or replace view cns.v_operational_truth_violations with (security_invoker=true) as select * from cns.doctor_violations_v3 union all select 'SOURCE_IMPACT_ACTIVE','P1',i.dependent_type,i.dependent_id,i.project_id,'Active truth/context depends on a source that is not fresh: '||i.health_state from cns.v_source_impact i where i.dependent_state='ACTIVE' union all select 'RECURRENT_VERIFIED_FAILURE','P0','FAILURE',f.failure_id,f.project_id,'A previously verified failure has recurred; prior prevention was insufficient' from cns.failure_records f where f.state='RECURRENT';
create or replace function cns.doctor_scan() returns integer language plpgsql security definer set search_path=cns,public as $$ declare v_count integer; begin perform cns.expire_dead_leases(); insert into cns.health_incidents(fingerprint,rule_id,severity,entity_type,entity_id,project_id,summary,evidence,state) select encode(digest(rule_id||'|'||entity_type||'|'||entity_id,'sha256'),'hex'),rule_id,severity,entity_type,entity_id,project_id,summary,'[]'::jsonb,'OPEN' from cns.v_operational_truth_violations on conflict(fingerprint) where state in ('OPEN','ACKNOWLEDGED') do update set last_seen_at=clock_timestamp(),summary=excluded.summary,severity=excluded.severity; get diagnostics v_count=row_count; update cns.health_incidents i set state='RESOLVED',resolved_at=clock_timestamp(),last_seen_at=clock_timestamp() where i.state in ('OPEN','ACKNOWLEDGED') and not exists(select 1 from cns.v_operational_truth_violations v where encode(digest(v.rule_id||'|'||v.entity_type||'|'||v.entity_id,'sha256'),'hex')=i.fingerprint); return v_count; end; $$;

revoke all on cns.failure_records,cns.failure_recurrences from public,anon,authenticated;
revoke all on function cns.record_failure_recurrence(text,jsonb,bigint) from public,anon,authenticated;
revoke all on function cns.require_source_fresh(text,boolean) from public,anon,authenticated;
grant select,insert,update on cns.failure_records to service_role;
grant select,insert on cns.failure_recurrences to service_role;
grant select on cns.v_source_health,cns.v_source_dependents,cns.v_source_impact,cns.v_operational_truth_violations to service_role;
grant execute on function cns.record_failure_recurrence(text,jsonb,bigint) to service_role;
grant execute on function cns.require_source_fresh(text,boolean) to service_role;
insert into cns.system_meta(key,value) values('failure_memory','{"version":1,"verified":false,"state":"PENDING_CERTIFICATION","closure":"FIX+READBACK+REGRESSION_PASS+ROOT_CAUSE+CONTROL_GAP"}'::jsonb) on conflict(key) do update set value=excluded.value,updated_at=clock_timestamp();
update cns.system_meta set value='{"version":6,"migration":"20260826003000_cns_failure_memory","truth_model":"SUPERBRAIN_V4","control_of_control":"V1","failure_memory":"V1"}'::jsonb,updated_at=clock_timestamp() where key='schema_version';
commit;
