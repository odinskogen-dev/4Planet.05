-- 4PLANET SUPERBRAIN — SCOPE-FIRST RETRIEVAL + BRAIN HEALTH 10
-- Extends existing CNS. Retrieval scope is resolved BEFORE any relevance/vector ranking.
-- Private knowledge is never promoted in place to shared/public truth.

begin;

-- ---------------------------------------------------------------------------
-- PRIVATE DOMAIN IMMUTABILITY
-- A private source/claim/observation/document may be superseded, but its trust
-- boundary cannot be widened in place. Shared learning must be a new object
-- with explicit provenance/legal/aggregation gates.
-- ---------------------------------------------------------------------------
create or replace function cns.guard_private_trust_domain_widening()
returns trigger language plpgsql security definer set search_path=cns,public as $$
begin
  if old.trust_domain_id in ('ODIN_PRIVATE','ACTOR_PRIVATE')
     and new.trust_domain_id is distinct from old.trust_domain_id then
    raise exception 'CNS_PRIVATE_TRUST_DOMAIN_IMMUTABLE_APPEND_DERIVED_OBJECT';
  end if;
  if old.workspace_id is not null and new.workspace_id is distinct from old.workspace_id then
    raise exception 'CNS_WORKSPACE_SCOPE_IMMUTABLE_APPEND_DERIVED_OBJECT';
  end if;
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['source_registry','entities','evidence','claims','observations','decisions','outcomes','learnings','knowledge_documents'] loop
    execute format('drop trigger if exists cns_private_scope_immutable on cns.%I',t);
    execute format('create trigger cns_private_scope_immutable before update of trust_domain_id,workspace_id on cns.%I for each row execute function cns.guard_private_trust_domain_widening()',t);
  end loop;
end $$;

-- Claim/evidence edges can never cross actor-private workspace boundaries or
-- use private evidence to establish a shared/public claim.
create or replace function cns.guard_claim_evidence_scope()
returns trigger language plpgsql security definer set search_path=cns,public as $$
declare
  v_claim cns.claims%rowtype;
  v_evidence cns.evidence%rowtype;
begin
  select * into v_claim from cns.claims where claim_id=new.claim_id;
  select * into v_evidence from cns.evidence where evidence_id=new.evidence_id;
  if not found then raise exception 'CNS_CLAIM_EVIDENCE_OBJECT_MISSING'; end if;

  if v_claim.trust_domain_id='ACTOR_PRIVATE' then
    if v_evidence.trust_domain_id<>'ACTOR_PRIVATE' or v_evidence.workspace_id is distinct from v_claim.workspace_id then
      raise exception 'CNS_PRIVATE_CLAIM_EVIDENCE_SCOPE_MISMATCH';
    end if;
  end if;

  if v_claim.trust_domain_id in ('PLANET_SHARED','PUBLIC')
     and v_evidence.trust_domain_id in ('ODIN_PRIVATE','ACTOR_PRIVATE') then
    raise exception 'CNS_PRIVATE_EVIDENCE_CANNOT_DIRECTLY_ESTABLISH_SHARED_CLAIM';
  end if;
  return new;
end;
$$;

drop trigger if exists cns_claim_evidence_scope_guard on cns.claim_evidence;
create trigger cns_claim_evidence_scope_guard
before insert or update on cns.claim_evidence
for each row execute function cns.guard_claim_evidence_scope();

