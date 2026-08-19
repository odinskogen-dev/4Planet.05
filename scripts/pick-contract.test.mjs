import assert from "node:assert/strict";
import { buildDecisionAxes, buildTruthPassport, PICK_MODEL_VERSION } from "../src/food/pick-core.js";
import { addBasketItem, basketSummary, makeBasketItem } from "../src/food/pick-basket.js";
import { availableMealPatterns, nextHouseholdAction, shopSummary, toggleNeed } from "../src/food/pick-household.js";

const product = {
  gtin: "7038010055652",
  name: "Test yoghurt",
  brand: "Test",
  quantity: "500 g",
  ingredientsText: "Milk",
  nutrients: { energyKcal: 60, sugars: 4, salt: 0.1, protein: 4, fat: 3, fibre: 0 },
  comparisonCategory: "plain-yogurt",
  sourceComparisonCategory: "en:plain-yogurts",
  dataQuality: { confidence: "high", completeness: 1, missingFields: [], conflicts: [] },
  sourceRef: { sourceId: "open_food_facts", apiVersion: "v3", endpoint: "/api/food", retrievedAt: new Date().toISOString(), licence: { database: "ODbL" } },
};

assert.equal(PICK_MODEL_VERSION, "p18-pick-0.2.0");
const axes = buildDecisionAxes(product);
assert.equal(axes.find((axis) => axis.id === "health")?.state, "COMPOSITION READABLE");
assert.equal(axes.find((axis) => axis.id === "wallet")?.state, "UNKNOWN");
assert.equal(axes.find((axis) => axis.id === "planet")?.state, "UNKNOWN");
assert.match(axes.find((axis) => axis.id === "health")?.summary ?? "", /No health verdict/);

const passport = buildTruthPassport(product);
assert.equal(passport.source.class, "COMMUNITY PRODUCT DATABASE");
assert.equal(passport.facts.find((fact) => fact.id === "price")?.available, false);
assert.equal(passport.facts.find((fact) => fact.id === "planet")?.available, false);

const basket = addBasketItem([], makeBasketItem(product, axes));
const summary = basketSummary(basket);
assert.equal(summary.total, 1);
assert.equal(summary.walletCoverage, 0);
assert.equal(summary.planetCoverage, 0);
assert.match(summary.rule, /never counted as favourable/);

let shop = {};
shop = toggleNeed(shop, "produce");
shop = toggleNeed(shop, "starch");
shop = toggleNeed(shop, "legumes");
assert.equal(shopSummary(shop).mealBaseReady, true);
assert.ok(availableMealPatterns(shop).length >= 1);
assert.match(nextHouseholdAction(shop, summary), /Wallet evidence is incomplete/);

console.log("PICK contracts: PASS");
