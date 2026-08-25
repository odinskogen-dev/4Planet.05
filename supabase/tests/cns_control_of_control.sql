\set ON_ERROR_STOP on
begin;

insert into cns.projects(project_id,slug,name,lifecycle,authority)
values('COC-A','coc-a','Control of Control A','ACTIVE','TEST'),('COC-B','coc-b','Control of Control B','ACTIVE','TEST');

insert into cns.source_registry(source_id,source_kind,name,authority,truth_domain,current_revision,state,last_verified_at)
values('COC-SOURCE','PRIMARY_DATASET','Control source','TEST','CONTROL_TEST','rev-1','ACTIVE',now());
insert into cns.source_revisions(source_id,revision,persistent_id,retrieved_at,content_hash)
values('COC-SOURCE','rev-1','urn:test:coc:rev1',now(),'rev1hash');

select cns.commit_project_state(
  'COC-A','{"state":"ACTIVE","why":"test control integrity","outcome":"auditable brain","next_action":"run audit","owner":"SYSTEM","founder_burden":"NONE","health":"GREEN","primary_goal_ids":[]}'::jsonb,
  'SYSTEM','coc-test','TEST','COC-SOURCE','rev-1','coc-a-state',3600,'[]'::jsonb
);
select cns.commit_project_state(
  'COC-B','{"state":"ACTIVE","why":"scope isolation","outcome":"no leakage","next_action":"stay isolated","owner":"SYSTEM","founder_burden":"NONE","health":"GREEN","primary_goal_ids":[]}'::jsonb,
  'SYSTEM','coc-test','TEST','COC-SOURCE','rev-1','coc-b-state',3600,'[]'::jsonb
);

-- Memory must enter through Librarian candidate -> reviewed promotion.
select cns.librarian_propose_memory('COC-MEM-A','COC-A','EPISODIC',1::smallint,'A memory','{"scope":"A","important":true}'::jsonb,'TEST','COC-SOURCE','rev-1');

do $$ begin
  begin
    insert into cns.memory_items(memory_id,project_id,memory_type,depth,title,content,authority,fingerprint,state)
    values('COC-MEM-BYPASS','COC-A','EPISODIC',1,'bypass','{"bad":true}','TEST','bypass-fp','ACTIVE');
    raise exception 'CNS_MEMORY_DIRECT_ACTIVE_INSERT_NOT_BLOCKED';
  exception when others then
    if sqlerrm='CNS_MEMORY_DIRECT_ACTIVE_INSERT_NOT_BLOCKED' then raise; end if;
    if sqlerrm not like '%CNS_MEMORY_ACTIVE_INSERT_FORBIDDEN%' then raise; end if;
  end;
end $$;

select cns.librarian_promote_memory(
  'COC-MEM-A',
  cns.append_event('COC-A','MEMORY','COC-MEM-A','MEMORY_REVIEWED','{}','[]','SYSTEM','librarian','TEST','COC-SOURCE','rev-1','coc-memory-promote')
);

do $$ begin
  if (select state from cns.memory_items where memory_id='COC-MEM-A')<>'ACTIVE' then raise exception 'CNS_LIBRARIAN_PROMOTION_FAILED'; end if;
  begin
    update cns.memory_items set content='{"poisoned":true}'::jsonb where memory_id='COC-MEM-A';
    raise exception 'CNS_ACTIVE_MEMORY_REWRITE_NOT_BLOCKED';
  exception when others then
    if sqlerrm='CNS_ACTIVE_MEMORY_REWRITE_NOT_BLOCKED' then raise; end if;
    if sqlerrm not like '%CNS_ACTIVE_MEMORY_CONTENT_IMMUTABLE%' then raise; end if;
  end;
end $$;

-- Scope isolation: another project's memory must not enter COC-A context.
select cns.librarian_propose_memory('COC-MEM-B','COC-B','EPISODIC',1::smallint,'B memory','{"scope":"B","secret":"must-not-leak"}'::jsonb,'TEST','COC-SOURCE','rev-1');
select cns.librarian_promote_memory(
  'COC-MEM-B',
  cns.append_event('COC-B','MEMORY','COC-MEM-B','MEMORY_REVIEWED','{}','[]','SYSTEM','librarian','TEST','COC-SOURCE','rev-1','coc-memory-b-promote')
);

insert into cns.claims(claim_id,project_id,subject_type,subject_id,predicate,value,authority,confidence,state,claim_kind,knowledge_state,source_id,source_revision,revision)
values('COC-CLAIM-A-R1','COC-A','PROJECT','COC-A','test.fact','{"value":1}'::jsonb,'TEST',0.9,'ACTIVE','SOURCE_FACT','KNOWN','COC-SOURCE','rev-1',1);

-- Deterministic, narrow context: same inputs => same fingerprint; depth 2 excludes claims; depth 3 includes them.
do $$
declare s1 uuid; s2 uuid; s3 uuid; f1 text; f2 text; b2 jsonb; b3 jsonb;
begin
  s1:=cns.compile_project_context('COC-A','control-test',2,12000,900);
  s2:=cns.compile_project_context('COC-A','control-test',2,12000,900);
  s3:=cns.compile_project_context('COC-A','control-test-depth3',3,12000,900);
  select fingerprint,compiled_context into f1,b2 from cns.context_snapshots where context_snapshot_id=s1;
  select fingerprint into f2 from cns.context_snapshots where context_snapshot_id=s2;
  select compiled_context into b3 from cns.context_snapshots where context_snapshot_id=s3;
  if f1<>f2 then raise exception 'CNS_CONTEXT_NONDETERMINISTIC'; end if;
  if jsonb_array_length(b2->'claims')<>0 then raise exception 'CNS_CONTEXT_DEPTH2_LEAKED_CLAIMS'; end if;
  if not exists(select 1 from jsonb_array_elements(b3->'claims') x where x->>'claim_id'='COC-CLAIM-A-R1') then raise exception 'CNS_CONTEXT_DEPTH3_MISSED_CLAIM'; end if;
  if b2::text like '%must-not-leak%' or b3::text like '%must-not-leak%' then raise exception 'CNS_CONTEXT_PROJECT_MEMORY_LEAK'; end if;
