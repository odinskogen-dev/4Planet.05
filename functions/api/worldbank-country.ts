/**
 * GET /api/worldbank-country?country=NOR            → series for the allowlisted indicators (one country)
 * GET /api/worldbank-country?rank=1                  → latest non-empty value for every economy, per allowlisted rank indicator
 *
 * Shared read-through adapter for the World Bank Indicators API v2 (World Development Indicators).
 * Used by 4NATION (Country Object, compare, country signature) and S4PIENS (country context).
 * It is not a country database: no storage beyond a bounded edge cache, no derived "scores".
 *
 * SOURCE GATE (checked 2026-10-14):
 *   provider: World Bank · dataset: World Development Indicators (source=2) · api: https://api.worldbank.org/v2
 *   licence: CC BY 4.0 (World Bank Open Data terms); some indicators carry third-party terms — indicator-level
 *            source notes are linked, never relabelled as 4PLANET data
 *   commercialReuse: PERMITTED_WITH_ATTRIBUTION · redistribution: PERMITTED_UNDER_CC_BY_4_0 · shareAlike: NO
 *   attribution: "World Bank, World Development Indicators"
 *   accessCost: free, no key · rateLimit: undocumented fair use → 24h edge cache, bounded allowlist, one country per series request
 *   geographicSemantics: national aggregate per economy (ISO3); regional/income aggregates are returned upstream and filtered by the client
 *   temporalSemantics: annual; each value keeps its own year; latest year differs by indicator and country
 */
interface PagesContext { request: Request; waitUntil?: (p: Promise<unknown>) => void }

const BASE = "https://api.worldbank.org/v2";
const CACHE_SECONDS = 86400;

/** Allowlist: id → [label, unit, rankable]. Keep small and meaningful. */
export const WB_INDICATORS: Record<string, [string, string, boolean]> = {
  "SP.POP.TOTL": ["Population", "people", true],
  "SP.DYN.LE00.IN": ["Life expectancy at birth", "years", true],
  "NY.GDP.PCAP.CD": ["GDP per person", "current US$", true],
  "SP.URB.TOTL.IN.ZS": ["Urban population", "% of population", true],
  "IT.NET.USER.ZS": ["Internet users", "% of population", true],
  "EG.ELC.ACCS.ZS": ["Access to electricity", "% of population", true],
  "EG.FEC.RNEW.ZS": ["Renewable energy", "% of final energy use", true],
  "AG.LND.FRST.ZS": ["Forest", "% of land area", true],
  "AG.LND.AGRI.ZS": ["Agricultural land", "% of land area", true],
  "ER.PTD.TOTL.ZS": ["Protected areas", "% of land and sea territory", true],
  "ER.H2O.FWST.ZS": ["Water stress", "% of available fresh water withdrawn", true],
  "NV.IND.MANF.ZS": ["Manufacturing", "% of GDP", true],
  "NV.AGR.TOTL.ZS": ["Agriculture, forestry and fishing", "% of GDP", true],
  "SL.AGR.EMPL.ZS": ["Jobs in agriculture", "% of employment", false],
  "SL.IND.EMPL.ZS": ["Jobs in industry", "% of employment", false],
  "SL.SRV.EMPL.ZS": ["Jobs in services", "% of employment", false],
};

const json = (body: unknown, status = 200, maxAge = 3600) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${maxAge}`, "x-content-type-options": "nosniff" },
});

async function cachedJson(ctx: PagesContext, url: string): Promise<unknown> {
  const req = new Request(url, { headers: { accept: "application/json", "user-agent": "4PLANET/1.0 (+https://4planet.org)" } });
  let cache: Cache | undefined;
  try { cache = (caches as unknown as { default?: Cache }).default; } catch { cache = undefined; }
  const hit = cache ? await cache.match(req) : undefined;
  const res = hit ?? await fetch(req);
  if (!res.ok) throw new Error(`WORLDBANK_HTTP_${res.status}`);
  if (!hit && cache) {
    const headers = new Headers(res.headers); headers.set("cache-control", `public, max-age=${CACHE_SECONDS}`);
    const write = cache.put(req, new Response(res.clone().body, { status: res.status, headers })).catch(() => undefined);
    if (ctx.waitUntil) ctx.waitUntil(write); else void write;
  }
  return res.json();
}

type WbRow = { indicator?: { id?: string }; countryiso3code?: string; date?: string; value?: number | null };
const rowsOf = (body: unknown): WbRow[] => (Array.isArray(body) && Array.isArray(body[1]) ? body[1] as WbRow[] : []);

export const onRequestGet = async (ctx: PagesContext) => {
  const url = new URL(ctx.request.url);
  const retrievedAt = new Date().toISOString();
  const meta = { provider: "World Bank", dataset: "World Development Indicators", licence: "CC BY 4.0", attribution: "World Bank, World Development Indicators", sourceUrl: "https://databank.worldbank.org/source/world-development-indicators", retrievedAt };
  try {
    if (url.searchParams.get("rank") === "1") {
      const ids = Object.entries(WB_INDICATORS).filter(([, v]) => v[2]).map(([k]) => k);
      const out: Record<string, [string, number, string][]> = {};
      await Promise.all(ids.map(async (id) => {
        const body = await cachedJson(ctx, `${BASE}/country/all/indicator/${id}?format=json&mrnev=1&per_page=400`);
        out[id] = rowsOf(body)
          .filter((r) => /^[A-Z]{3}$/.test(r.countryiso3code || "") && typeof r.value === "number" && Number.isFinite(r.value))
          .map((r) => [r.countryiso3code as string, r.value as number, String(r.date || "")]);
      }));
      return json({ ok: true, mode: "rank", ...meta, indicators: WB_INDICATORS, values: out }, 200, 21600);
    }
    const country = String(url.searchParams.get("country") || "").toUpperCase();
    if (!/^[A-Z]{3}$/.test(country)) return json({ ok: false, error: "INVALID_COUNTRY_ISO3" }, 400, 60);
    const ids = Object.keys(WB_INDICATORS).join(";");
    const body = await cachedJson(ctx, `${BASE}/country/${country}/indicator/${ids}?source=2&format=json&date=1990:2030&per_page=2000`);
    const series: Record<string, [string, number][]> = {};
    for (const r of rowsOf(body)) {
      const id = r.indicator?.id;
      if (!id || !(id in WB_INDICATORS) || typeof r.value !== "number" || !Number.isFinite(r.value)) continue;
      (series[id] ??= []).push([String(r.date), r.value]);
    }
    for (const k of Object.keys(series)) series[k].sort((a, b) => Number(a[0]) - Number(b[0]));
    if (!Object.keys(series).length) return json({ ok: false, error: "EMPTY_OR_CONTRACT_MISMATCH", country }, 502, 120);
    return json({ ok: true, mode: "series", country, ...meta, indicators: WB_INDICATORS, series }, 200, 21600);
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message || "WORLDBANK_UNAVAILABLE") }, 502, 60);
  }
};
