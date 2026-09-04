-- RECOVERED FROM APPLIED 4PLANET-STAGING MIGRATION JOURNAL 2026-09-03
-- SUPERBRAIN AUTHORITY ROUTING + GENERAL PUBLIC/PRIVATE SENTINEL
-- Prevents newest-wins/wrong-authority promotion and gives public surfaces an explicit fail-closed export path.

begin;

create table if not exists cns.authority_bindings (
  binding_id uuid primary key default gen_random_uuid(),
  project_id text not null references cns.projects(project_id) on delete restrict,
  surface text not null check(surface in ('CURRENT_STATE','CANON','CODE','PROTOTYPE','PUBLICATION','CAPITAL','OUTREACH','PRIVATE_CONTEXT')),
  authority text not null,
  source_id text references cns.source_registry(source_id) on delete restrict,
  role text not null default 'PRIMARY' check(role in ('PRIMARY','CONTRIBUTOR','FALLBACK')),
  precedence integer not null default 100 check(precedence>0),
  founder_locked boolean not null default false,
  state text not null default 'ACTIVE' check(state in ('ACTIVE','SUPERSEDED','REVOKED')),
  valid_from timestamptz not null default clock_timestamp(),
  valid_until timestamptz,
  notes text,
  created_at timestamptz not null default clock_timestamp(),
  check(valid_until is null or valid_until>valid_from)
);
create unique index if not exists cns_one_primary_authority_per_surface on cns.authority_bindings(project_id,surface) where role='PRIMARY' and state='ACTIVE';
create index if not exists cns_authority_binding_lookup_idx on cns.authority_bindings(project_id,surface,state,role,precedence);

create or replace view cns.v_authority_routes with (security_invoker=true) as
select b.project_id,b.surface,b.authority,b.source_id,b.role,b.precedence,b.founder_locked,b.valid_from,b.valid_until,s.current_revision,s.state as source_state,s.truth_domain,s.last_verified_at,s.freshness_seconds
from cns.authority_bindings b left join cns.source_registry s on s.source_id=b.source_id
where b.state='ACTIVE' and b.valid_from<=clock_timestamp() and (b.valid_until is null or b.valid_until>clock_timestamp());

create or replace function cns.authority_enforcement_enabled()
returns boolean language sql stable security definer set search_path=cns,public as $$
  select coalesce((select (value->>'enabled')::boolean from cns.system_meta where key='authority_enforcement'),false)
$$;

create or replace function cns.assert_authorized_write(p_project_id text,p_surface text,p_authority text,p_source_id text,p_source_revision text)
returns void language plpgsql security definer set search_path=cns,public as $$
declare b cns.v_authority_routes%rowtype;
begin
  if not cns.authority_enforcement_enabled() then return; end if;
  select * into b from cns.v_authority_routes where project_id=p_project_id and surface=p_surface and role='PRIMARY' limit 1;
  if not found then raise exception 'CNS_AUTHORITY_PRIMARY_BINDING_REQUIRED:%:%',p_project_id,p_surface; end if;
  if b.authority is distinct from p_authority then raise exception 'CNS_WRONG_AUTHORITY:% expected=% got=%',p_surface,b.authority,p_authority; end if;
  if b.source_id is not null and b.source_id is distinct from p_source_id then raise exception 'CNS_WRONG_AUTHORITY_SOURCE:% expected=% got=%',p_surface,b.source_id,p_source_id; end if;
  if b.source_id is not null then
    if p_source_revision is null or b.current_revision is distinct from p_source_revision then raise exception 'CNS_AUTHORITY_SOURCE_REVISION_STALE:% expected=% got=%',b.source_id,b.current_revision,p_source_revision; end if;
    if b.source_state is distinct from 'ACTIVE' then raise exception 'CNS_AUTHORITY_SOURCE_NOT_ACTIVE:%:%',b.source_id,b.source_state; end if;
  end if;
end; $$;

