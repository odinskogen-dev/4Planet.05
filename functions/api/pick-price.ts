/**
 * GET /api/pick-price?barcode={GTIN}
 * Read-only Open Prices adapter for PICK_ WALLET.
 * A price observation is not treated as the current shelf price unless date/location context is present.
 */
interface PagesContext { request: Request; }
interface JsonObject { [key: string]: unknown; }

const ORIGIN = "https://prices.openfoodfacts.org";
const ADAPTER_VERSION = "p18-pick-open-prices-0.1.0";
const USER_AGENT = "4PLANET-P18-PICK/0.6 (https://4planet.org; product-intelligence@4planet.org)";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}

function normaliseGtin(value: string | null): string | null {
  const digits = String(value ?? "").replace(/[^0-9]/g, "");
  if (![8, 12, 13, 14].includes(digits.length)) return null;
  const body = digits.slice(0, -1);
  const expected = Number(digits.at(-1));
  let sum = 0;
  for (let index = body.length - 1, position = 0; index >= 0; index -= 1, position += 1) sum += Number(body[index]) * (position % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === expected ? digits : null;
}

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

function asNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseQuantity(quantity: unknown): { amount: number; unit: "kg" | "l" } | null {
  const text = String(quantity ?? "").trim().toLowerCase().replace(",", ".");
  const match = text.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(kg|g|l|ml)\b/);
  if (!match) return null;
  const raw = Number(match[1]);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  if (match[2] === "kg") return { amount: raw, unit: "kg" };
  if (match[2] === "g") return { amount: raw / 1000, unit: "kg" };
  if (match[2] === "l") return { amount: raw, unit: "l" };
  return { amount: raw / 1000, unit: "l" };
}

function dateValue(value: unknown): number {
  const parsed = Date.parse(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export const onRequestGet = async ({ request }: PagesContext): Promise<Response> => {
  const url = new URL(request.url);
  const barcode = normaliseGtin(url.searchParams.get("barcode"));
  if (!barcode) return json({ ok: false, kind: "malformed", message: "Invalid GTIN" }, 400);

  const endpoint = new URL(`${ORIGIN}/api/v1/prices`);
  endpoint.searchParams.set("product_code", barcode);
  endpoint.searchParams.set("currency", "NOK");
  endpoint.searchParams.set("size", "50");

  const retrievedAt = new Date().toISOString();
  try {
    const response = await fetch(endpoint.toString(), { headers: { accept: "application/json", "user-agent": USER_AGENT } });
    const payload = asObject(await response.json());
    if (!response.ok || !payload) {
      return json({ ok: false, kind: "source_error", retrievedAt, source: { id: "open_prices", adapterVersion: ADAPTER_VERSION, endpoint: endpoint.toString() }, message: `Open Prices returned ${response.status}` }, 502);
    }

    const items = Array.isArray(payload.items) ? payload.items.map(asObject).filter((item): item is JsonObject => Boolean(item)) : [];
    const observations = items
      .filter((item) => String(item.product_code ?? "") === barcode && String(item.currency ?? "") === "NOK")
      .map((item) => {
        const location = asObject(item.location);
        const product = asObject(item.product);
        const price = asNumber(item.price);
        const quantity = parseQuantity(product?.quantity);
        const pricePer = String(item.price_per ?? "UNIT");
        let unitPrice: number | null = null;
        let unitPriceUnit: string | null = null;
        if (price !== null && pricePer === "UNIT" && quantity) {
          unitPrice = price / quantity.amount;
          unitPriceUnit = `NOK/${quantity.unit}`;
        } else if (price !== null && pricePer === "KG") {
          unitPrice = price; unitPriceUnit = "NOK/kg";
        } else if (price !== null && pricePer === "L") {
          unitPrice = price; unitPriceUnit = "NOK/l";
        }
        return {
          id: item.id ?? null,
          price,
          currency: "NOK",
          date: item.date ?? null,
          pricePer,
          unitPrice,
          unitPriceUnit,
          discounted: Boolean(item.price_is_discounted),
          priceWithoutDiscount: asNumber(item.price_without_discount),
          proofId: item.proof_id ?? null,
          location: {
            id: item.location_id ?? null,
            name: location?.osm_name ?? location?.osm_display_name ?? null,
            brand: location?.osm_brand ?? null,
            city: location?.osm_address_city ?? null,
            countryCode: location?.osm_address_country_code ?? null,
          },
          created: item.created ?? null,
        };
      })
      .filter((item) => item.price !== null)
      .sort((a, b) => Math.max(dateValue(b.date), dateValue(b.created)) - Math.max(dateValue(a.date), dateValue(a.created)));

    const norway = observations.filter((item) => !item.location.countryCode || String(item.location.countryCode).toUpperCase() === "NO");
    const usable = norway.length ? norway : observations;
    if (!usable.length) {
      return json({ ok: true, kind: "not_found", retrievedAt, barcode, source: { id: "open_prices", sourceClass: "CROWDSOURCED PRICE OBSERVATIONS", adapterVersion: ADAPTER_VERSION, endpoint: endpoint.toString(), licence: "ODbL" }, observations: [] });
    }

    return json({ ok: true, kind: "found", retrievedAt, barcode, source: { id: "open_prices", sourceClass: "CROWDSOURCED PRICE OBSERVATIONS", adapterVersion: ADAPTER_VERSION, endpoint: endpoint.toString(), licence: "ODbL" }, latest: usable[0], observations: usable.slice(0, 10), limitation: "Observed prices may be stale or from another store. They are never represented as the user's live shelf price without matching store/date evidence." });
  } catch (error) {
    return json({ ok: false, kind: "source_error", retrievedAt, barcode, source: { id: "open_prices", adapterVersion: ADAPTER_VERSION, endpoint: endpoint.toString() }, message: error instanceof Error ? error.message : "Open Prices request failed" }, 503);
  }
};

export const onRequest = async (context: PagesContext): Promise<Response> => context.request.method === "GET" ? onRequestGet(context) : json({ ok: false, error: "method_not_allowed" }, 405);
