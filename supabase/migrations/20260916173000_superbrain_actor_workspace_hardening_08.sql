-- 4PLANET SUPERBRAIN — ACTOR / WORKSPACE HARDENING 08
-- Permission-aware writes + indexed workspace scope for immutable CNS events.
-- Extends Kernel 07. No parallel event log / truth store.

begin;

-- ---------------------------------------------------------------------------
-- Explicit permission resolution. Membership alone never implies write access.
-- OWNER/ADMIN may be represented by role, but permissions can explicitly deny.
-- ---------------------------------------------------------------------------
create or replace function cns.identity_has_workspace_permission(
  p_identity_id text,
  p_workspace_id text,
  p_permission text
) returns boolean
language sql stable security definer set search_path=cns,public as $$
  select exists(
    select 1
    from cns.identities i
    join cns.workspace_memberships m on m.identity_id=i.identity_id
    join cns.workspaces w on w.workspace_id=m.workspace_id
    where i.identity_id=p_identity_id
      and i.state='ACTIVE'
      and m.workspace_id=p_workspace_id
      and m.state='ACTIVE'
      and w.state='ACTIVE'
      and (
        case
          when m.permissions ? p_permission
            then coalesce((m.permissions->>p_permission)::boolean,false)
          when upper(m.membership_role) in ('OWNER','ADMIN')
            then true
          else false
        end
      )
  );
$$;

-- Backward-compatible access helper is READ permission, not an unqualified
-- membership check.
create or replace function cns.identity_has_workspace_access(
  p_identity_id text,
  p_workspace_id text
) returns boolean
language sql stable security definer set search_path=cns,public as $$
  select cns.identity_has_workspace_permission(p_identity_id,p_workspace_id,'read');
$$;

