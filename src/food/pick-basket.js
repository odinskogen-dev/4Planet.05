export const PICK_BASKET_VERSION = "p18-pick-basket-0.6.0";
export const PICK_BASKET_KEY = "p18:pick:basket:v1";

export function makeBasketItem(product, axes, context = {}) {
  const byId = Object.fromEntries((axes ?? []).map((axis) => [axis.id, axis]));
  const observation = context.wallet?.observation ?? null;
  return {
    gtin: product.gtin,
    name: product.name || "Unnamed product",
    brand: product.brand || "",
    quantity: product.quantity || "",
    category: product.comparisonCategory || product.sourceComparisonCategory || "unknown",
    addedAt: new Date().toISOString(),
    health: byId.health?.state ?? "UNKNOWN",
    healthConfidence: byId.health?.confidence ?? "UNKNOWN",
    wallet: byId.wallet?.state ?? "UNKNOWN",
    walletConfidence: byId.wallet?.confidence ?? "UNKNOWN",
    planet: byId.planet?.state ?? "UNKNOWN",
    planetConfidence: byId.planet?.confidence ?? "UNKNOWN",
    observedPrice: typeof observation?.price === "number" ? observation.price : null,
    observedPriceDate: observation?.date ?? null,
    observedPricePlace: observation ? [observation.location?.brand || observation.location?.name, observation.location?.city].filter(Boolean).join(" · ") : null,
    observedUnitPrice: typeof observation?.unitPrice === "number" ? observation.unitPrice : null,
    observedUnitPriceUnit: observation?.unitPriceUnit ?? null,
  };
}

export function addBasketItem(items, item) {
  const existing = (items ?? []).filter((candidate) => candidate.gtin !== item.gtin);
  return [...existing, item];
}

export function removeBasketItem(items, gtin) {
  return (items ?? []).filter((item) => item.gtin !== gtin);
}

export function basketSummary(items) {
  const list = items ?? [];
  const total = list.length;
  const known = (field) => list.filter((item) => item[field] && item[field] !== "UNKNOWN").length;
  const pct = (count) => total ? Math.round((count / total) * 100) : 0;
  const health = known("health");
  const wallet = known("wallet");
  const planet = known("planet");
  const priced = list.filter((item) => typeof item.observedPrice === "number");
  const observedBasketPrice = priced.reduce((sum, item) => sum + item.observedPrice, 0);
  return {
    total,
    healthCoverage: pct(health),
    walletCoverage: pct(wallet),
    planetCoverage: pct(planet),
    priceObservationCoverage: pct(priced.length),
    observedBasketPrice,
    pricedItems: priced.length,
    unknownWallet: total - wallet,
    unknownPlanet: total - planet,
    categories: new Set(list.map((item) => item.category).filter(Boolean)).size,
    rule: "Observed basket cost is only the sum of stored price observations; it is not a guaranteed live checkout total. Unknown data is never counted as favourable.",
  };
}

export function safeReadBasket(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(PICK_BASKET_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistBasket(storage, items) {
  storage.setItem(PICK_BASKET_KEY, JSON.stringify(items));
}
