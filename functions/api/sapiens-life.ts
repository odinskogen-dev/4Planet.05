/**
 * GET /api/sapiens-life
 * S4PIENS / FOOD_ Gold live life seam.
 *
 * Uses the public GBIF Occurrence Search API for two bounded exemplars:
 * - pollinator: Apis mellifera (dependency context)
 * - jaguar: Panthera onca (pressure-context exemplar)
 *
 * Occurrences are presence records, not population estimates. Spatial overlap
 * with a FOOD_ pressure layer is never interpreted here as causal evidence.
 */

const BASE = "https://api.gbif.org/v1";

const CASES = {
  pollinator: { label: "POLLINATOR", scientificName: "Apis mellifera" },
  jaguar: { label: "JAGUAR", scientificName: "Panthera onca" },
} as const;

type CaseKey = keyof typeof CASES;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=21600, stale-while-revalidate=86400",
      "access-control-allow-origin": "*",
    },
  });

const boundedInt = (value: string | null, fallback: number, max: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), max) : fallback;
};

const licensedPhoto = (rows: any[]) => {
  for (const row of rows) {
    const media = Array.isArray(row?.media) ? row.media : [];
    for (const item of media) {
      const identifier = typeof item?.identifier === "string" ? item.identifier : "";
      const license = typeof item?.license === "string" ? item.license : "";
      if (!identifier || !/^https?:\/\//i.test(identifier)) continue;
      if (license && !/creativecommons|publicdomain|cc[- ]?0|cc[- ]?by/i.test(license)) continue;
      return {
        url: identifier,
        creator: typeof item?.creator === "string" ? item.creator : undefined,
        license: license || undefined,
        source: typeof item?.references === "string" ? item.references : undefined,
      };
    }
  }
  return null;
};

export const onRequestGet = async ({ request }: { request: Request }) => {
  const input = new URL(request.url);
  const rawCase = input.searchParams.get("case") || "pollinator";
  if (!(rawCase in CASES)) return json({ ok: false, state: "INVALID_CASE", error: "Unsupported life exemplar" }, 400);
  const caseKey = rawCase as CaseKey;
  const config = CASES[caseKey];
  const limit = boundedInt(input.searchParams.get("limit"), 120, 220);

  const qs = new URLSearchParams({
    scientificName: config.scientificName,
    hasCoordinate: "true",
    occurrenceStatus: "PRESENT",
    limit: String(limit),
  });

  try {
    const response = await fetch(`${BASE}/occurrence/search?${qs.toString()}`, {
      headers: { accept: "application/json" },
      cf: { cacheTtl: 21600 },
    } as any);
    if (!response.ok) return json({ ok: false, case: caseKey, state: "UNAVAILABLE", error: `GBIF upstream ${response.status}` }, 502);

    const payload: any = await response.json();
    const rows = Array.isArray(payload?.results) ? payload.results : [];
    if (!Array.isArray(rows)) return json({ ok: false, case: caseKey, state: "SCHEMA_CHANGED", error: "No GBIF result collection" }, 502);

    const occurrences = rows.map((row: any) => {
      const lat = Number(row?.decimalLatitude);
      const lon = Number(row?.decimalLongitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
      return {
        id: row?.key ?? row?.gbifID ?? `${lat}:${lon}`,
        scientificName: typeof row?.scientificName === "string" ? row.scientificName : config.scientificName,
        vernacularName: typeof row?.vernacularName === "string" ? row.vernacularName : undefined,
        lat,
        lon,
        country: typeof row?.country === "string" ? row.country : undefined,
        eventDate: typeof row?.eventDate === "string" ? row.eventDate : undefined,
        basisOfRecord: typeof row?.basisOfRecord === "string" ? row.basisOfRecord : undefined,
      };
    }).filter(Boolean);

    if (rows.length > 0 && occurrences.length === 0) return json({ ok: false, case: caseKey, state: "SCHEMA_CHANGED", error: "GBIF records returned without usable coordinates" }, 502);

    return json({
      ok: true,
      source: "gbif",
      apiVersion: "v1",
      case: caseKey,
      label: config.label,
      scientificName: config.scientificName,
      retrievedAt: new Date().toISOString(),
      returned: occurrences.length,
      total: Number.isFinite(Number(payload?.count)) ? Number(payload.count) : undefined,
      occurrences,
      photo: licensedPhoto(rows),
      limitations: [
        "GBIF occurrence records are presence/observation records, not population estimates.",
        "Observation density reflects sampling effort as well as the distribution of recorded life.",
        "Spatial overlap with a human-system or pressure layer does not establish causal ecological impact.",
      ],
    });
  } catch (error) {
    return json({ ok: false, case: caseKey, state: "REQUEST_FAILED", error: String((error as Error)?.message || error) }, 502);
  }
};

export const onRequestOptions = () =>
  new Response(null, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-max-age": "86400",
    },
  });
