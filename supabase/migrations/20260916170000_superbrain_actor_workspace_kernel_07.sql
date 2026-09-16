-- 4PLANET SUPERBRAIN — UNIVERSAL ACTOR / WORKSPACE KERNEL 07
-- Founder architecture decision 2026-09-16.
-- Extends the existing CNS. Does not create a parallel BRAIN or truth store.
-- 4PLANET ID -> workspace membership -> actor -> actor twin/state -> product surface.

begin;

-- ---------------------------------------------------------------------------
-- EXTENSIBLE ACTOR TYPES + TRUST DOMAINS
-- ---------------------------------------------------------------------------
create table if not exists cns.actor_type_registry (
  actor_type text primary key,
  default_surface text,
  description text not null,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','DEPRECATED','SUPERSEDED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into cns.actor_type_registry(actor_type,default_surface,description) values
  ('PERSON','4SAPIEN','Individual human actor / Person Twin'),
  ('COMPANY','4BRANDS','Commercial company actor / Company Twin'),
  ('FOUNDATION','4NGO','Foundation actor'),
  ('NONPROFIT','4NGO','Non-profit / NGO actor'),
  ('GOVERNMENT','4GOV','Government or public-sector actor'),
  ('RESEARCH_ORGANISATION',null,'Research organisation actor'),
  ('SPV','4BRANDS','Special purpose vehicle actor')
on conflict(actor_type) do update set
  default_surface=excluded.default_surface,
  description=excluded.description,
  updated_at=now();

create table if not exists cns.trust_domains (
  trust_domain_id text primary key,
  classification text not null check (classification in ('PRIVATE','INTERNAL','SHARED','PUBLIC')),
  description text not null,
  allows_cross_actor_learning boolean not null default false,
  requires_explicit_promotion boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into cns.trust_domains(trust_domain_id,classification,description,allows_cross_actor_learning,requires_explicit_promotion) values
  ('ODIN_PRIVATE','PRIVATE','Founder-private actor and knowledge domain',false,true),
  ('4PLANET_INTERNAL','INTERNAL','Internal 4PLANET programme and organisation domain',false,true),
  ('ACTOR_PRIVATE','PRIVATE','Default private tenant/workspace domain',false,true),
  ('PLANET_SHARED','SHARED','Curated shared PlanetBrain knowledge domain',true,true),
  ('PUBLIC','PUBLIC','Explicitly released public projection domain',true,true)
on conflict(trust_domain_id) do update set
  classification=excluded.classification,
  description=excluded.description,
  allows_cross_actor_learning=excluded.allows_cross_actor_learning,
  requires_explicit_promotion=excluded.requires_explicit_promotion,
  updated_at=now();

-- ---------------------------------------------------------------------------
-- ACTORS ARE SPECIALISED CNS ENTITIES, NOT A SECOND IDENTITY GRAPH
-- ---------------------------------------------------------------------------
create table if not exists cns.actors (
  actor_id text primary key references cns.entities(entity_id) on delete restrict,
  actor_type text not null references cns.actor_type_registry(actor_type) on delete restrict,
  home_trust_domain_id text not null references cns.trust_domains(trust_domain_id) on delete restrict,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','SUSPENDED','SUPERSEDED','ARCHIVED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cns_actors_type_state_idx on cns.actors(actor_type,state);
create index if not exists cns_actors_domain_idx on cns.actors(home_trust_domain_id,state);

-- ---------------------------------------------------------------------------
-- 4PLANET ID: AUTH IDENTITY ROOT. AUTH SUBJECT IS PROVIDER-OPAQUE.
-- A human identity may point at the same PERSON actor used by 4SAPIEN.
-- ---------------------------------------------------------------------------
create table if not exists cns.identities (
  identity_id text primary key,
  identity_kind text not null default 'HUMAN' check (identity_kind in ('HUMAN','SERVICE')),
  auth_provider text not null,
  auth_subject text not null,
  person_actor_id text references cns.actors(actor_id) on delete restrict,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','SUSPENDED','REVOKED','ARCHIVED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(auth_provider,auth_subject),
  check (identity_kind <> 'HUMAN' or person_actor_id is not null)
);

create index if not exists cns_identities_person_actor_idx on cns.identities(person_actor_id) where state='ACTIVE';

-- ---------------------------------------------------------------------------
-- WORKSPACES ARE SECURITY / TENANCY BOUNDARIES.
-- They are not new brains. They scope actor-private state inside one CNS.
-- ---------------------------------------------------------------------------
create table if not exists cns.workspaces (
  workspace_id text primary key,
  workspace_kind text not null check (workspace_kind in ('PERSONAL','ORGANISATION','SHARED','SYSTEM')),
  name text not null,
  primary_actor_id text references cns.actors(actor_id) on delete restrict,
  trust_domain_id text not null references cns.trust_domains(trust_domain_id) on delete restrict,
  state text not null default 'ACTIVE' check (state in ('ACTIVE','SUSPENDED','ARCHIVED','SUPERSEDED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (workspace_kind='SYSTEM' or primary_actor_id is not null)
);

create table if not exists cns.workspace_actors (
  workspace_id text not null references cns.workspaces(workspace_id) on delete restrict,
  actor_id text not null references cns.actors(actor_id) on delete restrict,
  actor_role text not null default 'LINKED',
  state text not null default 'ACTIVE' check (state in ('ACTIVE','REVOKED','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(workspace_id,actor_id)
);

create unique index if not exists cns_workspace_one_primary_actor_idx
  on cns.workspace_actors(workspace_id)
  where actor_role='PRIMARY' and state='ACTIVE';

create table if not exists cns.workspace_memberships (
  workspace_id text not null references cns.workspaces(workspace_id) on delete restrict,
  identity_id text not null references cns.identities(identity_id) on delete restrict,
  membership_role text not null,
  permissions jsonb not null default '{}'::jsonb,
  state text not null default 'ACTIVE' check (state in ('INVITED','ACTIVE','SUSPENDED','REVOKED','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(workspace_id,identity_id)
);

create index if not exists cns_workspace_memberships_identity_idx
  on cns.workspace_memberships(identity_id,state,workspace_id);

-- ---------------------------------------------------------------------------
-- EVENT ACTOR TYPE: PRODUCT USER IS FIRST-CLASS, NOT MISLABELLED EXTERNAL.
-- ---------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid='cns.events'::regclass
      and contype='c'
      and pg_get_constraintdef(oid) ilike '%actor_type%'
  loop
    execute format('alter table cns.events drop constraint %I',r.conname);
  end loop;
end $$;

alter table cns.events
  add constraint cns_events_actor_type_check
  check (actor_type in ('FOUNDER','AXE','AGENT','SYSTEM','EXTERNAL','USER'));

-- ---------------------------------------------------------------------------
-- ACTOR CURRENT STATE IS A VERIFIED PROJECTION OVER THE EXISTING EVENT LEDGER.
-- state_scope is intentionally extensible: CORE, FINANCE, FOOD, COMPANY_BASELINE, etc.
-- ---------------------------------------------------------------------------
create table if not exists cns.actor_current_state (
  workspace_id text not null,
  actor_id text not null,
  state_scope text not null,
  projection_version integer not null default 1 check (projection_version > 0),
  state jsonb not null default '{}'::jsonb,
  source_refs jsonb not null default '[]'::jsonb,
  last_event_id bigint not null references cns.events(event_id) on delete restrict,
  verified_at timestamptz not null,
  stale_after timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key(workspace_id,actor_id,state_scope),
  foreign key(workspace_id,actor_id) references cns.workspace_actors(workspace_id,actor_id) on delete restrict,
  check (nullif(btrim(state_scope),'') is not null),
  check (stale_after > verified_at)
);

create index if not exists cns_actor_current_state_actor_idx
  on cns.actor_current_state(actor_id,state_scope,updated_at desc);

create or replace function cns.identity_has_workspace_access(
  p_identity_id text,
  p_workspace_id text
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
  );
$$;

create or replace function cns.resolve_identity_context(
  p_auth_provider text,
  p_auth_subject text
) returns jsonb
language plpgsql stable security definer set search_path=cns,public as $$
declare
  v_identity cns.identities%rowtype;
  v_workspaces jsonb;
begin
  select * into v_identity
  from cns.identities
  where auth_provider=p_auth_provider and auth_subject=p_auth_subject and state='ACTIVE';

  if not found then
    raise exception 'CNS_IDENTITY_NOT_FOUND_OR_INACTIVE';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
      'workspace_id',w.workspace_id,
      'workspace_kind',w.workspace_kind,
      'primary_actor_id',w.primary_actor_id,
      'trust_domain_id',w.trust_domain_id,
      'membership_role',m.membership_role,
      'permissions',m.permissions
    ) order by w.workspace_id),'[]'::jsonb)
  into v_workspaces
  from cns.workspace_memberships m
  join cns.workspaces w on w.workspace_id=m.workspace_id
  where m.identity_id=v_identity.identity_id
    and m.state='ACTIVE'
    and w.state='ACTIVE';

  return jsonb_build_object(
    'identity_id',v_identity.identity_id,
    'identity_kind',v_identity.identity_kind,
    'person_actor_id',v_identity.person_actor_id,
    'workspaces',v_workspaces
  );
end;
$$;

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
  if not exists(
    select 1 from cns.workspace_actors wa
    join cns.workspaces w on w.workspace_id=wa.workspace_id
    join cns.actors a on a.actor_id=wa.actor_id
    where wa.workspace_id=p_workspace_id and wa.actor_id=p_actor_id
      and wa.state='ACTIVE' and w.state='ACTIVE' and a.state='ACTIVE'
  ) then
    raise exception 'CNS_ACTOR_NOT_ACTIVE_IN_WORKSPACE';
  end if;
  if p_writer_type='USER' then
    if p_identity_id is null or not cns.identity_has_workspace_access(p_identity_id,p_workspace_id) then
      raise exception 'CNS_WORKSPACE_ACCESS_DENIED';
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

  perform cns.invalidate_context_for_project(p.project_id,'ACTOR_STATE_CHANGED')
  from cns.projects p
  where false;

  return v_event;
end;
$$;

-- ---------------------------------------------------------------------------
-- PRIVATE-BY-DEFAULT CNS. PRODUCT CLIENTS MUST ENTER VIA APPROVED API/RPC.
-- ---------------------------------------------------------------------------
alter table cns.actor_type_registry enable row level security;
alter table cns.trust_domains enable row level security;
alter table cns.actors enable row level security;
alter table cns.identities enable row level security;
alter table cns.workspaces enable row level security;
alter table cns.workspace_actors enable row level security;
alter table cns.workspace_memberships enable row level security;
alter table cns.actor_current_state enable row level security;

revoke all on table
  cns.actor_type_registry,
  cns.trust_domains,
  cns.actors,
  cns.identities,
  cns.workspaces,
  cns.workspace_actors,
  cns.workspace_memberships,
  cns.actor_current_state
from public, anon, authenticated;

grant select,insert,update,delete on table
  cns.actor_type_registry,
  cns.trust_domains,
  cns.actors,
  cns.identities,
  cns.workspaces,
  cns.workspace_actors,
  cns.workspace_memberships,
  cns.actor_current_state
to service_role;

revoke all on function cns.identity_has_workspace_access(text,text) from public,anon,authenticated;
revoke all on function cns.resolve_identity_context(text,text) from public,anon,authenticated;
revoke all on function cns.commit_actor_state(text,text,text,jsonb,jsonb,text,text,text,text,text,text,text,integer) from public,anon,authenticated;

grant execute on function cns.identity_has_workspace_access(text,text) to service_role;
grant execute on function cns.resolve_identity_context(text,text) to service_role;
grant execute on function cns.commit_actor_state(text,text,text,jsonb,jsonb,text,text,text,text,text,text,text,integer) to service_role;

-- Machine-readable control marker. Architecture is ACTIVE, not complete/cut over.
insert into cns.system_meta(key,value)
values(
  'superbrain_actor_workspace_kernel_v1',
  jsonb_build_object(
    'version','1.0.0',
    'status','ACTIVE_NOT_COMPLETE',
    'one_superbrain',true,
    'one_actor_kernel',true,
    'fourplanet_id_chain',jsonb_build_array('IDENTITY','WORKSPACE_MEMBERSHIP','ACTOR','ACTOR_TWIN','MODULE_OR_SURFACE'),
    'parallel_truth_stores_forbidden',true,
    'drive_migration_state','CENSUS_IN_PROGRESS',
    'founder_decision_date','2026-09-16'
  )
)
on conflict(key) do update set value=excluded.value;

commit;
