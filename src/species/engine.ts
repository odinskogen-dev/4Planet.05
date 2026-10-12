/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ SPECIES ENGINE 01 — UNIVERSAL PROFILE MATERIALISER

   Resolve a taxon against Catalogue of Life XR, enrich it with Norway-specific
   source data when available, then materialise one source-aware 4PLANET profile.
   External authorities own taxonomy/facts. The thin registry owns continuity,
   crosswalks and 4PLANET identity only.
   ═══════════════════════════════════════════════════════════════════════════ */

import { registerOrResolveTaxon, type TaxonRegistryPersistenceScope } from "./registry";
import {
  COL_XR_SOURCE_AUTHORITY,
  reviewTaxonomyMatch,
  type TaxonomyMatchReview,
} from "./matchGate";
import {
  GBIF_FILTERED_TOTAL_SEMANTICS,
  gbifOccurrenceProvenance,
  isSemanticallyAdmissibleGbifOccurrence,
  type GbifOccurrenceRightsReviewState,
} from "../data/gbifOccurrenceTruth";

export const COL_XR_CHECKLIST_KEY = "7ddf754f-d193-4cc9-b351-99906754a03b";

export type SpeciesEngineSourceId = "col-xr" | "gbif" | "artsdatabanken";
export type IdentityState = "PROVISIONAL_EXTERNAL_ANCHORED" | "CANONICAL_4P_TEST_REGISTRY" | "CANONICAL_4P";
export type SourceState = "AVAILABLE" | "UNAVAILABLE" | "NOT_FOUND";

export interface SourceStamp {
  source: SpeciesEngineSourceId;
  state: SourceState;
  checkedAt: string;
  sourceUrl: string;
  note?: string;
}

export interface ExternalTaxonIds {
  colXr?: string;
  legacyGbif?: number;
  artsdatabankenTaxonId?: number;
  artsdatabankenScientificNameId?: number;
}

export interface TaxonomyNode {
  key?: string;
  name: string;
  rank?: string;
}

export interface UniversalOccurrenceSummary {
  total: number;
  totalSemantics: typeof GBIF_FILTERED_TOTAL_SEMANTICS;
  returnedPageCount: number;
  publicUseSampleCount: number;
  rightsReviewRequiredCount: number;
  country?: string;
  sample: Array<{
    key: string;
    eventDate?: string;
    lat: number;
    lng: number;
    coordinateUncertaintyM?: number;
    sourceUrl: string;
    licence?: string;
    datasetKey?: string;
    datasetTitle?: string;
    publisher?: string;
    publishingOrgKey?: string;
    datasetCitation?: string;
    datasetDoi?: string;
    retrievedAt: string;
    occurrenceStatus?: string;
    hasGeospatialIssue: boolean;
    rightsReviewState: GbifOccurrenceRightsReviewState;
  }>;
}

export interface UniversalTaxonProfile {
  id: string;
  identityState: IdentityState;
  registry?: {
    persistenceScope: TaxonRegistryPersistenceScope;
    createdAt: string;
    updatedAt: string;
  };
  canonicalName: string;
  scientificName: string;
  authorship?: string;
  rank: string;
  status?: string;
  kingdom?: string;
  commonName?: string;
  commonNameLanguage?: string;
  norwegianContext?: {
    existsInCountry?: boolean;
    taxonGroup?: string;
  };
  externalIds: ExternalTaxonIds;
  classification: TaxonomyNode[];
  taxonomyMatch: TaxonomyMatchReview;
  occurrences?: UniversalOccurrenceSummary;
  sources: SourceStamp[];
  limitations: string[];
}

export type EngineResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; sources?: SourceStamp[] };

const now = () => new Date().toISOString();

async function getJson(url: string, timeoutMs = 12000): Promise<EngineResult<any>> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: ctl.signal, headers: { Accept: "application/json" } });
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, data: await response.json() };
  } catch (error: any) {
    return { ok: false, error: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK" };
  } finally {
    clearTimeout(timer);
  }
}

