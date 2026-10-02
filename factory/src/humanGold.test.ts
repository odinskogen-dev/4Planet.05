import test from "node:test";
import assert from "node:assert/strict";
import { evaluateHumanGoldEvidence, qualityAdjustedThroughput } from "./humanGold";

const dimensions = ["UNDERSTANDING", "EXPERIENCE", "FLOW", "VALUE", "TRUST", "CRAFT", "DISTINCTIVENESS", "MEMORY"] as const;

function passingEvidence(): string[] {
  return dimensions.map((dimension, index) => `HUMAN-GOLD ${dimension}=PASS REVIEWER=${index % 2 === 0 ? "UX_CRITIC" : "VISUAL_CRITIC"} REF=https://review.test/${dimension.toLowerCase()}`);
}

test("technical-looking output cannot count as Human Gold when a critical dimension fails", () => {
  const evidence = passingEvidence().filter((line) => !line.includes("CRAFT="));
  evidence.push("HUMAN-GOLD CRAFT=FAIL REVIEWER=DEVICE_QA REF=https://review.test/mobile-fail");
  const result = evaluateHumanGoldEvidence(evidence);
  assert.equal(result.status, "HUMAN_QUALITY_FAIL");
  assert.equal(result.acceptedProductionUnit, false);
  assert.equal(result.scalableProductionUnit, false);
  assert.deepEqual(result.failedDimensions, ["CRAFT"]);
});

test("maker cannot judge its own Human Gold output", () => {
  const evidence = passingEvidence().filter((line) => !line.includes("EXPERIENCE="));
  evidence.push("HUMAN-GOLD EXPERIENCE=PASS REVIEWER=BUILDER REF=https://review.test/self-review");
  const result = evaluateHumanGoldEvidence(evidence);
  assert.equal(result.candidatePassed, false);
  assert.ok(result.invalidEvidence.some((item) => item.includes("BUILDER cannot judge")));
});

test("all eight independent dimensions create a candidate but cannot scale before Founder Gold", () => {
  const candidate = evaluateHumanGoldEvidence(passingEvidence());
  assert.equal(candidate.status, "HUMAN_GOLD_CANDIDATE");
  assert.equal(candidate.acceptedProductionUnit, true);
  assert.equal(candidate.scalableProductionUnit, false);

  const founder = evaluateHumanGoldEvidence([...passingEvidence(), "HUMAN-GOLD FOUNDER=PASS REF=founder-review-01"]);
  assert.equal(founder.status, "FOUNDER_GOLD");
  assert.equal(founder.scalableProductionUnit, true);
});

test("external Human Gold is impossible before Founder Gold", () => {
  const result = evaluateHumanGoldEvidence([...passingEvidence(), "HUMAN-GOLD EXTERNAL=PASS REF=naive-user-test-01"]);
  assert.equal(result.status, "HUMAN_GOLD_CANDIDATE");
  assert.equal(result.externalPassed, false);
});

test("Factory throughput counts accepted quality, not raw activity", () => {
  const candidate = evaluateHumanGoldEvidence(passingEvidence());
  const founder = evaluateHumanGoldEvidence([...passingEvidence(), "HUMAN-GOLD FOUNDER=PASS REF=founder-review-01"]);
  const failure = evaluateHumanGoldEvidence(["HUMAN-GOLD CRAFT=FAIL REVIEWER=DEVICE_QA REF=mobile-fail"]);
  assert.deepEqual(qualityAdjustedThroughput([candidate, founder, failure]), {
    produced: 3,
    accepted: 2,
    scalable: 1,
    rejectedOrRework: 1,
  });
});