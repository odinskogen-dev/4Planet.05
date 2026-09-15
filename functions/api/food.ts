/**
 * GET /api/food?barcode={GTIN}
 *
 * Bounded P18-FOOD source adapter. Product identity and alternative discovery
 * are separate source operations. Every attempt remains inspectable.
 */

interface PagesContext {
  request: Request;
}

interface JsonObject {
  [key: string]: unknown;
}

interface SourceRead {
  response: Response;
  payload: JsonObject | null;
  contentType: string;
  durationMs: number;
  attempt: number;
}

interface AlternativeAttempt {
  endpoint: string;
  categoryTag: string;
  httpStatus: number;
  productCount: number;
  ok: boolean;
  contentType: string;
  durationMs: number;
  attempt: number;
  retrievedAt: string;
}

const OFF_ORIGIN = "https://world.openfoodfacts.org";
const USER_AGENT = "4PLANET-P18-FOOD/0.2 (https://4planet.org; product-intelligence@4planet.org)";
const ADAPTER_VERSION = "p18-food-off-adapter-0.2.0";
const TRANSIENT_STATUS = new Set([429, 502, 503, 504]);
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

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function json(body: unknown, status = 200, requestId = ""): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...(requestId ? { "x-p18-request-id": requestId } : {}),
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
  const controlledFallbacks = [
    tags.includes("en:plain-yogurts") ? "en:plain-yogurts" : null,
    tags.includes("en:breakfast-cereals") ? "en:breakfast-cereals" : null,
    tags.includes("en:potato-chips") ? "en:potato-chips" : null,
    tags.includes("en:carbonated-drinks") ? "en:carbonated-drinks" : null,
    tags.includes("en:frozen-pizzas") ? "en:frozen-pizzas" : null,
  ].filter((tag): tag is string => Boolean(tag));
  return [...new Set([...controlledFallbacks, ...reversed.slice(0, 3)])].slice(0, 4);
}