function provisional4pTaxonId(colKey: string): string {
  return `taxon:4p:col-${String(colKey).toLowerCase()}`;
}

function normalizeClassification(raw: any): TaxonomyNode[] {
  const rows = Array.isArray(raw) ? raw : [];
  return rows
    .map((row: any) => ({
      key: row?.key ? String(row.key) : undefined,
      name: String(row?.name ?? row?.canonicalName ?? "").trim(),
      rank: row?.rank ? String(row.rank).toUpperCase() : undefined,
    }))
    .filter((row: TaxonomyNode) => Boolean(row.name));
}

export interface ColResolution {
  key: string;
  scientificName: string;
  canonicalName: string;
  authorship?: string;
  rank: string;
  status?: string;
  kingdom?: string;
  classification: TaxonomyNode[];
  taxonomyMatch: TaxonomyMatchReview;
  source: SourceStamp;
}

function resolveMatchReview(
  payload: any,
  request: { name: string; rank?: string; identifierBased?: boolean },
): TaxonomyMatchReview {
  const matchedUsage = payload?.usage;
  const acceptedUsage = payload?.acceptedUsage ?? matchedUsage;
  return reviewTaxonomyMatch({
    sourceAuthority: COL_XR_SOURCE_AUTHORITY,
    checklistKey: COL_XR_CHECKLIST_KEY,
    requestedName: request.name,
    requestedRank: request.rank,
    matchedName: matchedUsage?.name ? String(matchedUsage.name) : undefined,
    acceptedName: acceptedUsage?.name ? String(acceptedUsage.name) : undefined,
    returnedRank: acceptedUsage?.rank ? String(acceptedUsage.rank) : undefined,
    matchType: payload?.diagnostics?.matchType,
    confidence: payload?.diagnostics?.confidence,
    alternatives: payload?.alternatives,
    issues: payload?.issues,
    identifierBased: request.identifierBased,
    synonym: payload?.synonym,
  });
}

/** Resolve a scientific name against Catalogue of Life XR through GBIF v2. */
export async function resolveColXr(scientificName: string, rank?: string): Promise<EngineResult<ColResolution>> {
  const q = new URLSearchParams({ scientificName: scientificName.trim(), checklistKey: COL_XR_CHECKLIST_KEY });
  if (rank) q.set("taxonRank", rank.toLowerCase());

  const sourceUrl = `https://api.gbif.org/v2/species/match?${q.toString()}`;
  const checkedAt = now();
  const result = await getJson(sourceUrl);
  const source: SourceStamp = {
    source: "col-xr",
    state: result.ok ? "AVAILABLE" : "UNAVAILABLE",
    checkedAt,
    sourceUrl,
    note: "Catalogue of Life XR resolved through GBIF taxonomy matching v2.",
  };

  if (!result.ok) return { ok: false, error: `COL_XR_${result.error}`, sources: [source] };
  const usage = result.data?.acceptedUsage ?? result.data?.usage;
  if (!usage?.key || !usage?.name) {
    source.state = "NOT_FOUND";
    return { ok: false, error: "COL_XR_NO_MATCH", sources: [source] };
  }

  const classification = normalizeClassification(result.data?.classification);
  const taxonomyMatch = resolveMatchReview(result.data, { name: scientificName.trim(), rank });
  return {
    ok: true,
    data: {
      key: String(usage.key),
      scientificName: String(usage.name),
      canonicalName: String(usage.canonicalName ?? usage.name),
      authorship: usage.authorship ? String(usage.authorship) : undefined,
      // The requested rank is matching context, not source evidence. If COL XR
      // omits the returned rank, keep the materialised rank explicitly unknown
      // and let taxonomyMatch retain the separately requested rank for review.
      rank: String(usage.rank ?? "UNRANKED").toUpperCase(),
      status: usage.status ? String(usage.status).toUpperCase() : undefined,
      kingdom: classification.find((n) => n.rank === "KINGDOM")?.name,
      classification,
      taxonomyMatch,
      source,
    },
  };
}

