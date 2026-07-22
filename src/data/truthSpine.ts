export type ReviewStatus = "UNREVIEWED" | "LITERATURE_CHECKED" | "EXPERT_REVIEWED";
export type EvidenceStrength = "INSUFFICIENT" | "EMERGING" | "MODERATE" | "STRONG";
export type InterpretationStatus = "SOURCE_STATEMENT" | "PRODUCT_CONTEXT" | "PUBLIC_SAFE";
export type Visibility = "PUBLIC" | "INTERNAL" | "RESTRICTED";

export interface SourceRecord {
  recordType: "SOURCE_RECORD";
  id: string;
  sourceId: string;
  sourceRecordId: string;
  sourceUrl: string;
  datasetId?: string;
  retrievedAt: string;
  licence: string;
  attribution: string;
  rightsStatus: "ACCEPTABLE" | "CONDITIONAL" | "EXPERIMENTAL" | "BLOCKED";
  visibility: Visibility;
  payload: Record<string, unknown>;
}

export interface ObservationRecord {
  recordType: "OBSERVATION";
  id: string;
  sourceRecordId: string;
  taxonId: string;
  occurredAt: string | null;
  latitude: number;
  longitude: number;
  basisOfRecord: string;
  issues: string[];
  visibility: Visibility;
  interpretation: "SOURCE_RECORD";
}

export interface SignalRecord {
  recordType: "SIGNAL";
  id: string;
  sourceRecordIds: string[];
  signalClass: string;
  detectedAt: string;
  method: string;
  reviewStatus: ReviewStatus;
  evidenceStrength: EvidenceStrength;
  visibility: Visibility;
}

export interface InterpretationRecord {
  recordType: "INTERPRETATION";
  id: string;
  aboutRecordIds: string[];
  text: string;
  status: InterpretationStatus;
  reviewStatus: ReviewStatus;
  evidenceStrength: EvidenceStrength;
  limitations: string[];
  visibility: Visibility;
}

export interface ContributionRecord {
  recordType: "CONTRIBUTION";
  id: string;
  unitId: string;
  quantity: number;
  status: "CREATED" | "CONFIRMED" | "CANCELLED" | "FAILED";
  environment: "FIXTURE" | "TEST" | "PRODUCTION";
  createdAt: string;
  idempotencyKey: string;
}

export interface DeliveryRecord {
  recordType: "DELIVERY";
  id: string;
  contributionId: string;
  providerId: string;
  status:
    | "NOT_DELIVERED"
    | "SCHEDULED"
    | "PROVIDER_REPORTED"
    | "EVIDENCE_ATTACHED"
    | "REFUNDED"
    | "DISPUTED";
  environment: "FIXTURE" | "TEST" | "PRODUCTION";
  providerReference: string;
  evidenceRefs: string[];
}

export interface OutcomeRecord {
  recordType: "OUTCOME";
  id: string;
  deliveryId: string;
  status: "NOT_ASSESSED" | "PROVIDER_CLAIMED" | "INDEPENDENTLY_REVIEWED" | "UNVERIFIED";
  claim: string | null;
  evidenceRefs: string[];
}

export interface ImpactRecord {
  recordType: "IMPACT";
  id: string;
  outcomeIds: string[];
  status: "NOT_ASSESSED" | "MODELLED" | "EVIDENCED" | "VERIFIED";
  claim: string | null;
  method: string | null;
}

export interface ProductContext {
  id: string;
  entityId: string;
  journeyId: string;
  sourceRecordIds: string[];
  observationIds: string[];
  signalIds: string[];
  interpretationIds: string[];
  persistedBy: "SUPABASE" | "BUNDLED_FIXTURE";
  persistedAt: string;
  disclosure: string;
}

export const ORCA_SOURCE_RECORD: SourceRecord = {
  recordType: "SOURCE_RECORD",
  id: "source-record:gbif:5939349319",
  sourceId: "gbif",
  sourceRecordId: "5939349319",
  sourceUrl: "https://www.gbif.org/occurrence/5939349319",
  datasetId: "b124e1e0-4755-430f-9eab-894f25a9b59c",
  retrievedAt: "2026-07-22T16:25:00Z",
  licence: "CC BY 4.0",
  attribution: "Karl Anders Olaussen; record published through GBIF",
  rightsStatus: "CONDITIONAL",
  visibility: "PUBLIC",
  payload: {
    key: 5939349319,
    scientificName: "Orcinus orca (Linnaeus, 1758)",
    taxonKey: 2440483,
    speciesKey: 2440483,
    eventDate: "2026-01-03",
    decimalLatitude: 63.44559,
    decimalLongitude: 9.304561,
    basisOfRecord: "HUMAN_OBSERVATION",
    occurrenceStatus: "PRESENT",
    datasetKey: "b124e1e0-4755-430f-9eab-894f25a9b59c",
    license: "http://creativecommons.org/licenses/by/4.0/legalcode",
    recordedBy: "Karl Anders Olaussen",
    country: "Norway",
    stateProvince: "Trøndelag",
    locality: "Åstfjorden, Hitra, Tø",
    issues: ["COORDINATE_ROUNDED", "CONTINENT_DERIVED_FROM_COORDINATES"],
  },
};

export const ORCA_OBSERVATION: ObservationRecord = {
  recordType: "OBSERVATION",
  id: "observation:gbif:5939349319",
  sourceRecordId: ORCA_SOURCE_RECORD.id,
  taxonId: "taxon:gbif:2440483",
  occurredAt: "2026-01-03",
  latitude: 63.44559,
  longitude: 9.304561,
  basisOfRecord: "HUMAN_OBSERVATION",
  issues: ["COORDINATE_ROUNDED", "CONTINENT_DERIVED_FROM_COORDINATES"],
  visibility: "PUBLIC",
  interpretation: "SOURCE_RECORD",
};

export const ORCA_INTERPRETATION: InterpretationRecord = {
  recordType: "INTERPRETATION",
  id: "interpretation:4p:orca-gbif-context-v1",
  aboutRecordIds: [ORCA_OBSERVATION.id],
  text: "This record shows that a human observation of an orca was published to GBIF at the stated coordinates and date. It does not establish range, abundance, population trend, place membership or ecological change.",
  status: "PUBLIC_SAFE",
  reviewStatus: "UNREVIEWED",
  evidenceStrength: "MODERATE",
  limitations: [
    "The coordinate was rounded by the source.",
    "A single occurrence is not a distribution or population estimate.",
    "No Signal has been created from this Observation.",
  ],
  visibility: "PUBLIC",
};

export const ORCA_PRODUCT_CONTEXT: ProductContext = {
  id: "product-context:4p:orca-gbif-v1",
  entityId: "taxon:gbif:2440483",
  journeyId: "orca-gbif",
  sourceRecordIds: [ORCA_SOURCE_RECORD.id],
  observationIds: [ORCA_OBSERVATION.id],
  signalIds: [],
  interpretationIds: [ORCA_INTERPRETATION.id],
  persistedBy: "BUNDLED_FIXTURE",
  persistedAt: "2026-07-22T16:25:00Z",
  disclosure: "Bundled evidence fixture. The Supabase/PostGIS contract and seed are included, but hosted persistence was not exercised because no staging secret was supplied.",
};

export const TRUTH_SPINE_RECORD_TYPES = [
  "SOURCE_RECORD",
  "OBSERVATION",
  "SIGNAL",
  "INTERPRETATION",
  "CONTRIBUTION",
  "DELIVERY",
  "OUTCOME",
  "IMPACT",
] as const;
