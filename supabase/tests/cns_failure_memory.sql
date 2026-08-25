\set ON_ERROR_STOP on
begin;

insert into cns.projects(project_id,slug,name,lifecycle,authority)
values('FM-A','fm-a','Failure Memory Test','ACTIVE','TEST');

insert into cns.source_registry(source_id,source_kind,name,authority,truth_domain,current_revision,freshness_seconds,state,last_verified_at)
values('FM-SOURCE','PRIMARY_DATASET','Failure test source','TEST','FAILURE_TEST','rev-1',3600,'ACTIVE',clock_timestamp());
insert into cns.source_revisions(source_id,revision,persistent_id,retrieved_at,content_hash)
values('FM-SOURCE','rev-1','urn:test:fm:rev1',clock_timestamp(),'fmhash');

insert into cns.claims(claim_id,project_id,subject_type,subject_id,predicate,value,authority,confidence,state,claim_kind,knowledge_state,source_id,source_revision,revision)
values('FM-CLAIM','FM-A','PROJECT','FM-A','test.source.dependent','true'::jsonb,'TEST',0.9,'ACTIVE','SOURCE_FACT','KNOWN','FM-SOURCE','rev-1',1);

do $$ begin
  if cns.require_source_fresh('FM-SOURCE')<>'FRESH' then raise exception 'CNS_FRESH_SOURCE_NOT_ACCEPTED'; end if;
end $$;

-- Simulate a partial/degraded upstream source. A consumer requiring fresh truth must fail closed,
-- and downstream impact must be explicit rather than interpreted as zero/no-data.
update cns.source_registry set state='DEGRADED' where source_id='FM-SOURCE';

do $$ begin
  begin
    perform cns.require_source_fresh('FM-SOURCE');
    raise exception 'CNS_DEGRADED_SOURCE_WAS_ACCEPTED_AS_FRESH';
  exception when others then
    if sqlerrm='CNS_DEGRADED_SOURCE_WAS_ACCEPTED_AS_FRESH' then raise; end if;
    if sqlerrm not like '%CNS_SOURCE_NOT_FRESH:DEGRADED%' then raise; end if;
  end;
  if not exists(select 1 from cns.v_source_impact where source_id='FM-SOURCE' and dependent_type='CLAIM' and dependent_id='FM-CLAIM' and health_state='DEGRADED') then
    raise exception 'CNS_DOWNSTREAM_SOURCE_IMPACT_MISSING';
  end if;
end $$;

select cns.doctor_scan();
do $$ begin
  if not exists(select 1 from cns.health_incidents where rule_id='SOURCE_IMPACT_ACTIVE' and entity_id='FM-CLAIM' and state='OPEN') then
    raise exception 'CNS_DOCTOR_DID_NOT_PROPAGATE_SOURCE_IMPACT';
  end if;
end $$;

insert into cns.failure_records(failure_id,project_id,failure_class,title,observed_failure,expected_behavior)
values('FM-FAIL-1','FM-A','SOURCE_SEMANTICS','Partial upstream source could be mistaken for absence','{"actual":"partial"}','{"required":"fail closed, never zero"}');

-- A code change or assertion of fixed is not enough to close a failure.
do $$ begin
  begin
    update cns.failure_records set state='VERIFIED' where failure_id='FM-FAIL-1';
    raise exception 'CNS_FAILURE_CLOSED_WITHOUT_EVIDENCE';
  exception when others then
    if sqlerrm='CNS_FAILURE_CLOSED_WITHOUT_EVIDENCE' then raise; end if;
    if sqlerrm not like '%CNS_FAILURE_VERIFY_REQUIRES_%' then raise; end if;
  end;
end $$;

insert into cns.evaluation_runs(evaluation_run_id,project_id,state,summary)
values('22222222-2222-2222-2222-222222222222','FM-A','RUNNING','{}');
insert into cns.evaluation_assertions(evaluation_run_id,assertion_key,critical,passed,evidence)
values('22222222-2222-2222-2222-222222222222','source-partial-regression',true,true,'{"proof":"partial source failed closed"}');
select cns.finish_evaluation('22222222-2222-2222-2222-222222222222');

update cns.failure_records
set root_cause='{"cause":"source availability was not propagated to dependent outputs"}',
    why_not_caught_earlier='{"control_gap":"no explicit downstream source-impact gate"}',
    affected_scope='["source consumers","claims","compiled contexts"]',
    fix_refs='["cns.require_source_fresh","cns.v_source_impact"]',
    verification_refs='["runtime readback","cns_failure_memory.sql"]',
    regression_evaluation_run_id='22222222-2222-2222-2222-222222222222',
    prevention_rule_refs='["F04 SOURCE_DOWN_OR_PARTIAL"]',
    state='VERIFIED',
    fixed_at=clock_timestamp()
where failure_id='FM-FAIL-1';

do $$ begin
  if (select state from cns.failure_records where failure_id='FM-FAIL-1')<>'VERIFIED' then raise exception 'CNS_FAILURE_VERIFICATION_FAILED'; end if;
  if (select verified_at is null from cns.failure_records where failure_id='FM-FAIL-1') then raise exception 'CNS_FAILURE_VERIFIED_TIMESTAMP_MISSING'; end if;
end $$;

-- Recurrence reopens the learned failure and becomes P0 Doctor evidence.
select cns.record_failure_recurrence('FM-FAIL-1','{"recurrence":"synthetic"}'::jsonb,null);
select cns.doctor_scan();
do $$ begin
  if (select state from cns.failure_records where failure_id='FM-FAIL-1')<>'RECURRENT' then raise exception 'CNS_FAILURE_RECURRENCE_NOT_PERSISTED'; end if;
  if not exists(select 1 from cns.health_incidents where rule_id='RECURRENT_VERIFIED_FAILURE' and entity_id='FM-FAIL-1' and state='OPEN' and severity='P0') then
    raise exception 'CNS_FAILURE_RECURRENCE_NOT_ESCALATED';
  end if;
end $$;

rollback;
