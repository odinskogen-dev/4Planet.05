-- 4PLANET SUPERBRAIN — GIGA RECOVERY BOOTSTRAP 08
-- Read-only SHADOW recovery projection. It does not change legacy authority,
-- create work, authorise cutover or replace Founder Decisions / WBS / TEST KING.

begin;

drop view if exists cns.v_giga_recovery_bootstrap;

create view cns.v_giga_recovery_bootstrap with (security_invoker=true) as
with constitution as (
  select
    source_id,
    name,
    uri,
    current_revision,
    authority,
    state,
    metadata
  from cns.source_registry
  where source_id='giga-constitution-2026-09-02'
    and state='ACTIVE'
    and coalesce((metadata->>'mandatory_rehydration')::boolean,false)=true
),
goal_scope as (
  select
    count(*)::int as goal_count,
    jsonb_agg(
      jsonb_build_object(
        'goal_id',g.goal_id,
        'project_id',g.project_id,
        'title',g.title,
        'description',g.description,
        'priority',g.priority,
        'state',g.state,
        'success_criteria',g.success_criteria
      ) order by g.priority,g.project_id
    ) as goals
  from cns.goals g
  where g.goal_id like 'giga-goal-%'
),
recovery_sources as (
  select jsonb_agg(
    jsonb_build_object(
      'source_id',s.source_id,
      'name',s.name,
      'uri',s.uri,
      'authority',s.authority,
      'truth_domain',s.truth_domain,
      'current_revision',s.current_revision,
      'state',s.state
    ) order by s.source_id
  ) as sources
  from cns.source_registry s
  where s.state='ACTIVE'
    and s.source_id in (
      'brain-read-first',
      'brain-project-lead-current',
      'brain-knowledge-os-state',
      'founder-control',
      'giga-constitution-2026-09-02',
      'giga-goals-2026-09-02',
      'prototype-safe',
      'github-4planet05'
    )
),
authority_mode as (
  select coalesce(
    (select value from cns.system_meta where key='authority_mode'),
    '{"mode":"UNKNOWN","cutover_authorized":false}'::jsonb
  ) as value
)
select
  c.source_id as constitution_source_id,
  c.name as constitution_name,
  c.uri as constitution_uri,
  c.current_revision as constitution_revision,
  c.authority as constitution_authority,
  c.metadata->>'content_hash_sha256' as constitution_sha256,
  coalesce((c.metadata->>'mandatory_rehydration')::boolean,false) as constitution_mandatory,
  a.value->>'mode' as authority_mode,
  coalesce((a.value->>'cutover_authorized')::boolean,false) as cutover_authorized,
  g.goal_count as giga_goal_count,
  g.goals as giga_goals,
  r.sources as recovery_sources,
  (c.source_id is not null and g.goal_count >= 24 and jsonb_array_length(r.sources) >= 8) as recovery_surface_complete
from constitution c
cross join goal_scope g
cross join recovery_sources r
cross join authority_mode a;

revoke all on cns.v_giga_recovery_bootstrap from public,anon,authenticated;
grant select on cns.v_giga_recovery_bootstrap to service_role;

insert into cns.system_meta(key,value)
values(
  'giga_recovery_bootstrap',
  jsonb_build_object(
    'verified',false,
    'state','INSTALLED_PENDING_FRESH_READBACK',
    'view','cns.v_giga_recovery_bootstrap',
    'authority','SHADOW_READ_ONLY',
    'cutover_authorized',false,
    'rule','A fresh session must recover the mandatory GIGA Constitution plus full GIGA goal scope and authority pointers without chat memory.'
  )
)
on conflict(key) do update
set value=excluded.value,updated_at=clock_timestamp();

commit;
