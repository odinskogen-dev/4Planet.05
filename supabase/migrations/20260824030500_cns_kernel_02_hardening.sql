-- CNS KERNEL 2 hardening: replay, parity ingestion, traffic retry, cycle Doctor.
begin;

-- Projection write guard. Even database clients with accidental grants must fail closed.
create or replace function cns.guard_projection_write()
returns trigger language plpgsql as $$
begin
  if coalesce(current_setting('cns.projection_writer', true),'off') <> 'on' then
    raise exception 'CNS_DIRECT_PROJECTION_WRITE_FORBIDDEN';
  end if;
  return case when tg_op='DELETE' then old else new end;
end; $$;

drop trigger if exists cns_project_current_state_guard on cns.project_current_state;
create trigger cns_project_current_state_guard
before insert or update or delete on cns.project_current_state
for each row execute function cns.guard_projection_write();

-- Replace commit function so its transaction is the only normal projection write path.
create or replace function cns.commit_project_state(
  p_project_id text,p_state jsonb,p_actor_type text,p_actor_id text,p_authority text,
  p_source_id text,p_source_revision text,p_idempotency_key text,p_ttl_seconds integer default 3600,
  p_evidence_refs jsonb default '[]'::jsonb
) returns bigint language plpgsql security definer set search_path=cns,public as $$
declare v_event bigint;
begin
  if p_ttl_seconds < 60 or p_ttl_seconds > 86400 then raise exception 'CNS_STATE_TTL_OUT_OF_RANGE'; end if;
  if coalesce(p_state->>'state','') not in ('IDEA','INCUBATION','ACTIVE','PAUSED','BLOCKED','CLOSED','ARCHIVED') then raise exception 'CNS_STATE_INVALID'; end if;
  v_event := cns.append_event(p_project_id,'PROJECT',p_project_id,'PROJECT_STATE_COMMITTED',p_state,p_evidence_refs,p_actor_type,p_actor_id,p_authority,p_source_id,p_source_revision,p_idempotency_key);
  perform set_config('cns.projection_writer','on',true);
  insert into cns.project_current_state(project_id,projection_version,why,outcome,primary_goal_ids,state,current_prototype_id,active_code_line_id,current_wbs_gate,next_action,blockers,owner,founder_burden,health,last_event_id,verified_at,stale_after,updated_at)
  values(p_project_id,coalesce((p_state->>'projection_version')::integer,1),p_state->>'why',p_state->>'outcome',coalesce(array(select jsonb_array_elements_text(coalesce(p_state->'primary_goal_ids','[]'::jsonb))),array[]::text[]),p_state->>'state',nullif(p_state->>'current_prototype_id',''),nullif(p_state->>'active_code_line_id',''),p_state->>'current_wbs_gate',p_state->>'next_action',coalesce(p_state->'blockers','[]'::jsonb),p_state->>'owner',coalesce(p_state->>'founder_burden','NONE'),coalesce(p_state->>'health','UNKNOWN'),v_event,now(),now()+make_interval(secs=>p_ttl_seconds),now())
  on conflict(project_id) do update set projection_version=excluded.projection_version,why=excluded.why,outcome=excluded.outcome,primary_goal_ids=excluded.primary_goal_ids,state=excluded.state,current_prototype_id=excluded.current_prototype_id,active_code_line_id=excluded.active_code_line_id,current_wbs_gate=excluded.current_wbs_gate,next_action=excluded.next_action,blockers=excluded.blockers,owner=excluded.owner,founder_burden=excluded.founder_burden,health=excluded.health,last_event_id=excluded.last_event_id,verified_at=excluded.verified_at,stale_after=excluded.stale_after,updated_at=excluded.updated_at;
  perform set_config('cns.projection_writer','off',true);
  return v_event;
exception when others then
  perform set_config('cns.projection_writer','off',true);
  raise;
end; $$;

