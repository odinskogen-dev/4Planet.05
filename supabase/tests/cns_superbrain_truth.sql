\set ON_ERROR_STOP on
begin;

insert into cns.projects(project_id,slug,name,lifecycle,authority)
values('SB-TEST','sb-test','SUPERBRAIN Truth Test','ACTIVE','TEST');

insert into cns.source_registry(source_id,source_kind,name,uri,authority,truth_domain,current_revision,state,last_verified_at)
values('SB-SOURCE','PRIMARY_DATASET','SUPERBRAIN test source','https://example.invalid/source','PRIMARY','TEST','rev-1','ACTIVE',now());
insert into cns.source_revisions(source_id,revision,persistent_id,retrieval_uri,retrieved_at,content_hash,licence,rights,scope)
values('SB-SOURCE','rev-1','urn:4planet:test:sb-source:rev-1','https://example.invalid/source/rev-1',now(),'abc123','TEST-LICENCE','TEST-RIGHTS','{"time":"2026","geography":"TEST"}'::jsonb);

insert into cns.entities(entity_id,entity_type,canonical_name,source_id,source_revision)
values
('SB-E1','COMPANY','Entity One','SB-SOURCE','rev-1'),
('SB-E2','COMPANY','Entity Two','SB-SOURCE','rev-1');
insert into cns.entity_aliases(entity_id,namespace,alias,source_id,source_revision)
values
('SB-E1','ORG','Same Alias','SB-SOURCE','rev-1'),
('SB-E2','ORG','  SAME   alias ','SB-SOURCE','rev-1');

do $$ begin
  if not exists(select 1 from cns.v_entity_alias_collisions where namespace='ORG' and normalised_alias='same alias' and entity_count=2) then
    raise exception 'SUPERBRAIN_ALIAS_COLLISION_NOT_DETECTED';
  end if;
end $$;

insert into cns.methodologies(methodology_id,name,version,description,assumptions,validity_domain,limitations,source_id,source_revision,content_hash)
values('SB-METHOD','Bounded test method','1.0','Method used only for certification','["assumption"]','{"domain":"TEST"}','["not real-world evidence"]','SB-SOURCE','rev-1','methodhash');

insert into cns.evidence(evidence_id,project_id,evidence_type,source_id,source_revision,uri,content_hash,excerpt,verified_at,state)
values('SB-EV1','SB-TEST','SOURCE_RECORD','SB-SOURCE','rev-1','https://example.invalid/evidence','evhash','test evidence',now(),'ACTIVE');

insert into cns.claims(claim_id,project_id,subject_type,subject_id,predicate,value,authority,confidence,state,claim_kind,knowledge_state,source_id,source_revision,claimant_entity_id,valid_time_start,valid_time_end,observed_at,geography,unit,scope)
values('SB-C-SOURCE','SB-TEST','ENTITY','SB-E1','test.metric','42'::jsonb,'SOURCE',0.9000,'ACTIVE','SOURCE_FACT','KNOWN','SB-SOURCE','rev-1','SB-E1',now()-interval '1 day',now()+interval '1 day',now(),' {"place":"TEST"} ','kg','{"population":"test"}');

insert into cns.claims(claim_id,project_id,subject_type,subject_id,predicate,value,authority,confidence,state,claim_kind,knowledge_state,methodology_id,source_id,source_revision)
values('SB-C-INFER','SB-TEST','ENTITY','SB-E1','test.inference','{"result":"bounded"}'::jsonb,'4PLANET',0.6000,'ACTIVE','INFERENCE','KNOWN','SB-METHOD','SB-SOURCE','rev-1');

insert into cns.claim_evidence(claim_id,evidence_id,relation)
values
('SB-C-SOURCE','SB-EV1','SUPPORTS'),
('SB-C-INFER','SB-EV1','DOES_NOT_ESTABLISH');

do $$ begin
  if (select jsonb_array_length(evidence_links) from cns.v_claim_truth_trace where claim_id='SB-C-INFER') <> 1 then
    raise exception 'SUPERBRAIN_TRUTH_TRACE_EVIDENCE_MISSING';
  end if;
  if (select methodology->>'version' from cns.v_claim_truth_trace where claim_id='SB-C-INFER') <> '1.0' then
    raise exception 'SUPERBRAIN_TRUTH_TRACE_METHOD_MISSING';
  end if;
end $$;

-- UNKNOWN is explicit and does not become negative evidence.
insert into cns.claims(claim_id,project_id,subject_type,subject_id,predicate,value,authority,state,claim_kind,knowledge_state,scope)
values('SB-C-UNKNOWN','SB-TEST','ENTITY','SB-E1','test.unknown','{"state":"UNKNOWN"}'::jsonb,'4PLANET','ACTIVE','UNKNOWN','UNKNOWN','{"reason":"insufficient data"}');

