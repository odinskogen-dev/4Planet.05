import assert from "node:assert/strict";
import test from "node:test";
import { normaliseProduct } from "../src/food/core.js";
import { classifyProductRelation } from "../src/food/category-control.js";

const base = {
  brands: "P18 Fixture",
  quantity: "500 g",
  ingredients_text: "Test ingredients.",
  allergens_tags: [],
  countries_tags: ["en:norway"],
  image_front_url: "fixture://image",
  nutriments: { "energy-kcal_100g": 100, sugars_100g: 5, salt_100g: 0.1, proteins_100g: 4 },
};

test("yoghourt spelling remains a controlled plain-yoghurt identity", () => {
  const product = normaliseProduct({
    ...base,
    code: "7038010055652",
    product_name: "Naturell Yoghourt",
    categories_tags: ["en:foods", "en:yogurts", "en:plain-yogurts"],
  });
  assert.equal(product.comparisonCategory, "plain_yoghurt");
});

test("Greek salted-caramel yoghurt is flavoured rather than plain", () => {
  const plainGreek = normaliseProduct({
    ...base,
    code: "7034281586000",
    product_name: "Gresk yogurt Naturell 2% Fett",
    categories_tags: ["en:foods", "en:yogurts", "en:plain-yogurts", "en:greek-style-yogurts"],
  });
  const caramel = normaliseProduct({
    ...base,
    code: "7048840000258",
    product_name: "Gourmet Yoghurt Salted Caramel",
    categories_tags: ["en:foods", "en:yogurts", "en:plain-yogurts", "en:greek-style-yogurts"],
  });
  assert.equal(plainGreek.comparisonCategory, "greek_plain_yoghurt");
  assert.equal(caramel.comparisonCategory, "flavoured_yoghurt");
  assert.equal(classifyProductRelation(plainGreek, caramel).kind, "adjacent");
});

test("Pizza Hot Nacho remains frozen pizza, not tortilla chips", () => {
  const product = normaliseProduct({
    ...base,
    code: "7048840000265",
    product_name: "Pizza Hot Nacho",
    categories_tags: ["en:foods", "en:meals", "en:pizzas", "en:frozen-foods", "en:frozen-pizzas"],
  });
  assert.equal(product.comparisonCategory, "frozen_pizza");
  assert.equal(product.comparisonFamily, "ready_meal");
});
