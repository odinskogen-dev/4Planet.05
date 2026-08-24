-- 4PLANET CNS KERNEL 02 — acceptance hardening
-- Deterministic routing/context, immutable prototype identities, dual-read and fail-closed cutover gates.

begin;

-- ---------------------------------------------------------------------------
-- ENTITY ROUTING + DEPENDENCY RESOLUTION
-- ---------------------------------------------------------------------------
create table if not exists cns.entity_routes (
  entity_route_id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id text not null,
  project_id text not null references cns.projects(project_id) on delete restrict,
  route_kind text not null default 'PRIMARY' check (route_kind in ('PRIMARY','RELATED','EVIDENCE','ARCHIVE')),
  priority smallint not null default 1 check (priority between 1 and 9),
  source_id text references cns.source_registry(source_id) on delete restrict,
  source_revision text,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now(),
  unique(entity_type,entity_id,project_id,route_kind)
);

create index if not exists cns_entity_routes_lookup_idx
  on cns.entity_routes(entity_type,entity_id,route_kind,priority,project_id);

create or replace function cns.resolve_entity_project(p_entity_type text,p_entity_id text)
returns text
language plpgsql
security definer
set search_path=cns,public
as $$
declare
  v_project text;
  v_best_priority smallint;
  v_best_count integer;
begin
  select min(priority) into v_best_priority
  from cns.entity_routes
  where entity_type=p_entity_type and entity_id=p_entity_id and route_kind='PRIMARY';
  if v_best_priority is null then raise exception 'CNS_ENTITY_ROUTE_REQUIRED'; end if;

  select count(*),min(project_id) into v_best_count,v_project
  from cns.entity_routes
  where entity_type=p_entity_type and entity_id=p_entity_id and route_kind='PRIMARY' and priority=v_best_priority;
  if v_best_count <> 1 then raise exception 'CNS_ENTITY_ROUTE_AMBIGUOUS'; end if;
  return v_project;
end;
$$;

create or replace function cns.dependency_closure(p_project_id text,p_max_depth integer default 8)
returns jsonb
language sql
security definer
set search_path=cns,public
as $$
with recursive walk as (
  select d.dependency_id,d.project_id,d.task_id,d.depends_on_project_id,d.depends_on_task_id,d.dependency_type,d.state,d.description,1 as depth,
         array[d.project_id,coalesce(d.depends_on_project_id,'TASK:'||coalesce(d.depends_on_task_id,''))]::text[] as path
  from cns.dependencies d
  where d.project_id=p_project_id and d.state='OPEN'
  union all
  select d.dependency_id,d.project_id,d.task_id,d.depends_on_project_id,d.depends_on_task_id,d.dependency_type,d.state,d.description,w.depth+1,
         w.path||coalesce(d.depends_on_project_id,'TASK:'||coalesce(d.depends_on_task_id,''))
  from walk w
  join cns.dependencies d on d.project_id=w.depends_on_project_id
  where w.depends_on_project_id is not null
    and d.state='OPEN'
    and w.depth < greatest(1,least(p_max_depth,32))
    and not coalesce(d.depends_on_project_id,'TASK:'||coalesce(d.depends_on_task_id,'')) = any(w.path)
)
select coalesce(jsonb_agg(jsonb_build_object(
  'dependency_id',dependency_id,'project_id',project_id,'task_id',task_id,
  'depends_on_project_id',depends_on_project_id,'depends_on_task_id',depends_on_task_id,
  'dependency_type',dependency_type,'state',state,'description',description,'depth',depth,'path',path
) order by depth,dependency_id),'[]'::jsonb)
from walk;
$$;

-- ---------------------------------------------------------------------------
-- DETERMINISTIC CONTEXT COMPILER (canonical smallint signature)
-- ---------------------------------------------------------------------------
create or replace function cns.compile_project_context(
  p_project_id text,
  p_intent text,
  p_depth smallint default 2,
  p_token_budget integer default 12000,
  p_ttl_seconds integer default 900
) returns uuid
language plpgsql security definer set search_path=cns,public as $$
declare
  v_state cns.project_current_state%rowtype;
  v_body jsonb;
  v_sources jsonb;
  v_revisions jsonb;
  v_excluded jsonb;
  v_routes jsonb;
  v_dependencies jsonb;
  v_fp text;
  v_id uuid;
