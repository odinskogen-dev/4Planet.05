import test from "node:test";
import assert from "node:assert/strict";
import {
  FACTORY_FORBIDDEN_AUTONOMOUS_CAPABILITIES,
  FOUR_PLANET_BRAND_RULES,
  HUMAN_GOLD_RULES,
  TRUTH_BY_DESIGN_RULES,
  validateGeneratedCandidate,
} from "./brandContract";
import { evaluateGovernedLearning, proveGovernedLearningContract } from "./governedLearning";
import { createRealProjectProofCases } from "./realProjectProof";
import { evaluateZeroLoss } from "./zeroLoss";

const TEST_SHA = "a".repeat(40);

test("4PLANET production contract preserves Brand, truth and Founder-only boundaries", () => {
  assert.ok(FOUR_PLANET_BRAND_RULES.some((rule) => rule.includes("Human-first")));
  assert.ok(FOUR_PLANET_BRAND_RULES.some((rule) => rule.includes("Gold Plank is a construction system")));
  assert.ok(TRUTH_BY_DESIGN_RULES.some((rule) => rule.includes("Observation is not population trend")));
  assert.ok(TRUTH_BY_DESIGN_RULES.some((rule) => rule.includes("Survey corridor is not migration corridor")));
  assert.ok(HUMAN_GOLD_RULES.some((rule) => rule.includes("Founder is final Human Gold judge")));
  for (const forbidden of ["LIVE_DEPLOY", "EXTERNAL_SEND", "PAYMENT", "CANON_PROMOTION", "HUMAN_GOLD_SELF_PROMOTION"]) {
    assert.ok(FACTORY_FORBIDDEN_AUTONOMOUS_CAPABILITIES.includes(forbidden as never));
  }
});

test("generated-candidate preflight fails closed on empty/dynamic/high-risk output", () => {
  assert.equal(validateGeneratedCandidate("").ok, false);
  assert.equal(validateGeneratedCandidate("const x = eval('danger')").ok, false);
  assert.equal(validateGeneratedCandidate("This is our official partner and verified impact.").ok, false);
  assert.equal(validateGeneratedCandidate("export const safe = 'UNKNOWN remains UNKNOWN';").ok, true);
});

test("governed learning requires repeat evidence and never weakens gates or Canon", () => {
  assert.equal(proveGovernedLearningContract().passed, true);
  const base = {
    id: "real",
    workPackageId: "wp",
    projectId: "project",
    target: "FACTORY_TEST_GATE" as const,
    observation: "Repeated failure",
    evidence: ["a", "b"],
    proposedChange: "Strengthen mobile gate",
    distinctInstanceCount: 2,
    safetyCorrection: false,
    weakensTruthOrSafety: false,
    promotesCanon: false,
    status: "PROPOSED" as const,
  };
  assert.equal(evaluateGovernedLearning(base).accepted, true);
  assert.equal(evaluateGovernedLearning({ ...base, distinctInstanceCount: 1 }).accepted, false);
  assert.equal(evaluateGovernedLearning({ ...base, weakensTruthOrSafety: true }).accepted, false);
  assert.equal(evaluateGovernedLearning({ ...base, promotesCanon: true }).accepted, false);
});

test("real activation proof uses three materially different current 4PLANET families", () => {
  const cases = createRealProjectProofCases(TEST_SHA, "2026-09-01T22:00:00.000Z");
  assert.deepEqual(cases.map((item) => item.family), ["SPECIES_PROFILE", "ECOSYSTEM_PLACE", "ACTOR_PROFILE"]);
  assert.equal(new Set(cases.map((item) => item.pkg.autonomous?.targetPath)).size, 3);
  for (const item of cases) {
    assert.equal(item.pkg.status, "READY");
    assert.equal(item.pkg.section, "PRODUCT_DESIGN");
    assert.equal(item.pkg.autonomous?.baseBranch, "king/test");
    assert.equal(item.pkg.autonomous?.expectedBaseSha, TEST_SHA);
    assert.match(item.pkg.autonomous?.candidateBranch ?? `factory-candidate-${item.pkg.id}`, /^factory-candidate-/);
    const zeroLoss = evaluateZeroLoss(item.pkg);
    assert.equal(zeroLoss.ready, true, `${item.family}: ${zeroLoss.missing.join(",")}`);
    assert.ok(item.pkg.definitionOfDone.some((rule) => /No |remain|preserv/i.test(rule)));
  }
});
