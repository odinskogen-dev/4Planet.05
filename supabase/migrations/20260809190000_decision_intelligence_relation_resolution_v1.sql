-- 4PLANET_ Decision Intelligence v3 — controlled resolution of six quarantined M:N relations.
-- Historical rows are preserved. Incorrect relations become REJECTED; three broad relations remain qualified.
-- ADDRESSES never implies effectiveness.

begin;

create or replace function public.brain_apply_relation_resolution_20260809_v1()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_rejected integer := 0;
  v_qualified integer := 0;
begin
  update public.brain_relationships r
     set review_status = 'REJECTED',
         relation_confidence = 'REJECTED_MAPPING',
         relation_basis = concat_ws(' | ', nullif(r.relation_basis,''),
           'DI_V3_RELATION_RESOLUTION: incorrect domain-fallback mapping; historical row preserved but excluded from reviewed decision context.'),
         effectiveness_implication = 'NONE'
    from public.brain_objects s, public.brain_objects o
   where r.subject_id = s.id
     and r.object_id = o.id
     and r.predicate = 'ADDRESSES'
     and s.public_ref in ('4P-SOL-000199','4P-SOL-000200','4P-SOL-000201')
     and o.public_ref = '4P-PX-0090';
  get diagnostics v_rejected = row_count;

  update public.brain_relationships r
     set review_status = case when r.review_status in ('UNREVIEWED','SOURCE_CHECKED') then 'REVIEWED' else r.review_status end,
         relation_confidence = 'QUALIFIED_BROAD_UPSTREAM',
         relation_basis = concat_ws(' | ', nullif(r.relation_basis,''),
           'DI_V3_RELATION_RESOLUTION: relevant broad/upstream relation only; does not establish biodiversity effectiveness or observed ecological outcome.'),
         effectiveness_implication = 'NONE'
    from public.brain_objects s, public.brain_objects o
   where r.subject_id = s.id
     and r.object_id = o.id
     and r.predicate = 'ADDRESSES'
     and s.public_ref in ('4P-SOL-000295','4P-SOL-000296','4P-SOL-000297')
     and o.public_ref = '4P-PX-0011'
     and r.review_status <> 'REJECTED';
  get diagnostics v_qualified = row_count;

  return jsonb_build_object(
    'methodology','DI_V3_RELATION_RESOLUTION_20260809_V1',
    'incorrect_marked_rejected',v_rejected,
    'relevant_marked_qualified',v_qualified,
    'rows_deleted',0,
    'effectiveness_implication','NONE'
  );
end;
$$;

comment on function public.brain_apply_relation_resolution_20260809_v1() is
'Controlled Decision Intelligence v3 repair for six previously quarantined PSI M:N mappings. Preserves history; rejection/qualification is semantic relevance QA, never effectiveness.';

-- Safe no-op when the private corpus is not present; once staged, invoke again in isolated staging.
select public.brain_apply_relation_resolution_20260809_v1();

commit;
