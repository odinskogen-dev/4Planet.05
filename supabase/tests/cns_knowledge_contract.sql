-- SUPERBRAIN KNOWLEDGE CONTRACT 09 — acceptance / red-team
\set ON_ERROR_STOP on

begin;

-- Source lineage root.
insert into cns.source_registry(source_id,source_kind,name,uri,authority,truth_domain,state,trust_domain_id)
values(
  'test:kc:source','WEB','Knowledge Contract Source','https://example.org/original',
  'SOURCE_EVIDENCE','TEST','ACTIVE','4PLANET_INTERNAL'
)
on conflict(source_id) do nothing;

insert into cns.source_revisions(source_id,revision,content_hash,observed_at)
values('test:kc:source','rev-1','sha256:test',now())
on conflict(source_id,revision) do nothing;

insert into cns.evidence(
  evidence_id,evidence_type,source_id,source_revision,uri,content_hash,excerpt,state,trust_domain_id
) values(
  'test:kc:evidence','SOURCE_EXTRACT','test:kc:source','rev-1','https://example.org/original#claim',
  'sha256:extract','Source-grounded extract','ACTIVE','4PLANET_INTERNAL'
)
on conflict(evidence_id) do nothing;

-- Original document control metadata only; original resource is preserved.
insert into cns.knowledge_documents(
  document_id,provider,provider_id,source_id,title,resource,mime_type,provider_revision,
  authority,lifecycle_state,provenance_state,freshness_state,trust_domain_id,original_preserved,migration_state
) values(
  'kp:gdrive:test-kc-doc','GOOGLE_DRIVE','test-kc-doc','test:kc:source','Test knowledge document',
  'https://docs.google.com/document/d/test-kc-doc/edit','application/vnd.google-apps.document','rev-1',
  'SOURCE_EVIDENCE','ACTIVE','COMPLETE','CURRENT','4PLANET_INTERNAL',true,'INGESTED'
);

-- Factual claim without evidence must fail closed.
do $$
begin
  begin
    perform cns.commit_claim_v1(
      'test:kc:no-evidence',null,'ENTITY','test:entity','has_property','{"value":true}'::jsonb,
      'SOURCE_FACT','SOURCE_EVIDENCE','KNOWN','{}'::text[],'4PLANET_INTERNAL',null,
      'SYSTEM','test:writer',null,'test:kc:source','rev-1','test:kc:no-evidence:1'
    );
    raise exception 'FAIL_OPEN: factual claim committed without evidence';
  exception when others then
    if sqlerrm not like '%CNS_FACTUAL_CLAIM_EVIDENCE_REQUIRED%' then raise; end if;
  end;
end $$;

-- Generated summary may exist as generated interpretation, but must not call itself KNOWN source truth.
do $$
begin
  begin
    perform cns.commit_claim_v1(
      'test:kc:self-promote',null,'ENTITY','test:entity','summary','{"text":"generated"}'::jsonb,
      'GENERATED_SUMMARY','GENERATED_VIEW','KNOWN','{}'::text[],'4PLANET_INTERNAL',null,
      'AGENT','test:agent',null,null,null,'test:kc:self-promote:1'
    );
    raise exception 'FAIL_OPEN: generated summary self-promoted';
  exception when others then
    if sqlerrm not like '%CNS_GENERATED_OR_PROPOSAL_CANNOT_SELF_PROMOTE_TO_KNOWN%' then raise; end if;
  end;
end $$;

-- A source-grounded factual claim succeeds and uses the existing immutable event ledger.
select cns.commit_claim_v1(
  'test:kc:claim',null,'ENTITY','test:entity','has_property','{"value":true}'::jsonb,
  'SOURCE_FACT','SOURCE_EVIDENCE','KNOWN',array['test:kc:evidence'],'4PLANET_INTERNAL',null,
  'SYSTEM','test:writer',null,'test:kc:source','rev-1','test:kc:claim:1'
);

do $$
begin
  if not exists(
    select 1 from cns.claims c
    join cns.claim_evidence ce on ce.claim_id=c.claim_id
    join cns.evidence e on e.evidence_id=ce.evidence_id
    join cns.source_registry s on s.source_id=e.source_id
    where c.claim_id='test:kc:claim' and ce.relation='SUPPORTS'
      and e.evidence_id='test:kc:evidence' and s.source_id='test:kc:source'
  ) then
    raise exception 'CLAIM_EVIDENCE_SOURCE_LINEAGE_FAILED';
  end if;
  if (select confidence from cns.claims where claim_id='test:kc:claim') is not null then
    raise exception 'NEW_CLAIM_USED_LEGACY_SCALAR_CONFIDENCE';
  end if;
  if not exists(select 1 from cns.events where entity_type='CLAIM' and entity_id='test:kc:claim' and event_type='CLAIM_COMMITTED') then
    raise exception 'CLAIM_IMMUTABLE_EVENT_MISSING';
  end if;
end $$;

-- Explainable assessment vector is stored independently of truth axes.
insert into cns.claim_assessments(
  claim_id,source_quality,directness,corroboration,recency,methodological_strength,consistency,assessor,basis
) values(
  'test:kc:claim',90,100,80,95,85,90,'process:test-judge',
  '{"source":"test:kc:source","method":"fixture"}'::jsonb
);

do $$
declare v numeric;
begin
  select derived_score into v from cns.v_claim_assessment_latest where claim_id='test:kc:claim';
  if v is distinct from 90.00::numeric then
    raise exception 'CLAIM_ASSESSMENT_DERIVATION_FAILED: %',v;
  end if;
end $$;

-- ACTOR_PRIVATE scope cannot exist without workspace.
do $$
begin
  begin
    perform cns.commit_claim_v1(
      'test:kc:private-unscoped',null,'ENTITY','test:entity','private_fact','{"value":1}'::jsonb,
      'SOURCE_FACT','USER_ASSERTED','KNOWN',array['test:kc:evidence'],'ACTOR_PRIVATE',null,
      'SYSTEM','test:writer',null,'test:kc:source','rev-1','test:kc:private-unscoped:1'
    );
    raise exception 'FAIL_OPEN: actor-private claim had no workspace';
  exception when others then
    if sqlerrm not like '%CNS_PRIVATE_CLAIM_WORKSPACE_REQUIRED%' then raise; end if;
  end;
end $$;

-- Healthy fixture must have no knowledge-contract violations.
do $$
begin
  if exists(select 1 from cns.v_knowledge_contract_violations where object_id like 'test:kc:%') then
    raise exception 'KNOWLEDGE_CONTRACT_VIOLATION: %',
      (select jsonb_agg(to_jsonb(v)) from cns.v_knowledge_contract_violations v where object_id like 'test:kc:%');
  end if;
end $$;

-- Browser roles still cannot query private CNS knowledge tables/views.
do $$
begin
  if has_table_privilege('anon','cns.knowledge_documents','SELECT') then raise exception 'ANON_DOCUMENT_READ_PRIVILEGE'; end if;
  if has_table_privilege('authenticated','cns.claim_assessments','SELECT') then raise exception 'AUTH_CLAIM_ASSESSMENT_READ_PRIVILEGE'; end if;
end $$;

rollback;
