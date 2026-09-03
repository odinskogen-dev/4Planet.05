/**
 * GET /api/food?barcode={GTIN}
 *
 * Bounded P18-FOOD-01 source adapter. It performs one product read and a
 * bounded same-category alternative search. It does not persist, score, or
 * infer missing product facts.
 */

interface PagesContext {
  request: Request;
}

interface JsonObject {
  [key: string]: unknown;
}

interface AlternativeAttempt {
  endpoint: string;
  categoryTag: string;
  httpStatus: number;
  productCount: number;
  ok: boolean;
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
  "en:desserts",
  "en:dairy-desserts",
  "en:fermented-dairy-desserts",
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

function selectComparisonCategories(product: JsonObject): string[] {
  const tags = stringArray(product.categories_tags)
    .filter((tag) => tag.startsWith("en:"))
    .filter((tag) => !GENERIC_CATEGORIES.has(tag));
  const reversed = [...tags].reverse();
  const yoghurtFallback = tags.includes("en:yogurts") ? ["en:yogurts"] : [];
  return [...new Set([...reversed.slice(0, 2), ...yoghurtFallback])].slice(0, 3);
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

function productArray(payload: JsonObject | null): JsonObject[] {
  return Array.isArray(payload?.products)
    ? payload.products.filter((item): item is JsonObject => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    : [];
}

function buildAlternativeEndpoint(categoryTag: string): string {
  const searchUrl = new URL(`${OFF_ORIGIN}/api/v2/search`);
  searchUrl.searchParams.set("categories_tags", categoryTag);
  searchUrl.searchParams.set("countries_tags_en", "norway");
  searchUrl.searchParams.set("fields", PRODUCT_FIELDS);
  searchUrl.searchParams.set("page", "1");
  searchUrl.searchParams.set("page_size", "24");
  searchUrl.searchParams.set("json", "1");
  return searchUrl.toString();
}

async function readAlternatives(product: JsonObject): Promise<JsonObject> {
  const categoryCandidates = selectComparisonCategories(product);
  if (categoryCandidates.length === 0) {
    return {
      kind: "not_run",
      categoryTag: null,
      marketScope: "norway_tagged_only",
      raw: { products: [] },
      attempts: [],
    };
  }

  const attempts: AlternativeAttempt[] = [];
  let bestSuccessfulRead: {
    endpoint: string;
    categoryTag: string;
    response: Response;
    payload: JsonObject | null;
    products: JsonObject[];
  } | null = null;

  for (const categoryTag of categoryCandidates) {
    const endpoint = buildAlternativeEndpoint(categoryTag);
    try {
      const read = await fetchJson(endpoint);
      const products = productArray(read.payload);
      attempts.push({
        endpoint,
        categoryTag,
        httpStatus: read.response.status,
        productCount: products.length,
        ok: read.response.ok,
      });

      if (read.response.ok && (!bestSuccessfulRead || products.length > bestSuccessfulRead.products.length)) {
        bestSuccessfulRead = { endpoint, categoryTag, response: read.response, payload: read.payload, products };
      }
      if (read.response.ok && products.length >= 4) break;
    } catch {
      attempts.push({ endpoint, categoryTag, httpStatus: 0, productCount: 0, ok: false });
    }
  }

  if (bestSuccessfulRead) {
    return {
      kind: "found",
      httpStatus: bestSuccessfulRead.response.status,
      endpoint: bestSuccessfulRead.endpoint,
      categoryTag: bestSuccessfulRead.categoryTag,
      requestedCategoryTags: categoryCandidates,
      marketScope: "norway_tagged_only",
      raw: { products: bestSuccessfulRead.products },
      rawEnvelopeMeta: {
        count: bestSuccessfulRead.payload?.count ?? null,
        page: bestSuccessfulRead.payload?.page ?? null,
        pageSize: bestSuccessfulRead.payload?.page_size ?? null,
        attempts,
      },
    };
  }

  const lastAttempt = attempts.at(-1);
  return {
    kind: "source_error",
    httpStatus: lastAttempt?.httpStatus ?? 0,
    endpoint: lastAttempt?.endpoint ?? "",
    categoryTag: categoryCandidates[0],
    requestedCategoryTags: categoryCandidates,
    marketScope: "norway_tagged_only",
    message: "Open Food Facts alternative search did not return a usable response",
    raw: { products: [] },
    rawEnvelopeMeta: { attempts },
  };
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
    const alternatives = await readAlternatives(product);

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
