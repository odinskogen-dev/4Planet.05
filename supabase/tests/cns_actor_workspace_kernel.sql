-- SUPERBRAIN ACTOR / WORKSPACE KERNEL 07 — acceptance + isolation test
\set ON_ERROR_STOP on

begin;

-- Schema presence.
do $$
begin
  if to_regclass('cns.actor_type_registry') is null then raise exception 'MISSING actor_type_registry'; end if;
  if to_regclass('cns.trust_domains') is null then raise exception 'MISSING trust_domains'; end if;
  if to_regclass('cns.actors') is null then raise exception 'MISSING actors'; end if;
  if to_regclass('cns.identities') is null then raise exception 'MISSING identities'; end if;
  if to_regclass('cns.workspaces') is null then raise exception 'MISSING workspaces'; end if;
  if to_regclass('cns.workspace_actors') is null then raise exception 'MISSING workspace_actors'; end if;
  if to_regclass('cns.workspace_memberships') is null then raise exception 'MISSING workspace_memberships'; end if;
  if to_regclass('cns.actor_current_state') is null then raise exception 'MISSING actor_current_state'; end if;
end $$;

-- Evergreen actor registry must include initial surfaces without making them schema enums.
do $$
begin
  if (select count(*) from cns.actor_type_registry where actor_type in ('PERSON','COMPANY','FOUNDATION','NONPROFIT','GOVERNMENT','RESEARCH_ORGANISATION','SPV')) <> 7 then
    raise exception 'ACTOR_TYPE_REGISTRY_INCOMPLETE';
  end if;
  if (select default_surface from cns.actor_type_registry where actor_type='PERSON') is distinct from '4SAPIEN' then
    raise exception 'PERSON_SURFACE_INVALID';
  end if;
  if (select default_surface from cns.actor_type_registry where actor_type='COMPANY') is distinct from '4BRANDS' then
    raise exception 'COMPANY_SURFACE_INVALID';
  end if;
end $$;

-- Create two real-shaped entities: one PERSON, one COMPANY.
insert into cns.entities(entity_id,entity_type,canonical_name,metadata)
values
  ('test:actor:person','PERSON','Test Person','{}'::jsonb),
  ('test:actor:company','COMPANY','Test Company','{}'::jsonb)
on conflict(entity_id) do nothing;

insert into cns.actors(actor_id,actor_type,home_trust_domain_id)
values
  ('test:actor:person','PERSON','ACTOR_PRIVATE'),
  ('test:actor:company','COMPANY','ACTOR_PRIVATE')
on conflict(actor_id) do nothing;

-- One 4PLANET identity can operate a personal twin and participate in a company twin.
insert into cns.identities(identity_id,identity_kind,auth_provider,auth_subject,person_actor_id)
values('test:identity:one','HUMAN','test','subject-1','test:actor:person')
on conflict(identity_id) do nothing;

insert into cns.workspaces(workspace_id,workspace_kind,name,primary_actor_id,trust_domain_id)
values
  ('test:workspace:person','PERSONAL','Test Personal Workspace','test:actor:person','ACTOR_PRIVATE'),
  ('test:workspace:company','ORGANISATION','Test Company Workspace','test:actor:company','ACTOR_PRIVATE')
on conflict(workspace_id) do nothing;

insert into cns.workspace_actors(workspace_id,actor_id,actor_role)
values
  ('test:workspace:person','test:actor:person','PRIMARY'),
  ('test:workspace:company','test:actor:company','PRIMARY')
on conflict(workspace_id,actor_id) do nothing;

insert into cns.workspace_memberships(workspace_id,identity_id,membership_role,permissions,state)
values
  ('test:workspace:person','test:identity:one','OWNER','{"read":true,"write":true}'::jsonb,'ACTIVE'),
  ('test:workspace:company','test:identity:one','OWNER','{"read":true,"write":true}'::jsonb,'ACTIVE')
