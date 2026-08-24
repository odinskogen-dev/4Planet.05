/**
 * GET /api/climate-trace — server-side proxy for Climate TRACE v7 sources.
 *
 * Climate TRACE's current public API is v7. Individual emitting sources are
 * returned by GET /v7/sources and require no authentication. The old ATLAS
 * adapter targeted the superseded v6 /assets contract; an empty normalisation
 * could therefore render as a misleading "0" in the layer console.
 *
 * Honest contract:
 *   - upstream data    → { ok:true, source:"climatetrace", assets:[…] }
 *   - upstream empty   → 502 { ok:false, error:"EMPTY_OR_CONTRACT_MISMATCH" }
 *   - upstream failed  → 502 { ok:false, error }.
 *
 * A source/contract failure is never represented as zero records.
 */

interface Env { CLIMATE_TRACE_BASE?: string }

const BASE_DEFAULT = "https://api.climatetrace.org/v7";
const DEFAULT_YEAR = "2024";
const DEFAULT_GAS = "co2e_100yr";
const DEFAULT_SECTOR = "power";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600",
      "access-control-allow-origin": "*",
    },
  });

const clampInt = (v: string | null, def: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), max) : def;
};

const cleanList = (v: string | null, re: RegExp) =>
  (v || "").split(",").map((s) => s.trim()).filter((s) => re.test(s)).slice(0, 40).join(",");

const finite = (...values: unknown[]) => {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return NaN;
};

export const onRequestGet: (ctx: { request: Request; env: Env }) => Promise<Response> = async ({ request, env }) => {
  const url = new URL(request.url);
  const base = (env.CLIMATE_TRACE_BASE || BASE_DEFAULT).replace(/\/$/, "");

  const sectors = cleanList(url.searchParams.get("sectors"), /^[a-z0-9-]+$/) || DEFAULT_SECTOR;
  const countries = cleanList(url.searchParams.get("countries"), /^[A-Za-z]{2,3}$/).toUpperCase();
  const limit = clampInt(url.searchParams.get("limit"), 500, 2000);
  const offset = Math.max(0, Number.parseInt(url.searchParams.get("offset") || "0", 10) || 0);
  const year = /^\d{4}$/.test(url.searchParams.get("year") || "") ? url.searchParams.get("year")! : DEFAULT_YEAR;
  const gas = /^[a-z0-9_]+$/.test(url.searchParams.get("gas") || "") ? url.searchParams.get("gas")! : DEFAULT_GAS;

  const qs = new URLSearchParams({ sectors, limit: String(limit), offset: String(offset), year, gas });
  if (countries) qs.set("gadmId", countries);

  const upstream = `${base}/sources?${qs.toString()}`;
  try {
    const r = await fetch(upstream, {
      headers: { accept: "application/json" },
      cf: { cacheTtl: 3600 } as RequestInit["cf"],
    });
    if (!r.ok) return json({ ok: false, error: `UPSTREAM_${r.status}` }, 502);

    const data = await r.json();
    const rows = Array.isArray(data) ? data : ((data as any)?.sources || (data as any)?.data || (data as any)?.results || []);
    if (!Array.isArray(rows) || rows.length === 0) {
      return json({ ok: false, error: "EMPTY_OR_CONTRACT_MISMATCH", query: { sectors, year, gas, limit, offset } }, 502);
    }

    const assets = rows
      .map((a: Record<string, any>) => {
        const lat = finite(a.latitude, a.lat, a.centroid?.latitude, a.centroid?.lat);
        const lon = finite(a.longitude, a.lon, a.lng, a.centroid?.longitude, a.centroid?.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        const co2e = finite(a.emissionsQuantity, a.emissions_quantity, a.co2e, a.emissions);
        return {
          id: a.id ?? a.source_id ?? a.asset_id ?? null,
          name: a.name ?? a.source_name ?? a.asset_name ?? null,
          sector: a.sector ?? null,
          subsector: a.subsector ?? null,
          country: a.country ?? a.iso3_country ?? null,
          sourceType: a.sourceType ?? a.source_type ?? null,
          assetType: a.assetType ?? a.asset_type ?? null,
          lat,
          lon,
          co2e: Number.isFinite(co2e) ? co2e : null,
          year: a.year ?? year,
          gas: a.gas ?? gas,
        };
      })
      .filter(Boolean);

    if (!assets.length) {
      return json({ ok: false, error: "NO_MAPPABLE_COORDINATES", upstreamCount: rows.length }, 502);
    }

    return json({
      ok: true,
      source: "climatetrace",
      apiVersion: "v7",
      query: { sectors, year, gas, limit, offset },
      count: assets.length,
      assets,
    });
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message || e) }, 502);
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
