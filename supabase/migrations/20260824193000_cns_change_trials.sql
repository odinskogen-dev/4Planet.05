-- 4PLANET CNS KERNEL 02 — bounded code-change trials / WIP control
-- Implements baseline -> bounded change -> evaluate -> keep/discard without deleting recovery branches.
-- Final shadow migration also carries the pre-cutover SUPERBRAIN truth/provenance hardening.

begin;

create table if not exists cns.change_trials (
  change_trial_id uuid primary key default gen_random_uuid(),
  project_id text not null references cns.projects(project_id) on delete restrict,
  task_id text references cns.tasks(task_id) on delete restrict,
  lease_id uuid not null references cns.leases(lease_id) on delete restrict,
  agent_id text not null references cns.agents(agent_id) on delete restrict,
  repository text not null,
  branch_name text not null,
  workspace_kind text not null default 'GIT_WORKTREE' check (workspace_kind in ('GIT_WORKTREE','ISOLATED_CHECKOUT')),
  base_sha text not null,
  candidate_sha text,
  allowed_paths text[] not null default '{}',
  change_budget jsonb not null default '{}'::jsonb,
  baseline_evaluation_run_id uuid references cns.evaluation_runs(evaluation_run_id) on delete restrict,
  candidate_evaluation_run_id uuid references cns.evaluation_runs(evaluation_run_id) on delete restrict,
  state text not null default 'BASELINE' check (state in ('BASELINE','ACTIVE','EVALUATING','KEEP','DISCARD','BLOCKED','CANCELLED')),
  decision_reason text,
  evidence jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz,
  unique(repository,branch_name)
);

create unique index if not exists cns_one_open_trial_per_lease
  on cns.change_trials(lease_id)
  where state in ('BASELINE','ACTIVE','EVALUATING');

create unique index if not exists cns_one_open_trial_per_task
  on cns.change_trials(task_id)
  where task_id is not null and state in ('BASELINE','ACTIVE','EVALUATING');

create index if not exists cns_change_trials_project_state_idx
  on cns.change_trials(project_id,state,updated_at desc);

create or replace function cns.begin_change_trial(
  p_project_id text,
  p_task_id text,
  p_lease_id uuid,
  p_agent_id text,
  p_repository text,
  p_base_sha text,
  p_allowed_paths text[] default '{}',
  p_change_budget jsonb default '{}'::jsonb,
  p_baseline_evaluation_run_id uuid default null
) returns table(change_trial_id uuid,branch_name text)
language plpgsql security definer set search_path=cns,public as $$
declare
  v_lease cns.leases%rowtype;
  v_run cns.evaluation_runs%rowtype;
  v_trial uuid;
  v_branch text;
  v_slug text;
begin
  select * into v_lease from cns.leases where lease_id=p_lease_id for update;
  if not found or v_lease.state<>'ACTIVE' or v_lease.expires_at<=now() then
    raise exception 'CNS_ACTIVE_LEASE_REQUIRED';
  end if;
  if v_lease.project_id<>p_project_id or v_lease.owner_agent_id<>p_agent_id or v_lease.task_id is distinct from p_task_id then
    raise exception 'CNS_LEASE_SCOPE_MISMATCH';
  end if;
  if nullif(btrim(p_base_sha),'') is null then raise exception 'CNS_TRIAL_BASE_SHA_REQUIRED'; end if;
  if v_lease.base_sha is not null and v_lease.base_sha<>p_base_sha then raise exception 'CNS_TRIAL_BASE_SHA_MISMATCH'; end if;
  if coalesce(array_length(p_allowed_paths,1),0)=0 then raise exception 'CNS_TRIAL_ALLOWED_PATHS_REQUIRED'; end if;

  if p_baseline_evaluation_run_id is not null then
    select * into v_run from cns.evaluation_runs where evaluation_run_id=p_baseline_evaluation_run_id;
    if not found or v_run.state<>'PASS' then raise exception 'CNS_BASELINE_EVALUATION_PASS_REQUIRED'; end if;
  end if;

  v_trial:=gen_random_uuid();
  v_slug:=lower(regexp_replace(coalesce(p_task_id,p_project_id),'[^a-zA-Z0-9]+','-','g'));
  v_slug:=trim(both '-' from v_slug);
  if v_slug='' then v_slug:='task'; end if;
  v_branch:='cns/task/'||left(v_slug,48)||'-'||substr(replace(v_trial::text,'-',''),1,8);

  insert into cns.change_trials(change_trial_id,project_id,task_id,lease_id,agent_id,repository,branch_name,base_sha,allowed_paths,change_budget,baseline_evaluation_run_id,state)
  values(v_trial,p_project_id,p_task_id,p_lease_id,p_agent_id,p_repository,v_branch,p_base_sha,p_allowed_paths,coalesce(p_change_budget,'{}'::jsonb),p_baseline_evaluation_run_id,'BASELINE');

  return query select v_trial,v_branch;
