\set ON_ERROR_STOP on
\timing on

-- Ephemeral certification scale test. Never run on production.
-- Extends prior 10k / million-event proof to 50k project addressing plus Planet graph volume.

insert into cns.source_registry(
  source_id,source_kind,name,authority,truth_domain,current_revision,state,last_verified_at,
  visibility_state,rights_state,source_quality_state,freshness_state
) values(
  'scale50-source','SYNTHETIC','CNS 50K + Planet Scale Fixture','TEST','SCALE','v1','ACTIVE',now(),
  'INTERNAL','ALLOW','SYNTHETIC_TEST','CURRENT'
) on conflict(source_id) do nothing;

-- 50,000 projects, including very similar names/slugs to expose cross-project contamination.
insert into cns.projects(project_id,slug,name,lifecycle,authority,source_id,source_revision,visibility_state)
select 'S50-'||lpad(g::text,5,'0'),'scale50-'||g,'Scale 50 Project '||g,'ACTIVE','TEST','scale50-source','v1','INTERNAL'
from generate_series(1,50000) g
on conflict(project_id) do nothing;

-- 250,000 tasks and 250,000 project dependencies.
insert into cns.tasks(task_id,project_id,title,state,priority,next_gate)
select 'S50T-'||p||'-'||n,'S50-'||lpad(p::text,5,'0'),'Task '||n,
       case when n=1 then 'ACTIVE' else 'READY' end,least(n,9),'SCALE50'
from generate_series(1,50000) p cross join generate_series(1,5) n
on conflict(task_id) do nothing;

insert into cns.dependencies(dependency_id,project_id,depends_on_project_id,dependency_type,state,description)
select 'S50D-'||p||'-'||n,
       'S50-'||lpad(p::text,5,'0'),
       'S50-'||lpad((((p+n-1)%50000)+1)::text,5,'0'),
       'INFORMATIONAL','SATISFIED','synthetic scale50 relation'
from generate_series(1,50000) p cross join generate_series(1,5) n
on conflict(dependency_id) do nothing;

-- 500,000 immutable project events: enough event history to test exact project retrieval at 50k breadth.
insert into cns.events(
  event_schema_version,project_id,entity_type,entity_id,event_type,payload,evidence_refs,actor_type,actor_id,
  authority,source_id,source_revision,idempotency_key,correlation_id,event_hash
)
select 1,'S50-'||lpad(p::text,5,'0'),'PROJECT','S50-'||lpad(p::text,5,'0'),'SCALE50_EVENT',
       jsonb_build_object('sequence',n),'[]'::jsonb,'SYSTEM','scale50','TEST','scale50-source','v1',
       'scale50-event-'||p||'-'||n,gen_random_uuid(),encode(digest('scale50-event-'||p||'-'||n,'sha256'),'hex')
from generate_series(1,50000) p cross join generate_series(1,10) n
on conflict(idempotency_key) do nothing;

-- Planet graph: 100k canonical entities, 400k semantic relationships, 500k observations.
insert into cns.entities(
  entity_id,entity_type,canonical_name,lifecycle,source_id,source_revision,visibility_state,
  nature_sensitivity_state,review_state,evidence_strength,revision
)
select 'planet-scale-entity-'||g,
       case (g % 8)
         when 0 then 'TAXON' when 1 then 'PLACE' when 2 then 'LIVING_SYSTEM' when 3 then 'ACTOR'
         when 4 then 'SOLUTION' when 5 then 'PRESSURE' when 6 then 'HUMAN_SYSTEM' else 'MISSION' end,
       'Planet Scale Entity '||g,'ACTIVE','scale50-source','v1','INTERNAL','NONE','SOURCE_CHECKED','MODERATE',1
from generate_series(1,100000) g
on conflict(entity_id) do nothing;

insert into cns.relationships(
  relationship_id,subject_entity_id,predicate,object_entity_id,relationship_kind,source_id,source_revision,
  review_state,evidence_strength,interpretation_state,visibility_state,state,revision
)
select 'planet-scale-rel-'||g||'-'||n,
       'planet-scale-entity-'||g,
       case n when 1 then 'RELATED_TO' when 2 then 'AFFECTS' when 3 then 'DEPENDS_ON' else 'ADDRESSES' end,
       'planet-scale-entity-'||(((g+n-1)%100000)+1),
       'SYNTHETIC','scale50-source','v1','SOURCE_CHECKED','MODERATE','NORMALISED_RECORD','INTERNAL','ACTIVE',1
from generate_series(1,100000) g cross join generate_series(1,4) n
on conflict(relationship_id) do nothing;

-- One immutable source record shared by synthetic observation fixture, preserving provenance semantics.
insert into cns.datasets(dataset_id,source_id,upstream_dataset_id,title,publisher,rights_state,visibility_state)
values('dataset:scale50','scale50-source','scale50','Scale 50 Dataset','TEST','ALLOW','INTERNAL')
on conflict(dataset_id) do nothing;