create or replace function cns.rebuild_project_state(p_project_id text,p_ttl_seconds integer default 3600)
returns bigint language plpgsql security definer set search_path=cns,public as $$
declare v_event cns.events%rowtype; v_state jsonb;
begin
  select * into v_event from cns.events where project_id=p_project_id and event_type='PROJECT_STATE_COMMITTED' order by event_id desc limit 1;
  if not found then raise exception 'CNS_REPLAY_SOURCE_EVENT_MISSING'; end if;
  v_state:=v_event.payload;
  perform set_config('cns.projection_writer','on',true);
  insert into cns.project_current_state(project_id,projection_version,why,outcome,primary_goal_ids,state,current_prototype_id,active_code_line_id,current_wbs_gate,next_action,blockers,owner,founder_burden,health,last_event_id,verified_at,stale_after,updated_at)
  values(p_project_id,coalesce((v_state->>'projection_version')::integer,1),v_state->>'why',v_state->>'outcome',coalesce(array(select jsonb_array_elements_text(coalesce(v_state->'primary_goal_ids','[]'::jsonb))),array[]::text[]),v_state->>'state',nullif(v_state->>'current_prototype_id',''),nullif(v_state->>'active_code_line_id',''),v_state->>'current_wbs_gate',v_state->>'next_action',coalesce(v_state->'blockers','[]'::jsonb),v_state->>'owner',coalesce(v_state->>'founder_burden','NONE'),coalesce(v_state->>'health','UNKNOWN'),v_event.event_id,now(),now()+make_interval(secs=>p_ttl_seconds),now())
  on conflict(project_id) do update set projection_version=excluded.projection_version,why=excluded.why,outcome=excluded.outcome,primary_goal_ids=excluded.primary_goal_ids,state=excluded.state,current_prototype_id=excluded.current_prototype_id,active_code_line_id=excluded.active_code_line_id,current_wbs_gate=excluded.current_wbs_gate,next_action=excluded.next_action,blockers=excluded.blockers,owner=excluded.owner,founder_burden=excluded.founder_burden,health=excluded.health,last_event_id=excluded.last_event_id,verified_at=excluded.verified_at,stale_after=excluded.stale_after,updated_at=excluded.updated_at;
  perform set_config('cns.projection_writer','off',true);
  perform cns.invalidate_context_for_project(p_project_id,'PROJECTION_REBUILT');
  return v_event.event_id;
exception when others then perform set_config('cns.projection_writer','off',true); raise;
end; $$;

create or replace function cns.rebuild_all_project_states()
returns table(project_id text,event_id bigint) language plpgsql security definer set search_path=cns,public as $$
declare r record;
begin
  for r in select distinct e.project_id from cns.events e where e.project_id is not null and e.event_type='PROJECT_STATE_COMMITTED' loop
    project_id:=r.project_id; event_id:=cns.rebuild_project_state(r.project_id); return next;
  end loop;
end; $$;

-- Legacy hydration staging. Raw legacy evidence is retained; it is never silently normalised away.
create table if not exists cns.legacy_import_queue (
  import_id uuid primary key default gen_random_uuid(),
  source_id text not null references cns.source_registry(source_id) on delete restrict,
  source_revision text not null,
  entity_type text not null,
  entity_key text not null,
  raw_payload jsonb not null,
  raw_fingerprint text not null,
  state text not null default 'STAGED' check(state in ('STAGED','HYDRATED','AMBIGUOUS','REJECTED')),
  ambiguity jsonb,
  staged_at timestamptz not null default now(),
  hydrated_at timestamptz,
  unique(source_id,source_revision,entity_type,entity_key)
);

create or replace function cns.stage_legacy_entity(p_source_id text,p_source_revision text,p_entity_type text,p_entity_key text,p_payload jsonb)
returns uuid language plpgsql security definer set search_path=cns,public as $$
declare v_id uuid; v_fp text;
begin
  v_fp:=encode(digest(p_payload::text,'sha256'),'hex');
  insert into cns.legacy_import_queue(source_id,source_revision,entity_type,entity_key,raw_payload,raw_fingerprint)
  values(p_source_id,p_source_revision,p_entity_type,p_entity_key,p_payload,v_fp)
  on conflict(source_id,source_revision,entity_type,entity_key) do update set raw_payload=excluded.raw_payload,raw_fingerprint=excluded.raw_fingerprint,staged_at=now()
  returning import_id into v_id;
  return v_id;
end; $$;

create or replace function cns.record_parity(p_project_id text,p_dimension text,p_legacy jsonb,p_cns jsonb,p_evidence jsonb default '{}'::jsonb)
returns text language plpgsql security definer set search_path=cns,public as $$
declare lfp text; cfp text; r text;
begin
  lfp:=case when p_legacy is null then null else encode(digest(p_legacy::text,'sha256'),'hex') end;
  cfp:=case when p_cns is null then null else encode(digest(p_cns::text,'sha256'),'hex') end;
  r:=case when p_legacy is null then 'MISSING_LEGACY' when p_cns is null then 'MISSING_CNS' when lfp=cfp then 'MATCH' else 'MISMATCH' end;
  insert into cns.parity_results(project_id,dimension,legacy_fingerprint,cns_fingerprint,result,evidence) values(p_project_id,p_dimension,lfp,cfp,r,coalesce(p_evidence,'{}'::jsonb));
  return r;
end; $$;

create or replace view cns.v_cutover_readiness with (security_invoker=true) as
select
  not exists(select 1 from cns.parity_results where result<>'MATCH') as parity_green,
  not exists(select 1 from cns.health_incidents where state in ('OPEN','ACKNOWLEDGED') and severity='P0') as no_open_p0,
  not exists(select 1 from cns.doctor_violations where severity='P0') as invariants_green,
  coalesce((select value->>'mode' from cns.system_meta where key='authority_mode'),'UNKNOWN') as authority_mode,
  coalesce((select (value->>'cutover_authorized')::boolean from cns.system_meta where key='authority_mode'),false) as cutover_authorized;

