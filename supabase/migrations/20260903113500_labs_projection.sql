-- 4PLANET CNS → LABS read-only Founder OS projection.
-- This view is not an authority surface. It projects canonical CNS state only.
-- It is intentionally empty until approved legacy/portfolio hydration occurs.

create or replace view cns.v_labs_projection as
select
  p.project_id,
  p.slug,
  p.name,
  p.parent_project_id,
  p.project_kind,
  p.lifecycle,
  p.authority,
  pcs.state as current_state,
  pcs.why,
  pcs.outcome,
  pcs.current_wbs_gate,
  pcs.next_action,
  coalesce(pcs.blockers, '[]'::jsonb) as blockers,
  pcs.owner,
  pcs.founder_burden,
  pcs.health,
  pcs.verified_at,
  pcs.stale_after,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'goal_id', g.goal_id,
      'title', g.title,
      'description', g.description,
      'priority', g.priority,
      'state', g.state,
      'success_criteria', g.success_criteria,
      'updated_at', g.updated_at
    ) order by g.priority, g.goal_id)
    from cns.goals g
    where g.project_id = p.project_id
  ), '[]'::jsonb) as goals,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'milestone_id', m.milestone_id,
      'goal_id', m.goal_id,
      'title', m.title,
      'state', m.state,
      'target_at', m.target_at,
      'definition_of_done', m.definition_of_done,
      'updated_at', m.updated_at
    ) order by m.target_at nulls last, m.milestone_id)
    from cns.milestones m
    where m.project_id = p.project_id
  ), '[]'::jsonb) as milestones,
  (select count(*) from cns.tasks t where t.project_id = p.project_id) as task_count,
  (select count(*) from cns.tasks t where t.project_id = p.project_id and t.state not in ('DONE','CANCELLED','SUPERSEDED')) as open_task_count,
  (select count(*) from cns.evidence e where e.project_id = p.project_id and e.state = 'VERIFIED') as verified_evidence_count,
  (select count(*) from cns.jobs j where j.project_id = p.project_id and j.state = 'QUEUED') as queued_job_count,
  greatest(p.updated_at, coalesce(pcs.updated_at, p.updated_at)) as updated_at
from cns.projects p
left join cns.project_current_state pcs on pcs.project_id = p.project_id;

comment on view cns.v_labs_projection is
  'Read-only Founder OS projection from canonical CNS project state. Not an authority surface; empty until canonical portfolio hydration.';
