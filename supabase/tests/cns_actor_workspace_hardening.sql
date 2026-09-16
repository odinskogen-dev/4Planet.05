-- SUPERBRAIN ACTOR / WORKSPACE HARDENING 08 — red-team acceptance
\set ON_ERROR_STOP on

begin;

insert into cns.entities(entity_id,entity_type,canonical_name,metadata)
values
  ('test:harden:person','PERSON','Hardening Person','{}'::jsonb),
  ('test:harden:company','COMPANY','Hardening Company','{}'::jsonb)
on conflict(entity_id) do nothing;

insert into cns.actors(actor_id,actor_type,home_trust_domain_id)
values
  ('test:harden:person','PERSON','ACTOR_PRIVATE'),
  ('test:harden:company','COMPANY','ACTOR_PRIVATE')
on conflict(actor_id) do nothing;

insert into cns.identities(identity_id,identity_kind,auth_provider,auth_subject,person_actor_id)
values
  ('test:harden:writer','HUMAN','test','harden-writer','test:harden:person'),
  ('test:harden:reader','HUMAN','test','harden-reader','test:harden:person')
on conflict(identity_id) do nothing;

insert into cns.workspaces(workspace_id,workspace_kind,name,primary_actor_id,trust_domain_id)
values('test:harden:company-ws','ORGANISATION','Hardening Company Workspace','test:harden:company','ACTOR_PRIVATE')
on conflict(workspace_id) do nothing;

insert into cns.workspace_actors(workspace_id,actor_id,actor_role)
values('test:harden:company-ws','test:harden:company','PRIMARY')
on conflict(workspace_id,actor_id) do update set actor_role='PRIMARY',state='ACTIVE';

insert into cns.workspace_memberships(workspace_id,identity_id,membership_role,permissions,state)
values
  ('test:harden:company-ws','test:harden:writer','OPERATOR','{"read":true,"write":true}'::jsonb,'ACTIVE'),
  ('test:harden:company-ws','test:harden:reader','VIEWER','{"read":true,"write":false}'::jsonb,'ACTIVE')
on conflict(workspace_id,identity_id) do update set
  membership_role=excluded.membership_role,
  permissions=excluded.permissions,
  state='ACTIVE';

do $$
begin
  if not cns.identity_has_workspace_permission('test:harden:writer','test:harden:company-ws','write') then
    raise exception 'WRITER_PERMISSION_NOT_RESOLVED';
  end if;
  if cns.identity_has_workspace_permission('test:harden:reader','test:harden:company-ws','write') then
    raise exception 'READ_ONLY_MEMBERSHIP_ESCALATED_TO_WRITE';
  end if;
end $$;

-- Read-only member must fail closed on durable state write.
do $$
begin
  begin
    perform cns.commit_actor_state(
      'test:harden:company-ws','test:harden:company','FINANCE',
      '{"cash":999999}'::jsonb,'[]'::jsonb,
      'USER','test:harden:reader','test:harden:reader','USER_ASSERTED',
      null,null,'test:harden:reader-denied',86400
    );
    raise exception 'FAIL_OPEN: read-only identity wrote actor state';
  exception
    when others then
      if sqlerrm not like '%CNS_WORKSPACE_WRITE_DENIED%' then
        raise;
      end if;
  end;
end $$;

-- Writer succeeds, and the one CNS event gets an indexed workspace/actor scope edge.
select cns.commit_actor_state(
  'test:harden:company-ws','test:harden:company','FINANCE',
  '{"currency":"NOK","cash":1234}'::jsonb,'[]'::jsonb,
  'USER','test:harden:writer','test:harden:writer','USER_ASSERTED',
  null,null,'test:harden:writer-ok',86400
);

do $$
declare v_event bigint;
begin
  select last_event_id into v_event
  from cns.actor_current_state
  where workspace_id='test:harden:company-ws'
    and actor_id='test:harden:company'
    and state_scope='FINANCE';

  if v_event is null then raise exception 'ACTOR_CURRENT_STATE_MISSING'; end if;

  if not exists(
    select 1 from cns.event_workspace_scope
    where event_id=v_event
      and workspace_id='test:harden:company-ws'
      and actor_id='test:harden:company'
  ) then
    raise exception 'EVENT_WORKSPACE_SCOPE_MISSING';
  end if;
end $$;

-- Healthy seeded objects should create no actor-kernel violations.
do $$
begin
  if exists(
    select 1 from cns.v_actor_kernel_violations
    where object_id like 'test:harden:%'
  ) then
    raise exception 'ACTOR_KERNEL_INTEGRITY_VIOLATION: %',
      (select jsonb_agg(to_jsonb(v)) from cns.v_actor_kernel_violations v where object_id like 'test:harden:%');
  end if;
end $$;

-- Browser roles remain unable to inspect the scoped event edge directly.
do $$
begin
  if has_table_privilege('anon','cns.event_workspace_scope','SELECT') then
    raise exception 'ANON_EVENT_SCOPE_READ_PRIVILEGE';
  end if;
  if has_table_privilege('authenticated','cns.event_workspace_scope','SELECT') then
    raise exception 'AUTH_EVENT_SCOPE_READ_PRIVILEGE';
  end if;
end $$;

rollback;
