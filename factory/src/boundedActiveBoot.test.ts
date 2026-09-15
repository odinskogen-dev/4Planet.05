import test from "node:test";
import assert from "node:assert/strict";
import { activationProofIds } from "./activationProofIdentity";
import { evaluateGovernedLearning } from "./governedLearning";

const BUILD = "a".repeat(40);

function proposal(projectId: string, distinctInstanceCount: number) {
  return {
    id: "bounded-active-boot-proof",
    workPackageId: "factory-real-species-evidence-affordance-proof",
    projectId,
    target: "FACTORY_TEST_GATE" as const,
    observation: "Accepted real bounded worker outcome",
    evidence: ["authority PASS", "commit evidence", "independent evaluator ACCEPTED"],
    proposedChange: "Retain this as Factory evidence; require another distinct instance before generalizing a reusable rule.",
    distinctInstanceCount,
    safetyCorrection: false,
    weakensTruthOrSafety: false,
    promotesCanon: false,
    status: "PROPOSED" as const,
  };
}

test("Founder bounded ACTIVE boot requires one exact-build real proof outcome", () => {
  assert.equal(activationProofIds(BUILD).length, 1);
});

test("first accepted bounded boot outcome writes back evidence without weakening normal two-instance generalization", () => {
  const boot = evaluateGovernedLearning(proposal("4planet-factory-real-proof", 1));
  assert.equal(boot.accepted, true);
  assert.equal(boot.destination, "FACTORY_INTERNAL");
  assert.ok(boot.reasons.includes("BOUNDED_BOOT_EVIDENCE_WRITEBACK_ONLY"));
  assert.ok(boot.reasons.includes("GENERALIZATION_STILL_REQUIRES_SECOND_INSTANCE"));

  const ordinary = evaluateGovernedLearning(proposal("ordinary-project", 1));
  assert.equal(ordinary.accepted, false);
  assert.ok(ordinary.reasons.includes("REPEATED_DISTINCT_INSTANCE_REQUIRED"));
});
