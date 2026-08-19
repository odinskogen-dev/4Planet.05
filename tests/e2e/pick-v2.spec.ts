import { expect, test } from "@playwright/test";

const FOOD_ENVELOPE = {
  ok: true,
  request: { barcode: "7038010055652", requestId: "pick-v2-test" },
  retrievedAt: "2026-08-20T00:00:00.000Z",
  source: {
    id: "open_food_facts",
    apiVersion: "v3.6",
    schemaVersion: 1004,
    adapterVersion: "test",
    licence: { database: "Open Database License 1.0" },
  },
  product: {
    kind: "found",
    httpStatus: 200,
    endpoint: "test://product",
    raw: {
      code: "7038010055652",
      product_name: "TEST — Lyst brød",
      brands: "PICK Fixture",
      quantity: "500 g",
      ingredients_text: "Hvetemel, vann, gjær, salt.",
      allergens_tags: ["en:gluten"],
      traces_tags: [],
      nutriments: {
        "energy-kcal_100g": 240,
        fat_100g: 2.2,
        "saturated-fat_100g": 0.4,
        carbohydrates_100g: 44,
        sugars_100g: 2.4,
        fiber_100g: 2.2,
        proteins_100g: 8.2,
        salt_100g: 0.9,
        sodium_100g: 0.36,
      },
      categories_tags: ["en:foods", "en:breads"],
      countries_tags: ["en:norway"],
      image_front_url: "",
      last_modified_t: 1787184000,
      rev: 1,
      tags_sources: ["test"],
    },
  },
  alternatives: {
    kind: "found",
    endpoint: "test://alternatives",
    categoryTag: "en:breads",
    marketScope: "norway_tagged_only",
    raw: {
      products: [{
        code: "7048840000128",
        product_name: "TEST — Fullkorn brød",
        brands: "PICK Fixture",
        quantity: "500 g",
        ingredients_text: "Fullkornshvete, vann, gjær, salt.",
        allergens_tags: ["en:gluten"],
        traces_tags: [],
        nutriments: {
          "energy-kcal_100g": 225,
          fat_100g: 2.1,
          "saturated-fat_100g": 0.4,
          carbohydrates_100g: 38,
          sugars_100g: 2.0,
          fiber_100g: 7.2,
          proteins_100g: 9,
          salt_100g: 0.7,
          sodium_100g: 0.28,
        },
        categories_tags: ["en:foods", "en:breads", "en:wholegrain-breads"],
        countries_tags: ["en:norway"],
        image_front_url: "",
        last_modified_t: 1787184000,
        rev: 1,
        tags_sources: ["test"],
      }],
    },
  },
};

const PRICE_ENVELOPE = {
  ok: true,
  kind: "found",
  retrievedAt: "2026-08-20T00:00:00.000Z",
  barcode: "7038010055652",
  source: { id: "open_prices", sourceClass: "CROWDSOURCED PRICE OBSERVATIONS", licence: "ODbL" },
  latest: {
    id: 1,
    price: 42.9,
    currency: "NOK",
    date: "2026-08-20",
    pricePer: "UNIT",
    unitPrice: 85.8,
    unitPriceUnit: "NOK/kg",
    discounted: false,
    priceWithoutDiscount: null,
    proofId: 10,
    location: { id: 1, name: "Testbutikk", brand: "TEST", city: "Oslo", countryCode: "NO" },
    created: "2026-08-20T00:00:00Z",
  },
  observations: [],
  limitation: "Observed price only; not guaranteed current shelf price.",
};

test.describe("PICK v0.8 decision product", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/food?**", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(FOOD_ENVELOPE) }));
    await page.route("**/api/pick-price?**", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(PRICE_ENVELOPE) }));
    await page.goto("/labs/food-intelligence/pick");
  });

  test("keeps health wallet and planet separate and truth-backed", async ({ page }) => {
    await page.getByRole("button", { name: "READ PRODUCT" }).click();
    await expect(page.getByRole("heading", { name: "TEST — Lyst brød" })).toBeVisible();
    await expect(page.getByText("PREFER WHOLEGRAIN", { exact: true })).toBeVisible();
    await expect(page.getByText("RECENT OBSERVATION", { exact: true })).toBeVisible();
    await expect(page.getByText("LOWER CATEGORY BURDEN", { exact: true })).toBeVisible();
    await expect(page.getByText("No combined score.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Truth spine" })).toBeVisible();
    await expect(page.getByText("Nordic Nutrition Recommendations 2023").first()).toBeVisible();
  });

  test("surfaces controlled wholegrain upgrade without missing-data advantage", async ({ page }) => {
    await page.getByRole("button", { name: "READ PRODUCT" }).click();
    await expect(page.getByRole("heading", { name: "Same job. Better evidence." })).toBeVisible();
    await expect(page.getByText("PREFERRED CATEGORY UPGRADE", { exact: true })).toBeVisible();
    await expect(page.getByText(/Fibre: 5 g higher/)).toBeVisible();
  });

  test("basket stores observed price context rather than calling it checkout truth", async ({ page }) => {
    await page.getByRole("button", { name: "READ PRODUCT" }).click();
    await page.getByRole("button", { name: "ADD TO BASKET" }).click();
    await expect(page.getByText("42,9 NOK observed", { exact: false })).toBeVisible();
    await expect(page.getByText(/Observed basket cost is only the sum of stored price observations/)).toBeVisible();
  });

  test("mobile shop surface has one primary scanner and no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(page.getByRole("button", { name: "SCAN BARCODE" })).toHaveCount(1);
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport + 1);
    await expect(page.getByRole("button", { name: "SHOP MODE" })).toBeVisible();
  });
});