/** Crosswalk an old numeric GBIF Backbone key into the current COL XR identity. */
export async function legacyGbifToColXr(
  gbifKey: number,
  expected: { scientificName?: string; rank?: string } = {},
): Promise<EngineResult<ColResolution>> {
  const q = new URLSearchParams({ scientificNameID: `gbif:${gbifKey}`, checklistKey: COL_XR_CHECKLIST_KEY });
  const sourceUrl = `https://api.gbif.org/v2/species/match?${q.toString()}`;
  const checkedAt = now();
  const result = await getJson(sourceUrl);
  const source: SourceStamp = {
    source: "col-xr",
    state: result.ok ? "AVAILABLE" : "UNAVAILABLE",
    checkedAt,
    sourceUrl,
    note: `Legacy GBIF Backbone key ${gbifKey} crosswalked to COL XR.`,
  };
  if (!result.ok) return { ok: false, error: `COL_XR_${result.error}`, sources: [source] };
  const usage = result.data?.acceptedUsage ?? result.data?.usage;
  if (!usage?.key || !usage?.name) {
    source.state = "NOT_FOUND";
    return { ok: false, error: "COL_XR_NO_MATCH", sources: [source] };
  }
  const classification = normalizeClassification(result.data?.classification);
  const taxonomyMatch = resolveMatchReview(result.data, {
    name: expected.scientificName ?? `gbif:${gbifKey}`,
    rank: expected.rank,
    identifierBased: true,
  });
  return {
    ok: true,
    data: {
      key: String(usage.key),
      scientificName: String(usage.name),
      canonicalName: String(usage.canonicalName ?? usage.name),
      authorship: usage.authorship ? String(usage.authorship) : undefined,
      rank: String(usage.rank ?? "UNRANKED").toUpperCase(),
      status: usage.status ? String(usage.status).toUpperCase() : undefined,
      kingdom: classification.find((n) => n.rank === "KINGDOM")?.name,
      classification,
      taxonomyMatch,
      source,
    },
  };
}

interface NorwayTaxon {
  taxonId?: number;
  scientificNameId?: number;
  scientificName?: string;
  commonName?: string;
  taxonGroup?: string;
  existsInCountry?: boolean;
  source: SourceStamp;
}

/** Norway-specific taxon enrichment. Absence is not treated as an error. */
export async function fetchNorwayTaxon(scientificName: string): Promise<EngineResult<NorwayTaxon>> {
  const q = new URLSearchParams({ ScientificName: scientificName.trim() });
  const sourceUrl = `https://artskart.artsdatabanken.no/publicapi/api/taxon?${q.toString()}`;
  const checkedAt = now();
  const result = await getJson(sourceUrl);
  const source: SourceStamp = {
    source: "artsdatabanken",
    state: result.ok ? "AVAILABLE" : "UNAVAILABLE",
    checkedAt,
    sourceUrl,
    note: "Norway-specific names and taxon context from Artsdatabanken Artskart public API.",
  };
  if (!result.ok) return { ok: false, error: `ARTSDATABANKEN_${result.error}`, sources: [source] };

  const rows = Array.isArray(result.data)
    ? result.data
    : Array.isArray(result.data?.Results)
      ? result.data.Results
      : Array.isArray(result.data?.results)
        ? result.data.results
        : result.data ? [result.data] : [];

  const wanted = scientificName.trim().toLowerCase();
  const row = rows.find((r: any) => String(r?.ValidScientificName ?? r?.ScientificName ?? "").toLowerCase() === wanted) ?? rows[0];
  if (!row) {
    source.state = "NOT_FOUND";
    return { ok: false, error: "ARTSDATABANKEN_NO_MATCH", sources: [source] };
  }

  return {
    ok: true,
    data: {
      taxonId: Number.isFinite(Number(row.TaxonId ?? row.taxonId)) ? Number(row.TaxonId ?? row.taxonId) : undefined,
      scientificNameId: Number.isFinite(Number(row.ValidScientificNameId ?? row.ScientificNameId ?? row.scientificNameId))
        ? Number(row.ValidScientificNameId ?? row.ScientificNameId ?? row.scientificNameId)
        : undefined,
      scientificName: String(row.ValidScientificName ?? row.ScientificName ?? row.scientificName ?? "") || undefined,
      commonName: String(row.PrefferedPopularname ?? row.PreferredPopularName ?? row.preferredPopularName ?? "") || undefined,
      taxonGroup: String(row.TaxonGroup ?? row.taxonGroup ?? "") || undefined,
      existsInCountry: typeof (row.ExistsInCountry ?? row.existsInCountry) === "boolean"
        ? Boolean(row.ExistsInCountry ?? row.existsInCountry)
        : undefined,
      source,
    },
  };
}

