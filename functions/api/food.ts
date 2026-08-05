/**
 * GET /api/food?barcode={GTIN}
 *
 * Bounded P18-FOOD-01 source adapter. It performs one product read and one
 * category-bounded alternative search. It does not persist, score, or infer
 * missing product facts.
 */

interface PagesContext {
  request: Request;
}

interface JsonObject {
  [key: string]: unknown;
}

const OFF_ORIGIN = "https://world.openfoodfacts.org";
const USER_AGENT = "4PLANET-P18-FOOD/0.1 (https://4planet.org; product-intelligence@4planet.org)";
const PRODUCT_FIELDS = [
  "code",
  "product_name",
  "product_name_no_language",
  "generic_name",
  "brands",
  "quantity",
  "ingredients_text",
  "allergens_tags",
  "traces_tags",
  "nutriments",
  "categories_tags",
  "countries_tags",
  "image_front_url",
  "last_modified_t",
  "rev",
  "tags_sources",
].join(",");

const GENERIC_CATEGORIES = new Set([
  "en:foods",
  "en:beverages",
  "en:plant-based-foods-and-beverages",
  "en:plant-based-foods",
  "en:dairies",
  "en:fermented-foods",
  "en:fermented-milk-products",
]);

const licence = {
  database: "Open Database License 1.0",
  contents: "Database Contents License 1.0",
  images: "CC BY-SA 3.0 where supplied by Open Food Facts",
  attribution: "Open Food Facts contributors",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function normaliseGtin(value: string | null): { ok: boolean; normalized: string; error?: string } {
  const digits = (value ?? "").replace(/[^0-9]/g, "");
  if (![8, 12, 13, 14].includes(digits.length)) return { ok: false, normalized: digits, error: "invalid_length" };
  const body = digits.slice(0, -1);
  const expected = Number(digits.at(-1));
  let sum = 0;
  for (let index = body.length - 1, position = 0; index >= 0; index -= 1, position += 1) {
    sum += Number(body[index]) * (position % 2 === 0 ? 3 : 1);
  }
  const actual = (10 - (sum % 10)) % 10;
  return actual === expected
    ? { ok: true, normalized: digits }
    : { ok: false, normalized: digits, error: "invalid_check_digit" };
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function selectComparisonCategory(product: JsonObject): string | null {
  const tags = stringArray(product.categories_tags).filter((tag) => tag.startsWith("en:"));
  return [...tags].reverse().find((tag) => !GENERIC_CATEGORIES.has(tag)) ?? tags.at(-1) ?? null;
}

async function fetchJson(url: string): Promise<{ response: Response; payload: JsonObject | null }> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT,
    },
  });
  let payload: JsonObject | null = null;
  try {
    const parsed = await response.json();
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) payload = parsed as JsonObject;
  } catch {
    payload = null;
  }
  return { response, payload };
}

export const onRequestGet = async ({ request }: PagesContext): Promise<Response> => {
  const requestUrl = new URL(request.url);
  const gtin = normaliseGtin(requestUrl.searchParams.get("barcode"));
  if (!gtin.ok) {
    return json({
      ok: false,
      error: gtin.error,
      request: { barcode: gtin.normalized },
    }, 400);
  }

  const retrievedAt = new Date().toISOString();
  const productEndpoint = `${OFF_ORIGIN}/api/v3/product/${gtin.normalized}?fields=${encodeURIComponent(PRODUCT_FIELDS)}`;
  const source = {
    id: "open_food_facts",
    apiVersion: "v3.6",
    schemaVersion: null as number | null,
    licence,
    userAgent: USER_AGENT,
  };

  try {
    const { response, payload } = await fetchJson(productEndpoint);
    const rawProduct = payload?.product;
    const found = response.ok && rawProduct && typeof rawProduct === "object" && !Array.isArray(rawProduct);
    const schemaVersion = Number(payload?.schema_version);
    if (Number.isFinite(schemaVersion)) source.schemaVersion = schemaVersion;

    if (!found) {
      const explicitNotFound = response.status === 404 || payload?.status === 0 || payload?.status === "not_found";
      if (explicitNotFound) {
        return json({
          ok: true,
          request: { barcode: gtin.normalized },
          retrievedAt,
          source,
          product: {
            kind: "not_found",
            httpStatus: response.status,
            endpoint: productEndpoint,
            rawEnvelope: payload,
          },
          alternatives: { kind: "not_run", raw: { products: [] } },
        });
      }

      return json({
        ok: false,
        request: { barcode: gtin.normalized },
        retrievedAt,
        source,
        product: {
          kind: "source_error",
          httpStatus: response.status,
          endpoint: productEndpoint,
          message: payload ? "Open Food Facts returned an unusable product envelope" : "Open Food Facts returned non-JSON data",
          rawEnvelope: payload,
        },
        alternatives: { kind: "not_run", raw: { products: [] } },
      }, 502);
    }

    const product = rawProduct as JsonObject;
    const categoryTag = selectComparisonCategory(product);
    let alternatives: JsonObject = {
      kind: "not_run",
      categoryTag,
      marketScope: "norway_tagged_only",
      raw: { products: [] },
    };

    if (categoryTag) {
      const searchUrl = new URL(`${OFF_ORIGIN}/api/v2/search`);
      searchUrl.searchParams.set("categories_tags", categoryTag);
      searchUrl.searchParams.set("countries_tags_en", "norway");
      searchUrl.searchParams.set("fields", PRODUCT_FIELDS);
      searchUrl.searchParams.set("page_size", "24");
      searchUrl.searchParams.set("sort_by", "unique_scans_n");
      searchUrl.searchParams.set("json", "1");
      const alternativeEndpoint = searchUrl.toString();

      try {
        const alternativeRead = await fetchJson(alternativeEndpoint);
        const products = Array.isArray(alternativeRead.payload?.products)
          ? alternativeRead.payload?.products.filter((item) => item && typeof item === "object")
          : [];
        alternatives = {
          kind: alternativeRead.response.ok ? "found" : "source_error",
          httpStatus: alternativeRead.response.status,
          endpoint: alternativeEndpoint,
          categoryTag,
          marketScope: "norway_tagged_only",
          raw: { products },
          rawEnvelopeMeta: {
            count: alternativeRead.payload?.count ?? null,
            page: alternativeRead.payload?.page ?? null,
            pageSize: alternativeRead.payload?.page_size ?? null,
          },
        };
      } catch (error) {
        alternatives = {
          kind: "source_error",
          httpStatus: 0,
          endpoint: alternativeEndpoint,
          categoryTag,
          marketScope: "norway_tagged_only",
          message: error instanceof Error ? error.message : "Alternative source request failed",
          raw: { products: [] },
        };
      }
    }

    return json({
      ok: true,
      request: { barcode: gtin.normalized },
      retrievedAt,
      source,
      product: {
        kind: "found",
        httpStatus: response.status,
        endpoint: productEndpoint,
        raw: product,
        rawEnvelopeMeta: {
          status: payload?.status ?? null,
          warnings: payload?.warnings ?? [],
        },
      },
      alternatives,
    });
  } catch (error) {
    return json({
      ok: false,
      request: { barcode: gtin.normalized },
      retrievedAt,
      source,
      product: {
        kind: "source_error",
        httpStatus: 0,
        endpoint: productEndpoint,
        message: error instanceof Error ? error.message : "Open Food Facts request failed",
      },
      alternatives: { kind: "not_run", raw: { products: [] } },
    }, 503);
  }
};

export const onRequest = async (context: PagesContext): Promise<Response> => {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
