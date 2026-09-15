import test from "node:test";
import assert from "node:assert/strict";

import { buildDecisionAxes, unknownAxis } from "../src/food/pick-core.js";
import { evaluatePlanet, comparePlanet } from "../src/food/pick-planet.js";
import { normaliseWalletEnvelope, unknownWallet } from "../src/food/pick-wallet.js";
import { rankPickAlternatives } from "../src/food/pick-compare.js";

const product = (overrides = {}) => ({
  gtin: "0001",
  name: "Bread",
  categoryTags: ["en:breads"],
  nutrients: { fibre: 2, salt: 1 },
  dataQuality: { state: "usable", completeness: 0.8, conflicts: [], missingFields: [] },
  sourceRef: { sourceId: "open_food_facts", retrievedAt: "2026-08-28T12:00:00Z" },
  ...overrides,
});

test("FOOD-4 keeps HEALTH, WALLET and PLANET as separate decision axes", () => {
  const axes = buildDecisionAxes(product());
  assert.deepEqual(axes.map((axis) => axis.label), ["HEALTH", "WALLET", "PLANET"]);
  assert.equal(axes.find((axis) => axis.id === "wallet").state, "UNKNOWN");
  assert.match(axes.find((axis) => axis.id === "wallet").limitation, /cannot improve rank/i);
});

test("UNKNOWN is fail-closed rather than a positive signal", () => {
  const axis = unknownAxis("wallet", "WALLET", "No observation");
  assert.equal(axis.state, "UNKNOWN");
  assert.equal(axis.confidence, "UNKNOWN");
  assert.equal(axis.directness, "NONE");
  assert.deepEqual(axis.evidence, []);
  assert.match(axis.limitation, /cannot improve rank/i);

  const wallet = unknownWallet();
  assert.equal(wallet.state, "UNKNOWN");
  assert.equal(wallet.observation, null);
  assert.match(wallet.limitation, /cannot improve rank/i);
});

test("observed WALLET data is not represented as a current checkout-price guarantee", () => {
  const wallet = normaliseWalletEnvelope({
    kind: "found",
    latest: {
      price: 49.9,
      unitPrice: 99.8,
      unitPriceUnit: "NOK/kg",
      date: "2020-01-01",
      location: { brand: "Example store", city: "Oslo" },
    },
    limitation: "Observed price is not guaranteed to match the user's current shelf price.",
    source: { id: "open-prices" },
  });
  assert.equal(wallet.state, "STALE OBSERVATION");
  assert.equal(wallet.confidence, "LIMITED");
  assert.match(wallet.limitation, /not guaranteed/i);
});

test("PLANET category evidence never becomes SKU-specific truth", () => {
  const proxy = evaluatePlanet(product({ name: "Wholegrain bread", categoryTags: ["en:wholegrain-breads"] }));
  assert.equal(proxy.directness, "CATEGORY PROXY");
  assert.equal(proxy.exactSkuFootprint, false);
  assert.match(proxy.limitation, /not.*SKU|SKU.*not|product level|brand winner/i);

  const comparison = comparePlanet(proxy, proxy);
  assert.equal(comparison.known, false);
  assert.match(comparison.explanation, /No SKU-level planet winner/i);
});

test("missing comparable evidence cannot outrank a more complete equivalent alternative", () => {
  const baseline = product({ gtin: "base", nutrients: { fibre: 2, salt: 1 }, dataQuality: { state: "usable", completeness: 1, conflicts: [] } });
  const complete = product({ gtin: "complete", nutrients: { fibre: 2, salt: 1 }, dataQuality: { state: "usable", completeness: 0.95, conflicts: [] } });
  const sparse = product({ gtin: "sparse", nutrients: { fibre: 2 }, dataQuality: { state: "usable", completeness: 0.4, conflicts: [], missingFields: ["salt"] } });

  const ranked = rankPickAlternatives(baseline, [sparse, complete]);
  assert.equal(ranked[0].product.gtin, "complete");
  assert.equal(ranked[1].product.gtin, "sparse");
});
