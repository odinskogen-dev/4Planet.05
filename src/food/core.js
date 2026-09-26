import { classifyProductCategory, classifyProductRelation } from "./category-control.js";

export const FOOD_MODEL_VERSION = "p18-food-canonical-0.2.0";
export const COMPARISON_MODEL_VERSION = "p18-food-comparison-0.2.1";

const GTIN_LENGTHS = new Set([8, 12, 13, 14]);
const GENERIC_CATEGORY_TAGS = new Set([
  "en:foods",
  "en:beverages",
  "en:plant-based-foods-and-beverages",
  "en:plant-based-foods",
  "en:dairies",
  "en:fermented-foods",
  "en:fermented-milk-products",
]);

const finiteNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
};

const text = (value) => (typeof value === "string" ? value.trim() : "");
const stringArray = (value) =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object ?? {}, key);

export function normalizeGtin(input) {
  const digits = String(input ?? "").replace(/[^0-9]/g, "");
  if (!GTIN_LENGTHS.has(digits.length)) {
    return { ok: false, normalized: digits, error: "invalid_length" };
  }

  const body = digits.slice(0, -1);
  const expected = Number(digits.at(-1));
  let sum = 0;
  for (let index = body.length - 1, position = 0; index >= 0; index -= 1, position += 1) {
    const digit = Number(body[index]);
    sum += digit * (position % 2 === 0 ? 3 : 1);
  }
  const actual = (10 - (sum % 10)) % 10;
  if (actual !== expected) {
    return { ok: false, normalized: digits, error: "invalid_check_digit" };
  }
  return { ok: true, normalized: digits, error: null };
}

export function selectComparisonCategory(tags) {
  const values = stringArray(tags).filter((tag) => tag.startsWith("en:"));
  const specific = [...values].reverse().find((tag) => !GENERIC_CATEGORY_TAGS.has(tag));
  return specific ?? values.at(-1) ?? null;
}

function nutrient(nutriments, ...keys) {
  for (const key of keys) {
    const value = finiteNumber(nutriments?.[key]);
    if (value !== null) return value;
  }
  return null;
}

function normaliseTag(tag) {
  const value = text(tag);
  const colon = value.indexOf(":");
  return (colon >= 0 ? value.slice(colon + 1) : value).replaceAll("-", " ").trim().toLowerCase();
}

function completenessFor(raw, canonical) {
  const checks = [
    Boolean(canonical.name),
    Boolean(canonical.brand),
    Boolean(canonical.quantity),
    Boolean(canonical.ingredientsText),
    hasOwn(raw, "allergens_tags"),
    canonical.nutrients.energyKj !== null || canonical.nutrients.energyKcal !== null,
    Boolean(canonical.comparisonCategory),
    Boolean(canonical.imageUrl),
  ];
  return checks.filter(Boolean).length / checks.length;
}

function detectConflicts(raw, requestedGtin, canonical) {
  const conflicts = [];
  const sourceGtin = normalizeGtin(raw?.code);
  if (!sourceGtin.ok) conflicts.push("source_gtin_invalid");
  if (sourceGtin.ok && requestedGtin && sourceGtin.normalized !== requestedGtin) conflicts.push("source_gtin_mismatch");

  const sodium = canonical.nutrients.sodium;
  const salt = canonical.nutrients.salt;
  if (sodium !== null && salt !== null) {
    const expectedSalt = sodium * 2.5;
    const denominator = Math.max(expectedSalt, salt, 0.01);
    if (Math.abs(expectedSalt - salt) / denominator > 0.25) conflicts.push("salt_sodium_inconsistent");
  }

  if (canonical.nutrients.energyKj !== null && canonical.nutrients.energyKcal !== null) {
    const expectedKj = canonical.nutrients.energyKcal * 4.184;
    const denominator = Math.max(expectedKj, canonical.nutrients.energyKj, 1);
    if (Math.abs(expectedKj - canonical.nutrients.energyKj) / denominator > 0.25) {
      conflicts.push("energy_units_inconsistent");
    }
  }
  return conflicts;
}

