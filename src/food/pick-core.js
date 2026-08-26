import { evaluateHealth } from "./pick-health.js";
import { evaluatePlanet } from "./pick-planet.js";
import { unknownWallet } from "./pick-wallet.js";

export const PICK_MODEL_VERSION = "p18-pick-0.5.0";

const knownNutrientCount = (product) => Object.values(product?.nutrients ?? {}).filter((value) => typeof value === "number" && Number.isFinite(value)).length;

export function buildDecisionAxes(product, context = {}) {
  if (!product) {
    return [
      unknownAxis("health", "HEALTH", "Product not loaded"),
      unknownAxis("wallet", "WALLET", "Price source not connected"),
      unknownAxis("planet", "PLANET", "Environmental evidence not connected"),
    ];
  }

  const health = evaluateHealth(product);
  const wallet = context.wallet ?? unknownWallet();
  const planet = context.planet ?? evaluatePlanet(product);

  return [
    {
      id: "health",
      label: "HEALTH",
      state: health.state,
      confidence: health.confidence,
      directness: health.directness,
      summary: health.summary,
      limitation: health.limitations?.join(" · ") || "No additional limitation recorded.",
      evidence: health.evidence ?? [],
    },
    {
      id: "wallet",
      label: "WALLET",
      state: wallet.state,
      confidence: wallet.confidence,
      directness: wallet.directness,
      summary: wallet.summary,
      limitation: wallet.limitation,
      evidence: wallet.source ? [wallet.source] : [],
    },
    {
      id: "planet",
      label: "PLANET",
      state: planet.state,
      confidence: planet.confidence,
      directness: planet.directness,
      summary: planet.summary,
      limitation: planet.limitation,
      evidence: planet.evidence ?? [],
    },
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
    evidence: [],
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

export function buildTruthPassport(product, context = {}) {
  if (!product) {
    return {
      source: { id: "NONE", class: "UNKNOWN", licence: "UNKNOWN" },
      directness: "NONE",
      freshness: { state: "UNKNOWN", detail: "No product loaded" },
      completeness: 0,
      conflictState: "UNKNOWN",
      facts: [],
      evidenceSources: [],
      chain: ["SOURCE", "RECORD", "FACT", "EVIDENCE", "INTERPRETATION"],
    };
  }

  const ref = product.sourceRef;
  const sourceId = ref?.sourceId ?? "UNKNOWN";
  const sourceClass = sourceId === "open_food_facts" ? "COMMUNITY PRODUCT DATABASE" : "SOURCE RECORD";
  const conflicts = product.dataQuality?.conflicts ?? [];
  const health = evaluateHealth(product);
  const planet = context.planet ?? evaluatePlanet(product);
  const wallet = context.wallet ?? unknownWallet();
  const facts = [
    { id: "identity", label: "PRODUCT IDENTITY", available: Boolean(product.gtin && product.name), directness: "PRODUCT-SPECIFIC", interpretation: "Identity record only" },
    { id: "ingredients", label: "INGREDIENTS", available: Boolean(product.ingredientsText), directness: "PRODUCT-SPECIFIC", interpretation: "Label data; not a health verdict" },
    { id: "nutrition", label: "NUTRITION", available: knownNutrientCount(product) >= 3, directness: "PRODUCT-SPECIFIC", interpretation: "Composition data; interpreted only through controlled evidence rules" },
    { id: "health", label: "HEALTH EVIDENCE", available: health.confidence !== "UNKNOWN", directness: health.directness, interpretation: `${health.state} · ${health.confidence}` },
    { id: "price", label: "PRICE", available: Boolean(wallet.observation), directness: wallet.directness, interpretation: wallet.observation ? `${wallet.state} · observed price` : "No usable price observation" },
    { id: "planet", label: "PLANET", available: planet.confidence !== "UNKNOWN", directness: planet.directness, interpretation: `${planet.state} · ${planet.exactSkuFootprint ? "SKU evidence" : "not an exact SKU footprint"}` },
  ];

  const evidenceSources = [
    ...(health.evidence ?? []),
    ...(wallet.source ? [wallet.source] : []),
    ...(planet.evidence ?? []),
  ].filter((source, index, list) => source && list.findIndex((candidate) => (candidate.id ?? candidate.sourceId) === (source.id ?? source.sourceId)) === index);

  return {
    source: {
      id: sourceId.toUpperCase(),
      class: sourceClass,
      licence: ref?.licence ? "DECLARED IN SOURCE ENVELOPE" : "UNKNOWN",
      apiVersion: ref?.apiVersion ?? "UNKNOWN",
      endpoint: ref?.endpoint ?? "UNKNOWN",
    },
    directness: "PRODUCT-SPECIFIC FOR LABEL/IDENTITY; HEALTH AND PLANET MAY USE CATEGORY/PATTERN EVIDENCE",
    freshness: freshness(ref?.retrievedAt),
    completeness: Math.round((product.dataQuality?.completeness ?? 0) * 100),
    conflictState: conflicts.length ? `CONFLICTED · ${conflicts.length}` : "NO CONTROLLED CONFLICTS",
    facts,
    evidenceSources,
    chain: ["SOURCE", "RECORD", "FACT", "EVIDENCE", "INTERPRETATION"],
  };
}
