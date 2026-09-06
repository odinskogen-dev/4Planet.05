-- RECOVERED FROM APPLIED 4PLANET-STAGING MIGRATION JOURNAL 2026-09-03
-- SUPERBRAIN NARROW/JIT CONTEXT
-- Context must contain the smallest authoritative relevant state, not every source BRAIN knows about.

begin;

create or replace function cns.compile_project_context(
  p_project_id text,
  p_intent text,
  p_depth smallint default 2,
  p_token_budget integer default 12000,
  p_ttl_seconds integer default 900
) returns uuid
language plpgsql security definer set search_path=cns,public as $$
declare
  v_state cns.project_current_state%rowtype;
  v_body jsonb;
  v_sources jsonb;
  v_revisions jsonb;
  v_excluded jsonb;
  v_routes jsonb;
  v_dependencies jsonb;
  v_fp text;
  v_id uuid;
begin
  if p_depth < 0 or p_depth > 4 then raise exception 'CNS_CONTEXT_DEPTH_INVALID'; end if;
  if p_token_budget < 256 or p_token_budget > 200000 then raise exception 'CNS_CONTEXT_BUDGET_INVALID'; end if;
  if p_ttl_seconds < 30 or p_ttl_seconds > 86400 then raise exception 'CNS_CONTEXT_TTL_INVALID'; end if;
  select * into v_state from cns.project_current_state where project_id=p_project_id;
  if not found then raise exception 'CNS_CURRENT_STATE_REQUIRED'; end if;
  if v_state.stale_after <= clock_timestamp() then raise exception 'CNS_CURRENT_STATE_STALE'; end if;
  v_excluded := case p_depth
    when 0 then '["MILESTONES","WBS","DEPENDENCY_CLOSURE","CODE","PROTOTYPES","DECISIONS","CLAIMS","EVIDENCE","ARCHIVE"]'::jsonb
    when 1 then '["CODE","PROTOTYPES","DECISIONS","CLAIMS","EVIDENCE","ARCHIVE"]'::jsonb
    when 2 then '["DECISIONS","CLAIMS","EVIDENCE","ARCHIVE"]'::jsonb
    when 3 then '["ARCHIVE"]'::jsonb
    else '[]'::jsonb end;
  with refs(source_id) as (
    select p.source_id from cns.projects p where p.project_id=p_project_id and p.source_id is not null
    union select e.source_id from cns.events e where e.event_id=v_state.last_event_id and e.source_id is not null
    union select er.source_id from cns.entity_routes er where er.project_id=p_project_id and er.route_kind<>'ARCHIVE' and er.source_id is not null
    union select ab.source_id from cns.authority_bindings ab where ab.project_id=p_project_id and ab.state='ACTIVE' and ab.source_id is not null
    union select cl.source_id from cns.code_lines cl where p_depth>=2 and cl.project_id=p_project_id and cl.role in ('ACTIVE_DEVELOPMENT','FIXED_REVIEW','PRODUCTION') and cl.source_id is not null
    union select mi.source_id from cns.memory_items mi where (mi.project_id=p_project_id or mi.project_id is null) and mi.state='ACTIVE' and mi.depth<=p_depth and mi.source_id is not null
    union select c.source_id from cns.claims c where p_depth>=3 and c.project_id=p_project_id and c.state in ('ACTIVE','DISPUTED') and c.source_id is not null
    union select e.source_id from cns.claims c join cns.claim_evidence ce on ce.claim_id=c.claim_id join cns.evidence e on e.evidence_id=ce.evidence_id
      where p_depth>=3 and c.project_id=p_project_id and c.state in ('ACTIVE','DISPUTED') and e.state in ('ACTIVE','DISPUTED') and e.source_id is not null
  ), active_refs as (
    select distinct s.source_id,s.current_revision,s.authority,s.truth_domain
    from refs r join cns.source_registry s using(source_id)
    where s.state='ACTIVE'
  )
  select coalesce(jsonb_agg(jsonb_build_object('source_id',source_id,'revision',current_revision,'authority',authority,'truth_domain',truth_domain) order by source_id),'[]'::jsonb),
         coalesce(jsonb_object_agg(source_id,coalesce(current_revision,'UNVERSIONED') order by source_id),'{}'::jsonb)
  into v_sources,v_revisions from active_refs;
  select coalesce(jsonb_agg(jsonb_build_object('entity_type',entity_type,'entity_id',entity_id,'route_kind',route_kind,'priority',priority) order by entity_type,entity_id,route_kind,priority),'[]'::jsonb)
  into v_routes from cns.entity_routes where project_id=p_project_id and route_kind<>'ARCHIVE';
  v_dependencies := case when p_depth>=1 then cns.dependency_closure(p_project_id,8) else '[]'::jsonb end;
  v_body := jsonb_build_object(
    'identity', (select to_jsonb(p) from cns.projects p where p.project_id=p_project_id),
    'entity_routes', v_routes,
    'current_state', to_jsonb(v_state),
    'goals', coalesce((select jsonb_agg(to_jsonb(g) order by g.priority,g.goal_id) from cns.goals g where g.project_id=p_project_id and g.state='ACTIVE'),'[]'::jsonb),
    'milestones', case when p_depth>=1 then coalesce((select jsonb_agg(to_jsonb(m) order by m.target_at nulls last,m.milestone_id) from cns.milestones m where m.project_id=p_project_id and m.state in ('ACTIVE','BLOCKED','PLANNED')),'[]'::jsonb) else '[]'::jsonb end,
    'tasks', case when p_depth>=1 then coalesce((select jsonb_agg(to_jsonb(t) order by t.priority,t.updated_at desc,t.task_id) from (select * from cns.tasks where project_id=p_project_id and state in ('READY','ACTIVE','BLOCKED','REVIEW') order by priority,updated_at desc,task_id limit 100) t),'[]'::jsonb) else '[]'::jsonb end,
    'dependency_closure', v_dependencies,
    'code_lines', case when p_depth>=2 then coalesce((select jsonb_agg(to_jsonb(c) order by c.seam,c.role,c.code_line_id) from cns.code_lines c where c.project_id=p_project_id and c.role in ('ACTIVE_DEVELOPMENT','FIXED_REVIEW','PRODUCTION')),'[]'::jsonb) else '[]'::jsonb end,
    'prototypes', case when p_depth>=2 then coalesce((select jsonb_agg(to_jsonb(pr) order by pr.version desc,pr.prototype_id) from cns.prototypes pr where pr.project_id=p_project_id and pr.role in ('ACTIVE_DEVELOPMENT','FIXED_REVIEW','PRODUCTION')),'[]'::jsonb) else '[]'::jsonb end,
    'decisions', case when p_depth>=3 then coalesce((select jsonb_agg(to_jsonb(d) order by d.decided_at desc nulls last,d.decision_id) from cns.decisions d where d.project_id=p_project_id and d.status='ACTIVE'),'[]'::jsonb) else '[]'::jsonb end,
    'claims', case when p_depth>=3 then coalesce((select jsonb_agg(to_jsonb(c) order by c.subject_type,c.subject_id,c.predicate,c.claim_id) from cns.claims c where c.project_id=p_project_id and c.state in ('ACTIVE','DISPUTED')),'[]'::jsonb) else '[]'::jsonb end,
    'memories', coalesce((select jsonb_agg(to_jsonb(mi) order by mi.depth,mi.updated_at desc,mi.memory_id) from (select * from cns.memory_items where (project_id=p_project_id or project_id is null) and state='ACTIVE' and depth<=p_depth order by depth,updated_at desc,memory_id limit 200) mi),'[]'::jsonb),
    'intent', p_intent,
    'requested_depth', p_depth,
    'token_budget', p_token_budget,
    'explicit_exclusions', v_excluded
  );
  if length(v_body::text) > p_token_budget * 6 then raise exception 'CNS_CONTEXT_BUDGET_EXCEEDED: deterministic compiler refuses silent truncation'; end if;
  v_fp := encode(digest(v_body::text||v_revisions::text||v_state.last_event_id::text,'sha256'),'hex');
  insert into cns.context_snapshots(project_id,intent,requested_depth,token_budget,state_event_id,compiled_context,included_sources,excluded_namespaces,source_revisions,fingerprint,expires_at)
  values(p_project_id,p_intent,p_depth,p_token_budget,v_state.last_event_id,v_body,v_sources,v_excluded,v_revisions,v_fp,clock_timestamp()+make_interval(secs=>p_ttl_seconds))
  returning context_snapshot_id into v_id;
  return v_id;
