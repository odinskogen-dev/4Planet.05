-- SUPERBRAIN EVAL-OF-EVALS — 2026-08-26
-- A green evaluator is evidence only if the evaluator itself has coverage and cannot self-mark PASS by direct write.

begin;

create table if not exists cns.evaluation_contracts (
  evaluation_contract_id text primary key,
  name text not null,
  version integer not null default 1 check(version>0),
  purpose text not null,
  required_assertion_keys jsonb not null default '[]'::jsonb,
  min_assertions integer not null default 1 check(min_assertions>0),
  min_critical_assertions integer not null default 1 check(min_critical_assertions>0),
  require_exact_sha boolean not null default false,
  state text not null default 'ACTIVE' check(state in ('ACTIVE','SUPERSEDED','RETIRED')),
  created_at timestamptz not null default clock_timestamp()
);

alter table cns.evaluation_runs add column if not exists evaluation_contract_id text references cns.evaluation_contracts(evaluation_contract_id) on delete restrict;
alter table cns.evaluation_runs add column if not exists evaluator_version text;
alter table cns.evaluation_runs add column if not exists evidence_hash text;

create or replace function cns.evaluation_enforcement_enabled()
returns boolean language sql stable security definer set search_path=cns,public as $$
  select coalesce((select (value->>'enabled')::boolean from cns.system_meta where key='evaluation_enforcement'),false)
$$;

create or replace function cns.guard_evaluation_run_state()
returns trigger language plpgsql as $$
begin
  if old.state='RUNNING' and new.state in ('PASS','FAIL')
     and coalesce(current_setting('cns.evaluator_writer',true),'off')<>'on' then
    raise exception 'CNS_EVALUATION_STATE_REQUIRES_FINISH_FUNCTION';
  end if;
  if old.state in ('PASS','FAIL','ERROR') and new.state is distinct from old.state then
    raise exception 'CNS_EVALUATION_FINAL_STATE_IMMUTABLE';
  end if;
  return new;
end;
$$;
drop trigger if exists cns_evaluation_run_state_guard on cns.evaluation_runs;
create trigger cns_evaluation_run_state_guard before update on cns.evaluation_runs
for each row execute function cns.guard_evaluation_run_state();

create or replace function cns.finish_evaluation(p_run uuid)
returns text language plpgsql security definer set search_path=cns,public as $$
declare
  v_total integer; v_critical integer; v_failed integer; v_state text;
  v_contract cns.evaluation_contracts%rowtype;
  v_missing jsonb;
  v_run cns.evaluation_runs%rowtype;
begin
  select * into v_run from cns.evaluation_runs where evaluation_run_id=p_run;
  if not found then raise exception 'CNS_EVALUATION_RUN_NOT_FOUND'; end if;
  if v_run.state<>'RUNNING' then raise exception 'CNS_EVALUATION_RUN_NOT_RUNNING'; end if;

  select count(*),count(*) filter(where critical=true),count(*) filter(where critical=true and passed=false)
    into v_total,v_critical,v_failed
  from cns.evaluation_assertions where evaluation_run_id=p_run;

  if v_total=0 then raise exception 'CNS_EVALUATION_EMPTY_ASSERTIONS_FORBIDDEN'; end if;
  if v_critical=0 then raise exception 'CNS_EVALUATION_CRITICAL_ASSERTION_REQUIRED'; end if;

  if cns.evaluation_enforcement_enabled() then
    if v_run.evaluation_contract_id is null then raise exception 'CNS_EVALUATION_CONTRACT_REQUIRED'; end if;
    select * into v_contract from cns.evaluation_contracts where evaluation_contract_id=v_run.evaluation_contract_id and state='ACTIVE';
    if not found then raise exception 'CNS_ACTIVE_EVALUATION_CONTRACT_REQUIRED'; end if;
    if v_total<v_contract.min_assertions then raise exception 'CNS_EVALUATION_ASSERTION_COVERAGE_TOO_LOW'; end if;
    if v_critical<v_contract.min_critical_assertions then raise exception 'CNS_EVALUATION_CRITICAL_COVERAGE_TOO_LOW'; end if;
    if v_contract.require_exact_sha and nullif(btrim(v_run.exact_sha),'') is null then raise exception 'CNS_EVALUATION_EXACT_SHA_REQUIRED'; end if;
    select coalesce(jsonb_agg(req), '[]'::jsonb) into v_missing
    from jsonb_array_elements_text(v_contract.required_assertion_keys) req
    where not exists(select 1 from cns.evaluation_assertions a where a.evaluation_run_id=p_run and a.assertion_key=req);
    if jsonb_array_length(v_missing)>0 then raise exception 'CNS_EVALUATION_REQUIRED_ASSERTIONS_MISSING:%',v_missing::text; end if;
  end if;

  v_state:=case when v_failed=0 then 'PASS' else 'FAIL' end;
  perform set_config('cns.evaluator_writer','on',true);
  update cns.evaluation_runs
  set state=v_state,finished_at=clock_timestamp(),
      summary=jsonb_build_object('assertions_total',v_total,'critical_assertions',v_critical,'critical_failures',v_failed,'contract_id',v_run.evaluation_contract_id),
      evidence_hash=encode(digest((select coalesce(jsonb_agg(jsonb_build_object('key',assertion_key,'critical',critical,'passed',passed,'evidence',evidence) order by assertion_key),'[]'::jsonb)::text from cns.evaluation_assertions where evaluation_run_id=p_run),'sha256'),'hex')
  where evaluation_run_id=p_run;
  perform set_config('cns.evaluator_writer','off',true);
  return v_state;
