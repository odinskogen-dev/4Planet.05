import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const repoRoot = process.cwd();
const handoffSource = fs.readFileSync(path.join(repoRoot, "src/pages/sapiens/foodSpeciesHandoff.ts"), "utf8");
const captureSource = fs.readFileSync(path.join(repoRoot, "src/pages/sapiens/FoodCapture.tsx"), "utf8");
const labSource = fs.readFileSync(path.join(repoRoot, "src/pages/integrated/SpeciesEngineLab.tsx"), "utf8");

const runtime = ts.transpileModule(handoffSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const sandbox = { exports: {}, module: { exports: {} }, URLSearchParams };
sandbox.module.exports = sandbox.exports;
vm.runInNewContext(runtime, sandbox);
const { buildFoodSpeciesHandoffHref, parseFoodSpeciesHandoff } = sandbox.module.exports;

const choices = [
  "Malus domestica",
  "Solanum lycopersicum",
  "Triticum aestivum",
  "Fragaria × ananassa",
];

test("four FOOD manual picks produce distinct reload-safe SPECIES identities", () => {
  const hrefs = choices.map(buildFoodSpeciesHandoffHref);
  assert.equal(new Set(hrefs).size, 4);
  assert.deepEqual(
    hrefs.map((href) => parseFoodSpeciesHandoff(new URL(href, "https://4planet.org").search)?.scientificName),
    choices,
  );
  assert.ok(hrefs.every((href) => href.startsWith("/species/lab?")));
});

test("malformed or foreign handoffs fail closed", () => {
  assert.equal(parseFoodSpeciesHandoff(""), null);
  assert.equal(parseFoodSpeciesHandoff("?source=s4piens-food&rank=species"), null);
  assert.equal(parseFoodSpeciesHandoff("?source=s4piens-food&rank=genus&scientificName=Malus"), null);
  assert.equal(parseFoodSpeciesHandoff("?source=unknown&rank=species&scientificName=Malus%20domestica"), null);
  assert.equal(parseFoodSpeciesHandoff("?source=s4piens-food&rank=species&scientificName=%3Cscript%3E"), null);
});

test("existing components consume the handoff without replacing routes or keyboard-native links", () => {
  assert.match(captureSource, /<Link[\s\S]*to=\{buildFoodSpeciesHandoffHref\(item\.scientificName\)\}/);
  assert.match(labSource, /parseFoodSpeciesHandoff\(location\.search\)/);
  assert.match(labSource, /run\(handoff\.scientificName, handoff\.rank\)/);
  assert.match(labSource, /HANDOFF UNKNOWN/);
});
