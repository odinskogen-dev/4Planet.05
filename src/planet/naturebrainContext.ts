/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — NATUREBRAIN PRODUCT READ ADAPTER

   Canonical architecture:
   - NATUREBRAIN is the shared living-planet truth/world-model system.
   - planetbrain.* remains the legacy technical database namespace.
   - This file is a read adapter only. It creates no facts, graph, source
     registry, claims or decisions.

   The adapter accepts the existing server-side api_entity_context contract and
   turns its source-grounded relationships into reusable product links for
   SPECIES, ATLAS and Living Systems / LSI without duplicating truth.
   ═══════════════════════════════════════════════════════════════════════════ */

export type NatureBrainEntityRef = {
  canonical_id: string;
  entity_type: string;
  name: string;
};

export type NatureBrainEvidence = {
  evidence_id: string;
  relation?: string | null;
  evidence_type?: string | null;
  source_id?: string | null;
  dataset_id?: string | null;
  source_record_id?: string | null;
  citation?: string | null;
  reviewed_at?: string | null;
  provenance?: Record<string, unknown>;
};

export type NatureBrainClaim = {
  claim_id: string;
  statement: string;
  review_status: string;
  evidence_strength: string;
  interpretation_status?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  evidence: NatureBrainEvidence[];
  provenance?: Record<string, unknown>;
};

export type NatureBrainRelationship = {
  relationship_id: string;
  predicate: string;
  object?: NatureBrainEntityRef;
  subject?: NatureBrainEntityRef;
  claim_id?: string | null;
  review_status: string;
  evidence_strength: string;
  valid_from?: string | null;
  valid_to?: string | null;
  provenance?: Record<string, unknown>;
};

export type NatureBrainMeasurement = {
  measurement_id: string;
  metric_key: string;
  numeric_value?: number | null;
  text_value?: string | null;
  unit?: string | null;
  observed_at?: string | null;
  observed_on?: string | null;
  source_record_id?: string | null;
  provenance?: Record<string, unknown>;
};

export interface NatureBrainEntityContext {
  canonical_id: string;
  entity_type: string;
  name: string;
  description?: string | null;
  status?: string | null;
  taxon?: Record<string, unknown> | null;
  observation_count: number;
  signal_count: number;
  external_identifiers: Array<Record<string, unknown>>;
  outbound_relationships: NatureBrainRelationship[];
  inbound_relationships: NatureBrainRelationship[];
  claims: NatureBrainClaim[];
  measurements: NatureBrainMeasurement[];
  provenance?: Record<string, unknown>;
}

export type NatureBrainProductLink = {
  id: string;
  label: string;
  relation: string;
  direction: "OUTBOUND" | "INBOUND";
  reviewStatus: string;
  evidenceStrength: string;
  claimId?: string | null;
};

export type NatureBrainLsiEdge = {
  from: string;
  to: string;
  predicate: string;
  category: "DEPENDENCY" | "FUNCTION" | "SYSTEM" | "PRESSURE" | "HUMAN_SYSTEM" | "SOLUTION" | "OTHER";
  reviewStatus: string;
  evidenceStrength: string;
  claimId?: string | null;
};

const categoryForPredicate = (predicate: string): NatureBrainLsiEdge["category"] => {
  if (["consumes", "depends_on", "follows_migration_of"].includes(predicate)) return "DEPENDENCY";
  if (["supports_function", "performs_function"].includes(predicate)) return "FUNCTION";
  if (["part_of_living_system", "occurs_in", "inhabits"].includes(predicate)) return "SYSTEM";
  if (["affects", "creates_interaction_risk", "affected_by_pressure"].includes(predicate)) return "PRESSURE";
  if (["interacts_with_human_system"].includes(predicate)) return "HUMAN_SYSTEM";
  if (["addresses_pressure", "addressed_by_solution"].includes(predicate)) return "SOLUTION";
  return "OTHER";
};

export function natureBrainProductLinks(context: NatureBrainEntityContext): NatureBrainProductLink[] {
  const outbound = context.outbound_relationships
    .filter((r) => Boolean(r.object?.canonical_id))
    .map((r) => ({
      id: r.object!.canonical_id,
      label: r.object!.name,
      relation: r.predicate,
      direction: "OUTBOUND" as const,
      reviewStatus: r.review_status,
      evidenceStrength: r.evidence_strength,
      claimId: r.claim_id,
    }));
  const inbound = context.inbound_relationships
    .filter((r) => Boolean(r.subject?.canonical_id))
    .map((r) => ({
      id: r.subject!.canonical_id,
      label: r.subject!.name,
      relation: r.predicate,
      direction: "INBOUND" as const,
      reviewStatus: r.review_status,
      evidenceStrength: r.evidence_strength,
      claimId: r.claim_id,
    }));
  return [...outbound, ...inbound];
}

/** LSI projection over NATUREBRAIN relationships. No new relationship is inferred. */
export function natureBrainLsiEdges(context: NatureBrainEntityContext): NatureBrainLsiEdge[] {
  const outbound = context.outbound_relationships
    .filter((r) => Boolean(r.object?.canonical_id))
    .map((r) => ({
      from: context.canonical_id,
      to: r.object!.canonical_id,
      predicate: r.predicate,
      category: categoryForPredicate(r.predicate),
      reviewStatus: r.review_status,
      evidenceStrength: r.evidence_strength,
      claimId: r.claim_id,
    }));
  const inbound = context.inbound_relationships
    .filter((r) => Boolean(r.subject?.canonical_id))
    .map((r) => ({
      from: r.subject!.canonical_id,
      to: context.canonical_id,
      predicate: r.predicate,
      category: categoryForPredicate(r.predicate),
      reviewStatus: r.review_status,
      evidenceStrength: r.evidence_strength,
      claimId: r.claim_id,
    }));
  return [...outbound, ...inbound];
}

/**
 * Evidence frame for question-answering. Returns only stored claims and their
 * recorded citations; it deliberately does not synthesize a causal answer.
 */
export function natureBrainEvidenceFrame(context: NatureBrainEntityContext) {
  return context.claims.map((claim) => ({
    claimId: claim.claim_id,
    statement: claim.statement,
    reviewStatus: claim.review_status,
    evidenceStrength: claim.evidence_strength,
    interpretationStatus: claim.interpretation_status ?? null,
    citations: claim.evidence
      .filter((e) => typeof e.citation === "string" && e.citation.startsWith("https://"))
      .map((e) => ({
        sourceId: e.source_id ?? null,
        sourceRecordId: e.source_record_id ?? null,
        citation: e.citation!,
      })),
  }));
}

export const NATUREBRAIN_PRODUCT_TRUTH_BOUNDARY =
  "NATUREBRAIN relationships are shared source-grounded world-model state. Products may filter or explain them, but must not silently upgrade observation into range, correlation into causation, a candidate solution into proven outcome, or an unreviewed/synthesis edge into verified fact.";
