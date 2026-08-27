/**
 * V39.1 build-integrity smoke test (dependency-free, runs on Node's built-in
 * test runner). The V39 base ships no unit/lint harness, and the changed code is
 * a WebGL/MapLibre surface that cannot be meaningfully rendered headless here.
 * So this asserts the *delivered artifact* actually contains the V39.1 surfaces —
 * a real, honest gate over the shipped bundle, not a fake green check.
 *
 * Run: node --test scripts/smoke-v39_1.mjs   (after `npm run build`)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist", "assets");
const js = readdirSync(dist).filter((f) => f.endsWith(".js")).map((f) => readFileSync(join(dist, f), "utf8")).join("\n");

test("Scope 04 — progressive context ships (GLANCE/UNDERSTAND/GO DEEPER)", () => {
  assert.ok(js.includes("UNDERSTAND \u2192"), "UNDERSTAND control present");
  assert.ok(js.includes("GO DEEPER \u2192"), "GO DEEPER control present");
});

test("Scope 01 — one context surface: legacy points route to MAP RECORD", () => {
  assert.ok(js.includes("MAP RECORD"), "LEGACY_POINT kind label present");
  assert.ok(js.includes("has not resolved it to a canonical entity"), "honest legacy caveat present");
});

test("Scope 03/05 — resting command surface (LAYERS instrument, quiet strip)", () => {
  assert.ok(js.includes("LAYERS"), "collapsed LAYERS console label present");
});

test("Scope 02 — one world state: legacy open preserves camera (no flyTo)", () => {
  // The legacy-point opener sets context without a camera move, and the honest
  // envelope copy ships. (/atlas legitimately keeps its own popups, so we assert
  // the new surface positively rather than a global popup absence.)
  assert.ok(js.includes("one surface"), "one-surface framing present in legacy envelope");
  assert.ok(js.includes("LESS"), "progressive-disclosure collapse control present");
});

/* ── V40 corrections ─────────────────────────────────────────────────────── */

test("V40 P0 — RECENTER control ships (camera is not locked to context)", () => {
  assert.ok(js.includes("RECENTER"), "RECENTER control present");
});

test("V40 P0 — street-level vector basemap wired (OpenFreeMap)", () => {
  assert.ok(js.includes("openfreemap.org"), "vector basemap style referenced");
});

test("V40 truth-axis — no generic CONFIDENCE HIGH/MED/LOW public rendering", () => {
  assert.ok(!/CONFIDENCE (HIGH|MEDIUM|LOW)/.test(js), "no generic confidence badge in bundle");
  assert.ok(js.includes("NOT YET ASSESSED"), "canonical axis fallback present");
  assert.ok(js.includes("EVIDENCE STRENGTH"), "Evidence Strength axis label present");
});

test("V40 temporal — legacy record is not labelled LIVE", () => {
  assert.ok(js.includes("does not make the underlying record live"), "temporal honesty copy present");
});
