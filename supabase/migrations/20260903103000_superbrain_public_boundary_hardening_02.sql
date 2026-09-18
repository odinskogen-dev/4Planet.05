-- 4PLANET SUPERBRAIN — PUBLIC BOUNDARY HARDENING 02
-- Replace owner-privileged public view with a one-way sanitized public cache.
-- Public products have no path back into cns schema.

begin;

drop view if exists public.superbrain_public_v1;

create table if not exists public.superbrain_public_v1 (
  projection_id text primary key,
  object_type text not null,
  object_id text not null,
  object_revision integer not null check (object_revision > 0),
  payload jsonb not null,
  source_refs jsonb not null default '[]'::jsonb,
  nature_sensitivity_state text not null,
  verified_at timestamptz not null,
  expires_at timestamptz,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','WITHDRAWN','EXPIRED')),
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or expires_at > verified_at)
);

alter table public.superbrain_public_v1 enable row level security;
revoke all on public.superbrain_public_v1 from public, anon, authenticated;
grant select on public.superbrain_public_v1 to anon, authenticated, service_role;
grant insert,update,delete on public.superbrain_public_v1 to service_role;

drop policy if exists superbrain_public_read on public.superbrain_public_v1;
create policy superbrain_public_read
on public.superbrain_public_v1
for select
to anon, authenticated
using (
  state='ACTIVE'
  and verified_at is not null
  and (expires_at is null or expires_at > now())
);

create or replace function cns.activate_public_projection(p_projection_id text)
returns boolean
language plpgsql
security definer
set search_path=cns,public,pg_temp
as $$
declare p cns.public_projections%rowtype;
begin
  select * into p from cns.public_projections where projection_id=p_projection_id for update;
  if not found then raise exception 'CNS_PUBLIC_PROJECTION_NOT_FOUND'; end if;
  if cns.object_visibility(p.object_type,p.object_id) <> 'PUBLIC_VERIFIED'::cns.visibility_state then
    raise exception 'CNS_CANONICAL_OBJECT_NOT_PUBLIC_VERIFIED';
  end if;
  if p.rights_state <> 'ALLOW'::cns.rights_state or not p.truth_checked or not p.evidence_checked
     or not p.rights_checked or not p.sensitivity_checked or p.verified_by is null
     or p.verification_authority is null or p.verified_at is null then
    raise exception 'CNS_PUBLIC_PROJECTION_GATES_INCOMPLETE';
  end if;

  update cns.public_projections
  set state='ACTIVE',updated_at=now()
  where projection_id=p_projection_id;

  insert into public.superbrain_public_v1(
    projection_id,object_type,object_id,object_revision,payload,source_refs,
    nature_sensitivity_state,verified_at,expires_at,state,published_at,updated_at
  ) values(
    p.projection_id,p.object_type,p.object_id,p.object_revision,p.payload,p.source_refs,
    p.nature_sensitivity_state::text,p.verified_at,p.expires_at,'ACTIVE',now(),now()
  )
  on conflict(projection_id) do update set
    object_type=excluded.object_type,
    object_id=excluded.object_id,
    object_revision=excluded.object_revision,
    payload=excluded.payload,
    source_refs=excluded.source_refs,
    nature_sensitivity_state=excluded.nature_sensitivity_state,
    verified_at=excluded.verified_at,
    expires_at=excluded.expires_at,
    state='ACTIVE',
    updated_at=now();

  return true;
end;
$$;

create or replace function cns.withdraw_public_projection(p_projection_id text,p_reason text default null)
returns boolean
language plpgsql
security definer
set search_path=cns,public,pg_temp
as $$
begin
  update cns.public_projections
  set state='WITHDRAWN',
      updated_at=now()
  where projection_id=p_projection_id and state in ('CANDIDATE','ACTIVE');

  update public.superbrain_public_v1
  set state='WITHDRAWN',updated_at=now()
  where projection_id=p_projection_id and state='ACTIVE';

  return found;
end;
$$;

revoke all on function cns.activate_public_projection(text) from public,anon,authenticated;
revoke all on function cns.withdraw_public_projection(text,text) from public,anon,authenticated;
grant execute on function cns.activate_public_projection(text) to service_role;
grant execute on function cns.withdraw_public_projection(text,text) to service_role;

-- Harden mutable search_path on key trigger functions flagged by the remote security advisor.
alter function cns.reject_event_mutation() set search_path=cns,public,pg_temp;
alter function cns.reject_source_record_mutation() set search_path=cns,public,pg_temp;

insert into cns.system_meta(key,value,updated_at)
values(
  'public_boundary',
  jsonb_build_object(
    'version',2,
    'mode','ONE_WAY_SANITIZED_CACHE',
    'public_relation','public.superbrain_public_v1',
    'direct_cns_public_access',false,
    'brain_cutover',false
  ),
  now()
)
on conflict(key) do update set value=excluded.value,updated_at=excluded.updated_at;

commit;
