import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const KASSALAPP_KEY = Deno.env.get("KASSALAPP_API_KEY") || Deno.env.get("KASSALAPP_TOKEN") || "";
const OFF_BASE = "https://world.openfoodfacts.org";
const KASS_BASE = "https://kassal.app/api/v1";
const OFF_FIELDS = "code,product_name,product_name_nb,brands,quantity,image_front_small_url,image_small_url,nutriments,nutriscore_grade,ecoscore_grade,environmental_score_grade,nova_group,categories_tags_en,allergens_tags,countries_tags,ingredients_text,additives_tags";
const UA = "4SAPIEN-Embla/1.1 (https://4sapien.com; odin@4planet.org)";

const cors = {
  "Access-Control-Allow-Origin": "https://4sapien.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

function timeout(ms: number) { return AbortSignal.timeout(ms); }

async function requireUser(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${token}` },
      signal: timeout(4000),
    });
    if (!r.ok) return null;
    const user = await r.json().catch(() => null);
    return user?.id ? user : null;
  } catch {
    return null;
  }
}

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function cacheKey(kind: string, q: string) {
  // v2 invalidates pre-intent-ranking search cache.
  return await sha256(`4sapien:v2:${kind}:${q.toLocaleLowerCase("nb-NO").trim()}`);
}

async function cacheRead(key: string) {
  const url = `${SUPABASE_URL}/rest/v1/four_sapien_product_cache?cache_key=eq.${encodeURIComponent(key)}&select=payload,source_state,expires_at,fetched_at&limit=1`;
  const r = await fetch(url, { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }, signal: timeout(4000) });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows?.[0] || null;
}

async function cacheWrite(key: string, kind: string, payload: unknown, state: string, ttlSeconds: number) {
  const expires = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  const body = [{ cache_key: key, kind, query_text: `sha256:${key}`, payload, source_state: state, expires_at: expires, fetched_at: new Date().toISOString() }];
  await fetch(`${SUPABASE_URL}/rest/v1/four_sapien_product_cache?on_conflict=cache_key`, {
    method: "POST",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(body),
    signal: timeout(4000),
  }).catch(() => null);
}

function isFresh(row: any) { return row?.expires_at && new Date(row.expires_at).getTime() > Date.now(); }
function sourceError(status: number) { if (status === 429) return "RATE_LIMITED"; return "SOURCE_DOWN"; }

async function offJson(url: string) {
  const r = await fetch(url, { headers: { Accept: "application/json", "User-Agent": UA }, signal: timeout(7500) });
  if (!r.ok) throw Object.assign(new Error(`OFF_${r.status}`), { source: "off", code: sourceError(r.status) });
  return await r.json();
}

function norwayRank(p: any) {
  const c = Array.isArray(p?.countries_tags) ? p.countries_tags.join(" ").toLowerCase() : "";
  return c.includes("norway") || c.includes("norge") ? 1 : 0;
}

async function offTextSearch(q: string) {
  const url = `${OFF_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=50&fields=${encodeURIComponent(OFF_FIELDS)}`;
  const d = await offJson(url);
  const products = (d?.products || []).filter((p: any) => p?.code && (p?.product_name || p?.product_name_nb || p?.brands));
  products.sort((a: any, b: any) => norwayRank(b) - norwayRank(a));
  return products.slice(0, 50);
}

async function offBarcode(ean: string) {
  const d = await offJson(`${OFF_BASE}/api/v2/product/${encodeURIComponent(ean)}.json?fields=${encodeURIComponent(OFF_FIELDS)}`);
  if (d?.status !== 1 || !d?.product) return null;
  return { ...d.product, code: ean };
}

async function offBulk(eans: string[]) {
  if (!eans.length) return new Map<string, any>();
  const codes = eans.slice(0, 40).join(",");
  const d = await offJson(`${OFF_BASE}/api/v2/search?code=${encodeURIComponent(codes)}&page_size=40&fields=${encodeURIComponent(OFF_FIELDS)}`);
  return new Map((d?.products || []).filter((p: any) => p?.code).map((p: any) => [String(p.code), p]));
}

async function kassJson(path: string) {
  if (!KASSALAPP_KEY) throw Object.assign(new Error("KASSALAPP_UNCONFIGURED"), { source: "kassalapp", code: "UNCONFIGURED" });
  const r = await fetch(`${KASS_BASE}${path}`, { headers: { Authorization: `Bearer ${KASSALAPP_KEY}`, Accept: "application/json", "User-Agent": UA }, signal: timeout(7500) });
  if (!r.ok) throw Object.assign(new Error(`KASS_${r.status}`), { source: "kassalapp", code: sourceError(r.status) });
  return await r.json();
}

function nutritionMap(n: any[]) {
  const by = new Map((n || []).map((x: any) => [x?.code, x?.amount]));
  return {
    "energy-kcal_100g": by.get("energi_kcal"),
    proteins_100g: by.get("protein"),
    sugars_100g: by.get("sukkerarter"),
    salt_100g: by.get("salt"),
    "saturated-fat_100g": by.get("mettet_fett"),
    fiber_100g: by.get("fiber"),
  };
}

function kassToOffLike(k: any, off: any = null) {
  const ean = String(k?.ean || off?.code || "");
  const allergens = (k?.allergens || []).filter((a: any) => a?.contains === "YES").map((a: any) => `en:${String(a?.code || "").replace(/_/g, "-")}`);
  const current = k?.current_price;
  const price = typeof current === "number" ? current : current?.price ?? null;
  const store = k?.store?.name || current?.store?.name || null;
  return {
    ...(off || {}), code: ean,
    product_name: off?.product_name || off?.product_name_nb || k?.name || "",
    product_name_nb: off?.product_name_nb || k?.name || "",
    brands: off?.brands || k?.brand || "",
    quantity: off?.quantity || (k?.weight ? `${k.weight}${k?.weight_unit || ""}` : ""),
    image_front_small_url: off?.image_front_small_url || off?.image_small_url || k?.image || "",
    nutriments: { ...nutritionMap(k?.nutrition || []), ...(off?.nutriments || {}) },
    allergens_tags: off?.allergens_tags?.length ? off.allergens_tags : allergens,
    ingredients_text: off?.ingredients_text || k?.ingredients || "",
    additives_tags: off?.additives_tags || [],
    embla_source: off ? "kassalapp+openfoodfacts" : "kassalapp",
    embla_price: price, embla_store: store, embla_vendor: k?.vendor || null,
  };
}

function norm(v: unknown) {
  return String(v || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("nb-NO").replace(/[^a-z0-9æøå]+/g, " ").trim().replace(/\s+/g, " ");
}
function tokenSet(v: unknown) { return new Set(norm(v).split(" ").filter(Boolean)); }
function arrText(v: unknown) { return Array.isArray(v) ? v.join(" ") : String(v || ""); }

function relevanceFor(p: any, q: string) {
  const query = norm(q);
  const qt = query.split(" ").filter(Boolean);
  const name = norm(p?.product_name_nb || p?.product_name || "");
  const nameTokens = tokenSet(name);
  const brand = norm(p?.brands || "");
  const categories = norm(arrText(p?.categories_tags_en));
  const ingredients = norm(p?.ingredients_text || "");
  let score = 0;
  let why = "weak";

  if (name === query) { score = 120; why = "exact_name"; }
  else if (qt.length && qt.every((t) => nameTokens.has(t))) { score = 108; why = "name_words"; }
  else if (name.startsWith(query + " ")) { score = 102; why = "name_prefix"; }
  else if (` ${name} `.includes(` ${query} `)) { score = 98; why = "name_phrase"; }
  else if (name.includes(query)) { score = 66; why = "name_compound"; }
  else if (qt.length && qt.every((t) => tokenSet(brand).has(t))) { score = 52; why = "brand"; }
  else if (categories.includes(query)) { score = 42; why = "category"; }
  else if (ingredients.includes(query)) { score = 24; why = "ingredient"; }

  const norway = norwayRank(p) ? 6 : 0;
  score += norway;
  const band = score >= 90 ? "DIRECT" : score >= 55 ? "RELATED" : "WEAK";
  return { score, band, why };
}

const NUTRI_SCORE: Record<string, number> = { a: 100, b: 82, c: 62, d: 38, e: 18 };
function healthFor(p: any) {
  const grade = String(p?.nutriscore_grade || "").toLowerCase();
  const nova = Number(p?.nova_group || 0) || null;
  const parts: number[] = [];
  const signals: any[] = [];
  if (grade in NUTRI_SCORE) {
    parts.push(NUTRI_SCORE[grade]);
    signals.push({ kind: "nutri", label: `NUTRI-SCORE ${grade.toUpperCase()}`, tone: grade === "a" || grade === "b" ? "positive" : grade === "d" || grade === "e" ? "warning" : "neutral" });
  }
  if (nova) {
    const processing = nova === 1 ? 92 : nova === 2 ? 78 : nova === 3 ? 58 : 28;
    parts.push(processing);
    if (nova === 4) signals.push({ kind: "nova", label: "NOVA 4 · ULTRAPROSESSERT", tone: "warning" });
    else signals.push({ kind: "nova", label: `NOVA ${nova}`, tone: nova === 1 ? "positive" : "neutral" });
  }
  const score = parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : null;
  return { score, signals, confidence: parts.length >= 2 ? "SOURCE" : parts.length === 1 ? "PARTIAL" : "UNKNOWN" };
}

function decorateAndRank(products: any[], q: string) {
  const decorated = products.map((p: any, providerIndex: number) => {
    const rel = relevanceFor(p, q);
    const health = healthFor(p);
    return {
      ...p,
      embla_relevance: rel.score,
      embla_relevance_band: rel.band,
      embla_match: rel.why,
      embla_provider_order: providerIndex,
      embla_health_score: health.score,
      embla_health_signals: health.signals,
      embla_health_confidence: health.confidence,
    };
  });
  decorated.sort((a: any, b: any) => (b.embla_relevance - a.embla_relevance) || (a.embla_provider_order - b.embla_provider_order));
  // When the provider contains a useful direct-answer set, suppress ingredient/category noise.
  // This is a universal intent rule: a query for a grocery noun should return products named as that noun before recipes/meals merely containing it.
  const direct = decorated.filter((p: any) => p.embla_relevance_band === "DIRECT");
  const filtered = direct.length >= 4 ? decorated.filter((p: any) => p.embla_relevance >= 55) : decorated;
  return filtered.slice(0, 40);
}

async function kassSearch(q: string) {
  const d = await kassJson(`/products?search=${encodeURIComponent(q)}&page=1&size=40&unique=true&exclude_without_ean=true`);
  return Array.isArray(d?.data) ? d.data : [];
}

async function kassEan(ean: string) {
  const d = await kassJson(`/products/ean/${encodeURIComponent(ean)}`);
  const products = Array.isArray(d?.data?.products) ? d.data.products : [];
  return { root: d?.data || null, products };
}

async function buildSearch(q: string) {
  const sources: Record<string, string> = { kassalapp: KASSALAPP_KEY ? "configured" : "unconfigured", openfoodfacts: "unknown" };
  if (KASSALAPP_KEY) {
    try {
      const k = await kassSearch(q);
      if (k.length) {
        let enrich = new Map<string, any>();
        try { enrich = await offBulk(k.map((x: any) => String(x?.ean || "")).filter(Boolean)); sources.openfoodfacts = "ok"; }
        catch (e: any) { sources.openfoodfacts = e?.code || "SOURCE_DOWN"; }
        sources.kassalapp = "ok";
        const products = decorateAndRank(k.map((x: any) => kassToOffLike(x, enrich.get(String(x?.ean || "")))), q);
        return { products, state: sources.openfoodfacts === "ok" ? "OK" : "PARTIAL", sources };
      }
      sources.kassalapp = "no_match";
    } catch (e: any) { sources.kassalapp = e?.code || "SOURCE_DOWN"; }
  }
  try {
    const products = decorateAndRank(await offTextSearch(q), q);
    sources.openfoodfacts = "ok";
    const partial = !!KASSALAPP_KEY && sources.kassalapp !== "ok" && sources.kassalapp !== "no_match";
    return { products, state: products.length ? (partial ? "PARTIAL" : "OK") : "NO_MATCH", sources };
  } catch (e: any) {
    sources.openfoodfacts = e?.code || "SOURCE_DOWN";
    const code = sources.kassalapp === "RATE_LIMITED" || sources.openfoodfacts === "RATE_LIMITED" ? "RATE_LIMITED" : "SOURCE_DOWN";
    throw Object.assign(new Error(code), { code, sources });
  }
}

async function buildEan(ean: string) {
  const sources: Record<string, string> = { kassalapp: KASSALAPP_KEY ? "configured" : "unconfigured", openfoodfacts: "unknown" };
  let off: any = null; let kass: any = null; let prices: any[] = [];
  const [o, k] = await Promise.allSettled([offBarcode(ean), KASSALAPP_KEY ? kassEan(ean) : Promise.resolve(null)]);
  if (o.status === "fulfilled") { off = o.value; sources.openfoodfacts = off ? "ok" : "no_match"; } else sources.openfoodfacts = (o.reason as any)?.code || "SOURCE_DOWN";
  if (KASSALAPP_KEY) {
    if (k.status === "fulfilled" && k.value) { kass = k.value.root; prices = k.value.products || []; sources.kassalapp = prices.length ? "ok" : "no_match"; }
    else sources.kassalapp = (k as PromiseRejectedResult)?.reason?.code || "SOURCE_DOWN";
  }
  if (!off && !prices.length) {
    const rate = Object.values(sources).includes("RATE_LIMITED");
    return { products: [], state: rate ? "RATE_LIMITED" : (Object.values(sources).includes("SOURCE_DOWN") ? "SOURCE_DOWN" : "NO_MATCH"), sources };
  }
  const representative = prices[0] || kass || { ean };
  const product: any = kassToOffLike(representative, off);
  product.embla_prices = prices.map((p: any) => ({ store: p?.store?.name || null, code: p?.store?.code || null, price: typeof p?.current_price === "number" ? p.current_price : p?.current_price?.price ?? null, date: p?.current_price?.date || null })).filter((x: any) => x.price != null);
  const health = healthFor(product);
  product.embla_relevance = 120;
  product.embla_relevance_band = "DIRECT";
  product.embla_match = "ean";
  product.embla_health_score = health.score;
  product.embla_health_signals = health.signals;
  product.embla_health_confidence = health.confidence;
  const partial = Object.values(sources).some((x) => x === "SOURCE_DOWN" || x === "RATE_LIMITED");
  return { products: [product], state: partial ? "PARTIAL" : "OK", sources };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, state: "BAD_REQUEST" }, 405);
  const user = await requireUser(req);
  if (!user) return json({ ok: false, state: "UNAUTHENTICATED", products: [] }, 401);
  try {
    const body = await req.json().catch(() => ({}));
    const raw = String(body?.q || body?.ean || "").trim();
    const isEan = /^\d{8,14}$/.test(raw);
    if (!raw || (!isEan && raw.length < 3)) return json({ ok: false, state: "QUERY_TOO_SHORT", products: [] }, 400);
    const kind = isEan ? "ean" : "search";
    const key = await cacheKey(kind, raw);
    const cached = await cacheRead(key).catch(() => null);
    if (cached && isFresh(cached)) return json({ ok: true, ...cached.payload, cache: "hit", kassalappConfigured: !!KASSALAPP_KEY });
    try {
      const out = isEan ? await buildEan(raw) : await buildSearch(raw);
      const payload = { ...out, query: raw, kind, ranking: "intent-first-v2" };
      await cacheWrite(key, kind, payload, out.state, isEan ? 43200 : 21600);
      return json({ ok: true, ...payload, cache: "miss", kassalappConfigured: !!KASSALAPP_KEY });
    } catch (e: any) {
      if (cached?.payload) return json({ ok: true, ...cached.payload, state: "PARTIAL", stale: true, cache: "stale", kassalappConfigured: !!KASSALAPP_KEY });
      return json({ ok: false, state: e?.code || "SOURCE_DOWN", products: [], sources: e?.sources || {}, kassalappConfigured: !!KASSALAPP_KEY }, e?.code === "RATE_LIMITED" ? 429 : 503);
    }
  } catch { return json({ ok: false, state: "SOURCE_DOWN", products: [] }, 500); }
});
