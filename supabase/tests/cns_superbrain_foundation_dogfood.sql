-- SUPERBRAIN FOUNDATION DOGFOOD 01
-- Real actor shapes, shadow/transactional runtime proof. No production cutover.
\set ON_ERROR_STOP on

begin;

-- Canonical source pointer for the company identity/relationship proof used here.
insert into cns.source_registry(
  source_id,source_kind,name,uri,authority,truth_domain,current_revision,state,last_verified_at,trust_domain_id
) values (
  'dogfood:source:skog-20260805','GOOGLE_DRIVE_DOCUMENT',
  'SKOG COMMUNICATIONS AS — Vedtektsendring, generalforsamling og Samordnet registermelding 2026-08-05',
  'https://docs.google.com/document/d/1JgNOz-nORWmvNQZJD4kMyMyCDAwxiBjqG_TT44IT_lY/edit',
  'SOURCE_EVIDENCE','COMPANY','2026-08-05','ACTIVE',clock_timestamp(),'4PLANET_INTERNAL'
) on conflict(source_id) do nothing;

insert into cns.source_revisions(source_id,revision,content_hash,observed_at)
values('dogfood:source:skog-20260805','2026-08-05',null,clock_timestamp())
on conflict(source_id,revision) do nothing;

insert into cns.entities(entity_id,entity_type,canonical_name,metadata,trust_domain_id)
values
  ('dogfood:person:odin','PERSON','Odin Oddekalv','{"dogfood":true}'::jsonb,'ACTOR_PRIVATE'),
  ('dogfood:company:skog','COMPANY','SKOG COMMUNICATIONS AS','{"organisation_number":"923003789","dogfood":true}'::jsonb,'ACTOR_PRIVATE')
on conflict(entity_id) do nothing;

insert into cns.actors(actor_id,actor_type,home_trust_domain_id,metadata)
values
  ('dogfood:person:odin','PERSON','ACTOR_PRIVATE','{"surface":"4SAPIEN"}'::jsonb),
  ('dogfood:company:skog','COMPANY','ACTOR_PRIVATE','{"surface":"4BRANDS"}'::jsonb)
on conflict(actor_id) do nothing;

insert into cns.identities(identity_id,identity_kind,auth_provider,auth_subject,person_actor_id,metadata)
values('dogfood:identity:odin','HUMAN','DOGFOOD_SHADOW','odin','dogfood:person:odin','{"fourplanet_id_candidate":true}'::jsonb)
on conflict(identity_id) do nothing;

insert into cns.workspaces(workspace_id,workspace_kind,name,primary_actor_id,trust_domain_id)
values
  ('dogfood:ws:odin','PERSONAL','Odin Personal Workspace','dogfood:person:odin','ACTOR_PRIVATE'),
  ('dogfood:ws:skog','ORGANISATION','SKOG Company Workspace','dogfood:company:skog','ACTOR_PRIVATE')
on conflict(workspace_id) do nothing;

insert into cns.workspace_actors(workspace_id,actor_id,actor_role,state)
values
  ('dogfood:ws:odin','dogfood:person:odin','PRIMARY','ACTIVE'),
  ('dogfood:ws:skog','dogfood:company:skog','PRIMARY','ACTIVE')
on conflict(workspace_id,actor_id) do update set actor_role='PRIMARY',state='ACTIVE';

insert into cns.workspace_memberships(workspace_id,identity_id,membership_role,permissions,state)
values
  ('dogfood:ws:odin','dogfood:identity:odin','OWNER','{"read":true,"write":true}'::jsonb,'ACTIVE'),
  ('dogfood:ws:skog','dogfood:identity:odin','OWNER','{"read":true,"write":true}'::jsonb,'ACTIVE')
on conflict(workspace_id,identity_id) do update set permissions=excluded.permissions,state='ACTIVE';