/** Real occurrence records queried using COL XR taxonomy, not interpreted as range. */
export async function fetchGbifOccurrencesColXr(
  colKey: string,
  options: { country?: string; limit?: number } = {},
): Promise<EngineResult<UniversalOccurrenceSummary>> {
  const q = new URLSearchParams({
    taxonKey: colKey,
    checklistKey: COL_XR_CHECKLIST_KEY,
    hasCoordinate: "true",
    occurrenceStatus: "PRESENT",
    hasGeospatialIssue: "false",
    limit: String(options.limit ?? 12),
  });
  if (options.country) q.set("country", options.country);

  const sourceUrl = `https://api.gbif.org/v1/occurrence/search?${q.toString()}`;
  const checkedAt = now();
  const result = await getJson(sourceUrl);
  const source: SourceStamp = {
    source: "gbif",
    state: result.ok ? "AVAILABLE" : "UNAVAILABLE",
    checkedAt,
    sourceUrl,
    note: "Occurrence records are evidence of reported observations, not range, abundance or live location.",
  };
  if (!result.ok) return { ok: false, error: `GBIF_${result.error}`, sources: [source] };

  const returned = Array.isArray(result.data?.results) ? result.data.results : [];
  const sample = returned
    .filter(isSemanticallyAdmissibleGbifOccurrence)
    .map((row: any) => ({
      key: String(row.key),
      lat: row.decimalLatitude,
      lng: row.decimalLongitude,
      coordinateUncertaintyM: typeof row.coordinateUncertaintyInMeters === "number" ? row.coordinateUncertaintyInMeters : undefined,
      sourceUrl: `https://www.gbif.org/occurrence/${row.key}`,
      ...gbifOccurrenceProvenance(row, checkedAt),
    }));

  return {
    ok: true,
    data: {
      total: Number(result.data?.count ?? sample.length),
      totalSemantics: GBIF_FILTERED_TOTAL_SEMANTICS,
      returnedPageCount: returned.length,
      publicUseSampleCount: sample.filter((row: any) => row.rightsReviewState === "PUBLIC_USE_READY").length,
      rightsReviewRequiredCount: sample.filter((row: any) => row.rightsReviewState === "REVIEW_REQUIRED").length,
      country: options.country,
      sample,
    },
  };
}

