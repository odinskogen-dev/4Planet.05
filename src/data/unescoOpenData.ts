/**
 * 4PLANET — UNESCO DataHub shared open-data contract.
 *
 * PURPOSE
 * - one bounded, rights-aware read contract for ATLAS, 4NATION and S4PIENS;
 * - no new truth store and no wholesale mirror of upstream databases;
 * - preserve dataset identity, retrieval time, temporal meaning and limitations.
 *
 * CURRENT RIGHTS CHECK: 2026-10-13.
 * The five datasets below are published by UNESCO/IOC-UNESCO as CC BY-SA 4.0.
 * Commercial reuse is permitted under that licence, with attribution and
 * ShareAlike obligations for adaptations. Keep this source family logically
 * identifiable; never relabel upstream data as 4PLANET-owned.
 */

export type UnescoDatasetId = "mab001" | "whc001" | "eg0001" | "ioc001" | "cou001";

export interface DataRightsEnvelope {
  licence: "CC BY-SA 4.0";
  licenceUrl: string;
  attribution: string;
  commercialUse: "YES_WITH_ATTRIBUTION_AND_SHAREALIKE";
  derivatives: "YES_SHAREALIKE";
  shareAlike: true;
  redistribution: "YES_UNDER_LICENCE";
  cachePersistence: "BOUNDED_CACHE_WITH_SOURCE_AND_LICENCE";
  termsCheckedAt: string;
}

export interface DatasetMetadata {
  id: UnescoDatasetId;
  provider: string;
  publisher: string;
  title: string;
  officialDatasetUrl: string;
  referenceUrl: string;
  apiPath: string;
  maxRecords: number;
  rights: DataRightsEnvelope;
  temporalSemantics: string;
  geographicSemantics: string;
  limitation: string;
  productRoles: readonly string[];
  edition?: {
    datasetDescriptionAsOf: string;
    datasetProcessedAt: string;
    recordsetVersion: "RETRIEVED_AT_REQUEST_TIME";
    referenceLabel: string;
    referenceUrl: string;
    referenceUpdatedAt: string;
    referenceCountSummary: string;
    status: "MIXED_EDITION";
    limitation: string;
  };
}

const UNESCO_RIGHTS = (attribution: string): DataRightsEnvelope => ({
  licence: "CC BY-SA 4.0",
  licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  attribution,
  commercialUse: "YES_WITH_ATTRIBUTION_AND_SHAREALIKE",
  derivatives: "YES_SHAREALIKE",
  shareAlike: true,
  redistribution: "YES_UNDER_LICENCE",
  cachePersistence: "BOUNDED_CACHE_WITH_SOURCE_AND_LICENCE",
  termsCheckedAt: "2026-10-13",
});

