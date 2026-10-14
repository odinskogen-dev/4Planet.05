import { COL_XR_CHECKLIST_KEY } from "@/species/engine";

export type SpeciesMediaRightsState = "DISPLAYABLE" | "REVIEW_REQUIRED" | "BLOCKED";

export interface ResolvedSpeciesImage {
  id: string;
  identifier: string;
  previewUrl: string;
  sourceUrl: string;
  occurrenceKey: string;
  source: "gbif";
  title?: string;
  license: string;
  creator?: string;
  publisher?: string;
  rightsHolder?: string;
  datasetName?: string;
  rightsState: SpeciesMediaRightsState;
  rightsCheckedAt: string;
}

export type SpeciesMediaResult =
  | { ok: true; data: ResolvedSpeciesImage[]; note: string; blockedCount: number; rightsCheckedAt: string }
  | { ok: false; error: string; note?: string };

async function getJson(url: string, timeoutMs = 12000): Promise<any> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: ctl.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    return { ok: true, data: await response.json() };
  } catch (error: any) {
    return { ok: false, error: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK" };
  } finally {
    clearTimeout(timer);
  }
}

function normaliseLicence(value?: string): string {
  return String(value ?? "").trim();
}

/** Image rights must be proved by the media item itself; occurrence-level licences cannot be inherited. */
export function resolveSpeciesImageLicence(mediaLicense?: string): string {
  return normaliseLicence(mediaLicense);
}

/**
 * Conservative public-product rights gate.
 * We display only licences that clearly permit public reuse and modification/cropping.
 * NC/ND/custom/missing licences stay out of the image plane until reviewed.
 */
export function classifySpeciesMediaRights(license?: string): SpeciesMediaRightsState {
  const raw = normaliseLicence(license);
  if (!raw) return "BLOCKED";
  const value = raw.toLowerCase().replace(/_/g, "-").trim();

  // Negative, restricted, or contradictory text wins before every positive.
  const hasRestrictedOrContradictoryText =
    /\b(?:not|no|non)[-\s]+public[-\s]+domain\b/.test(value) ||
    /(?:^|[^a-z0-9])(?:nc|nd)(?:[^a-z0-9]|$)/.test(value) ||
    /\bnon[-\s]?commercial\b/.test(value) ||
    /\bno[-\s]+derivatives?\b/.test(value) ||
    /\ball[-\s]+rights[-\s]+reserved\b/.test(value) ||
    /\bpermission[-\s]+required\b/.test(value) ||
    /\bcopyright(?:ed)?\b/.test(value);
  if (hasRestrictedOrContradictoryText) return "REVIEW_REQUIRED";

  // URL licences are authority-bearing inputs: accept only the canonical
  // Creative Commons host and an exact supported path, with no query/fragment.
  const ccLicenceVersion = "(?:1\\.0|2\\.0|2\\.5|3\\.0|4\\.0)";
  const ccLicenseUrl = new RegExp(
    `^https?://(?:www\\.)?creativecommons\\.org/licenses/(?:by|by-sa)/${ccLicenceVersion}/?$`,
  );
  const ccPublicDomainUrl =
    /^https?:\/\/(?:www\.)?creativecommons\.org\/publicdomain\/(?:zero|mark)\/1\.0\/?$/;

  if (ccPublicDomainUrl.test(value)) return "DISPLAYABLE";
  if (
    /^cc0(?:[-\s]+1\.0)?$/.test(value) ||
    /^(?:the\s+)?public[-\s]+domain(?:[-\s]+mark(?:[-\s]+1\.0)?)?$/.test(value)
  ) return "DISPLAYABLE";

  if (ccLicenseUrl.test(value)) return "DISPLAYABLE";
  // Short labels are not authority-bearing without an issued legal-code version.
  if (/^cc[-\s]+by(?:[-\s]+sa)?[-\s]+(?:1\.0|2\.0|2\.5|3\.0|4\.0)$/.test(value)) {
    return "DISPLAYABLE";
  }

  return "REVIEW_REQUIRED";
}
function rightsNote(base: string, blockedCount: number): string {
  if (!blockedCount) return `${base} Only media with an explicit displayable public-use licence are shown.`;
  return `${base} ${blockedCount} media item${blockedCount === 1 ? " was" : "s were"} withheld because the licence was missing or requires review.`;
}

