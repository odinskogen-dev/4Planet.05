-- 4PLANET BRAIN KERNEL 2 / CENTRAL NERVOUS SYSTEM
-- TOTAL SHADOW CONTROL PLANE
-- NON-AUTHORITATIVE UNTIL PARITY + DUAL-READ + CUTOVER CERTIFICATION.
-- Legacy BRAIN/Drive, Prototype SAFE and GitHub remain authoritative during migration.

begin;

create extension if not exists pgcrypto;
create schema if not exists cns;

revoke all on schema cns from public;
revoke all on schema cns from anon, authenticated;
grant usage on schema cns to service_role;

-- ---------------------------------------------------------------------------
-- SOURCES / IDENTITY
-- ---------------------------------------------------------------------------
create table if not exists cns.source_registry (
  source_id text primary key,
  source_kind text not null,
  name text not null,
  uri text,
  authority text not null,
  truth_domain text not null,
  current_revision text,
  freshness_seconds integer,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','DEGRADED','INACTIVE','SUPERSEDED','ARCHIVED')),
  last_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cns.source_revisions (
  source_revision_id uuid primary key default gen_random_uuid(),
  source_id text not null references cns.source_registry(source_id) on delete restrict,
  revision text not null,
  content_hash text,
  observed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(source_id, revision)
);

create table if not exists cns.projects (
  project_id text primary key,
  slug text unique not null,
  name text not null,
  parent_project_id text references cns.projects(project_id) on delete restrict,
  project_kind text not null default 'PROJECT',
  lifecycle text not null default 'ACTIVE' check (lifecycle in ('IDEA','INCUBATION','ACTIVE','PAUSED','BLOCKED','CLOSED','ARCHIVED','SUPERSEDED')),
  authority text not null default 'WORKING_CONTROL',
  source_id text references cns.source_registry(source_id) on delete restrict,
  source_revision text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- IMMUTABLE EVENT LEDGER
-- ---------------------------------------------------------------------------
create table if not exists cns.events (
  event_id bigint generated always as identity primary key,
  event_schema_version integer not null default 1 check (event_schema_version > 0),
  project_id text references cns.projects(project_id) on delete restrict,
  entity_type text not null,
  entity_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  evidence_refs jsonb not null default '[]'::jsonb,
  actor_type text not null check (actor_type in ('FOUNDER','AXE','AGENT','SYSTEM','EXTERNAL')),
  actor_id text,
  authority text not null,
  source_id text references cns.source_registry(source_id) on delete restrict,
  source_revision text,
  idempotency_key text not null unique,
  correlation_id uuid not null default gen_random_uuid(),
  causation_event_id bigint references cns.events(event_id) on delete restrict,
  supersedes_event_id bigint references cns.events(event_id) on delete restrict,
  occurred_at timestamptz not null default now(),
  ingested_at timestamptz not null default now(),
  event_hash text not null
);

create index if not exists cns_events_project_id_idx on cns.events(project_id, event_id desc);
create index if not exists cns_events_entity_idx on cns.events(entity_type, entity_id, event_id desc);
create index if not exists cns_events_correlation_idx on cns.events(correlation_id);
create index if not exists cns_events_type_time_idx on cns.events(event_type, occurred_at desc);

create or replace function cns.reject_event_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'CNS_EVENT_IMMUTABLE: append a correcting/superseding event';
end;
$$;

drop trigger if exists cns_events_immutable on cns.events;
create trigger cns_events_immutable
before update or delete on cns.events
for each row execute function cns.reject_event_mutation();

create or replace function cns.append_event(
  p_project_id text,
  p_entity_type text,
  p_entity_id text,
  p_event_type text,
  p_payload jsonb,
  p_evidence_refs jsonb,
  p_actor_type text,
  p_actor_id text,
  p_authority text,
  p_source_id text,
  p_source_revision text,
  p_idempotency_key text,
  p_correlation_id uuid default null,
  p_causation_event_id bigint default null,
  p_supersedes_event_id bigint default null,
  p_event_schema_version integer default 1
) returns bigint
language plpgsql
security definer
set search_path = cns, public
as $$
declare
  v_id bigint;
  v_hash text;
  v_corr uuid := coalesce(p_correlation_id, gen_random_uuid());
begin
  v_hash := encode(digest(concat_ws('|',
    p_event_schema_version::text, coalesce(p_project_id,''), p_entity_type, p_entity_id,
    p_event_type, coalesce(p_payload,'{}'::jsonb)::text,
    coalesce(p_source_id,''), coalesce(p_source_revision,''), p_idempotency_key
  ), 'sha256'), 'hex');

  insert into cns.events(
    event_schema_version, project_id, entity_type, entity_id, event_type, payload,
    evidence_refs, actor_type, actor_id, authority, source_id, source_revision,
    idempotency_key, correlation_id, causation_event_id, supersedes_event_id, event_hash
  ) values (
    p_event_schema_version, p_project_id, p_entity_type, p_entity_id, p_event_type,
    coalesce(p_payload,'{}'::jsonb), coalesce(p_evidence_refs,'[]'::jsonb),
    p_actor_type, p_actor_id, p_authority, p_source_id, p_source_revision,
    p_idempotency_key, v_corr, p_causation_event_id, p_supersedes_event_id, v_hash
  )
  on conflict (idempotency_key) do nothing
  returning event_id into v_id;

  if v_id is null then
    select event_id into v_id from cns.events where idempotency_key = p_idempotency_key;
  end if;
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- PROJECT GRAPH / WORK / TRUTH GRAPH
-- ---------------------------------------------------------------------------
create table if not exists cns.goals (
  goal_id text primary key,
  project_id text not null references cns.projects(project_id) on delete restrict,
  title text not null,
  description text,
  priority smallint not null default 3 check (priority between 1 and 9),
  state text not null check (state in ('ACTIVE','ACHIEVED','PAUSED','REJECTED','SUPERSEDED')),
  success_criteria jsonb not null default '[]'::jsonb,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  updated_at timestamptz not null default now()
);

create table if not exists cns.milestones (
  milestone_id text primary key,
  project_id text not null references cns.projects(project_id) on delete restrict,
  goal_id text references cns.goals(goal_id) on delete restrict,
  title text not null,
  state text not null check (state in ('PLANNED','ACTIVE','BLOCKED','DONE','REJECTED','SUPERSEDED')),
  target_at timestamptz,
  definition_of_done jsonb not null default '[]'::jsonb,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  updated_at timestamptz not null default now()
);

create table if not exists cns.tasks (
  task_id text primary key,
  project_id text not null references cns.projects(project_id) on delete restrict,
  milestone_id text references cns.milestones(milestone_id) on delete restrict,
  parent_task_id text references cns.tasks(task_id) on delete restrict,
  title text not null,
  human_description text,
  state text not null check (state in ('BACKLOG','READY','ACTIVE','BLOCKED','REVIEW','DONE','REJECTED','SUPERSEDED')),
  priority smallint not null default 3 check (priority between 1 and 9),
  owner text,
  definition_of_done jsonb not null default '[]'::jsonb,
  evidence_required jsonb not null default '[]'::jsonb,
  next_gate text,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  updated_at timestamptz not null default now()
);

create index if not exists cns_tasks_project_state_idx on cns.tasks(project_id, state, priority, updated_at desc);

create table if not exists cns.dependencies (
  dependency_id text primary key,
  project_id text not null references cns.projects(project_id) on delete restrict,
  task_id text references cns.tasks(task_id) on delete restrict,
  depends_on_project_id text references cns.projects(project_id) on delete restrict,
  depends_on_task_id text references cns.tasks(task_id) on delete restrict,
  dependency_type text not null default 'BLOCKING',
  state text not null check (state in ('OPEN','SATISFIED','WAIVED','SUPERSEDED')),
  description text,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  check (depends_on_project_id is not null or depends_on_task_id is not null)
);

create index if not exists cns_dependencies_project_idx on cns.dependencies(project_id, state);

create table if not exists cns.evidence (
  evidence_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  evidence_type text not null,
  source_id text references cns.source_registry(source_id) on delete restrict,
  source_revision text,
  uri text,
  content_hash text,
  excerpt text,
  metadata jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null default now(),
  verified_at timestamptz,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','DISPUTED','SUPERSEDED','ARCHIVED'))
);

create table if not exists cns.claims (
  claim_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  subject_type text not null,
  subject_id text not null,
  predicate text not null,
  value jsonb not null,
  authority text not null,
  confidence numeric(5,4) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  state text not null default 'ACTIVE' check (state in ('ACTIVE','DISPUTED','SUPERSEDED','REJECTED')),
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cns.claim_evidence (
  claim_id text not null references cns.claims(claim_id) on delete restrict,
  evidence_id text not null references cns.evidence(evidence_id) on delete restrict,
  relation text not null default 'SUPPORTS' check (relation in ('SUPPORTS','CONTRADICTS','CONTEXT')),
  primary key (claim_id, evidence_id, relation)
);

create table if not exists cns.decisions (
  decision_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  title text not null,
  decision text not null,
  authority text not null,
  status text not null default 'ACTIVE' check (status in ('PROPOSED','ACTIVE','SUPERSEDED','REVOKED')),
  decided_by text,
  decided_at timestamptz,
  evidence_refs jsonb not null default '[]'::jsonb,
  supersedes_decision_id text references cns.decisions(decision_id) on delete restrict,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ARTIFACT / PROTOTYPE / CODE TRUTH
-- ---------------------------------------------------------------------------
create table if not exists cns.artifacts (
  artifact_id text primary key,
  project_id text not null references cns.projects(project_id) on delete restrict,
  artifact_type text not null,
  title text not null,
  uri text not null,
  content_hash text,
  source_system text not null,
  role text not null check (role in ('CURRENT','EVIDENCE','DONOR','ARCHIVE','SUPERSEDED','RAW_SOURCE')),
  immutable boolean not null default false,
  verified_at timestamptz,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists cns.prototypes (
  prototype_id text primary key,
  project_id text not null references cns.projects(project_id) on delete restrict,
  version integer not null check (version >= 1),
  role text not null check (role in ('ACTIVE_DEVELOPMENT','FIXED_REVIEW','PRODUCTION','DONOR','SUPERSEDED','ARCHIVED')),
  acceptance_state text not null check (acceptance_state in ('UNREVIEWED','SYSTEM_VERIFIED','FOUNDER_REVIEW','FOUNDER_ACCEPTED','REJECTED')),
  exact_sha text,
  immutable_url text,
  live_url text,
  title text,
  evidence_refs jsonb not null default '[]'::jsonb,
  supersedes_prototype_id text references cns.prototypes(prototype_id) on delete restrict,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  verified_at timestamptz,
  unique(project_id, version),
  check (acceptance_state <> 'FOUNDER_ACCEPTED' or (exact_sha is not null and immutable_url is not null and jsonb_array_length(evidence_refs) > 0)),
  check (role <> 'PRODUCTION' or (exact_sha is not null and (live_url is not null or immutable_url is not null)))
);

create table if not exists cns.code_lines (
  code_line_id text primary key,
  project_id text not null references cns.projects(project_id) on delete restrict,
  seam text not null default 'default',
  role text not null check (role in ('ACTIVE_DEVELOPMENT','FIXED_REVIEW','PRODUCTION','DONOR','RECOVERY','SUPERSEDED','ARCHIVED')),
  repository text not null,
  branch text,
  pr_number integer,
  base_sha text,
  exact_sha text,
  observed_sha text,
  preview_url text,
  why text,
  must_preserve jsonb not null default '[]'::jsonb,
  allowed_donors jsonb not null default '[]'::jsonb,
  source_id text references cns.source_registry(source_id) on delete restrict,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  verified_at timestamptz,
  stale_after timestamptz
);

create unique index if not exists cns_one_active_dev_per_seam on cns.code_lines(project_id, seam) where role='ACTIVE_DEVELOPMENT';
create unique index if not exists cns_one_production_per_seam on cns.code_lines(project_id, seam) where role='PRODUCTION';

-- ---------------------------------------------------------------------------
-- AGENTS / JOBS / TRAFFIC CONTROL
-- ---------------------------------------------------------------------------
create table if not exists cns.agents (
  agent_id text primary key,
  agent_kind text not null check (agent_kind in ('AXE','DOCTOR','LIBRARIAN','TRAFFIC','EVALUATOR','PROJECT_AGENT','TASK_WORKER','SYSTEM')),
  scope_project_id text references cns.projects(project_id) on delete restrict,
  persistent boolean not null default false,
  write_capabilities text[] not null default '{}',
  state text not null default 'READY' check (state in ('READY','ACTIVE','DEGRADED','DISABLED')),
  last_heartbeat_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists cns.agent_runs (
  agent_run_id uuid primary key default gen_random_uuid(),
  agent_id text not null references cns.agents(agent_id) on delete restrict,
  project_id text references cns.projects(project_id) on delete restrict,
  task_id text references cns.tasks(task_id) on delete restrict,
  state text not null check (state in ('QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED','EXPIRED')),
  context_snapshot_id uuid,
  started_at timestamptz,
  heartbeat_at timestamptz,
  finished_at timestamptz,
  result jsonb,
  error jsonb,
  created_at timestamptz not null default now()
);

create table if not exists cns.jobs (
  job_id uuid primary key default gen_random_uuid(),
  project_id text references cns.projects(project_id) on delete restrict,
  task_id text references cns.tasks(task_id) on delete restrict,
  job_type text not null,
  idempotency_key text not null unique,
  state text not null default 'QUEUED' check (state in ('QUEUED','LEASED','RUNNING','SUCCEEDED','FAILED','DEAD','CANCELLED')),
  priority smallint not null default 3 check (priority between 1 and 9),
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  available_at timestamptz not null default now(),
  last_error jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cns_jobs_queue_idx on cns.jobs(state, priority, available_at);

create table if not exists cns.dead_letters (
  dead_letter_id bigint generated always as identity primary key,
  job_id uuid references cns.jobs(job_id) on delete restrict,
  reason text not null,
  payload jsonb not null,
  failed_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists cns.leases (
  lease_id uuid primary key default gen_random_uuid(),
  project_id text not null references cns.projects(project_id) on delete restrict,
  task_id text references cns.tasks(task_id) on delete restrict,
  owner_agent_id text not null references cns.agents(agent_id) on delete restrict,
  base_sha text,
  state text not null check (state in ('ACTIVE','RELEASED','EXPIRED','CANCELLED')),
  acquired_at timestamptz not null default now(),
  heartbeat_at timestamptz not null default now(),
  expires_at timestamptz not null,
  released_at timestamptz,
  check (expires_at > acquired_at)
);

create table if not exists cns.lease_scopes (
  lease_scope_id bigint generated always as identity primary key,
  lease_id uuid not null references cns.leases(lease_id) on delete restrict,
  scope_key text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  released_at timestamptz
);

create unique index if not exists cns_one_active_lease_per_scope on cns.lease_scopes(scope_key) where active=true;

create or replace function cns.expire_dead_leases()
returns integer language plpgsql security definer set search_path=cns,public as $$
declare v_count integer;
begin
  update cns.lease_scopes s
     set active=false, released_at=now()
    from cns.leases l
   where s.lease_id=l.lease_id and s.active=true and l.state='ACTIVE' and l.expires_at <= now();
  update cns.leases set state='EXPIRED' where state='ACTIVE' and expires_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end; $$;

create or replace function cns.acquire_lease(
  p_project_id text, p_task_id text, p_agent_id text, p_scope_keys text[], p_base_sha text, p_ttl_seconds integer default 3600
) returns uuid language plpgsql security definer set search_path=cns,public as $$
declare v_lease uuid; v_scope text;
begin
  if p_ttl_seconds < 60 or p_ttl_seconds > 86400 then raise exception 'CNS_LEASE_TTL_OUT_OF_RANGE'; end if;
  perform cns.expire_dead_leases();
  insert into cns.leases(project_id,task_id,owner_agent_id,base_sha,state,expires_at)
  values(p_project_id,p_task_id,p_agent_id,p_base_sha,'ACTIVE',now()+make_interval(secs=>p_ttl_seconds)) returning lease_id into v_lease;
  foreach v_scope in array p_scope_keys loop
    insert into cns.lease_scopes(lease_id,scope_key) values(v_lease,v_scope);
  end loop;
  return v_lease;
exception when unique_violation then
  raise exception 'CNS_LEASE_CONFLICT';
end; $$;

create or replace function cns.heartbeat_lease(p_lease_id uuid, p_ttl_seconds integer default 3600)
returns boolean language plpgsql security definer set search_path=cns,public as $$
begin
  update cns.leases set heartbeat_at=now(), expires_at=now()+make_interval(secs=>p_ttl_seconds)
  where lease_id=p_lease_id and state='ACTIVE' and expires_at>now();
  return found;
end; $$;

create or replace function cns.release_lease(p_lease_id uuid)
returns boolean language plpgsql security definer set search_path=cns,public as $$
begin
  update cns.lease_scopes set active=false,released_at=now() where lease_id=p_lease_id and active=true;
  update cns.leases set state='RELEASED',released_at=now() where lease_id=p_lease_id and state='ACTIVE';
  return found;
end; $$;

-- ---------------------------------------------------------------------------
-- MEMORY / LIBRARIAN
-- ---------------------------------------------------------------------------
create table if not exists cns.memory_items (
  memory_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  product_scope text,
  task_scope text,
  agent_scope text,
  memory_type text not null check (memory_type in ('SEMANTIC','EPISODIC','PROCEDURAL','EVIDENCE','CANON_POINTER')),
  depth smallint not null check (depth between 0 and 4),
  title text not null,
  content jsonb not null,
  authority text not null,
  source_id text references cns.source_registry(source_id) on delete restrict,
  source_revision text,
  fingerprint text not null,
  state text not null check (state in ('CANDIDATE','ACTIVE','SUPERSEDED','ARCHIVED','REJECTED')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  updated_at timestamptz not null default now()
);

create unique index if not exists cns_memory_active_fingerprint_idx on cns.memory_items(fingerprint) where state in ('CANDIDATE','ACTIVE');
create index if not exists cns_memory_project_depth_idx on cns.memory_items(project_id,depth,memory_type,state);

create or replace function cns.librarian_propose_memory(
  p_memory_id text, p_project_id text, p_memory_type text, p_depth smallint, p_title text,
  p_content jsonb, p_authority text, p_source_id text, p_source_revision text
) returns text language plpgsql security definer set search_path=cns,public as $$
declare v_fp text;
begin
  v_fp := encode(digest(coalesce(p_project_id,'')||'|'||p_memory_type||'|'||p_title||'|'||p_content::text,'sha256'),'hex');
  insert into cns.memory_items(memory_id,project_id,memory_type,depth,title,content,authority,source_id,source_revision,fingerprint,state)
  values(p_memory_id,p_project_id,p_memory_type,p_depth,p_title,p_content,p_authority,p_source_id,p_source_revision,v_fp,'CANDIDATE')
  on conflict (fingerprint) where state in ('CANDIDATE','ACTIVE') do nothing;
  return v_fp;
end; $$;

create or replace function cns.librarian_promote_memory(p_memory_id text, p_event_id bigint)
returns boolean language plpgsql security definer set search_path=cns,public as $$
begin
  update cns.memory_items set state='ACTIVE',last_event_id=p_event_id,updated_at=now()
  where memory_id=p_memory_id and state='CANDIDATE';
  return found;
end; $$;

-- ---------------------------------------------------------------------------
-- CURRENT PROJECTIONS: WRITE ONLY THROUGH EVENT FUNCTIONS
-- ---------------------------------------------------------------------------
create table if not exists cns.project_current_state (
  project_id text primary key references cns.projects(project_id) on delete restrict,
  projection_version integer not null default 1,
  why text,
  outcome text,
  primary_goal_ids text[] not null default '{}',
  state text not null check (state in ('IDEA','INCUBATION','ACTIVE','PAUSED','BLOCKED','CLOSED','ARCHIVED')),
  current_prototype_id text references cns.prototypes(prototype_id) on delete restrict,
  active_code_line_id text references cns.code_lines(code_line_id) on delete restrict,
  current_wbs_gate text,
  next_action text,
  blockers jsonb not null default '[]'::jsonb,
  owner text,
  founder_burden text not null default 'NONE' check (founder_burden in ('NONE','LOW','DECISION','JUDGE','RELEASE','HUMAN')),
  health text not null default 'UNKNOWN' check (health in ('GREEN','AMBER','RED','UNKNOWN')),
  last_event_id bigint not null references cns.events(event_id) on delete restrict,
  verified_at timestamptz not null,
  stale_after timestamptz not null,
  updated_at timestamptz not null default now()
);

create or replace function cns.commit_project_state(
  p_project_id text,
  p_state jsonb,
  p_actor_type text,
  p_actor_id text,
  p_authority text,
  p_source_id text,
  p_source_revision text,
  p_idempotency_key text,
  p_ttl_seconds integer default 3600,
  p_evidence_refs jsonb default '[]'::jsonb
) returns bigint
language plpgsql security definer set search_path=cns,public as $$
declare v_event bigint;
begin
  if p_ttl_seconds < 60 or p_ttl_seconds > 86400 then raise exception 'CNS_STATE_TTL_OUT_OF_RANGE'; end if;
  v_event := cns.append_event(p_project_id,'PROJECT',p_project_id,'PROJECT_STATE_COMMITTED',p_state,p_evidence_refs,p_actor_type,p_actor_id,p_authority,p_source_id,p_source_revision,p_idempotency_key);
  insert into cns.project_current_state(
    project_id,projection_version,why,outcome,primary_goal_ids,state,current_prototype_id,active_code_line_id,
    current_wbs_gate,next_action,blockers,owner,founder_burden,health,last_event_id,verified_at,stale_after,updated_at
  ) values (
    p_project_id, coalesce((p_state->>'projection_version')::integer,1), p_state->>'why',p_state->>'outcome',
    coalesce(array(select jsonb_array_elements_text(coalesce(p_state->'primary_goal_ids','[]'::jsonb))),array[]::text[]),
    p_state->>'state', nullif(p_state->>'current_prototype_id',''), nullif(p_state->>'active_code_line_id',''),
    p_state->>'current_wbs_gate',p_state->>'next_action',coalesce(p_state->'blockers','[]'::jsonb),p_state->>'owner',
    coalesce(p_state->>'founder_burden','NONE'),coalesce(p_state->>'health','UNKNOWN'),v_event,now(),now()+make_interval(secs=>p_ttl_seconds),now()
  ) on conflict(project_id) do update set
    projection_version=excluded.projection_version, why=excluded.why,outcome=excluded.outcome,primary_goal_ids=excluded.primary_goal_ids,
    state=excluded.state,current_prototype_id=excluded.current_prototype_id,active_code_line_id=excluded.active_code_line_id,
    current_wbs_gate=excluded.current_wbs_gate,next_action=excluded.next_action,blockers=excluded.blockers,owner=excluded.owner,
    founder_burden=excluded.founder_burden,health=excluded.health,last_event_id=excluded.last_event_id,
    verified_at=excluded.verified_at,stale_after=excluded.stale_after,updated_at=excluded.updated_at;
  return v_event;
end; $$;

-- ---------------------------------------------------------------------------
-- CONTEXT COMPILER / SNAPSHOTS
-- ---------------------------------------------------------------------------
create table if not exists cns.context_snapshots (
  context_snapshot_id uuid primary key default gen_random_uuid(),
  project_id text references cns.projects(project_id) on delete restrict,
  intent text not null,
  requested_depth smallint not null check (requested_depth between 0 and 4),
  token_budget integer not null check (token_budget between 256 and 200000),
  state_event_id bigint not null references cns.events(event_id) on delete restrict,
  compiled_context jsonb not null,
  included_sources jsonb not null default '[]'::jsonb,
  excluded_namespaces jsonb not null default '[]'::jsonb,
  source_revisions jsonb not null default '{}'::jsonb,
  fingerprint text not null,
  compiled_at timestamptz not null default now(),
  expires_at timestamptz not null,
  invalidated_at timestamptz,
  invalidation_reason text,
  check (expires_at > compiled_at)
);

create index if not exists cns_context_project_time_idx on cns.context_snapshots(project_id,compiled_at desc);

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
  v_fp text;
  v_id uuid;
begin
  if p_depth < 0 or p_depth > 4 then raise exception 'CNS_CONTEXT_DEPTH_INVALID'; end if;
  select * into v_state from cns.project_current_state where project_id=p_project_id;
  if not found then raise exception 'CNS_CURRENT_STATE_REQUIRED'; end if;
  if v_state.stale_after <= now() then raise exception 'CNS_CURRENT_STATE_STALE'; end if;

  v_excluded := case p_depth
    when 0 then '["WBS","PRODUCT","EVIDENCE","ARCHIVE"]'::jsonb
    when 1 then '["PRODUCT","EVIDENCE","ARCHIVE"]'::jsonb
    when 2 then '["EVIDENCE","ARCHIVE"]'::jsonb
    when 3 then '["ARCHIVE"]'::jsonb
    else '[]'::jsonb end;

  select coalesce(jsonb_agg(jsonb_build_object('source_id',source_id,'revision',current_revision,'authority',authority,'truth_domain',truth_domain)),'[]'::jsonb),
         coalesce(jsonb_object_agg(source_id,coalesce(current_revision,'UNVERSIONED')),'{}'::jsonb)
    into v_sources,v_revisions
    from cns.source_registry where state='ACTIVE';

  v_body := jsonb_build_object(
    'identity', (select to_jsonb(p) from cns.projects p where p.project_id=p_project_id),
    'current_state', to_jsonb(v_state),
    'goals', case when p_depth>=0 then coalesce((select jsonb_agg(to_jsonb(g) order by g.priority,g.goal_id) from cns.goals g where g.project_id=p_project_id and g.state='ACTIVE'),'[]'::jsonb) else '[]'::jsonb end,
    'milestones', case when p_depth>=1 then coalesce((select jsonb_agg(to_jsonb(m)) from cns.milestones m where m.project_id=p_project_id and m.state in ('ACTIVE','BLOCKED','PLANNED')),'[]'::jsonb) else '[]'::jsonb end,
    'tasks', case when p_depth>=1 then coalesce((select jsonb_agg(to_jsonb(t) order by t.priority,t.updated_at desc) from (select * from cns.tasks where project_id=p_project_id and state in ('READY','ACTIVE','BLOCKED','REVIEW') order by priority,updated_at desc limit 100) t),'[]'::jsonb) else '[]'::jsonb end,
    'dependencies', case when p_depth>=1 then coalesce((select jsonb_agg(to_jsonb(d)) from cns.dependencies d where d.project_id=p_project_id and d.state='OPEN'),'[]'::jsonb) else '[]'::jsonb end,
    'code_lines', case when p_depth>=2 then coalesce((select jsonb_agg(to_jsonb(c)) from cns.code_lines c where c.project_id=p_project_id and c.role in ('ACTIVE_DEVELOPMENT','FIXED_REVIEW','PRODUCTION')),'[]'::jsonb) else '[]'::jsonb end,
    'prototypes', case when p_depth>=2 then coalesce((select jsonb_agg(to_jsonb(pr)) from cns.prototypes pr where pr.project_id=p_project_id and pr.role in ('ACTIVE_DEVELOPMENT','FIXED_REVIEW','PRODUCTION')),'[]'::jsonb) else '[]'::jsonb end,
    'decisions', case when p_depth>=3 then coalesce((select jsonb_agg(to_jsonb(d)) from cns.decisions d where d.project_id=p_project_id and d.status='ACTIVE'),'[]'::jsonb) else '[]'::jsonb end,
    'claims', case when p_depth>=3 then coalesce((select jsonb_agg(to_jsonb(c)) from cns.claims c where c.project_id=p_project_id and c.state in ('ACTIVE','DISPUTED')),'[]'::jsonb) else '[]'::jsonb end,
    'memories', coalesce((select jsonb_agg(to_jsonb(mi)) from (select * from cns.memory_items where (project_id=p_project_id or project_id is null) and state='ACTIVE' and depth<=p_depth order by depth,updated_at desc limit 200) mi),'[]'::jsonb),
    'intent', p_intent,
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
end; $$;

create or replace function cns.invalidate_context_for_project(p_project_id text, p_reason text)
returns integer language plpgsql security definer set search_path=cns,public as $$
declare v_count integer;
begin
  update cns.context_snapshots set invalidated_at=now(),invalidation_reason=p_reason
  where project_id=p_project_id and invalidated_at is null;
  get diagnostics v_count=row_count;
  return v_count;
end; $$;

-- ---------------------------------------------------------------------------
-- GITHUB / EXTERNAL SYNC CURSORS
-- ---------------------------------------------------------------------------
create table if not exists cns.sync_cursors (
  sync_id text primary key,
  source_id text not null references cns.source_registry(source_id) on delete restrict,
  cursor_value text,
  observed_revision text,
  last_success_at timestamptz,
  last_attempt_at timestamptz,
  state text not null default 'READY' check (state in ('READY','RUNNING','DEGRADED','FAILED')),
  error jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create or replace function cns.observe_code_head(p_code_line_id text,p_observed_sha text,p_source_revision text,p_idempotency_key text)
returns bigint language plpgsql security definer set search_path=cns,public as $$
declare v_project text; v_expected text; v_event bigint;
begin
  select project_id,exact_sha into v_project,v_expected from cns.code_lines where code_line_id=p_code_line_id;
  if not found then raise exception 'CNS_CODE_LINE_NOT_FOUND'; end if;
  v_event := cns.append_event(v_project,'CODE_LINE',p_code_line_id,'CODE_HEAD_OBSERVED',jsonb_build_object('expected_sha',v_expected,'observed_sha',p_observed_sha),'[]'::jsonb,'SYSTEM','github-sync','EXTERNAL_VERIFIED',null,p_source_revision,p_idempotency_key);
  update cns.code_lines set observed_sha=p_observed_sha,verified_at=now(),stale_after=now()+interval '15 minutes',last_event_id=v_event where code_line_id=p_code_line_id;
  if v_expected is distinct from p_observed_sha then
    perform cns.invalidate_context_for_project(v_project,'CODE_HEAD_CHANGED');
  end if;
  return v_event;
end; $$;

-- ---------------------------------------------------------------------------
-- DOCTOR / INCIDENTS
-- ---------------------------------------------------------------------------
create table if not exists cns.health_incidents (
  incident_id bigint generated always as identity primary key,
  fingerprint text not null,
  rule_id text not null,
  severity text not null check (severity in ('INFO','P2','P1','P0')),
  entity_type text not null,
  entity_id text not null,
  project_id text references cns.projects(project_id) on delete restrict,
  summary text not null,
  evidence jsonb not null default '[]'::jsonb,
  state text not null check (state in ('OPEN','ACKNOWLEDGED','RESOLVED','FALSE_POSITIVE')),
  detected_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz,
  last_event_id bigint references cns.events(event_id) on delete restrict
);

create unique index if not exists cns_one_open_incident_fingerprint on cns.health_incidents(fingerprint) where state in ('OPEN','ACKNOWLEDGED');

create or replace view cns.doctor_violations with (security_invoker=true) as
select 'PROJECT_STATE_STALE'::text rule_id,'P0'::text severity,'PROJECT'::text entity_type,s.project_id entity_id,s.project_id,
       'Current project state is stale'::text summary
from cns.project_current_state s where s.stale_after<=now()
union all
select 'ACTIVE_PROJECT_MISSING_CORE','P0','PROJECT',s.project_id,s.project_id,'Active project lacks WHY, owner or next action'
from cns.project_current_state s where s.state='ACTIVE' and (nullif(btrim(s.why),'') is null or nullif(btrim(s.owner),'') is null or nullif(btrim(s.next_action),'') is null)
union all
select 'ACTIVE_CODE_SHA_MISSING','P0','CODE_LINE',c.code_line_id,c.project_id,'Active code line has no exact SHA'
from cns.code_lines c where c.role='ACTIVE_DEVELOPMENT' and c.exact_sha is null
union all
select 'CODE_SHA_DRIFT','P0','CODE_LINE',c.code_line_id,c.project_id,'Recorded exact SHA differs from live observed SHA'
from cns.code_lines c where c.role in ('ACTIVE_DEVELOPMENT','PRODUCTION') and c.observed_sha is not null and c.exact_sha is distinct from c.observed_sha
union all
select 'CODE_VERIFICATION_STALE','P0','CODE_LINE',c.code_line_id,c.project_id,'Code-line live verification is stale'
from cns.code_lines c where c.role in ('ACTIVE_DEVELOPMENT','PRODUCTION') and c.stale_after is not null and c.stale_after<=now()
union all
select 'ACCEPTED_PROTOTYPE_IDENTITY_INCOMPLETE','P0','PROTOTYPE',p.prototype_id,p.project_id,'Accepted prototype lacks SHA, immutable URL or evidence'
from cns.prototypes p where p.acceptance_state='FOUNDER_ACCEPTED' and (p.exact_sha is null or p.immutable_url is null or jsonb_array_length(p.evidence_refs)=0)
union all
select 'ACTIVE_LEASE_EXPIRED','P0','LEASE',l.lease_id::text,l.project_id,'Active lease expired without release'
from cns.leases l where l.state='ACTIVE' and l.expires_at<=now()
union all
select 'CONTEXT_EXPIRED','P0','CONTEXT',c.context_snapshot_id::text,c.project_id,'Expired context remains valid'
from cns.context_snapshots c where c.invalidated_at is null and c.expires_at<=now()
union all
select 'CONTEXT_STATE_MISMATCH','P0','CONTEXT',c.context_snapshot_id::text,c.project_id,'Context snapshot is based on an old state event'
from cns.context_snapshots c join cns.project_current_state s using(project_id) where c.invalidated_at is null and c.state_event_id<>s.last_event_id
union all
select 'TASK_DONE_WITHOUT_REQUIRED_EVIDENCE','P1','TASK',t.task_id,t.project_id,'Task marked DONE while evidence is required but no event is linked'
from cns.tasks t where t.state='DONE' and jsonb_array_length(t.evidence_required)>0 and t.last_event_id is null
union all
select 'SELF_DEPENDENCY','P0','DEPENDENCY',d.dependency_id,d.project_id,'Dependency points to itself'
from cns.dependencies d where d.state='OPEN' and ((d.depends_on_project_id=d.project_id) or (d.task_id is not null and d.depends_on_task_id=d.task_id));

create or replace function cns.doctor_scan()
returns integer language plpgsql security definer set search_path=cns,public as $$
declare v_count integer;
begin
  perform cns.expire_dead_leases();
  insert into cns.health_incidents(fingerprint,rule_id,severity,entity_type,entity_id,project_id,summary,evidence,state)
  select encode(digest(rule_id||'|'||entity_type||'|'||entity_id,'sha256'),'hex'),rule_id,severity,entity_type,entity_id,project_id,summary,'[]'::jsonb,'OPEN'
  from cns.doctor_violations
  on conflict (fingerprint) where state in ('OPEN','ACKNOWLEDGED') do update set last_seen_at=now(),summary=excluded.summary,severity=excluded.severity;
  get diagnostics v_count=row_count;
  return v_count;
end; $$;

-- ---------------------------------------------------------------------------
-- EVALUATOR
-- ---------------------------------------------------------------------------
create table if not exists cns.evaluation_runs (
  evaluation_run_id uuid primary key default gen_random_uuid(),
  project_id text references cns.projects(project_id) on delete restrict,
  artifact_id text references cns.artifacts(artifact_id) on delete restrict,
  exact_sha text,
  evaluator_agent_id text references cns.agents(agent_id) on delete restrict,
  state text not null check (state in ('RUNNING','PASS','FAIL','ERROR')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  summary jsonb not null default '{}'::jsonb
);

create table if not exists cns.evaluation_assertions (
  evaluation_assertion_id bigint generated always as identity primary key,
  evaluation_run_id uuid not null references cns.evaluation_runs(evaluation_run_id) on delete restrict,
  assertion_key text not null,
  critical boolean not null default true,
  passed boolean not null,
  evidence jsonb not null default '{}'::jsonb,
  unique(evaluation_run_id,assertion_key)
);

create or replace function cns.finish_evaluation(p_run uuid)
returns text language plpgsql security definer set search_path=cns,public as $$
declare v_failed integer; v_state text;
begin
  select count(*) into v_failed from cns.evaluation_assertions where evaluation_run_id=p_run and critical=true and passed=false;
  v_state := case when v_failed=0 then 'PASS' else 'FAIL' end;
  update cns.evaluation_runs set state=v_state,finished_at=now(),summary=jsonb_build_object('critical_failures',v_failed) where evaluation_run_id=p_run;
  return v_state;
end; $$;

-- ---------------------------------------------------------------------------
-- PARITY / MIGRATION CONTROL
-- ---------------------------------------------------------------------------
create table if not exists cns.legacy_snapshots (
  legacy_snapshot_id uuid primary key default gen_random_uuid(),
  project_id text references cns.projects(project_id) on delete restrict,
  source_id text not null references cns.source_registry(source_id) on delete restrict,
  source_revision text not null,
  snapshot jsonb not null,
  fingerprint text not null,
  captured_at timestamptz not null default now(),
  unique(project_id,source_id,source_revision)
);

create table if not exists cns.parity_results (
  parity_result_id bigint generated always as identity primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  dimension text not null,
  legacy_fingerprint text,
  cns_fingerprint text,
  result text not null check(result in ('MATCH','MISMATCH','MISSING_LEGACY','MISSING_CNS','AMBIGUOUS')),
  evidence jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now()
);

create table if not exists cns.system_meta (
  key text primary key,
  value jsonb not null,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  updated_at timestamptz not null default now()
);

insert into cns.system_meta(key,value) values
('authority_mode', '{"mode":"SHADOW","legacy_authoritative":true,"cutover_authorized":false}'::jsonb),
('schema_version', '{"version":2,"migration":"20260824025500_cns_kernel_02_total"}'::jsonb)
on conflict(key) do update set value=excluded.value,updated_at=now();

-- ---------------------------------------------------------------------------
-- GENERATED READ VIEWS
-- ---------------------------------------------------------------------------
create or replace view cns.v_founder_now with (security_invoker=true) as
select p.project_id,p.name,s.state,s.health,s.next_action,s.blockers,s.founder_burden,s.current_wbs_gate,s.updated_at
from cns.projects p join cns.project_current_state s using(project_id)
where p.lifecycle in ('ACTIVE','BLOCKED')
order by case s.health when 'RED' then 1 when 'AMBER' then 2 when 'UNKNOWN' then 3 else 4 end,s.updated_at desc;

create or replace view cns.v_project_home with (security_invoker=true) as
select p.*,s.why,s.outcome,s.state as current_state,s.current_prototype_id,s.active_code_line_id,s.current_wbs_gate,s.next_action,s.blockers,s.owner,s.founder_burden,s.health,s.last_event_id,s.verified_at,s.stale_after
from cns.projects p left join cns.project_current_state s using(project_id);

create or replace view cns.v_portfolio with (security_invoker=true) as
select p.project_id,p.name,p.parent_project_id,p.lifecycle,s.state,s.health,s.owner,s.next_action,s.founder_burden
from cns.projects p left join cns.project_current_state s using(project_id);

create or replace view cns.v_prototype_safe with (security_invoker=true) as
select prototype_id,project_id,version,role,acceptance_state,exact_sha,immutable_url,live_url,title,verified_at
from cns.prototypes where role not in ('SUPERSEDED','ARCHIVED');

create or replace view cns.v_branch_code_state with (security_invoker=true) as
select code_line_id,project_id,seam,role,repository,branch,pr_number,base_sha,exact_sha,observed_sha,(exact_sha is not distinct from observed_sha) as sha_matches,verified_at,stale_after
from cns.code_lines where role not in ('SUPERSEDED','ARCHIVED');

create or replace view cns.v_agent_state with (security_invoker=true) as
select a.agent_id,a.agent_kind,a.scope_project_id,a.state,a.last_heartbeat_at,
       count(l.lease_id) filter(where l.state='ACTIVE' and l.expires_at>now()) active_leases
from cns.agents a left join cns.leases l on l.owner_agent_id=a.agent_id group by a.agent_id;

create or replace view cns.v_project_health with (security_invoker=true) as
select p.project_id,p.name,s.health,s.stale_after,count(i.incident_id) filter(where i.state in ('OPEN','ACKNOWLEDGED')) open_incidents,
       count(i.incident_id) filter(where i.state in ('OPEN','ACKNOWLEDGED') and i.severity='P0') p0_incidents
from cns.projects p left join cns.project_current_state s using(project_id)
left join cns.health_incidents i on i.project_id=p.project_id
group by p.project_id,p.name,s.health,s.stale_after;

create or replace view cns.v_labs with (security_invoker=true) as
select p.project_id,p.name,s.state,s.health,s.current_prototype_id,pr.immutable_url,pr.live_url,cl.branch,cl.exact_sha,cl.preview_url
from cns.projects p left join cns.project_current_state s using(project_id)
left join cns.prototypes pr on pr.prototype_id=s.current_prototype_id
left join cns.code_lines cl on cl.code_line_id=s.active_code_line_id;

-- ---------------------------------------------------------------------------
-- SECURITY: PRIVATE SCHEMA; PROJECTIONS/EVENTS MUTATE ONLY THROUGH FUNCTIONS
-- ---------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname='cns' loop
    execute format('alter table cns.%I enable row level security',r.tablename);
  end loop;
end $$;

revoke all on all tables in schema cns from public,anon,authenticated;
revoke all on all sequences in schema cns from public,anon,authenticated;
revoke all on all functions in schema cns from public,anon,authenticated;

grant usage on schema cns to service_role;
grant select,insert,update,delete on all tables in schema cns to service_role;
grant usage,select on all sequences in schema cns to service_role;
grant execute on all functions in schema cns to service_role;

-- Hard boundary for the two truth-sensitive objects.
revoke insert,update,delete on cns.events from service_role;
revoke insert,update,delete on cns.project_current_state from service_role;

comment on schema cns is '4PLANET CNS shadow operational control plane. Not authoritative until parity-certified dual-read cutover.';
comment on table cns.events is 'Append-only event ledger. State corrections are new events; mutation is forbidden.';
comment on table cns.project_current_state is 'Regenerable current projection. Direct service-role writes forbidden; use cns.commit_project_state().' ;
comment on function cns.compile_project_context is 'Deterministic fail-closed project context compiler with depth, source revisions, exclusions, fingerprint and TTL.';
comment on view cns.doctor_violations is 'Deterministic invariant violations consumed by Doctor; Doctor may route repair but does not rewrite truth.';

commit;
