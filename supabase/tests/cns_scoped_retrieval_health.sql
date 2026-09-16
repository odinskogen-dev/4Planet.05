-- SUPERBRAIN SCOPE-FIRST RETRIEVAL + HEALTH 10 — adversarial acceptance
\set ON_ERROR_STOP on

begin;

-- Two separate PERSON actors, identities and private workspaces.
insert into cns.entities(entity_id,entity_type,canonical_name,metadata,trust_domain_id)
values
  ('test:retrieval:person-a','PERSON','Person A','{}'::jsonb,'ACTOR_PRIVATE'),
  ('test:retrieval:person-b','PERSON','Person B','{}'::jsonb,'ACTOR_PRIVATE')
on conflict(entity_id) do nothing;

insert into cns.actors(actor_id,actor_type,home_trust_domain_id)
values
  ('test:retrieval:person-a','PERSON','ACTOR_PRIVATE'),
  ('test:retrieval:person-b','PERSON','ACTOR_PRIVATE')
on conflict(actor_id) do nothing;

insert into cns.identities(identity_id,identity_kind,auth_provider,auth_subject,person_actor_id)
values
  ('test:retrieval:id-a','HUMAN','test','retrieval-a','test:retrieval:person-a'),
  ('test:retrieval:id-b','HUMAN','test','retrieval-b','test:retrieval:person-b')
on conflict(identity_id) do nothing;

insert into cns.workspaces(workspace_id,workspace_kind,name,primary_actor_id,trust_domain_id)
values
  ('test:retrieval:ws-a','PERSONAL','Workspace A','test:retrieval:person-a','ACTOR_PRIVATE'),
  ('test:retrieval:ws-b','PERSONAL','Workspace B','test:retrieval:person-b','ACTOR_PRIVATE')
on conflict(workspace_id) do nothing;

insert into cns.workspace_actors(workspace_id,actor_id,actor_role,state)
values
  ('test:retrieval:ws-a','test:retrieval:person-a','PRIMARY','ACTIVE'),
  ('test:retrieval:ws-b','test:retrieval:person-b','PRIMARY','ACTIVE')
on conflict(workspace_id,actor_id) do update set actor_role='PRIMARY',state='ACTIVE';

insert into cns.workspace_memberships(workspace_id,identity_id,membership_role,permissions,state)
values
  ('test:retrieval:ws-a','test:retrieval:id-a','OWNER','{"read":true,"write":true}'::jsonb,'ACTIVE'),
  ('test:retrieval:ws-b','test:retrieval:id-b','OWNER','{"read":true,"write":true}'::jsonb,'ACTIVE')
on conflict(workspace_id,identity_id) do update set permissions=excluded.permissions,state='ACTIVE';

-- Sources and evidence have deliberately similar content; scope must win before relevance.
insert into cns.source_registry(source_id,source_kind,name,uri,authority,truth_domain,state,trust_domain_id,workspace_id)
values
  ('test:retrieval:source-a','USER_DATA','A private','urn:test:a','USER_ASSERTED','ACTOR','ACTIVE','ACTOR_PRIVATE','test:retrieval:ws-a'),
  ('test:retrieval:source-b','USER_DATA','B private','urn:test:b','USER_ASSERTED','ACTOR','ACTIVE','ACTOR_PRIVATE','test:retrieval:ws-b'),
  ('test:retrieval:source-shared','WEB','Shared source','https://example.org/shared','SOURCE_EVIDENCE','PLANET','ACTIVE','PLANET_SHARED',null)
on conflict(source_id) do nothing;

insert into cns.evidence(evidence_id,evidence_type,source_id,uri,excerpt,state,trust_domain_id,workspace_id)
values
  ('test:retrieval:evidence-a','USER_ASSERTION','test:retrieval:source-a','urn:test:a','identical semantic phrase','ACTIVE','ACTOR_PRIVATE','test:retrieval:ws-a'),
  ('test:retrieval:evidence-b','USER_ASSERTION','test:retrieval:source-b','urn:test:b','identical semantic phrase','ACTIVE','ACTOR_PRIVATE','test:retrieval:ws-b'),
  ('test:retrieval:evidence-shared','SOURCE_EXTRACT','test:retrieval:source-shared','https://example.org/shared','identical semantic phrase','ACTIVE','PLANET_SHARED',null)
on conflict(evidence_id) do nothing;

select cns.commit_claim_v1(
  'test:retrieval:claim-a',null,'PERSON','test:retrieval:person-a','test_fact','{"text":"identical semantic phrase"}'::jsonb,
  'SOURCE_FACT','USER_ASSERTED','KNOWN',array['test:retrieval:evidence-a'],'ACTOR_PRIVATE','test:retrieval:ws-a',
  'USER','test:retrieval:id-a','test:retrieval:id-a','test:retrieval:source-a',null,'test:retrieval:claim-a:1'
);

select cns.commit_claim_v1(
  'test:retrieval:claim-b',null,'PERSON','test:retrieval:person-b','test_fact','{"text":"identical semantic phrase"}'::jsonb,
  'SOURCE_FACT','USER_ASSERTED','KNOWN',array['test:retrieval:evidence-b'],'ACTOR_PRIVATE','test:retrieval:ws-b',
  'USER','test:retrieval:id-b','test:retrieval:id-b','test:retrieval:source-b',null,'test:retrieval:claim-b:1'
);

