import test from "node:test";
import assert from "node:assert/strict";
import type { Outcome, WorkPackage } from "./contracts";
import { evaluateMaterialProgress } from "./evaluator";

const learnPackage: WorkPackage = {
  id: "species-acropora-learn",
  projectId: "EAR-SPECIES-01",
  title: "Compile Species transfer learning",
  section: "LEARNING",
  priority: "P0",
  goalLink: "Prove reusable Species production",
  gapClosed: "Measure compounding rather than assume it",
  deliverables: ["Transfer metric", "Next-instance rule"],
  dependencies: ["species-acropora-qa"],
  writeScopes: ["factory/production-lines/species"],
  definitionOfDone: ["Compounding is measured"],
  requiredEvidence: ["Reference vs transfer metrics", "Evidence refs", "Next comparable test"],
  productionLine: {
    lineId: "SPECIES_JOURNEY",
    instanceId: "acropora",
    templateVersion: "01",
    stage: "LEARN",
    role: "TRANSFER_02",
  },
  createdAt: "2026-09-01T09:00:00Z",
  estimatedValue: 8,
  criticalPath: 7,
  dependencyUnlock: 8,
  proofValue: 9,
  cashValue: 1,
  learningValue: 10,
  risk: 2,
  founderBurden: 0,
  concurrencyCost: 1,
  status: "RUNNING",
};

function outcome(evidence: string[]): Outcome {
  return {
    workPackageId: learnPackage.id,
    status: "ACCEPTED",
    evidence,
    materialDelta: "Implemented and measured the transfer method against the accepted reference with a scoped next test.",
    expected: "Measure whether the transfer compounds with rising human quality.",
    actual: "Measured transfer economics, Founder burden, quality growth and evidence against the reference.",
    completedAt: "2026-09-01T10:00:00Z",
  };
}

const measured = [
  "PASS source/runtime proof https://example.test/proof",
  "production-minutes=55",
  "founder-minutes=6",
  "reuse-rate=72%",
  "evidence-completeness=96%",
  "product-quality=8.4",
  "mobile-quality=8.2",
  "user-comprehension=8.1",
  "human-gold-status=FOUNDER_GOLD",
  "compounding=PASS",
  "expected vs actual cause lesson confidence regression next test",
  "Reference vs transfer metrics evidence refs next comparable test",
];

test("production-line learning cannot close from qualitative language alone", () => {
  const result = evaluateMaterialProgress(learnPackage, outcome([
    "PASS runtime proof https://example.test/proof",
    "lesson: reuse looked strong and the next test is coral transfer",
  ]));
  assert.equal(result.decision, "CORRECT");
  assert.equal(result.material, false);
  assert.ok(result.missingEvidence.includes("Measured production-minutes"));
  assert.ok(result.missingEvidence.includes("Founder Gold or External Human Gold quality status"));
  assert.ok(result.missingEvidence.includes("Explicit compounding PASS/FAIL verdict"));
});

test("equal quality is efficiency only and cannot close GIGA compounding", () => {
  const result = evaluateMaterialProgress(learnPackage, outcome([...measured, "quality-delta=0"]));
  assert.equal(result.decision, "CORRECT");
  assert.equal(result.material, false);
  assert.ok(result.missingEvidence.some((item) => item.includes("quality-delta must be > 0")));
});

test("declining quality cannot be hidden by faster production", () => {
  const result = evaluateMaterialProgress(learnPackage, outcome([...measured, "quality-delta=-0.4"]));
  assert.equal(result.decision, "CORRECT");
  assert.equal(result.material, false);
  assert.ok(result.missingEvidence.some((item) => item.includes("quality-delta must be > 0")));
});

test("GIGA compounding can close only with explicit rising quality after Founder Gold", () => {
  const result = evaluateMaterialProgress(learnPackage, outcome([...measured, "quality-delta=+0.35"]));
  assert.equal(result.decision, "ACCEPT");
  assert.equal(result.material, true);
});