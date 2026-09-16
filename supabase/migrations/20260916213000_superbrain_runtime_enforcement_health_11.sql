-- 4PLANET SUPERBRAIN — RUNTIME ENFORCEMENT + HEALTH 11
-- Extends the existing CNS. No new BRAIN, truth store, actor graph, or product brain.
-- Adds derived Actor Twin readback, explicit writeback receipts, LLM context audit,
-- and Doctor coverage for silent brain rot.

begin;

-- ---------------------------------------------------------------------------
-- WRITEBACK -> READBACK RECEIPTS
-- The immutable event and actor_current_state remain the truth/history + projection.
-- This table is only an audit receipt proving a committed projection was read back.
-- ---------------------------------------------------------------------------
create table if not exists cns.writeback_receipts (
  event_id bigint primary key references cns.events(event_id) on delete restrict,
  workspace_id text not null references cns.workspaces(workspace_id) on delete restrict,
  actor_id text not null references cns.actors(actor_id) on delete restrict,
  state_scope text not null,
  projected_at timestamptz not null default now(),
  readback_verified_at timestamptz,
  readback_fingerprint text,
  created_at timestamptz not null default now(),
  foreign key(workspace_id,actor_id) references cns.workspace_actors(workspace_id,actor_id) on delete restrict
);

create index if not exists cns_writeback_receipts_pending_idx
  on cns.writeback_receipts(projected_at,event_id)
  where readback_verified_at is null;

create or replace function cns.record_actor_state_writeback_receipt()
returns trigger language plpgsql security definer set search_path=cns,public as $$
begin
  insert into cns.writeback_receipts(event_id,workspace_id,actor_id,state_scope,projected_at)
  values(new.last_event_id,new.workspace_id,new.actor_id,new.state_scope,clock_timestamp())
  on conflict(event_id) do nothing;
  return new;
end;
$$;

drop trigger if exists cns_actor_state_writeback_receipt on cns.actor_current_state;
create trigger cns_actor_state_writeback_receipt
after insert or update of last_event_id on cns.actor_current_state
for each row execute function cns.record_actor_state_writeback_receipt();

create or replace function cns.verify_actor_state_readback_v1(p_event_id bigint)
returns text
language plpgsql security definer set search_path=cns,public as $$
declare
  v_receipt cns.writeback_receipts%rowtype;
  v_state cns.actor_current_state%rowtype;
  v_fp text;
begin
  select * into v_receipt from cns.writeback_receipts where event_id=p_event_id;
  if not found then raise exception 'CNS_WRITEBACK_RECEIPT_NOT_FOUND'; end if;

  select * into v_state
  from cns.actor_current_state
  where workspace_id=v_receipt.workspace_id
    and actor_id=v_receipt.actor_id
    and state_scope=v_receipt.state_scope
    and last_event_id=p_event_id;
  if not found then raise exception 'CNS_WRITEBACK_NOT_CURRENT_READBACK'; end if;

  v_fp := encode(extensions.digest(
    concat_ws('|',v_state.workspace_id,v_state.actor_id,v_state.state_scope,v_state.last_event_id::text,v_state.state::text),
    'sha256'
  ),'hex');

  update cns.writeback_receipts
  set readback_verified_at=clock_timestamp(),readback_fingerprint=v_fp
  where event_id=p_event_id;

  return v_fp;
end;
$$;

-- ---------------------------------------------------------------------------
-- ACTOR TWIN IS A DERIVED VIEW OVER THE SAME UNIVERSAL PRIMITIVES.
-- PERSON, COMPANY and future actor types use this exact view and state spine.
-- ---------------------------------------------------------------------------
create or replace view cns.v_actor_twin_v1
with (security_invoker=true) as
select
  wa.workspace_id,
  wa.actor_id,
  a.actor_type,
  a.home_trust_domain_id,
  w.workspace_kind,
  w.trust_domain_id as workspace_trust_domain_id,
  coalesce((
    select jsonb_object_agg(s.state_scope,s.state order by s.state_scope)
    from cns.actor_current_state s
    where s.workspace_id=wa.workspace_id and s.actor_id=wa.actor_id
  ),'{}'::jsonb) as current_state,
  coalesce((
    select jsonb_object_agg(s.state_scope,s.last_event_id order by s.state_scope)
    from cns.actor_current_state s
    where s.workspace_id=wa.workspace_id and s.actor_id=wa.actor_id
  ),'{}'::jsonb) as state_event_heads,
  (select max(s.updated_at) from cns.actor_current_state s where s.workspace_id=wa.workspace_id and s.actor_id=wa.actor_id) as state_updated_at
