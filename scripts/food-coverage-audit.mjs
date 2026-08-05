import fs from "node:fs";
import { normalizeGtin, normaliseSourceEnvelope, rankAlternatives } from "../src/food/core.js";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4173";
const TARGET_PER_CATEGORY = Number(process.env.TARGET_PER_CATEGORY || 10);
const REQUEST_DELAY_MS = Number(process.env.REQUEST_DELAY_MS || 6500);
const USER_AGENT = "4PLANET-P18-FOOD-COVERAGE/0.2 (https://4planet.org; product-intelligence@4planet.org)";
const OFF_ORIGIN = "https://world.openfoodfacts.org";

const categories = [
  { id: "dairy_yoghurt", label: "Dairy and yoghurt", searchTag: "en:plain-yogurts", expectedFamily: "yoghurt", expectedProfiles: ["plain_yoghurt"] },
  { id: "breakfast_cereals", label: "Breakfast cereals", searchTag: "en:breakfast-cereals", expectedFamily: "breakfast_cereal", expectedProfiles: ["muesli_granola", "cereal_flakes", "breakfast_cereal_other"] },
  { id: "snacks", label: "Snacks", searchTag: "en:potato-chips", expectedFamily: "savoury_snack", expectedProfiles: ["potato_chips"] },
  { id: "beverages", label: "Beverages", searchTag: "en:carbonated-drinks", expectedFamily: "cold_beverage", expectedProfiles: ["carbonated_soft_drink"] },
  { id: "ready_meals", label: "Ready meals", searchTag: "en:frozen-pizzas", expectedFamily: "ready_meal", expectedProfiles: ["frozen_pizza"] },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const csvValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

async function readJson(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { accept: "application/json", "user-agent": USER_AGENT } });
      const text = await response.text();
      const payload = text ? JSON.parse(text) : null;
      if (response.ok) return { response, payload, attempt };
      lastError = new Error(`HTTP ${response.status}`);
      if (![429, 502, 503, 504].includes(response.status)) break;
    } catch (error) {
      lastError = error;
    }
    await sleep(attempt * 2000);
  }
  throw lastError ?? new Error("Source request failed");
}

function seedEndpoint(category) {
  const url = new URL(`${OFF_ORIGIN}/api/v2/search`);
  url.searchParams.set("categories_tags", category.searchTag);
  url.searchParams.set("countries_tags_en", "norway");
  url.searchParams.set("fields", "code,product_name,brands,countries_tags,categories_tags");
  url.searchParams.set("page", "1");
  url.searchParams.set("page_size", "60");
  url.searchParams.set("json", "1");
  return url.toString();
}

async function discoverSeeds(category) {
  const { payload } = await readJson(seedEndpoint(category));
  const products = Array.isArray(payload?.products) ? payload.products : [];
  const unique = new Map();
  for (const product of products) {
    const gtin = normalizeGtin(product?.code);
    const marketTags = Array.isArray(product?.countries_tags) ? product.countries_tags : [];
    if (!gtin.ok || !marketTags.includes("en:norway") || !String(product?.product_name ?? "").trim()) continue;
    if (!unique.has(gtin.normalized)) {
      unique.set(gtin.normalized, {
        gtin: gtin.normalized,
        seedName: String(product.product_name ?? ""),
        seedBrand: String(product.brands ?? ""),
        seedCategories: Array.isArray(product.categories_tags) ? product.categories_tags : [],
      });
    }
    if (unique.size >= TARGET_PER_CATEGORY) break;
  }
  return [...unique.values()];
}

function productRow(category, seed, result, envelope, error = null) {
  if (!result?.product) {
    return {
      categoryId: category.id,
      categoryLabel: category.label,
      searchTag: category.searchTag,
      gtin: seed.gtin,
      seedName: seed.seedName,
      resolution: result?.state ?? "source_error",
      identityAccuracy: false,
      norwayMarketRelevant: false,
      ingredientCoverage: false,
      allergenCoverage: false,
      nutritionCoverage: false,
      categoryPrecision: false,
      controlledProfile: "",
      controlledFamily: "",
      sourceConfidence: "",
      completeness: 0,
      missingFields: "",
      conflicts: "",
      alternativeSourceState: result?.alternativeState ?? "not_run",
      rawAlternativeCount: 0,
      eligibleAlternativeCount: 0,
      adjacentAlternativeCount: 0,
      unsuitableAlternativeCount: 0,
      relevanceSignal: "FAIL",
      topAlternatives: "",
      sourceAttempts: Array.isArray(result?.alternativeAttempts) ? result.alternativeAttempts.length : 0,
      retrievedAt: String(envelope?.retrievedAt ?? ""),
      sourceRevision: "",
      limitations: result?.message ?? error?.message ?? "No canonical product",
    };
  }

  const product = result.product;
  const ranking = rankAlternatives(product, result.alternatives ?? [], { lowerSugar: true, lowerSalt: true, higherProtein: true });
  const identityAccuracy = product.gtin === seed.gtin && Boolean(product.name);
  const norwayMarketRelevant = product.marketTags.includes("en:norway");
  const ingredientCoverage = Boolean(product.ingredientsText);
  const allergenCoverage = product.allergenDataPresent;
  const nutritionCoverage = [product.nutrients.energyKcal ?? product.nutrients.energyKj, product.nutrients.sugars, product.nutrients.salt, product.nutrients.protein]
    .filter((value) => value !== null).length >= 3;
  const categoryPrecision = product.categoryControl.family === category.expectedFamily
    && category.expectedProfiles.includes(product.categoryControl.profileId);
  const relevanceSignal = ranking.eligible.length >= 3 && categoryPrecision
    ? "PASS"
    : ranking.eligible.length > 0 || product.categoryControl.family === category.expectedFamily
      ? "AMEND"
      : "FAIL";

  return {
    categoryId: category.id,
    categoryLabel: category.label,
    searchTag: category.searchTag,
    gtin: seed.gtin,
    seedName: seed.seedName,
    resolution: result.state,
    identityAccuracy,
    norwayMarketRelevant,
    ingredientCoverage,
    allergenCoverage,
    nutritionCoverage,
    categoryPrecision,
    controlledProfile: product.categoryControl.profileId ?? "",
    controlledFamily: product.categoryControl.family ?? "",
    sourceConfidence: product.dataQuality.confidence,
    completeness: Number(product.dataQuality.completeness.toFixed(3)),
    missingFields: product.dataQuality.missingFields.join("|"),
    conflicts: product.dataQuality.conflicts.join("|"),
    alternativeSourceState: result.alternativeState ?? "not_run",
    rawAlternativeCount: result.alternatives?.length ?? 0,
    eligibleAlternativeCount: ranking.eligible.length,
    adjacentAlternativeCount: ranking.adjacent.length,
    unsuitableAlternativeCount: ranking.unsuitable.length,
    relevanceSignal,
    topAlternatives: ranking.eligible.map((item) => `${item.product.name} [${item.relation.kind}]`).join(" | "),
    sourceAttempts: Array.isArray(result.alternativeAttempts) ? result.alternativeAttempts.length : 0,
    retrievedAt: String(envelope?.retrievedAt ?? ""),
    sourceRevision: product.sourceRevision ?? "",
    limitations: [...product.categoryControl.limitations, ...ranking.limitations].join(" | "),
  };
}

