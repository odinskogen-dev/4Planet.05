-- 4PLANET SUPERBRAIN — KNOWLEDGE CONTRACT 09
-- Extends the existing CNS truth/provenance spine. No parallel BRAIN or database.
-- OKF is the portable document control format; CNS remains the structured machine model.

begin;

-- ---------------------------------------------------------------------------
-- DOCUMENT: stable provider identity + source lineage. Original bytes/content
-- remain in the provider/object store; this table stores control metadata only.
-- ---------------------------------------------------------------------------
create table if not exists cns.knowledge_documents (
  document_id text primary key,
  provider text not null,
  provider_id text not null,
  source_id text not null references cns.source_registry(source_id) on delete restrict,
  title text not null,
  resource text not null,
  mime_type text,
  provider_revision text,
  content_hash text,
  body_hash text,
  okf_profile text not null default '4PLANET_OKF_1.1',
  upstream_okf text not null default '0.2',
  okf_metadata jsonb not null default '{}'::jsonb,
  authority text not null,
  lifecycle_state text not null default 'ACTIVE' check (lifecycle_state in ('CURRENT','ACTIVE','DRAFT','HISTORICAL','SUPERSEDED','ARCHIVED','GENERATED_VIEW','RUNTIME_ONLY')),
  provenance_state text not null default 'PARTIAL' check (provenance_state in ('COMPLETE','PARTIAL','MISSING','NOT_APPLICABLE')),
  freshness_state text not null default 'NOT_CHECKED' check (freshness_state in ('NOT_CHECKED','CURRENT','STALE','NO_COVERAGE','SOURCE_UNAVAILABLE','NOT_APPLICABLE')),
  trust_domain_id text not null default '4PLANET_INTERNAL' references cns.trust_domains(trust_domain_id) on delete restrict,
  workspace_id text references cns.workspaces(workspace_id) on delete restrict,
  original_preserved boolean not null default true,
  migration_state text not null default 'REGISTERED' check (migration_state in ('REGISTERED','INGESTED','BLOCKED','SUPERSEDED','EXCLUDED')),
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider,provider_id),
  check (trust_domain_id <> 'ACTOR_PRIVATE' or workspace_id is not null),
  check (nullif(btrim(resource),'') is not null)
);

create index if not exists cns_knowledge_documents_source_idx on cns.knowledge_documents(source_id,lifecycle_state);
create index if not exists cns_knowledge_documents_workspace_idx on cns.knowledge_documents(workspace_id,lifecycle_state) where workspace_id is not null;

-- ---------------------------------------------------------------------------
-- SCOPE: durable knowledge can be workspace-private without becoming a second
-- knowledge system. Existing rows default INTERNAL until explicitly classified.
-- ---------------------------------------------------------------------------
alter table cns.source_registry add column if not exists trust_domain_id text references cns.trust_domains(trust_domain_id) on delete restrict;
alter table cns.source_registry add column if not exists workspace_id text references cns.workspaces(workspace_id) on delete restrict;
update cns.source_registry set trust_domain_id='4PLANET_INTERNAL' where trust_domain_id is null;
alter table cns.source_registry alter column trust_domain_id set default '4PLANET_INTERNAL';
alter table cns.source_registry alter column trust_domain_id set not null;

alter table cns.entities add column if not exists trust_domain_id text references cns.trust_domains(trust_domain_id) on delete restrict;
alter table cns.entities add column if not exists workspace_id text references cns.workspaces(workspace_id) on delete restrict;
update cns.entities set trust_domain_id='4PLANET_INTERNAL' where trust_domain_id is null;
alter table cns.entities alter column trust_domain_id set default '4PLANET_INTERNAL';
alter table cns.entities alter column trust_domain_id set not null;

alter table cns.evidence add column if not exists trust_domain_id text references cns.trust_domains(trust_domain_id) on delete restrict;
alter table cns.evidence add column if not exists workspace_id text references cns.workspaces(workspace_id) on delete restrict;
update cns.evidence set trust_domain_id='4PLANET_INTERNAL' where trust_domain_id is null;
alter table cns.evidence alter column trust_domain_id set default '4PLANET_INTERNAL';
alter table cns.evidence alter column trust_domain_id set not null;

