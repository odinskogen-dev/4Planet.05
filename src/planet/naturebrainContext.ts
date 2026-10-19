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

export type NatureBrainExternalIdentifier = {
  namespace?: unknown;
  external_id?: unknown;
  canonical_uri?: unknown;
  provenance?: Record<string, unknown> | null;
};

export type NatureBrainProductIdentifier = {
  namespace: string;
  externalId: string;
  namespaceQualifiedId: string;
  canonicalUri: string;
  state: "SOURCE_QUALIFIED_REFERENCE";
  equivalence: "NOT_ASSERTED";
  sourceAuthority?: string;
  authorityVersion?: string;
  scientificName?: string;
  rank?: string;
  taxonomicStanding?: string;
  reviewedAt?: string;
  citation?: string;
  rightsBoundary?: string;
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
  external_identifiers: NatureBrainExternalIdentifier[];
  outbound_relationships: NatureBrainRelationship[];
  inbound_relationships: NatureBrainRelationship[];
  claims: NatureBrainClaim[];
  measurements: NatureBrainMeasurement[];
  provenance?: Record<string, unknown>;
}

export type NatureBrainProductLink = {
  relationshipId: string;
  id: string;
  label: string;
  relation: string;
  direction: "OUTBOUND" | "INBOUND";
  reviewStatus: string;
  evidenceStrength: string;
  claimId?: string | null;
};

