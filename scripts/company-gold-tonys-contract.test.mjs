import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const data = readFileSync(new URL("../src/data/companyGoldTony.ts", import.meta.url), "utf8");
const drawer = readFileSync(new URL("../src/pages/integrated/CompanyGoldTony.tsx", import.meta.url), "utf8");

test("AUTO-PROOF-01A materialises the exact company/product/material slice", () => {
  assert.match(data, /company:tonys-chocolonely/);
  assert.match(data, /product:tonys:milk-chocolate-32-180g/);
  assert.match(data, /8717677339914/);
  for (const material of ["material:sugar", "material:dried-whole-milk", "material:cocoa-butter", "material:cocoa-mass", "material:soy-lecithin"]) {
    assert.match(data, new RegExp(material));
  }
});

test("source provenance is explicit and first-party", () => {
  assert.match(data, /uk\.tonyschocolonely\.com\/products\/milk-chocolate-32-180g/);
  assert.match(data, /tonyschocolonely\.com\/pages\/tonys-impact/);
  assert.match(data, /tonyschocolonely\.com\/en\/pages\/bean-tracker/);
  assert.match(data, /SOURCE TERMS \/ REFERENCE ONLY/);
  assert.match(data, /rightsStatus: "CONDITIONAL"/);
});

test("company-level cocoa traceability cannot silently become bar-level origin truth", () => {
  assert.match(data, /productSpecificCooperative: null/);
  assert.match(data, /productSpecificFarm: null/);
  assert.match(data, /productSpecificContainerOrBatch: null/);
  assert.match(data, /does not identify the cooperative, farm, container or batch used in this specific retail bar/);
  assert.match(data, /UNKNOWN: exact cooperative\/farm\/batch for this retail bar/);
});

test("drawer reads the same shared objects and stays internal/noindex", () => {
  assert.match(drawer, /TONYS_COMPANY_GOLD/);
  assert.match(drawer, /noindex,nofollow,noarchive/);
  assert.match(drawer, /UNKNOWN PRESERVED/);
  assert.match(drawer, /Next evidence decision/);
});
