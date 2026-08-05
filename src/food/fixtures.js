const SOURCE = {
  id: "open_food_facts",
  apiVersion: "v3.6",
  schemaVersion: 1004,
  licence: {
    database: "Open Database License 1.0",
    contents: "Database Contents License 1.0",
    images: "CC BY-SA 3.0 where supplied by Open Food Facts",
  },
};

const completeProduct = {
  code: "7038010055652",
  product_name: "TEST RECORD — Norsk yoghurt naturell",
  brands: "P18 Fixture",
  quantity: "500 g",
  ingredients_text: "Melk, yoghurtkultur.",
  allergens_tags: ["en:milk"],
  traces_tags: [],
  nutriments: {
    "energy-kj_100g": 260,
    "energy-kcal_100g": 62,
    fat_100g: 3.4,
    "saturated-fat_100g": 2.2,
    carbohydrates_100g: 4.7,
    sugars_100g: 4.7,
    proteins_100g: 3.5,
    salt_100g: 0.1,
    sodium_100g: 0.04,
  },
  categories_tags: ["en:foods", "en:dairies", "en:yogurts"],
  countries_tags: ["en:norway"],
  image_front_url: "",
  last_modified_t: 1785960000,
  rev: 1,
  tags_sources: ["fixture:p18-food-01"],
};

const alternatives = [
  {
    ...completeProduct,
    code: "7048840000128",
    product_name: "TEST RECORD — Yoghurt A",
    nutriments: { ...completeProduct.nutriments, sugars_100g: 3.2, proteins_100g: 4.1 },
  },
  {
    ...completeProduct,
    code: "7048840000135",
    product_name: "TEST RECORD — Yoghurt B",
    nutriments: { ...completeProduct.nutriments, sugars_100g: 5.5, salt_100g: 0.08, sodium_100g: 0.032 },
  },
  {
    ...completeProduct,
    code: "7048840000142",
    product_name: "TEST RECORD — Yoghurt C",
    allergens_tags: [],
    nutriments: { ...completeProduct.nutriments, sugars_100g: 2.8, proteins_100g: 5.0 },
  },
  {
    ...completeProduct,
    code: "7048840000159",
    product_name: "TEST RECORD — Yoghurt D",
    nutriments: { ...completeProduct.nutriments, sugars_100g: 4.0, salt_100g: 0.2, sodium_100g: 0.08 },
  },
  {
    ...completeProduct,
    code: "7048840000166",
    product_name: "TEST RECORD — Yoghurt E",
    nutriments: { ...completeProduct.nutriments, sugars_100g: 3.8, proteins_100g: 3.8 },
  },
];

function envelope(product, alternativeProducts = alternatives) {
  return {
    fixture: true,
    request: { barcode: "7038010055652" },
    retrievedAt: "2026-08-05T20:00:00.000Z",
    source: SOURCE,
    product: {
      kind: "found",
      httpStatus: 200,
      endpoint: "fixture://open-food-facts/product/7038010055652",
      raw: product,
    },
    alternatives: {
      kind: "found",
      httpStatus: 200,
      endpoint: "fixture://open-food-facts/search/en:yogurts",
      categoryTag: "en:yogurts",
      marketScope: "fixture_norway",
      raw: { products: alternativeProducts },
    },
  };
}

export const FOOD_FIXTURES = {
  complete: {
    id: "complete",
    label: "Well-covered Norwegian test product",
    envelope: envelope(completeProduct),
  },
  incomplete: {
    id: "incomplete",
    label: "Incomplete product",
    envelope: envelope({
      code: "7038010055652",
      product_name: "TEST RECORD — Incomplete yoghurt",
      brands: "P18 Fixture",
      categories_tags: ["en:foods", "en:dairies", "en:yogurts"],
      countries_tags: ["en:norway"],
      nutriments: { sugars_100g: 4.2 },
      rev: 1,
    }),
  },
  unknown: {
    id: "unknown",
    label: "Unknown barcode",
    envelope: {
      fixture: true,
      request: { barcode: "7038010055652" },
      retrievedAt: "2026-08-05T20:00:00.000Z",
      source: SOURCE,
      product: { kind: "not_found", httpStatus: 404, endpoint: "fixture://open-food-facts/product/unknown" },
      alternatives: { kind: "not_run", raw: { products: [] } },
    },
  },
  conflict: {
    id: "conflict",
    label: "Malformed or conflicting record",
    envelope: envelope({
      ...completeProduct,
      code: "7048840000128",
      product_name: "TEST RECORD — Conflicting identity",
      nutriments: { ...completeProduct.nutriments, salt_100g: 2.0, sodium_100g: 0.04 },
    }),
  },
  sourceError: {
    id: "sourceError",
    label: "Source or network failure",
    envelope: {
      fixture: true,
      request: { barcode: "7038010055652" },
      retrievedAt: "2026-08-05T20:00:00.000Z",
      source: SOURCE,
      product: { kind: "source_error", httpStatus: 503, endpoint: "fixture://open-food-facts/unavailable", message: "Fixture source unavailable" },
      alternatives: { kind: "not_run", raw: { products: [] } },
    },
  },
};