-- ---------------------------------------------------------------------------
-- Scope edge over the one existing immutable event ledger.
-- This makes tenant/actor history indexable without parsing JSON payloads.
-- ---------------------------------------------------------------------------
create table if not exists cns.event_workspace_scope (
  event_id bigint primary key references cns.events(event_id) on delete restrict,
  workspace_id text not null references cns.workspaces(workspace_id) on delete restrict,
  actor_id text not null references cns.actors(actor_id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key(workspace_id,actor_id)
    references cns.workspace_actors(workspace_id,actor_id) on delete restrict
);

create index if not exists cns_event_workspace_scope_workspace_idx
  on cns.event_workspace_scope(workspace_id,event_id desc);
create index if not exists cns_event_workspace_scope_actor_idx
  on cns.event_workspace_scope(actor_id,event_id desc);

-- ---------------------------------------------------------------------------
-- Rebuild state writeback with explicit write permission + scope edge.
-- No silent product-local current-state mutation.
-- ---------------------------------------------------------------------------
create or replace function cns.commit_actor_state(
  p_workspace_id text,
  p_actor_id text,
  p_state_scope text,
  p_state jsonb,
  p_source_refs jsonb,
  p_writer_type text,
  p_writer_id text,
  p_identity_id text,
  p_authority text,
  p_source_id text,
  p_source_revision text,
  p_idempotency_key text,
  p_ttl_seconds integer default 86400
) returns bigint
language plpgsql security definer set search_path=cns,public as $$
declare
  v_event bigint;
begin
  if p_ttl_seconds < 60 or p_ttl_seconds > 31536000 then
    raise exception 'CNS_ACTOR_STATE_TTL_OUT_OF_RANGE';
  end if;
  if nullif(btrim(p_state_scope),'') is null then
    raise exception 'CNS_ACTOR_STATE_SCOPE_REQUIRED';
  end if;
  if nullif(btrim(p_idempotency_key),'') is null then
    raise exception 'CNS_ACTOR_STATE_IDEMPOTENCY_KEY_REQUIRED';
  end if;
  if not exists(
    select 1
    from cns.workspace_actors wa
    join cns.workspaces w on w.workspace_id=wa.workspace_id
    join cns.actors a on a.actor_id=wa.actor_id
    where wa.workspace_id=p_workspace_id
      and wa.actor_id=p_actor_id
      and wa.state='ACTIVE'
      and w.state='ACTIVE'
      and a.state='ACTIVE'
  ) then
    raise exception 'CNS_ACTOR_NOT_ACTIVE_IN_WORKSPACE';
  end if;

  if p_writer_type='USER' then
    if p_identity_id is null
       or not cns.identity_has_workspace_permission(p_identity_id,p_workspace_id,'write') then
      raise exception 'CNS_WORKSPACE_WRITE_DENIED';
    end if;
  end if;

  v_event := cns.append_event(
    null,
    'ACTOR',
    p_actor_id,
    'ACTOR_STATE_COMMITTED',
    jsonb_build_object(
      'workspace_id',p_workspace_id,
      'state_scope',p_state_scope,
      'state',coalesce(p_state,'{}'::jsonb)
    ),
    coalesce(p_source_refs,'[]'::jsonb),
    p_writer_type,
    coalesce(p_writer_id,p_identity_id),
    p_authority,
    p_source_id,
    p_source_revision,
    p_idempotency_key
  );

  insert into cns.event_workspace_scope(event_id,workspace_id,actor_id)
  values(v_event,p_workspace_id,p_actor_id)
  on conflict(event_id) do nothing;

  insert into cns.actor_current_state(
    workspace_id,actor_id,state_scope,projection_version,state,source_refs,
    last_event_id,verified_at,stale_after,updated_at
  ) values (
    p_workspace_id,p_actor_id,p_state_scope,1,coalesce(p_state,'{}'::jsonb),
    coalesce(p_source_refs,'[]'::jsonb),v_event,now(),
    now()+make_interval(secs=>p_ttl_seconds),now()
  ) on conflict(workspace_id,actor_id,state_scope) do update set
    projection_version=cns.actor_current_state.projection_version+1,
    state=excluded.state,
    source_refs=excluded.source_refs,
    last_event_id=excluded.last_event_id,
    verified_at=excluded.verified_at,
    stale_after=excluded.stale_after,
    updated_at=excluded.updated_at;

  return v_event;
end;
$$;

-- ---------------------------------------------------------------------------
-- Integrity view for continuous brain-health / Gate 09.
-- ---------------------------------------------------------------------------
create or replace view cns.v_actor_kernel_violations
with (security_invoker=true) as
select
  'HUMAN_IDENTITY_NOT_PERSON_ACTOR'::text as rule_id,
  'P0'::text as severity,
  i.identity_id::text as object_id,
  jsonb_build_object('person_actor_id',i.person_actor_id,'actor_type',a.actor_type) as evidence
from cns.identities i
join cns.actors a on a.actor_id=i.person_actor_id
where i.identity_kind='HUMAN' and a.actor_type<>'PERSON'
union all
select
  'WORKSPACE_PRIMARY_ACTOR_NOT_PRIMARY_LINK'::text,
  'P0'::text,
  w.workspace_id::text,
  jsonb_build_object('primary_actor_id',w.primary_actor_id)
from cns.workspaces w
where w.primary_actor_id is not null
  and not exists(
    select 1 from cns.workspace_actors wa
    where wa.workspace_id=w.workspace_id
      and wa.actor_id=w.primary_actor_id
      and wa.actor_role='PRIMARY'
      and wa.state='ACTIVE'
  )
union all
select
  'CURRENT_STATE_WITHOUT_SCOPED_EVENT'::text,
  'P0'::text,
  concat(s.workspace_id,'/',s.actor_id,'/',s.state_scope),
  jsonb_build_object('last_event_id',s.last_event_id)
from cns.actor_current_state s
where not exists(
  select 1 from cns.event_workspace_scope ews
  where ews.event_id=s.last_event_id
    and ews.workspace_id=s.workspace_id
    and ews.actor_id=s.actor_id
);

alter table cns.event_workspace_scope enable row level security;
revoke all on table cns.event_workspace_scope from public,anon,authenticated;
grant select,insert on table cns.event_workspace_scope to service_role;
revoke all on cns.v_actor_kernel_violations from public,anon,authenticated;
grant select on cns.v_actor_kernel_violations to service_role;

revoke all on function cns.identity_has_workspace_permission(text,text,text) from public,anon,authenticated;
grant execute on function cns.identity_has_workspace_permission(text,text,text) to service_role;

-- Reassert existing helper/writeback privileges after CREATE OR REPLACE.
revoke all on function cns.identity_has_workspace_access(text,text) from public,anon,authenticated;
revoke all on function cns.commit_actor_state(text,text,text,jsonb,jsonb,text,text,text,text,text,text,text,integer) from public,anon,authenticated;
grant execute on function cns.identity_has_workspace_access(text,text) to service_role;
grant execute on function cns.commit_actor_state(text,text,text,jsonb,jsonb,text,text,text,text,text,text,text,integer) to service_role;

insert into cns.system_meta(key,value)
values(
  'superbrain_actor_workspace_hardening_v1',
  jsonb_build_object(
    'version','1.0.0',
    'status','ACTIVE_NOT_COMPLETE',
    'write_permission_required',true,
    'event_workspace_scope_indexed',true,
    'integrity_view','cns.v_actor_kernel_violations',
    'founder_decision_date','2026-09-16'
  )
)
on conflict(key) do update set value=excluded.value;

commit;
