import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/choice/bee.ts", import.meta.url), "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const bee = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);

const policy = { minimumCriterionCoverage: 0.5, minimumIndependentEvidenceFamilies: 1 };
const criteria = [
  { id: "fit", label: "Fit" },
  { id: "safety", label: "Safety", hardConstraint: true },
];

test("missing evidence stays UNKNOWN and withholds recommendation", () => {
  const result = bee.evaluateBeeQuorum(
    [{ id: "a", label: "A" }, { id: "b", label: "B" }],
    criteria,
    [],
    policy,
  );

  assert.equal(result.status, "NO_QUORUM");
  assert.deepEqual(result.options[0].unknownCriteria.sort(), ["fit", "safety"]);
  assert.equal(bee.gateBeeRecommendation(result, "A").status, "WITHHELD");
});

test("derived repetition cannot manufacture independent corroboration", () => {
  const result = bee.evaluateBeeQuorum(
    [{ id: "a", label: "A" }, { id: "b", label: "B" }],
    [{ id: "fit", label: "Fit" }],
    [
      { id: "a1", optionId: "a", criterionId: "fit", sourceId: "source-1", independenceKey: "root-1", evidenceClass: "PRIMARY", direction: "SUPPORT", publicSafe: true },
      { id: "a2", optionId: "a", criterionId: "fit", sourceId: "summary-1", independenceKey: "root-1", evidenceClass: "DERIVED", direction: "SUPPORT", publicSafe: true },
      { id: "a3", optionId: "a", criterionId: "fit", sourceId: "summary-2", independenceKey: "root-1", evidenceClass: "DERIVED", direction: "SUPPORT", publicSafe: true },
      { id: "b1", optionId: "b", criterionId: "fit", sourceId: "source-2", independenceKey: "root-2", evidenceClass: "PRIMARY", direction: "SUPPORT", publicSafe: true },
    ],
    { minimumCriterionCoverage: 1, minimumIndependentEvidenceFamilies: 2 },
  );

  assert.equal(result.options.find((item) => item.optionId === "a").independentEvidenceFamilies, 1);
  assert.equal(result.options.find((item) => item.optionId === "a").status, "INSUFFICIENT_EVIDENCE");
  assert.equal(result.status, "NO_QUORUM");
});

test("hard constraints fail closed even when another criterion is positive", () => {
  const result = bee.evaluateBeeQuorum(
    [{ id: "a", label: "A" }, { id: "b", label: "B" }],
    criteria,
    [
      { id: "a-fit", optionId: "a", criterionId: "fit", sourceId: "fit-a", independenceKey: "fit-a", evidenceClass: "PRIMARY", direction: "SUPPORT", publicSafe: true },
      { id: "a-stop", optionId: "a", criterionId: "safety", sourceId: "safety-a", independenceKey: "safety-a", evidenceClass: "PRIMARY", direction: "STOP", publicSafe: true },
      { id: "b-fit", optionId: "b", criterionId: "fit", sourceId: "fit-b", independenceKey: "fit-b", evidenceClass: "PRIMARY", direction: "SUPPORT", publicSafe: true },
    ],
    policy,
  );

  const optionA = result.options.find((item) => item.optionId === "a");
  assert.equal(optionA.status, "HARD_STOP");
  assert.deepEqual(optionA.hardStops, ["safety"]);
});

test("recommendation eligibility requires at least two evidence-ready options", () => {
  const evidence = [
    { id: "a-fit", optionId: "a", criterionId: "fit", sourceId: "a", independenceKey: "a", evidenceClass: "PRIMARY", direction: "SUPPORT", publicSafe: true },
    { id: "b-fit", optionId: "b", criterionId: "fit", sourceId: "b", independenceKey: "b", evidenceClass: "INDEPENDENT", direction: "SUPPORT", publicSafe: true },
  ];
  const result = bee.evaluateBeeQuorum(
    [{ id: "a", label: "A" }, { id: "b", label: "B" }],
    [{ id: "fit", label: "Fit" }],
    evidence,
    { minimumCriterionCoverage: 1, minimumIndependentEvidenceFamilies: 1 },
  );

  assert.equal(result.status, "QUORUM");
  assert.deepEqual(result.readyOptionIds.sort(), ["a", "b"]);
  assert.equal(bee.gateBeeRecommendation(result, "A").status, "RECOMMENDATION_ELIGIBLE");
});