export const UNESCO_DATASETS: Record<UnescoDatasetId, DatasetMetadata> = {
  mab001: {
    id: "mab001",
    provider: "UNESCO DataHub",
    publisher: "UNESCO",
    title: "Man and the Biosphere Programme",
    officialDatasetUrl: "https://data.unesco.org/explore/dataset/mab001/?flg=en-us",
    referenceUrl: "https://www.unesco.org/en/mab",
    apiPath: "/api/unesco-data?dataset=mab001",
    maxRecords: 900,
    rights: UNESCO_RIGHTS("UNESCO"),
    temporalSemantics: "DESIGNATION / SOURCE-RECORD DATES; NOT LIVE ECOLOGICAL CONDITION",
    geographicSemantics: "SOURCE-PROVIDED REPRESENTATIVE COORDINATE FOR A BIOSPHERE RESERVE",
    limitation: "Designation and descriptive context do not establish current ecosystem health; the point is not the reserve boundary.",
    productRoles: ["ATLAS", "4NATION", "NATUREBRAIN"],
  },
  whc001: {
    id: "whc001",
    provider: "UNESCO DataHub",
    publisher: "UNESCO",
    title: "World Heritage List",
    officialDatasetUrl: "https://data.unesco.org/explore/dataset/whc001/?flg=en-us",
    referenceUrl: "https://whc.unesco.org/en/list/",
    apiPath: "/api/unesco-data?dataset=whc001",
    maxRecords: 1400,
    rights: UNESCO_RIGHTS("UNESCO"),
    temporalSemantics: "INSCRIPTION / LIST STATUS; ANNUAL DATASET",
    geographicSemantics: "SOURCE-PROVIDED SITE COORDINATE; NOT A COMPLETE SITE BOUNDARY",
    limitation: "World Heritage status is a designation, not a measure of current ecological or cultural condition.",
    productRoles: ["ATLAS", "4NATION", "4CULTURE", "NATUREBRAIN"],
  },
  eg0001: {
    id: "eg0001",
    provider: "UNESCO DataHub",
    publisher: "UNESCO",
    title: "UNESCO Global Geoparks",
    officialDatasetUrl: "https://data.unesco.org/explore/dataset/eg0001/?flg=en-us",
    referenceUrl: "https://www.unesco.org/en/iggp/geoparks/about",
    apiPath: "/api/unesco-data?dataset=eg0001",
    maxRecords: 300,
    rights: UNESCO_RIGHTS("UNESCO"),
    temporalSemantics: "DESIGNATION / SOURCE-RECORD DATES; FOUR-YEAR REVALIDATION; NOT LIVE OR CURRENT-STATUS PROOF",
    geographicSemantics: "SOURCE-PROVIDED REPRESENTATIVE COORDINATE FOR A GEOPARK",
    limitation: "The point is not the geopark boundary. Designation does not establish current legal protection, current revalidation status or ecological outcome.",
    productRoles: ["ATLAS", "4NATION", "NATUREBRAIN"],
    edition: {
      datasetDescriptionAsOf: "2025-01-15",
      datasetProcessedAt: "UNKNOWN",
      recordsetVersion: "RETRIEVED_AT_REQUEST_TIME",
      referenceLabel: "UNESCO official Global Geoparks list",
      referenceUrl: "https://www.unesco.org/en/iggp/geoparks",
      referenceUpdatedAt: "2026-07-24",
      referenceCountSummary: "241 geoparks / 51 countries",
      status: "MIXED_EDITION",
      limitation: "The older DataHub description is stale reference text. Processing time does not establish semantic currency; the returned recordset and current UNESCO list must not be presented as the same edition.",
    },
  },
  ioc001: {
    id: "ioc001",
    provider: "UNESCO DataHub / OBIS",
    publisher: "IOC-UNESCO / IODE",
    title: "Marine Biodiversity by Ocean Area — Ocean Biodiversity Information System",
    officialDatasetUrl: "https://data.unesco.org/explore/dataset/ioc001/?flg=en-us",
    referenceUrl: "https://obis.org",
    apiPath: "/api/unesco-data?dataset=ioc001",
    maxRecords: 2000,
    rights: UNESCO_RIGHTS("OBIS"),
    temporalSemantics: "AREA SUMMARY OVER THE SOURCE RECORD SPAN; NOT LIVE MARINE CONDITIONS",
    geographicSemantics: "SOURCE-PROVIDED REPRESENTATIVE COORDINATE FOR AN OCEAN AREA SUMMARY",
    limitation: "Counts reflect occurrence records and contributing datasets, including sampling effort; they are not abundance, complete richness, range or live positions.",
    productRoles: ["ATLAS", "OCE4N", "4NATION", "S4PIENS", "NATUREBRAIN"],
  },
  cou001: {
    id: "cou001",
    provider: "UNESCO DataHub",
    publisher: "UNESCO",
    title: "Member States",
    officialDatasetUrl: "https://data.unesco.org/explore/dataset/cou001/?flg=en-us",
    referenceUrl: "https://www.unesco.org/countries",
    apiPath: "/api/unesco-data?dataset=cou001",
    maxRecords: 250,
    rights: UNESCO_RIGHTS("UNESCO"),
    temporalSemantics: "UNESCO MEMBERSHIP / COUNTRY-RECORD STATE; NOT A LIVE POLITICAL EVENT FEED",
    geographicSemantics: "UNESCO MEMBER / ASSOCIATE-MEMBER COUNTRY IDENTITY, POINT AND SOURCE GEOMETRY",
    limitation: "Use as an identity/context source within UNESCO scope; do not imply 4PLANET adjudicates sovereignty or disputed territories.",
    productRoles: ["4NATION", "ATLAS", "S4PIENS", "NATUREBRAIN"],
  },
};

