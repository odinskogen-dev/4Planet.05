export const PICK_HEALTH_VERSION = "p18-pick-health-0.5.0";

export const HEALTH_SOURCES = {
  nnr2023: {
    id: "nnr2023",
    title: "Nordic Nutrition Recommendations 2023",
    sourceClass: "INDEPENDENT GUIDELINE SYNTHESIS",
    url: "https://pub.norden.org/nord2023-003/recommendations.html",
    checkedAt: "2026-08-20",
  },
  whoHealthyDiet: {
    id: "who-healthy-diet-2026",
    title: "WHO Healthy diet",
    sourceClass: "INTERNATIONAL HEALTH AUTHORITY",
    url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
    checkedAt: "2026-08-20",
  },
  wcrfProcessedMeat: {
    id: "wcrf-processed-meat",
    title: "WCRF: Limit red and processed meat",
    sourceClass: "INDEPENDENT EVIDENCE SYNTHESIS",
    url: "https://www.wcrf.org/research-policy/evidence-for-our-recommendations/limit-red-processed-meat/",
    checkedAt: "2026-08-20",
  },
};

const clean = (value) => String(value ?? "").trim().toLowerCase();
const tagSet = (product) => new Set(Array.isArray(product?.categoryTags) ? product.categoryTags : []);
const number = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const has = (tags, ...values) => values.some((value) => tags.has(value));

export function classifyHealthProfile(product) {
  if (!product) return { id: "unknown", family: "unknown", label: "Unknown food category", directness: "NONE" };
  const name = clean(product.name);
  const tags = tagSet(product);

  const wholegrain = /(fullkorn|whole\s*grain|wholegrain|whole\s*wheat|vollkorn)/.test(name)
    || has(tags, "en:wholegrain-breads", "en:whole-wheat-breads", "en:wholemeal-breads", "en:wholegrain-pasta", "en:whole-wheat-pasta");

  if (has(tags, "en:hams", "en:ham", "en:bacon", "en:salami", "en:sausages", "en:processed-meats", "en:cured-meats")
      || /\b(skinke|ham|bacon|salami|pepperoni|chorizo|spekemat|serrano|prosciutto)\b/.test(name)) {
    return { id: "processed_meat", family: "processed_meat", label: "Processed meat", directness: "CATEGORY" };
  }

  if (has(tags, "en:breads", "en:bread", "en:sliced-breads") || /\b(brød|bread|loaf)\b/.test(name)) {
    return wholegrain
      ? { id: "wholegrain_bread", family: "bread", label: "Wholegrain bread", directness: "CATEGORY + PRODUCT SIGNAL" }
      : { id: "refined_bread", family: "bread", label: "Bread without confirmed wholegrain signal", directness: "CATEGORY + PRODUCT SIGNAL" };
  }

  if (has(tags, "en:pastas", "en:pasta", "en:spaghetti", "en:macaroni") || /\b(pasta|spaghetti|makaroni|macaroni|tagliatelle|penne)\b/.test(name)) {
    return wholegrain
      ? { id: "wholegrain_pasta", family: "pasta", label: "Wholegrain pasta", directness: "CATEGORY + PRODUCT SIGNAL" }
      : { id: "refined_pasta", family: "pasta", label: "Pasta without confirmed wholegrain signal", directness: "CATEGORY + PRODUCT SIGNAL" };
  }

  const controlled = product.categoryControl?.profileId;
  if (controlled) return { id: controlled, family: product.categoryControl?.family ?? "unknown", label: product.categoryControl?.label ?? controlled, directness: "CONTROLLED CATEGORY" };

  if (has(tags, "en:yogurts", "en:yoghurt", "en:plain-yogurts")) return { id: "yoghurt_other", family: "yoghurt", label: "Yoghurt", directness: "SOURCE CATEGORY" };
  if (has(tags, "en:breakfast-cereals")) return { id: "breakfast_cereal_other", family: "breakfast_cereal", label: "Breakfast cereal", directness: "SOURCE CATEGORY" };
  if (has(tags, "en:soft-drinks", "en:sodas", "en:carbonated-drinks")) return { id: "carbonated_soft_drink", family: "cold_beverage", label: "Soft drink", directness: "SOURCE CATEGORY" };

  return { id: "unknown", family: "unknown", label: "No controlled health category", directness: "NONE" };
}

