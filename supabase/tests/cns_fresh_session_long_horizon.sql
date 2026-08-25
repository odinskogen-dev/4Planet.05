\set ON_ERROR_STOP on
begin;

insert into cns.source_registry(source_id,source_kind,name,authority,truth_domain,current_revision,state,last_verified_at,sensitivity_state)
values
('FS-SOURCE','GOOGLE_DOC','Authoritative current source','CURRENT_ROUTER','PROGRAMME_CURRENT_STATE','rev-1','ACTIVE',clock_timestamp(),'INTERNAL'),
('FS-NOISE-SOURCE','GOOGLE_DOC','Unrelated project source','OTHER','UNRELATED','rev-x','ACTIVE',clock_timestamp(),'INTERNAL');
insert into cns.source_revisions(source_id,revision,persistent_id,retrieved_at,content_hash)
values
('FS-SOURCE','rev-1','urn:fs:1',clock_timestamp(),'fshash'),
('FS-NOISE-SOURCE','rev-x','urn:fs:x',clock_timestamp(),'noisehash');

insert into cns.projects(project_id,slug,name,lifecycle,authority)
values
('FS-4P','fs-4p','4PLANET Fresh Session Proof','ACTIVE','WORKING_CONTROL'),
('FS-NOISE','fs-noise','Unrelated Noise Project','ACTIVE','WORKING_CONTROL');

select cns.commit_project_state(
  'FS-4P','{"state":"ACTIVE","why":"Build trustworthy planetary decision intelligence","outcome":"Precise fresh-session recovery","current_wbs_gate":"SUPERBRAIN CERTIFICATION","next_action":"Prove semantic reconstruction","owner":"AXE","founder_burden":"NONE","health":"GREEN","primary_goal_ids":[]}'::jsonb,
  'SYSTEM','seed','CURRENT_ROUTER','FS-SOURCE','rev-1','fs-state',3600,'[]'::jsonb
);
select cns.commit_project_state(
  'FS-NOISE','{"state":"ACTIVE","why":"Noise","outcome":"Noise","next_action":"Noise","owner":"NOISE","founder_burden":"NONE","health":"GREEN","primary_goal_ids":[]}'::jsonb,
  'SYSTEM','seed','OTHER','FS-NOISE-SOURCE','rev-x','fs-noise-state',3600,'[]'::jsonb
);

select cns.librarian_propose_memory('FS-MEM','FS-4P','SEMANTIC',2::smallint,'Founder operating constraint','{"rule":"No parallel truth stores","qualification":"Existing legacy authority remains until explicit cutover"}'::jsonb,'FOUNDER_DECISION','FS-SOURCE','rev-1');
select cns.librarian_promote_memory(
  'FS-MEM',
  cns.append_event('FS-4P','MEMORY','FS-MEM','MEMORY_REVIEWED','{}','[]','SYSTEM','librarian','CURRENT_ROUTER','FS-SOURCE','rev-1','fs-mem-promote')
);

insert into cns.decisions(decision_id,project_id,title,decision,authority,status,decided_by,decided_at,evidence_refs,rationale,assumptions,alternatives,unknowns,consequences,review_trigger)
values('FS-DEC','FS-4P','SUPERBRAIN authority','Stay SHADOW until all hard gates pass','FOUNDER_DECISION','ACTIVE','FOUNDER',clock_timestamp(),'[]','{"why":"truth before convenience"}','[]','["premature cutover"]','["remote runtime unavailable"]','["legacy remains authority"]','{"when":"all gates green"}');

insert into cns.claims(claim_id,project_id,subject_type,subject_id,predicate,value,authority,confidence,state,claim_kind,knowledge_state,source_id,source_revision,revision,sensitivity_state)
values
('FS-CLAIM','FS-4P','PROJECT','FS-4P','brain.mode','{"value":"SHADOW"}','CURRENT_ROUTER',0.99,'ACTIVE','SOURCE_FACT','KNOWN','FS-SOURCE','rev-1',1,'INTERNAL'),
('FS-UNKNOWN','FS-4P','PROJECT','FS-4P','remote.activation_ready','{"value":null}','CURRENT_ROUTER',null,'ACTIVE','UNKNOWN','UNKNOWN','FS-SOURCE','rev-1',1,'INTERNAL');

insert into cns.hypotheses(hypothesis_id,project_id,owner_identity,title,statement,hypothesis_type,status,falsifiers,supporting_evidence_refs,counter_evidence_refs,publication_state)
values('FS-HYP','FS-4P','FOUNDER','A hypothesis is not a fact','Better information may improve market selection pressure','FOUNDER_THESIS','DRAFT','["no measurable market response"]','[]','[]','PRIVATE');

-- Initial context.
select cns.compile_project_context('FS-4P','fresh-session-certification',3,30000,900);

-- 1,000 irrelevant events in another project must not change FS-4P context or source set.
insert into cns.events(project_id,entity_type,entity_id,event_type,payload,evidence_refs,actor_type,actor_id,authority,source_id,source_revision,idempotency_key,event_hash)
select 'FS-NOISE','NOISE','N-'||g,'NOISE_EVENT',jsonb_build_object('n',g),'[]'::jsonb,'SYSTEM','noise','OTHER','FS-NOISE-SOURCE','rev-x','fs-noise-'||g,
       encode(digest('noise-'||g::text,'sha256'),'hex')
from generate_series(1,1000) g;

select cns.compile_project_context('FS-4P','fresh-session-certification',3,30000,900);