create or replace function cns.commit_project_state(
  p_project_id text,p_state jsonb,p_actor_type text,p_actor_id text,p_authority text,
  p_source_id text,p_source_revision text,p_idempotency_key text,p_ttl_seconds integer default 3600,
  p_evidence_refs jsonb default '[]'::jsonb
) returns bigint language plpgsql security definer set search_path=cns,public as $$
declare v_event bigint;
begin
  if p_ttl_seconds < 60 or p_ttl_seconds > 86400 then raise exception 'CNS_STATE_TTL_OUT_OF_RANGE'; end if;
  if coalesce(p_state->>'state','') not in ('IDEA','INCUBATION','ACTIVE','PAUSED','BLOCKED','CLOSED','ARCHIVED') then raise exception 'CNS_STATE_INVALID'; end if;
  perform cns.assert_authorized_write(p_project_id,'CURRENT_STATE',p_authority,p_source_id,p_source_revision);
  v_event := cns.append_event(p_project_id,'PROJECT',p_project_id,'PROJECT_STATE_COMMITTED',p_state,p_evidence_refs,p_actor_type,p_actor_id,p_authority,p_source_id,p_source_revision,p_idempotency_key);
  perform set_config('cns.projection_writer','on',true);
  insert into cns.project_current_state(project_id,projection_version,why,outcome,primary_goal_ids,state,current_prototype_id,active_code_line_id,current_wbs_gate,next_action,blockers,owner,founder_burden,health,last_event_id,verified_at,stale_after,updated_at)
  values(p_project_id,coalesce((p_state->>'projection_version')::integer,1),p_state->>'why',p_state->>'outcome',coalesce(array(select jsonb_array_elements_text(coalesce(p_state->'primary_goal_ids','[]'::jsonb))),array[]::text[]),p_state->>'state',nullif(p_state->>'current_prototype_id',''),nullif(p_state->>'active_code_line_id',''),p_state->>'current_wbs_gate',p_state->>'next_action',coalesce(p_state->'blockers','[]'::jsonb),p_state->>'owner',coalesce(p_state->>'founder_burden','NONE'),coalesce(p_state->>'health','UNKNOWN'),v_event,clock_timestamp(),clock_timestamp()+make_interval(secs=>p_ttl_seconds),clock_timestamp())
  on conflict(project_id) do update set projection_version=excluded.projection_version,why=excluded.why,outcome=excluded.outcome,primary_goal_ids=excluded.primary_goal_ids,state=excluded.state,current_prototype_id=excluded.current_prototype_id,active_code_line_id=excluded.active_code_line_id,current_wbs_gate=excluded.current_wbs_gate,next_action=excluded.next_action,blockers=excluded.blockers,owner=excluded.owner,founder_burden=excluded.founder_burden,health=excluded.health,last_event_id=excluded.last_event_id,verified_at=excluded.verified_at,stale_after=excluded.stale_after,updated_at=excluded.updated_at;
  perform set_config('cns.projection_writer','off',true);
  return v_event;
exception when others then perform set_config('cns.projection_writer','off',true); raise;
end; $$;

create or replace view cns.v_authority_violations with (security_invoker=true) as
select 'ACTIVE_PROJECT_MISSING_CURRENT_AUTHORITY'::text rule_id,'P0'::text severity,'PROJECT'::text entity_type,p.project_id entity_id,p.project_id,'Authority enforcement is enabled but active project has no PRIMARY CURRENT_STATE route'::text summary
from cns.projects p where cns.authority_enforcement_enabled() and p.lifecycle='ACTIVE' and not exists(select 1 from cns.v_authority_routes b where b.project_id=p.project_id and b.surface='CURRENT_STATE' and b.role='PRIMARY')
union all
select 'AUTHORITY_SOURCE_MISSING','P0','AUTHORITY',b.binding_id::text,b.project_id,'Primary authority binding points to no source identity' from cns.authority_bindings b where b.state='ACTIVE' and b.role='PRIMARY' and b.source_id is null
union all
select 'AUTHORITY_SOURCE_NOT_ACTIVE','P0','AUTHORITY',b.binding_id::text,b.project_id,'Primary authority source is not ACTIVE' from cns.authority_bindings b join cns.source_registry s on s.source_id=b.source_id where b.state='ACTIVE' and b.role='PRIMARY' and s.state<>'ACTIVE';

