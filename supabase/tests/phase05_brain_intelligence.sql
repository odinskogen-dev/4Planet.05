\set ON_ERROR_STOP on

select postgis_version();

DO $$
DECLARE missing text[];
BEGIN
  select array_agg(name) into missing
  from (values
    ('brain_canon_decisions'),('brain_object_types'),('brain_objects'),('brain_relationships'),
    ('problem_frames'),('solution_pathways'),('interventions'),('offerings'),('needs'),
    ('actors'),('places'),('implementations'),('implementation_events'),('public_decisions'),
    ('expected_outcomes'),('measurements'),('brain_outcomes'),('gaps'),('predicate_definitions'),
    ('predicate_constraints'),('claims'),('claim_evidence'),('assessment_runs'),('assessments'),
    ('cost_observations'),('transferability_assessments'),('brain_import_batches'),
    ('brain_staging_records'),('brain_quarantine_records'),('context_pack_runs')
  ) expected(name)
  where to_regclass('public.' || name) is null;
  if missing is not null then raise exception 'Missing canonical BRAIN tables: %',missing; end if;
END $$;

DO $$
BEGIN
  if (select count(*) from public.brain_canon_decisions where decision_id like 'FD-%') <> 6 then raise exception 'Expected exactly six founder canon decisions'; end if;
  if exists(select 1 from public.brain_canon_decisions where approved_by <> 'Odin Oddekalv') then raise exception 'Unexpected canon decision approver'; end if;
END $$;

DO $$ BEGIN
  if to_regclass('public.problems') is not null then raise exception 'Generic problems table must not exist'; end if;
  if not exists(select 1 from public.brain_object_types where object_type='PROBLEM_FRAME') then raise exception 'PROBLEM_FRAME missing'; end if;
END $$;

DO $$ BEGIN
  if to_regclass('public.solutions') is not null then raise exception 'Generic solutions table must not exist'; end if;
  if exists(select 1 from public.brain_object_types where object_type in ('SOLUTION','VARIANT')) then raise exception 'Generic SOLUTION or durable VARIANT type present'; end if;
  if (select count(*) from public.brain_object_types where object_type in ('SOLUTION_PATHWAY','INTERVENTION','OFFERING')) <> 3 then raise exception 'Canonical solution identity set incomplete'; end if;
END $$;

DO $$
DECLARE n uuid;
BEGIN
  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:need:external','NEED','External need','REVIEWED') returning id into n;
  begin
    insert into public.needs(object_id,need_kind,need_origin,statement) values(n,'CHALLENGE','EXTERNAL_EXPLICIT','External claim without source');
    raise exception 'External NEED without source_record should fail';
  exception when check_violation then null;
  end;
  insert into public.needs(object_id,need_kind,need_origin,statement) values(n,'RESEARCH','INTERNAL_SCENARIO','Internal research need');
  delete from public.needs where object_id=n; delete from public.brain_objects where id=n;
END $$;

DO $$
DECLARE i uuid;
BEGIN
  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:impl:lifecycle','IMPLEMENTATION','Lifecycle test','REVIEWED') returning id into i;
  insert into public.implementations(object_id,execution_phase,execution_state) values(i,'PILOT','ACTIVE');
  if (select execution_phase from public.implementations where object_id=i) <> 'PILOT' then raise exception 'Execution phase failed'; end if;
  if (select execution_state from public.implementations where object_id=i) <> 'ACTIVE' then raise exception 'Execution state failed'; end if;
  begin
    update public.implementations set execution_phase='FINANCED' where object_id=i;
    raise exception 'FINANCED must not be lifecycle phase';
  exception when check_violation then null;
  end;
  delete from public.implementations where object_id=i; delete from public.brain_objects where id=i;
END $$;

DO $$ BEGIN
  if exists(select 1 from pg_policies where schemaname='public' and tablename='brain_review_designations' and roles::text like '%anon%') then raise exception 'GOLD designation unexpectedly public'; end if;
END $$;

DO $$
DECLARE p uuid; s uuid; a uuid;
BEGIN
  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:problem','PROBLEM_FRAME','Test problem','REVIEWED') returning id into p;
  insert into public.problem_frames(object_id,statement,scope) values(p,'Scoped test problem','TEST');
  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:pathway','SOLUTION_PATHWAY','Test pathway','REVIEWED') returning id into s;
  insert into public.solution_pathways(object_id) values(s);
  insert into public.brain_relationships(subject_id,predicate,object_id,review_status) values(s,'ADDRESSES',p,'REVIEWED') returning id into a;
  if (select effectiveness_implication from public.brain_relationships where id=a) <> 'NONE' then raise exception 'ADDRESSES inherited effectiveness'; end if;
  begin
    insert into public.brain_relationships(subject_id,predicate,object_id) values(p,'ADDRESSES',s);
    raise exception 'Invalid PROBLEM_FRAME -> ADDRESSES -> SOLUTION_PATHWAY accepted';
  exception when check_violation then null;
  end;
  delete from public.brain_relationships where subject_id in(p,s) or object_id in(p,s);
  delete from public.solution_pathways where object_id=s; delete from public.problem_frames where object_id=p;
  delete from public.brain_objects where id in(p,s);