on conflict(workspace_id,identity_id) do update set state='ACTIVE';

do $$
declare ctx jsonb;
begin
  ctx := cns.resolve_identity_context('test','subject-1');
  if ctx->>'person_actor_id' is distinct from 'test:actor:person' then
    raise exception 'IDENTITY_PERSON_ACTOR_RESOLUTION_FAILED';
  end if;
  if jsonb_array_length(ctx->'workspaces') <> 2 then
    raise exception 'IDENTITY_MULTI_WORKSPACE_RESOLUTION_FAILED: %',ctx;
  end if;
end $$;

-- Same writeback contract supports a Person Twin and a Company Twin.
select cns.commit_actor_state(
  'test:workspace:person','test:actor:person','FINANCE',
  '{"currency":"NOK","cash":1000}'::jsonb,'[]'::jsonb,
  'USER','test:identity:one','test:identity:one','USER_ASSERTED',
  null,null,'test:person:finance:1',86400
);

select cns.commit_actor_state(
  'test:workspace:company','test:actor:company','ECONOMIC_BASELINE',
  '{"currency":"NOK","revenue":100000}'::jsonb,'[]'::jsonb,
  'USER','test:identity:one','test:identity:one','USER_ASSERTED',
  null,null,'test:company:baseline:1',86400
);

do $$
begin
  if not exists(select 1 from cns.actor_current_state where workspace_id='test:workspace:person' and actor_id='test:actor:person' and state_scope='FINANCE') then
    raise exception 'PERSON_TWIN_STATE_WRITEBACK_FAILED';
  end if;
  if not exists(select 1 from cns.actor_current_state where workspace_id='test:workspace:company' and actor_id='test:actor:company' and state_scope='ECONOMIC_BASELINE') then
    raise exception 'COMPANY_TWIN_STATE_WRITEBACK_FAILED';
  end if;
  if (select count(*) from cns.events where entity_type='ACTOR' and entity_id in ('test:actor:person','test:actor:company') and event_type='ACTOR_STATE_COMMITTED') <> 2 then
    raise exception 'ACTOR_EVENT_LINEAGE_FAILED';
  end if;
end $$;

-- A second identity without company membership must fail closed.
insert into cns.identities(identity_id,identity_kind,auth_provider,auth_subject,person_actor_id)
values('test:identity:two','HUMAN','test','subject-2','test:actor:person')
on conflict(identity_id) do nothing;

do $$
begin
  begin
    perform cns.commit_actor_state(
      'test:workspace:company','test:actor:company','ECONOMIC_BASELINE',
      '{"revenue":999999}'::jsonb,'[]'::jsonb,
      'USER','test:identity:two','test:identity:two','USER_ASSERTED',
      null,null,'test:unauthorised:1',86400
    );
    raise exception 'FAIL_OPEN: unauthorised identity changed company state';
  exception
    when others then
      if sqlerrm not like '%CNS_WORKSPACE_ACCESS_DENIED%' then
        raise;
      end if;
  end;
end $$;

-- CNS remains private to browser roles; product access must use approved API/RPC boundary.
do $$
begin
  if has_table_privilege('anon','cns.actor_current_state','SELECT') then
    raise exception 'ANON_CNS_STATE_READ_PRIVILEGE';
  end if;
  if has_table_privilege('authenticated','cns.actor_current_state','SELECT') then
    raise exception 'AUTHENTICATED_CNS_STATE_READ_PRIVILEGE';
  end if;
end $$;

-- Control marker must explicitly remain NOT COMPLETE.
do $$
begin
  if coalesce((select value->>'status' from cns.system_meta where key='superbrain_actor_workspace_kernel_v1'),'MISSING') <> 'ACTIVE_NOT_COMPLETE' then
    raise exception 'ACTOR_KERNEL_CONTROL_MARKER_INVALID';
  end if;
end $$;

rollback;