do $$ begin
  if not exists(select 1 from information_schema.columns where table_schema='cns' and table_name='source_registry' and column_name='sensitivity_state') then alter table cns.source_registry add column sensitivity_state text not null default 'INTERNAL' check(sensitivity_state in ('PUBLIC','INTERNAL','RESTRICTED','SECRET')); end if;
  if not exists(select 1 from information_schema.columns where table_schema='cns' and table_name='claims' and column_name='sensitivity_state') then alter table cns.claims add column sensitivity_state text not null default 'INTERNAL' check(sensitivity_state in ('PUBLIC','INTERNAL','RESTRICTED','SECRET')); end if;
  if not exists(select 1 from information_schema.columns where table_schema='cns' and table_name='evidence' and column_name='sensitivity_state') then alter table cns.evidence add column sensitivity_state text not null default 'INTERNAL' check(sensitivity_state in ('PUBLIC','INTERNAL','RESTRICTED','SECRET')); end if;
  if not exists(select 1 from information_schema.columns where table_schema='cns' and table_name='memory_items' and column_name='sensitivity_state') then alter table cns.memory_items add column sensitivity_state text not null default 'INTERNAL' check(sensitivity_state in ('PUBLIC','INTERNAL','RESTRICTED','SECRET')); end if;
  if not exists(select 1 from information_schema.columns where table_schema='cns' and table_name='artifacts' and column_name='sensitivity_state') then alter table cns.artifacts add column sensitivity_state text not null default 'INTERNAL' check(sensitivity_state in ('PUBLIC','INTERNAL','RESTRICTED','SECRET')); end if;
end $$;