do $$ begin
  if (select knowledge_state from cns.claims where claim_id='SB-C-UNKNOWN') <> 'UNKNOWN' then
    raise exception 'SUPERBRAIN_UNKNOWN_NOT_FIRST_CLASS';
  end if;
end $$;

-- Deliberately invalid truth rows must remain visible to Doctor, never silently repaired.
insert into cns.claims(claim_id,project_id,subject_type,subject_id,predicate,value,authority,state,claim_kind,knowledge_state)
values
('SB-C-BAD-SOURCE','SB-TEST','ENTITY','SB-E1','bad.source','true'::jsonb,'TEST','ACTIVE','SOURCE_CLAIM','KNOWN'),
('SB-C-BAD-DERIVED','SB-TEST','ENTITY','SB-E1','bad.derived','true'::jsonb,'TEST','ACTIVE','INFERENCE','KNOWN');

-- Restricted nature/location observations may exist privately but cannot expose public geometry.
insert into cns.observations(observation_id,project_id,entity_id,observation_type,value,unit,observed_at,source_id,source_revision,methodology_id,geometry_private,spatial_precision_m,sensitivity_state,sensitivity_reason)
values('SB-OBS-PRIVATE','SB-TEST','SB-E1','LOCATION','{"present":true}','boolean',now(),'SB-SOURCE','rev-1','SB-METHOD','{"type":"Point","coordinates":[10,60]}'::jsonb,10,'RESTRICTED','sensitive test');

do $$ begin
  begin
    insert into cns.observations(observation_id,project_id,entity_id,observation_type,value,observed_at,source_id,source_revision,public_geometry,sensitivity_state)
    values('SB-OBS-BAD','SB-TEST','SB-E1','LOCATION','{"present":true}',now(),'SB-SOURCE','rev-1','{"type":"Point","coordinates":[10,60]}'::jsonb,'RESTRICTED');
    raise exception 'SUPERBRAIN_RESTRICTED_LOCATION_LEAK_NOT_BLOCKED';
  exception when check_violation then null;
  end;
end $$;

insert into cns.conflicts(conflict_id,project_id,subject_type,subject_id,predicate,severity,summary,state,evidence_refs)
values('SB-CONFLICT','SB-TEST','ENTITY','SB-E1','test.metric','P0','Two material claims cannot both be accepted','OPEN','["SB-EV1"]');
insert into cns.conflict_claims(conflict_id,claim_id,side)
values('SB-CONFLICT','SB-C-SOURCE','A'),('SB-CONFLICT','SB-C-INFER','B');

insert into cns.decisions(decision_id,project_id,title,decision,authority,status,decided_by,decided_at,evidence_refs,rationale,assumptions,alternatives,unknowns,consequences,review_trigger,methodology_id)
values('SB-DEC','SB-TEST','Bounded decision','Use bounded test path','TEST','ACTIVE','SYSTEM',now(),'["SB-EV1"]','{"why":"evidence-bounded"}','["assumption"]','["alternative"]','["unknown"]','["consequence"]','{"when":"new evidence"}','SB-METHOD');
insert into cns.outcomes(outcome_id,project_id,decision_id,title,observed_at,value,evidence_refs,confidence,knowledge_state)
values('SB-OUT','SB-TEST','SB-DEC','Observed outcome',now(),'{"result":"observed"}','["SB-EV1"]',0.8000,'KNOWN');
insert into cns.learnings(learning_id,project_id,outcome_id,title,learning,evidence_refs,confidence,state)
values('SB-LEARN','SB-TEST','SB-OUT','Bounded learning','{"changed":"understanding"}','["SB-EV1"]',0.7000,'ACCEPTED');

insert into cns.evaluation_runs(evaluation_run_id,project_id,evaluator_agent_id,state,summary)
values('11111111-1111-1111-1111-111111111111','SB-TEST',null,'RUNNING','{}');
insert into cns.evaluation_assertions(evaluation_run_id,assertion_key,critical,passed,evidence)
values('11111111-1111-1111-1111-111111111111','truth-regression',true,true,'{"proof":"pass"}');
select cns.finish_evaluation('11111111-1111-1111-1111-111111111111');

insert into cns.rule_changes(rule_change_id,project_id,learning_id,title,proposal,baseline,candidate,test_plan,rollback_plan,evaluation_run_id,decision,decision_reason,applied_at,state)
values('SB-RULE','SB-TEST','SB-LEARN','Bounded rule change','{"rule":"candidate"}','{"v":1}','{"v":2}','{"test":"independent"}','{"rollback":"v1"}','11111111-1111-1111-1111-111111111111','KEEP','evaluation passed',now(),'APPLIED');