-- ---------------------------------------------------------------------------
-- SCOPE-FIRST RETRIEVAL CANDIDATES
-- This function intentionally does no semantic/vector ranking. It returns the
-- only claim universe a later lexical/vector ranker is allowed to see.
-- Internal/founder data is not exposed to actor-product contexts by default.
-- ---------------------------------------------------------------------------
create or replace function cns.retrieve_actor_claim_candidates_v1(
  p_identity_id text,
  p_workspace_id text,
  p_actor_id text,
  p_subject_type text default null,
  p_predicate text default null,
  p_limit integer default 500
) returns table(
  claim_id text,
  subject_type text,
  subject_id text,
  predicate text,
  value jsonb,
  claim_kind text,
  knowledge_state text,
  authority text,
  review_state cns.review_state,
  evidence_strength cns.evidence_strength_state,
  interpretation_state cns.interpretation_state,
  freshness_state cns.freshness_state,
  trust_domain_id text,
  workspace_id text,
  evidence_ids text[]
)
language plpgsql stable security definer set search_path=cns,public as $$
begin
  if p_limit < 1 or p_limit > 5000 then raise exception 'CNS_RETRIEVAL_LIMIT_INVALID'; end if;
  if not cns.identity_has_workspace_access(p_identity_id,p_workspace_id) then
    raise exception 'CNS_WORKSPACE_ACCESS_DENIED';
  end if;
  if not exists(
    select 1 from cns.workspace_actors wa
    where wa.workspace_id=p_workspace_id and wa.actor_id=p_actor_id and wa.state='ACTIVE'
  ) then
    raise exception 'CNS_ACTOR_NOT_ACTIVE_IN_WORKSPACE';
  end if;

  return query
  select
    c.claim_id,c.subject_type,c.subject_id,c.predicate,c.value,c.claim_kind,c.knowledge_state,c.authority,
    c.review_state,c.evidence_strength,c.interpretation_state,c.freshness_state,c.trust_domain_id,c.workspace_id,
    coalesce(array_agg(distinct ce.evidence_id) filter (where ce.evidence_id is not null),'{}'::text[])
  from cns.claims c
  left join cns.claim_evidence ce on ce.claim_id=c.claim_id
  where c.state in ('ACTIVE','DISPUTED')
    and (p_subject_type is null or c.subject_type=p_subject_type)
    and (p_predicate is null or c.predicate=p_predicate)
    and (
      (c.trust_domain_id='ACTOR_PRIVATE' and c.workspace_id=p_workspace_id)
      or c.trust_domain_id in ('PLANET_SHARED','PUBLIC')
    )
    and (
      c.subject_id=p_actor_id
      or c.subject_type not in ('ACTOR','PERSON','COMPANY','FOUNDATION','NONPROFIT','GOVERNMENT','RESEARCH_ORGANISATION','SPV')
      or c.trust_domain_id in ('PLANET_SHARED','PUBLIC')
    )
  group by c.claim_id,c.subject_type,c.subject_id,c.predicate,c.value,c.claim_kind,c.knowledge_state,c.authority,
           c.review_state,c.evidence_strength,c.interpretation_state,c.freshness_state,c.trust_domain_id,c.workspace_id,c.updated_at
  order by
    case c.trust_domain_id when 'ACTOR_PRIVATE' then 0 when 'PLANET_SHARED' then 1 else 2 end,
    case c.knowledge_state when 'KNOWN' then 0 when 'CONFLICTED' then 1 else 2 end,
    c.updated_at desc,c.claim_id
  limit p_limit;
end;
$$;

-- ---------------------------------------------------------------------------
-- DERIVED ACTOR CONTEXT SNAPSHOT
-- A runtime context is not truth. It records the exact scoped state/claims and
-- expires. Vector ranking, if added later, operates only inside candidate IDs.
-- ---------------------------------------------------------------------------
create table if not exists cns.actor_context_snapshots (
  actor_context_snapshot_id uuid primary key default gen_random_uuid(),
  identity_id text not null references cns.identities(identity_id) on delete restrict,
  workspace_id text not null references cns.workspaces(workspace_id) on delete restrict,
  actor_id text not null references cns.actors(actor_id) on delete restrict,
  intent text not null,
  requested_depth smallint not null check(requested_depth between 0 and 4),
  token_budget integer not null check(token_budget between 256 and 200000),
  compiled_context jsonb not null,
  candidate_claim_ids text[] not null default '{}',
  fingerprint text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  invalidated_at timestamptz,
  check(expires_at>created_at)
);

create index if not exists cns_actor_context_workspace_idx
  on cns.actor_context_snapshots(workspace_id,actor_id,created_at desc);

create or replace function cns.compile_actor_context_v1(
  p_identity_id text,
  p_workspace_id text,
  p_actor_id text,
  p_intent text,
  p_depth smallint default 2,
  p_token_budget integer default 12000,
  p_ttl_seconds integer default 900
) returns uuid
language plpgsql security definer set search_path=cns,public as $$
declare
  v_states jsonb;
  v_claims jsonb;
  v_decisions jsonb;
  v_outcomes jsonb;
  v_learnings jsonb;
  v_claim_ids text[];
  v_body jsonb;
  v_fp text;
  v_id uuid;
