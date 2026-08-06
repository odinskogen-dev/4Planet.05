export const CATEGORY_CONTROL_VERSION = "p18-food-category-control-0.3.1";

const hasAnyTag = (tags, values) => values.some((tag) => tags.has(tag));
const normaliseName = (value) => String(value ?? "").trim().toLowerCase();
const YOGHURT_SIGNAL = /yogh?o?urt/;
const FLAVOUR_SIGNAL = /(vanil|vanilla|jordb|strawber|blåb|blueber|mango|bringeb|raspber|fersken|peach|karamell|caramel|sjokolade|chocolate|kokos|coconut|salted)/;

const PROFILES = [
  {
    id: "flavoured_yoghurt",
    label: "Flavoured yoghurt",
    family: "yoghurt",
    directTags: ["en:vanilla-yogurt", "en:flavoured-yogurts", "en:fruit-yogurts"],
    familyTags: ["en:yogurts", "en:plain-yogurts", "en:fermented-dairy-desserts"],
    matches: ({ name, tags }) => hasAnyTag(tags, ["en:vanilla-yogurt", "en:flavoured-yogurts", "en:fruit-yogurts"])
      || (YOGHURT_SIGNAL.test(name) && FLAVOUR_SIGNAL.test(name)),
  },
  {
    id: "greek_plain_yoghurt",
    label: "Greek-style plain yoghurt",
    family: "yoghurt",
    directTags: ["en:greek-style-yogurts"],
    familyTags: ["en:yogurts", "en:plain-yogurts", "en:fermented-dairy-desserts"],
    matches: ({ name, tags }) => (tags.has("en:greek-style-yogurts") || /\b(gresk|greek|græsk)\b/.test(name))
      && YOGHURT_SIGNAL.test(name)
      && !FLAVOUR_SIGNAL.test(name),
  },
  {
    id: "skyr_protein_yoghurt",
    label: "Skyr and protein yoghurt",
    family: "yoghurt",
    directTags: ["en:skyrs", "en:protein-yogurts"],
    familyTags: ["en:yogurts", "en:plain-yogurts", "en:fermented-dairy-desserts"],
    matches: ({ name }) => /\b(skyr|protein\s*yogh?o?urt|proteinyogh?o?urt)\b/.test(name),
  },
  {
    id: "plain_yoghurt",
    label: "Plain yoghurt",
    family: "yoghurt",
    directTags: ["en:plain-yogurts", "en:plain-fermented-dairy-desserts"],
    familyTags: ["en:yogurts", "en:fermented-dairy-desserts"],
    matches: ({ name, tags }) => hasAnyTag(tags, ["en:plain-yogurts", "en:plain-fermented-dairy-desserts"])
      && YOGHURT_SIGNAL.test(name)
      && !/(gresk|greek|græsk|skyr|protein|cottage|biola|kefir|syrnet\s+melk|drikke?yogh?o?urt|drinking\s+yogh?o?urt)/.test(name)
      && !FLAVOUR_SIGNAL.test(name),
  },
  {
    id: "rolled_oats",
    label: "Rolled oats",
    family: "breakfast_cereal",
    directTags: ["en:rolled-oats", "en:oat-flakes"],
    familyTags: ["en:breakfast-cereals", "en:cereal-flakes", "en:rolled-flakes"],
    matches: ({ name, tags }) => hasAnyTag(tags, ["en:rolled-oats", "en:oat-flakes"])
      || /\b(havregryn|rolled\s+oats?|oat\s+flakes?)\b/.test(name),
  },
  {
    id: "instant_porridge",
    label: "Instant porridge",
    family: "breakfast_cereal",
    directTags: ["en:porridges", "en:instant-porridges"],
    familyTags: ["en:breakfast-cereals"],
    matches: ({ name, tags }) => hasAnyTag(tags, ["en:porridges", "en:instant-porridges"])
      || /(havregrøt|porridge|oatmeal)/.test(name),
  },
  {
    id: "granola",
    label: "Granola",
    family: "breakfast_cereal",
    directTags: ["en:granolas", "en:crunchy-cereal-clusters"],
    familyTags: ["en:breakfast-cereals", "en:mueslis"],
    matches: ({ name, tags }) => hasAnyTag(tags, ["en:granolas", "en:crunchy-cereal-clusters"])
      || /\bgranola\b/.test(name),
  },
  {
    id: "muesli",
    label: "Muesli",
    family: "breakfast_cereal",
    directTags: ["en:mueslis"],
    familyTags: ["en:breakfast-cereals"],
    matches: ({ name, tags }) => (tags.has("en:mueslis") || /\b(müsli|musli|muesli)\b/.test(name))
      && !/\bgranola\b/.test(name),
  },
  {
    id: "corn_flakes",
    label: "Corn flakes",
    family: "breakfast_cereal",
    directTags: ["en:corn-flakes"],
    familyTags: ["en:breakfast-cereals", "en:cereal-flakes"],
    matches: ({ name, tags }) => tags.has("en:corn-flakes") || /\bcorn\s?flakes?\b/.test(name),
  },
  {
    id: "wheat_biscuits",
    label: "Pressed wheat biscuits",
    family: "breakfast_cereal",
    directTags: ["en:rolled-wheat-flakes"],
    familyTags: ["en:breakfast-cereals", "en:cereal-flakes"],
    matches: ({ name, tags }) => tags.has("en:rolled-wheat-flakes") || /\bweetabix\b/.test(name),
  },
  {
    id: "extruded_cereal",
    label: "Extruded breakfast cereal",
    family: "breakfast_cereal",
    directTags: ["en:extruded-cereals"],
    familyTags: ["en:breakfast-cereals"],
    matches: ({ name, tags }) => (tags.has("en:extruded-cereals") || /(cheerios|coco\s*pops|loops|puffs)/.test(name))
      && !tags.has("en:corn-flakes"),
  },
  {
    id: "frozen_pizza",
    label: "Frozen pizza",
    family: "ready_meal",
    directTags: ["en:frozen-pizzas"],
    familyTags: ["en:pizzas", "en:frozen-foods", "en:meals"],
    matches: ({ name, tags }) => tags.has("en:frozen-pizzas") || (/pizza/.test(name) && tags.has("en:frozen-foods")),
  },
  {
    id: "pizza_other",
    label: "Pizza",
    family: "ready_meal",
    directTags: ["en:pizzas"],
    familyTags: ["en:meals"],
    matches: ({ name, tags }) => tags.has("en:pizzas") || /pizza/.test(name),
  },
  {
    id: "tortilla_chips",
    label: "Tortilla chips",
    family: "savoury_snack",
    directTags: ["en:tortilla-chips", "en:corn-chips"],
    familyTags: ["en:salty-snacks", "en:snacks"],
    matches: ({ name, tags }) => !/pizza/.test(name)
      && (hasAnyTag(tags, ["en:tortilla-chips", "en:corn-chips"]) || /(tortilla|nacho|corn\s+chips?|maischips)/.test(name)),
  },
  {
    id: "potato_chips",
    label: "Potato chips",
    family: "savoury_snack",
    directTags: ["en:potato-chips", "en:potato-crisps", "en:crisps"],
    familyTags: ["en:chips-and-fries", "en:salty-snacks", "en:snacks"],
    matches: ({ name, tags }) => hasAnyTag(tags, ["en:potato-chips", "en:potato-crisps", "en:crisps"])
      && !/(french\s+fries|ostepop|cheese\s+puff|popcorn|tortilla|nacho|linse|lentil)/.test(name),
  },
  {
    id: "energy_drink",
    label: "Energy drink",
    family: "cold_beverage",
    directTags: ["en:energy-drinks"],
    familyTags: ["en:beverages", "en:carbonated-drinks"],
    matches: ({ name, tags }) => tags.has("en:energy-drinks") || /(energy\s*drink|energidrikk|red\s*bull|monster\s+energy)/.test(name),
  },
  {
    id: "carbonated_soft_drink",
    label: "Carbonated soft drink",
    family: "cold_beverage",
    directTags: ["en:carbonated-drinks", "en:sodas", "en:soft-drinks"],
    familyTags: ["en:beverages"],
    matches: ({ name, tags }) => hasAnyTag(tags, ["en:carbonated-drinks", "en:sodas", "en:soft-drinks"])
      && !tags.has("en:energy-drinks")
      && !/(energy\s*drink|energidrikk|red\s*bull|monster\s+energy)/.test(name),
  },
];