async function queryGbifStillImages(
  colXr: string,
  options: { country?: string; limit?: number; blockedIdentifiers?: Set<string> } = {},
): Promise<SpeciesMediaResult> {
  const q = new URLSearchParams({
    taxonKey: colXr,
    checklistKey: COL_XR_CHECKLIST_KEY,
    mediaType: "StillImage",
    limit: String(Math.max((options.limit ?? 8) * 4, 32)),
  });
  if (options.country) q.set("country", options.country);

  const sourceUrl = `https://api.gbif.org/v1/occurrence/search?${q.toString()}`;
  const result = await getJson(sourceUrl);
  if (!result.ok) return { ok: false, error: `GBIF_MEDIA_${result.error}` };

  const seen = new Set<string>();
  const blockedIdentifiers = options.blockedIdentifiers ?? new Set<string>();
  const images: ResolvedSpeciesImage[] = [];
  const rows = Array.isArray(result.data?.results) ? result.data.results : [];
  const rightsCheckedAt = new Date().toISOString();

  for (const row of rows) {
    const mediaRows = Array.isArray(row?.media) ? row.media : [];
    for (const media of mediaRows) {
      const identifier = String(media?.identifier ?? "").trim();
      if (!identifier || seen.has(identifier)) continue;
      const mediaType = String(media?.type ?? "").toLowerCase();
      const format = String(media?.format ?? "").toLowerCase();
      if (mediaType && mediaType !== "stillimage" && mediaType !== "image") continue;
      if (format && !format.startsWith("image/")) continue;
      seen.add(identifier);

      const license = resolveSpeciesImageLicence(media?.license);
      const rightsState = classifySpeciesMediaRights(license);
      if (rightsState !== "DISPLAYABLE") {
        blockedIdentifiers.add(identifier);
        continue;
      }

      images.push({
        id: `${row.key}-${images.length + 1}`,
        identifier,
        previewUrl: identifier,
        sourceUrl: `https://www.gbif.org/occurrence/${row.key}`,
        occurrenceKey: String(row.key),
        source: "gbif",
        title: String(media?.description ?? row?.scientificName ?? row?.species ?? row?.canonicalName ?? "").trim() || undefined,
        license,
        creator: String(media?.creator ?? row?.recordedBy ?? "").trim() || undefined,
        publisher: String(row?.publisher ?? row?.institutionCode ?? "").trim() || undefined,
        rightsHolder: String(media?.rightsHolder ?? row?.rightsHolder ?? "").trim() || undefined,
        datasetName: String(row?.datasetName ?? "").trim() || undefined,
        rightsState,
        rightsCheckedAt,
      });

      if (images.length >= (options.limit ?? 8)) break;
    }
    if (images.length >= (options.limit ?? 8)) break;
  }

  const baseNote = options.country
    ? "GBIF occurrence media resolved from Norway records using COL XR taxonomy."
    : "GBIF occurrence media resolved globally using COL XR taxonomy.";

  return {
    ok: true,
    data: images,
    blockedCount: blockedIdentifiers.size,
    rightsCheckedAt,
    note: rightsNote(baseNote, blockedIdentifiers.size),
  };
}

export async function fetchResolvedSpeciesImages(
  colXr: string,
  options: { countryFirst?: string; limit?: number } = {},
): Promise<SpeciesMediaResult> {
  const countryFirst = options.countryFirst ?? "NO";
  const blockedIdentifiers = new Set<string>();
  const countryResult = await queryGbifStillImages(colXr, {
    country: countryFirst,
    limit: options.limit ?? 8,
    blockedIdentifiers,
  });
  if (!countryResult.ok) return countryResult;
  if (countryResult.data.length > 0) return countryResult;

  const globalResult = await queryGbifStillImages(colXr, {
    limit: options.limit ?? 8,
    blockedIdentifiers,
  });
  if (!globalResult.ok) return globalResult;

  const totalBlocked = globalResult.blockedCount;
  return {
    ok: true,
    data: globalResult.data,
    blockedCount: totalBlocked,
    rightsCheckedAt: globalResult.rightsCheckedAt,
    note: globalResult.data.length
      ? rightsNote("No displayable Norway images were resolved; showing rights-gated GBIF occurrence media from global records instead.", totalBlocked)
      : rightsNote("No displayable GBIF occurrence media were resolved for this taxon.", totalBlocked),
  };
}