-- Explicit actor relationship, preserving the source wording as reported rather than silently upgrading it.
insert into cns.relationships(
  relationship_id,subject_entity_id,predicate,object_entity_id,relationship_kind,
  source_id,source_revision,review_state,evidence_strength,interpretation_state,visibility_state,state
) values (
  'dogfood:rel:odin-skog','dogfood:person:odin','REPORTED_SOLE_OWNER_OF','dogfood:company:skog','ACTOR',
  'dogfood:source:skog-20260805','2026-08-05','SOURCE_CHECKED','MODERATE','NORMALISED_RECORD','INTERNAL','ACTIVE'
) on conflict(relationship_id) do nothing;

-- PERSON TWIN: same generic state commit primitive used by every actor type.
select cns.commit_actor_state(
  'dogfood:ws:odin','dogfood:person:odin','IDENTITY',
  '{"name":"Odin Oddekalv","actor_type":"PERSON"}'::jsonb,'[]'::jsonb,
  'USER','dogfood:identity:odin','dogfood:identity:odin','USER_ASSERTED',null,null,'dogfood:odin:identity:v1',86400
);
select cns.commit_actor_state(
  'dogfood:ws:odin','dogfood:person:odin','OBJECTIVES',
  '{"primary":"Build and operate 4PLANET through the universal actor kernel"}'::jsonb,'[]'::jsonb,
  'USER','dogfood:identity:odin','dogfood:identity:odin','USER_ASSERTED',null,null,'dogfood:odin:objectives:v1',86400
);
select cns.commit_actor_state(
  'dogfood:ws:odin','dogfood:person:odin','CORE',
  '{"status":"ACTIVE_DOGFOOD","surface":"4SAPIEN"}'::jsonb,'[]'::jsonb,
  'USER','dogfood:identity:odin','dogfood:identity:odin','USER_ASSERTED',null,null,'dogfood:odin:core:v1',86400
);
select cns.commit_actor_state(
  'dogfood:ws:odin','dogfood:person:odin','FINANCE',
  '{"currency":"NOK","data_state":"PRIVATE_SLICE_INITIALISED","values_ingested":false}'::jsonb,'[]'::jsonb,
  'USER','dogfood:identity:odin','dogfood:identity:odin','USER_ASSERTED',null,null,'dogfood:odin:finance:v1',86400
);

-- COMPANY TWIN: exact same primitive, separate workspace/history/state.
select cns.commit_actor_state(
  'dogfood:ws:skog','dogfood:company:skog','IDENTITY',
  '{"name":"SKOG COMMUNICATIONS AS","organisation_number":"923003789","actor_type":"COMPANY"}'::jsonb,
  '[{"source_id":"dogfood:source:skog-20260805"}]'::jsonb,
  'USER','dogfood:identity:odin','dogfood:identity:odin','SOURCE_REPORTED',
  'dogfood:source:skog-20260805','2026-08-05','dogfood:skog:identity:v1',86400
);
select cns.commit_actor_state(
  'dogfood:ws:skog','dogfood:company:skog','CORE',
  '{"status":"ACTIVE_DOGFOOD","surface":"4BRANDS"}'::jsonb,'[]'::jsonb,
  'USER','dogfood:identity:odin','dogfood:identity:odin','USER_ASSERTED',null,null,'dogfood:skog:core:v1',86400
);
select cns.commit_actor_state(
  'dogfood:ws:skog','dogfood:company:skog','FINANCE',
  '{"currency":"NOK","data_state":"COMPANY_SLICE_INITIALISED","values_ingested":false}'::jsonb,'[]'::jsonb,
  'USER','dogfood:identity:odin','dogfood:identity:odin','USER_ASSERTED',null,null,'dogfood:skog:finance:v1',86400
);
select cns.commit_actor_state(
  'dogfood:ws:skog','dogfood:company:skog','COMPANY_BASELINE',
  '{"status":"MINIMAL_4BRAND_TWIN","source_linked":true}'::jsonb,
  '[{"source_id":"dogfood:source:skog-20260805"}]'::jsonb,
  'USER','dogfood:identity:odin','dogfood:identity:odin','SOURCE_REPORTED',
  'dogfood:source:skog-20260805','2026-08-05','dogfood:skog:baseline:v1',86400
);