select cns.commit_claim_v1(
  'test:retrieval:claim-shared',null,'SPECIES','test:shared:entity','test_fact','{"text":"identical semantic phrase"}'::jsonb,
  'SOURCE_FACT','SOURCE_EVIDENCE','KNOWN',array['test:retrieval:evidence-shared'],'PLANET_SHARED',null,
  'SYSTEM','test:system',null,'test:retrieval:source-shared',null,'test:retrieval:claim-shared:1'
);

-- Person A can retrieve A + shared, never B despite identical text.
do $$
declare ids text[];
begin
  select coalesce(array_agg(claim_id order by claim_id),'{}'::text[])
  into ids
  from cns.retrieve_actor_claim_candidates_v1('test:retrieval:id-a','test:retrieval:ws-a','test:retrieval:person-a',null,null,500);
  if not ('test:retrieval:claim-a'=any(ids)) then raise exception 'OWN_PRIVATE_CLAIM_MISSING: %',ids; end if;
  if not ('test:retrieval:claim-shared'=any(ids)) then raise exception 'SHARED_CLAIM_MISSING: %',ids; end if;
  if 'test:retrieval:claim-b'=any(ids) then raise exception 'CROSS_TENANT_CLAIM_LEAK: %',ids; end if;
end $$;

-- Cross-workspace retrieval fails before candidate generation.
do $$
begin
  begin
    perform * from cns.retrieve_actor_claim_candidates_v1('test:retrieval:id-a','test:retrieval:ws-b','test:retrieval:person-b',null,null,500);
    raise exception 'FAIL_OPEN: A accessed B workspace';
  exception when others then
    if sqlerrm not like '%CNS_WORKSPACE_ACCESS_DENIED%' then raise; end if;
  end;
end $$;

-- Private objects cannot be widened in place to PLANET_SHARED/PUBLIC.
do $$
begin
  begin
    update cns.claims set trust_domain_id='PLANET_SHARED' where claim_id='test:retrieval:claim-a';
    raise exception 'FAIL_OPEN: private claim widened in place';
  exception when others then
    if sqlerrm not like '%CNS_PRIVATE_TRUST_DOMAIN_IMMUTABLE%' then raise; end if;
  end;
end $$;

-- Shared claim cannot use private evidence directly.
insert into cns.claims(
  claim_id,subject_type,subject_id,predicate,value,authority,state,claim_kind,knowledge_state,trust_domain_id,provenance_state
) values(
  'test:retrieval:shared-illegal','SPECIES','test:shared:entity','illegal','{"value":1}'::jsonb,
  'SYSTEM','ACTIVE','SOURCE_FACT','KNOWN','PLANET_SHARED','PARTIAL'
);

do $$
begin
  begin
    insert into cns.claim_evidence(claim_id,evidence_id,relation)
    values('test:retrieval:shared-illegal','test:retrieval:evidence-a','SUPPORTS');
    raise exception 'FAIL_OPEN: private evidence established shared claim';
  exception when others then
    if sqlerrm not like '%CNS_PRIVATE_EVIDENCE_CANNOT_DIRECTLY_ESTABLISH_SHARED_CLAIM%' then raise; end if;
  end;
end $$;
delete from cns.claims where claim_id='test:retrieval:shared-illegal';

-- Actor context compiler uses the same scoped candidate set and is derived/expiring.
select cns.commit_actor_state(
  'test:retrieval:ws-a','test:retrieval:person-a','CORE','{"status":"active"}'::jsonb,'[]'::jsonb,
  'USER','test:retrieval:id-a','test:retrieval:id-a','USER_ASSERTED',null,null,'test:retrieval:state-a:1',3600
);

do $$
declare sid uuid; ctx jsonb; ids text[];
begin
  sid := cns.compile_actor_context_v1('test:retrieval:id-a','test:retrieval:ws-a','test:retrieval:person-a','test retrieval',2,12000,900);
  select compiled_context,candidate_claim_ids into ctx,ids from cns.actor_context_snapshots where actor_context_snapshot_id=sid;
  if ctx->>'retrieval_law' <> 'SCOPE_BEFORE_RELEVANCE' then raise exception 'RETRIEVAL_LAW_MISSING'; end if;
  if 'test:retrieval:claim-b'=any(ids) then raise exception 'CONTEXT_CONTAINS_CROSS_TENANT_CLAIM'; end if;
  if not ('test:retrieval:claim-a'=any(ids)) then raise exception 'CONTEXT_MISSING_OWN_CLAIM'; end if;
end $$;

-- Browser roles cannot bypass scope via raw claims or context tables.
do $$
begin
  if has_table_privilege('authenticated','cns.claims','SELECT') then raise exception 'AUTH_RAW_CLAIM_READ_PRIVILEGE'; end if;
  if has_table_privilege('authenticated','cns.actor_context_snapshots','SELECT') then raise exception 'AUTH_RAW_CONTEXT_READ_PRIVILEGE'; end if;
end $$;

-- No P0/P1 foundation violation should be created by the legal fixture.
do $$
begin
  if exists(
    select 1 from cns.v_superbrain_foundation_violations
    where severity in ('P0','P1') and object_id like 'test:retrieval:%'
  ) then
    raise exception 'FOUNDATION_HEALTH_VIOLATION: %',
      (select jsonb_agg(to_jsonb(v)) from cns.v_superbrain_foundation_violations v where severity in ('P0','P1') and object_id like 'test:retrieval:%');
  end if;
end $$;

rollback;