END $$;

DO $$
DECLARE s uuid; c uuid;
BEGIN
  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:claim:subject','INTERVENTION','Claim subject','REVIEWED') returning id into s;
  insert into public.interventions(object_id) values(s);
  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:claim','CLAIM','Claim','REVIEWED') returning id into c;
  insert into public.claims(object_id,subject_id,predicate,value_text,claim_origin,interpretation_status,review_status,evidence_strength)
  values(c,s,'TEST','one value','SOURCE_REPORTED','SOURCE_REPORTED','REVIEWED','LIMITED');
  delete from public.claims where object_id=c;
  begin
    insert into public.claims(object_id,subject_id,predicate,value_text,value_numeric,claim_origin,interpretation_status)
    values(c,s,'TEST','two',2,'SOURCE_REPORTED','SOURCE_REPORTED');
    raise exception 'Claim with two value channels accepted';
  exception when check_violation then null;
  end;
  delete from public.brain_objects where id=c; delete from public.interventions where object_id=s; delete from public.brain_objects where id=s;
END $$;

DO $$
DECLARE p uuid;
BEGIN
  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:place','PLACE','Test place','REVIEWED') returning id into p;
  insert into public.places(object_id,place_type,geom,spatial_precision,country_code) values(p,'CITY',ST_SetSRID(ST_Point(5.3221,60.39299),4326),'POINT','NO');
  if ST_SRID((select geom from public.places where object_id=p)) <> 4326 then raise exception 'PostGIS SRID contract failed'; end if;
  delete from public.places where object_id=p; delete from public.brain_objects where id=p;
END $$;

DO $$
DECLARE r1 bigint; r2 bigint;
BEGIN
  insert into public.brain_import_batches(batch_key,source_release,package_sha256) values('test-batch','TEST','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  r1:=public.stage_brain_record('test-batch','OBJECT','X','{"x":1}'::jsonb,'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
  r2:=public.stage_brain_record('test-batch','OBJECT','X','{"x":1}'::jsonb,'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
  if r1<>r2 then raise exception 'Idempotent staging failed'; end if;
  if (select count(*) from public.brain_staging_records where batch_id=(select id from public.brain_import_batches where batch_key='test-batch'))<>1 then raise exception 'Duplicate staging row created'; end if;
  update public.brain_staging_records set validation_status='VALID' where id=r1;
  begin
    perform public.promote_brain_import_batch('test-batch','CI');
    raise exception 'Promotion without founder_release should fail';
  exception when raise_exception then
    if sqlerrm not like '%Founder release required%' then raise; end if;
  end;
  delete from public.brain_import_batches where batch_key='test-batch';
END $$;

DO $$
DECLARE p uuid; s uuid; c uuid; cp jsonb;
BEGIN
  insert into public.source_records(id,source_id,source_record_id,source_url,retrieved_at,licence,attribution,rights_status,visibility,raw_payload)
  values('test-source-record','TEST','1','https://example.org/source',now(),'TEST','Test','ACCEPTABLE','INTERNAL','{}');
  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:ctx:problem','PROBLEM_FRAME','Context problem','REVIEWED') returning id into p;
  insert into public.problem_frames(object_id,statement,scope) values(p,'Context problem statement','TEST');
  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:ctx:pathway','SOLUTION_PATHWAY','Context pathway','REVIEWED') returning id into s;
  insert into public.solution_pathways(object_id) values(s);
  insert into public.brain_relationships(subject_id,predicate,object_id,review_status) values(s,'ADDRESSES',p,'REVIEWED');
  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:ctx:claim','CLAIM','Context claim','REVIEWED') returning id into c;
  insert into public.claims(object_id,subject_id,predicate,value_text,claim_origin,interpretation_status,review_status,evidence_strength)
  values(c,s,'MAY_HELP','Context-specific evidence','SOURCE_REPORTED','SOURCE_REPORTED','REVIEWED','MODERATE');
  insert into public.claim_evidence(claim_id,source_record_id,direction) values(c,'test-source-record','QUALIFIES');
  cp:=public.brain_context_pack('test:ctx:problem',array['ADDRESSES'],2,10,10,10);
  if cp->>'status'<>'OK' then raise exception 'Context pack status failed: %',cp; end if;
  if jsonb_array_length(cp->'objects')>10 then raise exception 'Context pack object bound failed'; end if;
  if (cp->'truth_boundary'->>'relation_is_effectiveness')::boolean then raise exception 'Truth boundary failed'; end if;
  delete from public.claim_evidence where claim_id=c; delete from public.claims where object_id=c; delete from public.brain_objects where id=c;
  delete from public.brain_relationships where subject_id=s or object_id=s;
  delete from public.solution_pathways where object_id=s; delete from public.problem_frames where object_id=p;
  delete from public.brain_objects where id in(p,s); delete from public.source_records where id='test-source-record';
END $$;

select 'PHASE05_BRAIN_INTELLIGENCE_SQL_GATE_PASS' as result;