exception when others then
  perform set_config('cns.evaluator_writer','off',true);
  raise;
end;
$$;

create or replace view cns.v_evaluator_integrity_violations with (security_invoker=true) as
select 'PASS_EVAL_WITHOUT_ASSERTIONS'::text rule_id,'P0'::text severity,'EVALUATION'::text entity_type,r.evaluation_run_id::text entity_id,r.project_id,
       'Evaluation is PASS but has no assertions'::text summary
from cns.evaluation_runs r where r.state='PASS' and not exists(select 1 from cns.evaluation_assertions a where a.evaluation_run_id=r.evaluation_run_id)
union all
select 'PASS_EVAL_WITHOUT_CRITICAL_ASSERTION','P0','EVALUATION',r.evaluation_run_id::text,r.project_id,'Evaluation is PASS but has no critical assertion'
from cns.evaluation_runs r where r.state='PASS' and not exists(select 1 from cns.evaluation_assertions a where a.evaluation_run_id=r.evaluation_run_id and a.critical=true)
union all
select 'PASS_EVAL_MISSING_EVIDENCE_HASH','P1','EVALUATION',r.evaluation_run_id::text,r.project_id,'Evaluation PASS has no deterministic assertion evidence hash'
from cns.evaluation_runs r where r.state='PASS' and r.evidence_hash is null
union all
select 'PASS_EVAL_WITHOUT_CONTRACT_WHEN_REQUIRED','P0','EVALUATION',r.evaluation_run_id::text,r.project_id,'Evaluation enforcement is enabled but PASS run has no contract'
from cns.evaluation_runs r where cns.evaluation_enforcement_enabled() and r.state='PASS' and r.evaluation_contract_id is null;

create or replace view cns.v_superbrain_violations_v3 with (security_invoker=true) as
select * from cns.v_superbrain_violations_v2
union all select * from cns.v_evaluator_integrity_violations;

create or replace function cns.doctor_scan()
returns integer language plpgsql security definer set search_path=cns,public as $$
declare v_count integer;
begin
  perform cns.expire_dead_leases();
  insert into cns.health_incidents(fingerprint,rule_id,severity,entity_type,entity_id,project_id,summary,evidence,state)
  select encode(digest(rule_id||'|'||entity_type||'|'||entity_id,'sha256'),'hex'),rule_id,severity,entity_type,entity_id,project_id,summary,'[]'::jsonb,'OPEN'
  from cns.v_superbrain_violations_v3
  on conflict(fingerprint) where state in ('OPEN','ACKNOWLEDGED') do update set last_seen_at=clock_timestamp(),summary=excluded.summary,severity=excluded.severity;
  get diagnostics v_count=row_count;
  update cns.health_incidents i set state='RESOLVED',resolved_at=clock_timestamp(),last_seen_at=clock_timestamp()
  where i.state in ('OPEN','ACKNOWLEDGED') and not exists(
    select 1 from cns.v_superbrain_violations_v3 v where encode(digest(v.rule_id||'|'||v.entity_type||'|'||v.entity_id,'sha256'),'hex')=i.fingerprint
  );
  return v_count;
end;
$$;

revoke all on cns.evaluation_contracts from public,anon,authenticated;
revoke all on function cns.evaluation_enforcement_enabled() from public,anon,authenticated;
revoke all on function cns.guard_evaluation_run_state() from public,anon,authenticated;
grant select,insert,update on cns.evaluation_contracts to service_role;
grant select on cns.v_evaluator_integrity_violations,cns.v_superbrain_violations_v3 to service_role;
grant execute on function cns.evaluation_enforcement_enabled() to service_role;

insert into cns.system_meta(key,value) values
('evaluation_enforcement','{"version":1,"enabled":false,"verified":false,"state":"SHADOW_CONFIG_REQUIRED"}'::jsonb)
on conflict(key) do update set value=excluded.value,updated_at=clock_timestamp();

update cns.system_meta
set value='{"version":10,"migration":"20260826006000_cns_evaluator_integrity","truth_model":"SUPERBRAIN_V4","context":"PROJECT_SCOPED_JIT","authority_routing":"V1_REPLAY_GUARDED","privacy_export":"V1","evaluator_integrity":"V1"}'::jsonb,
    updated_at=clock_timestamp()
where key='schema_version';

commit;