export interface UnescoDatasetResponse {
  ok: boolean;
  dataset: UnescoDatasetId;
  retrievedAt: string;
  totalCount: number | null;
  truncated: boolean;
  records: unknown[];
  rights: DataRightsEnvelope;
  error?: string;
}

export interface DataVintage {
  period?: string;
  sourcePublishedAt?: string;
  retrievedAt: string;
}

export interface Attribution {
  provider: string;
  text: string;
  licence: string;
  licenceUrl: string;
  sourceUrl: string;
}

export interface Limitation {
  code: string;
  text: string;
}

export interface CountryMetric {
  countryId: string;
  metricId: string;
  label: string;
  value: number | string | null;
  unit?: string;
  period?: string;
  sourceDataset: string;
  sourceRecordId?: string;
  sourceUrl: string;
  vintage: DataVintage;
  attribution: Attribution;
  limitations: Limitation[];
}

export interface CountrySeries {
  countryId: string;
  metricId: string;
  label: string;
  unit?: string;
  observations: CountryMetric[];
}

export interface PlaceEntity {
  id: string;
  name: string;
  kind: string;
  countryIso2?: string;
  lat: number;
  lon: number;
  sourceDataset: string;
  sourceUrl: string;
  attribution: Attribution;
  limitations: Limitation[];
}

export interface SpatialFeature<TProperties extends Record<string, unknown> = Record<string, unknown>> {
  type: "Feature";
  geometry: unknown;
  properties: TProperties;
}

export interface CountryIdentity {
  id: string;
  iso2: string;
  iso3: string;
  name: string;
  slug: string;
  capital?: string;
  regionalGroup?: string;
  membership?: string;
  lat?: number;
  lon?: number;
  geometry?: unknown;
  sourceDataset: "cou001";
}

export interface UnescoAtlasRecord {
  id: string;
  datasetId: Exclude<UnescoDatasetId, "cou001">;
  title: string;
  kind: "BIOSPHERE_RESERVE" | "WORLD_HERITAGE" | "GLOBAL_GEOPARK" | "OCEAN_BIODIVERSITY_AREA";
  lat: number;
  lon: number;
  country?: string;
  iso2?: string;
  date?: string;
  category?: string;
  designationType?: "UNESCO_GLOBAL_GEOPARK";
  legalProtection?: "UNKNOWN";
  ecologicalOutcome?: "UNKNOWN";
  revalidationStatus?: "UNKNOWN";
  sourceUrl: string;
  summary?: string;
  metrics?: {
    observations?: number;
    species?: number;
    taxa?: number;
    datasets?: number;
    threatenedSpecies?: number;
    threatenedShare?: number;
    firstYear?: string;
    lastYear?: string;
  };
}

const asFields = (record: any): Record<string, any> =>
  record && typeof record === "object" && record.fields && typeof record.fields === "object"
    ? record.fields
    : (record && typeof record === "object" ? record : {});

