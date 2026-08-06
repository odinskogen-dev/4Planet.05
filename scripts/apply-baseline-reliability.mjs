import fs from "node:fs";

const corePath = "src/food/core.js";
let core = fs.readFileSync(corePath, "utf8");
core = core.replace(
  'export const COMPARISON_MODEL_VERSION = "p18-food-comparison-0.2.0";',
  'export const COMPARISON_MODEL_VERSION = "p18-food-comparison-0.2.1";',
);

const oldBaseline = `  const baselineControlled = Boolean(baseline?.categoryControl?.profileId);
  const limitations = baselineControlled ? [] : ["The scanned product has no controlled direct-substitute group, so alternatives cannot be ranked fairly"];
`;
const newBaseline = `  const baselineControlled = Boolean(baseline?.categoryControl?.profileId);
  const baselineReliable = !["malformed", "conflicted"].includes(baseline?.dataQuality?.state);
  const canRank = baselineControlled && baselineReliable;
  const limitations = [
    ...(baselineControlled ? [] : ["The scanned product has no controlled direct-substitute group, so alternatives cannot be ranked fairly"]),
    ...(baselineReliable ? [] : ["The scanned product record is conflicted or malformed, so alternatives cannot be ranked fairly"]),
  ];
`;
if (!core.includes(oldBaseline)) throw new Error("baseline control block not found");
core = core.replace(oldBaseline, newBaseline);

const oldExclusions = `    const exclusions = [];
    const relation = classifyProductRelation(baseline, candidate);
`;
const newExclusions = `    const exclusions = [];
    const relation = classifyProductRelation(baseline, candidate);
    if (!canRank) exclusions.push("The scanned product record is not reliable enough for comparison");
`;
if (!core.includes(oldExclusions)) throw new Error("candidate exclusion block not found");
core = core.replace(oldExclusions, newExclusions);
core = core.replace("    fairComparison: baselineControlled,", "    fairComparison: canRank,");
fs.writeFileSync(corePath, core);

const testPath = "scripts/food-contracts.test.mjs";
let tests = fs.readFileSync(testPath, "utf8");
const marker = 'test("ordering is deterministic and emits no universal product score", () => {';
const addition = `test("conflicted baseline cannot produce an eligible comparison", () => {
  const result = normaliseSourceEnvelope(FOOD_FIXTURES.conflict.envelope);
  const ranked = rankAlternatives(result.product, result.alternatives, { lowerSugar: true });
  assert.equal(result.product.dataQuality.state, "conflicted");
  assert.equal(ranked.fairComparison, false);
  assert.equal(ranked.eligible.length, 0);
  assert.match(ranked.limitations.join(" "), /conflicted or malformed/);
});

`;
if (!tests.includes(marker)) throw new Error("test insertion marker not found");
tests = tests.replace(marker, addition + marker);
fs.writeFileSync(testPath, tests);
