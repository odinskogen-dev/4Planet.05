-- 4PLANET CNS KERNEL 02 — bounded code-change trials / WIP control
-- Implements baseline -> bounded change -> evaluate -> keep/discard without deleting recovery branches.

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

revoke all on cns.change_trials from public,anon,authenticated;
revoke all on function cns.begin_change_trial(text,text,uuid,text,text,text,text[],jsonb,uuid) from public,anon,authenticated;
revoke all on function cns.activate_change_trial(uuid) from public,anon,authenticated;
revoke all on function cns.submit_change_trial(uuid,text,uuid) from public,anon,authenticated;
revoke all on function cns.finish_change_trial(uuid,text,text,jsonb) from public,anon,authenticated;
revoke all on function cns.block_change_trial(uuid,text,jsonb) from public,anon,authenticated;

grant select,insert,update on cns.change_trials to service_role;
grant execute on function cns.begin_change_trial(text,text,uuid,text,text,text,text[],jsonb,uuid) to service_role;
grant execute on function cns.activate_change_trial(uuid) to service_role;
grant execute on function cns.submit_change_trial(uuid,text,uuid) to service_role;
grant execute on function cns.finish_change_trial(uuid,text,text,jsonb) to service_role;
grant execute on function cns.block_change_trial(uuid,text,jsonb) to service_role;
grant select on cns.v_wip_control to service_role;

update cns.system_meta
set value='{"version":2,"migration":"20260824193000_cns_change_trials"}'::jsonb,updated_at=now()
where key='schema_version';

commit;