begin
  if p_depth < 0 or p_depth > 4 then raise exception 'CNS_CONTEXT_DEPTH_INVALID'; end if;
  if p_token_budget < 256 or p_token_budget > 200000 then raise exception 'CNS_CONTEXT_BUDGET_INVALID'; end if;
  if p_ttl_seconds < 30 or p_ttl_seconds > 86400 then raise exception 'CNS_CONTEXT_TTL_INVALID'; end if;

  select * into v_state from cns.project_current_state where project_id=p_project_id;
  if not found then raise exception 'CNS_CURRENT_STATE_REQUIRED'; end if;
  if v_state.stale_after <= now() then raise exception 'CNS_CURRENT_STATE_STALE'; end if;

  v_excluded := case p_depth
    when 0 then '["MILESTONES","WBS","DEPENDENCY_CLOSURE","CODE","PROTOTYPES","DECISIONS","CLAIMS","EVIDENCE","ARCHIVE"]'::jsonb
    when 1 then '["CODE","PROTOTYPES","DECISIONS","CLAIMS","EVIDENCE","ARCHIVE"]'::jsonb
    when 2 then '["DECISIONS","CLAIMS","EVIDENCE","ARCHIVE"]'::jsonb
    when 3 then '["ARCHIVE"]'::jsonb
    else '[]'::jsonb end;

  select coalesce(jsonb_agg(jsonb_build_object('source_id',source_id,'revision',current_revision,'authority',authority,'truth_domain',truth_domain) order by source_id),'[]'::jsonb),
         coalesce(jsonb_object_agg(source_id,coalesce(current_revision,'UNVERSIONED') order by source_id),'{}'::jsonb)
    into v_sources,v_revisions
    from cns.source_registry where state='ACTIVE';

  select coalesce(jsonb_agg(jsonb_build_object('entity_type',entity_type,'entity_id',entity_id,'route_kind',route_kind,'priority',priority) order by entity_type,entity_id,route_kind,priority),'[]'::jsonb)
    into v_routes from cns.entity_routes where project_id=p_project_id and route_kind<>'ARCHIVE';

  v_dependencies := case when p_depth>=1 then cns.dependency_closure(p_project_id,8) else '[]'::jsonb end;

  v_body := jsonb_build_object(
    'identity', (select to_jsonb(p) from cns.projects p where p.project_id=p_project_id),
    'entity_routes', v_routes,
    'current_state', to_jsonb(v_state),
    'goals', coalesce((select jsonb_agg(to_jsonb(g) order by g.priority,g.goal_id) from cns.goals g where g.project_id=p_project_id and g.state='ACTIVE'),'[]'::jsonb),
    'milestones', case when p_depth>=1 then coalesce((select jsonb_agg(to_jsonb(m) order by m.target_at nulls last,m.milestone_id) from cns.milestones m where m.project_id=p_project_id and m.state in ('ACTIVE','BLOCKED','PLANNED')),'[]'::jsonb) else '[]'::jsonb end,
    'tasks', case when p_depth>=1 then coalesce((select jsonb_agg(to_jsonb(t) order by t.priority,t.updated_at desc,t.task_id) from (select * from cns.tasks where project_id=p_project_id and state in ('READY','ACTIVE','BLOCKED','REVIEW') order by priority,updated_at desc,task_id limit 100) t),'[]'::jsonb) else '[]'::jsonb end,
    'dependency_closure', v_dependencies,
    'code_lines', case when p_depth>=2 then coalesce((select jsonb_agg(to_jsonb(c) order by c.seam,c.role,c.code_line_id) from cns.code_lines c where c.project_id=p_project_id and c.role in ('ACTIVE_DEVELOPMENT','FIXED_REVIEW','PRODUCTION')),'[]'::jsonb) else '[]'::jsonb end,
    'prototypes', case when p_depth>=2 then coalesce((select jsonb_agg(to_jsonb(pr) order by pr.version desc,pr.prototype_id) from cns.prototypes pr where pr.project_id=p_project_id and pr.role in ('ACTIVE_DEVELOPMENT','FIXED_REVIEW','PRODUCTION')),'[]'::jsonb) else '[]'::jsonb end,
    'decisions', case when p_depth>=3 then coalesce((select jsonb_agg(to_jsonb(d) order by d.decided_at desc nulls last,d.decision_id) from cns.decisions d where d.project_id=p_project_id and d.status='ACTIVE'),'[]'::jsonb) else '[]'::jsonb end,
    'claims', case when p_depth>=3 then coalesce((select jsonb_agg(to_jsonb(c) order by c.subject_type,c.subject_id,c.predicate,c.claim_id) from cns.claims c where c.project_id=p_project_id and c.state in ('ACTIVE','DISPUTED')),'[]'::jsonb) else '[]'::jsonb end,
    'memories', coalesce((select jsonb_agg(to_jsonb(mi) order by mi.depth,mi.updated_at desc,mi.memory_id) from (select * from cns.memory_items where (project_id=p_project_id or project_id is null) and state='ACTIVE' and depth<=p_depth order by depth,updated_at desc,memory_id limit 200) mi),'[]'::jsonb),
    'intent', p_intent,
    'requested_depth', p_depth,
    'token_budget', p_token_budget,
    'explicit_exclusions', v_excluded
  );

  if length(v_body::text) > p_token_budget * 6 then
    raise exception 'CNS_CONTEXT_BUDGET_EXCEEDED: deterministic compiler refuses silent truncation';
  end if;

  v_fp := encode(digest(v_body::text||v_revisions::text||v_state.last_event_id::text,'sha256'),'hex');
  insert into cns.context_snapshots(project_id,intent,requested_depth,token_budget,state_event_id,compiled_context,included_sources,excluded_namespaces,source_revisions,fingerprint,expires_at)
  values(p_project_id,p_intent,p_depth,p_token_budget,v_state.last_event_id,v_body,v_sources,v_excluded,v_revisions,v_fp,now()+make_interval(secs=>p_ttl_seconds))
  returning context_snapshot_id into v_id;
  return v_id;
