-- Phase 06 — Context Pack v4
-- Adds decision-relevant implementation/outcome/economics/transferability/gap sections
-- while preserving bounded reviewed-only graph/claim retrieval.

begin;

create or replace function public.brain_context_pack_v4(
  p_root_ref text,
  p_predicates text[] default null,
  p_max_hops integer default 2,
  p_max_objects integer default 40,
  p_max_claims integer default 30,
  p_max_sources integer default 40,
  p_max_implementations integer default 12,
  p_max_outcomes integer default 20,
  p_max_costs integer default 12,
  p_max_gaps integer default 10
) returns jsonb language plpgsql stable as $$
declare v_root uuid; v_result jsonb;
begin
  if p_max_hops<0 or p_max_hops>3 then raise exception 'p_max_hops must be 0..3'; end if;
  if p_max_objects<1 or p_max_objects>100 then raise exception 'p_max_objects must be 1..100'; end if;
  if p_max_claims<0 or p_max_claims>100 then raise exception 'p_max_claims must be 0..100'; end if;
  if p_max_sources<0 or p_max_sources>150 then raise exception 'p_max_sources must be 0..150'; end if;
  if p_max_implementations<0 or p_max_implementations>40 then raise exception 'p_max_implementations must be 0..40'; end if;
  if p_max_outcomes<0 or p_max_outcomes>60 then raise exception 'p_max_outcomes must be 0..60'; end if;
  if p_max_costs<0 or p_max_costs>40 then raise exception 'p_max_costs must be 0..40'; end if;
  if p_max_gaps<0 or p_max_gaps>30 then raise exception 'p_max_gaps must be 0..30'; end if;

  select id into v_root from public.brain_objects where public_ref=p_root_ref;
  if v_root is null then
    return jsonb_build_object(
      'status','NOT_FOUND','root_ref',p_root_ref,
      'objects','[]'::jsonb,'relationships','[]'::jsonb,'claims','[]'::jsonb,
      'implementations','[]'::jsonb,'outcomes','[]'::jsonb,'economics','[]'::jsonb,
      'transferability','[]'::jsonb,'gaps','[]'::jsonb,'sources','[]'::jsonb
    );
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
    select w.id,min(w.depth) depth
    from walk w
    group by w.id
    order by min(w.depth),w.id
    limit p_max_objects
  ), rels as (
    select r.* from public.brain_relationships r
    where r.subject_id in(select id from objs)
      and r.object_id in(select id from objs)
      and r.review_status not in ('UNREVIEWED','REJECTED')
      and (p_predicates is null or r.predicate=any(p_predicates))
  ), clms as (
    select c.* from public.claims c
    where c.subject_id in(select id from objs)
      and c.review_status not in ('UNREVIEWED','REJECTED')
    order by
      case c.evidence_strength when 'STRONG' then 0 when 'MODERATE' then 1
        when 'LIMITED' then 2 when 'INSUFFICIENT' then 3 else 4 end,
      c.created_at desc
    limit p_max_claims
  ), ev as (
    select ce.* from public.claim_evidence ce where ce.claim_id in(select object_id from clms)
  ), impl as (
    select i.* from public.implementations i
    where i.object_id in(select id from objs)
    order by i.started_at desc nulls last
    limit p_max_implementations
  ), outs as (
    select o.* from public.brain_outcomes o
    where o.target_object_id in(select id from objs)
       or o.target_object_id in(select object_id from impl)
    order by o.object_id
    limit p_max_outcomes
  ), costs as (
    select c.* from public.cost_observations c
    where c.target_object_id in(select id from objs)
       or c.target_object_id in(select object_id from impl)
    order by c.id
    limit p_max_costs
  ), trn as (
    select t.* from public.transferability_assessments t
    where t.object_id in(select id from objs)
       or t.intervention_id in(select id from objs)
    order by t.object_id
    limit 12
  ), gp as (
    select g.* from public.gaps g
    where g.problem_id in(select id from objs)
       or g.object_id in(select id from objs)
    order by g.object_id
    limit p_max_gaps
  ), source_ids as (
    select source_record_id from ev
    union select source_record_id from outs where source_record_id is not null
    union select source_record_id from costs where source_record_id is not null
  ), src as (
    select distinct sr.id,sr.source_id,sr.source_url,sr.retrieved_at,sr.rights_status,sr.visibility
    from public.source_records sr join source_ids x on x.source_record_id=sr.id
    limit p_max_sources
  )
  select jsonb_build_object(
    'status','OK',
    'root_ref',p_root_ref,
    'context_pack_version','4.0',
    'bounds',jsonb_build_object(
      'max_hops',p_max_hops,'max_objects',p_max_objects,'max_claims',p_max_claims,
      'max_sources',p_max_sources,'max_implementations',p_max_implementations,
      'max_outcomes',p_max_outcomes,'max_costs',p_max_costs,'max_gaps',p_max_gaps
    ),
    'objects',coalesce((
      select jsonb_agg(jsonb_build_object(
        'public_ref',o.public_ref,'object_type',o.object_type,'title',o.title,
        'review_status',o.review_status,'lifecycle_state',o.lifecycle_state,
        'visibility',o.visibility,'depth',ob.depth
      ) order by ob.depth,o.public_ref)
      from objs ob join public.brain_objects o on o.id=ob.id
    ),'[]'::jsonb),
    'relationships',coalesce((
      select jsonb_agg(jsonb_build_object(
        'subject_ref',s.public_ref,'predicate',r.predicate,'object_ref',t.public_ref,
        'review_status',r.review_status,'interpretation_status',r.interpretation_status,
        'effectiveness_implication',r.effectiveness_implication,'relation_basis',r.relation_basis
      ))
      from rels r
      join public.brain_objects s on s.id=r.subject_id
      join public.brain_objects t on t.id=r.object_id
    ),'[]'::jsonb),
    'claims',coalesce((
      select jsonb_agg(jsonb_build_object(
        'claim_ref',co.public_ref,'subject_ref',so.public_ref,'predicate',c.predicate,
        'object_ref',oo.public_ref,'value_text',c.value_text,'value_numeric',c.value_numeric,
        'value_unit',c.value_unit,'review_status',c.review_status,
        'evidence_strength',c.evidence_strength,'interpretation_status',c.interpretation_status,
        'evidence',coalesce((
          select jsonb_agg(jsonb_build_object(
            'source_record_id',ce.source_record_id,'direction',ce.direction,
            'directness',ce.directness,'measurement_type',ce.measurement_type,
            'independence',ce.independence,'evidence_tier',ce.evidence_tier,
            'geography',ce.geography,'limitations',ce.limitations
          ) order by ce.direction,ce.source_record_id)
          from public.claim_evidence ce where ce.claim_id=c.object_id
        ),'[]'::jsonb)
      ))
      from clms c
      join public.brain_objects co on co.id=c.object_id
      join public.brain_objects so on so.id=c.subject_id
      left join public.brain_objects oo on oo.id=c.object_value_id
    ),'[]'::jsonb),
    'evidence_lanes',jsonb_build_object(
      'supports',(select count(*) from ev where direction='SUPPORTS'),
      'qualifies',(select count(*) from ev where direction='QUALIFIES'),
      'challenges',(select count(*) from ev where direction='CHALLENGES')
    ),
    'implementations',coalesce((
      select jsonb_agg(jsonb_build_object(
        'implementation_ref',bo.public_ref,'title',bo.title,
        'execution_phase',i.execution_phase,'execution_state',i.execution_state,
        'started_at',i.started_at,'scale_note',i.scale_note,
        'interventions',coalesce((
          select jsonb_agg(io.public_ref order by io.public_ref)
          from public.implementation_interventions ii
          join public.brain_objects io on io.id=ii.intervention_id
          where ii.implementation_id=i.object_id
        ),'[]'::jsonb),
        'actors',coalesce((
          select jsonb_agg(jsonb_build_object('actor_ref',ao.public_ref,'title',ao.title,'role',ia.role))
          from public.implementation_actors ia join public.brain_objects ao on ao.id=ia.actor_id
          where ia.implementation_id=i.object_id
        ),'[]'::jsonb),
        'places',coalesce((
          select jsonb_agg(jsonb_build_object(
            'place_ref',po.public_ref,'title',po.title,'role',ip.role,
            'spatial_precision',p.spatial_precision,'has_geometry',(p.geom is not null)
          ))
          from public.implementation_places ip
          join public.brain_objects po on po.id=ip.place_id
          join public.places p on p.object_id=ip.place_id
          where ip.implementation_id=i.object_id
        ),'[]'::jsonb)
      ))
      from impl i join public.brain_objects bo on bo.id=i.object_id
    ),'[]'::jsonb),
    'outcomes',coalesce((
      select jsonb_agg(jsonb_build_object(
        'outcome_ref',bo.public_ref,'target_ref',to1.public_ref,'stage',o.outcome_stage,
        'statement',o.statement,'evidence_basis',o.evidence_basis,
        'source_record_id',o.source_record_id,'limitations',o.limitations
      ))
      from outs o
      join public.brain_objects bo on bo.id=o.object_id
      join public.brain_objects to1 on to1.id=o.target_object_id
    ),'[]'::jsonb),
    'economics',coalesce((
      select jsonb_agg(jsonb_build_object(
        'target_ref',bo.public_ref,'cost_type',c.cost_type,'amount',c.amount,
        'amount_low',c.amount_low,'amount_high',c.amount_high,'currency',c.currency,
        'price_year',c.price_year,'unit_basis',c.unit_basis,'geography',c.geography,
        'observation_basis',c.observation_basis,'source_record_id',c.source_record_id,
        'limitations',c.limitations
      ))
      from costs c join public.brain_objects bo on bo.id=c.target_object_id
    ),'[]'::jsonb),
    'transferability',coalesce((
      select jsonb_agg(jsonb_build_object(
        'assessment_ref',bo.public_ref,'intervention_ref',io.public_ref,
        'target_place_ref',tp.public_ref,'decision_context',t.decision_context,
        'factors',t.factors,'conclusion_class',t.conclusion_class,
        'material_unknowns',t.material_unknowns
      ))
      from trn t
      join public.brain_objects bo on bo.id=t.object_id
      left join public.brain_objects io on io.id=t.intervention_id
      left join public.brain_objects tp on tp.id=t.target_place_id
    ),'[]'::jsonb),
    'gaps',coalesce((
      select jsonb_agg(jsonb_build_object(
        'gap_ref',bo.public_ref,'problem_ref',po.public_ref,'gap_type',g.gap_type,
        'statement',g.statement,'assessment_kind',g.assessment_kind
      ))
      from gp g
      join public.brain_objects bo on bo.id=g.object_id
      left join public.brain_objects po on po.id=g.problem_id
    ),'[]'::jsonb),
    'sources',coalesce((select jsonb_agg(to_jsonb(src)) from src),'[]'::jsonb),
    'excluded',jsonb_build_object(
      'unreviewed_relationships',(
        select count(*) from public.brain_relationships r
        where (r.subject_id in(select id from objs) or r.object_id in(select id from objs))
          and r.review_status='UNREVIEWED'
      ),
      'unreviewed_claims',(
        select count(*) from public.claims c
        where c.subject_id in(select id from objs) and c.review_status='UNREVIEWED'
      ),
      'object_budget_reached',((select count(*) from objs)>=p_max_objects),
      'claim_budget_reached',((select count(*) from clms)>=p_max_claims)
    ),
    'truth_boundary',jsonb_build_object(
      'source_is_claim',false,
      'claim_is_verified_fact',false,
      'relation_is_effectiveness',false,
      'database_absence_is_real_world_absence',false,
      'unreviewed_material_in_normal_context',false,
      'qualifies_is_challenges',false,
      'staging_is_production',false
    )
  ) into v_result;

  return v_result;
end $$;

revoke all on function public.brain_context_pack_v4(text,text[],integer,integer,integer,integer,integer,integer,integer,integer) from public,anon,authenticated;

comment on function public.brain_context_pack_v4(text,text[],integer,integer,integer,integer,integer,integer,integer,integer) is
'Phase06 bounded decision Context Pack. Adds implementation/outcome/economics/transferability/gaps and excluded-budget accounting; only reviewed graph/claims enter normal context.';

commit;
