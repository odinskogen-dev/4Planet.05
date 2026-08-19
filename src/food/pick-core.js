export const PICK_MODEL_VERSION = "p18-pick-0.2.0";

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

function freshness(retrievedAt) {
  if (!retrievedAt) return { state: "UNKNOWN", detail: "No retrieval timestamp" };
  const timestamp = Date.parse(retrievedAt);
  if (!Number.isFinite(timestamp)) return { state: "UNKNOWN", detail: "Unparseable retrieval timestamp" };
  const ageDays = Math.max(0, Math.floor((Date.now() - timestamp) / 86400000));
  return ageDays <= 7
    ? { state: "CURRENT READ", detail: `Retrieved ${ageDays} day${ageDays === 1 ? "" : "s"} ago` }
    : { state: "CHECK AGE", detail: `Retrieved ${ageDays} days ago` };
}

export function buildTruthPassport(product) {
  if (!product) {
    return {
      source: { id: "NONE", class: "UNKNOWN", licence: "UNKNOWN" },
      directness: "NONE",
      freshness: { state: "UNKNOWN", detail: "No product loaded" },
      completeness: 0,
      conflictState: "UNKNOWN",
      facts: [],
      chain: ["SOURCE", "RECORD", "FACT", "INTERPRETATION"],
    };
  }

  const ref = product.sourceRef;
  const sourceId = ref?.sourceId ?? "UNKNOWN";
  const sourceClass = sourceId === "open_food_facts" ? "COMMUNITY PRODUCT DATABASE" : "SOURCE RECORD";
  const conflicts = product.dataQuality?.conflicts ?? [];
  const facts = [
    { id: "identity", label: "PRODUCT IDENTITY", available: Boolean(product.gtin && product.name), directness: "PRODUCT-SPECIFIC", interpretation: "Identity record only" },
    { id: "ingredients", label: "INGREDIENTS", available: Boolean(product.ingredientsText), directness: "PRODUCT-SPECIFIC", interpretation: "Label data; not a health verdict" },
    { id: "nutrition", label: "NUTRITION", available: knownNutrientCount(product) >= 3, directness: "PRODUCT-SPECIFIC", interpretation: "Composition data; not a diet-pattern conclusion" },
    { id: "price", label: "PRICE", available: false, directness: "NONE", interpretation: "Wallet source not connected" },
    { id: "planet", label: "PLANET", available: false, directness: "NONE", interpretation: "Environmental evidence not connected" },
  ];

  return {
    source: {
      id: sourceId.toUpperCase(),
      class: sourceClass,
      licence: ref?.licence ? "DECLARED IN SOURCE ENVELOPE" : "UNKNOWN",
      apiVersion: ref?.apiVersion ?? "UNKNOWN",
      endpoint: ref?.endpoint ?? "UNKNOWN",
    },
    directness: "PRODUCT-SPECIFIC FOR LABEL/IDENTITY FIELDS ONLY",
    freshness: freshness(ref?.retrievedAt),
    completeness: Math.round((product.dataQuality?.completeness ?? 0) * 100),
    conflictState: conflicts.length ? `CONFLICTED · ${conflicts.length}` : "NO CONTROLLED CONFLICTS",
    facts,
    chain: ["SOURCE", "RECORD", "FACT", "INTERPRETATION"],
  };
}