-- Exact readback for every current-state head must verify.
do $$
declare r record; fp text;
begin
  for r in
    select last_event_id from cns.actor_current_state
    where workspace_id in ('dogfood:ws:odin','dogfood:ws:skog')
  loop
    fp := cns.verify_actor_state_readback_v1(r.last_event_id);
    if fp is null then raise exception 'DOGFOOD_READBACK_FINGERPRINT_MISSING'; end if;
  end loop;
end $$;

-- Minimal decision + event + learning on PERSON, with explicit workspace-private scope.
do $$
declare d_event bigint; l_event bigint;
begin
  d_event := cns.append_event(
    null,'DECISION','dogfood:decision:one-kernel','DECISION_RECORDED',
    '{"workspace_id":"dogfood:ws:odin","decision":"Use the same universal Actor Kernel for PERSON and COMPANY dogfood"}'::jsonb,
    '[]'::jsonb,'USER','dogfood:identity:odin','USER_ASSERTED',null,null,'dogfood:decision:one-kernel:event'
  );
  insert into cns.decisions(
    decision_id,title,decision,authority,status,decided_by,decided_at,evidence_refs,last_event_id,trust_domain_id,workspace_id
  ) values (
    'dogfood:decision:one-kernel','One Actor Kernel','Use the same universal Actor Kernel for PERSON and COMPANY dogfood',
    'USER_ASSERTED','ACTIVE','dogfood:identity:odin',clock_timestamp(),'[]'::jsonb,d_event,'ACTOR_PRIVATE','dogfood:ws:odin'
  );

  l_event := cns.append_event(
    null,'LEARNING','dogfood:learning:shared-primitives','LEARNING_RECORDED',
    '{"workspace_id":"dogfood:ws:odin","learning":"PERSON and COMPANY can share primitives while state and history remain workspace-separated"}'::jsonb,
    '[]'::jsonb,'USER','dogfood:identity:odin','RUNTIME_OBSERVATION',null,null,'dogfood:learning:shared-primitives:event'
  );
  insert into cns.learnings(
    learning_id,title,learning,evidence_refs,state,last_event_id,trust_domain_id,workspace_id
  ) values (
    'dogfood:learning:shared-primitives','Shared primitives / separate state',
    '{"statement":"PERSON and COMPANY can share primitives while state and history remain workspace-separated"}'::jsonb,
    '[]'::jsonb,'CANDIDATE',l_event,'ACTOR_PRIVATE','dogfood:ws:odin'
  );
end $$;

-- Source -> evidence -> atomic claim lineage for one company fact.
insert into cns.evidence(
  evidence_id,evidence_type,source_id,source_revision,uri,excerpt,observed_at,verified_at,state,trust_domain_id,workspace_id
) values (
  'dogfood:evidence:skog-orgnr','DOCUMENT_EXCERPT','dogfood:source:skog-20260805','2026-08-05',
  'https://docs.google.com/document/d/1JgNOz-nORWmvNQZJD4kMyMyCDAwxiBjqG_TT44IT_lY/edit',
  'SKOG COMMUNICATIONS AS — Org.nr. 923 003 789',clock_timestamp(),clock_timestamp(),'ACTIVE','ACTOR_PRIVATE','dogfood:ws:skog'
);

select cns.commit_claim_v1(
  'dogfood:claim:skog-orgnr',null,'COMPANY','dogfood:company:skog','ORGANISATION_NUMBER','"923003789"'::jsonb,
  'SOURCE_FACT','SOURCE_EVIDENCE','KNOWN',array['dogfood:evidence:skog-orgnr'],
  'ACTOR_PRIVATE','dogfood:ws:skog','USER','dogfood:identity:odin','dogfood:identity:odin',
  'dogfood:source:skog-20260805','2026-08-05','dogfood:claim:skog-orgnr:event'
);

