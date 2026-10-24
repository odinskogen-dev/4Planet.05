-- RECOVERED FROM APPLIED 4PLANET-STAGING MIGRATION JOURNAL 2026-09-03
-- SUPERBRAIN RED TEAM 01 — control-of-control / memory integrity / continuous audit
-- Extends the existing CNS shadow only. No new truth store and no authority cutover.

begin;

create table if not exists cns.control_cycles (
  control_cycle_id uuid primary key default gen_random_uuid(),
  cycle_kind text not null check (cycle_kind in ('DOCTOR','LIBRARIAN','AUDITOR','GATEKEEPER','RECOVERY','CONTEXT','SOURCE_SENTINEL')),
  label text,
  state text not null default 'RUNNING' check (state in ('RUNNING','PASS','FAIL','ERROR')),
  exact_sha text,
  assertions_total integer not null default 0,
  failures integer not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default clock_timestamp(),
  finished_at timestamptz
);
create table if not exists cns.control_assertions (
  control_assertion_id bigint generated always as identity primary key,
  control_cycle_id uuid not null references cns.control_cycles(control_cycle_id) on delete restrict,
  assertion_key text not null,
  severity text not null default 'P1' check (severity in ('INFO','P2','P1','P0')),
  passed boolean not null,
  entity_type text,
  entity_id text,
  project_id text references cns.projects(project_id) on delete restrict,
  evidence jsonb not null default '{}'::jsonb,
  unique(control_cycle_id,assertion_key,entity_type,entity_id)
);
create index if not exists cns_control_cycles_kind_time_idx on cns.control_cycles(cycle_kind,started_at desc);
create index if not exists cns_control_assertions_cycle_idx on cns.control_assertions(control_cycle_id,passed,severity);

create or replace function cns.finish_control_cycle(p_cycle uuid)
returns text language plpgsql security definer set search_path=cns,public as $$
declare v_total integer; v_fail integer; v_state text;
begin
  select count(*),count(*) filter(where passed=false) into v_total,v_fail from cns.control_assertions where control_cycle_id=p_cycle;
  if v_total=0 then raise exception 'CNS_CONTROL_CYCLE_EMPTY'; end if;
  v_state:=case when v_fail=0 then 'PASS' else 'FAIL' end;
  update cns.control_cycles set assertions_total=v_total,failures=v_fail,state=v_state,finished_at=clock_timestamp() where control_cycle_id=p_cycle and state='RUNNING';
  return v_state;
end; $$;

create or replace function cns.guard_memory_integrity() returns trigger language plpgsql as $$
begin
  if tg_op='INSERT' then if new.state='ACTIVE' and coalesce(current_setting('cns.memory_writer',true),'off')<>'on' then raise exception 'CNS_MEMORY_ACTIVE_INSERT_FORBIDDEN'; end if; return new; end if;
  if tg_op='DELETE' then if old.state='ACTIVE' then raise exception 'CNS_ACTIVE_MEMORY_DELETE_FORBIDDEN'; end if; return old; end if;
  if old.state='ACTIVE' then
    if new.content is distinct from old.content or new.authority is distinct from old.authority or new.source_id is distinct from old.source_id or new.source_revision is distinct from old.source_revision or new.fingerprint is distinct from old.fingerprint or new.project_id is distinct from old.project_id or new.memory_type is distinct from old.memory_type or new.depth is distinct from old.depth then raise exception 'CNS_ACTIVE_MEMORY_CONTENT_IMMUTABLE'; end if;
    if new.state is distinct from old.state and coalesce(current_setting('cns.memory_writer',true),'off')<>'on' then raise exception 'CNS_ACTIVE_MEMORY_STATE_CHANGE_REQUIRES_LIBRARIAN'; end if;
  end if;
  if old.state='CANDIDATE' and new.state='ACTIVE' and coalesce(current_setting('cns.memory_writer',true),'off')<>'on' then raise exception 'CNS_MEMORY_PROMOTION_REQUIRES_LIBRARIAN'; end if;
  return new;