function result(profile, state, confidence, summary, evidence, limitations = [], composition = []) {
  return {
    version: PICK_HEALTH_VERSION,
    profile,
    state,
    confidence,
    directness: profile.directness,
    summary,
    evidence: evidence.map((id) => HEALTH_SOURCES[id]).filter(Boolean),
    limitations,
    composition,
  };
}

export function evaluateHealth(product) {
  const profile = classifyHealthProfile(product);
  if (!product) return result(profile, "UNKNOWN", "UNKNOWN", "Product not loaded.", [], ["No product identity." ]);
  if ((product.dataQuality?.conflicts?.length ?? 0) > 0 || ["malformed", "conflicted"].includes(product.dataQuality?.state)) {
    return result(profile, "UNKNOWN", "UNKNOWN", "Product record has unresolved conflicts.", [], ["Health interpretation is blocked until product identity/data conflicts are resolved."]);
  }

  const n = product.nutrients ?? {};
  const sugar = number(n.sugars);
  const salt = number(n.salt);
  const fibre = number(n.fibre);
  const saturatedFat = number(n.saturatedFat);
  const composition = [
    sugar === null ? null : `Sugar ${sugar} g/100 g/ml`,
    salt === null ? null : `Salt ${salt} g/100 g/ml`,
    fibre === null ? null : `Fibre ${fibre} g/100 g/ml`,
    saturatedFat === null ? null : `Saturated fat ${saturatedFat} g/100 g/ml`,
  ].filter(Boolean);

  switch (profile.id) {
    case "rolled_oats":
    case "wholegrain_bread":
    case "wholegrain_pasta":
      return result(profile, "GOOD EVERYDAY FIT", "HIGH", "This category aligns with the strong wholegrain direction in Nordic and international dietary guidance.", ["nnr2023", "whoHealthyDiet"], ["This is category/pattern evidence, not a medical claim about the individual product."], composition);
    case "refined_bread":
    case "refined_pasta":
      return result(profile, "PREFER WHOLEGRAIN", "MODERATE", "The product category can fit a normal diet, but wholegrain versions are preferred when they are a practical direct substitute.", ["nnr2023", "whoHealthyDiet"], ["Wholegrain status was not confirmed from the current product signals."], composition);
    case "processed_meat":
      return result(profile, "STRONG LIMIT", "HIGH", "Processed meat should not be a frequent default. The evidence base supports keeping intake very low and shifting routine protein choices elsewhere.", ["wcrfProcessedMeat", "nnr2023"], ["This is a frequency/category signal; it does not mean one serving is acutely unsafe."], composition);
    case "energy_drink":
      return result(profile, "LIMIT DEFAULT USE", "HIGH", "Nordic guidance recommends limiting energy drinks; sugar-containing versions also overlap with sugar-sweetened beverage evidence.", ["nnr2023", "whoHealthyDiet"], ["Caffeine dose and individual sensitivity are not established from this product record."], composition);
    case "carbonated_soft_drink":
      if (sugar !== null && sugar > 0.5) {
        return result(profile, "LIMIT DAILY DEFAULT", "HIGH", "This product contains measurable sugars and sits in a category where sugar-sweetened drinks are recommended to be limited.", ["nnr2023", "whoHealthyDiet"], ["The product record does not directly distinguish free sugar from every other sugar source; category context is part of the interpretation."], composition);
      }
      return result(profile, "LOW-SUGAR TRADE-OFF", "LIMITED", "Low sugar avoids the main sugar signal, but PICK_ does not assign a general health halo to soft drinks from that fact alone.", ["nnr2023", "whoHealthyDiet"], ["Sweetener composition and long-term dietary pattern are not resolved here."], composition);
    case "plain_yoghurt":
    case "greek_plain_yoghurt":
      return result(profile, "EVERYDAY FIT · COMPOSITION MATTERS", "MODERATE", "Plain fermented dairy can fit a healthy dietary pattern; fat quality and the wider diet still matter.", ["nnr2023"], ["PICK_ does not infer health superiority from 'plain' or 'Greek' labelling alone."], composition);
    case "flavoured_yoghurt":
    case "skyr_protein_yoghurt":
    case "yoghurt_other":
      return result(profile, "COMPOSITION DEPENDENT", "MODERATE", "Yoghurt can contribute useful nutrients, but sweetened/flavoured products require composition-level comparison rather than a category-wide verdict.", ["nnr2023", "whoHealthyDiet"], ["Total sugar can include lactose; it is not automatically equivalent to added sugar."], composition);
    case "granola":
    case "muesli":
    case "corn_flakes":
    case "wheat_biscuits":
    case "extruded_cereal":
    case "instant_porridge":
    case "breakfast_cereal_other":
      return result(profile, "COMPOSITION DEPENDENT", "MODERATE", "Breakfast cereals vary substantially. Wholegrain/fibre, sugar and salt need to be compared within the category.", ["nnr2023", "whoHealthyDiet"], ["A cereal name or processing category is not enough for a health verdict."], composition);
    case "potato_chips":
    case "tortilla_chips":
      return result(profile, "OCCASIONAL FIT", "MODERATE", "Salty snack foods are better treated as occasional foods than as a household nutrition base.", ["nnr2023", "whoHealthyDiet"], ["Frequency and portion size matter; this is not a prohibition."], composition);
    case "frozen_pizza":
    case "pizza_other":
      return result(profile, "COMPOSITION DEPENDENT", "MODERATE", "Ready meals vary widely; salt, fat quality, fibre and the rest of the meal pattern matter more than the word 'pizza'.", ["nnr2023", "whoHealthyDiet"], ["No general ultra-processed-food penalty is applied."], composition);
    default:
      return result(profile, "UNKNOWN", "UNKNOWN", "No controlled health interpretation exists for this category yet.", [], ["Missing category evidence cannot improve rank."], composition);
  }
}

