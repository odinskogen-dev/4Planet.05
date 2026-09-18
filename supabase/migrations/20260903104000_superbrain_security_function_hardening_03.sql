-- 4PLANET SUPERBRAIN — SECURITY FUNCTION HARDENING 03
-- Fix mutable search_path warnings on existing CNS trigger functions.

begin;

alter function cns.guard_projection_write() set search_path=cns,public,pg_temp;
alter function cns.enforce_agent_scope() set search_path=cns,public,pg_temp;
alter function cns.guard_prototype_identity() set search_path=cns,public,pg_temp;
alter function cns.guard_immutable_artifact() set search_path=cns,public,pg_temp;
alter function cns.guard_strict_immutable() set search_path=cns,public,pg_temp;
alter function cns.guard_truth_core_update() set search_path=cns,public,pg_temp;
alter function cns.guard_memory_integrity() set search_path=cns,public,pg_temp;
alter function cns.guard_failure_closure() set search_path=cns,public,pg_temp;
alter function cns.guard_authority_sensitive_event_insert() set search_path=cns,public,pg_temp;
alter function cns.guard_evaluation_run_state() set search_path=cns,public,pg_temp;

insert into cns.system_meta(key,value,updated_at)
values('security_function_hardening',jsonb_build_object('version',1,'mutable_search_path_fixed',10,'brain_cutover',false),now())
on conflict(key) do update set value=excluded.value,updated_at=excluded.updated_at;

commit;
