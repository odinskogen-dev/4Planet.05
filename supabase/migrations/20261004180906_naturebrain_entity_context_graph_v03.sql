-- Applied runtime migration 20261004180906.
-- Product-quality correction: keep raw provider occurrence claims out of the model-claim payload;
-- expose raw volume through observation_count and retain only interpretive/taxonomic/world-model claims.

create or replace view planetbrain.api_entity_context
with (security_invoker = true)
as
 SELECT canonical_id,
    entity_type,
    name,
    description,
    status,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('namespace', xi.namespace, 'external_id', xi.external_id, 'canonical_uri', xi.canonical_uri) ORDER BY xi.namespace, xi.external_id) AS jsonb_agg
           FROM planetbrain.external_identifiers xi
          WHERE xi.entity_id = e.id), '[]'::jsonb) AS external_identifiers,
    ( SELECT jsonb_build_object('scientific_name', t.scientific_name, 'rank', t.rank, 'taxonomic_status', t.taxonomic_status) AS jsonb_build_object
           FROM planetbrain.taxa t
          WHERE t.entity_id = e.id) AS taxon,
    ( SELECT count(*) AS count
           FROM planetbrain.observations o
          WHERE o.entity_id = e.id) AS observation_count,
    ( SELECT count(*) AS count
           FROM planetbrain.signals s
          WHERE s.subject_entity_id = e.id) AS signal_count,
    provenance,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('relationship_id', r.relationship_id, 'predicate', r.predicate, 'object', jsonb_build_object('canonical_id', oe.canonical_id, 'entity_type', oe.entity_type, 'name', oe.name), 'claim_id', r.claim_id, 'review_status', r.review_status, 'evidence_strength', r.evidence_strength, 'valid_from', r.valid_from, 'valid_to', r.valid_to, 'provenance', r.provenance) ORDER BY r.predicate, oe.canonical_id) AS jsonb_agg
           FROM planetbrain.relationships r
             JOIN planetbrain.entities oe ON oe.id = r.object_entity_id
          WHERE r.subject_entity_id = e.id), '[]'::jsonb) AS outbound_relationships,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('relationship_id', r.relationship_id, 'predicate', r.predicate, 'subject', jsonb_build_object('canonical_id', se.canonical_id, 'entity_type', se.entity_type, 'name', se.name), 'claim_id', r.claim_id, 'review_status', r.review_status, 'evidence_strength', r.evidence_strength, 'valid_from', r.valid_from, 'valid_to', r.valid_to, 'provenance', r.provenance) ORDER BY r.predicate, se.canonical_id) AS jsonb_agg
           FROM planetbrain.relationships r
             JOIN planetbrain.entities se ON se.id = r.subject_entity_id
          WHERE r.object_entity_id = e.id), '[]'::jsonb) AS inbound_relationships,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('claim_id', c.claim_id, 'statement', c.statement, 'review_status', c.review_status, 'evidence_strength', c.evidence_strength, 'interpretation_status', c.interpretation_status, 'valid_from', c.valid_from, 'valid_to', c.valid_to, 'evidence', COALESCE(( SELECT jsonb_agg(jsonb_build_object('evidence_id', ev.evidence_id, 'relation', ce.relation, 'evidence_type', ev.evidence_type, 'source_id', ev.source_id, 'dataset_id', ev.dataset_id, 'source_record_id', ev.source_record_id, 'citation', ev.citation, 'reviewed_at', ev.reviewed_at, 'provenance', ev.provenance) ORDER BY ev.evidence_id) AS jsonb_agg
                   FROM planetbrain.claim_evidence ce
                     JOIN planetbrain.evidence ev ON ev.evidence_id = ce.evidence_id
                  WHERE ce.claim_id = c.claim_id), '[]'::jsonb), 'provenance', c.provenance) ORDER BY c.claim_id) AS jsonb_agg
           FROM planetbrain.claims c
          WHERE c.subject_entity_id = e.id AND c.interpretation_status IS DISTINCT FROM 'provider_record_only'::text), '[]'::jsonb) AS claims,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('measurement_id', m.measurement_id, 'metric_key', m.metric_key, 'numeric_value', m.numeric_value, 'text_value', m.text_value, 'unit', m.unit, 'observed_at', m.observed_at, 'observed_on', m.observed_on, 'source_record_id', m.source_record_id, 'provenance', m.provenance) ORDER BY m.measurement_id) AS jsonb_agg
           FROM planetbrain.measurements m
          WHERE m.subject_entity_id = e.id), '[]'::jsonb) AS measurements
   FROM planetbrain.entities e;
