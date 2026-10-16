\set ON_ERROR_STOP on
begin;

insert into cns.projects(project_id,slug,name,lifecycle,authority)
values
('CTX-A','ctx-a','Context A','ACTIVE','TEST'),
('CTX-B','ctx-b','Context B','ACTIVE','TEST');

select cns.commit_project_state(
  'CTX-A',
  '{"state":"ACTIVE","why":"test","outcome":"same truth","next_action":"verify","owner":"SYSTEM","founder_burden":"NONE","health":"GREEN","primary_goal_ids":[]}'::jsonb,
  'SYSTEM','acceptance-test','TEST',null,'test-rev','ctx-a-state',3600,'[]'::jsonb
);
select cns.commit_project_state(
  'CTX-B',
  '{"state":"ACTIVE","why":"dependency","outcome":"resolve","next_action":"support","owner":"SYSTEM","founder_burden":"NONE","health":"GREEN","primary_goal_ids":[]}'::jsonb,
  'SYSTEM','acceptance-test','TEST',null,'test-rev','ctx-b-state',3600,'[]'::jsonb
);

insert into cns.dependencies(dependency_id,project_id,depends_on_project_id,dependency_type,state,description)
values('DEP-A-B','CTX-A','CTX-B','BLOCKING','OPEN','A depends on B');

insert into cns.entity_routes(entity_type,entity_id,project_id,route_kind,priority)
values('PROJECT_SLUG','ctx-a','CTX-A','PRIMARY',1);

do $$ begin
  if cns.resolve_entity_project('PROJECT_SLUG','ctx-a') <> 'CTX-A' then raise exception 'ENTITY_ROUTE_FAILED'; end if;
  if jsonb_array_length(cns.dependency_closure('CTX-A',8)) <> 1 then raise exception 'DEPENDENCY_CLOSURE_FAILED'; end if;
end $$;

-- Same state + same source revisions + same compiler inputs must produce identical fingerprints.
do $$
declare a uuid; b uuid; af text; bf text;
begin
  a:=cns.compile_project_context('CTX-A','fresh-session',2,12000,900);
  b:=cns.compile_project_context('CTX-A','fresh-session',2,12000,900);
  select fingerprint into af from cns.context_snapshots where context_snapshot_id=a;
  select fingerprint into bf from cns.context_snapshots where context_snapshot_id=b;
  if af<>bf then raise exception 'CONTEXT_COMPILER_NONDETERMINISTIC'; end if;
end $$;

-- Agent policy: Project Agent persistent+scoped; Task Worker ephemeral.
insert into cns.agents(agent_id,agent_kind,scope_project_id,persistent,state)
values('PA-OK','PROJECT_AGENT','CTX-A',true,'READY');
insert into cns.agents(agent_id,agent_kind,scope_project_id,persistent,state)
values('TW-OK','TASK_WORKER','CTX-A',false,'READY');

do $$ begin
  begin
    insert into cns.agents(agent_id,agent_kind,scope_project_id,persistent,state)
    values('PA-BAD','PROJECT_AGENT','CTX-A',false,'READY');
    raise exception 'PROJECT_AGENT_POLICY_NOT_ENFORCED';
  exception when others then
    if sqlerrm='PROJECT_AGENT_POLICY_NOT_ENFORCED' then raise; end if;
  end;
  begin
    insert into cns.agents(agent_id,agent_kind,scope_project_id,persistent,state)
    values('TW-BAD','TASK_WORKER','CTX-A',true,'READY');
    raise exception 'TASK_WORKER_POLICY_NOT_ENFORCED';
  exception when others then
    if sqlerrm='TASK_WORKER_POLICY_NOT_ENFORCED' then raise; end if;
  end;
end $$;

-- Prototype identity can advance acceptance/role but cannot change exact immutable identity after set.
insert into cns.prototypes(prototype_id,project_id,version,role,acceptance_state,exact_sha,immutable_url,evidence_refs)
values('PROTO-IMM','CTX-A',1,'FIXED_REVIEW','SYSTEM_VERIFIED','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','https://immutable.example/1','["test"]'::jsonb);

do $$ begin
  begin
    update cns.prototypes set exact_sha='bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' where prototype_id='PROTO-IMM';
    raise exception 'PROTOTYPE_SHA_MUTATION_NOT_BLOCKED';
  exception when others then
    if sqlerrm='PROTOTYPE_SHA_MUTATION_NOT_BLOCKED' then raise; end if;
  end;
end $$;

-- Cutover readiness must fail closed before actual hydration/parity/dual-read/readback certifications.
do $$
declare r record;
begin
  select * into r from cns.v_cutover_readiness;
  if r.parity_green or r.hydration_green or r.dual_read_green or r.remote_readback_green or r.cutover_authorized then
    raise exception 'CUTOVER_EMPTY_STATE_FALSE_GREEN';
  end if;
end $$;

-- Generated roadmap is queryable from CNS projections.
select count(*) from cns.v_roadmap;

rollback;
