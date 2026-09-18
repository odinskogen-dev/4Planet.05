\set ON_ERROR_STOP on
\timing on

-- Runs only against an ephemeral certification database. Never run on production.
insert into cns.source_registry(source_id,source_kind,name,authority,truth_domain,current_revision,state,last_verified_at)
values('scale-source','SYNTHETIC','CNS Scale Fixture','TEST','SCALE','v1','ACTIVE',now())
on conflict(source_id) do nothing;

insert into cns.agents(agent_id,agent_kind,persistent,state)
values('scale-worker','TASK_WORKER',false,'READY'),('scale-traffic','TRAFFIC',true,'READY')
on conflict(agent_id) do nothing;

-- 10,000 projects.
insert into cns.projects(project_id,slug,name,lifecycle,authority,source_id,source_revision)
select 'SCALE-'||lpad(g::text,5,'0'),'scale-'||g,'Scale Project '||g,'ACTIVE','TEST','scale-source','v1'
from generate_series(1,10000) g
on conflict(project_id) do nothing;

-- 100,000 goals and 100,000 WBS tasks.
insert into cns.goals(goal_id,project_id,title,priority,state)
select 'SG-'||p||'-'||n,'SCALE-'||lpad(p::text,5,'0'),'Goal '||n,least(n,9),'ACTIVE'
from generate_series(1,10000) p cross join generate_series(1,10) n
on conflict(goal_id) do nothing;

insert into cns.tasks(task_id,project_id,title,state,priority,next_gate)
select 'ST-'||p||'-'||n,'SCALE-'||lpad(p::text,5,'0'),'Task '||n,case when n=1 then 'ACTIVE' else 'READY' end,least(n,9),'SCALE'
from generate_series(1,10000) p cross join generate_series(1,10) n
on conflict(task_id) do nothing;

-- 100,000 project relationships (10 outgoing edges/project, wrapped without self loops).
insert into cns.dependencies(dependency_id,project_id,depends_on_project_id,dependency_type,state,description)
select 'SD-'||p||'-'||n,
       'SCALE-'||lpad(p::text,5,'0'),
       'SCALE-'||lpad((((p+n-1)%10000)+1)::text,5,'0'),
       'INFORMATIONAL','SATISFIED','synthetic relation'
from generate_series(1,10000) p cross join generate_series(1,10) n
on conflict(dependency_id) do nothing;

-- 1,000,000 immutable events. Set-based insertion deliberately stresses the real ledger/indexes.
insert into cns.events(event_schema_version,project_id,entity_type,entity_id,event_type,payload,evidence_refs,actor_type,actor_id,authority,source_id,source_revision,idempotency_key,correlation_id,event_hash)
select 1,
       'SCALE-'||lpad(p::text,5,'0'),
       'PROJECT','SCALE-'||lpad(p::text,5,'0'),'SCALE_EVENT',
       jsonb_build_object('sequence',n),'[]'::jsonb,'SYSTEM','scale','TEST','scale-source','v1',
       'scale-event-'||p||'-'||n,gen_random_uuid(),
       encode(digest('scale-event-'||p||'-'||n,'sha256'),'hex')
from generate_series(1,10000) p cross join generate_series(1,100) n
on conflict(idempotency_key) do nothing;

-- One regenerable current projection per project, anchored to latest event.
select set_config('cns.projection_writer','on',false);
insert into cns.project_current_state(project_id,projection_version,why,outcome,state,current_wbs_gate,next_action,owner,founder_burden,health,last_event_id,verified_at,stale_after)
select e.project_id,1,'Scale verification','Scale verification','ACTIVE','SCALE','Continue synthetic verification','SYSTEM','NONE','GREEN',max(e.event_id),now(),now()+interval '1 hour'
from cns.events e where e.project_id like 'SCALE-%' group by e.project_id
on conflict(project_id) do update set last_event_id=excluded.last_event_id,verified_at=excluded.verified_at,stale_after=excluded.stale_after;
select set_config('cns.projection_writer','off',false);

analyze cns.projects;
analyze cns.events;
analyze cns.tasks;
analyze cns.dependencies;
analyze cns.project_current_state;

-- Cardinality certification.
do $$
begin
  if (select count(*) from cns.projects where project_id like 'SCALE-%') <> 10000 then raise exception 'SCALE_PROJECT_COUNT_FAIL'; end if;
  if (select count(*) from cns.tasks where project_id like 'SCALE-%') <> 100000 then raise exception 'SCALE_TASK_COUNT_FAIL'; end if;
  if (select count(*) from cns.dependencies where project_id like 'SCALE-%') <> 100000 then raise exception 'SCALE_DEPENDENCY_COUNT_FAIL'; end if;
  if (select count(*) from cns.events where project_id like 'SCALE-%') <> 1000000 then raise exception 'SCALE_EVENT_COUNT_FAIL'; end if;
  if (select count(*) from cns.project_current_state where project_id like 'SCALE-%') <> 10000 then raise exception 'SCALE_STATE_COUNT_FAIL'; end if;
end $$;

-- Hot-path read checks; EXPLAIN must show an index-backed plan in CI output.
explain (analyze,buffers) select * from cns.events where project_id='SCALE-05000' order by event_id desc limit 100;
explain (analyze,buffers) select * from cns.tasks where project_id='SCALE-05000' and state in ('ACTIVE','READY') order by priority,updated_at desc limit 100;
explain (analyze,buffers) select * from cns.project_current_state where project_id='SCALE-05000';

select jsonb_build_object(
  'projects',(select count(*) from cns.projects where project_id like 'SCALE-%'),
  'tasks',(select count(*) from cns.tasks where project_id like 'SCALE-%'),
  'relationships',(select count(*) from cns.dependencies where project_id like 'SCALE-%'),
  'events',(select count(*) from cns.events where project_id like 'SCALE-%'),
  'current_states',(select count(*) from cns.project_current_state where project_id like 'SCALE-%')
) as scale_result;
