-- 4PLANET SUPERBRAIN — SUPABASE PGCRYPTO RUNTIME PATH 06
-- Remote staging stores pgcrypto in schema `extensions`, while the clean-room
-- certification image resolved pgcrypto on its default path. Seven existing
-- CNS functions call digest() and therefore failed at runtime on staging.
--
-- Harden all affected functions to a fixed, non-user-controlled search path
-- that includes the trusted Supabase extension schema.

begin;

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as fn
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='cns'
      and p.prokind='f'
      and p.proname in (
        'append_event',
        'compile_project_context',
        'doctor_scan',
        'finish_evaluation',
        'librarian_propose_memory',
        'record_parity',
        'stage_legacy_entity'
      )
  loop
    execute format('alter function %s set search_path = cns, extensions, pg_temp',r.fn);
  end loop;
end $$;

insert into cns.system_meta(key,value)
values(
  'pgcrypto_runtime_path',
  '{"version":1,"verified":false,"state":"PENDING_CERTIFICATION","required_schema":"extensions","affected_functions":7}'::jsonb
)
on conflict(key) do update
set value=excluded.value,updated_at=clock_timestamp();

commit;
