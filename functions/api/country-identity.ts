/**
 * GET /api/country-identity?iso2=NO
 *
 * Bounded identity facts for one country from Wikidata (official languages, currency,
 * highest point + elevation, national anthem). Used by the 4NATION Country Object.
 *
 * SOURCE GATE (checked 2026-10-14):
 *   provider: Wikimedia Foundation · dataset: Wikidata (query.wikidata.org SPARQL)
 *   licence: CC0 1.0 (structured data) · commercialReuse: PERMITTED_CC0 · redistribution: PERMITTED_CC0
 *   attribution: not required; shown as "Wikidata" with the item link for verification
 *   accessCost: free · rateLimit: Wikidata Query Service fair use (descriptive User-Agent required,
 *     60 s query budget) → one small query per country, 7-day edge cache
 *   truth boundary: community-edited; facts are labelled with the Wikidata item and may change.
 *     Contested/multiple values are listed, never resolved by 4PLANET.
 */
interface PagesContext { request: Request; waitUntil?: (p: Promise<unknown>) => void }
const ENDPOINT = "https://query.wikidata.org/sparql";
const CACHE_SECONDS = 604800;
const json = (body: unknown, status = 200, maxAge = 3600) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${maxAge}`, "x-content-type-options": "nosniff" },
});

const query = (iso2: string) => `SELECT ?country ?langLabel ?currencyLabel ?hpLabel ?elev ?anthemLabel WHERE {
  ?country wdt:P297 "${iso2}" .
  OPTIONAL { ?country wdt:P37 ?lang . }
  OPTIONAL { ?country wdt:P38 ?currency . }
  OPTIONAL { ?country wdt:P610 ?hp . OPTIONAL { ?hp wdt:P2044 ?elev . } }
  OPTIONAL { ?country wdt:P85 ?anthem . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 200`;

export const onRequestGet = async (ctx: PagesContext) => {
  const iso2 = String(new URL(ctx.request.url).searchParams.get("iso2") || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(iso2)) return json({ ok: false, error: "INVALID_COUNTRY_ISO2" }, 400, 60);
  const req = new Request(`${ENDPOINT}?format=json&query=${encodeURIComponent(query(iso2))}`, {
    headers: { accept: "application/sparql-results+json", "user-agent": "4PLANET-4NATION/1.0 (https://4nation.org; contact via https://4planet.org)" },
  });
  try {
    let cache: Cache | undefined;
    try { cache = (caches as unknown as { default?: Cache }).default; } catch { cache = undefined; }
    const hit = cache ? await cache.match(req) : undefined;
    const res = hit ?? await fetch(req);
    if (!res.ok) throw new Error(`WIKIDATA_HTTP_${res.status}`);
    if (!hit && cache) {
      const h = new Headers(res.headers); h.set("cache-control", `public, max-age=${CACHE_SECONDS}`);
      const w = cache.put(req, new Response(res.clone().body, { status: res.status, headers: h })).catch(() => undefined);
      if (ctx.waitUntil) ctx.waitUntil(w); else void w;
    }
    const body = await res.json() as { results?: { bindings?: Record<string, { value: string }>[] } };
    const rows = body.results?.bindings ?? [];
    if (!rows.length) return json({ ok: false, error: "NO_WIKIDATA_ITEM", iso2 }, 404, 3600);
    // Several items can carry the same ISO code (historic states); keep the item with most facts.
    const byItem = new Map<string, typeof rows>();
    for (const r of rows) { const id = r.country?.value || ""; byItem.set(id, [...(byItem.get(id) ?? []), r]); }
    const [item, best] = [...byItem.entries()].sort((a, b) => b[1].length - a[1].length)[0];
    const uniq = (k: string) => [...new Set(best.map((r) => r[k]?.value).filter((v): v is string => Boolean(v) && !/^Q\d+$/.test(v!)))];
    const hp = best.find((r) => r.hpLabel?.value && !/^Q\d+$/.test(r.hpLabel.value));
    return json({
      ok: true, iso2, item, itemUrl: item.replace("http://", "https://"),
      source: { provider: "Wikidata", licence: "CC0 1.0", url: item.replace("http://", "https://"), retrievedAt: new Date().toISOString() },
      languages: uniq("langLabel").slice(0, 8),
      currencies: uniq("currencyLabel").slice(0, 4),
      highestPoint: hp ? { name: hp.hpLabel.value, elevationM: hp.elev ? Math.round(Number(hp.elev.value)) : null } : null,
      anthem: uniq("anthemLabel")[0] ?? null,
    }, 200, 86400);
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message || "WIKIDATA_UNAVAILABLE") }, 502, 60);
  }
};