end;
$$;

create or replace function cns.compile_entity_context(
  p_entity_type text,
  p_entity_id text,
  p_intent text,
  p_depth integer default 2,
  p_token_budget integer default 12000,
  p_ttl_seconds integer default 900
) returns uuid
language plpgsql security definer set search_path=cns,public as $$
declare v_project text;
begin
  v_project:=cns.resolve_entity_project(p_entity_type,p_entity_id);
  return cns.compile_project_context(v_project,p_intent,p_depth,p_token_budget,p_ttl_seconds);
end;
$$;

-- ---------------------------------------------------------------------------
-- AGENT ISOLATION / EPHEMERAL WORKERS
-- ---------------------------------------------------------------------------
create or replace function cns.enforce_agent_scope()
returns trigger language plpgsql as $$
begin
  if new.agent_kind='PROJECT_AGENT' and (new.scope_project_id is null or new.persistent is not true) then
    raise exception 'CNS_PROJECT_AGENT_REQUIRES_PERSISTENT_PROJECT_SCOPE';
  end if;
  if new.agent_kind='TASK_WORKER' and new.persistent is true then
    raise exception 'CNS_TASK_WORKER_MUST_BE_EPHEMERAL';
  end if;
  return new;
end;
$$;

drop trigger if exists cns_agent_scope_guard on cns.agents;
create trigger cns_agent_scope_guard before insert or update on cns.agents
for each row execute function cns.enforce_agent_scope();

