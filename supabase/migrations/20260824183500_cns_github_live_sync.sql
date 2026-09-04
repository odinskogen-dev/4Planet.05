-- 4PLANET CNS KERNEL 02 — live GitHub code-state projection
-- Shadow-safe. Legacy GitHub/Prototype SAFE remain authoritative until cutover.

begin;

alter table cns.code_lines
  add column if not exists pr_state text,
  add column if not exists merge_state text,
  add column if not exists deployment_state text,
  add column if not exists deployment_ref text,
  add column if not exists github_verified_at timestamptz;

create index if not exists cns_code_lines_live_lookup_idx
  on cns.code_lines(repository, branch, pr_number)
  where role in ('ACTIVE_DEVELOPMENT','PRODUCTION','FIXED_REVIEW');

create or replace function cns.observe_code_state(
  p_code_line_id text,
  p_observed_sha text,
  p_pr_state text,
  p_merge_state text,
  p_deployment_state text,
  p_deployment_ref text,
  p_source_revision text,
  p_idempotency_key text,
  p_ttl_seconds integer default 300
) returns bigint
language plpgsql
security definer
set search_path = cns, public
as $$
declare
  v_line cns.code_lines%rowtype;
  v_event bigint;
  v_changed boolean;
begin
  if nullif(btrim(p_observed_sha),'') is null then
    raise exception 'CNS_GITHUB_SHA_REQUIRED';
  end if;
  if p_ttl_seconds < 30 or p_ttl_seconds > 3600 then
    raise exception 'CNS_GITHUB_TTL_OUT_OF_RANGE';
  end if;

  select * into v_line
  from cns.code_lines
  where code_line_id = p_code_line_id
  for update;

  if not found then
    raise exception 'CNS_CODE_LINE_NOT_FOUND';
  end if;

  v_changed := v_line.exact_sha is distinct from p_observed_sha
    or v_line.pr_state is distinct from p_pr_state
    or v_line.merge_state is distinct from p_merge_state
    or v_line.deployment_state is distinct from p_deployment_state
    or v_line.deployment_ref is distinct from p_deployment_ref;

  v_event := cns.append_event(
    v_line.project_id,
    'CODE_LINE',
    p_code_line_id,
    case when v_changed then 'CODE_STATE_CHANGED' else 'CODE_STATE_VERIFIED' end,
    jsonb_build_object(
      'repository', v_line.repository,
      'branch', v_line.branch,
      'pr_number', v_line.pr_number,
      'previous_sha', v_line.exact_sha,
      'observed_sha', p_observed_sha,
      'pr_state', p_pr_state,
      'merge_state', p_merge_state,
      'deployment_state', p_deployment_state,
      'deployment_ref', p_deployment_ref,
      'verified_live', true
    ),
    '[]'::jsonb,
    'SYSTEM',
    'CNS_GITHUB_SYNC',
    'LIVE_GITHUB_OBSERVATION',
    null,
    p_source_revision,
    p_idempotency_key
  );

  update cns.code_lines
  set observed_sha = p_observed_sha,
      exact_sha = p_observed_sha,
      pr_state = p_pr_state,
      merge_state = p_merge_state,
      deployment_state = p_deployment_state,
      deployment_ref = p_deployment_ref,
      github_verified_at = now(),
      verified_at = now(),
      stale_after = now() + make_interval(secs => p_ttl_seconds),
      last_event_id = v_event
  where code_line_id = p_code_line_id;

  if v_changed then
    update cns.context_snapshots
    set invalidated_at = coalesce(invalidated_at, now())
    where project_id = v_line.project_id
      and invalidated_at is null;
  end if;

  return v_event;
end;
$$;

revoke all on function cns.observe_code_state(text,text,text,text,text,text,text,text,integer) from public, anon, authenticated;
grant execute on function cns.observe_code_state(text,text,text,text,text,text,text,text,integer) to service_role;

comment on function cns.observe_code_state(text,text,text,text,text,text,text,text,integer)
is 'Only supported live-code observation path: append event, project exact GitHub SHA/PR/merge/deploy state, invalidate stale context on drift.';

commit;
