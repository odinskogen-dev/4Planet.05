import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalJson,
  normalizeGtin,
  normaliseSourceEnvelope,
  rankAlternatives,
} from "../src/food/core.js";
import { FOOD_FIXTURES } from "../src/food/fixtures.js";

test("validates GTIN check digits", () => {
  assert.deepEqual(normalizeGtin("7038010055652"), { ok: true, normalized: "7038010055652", error: null });
  assert.equal(normalizeGtin("7038010055653").error, "invalid_check_digit");
  assert.equal(normalizeGtin("123").error, "invalid_length");
});

test("normalises the well-covered fixture and preserves provenance", () => {
  const result = normaliseSourceEnvelope(FOOD_FIXTURES.complete.envelope);
  assert.equal(result.state, "found");
  assert.equal(result.product.gtin, "7038010055652");
  assert.equal(result.product.comparisonCategory, "en:yogurts");
  assert.equal(result.product.sourceRef.sourceId, "open_food_facts");
  assert.equal(result.alternatives.length, 5);
});

test("keeps incomplete data explicit", () => {
  const result = normaliseSourceEnvelope(FOOD_FIXTURES.incomplete.envelope);
  assert.equal(result.state, "found");
  assert.equal(result.product.dataQuality.state, "incomplete");
  assert.ok(result.product.dataQuality.missingFields.includes("ingredients"));
  assert.ok(result.product.dataQuality.missingFields.includes("allergens"));
});

test("separates unknown barcode and source failure", () => {
  assert.equal(normaliseSourceEnvelope(FOOD_FIXTURES.unknown.envelope).state, "not_found");
  assert.equal(normaliseSourceEnvelope(FOOD_FIXTURES.sourceError.envelope).state, "source_error");
});

test("detects identity and nutrition conflicts", () => {
  const result = normaliseSourceEnvelope(FOOD_FIXTURES.conflict.envelope);
  assert.equal(result.state, "found");
  assert.equal(result.product.dataQuality.state, "conflicted");
  assert.ok(result.product.dataQuality.conflicts.includes("source_gtin_mismatch"));
  assert.ok(result.product.dataQuality.conflicts.includes("salt_sodium_inconsistent"));
});

test("enforces allergens before ranking", () => {
  const result = normaliseSourceEnvelope(FOOD_FIXTURES.complete.envelope);
  const ranked = rankAlternatives(result.product, result.alternatives, { avoidAllergens: ["milk"], lowerSugar: true });
  assert.equal(ranked.eligible.length, 1);
  assert.equal(ranked.eligible[0].product.name, "TEST RECORD — Yoghurt C");
  assert.equal(ranked.excluded.length, 4);
});

test("missing nutrition never gains an ordering advantage", () => {
  const result = normaliseSourceEnvelope(FOOD_FIXTURES.complete.envelope);
  const missing = {
    ...result.alternatives[0],
    gtin: "7048840000173",
    id: "gtin:7048840000173",
    name: "TEST RECORD — Missing sugar",
    nutrients: { ...result.alternatives[0].nutrients, sugars: null },
  };
  const known = result.alternatives[1];
  const ranked = rankAlternatives(result.product, [missing, known], { lowerSugar: true });
  assert.equal(ranked.eligible[0].product.gtin, known.gtin);
  assert.equal(ranked.eligible[1].knownCount, 0);
  assert.equal(ranked.eligible[1].favourableCount, 0);
});

test("ordering is deterministic and emits no universal product score", () => {
  const result = normaliseSourceEnvelope(FOOD_FIXTURES.complete.envelope);
  const first = rankAlternatives(result.product, result.alternatives, { lowerSugar: true, higherProtein: true });
  const second = rankAlternatives(result.product, [...result.alternatives].reverse(), { lowerSugar: true, higherProtein: true });
  assert.deepEqual(first.eligible.map((item) => item.product.gtin), second.eligible.map((item) => item.product.gtin));
  assert.equal("score" in first.eligible[0], false);
});

test("keeps a found product distinct from an alternative-source failure", () => {
  const envelope = structuredClone(FOOD_FIXTURES.complete.envelope);
  envelope.alternatives = {
    kind: "source_error",
    httpStatus: 503,
    categoryTag: "en:yogurts",
    message: "Fixture alternative search unavailable",
    raw: { products: [] },
    rawEnvelopeMeta: { attempts: [{ httpStatus: 503 }] },
  };
  const result = normaliseSourceEnvelope(envelope);
  assert.equal(result.state, "found");
  assert.equal(result.alternativeState, "source_error");
  assert.equal(result.alternatives.length, 0);
  assert.equal(result.alternativeAttempts.length, 1);
});

test("canonical JSON is stable across key order", () => {
  assert.equal(canonicalJson({ b: 1, a: { d: 2, c: 3 } }), canonicalJson({ a: { c: 3, d: 2 }, b: 1 }));
});
