\set ON_ERROR_STOP on
begin;

-- A realistic 4PLANET authority hierarchy: current router is authority; a newer summary is not.
insert into cns.source_registry(source_id,source_kind,name,authority,truth_domain,current_revision,state,last_verified_at,sensitivity_state)
values
('RT-CURRENT','GOOGLE_DOC','GPT_PROJECT_LEAD_CURRENT','CURRENT_ROUTER','PROGRAMME_CURRENT_STATE','rev-current','ACTIVE',clock_timestamp(),'INTERNAL'),
('RT-SUMMARY','GOOGLE_DOC','A newer plausible summary FINAL','DERIVED_VIEW','PROGRAMME_SUMMARY','rev-summary','ACTIVE',clock_timestamp(),'INTERNAL'),
('RT-PUBLIC','PRIMARY_DATASET','Public evidence source','PRIMARY_EVIDENCE','TEST_PUBLIC','rev-public','ACTIVE',clock_timestamp(),'PUBLIC'),
('RT-SECRET','PRIVATE_SOURCE','Private founder context','PRIVATE_RESTRICTED','PRIVATE_CONTEXT','rev-secret','ACTIVE',clock_timestamp(),'SECRET');

insert into cns.source_revisions(source_id,revision,persistent_id,retrieved_at,content_hash)
values
('RT-CURRENT','rev-current','urn:rt:current',clock_timestamp(),'rt-current-hash'),
('RT-SUMMARY','rev-summary','urn:rt:summary',clock_timestamp(),'rt-summary-hash'),
('RT-PUBLIC','rev-public','urn:rt:public',clock_timestamp(),'rt-public-hash'),
('RT-SECRET','rev-secret','urn:rt:secret',clock_timestamp(),'rt-secret-hash');

insert into cns.projects(project_id,slug,name,lifecycle,authority)
values('RT-4P','rt-4p','4PLANET Retrieval Torture','ACTIVE','WORKING_CONTROL');

insert into cns.authority_bindings(project_id,surface,authority,source_id,role,precedence,founder_locked,notes)
values
('RT-4P','CURRENT_STATE','CURRENT_ROUTER','RT-CURRENT','PRIMARY',1,true,'Only the explicit current router can project current state'),
('RT-4P','CANON','LOCKED_FOUNDER_DECISION',null,'PRIMARY',1,true,'Canon binding example; no current-state permission');

update cns.system_meta
set value=jsonb_build_object('version',1,'enabled',true,'verified',false,'state','TEST_ENFORCED')
where key='authority_enforcement';

-- Wrong/newer summary must never become current state.
do $$ begin
  begin
    perform cns.commit_project_state(
      'RT-4P','{"state":"ACTIVE","why":"WRONG NEWER SUMMARY","outcome":"wrong","next_action":"wrong","owner":"summary","founder_burden":"NONE","health":"GREEN","primary_goal_ids":[]}'::jsonb,
      'AGENT','summary-writer','DERIVED_VIEW','RT-SUMMARY','rev-summary','rt-wrong-current',3600,'[]'::jsonb
    );
    raise exception 'CNS_WRONG_AUTHORITY_COMMIT_NOT_BLOCKED';
  exception when others then
    if sqlerrm='CNS_WRONG_AUTHORITY_COMMIT_NOT_BLOCKED' then raise; end if;
    if sqlerrm not like '%CNS_WRONG_AUTHORITY:%' then raise; end if;
  end;
end $$;

-- Direct event injection must not bypass the guarded current-state function.
do $$ begin
  begin
    perform cns.append_event('RT-4P','PROJECT','RT-4P','PROJECT_STATE_COMMITTED',
      '{"state":"ACTIVE","why":"DIRECT INJECTION","next_action":"wrong","owner":"attacker"}'::jsonb,'[]'::jsonb,
      'AGENT','attacker','DERIVED_VIEW','RT-SUMMARY','rev-summary','rt-direct-injection');
    raise exception 'CNS_WRONG_AUTHORITY_EVENT_INJECTION_NOT_BLOCKED';
  exception when others then
    if sqlerrm='CNS_WRONG_AUTHORITY_EVENT_INJECTION_NOT_BLOCKED' then raise; end if;
    if sqlerrm not like '%CNS_WRONG_AUTHORITY:%' then raise; end if;
  end;
end $$;

-- Correct route succeeds and replay resolves only authorized truth.
select cns.commit_project_state(
  'RT-4P','{"state":"ACTIVE","why":"Authoritative current state","outcome":"Use correct authority","next_action":"continue certification","owner":"AXE","founder_burden":"NONE","health":"GREEN","primary_goal_ids":[]}'::jsonb,
  'SYSTEM','current-router','CURRENT_ROUTER','RT-CURRENT','rev-current','rt-authorized-current',3600,'[]'::jsonb
);
select cns.rebuild_project_state('RT-4P',3600);

do $$ begin
  if (select why from cns.project_current_state where project_id='RT-4P')<>'Authoritative current state' then
    raise exception 'CNS_AUTHORIZED_REPLAY_WRONG_RESULT';
  end if;
end $$;