do $$ begin
  begin
    insert into cns.rule_changes(rule_change_id,project_id,title,proposal,decision,state)
    values('SB-RULE-BAD','SB-TEST','Unsafe keep','{"rule":"unsafe"}','KEEP','APPLIED');
    raise exception 'SUPERBRAIN_UNEVALUATED_RULE_KEEP_NOT_BLOCKED';
  exception when others then
    if sqlerrm='SUPERBRAIN_UNEVALUATED_RULE_KEEP_NOT_BLOCKED' then raise; end if;
  end;
end $$;

insert into cns.provenance_edges(subject_type,subject_id,relation,object_type,object_id,activity_type,activity_id,agent_type,agent_id,source_id,source_revision)
values('CLAIM','SB-C-INFER','DERIVED_FROM','EVIDENCE','SB-EV1','METHOD','SB-METHOD','SYSTEM','scientist','SB-SOURCE','rev-1');

insert into cns.hypotheses(hypothesis_id,project_id,owner_identity,title,statement,hypothesis_type,status,falsifiers,supporting_evidence_refs,counter_evidence_refs,originality_note,source_id,source_revision,publication_state,published_uri)
values('SB-HYP','SB-TEST','ODIN ODDEKALV','Better choices test thesis','A hypothesis remains a hypothesis until evidence supports each causal link.','FOUNDER_THESIS','TESTING','["counterexample"]','["SB-EV1"]','["counterexample-search"]','Certification-only thesis record','SB-SOURCE','rev-1','PUBLISHED','https://example.invalid/thesis');

do $$ begin
  begin
    insert into cns.hypotheses(hypothesis_id,project_id,owner_identity,title,statement,publication_state,published_uri)
    values('SB-HYP-BAD','SB-TEST','TEST','Unsupported publication','Must fail','PUBLISHED','https://example.invalid/bad');
    raise exception 'SUPERBRAIN_UNSUPPORTED_HYPOTHESIS_PUBLICATION_NOT_BLOCKED';
  exception when check_violation then null;
  end;
end $$;

do $$ begin
  if (select count(*) from cns.control_roles) < 8 then raise exception 'SUPERBRAIN_CONTROL_ROLES_INCOMPLETE'; end if;
  if exists(select 1 from cns.control_roles where may_rewrite_source_truth) then raise exception 'SUPERBRAIN_ROLE_CAN_REWRITE_SOURCE_TRUTH'; end if;
end $$;

select cns.doctor_scan();

do $$ begin
  if not exists(select 1 from cns.health_incidents where rule_id='ENTITY_ALIAS_COLLISION' and state='OPEN') then raise exception 'SUPERBRAIN_DOCTOR_ALIAS_MISS'; end if;
  if not exists(select 1 from cns.health_incidents where rule_id='OPEN_TRUTH_CONFLICT_P0' and state='OPEN') then raise exception 'SUPERBRAIN_DOCTOR_CONFLICT_MISS'; end if;
  if not exists(select 1 from cns.health_incidents where rule_id='SOURCE_CLAIM_WITHOUT_SOURCE' and entity_id='SB-C-BAD-SOURCE' and state='OPEN') then raise exception 'SUPERBRAIN_DOCTOR_SOURCE_MISS'; end if;
  if not exists(select 1 from cns.health_incidents where rule_id='DERIVED_CLAIM_WITHOUT_METHOD' and entity_id='SB-C-BAD-DERIVED' and state='OPEN') then raise exception 'SUPERBRAIN_DOCTOR_METHOD_MISS'; end if;
end $$;

update cns.system_meta set value='{"version":3,"verified":true,"state":"CERTIFIED_TEST","principle":"UNKNOWN_IS_FIRST_CLASS"}'::jsonb where key='truth_model';
do $$ begin
  if not (select truth_model_green from cns.v_cutover_readiness) then raise exception 'SUPERBRAIN_TRUTH_MODEL_GATE_NOT_GREEN_AFTER_TEST_CERT'; end if;
  if (select cutover_authorized from cns.v_cutover_readiness) then raise exception 'SUPERBRAIN_TEST_MUST_NOT_AUTHORIZE_CUTOVER'; end if;
end $$;

-- Public/API-facing roles must not gain CNS access as a side effect of hardening.
do $$ begin
  if has_schema_privilege('anon','cns','USAGE') or has_schema_privilege('authenticated','cns','USAGE') then
    raise exception 'SUPERBRAIN_PRIVATE_SCHEMA_EXPOSED';
  end if;
end $$;

rollback;
