\set ON_ERROR_STOP on

DO $$
DECLARE root_id uuid; reviewed_id uuid; unreviewed_id uuid; reviewed_claim uuid; unreviewed_claim uuid; cp jsonb;
BEGIN
  insert into public.source_records(id,source_id,source_record_id,source_url,retrieved_at,licence,attribution,rights_status,visibility,raw_payload)
  values('test-cp-review-source','TEST','context-review','https://example.org/context-review',now(),'TEST','Test','ACCEPTABLE','INTERNAL','{}');

  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:cp:root','PROBLEM_FRAME','Context root','REVIEWED') returning id into root_id;
  insert into public.problem_frames(object_id,statement,scope) values(root_id,'Context root','TEST');

  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:cp:reviewed','SOLUTION_PATHWAY','Reviewed path','REVIEWED') returning id into reviewed_id;
  insert into public.solution_pathways(object_id) values(reviewed_id);
  insert into public.brain_relationships(subject_id,predicate,object_id,review_status) values(reviewed_id,'ADDRESSES',root_id,'REVIEWED');

  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:cp:unreviewed','SOLUTION_PATHWAY','Unreviewed path','UNREVIEWED') returning id into unreviewed_id;
  insert into public.solution_pathways(object_id) values(unreviewed_id);
  insert into public.brain_relationships(subject_id,predicate,object_id,review_status) values(unreviewed_id,'ADDRESSES',root_id,'UNREVIEWED');

  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:cp:reviewed-claim','CLAIM','Reviewed claim','REVIEWED') returning id into reviewed_claim;
  insert into public.claims(object_id,subject_id,predicate,value_text,claim_origin,interpretation_status,review_status,evidence_strength)
  values(reviewed_claim,reviewed_id,'MAY_HELP','Reviewed evidence','SOURCE_REPORTED','SOURCE_REPORTED','REVIEWED','MODERATE');
  insert into public.claim_evidence(claim_id,source_record_id,direction) values(reviewed_claim,'test-cp-review-source','QUALIFIES');

  insert into public.brain_objects(public_ref,object_type,title,review_status) values('test:cp:unreviewed-claim','CLAIM','Unreviewed claim','UNREVIEWED') returning id into unreviewed_claim;
  insert into public.claims(object_id,subject_id,predicate,value_text,claim_origin,interpretation_status,review_status,evidence_strength)
  values(unreviewed_claim,reviewed_id,'MAY_HELP','Research candidate','4PLANET_ASSESSMENT','INFERENCE','UNREVIEWED','UNASSESSED');

  cp:=public.brain_context_pack('test:cp:root',array['ADDRESSES'],2,10,10,10);
  if cp::text not like '%test:cp:reviewed%' then raise exception 'Reviewed relation was not retrieved: %',cp; end if;
  if cp::text like '%test:cp:unreviewed%' then raise exception 'Unreviewed material leaked into normal context: %',cp; end if;
  if (cp->'truth_boundary'->>'unreviewed_material_in_normal_context')::boolean then raise exception 'Context truth boundary incorrect'; end if;

  delete from public.claim_evidence where claim_id=reviewed_claim;
  delete from public.claims where object_id in(reviewed_claim,unreviewed_claim);
  delete from public.brain_relationships where subject_id in(reviewed_id,unreviewed_id) or object_id in(reviewed_id,unreviewed_id);
  delete from public.brain_objects where id in(reviewed_claim,unreviewed_claim);
  delete from public.solution_pathways where object_id in(reviewed_id,unreviewed_id);
  delete from public.problem_frames where object_id=root_id;
  delete from public.brain_objects where id in(reviewed_id,unreviewed_id,root_id);
  -- source_records are immutable; ephemeral reset removes this test fixture.
END $$;

select 'PHASE05_CONTEXT_PACK_REVIEW_GATE_PASS' as result;