end;
$$;

create or replace view cns.v_meta_control_violations with (security_invoker=true) as
select 'ACTIVE_MEMORY_WITHOUT_EVENT'::text rule_id,'P0'::text severity,'MEMORY'::text entity_type,m.memory_id::text entity_id,m.project_id,'Active memory has no promotion/writeback event'::text summary
from cns.memory_items m where m.state='ACTIVE' and m.last_event_id is null
union all select 'ACTIVE_MEMORY_EXPIRED','P0','MEMORY',m.memory_id,m.project_id,'Expired memory remains ACTIVE' from cns.memory_items m where m.state='ACTIVE' and m.valid_until is not null and m.valid_until<=clock_timestamp()
union all select 'CONTEXT_BUDGET_BREACH','P0','CONTEXT',c.context_snapshot_id::text,c.project_id,'Compiled context exceeds declared fail-closed budget' from cns.context_snapshots c where length(c.compiled_context::text) > c.token_budget*6
union all select 'CONTEXT_SOURCE_REVISION_DRIFT','P0','CONTEXT',c.context_snapshot_id::text,c.project_id,'Valid context references an older revision of a source it actually included' from cns.context_snapshots c where c.invalidated_at is null and exists(select 1 from jsonb_each_text(c.source_revisions) r(source_id,revision) join cns.source_registry s on s.source_id=r.source_id where coalesce(s.current_revision,'UNVERSIONED')<>r.revision or s.state<>'ACTIVE')
union all select 'DOCTOR_BLIND_SPOT','P0',v.entity_type,v.entity_id,v.project_id,'Doctor violation exists without an open matching health incident' from cns.v_superbrain_violations_v2 v where not exists(select 1 from cns.health_incidents i where i.state in ('OPEN','ACKNOWLEDGED') and i.rule_id=v.rule_id and i.entity_type=v.entity_type and i.entity_id=v.entity_id)
union all select 'OPEN_CONFLICT_NOT_REFLECTED_IN_CLAIM_STATE','P1','CLAIM',c.claim_id,c.project_id,'Claim participates in open material conflict but knowledge_state is not CONFLICTED' from cns.claims c where c.state in ('ACTIVE','DISPUTED') and c.knowledge_state<>'CONFLICTED' and exists(select 1 from cns.conflict_claims cc join cns.conflicts cf using(conflict_id) where cc.claim_id=c.claim_id and cf.state='OPEN' and cf.severity in ('P0','P1'))
union all select 'UNKNOWN_WITH_NUMERIC_CONFIDENCE','P1','CLAIM',c.claim_id,c.project_id,'UNKNOWN/INSUFFICIENT_EVIDENCE claim carries numeric confidence' from cns.claims c where c.knowledge_state in ('UNKNOWN','INSUFFICIENT_EVIDENCE') and c.confidence is not null
union all select 'ACCEPTED_LEARNING_WITHOUT_OUTCOME','P1','LEARNING',l.learning_id,l.project_id,'Accepted learning is not linked to an observed outcome' from cns.learnings l where l.state='ACCEPTED' and l.outcome_id is null
union all select 'ACCEPTED_LEARNING_WITHOUT_EVIDENCE','P1','LEARNING',l.learning_id,l.project_id,'Accepted learning has no evidence references' from cns.learnings l where l.state='ACCEPTED' and jsonb_array_length(l.evidence_refs)=0
union all select 'PUBLISHED_HYPOTHESIS_WITHOUT_FALSIFIER','P1','HYPOTHESIS',h.hypothesis_id,h.project_id,'Published hypothesis has no stated falsifier/counter-test' from cns.hypotheses h where h.publication_state='PUBLISHED' and jsonb_array_length(h.falsifiers)=0
union all select 'RESTRICTED_GLOBAL_MEMORY','P0','MEMORY',m.memory_id,m.project_id,'Restricted/secret memory may not be global project-null context' from cns.memory_items m where m.project_id is null and m.state='ACTIVE' and m.sensitivity_state in ('RESTRICTED','SECRET');

update cns.system_meta
set value='{"version":9,"migration":"20260826005500_cns_narrow_context","truth_model":"SUPERBRAIN_V4","context":"PROJECT_SCOPED_JIT","authority_routing":"V1_REPLAY_GUARDED","privacy_export":"V1"}'::jsonb,
    updated_at=clock_timestamp()
where key='schema_version';

commit;
