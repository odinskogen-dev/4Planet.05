export const CATEGORY_CONTROL_VERSION = "p18-food-category-control-0.2.0";

const PROFILES = [
  {
    id: "plain_yoghurt",
    label: "Plain yoghurt",
    family: "yoghurt",
    directTags: ["en:plain-yogurts", "en:plain-fermented-dairy-desserts"],
    familyTags: ["en:yogurts", "en:fermented-dairy-desserts"],
    requiredName: /yogh?urt/i,
    adjacentName: /biola|kefir|syrnet\s+melk|drikke?yogh?urt|drinking\s+yogh?urt/i,
  },
  {
    id: "muesli_granola",
    label: "Muesli and granola",
    family: "breakfast_cereal",
    directTags: ["en:mueslis", "en:granolas"],
    familyTags: ["en:breakfast-cereals"],
    adjacentName: /bar|drikk|drink/i,
  },
  {
    id: "cereal_flakes",
    label: "Breakfast cereal flakes",
    family: "breakfast_cereal",
    directTags: ["en:corn-flakes", "en:cereal-flakes", "en:chocolate-cereals"],
    familyTags: ["en:breakfast-cereals"],
    adjacentName: /bar|drikk|drink|m[üu]sli|granola/i,
  },
  {
    id: "breakfast_cereal_other",
    label: "Breakfast cereal",
    family: "breakfast_cereal",
    directTags: ["en:breakfast-cereals"],
    familyTags: ["en:breakfast-cereals"],
    adjacentName: /bar|drikk|drink/i,
  },
  {
    id: "potato_chips",
    label: "Potato chips",
    family: "savoury_snack",
    directTags: ["en:potato-chips", "en:crisps"],
    familyTags: ["en:chips-and-fries", "en:salty-snacks", "en:snacks"],
    adjacentName: /tortilla|mais|corn|linse|lentil|popcorn|ostepop|cheese\s+puff/i,
  },
  {
    id: "tortilla_chips",
    label: "Tortilla chips",
    family: "savoury_snack",
    directTags: ["en:tortilla-chips", "en:corn-chips"],
    familyTags: ["en:salty-snacks", "en:snacks"],
  },
  {
    id: "carbonated_soft_drink",
    label: "Carbonated soft drink",
    family: "cold_beverage",
    directTags: ["en:carbonated-drinks", "en:sodas", "en:soft-drinks"],
    familyTags: ["en:beverages"],
    adjacentName: /energy|energi|sports?\s*drink|isoton/i,
  },
  {
    id: "energy_drink",
    label: "Energy drink",
    family: "cold_beverage",
    directTags: ["en:energy-drinks"],
    familyTags: ["en:beverages"],
  },
  {
    id: "frozen_pizza",
    label: "Frozen pizza",
    family: "ready_meal",
    directTags: ["en:frozen-pizzas"],
    familyTags: ["en:pizzas", "en:frozen-foods", "en:meals"],
  },
  {
    id: "pizza_other",
    label: "Pizza",
    family: "ready_meal",
    directTags: ["en:pizzas"],
    familyTags: ["en:meals"],
  },
];

const normaliseText = (value) => String(value ?? "").trim();
const tagSet = (value) => new Set(Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);
const matchesAny = (tags, candidates) => candidates.some((tag) => tags.has(tag));

export function classifyProductCategory(productInput = {}) {
  const name = normaliseText(productInput.name ?? productInput.product_name ?? productInput.product_name_no_language);
  const tags = tagSet(productInput.categoryTags ?? productInput.categories_tags);
  const exactMatches = PROFILES.filter((profile) => matchesAny(tags, profile.directTags));
  const profile = exactMatches.find((candidate) => !candidate.requiredName || candidate.requiredName.test(name)) ?? exactMatches[0] ?? null;

  if (profile) {
    const nameRisk = profile.adjacentName?.test(name) ?? false;
    return {
      version: CATEGORY_CONTROL_VERSION,
      status: nameRisk ? "adjacent_signal" : "controlled",
      profileId: profile.id,
      label: profile.label,
      family: profile.family,
      nameRisk,
      sourceTags: profile.directTags.filter((tag) => tags.has(tag)),
      limitations: nameRisk ? ["Product name signals an adjacent format despite matching source taxonomy"] : [],
    };
  }

  const familyProfile = PROFILES.find((candidate) => matchesAny(tags, candidate.familyTags));
  if (familyProfile) {
    return {
      version: CATEGORY_CONTROL_VERSION,
      status: "unsupported_subtype",
      profileId: null,
      label: "Uncontrolled subtype",
      family: familyProfile.family,
      nameRisk: false,
      sourceTags: familyProfile.familyTags.filter((tag) => tags.has(tag)),
      limitations: ["The source taxonomy places the product in a supported family, but no direct-substitute subtype is controlled"],
    };
  }

  return {
    version: CATEGORY_CONTROL_VERSION,
    status: "unsupported",
    profileId: null,
    label: "Unsupported category",
    family: null,
    nameRisk: false,
    sourceTags: [],
    limitations: ["No controlled functional comparison group was found"],
  };
}

export function classifyProductRelation(baselineInput = {}, candidateInput = {}) {
  const baseline = baselineInput.categoryControl ?? classifyProductCategory(baselineInput);
  const candidate = candidateInput.categoryControl ?? classifyProductCategory(candidateInput);

  if (!baseline.profileId) {
    return {
      kind: "unknown",
      label: "Cannot compare fairly",
      reason: "The scanned product has no controlled direct-substitute group",
      baseline,
      candidate,
    };
  }
  if (!candidate.profileId) {
    return {
      kind: candidate.family && candidate.family === baseline.family ? "adjacent" : "unknown",
      label: candidate.family === baseline.family ? "Adjacent product" : "Cannot compare fairly",
      reason: candidate.family === baseline.family
        ? "The candidate shares the broader product family but lacks a controlled subtype"
        : "The candidate has no controlled comparison subtype",
      baseline,
      candidate,
    };
  }
  if (baseline.profileId === candidate.profileId && !candidate.nameRisk) {
    return {
      kind: "direct",
      label: "Direct substitute",
      reason: `Both products are controlled as ${baseline.label.toLowerCase()}`,
      baseline,
      candidate,
    };
  }
  if (baseline.family && baseline.family === candidate.family) {
    return {
      kind: "adjacent",
      label: "Adjacent product",
      reason: candidate.nameRisk
        ? "Source taxonomy overlaps, but the product name signals a different format"
        : `Both products belong to ${baseline.family.replaceAll("_", " ")}, but not the same direct-substitute subtype`,
      baseline,
      candidate,
    };
  }
  return {
    kind: "unsuitable",
    label: "Unsuitable comparison",
    reason: "The products do not share a controlled functional family",
    baseline,
    candidate,
  };
}

export function listControlledCategoryProfiles() {
  return PROFILES.map(({ id, label, family, directTags, familyTags }) => ({ id, label, family, directTags, familyTags }));
}
