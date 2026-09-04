import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/impact/actionContract.ts", import.meta.url), "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const action = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);

test("Bay survey action fails closed while current quantity and GBP cost are unknown", () => {
  const contract = action.BAY_OF_BISCAY_SURVEY_ACTION;
  assert.equal(contract.readiness, "BLOCKED_EXTERNAL_FACTS");
  assert.equal(contract.fundingNeed.amount.state, "UNKNOWN");
  assert.equal(contract.fundingNeed.amount.value, null);
  assert.equal(contract.fundingNeed.quantity.state, "UNKNOWN");
  assert.equal(contract.fundingNeed.quantity.value, null);
  assert.equal(action.actionContractCanMatchFunding(contract), false);
});

test("Bay action contract exposes exact external blockers rather than inventing a fundable unit", () => {
  const contract = action.BAY_OF_BISCAY_SURVEY_ACTION;
  assert.ok(contract.blockers.some((item) => /annual survey-day plan/i.test(item)));
  assert.ok(contract.blockers.some((item) => /GBP costing/i.test(item)));
  assert.ok(contract.blockers.some((item) => /No external funder commitment/i.test(item)));
});

test("delivery proof is bounded to measured survey work and never promoted to ecological impact", () => {
  const contract = action.BAY_OF_BISCAY_SURVEY_ACTION;
  for (const marker of ["route geometry", "observation hours", "distance surveyed", "evidence references"]) {
    assert.ok(contract.deliveryProof.some((item) => item.toLowerCase().includes(marker)));
  }
  assert.match(contract.outcomeBoundary, /does not by itself demonstrate ecological improvement/i);
  assert.match(contract.outcomeBoundary, /verified ecological impact/i);
});

test("action contract reuses existing Planet, Impact and Actor proof surfaces", () => {
  const hrefs = action.BAY_OF_BISCAY_SURVEY_ACTION.evidenceLinks.map((item) => item.href);
  assert.ok(hrefs.includes("/ecosystem/bay-of-biscay/"));
  assert.ok(hrefs.includes("/journey/orca/"));
  assert.ok(hrefs.includes("/impact/lab"));
  assert.ok(hrefs.includes("/actors"));
});

test("truth summary carries blockers and cannot report a known funding amount", () => {
  const summary = action.actionContractTruthSummary(action.BAY_OF_BISCAY_SURVEY_ACTION);
  assert.equal(summary.canMatchFunding, false);
  assert.equal(summary.knownFundingAmount, null);
  assert.equal(summary.knownQuantity, null);
  assert.ok(summary.blockers.length >= 3);
});