end;
$$;

create or replace function cns.activate_change_trial(p_trial uuid)
returns boolean language plpgsql security definer set search_path=cns,public as $$
begin
  update cns.change_trials t
  set state='ACTIVE',updated_at=now()
  where t.change_trial_id=p_trial and t.state='BASELINE'
    and exists(select 1 from cns.leases l where l.lease_id=t.lease_id and l.state='ACTIVE' and l.expires_at>now());
  return found;
end;
$$;

create or replace function cns.submit_change_trial(
  p_trial uuid,
  p_candidate_sha text,
  p_candidate_evaluation_run_id uuid
) returns boolean language plpgsql security definer set search_path=cns,public as $$
declare v_eval cns.evaluation_runs%rowtype;
begin
  if nullif(btrim(p_candidate_sha),'') is null then raise exception 'CNS_CANDIDATE_SHA_REQUIRED'; end if;
  select * into v_eval from cns.evaluation_runs where evaluation_run_id=p_candidate_evaluation_run_id;
  if not found then raise exception 'CNS_CANDIDATE_EVALUATION_REQUIRED'; end if;
  update cns.change_trials
  set candidate_sha=p_candidate_sha,candidate_evaluation_run_id=p_candidate_evaluation_run_id,state='EVALUATING',updated_at=now()
  where change_trial_id=p_trial and state='ACTIVE';
  return found;
end;
$$;

create or replace function cns.finish_change_trial(
  p_trial uuid,
  p_decision text,
  p_reason text,
  p_evidence jsonb default '{}'::jsonb
) returns text language plpgsql security definer set search_path=cns,public as $$
declare
  v_trial cns.change_trials%rowtype;
  v_eval_state text;
  v_result text;
begin
  if p_decision not in ('KEEP','DISCARD') then raise exception 'CNS_TRIAL_DECISION_INVALID'; end if;
  select * into v_trial from cns.change_trials where change_trial_id=p_trial for update;
  if not found or v_trial.state<>'EVALUATING' then raise exception 'CNS_TRIAL_NOT_EVALUATING'; end if;

  select state into v_eval_state from cns.evaluation_runs where evaluation_run_id=v_trial.candidate_evaluation_run_id;
  if p_decision='KEEP' and (v_trial.candidate_sha is null or v_eval_state<>'PASS') then
    raise exception 'CNS_KEEP_REQUIRES_PASSING_CANDIDATE_EVALUATION';
  end if;

  v_result:=p_decision;
  update cns.change_trials
  set state=v_result,decision_reason=p_reason,evidence=coalesce(p_evidence,'{}'::jsonb),finished_at=now(),updated_at=now()
  where change_trial_id=p_trial;

  -- A completed trial releases its CNS lease scopes. Branch deletion is intentionally NOT automatic.
  perform cns.release_lease(v_trial.lease_id);
  return v_result;
end;
$$;

create or replace function cns.block_change_trial(p_trial uuid,p_reason text,p_evidence jsonb default '{}'::jsonb)
returns boolean language plpgsql security definer set search_path=cns,public as $$
declare v_lease uuid;
begin
  update cns.change_trials
  set state='BLOCKED',decision_reason=p_reason,evidence=coalesce(p_evidence,'{}'::jsonb),finished_at=now(),updated_at=now()
  where change_trial_id=p_trial and state in ('BASELINE','ACTIVE','EVALUATING')
  returning lease_id into v_lease;
  if v_lease is not null then perform cns.release_lease(v_lease); end if;
  return v_lease is not null;
end;
$$;

