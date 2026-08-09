-- Decision Intelligence v3 relation-resolution regression.
-- Runs inside a transaction and leaves no fixture records behind.

begin;

insert into public.brain_objects(public_ref,object_type,title,lifecycle_state,review_status,visibility)
values
('4P-SOL-000199','INTERVENTION','Fixture demolition','STAGING','UNREVIEWED','INTERNAL'),
('4P-SOL-000200','INTERVENTION','Fixture deconstruction','STAGING','UNREVIEWED','INTERNAL'),
('4P-SOL-000201','INTERVENTION','Fixture material passports','STAGING','UNREVIEWED','INTERNAL'),
('4P-SOL-000295','INTERVENTION','Fixture management effectiveness','STAGING','UNREVIEWED','INTERNAL'),
('4P-SOL-000296','INTERVENTION','Fixture adaptive monitoring','STAGING','UNREVIEWED','INTERNAL'),
('4P-SOL-000297','INTERVENTION','Fixture co-management finance','STAGING','UNREVIEWED','INTERNAL'),
('4P-PX-0090','PROBLEM_FRAME','Fixture unsafe waste','STAGING','UNREVIEWED','INTERNAL'),
('4P-PX-0011','PROBLEM_FRAME','Fixture biosphere integrity','STAGING','UNREVIEWED','INTERNAL')
on conflict (public_ref) do nothing;

insert into public.brain_relationships(subject_id,predicate,object_id,review_status,interpretation_status,relation_basis,relation_confidence,effectiveness_implication)
select s.id,'ADDRESSES',o.id,'UNREVIEWED','4PLANET_INTERPRETATION','fixture','LOW','NONE'
from public.brain_objects s cross join public.brain_objects o
where (s.public_ref in ('4P-SOL-000199','4P-SOL-000200','4P-SOL-000201') and o.public_ref='4P-PX-0090')
   or (s.public_ref in ('4P-SOL-000295','4P-SOL-000296','4P-SOL-000297') and o.public_ref='4P-PX-0011')
on conflict (subject_id,predicate,object_id) do update set review_status='UNREVIEWED', relation_basis='fixture', relation_confidence='LOW', effectiveness_implication='NONE';

select public.brain_apply_relation_resolution_20260809_v1();

do $$
declare
  rejected_count integer;
  qualified_count integer;
  effectiveness_count integer;
begin
  select count(*) into rejected_count
  from public.brain_relationships r
  join public.brain_objects s on s.id=r.subject_id
  join public.brain_objects o on o.id=r.object_id
  where s.public_ref in ('4P-SOL-000199','4P-SOL-000200','4P-SOL-000201')
    and o.public_ref='4P-PX-0090' and r.predicate='ADDRESSES' and r.review_status='REJECTED';
  if rejected_count <> 3 then raise exception 'expected 3 rejected relations, got %', rejected_count; end if;

  select count(*) into qualified_count
  from public.brain_relationships r
  join public.brain_objects s on s.id=r.subject_id
  join public.brain_objects o on o.id=r.object_id
  where s.public_ref in ('4P-SOL-000295','4P-SOL-000296','4P-SOL-000297')
    and o.public_ref='4P-PX-0011' and r.predicate='ADDRESSES'
    and r.review_status <> 'REJECTED'
    and r.relation_confidence='QUALIFIED_BROAD_UPSTREAM';
  if qualified_count <> 3 then raise exception 'expected 3 qualified relations, got %', qualified_count; end if;

  select count(*) into effectiveness_count
  from public.brain_relationships r
  join public.brain_objects s on s.id=r.subject_id
  where s.public_ref in ('4P-SOL-000199','4P-SOL-000200','4P-SOL-000201','4P-SOL-000295','4P-SOL-000296','4P-SOL-000297')
    and r.effectiveness_implication <> 'NONE';
  if effectiveness_count <> 0 then raise exception 'effectiveness implication violation'; end if;
end $$;

select 'DECISION_INTELLIGENCE_RELATION_RESOLUTION_V3_PASS' as result;
rollback;