/** Materialise one universal source-aware profile on demand. */
export async function materializeUniversalTaxonProfile(
  scientificName: string,
  options: { rank?: string; norway?: boolean } = { norway: true },
): Promise<EngineResult<UniversalTaxonProfile>> {
  const col = await resolveColXr(scientificName, options.rank);
  if (!col.ok) return col;

  const norwayEnabled = options.norway !== false;
  const [norway, occurrences] = await Promise.all([
    norwayEnabled ? fetchNorwayTaxon(col.data.canonicalName) : Promise.resolve(null),
    fetchGbifOccurrencesColXr(col.data.key, { country: norwayEnabled ? "NO" : undefined, limit: 12 }),
  ]);

  const sources: SourceStamp[] = [col.data.source];
  if (norway) {
    if (norway.ok) sources.push(norway.data.source);
    else if (norway.sources) sources.push(...norway.sources);
  }
  if (occurrences.ok) {
    sources.push({
      source: "gbif",
      state: "AVAILABLE",
      checkedAt: now(),
      sourceUrl: `https://api.gbif.org/v1/occurrence/search?taxonKey=${encodeURIComponent(col.data.key)}&checklistKey=${COL_XR_CHECKLIST_KEY}`,
      note: "Occurrence summary materialised from GBIF using COL XR taxonomy.",
    });
  } else if (occurrences.sources) {
    sources.push(...occurrences.sources);
  }

  const norwayData = norway && norway.ok ? norway.data : undefined;
  const externalIds: ExternalTaxonIds = {
    colXr: col.data.key,
    artsdatabankenTaxonId: norwayData?.taxonId,
    artsdatabankenScientificNameId: norwayData?.scientificNameId,
  };

  const registry = col.data.taxonomyMatch.state === "ELIGIBLE_FOR_TEST_REGISTRY"
    ? registerOrResolveTaxon({
        canonicalName: col.data.canonicalName,
        scientificName: col.data.scientificName,
        rank: col.data.rank,
        status: col.data.status,
        externalIds,
      })
    : null;

  const limitations = [
    "This is a source-materialised Universal Profile, not a curated 4PLANET Gold Profile.",
    "Occurrence points are reported records, not species range, abundance, trend or live location.",
    registry
      ? "4PLANET identity is persisted in the TEST browser registry only; it is not yet shared BRAIN infrastructure."
      : "No persisted TEST registry was available, so identity remains externally anchored for this materialisation.",
  ];
  if (col.data.taxonomyMatch.state === "REVIEW_REQUIRED") {
    limitations.push(
      `Taxonomic identity requires review before TEST registry persistence: ${col.data.taxonomyMatch.reasons.join(", ")}.`,
    );
  }
  if (!norwayData) limitations.push("No Norway-specific Artsdatabanken enrichment was resolved for this materialisation.");

  return {
    ok: true,
    data: {
      id: registry?.id ?? provisional4pTaxonId(col.data.key),
      identityState: registry ? "CANONICAL_4P_TEST_REGISTRY" : "PROVISIONAL_EXTERNAL_ANCHORED",
      registry: registry
        ? { persistenceScope: registry.persistenceScope, createdAt: registry.createdAt, updatedAt: registry.updatedAt }
        : undefined,
      canonicalName: col.data.canonicalName,
      scientificName: col.data.scientificName,
      authorship: col.data.authorship,
      rank: col.data.rank,
      status: col.data.status,
      kingdom: col.data.kingdom,
      commonName: norwayData?.commonName,
      commonNameLanguage: norwayData?.commonName ? "no" : undefined,
      norwegianContext: norwayData
        ? { existsInCountry: norwayData.existsInCountry, taxonGroup: norwayData.taxonGroup }
        : undefined,
      externalIds,
      classification: col.data.classification,
      taxonomyMatch: col.data.taxonomyMatch,
      occurrences: occurrences.ok ? occurrences.data : undefined,
      sources,
      limitations,
    },
  };
}

export const NORWAY_FIELD_PROOF_TAXA = [
  { label: "Gran", scientificName: "Picea abies", rank: "species", group: "TREE" },
  { label: "Furu", scientificName: "Pinus sylvestris", rank: "species", group: "TREE" },
  { label: "Rogn", scientificName: "Sorbus aucuparia", rank: "species", group: "TREE" },
  { label: "Osp", scientificName: "Populus tremula", rank: "species", group: "TREE" },
  { label: "Bjørk", scientificName: "Betula", rank: "genus", group: "TREE" },
  { label: "Humle", scientificName: "Bombus", rank: "genus", group: "POLLINATOR" },
] as const;