create or replace view cns.v_wip_control with (security_invoker=true) as
select p.project_id,p.name,
       count(t.change_trial_id) filter(where t.state in ('BASELINE','ACTIVE','EVALUATING')) as open_trials,
       count(l.lease_id) filter(where l.state='ACTIVE' and l.expires_at>now()) as active_leases,
       count(j.job_id) filter(where j.state in ('QUEUED','LEASED','RUNNING')) as open_jobs
from cns.projects p
left join cns.change_trials t on t.project_id=p.project_id
left join cns.leases l on l.project_id=p.project_id
left join cns.jobs j on j.project_id=p.project_id
group by p.project_id,p.name;

-- ---------------------------------------------------------------------------
-- SUPERBRAIN TRUTH / PROVENANCE MODEL
-- Source truth, observations, claims, methods, conflicts, decisions and learning
-- are separate first-class objects. UNKNOWN is represented explicitly, never
-- inferred from absence. This remains private CNS infrastructure.
-- ---------------------------------------------------------------------------

alter table cns.source_revisions add column if not exists persistent_id text;
alter table cns.source_revisions add column if not exists retrieval_uri text;
alter table cns.source_revisions add column if not exists retrieved_at timestamptz;
alter table cns.source_revisions add column if not exists content_type text;
alter table cns.source_revisions add column if not exists checksum_algorithm text default 'sha256';
alter table cns.source_revisions add column if not exists licence text;
alter table cns.source_revisions add column if not exists rights text;
alter table cns.source_revisions add column if not exists scope jsonb not null default '{}'::jsonb;

