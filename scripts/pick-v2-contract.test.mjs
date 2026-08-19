import assert from "node:assert/strict";
import { normaliseProduct } from "../src/food/core.js";
import { evaluateHealth } from "../src/food/pick-health.js";
import { compareHealthAlternative, rankPickAlternatives } from "../src/food/pick-compare.js";
import { evaluatePlanet } from "../src/food/pick-planet.js";
import { normaliseWalletEnvelope, unknownWallet } from "../src/food/pick-wallet.js";
import { basketSummary, makeBasketItem } from "../src/food/pick-basket.js";
import { buildDecisionAxes } from "../src/food/pick-core.js";

const nutrientBase = {
  "energy-kcal_100g": 230,
  fat_100g: 2,
  "saturated-fat_100g": 0.4,
  carbohydrates_100g: 42,
  sugars_100g: 2,
  fiber_100g: 3,
  proteins_100g: 8,
  salt_100g: 0.8,
  sodium_100g: 0.32,
};

function product({ code, name, categories, nutrients = nutrientBase, ingredients = "Test ingredients" }) {
  return normaliseProduct({
    code,
    product_name: name,
    brands: "PICK Contract",
    quantity: "500 g",
    ingredients_text: ingredients,
    allergens_tags: [],
    traces_tags: [],
    nutriments: nutrients,
    categories_tags: categories,
    countries_tags: ["en:norway"],
    image_front_url: "https://example.invalid/product.png",
    last_modified_t: 1787184000,
    rev: 1,
    tags_sources: ["contract"],
  }, { requestedGtin: code, sourceRef: { sourceId: "contract", apiVersion: "test", schemaVersion: 1, endpoint: "contract://product", retrievedAt: new Date().toISOString(), licence: {} } });
}

const processedMeat = product({ code: "7048840000128", name: "Kokt skinke", categories: ["en:foods", "en:processed-meats", "en:hams"] });
assert.equal(evaluateHealth(processedMeat).state, "STRONG LIMIT", "processed meat must carry a strong limit signal");
assert.equal(evaluateHealth(processedMeat).confidence, "HIGH");

const refinedBread = product({
  code: "7048840000135",
  name: "Lyst brød",
  categories: ["en:foods", "en:breads"],
  nutrients: { ...nutrientBase, fiber_100g: 2.2, salt_100g: 0.9, sodium_100g: 0.36 },
});
const wholegrainBread = product({
  code: "7048840000142",
  name: "Fullkorn brød",
  categories: ["en:foods", "en:breads", "en:wholegrain-breads"],
  nutrients: { ...nutrientBase, fiber_100g: 7.4, salt_100g: 0.7, sodium_100g: 0.28 },
});
assert.equal(evaluateHealth(wholegrainBread).state, "GOOD EVERYDAY FIT");
const upgrade = compareHealthAlternative(refinedBread, wholegrainBread);
assert.equal(upgrade.eligible, true, "refined to wholegrain must be a controlled functional upgrade");
assert.equal(upgrade.relation, "CONTROLLED UPGRADE");
assert.equal(upgrade.state, "PREFERRED CATEGORY UPGRADE");

const incompleteWholegrain = product({
  code: "7048840000159",
  name: "Fullkorn brød uten fibertall",
  categories: ["en:foods", "en:breads", "en:wholegrain-breads"],
  nutrients: { "energy-kcal_100g": 230, sugars_100g: 2, proteins_100g: 8, salt_100g: 0.7, sodium_100g: 0.28 },
});
const incompleteUpgrade = compareHealthAlternative(refinedBread, incompleteWholegrain);
assert.notEqual(incompleteUpgrade.state, "BETTER ON CONTROLLED COMPOSITION", "missing fibre may not manufacture a composition win");
assert.match(incompleteUpgrade.state, /PARTIAL COMPOSITION DATA/);

const ranked = rankPickAlternatives(refinedBread, [incompleteWholegrain, wholegrainBread]);
assert.equal(ranked[0].product.gtin, wholegrainBread.gtin, "complete controlled upgrade must rank ahead of incomplete alternative");

const planet = evaluatePlanet(wholegrainBread);
assert.equal(planet.directness, "CATEGORY PROXY");
assert.equal(planet.exactSkuFootprint, false, "category LCA context must never become a fake SKU footprint");
assert.equal(planet.state, "LOWER CATEGORY BURDEN");

const recentDate = new Date().toISOString().slice(0, 10);
const wallet = normaliseWalletEnvelope({
  kind: "found",
  source: { id: "open_prices", sourceClass: "CROWDSOURCED PRICE OBSERVATIONS" },
  latest: { price: 42.9, currency: "NOK", date: recentDate, unitPrice: 85.8, unitPriceUnit: "NOK/kg", location: { brand: "TEST STORE", city: "Oslo" } },
  limitation: "Observed price only",
});
assert.equal(wallet.directness, "OBSERVED PRICE");
assert.ok(wallet.observation, "observed price must remain attached to source context");
const stale = normaliseWalletEnvelope({
  kind: "found",
  source: { id: "open_prices" },
  latest: { price: 39, currency: "NOK", date: "2020-01-01", unitPrice: 78, unitPriceUnit: "NOK/kg", location: {} },
});
assert.equal(stale.state, "STALE OBSERVATION");
assert.equal(stale.confidence, "LIMITED");
assert.equal(unknownWallet().state, "UNKNOWN");

const axesWithPrice = buildDecisionAxes(wholegrainBread, { wallet, planet });
assert.equal(axesWithPrice.find((axis) => axis.id === "health")?.state, "GOOD EVERYDAY FIT");
assert.equal(axesWithPrice.find((axis) => axis.id === "wallet")?.directness, "OBSERVED PRICE");
assert.equal(axesWithPrice.find((axis) => axis.id === "planet")?.directness, "CATEGORY PROXY");

const pricedItem = makeBasketItem(wholegrainBread, axesWithPrice, { wallet });
const unknownAxes = buildDecisionAxes(refinedBread, { wallet: unknownWallet(), planet: evaluatePlanet(refinedBread) });
const unknownItem = makeBasketItem(refinedBread, unknownAxes, { wallet: unknownWallet() });
const summary = basketSummary([pricedItem, unknownItem]);
assert.equal(summary.pricedItems, 1);
assert.equal(summary.priceObservationCoverage, 50);
assert.equal(summary.observedBasketPrice, 42.9);
assert.equal(summary.unknownWallet, 1, "missing wallet data remains unknown rather than neutral/favourable");

console.log("PICK v2 contracts: PASS");
