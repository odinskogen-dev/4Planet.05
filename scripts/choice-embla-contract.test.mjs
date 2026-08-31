import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/choice/embla.ts", import.meta.url), "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const embla = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);

test("FOOD routes into the decision-first evidence proof without claiming a universal answer", () => {
  const result = embla.resolveEmblaIntake("Which of these groceries is the better choice for me?");
  assert.equal(result.domain, "FOOD");
  assert.equal(result.status, "EVIDENCE_PATH_READY");
  assert.equal(result.nextHref, "/4sapien/food/choose");
  assert.match(result.title, /what matters most/i);
  assert.match(result.truthBoundary, /not a universal answer/i);
  assert.match(result.truthBoundary, /do not yet support category-wide ranking/i);
});

test("ten realistic FOOD decisions all enter the same bounded human-choice gate", () => {
  const prompts = [
    "Which milk is the better choice for me?",
    "I want a coffee with less sugar if possible",
    "Which butter should I buy if I care about salt?",
    "Help me compare two grocery products",
    "What should I eat for this meal?",
    "Can you help with my shopping list?",
    "I scanned a barcode and want a better alternative",
    "Which food product is cheaper and still reasonable?",
    "Which milk has the better planetary trade-off?",
    "I need groceries but I do not want a fake sustainability score",
  ];
  for (const prompt of prompts) {
    const result = embla.resolveEmblaIntake(prompt);
    assert.equal(result.domain, "FOOD", prompt);
    assert.equal(result.status, "EVIDENCE_PATH_READY", prompt);
    assert.equal(result.nextHref, "/4sapien/food/choose", prompt);
  }
});

test("Embla 02 parses the first controlled shopping categories without pretending unsupported categories are ready", () => {
  const items = embla.parseEmblaShoppingList("Kaffe\nmelk; smør, pasta");
  assert.equal(items.length, 4);
  assert.deepEqual(items.slice(0, 3).map((item) => item.category), ["COFFEE", "MILK", "BUTTER"]);
  assert.ok(items.slice(0, 3).every((item) => item.status === "EVIDENCE_PATH_READY"));
  assert.equal(items[3].supported, false);
  assert.equal(items[3].status, "NOT_COVERED_YET");
  assert.deepEqual(embla.summariseEmblaShoppingList(items), { total: 4, supported: 3, unsupported: 1 });
});

test("HOME and CAR fail closed while their evidence adapters are absent", () => {
  const home = embla.resolveEmblaIntake("Can I afford this home?");
  const car = embla.resolveEmblaIntake("What car makes sense over five years?");
  assert.equal(home.status, "INTAKE_ONLY");
  assert.equal(car.status, "INTAKE_ONLY");
  assert.equal(home.nextHref, undefined);
  assert.equal(car.nextHref, undefined);
  assert.match(home.truthBoundary, /missing evidence/i);
  assert.match(car.truthBoundary, /withholds a recommendation/i);
});

test("finance remains analysis-only and does not produce trading instructions", () => {
  const result = embla.resolveEmblaIntake("Help me understand this investment case.");
  assert.equal(result.domain, "FINANCE");
  assert.equal(result.status, "INTAKE_ONLY");
  assert.equal(result.nextHref, "/4sapien/finance");
  assert.match(result.truthBoundary, /No personalised trading instruction/i);
  assert.match(result.truthBoundary, /no BUY \/ SELL recommendation/i);
});

test("unrecognised decisions remain intake-only rather than fabricated", () => {
  const result = embla.resolveEmblaIntake("Which path should I take?");
  assert.equal(result.domain, "GENERAL");
  assert.equal(result.status, "INTAKE_ONLY");
  assert.match(result.truthBoundary, /No evidence quorum/i);
  assert.match(result.truthBoundary, /UNKNOWN remains UNKNOWN/i);
});
