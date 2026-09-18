-- 4PLANET SUPERBRAIN — GIGA GOAL OBJECTS BOUNDED SHADOW HYDRATION
-- Source-derived projection only. Legacy Drive/BRAIN remains authoritative.
-- Does not create work, reprioritise WIP, change Canon or authorise cutover.
\set ON_ERROR_STOP on

begin;

insert into cns.goals(
  goal_id, project_id, title, description, priority, state, success_criteria
)
select
  'giga-goal-' || q.entity_key,
  q.entity_key,
  coalesce(nullif(q.raw_payload->>'objective',''), q.raw_payload->>'project', q.entity_key),
  q.raw_payload->>'why',
  case
    when upper(coalesce(q.raw_payload->>'priority','')) like 'P0%' then 1
    when upper(coalesce(q.raw_payload->>'priority','')) like 'P1%' then 2
    when upper(coalesce(q.raw_payload->>'priority','')) like 'P2%' then 3
    else 4
  end,
  case
    when upper(coalesce(q.raw_payload->>'status','')) like 'HOLD%' then 'PAUSED'
    else 'ACTIVE'
  end,
  jsonb_build_array(
    jsonb_build_object('type','KPI','value',q.raw_payload->>'kpi'),
    jsonb_build_object('type','PROOF','value',q.raw_payload->>'proof'),
    jsonb_build_object('type','WBS','value',q.raw_payload->>'wbs'),
    jsonb_build_object('type','FOUNDER_GATE','value',q.raw_payload->>'founder_gate'),
    jsonb_build_object('type','FACTORY_PHASE','value',q.raw_payload->>'factory_phase')
  )
from cns.legacy_import_queue q
join cns.projects p on p.project_id=q.entity_key
where q.source_id='giga-goals-2026-09-02'
  and q.source_revision='GIGA-PLAN-2026-09-02-v3'
  and q.entity_type='PROJECT_FAMILY'
  and q.import_purpose='AUTHORITY_DATA'
  and q.state='HYDRATED'
on conflict(goal_id) do update
set title=excluded.title,
    description=excluded.description,
    priority=excluded.priority,
    state=excluded.state,
    success_criteria=excluded.success_criteria,
    updated_at=clock_timestamp();

insert into cns.system_meta(key,value)
values(
  'giga_goal_objects_shadow_hydration',
  jsonb_build_object(
    'verified',true,
    'state','SHADOW_SOURCE_DERIVED',
    'source_id','giga-goals-2026-09-02',
    'source_revision','GIGA-PLAN-2026-09-02-v3',
    'goal_count',(select count(*) from cns.goals where goal_id like 'giga-goal-%'),
    'authority','SHADOW_COPY',
    'creates_wip',false,
    'cutover_authority',false
  )
)
on conflict(key) do update set value=excluded.value,updated_at=clock_timestamp();

commit;