alter table cns.claims add column if not exists trust_domain_id text references cns.trust_domains(trust_domain_id) on delete restrict;
alter table cns.claims add column if not exists workspace_id text references cns.workspaces(workspace_id) on delete restrict;
alter table cns.claims add column if not exists provenance_state text not null default 'MISSING' check (provenance_state in ('COMPLETE','PARTIAL','MISSING','NOT_APPLICABLE'));
alter table cns.claims add column if not exists stale_after timestamptz;
update cns.claims set trust_domain_id='4PLANET_INTERNAL' where trust_domain_id is null;
alter table cns.claims alter column trust_domain_id set default '4PLANET_INTERNAL';
alter table cns.claims alter column trust_domain_id set not null;

alter table cns.observations add column if not exists trust_domain_id text references cns.trust_domains(trust_domain_id) on delete restrict;
alter table cns.observations add column if not exists workspace_id text references cns.workspaces(workspace_id) on delete restrict;
update cns.observations set trust_domain_id='4PLANET_INTERNAL' where trust_domain_id is null;
alter table cns.observations alter column trust_domain_id set default '4PLANET_INTERNAL';
alter table cns.observations alter column trust_domain_id set not null;

alter table cns.decisions add column if not exists trust_domain_id text references cns.trust_domains(trust_domain_id) on delete restrict;
alter table cns.decisions add column if not exists workspace_id text references cns.workspaces(workspace_id) on delete restrict;
update cns.decisions set trust_domain_id='4PLANET_INTERNAL' where trust_domain_id is null;
alter table cns.decisions alter column trust_domain_id set default '4PLANET_INTERNAL';
alter table cns.decisions alter column trust_domain_id set not null;

alter table cns.outcomes add column if not exists trust_domain_id text references cns.trust_domains(trust_domain_id) on delete restrict;
alter table cns.outcomes add column if not exists workspace_id text references cns.workspaces(workspace_id) on delete restrict;
update cns.outcomes set trust_domain_id='4PLANET_INTERNAL' where trust_domain_id is null;
alter table cns.outcomes alter column trust_domain_id set default '4PLANET_INTERNAL';
alter table cns.outcomes alter column trust_domain_id set not null;

alter table cns.learnings add column if not exists trust_domain_id text references cns.trust_domains(trust_domain_id) on delete restrict;
alter table cns.learnings add column if not exists workspace_id text references cns.workspaces(workspace_id) on delete restrict;
update cns.learnings set trust_domain_id='4PLANET_INTERNAL' where trust_domain_id is null;
alter table cns.learnings alter column trust_domain_id set default '4PLANET_INTERNAL';
alter table cns.learnings alter column trust_domain_id set not null;

-- Actor-private durable knowledge always needs an explicit workspace boundary.
do $$
begin
  if not exists(select 1 from pg_constraint where conname='cns_claims_actor_private_scope_check') then
    alter table cns.claims add constraint cns_claims_actor_private_scope_check check (trust_domain_id <> 'ACTOR_PRIVATE' or workspace_id is not null);
  end if;
  if not exists(select 1 from pg_constraint where conname='cns_evidence_actor_private_scope_check') then
    alter table cns.evidence add constraint cns_evidence_actor_private_scope_check check (trust_domain_id <> 'ACTOR_PRIVATE' or workspace_id is not null);
  end if;
  if not exists(select 1 from pg_constraint where conname='cns_observations_actor_private_scope_check') then
    alter table cns.observations add constraint cns_observations_actor_private_scope_check check (trust_domain_id <> 'ACTOR_PRIVATE' or workspace_id is not null);
  end if;
  if not exists(select 1 from pg_constraint where conname='cns_decisions_actor_private_scope_check') then
    alter table cns.decisions add constraint cns_decisions_actor_private_scope_check check (trust_domain_id <> 'ACTOR_PRIVATE' or workspace_id is not null);
  end if;
  if not exists(select 1 from pg_constraint where conname='cns_outcomes_actor_private_scope_check') then
    alter table cns.outcomes add constraint cns_outcomes_actor_private_scope_check check (trust_domain_id <> 'ACTOR_PRIVATE' or workspace_id is not null);
  end if;
  if not exists(select 1 from pg_constraint where conname='cns_learnings_actor_private_scope_check') then
    alter table cns.learnings add constraint cns_learnings_actor_private_scope_check check (trust_domain_id <> 'ACTOR_PRIVATE' or workspace_id is not null);
  end if;
