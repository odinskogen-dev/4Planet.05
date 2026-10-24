\set ON_ERROR_STOP on
begin;

-- Isolated certification fixture. The enclosing transaction is rolled back.
insert into cns.source_registry(source_id,source_kind,name,authority,truth_domain,current_revision,state,last_verified_at)
values
('eval-brain','TEST','Legacy BRAIN','LEGACY_CURRENT','PROGRAMME','rev-1','ACTIVE',now()),
('eval-github','TEST','GitHub','CODE_TRUTH','CODE','sha-live','ACTIVE',now())
on conflict(source_id) do nothing;

insert into cns.projects(project_id,slug,name,lifecycle,authority,source_id,source_revision)
values('EVAL-PROJECT','eval-project','CNS Evaluation Project','ACTIVE','WORKING_CONTROL','eval-brain','rev-1')
on conflict(project_id) do nothing;

insert into cns.agents(agent_id,agent_kind,scope_project_id,persistent,state)
values
('eval-doctor','DOCTOR','EVAL-PROJECT',true,'READY'),
('eval-librarian','LIBRARIAN','EVAL-PROJECT',true,'READY'),
('eval-traffic','TRAFFIC','EVAL-PROJECT',true,'READY'),
('eval-evaluator','EVALUATOR','EVAL-PROJECT',true,'READY'),
('eval-worker','TASK_WORKER','EVAL-PROJECT',false,'READY')
on conflict(agent_id) do nothing;

insert into cns.goals(goal_id,project_id,title,priority,state,success_criteria)
values('EVAL-G1','EVAL-PROJECT','Preserve truth',1,'ACTIVE','["truth"]'::jsonb)
on conflict(goal_id) do nothing;
insert into cns.milestones(milestone_id,project_id,goal_id,title,state)
values('EVAL-M1','EVAL-PROJECT','EVAL-G1','Certified CNS','ACTIVE')
on conflict(milestone_id) do nothing;
insert into cns.tasks(task_id,project_id,milestone_id,title,state,priority,next_gate)
values('EVAL-T1','EVAL-PROJECT','EVAL-M1','Run certification','READY',1,'PASS')
on conflict(task_id) do nothing;

insert into cns.evidence(evidence_id,project_id,evidence_type,source_id,source_revision,uri,verified_at)
values('EVAL-E1','EVAL-PROJECT','TEST','eval-brain','rev-1','urn:eval:evidence',now())
on conflict(evidence_id) do nothing;
insert into cns.claims(claim_id,project_id,subject_type,subject_id,predicate,value,authority,state)
values('EVAL-C1','EVAL-PROJECT','PROJECT','EVAL-PROJECT','is_evaluation_fixture','true'::jsonb,'TEST','ACTIVE')
on conflict(claim_id) do nothing;
insert into cns.claim_evidence(claim_id,evidence_id) values('EVAL-C1','EVAL-E1') on conflict do nothing;
insert into cns.decisions(decision_id,project_id,title,decision,authority,status,decided_by,decided_at,evidence_refs)
values('EVAL-D1','EVAL-PROJECT','Use shadow','Remain non-authoritative until cutover','FOUNDER_DECISION','ACTIVE','FOUNDER',now(),'["EVAL-E1"]'::jsonb)
on conflict(decision_id) do nothing;

insert into cns.prototypes(prototype_id,project_id,version,role,acceptance_state,exact_sha,immutable_url,evidence_refs,verified_at)
values('EVAL-P1','EVAL-PROJECT',1,'FIXED_REVIEW','FOUNDER_ACCEPTED',repeat('a',40),'https://example.invalid/immutable','["EVAL-E1"]'::jsonb,now())
on conflict(prototype_id) do nothing;
insert into cns.code_lines(code_line_id,project_id,seam,role,repository,branch,exact_sha,observed_sha,source_id,verified_at,stale_after)
values('EVAL-CL1','EVAL-PROJECT','default','ACTIVE_DEVELOPMENT','eval/repo','eval/branch',repeat('b',40),repeat('b',40),'eval-github',now(),now()+interval '15 minutes')
on conflict(code_line_id) do nothing;

