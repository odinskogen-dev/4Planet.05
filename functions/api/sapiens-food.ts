/**
 * GET /api/sapiens-food
 * First S4PIENS / FOOD_ Gold Standard live data seam.
 *
 * Uses Climate TRACE public v7 sources API and returns a bounded, normalised
 * agriculture-source collection. Source failure or schema drift is explicit;
 * it is never rendered as "zero pressure".
 */

const BASE = "https://api.climatetrace.org/v7";

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

const numberFrom = (...values: unknown[]) => {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
};

const textFrom = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
};

export const onRequestGet = async ({ request }: { request: Request }) => {
  const input = new URL(request.url);
  const limit = boundedInt(input.searchParams.get("limit"), 500, 1200);
  const offset = boundedInt(input.searchParams.get("offset"), 0, 100000);
  const yearRaw = input.searchParams.get("year") || "2024";
  const year = /^20\d{2}$/.test(yearRaw) ? yearRaw : "2024";
  const gas = input.searchParams.get("gas") || "co2e_100yr";

  const qs = new URLSearchParams({
    year,
    gas,
    sectors: "agriculture",
    limit: String(limit),
    offset: String(offset),
  });
  const upstream = `${BASE}/sources?${qs.toString()}`;

  try {
    const response = await fetch(upstream, {
      headers: { accept: "application/json" },
      cf: { cacheTtl: 21600 } as RequestInit["cf"],
    });
    if (!response.ok) {
      return json({ ok: false, source: "climatetrace", state: "UNAVAILABLE", error: `upstream ${response.status}` }, 502);
    }

    const payload: any = await response.json();
    const rows = Array.isArray(payload)
      ? payload
      : payload?.sources || payload?.data || payload?.results || payload?.items || [];

    if (!Array.isArray(rows)) {
      return json({ ok: false, source: "climatetrace", state: "SCHEMA_CHANGED", error: "No source collection in v7 response" }, 502);
    }

    const sources = rows.map((row: any) => {
      const centroid = row?.centroid || row?.geometry?.centroid || {};
      const coordinates = Array.isArray(row?.geometry?.coordinates) ? row.geometry.coordinates : [];
      const lat = numberFrom(row?.latitude, row?.lat, centroid?.latitude, centroid?.lat, coordinates[1]);
      const lon = numberFrom(row?.longitude, row?.lon, row?.lng, centroid?.longitude, centroid?.lon, centroid?.lng, coordinates[0]);
      if (lat === undefined || lon === undefined || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;

      const emissions = numberFrom(
        row?.emissions_quantity,
        row?.emissionsQuantity,
        row?.emissions,
        row?.emissions?.quantity,
        row?.emissions?.[gas],
        row?.co2e,
      );

      return {
        id: textFrom(row?.source_id, row?.sourceId, row?.id) || null,
        name: textFrom(row?.source_name, row?.sourceName, row?.name, row?.asset_name) || "Agriculture source",
        sector: textFrom(row?.sector) || "agriculture",
        subsector: textFrom(row?.subsector),
        country: textFrom(row?.country, row?.iso3_country, row?.gadm_id),
        lat,
        lon,
        emissions: emissions ?? null,
        gas,
        year: numberFrom(row?.year) ?? Number(year),
      };
    }).filter(Boolean);

    if (rows.length > 0 && sources.length === 0) {
      return json({ ok: false, source: "climatetrace", state: "SCHEMA_CHANGED", error: "Records returned but coordinates could not be normalised" }, 502);
    }

    return json({
      ok: true,
      source: "climatetrace",
      apiVersion: "v7",
      retrievedAt: new Date().toISOString(),
      query: { sector: "agriculture", year: Number(year), gas, limit, offset },
      returned: sources.length,
      sources,
      limitations: [
        "Climate TRACE source records are an emissions inventory/model layer, not live pollution plumes.",
        "A mapped source does not by itself establish local ecosystem damage or responsibility for a downstream ecological outcome.",
      ],
    });
  } catch (error) {
    return json({ ok: false, source: "climatetrace", state: "REQUEST_FAILED", error: String((error as Error)?.message || error) }, 502);
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