from cns.workspace_actors wa
join cns.actors a on a.actor_id=wa.actor_id
join cns.workspaces w on w.workspace_id=wa.workspace_id
where wa.state='ACTIVE' and a.state='ACTIVE' and w.state='ACTIVE';

-- ---------------------------------------------------------------------------
-- LLM KERNEL SESSION: AUDIT/ENFORCEMENT OVER EXISTING ID -> WORKSPACE -> ACCESS
-- -> ACTOR CONTEXT -> SCOPE-FIRST RETRIEVAL. It stores no independent truth.
-- ---------------------------------------------------------------------------
create table if not exists cns.llm_kernel_sessions (
  llm_session_id uuid primary key default gen_random_uuid(),
  identity_id text not null references cns.identities(identity_id) on delete restrict,
  workspace_id text not null references cns.workspaces(workspace_id) on delete restrict,
  actor_id text not null references cns.actors(actor_id) on delete restrict,
  actor_context_snapshot_id uuid not null references cns.actor_context_snapshots(actor_context_snapshot_id) on delete restrict,
  contract_version text not null default 'SUPERBRAIN_LLM_KERNEL_1.0',
  contract_chain jsonb not null,
  state text not null default 'OPEN' check(state in ('OPEN','CLOSED','FAILED','EXPIRED')),
  approved_writeback_event_ids bigint[] not null default '{}',
  opened_at timestamptz not null default now(),
  expires_at timestamptz not null,
  readback_verified_at timestamptz,
  closed_at timestamptz,
  check(expires_at>opened_at)
);

create table if not exists cns.llm_kernel_session_events (
  llm_session_id uuid not null references cns.llm_kernel_sessions(llm_session_id) on delete restrict,
  event_id bigint not null references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key(llm_session_id,event_id)
);

create index if not exists cns_llm_kernel_sessions_scope_idx
  on cns.llm_kernel_sessions(workspace_id,actor_id,state,opened_at desc);