export function normaliseProduct(rawInput, options = {}) {
  const raw = rawInput && typeof rawInput === "object" ? rawInput : {};
  const requested = normalizeGtin(options.requestedGtin ?? raw.code);
  const source = normalizeGtin(raw.code ?? options.requestedGtin);
  const gtin = source.ok ? source.normalized : requested.normalized;
  const nutriments = raw.nutriments && typeof raw.nutriments === "object" ? raw.nutriments : {};
  const categoryTags = stringArray(raw.categories_tags);
  const name = text(raw.product_name) || text(raw.product_name_no_language) || text(raw.generic_name);
  const categoryControl = classifyProductCategory({ name, categoryTags });
  const sourceComparisonCategory = selectComparisonCategory(categoryTags);

  const canonical = {
    modelVersion: FOOD_MODEL_VERSION,
    id: gtin ? `gtin:${gtin}` : "gtin:unknown",
    gtin,
    name,
    brand: text(raw.brands),
    quantity: text(raw.quantity),
    ingredientsText: text(raw.ingredients_text),
    allergenTags: stringArray(raw.allergens_tags).map(normaliseTag),
    traceTags: stringArray(raw.traces_tags).map(normaliseTag),
    allergenDataPresent: hasOwn(raw, "allergens_tags"),
    nutrients: {
      energyKj: nutrient(nutriments, "energy-kj_100g", "energy_100g"),
      energyKcal: nutrient(nutriments, "energy-kcal_100g"),
      fat: nutrient(nutriments, "fat_100g"),
      saturatedFat: nutrient(nutriments, "saturated-fat_100g"),
      carbohydrates: nutrient(nutriments, "carbohydrates_100g"),
      sugars: nutrient(nutriments, "sugars_100g"),
      fibre: nutrient(nutriments, "fiber_100g", "fibre_100g"),
      protein: nutrient(nutriments, "proteins_100g", "protein_100g"),
      salt: nutrient(nutriments, "salt_100g"),
      sodium: nutrient(nutriments, "sodium_100g"),
    },
    categoryTags,
    sourceComparisonCategory,
    comparisonCategory: categoryControl.profileId ?? sourceComparisonCategory,
    comparisonFamily: categoryControl.family,
    categoryControl,
    marketTags: stringArray(raw.countries_tags),
    imageUrl: text(raw.image_front_url),
    sourceRevision: finiteNumber(raw.rev),
    sourceModifiedAt: finiteNumber(raw.last_modified_t),
    sourceTags: stringArray(raw.tags_sources),
    sourceRef: options.sourceRef ?? null,
    isFixture: Boolean(options.isFixture),
  };

  const conflicts = detectConflicts(raw, requested.ok ? requested.normalized : "", canonical);
  const missingFields = [];
  if (!canonical.name) missingFields.push("name");
  if (!canonical.brand) missingFields.push("brand");
  if (!canonical.quantity) missingFields.push("quantity");
  if (!canonical.ingredientsText) missingFields.push("ingredients");
  if (!canonical.allergenDataPresent) missingFields.push("allergens");
  if (canonical.nutrients.energyKj === null && canonical.nutrients.energyKcal === null) missingFields.push("nutrition");
  if (!canonical.comparisonCategory) missingFields.push("comparison_category");
  if (!canonical.imageUrl) missingFields.push("image");

  const completeness = completenessFor(raw, canonical);
  const confidence = conflicts.length > 0 ? "conflicted" : completeness >= 0.8 ? "high" : completeness >= 0.55 ? "medium" : "low";
  const state = !source.ok || !canonical.name ? "malformed" : conflicts.length > 0 ? "conflicted" : missingFields.length > 0 ? "incomplete" : "complete";

  return {
    ...canonical,
    dataQuality: {
      state,
      confidence,
      completeness,
      missingFields,
      conflicts,
    },
  };
}

