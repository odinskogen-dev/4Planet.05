-- 4PLANET BRAIN KERNEL 2 / CENTRAL NERVOUS SYSTEM
-- SHADOW MIGRATION ONLY.
-- Existing BRAIN / Drive / Git / public truth spine remain untouched and authoritative
-- until parity certification and Founder-approved cutover.

create extension if not exists pgcrypto;

create schema if not exists cns;

revoke all on schema cns from public;
revoke all on schema cns from anon, authenticated;
grant usage on schema cns to service_role;

create table if not exists cns.projects (
  project_id text primary key,
  slug text unique not null,
  name text not null,
  parent_project_id text references cns.projects(project_id),
  project_kind text not null default 'PROJECT',
  lifecycle text not null check (lifecycle in ('IDEA','INCUBATION','ACTIVE','PAUSED','BLOCKED','CLOSED','ARCHIVED','SUPERSEDED')),
  authority text not null default 'WORKING_CONTROL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cns.events (
  event_id bigint generated always as identity primary key,
  project_id text references cns.projects(project_id),
  entity_type text not null,
  entity_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  actor_type text not null check (actor_type in ('FOUNDER','AXE','AGENT','SYSTEM','EXTERNAL')),
  actor_id text,
  authority text not null,
  source_system text,
  source_id text,
  source_revision text,
  correlation_id text,
  occurred_at timestamptz not null default now(),
  ingested_at timestamptz not null default now(),
  unique nulls not distinct (source_system, source_id, source_revision)
);

create or replace function cns.reject_event_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'cns.events is append-only; append a correcting/superseding event instead';
end;
$$;

drop trigger if exists cns_events_immutable on cns.events;
create trigger cns_events_immutable
before update or delete on cns.events
for each row execute function cns.reject_event_mutation();

create table if not exists cns.goals (
  goal_id text primary key,
  project_id text not null references cns.projects(project_id) on delete restrict,
  title text not null,
  description text,
  priority smallint not null default 1 check (priority between 1 and 9),
  state text not null check (state in ('ACTIVE','ACHIEVED','PAUSED','REJECTED','SUPERSEDED')),
  success_criteria jsonb not null default '[]'::jsonb,
  last_event_id bigint references cns.events(event_id),
  updated_at timestamptz not null default now()
);

create table if not exists cns.tasks (
  task_id text primary key,
  project_id text not null references cns.projects(project_id) on delete restrict,
  parent_task_id text references cns.tasks(task_id),
  title text not null,
  human_description text,
  state text not null check (state in ('BACKLOG','READY','ACTIVE','BLOCKED','REVIEW','DONE','REJECTED','SUPERSEDED')),
  priority smallint not null default 3 check (priority between 1 and 9),
  owner text,
  definition_of_done jsonb not null default '[]'::jsonb,
  evidence_required jsonb not null default '[]'::jsonb,
  next_gate text,
  last_event_id bigint references cns.events(event_id),
  updated_at timestamptz not null default now()
);

create table if not exists cns.dependencies (
  dependency_id text primary key,
  project_id text not null references cns.projects(project_id) on delete restrict,
  depends_on_project_id text references cns.projects(project_id) on delete restrict,
  task_id text references cns.tasks(task_id) on delete restrict,
  depends_on_task_id text references cns.tasks(task_id) on delete restrict,
  dependency_type text not null default 'BLOCKING',
  state text not null check (state in ('OPEN','SATISFIED','WAIVED','SUPERSEDED')),
  description text,
  last_event_id bigint references cns.events(event_id),
  check (depends_on_project_id is not null or depends_on_task_id is not null)
);

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
  last_event_id bigint references cns.events(event_id),
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
  supersedes_prototype_id text references cns.prototypes(prototype_id),
  last_event_id bigint references cns.events(event_id),
  verified_at timestamptz,
  unique (project_id, version),
  check (
    acceptance_state <> 'FOUNDER_ACCEPTED'
    or (exact_sha is not null and immutable_url is not null)
  ),
  check (
    role <> 'PRODUCTION'
    or (exact_sha is not null and (live_url is not null or immutable_url is not null))
  )
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
  preview_url text,
  why text,
  must_preserve jsonb not null default '[]'::jsonb,
  allowed_donors jsonb not null default '[]'::jsonb,
  last_event_id bigint references cns.events(event_id),
  verified_at timestamptz,
  stale_after timestamptz
);

