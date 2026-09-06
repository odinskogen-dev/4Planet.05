-- Helper functions for deterministic mutation/readback certification.
-- This file is injected into the transactional eval script and therefore
-- exists only in pg_temp for the certification session.

create or replace function pg_temp.release_and_verify_scope()
returns boolean language plpgsql as $$
declare v_lease uuid;
begin
  select lease_id into v_lease
  from cns.leases
  where owner_agent_id='eval-traffic' and state='ACTIVE'
  order by acquired_at desc limit 1;
  if v_lease is null then return false; end if;
  if not cns.release_lease(v_lease) then return false; end if;
  return not exists(select 1 from cns.lease_scopes where lease_id=v_lease and active);
end; $$;

create or replace function pg_temp.create_self_dependency_and_verify()
returns boolean language plpgsql as $$
begin
  insert into cns.dependencies(dependency_id,project_id,task_id,depends_on_task_id,state)
  values('EVAL-SELF','EVAL-PROJECT','EVAL-T1','EVAL-T1','OPEN')
  on conflict(dependency_id) do update set state='OPEN';
  return exists(select 1 from cns.doctor_violations where rule_id='SELF_DEPENDENCY' and entity_id='EVAL-SELF');
end; $$;

create or replace function pg_temp.doctor_scan_and_verify_open()
returns boolean language plpgsql as $$
begin
  perform cns.doctor_scan();
  return exists(select 1 from cns.health_incidents where rule_id='SELF_DEPENDENCY' and entity_id='EVAL-SELF' and state='OPEN');
end; $$;

create or replace function pg_temp.heal_and_verify_resolved()
returns boolean language plpgsql as $$
begin
  update cns.dependencies set state='SATISFIED' where dependency_id='EVAL-SELF';
  perform cns.doctor_scan();
  return exists(select 1 from cns.health_incidents where rule_id='SELF_DEPENDENCY' and entity_id='EVAL-SELF' and state='RESOLVED');
end; $$;

create or replace function pg_temp.librarian_propose_and_verify()
returns boolean language plpgsql as $$
begin
  perform cns.librarian_propose_memory(
    'EVAL-MEM','EVAL-PROJECT','EPISODIC',2::smallint,'Learning',
    '{"x":1}'::jsonb,'TEST','eval-brain','rev-1'
  );
  return exists(select 1 from cns.memory_items where memory_id='EVAL-MEM' and state='CANDIDATE');
end; $$;

create or replace function pg_temp.correct_code_and_verify()
returns boolean language plpgsql as $$
begin
  perform cns.observe_code_head('EVAL-CL1',repeat('b',40),'github-correct','eval-code-correct');
  return exists(select 1 from cns.code_lines where code_line_id='EVAL-CL1' and exact_sha=observed_sha);
end; $$;

create or replace function pg_temp.stage_legacy_and_verify()
returns boolean language plpgsql as $$
begin
  perform cns.stage_legacy_entity('eval-brain','rev-1','PROJECT','EVAL-PROJECT','{"legacy":true}'::jsonb);
  return exists(select 1 from cns.legacy_import_queue where entity_key='EVAL-PROJECT' and length(raw_fingerprint)=64);
end; $$;