export function normaliseSourceEnvelope(envelopeInput) {
  const envelope = envelopeInput && typeof envelopeInput === "object" ? envelopeInput : {};
  const source = envelope.source && typeof envelope.source === "object" ? envelope.source : {};
  const productResult = envelope.product && typeof envelope.product === "object" ? envelope.product : {};
  const alternativeResult = envelope.alternatives && typeof envelope.alternatives === "object" ? envelope.alternatives : {};
  const requestedGtin = normalizeGtin(envelope.request?.barcode ?? envelope.requestedBarcode ?? "");

  if (productResult.kind === "source_error") {
    return { state: "source_error", source, requestedGtin, rawEnvelope: envelope, message: text(productResult.message) || "Source unavailable" };
  }
  if (productResult.kind === "not_found") {
    return { state: "not_found", source, requestedGtin, rawEnvelope: envelope };
  }
  if (productResult.kind !== "found" || !productResult.raw || typeof productResult.raw !== "object") {
    return { state: "malformed", source, requestedGtin, rawEnvelope: envelope, message: "Malformed source envelope" };
  }

  const sourceRef = {
    sourceId: text(source.id) || "open_food_facts",
    apiVersion: text(source.apiVersion),
    schemaVersion: finiteNumber(source.schemaVersion),
    endpoint: text(productResult.endpoint),
    retrievedAt: text(envelope.retrievedAt),
    licence: source.licence ?? null,
  };
  const product = normaliseProduct(productResult.raw, {
    requestedGtin: requestedGtin.normalized,
    sourceRef,
    isFixture: Boolean(envelope.fixture),
  });

  const rawAlternatives = Array.isArray(alternativeResult.raw?.products) ? alternativeResult.raw.products : [];
  const seen = new Set([product.gtin]);
  const alternatives = [];
  for (const item of rawAlternatives) {
    const candidate = normaliseProduct(item, {
      requestedGtin: item?.code,
      sourceRef: {
        ...sourceRef,
        endpoint: text(alternativeResult.endpoint),
      },
      isFixture: Boolean(envelope.fixture),
    });
    if (!candidate.gtin || seen.has(candidate.gtin)) continue;
    seen.add(candidate.gtin);
    alternatives.push(candidate);
  }

  const state = product.dataQuality.state === "malformed" ? "malformed" : "found";
  return {
    state,
    source,
    requestedGtin,
    rawEnvelope: envelope,
    product,
    alternatives,
    alternativeState: text(alternativeResult.kind) || "not_run",
    alternativeMessage: text(alternativeResult.message),
    alternativeAttempts: Array.isArray(alternativeResult.rawEnvelopeMeta?.attempts)
      ? alternativeResult.rawEnvelopeMeta.attempts
      : [],
    marketScope: text(alternativeResult.marketScope) || "unknown",
    comparisonCategory: product.comparisonCategory,
    sourceSearchCategory: text(alternativeResult.categoryTag) || null,
  };
}

function allergenMatch(product, avoidAllergens) {
  const avoid = avoidAllergens.map((item) => normaliseTag(item));
  if (avoid.length === 0) return [];
  return product.allergenTags.filter((tag) => avoid.includes(normaliseTag(tag)));
}

function compareMetric(candidate, baseline, key, direction, label, unit = "g") {
  const candidateValue = finiteNumber(candidate.nutrients[key]);
  const baselineValue = finiteNumber(baseline.nutrients[key]);
  if (candidateValue === null || baselineValue === null) {
    return { known: false, favourable: false, text: `${label}: insufficient comparable data` };
  }
  const delta = candidateValue - baselineValue;
  const favourable = direction === "lower" ? delta < -0.01 : delta > 0.01;
  const absolute = Math.abs(delta).toFixed(1).replace(/\.0$/, "");
  const relation = delta === 0 ? "the same" : delta < 0 ? `${absolute} ${unit} lower` : `${absolute} ${unit} higher`;
  return { known: true, favourable, text: `${label}: ${relation} per 100 g/ml` };
}

