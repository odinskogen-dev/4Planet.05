export type ConnectorAvailability = "AVAILABLE" | "UNAVAILABLE" | "RATE_LIMITED" | "INVALID_RESPONSE" | "STALE";

export type ConnectorProvenance = {
  institution: string;
  dataset: string;
  documentationUrl: string;
  licenceBoundary: string;
  attributionBoundary: string;
  retrievedAt: string;
  semantics: string;
};

export type ConnectorResult<T> =
  | { ok: true; state: "AVAILABLE"; data: T; provenance: ConnectorProvenance }
  | { ok: false; state: Exclude<ConnectorAvailability, "AVAILABLE">; message: string; provenance: ConnectorProvenance };

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const checkedAt = () => new Date().toISOString();

function failure<T>(
  state: Exclude<ConnectorAvailability, "AVAILABLE">,
  message: string,
  provenance: Omit<ConnectorProvenance, "retrievedAt">,
): ConnectorResult<T> {
  return { ok: false, state, message, provenance: { ...provenance, retrievedAt: checkedAt() } };
}

function statusFailure<T>(response: Response, provenance: Omit<ConnectorProvenance, "retrievedAt">): ConnectorResult<T> | null {
  if (response.status === 429) return failure("RATE_LIMITED", "The official source rate-limited this request.", provenance);
  if (!response.ok) return failure("UNAVAILABLE", `The official source returned HTTP ${response.status}.`, provenance);
  return null;
}

export type ObisOccurrence = {
  id: string;
  scientificName: string;
  decimalLatitude?: number;
  decimalLongitude?: number;
  eventDate?: string;
  datasetId?: string;
  institutionCode?: string;
  occurrenceStatus?: string;
  basisOfRecord?: string;
};

const OBIS_PROVENANCE = {
  institution: "Ocean Biodiversity Information System (IOC-UNESCO)",
  dataset: "OBIS occurrence API",
  documentationUrl: "https://manual.obis.org/access",
  licenceBoundary: "Underlying datasets can carry CC0, CC BY or CC BY-NC; record and dataset licence metadata must travel with downstream reuse.",
  attributionBoundary: "OBIS aggregation does not replace attribution to the contributing dataset and source institution.",
  semantics: "Occurrence records are observations or source records, not abundance, complete range, confirmed absence or live tracking.",
};

export function parseObisOccurrence(value: unknown): ObisOccurrence | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const idValue = row.id ?? row.occurrenceID ?? row.catalogNumber;
  const scientificName = row.scientificName;
  if ((typeof idValue !== "string" && typeof idValue !== "number") || typeof scientificName !== "string") return null;
  const number = (item: unknown) => (typeof item === "number" && Number.isFinite(item) ? item : undefined);
  const text = (item: unknown) => (typeof item === "string" && item.trim() ? item : undefined);
  return {
    id: String(idValue),
    scientificName,
    decimalLatitude: number(row.decimalLatitude),
    decimalLongitude: number(row.decimalLongitude),
    eventDate: text(row.eventDate),
    datasetId: text(row.dataset_id ?? row.datasetID),
    institutionCode: text(row.institutionCode),
    occurrenceStatus: text(row.occurrenceStatus),
    basisOfRecord: text(row.basisOfRecord),
  };
}

