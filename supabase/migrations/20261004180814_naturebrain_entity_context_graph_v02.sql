-- Applied runtime migration 20261004180814.
-- Extend the existing NATUREBRAIN entity-context view; do not create a parallel read model.

create or replace view planetbrain.api_entity_context
with (security_invoker = true)
as
select
  e.canonical_id,
  e.entity_type,
  e.name,
  e.description,
  e.status,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'namespace',xi.namespace,
      'external_id',xi.external_id,
      'canonical_uri',xi.canonical_uri
    ) order by xi.namespace,xi.external_id)
    from planetbrain.external_identifiers xi
    where xi.entity_id=e.id
  ),'[]'::jsonb) as external_identifiers,
  (
    select jsonb_build_object(
      'scientific_name',t.scientific_name,
      'rank',t.rank,
      'taxonomic_status',t.taxonomic_status
    )
    from planetbrain.taxa t where t.entity_id=e.id
  ) as taxon,
  (select count(*) from planetbrain.observations o where o.entity_id=e.id) as observation_count,
  (select count(*) from planetbrain.signals s where s.subject_entity_id=e.id) as signal_count,
  e.provenance,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'relationship_id',r.relationship_id,
      'predicate',r.predicate,
      'object',jsonb_build_object('canonical_id',oe.canonical_id,'entity_type',oe.entity_type,'name',oe.name),
      'claim_id',r.claim_id,
      'review_status',r.review_status,
      'evidence_strength',r.evidence_strength,
      'valid_from',r.valid_from,
      'valid_to',r.valid_to,
      'provenance',r.provenance
    ) order by r.predicate,oe.canonical_id)
    from planetbrain.relationships r
    join planetbrain.entities oe on oe.id=r.object_entity_id
    where r.subject_entity_id=e.id
  ),'[]'::jsonb) as outbound_relationships,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'relationship_id',r.relationship_id,
      'predicate',r.predicate,
      'subject',jsonb_build_object('canonical_id',se.canonical_id,'entity_type',se.entity_type,'name',se.name),
      'claim_id',r.claim_id,
      'review_status',r.review_status,
      'evidence_strength',r.evidence_strength,
      'valid_from',r.valid_from,
      'valid_to',r.valid_to,
      'provenance',r.provenance
    ) order by r.predicate,se.canonical_id)
    from planetbrain.relationships r
    join planetbrain.entities se on se.id=r.subject_entity_id
    where r.object_entity_id=e.id
  ),'[]'::jsonb) as inbound_relationships,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'claim_id',c.claim_id,
      'statement',c.statement,
      'review_status',c.review_status,
      'evidence_strength',c.evidence_strength,
      'interpretation_status',c.interpretation_status,
      'valid_from',c.valid_from,
      'valid_to',c.valid_to,
      'evidence',coalesce((
        select jsonb_agg(jsonb_build_object(
          'evidence_id',ev.evidence_id,
          'relation',ce.relation,
          'evidence_type',ev.evidence_type,
          'source_id',ev.source_id,
          'dataset_id',ev.dataset_id,
          'source_record_id',ev.source_record_id,
          'citation',ev.citation,
          'reviewed_at',ev.reviewed_at,
          'provenance',ev.provenance
        ) order by ev.evidence_id)
        from planetbrain.claim_evidence ce
        join planetbrain.evidence ev on ev.evidence_id=ce.evidence_id
        where ce.claim_id=c.claim_id
      ),'[]'::jsonb),
      'provenance',c.provenance
    ) order by c.claim_id)
    from planetbrain.claims c
    where c.subject_entity_id=e.id
  ),'[]'::jsonb) as claims
from planetbrain.entities e;