end; $$;
drop trigger if exists cns_memory_integrity_guard on cns.memory_items;
create trigger cns_memory_integrity_guard before insert or update or delete on cns.memory_items for each row execute function cns.guard_memory_integrity();

create or replace function cns.librarian_promote_memory(p_memory_id text,p_event_id bigint) returns boolean language plpgsql security definer set search_path=cns,public as $$
begin
  perform set_config('cns.memory_writer','on',true); update cns.memory_items set state='ACTIVE',last_event_id=p_event_id,updated_at=clock_timestamp() where memory_id=p_memory_id and state='CANDIDATE'; perform set_config('cns.memory_writer','off',true); return found;
exception when others then perform set_config('cns.memory_writer','off',true); raise; end; $$;
create or replace function cns.librarian_supersede_memory(p_old_memory_id text,p_new_memory_id text,p_event_id bigint) returns boolean language plpgsql security definer set search_path=cns,public as $$
declare v_new_state text; begin select state into v_new_state from cns.memory_items where memory_id=p_new_memory_id; if v_new_state is distinct from 'ACTIVE' then raise exception 'CNS_SUPERSEDING_MEMORY_MUST_BE_ACTIVE'; end if; perform set_config('cns.memory_writer','on',true); update cns.memory_items set state='SUPERSEDED',valid_until=coalesce(valid_until,clock_timestamp()),last_event_id=p_event_id,updated_at=clock_timestamp() where memory_id=p_old_memory_id and state='ACTIVE'; perform set_config('cns.memory_writer','off',true); return found; exception when others then perform set_config('cns.memory_writer','off',true); raise; end; $$;

create or replace view cns.v_meta_control_violations with (security_invoker=true) as
select 'ACTIVE_MEMORY_WITHOUT_EVENT'::text rule_id,'P0'::text severity,'MEMORY'::text entity_type,m.memory_id::text entity_id,m.project_id,'Active memory has no promotion/writeback event'::text summary from cns.memory_items m where m.state='ACTIVE' and m.last_event_id is null
union all select 'ACTIVE_MEMORY_EXPIRED','P0','MEMORY',m.memory_id,m.project_id,'Expired memory remains ACTIVE' from cns.memory_items m where m.state='ACTIVE' and m.valid_until is not null and m.valid_until<=now()
union all select 'CONTEXT_BUDGET_BREACH','P0','CONTEXT',c.context_snapshot_id::text,c.project_id,'Compiled context exceeds declared fail-closed budget' from cns.context_snapshots c where length(c.compiled_context::text)>c.token_budget*6
union all select 'CONTEXT_SOURCE_REVISION_DRIFT','P0','CONTEXT',c.context_snapshot_id::text,c.project_id,'Valid context references an older source revision' from cns.context_snapshots c where c.invalidated_at is null and exists(select 1 from cns.source_registry s where s.state='ACTIVE' and s.current_revision is not null and coalesce(c.source_revisions->>s.source_id,'MISSING')<>s.current_revision)
union all select 'DOCTOR_BLIND_SPOT','P0',v.entity_type,v.entity_id,v.project_id,'Doctor violation exists without an open matching health incident' from cns.doctor_violations_v3 v where not exists(select 1 from cns.health_incidents i where i.state in ('OPEN','ACKNOWLEDGED') and i.rule_id=v.rule_id and i.entity_type=v.entity_type and i.entity_id=v.entity_id)
union all select 'OPEN_CONFLICT_NOT_REFLECTED_IN_CLAIM_STATE','P1','CLAIM',c.claim_id,c.project_id,'Claim participates in open material conflict but knowledge_state is not CONFLICTED' from cns.claims c where c.state in ('ACTIVE','DISPUTED') and c.knowledge_state<>'CONFLICTED' and exists(select 1 from cns.conflict_claims cc join cns.conflicts cf using(conflict_id) where cc.claim_id=c.claim_id and cf.state='OPEN' and cf.severity in ('P0','P1'))
union all select 'UNKNOWN_WITH_NUMERIC_CONFIDENCE','P1','CLAIM',c.claim_id,c.project_id,'UNKNOWN/INSUFFICIENT_EVIDENCE claim carries numeric confidence' from cns.claims c where c.knowledge_state in ('UNKNOWN','INSUFFICIENT_EVIDENCE') and c.confidence is not null
union all select 'ACCEPTED_LEARNING_WITHOUT_OUTCOME','P1','LEARNING',l.learning_id,l.project_id,'Accepted learning is not linked to an observed outcome' from cns.learnings l where l.state='ACCEPTED' and l.outcome_id is null
union all select 'ACCEPTED_LEARNING_WITHOUT_EVIDENCE','P1','LEARNING',l.learning_id,l.project_id,'Accepted learning has no evidence references' from cns.learnings l where l.state='ACCEPTED' and jsonb_array_length(l.evidence_refs)=0
union all select 'PUBLISHED_HYPOTHESIS_WITHOUT_FALSIFIER','P1','HYPOTHESIS',h.hypothesis_id,h.project_id,'Published hypothesis has no stated falsifier/counter-test' from cns.hypotheses h where h.publication_state='PUBLISHED' and jsonb_array_length(h.falsifiers)=0;