const rows = [];
const seedRecord = {};

for (const category of categories) {
  let seeds = [];
  try {
    seeds = await discoverSeeds(category);
  } catch (error) {
    rows.push(productRow(category, { gtin: "", seedName: "CATEGORY SEED FAILURE" }, null, null, error));
    seedRecord[category.id] = [];
    continue;
  }
  seedRecord[category.id] = seeds;

  for (const seed of seeds) {
    let envelope = null;
    let result = null;
    let error = null;
    try {
      const read = await readJson(`${BASE_URL}/api/food?barcode=${encodeURIComponent(seed.gtin)}`);
      envelope = read.payload;
      result = normaliseSourceEnvelope(envelope);
    } catch (caught) {
      error = caught instanceof Error ? caught : new Error(String(caught));
    }
    rows.push(productRow(category, seed, result, envelope, error));
    await sleep(REQUEST_DELAY_MS);
  }
}

const headers = [
  "categoryId", "categoryLabel", "searchTag", "gtin", "seedName", "resolution", "identityAccuracy", "norwayMarketRelevant",
  "ingredientCoverage", "allergenCoverage", "nutritionCoverage", "categoryPrecision", "controlledProfile", "controlledFamily",
  "sourceConfidence", "completeness", "missingFields", "conflicts", "alternativeSourceState", "rawAlternativeCount",
  "eligibleAlternativeCount", "adjacentAlternativeCount", "unsuitableAlternativeCount", "relevanceSignal", "topAlternatives",
  "sourceAttempts", "retrievedAt", "sourceRevision", "limitations",
];
const csv = [headers.map(csvValue).join(","), ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(","))].join("\n");

const categorySummaries = categories.map((category) => {
  const categoryRows = rows.filter((row) => row.categoryId === category.id && row.gtin);
  const count = categoryRows.length;
  const ratio = (field) => count ? categoryRows.filter((row) => Boolean(row[field])).length / count : 0;
  return {
    categoryId: category.id,
    categoryLabel: category.label,
    tested: count,
    found: categoryRows.filter((row) => row.resolution === "found").length,
    identityAccuracyRate: ratio("identityAccuracy"),
    norwayRelevanceRate: ratio("norwayMarketRelevant"),
    ingredientCoverageRate: ratio("ingredientCoverage"),
    allergenCoverageRate: ratio("allergenCoverage"),
    nutritionCoverageRate: ratio("nutritionCoverage"),
    categoryPrecisionRate: ratio("categoryPrecision"),
    threeAlternativeRate: count ? categoryRows.filter((row) => row.eligibleAlternativeCount >= 3).length / count : 0,
    relevancePassRate: count ? categoryRows.filter((row) => row.relevanceSignal === "PASS").length / count : 0,
    sourceErrors: categoryRows.filter((row) => row.resolution === "source_error" || row.alternativeSourceState === "source_error").length,
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  targetPerCategory: TARGET_PER_CATEGORY,
  testedProducts: rows.filter((row) => row.gtin).length,
  categories: categorySummaries,
  overall: {
    found: rows.filter((row) => row.gtin && row.resolution === "found").length,
    productCardPass: rows.filter((row) => row.gtin && row.identityAccuracy && row.sourceConfidence !== "conflicted").length,
    comparisonPass: rows.filter((row) => row.gtin && row.eligibleAlternativeCount >= 3 && row.categoryPrecision).length,
    relevancePass: rows.filter((row) => row.gtin && row.relevanceSignal === "PASS").length,
    failedOrUnresolved: rows.filter((row) => row.gtin && row.relevanceSignal === "FAIL").length,
  },
};

fs.writeFileSync("food-coverage-seeds.json", JSON.stringify(seedRecord, null, 2));
fs.writeFileSync("food-coverage-matrix.csv", csv);
fs.writeFileSync("food-coverage-matrix.json", JSON.stringify(rows, null, 2));
fs.writeFileSync("food-coverage-summary.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (summary.testedProducts < 50) {
  throw new Error(`Coverage audit tested only ${summary.testedProducts} products; minimum is 50`);
}