-- Full dependency cycle detector (project graph).
create or replace view cns.v_dependency_cycles with (security_invoker=true) as
with recursive walk as (
  select d.project_id as origin,d.depends_on_project_id as node,array[d.project_id,d.depends_on_project_id]::text[] as path
  from cns.dependencies d where d.state='OPEN' and d.depends_on_project_id is not null
  union all
  select w.origin,d.depends_on_project_id,w.path||d.depends_on_project_id
  from walk w join cns.dependencies d on d.project_id=w.node
  where d.state='OPEN' and d.depends_on_project_id is not null and array_length(w.path,1)<100 and not (d.depends_on_project_id=any(w.path))
)
select distinct origin as project_id,node,path from walk where node=origin;

create or replace view cns.doctor_violations_v2 with (security_invoker=true) as
select * from cns.doctor_violations
union all
select 'DEPENDENCY_CYCLE','P0','PROJECT',project_id,project_id,'Circular blocking project dependency' from cns.v_dependency_cycles
union all
select 'PARITY_NOT_MATCH','P0','PARITY',coalesce(project_id,'GLOBAL')||':'||dimension,project_id,'Legacy/CNS parity is not MATCH'
from cns.parity_results where result<>'MATCH';

create or replace function cns.doctor_scan()
returns integer language plpgsql security definer set search_path=cns,public as $$
declare v_count integer;
begin
  perform cns.expire_dead_leases();
  insert into cns.health_incidents(fingerprint,rule_id,severity,entity_type,entity_id,project_id,summary,evidence,state)
  select encode(digest(rule_id||'|'||entity_type||'|'||entity_id,'sha256'),'hex'),rule_id,severity,entity_type,entity_id,project_id,summary,'[]'::jsonb,'OPEN'
  from cns.doctor_violations_v2
  on conflict(fingerprint) where state in ('OPEN','ACKNOWLEDGED') do update set last_seen_at=now(),summary=excluded.summary,severity=excluded.severity;
  get diagnostics v_count=row_count;
  update cns.health_incidents i set state='RESOLVED',resolved_at=now(),last_seen_at=now()
  where i.state in ('OPEN','ACKNOWLEDGED') and not exists(
    select 1 from cns.doctor_violations_v2 v where encode(digest(v.rule_id||'|'||v.entity_type||'|'||v.entity_id,'sha256'),'hex')=i.fingerprint
  );
  return v_count;
end; $$;

-- Retry / dead-letter mechanics.
create or replace function cns.claim_next_job(p_agent_id text)
returns uuid language plpgsql security definer set search_path=cns,public as $$
declare v_job uuid;
begin
  select job_id into v_job from cns.jobs where state='QUEUED' and available_at<=now() order by priority,available_at for update skip locked limit 1;
  if v_job is null then return null; end if;
  update cns.jobs set state='LEASED',attempts=attempts+1,updated_at=now() where job_id=v_job;
  return v_job;
end; $$;

create or replace function cns.fail_job(p_job_id uuid,p_error jsonb,p_retry_seconds integer default 60)
returns text language plpgsql security definer set search_path=cns,public as $$
declare j cns.jobs%rowtype; v_state text;
begin
  select * into j from cns.jobs where job_id=p_job_id for update;
  if not found then raise exception 'CNS_JOB_NOT_FOUND'; end if;
  if j.attempts>=j.max_attempts then
    v_state:='DEAD';
    update cns.jobs set state='DEAD',last_error=p_error,updated_at=now() where job_id=p_job_id;
    insert into cns.dead_letters(job_id,reason,payload) values(p_job_id,'MAX_ATTEMPTS',jsonb_build_object('error',p_error,'job',to_jsonb(j)));
  else
    v_state:='QUEUED';
    update cns.jobs set state='QUEUED',last_error=p_error,available_at=now()+make_interval(secs=>greatest(p_retry_seconds,1)),updated_at=now() where job_id=p_job_id;
  end if;
  return v_state;
end; $$;

-- Complete delayed FK after context table exists.
do $$ begin
  if not exists(select 1 from pg_constraint where conname='cns_agent_runs_context_snapshot_fk') then
    alter table cns.agent_runs add constraint cns_agent_runs_context_snapshot_fk foreign key(context_snapshot_id) references cns.context_snapshots(context_snapshot_id) on delete restrict;
  end if;
end $$;

revoke all on cns.project_current_state from service_role;
grant select on cns.project_current_state to service_role;
grant execute on function cns.commit_project_state(text,jsonb,text,text,text,text,text,text,integer,jsonb) to service_role;
grant execute on function cns.rebuild_project_state(text,integer) to service_role;
grant execute on function cns.rebuild_all_project_states() to service_role;

update cns.system_meta set value='{"version":2,"migration":"20260824030500_cns_kernel_02_hardening"}'::jsonb,updated_at=now() where key='schema_version';

commit;