create table if not exists cns.entities (
  entity_id text primary key,
  entity_type text not null,
  canonical_name text not null,
  lifecycle text not null default 'ACTIVE' check (lifecycle in ('ACTIVE','SUPERSEDED','ARCHIVED')),
  source_id text references cns.source_registry(source_id) on delete restrict,
  source_revision text,
  metadata jsonb not null default '{}'::jsonb,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cns.entity_aliases (
  entity_alias_id bigint generated always as identity primary key,
  entity_id text not null references cns.entities(entity_id) on delete restrict,
  namespace text not null default 'GLOBAL',
  alias text not null,
  normalised_alias text generated always as (lower(regexp_replace(btrim(alias),'\s+',' ','g'))) stored,
  source_id text references cns.source_registry(source_id) on delete restrict,
  source_revision text,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','SUPERSEDED','REJECTED')),
  created_at timestamptz not null default now(),
  unique(entity_id,namespace,normalised_alias)
);
create index if not exists cns_entity_alias_lookup_idx on cns.entity_aliases(namespace,normalised_alias) where state='ACTIVE';

create table if not exists cns.methodologies (
  methodology_id text primary key,
  name text not null,
  version text not null,
  description text,
  assumptions jsonb not null default '[]'::jsonb,
  validity_domain jsonb not null default '{}'::jsonb,
  limitations jsonb not null default '[]'::jsonb,
  source_id text references cns.source_registry(source_id) on delete restrict,
  source_revision text,
  content_hash text,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','SUPERSEDED','REJECTED','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(name,version)
);

alter table cns.claims add column if not exists claim_kind text not null default 'SOURCE_CLAIM';
alter table cns.claims add column if not exists knowledge_state text not null default 'KNOWN';
alter table cns.claims add column if not exists source_id text references cns.source_registry(source_id) on delete restrict;
alter table cns.claims add column if not exists source_revision text;
alter table cns.claims add column if not exists methodology_id text references cns.methodologies(methodology_id) on delete restrict;
alter table cns.claims add column if not exists claimant_entity_id text references cns.entities(entity_id) on delete restrict;
alter table cns.claims add column if not exists valid_time_start timestamptz;
alter table cns.claims add column if not exists valid_time_end timestamptz;
alter table cns.claims add column if not exists observed_at timestamptz;
alter table cns.claims add column if not exists geography jsonb not null default '{}'::jsonb;
alter table cns.claims add column if not exists unit text;
alter table cns.claims add column if not exists scope jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists(select 1 from pg_constraint where conrelid='cns.claims'::regclass and conname='cns_claim_kind_check') then
    alter table cns.claims add constraint cns_claim_kind_check check (claim_kind in ('SOURCE_FACT','SOURCE_CLAIM','INFERENCE','ESTIMATE','INTERPRETATION','RECOMMENDATION','UNKNOWN'));
  end if;
  if not exists(select 1 from pg_constraint where conrelid='cns.claims'::regclass and conname='cns_claim_knowledge_state_check') then
    alter table cns.claims add constraint cns_claim_knowledge_state_check check (knowledge_state in ('KNOWN','UNKNOWN','INSUFFICIENT_EVIDENCE','CONFLICTED'));
  end if;
  if not exists(select 1 from pg_constraint where conrelid='cns.claims'::regclass and conname='cns_claim_valid_time_check') then
    alter table cns.claims add constraint cns_claim_valid_time_check check (valid_time_end is null or valid_time_start is null or valid_time_end>=valid_time_start);
  end if;
end $$;

do $$
declare r record;
begin
  for r in select conname from pg_constraint where conrelid='cns.claim_evidence'::regclass and contype='c' and pg_get_constraintdef(oid) ilike '%relation%'
  loop execute format('alter table cns.claim_evidence drop constraint %I',r.conname); end loop;
end $$;
alter table cns.claim_evidence add constraint cns_claim_evidence_relation_check
  check (relation in ('SUPPORTS','CONTRADICTS','CONTEXT','DOES_NOT_ESTABLISH'));

create table if not exists cns.observations (
  observation_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  entity_id text references cns.entities(entity_id) on delete restrict,
  observation_type text not null,
  value jsonb not null,
  unit text,
  observed_at timestamptz not null,
  valid_time_start timestamptz,
  valid_time_end timestamptz,
  source_id text not null references cns.source_registry(source_id) on delete restrict,
  source_revision text not null,
  methodology_id text references cns.methodologies(methodology_id) on delete restrict,
  evidence_id text references cns.evidence(evidence_id) on delete restrict,
  uncertainty jsonb not null default '{}'::jsonb,
  quality jsonb not null default '{}'::jsonb,
  sampling_effort jsonb not null default '{}'::jsonb,
  geometry_private jsonb,
  public_geometry jsonb,
  spatial_precision_m numeric,
  public_precision_m numeric,
  sensitivity_state text not null default 'PUBLIC' check (sensitivity_state in ('PUBLIC','GENERALIZED','RESTRICTED')),
  sensitivity_reason text,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','DISPUTED','SUPERSEDED','ARCHIVED')),
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now(),
  check (valid_time_end is null or valid_time_start is null or valid_time_end>=valid_time_start),
  check (sensitivity_state<>'RESTRICTED' or public_geometry is null),
  check (public_precision_m is null or spatial_precision_m is null or public_precision_m>=spatial_precision_m)
);
create index if not exists cns_observations_entity_time_idx on cns.observations(entity_id,observed_at desc);
create index if not exists cns_observations_project_time_idx on cns.observations(project_id,observed_at desc);

create table if not exists cns.signals (
  signal_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  entity_id text references cns.entities(entity_id) on delete restrict,
  signal_type text not null,
  value jsonb not null,
  methodology_id text not null references cns.methodologies(methodology_id) on delete restrict,
  evidence_refs jsonb not null default '[]'::jsonb,
  confidence numeric(5,4) check (confidence is null or (confidence>=0 and confidence<=1)),
  knowledge_state text not null default 'KNOWN' check (knowledge_state in ('KNOWN','UNKNOWN','INSUFFICIENT_EVIDENCE','CONFLICTED')),
  generated_at timestamptz not null default now(),
  state text not null default 'ACTIVE' check (state in ('ACTIVE','DISPUTED','SUPERSEDED','ARCHIVED')),
  last_event_id bigint references cns.events(event_id) on delete restrict
);

create table if not exists cns.interpretations (
  interpretation_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  subject_type text not null,
  subject_id text not null,
  body jsonb not null,
  methodology_id text references cns.methodologies(methodology_id) on delete restrict,
  evidence_refs jsonb not null default '[]'::jsonb,
  limitations jsonb not null default '[]'::jsonb,
  confidence numeric(5,4) check (confidence is null or (confidence>=0 and confidence<=1)),
  knowledge_state text not null default 'KNOWN' check (knowledge_state in ('KNOWN','UNKNOWN','INSUFFICIENT_EVIDENCE','CONFLICTED')),
  state text not null default 'ACTIVE' check (state in ('ACTIVE','DISPUTED','SUPERSEDED','REJECTED','ARCHIVED')),
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cns.conflicts (
  conflict_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  subject_type text not null,
  subject_id text not null,
  predicate text,
  severity text not null default 'P1' check (severity in ('INFO','P2','P1','P0')),
  summary text not null,
  state text not null default 'OPEN' check (state in ('OPEN','RESOLVED','SUPERSEDED','FALSE_POSITIVE')),
  evidence_refs jsonb not null default '[]'::jsonb,
  resolution_decision_id text references cns.decisions(decision_id) on delete restrict,
  resolution_notes text,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  check (state<>'RESOLVED' or resolution_decision_id is not null or nullif(btrim(resolution_notes),'') is not null)
);

create table if not exists cns.conflict_claims (
  conflict_id text not null references cns.conflicts(conflict_id) on delete restrict,
  claim_id text not null references cns.claims(claim_id) on delete restrict,
  side text not null default 'OTHER' check (side in ('A','B','OTHER')),
  primary key(conflict_id,claim_id)
);

alter table cns.decisions add column if not exists rationale jsonb not null default '{}'::jsonb;
alter table cns.decisions add column if not exists assumptions jsonb not null default '[]'::jsonb;
alter table cns.decisions add column if not exists alternatives jsonb not null default '[]'::jsonb;
alter table cns.decisions add column if not exists unknowns jsonb not null default '[]'::jsonb;
alter table cns.decisions add column if not exists consequences jsonb not null default '[]'::jsonb;
alter table cns.decisions add column if not exists review_trigger jsonb not null default '{}'::jsonb;
alter table cns.decisions add column if not exists methodology_id text references cns.methodologies(methodology_id) on delete restrict;

create table if not exists cns.outcomes (
  outcome_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  decision_id text references cns.decisions(decision_id) on delete restrict,
  title text not null,
  observed_at timestamptz not null,
  value jsonb not null,
  evidence_refs jsonb not null default '[]'::jsonb,
  confidence numeric(5,4) check (confidence is null or (confidence>=0 and confidence<=1)),
  knowledge_state text not null default 'KNOWN' check (knowledge_state in ('KNOWN','UNKNOWN','INSUFFICIENT_EVIDENCE','CONFLICTED')),
  state text not null default 'ACTIVE' check (state in ('ACTIVE','DISPUTED','SUPERSEDED','ARCHIVED')),
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists cns.learnings (
  learning_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  outcome_id text references cns.outcomes(outcome_id) on delete restrict,
  title text not null,
  learning jsonb not null,
  evidence_refs jsonb not null default '[]'::jsonb,
  confidence numeric(5,4) check (confidence is null or (confidence>=0 and confidence<=1)),
  state text not null default 'CANDIDATE' check (state in ('CANDIDATE','ACCEPTED','REJECTED','SUPERSEDED','ARCHIVED')),
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cns.rule_changes (
  rule_change_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  learning_id text references cns.learnings(learning_id) on delete restrict,
  title text not null,
  proposal jsonb not null,
  baseline jsonb not null default '{}'::jsonb,
  candidate jsonb not null default '{}'::jsonb,
  test_plan jsonb not null default '{}'::jsonb,
  rollback_plan jsonb not null default '{}'::jsonb,
  evaluation_run_id uuid references cns.evaluation_runs(evaluation_run_id) on delete restrict,
  decision text not null default 'PENDING' check (decision in ('PENDING','KEEP','REJECT','ROLLED_BACK')),
  decision_reason text,
  applied_at timestamptz,
  rolled_back_at timestamptz,
  state text not null default 'PROPOSED' check (state in ('PROPOSED','TESTING','APPLIED','REJECTED','ROLLED_BACK','SUPERSEDED')),
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function cns.guard_rule_change()
returns trigger language plpgsql security definer set search_path=cns,public as $$
declare v_eval text;
begin
  if new.decision='KEEP' then
    if new.evaluation_run_id is null then raise exception 'CNS_RULE_KEEP_REQUIRES_EVALUATION'; end if;
    select state into v_eval from cns.evaluation_runs where evaluation_run_id=new.evaluation_run_id;
    if v_eval is distinct from 'PASS' then raise exception 'CNS_RULE_KEEP_REQUIRES_PASS'; end if;
    if new.state not in ('APPLIED','TESTING') then raise exception 'CNS_RULE_KEEP_STATE_INVALID'; end if;
  end if;
  if new.decision='ROLLED_BACK' and new.rolled_back_at is null then raise exception 'CNS_RULE_ROLLBACK_TIMESTAMP_REQUIRED'; end if;
  return new;
end;
$$;
drop trigger if exists cns_rule_change_guard on cns.rule_changes;
create trigger cns_rule_change_guard before insert or update on cns.rule_changes for each row execute function cns.guard_rule_change();

create table if not exists cns.provenance_edges (
  provenance_edge_id bigint generated always as identity primary key,
  subject_type text not null,
  subject_id text not null,
  relation text not null check (relation in ('DERIVED_FROM','GENERATED_BY','ATTRIBUTED_TO','INPUT_TO','OUTPUT_OF','SUPERSEDES','CORROBORATES')),
  object_type text not null,
  object_id text not null,
  activity_type text,
  activity_id text,
  agent_type text,
  agent_id text,
  source_id text references cns.source_registry(source_id) on delete restrict,
  source_revision text,
  event_id bigint references cns.events(event_id) on delete restrict,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(subject_type,subject_id,relation,object_type,object_id,activity_type,activity_id)
);
create index if not exists cns_provenance_subject_idx on cns.provenance_edges(subject_type,subject_id);
create index if not exists cns_provenance_object_idx on cns.provenance_edges(object_type,object_id);

create table if not exists cns.control_roles (
  role_id text primary key,
  description text not null,
  may_rewrite_source_truth boolean not null default false,
  created_at timestamptz not null default now()
);
insert into cns.control_roles(role_id,description,may_rewrite_source_truth) values
('LIBRARIAN','Canonical identity, deduplication, aliases, taxonomy, lineage and retrieval correctness',false),
('DOCTOR','Continuous health, stale/broken/orphan/conflict/drift/recovery detection',false),
('SCIENTIST','Methods, evidence extraction, uncertainty and validity-domain analysis',false),
('AUDITOR','Independent evidence-to-output and adversarial release verification',false),
('HISTORIAN','Immutable event, supersession and recovery lineage',false),
('GATEKEEPER','Rights, privacy, sensitive nature, regulated-output and release boundaries',false),
('TRAFFIC','Concurrency, leases and duplicate-work prevention',false),
('EVALUATOR','Test execution and regression assessment',false)
on conflict(role_id) do update set description=excluded.description,may_rewrite_source_truth=false;

create table if not exists cns.agent_control_roles (
  agent_id text not null references cns.agents(agent_id) on delete restrict,
  role_id text not null references cns.control_roles(role_id) on delete restrict,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','SUSPENDED','REVOKED')),
  granted_at timestamptz not null default now(),
  primary key(agent_id,role_id)
);

create table if not exists cns.hypotheses (
  hypothesis_id text primary key,
  project_id text references cns.projects(project_id) on delete restrict,
  owner_identity text not null,
  title text not null,
  statement text not null,
  hypothesis_type text not null default 'FOUNDER_THESIS' check (hypothesis_type in ('FOUNDER_THESIS','WORKING_HYPOTHESIS','THEORY','DESIGN_PRINCIPLE','METAPHOR')),
  status text not null default 'DRAFT' check (status in ('DRAFT','TESTING','SUPPORTED','WEAKENED','REJECTED','SUPERSEDED')),
  falsifiers jsonb not null default '[]'::jsonb,
  supporting_evidence_refs jsonb not null default '[]'::jsonb,
  counter_evidence_refs jsonb not null default '[]'::jsonb,
  originality_note text,
  source_id text references cns.source_registry(source_id) on delete restrict,
  source_revision text,
  revision integer not null default 1 check (revision>0),
  publication_state text not null default 'PRIVATE' check (publication_state in ('PRIVATE','DRAFT','FOUNDER_REVIEW','APPROVED','PUBLISHED','RETRACTED')),
  published_uri text,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (publication_state<>'PUBLISHED' or (published_uri is not null and jsonb_array_length(supporting_evidence_refs)>0))
);

create or replace view cns.v_entity_alias_collisions with (security_invoker=true) as
select namespace,normalised_alias,array_agg(distinct entity_id order by entity_id) as entity_ids,count(distinct entity_id) as entity_count
from cns.entity_aliases where state='ACTIVE'
group by namespace,normalised_alias having count(distinct entity_id)>1;

create or replace view cns.v_claim_truth_trace with (security_invoker=true) as
select c.claim_id,c.project_id,c.subject_type,c.subject_id,c.predicate,c.value,c.claim_kind,c.knowledge_state,c.authority,c.confidence,
       c.source_id,c.source_revision,c.methodology_id,c.valid_time_start,c.valid_time_end,c.observed_at,c.geography,c.unit,c.scope,c.state,
       case when m.methodology_id is null then null else jsonb_build_object('id',m.methodology_id,'name',m.name,'version',m.version,'assumptions',m.assumptions,'validity_domain',m.validity_domain,'limitations',m.limitations) end as methodology,
       coalesce((select jsonb_agg(jsonb_build_object('relation',ce.relation,'evidence_id',e.evidence_id,'type',e.evidence_type,'source_id',e.source_id,'source_revision',e.source_revision,'uri',e.uri,'content_hash',e.content_hash,'observed_at',e.observed_at,'verified_at',e.verified_at,'state',e.state) order by e.evidence_id,ce.relation)
                 from cns.claim_evidence ce join cns.evidence e using(evidence_id) where ce.claim_id=c.claim_id),'[]'::jsonb) as evidence_links,
       coalesce((select jsonb_agg(jsonb_build_object('conflict_id',cf.conflict_id,'severity',cf.severity,'state',cf.state,'summary',cf.summary) order by cf.severity,cf.conflict_id)
                 from cns.conflict_claims cc join cns.conflicts cf using(conflict_id) where cc.claim_id=c.claim_id and cf.state='OPEN'),'[]'::jsonb) as open_conflicts
from cns.claims c left join cns.methodologies m on m.methodology_id=c.methodology_id;

create or replace view cns.doctor_violations_v3 with (security_invoker=true) as
select * from cns.doctor_violations_v2
union all
select 'ENTITY_ALIAS_COLLISION','P0','ENTITY_ALIAS',namespace||':'||normalised_alias,null,'Active alias resolves to multiple canonical entities'
from cns.v_entity_alias_collisions
union all
select 'OPEN_TRUTH_CONFLICT_P0','P0','CONFLICT',conflict_id,project_id,'Material truth conflict is unresolved'
from cns.conflicts where state='OPEN' and severity='P0'
union all
select 'SOURCE_CLAIM_WITHOUT_SOURCE','P0','CLAIM',claim_id,project_id,'Source fact/claim lacks explicit source identity'
from cns.claims where state in ('ACTIVE','DISPUTED') and claim_kind in ('SOURCE_FACT','SOURCE_CLAIM') and source_id is null
union all
select 'DERIVED_CLAIM_WITHOUT_METHOD','P0','CLAIM',claim_id,project_id,'Derived claim lacks versioned methodology'
from cns.claims where state in ('ACTIVE','DISPUTED') and claim_kind in ('INFERENCE','ESTIMATE','INTERPRETATION','RECOMMENDATION') and methodology_id is null
union all
select 'CLAIM_SOURCE_REVISION_UNKNOWN','P1','CLAIM',claim_id,project_id,'Claim has source identity but no source revision'
from cns.claims where state in ('ACTIVE','DISPUTED') and source_id is not null and nullif(btrim(source_revision),'') is null
union all
select 'RESTRICTED_OBSERVATION_WITH_PUBLIC_GEOMETRY','P0','OBSERVATION',observation_id,project_id,'Restricted observation exposes public geometry'
from cns.observations where sensitivity_state='RESTRICTED' and public_geometry is not null;

create or replace function cns.doctor_scan()
returns integer language plpgsql security definer set search_path=cns,public as $$
declare v_count integer;
begin
  perform cns.expire_dead_leases();
  insert into cns.health_incidents(fingerprint,rule_id,severity,entity_type,entity_id,project_id,summary,evidence,state)
  select encode(digest(rule_id||'|'||entity_type||'|'||entity_id,'sha256'),'hex'),rule_id,severity,entity_type,entity_id,project_id,summary,'[]'::jsonb,'OPEN'
  from cns.doctor_violations_v3
  on conflict(fingerprint) where state in ('OPEN','ACKNOWLEDGED') do update set last_seen_at=now(),summary=excluded.summary,severity=excluded.severity;
  get diagnostics v_count=row_count;
  update cns.health_incidents i set state='RESOLVED',resolved_at=now(),last_seen_at=now()
  where i.state in ('OPEN','ACKNOWLEDGED') and not exists(
    select 1 from cns.doctor_violations_v3 v where encode(digest(v.rule_id||'|'||v.entity_type||'|'||v.entity_id,'sha256'),'hex')=i.fingerprint
  );
  return v_count;
end;
$$;

insert into cns.system_meta(key,value) values
('truth_model','{"version":3,"verified":false,"state":"PENDING_CERTIFICATION","principle":"UNKNOWN_IS_FIRST_CLASS"}'::jsonb)
on conflict(key) do update set value=excluded.value,updated_at=now();

drop view if exists cns.v_cutover_readiness;
create view cns.v_cutover_readiness with (security_invoker=true) as
select
  (exists(select 1 from cns.parity_results) and not exists(select 1 from cns.parity_results where result<>'MATCH')) as parity_green,
  (exists(select 1 from cns.legacy_import_queue) and not exists(select 1 from cns.legacy_import_queue where state in ('STAGED','AMBIGUOUS'))) as hydration_green,
  (coalesce((select state='PASS' from cns.dual_read_runs order by finished_at desc nulls last,started_at desc limit 1),false)) as dual_read_green,
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

-- Defence in depth: CNS stays private even if project-wide API exposure changes.
alter default privileges in schema cns revoke execute on functions from public;
alter default privileges in schema cns revoke all on tables from public,anon,authenticated;
alter default privileges in schema cns revoke all on sequences from public,anon,authenticated;

revoke all on cns.change_trials,cns.entities,cns.entity_aliases,cns.methodologies,cns.observations,cns.signals,cns.interpretations,cns.conflicts,cns.conflict_claims,cns.outcomes,cns.learnings,cns.rule_changes,cns.provenance_edges,cns.control_roles,cns.agent_control_roles,cns.hypotheses from public,anon,authenticated;
revoke all on function cns.begin_change_trial(text,text,uuid,text,text,text,text[],jsonb,uuid) from public,anon,authenticated;
revoke all on function cns.activate_change_trial(uuid) from public,anon,authenticated;
revoke all on function cns.submit_change_trial(uuid,text,uuid) from public,anon,authenticated;
revoke all on function cns.finish_change_trial(uuid,text,text,jsonb) from public,anon,authenticated;
revoke all on function cns.block_change_trial(uuid,text,jsonb) from public,anon,authenticated;
revoke all on function cns.guard_rule_change() from public,anon,authenticated;
revoke all on function cns.doctor_scan() from public,anon,authenticated;

grant select,insert,update on cns.change_trials to service_role;
grant select,insert,update,delete on cns.entities,cns.entity_aliases,cns.methodologies,cns.observations,cns.signals,cns.interpretations,cns.conflicts,cns.conflict_claims,cns.outcomes,cns.learnings,cns.rule_changes,cns.provenance_edges,cns.agent_control_roles,cns.hypotheses to service_role;
grant select on cns.control_roles,cns.v_wip_control,cns.v_entity_alias_collisions,cns.v_claim_truth_trace,cns.doctor_violations_v3,cns.v_cutover_readiness to service_role;
grant usage,select on all sequences in schema cns to service_role;
grant execute on function cns.begin_change_trial(text,text,uuid,text,text,text,text[],jsonb,uuid) to service_role;
grant execute on function cns.activate_change_trial(uuid) to service_role;
grant execute on function cns.submit_change_trial(uuid,text,uuid) to service_role;
grant execute on function cns.finish_change_trial(uuid,text,text,jsonb) to service_role;
grant execute on function cns.block_change_trial(uuid,text,jsonb) to service_role;
grant execute on function cns.doctor_scan() to service_role;

update cns.system_meta
set value='{"version":3,"migration":"20260824193000_cns_change_trials","truth_model":"SUPERBRAIN_V3"}'::jsonb,updated_at=now()
where key='schema_version';

commit;
