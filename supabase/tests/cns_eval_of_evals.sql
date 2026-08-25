\set ON_ERROR_STOP on
begin;

insert into cns.projects(project_id,slug,name,lifecycle,authority)
values('EVALMETA','evalmeta','Evaluator Meta Test','ACTIVE','TEST');

-- Empty eval must never PASS.
insert into cns.evaluation_runs(evaluation_run_id,project_id,state,summary)
values('33333333-3333-3333-3333-333333333331','EVALMETA','RUNNING','{}');
do $$ begin
  begin
    perform cns.finish_evaluation('33333333-3333-3333-3333-333333333331');
    raise exception 'CNS_EMPTY_EVAL_PASSED';
  exception when others then
    if sqlerrm='CNS_EMPTY_EVAL_PASSED' then raise; end if;
    if sqlerrm not like '%CNS_EVALUATION_EMPTY_ASSERTIONS_FORBIDDEN%' then raise; end if;
  end;
end $$;

-- Non-critical-only eval must never PASS as certification evidence.
insert into cns.evaluation_runs(evaluation_run_id,project_id,state,summary)
values('33333333-3333-3333-3333-333333333332','EVALMETA','RUNNING','{}');
insert into cns.evaluation_assertions(evaluation_run_id,assertion_key,critical,passed,evidence)
values('33333333-3333-3333-3333-333333333332','cosmetic-only',false,true,'{"note":"not enough"}');
do $$ begin
  begin
    perform cns.finish_evaluation('33333333-3333-3333-3333-333333333332');
    raise exception 'CNS_NONCRITICAL_ONLY_EVAL_PASSED';
  exception when others then
    if sqlerrm='CNS_NONCRITICAL_ONLY_EVAL_PASSED' then raise; end if;
    if sqlerrm not like '%CNS_EVALUATION_CRITICAL_ASSERTION_REQUIRED%' then raise; end if;
  end;
end $$;

-- A failed critical assertion produces FAIL.
insert into cns.evaluation_runs(evaluation_run_id,project_id,state,summary)
values('33333333-3333-3333-3333-333333333333','EVALMETA','RUNNING','{}');
insert into cns.evaluation_assertions(evaluation_run_id,assertion_key,critical,passed,evidence)
values('33333333-3333-3333-3333-333333333333','truth',true,false,'{"failure":"intentional"}');
do $$ begin
  if cns.finish_evaluation('33333333-3333-3333-3333-333333333333')<>'FAIL' then raise exception 'CNS_CRITICAL_FAIL_DID_NOT_FAIL_EVAL'; end if;
end $$;

-- Direct state mutation must be blocked even for service-like DB writers.
insert into cns.evaluation_runs(evaluation_run_id,project_id,state,summary)
values('33333333-3333-3333-3333-333333333334','EVALMETA','RUNNING','{}');
do $$ begin
  begin
    update cns.evaluation_runs set state='PASS' where evaluation_run_id='33333333-3333-3333-3333-333333333334';
    raise exception 'CNS_DIRECT_EVAL_PASS_NOT_BLOCKED';
  exception when others then
    if sqlerrm='CNS_DIRECT_EVAL_PASS_NOT_BLOCKED' then raise; end if;
    if sqlerrm not like '%CNS_EVALUATION_STATE_REQUIRES_FINISH_FUNCTION%' then raise; end if;
  end;
end $$;

-- Contract-enforced eval cannot omit required dimensions.
insert into cns.evaluation_contracts(evaluation_contract_id,name,purpose,required_assertion_keys,min_assertions,min_critical_assertions,require_exact_sha)
values('META-CONTRACT','Meta certification','Require truth, privacy and authority gates','["truth","privacy","authority"]',3,3,true);
update cns.system_meta
set value='{"version":1,"enabled":true,"verified":false,"state":"TEST_ENFORCED"}'::jsonb
where key='evaluation_enforcement';

insert into cns.evaluation_runs(evaluation_run_id,project_id,exact_sha,evaluation_contract_id,state,summary)
values('33333333-3333-3333-3333-333333333335','EVALMETA','deadbeef','META-CONTRACT','RUNNING','{}');
insert into cns.evaluation_assertions(evaluation_run_id,assertion_key,critical,passed,evidence)
values
('33333333-3333-3333-3333-333333333335','truth',true,true,'{"proof":1}'),
('33333333-3333-3333-3333-333333333335','privacy',true,true,'{"proof":1}'),
('33333333-3333-3333-3333-333333333335','filler',true,true,'{"proof":1}');
do $$ begin
  begin
    perform cns.finish_evaluation('33333333-3333-3333-3333-333333333335');
    raise exception 'CNS_CONTRACT_MISSING_REQUIRED_ASSERTION_PASSED';
  exception when others then
    if sqlerrm='CNS_CONTRACT_MISSING_REQUIRED_ASSERTION_PASSED' then raise; end if;
    if sqlerrm not like '%CNS_EVALUATION_REQUIRED_ASSERTIONS_MISSING:%' then raise; end if;
  end;
end $$;

-- Complete, explicit, critical coverage can PASS and gets a deterministic evidence hash.
insert into cns.evaluation_runs(evaluation_run_id,project_id,exact_sha,evaluation_contract_id,state,summary,evaluator_version)
values('33333333-3333-3333-3333-333333333336','EVALMETA','cafebabe','META-CONTRACT','RUNNING','{}','meta-v1');
insert into cns.evaluation_assertions(evaluation_run_id,assertion_key,critical,passed,evidence)
values
('33333333-3333-3333-3333-333333333336','truth',true,true,'{"proof":"truth"}'),
('33333333-3333-3333-3333-333333333336','privacy',true,true,'{"proof":"privacy"}'),
('33333333-3333-3333-3333-333333333336','authority',true,true,'{"proof":"authority"}');
do $$ begin
  if cns.finish_evaluation('33333333-3333-3333-3333-333333333336')<>'PASS' then raise exception 'CNS_COMPLETE_CONTRACT_EVAL_DID_NOT_PASS'; end if;
  if (select evidence_hash is null from cns.evaluation_runs where evaluation_run_id='33333333-3333-3333-3333-333333333336') then raise exception 'CNS_EVAL_EVIDENCE_HASH_MISSING'; end if;
end $$;

-- Meta-Doctor must have no evaluator integrity complaint about the valid PASS.
select cns.doctor_scan();
do $$ begin
  if exists(select 1 from cns.v_evaluator_integrity_violations where entity_id='33333333-3333-3333-3333-333333333336') then
    raise exception 'CNS_VALID_EVAL_FLAGGED_BY_META_AUDITOR';
  end if;
end $$;

rollback;
