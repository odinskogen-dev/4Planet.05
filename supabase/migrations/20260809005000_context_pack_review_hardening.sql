-- PSI Phase 05 — decision-grade Context Packs must exclude unreviewed graph material.
-- Research candidates remain stored in BRAIN but are not traversed as normal answer context.

begin;

create or replace function public.brain_context_pack(
  p_root_ref text,
  p_predicates text[] default null,
  p_max_hops integer default 2,
  p_max_objects integer default 40,
  p_max_claims integer default 30,
  p_max_sources integer default 40
) returns jsonb language plpgsql stable as $$
declare v_root uuid; v_result jsonb;
begin
  if p_max_hops<0 or p_max_hops>3 then raise exception 'p_max_hops must be 0..3'; end if;
  if p_max_objects<1 or p_max_objects>100 then raise exception 'p_max_objects must be 1..100'; end if;
  if p_max_claims<0 or p_max_claims>100 then raise exception 'p_max_claims must be 0..100'; end if;
  if p_max_sources<0 or p_max_sources>150 then raise exception 'p_max_sources must be 0..150'; end if;
  select id into v_root from public.brain_objects where public_ref=p_root_ref;
  if v_root is null then
    return jsonb_build_object('status','NOT_FOUND','root_ref',p_root_ref,'objects','[]'::jsonb,'relationships','[]'::jsonb,'claims','[]'::jsonb,'sources','[]'::jsonb);
  end if;

  with recursive walk(id,depth) as (
    select v_root,0
    union
    select case when r.subject_id=w.id then r.object_id else r.subject_id end,w.depth+1
    from walk w
    join public.brain_relationships r on (r.subject_id=w.id or r.object_id=w.id)
    where w.depth<p_max_hops
      and r.review_status not in ('UNREVIEWED','REJECTED')
      and (p_predicates is null or r.predicate=any(p_predicates))
  ), objs as (
    select w.id,min(w.depth) depth from walk w group by w.id order by min(w.depth),w.id limit p_max_objects
  ), rels as (
    select r.* from public.brain_relationships r
    where r.subject_id in(select id from objs) and r.object_id in(select id from objs)
      and r.review_status not in ('UNREVIEWED','REJECTED')
      and (p_predicates is null or r.predicate=any(p_predicates))
  ), clms as (
    select c.* from public.claims c
    where c.subject_id in(select id from objs)
      and c.review_status not in ('UNREVIEWED','REJECTED')
    order by case c.evidence_strength when 'STRONG' then 0 when 'MODERATE' then 1 when 'LIMITED' then 2 when 'INSUFFICIENT' then 3 else 4 end,c.created_at desc
    limit p_max_claims
  ), ev as (
    select ce.* from public.claim_evidence ce where ce.claim_id in(select object_id from clms)
  ), src as (
    select distinct sr.id,sr.source_id,sr.source_url,sr.retrieved_at,sr.rights_status,sr.visibility
    from public.source_records sr join ev on ev.source_record_id=sr.id limit p_max_sources
  )
  select jsonb_build_object(
    'status','OK','root_ref',p_root_ref,
    'bounds',jsonb_build_object('max_hops',p_max_hops,'max_objects',p_max_objects,'max_claims',p_max_claims,'max_sources',p_max_sources),
    'objects',coalesce((select jsonb_agg(jsonb_build_object('public_ref',o.public_ref,'object_type',o.object_type,'title',o.title,'review_status',o.review_status,'visibility',o.visibility,'depth',ob.depth) order by ob.depth,o.public_ref) from objs ob join public.brain_objects o on o.id=ob.id),'[]'::jsonb),
    'relationships',coalesce((select jsonb_agg(jsonb_build_object('subject_ref',s.public_ref,'predicate',r.predicate,'object_ref',t.public_ref,'review_status',r.review_status,'interpretation_status',r.interpretation_status,'effectiveness_implication',r.effectiveness_implication)) from rels r join public.brain_objects s on s.id=r.subject_id join public.brain_objects t on t.id=r.object_id),'[]'::jsonb),
    'claims',coalesce((select jsonb_agg(jsonb_build_object('claim_ref',co.public_ref,'subject_ref',so.public_ref,'predicate',c.predicate,'object_ref',oo.public_ref,'value_text',c.value_text,'value_numeric',c.value_numeric,'value_unit',c.value_unit,'review_status',c.review_status,'evidence_strength',c.evidence_strength,'interpretation_status',c.interpretation_status,'evidence',coalesce((select jsonb_agg(jsonb_build_object('source_record_id',ce.source_record_id,'direction',ce.direction,'directness',ce.directness,'geography',ce.geography,'limitations',ce.limitations)) from public.claim_evidence ce where ce.claim_id=c.object_id),'[]'::jsonb))) from clms c join public.brain_objects co on co.id=c.object_id join public.brain_objects so on so.id=c.subject_id left join public.brain_objects oo on oo.id=c.object_value_id),'[]'::jsonb),
    'sources',coalesce((select jsonb_agg(to_jsonb(src)) from src),'[]'::jsonb),
    'truth_boundary',jsonb_build_object(
      'source_is_claim',false,
      'claim_is_verified_fact',false,
      'relation_is_effectiveness',false,
      'database_absence_is_real_world_absence',false,
      'unreviewed_material_in_normal_context',false
    )
  ) into v_result;
  return v_result;
end $$;

comment on function public.brain_context_pack(text,text[],integer,integer,integer,integer) is
'Bounded BRAIN Context Pack for decision support. Normal traversal excludes UNREVIEWED and REJECTED relationships/claims; research candidates remain stored but are not silently laundered into answer context.';

commit;