const FAMILY_RULES = [
  { family: "yoghurt", tags: ["en:yogurts", "en:plain-yogurts", "en:fermented-dairy-desserts", "en:fermented-milk-products"] },
  { family: "breakfast_cereal", tags: ["en:breakfast-cereals", "en:cereal-flakes", "en:rolled-flakes", "en:cereals-and-their-products"] },
  { family: "savoury_snack", tags: ["en:potato-crisps", "en:crisps", "en:chips-and-fries", "en:salty-snacks", "en:snacks"] },
  { family: "cold_beverage", tags: ["en:carbonated-drinks", "en:sodas", "en:soft-drinks", "en:beverages"] },
  { family: "ready_meal", tags: ["en:frozen-pizzas", "en:pizzas", "en:frozen-foods", "en:meals"] },
];

export function classifyProductCategory(productInput = {}) {
  const name = normaliseName(productInput.name ?? productInput.product_name ?? productInput.product_name_no_language);
  const rawTags = productInput.categoryTags ?? productInput.categories_tags;
  const tags = new Set(Array.isArray(rawTags) ? rawTags.filter((item) => typeof item === "string") : []);
  const context = { name, tags };
  const profile = PROFILES.find((candidate) => candidate.matches(context)) ?? null;

  if (profile) {
    return {
      version: CATEGORY_CONTROL_VERSION,
      status: "controlled",
      profileId: profile.id,
      label: profile.label,
      family: profile.family,
      nameRisk: false,
      sourceTags: profile.directTags.filter((tag) => tags.has(tag)),
      limitations: [],
    };
  }

  const familyRule = FAMILY_RULES.find((rule) => hasAnyTag(tags, rule.tags));
  if (familyRule) {
    return {
      version: CATEGORY_CONTROL_VERSION,
      status: "unsupported_subtype",
      profileId: null,
      label: "Uncontrolled subtype",
      family: familyRule.family,
      nameRisk: false,
      sourceTags: familyRule.tags.filter((tag) => tags.has(tag)),
      limitations: ["The source taxonomy places the product in a supported family, but no human-controlled direct-substitute subtype is confirmed"],
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
        ? "The candidate shares the broader product family but lacks a controlled direct-substitute subtype"
        : "The candidate has no controlled comparison subtype",
      baseline,
      candidate,
    };
  }
  if (baseline.profileId === candidate.profileId) {
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
      reason: `Both products belong to ${baseline.family.replaceAll("_", " ")}, but not the same direct-substitute subtype`,
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
