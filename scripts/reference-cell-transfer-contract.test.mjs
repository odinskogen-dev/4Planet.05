import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/planet/proofs/planetProofs.ts", import.meta.url), "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const proofs = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);

const oslo = proofs.OSLOFJORD_PROOF;
const gbr = proofs.GREAT_BARRIER_REEF_TRANSFER;
const ids = (proof) => proof.sections.map((section) => section.id);

test("Super Cell keeps stable route identity while bounding product to Bunnefjorden", () => {
  assert.equal(oslo.slug, "oslofjorden");
  assert.equal(oslo.name, "Bunnefjorden");
  assert.match(oslo.oneLine, /bounded|microcosm/i);
  assert.match(oslo.truthBoundary, /bounded Reference Cell/i);
  assert.match(oslo.truthBoundary, /not.*ecological border/i);
});

test("Bunnefjorden binds the measured NIVA intervention without inflating impact", () => {
  const niva = oslo.sources.find((source) => source.id === "niva-bunnefjorden-2025");
  assert.ok(niva);
  assert.match(niva.url, /niva\.no\/publikasjoner/);
  const changed = oslo.sections.find((section) => section.id === "WHAT_CHANGED");
  assert.ok(changed);
  const text = [changed.headline, changed.summary, ...changed.facts].join(" ");
  assert.match(text, /45 m/);
  assert.match(text, /137 m/);
  assert.match(text, /82%/);
  assert.match(text, /not equivalent|not.*impact|not.*biodiversity/i);
});

test("GBR transfers the exact human reading grammar without copying Bunnefjorden sources", () => {
  assert.deepEqual(ids(gbr), ids(oslo));
  assert.equal(ids(gbr).length, 8);
  assert.ok(gbr.sources.some((source) => source.id === "aims-2026"));
  assert.ok(gbr.sources.some((source) => source.id === "noaa-crw"));
  assert.equal(gbr.sources.some((source) => source.id.startsWith("niva-")), false);
});

test("GBR transfer audit exposes REUSED / ADAPTED / NEW instead of claiming invisible reuse", () => {
  const audit = gbr.transferAudit;
  assert.ok(audit);
  assert.equal(audit.basis, "STRUCTURAL_COMPONENT_CLASSIFICATION");
  assert.ok(audit.reused.length > 0);
  assert.ok(audit.adapted.length > 0);
  assert.ok(audit.netNew.length > 0);
  assert.equal(audit.structuralReuseRatio, 0.5);
  assert.equal(audit.founderMinutes, null);
  assert.equal(audit.elapsedBuildMinutes, null);
  assert.match(audit.qualityState, /HUMAN_GOLD_UNPROVEN/);
});

test("transfer evidence remains truth-bounded", () => {
  assert.match(gbr.truthBoundary, /regional coral-cover estimates do not describe every reef/i);
  assert.match(gbr.truthBoundary, /heat stress is a pressure signal/i);
  const state = gbr.sections.find((section) => section.id === "WHAT_IS_HAPPENING");
  assert.ok(state?.sourceIds.includes("aims-2026"));
  assert.ok(state?.sourceIds.includes("noaa-crw"));
});