begin
  if p_depth<0 or p_depth>4 then raise exception 'CNS_CONTEXT_DEPTH_INVALID'; end if;
  if p_token_budget<256 or p_token_budget>200000 then raise exception 'CNS_CONTEXT_BUDGET_INVALID'; end if;
  if p_ttl_seconds<30 or p_ttl_seconds>86400 then raise exception 'CNS_CONTEXT_TTL_INVALID'; end if;
  if not cns.identity_has_workspace_access(p_identity_id,p_workspace_id) then raise exception 'CNS_WORKSPACE_ACCESS_DENIED'; end if;
  if not exists(select 1 from cns.workspace_actors where workspace_id=p_workspace_id and actor_id=p_actor_id and state='ACTIVE') then
    raise exception 'CNS_ACTOR_NOT_ACTIVE_IN_WORKSPACE';
  end if;

  select coalesce(jsonb_agg(to_jsonb(s) order by s.state_scope),'[]'::jsonb)
  into v_states
  from cns.actor_current_state s
  where s.workspace_id=p_workspace_id and s.actor_id=p_actor_id;

  with candidates as (
    select * from cns.retrieve_actor_claim_candidates_v1(p_identity_id,p_workspace_id,p_actor_id,null,null,500)
  )
  select
    coalesce(jsonb_agg(to_jsonb(c) order by c.claim_id),'[]'::jsonb),
    coalesce(array_agg(c.claim_id order by c.claim_id),'{}'::text[])
  into v_claims,v_claim_ids from candidates c;

  select case when p_depth>=1 then coalesce(jsonb_agg(to_jsonb(d) order by d.decided_at desc nulls last,d.decision_id),'[]'::jsonb) else '[]'::jsonb end
  into v_decisions
  from cns.decisions d
  where d.workspace_id=p_workspace_id and d.status='ACTIVE' and d.trust_domain_id='ACTOR_PRIVATE';

  select case when p_depth>=2 then coalesce(jsonb_agg(to_jsonb(o) order by o.observed_at desc,o.outcome_id),'[]'::jsonb) else '[]'::jsonb end
  into v_outcomes
  from cns.outcomes o
  where o.workspace_id=p_workspace_id and o.state in ('ACTIVE','DISPUTED') and o.trust_domain_id='ACTOR_PRIVATE';

  select case when p_depth>=2 then coalesce(jsonb_agg(to_jsonb(l) order by l.created_at desc,l.learning_id),'[]'::jsonb) else '[]'::jsonb end
  into v_learnings
  from cns.learnings l
  where l.workspace_id=p_workspace_id and l.state in ('CANDIDATE','ACCEPTED') and l.trust_domain_id='ACTOR_PRIVATE';

  v_body := jsonb_build_object(
    'identity_id',p_identity_id,
    'workspace_id',p_workspace_id,
    'actor',(select jsonb_build_object('actor_id',a.actor_id,'actor_type',a.actor_type,'state',a.state) from cns.actors a where a.actor_id=p_actor_id),
    'current_state',v_states,
    'claim_candidates',v_claims,
    'decisions',v_decisions,
    'outcomes',v_outcomes,
    'learnings',v_learnings,
    'intent',p_intent,
    'requested_depth',p_depth,
    'retrieval_law','SCOPE_BEFORE_RELEVANCE'
  );
  if length(v_body::text)>p_token_budget*6 then raise exception 'CNS_CONTEXT_BUDGET_EXCEEDED: deterministic compiler refuses silent truncation'; end if;
  v_fp := encode(extensions.digest(v_body::text,'sha256'),'hex');
  insert into cns.actor_context_snapshots(identity_id,workspace_id,actor_id,intent,requested_depth,token_budget,compiled_context,candidate_claim_ids,fingerprint,expires_at)
  values(p_identity_id,p_workspace_id,p_actor_id,p_intent,p_depth,p_token_budget,v_body,v_claim_ids,v_fp,clock_timestamp()+make_interval(secs=>p_ttl_seconds))
  returning actor_context_snapshot_id into v_id;
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- FOUNDATION HEALTH VIEW
-- One Doctor-facing surface over existing actor + knowledge + runtime checks.
-- ---------------------------------------------------------------------------
create or replace view cns.v_superbrain_foundation_violations
with (security_invoker=true) as
select rule_id,severity,'ACTOR_KERNEL'::text as control_domain,object_id,evidence
from cns.v_actor_kernel_violations
union all
select rule_id,severity,'KNOWLEDGE_CONTRACT',object_id,evidence
from cns.v_knowledge_contract_violations
union all
select
  'STALE_ACTOR_CURRENT_STATE','P1','ACTOR_STATE',concat(s.workspace_id,'/',s.actor_id,'/',s.state_scope),
  jsonb_build_object('stale_after',s.stale_after,'verified_at',s.verified_at,'last_event_id',s.last_event_id)
