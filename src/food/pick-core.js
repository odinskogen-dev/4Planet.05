export const PICK_MODEL_VERSION = "p18-pick-0.1.0";

const knownNutrientCount = (product) => Object.values(product?.nutrients ?? {}).filter((value) => typeof value === "number" && Number.isFinite(value)).length;

export function buildDecisionAxes(product) {
  if (!product) {
    return [
      unknownAxis("health", "HEALTH", "Product not loaded"),
      unknownAxis("wallet", "WALLET", "Price source not connected"),
      unknownAxis("planet", "PLANET", "Environmental evidence not connected"),
    ];
  }

  const hasConflicts = (product.dataQuality?.conflicts?.length ?? 0) > 0;
  const compositionKnown = Boolean(product.ingredientsText) || knownNutrientCount(product) >= 3;
  const health = hasConflicts
    ? unknownAxis("health", "HEALTH", "Product record has unresolved conflicts")
    : compositionKnown
      ? {
          id: "health",
          label: "HEALTH",
          state: "COMPOSITION READABLE",
          confidence: "LIMITED",
          directness: "PRODUCT DATA",
          summary: "Ingredients and/or nutrition are available for inspection. No health verdict is inferred from label data alone.",
          limitation: "Diet-pattern and category-specific health evidence is not connected in this iteration.",
        }
      : unknownAxis("health", "HEALTH", "Insufficient product composition data");

  return [
    health,
    unknownAxis("wallet", "WALLET", "No current price observation is connected to this GTIN."),
    unknownAxis("planet", "PLANET", "No product-, ingredient- or category-level environmental evidence is connected yet."),
  ];
}

export function unknownAxis(id, label, reason) {
  return {
    id,
    label,
    state: "UNKNOWN",
    confidence: "UNKNOWN",
    directness: "NONE",
    summary: reason,
    limitation: "Missing data is not treated as a positive signal and cannot improve rank.",
  };
}

export function buildProductTruthSummary(product) {
  if (!product) return { confidence: "UNKNOWN", completeness: 0, conflicts: [], missing: [] };
  return {
    confidence: String(product.dataQuality?.confidence ?? "low").toUpperCase(),
    completeness: Math.round((product.dataQuality?.completeness ?? 0) * 100),
    conflicts: product.dataQuality?.conflicts ?? [],
    missing: product.dataQuality?.missingFields ?? [],
  };
}
