\set ON_ERROR_STOP on

begin;

-- Supabase stores pgcrypto in `extensions`; clean-room certification must mimic it.
do $$
declare v_schema text; v_bad integer;
begin
  select n.nspname into v_schema
  from pg_extension e join pg_namespace n on n.oid=e.extnamespace
  where e.extname='pgcrypto';
  if v_schema is distinct from 'extensions' then
    raise exception 'TEST_FAIL_PGCRYPTO_NOT_IN_SUPABASE_EXTENSIONS_SCHEMA:%',v_schema;
  end if;

  select count(*) into v_bad
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='cns'
    and p.prokind='f'
    and p.proname in ('append_event','compile_project_context','doctor_scan','finish_evaluation','librarian_propose_memory','record_parity','stage_legacy_entity')
    and not coalesce(array_to_string(p.proconfig,','),'') like '%search_path=cns, extensions, pg_temp%';
  if v_bad<>0 then
    raise exception 'TEST_FAIL_CNS_CRYPTO_FUNCTION_SEARCH_PATH:%',v_bad;
  end if;
end $$;

insert into cns.source_registry(source_id,source_kind,name,authority,truth_domain,current_revision,state,last_verified_at)
values('runtime-parity-source','CONTROL','Runtime parity source','TEST','CONTROL','rev-1','ACTIVE',clock_timestamp());
insert into cns.source_revisions(source_id,revision,content_hash)
values('runtime-parity-source','rev-1','runtime-parity-hash');

select cns.stage_legacy_entity(
  'runtime-parity-source','rev-1','CONTROL_TEST','runtime-stage',
  '{"hello":"world"}'::jsonb
);

insert into cns.projects(project_id,slug,name,project_kind,lifecycle,authority,source_id,source_revision)
values('RUNTIME-PARITY','runtime-parity','Runtime parity','PROJECT','ACTIVE','TEST','runtime-parity-source','rev-1');

select cns.commit_project_state(
  'RUNTIME-PARITY',
  '{"projection_version":1,"state":"ACTIVE","why":"runtime parity","outcome":"prove pgcrypto path","primary_goal_ids":[],"blockers":[],"owner":"TEST","founder_burden":"NONE","health":"GREEN"}'::jsonb,
  'SYSTEM','runtime-parity-test','TEST','runtime-parity-source','rev-1',
  'runtime-parity-state-1',900,'[]'::jsonb
);

select cns.record_parity(
  'RUNTIME-PARITY','RUNTIME_PARITY',
  '{"x":1}'::jsonb,'{"x":1}'::jsonb,
  '{"test":"supabase runtime parity"}'::jsonb
);

do $$
declare v_context uuid;
begin
  v_context:=cns.compile_project_context('RUNTIME-PARITY','runtime-parity',0,10000,300);
  if v_context is null then raise exception 'TEST_FAIL_CONTEXT_NOT_COMPILED'; end if;
  if not exists(select 1 from cns.parity_results where project_id='RUNTIME-PARITY' and dimension='RUNTIME_PARITY' and result='MATCH') then
    raise exception 'TEST_FAIL_RECORD_PARITY_NOT_MATCH';
  end if;
  perform cns.doctor_scan();
end $$;

rollback;
