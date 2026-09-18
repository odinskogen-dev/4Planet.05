-- 4PLANET SUPERBRAIN — GIGA GOALS BOUNDED SHADOW HYDRATION
-- Copies the already staged PROJECT_FAMILY slice into CNS project identity/current-state
-- without changing authority. Legacy Drive/BRAIN remains authoritative.
\set ON_ERROR_STOP on

begin;

do $$
declare
  r record;
  v_lifecycle text;
  v_health text;
  v_event bigint;
begin
  for r in
    select q.*
    from cns.legacy_import_queue q
    where q.source_id='giga-goals-2026-09-02'
      and q.source_revision='GIGA-PLAN-2026-09-02-v3'
      and q.entity_type='PROJECT_FAMILY'
      and q.import_purpose='AUTHORITY_DATA'
      and q.state in ('STAGED','HYDRATED')
    order by q.entity_key
  loop
    v_lifecycle:=case
      when upper(coalesce(r.raw_payload->>'status',''))='OPTION' then 'INCUBATION'
      when upper(coalesce(r.raw_payload->>'status','')) like 'HOLD%' then 'PAUSED'
      else 'ACTIVE'
    end;
    v_health:=case
      when upper(coalesce(r.raw_payload->>'status','')) like '%AT RISK%' then 'RED'
      else 'UNKNOWN'
    end;

    insert into cns.projects(
      project_id,slug,name,parent_project_id,project_kind,lifecycle,authority,
      source_id,source_revision
    ) values(
      r.entity_key,
      r.entity_key,
      coalesce(nullif(r.raw_payload->>'project',''),r.entity_key),
      null,
      'PROJECT_FAMILY',
      v_lifecycle,
      'SHADOW_COPY',
      r.source_id,
      r.source_revision
    )
    on conflict(project_id) do update
    set name=excluded.name,
        lifecycle=excluded.lifecycle,
        authority='SHADOW_COPY',
        source_id=excluded.source_id,
        source_revision=excluded.source_revision,
        updated_at=clock_timestamp();

    v_event:=cns.commit_project_state(
      r.entity_key,
      jsonb_build_object(
        'projection_version',1,
        'state',v_lifecycle,
        'why',r.raw_payload->>'why',
        'outcome',r.raw_payload->>'objective',
        'primary_goal_ids','[]'::jsonb,
        'current_wbs_gate',r.raw_payload->>'wbs',
        'next_action',r.raw_payload->>'deliverables',
        'blockers','[]'::jsonb,
        'owner','4PLANET',
        'founder_burden','NONE',
        'health',v_health,
        'legacy_status',r.raw_payload->>'status',
        'priority',r.raw_payload->>'priority',
        'kpi',r.raw_payload->>'kpi',
        'proof',r.raw_payload->>'proof',
        'economics',r.raw_payload->>'economics',
        'founder_gate',r.raw_payload->>'founder_gate',
        'factory_phase',r.raw_payload->>'factory_phase',
        'legacy_raw_fingerprint',r.raw_fingerprint,
        'authority_note','SHADOW COPY ONLY — Legacy Drive/BRAIN remains authoritative until explicit cutover'
      ),
      'SYSTEM',
      'superbrain-giga-goals-hydrator',
      'SHADOW_COPY',
      r.source_id,
      r.source_revision,
      'giga-goals-shadow-hydrate:'||r.entity_key||':'||r.raw_fingerprint,
      86400,
      jsonb_build_array(jsonb_build_object(
        'legacy_import_id',r.import_id,
        'raw_fingerprint',r.raw_fingerprint,
        'source_id',r.source_id,
        'source_revision',r.source_revision
      ))
    );

    update cns.legacy_import_queue
    set state='HYDRATED',hydrated_at=clock_timestamp()
    where import_id=r.import_id;
  end loop;
end $$;

-- Hydration completeness deliberately remains FALSE here. This is one bounded
-- organisational slice, not the complete Knowledge OS/BRAIN corpus.
insert into cns.system_meta(key,value)
values(
  'giga_goals_shadow_hydration',
  jsonb_build_object(
    'verified',false,
    'state','HYDRATED_AWAITING_PARITY',
    'source_id','giga-goals-2026-09-02',
    'source_revision','GIGA-PLAN-2026-09-02-v3',
    'project_family_count',(select count(*) from cns.projects where source_id='giga-goals-2026-09-02'),
    'authority','SHADOW_COPY'
  )
)
on conflict(key) do update set value=excluded.value,updated_at=clock_timestamp();

commit;
