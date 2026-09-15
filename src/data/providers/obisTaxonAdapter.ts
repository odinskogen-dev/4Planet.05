import type { SourceRefreshSnapshot } from "../sourceRefresh";

export const OBIS_TAXON_API = "https://api.obis.org/v3/taxon";
export const OBIS_PROVIDER = "OBIS API v3 / WoRMS taxonomy";

export interface NormalizedObisTaxon {
  aphiaId: number;
  scientificName: string;
  scientificNameAuthorship?: string;
  taxonRank?: string;
  kingdom?: string;
  phylum?: string;
  className?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
}

export interface ObisTaxonFetchResult {
  provider: typeof OBIS_PROVIDER;
  providerId: string;
  canonicalLocator: string;
  normalized?: NormalizedObisTaxon;
  snapshot: SourceRefreshSnapshot;
  error?: string;
}

type UnknownRecord = Record<string, unknown>;

const semanticFields: (keyof NormalizedObisTaxon)[] = [
  "aphiaId", "scientificName", "scientificNameAuthorship", "taxonRank", "kingdom",
  "phylum", "className", "order", "family", "genus", "species",
];

const fnv1a32 = (input: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};

const cleanString = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined;
const parseAphiaId = (value: unknown) => {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string") {
    const direct = value.trim().match(/^\d+$/);
    if (direct) return Number(direct[0]);
    const lsid = value.match(/taxname:(\d+)/i);
    if (lsid) return Number(lsid[1]);
  }
  return undefined;
};

const asRows = (payload: unknown): UnknownRecord[] => {
  if (!payload || typeof payload !== "object") throw new Error("Malformed OBIS taxon payload: object response required.");
  const results = (payload as UnknownRecord).results;
  if (!Array.isArray(results)) throw new Error("Malformed OBIS taxon payload: results array required.");
  return results.filter((row): row is UnknownRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row));
};

export const normalizeObisTaxon = (payload: unknown, aphiaId: number): NormalizedObisTaxon => {
  const rows = asRows(payload);
  const row = rows.find((candidate) => parseAphiaId(
    candidate.AphiaID ?? candidate.aphiaID ?? candidate.taxonid ?? candidate.taxonID ?? candidate.scientificNameID,
  ) === aphiaId);
  if (!row) throw new Error(`Malformed OBIS taxon payload: AphiaID ${aphiaId} not found in results.`);

  const scientificName = cleanString(row.scientificName ?? row.scientificname);
  if (!scientificName) throw new Error("Malformed OBIS taxon payload: scientificName is required.");

  return {
    aphiaId,
    scientificName,
    scientificNameAuthorship: cleanString(row.scientificNameAuthorship ?? row.authority),
    taxonRank: cleanString(row.taxonRank ?? row.rank_name ?? row.rank),
    kingdom: cleanString(row.kingdom),
    phylum: cleanString(row.phylum),
    className: cleanString(row.class),
    order: cleanString(row.order),
    family: cleanString(row.family),
    genus: cleanString(row.genus),
    species: cleanString(row.species),
  };
};

export const fingerprintObisTaxon = (normalized: NormalizedObisTaxon) => {
  const semantic = semanticFields.map((field) => `${field}=${normalized[field] ?? ""}`).join("|");
  return `OBIS:taxon-semantic-v1:${fnv1a32(semantic)}`;
};

export async function fetchObisTaxonSnapshot(
  aphiaId: number,
  checkedAt: string,
  options: { fetcher?: typeof fetch; expectedScientificName?: string; signal?: AbortSignal } = {},
): Promise<ObisTaxonFetchResult> {
  const fetcher = options.fetcher ?? fetch;
  const canonicalLocator = `${OBIS_TAXON_API}/${encodeURIComponent(String(aphiaId))}`;
  const providerId = `OBIS:worms:${aphiaId}`;

  try {
    const response = await fetcher(canonicalLocator, { method: "GET", headers: { Accept: "application/json" }, signal: options.signal });
    if (!response.ok) {
      return { provider: OBIS_PROVIDER, providerId, canonicalLocator, snapshot: {
        checkedAt, fingerprint: `${providerId}:HTTP_${response.status}`, fingerprintMethod: "PROVIDER_VERSION",
        verification: "REVIEW_REQUIRED", available: false, providerId, changeScope: "UNKNOWN",
      }, error: `OBIS API returned HTTP ${response.status}.` };
    }

    const normalized = normalizeObisTaxon(await response.json() as unknown, aphiaId);
    const fingerprint = fingerprintObisTaxon(normalized);
    if (options.expectedScientificName && normalized.scientificName.toLowerCase() !== options.expectedScientificName.toLowerCase()) {
      return { provider: OBIS_PROVIDER, providerId, canonicalLocator, normalized, snapshot: {
        checkedAt, fingerprint, fingerprintMethod: "SEMANTIC_VERSION", sourceVersion: fingerprint,
        verification: "REVIEW_REQUIRED", available: true, providerId,
        conflict: `Expected ${options.expectedScientificName}; OBIS returned ${normalized.scientificName}.`,
        changeScope: "CLAIM_RELEVANT", changedFields: ["scientificName"],
      } };
    }

    return { provider: OBIS_PROVIDER, providerId, canonicalLocator, normalized, snapshot: {
      checkedAt, fingerprint, fingerprintMethod: "SEMANTIC_VERSION", sourceVersion: fingerprint,
      verification: "VERIFIED", available: true, providerId, changeScope: "CLAIM_RELEVANT",
    } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OBIS fetch error";
    return { provider: OBIS_PROVIDER, providerId, canonicalLocator, snapshot: {
      checkedAt, fingerprint: `${providerId}:UNAVAILABLE`, fingerprintMethod: "PROVIDER_VERSION",
      verification: "REVIEW_REQUIRED", available: false, providerId, changeScope: "UNKNOWN",
    }, error: message };
  }
}
