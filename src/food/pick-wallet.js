export const PICK_WALLET_VERSION = "p18-pick-wallet-0.6.0";

export function unknownWallet(reason = "No current price observation is connected to this GTIN.") {
  return {
    version: PICK_WALLET_VERSION,
    state: "UNKNOWN",
    confidence: "UNKNOWN",
    directness: "NONE",
    summary: reason,
    limitation: "Missing price data cannot improve rank.",
    observation: null,
    source: null,
  };
}

function ageDays(date) {
  const timestamp = Date.parse(String(date ?? ""));
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86400000));
}

export function normaliseWalletEnvelope(envelope) {
  if (!envelope || envelope.kind !== "found" || !envelope.latest) {
    return unknownWallet(envelope?.kind === "source_error" ? "Price source is currently unavailable." : "No NOK price observation was found for this GTIN.");
  }
  const observation = envelope.latest;
  const days = ageDays(observation.date ?? observation.created);
  const freshness = days === null ? "UNKNOWN AGE" : days <= 7 ? "RECENT OBSERVATION" : days <= 30 ? "CHECK DATE" : "STALE OBSERVATION";
  const confidence = days === null ? "LIMITED" : days <= 7 ? "MODERATE" : "LIMITED";
  const place = [observation.location?.brand || observation.location?.name, observation.location?.city].filter(Boolean).join(" · ");
  const priceText = typeof observation.price === "number" ? `${observation.price.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NOK` : "Price unavailable";
  const unitText = typeof observation.unitPrice === "number" && observation.unitPriceUnit
    ? `${observation.unitPrice.toLocaleString("nb-NO", { maximumFractionDigits: 2 })} ${observation.unitPriceUnit}`
    : null;

  return {
    version: PICK_WALLET_VERSION,
    state: freshness,
    confidence,
    directness: "OBSERVED PRICE",
    summary: `${priceText}${unitText ? ` · ${unitText}` : ""}${place ? ` · ${place}` : ""}`,
    limitation: envelope.limitation || "Observed price is not guaranteed to match the user's current shelf price.",
    observation: { ...observation, ageDays: days },
    source: envelope.source ?? null,
  };
}

export function compareWallet(a, b) {
  const aUnit = a?.observation?.unitPrice;
  const bUnit = b?.observation?.unitPrice;
  const aUnitName = a?.observation?.unitPriceUnit;
  const bUnitName = b?.observation?.unitPriceUnit;
  if (typeof aUnit === "number" && typeof bUnit === "number" && aUnitName && aUnitName === bUnitName) {
    const delta = bUnit - aUnit;
    return {
      known: true,
      favourable: delta < -0.005,
      delta,
      unit: aUnitName,
      explanation: Math.abs(delta) < 0.005 ? `Same observed unit price (${aUnitName}).` : `${Math.abs(delta).toLocaleString("nb-NO", { maximumFractionDigits: 2 })} ${aUnitName} ${delta < 0 ? "lower" : "higher"}.`,
    };
  }
  return { known: false, favourable: false, delta: null, unit: null, explanation: "No directly comparable observed unit price." };
}