-- Retrieval must preserve UNKNOWN and conflict rather than manufacture certainty.
insert into cns.claims(claim_id,project_id,subject_type,subject_id,predicate,value,authority,confidence,state,claim_kind,knowledge_state,source_id,source_revision,revision,sensitivity_state)
values
('RT-CLAIM-KNOWN','RT-4P','PROJECT','RT-4P','status.truth','{"value":"known"}','PRIMARY_EVIDENCE',0.95,'DISPUTED','SOURCE_FACT','CONFLICTED','RT-PUBLIC','rev-public',1,'PUBLIC'),
('RT-CLAIM-OTHER','RT-4P','PROJECT','RT-4P','status.truth','{"value":"different"}','PRIMARY_EVIDENCE',0.90,'DISPUTED','SOURCE_FACT','CONFLICTED','RT-PUBLIC','rev-public',1,'PUBLIC'),
('RT-CLAIM-UNKNOWN','RT-4P','PROJECT','RT-4P','unknown.material','{"value":null}','PRIMARY_EVIDENCE',null,'ACTIVE','UNKNOWN','UNKNOWN','RT-PUBLIC','rev-public',1,'PUBLIC'),
('RT-SECRET-CLAIM','RT-4P','PROJECT','RT-4P','private.sentinel','{"sentinel":"PRIVATE-SENTINEL-4PLANET"}','PRIVATE_RESTRICTED',null,'ACTIVE','SOURCE_CLAIM','KNOWN','RT-SECRET','rev-secret',1,'SECRET');

insert into cns.conflicts(conflict_id,project_id,subject_type,subject_id,predicate,severity,summary,state)
values('RT-CONFLICT','RT-4P','PROJECT','RT-4P','status.truth','P1','Two credible claims disagree','OPEN');
insert into cns.conflict_claims(conflict_id,claim_id,side)
values('RT-CONFLICT','RT-CLAIM-KNOWN','A'),('RT-CONFLICT','RT-CLAIM-OTHER','B');

do $$ declare t jsonb; begin
  select to_jsonb(x) into t from cns.v_claim_truth_trace x where claim_id='RT-CLAIM-KNOWN';
  if jsonb_array_length(t->'open_conflicts')=0 then raise exception 'CNS_RETRIEVAL_DROPPED_OPEN_CONFLICT'; end if;
  if not exists(select 1 from cns.v_public_claims where claim_id='RT-CLAIM-UNKNOWN' and knowledge_state='UNKNOWN' and confidence is null) then
    raise exception 'CNS_RETRIEVAL_DROPPED_UNKNOWN';
  end if;
end $$;

-- Public export is allow-list only. Secret sentinel and donor named FINAL must not leak/win.
insert into cns.evidence(evidence_id,project_id,evidence_type,source_id,source_revision,uri,content_hash,state,revision,sensitivity_state)
values
('RT-EVID-PUBLIC','RT-4P','PRIMARY','RT-PUBLIC','rev-public','https://example.test/public','publichash','ACTIVE',1,'PUBLIC'),
('RT-EVID-SECRET','RT-4P','PRIVATE','RT-SECRET','rev-secret','https://example.test/private','secrethash','ACTIVE',1,'SECRET');

insert into cns.artifacts(artifact_id,project_id,artifact_type,title,uri,source_system,role,immutable,sensitivity_state)
values
('RT-ART-CURRENT','RT-4P','DOCUMENT','Current public artifact','https://example.test/current','TEST','CURRENT',true,'PUBLIC'),
('RT-ART-FINAL-DONOR','RT-4P','DOCUMENT','FINAL LATEST ABSOLUTE WINNER','https://example.test/donor','TEST','DONOR',true,'PUBLIC'),
('RT-ART-SECRET','RT-4P','DOCUMENT','PRIVATE-SENTINEL-4PLANET','https://example.test/secret','TEST','EVIDENCE',true,'SECRET');

do $$ declare export_text text; begin
  select coalesce(string_agg(payload::text,' '),'') into export_text from cns.v_public_truth_export where project_id='RT-4P';
  if export_text like '%PRIVATE-SENTINEL-4PLANET%' then raise exception 'CNS_PRIVATE_SENTINEL_LEAKED_PUBLIC'; end if;
  if exists(select 1 from cns.v_public_artifacts where artifact_id='RT-ART-FINAL-DONOR') then raise exception 'CNS_FINAL_NAMED_DONOR_WON_BY_FILENAME'; end if;
  if not exists(select 1 from cns.v_public_artifacts where artifact_id='RT-ART-CURRENT') then raise exception 'CNS_CURRENT_PUBLIC_ARTIFACT_MISSING'; end if;
end $$;

-- Misclassification attempt: PUBLIC claim over SECRET source must be caught by Gatekeeper/Doctor.
insert into cns.claims(claim_id,project_id,subject_type,subject_id,predicate,value,authority,confidence,state,claim_kind,knowledge_state,source_id,source_revision,revision,sensitivity_state)
values('RT-BAD-PUBLIC','RT-4P','PROJECT','RT-4P','bad.public','{"x":1}','PRIVATE_RESTRICTED',0.8,'ACTIVE','SOURCE_CLAIM','KNOWN','RT-SECRET','rev-secret',1,'PUBLIC');
select cns.doctor_scan();
do $$ begin
  if not exists(select 1 from cns.health_incidents where rule_id='PUBLIC_CLAIM_RESTRICTED_SOURCE' and entity_id='RT-BAD-PUBLIC' and state='OPEN' and severity='P0') then
    raise exception 'CNS_GATEKEEPER_DID_NOT_CATCH_PRIVATE_PUBLIC_MISCLASSIFICATION';
  end if;
end $$;
update cns.claims set state='SUPERSEDED' where claim_id='RT-BAD-PUBLIC';
select cns.doctor_scan();
do $$ begin
  if exists(select 1 from cns.health_incidents where rule_id='PUBLIC_CLAIM_RESTRICTED_SOURCE' and entity_id='RT-BAD-PUBLIC' and state in ('OPEN','ACKNOWLEDGED')) then
    raise exception 'CNS_GATEKEEPER_INCIDENT_DID_NOT_RESOLVE_AFTER_SUPERSESSION';
  end if;
end $$;

rollback;