export function rankAlternatives(baseline, alternativesInput, preferencesInput = {}) {
  const alternatives = Array.isArray(alternativesInput) ? alternativesInput : [];
  const preferences = {
    avoidAllergens: stringArray(preferencesInput.avoidAllergens),
    lowerSugar: Boolean(preferencesInput.lowerSugar),
    lowerSalt: Boolean(preferencesInput.lowerSalt),
    higherProtein: Boolean(preferencesInput.higherProtein),
  };
  const selectedPriorityCount = Number(preferences.lowerSugar) + Number(preferences.lowerSalt) + Number(preferences.higherProtein);
  const baselineControlled = Boolean(baseline?.categoryControl?.profileId);
  const baselineReliable = !["malformed", "conflicted"].includes(baseline?.dataQuality?.state);
  const canRank = baselineControlled && baselineReliable;
  const limitations = [
    ...(baselineControlled ? [] : ["The scanned product has no controlled direct-substitute group, so alternatives cannot be ranked fairly"]),
    ...(baselineReliable ? [] : ["The scanned product record is conflicted or malformed, so alternatives cannot be ranked fairly"]),
  ];

  const evaluated = alternatives.map((candidate) => {
    const exclusions = [];
    const relation = classifyProductRelation(baseline, candidate);
    if (!canRank) exclusions.push("The scanned product record is not reliable enough for comparison");
    const matchedAllergens = allergenMatch(candidate, preferences.avoidAllergens);
    if (matchedAllergens.length > 0) exclusions.push(`Contains selected allergen: ${matchedAllergens.join(", ")}`);
    if (preferences.avoidAllergens.length > 0 && !candidate.allergenDataPresent) exclusions.push("Allergen data is missing");
    if (relation.kind !== "direct") exclusions.push(`${relation.label}: ${relation.reason}`);
    if (candidate.dataQuality.state === "malformed" || candidate.dataQuality.state === "conflicted") exclusions.push("Product record is not reliable enough for ranking");

    const explanations = [`${relation.label}: ${relation.reason}`];
    let favourableCount = 0;
    let knownCount = 0;
    if (preferences.lowerSugar) {
      const result = compareMetric(candidate, baseline, "sugars", "lower", "Sugar");
      explanations.push(result.text); knownCount += Number(result.known); favourableCount += Number(result.favourable);
    }
    if (preferences.lowerSalt) {
      const result = compareMetric(candidate, baseline, "salt", "lower", "Salt");
      explanations.push(result.text); knownCount += Number(result.known); favourableCount += Number(result.favourable);
    }
    if (preferences.higherProtein) {
      const result = compareMetric(candidate, baseline, "protein", "higher", "Protein");
      explanations.push(result.text); knownCount += Number(result.known); favourableCount += Number(result.favourable);
    }
    if (selectedPriorityCount === 0) explanations.push("No nutrition priority selected; direct substitutes are ordered by data confidence only");
    if (candidate.dataQuality.missingFields.length > 0) explanations.push(`Missing: ${candidate.dataQuality.missingFields.join(", ")}`);

    return {
      product: candidate,
      relation,
      eligible: exclusions.length === 0,
      exclusions,
      explanations,
      favourableCount,
      knownCount,
      selectedPriorityCount,
    };
  });

  const confidenceOrder = { high: 3, medium: 2, low: 1, conflicted: 0 };
  evaluated.sort((left, right) => {
    if (left.eligible !== right.eligible) return left.eligible ? -1 : 1;
    if (right.favourableCount !== left.favourableCount) return right.favourableCount - left.favourableCount;
    if (right.knownCount !== left.knownCount) return right.knownCount - left.knownCount;
    const confidenceDelta = (confidenceOrder[right.product.dataQuality.confidence] ?? 0) - (confidenceOrder[left.product.dataQuality.confidence] ?? 0);
    if (confidenceDelta !== 0) return confidenceDelta;
    if (right.product.dataQuality.completeness !== left.product.dataQuality.completeness) {
      return right.product.dataQuality.completeness - left.product.dataQuality.completeness;
    }
    return left.product.name.localeCompare(right.product.name, "nb");
  });

  const excluded = evaluated.filter((item) => !item.eligible);
  return {
    modelVersion: COMPARISON_MODEL_VERSION,
    preferences,
    fairComparison: canRank,
    limitations,
    eligible: evaluated.filter((item) => item.eligible).slice(0, 5),
    adjacent: excluded.filter((item) => item.relation.kind === "adjacent"),
    unsuitable: excluded.filter((item) => item.relation.kind === "unsuitable" || item.relation.kind === "unknown"),
    excluded,
  };
}

export function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}