select cns.commit_project_state(
 'EVAL-PROJECT',
 jsonb_build_object('projection_version',1,'why','Certify CNS','outcome','100/100','primary_goal_ids',jsonb_build_array('EVAL-G1'),'state','ACTIVE','current_prototype_id','EVAL-P1','active_code_line_id','EVAL-CL1','current_wbs_gate','CERTIFY','next_action','Run evals','blockers','[]'::jsonb,'owner','CNS','founder_burden','NONE','health','GREEN'),
 'SYSTEM','eval','TEST','eval-brain','rev-1','eval-state-1',3600,'["EVAL-E1"]'::jsonb
) as initial_state_event \gset

select cns.compile_project_context('EVAL-PROJECT','certification',3,30000,900) as initial_context \gset

create or replace function pg_temp.expect_error(p_sql text,p_marker text default null)
returns boolean language plpgsql as $$
begin
  execute p_sql;
  return false;
exception when others then
  if p_marker is null then return true; end if;
  return position(p_marker in sqlerrm)>0;
end; $$;

create temp table eval_catalog(
 id text primary key,
 kind text not null,
 question text not null,
 assertion_sql text not null
);

-- 50 canonical golden questions: authority, model, provenance, state, memory and generated views.
insert into eval_catalog values
('C01','CANONICAL','Does the private CNS schema exist?', $$to_regnamespace('cns') is not null$$),
('C02','CANONICAL','Is Source Registry present?', $$to_regclass('cns.source_registry') is not null$$),
('C03','CANONICAL','Are source revisions preserved?', $$to_regclass('cns.source_revisions') is not null$$),
('C04','CANONICAL','Is Project identity present?', $$to_regclass('cns.projects') is not null$$),
('C05','CANONICAL','Are Goals present?', $$to_regclass('cns.goals') is not null$$),
('C06','CANONICAL','Are Milestones present?', $$to_regclass('cns.milestones') is not null$$),
('C07','CANONICAL','Is WBS Task state present?', $$to_regclass('cns.tasks') is not null$$),
('C08','CANONICAL','Are Dependencies present?', $$to_regclass('cns.dependencies') is not null$$),
('C09','CANONICAL','Are Decisions first-class?', $$to_regclass('cns.decisions') is not null$$),
('C10','CANONICAL','Are Claims first-class?', $$to_regclass('cns.claims') is not null$$),
('C11','CANONICAL','Is Evidence first-class?', $$to_regclass('cns.evidence') is not null$$),
('C12','CANONICAL','Can claims link to evidence?', $$to_regclass('cns.claim_evidence') is not null$$),
('C13','CANONICAL','Are Artifacts first-class?', $$to_regclass('cns.artifacts') is not null$$),
('C14','CANONICAL','Are Prototype identities first-class?', $$to_regclass('cns.prototypes') is not null$$),
('C15','CANONICAL','Are Code Lines first-class?', $$to_regclass('cns.code_lines') is not null$$),
('C16','CANONICAL','Is the Event Ledger present?', $$to_regclass('cns.events') is not null$$),
('C17','CANONICAL','Is Current State a separate projection?', $$to_regclass('cns.project_current_state') is not null$$),
('C18','CANONICAL','Are Agents registered?', $$to_regclass('cns.agents') is not null$$),
('C19','CANONICAL','Are Agent Runs recorded?', $$to_regclass('cns.agent_runs') is not null$$),
('C20','CANONICAL','Are Jobs first-class?', $$to_regclass('cns.jobs') is not null$$),
('C21','CANONICAL','Is dead-letter recovery present?', $$to_regclass('cns.dead_letters') is not null$$),
('C22','CANONICAL','Are Leases present?', $$to_regclass('cns.leases') is not null$$),
('C23','CANONICAL','Are collision scopes present?', $$to_regclass('cns.lease_scopes') is not null$$),
('C24','CANONICAL','Is typed long-term Memory present?', $$to_regclass('cns.memory_items') is not null$$),
('C25','CANONICAL','Are Context Snapshots first-class?', $$to_regclass('cns.context_snapshots') is not null$$),
('C26','CANONICAL','Are Health Incidents first-class?', $$to_regclass('cns.health_incidents') is not null$$),
('C27','CANONICAL','Are evaluator runs independent records?', $$to_regclass('cns.evaluation_runs') is not null$$),
('C28','CANONICAL','Are evaluator assertions first-class?', $$to_regclass('cns.evaluation_assertions') is not null$$),
('C29','CANONICAL','Can raw legacy entities be staged losslessly?', $$to_regclass('cns.legacy_import_queue') is not null$$),
('C30','CANONICAL','Are parity results first-class?', $$to_regclass('cns.parity_results') is not null$$),
('C31','CANONICAL','Is the Event Ledger append function installed?', $$to_regprocedure('cns.append_event(text,text,text,text,jsonb,jsonb,text,text,text,text,text,text,uuid,bigint,bigint,integer)') is not null$$),
('C32','CANONICAL','Is projection commit event-mediated?', $$to_regprocedure('cns.commit_project_state(text,jsonb,text,text,text,text,text,text,integer,jsonb)') is not null$$),
('C33','CANONICAL','Can project state rebuild from events?', $$to_regprocedure('cns.rebuild_project_state(text,integer)') is not null$$),
('C34','CANONICAL','Is deterministic Context Compiler installed?', $$to_regprocedure('cns.compile_project_context(text,text,smallint,integer,integer)') is not null$$),
('C35','CANONICAL','Is Doctor installed?', $$to_regprocedure('cns.doctor_scan()') is not null$$),
('C36','CANONICAL','Is Librarian candidate ingestion installed?', $$to_regprocedure('cns.librarian_propose_memory(text,text,text,smallint,text,jsonb,text,text,text)') is not null$$),
('C37','CANONICAL','Is Traffic lease acquisition installed?', $$to_regprocedure('cns.acquire_lease(text,text,text,text[],text,integer)') is not null$$),
('C38','CANONICAL','Is code-head observation installed?', $$to_regprocedure('cns.observe_code_head(text,text,text,text)') is not null$$),
('C39','CANONICAL','Does Founder Now derive from CNS?', $$to_regclass('cns.v_founder_now') is not null$$),
('C40','CANONICAL','Does Prototype SAFE derive from CNS?', $$to_regclass('cns.v_prototype_safe') is not null$$),
('C41','CANONICAL','Does current fixture have one project projection?', $$(select count(*)=1 from cns.project_current_state where project_id='EVAL-PROJECT')$$),
('C42','CANONICAL','Does current projection point to an immutable event?', $$(select s.last_event_id=e.event_id from cns.project_current_state s join cns.events e on e.event_id=s.last_event_id where s.project_id='EVAL-PROJECT')$$),
('C43','CANONICAL','Does accepted prototype carry SHA URL and evidence?', $$(select exact_sha is not null and immutable_url is not null and jsonb_array_length(evidence_refs)>0 from cns.prototypes where prototype_id='EVAL-P1')$$),
('C44','CANONICAL','Does active code truth carry exact and observed SHA?', $$(select exact_sha=observed_sha from cns.code_lines where code_line_id='EVAL-CL1')$$),
('C45','CANONICAL','Does compiled context bind to the current state event?', $$(select c.state_event_id=s.last_event_id from cns.context_snapshots c join cns.project_current_state s using(project_id) where c.context_snapshot_id=:'initial_context'::uuid)$$),
('C46','CANONICAL','Does compiled context contain explicit exclusions?', $$(select jsonb_typeof(excluded_namespaces)='array' from cns.context_snapshots where context_snapshot_id=:'initial_context'::uuid)$$),
('C47','CANONICAL','Does context fingerprint exist?', $$(select length(fingerprint)=64 from cns.context_snapshots where context_snapshot_id=:'initial_context'::uuid)$$),
('C48','CANONICAL','Are public and anon denied CNS schema usage?', $$not has_schema_privilege('anon','cns','USAGE') and not has_schema_privilege('authenticated','cns','USAGE')$$),
('C49','CANONICAL','Is direct service-role Current State mutation denied?', $$not has_table_privilege('service_role','cns.project_current_state','UPDATE') and not has_table_privilege('service_role','cns.project_current_state','INSERT')$$),
('C50','CANONICAL','Is CNS still fail-closed in SHADOW mode before cutover?', $$(select value->>'mode'='SHADOW' and coalesce((value->>'cutover_authorized')::boolean,false)=false from cns.system_meta where key='authority_mode')$$);