-- ---------------------------------------------------------------------------
-- IMMUTABLE PROTOTYPE / ARTIFACT IDENTITY
-- ---------------------------------------------------------------------------
create or replace function cns.guard_prototype_identity()
returns trigger language plpgsql as $$
begin
  if new.project_id is distinct from old.project_id or new.version is distinct from old.version then
    raise exception 'CNS_PROTOTYPE_IDENTITY_IMMUTABLE';
  end if;
  if old.exact_sha is not null and new.exact_sha is distinct from old.exact_sha then
    raise exception 'CNS_PROTOTYPE_EXACT_SHA_IMMUTABLE';
  end if;
  if old.immutable_url is not null and new.immutable_url is distinct from old.immutable_url then
    raise exception 'CNS_PROTOTYPE_IMMUTABLE_URL_IMMUTABLE';
  end if;
  return new;
end;
$$;

drop trigger if exists cns_prototype_identity_guard on cns.prototypes;
create trigger cns_prototype_identity_guard before update on cns.prototypes
for each row execute function cns.guard_prototype_identity();

create or replace function cns.guard_immutable_artifact()
returns trigger language plpgsql as $$
begin
  if old.immutable and (new.uri is distinct from old.uri or new.content_hash is distinct from old.content_hash or new.project_id is distinct from old.project_id) then
    raise exception 'CNS_IMMUTABLE_ARTIFACT_MUTATION_FORBIDDEN';
  end if;
  return new;
end;
$$;

drop trigger if exists cns_immutable_artifact_guard on cns.artifacts;
create trigger cns_immutable_artifact_guard before update on cns.artifacts
for each row execute function cns.guard_immutable_artifact();

-- ---------------------------------------------------------------------------
-- DUAL READ + FAIL-CLOSED CUTOVER
-- ---------------------------------------------------------------------------
create table if not exists cns.dual_read_runs (
  dual_read_run_id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  state text not null default 'RUNNING' check (state in ('RUNNING','PASS','FAIL','ERROR')),
  legacy_revision_set jsonb not null default '{}'::jsonb,
  cns_event_watermark bigint,
  assertions_total integer not null default 0,
  mismatches integer not null default 0,
  evidence jsonb not null default '{}'::jsonb
);

create table if not exists cns.dual_read_assertions (
  dual_read_assertion_id bigint generated always as identity primary key,
  dual_read_run_id uuid not null references cns.dual_read_runs(dual_read_run_id) on delete restrict,
  project_id text references cns.projects(project_id) on delete restrict,
  dimension text not null,
  legacy_fingerprint text,
  cns_fingerprint text,
  result text not null check (result in ('MATCH','MISMATCH','MISSING_LEGACY','MISSING_CNS','AMBIGUOUS')),
  evidence jsonb not null default '{}'::jsonb
);

create index if not exists cns_dual_read_assertions_run_idx on cns.dual_read_assertions(dual_read_run_id,result,project_id);

create or replace function cns.finish_dual_read(p_run uuid)
returns text language plpgsql security definer set search_path=cns,public as $$
declare v_total integer; v_bad integer; v_state text;
begin
  select count(*),count(*) filter(where result<>'MATCH') into v_total,v_bad from cns.dual_read_assertions where dual_read_run_id=p_run;
  v_state:=case when v_total>0 and v_bad=0 then 'PASS' else 'FAIL' end;
  update cns.dual_read_runs set assertions_total=v_total,mismatches=v_bad,state=v_state,finished_at=now() where dual_read_run_id=p_run;
  return v_state;
end;
$$;