end $$;

create index if not exists cns_claims_workspace_scope_idx on cns.claims(workspace_id,state,updated_at desc) where workspace_id is not null;
create index if not exists cns_evidence_workspace_scope_idx on cns.evidence(workspace_id,state,observed_at desc) where workspace_id is not null;
create index if not exists cns_observations_workspace_scope_idx on cns.observations(workspace_id,state,observed_at desc) where workspace_id is not null;

-- ---------------------------------------------------------------------------
-- CLAIM KIND: broaden the existing controlled vocabulary without removing old
-- values. This is classification, not confidence.
-- ---------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in select conname from pg_constraint
    where conrelid='cns.claims'::regclass and contype='c'
      and pg_get_constraintdef(oid) ilike '%claim_kind%'
  loop
    execute format('alter table cns.claims drop constraint %I',r.conname);
  end loop;
end $$;

alter table cns.claims add constraint cns_claim_kind_check check(claim_kind in (
  'SOURCE_FACT','SOURCE_CLAIM','OBSERVATION_DERIVED','ESTIMATE','MODEL_OUTPUT',
  'INFERENCE','INTERPRETATION','HYPOTHESIS','PREDICTION','OPINION',
  'FOUNDER_DECISION','POLICY','PROPOSAL','GENERATED_SUMMARY','RECOMMENDATION','UNKNOWN'
));

-- ---------------------------------------------------------------------------
-- EXPLAINABLE CLAIM ASSESSMENT.
-- Scalar claims.confidence remains legacy read compatibility only; new writes
-- through commit_claim_v1 leave it NULL and use this vector.
-- ---------------------------------------------------------------------------
create table if not exists cns.claim_assessments (
  assessment_id uuid primary key default gen_random_uuid(),
  claim_id text not null references cns.claims(claim_id) on delete restrict,
  source_quality smallint check (source_quality between 0 and 100),
  directness smallint check (directness between 0 and 100),
  corroboration smallint check (corroboration between 0 and 100),
  recency smallint check (recency between 0 and 100),
  methodological_strength smallint check (methodological_strength between 0 and 100),
  consistency smallint check (consistency between 0 and 100),
  assessor text not null,
  basis jsonb not null,
  assessed_at timestamptz not null default now(),
  state text not null default 'ACTIVE' check (state in ('ACTIVE','SUPERSEDED','REJECTED')),
  supersedes_assessment_id uuid references cns.claim_assessments(assessment_id) on delete restrict,
  created_at timestamptz not null default now(),
  check (jsonb_typeof(basis)='object' and basis <> '{}'::jsonb)
);

create index if not exists cns_claim_assessments_claim_idx on cns.claim_assessments(claim_id,assessed_at desc) where state='ACTIVE';

create or replace view cns.v_claim_assessment_latest
with (security_invoker=true) as
select distinct on (a.claim_id)
  a.assessment_id,
  a.claim_id,
  a.source_quality,
  a.directness,
  a.corroboration,
  a.recency,
  a.methodological_strength,
  a.consistency,
  (
    select round(avg(v)::numeric,2)
    from unnest(array[
      a.source_quality,a.directness,a.corroboration,a.recency,a.methodological_strength,a.consistency
    ]) v
    where v is not null
  ) as derived_score,
  a.assessor,
  a.basis,
  a.assessed_at
from cns.claim_assessments a
where a.state='ACTIVE'
order by a.claim_id,a.assessed_at desc,a.assessment_id desc;

-- ---------------------------------------------------------------------------
-- WRITE CONTRACT FOR NEW CLAIMS.
-- Factual/derived claims require evidence. Generated summaries/proposals cannot
-- self-promote to ACTIVE source truth through this function.
-- ---------------------------------------------------------------------------
create or replace function cns.commit_claim_v1(
  p_claim_id text,
  p_project_id text,
  p_subject_type text,
  p_subject_id text,
  p_predicate text,
  p_value jsonb,
  p_claim_kind text,
  p_authority text,
  p_knowledge_state text,
  p_evidence_ids text[],
  p_trust_domain_id text,
  p_workspace_id text,
  p_writer_type text,
  p_writer_id text,
  p_identity_id text,
  p_source_id text,
  p_source_revision text,
  p_idempotency_key text
) returns bigint
language plpgsql security definer set search_path=cns,public as $$
declare
  v_event bigint;
  v_evidence_id text;
  v_requires_evidence boolean;