export const safeHttpUrl = (value: unknown): string => {
  try {
    const url = new URL(String(value ?? "").trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
};

/**
 * UNESCO DataHub geo_point samples are [latitude, longitude], unlike GeoJSON
 * coordinate arrays. Objects are accepted defensively for API representation
 * changes, but are never guessed when both values are not finite.
 *
 * whc001 (World Heritage) sends GeoJSON instead, e.g.
 * {"type":"Feature","geometry":{"type":"MultiPoint","coordinates":[[5.32,60.40]]}}.
 * GeoJSON positions are [longitude, latitude] (RFC 7946 §3.1.1), so a Feature or a
 * bare Point/MultiPoint geometry is read lon-first; a MultiPoint uses its first
 * position. Without this every whc001 record was dropped (4NATION showed 0 sites).
 */
export const normaliseUnescoPoint = (value: any): { lat: number; lon: number } | null => {
  const coordinateNumber = (component: unknown): number | null => {
    if (component === null || component === undefined || typeof component === "boolean") return null;
    if (typeof component === "string" && component.trim() === "") return null;
    const numeric = typeof component === "number" ? component : Number(component);
    return Number.isFinite(numeric) ? numeric : null;
  };

  let rawLat: unknown;
  let rawLon: unknown;
  const geometry = value && typeof value === "object" && !Array.isArray(value)
    ? (value.type === "Feature" ? value.geometry : value.type === "Point" || value.type === "MultiPoint" ? value : undefined)
    : undefined;
  if (geometry && typeof geometry === "object") {
    const position = geometry.type === "Point" ? geometry.coordinates
      : geometry.type === "MultiPoint" && Array.isArray(geometry.coordinates) ? geometry.coordinates[0]
      : undefined;
    if (!Array.isArray(position) || position.length < 2) return null;
    [rawLon, rawLat] = position;
  } else if (Array.isArray(value) && value.length >= 2) {
    [rawLat, rawLon] = value;
  } else if (value && typeof value === "object") {
    rawLat = value.lat ?? value.latitude;
    rawLon = value.lon ?? value.lng ?? value.longitude;
  } else {
    return null;
  }

  const lat = coordinateNumber(rawLat);
  const lon = coordinateNumber(rawLon);
  if (lat === null || lon === null || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
};

export const asOptionalFiniteNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const slugify = (value: string) =>
  value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const normaliseCountryIdentity = (record: unknown): CountryIdentity | null => {
  const f = asFields(record);
  const iso2 = String(f.iso2 ?? "").trim().toUpperCase();
  const iso3 = String(f.iso3 ?? "").trim().toUpperCase();
  const name = String(f.country_title_en ?? "").trim();
  if (!iso2 || !iso3 || !name) return null;
  const point = normaliseUnescoPoint(f.coordinates);
  return {
    id: `country:iso3:${iso3.toLowerCase()}`,
    iso2,
    iso3,
    name,
    slug: slugify(name),
    capital: String(f.capital_en ?? "").trim() || undefined,
    regionalGroup: String(f.regional_group ?? "").trim() || undefined,
    membership: String(f.membership ?? "").trim() || undefined,
    lat: point?.lat,
    lon: point?.lon,
    geometry: f.geometry ?? undefined,
    sourceDataset: "cou001",
  };
};

export const normaliseUnescoAtlasRecord = (
  datasetId: Exclude<UnescoDatasetId, "cou001">,
  record: unknown,
): UnescoAtlasRecord | null => {
  const f = asFields(record);
  const point = normaliseUnescoPoint(f.coordinates);
  if (!point) return null;

  if (datasetId === "mab001") {
    const title = String(f.title_en ?? "").trim();
    if (!title) return null;
    return {
      id: `place:unesco:mab:${String(f.mab_id ?? f.uuid ?? slugify(title))}`,
      datasetId,
      title,
      kind: "BIOSPHERE_RESERVE",
      ...point,
      country: String(f.country_title_en ?? "").trim() || undefined,
      iso2: String(f.iso2 ?? "").trim().toUpperCase() || undefined,
      date: String(f.date ?? "").trim() || undefined,
      sourceUrl: UNESCO_DATASETS.mab001.referenceUrl,
      summary: String(f.introduction_en ?? "").trim() || undefined,
    };
  }

  if (datasetId === "whc001") {
    const title = String(f.name_en ?? "").trim();
    const idNo = String(f.id_no ?? "").trim();
    if (!title) return null;
    return {
      id: `place:unesco:whc:${idNo || String(f.uuid ?? slugify(title))}`,
      datasetId,
      title,
      kind: "WORLD_HERITAGE",
      ...point,
      country: String(f.states_names ?? "").trim() || undefined,
      iso2: String(f.iso_codes ?? "").trim().toUpperCase() || undefined,
      date: String(f.date_inscribed ?? "").trim() || undefined,
      category: String(f.category ?? "").trim() || undefined,
      sourceUrl: idNo ? `https://whc.unesco.org/en/list/${encodeURIComponent(idNo)}` : UNESCO_DATASETS.whc001.referenceUrl,
      summary: String(f.short_description_en ?? "").trim() || undefined,
    };
  }

  if (datasetId === "eg0001") {
    const title = String(f.title_en ?? "").trim();
    if (!title) return null;
    return {
      id: `place:unesco:geopark:${String(f.ugg_id ?? f.uuid ?? slugify(title))}`,
      datasetId,
      title,
      kind: "GLOBAL_GEOPARK",
      designationType: "UNESCO_GLOBAL_GEOPARK",
      legalProtection: "UNKNOWN",
      ecologicalOutcome: "UNKNOWN",
      revalidationStatus: "UNKNOWN",
      ...point,
      iso2: String(f.countries ?? "").trim().toUpperCase() || undefined,
      date: String(f.date ?? "").trim() || undefined,
      sourceUrl: safeHttpUrl(f.url) || safeHttpUrl(f.website) || UNESCO_DATASETS.eg0001.referenceUrl,
      summary: String(f.introduction_en ?? f.description ?? "").trim() || undefined,
    };
  }

  const title = String(f.area_name ?? "").trim();
  if (!title) return null;
  return {
    id: `place:obis:area:${String(f.area_id ?? f.uuid ?? slugify(title))}`,
    datasetId,
    title,
    kind: "OCEAN_BIODIVERSITY_AREA",
    ...point,
    country: String(f.country_title_en ?? "").trim() || undefined,
    iso2: String(f.country_iso2 ?? "").trim().toUpperCase() || undefined,
    category: String(f.area_type ?? "").trim() || undefined,
    sourceUrl: safeHttpUrl(f.source_url) || UNESCO_DATASETS.ioc001.referenceUrl,
    metrics: {
      observations: asOptionalFiniteNumber(f.n_observations),
      species: asOptionalFiniteNumber(f.n_species),
      taxa: asOptionalFiniteNumber(f.n_taxa),
      datasets: asOptionalFiniteNumber(f.n_datasets),
      threatenedSpecies: asOptionalFiniteNumber(f.n_threatened_species),
      threatenedShare: asOptionalFiniteNumber(f.pct_threatened),
      firstYear: String(f.year_first ?? "").trim() || undefined,
      lastYear: String(f.year_last ?? "").trim() || undefined,
    },
  };
};

export async function fetchCountryIdentities(): Promise<CountryIdentity[]> {
  const response = await fetchUnescoDataset("cou001");
  return response.records.map(normaliseCountryIdentity).filter((country): country is CountryIdentity => Boolean(country));
}

export async function findCountryIdentity(iso2OrIso3: string): Promise<CountryIdentity | null> {
  const code = String(iso2OrIso3 ?? "").trim().toUpperCase();
  if (!code) return null;
  const countries = await fetchCountryIdentities();
  return countries.find((country) => country.iso2 === code || country.iso3 === code) ?? null;
}

export async function fetchUnescoDataset(dataset: UnescoDatasetId): Promise<UnescoDatasetResponse> {
  const meta = UNESCO_DATASETS[dataset];
  const response = await fetch(meta.apiPath, { headers: { accept: "application/json" } });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body || body.ok !== true || !Array.isArray(body.records)) {
    throw new Error(String(body?.error || `UNESCO_${dataset}_UNAVAILABLE`));
  }
  return {
    ok: true,
    dataset,
    retrievedAt: String(body.retrievedAt ?? ""),
    totalCount: Number.isFinite(Number(body.totalCount)) ? Number(body.totalCount) : null,
    truncated: body.truncated === true,
    records: body.records,
    rights: meta.rights,
  };
}