create or replace function cns.audit_control_plane(p_label text default 'periodic',p_exact_sha text default null) returns uuid language plpgsql security definer set search_path=cns,public as $$
declare v_cycle uuid; r record; begin perform cns.doctor_scan(); insert into cns.control_cycles(cycle_kind,label,exact_sha,state,started_at) values('AUDITOR',p_label,p_exact_sha,'RUNNING',clock_timestamp()) returning control_cycle_id into v_cycle; insert into cns.control_assertions(control_cycle_id,assertion_key,severity,passed,evidence) values(v_cycle,'META_AUDITOR_EXECUTED','INFO',true,jsonb_build_object('checked_at',clock_timestamp())); for r in select * from cns.v_meta_control_violations loop insert into cns.control_assertions(control_cycle_id,assertion_key,severity,passed,entity_type,entity_id,project_id,evidence) values(v_cycle,r.rule_id,r.severity,false,r.entity_type,r.entity_id,r.project_id,jsonb_build_object('summary',r.summary)); end loop; perform cns.finish_control_cycle(v_cycle); return v_cycle; end; $$;
create or replace view cns.v_superbrain_operating_readiness with (security_invoker=true) as select r.*,coalesce((select c.state='PASS' and c.finished_at>clock_timestamp()-interval '1 hour' from cns.control_cycles c where c.cycle_kind='AUDITOR' order by c.started_at desc,c.control_cycle_id desc limit 1),false) as control_of_control_green,coalesce((select c.finished_at from cns.control_cycles c where c.cycle_kind='AUDITOR' order by c.started_at desc,c.control_cycle_id desc limit 1),null) as last_meta_audit_at from cns.v_cutover_readiness r;

revoke all on cns.control_cycles,cns.control_assertions from public,anon,authenticated;
revoke all on function cns.finish_control_cycle(uuid) from public,anon,authenticated;
revoke all on function cns.audit_control_plane(text,text) from public,anon,authenticated;
revoke all on function cns.librarian_supersede_memory(text,text,bigint) from public,anon,authenticated;
revoke all on function cns.guard_memory_integrity() from public,anon,authenticated;
grant select,insert,update on cns.control_cycles,cns.control_assertions to service_role;
grant select on cns.v_meta_control_violations,cns.v_superbrain_operating_readiness to service_role;
grant execute on function cns.finish_control_cycle(uuid) to service_role;
grant execute on function cns.audit_control_plane(text,text) to service_role;
grant execute on function cns.librarian_supersede_memory(text,text,bigint) to service_role;
insert into cns.system_meta(key,value) values('control_of_control','{"version":1,"verified":false,"state":"PENDING_CERTIFICATION","max_audit_age_seconds":3600}'::jsonb) on conflict(key) do update set value=excluded.value,updated_at=clock_timestamp();
update cns.system_meta set value='{"version":5,"migration":"20260826001500_cns_control_of_control","truth_model":"SUPERBRAIN_V4","control_of_control":"V1"}'::jsonb,updated_at=clock_timestamp() where key='schema_version';
commit;