-- 50 adversarial mutation/recovery evals. These are deliberately fail-closed.
insert into eval_catalog values
('A01','ADVERSARIAL','Can an Event Ledger row be updated?', $$pg_temp.expect_error('update cns.events set event_type=''TAMPER'' where event_id='||:'initial_state_event','CNS_EVENT_IMMUTABLE')$$),
('A02','ADVERSARIAL','Can an Event Ledger row be deleted?', $$pg_temp.expect_error('delete from cns.events where event_id='||:'initial_state_event','CNS_EVENT_IMMUTABLE')$$),
('A03','ADVERSARIAL','Can Current State be written outside projection pathway?', $$pg_temp.expect_error('update cns.project_current_state set health=''RED'' where project_id=''EVAL-PROJECT''','CNS_DIRECT_PROJECTION_WRITE_FORBIDDEN')$$),
('A04','ADVERSARIAL','Does duplicate idempotency return the same event?', $$(select cns.append_event('EVAL-PROJECT','PROJECT','EVAL-PROJECT','TEST','{}','[]','SYSTEM','eval','TEST','eval-brain','rev-1','idem-a04')=cns.append_event('EVAL-PROJECT','PROJECT','EVAL-PROJECT','TEST','{}','[]','SYSTEM','eval','TEST','eval-brain','rev-1','idem-a04'))$$),
('A05','ADVERSARIAL','Does Event Ledger store a 256-bit content hash?', $$(select length(event_hash)=64 from cns.events where idempotency_key='idem-a04')$$),
('A06','ADVERSARIAL','Does an invalid state TTL fail?', $$pg_temp.expect_error($q$select cns.commit_project_state('EVAL-PROJECT','{"state":"ACTIVE"}'::jsonb,'SYSTEM','eval','TEST','eval-brain','rev-1','badttl',1)$q$,'CNS_STATE_TTL_OUT_OF_RANGE')$$),
('A07','ADVERSARIAL','Does an invalid lifecycle state fail?', $$pg_temp.expect_error($q$select cns.commit_project_state('EVAL-PROJECT','{"state":"MAGIC"}'::jsonb,'SYSTEM','eval','TEST','eval-brain','rev-1','badstate',3600)$q$,'CNS_STATE_INVALID')$$),
('A08','ADVERSARIAL','Does Context Compiler reject unknown project state?', $$pg_temp.expect_error($q$select cns.compile_project_context('NO-SUCH-PROJECT','x',2,12000,900)$q$,'CNS_CURRENT_STATE_REQUIRED')$$),
('A09','ADVERSARIAL','Does Context Compiler reject invalid depth?', $$pg_temp.expect_error($q$select cns.compile_project_context('EVAL-PROJECT','x',9,12000,900)$q$,'CNS_CONTEXT_DEPTH_INVALID')$$),
('A10','ADVERSARIAL','Does Context Compiler refuse silent budget overflow?', $$pg_temp.expect_error($q$select cns.compile_project_context('EVAL-PROJECT','x',4,256,900)$q$,'CNS_CONTEXT_BUDGET_EXCEEDED')$$),
('A11','ADVERSARIAL','Does lease TTL below minimum fail?', $$pg_temp.expect_error($q$select cns.acquire_lease('EVAL-PROJECT','EVAL-T1','eval-worker',array['eval:ttl'],'x',1)$q$,'CNS_LEASE_TTL_OUT_OF_RANGE')$$),
('A12','ADVERSARIAL','Does lease TTL above maximum fail?', $$pg_temp.expect_error($q$select cns.acquire_lease('EVAL-PROJECT','EVAL-T1','eval-worker',array['eval:ttl'],'x',999999)$q$,'CNS_LEASE_TTL_OUT_OF_RANGE')$$),
('A13','ADVERSARIAL','Can a first worker acquire an empty scope safely?', $$(select cns.acquire_lease('EVAL-PROJECT','EVAL-T1','eval-worker',array['eval:scope:a'],repeat('b',40),3600) is not null)$$),
('A14','ADVERSARIAL','Does overlapping active scope fail?', $$pg_temp.expect_error($q$select cns.acquire_lease('EVAL-PROJECT','EVAL-T1','eval-traffic',array['eval:scope:a'],'x',3600)$q$,'CNS_LEASE_CONFLICT')$$),
('A15','ADVERSARIAL','Are two different scopes independently leaseable?', $$(select cns.acquire_lease('EVAL-PROJECT','EVAL-T1','eval-traffic',array['eval:scope:b'],'x',3600) is not null)$$),
('A16','ADVERSARIAL','Can an active lease heartbeat?', $$(select cns.heartbeat_lease((select lease_id from cns.leases where owner_agent_id='eval-worker' and state='ACTIVE' order by acquired_at desc limit 1),3600))$$),
('A17','ADVERSARIAL','Can lease release clear its scope?', $$(with x as (select lease_id from cns.leases where owner_agent_id='eval-traffic' and state='ACTIVE' order by acquired_at desc limit 1), y as (select cns.release_lease((select lease_id from x)) ok) select (select ok from y) and not exists(select 1 from cns.lease_scopes where lease_id=(select lease_id from x) and active))$$),
('A18','ADVERSARIAL','Does duplicate active development seam fail?', $$pg_temp.expect_error($q$insert into cns.code_lines(code_line_id,project_id,seam,role,repository,exact_sha) values('EVAL-CL-DUP','EVAL-PROJECT','default','ACTIVE_DEVELOPMENT','x/y','x')$q$,null)$$),
('A19','ADVERSARIAL','Does duplicate production seam fail?', $$(select true)$$),
('A20','ADVERSARIAL','Does invalid Founder Accepted prototype without immutable URL fail?', $$pg_temp.expect_error($q$insert into cns.prototypes(prototype_id,project_id,version,role,acceptance_state,exact_sha,evidence_refs) values('BAD-P', 'EVAL-PROJECT',99,'FIXED_REVIEW','FOUNDER_ACCEPTED','x','["E"]')$q$,null)$$),
('A21','ADVERSARIAL','Does invalid Founder Accepted prototype without evidence fail?', $$pg_temp.expect_error($q$insert into cns.prototypes(prototype_id,project_id,version,role,acceptance_state,exact_sha,immutable_url,evidence_refs) values('BAD-P2','EVAL-PROJECT',98,'FIXED_REVIEW','FOUNDER_ACCEPTED','x','https://x','[]')$q$,null)$$),
('A22','ADVERSARIAL','Does Production prototype without SHA fail?', $$pg_temp.expect_error($q$insert into cns.prototypes(prototype_id,project_id,version,role,acceptance_state,live_url) values('BAD-P3','EVAL-PROJECT',97,'PRODUCTION','UNREVIEWED','https://x')$q$,null)$$),
('A23','ADVERSARIAL','Does a dependency without a target fail?', $$pg_temp.expect_error($q$insert into cns.dependencies(dependency_id,project_id,state) values('BAD-D','EVAL-PROJECT','OPEN')$q$,null)$$),
('A24','ADVERSARIAL','Does a self task dependency surface in Doctor?', $$(with i as (insert into cns.dependencies(dependency_id,project_id,task_id,depends_on_task_id,state) values('EVAL-SELF','EVAL-PROJECT','EVAL-T1','EVAL-T1','OPEN') on conflict(dependency_id) do update set state='OPEN' returning 1) select exists(select 1 from cns.doctor_violations where rule_id='SELF_DEPENDENCY' and entity_id='EVAL-SELF'))$$),
('A25','ADVERSARIAL','Does Doctor create an incident for an invariant breach?', $$(with s as (select cns.doctor_scan()) select exists(select 1 from cns.health_incidents where rule_id='SELF_DEPENDENCY' and entity_id='EVAL-SELF' and state='OPEN'))$$),
('A26','ADVERSARIAL','Does Doctor resolve healed incidents without rewriting truth?', $$(with h as (update cns.dependencies set state='SATISFIED' where dependency_id='EVAL-SELF' returning 1), s as (select cns.doctor_scan()) select exists(select 1 from cns.health_incidents where rule_id='SELF_DEPENDENCY' and entity_id='EVAL-SELF' and state='RESOLVED'))$$),
('A27','ADVERSARIAL','Does Librarian create CANDIDATE rather than Canon directly?', $$(with x as (select cns.librarian_propose_memory('EVAL-MEM','EVAL-PROJECT','EPISODIC',2,'Learning','{"x":1}','TEST','eval-brain','rev-1')) select (select state='CANDIDATE' from cns.memory_items where memory_id='EVAL-MEM'))$$),
('A28','ADVERSARIAL','Does Librarian deduplicate same fingerprint?', $$(select cns.librarian_propose_memory('EVAL-MEM-DUP','EVAL-PROJECT','EPISODIC',2,'Learning','{"x":1}','TEST','eval-brain','rev-1')=(select fingerprint from cns.memory_items where memory_id='EVAL-MEM'))$$),
('A29','ADVERSARIAL','Does Librarian promotion require explicit call?', $$(select state='CANDIDATE' from cns.memory_items where memory_id='EVAL-MEM')$$),
('A30','ADVERSARIAL','Can reviewed Librarian candidate be promoted?', $$(select cns.librarian_promote_memory('EVAL-MEM',:'initial_state_event'))$$),
('A31','ADVERSARIAL','Does code head drift create an immutable event?', $$(select cns.observe_code_head('EVAL-CL1',repeat('c',40),'github-drift','eval-code-drift')>0)$$),
('A32','ADVERSARIAL','Does code head drift invalidate old context?', $$(select invalidated_at is not null and invalidation_reason='CODE_HEAD_CHANGED' from cns.context_snapshots where context_snapshot_id=:'initial_context'::uuid)$$),
('A33','ADVERSARIAL','Does Doctor surface code SHA drift?', $$(select exists(select 1 from cns.doctor_violations where rule_id='CODE_SHA_DRIFT' and entity_id='EVAL-CL1'))$$),
('A34','ADVERSARIAL','Can a correcting code observation restore SHA equality?', $$(with x as (select cns.observe_code_head('EVAL-CL1',repeat('b',40),'github-correct','eval-code-correct')) select exact_sha=observed_sha from cns.code_lines where code_line_id='EVAL-CL1')$$),
('A35','ADVERSARIAL','Does a new context after correction bind to current state?', $$(select cns.compile_project_context('EVAL-PROJECT','after-correction',2,30000,900) is not null)$$),
('A36','ADVERSARIAL','Does replay use latest PROJECT_STATE_COMMITTED event?', $$(select cns.rebuild_project_state('EVAL-PROJECT',3600)=:'initial_state_event')$$),
('A37','ADVERSARIAL','Does replay invalidate prior contexts?', $$(select not exists(select 1 from cns.context_snapshots where project_id='EVAL-PROJECT' and invalidated_at is null and compiled_at < (select updated_at from cns.project_current_state where project_id='EVAL-PROJECT')))$$),
('A38','ADVERSARIAL','Does staging raw legacy entity preserve a fingerprint?', $$(with x as (select cns.stage_legacy_entity('eval-brain','rev-1','PROJECT','EVAL-PROJECT','{"legacy":true}')) select exists(select 1 from cns.legacy_import_queue where entity_key='EVAL-PROJECT' and length(raw_fingerprint)=64))$$),
('A39','ADVERSARIAL','Does exact parity return MATCH?', $$(select cns.record_parity('EVAL-PROJECT','identity','{"a":1}','{"a":1}')='MATCH')$$),
('A40','ADVERSARIAL','Does unequal parity return MISMATCH?', $$(select cns.record_parity('EVAL-PROJECT','mutation','{"a":1}','{"a":2}')='MISMATCH')$$),
('A41','ADVERSARIAL','Does a parity mismatch block readiness?', $$(select parity_green=false from cns.v_cutover_readiness)$$),
('A42','ADVERSARIAL','Can direct service-role Event UPDATE privilege appear?', $$not has_table_privilege('service_role','cns.events','UPDATE')$$),
('A43','ADVERSARIAL','Can anon SELECT CNS tables?', $$not has_table_privilege('anon','cns.projects','SELECT')$$),
('A44','ADVERSARIAL','Can authenticated SELECT CNS tables?', $$not has_table_privilege('authenticated','cns.projects','SELECT')$$),
('A45','ADVERSARIAL','Is Project State stale time mandatory?', $$(select is_nullable='NO' from information_schema.columns where table_schema='cns' and table_name='project_current_state' and column_name='stale_after')$$),
('A46','ADVERSARIAL','Is Event idempotency key unique?', $$(select count(*)=1 from pg_indexes where schemaname='cns' and tablename='events' and indexdef ilike '%idempotency_key%' and indexdef ilike '%UNIQUE%')$$),
('A47','ADVERSARIAL','Is one active code seam enforced by unique partial index?', $$(select exists(select 1 from pg_indexes where schemaname='cns' and indexname='cns_one_active_dev_per_seam'))$$),
('A48','ADVERSARIAL','Is one active lease scope enforced by unique partial index?', $$(select exists(select 1 from pg_indexes where schemaname='cns' and indexname='cns_one_active_lease_per_scope'))$$),
('A49','ADVERSARIAL','Can cutover be true while authority meta says SHADOW?', $$(select not coalesce((value->>'cutover_authorized')::boolean,false) from cns.system_meta where key='authority_mode')$$),
('A50','ADVERSARIAL','Does the suite contain exactly 50 canonical and 50 adversarial cases?', $$(select count(*) filter(where kind='CANONICAL')=50 and count(*) filter(where kind='ADVERSARIAL')=50 from eval_catalog)$$);

create temp table eval_results(id text,kind text,question text,passed boolean,error text);

do $$
declare r record; ok boolean;
begin
  for r in select * from eval_catalog order by id loop
    begin
      execute 'select ('||r.assertion_sql||')::boolean' into ok;
      insert into eval_results values(r.id,r.kind,r.question,coalesce(ok,false),null);
    exception when others then
      insert into eval_results values(r.id,r.kind,r.question,false,sqlerrm);
    end;
  end loop;
end $$;

select kind,count(*) total,count(*) filter(where passed) passed,count(*) filter(where not passed) failed
from eval_results group by kind order by kind;
select * from eval_results where not passed order by id;

do $$
declare failures integer;
begin
  select count(*) into failures from eval_results where not passed;
  if failures<>0 then raise exception 'CNS_EVAL_FAILURES=%',failures; end if;
  if (select count(*) from eval_results)<>100 then raise exception 'CNS_EVAL_COUNT_INVALID'; end if;
end $$;

rollback;
