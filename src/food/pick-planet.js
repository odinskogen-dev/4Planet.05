import { classifyHealthProfile } from "./pick-health.js";

export const PICK_PLANET_VERSION = "p18-pick-planet-0.7.0";

export const PLANET_SOURCES = {
  nnr2023: {
    id: "nnr2023-environment",
    title: "Nordic Nutrition Recommendations 2023 — healthy and environment-friendly diet",
    sourceClass: "INDEPENDENT GUIDELINE SYNTHESIS",
    url: "https://pub.norden.org/nord2023-003/recommendations.html",
    checkedAt: "2026-08-20",
  },
  agribalyse: {
    id: "agribalyse-3.2",
    title: "AGRIBALYSE 3.2",
    sourceClass: "PUBLIC LCA REFERENCE DATABASE",
    url: "https://agribalyse.ademe.fr/",
    checkedAt: "2026-08-20",
  },
};

function out(profile, state, confidence, summary, evidence, limitation) {
  return {
    version: PICK_PLANET_VERSION,
    profile,
    state,
    confidence,
    directness: "CATEGORY PROXY",
    summary,
    evidence: evidence.map((id) => PLANET_SOURCES[id]).filter(Boolean),
    limitation,
    exactSkuFootprint: false,
  };
}

export function evaluatePlanet(product) {
  const profile = classifyHealthProfile(product);
  if (!product) return out(profile, "UNKNOWN", "UNKNOWN", "Product not loaded.", [], "No environmental inference is possible.");
  if ((product.dataQuality?.conflicts?.length ?? 0) > 0 || ["malformed", "conflicted"].includes(product.dataQuality?.state)) {
    return out(profile, "UNKNOWN", "UNKNOWN", "Product record has unresolved conflicts.", [], "Planet interpretation is blocked until product identity conflicts are resolved.");
  }

  switch (profile.family) {
    case "bread":
    case "pasta":
    case "breakfast_cereal":
      return out(profile, "LOWER CATEGORY BURDEN", "MODERATE", "Cereal-based foods are generally lower-impact food categories in Nordic dietary sustainability guidance, but this is not this SKU's footprint.", ["nnr2023", "agribalyse"], "Production method, origin, packaging and formulation are not resolved at product level. No brand winner is inferred from this proxy.");
    case "processed_meat":
      return out(profile, "HIGHER CATEGORY PRESSURE", "MODERATE", "Reducing red and processed meat is part of the Nordic direction for lower-impact dietary patterns.", ["nnr2023", "agribalyse"], "Species, feed, farm, processing, origin and supply chain are not known for this SKU. Category context must not be presented as an exact carbon footprint.");
    case "yoghurt":
      return out(profile, "CATEGORY CONTEXT", "LIMITED", "Dairy has a material environmental footprint, but product-level differences require origin, farming and formulation data that are not available here.", ["nnr2023", "agribalyse"], "No SKU-specific environmental superiority claim is permitted from this category proxy.");
    case "cold_beverage":
      return out(profile, "CATEGORY CONTEXT", "LIMITED", "Beverage footprint depends on ingredients, packaging, production and transport. PICK_ currently has category context only.", ["nnr2023", "agribalyse"], "No lower-impact claim between soft-drink brands is supported without product-specific evidence.");
    case "savoury_snack":
    case "ready_meal":
      return out(profile, "MIXED PRODUCT · PROXY ONLY", "LIMITED", "Mixed and prepared foods cannot be responsibly reduced to one environmental signal without composition and supply-chain detail.", ["agribalyse"], "PICK_ will not assign a SKU footprint from a generic prepared-food average.");
    default:
      return out(profile, "UNKNOWN", "UNKNOWN", "No controlled environmental mapping exists for this product category yet.", [], "Missing environmental data cannot improve rank.");
  }
}

export function comparePlanet(a, b) {
  if (!a || !b) return { known: false, explanation: "Planet evidence unavailable." };
  if (!a.exactSkuFootprint || !b.exactSkuFootprint) {
    return { known: false, explanation: "No SKU-level planet winner: current evidence is category proxy only." };
  }
  return { known: false, explanation: "SKU-level comparison method is not activated in this prototype." };
}