from cns.actor_current_state s
where s.stale_after<=clock_timestamp()
union all
select
  'EXPIRED_ACTOR_CONTEXT_NOT_INVALIDATED','P2','RETRIEVAL',acs.actor_context_snapshot_id::text,
  jsonb_build_object('workspace_id',acs.workspace_id,'actor_id',acs.actor_id,'expires_at',acs.expires_at)
from cns.actor_context_snapshots acs
where acs.expires_at<=clock_timestamp() and acs.invalidated_at is null
union all
select
  'PRIVATE_SOURCE_WITHOUT_WORKSPACE','P0','PRIVACY',s.source_id,
  jsonb_build_object('trust_domain_id',s.trust_domain_id)
from cns.source_registry s
where s.trust_domain_id='ACTOR_PRIVATE' and s.workspace_id is null
union all
select
  'PRIVATE_DOCUMENT_WITHOUT_WORKSPACE','P0','PRIVACY',d.document_id,
  jsonb_build_object('trust_domain_id',d.trust_domain_id)
from cns.knowledge_documents d
where d.trust_domain_id='ACTOR_PRIVATE' and d.workspace_id is null
union all
select
  'STALE_KNOWN_CLAIM','P1','KNOWLEDGE',c.claim_id,
  jsonb_build_object('stale_after',c.stale_after,'freshness_state',c.freshness_state)
from cns.claims c
where c.state='ACTIVE' and c.knowledge_state='KNOWN'
  and (c.freshness_state='STALE' or (c.stale_after is not null and c.stale_after<=clock_timestamp()))
union all
select
  'OPEN_MATERIAL_CONFLICT_NOT_CONFLICTED','P1','KNOWLEDGE',c.claim_id,
  jsonb_build_object('knowledge_state',c.knowledge_state)
from cns.claims c
where c.state in ('ACTIVE','DISPUTED') and c.knowledge_state<>'CONFLICTED'
  and exists(
    select 1 from cns.conflict_claims cc join cns.conflicts cf using(conflict_id)
    where cc.claim_id=c.claim_id and cf.state='OPEN' and cf.severity in ('P0','P1')
  );

alter table cns.actor_context_snapshots enable row level security;
revoke all on cns.actor_context_snapshots from public,anon,authenticated;
grant select,insert,update on cns.actor_context_snapshots to service_role;
revoke all on cns.v_superbrain_foundation_violations from public,anon,authenticated;
grant select on cns.v_superbrain_foundation_violations to service_role;

revoke all on function cns.retrieve_actor_claim_candidates_v1(text,text,text,text,text,integer) from public,anon,authenticated;
revoke all on function cns.compile_actor_context_v1(text,text,text,text,smallint,integer,integer) from public,anon,authenticated;
grant execute on function cns.retrieve_actor_claim_candidates_v1(text,text,text,text,text,integer) to service_role;
grant execute on function cns.compile_actor_context_v1(text,text,text,text,smallint,integer,integer) to service_role;

insert into cns.system_meta(key,value)
values('superbrain_scope_first_retrieval_v1',jsonb_build_object(
  'version','1.0.0',
  'status','ACTIVE_NOT_COMPLETE',
  'scope_before_relevance',true,
  'actor_product_allowed_domains',jsonb_build_array('ACTOR_PRIVATE','PLANET_SHARED','PUBLIC'),
  'internal_domains_excluded_by_default',jsonb_build_array('ODIN_PRIVATE','4PLANET_INTERNAL'),
  'private_in_place_promotion_forbidden',true,
  'vector_store_authority',false,
  'health_view','cns.v_superbrain_foundation_violations'
))
on conflict(key) do update set value=excluded.value;

commit;
