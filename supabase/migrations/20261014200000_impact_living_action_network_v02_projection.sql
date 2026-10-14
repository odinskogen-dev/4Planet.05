-- 4PLANET IMPACT Living Action Network — public read projection v02
-- Existing NATUREBRAIN only. Additive, read-only. No new tables, no parallel truth store.
--
-- WHY: impact_lan_gold_v01() is scoped to the four Gold seed objects and returns
-- one actor / place / solution per project. v02 lets AXE publish further
-- source-grounded objects by data alone:
--
--   entity.status = 'active'
--   AND (entity.provenance->>'impact_publication' = 'public'
--        OR entity.provenance->>'scope' = 'impact_gold_v01')
--
-- and returns the graph normalised: projects + issues + actors + solutions + places,
-- with every relationship (not LIMIT 1), every claim/evidence/source record,
-- retrieved / event / checked dates and rights posture.
--
-- Projection hints (slug, image role, review_state, …) stay on the canonical
-- entity's provenance; only an explicit allow-list is exposed publicly.
--
-- v01 is intentionally left unchanged; the web client prefers v02 and falls back to v01.
-- Rollback: supabase/rollback/20261014200000_impact_living_action_network_v02_projection.down.sql

create or replace function public.impact_lan_v02()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
with
published as (
  select e.*
  from planetbrain.entities e
  where e.status = 'active'
    and (
      e.provenance->>'impact_publication' = 'public'
      or e.provenance->>'scope' = 'impact_gold_v01'
    )
),
projects as (
  select * from published where entity_type = 'project'
),
-- Every edge out of a published project.
project_edges as (
  select
    p.id as project_pk,
    r.predicate,
    r.review_status,
    r.evidence_strength,
    r.provenance as relationship_provenance,
    o.id as object_pk,
    o.canonical_id as object_id,
    o.entity_type as object_type
  from projects p
  join planetbrain.relationships r on r.subject_entity_id = p.id
  join planetbrain.entities o on o.id = r.object_entity_id and o.status = 'active'
),
-- Nodes reachable from a published project, plus nodes published in their own right.
node_pks as (
  select object_pk as pk from project_edges
  union
  select id from published where entity_type in ('problem','issue','actor','solution','place')
),
-- Solution → issue edges let an Issue page list solutions even before a project uses them.
solution_issue_edges as (
  select s.id as solution_pk, i.canonical_id as issue_id, r.predicate
  from planetbrain.entities s
  join planetbrain.relationships r on r.subject_entity_id = s.id
  join planetbrain.entities i on i.id = r.object_entity_id and i.status = 'active'
  where s.entity_type = 'solution' and s.status = 'active'
    and i.entity_type in ('problem','issue')
    and r.predicate in ('addresses_problem','addresses_issue')
    and s.id in (select pk from node_pks)
),
claims as (
  select
    c.subject_entity_id as subject_pk,
    jsonb_build_object(
      'claim_id', c.claim_id,
      'statement', c.statement,
      'review_status', c.review_status,
      'evidence_strength', c.evidence_strength,
      'interpretation_status', c.interpretation_status,
      'checked_at', c.provenance->>'checked_at',
      'citation', ev.citation,
      'evidence_type', ev.evidence_type,
      'evidence_role', ev.provenance->>'role',
      'reviewed_at', ev.reviewed_at,
      'source_id', src.source_id,
      'source_name', src.name,
      'source_authority', src.attribution,
      'source_type', src.source_type,
      'source_url', coalesce(sr.provenance->>'url', src.canonical_uri),
      'source_rights', coalesce(sr.rights, src.rights),
      'source_record_id', sr.record_id,
      'source_event_at', sr.source_event_at,
      'retrieved_at', sr.retrieved_at,
      'limitations', coalesce(sr.limitations, '[]'::jsonb)
    ) as claim,
    c.claim_id
  from planetbrain.claims c
  left join planetbrain.claim_evidence ce on ce.claim_id = c.claim_id and ce.relation = 'supports'
  left join planetbrain.evidence ev on ev.evidence_id = ce.evidence_id
  left join planetbrain.source_records sr on sr.record_id = ev.source_record_id
  left join planetbrain.datasets ds on ds.dataset_id = sr.dataset_id
  left join planetbrain.sources src on src.source_id = ds.source_id
  where c.subject_entity_id in (select id from projects union select pk from node_pks)
),
claims_by_subject as (
  select subject_pk, jsonb_agg(claim order by claim_id) as evidence
  from claims
  group by subject_pk
),
-- Public allow-list of projection hints. Anything else on provenance stays private.
profile_of as (
  select
    e.id as pk,
    jsonb_strip_nulls(jsonb_build_object(
      'slug', e.provenance->>'slug',
      'summary', e.provenance->>'summary',
      'issue_label', e.provenance->>'issue_label',
      'issue_short', e.provenance->>'issue_short',
      'domain', e.provenance->>'domain',
      'year_label', e.provenance->>'year_label',
      'review_state', e.provenance->>'review_state',
      'external_review', e.provenance->'external_review',
      'project_type', e.provenance->>'project_type',
      'status_label', e.provenance->>'status_label',
      'operating_period', e.provenance->>'operating_period',
      'method_summary', e.provenance->>'method_summary',
      'delivery_model', e.provenance->>'delivery_model',
      'reported_scale', e.provenance->'reported_scale',
      'stated_ambition', e.provenance->'stated_ambition',
      'outcomes', e.provenance->'outcomes',
      'capital_needs', e.provenance->'capital_needs',
      'not_established', e.provenance->'not_established',
      'why_it_matters', e.provenance->>'why_it_matters',
      'unknowns', e.provenance->'unknowns',
      'image_path', e.provenance->>'image_path',
      'image_role', e.provenance->>'image_role',
      'image_alt', e.provenance->>'image_alt',
      'image_credit', e.provenance->>'image_credit',
      'image_licence', e.provenance->>'image_licence',
      'official_url', e.provenance->>'official_url',
      'website', e.provenance->>'website',
      'atlas_place_id', e.provenance->>'atlas_place_id',
      'coverage_note', coalesce(e.provenance->>'coverage_note', e.provenance->>'project_coverage_note'),
      'relationship_state', e.provenance->>'relationship_state',
      'geometry_status', e.provenance->>'geometry_status',
      'reference_point', e.provenance->'reference_point',
      'maturity', e.provenance->>'maturity',
      'applicability', e.provenance->'applicability',
      'risks', e.provenance->'risks',
      'mechanism', e.provenance->>'mechanism',
      'action_type', e.provenance->>'action_type',
      'url', e.provenance->>'url',
      'processed_by_4planet', case when e.provenance ? 'processed_by_4planet'
        then (e.provenance->>'processed_by_4planet')::boolean end,
      'magazine', e.provenance->'magazine',
      'problem_map_id', e.provenance->>'problem_map_id',
      'last_reviewed', e.provenance->>'last_reviewed',
      'publication', case when e.provenance->>'impact_publication' = 'public'
        or e.provenance->>'scope' = 'impact_gold_v01' then 'public' else 'related' end
    )) as profile
  from planetbrain.entities e
  where e.id in (select id from projects union select pk from node_pks)
),
node_rows as (
  select
    e.entity_type,
    jsonb_build_object(
      'id', e.canonical_id,
      'type', e.entity_type,
      'name', e.name,
      'description', e.description,
      'updated_at', e.updated_at,
      'actor_type', a.actor_type,
      'solution_type', s.solution_type,
      'profile', pr.profile,
      'issues', case when e.entity_type = 'solution' then (
        select coalesce(jsonb_agg(distinct jsonb_build_object('id', sie.issue_id, 'predicate', sie.predicate)), '[]'::jsonb)
        from solution_issue_edges sie where sie.solution_pk = e.id
      ) end,
      'evidence', coalesce(cb.evidence, '[]'::jsonb)
    ) as node,
    e.name
  from planetbrain.entities e
  join node_pks n on n.pk = e.id
  left join planetbrain.actors a on a.entity_id = e.id
  left join planetbrain.solutions s on s.entity_id = e.id
  left join profile_of pr on pr.pk = e.id
  left join claims_by_subject cb on cb.subject_pk = e.id
),
project_rows as (
  select
    p.name,
    jsonb_build_object(
      'id', p.canonical_id,
      'type', 'project',
      'name', p.name,
      'description', p.description,
      'updated_at', p.updated_at,
      'profile', pr.profile,
      'edges', coalesce((
        select jsonb_agg(jsonb_build_object(
          'predicate', pe.predicate,
          'target', pe.object_id,
          'target_type', pe.object_type,
          'review_status', pe.review_status,
          'evidence_strength', pe.evidence_strength,
          'role', pe.relationship_provenance->>'role'
        ) order by pe.predicate, pe.object_id)
        from project_edges pe where pe.project_pk = p.id
      ), '[]'::jsonb),
      'evidence', coalesce(cb.evidence, '[]'::jsonb)
    ) as node
  from projects p
  left join profile_of pr on pr.pk = p.id
  left join claims_by_subject cb on cb.subject_pk = p.id
)
select jsonb_build_object(
  'version', 'impact-lan-v02',
  'generated_at', now(),
  'publication_rule', 'status=active AND (provenance.impact_publication=public OR provenance.scope=impact_gold_v01)',
  'truth_boundaries', jsonb_build_array(
    'Listing does not imply 4PLANET partnership or endorsement.',
    'Contribution, delivery, outcome and verification remain separate truth states.',
    'Source-reported metrics are not silently converted into independently verified outcomes.',
    'Place context may be broad navigation context and is not automatically an ecological or legal boundary.'
  ),
  'projects', coalesce((select jsonb_agg(node order by name) from project_rows), '[]'::jsonb),
  'issues', coalesce((select jsonb_agg(node order by name) from node_rows where entity_type in ('problem','issue')), '[]'::jsonb),
  'actors', coalesce((select jsonb_agg(node order by name) from node_rows where entity_type = 'actor'), '[]'::jsonb),
  'solutions', coalesce((select jsonb_agg(node order by name) from node_rows where entity_type = 'solution'), '[]'::jsonb),
  'places', coalesce((select jsonb_agg(node order by name) from node_rows where entity_type = 'place'), '[]'::jsonb),
  'actions', coalesce((select jsonb_agg(node order by name) from node_rows where entity_type = 'action'), '[]'::jsonb)
);
$$;

revoke all on function public.impact_lan_v02() from public;
grant execute on function public.impact_lan_v02() to anon, authenticated, service_role;

comment on function public.impact_lan_v02() is
  '4PLANET IMPACT public read projection v02 over NATUREBRAIN. Read-only; publication by entity provenance.impact_publication=public. v01 retained.';
