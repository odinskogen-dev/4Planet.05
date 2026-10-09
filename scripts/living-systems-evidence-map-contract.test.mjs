import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/pages/v5/PlanetProof.tsx", import.meta.url), "utf8");

test("Living Systems does not call evidence ready from the base-map load event", () => {
  const loadBody = source.slice(source.indexOf('m.on("load"'), source.indexOf('m.on("sourcedata"'));
  assert.match(loadBody, /setBaseReady\(true\)/);
  assert.doesNotMatch(loadBody, /setEvidenceReady\(true\)/);
  assert.match(source, /m\.isSourceLoaded\(id\)/);
  assert.match(source, /m\.on\("sourcedata", refreshEvidenceReady\)/);
});

test("failed or delayed evidence cannot retain a prior ready state", () => {
  assert.match(source, /setDegraded\(true\);\s*setEvidenceReady\(false\)/s);
  assert.match(source, /MAP · BASE READY · EVIDENCE LOADING/);
  assert.match(source, /MAP · EVIDENCE DEGRADED/);
});

test("proof transitions reset map truth and layer selection", () => {
  assert.match(source, /const nextActive = initialLayerState\(proof\)/);
  assert.match(source, /activeRef\.current = nextActive/);
  assert.match(source, /setDegraded\(false\)/);
  assert.match(source, /setBaseReady\(false\)/);
  assert.match(source, /setEvidenceReady\(false\)/);
  assert.match(source, /\}, \[proof\.slug\]\)/);
});

test("layer toggles invalidate evidence readiness and expose pressed state", () => {
  assert.match(source, /const toggle = \(layer: ProofMapLayer\).*setEvidenceReady\(false\)/s);
  assert.match(source, /aria-pressed=\{active\[layer\.id\]\}/);
  assert.match(source, /setLayoutProperty\(id, "visibility"/);
});


test("a WebGL constructor failure preserves the sourced page and disables map controls", () => {
  assert.match(source, /try \{\s*m = new maplibregl\.Map/s);
  assert.match(source, /catch \{[\s\S]*setMapUnavailable\(true\)/);
  assert.match(source, /MAP · UNAVAILABLE/);
  assert.match(source, /disabled=\{mapUnavailable\}/);
  assert.match(source, /The sourced Living Systems reading remains available below/);
});


test("zero active evidence layers fail closed in the product helper", () => {
  const helperStart = source.indexOf("export function evidenceSourcesReady");
  const helperEnd = source.indexOf("function EvidenceMap", helperStart);
  assert.notEqual(helperStart, -1);
  assert.notEqual(helperEnd, -1);
  const helperSource = source.slice(helperStart, helperEnd);
  const compiled = ts.transpileModule(helperSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const sandbox = { exports: {} };
  vm.runInNewContext(compiled, sandbox);
  const ready = sandbox.exports.evidenceSourcesReady;

  assert.equal(ready([], () => ({}), () => true), false);
  assert.equal(ready(["proof-depth"], () => undefined, () => true), false);
  assert.equal(ready(["proof-depth"], () => ({}), () => false), false);
  assert.equal(ready(["proof-depth"], () => ({}), () => true), true);
});