do $$ declare f1 text; f2 text; src jsonb; begin
  select fingerprint,source_revisions into f1,src
  from cns.context_snapshots
  where project_id='FS-4P' and intent='fresh-session-certification'
  order by compiled_at asc,context_snapshot_id asc limit 1;

  select fingerprint into f2
  from cns.context_snapshots
  where project_id='FS-4P' and intent='fresh-session-certification'
  order by compiled_at desc,context_snapshot_id desc limit 1;

  if f1 is null or f2 is null then raise exception 'CNS_FRESH_SESSION_COMPARISON_CONTEXT_MISSING'; end if;
  if f1<>f2 then raise exception 'CNS_UNRELATED_LONG_HORIZON_NOISE_CHANGED_CONTEXT'; end if;
  if src ? 'FS-NOISE-SOURCE' then raise exception 'CNS_UNRELATED_SOURCE_ENTERED_NARROW_CONTEXT'; end if;
  if not (src ? 'FS-SOURCE') then raise exception 'CNS_RELEVANT_SOURCE_MISSING_FROM_CONTEXT'; end if;
end $$;

-- Fresh-session recovery: rebuild projection from immutable event history, then compile from scratch.
select cns.rebuild_project_state('FS-4P',3600);
select cns.invalidate_context_for_project('FS-4P','FRESH_SESSION_RESTART');
select cns.compile_project_context('FS-4P','fresh-session-recovered',3,30000,900);

do $$ declare b jsonb; begin
  select compiled_context into b
  from cns.context_snapshots
  where project_id='FS-4P' and intent='fresh-session-recovered'
  order by compiled_at desc,context_snapshot_id desc limit 1;

  if b is null then raise exception 'CNS_FRESH_SESSION_RECOVERED_CONTEXT_MISSING'; end if;
  if b->'identity'->>'name'<>'4PLANET Fresh Session Proof' then raise exception 'CNS_FRESH_SESSION_IDENTITY_LOST'; end if;
  if b->'current_state'->>'why'<>'Build trustworthy planetary decision intelligence' then raise exception 'CNS_FRESH_SESSION_WHY_LOST'; end if;
  if b->'current_state'->>'next_action'<>'Prove semantic reconstruction' then raise exception 'CNS_FRESH_SESSION_NEXT_ACTION_LOST'; end if;
  if not exists(select 1 from jsonb_array_elements(b->'memories') m where m->>'memory_id'='FS-MEM' and m->'content'->>'qualification'='Existing legacy authority remains until explicit cutover') then
    raise exception 'CNS_FRESH_SESSION_QUALIFICATION_LOST';
  end if;
  if not exists(select 1 from jsonb_array_elements(b->'decisions') d where d->>'decision_id'='FS-DEC' and d->>'decision'='Stay SHADOW until all hard gates pass') then
    raise exception 'CNS_FRESH_SESSION_DECISION_LOST';
  end if;
  if not exists(select 1 from jsonb_array_elements(b->'claims') c where c->>'claim_id'='FS-UNKNOWN' and c->>'knowledge_state'='UNKNOWN' and c->'confidence'='null'::jsonb) then
    raise exception 'CNS_FRESH_SESSION_BLOCKING_UNKNOWN_LOST';
  end if;
  if exists(select 1 from jsonb_array_elements(b->'claims') c where c->>'claim_id'='FS-HYP') then
    raise exception 'CNS_HYPOTHESIS_WAS_PROMOTED_TO_CLAIM';
  end if;
  if b::text like '%FS-NOISE%' or b::text like '%Noise Project%' then raise exception 'CNS_FRESH_SESSION_NOISE_LEAK'; end if;
end $$;

-- Superseded memory must disappear; replacement remains, preserving lineage rather than silent rewrite.
select cns.librarian_propose_memory('FS-MEM-R2','FS-4P','SEMANTIC',2::smallint,'Founder operating constraint','{"rule":"No parallel truth stores","qualification":"Legacy authority remains until explicit founder cutover after all gates pass"}'::jsonb,'FOUNDER_DECISION','FS-SOURCE','rev-1');
select cns.librarian_promote_memory('FS-MEM-R2',cns.append_event('FS-4P','MEMORY','FS-MEM-R2','MEMORY_REVIEWED','{}','[]','SYSTEM','librarian','CURRENT_ROUTER','FS-SOURCE','rev-1','fs-mem-r2-promote'));
select cns.librarian_supersede_memory('FS-MEM','FS-MEM-R2',cns.append_event('FS-4P','MEMORY','FS-MEM','MEMORY_SUPERSEDED','{"by":"FS-MEM-R2"}','[]','SYSTEM','librarian','CURRENT_ROUTER','FS-SOURCE','rev-1','fs-mem-r1-supersede'));
select cns.compile_project_context('FS-4P','after-memory-supersession',3,30000,900);

do $$ declare b jsonb; begin
  select compiled_context into b
  from cns.context_snapshots
  where project_id='FS-4P' and intent='after-memory-supersession'
  order by compiled_at desc,context_snapshot_id desc limit 1;
  if b is null then raise exception 'CNS_MEMORY_SUPERSESSION_CONTEXT_MISSING'; end if;
  if exists(select 1 from jsonb_array_elements(b->'memories') m where m->>'memory_id'='FS-MEM') then raise exception 'CNS_SUPERSEDED_MEMORY_RETRIEVED'; end if;
  if not exists(select 1 from jsonb_array_elements(b->'memories') m where m->>'memory_id'='FS-MEM-R2') then raise exception 'CNS_REPLACEMENT_MEMORY_MISSING'; end if;
end $$;

rollback;