export async function fetchObisOccurrences(
  scientificName: string,
  fetcher: FetchLike = fetch,
  signal?: AbortSignal,
): Promise<ConnectorResult<ObisOccurrence[]>> {
  const provenance = OBIS_PROVENANCE;
  if (!scientificName.trim()) return failure("INVALID_RESPONSE", "A scientific name is required.", provenance);
  const url = new URL("https://api.obis.org/v3/occurrence");
  url.searchParams.set("scientificname", scientificName.trim());
  url.searchParams.set("size", "25");
  try {
    const response = await fetcher(url, { signal, headers: { Accept: "application/json" } });
    const status = statusFailure<ObisOccurrence[]>(response, provenance);
    if (status) return status;
    const payload = (await response.json()) as unknown;
    if (!payload || typeof payload !== "object") return failure("INVALID_RESPONSE", "OBIS returned a non-object response.", provenance);
    const results = (payload as { results?: unknown }).results;
    if (!Array.isArray(results)) return failure("INVALID_RESPONSE", "OBIS response did not contain a results array.", provenance);
    const parsed = results.map(parseObisOccurrence).filter((item): item is ObisOccurrence => Boolean(item));
    if (results.length > 0 && parsed.length === 0) return failure("INVALID_RESPONSE", "OBIS records did not satisfy the typed response boundary.", provenance);
    return { ok: true, state: "AVAILABLE", data: parsed, provenance: { ...provenance, retrievedAt: checkedAt() } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "OBIS request failed.";
    return failure("UNAVAILABLE", message, provenance);
  }
}

export type WormsTaxonMatch = {
  aphiaId: number;
  scientificName: string;
  authority?: string;
  status?: string;
  validAphiaId?: number;
  validName?: string;
  rank?: string;
  isMarine?: boolean;
};

const WORMS_PROVENANCE = {
  institution: "World Register of Marine Species (WoRMS), hosted by the Flanders Marine Institute",
  dataset: "WoRMS Aphia taxonomic database / REST webservice",
  documentationUrl: "https://www.marinespecies.org/rest/",
  licenceBoundary: "WoRMS terms and citation requirements apply; redistribution of the complete database requires separate permission.",
  attributionBoundary: "Aphia identifiers and accepted-name matches must retain WoRMS citation and should not be represented as 4PLANET-authored taxonomy.",
  semantics: "A taxonomic match is not an occurrence, range, abundance or conservation-status statement.",
};

export function parseWormsTaxon(value: unknown): WormsTaxonMatch | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const aphiaId = row.AphiaID;
  const scientificName = row.scientificname;
  if (typeof aphiaId !== "number" || !Number.isFinite(aphiaId) || typeof scientificName !== "string") return null;
  const text = (item: unknown) => (typeof item === "string" && item.trim() ? item : undefined);
  const integer = (item: unknown) => (typeof item === "number" && Number.isFinite(item) ? item : undefined);
  return {
    aphiaId,
    scientificName,
    authority: text(row.authority),
    status: text(row.status),
    validAphiaId: integer(row.valid_AphiaID),
    validName: text(row.valid_name),
    rank: text(row.rank),
    isMarine: typeof row.isMarine === "boolean" ? row.isMarine : row.isMarine === 1 ? true : row.isMarine === 0 ? false : undefined,
  };
}

export async function matchWormsTaxon(
  scientificName: string,
  fetcher: FetchLike = fetch,
  signal?: AbortSignal,
): Promise<ConnectorResult<WormsTaxonMatch[]>> {
  const provenance = WORMS_PROVENANCE;
  if (!scientificName.trim()) return failure("INVALID_RESPONSE", "A scientific name is required.", provenance);
  const endpoint = `https://www.marinespecies.org/rest/AphiaRecordsByMatchNames?scientificnames%5B%5D=${encodeURIComponent(scientificName.trim())}&marine_only=true`;
  try {
    const response = await fetcher(endpoint, { signal, headers: { Accept: "application/json" } });
    const status = statusFailure<WormsTaxonMatch[]>(response, provenance);
    if (status) return status;
    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) return failure("INVALID_RESPONSE", "WoRMS returned a non-array response.", provenance);
    const flattened = payload.flatMap((item) => (Array.isArray(item) ? item : [item]));
    const parsed = flattened.map(parseWormsTaxon).filter((item): item is WormsTaxonMatch => Boolean(item));
    if (flattened.length > 0 && parsed.length === 0) return failure("INVALID_RESPONSE", "WoRMS records did not satisfy the typed response boundary.", provenance);
    return { ok: true, state: "AVAILABLE", data: parsed, provenance: { ...provenance, retrievedAt: checkedAt() } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "WoRMS request failed.";
    return failure("UNAVAILABLE", message, provenance);
  }
}

export const P17_CONNECTOR_PROOFS = [
  {
    id: "connector-proof:obis-occurrence",
    source: "OBIS",
    mode: "fixture-first / on-demand only",
    productionIngestion: false,
    scheduledCollection: false,
    sensitivityRule: "Do not expose restricted or generalised source locations as exact points.",
  },
  {
    id: "connector-proof:worms-taxon-match",
    source: "WoRMS",
    mode: "fixture-first / on-demand only",
    productionIngestion: false,
    scheduledCollection: false,
    sensitivityRule: "Taxonomic records do not carry occurrence geography.",
  },
] as const;