insert into cns.source_records(
  source_record_id,source_id,dataset_id,upstream_record_id,retrieved_at,payload_hash,raw_payload,
  rights_state,parse_state,visibility_state
) values(
  'source-record:scale50:fixture','scale50-source','dataset:scale50','fixture',now(),'scale50-fixture-hash',
  '{"synthetic":true}'::jsonb,'ALLOW','VALID','INTERNAL'
) on conflict(source_record_id) do nothing;

insert into cns.observations(
  observation_id,entity_id,observation_type,value,observed_at,source_id,source_revision,source_record_id,
  sensitivity_state,state,revision,visibility_state,nature_sensitivity_class,review_state,evidence_strength,
  interpretation_state,freshness_state
)
select 'planet-scale-obs-'||g,
       'planet-scale-entity-'||(((g-1)%100000)+1),'SYNTHETIC_OCCURRENCE',jsonb_build_object('n',g),
       now() - ((g % 365)||' days')::interval,'scale50-source','v1','source-record:scale50:fixture',
       'PUBLIC','ACTIVE',1,'INTERNAL','NONE','SOURCE_CHECKED','MODERATE','NORMALISED_RECORD','CURRENT'
from generate_series(1,500000) g
on conflict(observation_id) do nothing;

analyze cns.projects;
analyze cns.tasks;
analyze cns.dependencies;
analyze cns.events;
analyze cns.entities;
analyze cns.relationships;
analyze cns.observations;

do $$
begin
  if (select count(*) from cns.projects where project_id like 'S50-%') <> 50000 then raise exception 'SCALE50_PROJECT_COUNT_FAIL'; end if;
  if (select count(*) from cns.tasks where project_id like 'S50-%') <> 250000 then raise exception 'SCALE50_TASK_COUNT_FAIL'; end if;
  if (select count(*) from cns.dependencies where project_id like 'S50-%') <> 250000 then raise exception 'SCALE50_DEPENDENCY_COUNT_FAIL'; end if;
  if (select count(*) from cns.events where project_id like 'S50-%') <> 500000 then raise exception 'SCALE50_EVENT_COUNT_FAIL'; end if;
  if (select count(*) from cns.entities where entity_id like 'planet-scale-entity-%') <> 100000 then raise exception 'PLANET_ENTITY_COUNT_FAIL'; end if;
  if (select count(*) from cns.relationships where relationship_id like 'planet-scale-rel-%') <> 400000 then raise exception 'PLANET_RELATIONSHIP_COUNT_FAIL'; end if;
  if (select count(*) from cns.observations where observation_id like 'planet-scale-obs-%') <> 500000 then raise exception 'PLANET_OBSERVATION_COUNT_FAIL'; end if;
end $$;

-- Exact retrieval / contamination checks at opposite ends and near-identical project IDs.
do $$
declare
  v_events integer;
  v_tasks integer;
begin
  select count(*) into v_events from cns.events where project_id='S50-37428';
  select count(*) into v_tasks from cns.tasks where project_id='S50-37428';
  if v_events<>10 or v_tasks<>5 then raise exception 'SCALE50_PROJECT_37428_CONTEXT_FAIL:%:%',v_events,v_tasks; end if;
  if exists(select 1 from cns.tasks where project_id='S50-37428' and task_id like 'S50T-37429-%') then
    raise exception 'SCALE50_CROSS_PROJECT_CONTAMINATION';
  end if;
end $$;

-- Graph traversal check: exactly four direct semantic edges for an entity, independent from project dependencies.
do $$
begin
  if (select count(*) from cns.relationships where subject_entity_id='planet-scale-entity-42428')<>4 then
    raise exception 'PLANET_GRAPH_DIRECT_TRAVERSAL_FAIL';
  end if;
  if (select count(*) from cns.relationships where object_entity_id='planet-scale-entity-42428')<>4 then
    raise exception 'PLANET_GRAPH_REVERSE_TRAVERSAL_FAIL';
  end if;
end $$;

-- Hot paths should be index-backed; plans remain visible in CI evidence.
explain (analyze,buffers) select * from cns.events where project_id='S50-37428' order by event_id desc limit 100;
explain (analyze,buffers) select * from cns.tasks where project_id='S50-37428' and state in ('ACTIVE','READY') order by priority,updated_at desc limit 100;
explain (analyze,buffers) select * from cns.relationships where subject_entity_id='planet-scale-entity-42428' and state='ACTIVE';
explain (analyze,buffers) select * from cns.observations where entity_id='planet-scale-entity-42428' order by observed_at desc limit 100;

select jsonb_build_object(
  'projects',50000,
  'tasks',(select count(*) from cns.tasks where project_id like 'S50-%'),
  'project_relationships',(select count(*) from cns.dependencies where project_id like 'S50-%'),
  'events',(select count(*) from cns.events where project_id like 'S50-%'),
  'planet_entities',(select count(*) from cns.entities where entity_id like 'planet-scale-entity-%'),
  'planet_relationships',(select count(*) from cns.relationships where relationship_id like 'planet-scale-rel-%'),
  'planet_observations',(select count(*) from cns.observations where observation_id like 'planet-scale-obs-%')
) as scale50_result;
