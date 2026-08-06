import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { normalizeGtin } from "../src/food/core.js";

const registry = JSON.parse(fs.readFileSync(new URL("../data/p18-food-02-audited-seeds.json", import.meta.url), "utf8"));
const expectedCategories = ["dairy_yoghurt", "breakfast_cereals", "snacks", "beverages", "ready_meals"];

test("audited identifier registry contains 10 unique valid GTINs per category", () => {
  assert.equal(registry.registryVersion, "p18-food-audited-seeds-2026-08-06-v1");
  assert.equal(registry.provenance.workflowRun, "31057897670");
  assert.match(registry.provenance.use, /Identifier fallback only/);

  const all = [];
  for (const category of expectedCategories) {
    const seeds = registry.categories?.[category];
    assert.ok(Array.isArray(seeds), `${category} registry is missing`);
    assert.equal(seeds.length, 10, `${category} must contain exactly 10 audited identifiers`);
    for (const seed of seeds) {
      const gtin = normalizeGtin(seed.gtin);
      assert.equal(gtin.ok, true, `${category} contains invalid GTIN ${seed.gtin}`);
      assert.ok(String(seed.seedName ?? "").trim(), `${seed.gtin} is missing its audit label`);
      all.push(gtin.normalized);
    }
  }
  assert.equal(all.length, 50);
  assert.equal(new Set(all).size, 50, "audited seed identifiers must be globally unique");
});

test("registry stores identifiers only and cannot masquerade as cached live product responses", () => {
  for (const seeds of Object.values(registry.categories)) {
    for (const seed of seeds) {
      assert.deepEqual(Object.keys(seed).sort(), ["gtin", "seedBrand", "seedCategories", "seedName"].sort());
      assert.equal("nutriments" in seed, false);
      assert.equal("ingredients_text" in seed, false);
      assert.equal("retrievedAt" in seed, false);
    }
  }
});