end $$;

-- Fail-closed budget: large relevant memory must not be silently truncated into an apparently valid context.
select cns.librarian_propose_memory('COC-MEM-LARGE','COC-A','EPISODIC',1::smallint,'Large memory',jsonb_build_object('payload',repeat('x',12000)),'TEST','COC-SOURCE','rev-1');
select cns.librarian_promote_memory(
  'COC-MEM-LARGE',
  cns.append_event('COC-A','MEMORY','COC-MEM-LARGE','MEMORY_REVIEWED','{}','[]','SYSTEM','librarian','TEST','COC-SOURCE','rev-1','coc-memory-large-promote')
);
do $$ begin
  begin
    perform cns.compile_project_context('COC-A','tiny-budget',1,256,900);
    raise exception 'CNS_CONTEXT_BUDGET_FAIL_CLOSED_MISSING';
  exception when others then
    if sqlerrm='CNS_CONTEXT_BUDGET_FAIL_CLOSED_MISSING' then raise; end if;
    if sqlerrm not like '%CNS_CONTEXT_BUDGET_EXCEEDED%' then raise; end if;
  end;
end $$;

-- Source revision drift must be detected by the independent Auditor, not silently accepted.
insert into cns.source_revisions(source_id,revision,persistent_id,retrieved_at,content_hash)
values('COC-SOURCE','rev-2','urn:test:coc:rev2',now(),'rev2hash');
update cns.source_registry set current_revision='rev-2',last_verified_at=now() where source_id='COC-SOURCE';

do $$
declare a uuid; s text;
begin
  a:=cns.audit_control_plane('induced-source-drift','test-sha');
  select state into s from cns.control_cycles where control_cycle_id=a;
  if s<>'FAIL' then raise exception 'CNS_META_AUDITOR_DID_NOT_FAIL_ON_SOURCE_DRIFT'; end if;
  if not exists(select 1 from cns.control_assertions where control_cycle_id=a and assertion_key='CONTEXT_SOURCE_REVISION_DRIFT' and passed=false) then
    raise exception 'CNS_META_AUDITOR_SOURCE_DRIFT_ASSERTION_MISSING';
  end if;
end $$;

-- Heal explicitly and preserve history: invalidate old context, supersede old claim, append a new revision.
select cns.invalidate_context_for_project('COC-A','SOURCE_REVISION_CHANGED');
select cns.invalidate_context_for_project('COC-B','SOURCE_REVISION_CHANGED');
update cns.claims set state='SUPERSEDED' where claim_id='COC-CLAIM-A-R1';
insert into cns.claims(claim_id,project_id,subject_type,subject_id,predicate,value,authority,confidence,state,claim_kind,knowledge_state,source_id,source_revision,revision,supersedes_claim_id)
values('COC-CLAIM-A-R2','COC-A','PROJECT','COC-A','test.fact','{"value":1}'::jsonb,'TEST',0.9,'ACTIVE','SOURCE_FACT','KNOWN','COC-SOURCE','rev-2',2,'COC-CLAIM-A-R1');

-- Large memory is intentionally superseded through Librarian before normal fresh-context compilation.
select cns.librarian_propose_memory('COC-MEM-LARGE-R2','COC-A','EPISODIC',1::smallint,'Large memory compacted','{"payload":"compacted"}'::jsonb,'TEST','COC-SOURCE','rev-2');
select cns.librarian_promote_memory(
  'COC-MEM-LARGE-R2',
  cns.append_event('COC-A','MEMORY','COC-MEM-LARGE-R2','MEMORY_REVIEWED','{}','[]','SYSTEM','librarian','TEST','COC-SOURCE','rev-2','coc-memory-large-r2-promote')
);
select cns.librarian_supersede_memory(
  'COC-MEM-LARGE','COC-MEM-LARGE-R2',
  cns.append_event('COC-A','MEMORY','COC-MEM-LARGE','MEMORY_SUPERSEDED','{"by":"COC-MEM-LARGE-R2"}','[]','SYSTEM','librarian','TEST','COC-SOURCE','rev-2','coc-memory-large-supersede')
);

perform cns.compile_project_context('COC-A','fresh-after-source-change',2,12000,900);

do $$
declare a uuid; s text; green boolean;
begin
  a:=cns.audit_control_plane('healed-control-plane','test-sha-2');
  select state into s from cns.control_cycles where control_cycle_id=a;
  if s<>'PASS' then raise exception 'CNS_META_AUDITOR_DID_NOT_RETURN_TO_PASS'; end if;
  select control_of_control_green into green from cns.v_superbrain_operating_readiness;
  if green is not true then raise exception 'CNS_CONTROL_OF_CONTROL_READINESS_NOT_GREEN'; end if;
end $$;

-- The control layer never authorises cutover by itself.
do $$ begin
  if (select cutover_authorized from cns.v_superbrain_operating_readiness) then raise exception 'CNS_META_AUDIT_MUST_NOT_AUTHORIZE_CUTOVER'; end if;
end $$;

rollback;
