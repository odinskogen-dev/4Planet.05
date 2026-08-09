/* 4PLANET_ RUNTIME PROVENANCE CONTRACT
   DERIVATIVE IMPLEMENTATION CONTRACT — KNOWLEDGE OS REMAINS CANONICAL.
   This file carries only the fields required to preserve source, time, rights,
   spatial precision and limitations through the public product runtime. */

export type RuntimeRightsState =
  | "CLEARED"
  | "DATASET_DEPENDENT"
  | "ITEM_LEVEL_REQUIRED"
  | "REVIEW_REQUIRED"
  | "BLOCKED"
  | "INTERNAL";

export type RuntimeSpatialPrecision =
  | "EXACT"
  | "GENERALIZED"
  | "OBSCURED"
  | "SOURCE_SUPPRESSED"
  | "QUERY_AREA_MATCH"
  | "UNKNOWN";

export type RuntimeFreshnessKind =
  | "FETCHED_NOW"
  | "OBSERVATION_TIME"
  | "EVENT_STATUS"
  | "SOURCE_PRODUCT_DATE"
  | "DATASET_PERIOD"
  | "MODEL_RUN"
  | "HISTORICAL"
  | "UNKNOWN";

export type SensitiveLocationPolicy =
  | "PUBLIC_SOURCE_COORDINATES_ONLY"
  | "GENERALIZE_FOR_PUBLIC"
  | "DO_NOT_RENDER_EXACT"
  | "SOURCE_SUPPRESSED"
  | "NOT_APPLICABLE"
  | "UNKNOWN";

export interface RuntimeDatasetFreshness {
  kind: RuntimeFreshnessKind;
  label: string;
  asOf?: string;
}

export interface RuntimeProvenanceEnvelope {
  /** Canonical Source/Source Record identifiers where a matching Knowledge OS row exists. */
  sourceRecordId?: string;
  sourceId: string;
  provider: string;
  originalPublisher?: string;
  dataset?: string;
  datasetVersion?: string;
  upstreamDataset?: string;
  upstreamRecordId?: string;

  /** These timestamps are deliberately separate. */
  retrievedAt: string;
  observationTime?: string;
  eventTime?: string;
  sourceProductDate?: string;
  datasetFreshness: RuntimeDatasetFreshness;

  licence?: string;
  rightsState: RuntimeRightsState;
  attribution?: string;

  spatialPrecision?: RuntimeSpatialPrecision;
  geographicScope?: string;
  temporalScope?: string;
  confidence?: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
  limitations: string[];
  sensitiveLocationPolicy?: SensitiveLocationPolicy;
}

export type RuntimeClaimGate =
  | "CLAIM-FIRST OK"
  | "BLOCK / QUALIFY"
  | "PUBLIC-USE BLOCK";

export function publicTemporalLabel(p: RuntimeProvenanceEnvelope): string {
  const f = p.datasetFreshness;
  if (f.kind === "OBSERVATION_TIME" && p.observationTime) return `OBSERVED ${p.observationTime}`;
  if (f.kind === "SOURCE_PRODUCT_DATE" && p.sourceProductDate) return `SOURCE DATE ${p.sourceProductDate}`;
  if (f.kind === "HISTORICAL" || f.kind === "DATASET_PERIOD") return f.label;
  if (f.kind === "FETCHED_NOW") return `FETCHED ${p.retrievedAt}`;
  return f.label || `CHECKED ${p.retrievedAt}`;
}

export function publicLocationLabel(p: RuntimeProvenanceEnvelope): string {
  switch (p.spatialPrecision) {
    case "EXACT": return "SOURCE-REPORTED LOCATION";
    case "GENERALIZED": return "GENERALIZED LOCATION";
    case "OBSCURED": return "OBSCURED LOCATION";
    case "SOURCE_SUPPRESSED": return "LOCATION WITHHELD BY SOURCE";
    case "QUERY_AREA_MATCH": return "MATCHES QUERY AREA — NOT SEMANTIC PLACE MEMBERSHIP";
    default: return "SPATIAL PRECISION NOT ESTABLISHED";
  }
}
