/**
 * GET /api/climate-trace — server-side proxy for Climate TRACE asset emissions.
 *
 * Climate TRACE publishes facility-level (asset) greenhouse-gas emissions with
 * coordinates — power plants, oil & gas, steel, cement and other energy/industrial
 * infrastructure. Their API does not send permissive CORS headers, so the browser
 * cannot call it directly; this Cloudflare Pages Function proxies it and adds CORS.
 *
 * Honest contract:
 *   - upstream ok      → { ok:true, source:"climatetrace", assets:[…] }
 *   - upstream failed  → 502 { ok:false, error } (client shows SOURCE UNAVAILABLE,
 *                        never zero / never a fabricated point)
 *
 * Query params (all optional, forwarded/sanitised):
 *   sectors   e.g. "electricity-generation,oil-and-gas-production-and-transport"
 *   countries ISO3 list e.g. "NOR,SWE"
 *   limit     max assets (default 500, hard cap 2000)
 *   year      emissions year (default latest)
 */

interface Env { CLIMATE_TRACE_BASE?: string }

const BASE_DEFAULT = "https://api.climatetrace.org/v6";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600", // assets change slowly; cache 1h
      "access-control-allow-origin": "*",
    },
  });

const clampInt = (v: string | null, def: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), max) : def;
};
const cleanList = (v: string | null, re: RegExp) =>
  (v || "").split(",").map((s) => s.trim()).filter((s) => re.test(s)).slice(0, 40).join(",");

export const onRequestGet: (ctx: { request: Request; env: Env }) => Promise<Response> = async ({ request, env }) => {
  const url = new URL(request.url);
  const base = (env.CLIMATE_TRACE_BASE || BASE_DEFAULT).replace(/\/$/, "");

  const sectors = cleanList(url.searchParams.get("sectors"), /^[a-z0-9-]+$/);
  const countries = cleanList(url.searchParams.get("countries"), /^[A-Za-z]{2,3}$/).toUpperCase();
  const limit = clampInt(url.searchParams.get("limit"), 500, 2000);
  const year = url.searchParams.get("year");

  const qs = new URLSearchParams();
  if (sectors) qs.set("sectors", sectors);
  if (countries) qs.set("countries", countries);
  qs.set("limit", String(limit));
  if (year && /^\d{4}$/.test(year)) qs.set("year", year);

  const upstream = `${base}/assets?${qs.toString()}`;
  try {
    const r = await fetch(upstream, { headers: { accept: "application/json" }, cf: { cacheTtl: 3600 } as RequestInit["cf"] });
    if (!r.ok) return json({ ok: false, error: `upstream ${r.status}`, upstream }, 502);
    const data = await r.json();
    // Normalise to a compact, truthful shape the map can paint. We DO NOT invent
    // coordinates or emissions — assets without a location are dropped.
    const rows = Array.isArray(data) ? data : (data.assets || data.data || []);
    const assets = rows
      .map((a: Record<string, unknown>) => {
        const lat = Number(a.latitude ?? a.lat ?? (a.centroid as any)?.lat);
        const lon = Number(a.longitude ?? a.lon ?? a.lng ?? (a.centroid as any)?.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        return {
          id: a.asset_id ?? a.id ?? null,
          name: a.asset_name ?? a.name ?? null,
          sector: a.sector ?? null,
          country: a.country ?? a.iso3_country ?? null,
          lat, lon,
          co2e: Number(a.emissions_quantity ?? a.co2e ?? a.emissions ?? NaN),
          year: a.year ?? year ?? null,
          gas: a.gas ?? "co2e",
        };
      })
      .filter(Boolean);
    return json({ ok: true, source: "climatetrace", count: assets.length, assets });
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message || e), upstream }, 502);
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