export function healthComparisonMetrics(profileId) {
  const profiles = {
    wholegrain_bread: [{ key: "fibre", direction: "higher", label: "Fibre" }, { key: "salt", direction: "lower", label: "Salt" }],
    refined_bread: [{ key: "fibre", direction: "higher", label: "Fibre" }, { key: "salt", direction: "lower", label: "Salt" }],
    wholegrain_pasta: [{ key: "fibre", direction: "higher", label: "Fibre" }],
    refined_pasta: [{ key: "fibre", direction: "higher", label: "Fibre" }],
    flavoured_yoghurt: [{ key: "sugars", direction: "lower", label: "Total sugar" }, { key: "saturatedFat", direction: "lower", label: "Saturated fat" }],
    plain_yoghurt: [{ key: "saturatedFat", direction: "lower", label: "Saturated fat" }],
    greek_plain_yoghurt: [{ key: "saturatedFat", direction: "lower", label: "Saturated fat" }],
    processed_meat: [{ key: "salt", direction: "lower", label: "Salt" }, { key: "saturatedFat", direction: "lower", label: "Saturated fat" }],
    energy_drink: [{ key: "sugars", direction: "lower", label: "Total sugar" }],
    carbonated_soft_drink: [{ key: "sugars", direction: "lower", label: "Total sugar" }],
    granola: [{ key: "fibre", direction: "higher", label: "Fibre" }, { key: "sugars", direction: "lower", label: "Total sugar" }, { key: "salt", direction: "lower", label: "Salt" }],
    muesli: [{ key: "fibre", direction: "higher", label: "Fibre" }, { key: "sugars", direction: "lower", label: "Total sugar" }],
    corn_flakes: [{ key: "fibre", direction: "higher", label: "Fibre" }, { key: "salt", direction: "lower", label: "Salt" }],
    extruded_cereal: [{ key: "fibre", direction: "higher", label: "Fibre" }, { key: "sugars", direction: "lower", label: "Total sugar" }, { key: "salt", direction: "lower", label: "Salt" }],
    potato_chips: [{ key: "salt", direction: "lower", label: "Salt" }, { key: "saturatedFat", direction: "lower", label: "Saturated fat" }],
    tortilla_chips: [{ key: "salt", direction: "lower", label: "Salt" }, { key: "saturatedFat", direction: "lower", label: "Saturated fat" }],
    frozen_pizza: [{ key: "salt", direction: "lower", label: "Salt" }, { key: "saturatedFat", direction: "lower", label: "Saturated fat" }, { key: "fibre", direction: "higher", label: "Fibre" }],
  };
  return profiles[profileId] ?? [];
}