async function fetchJson(url: string, maxAttempts = 1): Promise<SourceRead> {
  let lastRead: SourceRead | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const started = Date.now();
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": USER_AGENT,
      },
    });
    const contentType = response.headers.get("content-type") ?? "";
    let payload: JsonObject | null = null;
    if (contentType.includes("application/json")) {
      try {
        const parsed = await response.json();
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) payload = parsed as JsonObject;
      } catch {
        payload = null;
      }
    }
    lastRead = { response, payload, contentType, durationMs: Date.now() - started, attempt };
    if (response.ok || !TRANSIENT_STATUS.has(response.status) || attempt === maxAttempts) return lastRead;
    await sleep(attempt * 400);
  }
  if (!lastRead) throw new Error("Source read did not execute");
  return lastRead;
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
  let successfulEmptyRead: { endpoint: string; categoryTag: string; response: Response; payload: JsonObject | null } | null = null;
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
      const read = await fetchJson(endpoint, 2);
      const products = productArray(read.payload);
      attempts.push({
        endpoint,
        categoryTag,
        httpStatus: read.response.status,
        productCount: products.length,
        ok: read.response.ok,
        contentType: read.contentType,
        durationMs: read.durationMs,
        attempt: read.attempt,
        retrievedAt: new Date().toISOString(),
      });

      if (read.response.ok && products.length === 0 && !successfulEmptyRead) {
        successfulEmptyRead = { endpoint, categoryTag, response: read.response, payload: read.payload };
      }
      if (read.response.ok && products.length > 0 && (!bestSuccessfulRead || products.length > bestSuccessfulRead.products.length)) {
        bestSuccessfulRead = { endpoint, categoryTag, response: read.response, payload: read.payload, products };
      }
      if (read.response.ok && products.length >= 4) break;
    } catch {
      attempts.push({
        endpoint,
        categoryTag,
        httpStatus: 0,
        productCount: 0,
        ok: false,
        contentType: "",
        durationMs: 0,
        attempt: 1,
        retrievedAt: new Date().toISOString(),
      });
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

  if (successfulEmptyRead) {
    return {
      kind: "not_found",
      httpStatus: successfulEmptyRead.response.status,
      endpoint: successfulEmptyRead.endpoint,
      categoryTag: successfulEmptyRead.categoryTag,
      requestedCategoryTags: categoryCandidates,
      marketScope: "norway_tagged_only",
      message: "Open Food Facts returned no Norway-tagged products for the bounded category searches",
      raw: { products: [] },
      rawEnvelopeMeta: { attempts },
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
  const requestId = crypto.randomUUID();
  const requestUrl = new URL(request.url);
  const gtin = normaliseGtin(requestUrl.searchParams.get("barcode"));
  if (!gtin.ok) {
    return json({
      ok: false,
      error: gtin.error,
      request: { barcode: gtin.normalized, requestId },
    }, 400, requestId);
  }

  const retrievedAt = new Date().toISOString();
  const productEndpoint = `${OFF_ORIGIN}/api/v3/product/${gtin.normalized}?fields=${encodeURIComponent(PRODUCT_FIELDS)}`;
  const source = {
    id: "open_food_facts",
    apiVersion: "v3.6",
    schemaVersion: null as number | null,
    adapterVersion: ADAPTER_VERSION,
    licence,
    userAgent: USER_AGENT,
  };

  try {
    const read = await fetchJson(productEndpoint, 2);
    const rawProduct = read.payload?.product;
    const found = read.response.ok && rawProduct && typeof rawProduct === "object" && !Array.isArray(rawProduct);
    const schemaVersion = Number(read.payload?.schema_version);
    if (Number.isFinite(schemaVersion)) source.schemaVersion = schemaVersion;

    const productReadMeta = {
      requestId,
      contentType: read.contentType,
      durationMs: read.durationMs,
      attempt: read.attempt,
      retrievedAt,
    };

    if (!found) {
      const explicitNotFound = read.response.status === 404 || read.payload?.status === 0 || read.payload?.status === "not_found";
      if (explicitNotFound) {
        return json({
          ok: true,
          request: { barcode: gtin.normalized, requestId },
          retrievedAt,
          source,
          product: {
            kind: "not_found",
            httpStatus: read.response.status,
            endpoint: productEndpoint,
            rawEnvelope: read.payload,
            rawEnvelopeMeta: productReadMeta,
          },
          alternatives: { kind: "not_run", raw: { products: [] } },
        }, 200, requestId);
      }

      return json({
        ok: false,
        request: { barcode: gtin.normalized, requestId },
        retrievedAt,
        source,
        product: {
          kind: "source_error",
          httpStatus: read.response.status,
          endpoint: productEndpoint,
          message: read.payload ? "Open Food Facts returned an unusable product envelope" : "Open Food Facts returned non-JSON or malformed data",
          rawEnvelope: read.payload,
          rawEnvelopeMeta: productReadMeta,
        },
        alternatives: { kind: "not_run", raw: { products: [] } },
      }, 502, requestId);
    }

    const product = rawProduct as JsonObject;
    const alternatives = await readAlternatives(product);

    return json({
      ok: true,
      request: { barcode: gtin.normalized, requestId },
      retrievedAt,
      source,
      product: {
        kind: "found",
        httpStatus: read.response.status,
        endpoint: productEndpoint,
        raw: product,
        rawEnvelopeMeta: {
          ...productReadMeta,
          status: read.payload?.status ?? null,
          warnings: read.payload?.warnings ?? [],
        },
      },
      alternatives,
    }, 200, requestId);
  } catch (error) {
    return json({
      ok: false,
      request: { barcode: gtin.normalized, requestId },
      retrievedAt,
      source,
      product: {
        kind: "source_error",
        httpStatus: 0,
        endpoint: productEndpoint,
        message: error instanceof Error ? error.message : "Open Food Facts request failed",
        rawEnvelopeMeta: { requestId, retrievedAt },
      },
      alternatives: { kind: "not_run", raw: { products: [] } },
    }, 503, requestId);
  }
};

export const onRequest = async (context: PagesContext): Promise<Response> => {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