-- The derived twin must show both actor types on one infrastructure, but distinct state.
do $$
declare p jsonb; c jsonb;
begin
  select current_state into p from cns.v_actor_twin_v1 where workspace_id='dogfood:ws:odin' and actor_id='dogfood:person:odin';
  select current_state into c from cns.v_actor_twin_v1 where workspace_id='dogfood:ws:skog' and actor_id='dogfood:company:skog';
  if p is null or c is null then raise exception 'DOGFOOD_ACTOR_TWIN_READBACK_MISSING'; end if;
  if not (p ? 'FINANCE') or not (c ? 'FINANCE') then raise exception 'DOGFOOD_SHARED_FINANCE_PRIMITIVE_MISSING'; end if;
  if p->'FINANCE' = c->'FINANCE' then raise exception 'DOGFOOD_PERSON_COMPANY_STATE_COLLAPSED'; end if;
end $$;

-- LLM kernel sessions must compile scope-first contexts for each actor independently.
do $$
declare ps uuid; cs uuid; pids text[]; cids text[];
begin
  ps := cns.begin_actor_llm_session_v1('dogfood:identity:odin','dogfood:ws:odin','dogfood:person:odin','dogfood person context',2::smallint,12000,900);
  cs := cns.begin_actor_llm_session_v1('dogfood:identity:odin','dogfood:ws:skog','dogfood:company:skog','dogfood company context',2::smallint,12000,900);

  select a.candidate_claim_ids into pids
  from cns.llm_kernel_sessions s join cns.actor_context_snapshots a on a.actor_context_snapshot_id=s.actor_context_snapshot_id
  where s.llm_session_id=ps;
  select a.candidate_claim_ids into cids
  from cns.llm_kernel_sessions s join cns.actor_context_snapshots a on a.actor_context_snapshot_id=s.actor_context_snapshot_id
  where s.llm_session_id=cs;

  if 'dogfood:claim:skog-orgnr'=any(pids) then raise exception 'DOGFOOD_PERSON_CONTEXT_LEAKED_COMPANY_PRIVATE_CLAIM'; end if;
  if not ('dogfood:claim:skog-orgnr'=any(cids)) then raise exception 'DOGFOOD_COMPANY_CONTEXT_MISSING_OWN_CLAIM'; end if;

  perform cns.complete_actor_llm_session_v1(ps,'{}'::bigint[]);
  perform cns.complete_actor_llm_session_v1(cs,'{}'::bigint[]);
end $$;

-- All dogfood writebacks were read back; no dogfood-specific health violation remains.
do $$
begin
  if exists(
    select 1 from cns.v_superbrain_health_v2
    where object_id like 'dogfood:%'
       or evidence::text like '%dogfood:%'
  ) then
    raise exception 'DOGFOOD_HEALTH_VIOLATION:%',(
      select jsonb_agg(to_jsonb(v)) from cns.v_superbrain_health_v2 v
      where object_id like 'dogfood:%' or evidence::text like '%dogfood:%'
    );
  end if;

  -- Gate A is intentionally still fail-closed until the real Drive census closes.
  if not exists(select 1 from cns.v_superbrain_health_v2 where rule_id='BRAIN_CENSUS_NOT_COMPLETE') then
    raise exception 'CENSUS_BLOCKER_NOT_DETECTED';
  end if;
end $$;

-- Doctor must ingest the census blocker, proving control-of-control sees it.
select cns.doctor_scan();

do $$
begin
  if not exists(select 1 from cns.health_incidents where rule_id='BRAIN_CENSUS_NOT_COMPLETE' and state in ('OPEN','ACKNOWLEDGED')) then
    raise exception 'DOCTOR_DID_NOT_INGEST_CENSUS_BLOCKER';
  end if;
  if has_table_privilege('anon','cns.v_actor_twin_v1','SELECT') or has_table_privilege('authenticated','cns.v_actor_twin_v1','SELECT') then
    raise exception 'ACTOR_TWIN_BROWSER_PRIVILEGE_LEAK';
  end if;
  if has_table_privilege('anon','cns.llm_kernel_sessions','SELECT') or has_table_privilege('authenticated','cns.llm_kernel_sessions','SELECT') then
    raise exception 'LLM_KERNEL_SESSION_BROWSER_PRIVILEGE_LEAK';
  end if;
end $$;

rollback;

select 'SUPERBRAIN_FOUNDATION_DOGFOOD_PASS' as result;