begin
  if nullif(btrim(p_claim_id),'') is null or nullif(btrim(p_predicate),'') is null then
    raise exception 'CNS_CLAIM_ID_AND_PREDICATE_REQUIRED';
  end if;
  if p_trust_domain_id='ACTOR_PRIVATE' then
    if p_workspace_id is null then raise exception 'CNS_PRIVATE_CLAIM_WORKSPACE_REQUIRED'; end if;
    if p_writer_type='USER' and (p_identity_id is null or not cns.identity_has_workspace_permission(p_identity_id,p_workspace_id,'write')) then
      raise exception 'CNS_PRIVATE_CLAIM_WRITE_DENIED';
    end if;
  end if;

  if p_claim_kind in ('GENERATED_SUMMARY','PROPOSAL','HYPOTHESIS','PREDICTION','OPINION','RECOMMENDATION')
     and p_knowledge_state='KNOWN' then
    raise exception 'CNS_GENERATED_OR_PROPOSAL_CANNOT_SELF_PROMOTE_TO_KNOWN';
  end if;

  v_requires_evidence := p_claim_kind in (
    'SOURCE_FACT','SOURCE_CLAIM','OBSERVATION_DERIVED','ESTIMATE','MODEL_OUTPUT','INFERENCE','INTERPRETATION'
  );
  if v_requires_evidence and coalesce(array_length(p_evidence_ids,1),0)=0 then
    raise exception 'CNS_FACTUAL_CLAIM_EVIDENCE_REQUIRED';
  end if;

  if coalesce(array_length(p_evidence_ids,1),0)>0 then
    foreach v_evidence_id in array p_evidence_ids loop
      if not exists(select 1 from cns.evidence e where e.evidence_id=v_evidence_id and e.state='ACTIVE') then
        raise exception 'CNS_CLAIM_EVIDENCE_NOT_ACTIVE: %',v_evidence_id;
      end if;
      if p_trust_domain_id='ACTOR_PRIVATE' and not exists(
        select 1 from cns.evidence e
        where e.evidence_id=v_evidence_id
          and e.trust_domain_id='ACTOR_PRIVATE'
          and e.workspace_id=p_workspace_id
      ) then
        raise exception 'CNS_PRIVATE_CLAIM_EVIDENCE_SCOPE_MISMATCH: %',v_evidence_id;
      end if;
    end loop;
  end if;

  v_event := cns.append_event(
    p_project_id,'CLAIM',p_claim_id,'CLAIM_COMMITTED',
    jsonb_build_object('claim_kind',p_claim_kind,'knowledge_state',p_knowledge_state,'trust_domain_id',p_trust_domain_id,'workspace_id',p_workspace_id),
    to_jsonb(coalesce(p_evidence_ids,'{}'::text[])),
    p_writer_type,p_writer_id,p_authority,p_source_id,p_source_revision,p_idempotency_key
  );

  insert into cns.claims(
    claim_id,project_id,subject_type,subject_id,predicate,value,authority,confidence,state,last_event_id,
    claim_kind,knowledge_state,source_id,source_revision,trust_domain_id,workspace_id,provenance_state
  ) values (
    p_claim_id,p_project_id,p_subject_type,p_subject_id,p_predicate,p_value,p_authority,null,'ACTIVE',v_event,
    p_claim_kind,p_knowledge_state,p_source_id,p_source_revision,p_trust_domain_id,p_workspace_id,
    case when coalesce(array_length(p_evidence_ids,1),0)>0 then 'COMPLETE' else 'PARTIAL' end
  );

  foreach v_evidence_id in array coalesce(p_evidence_ids,'{}'::text[]) loop
    insert into cns.claim_evidence(claim_id,evidence_id,relation)
    values(p_claim_id,v_evidence_id,'SUPPORTS')
    on conflict do nothing;
  end loop;

  return v_event;
