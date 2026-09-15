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

test("Bay programme evidence carries ORCA-confirmed 2026 survey scale", () => {
  const contract = action.BAY_OF_BISCAY_SURVEY_ACTION;
  assert.equal(contract.programmeEvidence.annualSurveys.state, "KNOWN");
  assert.deepEqual(contract.programmeEvidence.annualSurveys.value, { min: 10, max: 12 });
  assert.equal(contract.programmeEvidence.annualSurveyDays.state, "KNOWN");
  assert.deepEqual(contract.programmeEvidence.annualSurveyDays.value, { min: 40, max: 48 });
  assert.match(contract.programmeEvidence.annualSurveyDays.sourceNote, /Steve Jones, 4 Sep 2026/i);
});

test("Bay survey action still fails closed while bounded quantity and current GBP terms are unresolved", () => {
  const contract = action.BAY_OF_BISCAY_SURVEY_ACTION;
  assert.equal(contract.readiness, "BLOCKED_EXTERNAL_FACTS");
  assert.equal(contract.fundingNeed.amount.state, "TO_VERIFY");
  assert.equal(contract.fundingNeed.amount.value, null);
  assert.equal(contract.fundingNeed.quantity.state, "UNKNOWN");
  assert.equal(contract.fundingNeed.quantity.value, null);
  assert.equal(action.actionContractCanMatchFunding(contract), false);
});

test("placeholder sponsorship prices can never be promoted into a fundable amount", () => {
  const contract = action.BAY_OF_BISCAY_SURVEY_ACTION;
  assert.match(contract.fundingNeed.amount.sourceNote, /placeholders/i);
  assert.ok(contract.blockers.some((item) => /prices were explicitly placeholders/i.test(item)));
  assert.ok(contract.blockers.some((item) => /survey days this action contract would fund/i.test(item)));
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

test("truth summary exposes confirmed programme scale but no fabricated funding amount", () => {
  const summary = action.actionContractTruthSummary(action.BAY_OF_BISCAY_SURVEY_ACTION);
  assert.equal(summary.canMatchFunding, false);
  assert.deepEqual(summary.confirmedAnnualSurveys, { min: 10, max: 12 });
  assert.deepEqual(summary.confirmedAnnualSurveyDays, { min: 40, max: 48 });
  assert.equal(summary.knownFundingAmount, null);
  assert.equal(summary.knownQuantity, null);
  assert.ok(summary.blockers.length >= 3);
});

test("AC-SC01-0001 is a real pre-action gate, not a fabricated transaction", () => {
  const contract = action.AC_SC01_0001;
  assert.equal(contract.id, "AC-SC01-0001");
  assert.equal(contract.cellId, "CELL-SC01-VERIFIED-PLASTIC-RECOVERY");
  assert.equal(contract.environment, "CONTROLLED");
  assert.equal(contract.selectedProviderId.state, "TO_VERIFY");
  assert.equal(contract.selectedProviderId.value, null);
  assert.equal(contract.proposedResourceFlow.amount.state, "TO_VERIFY");
  assert.equal(contract.proposedResourceFlow.amount.value, null);
  assert.equal(contract.proposedResourceFlow.quantity.state, "TO_VERIFY");
  assert.equal(contract.proposedResourceFlow.quantity.value, null);
  assert.equal(contract.authorityState, "FOUNDER_RELEASE_REQUIRED");
  assert.equal(action.universalActionContractCanBeginResourceFlow(contract), false);
  assert.ok(contract.blockers.some((item) => /Founder has not released/i.test(item)));
  assert.ok(contract.claimsProhibited.some((item) => /Payment equals delivery/i.test(item)));
});

test("resource flow cannot open by changing only the provider; every pre-action gate must close", () => {
  const contract = action.AC_SC01_0001;
  const providerOnly = {
    ...contract,
    selectedProviderId: { state: "KNOWN", value: "provider-pattern:plastic-bank:fixed-contribution:v1", sourceNote: "test" },
  };
  assert.equal(action.universalActionContractCanBeginResourceFlow(providerOnly), false);
});

test("resource flow opens only when provider, diligence, exact economics, release and blockers all close", () => {
  const contract = action.AC_SC01_0001;
  const released = {
    ...contract,
    selectedProviderId: { state: "KNOWN", value: "provider-pattern:plastic-bank:fixed-contribution:v1", sourceNote: "verified same-day" },
    actorDiligenceState: "DILIGENCE_COMPLETE",
    proposedResourceFlow: {
      ...contract.proposedResourceFlow,
      amount: { state: "KNOWN", value: 100, sourceNote: "same-day checkout fixture" },
      quantity: { state: "KNOWN", value: 5000, sourceNote: "same-day checkout fixture" },
    },
    authorityState: "RELEASED",
    blockers: [],
  };
  assert.equal(action.universalActionContractCanBeginResourceFlow(released), true);
});