create unique index if not exists cns_one_active_dev_per_seam
on cns.code_lines(project_id, seam)
where role = 'ACTIVE_DEVELOPMENT';

create unique index if not exists cns_one_production_line_per_seam
on cns.code_lines(project_id, seam)
where role = 'PRODUCTION';

create table if not exists cns.project_state (
  project_id text primary key references cns.projects(project_id) on delete restrict,
  why text,
  outcome text,
  primary_goal_ids text[] not null default '{}',
  state text not null check (state in ('IDEA','INCUBATION','ACTIVE','PAUSED','BLOCKED','CLOSED','ARCHIVED')),
  current_prototype_id text references cns.prototypes(prototype_id),
  active_code_line_id text references cns.code_lines(code_line_id),
  current_wbs_gate text,
  next_action text,
  blockers jsonb not null default '[]'::jsonb,
  owner text,
  founder_burden text not null default 'NONE' check (founder_burden in ('NONE','LOW','DECISION','JUDGE','RELEASE','HUMAN')),
  health text not null default 'UNKNOWN' check (health in ('GREEN','AMBER','RED','UNKNOWN')),
  last_event_id bigint not null references cns.events(event_id),
  verified_at timestamptz not null,
  stale_after timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists cns.leases (
  lease_id uuid primary key default gen_random_uuid(),
  project_id text not null references cns.projects(project_id) on delete restrict,
  task_id text references cns.tasks(task_id) on delete restrict,
  owner_agent text not null,
  base_sha text,
  state text not null check (state in ('ACTIVE','RELEASED','EXPIRED','CANCELLED')),
  acquired_at timestamptz not null default now(),
  expires_at timestamptz not null,
  released_at timestamptz,
  last_event_id bigint references cns.events(event_id),
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

create unique index if not exists cns_one_active_lease_per_scope
on cns.lease_scopes(scope_key)
where active = true;

create table if not exists cns.memory_items (
  memory_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  memory_type text not null check (memory_type in ('SEMANTIC','EPISODIC','PROCEDURAL','EVIDENCE','CANON_POINTER')),
  depth smallint not null check (depth between 0 and 4),
  title text not null,
  content jsonb not null,
  authority text not null,
  source_ref text,
  state text not null check (state in ('ACTIVE','CANDIDATE','SUPERSEDED','ARCHIVED','REJECTED')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  last_event_id bigint references cns.events(event_id),
  updated_at timestamptz not null default now()
);

create index if not exists cns_memory_project_depth_idx
on cns.memory_items(project_id, depth, memory_type, state);

create table if not exists cns.health_incidents (
  incident_id bigint generated always as identity primary key,
  rule_id text not null,
  severity text not null check (severity in ('INFO','P2','P1','P0')),
  entity_type text not null,
  entity_id text not null,
  project_id text references cns.projects(project_id) on delete restrict,
  summary text not null,
  evidence jsonb not null default '[]'::jsonb,
  state text not null check (state in ('OPEN','ACKNOWLEDGED','RESOLVED','FALSE_POSITIVE')),
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  last_event_id bigint references cns.events(event_id)
);

create table if not exists cns.context_snapshots (
  context_snapshot_id uuid primary key default gen_random_uuid(),
  project_id text references cns.projects(project_id) on delete restrict,
  intent text not null,
  state_event_id bigint not null references cns.events(event_id),
  compiled_context jsonb not null,
  included_sources jsonb not null default '[]'::jsonb,
  excluded_namespaces jsonb not null default '[]'::jsonb,
  source_revisions jsonb not null default '{}'::jsonb,
  fingerprint text not null,
  compiled_at timestamptz not null default now(),
  expires_at timestamptz not null,
  invalidated_at timestamptz,
  check (expires_at > compiled_at)
);

create table if not exists cns.system_meta (
  key text primary key,
  value jsonb not null,
  last_event_id bigint references cns.events(event_id),
  updated_at timestamptz not null default now()
);

-- Defense in depth: CNS is private and not exposed to anon/authenticated.
alter table cns.projects enable row level security;
alter table cns.events enable row level security;
alter table cns.goals enable row level security;
alter table cns.tasks enable row level security;
alter table cns.dependencies enable row level security;
alter table cns.artifacts enable row level security;
alter table cns.prototypes enable row level security;
alter table cns.code_lines enable row level security;
alter table cns.project_state enable row level security;
alter table cns.leases enable row level security;
alter table cns.lease_scopes enable row level security;
alter table cns.memory_items enable row level security;
alter table cns.health_incidents enable row level security;
alter table cns.context_snapshots enable row level security;
alter table cns.system_meta enable row level security;

revoke all on all tables in schema cns from public, anon, authenticated;
revoke all on all sequences in schema cns from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema cns to service_role;
grant usage, select on all sequences in schema cns to service_role;

create or replace view cns.doctor_invariants
with (security_invoker = true)
as
select
  'PROJECT_STATE_STALE'::text as rule_id,
  'P0'::text as severity,
  'PROJECT'::text as entity_type,
  ps.project_id as entity_id,
  ps.project_id,
  ('Current project state expired at ' || ps.stale_after::text)::text as detail
from cns.project_state ps
where ps.stale_after <= now()
union all
select
  'ACTIVE_PROJECT_NO_NEXT_ACTION', 'P1', 'PROJECT', ps.project_id, ps.project_id,
  'Active project has no next_action'
from cns.project_state ps
where ps.state = 'ACTIVE' and nullif(btrim(ps.next_action), '') is null
union all
select
  'ACTIVE_CODE_SHA_MISSING', 'P0', 'CODE_LINE', cl.code_line_id, cl.project_id,
  'Active development line has no exact SHA'
from cns.code_lines cl
where cl.role = 'ACTIVE_DEVELOPMENT' and cl.exact_sha is null
union all
select
  'CODE_LINE_STALE', 'P0', 'CODE_LINE', cl.code_line_id, cl.project_id,
  ('Code-line verification expired at ' || cl.stale_after::text)
from cns.code_lines cl
where cl.role in ('ACTIVE_DEVELOPMENT','PRODUCTION')
  and cl.stale_after is not null
  and cl.stale_after <= now()
union all
select
  'ACCEPTED_PROTOTYPE_IDENTITY_INCOMPLETE', 'P0', 'PROTOTYPE', p.prototype_id, p.project_id,
  'Founder-accepted prototype lacks exact SHA or immutable URL'
from cns.prototypes p
where p.acceptance_state = 'FOUNDER_ACCEPTED'
  and (p.exact_sha is null or p.immutable_url is null)
union all
select
  'LEASE_EXPIRED_ACTIVE', 'P0', 'LEASE', l.lease_id::text, l.project_id,
  ('Active lease expired at ' || l.expires_at::text)
from cns.leases l
where l.state = 'ACTIVE' and l.expires_at <= now()
union all
select
  'CONTEXT_EXPIRED_NOT_INVALIDATED', 'P0', 'CONTEXT_SNAPSHOT', cs.context_snapshot_id::text, cs.project_id,
  ('Context snapshot expired at ' || cs.expires_at::text)
from cns.context_snapshots cs
where cs.invalidated_at is null and cs.expires_at <= now();

comment on schema cns is '4PLANET BRAIN KERNEL 2 shadow operational-state kernel. Private; not programme authority until parity-certified cutover.';
comment on table cns.events is 'Append-only operational event ledger. Corrections are new events; history is never overwritten.';
comment on table cns.project_state is 'Exactly one current operational state row per project. History belongs in cns.events.';
comment on table cns.memory_items is 'Progressive context memory: depth 0 identity through depth 4 archive; semantic/episodic/procedural/evidence are kept distinct.';
comment on table cns.context_snapshots is 'Immutable-style compiled working-context packet with source revisions, explicit exclusions and expiry.';
comment on view cns.doctor_invariants is 'Fail-closed health checks consumed by the CNS Doctor/evaluator.';