-- Existing parity model must not report green on an empty set. We deliberately rebuild
-- the view because PostgreSQL cannot insert/reorder columns through CREATE OR REPLACE VIEW.
drop view if exists cns.v_cutover_readiness;
create view cns.v_cutover_readiness with (security_invoker=true) as
select
  (exists(select 1 from cns.parity_results) and not exists(select 1 from cns.parity_results where result<>'MATCH')) as parity_green,
  (exists(select 1 from cns.legacy_import_queue) and not exists(select 1 from cns.legacy_import_queue where state in ('STAGED','AMBIGUOUS'))) as hydration_green,
  (coalesce((select state='PASS' from cns.dual_read_runs order by finished_at desc nulls last,started_at desc limit 1),false)) as dual_read_green,
  not exists(select 1 from cns.health_incidents where state in ('OPEN','ACKNOWLEDGED') and severity='P0') as no_open_p0,
  not exists(select 1 from cns.doctor_violations_v2 where severity='P0') as invariants_green,
  coalesce((select (value->>'verified')::boolean from cns.system_meta where key='remote_readback'),false) as remote_readback_green,
  coalesce((select (value->>'verified')::boolean from cns.system_meta where key='backup_restore'),false) as backup_restore_green,
  coalesce((select (value->>'verified')::boolean from cns.system_meta where key='fresh_session'),false) as fresh_session_green,
  coalesce((select (value->>'verified')::boolean from cns.system_meta where key='security_review'),false) as security_green,
  coalesce((select (value->>'verified')::boolean from cns.system_meta where key='golden_eval'),false) as golden_eval_green,
  coalesce((select value->>'mode' from cns.system_meta where key='authority_mode'),'UNKNOWN') as authority_mode,
  coalesce((select (value->>'cutover_authorized')::boolean from cns.system_meta where key='authority_mode'),false) as cutover_authorized;

-- ---------------------------------------------------------------------------
-- GENERATED ROADMAP + richer code state
-- ---------------------------------------------------------------------------
create or replace view cns.v_roadmap with (security_invoker=true) as
select p.project_id,p.name as project_name,g.goal_id,g.title as goal_title,g.priority as goal_priority,
       m.milestone_id,m.title as milestone_title,m.state as milestone_state,m.target_at,
       s.state as project_state,s.health,s.next_action,s.current_wbs_gate,s.founder_burden
from cns.projects p
left join cns.project_current_state s using(project_id)
left join cns.goals g on g.project_id=p.project_id and g.state='ACTIVE'
left join cns.milestones m on m.project_id=p.project_id and (m.goal_id=g.goal_id or g.goal_id is null) and m.state not in ('REJECTED','SUPERSEDED')
where p.lifecycle not in ('ARCHIVED','SUPERSEDED')
order by g.priority nulls last,m.target_at nulls last,p.project_id,m.milestone_id;

-- Same signature but additional columns: rebuild rather than rename an existing column position.
drop view if exists cns.v_branch_code_state;
create view cns.v_branch_code_state with (security_invoker=true) as
select code_line_id,project_id,seam,role,repository,branch,pr_number,base_sha,exact_sha,observed_sha,
       (exact_sha is not distinct from observed_sha) as sha_matches,pr_state,merge_state,deployment_state,deployment_ref,
       github_verified_at,verified_at,stale_after
from cns.code_lines where role not in ('SUPERSEDED','ARCHIVED');

revoke all on cns.entity_routes,cns.dual_read_runs,cns.dual_read_assertions from public,anon,authenticated;
revoke all on function cns.resolve_entity_project(text,text) from public,anon,authenticated;
revoke all on function cns.dependency_closure(text,integer) from public,anon,authenticated;
revoke all on function cns.compile_entity_context(text,text,text,integer,integer,integer) from public,anon,authenticated;
revoke all on function cns.finish_dual_read(uuid) from public,anon,authenticated;

grant select,insert,update,delete on cns.entity_routes,cns.dual_read_runs,cns.dual_read_assertions to service_role;
grant execute on function cns.resolve_entity_project(text,text) to service_role;
grant execute on function cns.dependency_closure(text,integer) to service_role;
grant execute on function cns.compile_entity_context(text,text,text,integer,integer,integer) to service_role;
grant execute on function cns.finish_dual_read(uuid) to service_role;

grant select on cns.v_roadmap to service_role;
grant select on cns.v_cutover_readiness to service_role;
grant select on cns.v_branch_code_state to service_role;

update cns.system_meta
set value='{"version":2,"migration":"20260824190000_cns_acceptance_hardening"}'::jsonb,updated_at=now()
where key='schema_version';

commit;
