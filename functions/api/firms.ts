/**
 * GET /api/firms
 *
 * Server-side, fail-closed NASA FIRMS Area API adapter for ATLAS.
 * FIRMS_MAP_KEY must exist only in the deployment environment; it is never sent
 * to the browser or written to logs. This endpoint is intentionally bounded:
 * allowlisted VIIRS products, bbox only (no world query), dayRange 1..5, optional
 * YYYY-MM-DD date. A provider failure is never represented as zero detections.
 *
 * Public semantics: returned rows are satellite fire/thermal-anomaly detections,
 * not automatically wildfires, burned area, impact, cause or ground truth.
 */

interface Env { FIRMS_MAP_KEY?: string }

type Source = "VIIRS_SNPP_NRT" | "VIIRS_NOAA20_NRT" | "VIIRS_NOAA21_NRT";
const SOURCES = new Set<Source>(["VIIRS_SNPP_NRT", "VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT"]);

const json = (body: unknown, status = 200, maxAge = 300) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": status === 200 ? `public, max-age=${maxAge}` : "no-store",
      "access-control-allow-origin": "*",
    },
  });

function parseBbox(value: string | null): [number, number, number, number] | null {
  const p = (value || "").split(",").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isFinite(n))) return null;
  const [w, s, e, n] = p;
  if (w < -180 || e > 180 || s < -90 || n > 90 || w >= e || s >= n) return null;
  // Deliberately refuse near-global requests from the public endpoint.
  if (e - w > 80 || n - s > 50) return null;
  return [w, s, e, n];
}

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const idx = (name: string) => headers.indexOf(name);
  const required = ["latitude", "longitude", "acq_date", "acq_time", "satellite", "instrument", "confidence", "frp"];
  if (required.some((h) => idx(h) < 0)) throw new Error("CONTRACT_MISMATCH");
  return lines.slice(1, 5001).map((line) => {
    const c = line.split(",");
    const lat = Number(c[idx("latitude")]);
    const lon = Number(c[idx("longitude")]);
    const frp = Number(c[idx("frp")]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return {
      latitude: lat,
      longitude: lon,
      acquiredDate: c[idx("acq_date")] || null,
      acquiredTimeUtc: c[idx("acq_time")] || null,
      satellite: c[idx("satellite")] || null,
      instrument: c[idx("instrument")] || null,
      confidence: c[idx("confidence")] || null,
      frpMw: Number.isFinite(frp) ? frp : null,
      dayNight: idx("daynight") >= 0 ? c[idx("daynight")] || null : null,
    };
  }).filter(Boolean);
}

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.FIRMS_MAP_KEY) return json({ ok: false, error: "FIRMS_MAP_KEY_NOT_CONFIGURED" }, 503);

  const incoming = new URL(request.url);
  const source = (incoming.searchParams.get("source") || "VIIRS_NOAA20_NRT") as Source;
  if (!SOURCES.has(source)) return json({ ok: false, error: "UNSUPPORTED_SOURCE" }, 400);

  const bbox = parseBbox(incoming.searchParams.get("bbox"));
  if (!bbox) return json({ ok: false, error: "INVALID_OR_TOO_LARGE_BBOX" }, 400);

  const dayRange = Number(incoming.searchParams.get("dayRange") || "1");
  if (!Number.isInteger(dayRange) || dayRange < 1 || dayRange > 5) return json({ ok: false, error: "INVALID_DAY_RANGE" }, 400);

  const date = incoming.searchParams.get("date");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ ok: false, error: "INVALID_DATE" }, 400);

  const area = bbox.join(",");
  const base = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${encodeURIComponent(env.FIRMS_MAP_KEY)}/${source}/${area}/${dayRange}`;
  const upstream = date ? `${base}/${date}` : base;

  try {
    const response = await fetch(upstream, {
      headers: { accept: "text/csv", "user-agent": "4PLANET-ATLAS/1.0 (+https://4planet.org)" },
      cf: { cacheTtl: 300 } as RequestInit["cf"],
    });
    if (!response.ok) return json({ ok: false, source, error: `UPSTREAM_${response.status}` }, 502);
    const text = await response.text();
    const records = parseCsv(text);
    if (!records.length) {
      return json({ ok: true, source, query: { bbox, dayRange, date: date || null }, count: 0, records, semantics: "NO_DETECTIONS_RETURNED_FOR_QUERY" });
    }
    return json({
      ok: true,
      source,
      provider: "NASA FIRMS",
      query: { bbox, dayRange, date: date || null },
      count: records.length,
      truncated: records.length >= 5000,
      records,
      limitation: "Satellite fire/thermal-anomaly detections are not automatically wildfires, burned area, cause, impact or ground truth.",
    });
  } catch (error) {
    const message = String((error as Error)?.message || error);
    return json({ ok: false, source, error: message === "CONTRACT_MISMATCH" ? message : "UPSTREAM_FAILURE" }, 502);
  }
};

export const onRequestOptions = () => new Response(null, {
  headers: {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-max-age": "86400",
  },
});
