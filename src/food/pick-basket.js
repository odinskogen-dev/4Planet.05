export const PICK_BASKET_VERSION = "p18-pick-basket-0.1.0";
export const PICK_BASKET_KEY = "p18:pick:basket:v1";

export function makeBasketItem(product, axes) {
  const byId = Object.fromEntries((axes ?? []).map((axis) => [axis.id, axis]));
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
  return {
    total,
    healthCoverage: pct(health),
    walletCoverage: pct(wallet),
    planetCoverage: pct(planet),
    unknownWallet: total - wallet,
    unknownPlanet: total - planet,
    categories: new Set(list.map((item) => item.category).filter(Boolean)).size,
    rule: "Unknown data is never counted as favourable and cannot improve basket rank.",
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
