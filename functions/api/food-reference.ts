/**
 * GET /api/food-reference?q={query}&limit={1..12}
 *
 * Read-only Norwegian reference spine backed by Matvaretabellen (Mattilsynet).
 * This is category/reference nutrition evidence, not a barcode/SKU claim.
 */
interface PagesContext { request: Request; }
interface JsonObject { [key: string]: unknown; }

const ORIGIN = "https://www.matvaretabellen.no";
const FOODS_ENDPOINT = `${ORIGIN}/api/nb/foods.json`;
const ADAPTER_VERSION = "s4piens-matvaretabellen-0.1.0";
const USER_AGENT = "4PLANET-S4PIENS-FOOD/0.1 (https://4planet.org; product-intelligence@4planet.org)";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=21600, stale-while-revalidate=86400",
      "x-content-type-options": "nosniff",
    },
  });
}

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalise(value: unknown): string {
  return text(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function foodName(item: JsonObject): string {
  return text(item.foodName) || text(item.name) || text(item.food_name) || text(item["food-name"]);
}

function foodId(item: JsonObject): string {
  const value = item.foodId ?? item.id ?? item.food_id ?? item["food-id"];
  return value === null || value === undefined ? "" : String(value);
}

function score(item: JsonObject, query: string): number {
  const name = normalise(foodName(item));
  if (!name) return -1;
  if (name === query) return 1000;
  if (name.startsWith(query)) return 750;
  if (name.includes(query)) return 500;
  const words = query.split(/\s+/).filter(Boolean);
  const matches = words.filter((word) => name.includes(word)).length;
  return matches === words.length && words.length > 0 ? 250 + matches : -1;
}

export const onRequestGet = async ({ request }: PagesContext): Promise<Response> => {
  const url = new URL(request.url);
  const rawQuery = text(url.searchParams.get("q"));
  const query = normalise(rawQuery);
  const requestedLimit = Number(url.searchParams.get("limit") ?? 8);
  const limit = Math.min(12, Math.max(1, Number.isFinite(requestedLimit) ? Math.floor(requestedLimit) : 8));
  const retrievedAt = new Date().toISOString();

  if (query.length < 2) {
    return json({
      ok: false,
      kind: "malformed",
      evidenceState: "UNKNOWN",
      message: "Use at least two characters for a Matvaretabellen reference search.",
    }, 400);
  }

  try {
    const response = await fetch(FOODS_ENDPOINT, {
      headers: { accept: "application/json", "user-agent": USER_AGENT },
      cf: { cacheTtl: 21600, cacheEverything: true },
    } as RequestInit & { cf?: { cacheTtl: number; cacheEverything: boolean } });

    if (!response.ok) {
      return json({
        ok: false,
        kind: "source_error",
        evidenceState: "UNAVAILABLE",
        retrievedAt,
        source: { id: "matvaretabellen", adapterVersion: ADAPTER_VERSION, endpoint: FOODS_ENDPOINT },
        message: `Matvaretabellen returned ${response.status}`,
      }, 502);
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
      return json({
        ok: false,
        kind: "source_error",
        evidenceState: "UNAVAILABLE",
        retrievedAt,
        source: { id: "matvaretabellen", adapterVersion: ADAPTER_VERSION, endpoint: FOODS_ENDPOINT },
        message: "Matvaretabellen returned an unexpected payload.",
      }, 502);
    }

    const matches = payload
      .map(asObject)
      .filter((item): item is JsonObject => Boolean(item))
      .map((item) => ({ item, score: score(item, query) }))
      .filter(({ score: value }) => value >= 0)
      .sort((a, b) => b.score - a.score || foodName(a.item).localeCompare(foodName(b.item), "nb"))
      .slice(0, limit)
      .map(({ item }) => ({
        foodId: foodId(item),
        foodName: foodName(item),
        record: item,
      }));

    return json({
      ok: true,
      kind: matches.length ? "found" : "not_found",
      evidenceState: "OBSERVED",
      retrievedAt,
      query: rawQuery,
      source: {
        id: "matvaretabellen",
        title: "Matvaretabellen",
        sourceClass: "OFFICIAL NORWEGIAN FOOD COMPOSITION TABLE",
        publisher: "Mattilsynet",
        adapterVersion: ADAPTER_VERSION,
        endpoint: FOODS_ENDPOINT,
        attribution: "Matvaretabellen / Mattilsynet",
        updateCadence: "annual",
      },
      truthBoundary: "Reference/category composition data only. It is not silently substituted for a barcode-specific product record.",
      matches,
    });
  } catch (error) {
    return json({
      ok: false,
      kind: "source_error",
      evidenceState: "UNAVAILABLE",
      retrievedAt,
      source: { id: "matvaretabellen", adapterVersion: ADAPTER_VERSION, endpoint: FOODS_ENDPOINT },
      message: error instanceof Error ? error.message : "Matvaretabellen request failed",
    }, 503);
  }
};

export const onRequest = async (context: PagesContext): Promise<Response> =>
  context.request.method === "GET"
    ? onRequestGet(context)
    : json({ ok: false, error: "method_not_allowed", evidenceState: "UNKNOWN" }, 405);
