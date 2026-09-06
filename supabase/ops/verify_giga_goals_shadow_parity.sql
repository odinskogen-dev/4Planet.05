-- 4PLANET SUPERBRAIN — GIGA GOALS 24/24 PARITY + DUAL READ
-- Fails atomically on the first mismatch. No stale mismatch result is persisted.
\set ON_ERROR_STOP on

begin;

do $$
declare
  r record;
  v_legacy jsonb;
  v_cns jsonb;
  v_expected_lifecycle text;
begin
  if (select count(*) from cns.legacy_import_queue
      where source_id='giga-goals-2026-09-02'
        and source_revision='GIGA-PLAN-2026-09-02-v3'
        and entity_type='PROJECT_FAMILY'
        and import_purpose='AUTHORITY_DATA') <> 24 then
    raise exception 'CNS_GIGA_GOALS_EXPECTED_24_AUTHORITY_ROWS';
  end if;

  for r in
    select q.*,p.name,p.lifecycle,p.authority as project_authority,
           p.source_id as project_source_id,p.source_revision as project_source_revision,
           pcs.why,pcs.outcome,pcs.current_wbs_gate,pcs.next_action,pcs.last_event_id,
           e.payload as event_payload,e.authority as event_authority,
           e.source_id as event_source_id,e.source_revision as event_source_revision
    from cns.legacy_import_queue q
    join cns.projects p on p.project_id=q.entity_key
    join cns.project_current_state pcs on pcs.project_id=p.project_id
    join cns.events e on e.event_id=pcs.last_event_id
    where q.source_id='giga-goals-2026-09-02'
      and q.source_revision='GIGA-PLAN-2026-09-02-v3'
      and q.entity_type='PROJECT_FAMILY'
      and q.import_purpose='AUTHORITY_DATA'
      and q.state='HYDRATED'
    order by q.entity_key
  loop
    v_expected_lifecycle:=case
      when upper(coalesce(r.raw_payload->>'status',''))='OPTION' then 'INCUBATION'
      when upper(coalesce(r.raw_payload->>'status','')) like 'HOLD%' then 'PAUSED'
      else 'ACTIVE'
    end;

    v_legacy:=jsonb_build_object(
      'project',r.raw_payload->>'project',
      'why',r.raw_payload->>'why',
      'objective',r.raw_payload->>'objective',
      'status',r.raw_payload->>'status',
      'wbs',r.raw_payload->>'wbs',
      'kpi',r.raw_payload->>'kpi',
      'proof',r.raw_payload->>'proof',
      'priority',r.raw_payload->>'priority',
      'economics',r.raw_payload->>'economics',
      'deliverables',r.raw_payload->>'deliverables',
      'founder_gate',r.raw_payload->>'founder_gate',
      'factory_phase',r.raw_payload->>'factory_phase',
      'source_id',r.source_id,
      'source_revision',r.source_revision,
      'raw_fingerprint',r.raw_fingerprint,
      'mapped_lifecycle',v_expected_lifecycle,
      'shadow_authority','SHADOW_COPY'
    );

    v_cns:=jsonb_build_object(
      'project',r.name,
      'why',r.why,
      'objective',r.outcome,
      'status',r.event_payload->>'legacy_status',
      'wbs',r.current_wbs_gate,
      'kpi',r.event_payload->>'kpi',
      'proof',r.event_payload->>'proof',
      'priority',r.event_payload->>'priority',
      'economics',r.event_payload->>'economics',
      'deliverables',r.next_action,
      'founder_gate',r.event_payload->>'founder_gate',
      'factory_phase',r.event_payload->>'factory_phase',
      'source_id',r.project_source_id,
      'source_revision',r.project_source_revision,
      'raw_fingerprint',r.event_payload->>'legacy_raw_fingerprint',
      'mapped_lifecycle',r.lifecycle,
      'shadow_authority',r.project_authority
    );

    perform cns.record_parity(
      r.entity_key,
      'GIGA_GOALS_NORMALIZED_SHADOW',
      v_legacy,
      v_cns,
      jsonb_build_object(
        'legacy_import_id',r.import_id,
        'last_event_id',r.last_event_id,
        'event_authority',r.event_authority,
        'event_source_id',r.event_source_id,
        'event_source_revision',r.event_source_revision
      )
    );
  end loop;

  if (select count(*) from cns.parity_results where dimension='GIGA_GOALS_NORMALIZED_SHADOW') <> 24 then
    raise exception 'CNS_GIGA_GOALS_PARITY_RESULT_COUNT_NOT_24';
  end if;

  if exists(select 1 from cns.parity_results where dimension='GIGA_GOALS_NORMALIZED_SHADOW' and result<>'MATCH') then
    raise exception 'CNS_GIGA_GOALS_PARITY_MISMATCH';
  end if;
end $$;

do $$
declare
  v_run uuid;
  v_state text;
begin
  insert into cns.dual_read_runs(
    state,legacy_revision_set,cns_event_watermark,evidence
  ) values(
    'RUNNING',
    jsonb_build_object('giga-goals-2026-09-02','GIGA-PLAN-2026-09-02-v3'),
    (select max(pcs.last_event_id)
     from cns.project_current_state pcs
     join cns.projects p using(project_id)
     where p.source_id='giga-goals-2026-09-02'),
    jsonb_build_object('dimension','GIGA_GOALS_NORMALIZED_SHADOW','expected_assertions',24)
  ) returning dual_read_run_id into v_run;

  insert into cns.dual_read_assertions(
    dual_read_run_id,project_id,dimension,legacy_fingerprint,cns_fingerprint,result,evidence
  )
  select v_run,project_id,dimension,legacy_fingerprint,cns_fingerprint,result,evidence
  from cns.parity_results
  where dimension='GIGA_GOALS_NORMALIZED_SHADOW'
  order by project_id;

  v_state:=cns.finish_dual_read(v_run);
  if v_state<>'PASS' then
    raise exception 'CNS_GIGA_GOALS_DUAL_READ_NOT_PASS:%',v_state;
  end if;
end $$;

update cns.system_meta
set value=value || jsonb_build_object(
  'verified',true,
  'state','PARITY_AND_DUAL_READ_PASS',
  'parity_matches',24,
  'mismatches',0,
  'verified_at',clock_timestamp()
),updated_at=clock_timestamp()
where key='giga_goals_shadow_hydration';

commit;