end;
$$;

-- ---------------------------------------------------------------------------
-- READBACK / HEALTH: current claims that claim factual knowledge but cannot
-- reach active evidence + a source fail the integrity view.
-- ---------------------------------------------------------------------------
create or replace view cns.v_knowledge_contract_violations
with (security_invoker=true) as
select
  'FACTUAL_CLAIM_WITHOUT_EVIDENCE'::text as rule_id,
  'P0'::text as severity,
  c.claim_id::text as object_id,
  jsonb_build_object('claim_kind',c.claim_kind,'knowledge_state',c.knowledge_state) as evidence
from cns.claims c
where c.state='ACTIVE'
  and c.knowledge_state='KNOWN'
  and c.claim_kind in ('SOURCE_FACT','SOURCE_CLAIM','OBSERVATION_DERIVED','ESTIMATE','MODEL_OUTPUT','INFERENCE','INTERPRETATION')
  and not exists(
    select 1 from cns.claim_evidence ce
    join cns.evidence e on e.evidence_id=ce.evidence_id
    where ce.claim_id=c.claim_id and ce.relation='SUPPORTS' and e.state='ACTIVE'
  )
union all
select
  'EVIDENCE_WITHOUT_SOURCE'::text,
  'P0'::text,
  e.evidence_id::text,
  jsonb_build_object('project_id',e.project_id,'uri',e.uri)
from cns.evidence e
where e.state='ACTIVE' and e.source_id is null
union all
select
  'ACTOR_PRIVATE_KNOWLEDGE_WITHOUT_WORKSPACE'::text,
  'P0'::text,
  c.claim_id::text,
  jsonb_build_object('trust_domain_id',c.trust_domain_id)
from cns.claims c
where c.state='ACTIVE' and c.trust_domain_id='ACTOR_PRIVATE' and c.workspace_id is null
union all
select
  'ACTIVE_GENERATED_SELF_PROMOTION'::text,
  'P0'::text,
  c.claim_id::text,
  jsonb_build_object('claim_kind',c.claim_kind,'knowledge_state',c.knowledge_state)
from cns.claims c
where c.state='ACTIVE' and c.knowledge_state='KNOWN'
  and c.claim_kind in ('GENERATED_SUMMARY','PROPOSAL','HYPOTHESIS','PREDICTION','OPINION','RECOMMENDATION')
union all
select
  'DOCUMENT_ORIGINAL_NOT_PRESERVED'::text,
  'P0'::text,
  d.document_id::text,
  jsonb_build_object('provider',d.provider,'provider_id',d.provider_id)
from cns.knowledge_documents d
where d.original_preserved=false and d.lifecycle_state not in ('SUPERSEDED','ARCHIVED');

-- CNS remains private; service role enters through approved server-side paths.
alter table cns.knowledge_documents enable row level security;
alter table cns.claim_assessments enable row level security;
revoke all on cns.knowledge_documents,cns.claim_assessments from public,anon,authenticated;
revoke all on cns.v_claim_assessment_latest,cns.v_knowledge_contract_violations from public,anon,authenticated;
grant select,insert,update on cns.knowledge_documents to service_role;
grant select,insert,update on cns.claim_assessments to service_role;
grant select on cns.v_claim_assessment_latest,cns.v_knowledge_contract_violations to service_role;

revoke all on function cns.commit_claim_v1(text,text,text,text,text,jsonb,text,text,text,text[],text,text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function cns.commit_claim_v1(text,text,text,text,text,jsonb,text,text,text,text[],text,text,text,text,text,text,text,text) to service_role;

insert into cns.system_meta(key,value)
values(
  'superbrain_knowledge_contract_v1',
  jsonb_build_object(
    'version','1.0.0',
    'status','ACTIVE_NOT_COMPLETE',
    'okf_upstream','0.2',
    'producer_profile','4PLANET_OKF_1.1',
    'legacy_scalar_confidence_authoritative',false,
    'claim_assessment_vector',true,
    'factual_claim_requires_evidence',true,
    'generated_self_promotion_forbidden',true,
    'private_scope_fail_closed',true,
    'drive_authority_during_census',true
  )
)
on conflict(key) do update set value=excluded.value;

commit;
