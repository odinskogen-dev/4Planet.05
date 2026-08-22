import { COL_XR_CHECKLIST_KEY } from "@/species/engine";

export interface ResolvedSpeciesImage {
  id: string;
  identifier: string;
  previewUrl: string;
  sourceUrl: string;
  occurrenceKey: string;
  source: "gbif";
  title?: string;
  license?: string;
  creator?: string;
  publisher?: string;
  rightsHolder?: string;
  datasetName?: string;
}

export type SpeciesMediaResult =
  | { ok: true; data: ResolvedSpeciesImage[]; note: string }
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

async function queryGbifStillImages(
  colXr: string,
  options: { country?: string; limit?: number } = {},
): Promise<SpeciesMediaResult> {
  const q = new URLSearchParams({
    taxonKey: colXr,
    checklistKey: COL_XR_CHECKLIST_KEY,
    mediaType: "StillImage",
    limit: String(Math.max(options.limit ?? 8, 24)),
  });
  if (options.country) q.set("country", options.country);

  const sourceUrl = `https://api.gbif.org/v1/occurrence/search?${q.toString()}`;
  const result = await getJson(sourceUrl);
  if (!result.ok) return { ok: false, error: `GBIF_MEDIA_${result.error}` };

  const seen = new Set<string>();
  const images: ResolvedSpeciesImage[] = [];
  const rows = Array.isArray(result.data?.results) ? result.data.results : [];

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
      images.push({
        id: `${row.key}-${images.length + 1}`,
        identifier,
        previewUrl: identifier,
        sourceUrl: `https://www.gbif.org/occurrence/${row.key}`,
        occurrenceKey: String(row.key),
        source: "gbif",
        title: String(media?.description ?? row?.scientificName ?? row?.species ?? row?.canonicalName ?? "").trim() || undefined,
        license: String(media?.license ?? row?.license ?? "").trim() || undefined,
        creator: String(media?.creator ?? row?.recordedBy ?? "").trim() || undefined,
        publisher: String(row?.publisher ?? row?.institutionCode ?? "").trim() || undefined,
        rightsHolder: String(media?.rightsHolder ?? row?.rightsHolder ?? "").trim() || undefined,
        datasetName: String(row?.datasetName ?? "").trim() || undefined,
      });

      if (images.length >= (options.limit ?? 8)) {
        return {
          ok: true,
          data: images,
          note: options.country
            ? "GBIF occurrence media resolved from Norway records using COL XR taxonomy."
            : "GBIF occurrence media resolved globally using COL XR taxonomy.",
        };
      }
    }
  }

  return {
    ok: true,
    data: images,
    note: options.country
      ? "GBIF occurrence media resolved from Norway records using COL XR taxonomy."
      : "GBIF occurrence media resolved globally using COL XR taxonomy.",
  };
}

export async function fetchResolvedSpeciesImages(
  colXr: string,
  options: { countryFirst?: string; limit?: number } = {},
): Promise<SpeciesMediaResult> {
  const countryFirst = options.countryFirst ?? "NO";
  const countryResult = await queryGbifStillImages(colXr, {
    country: countryFirst,
    limit: options.limit ?? 8,
  });
  if (!countryResult.ok) return countryResult;
  if (countryResult.data.length > 0) return countryResult;

  const globalResult = await queryGbifStillImages(colXr, { limit: options.limit ?? 8 });
  if (!globalResult.ok) return globalResult;
  return {
    ok: true,
    data: globalResult.data,
    note: globalResult.data.length
      ? "No Norway images were resolved; showing GBIF occurrence media from global records instead."
      : "No GBIF occurrence media were resolved for this taxon.",
  };
}