create or replace function cns.begin_actor_llm_session_v1(
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
  v_snapshot uuid;
  v_session uuid;
begin
  if not cns.identity_has_workspace_access(p_identity_id,p_workspace_id) then
    raise exception 'CNS_LLM_KERNEL_ACCESS_DENIED';
  end if;

  v_snapshot := cns.compile_actor_context_v1(
    p_identity_id,p_workspace_id,p_actor_id,p_intent,p_depth,p_token_budget,p_ttl_seconds
  );

  insert into cns.llm_kernel_sessions(
    identity_id,workspace_id,actor_id,actor_context_snapshot_id,contract_chain,expires_at
  ) values (
    p_identity_id,p_workspace_id,p_actor_id,v_snapshot,
    jsonb_build_array(
      'IDENTITY','WORKSPACE','ACCESS','ACTOR_CONTEXT','SCOPE_FIRST_RETRIEVAL',
      'SOURCE_CLAIM_EVIDENCE_STATE_DISTINCTION','RESPONSE_OR_ACTION','APPROVED_WRITEBACK','READBACK'
    ),
    clock_timestamp()+make_interval(secs=>p_ttl_seconds)
  ) returning llm_session_id into v_session;

  return v_session;
end;
$$;

create or replace function cns.complete_actor_llm_session_v1(
  p_llm_session_id uuid,
  p_writeback_event_ids bigint[] default '{}'
) returns boolean
language plpgsql security definer set search_path=cns,public as $$
declare
  v_session cns.llm_kernel_sessions%rowtype;
  v_event_id bigint;
  v_event cns.events%rowtype;
begin
  select * into v_session from cns.llm_kernel_sessions where llm_session_id=p_llm_session_id and state='OPEN';
  if not found then raise exception 'CNS_LLM_SESSION_NOT_OPEN'; end if;
  if v_session.expires_at<=clock_timestamp() then
    update cns.llm_kernel_sessions set state='EXPIRED',closed_at=clock_timestamp() where llm_session_id=p_llm_session_id;
    raise exception 'CNS_LLM_SESSION_EXPIRED';
  end if;

  foreach v_event_id in array coalesce(p_writeback_event_ids,'{}'::bigint[]) loop
    select * into v_event from cns.events where event_id=v_event_id;
    if not found then raise exception 'CNS_LLM_WRITEBACK_EVENT_MISSING:%',v_event_id; end if;

    if v_event.entity_type='ACTOR' and v_event.event_type='ACTOR_STATE_COMMITTED' then
      if not exists(
        select 1 from cns.writeback_receipts wr
        where wr.event_id=v_event_id
          and wr.workspace_id=v_session.workspace_id
          and wr.actor_id=v_session.actor_id
          and wr.readback_verified_at is not null
      ) then
        raise exception 'CNS_LLM_ACTOR_WRITEBACK_READBACK_REQUIRED:%',v_event_id;
      end if;
    elsif v_event.entity_type='CLAIM' and v_event.event_type='CLAIM_COMMITTED' then
      if not exists(select 1 from cns.claims c where c.last_event_id=v_event_id and c.claim_id=v_event.entity_id) then
        raise exception 'CNS_LLM_CLAIM_READBACK_REQUIRED:%',v_event_id;
      end if;
    else
      raise exception 'CNS_LLM_UNSUPPORTED_DURABLE_WRITEBACK_EVENT:%:%',v_event.entity_type,v_event.event_type;
    end if;

    insert into cns.llm_kernel_session_events(llm_session_id,event_id)
    values(p_llm_session_id,v_event_id)
    on conflict do nothing;
  end loop;

  update cns.llm_kernel_sessions
  set approved_writeback_event_ids=coalesce(p_writeback_event_ids,'{}'::bigint[]),
      readback_verified_at=clock_timestamp(),
      state='CLOSED',closed_at=clock_timestamp()
  where llm_session_id=p_llm_session_id;
  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- AUTONOMOUS BRAIN HEALTH V2
-- Detects silent drift without changing authority or truth by itself.
-- ---------------------------------------------------------------------------
create or replace view cns.v_superbrain_health_v2
with (security_invoker=true) as
select rule_id,severity,control_domain,object_id,evidence
from cns.v_superbrain_foundation_violations
union all
select v.rule_id,v.severity,'AUTHORITY',v.entity_id,
  jsonb_build_object('project_id',v.project_id,'entity_type',v.entity_type,'summary',v.summary)
from cns.v_authority_violations v
union all
select v.rule_id,v.severity,'PRIVACY',v.entity_id,
  jsonb_build_object('project_id',v.project_id,'entity_type',v.entity_type,'summary',v.summary)
from cns.v_privacy_violations v
union all
select v.rule_id,v.severity,'META_CONTROL',v.entity_id,
  jsonb_build_object('project_id',v.project_id,'entity_type',v.entity_type,'summary',v.summary)
from cns.v_meta_control_violations v
union all
select
  'ACTIVE_SOURCE_REVISION_MISSING','P0','PROVENANCE',s.source_id,
  jsonb_build_object('current_revision',s.current_revision,'uri',s.uri)
from cns.source_registry s
where s.state='ACTIVE' and s.current_revision is not null
  and not exists(select 1 from cns.source_revisions sr where sr.source_id=s.source_id and sr.revision=s.current_revision)
union all
select
  'COMPLETE_CLAIM_BROKEN_LINEAGE','P0','PROVENANCE',c.claim_id,
  jsonb_build_object('provenance_state',c.provenance_state,'source_id',c.source_id)
from cns.claims c
where c.state='ACTIVE' and c.provenance_state='COMPLETE'
  and not exists(
    select 1
    from cns.claim_evidence ce
    join cns.evidence e on e.evidence_id=ce.evidence_id and e.state in ('ACTIVE','DISPUTED')
    join cns.source_registry s on s.source_id=e.source_id and s.state='ACTIVE'
    where ce.claim_id=c.claim_id
  )
union all
select
  'ORPHAN_ACTOR_OR_ENTITY_CLAIM','P0','KNOWLEDGE',c.claim_id,
  jsonb_build_object('subject_type',c.subject_type,'subject_id',c.subject_id)
from cns.claims c
where c.state in ('ACTIVE','DISPUTED')
  and c.subject_type in ('ACTOR','PERSON','COMPANY','FOUNDATION','NONPROFIT','GOVERNMENT','RESEARCH_ORGANISATION','SPV','ENTITY')
  and not exists(select 1 from cns.entities e where e.entity_id=c.subject_id and e.lifecycle='ACTIVE')
union all
select
  'ACTIVE_SUPERSEDED_CLAIM','P1','SUPERSESSION',old.claim_id,
  jsonb_build_object('superseded_by',new.claim_id)
from cns.claims new
join cns.claims old on old.claim_id=new.supersedes_claim_id
where new.state='ACTIVE' and old.state='ACTIVE'
union all
select
  'ACTIVE_SUPERSEDED_EVIDENCE','P1','SUPERSESSION',old.evidence_id,
  jsonb_build_object('superseded_by',new.evidence_id)
from cns.evidence new
join cns.evidence old on old.evidence_id=new.supersedes_evidence_id
where new.state='ACTIVE' and old.state='ACTIVE'
union all
select
  'DUPLICATE_PRIMARY_AUTHORITY','P0','AUTHORITY',concat(b.project_id,'/',b.surface),
  jsonb_build_object('count',count(*))
from cns.authority_bindings b
where b.state='ACTIVE' and b.role='PRIMARY'
group by b.project_id,b.surface
having count(*)>1
union all
select
  'UNSCOPED_ACTOR_EVENT','P0','WRITEBACK',e.event_id::text,
  jsonb_build_object('actor_id',e.entity_id,'event_type',e.event_type)
from cns.events e
where e.entity_type='ACTOR' and e.event_type like 'ACTOR_%'
  and not exists(select 1 from cns.event_workspace_scope x where x.event_id=e.event_id)
union all
select
  'WRITEBACK_WITHOUT_READBACK','P1','WRITEBACK',wr.event_id::text,
  jsonb_build_object('workspace_id',wr.workspace_id,'actor_id',wr.actor_id,'state_scope',wr.state_scope,'projected_at',wr.projected_at)
from cns.writeback_receipts wr
where wr.readback_verified_at is null
union all
select
  'PRODUCT_LOCAL_SEMANTIC_TRUTH','P1','PARALLEL_TRUTH',m.memory_id,
  jsonb_build_object('product_scope',m.product_scope,'memory_type',m.memory_type,'authority',m.authority)
from cns.memory_items m
where m.product_scope is not null and m.state='ACTIVE' and m.memory_type in ('SEMANTIC','EVIDENCE')
union all
select
  'AGENT_DURABLE_WRITE_WITHOUT_LLM_KERNEL_SESSION','P0','LLM_KERNEL',e.event_id::text,
  jsonb_build_object('entity_type',e.entity_type,'entity_id',e.entity_id,'event_type',e.event_type,'agent_id',e.actor_id)
from cns.events e
where e.actor_type='AGENT' and e.entity_type in ('ACTOR','CLAIM')
  and not exists(select 1 from cns.llm_kernel_session_events se where se.event_id=e.event_id)
union all
select
  'OPEN_LLM_SESSION_EXPIRED','P1','LLM_KERNEL',s.llm_session_id::text,
  jsonb_build_object('workspace_id',s.workspace_id,'actor_id',s.actor_id,'expires_at',s.expires_at)
from cns.llm_kernel_sessions s
where s.state='OPEN' and s.expires_at<=clock_timestamp()
union all
select
  'BRAIN_CENSUS_NOT_COMPLETE','P0','MIGRATION','drive_census',
  jsonb_build_object('state',coalesce(m.value->>'drive_migration_state','UNKNOWN'))
from cns.system_meta m
where m.key='superbrain_actor_workspace_kernel_v1'
  and coalesce(m.value->>'drive_migration_state','UNKNOWN')<>'COMPLETE';

-- Replace Doctor read surface; Doctor detects but never promotes truth/authority.
create or replace function cns.doctor_scan()
returns integer language plpgsql security definer set search_path=cns,public as $$
declare v_count integer;
begin
  perform cns.expire_dead_leases();
  insert into cns.health_incidents(
    fingerprint,rule_id,severity,entity_type,entity_id,project_id,summary,evidence,state
  )
  select
    encode(extensions.digest(rule_id||'|'||control_domain||'|'||object_id,'sha256'),'hex'),
    rule_id,severity,control_domain,object_id,null,evidence::text,evidence,'OPEN'
  from cns.v_superbrain_health_v2
  on conflict(fingerprint) where state in ('OPEN','ACKNOWLEDGED')
  do update set last_seen_at=clock_timestamp(),summary=excluded.summary,severity=excluded.severity,evidence=excluded.evidence;
  get diagnostics v_count=row_count;

  update cns.health_incidents i
  set state='RESOLVED',resolved_at=clock_timestamp(),last_seen_at=clock_timestamp()
  where i.state in ('OPEN','ACKNOWLEDGED')
    and not exists(
      select 1 from cns.v_superbrain_health_v2 v
      where encode(extensions.digest(v.rule_id||'|'||v.control_domain||'|'||v.object_id,'sha256'),'hex')=i.fingerprint
    );
  return v_count;
end;
$$;

-- Private-by-default runtime/audit surfaces.
alter table cns.writeback_receipts enable row level security;
alter table cns.llm_kernel_sessions enable row level security;
alter table cns.llm_kernel_session_events enable row level security;
revoke all on cns.writeback_receipts,cns.llm_kernel_sessions,cns.llm_kernel_session_events from public,anon,authenticated;
revoke all on cns.v_actor_twin_v1,cns.v_superbrain_health_v2 from public,anon,authenticated;
grant select,insert,update on cns.writeback_receipts,cns.llm_kernel_sessions,cns.llm_kernel_session_events to service_role;
grant select on cns.v_actor_twin_v1,cns.v_superbrain_health_v2 to service_role;

revoke all on function cns.verify_actor_state_readback_v1(bigint) from public,anon,authenticated;
revoke all on function cns.begin_actor_llm_session_v1(text,text,text,text,smallint,integer,integer) from public,anon,authenticated;
revoke all on function cns.complete_actor_llm_session_v1(uuid,bigint[]) from public,anon,authenticated;
grant execute on function cns.verify_actor_state_readback_v1(bigint) to service_role;
grant execute on function cns.begin_actor_llm_session_v1(text,text,text,text,smallint,integer,integer) to service_role;
grant execute on function cns.complete_actor_llm_session_v1(uuid,bigint[]) to service_role;

insert into cns.system_meta(key,value)
values('superbrain_runtime_enforcement_v1',jsonb_build_object(
  'version','1.0.0',
  'status','ACTIVE_NOT_COMPLETE',
  'actor_twin','DERIVED_VIEW_ONLY',
  'writeback_readback_receipts',true,
  'llm_kernel_chain',jsonb_build_array('IDENTITY','WORKSPACE','ACCESS','ACTOR_CONTEXT','RETRIEVAL','DISTINCTION','RESPONSE_ACTION','APPROVED_WRITEBACK','READBACK'),
  'agent_local_truth_forbidden',true,
  'doctor_view','cns.v_superbrain_health_v2',
  'doctor_can_promote_truth',false
))
on conflict(key) do update set value=excluded.value;

commit;