export type NatureBrainLsiEdge = {
  relationshipId: string;
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

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const optionalString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value.trim() : undefined;

const exactHttpsUrl = (value: unknown): string | undefined => {
  if (!isNonEmptyString(value)) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Preserve external identifiers as namespace-qualified source references.
 *
 * No identifier creates identity equivalence. ITIS TSNs have an additional
 * fail-closed admission contract because a TSN identifies an ITIS name record,
 * not a universal taxon. The ITIS assertion must carry the reviewed source
 * version, accepted name/rank/standing, citation and rights boundary.
 */
export function natureBrainProductIdentifiers(
  context: NatureBrainEntityContext,
): NatureBrainProductIdentifier[] {
  return context.external_identifiers.flatMap((identifier) => {
    const namespace = optionalString(identifier.namespace)?.toUpperCase();
    const externalId = optionalString(identifier.external_id);
    const canonicalUri = exactHttpsUrl(identifier.canonical_uri);
    if (!namespace || !externalId || !canonicalUri) return [];

    const base: NatureBrainProductIdentifier = {
      namespace,
      externalId,
      namespaceQualifiedId: `${namespace}:${externalId}`,
      canonicalUri,
      state: "SOURCE_QUALIFIED_REFERENCE",
      equivalence: "NOT_ASSERTED",
    };
    if (namespace !== "ITIS_TSN") return [base];

    const provenance = identifier.provenance ?? {};
    const sourceAuthority = optionalString(provenance.source_authority);
    const authorityVersion = optionalString(provenance.authority_version);
    const scientificName = optionalString(provenance.scientific_name);
    const rank = optionalString(provenance.rank)?.toUpperCase();
    const taxonomicStanding = optionalString(provenance.taxonomic_standing)?.toUpperCase();
    const reviewedAt = optionalString(provenance.reviewed_at);
    const citation = exactHttpsUrl(provenance.citation);
    const rightsBoundary = optionalString(provenance.rights_boundary);
    const entityName = optionalString(context.taxon?.scientific_name);
    const entityRank = optionalString(context.taxon?.rank)?.toUpperCase();
    let itisUri: URL;
    try {
      itisUri = new URL(canonicalUri);
    } catch {
      return [];
    }

    const qualifies = sourceAuthority === "ITIS"
      && Boolean(authorityVersion)
      && scientificName === entityName
      && rank === entityRank
      && ["ACCEPTED", "VALID"].includes(taxonomicStanding ?? "")
      && Boolean(reviewedAt && Number.isFinite(Date.parse(reviewedAt)))
      && Boolean(citation)
      && Boolean(rightsBoundary)
      && provenance.ambiguous !== true
      && (itisUri.hostname === "itis.gov" || itisUri.hostname.endsWith(".itis.gov"))
      && itisUri.searchParams.get("search_value") === externalId;
    if (!qualifies) return [];

    return [{
      ...base,
      sourceAuthority,
      authorityVersion,
      scientificName,
      rank,
      taxonomicStanding,
      reviewedAt,
      citation,
      rightsBoundary,
    }];
  });
}

/**
 * Product projections are publication surfaces, not raw graph inspection.
 * A reviewed claim and citation do not promote an unreviewed relationship.
 * The relationship, referenced claim, exact relationship-id + predicate support,
 * reviewed evidence and evidence rights boundary must all be present before an
 * edge can enter SPECIES/ATLAS/LSI.
 */
export function natureBrainRelationshipIsProductReady(
  context: NatureBrainEntityContext,
  relationship: NatureBrainRelationship,
): boolean {
  if (relationship.review_status !== "reviewed" || !isNonEmptyString(relationship.claim_id)) return false;

  const claim = context.claims.find((candidate) => candidate.claim_id === relationship.claim_id);
  if (!claim || claim.review_status !== "reviewed") return false;

  const supportedRelationships = claim.provenance?.supported_relationships;
  if (!Array.isArray(supportedRelationships)) return false;
  const hasExactSemanticSupport = supportedRelationships.some((candidate) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return false;
    const support = candidate as Record<string, unknown>;
    return support.relationship_id === relationship.relationship_id
      && support.predicate === relationship.predicate;
  });
  if (!hasExactSemanticSupport) return false;

  return claim.evidence.some((evidence) => {
    const rightsBoundary = evidence.provenance?.rights_boundary;
    return isNonEmptyString(evidence.reviewed_at)
      && isNonEmptyString(evidence.source_id)
      && isNonEmptyString(evidence.dataset_id)
      && isNonEmptyString(evidence.source_record_id)
      && isNonEmptyString(evidence.citation)
      && evidence.citation.startsWith("https://")
      && isNonEmptyString(rightsBoundary);
  });
}

export function natureBrainProductLinks(context: NatureBrainEntityContext): NatureBrainProductLink[] {
  const outbound = context.outbound_relationships
    .filter((r) => Boolean(r.object?.canonical_id) && natureBrainRelationshipIsProductReady(context, r))
    .map((r) => ({
      relationshipId: r.relationship_id,
      id: r.object!.canonical_id,
      label: r.object!.name,
      relation: r.predicate,
      direction: "OUTBOUND" as const,
      reviewStatus: r.review_status,
      evidenceStrength: r.evidence_strength,
      claimId: r.claim_id,
    }));
  const inbound = context.inbound_relationships
    .filter((r) => Boolean(r.subject?.canonical_id) && natureBrainRelationshipIsProductReady(context, r))
    .map((r) => ({
      relationshipId: r.relationship_id,
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
    .filter((r) => Boolean(r.object?.canonical_id) && natureBrainRelationshipIsProductReady(context, r))
    .map((r) => ({
      relationshipId: r.relationship_id,
      from: context.canonical_id,
      to: r.object!.canonical_id,
      predicate: r.predicate,
      category: categoryForPredicate(r.predicate),
      reviewStatus: r.review_status,
      evidenceStrength: r.evidence_strength,
      claimId: r.claim_id,
    }));
  const inbound = context.inbound_relationships
    .filter((r) => Boolean(r.subject?.canonical_id) && natureBrainRelationshipIsProductReady(context, r))
    .map((r) => ({
      relationshipId: r.relationship_id,
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
        evidenceId: e.evidence_id,
        relation: e.relation ?? null,
        evidenceType: e.evidence_type ?? null,
        sourceId: e.source_id ?? null,
        datasetId: e.dataset_id ?? null,
        sourceRecordId: e.source_record_id ?? null,
        citation: e.citation!,
        reviewedAt: e.reviewed_at ?? null,
      })),
  }));
}

export const NATUREBRAIN_PRODUCT_TRUTH_BOUNDARY =
  "NATUREBRAIN relationships are shared source-grounded world-model state. Products may filter or explain them, but must not silently upgrade observation into range, correlation into causation, a candidate solution into proven outcome, or an unreviewed/synthesis edge into verified fact.";
