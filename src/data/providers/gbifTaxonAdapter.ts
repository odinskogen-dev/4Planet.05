import type { SourceRefreshSnapshot } from "../sourceRefresh";

export const GBIF_SPECIES_API_BASE = "https://api.gbif.org/v1/species";
export const GBIF_PROVIDER = "GBIF Species API v1";

export interface GbifTaxonPayload {
  key?: number;
  scientificName?: string;
  canonicalName?: string;
  rank?: string;
  taxonomicStatus?: string;
  acceptedKey?: number;
  kingdomKey?: number;
  phylumKey?: number;
  classKey?: number;
  orderKey?: number;
  familyKey?: number;
  genusKey?: number;
  speciesKey?: number;
  [key: string]: unknown;
}

export interface NormalizedGbifTaxon {
  key: number;
  scientificName: string;
  canonicalName?: string;
  rank?: string;
  taxonomicStatus?: string;
  acceptedKey?: number;
  kingdomKey?: number;
  phylumKey?: number;
  classKey?: number;
  orderKey?: number;
  familyKey?: number;
  genusKey?: number;
  speciesKey?: number;
}

export interface GbifTaxonFetchResult {
  provider: typeof GBIF_PROVIDER;
  providerId: string;
  canonicalLocator: string;
  normalized?: NormalizedGbifTaxon;
  snapshot: SourceRefreshSnapshot;
  error?: string;
}

const semanticFields: (keyof NormalizedGbifTaxon)[] = [
  "key",
  "scientificName",
  "canonicalName",
  "rank",
  "taxonomicStatus",
  "acceptedKey",
  "kingdomKey",
  "phylumKey",
  "classKey",
  "orderKey",
  "familyKey",
  "genusKey",
  "speciesKey",
];

const fnv1a32 = (input: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};

export const normalizeGbifTaxon = (payload: GbifTaxonPayload): NormalizedGbifTaxon => {
  if (!Number.isInteger(payload.key) || typeof payload.scientificName !== "string" || !payload.scientificName.trim()) {
    throw new Error("Malformed GBIF taxon payload: key and scientificName are required.");
  }

  const normalized: NormalizedGbifTaxon = {
    key: payload.key as number,
    scientificName: payload.scientificName.trim(),
  };
  const target = normalized as unknown as Record<string, unknown>;

  for (const field of semanticFields.slice(2)) {
    const value = payload[field];
    if (typeof value === "string" && value.trim()) {
      target[field] = value.trim();
    } else if (typeof value === "number" && Number.isFinite(value)) {
      target[field] = value;
    }
  }
  return normalized;
};

export const fingerprintGbifTaxon = (normalized: NormalizedGbifTaxon) => {
  const semantic = semanticFields
    .map((field) => `${field}=${normalized[field] ?? ""}`)
    .join("|");
  return `GBIF:species-semantic-v1:${fnv1a32(semantic)}`;
};

export async function fetchGbifTaxonSnapshot(
  taxonKey: number,
  checkedAt: string,
  options: {
    fetcher?: typeof fetch;
    expectedScientificName?: string;
    signal?: AbortSignal;
  } = {},
): Promise<GbifTaxonFetchResult> {
  const fetcher = options.fetcher ?? fetch;
  const canonicalLocator = `${GBIF_SPECIES_API_BASE}/${taxonKey}`;
  const providerId = `GBIF:species:${taxonKey}`;

  try {
    const response = await fetcher(canonicalLocator, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: options.signal,
    });

    if (!response.ok) {
      return {
        provider: GBIF_PROVIDER,
        providerId,
        canonicalLocator,
        snapshot: {
          checkedAt,
          fingerprint: `${providerId}:HTTP_${response.status}`,
          fingerprintMethod: "PROVIDER_VERSION",
          verification: "REVIEW_REQUIRED",
          available: false,
          providerId,
          changeScope: "UNKNOWN",
        },
        error: `GBIF Species API returned HTTP ${response.status}.`,
      };
    }

    const payload = await response.json() as GbifTaxonPayload;
    const normalized = normalizeGbifTaxon(payload);
    const fingerprint = fingerprintGbifTaxon(normalized);

    if (normalized.key !== taxonKey) {
      return {
        provider: GBIF_PROVIDER,
        providerId,
        canonicalLocator,
        normalized,
        snapshot: {
          checkedAt,
          fingerprint,
          fingerprintMethod: "SEMANTIC_VERSION",
          sourceVersion: fingerprint,
          verification: "REVIEW_REQUIRED",
          available: true,
          providerId,
          conflict: `Requested GBIF taxon key ${taxonKey}, received ${normalized.key}.`,
          changeScope: "CLAIM_RELEVANT",
          changedFields: ["key"],
        },
      };
    }

    if (
      options.expectedScientificName &&
      normalized.scientificName.toLowerCase() !== options.expectedScientificName.toLowerCase()
    ) {
      return {
        provider: GBIF_PROVIDER,
        providerId,
        canonicalLocator,
        normalized,
        snapshot: {
          checkedAt,
          fingerprint,
          fingerprintMethod: "SEMANTIC_VERSION",
          sourceVersion: fingerprint,
          verification: "REVIEW_REQUIRED",
          available: true,
          providerId,
          conflict: `Expected ${options.expectedScientificName}; GBIF returned ${normalized.scientificName}.`,
          changeScope: "CLAIM_RELEVANT",
          changedFields: ["scientificName"],
        },
      };
    }

    return {
      provider: GBIF_PROVIDER,
      providerId,
      canonicalLocator,
      normalized,
      snapshot: {
        checkedAt,
        fingerprint,
        fingerprintMethod: "SEMANTIC_VERSION",
        sourceVersion: fingerprint,
        verification: "VERIFIED",
        available: true,
        providerId,
        changeScope: "CLAIM_RELEVANT",
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown GBIF fetch error";
    return {
      provider: GBIF_PROVIDER,
      providerId,
      canonicalLocator,
      snapshot: {
        checkedAt,
        fingerprint: `${providerId}:UNAVAILABLE`,
        fingerprintMethod: "PROVIDER_VERSION",
        verification: "REVIEW_REQUIRED",
        available: false,
        providerId,
        changeScope: "UNKNOWN",
      },
      error: message,
    };
  }
}