create or replace view cns.v_public_claims with (security_invoker=true) as select c.claim_id,c.project_id,c.subject_type,c.subject_id,c.predicate,c.value,c.authority,c.confidence,c.state,c.claim_kind,c.knowledge_state,c.valid_time_start,c.valid_time_end,c.observed_at,c.geography,c.unit,c.scope,c.revision,c.supersedes_claim_id from cns.claims c where c.sensitivity_state='PUBLIC' and c.state in ('ACTIVE','DISPUTED');
create or replace view cns.v_public_evidence with (security_invoker=true) as select e.evidence_id,e.project_id,e.evidence_type,e.source_id,e.source_revision,e.uri,e.content_hash,e.observed_at,e.verified_at,e.state from cns.evidence e join cns.source_registry s on s.source_id=e.source_id where e.sensitivity_state='PUBLIC' and s.sensitivity_state='PUBLIC' and e.state in ('ACTIVE','DISPUTED');
create or replace view cns.v_public_artifacts with (security_invoker=true) as select artifact_id,project_id,artifact_type,title,uri,content_hash,source_system,role,immutable,verified_at,created_at from cns.artifacts where sensitivity_state='PUBLIC' and role in ('CURRENT','EVIDENCE');
create or replace view cns.v_public_truth_export with (security_invoker=true) as select 'CLAIM'::text object_type,c.claim_id::text object_id,c.project_id,jsonb_build_object('subject_type',c.subject_type,'subject_id',c.subject_id,'predicate',c.predicate,'value',c.value,'knowledge_state',c.knowledge_state,'confidence',c.confidence,'scope',c.scope,'valid_time_start',c.valid_time_start,'valid_time_end',c.valid_time_end) payload from cns.v_public_claims c union all select 'EVIDENCE',e.evidence_id,e.project_id,jsonb_build_object('type',e.evidence_type,'source_id',e.source_id,'source_revision',e.source_revision,'uri',e.uri,'verified_at',e.verified_at) from cns.v_public_evidence e union all select 'ARTIFACT',a.artifact_id,a.project_id,jsonb_build_object('type',a.artifact_type,'title',a.title,'uri',a.uri,'role',a.role,'immutable',a.immutable) from cns.v_public_artifacts a;
create or replace view cns.v_privacy_violations with (security_invoker=true) as select 'PUBLIC_CLAIM_RESTRICTED_SOURCE'::text rule_id,'P0'::text severity,'CLAIM'::text entity_type,c.claim_id entity_id,c.project_id,'Public claim references a source not classified PUBLIC'::text summary from cns.claims c join cns.source_registry s on s.source_id=c.source_id where c.sensitivity_state='PUBLIC' and s.sensitivity_state<>'PUBLIC' and c.state in ('ACTIVE','DISPUTED') union all select 'PUBLIC_EVIDENCE_RESTRICTED_SOURCE','P0','EVIDENCE',e.evidence_id,e.project_id,'Public evidence references a source not classified PUBLIC' from cns.evidence e join cns.source_registry s on s.source_id=e.source_id where e.sensitivity_state='PUBLIC' and s.sensitivity_state<>'PUBLIC' and e.state in ('ACTIVE','DISPUTED');
create or replace view cns.v_superbrain_violations with (security_invoker=true) as select * from cns.v_operational_truth_violations union all select * from cns.v_authority_violations union all select * from cns.v_privacy_violations;
create or replace function cns.doctor_scan() returns integer language plpgsql security definer set search_path=cns,public as $$ declare v_count integer; begin perform cns.expire_dead_leases(); insert into cns.health_incidents(fingerprint,rule_id,severity,entity_type,entity_id,project_id,summary,evidence,state) select encode(digest(rule_id||'|'||entity_type||'|'||entity_id,'sha256'),'hex'),rule_id,severity,entity_type,entity_id,project_id,summary,'[]'::jsonb,'OPEN' from cns.v_superbrain_violations on conflict(fingerprint) where state in ('OPEN','ACKNOWLEDGED') do update set last_seen_at=clock_timestamp(),summary=excluded.summary,severity=excluded.severity; get diagnostics v_count=row_count; update cns.health_incidents i set state='RESOLVED',resolved_at=clock_timestamp(),last_seen_at=clock_timestamp() where i.state in ('OPEN','ACKNOWLEDGED') and not exists(select 1 from cns.v_superbrain_violations v where encode(digest(v.rule_id||'|'||v.entity_type||'|'||v.entity_id,'sha256'),'hex')=i.fingerprint); return v_count; end; $$;

revoke all on cns.authority_bindings from public,anon,authenticated;
revoke all on function cns.assert_authorized_write(text,text,text,text,text) from public,anon,authenticated;
revoke all on function cns.authority_enforcement_enabled() from public,anon,authenticated;
grant select,insert,update on cns.authority_bindings to service_role;
grant select on cns.v_authority_routes,cns.v_authority_violations,cns.v_public_claims,cns.v_public_evidence,cns.v_public_artifacts,cns.v_public_truth_export,cns.v_privacy_violations,cns.v_superbrain_violations to service_role;
grant execute on function cns.assert_authorized_write(text,text,text,text,text) to service_role;
grant execute on function cns.authority_enforcement_enabled() to service_role;
insert into cns.system_meta(key,value) values('authority_enforcement','{"version":1,"enabled":false,"verified":false,"state":"SHADOW_CONFIG_REQUIRED"}'::jsonb),('public_export_contract','{"version":1,"verified":false,"default":"INTERNAL","state":"PENDING_CERTIFICATION"}'::jsonb) on conflict(key) do update set value=excluded.value,updated_at=clock_timestamp();
update cns.system_meta set value='{"version":7,"migration":"20260826004500_cns_authority_privacy","truth_model":"SUPERBRAIN_V4","authority_routing":"V1","privacy_export":"V1"}'::jsonb,updated_at=clock_timestamp() where key='schema_version';
commit;
