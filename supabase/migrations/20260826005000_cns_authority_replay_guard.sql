-- SUPERBRAIN AUTHORITY REPLAY GUARD — 2026-08-26
-- Wrong-authority events may exist historically, but they can never become current truth.

begin;

create or replace function cns.guard_authority_sensitive_event_insert()
returns trigger language plpgsql as $$
begin
  if cns.authority_enforcement_enabled() and new.event_type='PROJECT_STATE_COMMITTED' then
    perform cns.assert_authorized_write(new.project_id,'CURRENT_STATE',new.authority,new.source_id,new.source_revision);
  end if;
  return new;
end;
$$;

drop trigger if exists cns_events_authority_insert_guard on cns.events;
create trigger cns_events_authority_insert_guard
before insert on cns.events
for each row execute function cns.guard_authority_sensitive_event_insert();

create or replace function cns.event_authorized_for_surface(p_event_id bigint,p_surface text)
returns boolean language plpgsql stable security definer set search_path=cns,public as $$
declare e cns.events%rowtype; b cns.v_authority_routes%rowtype;
begin
  select * into e from cns.events where event_id=p_event_id;
  if not found then return false; end if;
  if not cns.authority_enforcement_enabled() then return true; end if;
  select * into b from cns.v_authority_routes
  where project_id=e.project_id and surface=p_surface and role='PRIMARY'
  limit 1;
  if not found then return false; end if;
  if b.authority is distinct from e.authority then return false; end if;
  if b.source_id is not null and b.source_id is distinct from e.source_id then return false; end if;
  if b.source_id is not null and b.current_revision is distinct from e.source_revision then return false; end if;
  if b.source_id is not null and b.source_state is distinct from 'ACTIVE' then return false; end if;
  return true;
end;
$$;

create or replace function cns.rebuild_project_state(p_project_id text,p_ttl_seconds integer default 3600)
returns bigint language plpgsql security definer set search_path=cns,public as $$
declare v_event cns.events%rowtype; v_state jsonb;
begin
  if p_ttl_seconds < 60 or p_ttl_seconds > 86400 then raise exception 'CNS_STATE_TTL_OUT_OF_RANGE'; end if;

  if cns.authority_enforcement_enabled() then
    select * into v_event
    from cns.events e
    where e.project_id=p_project_id and e.event_type='PROJECT_STATE_COMMITTED'
      and cns.event_authorized_for_surface(e.event_id,'CURRENT_STATE')
    order by e.event_id desc limit 1;
  else
    select * into v_event
    from cns.events e
    where e.project_id=p_project_id and e.event_type='PROJECT_STATE_COMMITTED'
    order by e.event_id desc limit 1;
  end if;

  if not found then raise exception 'CNS_REPLAY_AUTHORIZED_SOURCE_EVENT_MISSING'; end if;
  v_state:=v_event.payload;
  perform set_config('cns.projection_writer','on',true);
  insert into cns.project_current_state(project_id,projection_version,why,outcome,primary_goal_ids,state,current_prototype_id,active_code_line_id,current_wbs_gate,next_action,blockers,owner,founder_burden,health,last_event_id,verified_at,stale_after,updated_at)
  values(p_project_id,coalesce((v_state->>'projection_version')::integer,1),v_state->>'why',v_state->>'outcome',coalesce(array(select jsonb_array_elements_text(coalesce(v_state->'primary_goal_ids','[]'::jsonb))),array[]::text[]),v_state->>'state',nullif(v_state->>'current_prototype_id',''),nullif(v_state->>'active_code_line_id',''),v_state->>'current_wbs_gate',v_state->>'next_action',coalesce(v_state->'blockers','[]'::jsonb),v_state->>'owner',coalesce(v_state->>'founder_burden','NONE'),coalesce(v_state->>'health','UNKNOWN'),v_event.event_id,clock_timestamp(),clock_timestamp()+make_interval(secs=>p_ttl_seconds),clock_timestamp())
  on conflict(project_id) do update set projection_version=excluded.projection_version,why=excluded.why,outcome=excluded.outcome,primary_goal_ids=excluded.primary_goal_ids,state=excluded.state,current_prototype_id=excluded.current_prototype_id,active_code_line_id=excluded.active_code_line_id,current_wbs_gate=excluded.current_wbs_gate,next_action=excluded.next_action,blockers=excluded.blockers,owner=excluded.owner,founder_burden=excluded.founder_burden,health=excluded.health,last_event_id=excluded.last_event_id,verified_at=excluded.verified_at,stale_after=excluded.stale_after,updated_at=excluded.updated_at;
  perform set_config('cns.projection_writer','off',true);
  perform cns.invalidate_context_for_project(p_project_id,'PROJECTION_REBUILT');
  return v_event.event_id;
exception when others then
  perform set_config('cns.projection_writer','off',true);
  raise;
end;
$$;

create or replace view cns.v_unauthorized_state_events with (security_invoker=true) as
select e.event_id,e.project_id,e.authority,e.source_id,e.source_revision,e.occurred_at
from cns.events e
where cns.authority_enforcement_enabled()
  and e.event_type='PROJECT_STATE_COMMITTED'
  and not cns.event_authorized_for_surface(e.event_id,'CURRENT_STATE');

create or replace view cns.v_superbrain_violations_v2 with (security_invoker=true) as
select * from cns.v_superbrain_violations
union all
select 'UNAUTHORIZED_STATE_EVENT','P0','EVENT',event_id::text,project_id,
       'PROJECT_STATE_COMMITTED event is not authorized by the current PRIMARY authority route'
from cns.v_unauthorized_state_events;

create or replace function cns.doctor_scan()
returns integer language plpgsql security definer set search_path=cns,public as $$
declare v_count integer;
begin
  perform cns.expire_dead_leases();
  insert into cns.health_incidents(fingerprint,rule_id,severity,entity_type,entity_id,project_id,summary,evidence,state)
  select encode(digest(rule_id||'|'||entity_type||'|'||entity_id,'sha256'),'hex'),rule_id,severity,entity_type,entity_id,project_id,summary,'[]'::jsonb,'OPEN'
  from cns.v_superbrain_violations_v2
  on conflict(fingerprint) where state in ('OPEN','ACKNOWLEDGED') do update set last_seen_at=clock_timestamp(),summary=excluded.summary,severity=excluded.severity;
  get diagnostics v_count=row_count;
  update cns.health_incidents i set state='RESOLVED',resolved_at=clock_timestamp(),last_seen_at=clock_timestamp()
  where i.state in ('OPEN','ACKNOWLEDGED') and not exists(
    select 1 from cns.v_superbrain_violations_v2 v where encode(digest(v.rule_id||'|'||v.entity_type||'|'||v.entity_id,'sha256'),'hex')=i.fingerprint
  );
  return v_count;
end;
$$;

revoke all on function cns.guard_authority_sensitive_event_insert() from public,anon,authenticated;
revoke all on function cns.event_authorized_for_surface(bigint,text) from public,anon,authenticated;
grant select on cns.v_unauthorized_state_events,cns.v_superbrain_violations_v2 to service_role;
grant execute on function cns.event_authorized_for_surface(bigint,text) to service_role;

update cns.system_meta
set value='{"version":8,"migration":"20260826005000_cns_authority_replay_guard","truth_model":"SUPERBRAIN_V4","authority_routing":"V1_REPLAY_GUARDED","privacy_export":"V1"}'::jsonb,
    updated_at=clock_timestamp()
where key='schema_version';

commit;
