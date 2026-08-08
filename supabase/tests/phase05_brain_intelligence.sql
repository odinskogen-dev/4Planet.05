\set ON_ERROR_STOP on

-- Phase 05 database contract assertions. Run inside local Supabase Postgres.
select postgis_version();

DO $$
DECLARE missing text[];
BEGIN
  select array_agg(name) into missing
  from (values
    ('brain_objects'),('brain_relationships'),('sources'),('problems'),('solutions'),('actors'),('places'),
    ('implementations'),('claims'),('claim_evidence'),('outcome_observations'),('cost_observations'),
    ('transferability_assessments'),('context_pack_runs')
  ) expected(name)
  where to_regclass('public.' || name) is null;
  if missing is not null then
    raise exception 'Missing Phase 05 tables: %', missing;
  end if;
END $$;

DO $$
BEGIN
  if exists (select 1 from pg_policies where schemaname='public' and tablename='gaps' and roles::text like '%anon%') then
    raise exception 'Internal gaps table unexpectedly has anon RLS policy';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='transferability_assessments' and roles::text like '%anon%') then
    raise exception 'Internal transferability table unexpectedly has anon RLS policy';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='claims' and policyname='claims_public_read') then
    raise exception 'claims_public_read policy missing';
  end if;
END $$;

-- Typed graph must reject the generic escape hatch.
DO $$
DECLARE a uuid; b uuid;
BEGIN
  insert into public.brain_objects(public_ref,object_kind,object_type,title,review_status,visibility)
  values ('test:phase05:a','ENTITY','SOLUTION','Test A','REVIEWED','INTERNAL') returning id into a;
  insert into public.brain_objects(public_ref,object_kind,object_type,title,review_status,visibility)
  values ('test:phase05:b','ENTITY','SOLUTION','Test B','REVIEWED','INTERNAL') returning id into b;
  begin
    insert into public.brain_relationships(subject_id,predicate,object_id) values (a,'RELATED_TO',b);
    raise exception 'RELATED_TO should have been rejected';
  exception when check_violation then null;
  end;
  delete from public.brain_relationships where subject_id in (a,b) or object_id in (a,b);
  delete from public.brain_objects where id in (a,b);
END $$;

-- Claim evidence directions remain semantically separate.
DO $$
DECLARE s uuid; c uuid;
BEGIN
  insert into public.brain_objects(public_ref,object_kind,object_type,title,review_status,visibility)
  values ('test:phase05:solution','ENTITY','SOLUTION','Test solution','REVIEWED','INTERNAL') returning id into s;
  insert into public.solutions(object_id,solution_level) values (s,'INTERVENTION');
  insert into public.brain_objects(public_ref,object_kind,object_type,title,review_status,visibility)
  values ('test:phase05:claim','EVIDENCE_OBJECT','CLAIM','Test claim','REVIEWED','INTERNAL') returning id into c;
  insert into public.claims(object_id,subject_id,predicate,value_text,claim_origin,interpretation_status,review_status,evidence_strength)
  values (c,s,'TEST_PREDICATE','test value','SOURCE_REPORTED','SOURCE_REPORTED','REVIEWED','LIMITED');
  if (select subject_id from public.claims where object_id=c) <> s then
    raise exception 'Solution-level claim subject linkage failed';
  end if;
  delete from public.claims where object_id=c;
  delete from public.brain_objects where id=c;
  delete from public.solutions where object_id=s;
  delete from public.brain_objects where id=s;
END $$;

-- PostGIS geometry contract.
DO $$
DECLARE p uuid;
BEGIN
  insert into public.brain_objects(public_ref,object_kind,object_type,title,review_status,visibility)
  values ('test:phase05:place','ENTITY','PLACE','Test place','REVIEWED','INTERNAL') returning id into p;
  insert into public.places(object_id,place_type,geom,spatial_precision,country_code)
  values (p,'CITY',ST_SetSRID(ST_Point(5.3221,60.39299),4326),'POINT','NO');
  if ST_SRID((select geom from public.places where object_id=p)) <> 4326 then
    raise exception 'PostGIS SRID contract failed';
  end if;
  delete from public.places where object_id=p;
  delete from public.brain_objects where id=p;
END $$;

select 'PHASE05_BRAIN_INTELLIGENCE_SQL_GATE_PASS' as result;
