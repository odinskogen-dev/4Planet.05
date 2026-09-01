import test from "node:test";
import assert from "node:assert/strict";
import { compileLearningCandidate } from "./learningCompiler";
import { evaluateMaterialProgress } from "./evaluator";
import type { Outcome, WorkPackage } from "./contracts";

const pkg: WorkPackage = {
  id: "orca-mobile-proof",
  projectId: "ORCA",
  title: "Reduce persistent mobile chrome",
  section: "PRODUCT_DESIGN",
  priority: "P0",
  goalLink: "Make the Species Journey immediately understandable",
  gapClosed: "Persistent UI competes with the animal and story",
  deliverables: ["One dominant mobile narrative layer"],
  dependencies: [],
  writeScopes: ["public/journey/orca/"],
  preservation: {
    mustNotLose: ["truth access", "accepted story flow"],
    regressionRisks: ["mobile story regression", "source access regression"],
    rollbackRef: "0123456789abcdef0123456789abcdef01234567",
  },
  definitionOfDone: ["390px mobile has one dominant narrative authority"],
  requiredEvidence: ["before after mobile runtime screenshot"],
  learningQuestion: "Does intent-triggered evidence beat persistent evidence chrome on mobile?",
  createdAt: "2026-09-01T00:00:00Z",
  estimatedValue: 9,
  criticalPath: 8,
  dependencyUnlock: 6,
  proofValue: 9,
  cashValue: 1,
  learningValue: 8,
  risk: 2,
  founderBurden: 0,
  concurrencyCost: 2,
  status: "RUNNING",
};

const outcome: Outcome = {
  workPackageId: pkg.id,
  status: "ACCEPTED",
  evidence: [
    "BEFORE/AFTER mobile runtime screenshot https://example.invalid/orca-proof",
    "390px + 430px browser PASS on exact 0123456789abcdef0123456789abcdef01234567",
  ],
  materialDelta: "Removed persistent evidence chrome and implemented an intent-triggered evidence sheet, visibly reducing mobile competition with the Orca story.",
  expected: "One dominant story layer with evidence available on intent and no loss of truth access.",
  actual: "Mobile runtime shows one dominant story layer; evidence remains available through the explicit evidence action.",
  limitation: "Transfer to Jaguar and other Species journeys still requires a second comparable test.",
  completedAt: "2026-09-01T00:30:00Z",
};

test("accepted material outcome becomes scoped non-authoritative learning", () => {
  const evaluation = evaluateMaterialProgress(pkg, outcome);
  assert.equal(evaluation.decision, "ACCEPT");
  const compiled = compileLearningCandidate(pkg, outcome, evaluation);
  assert.equal(compiled.accepted, true);
  assert.equal(compiled.candidate?.status, "CANDIDATE");
  assert.equal(compiled.candidate?.scope, "ORCA/PRODUCT_DESIGN");
  assert.match(compiled.candidate?.nextTest ?? "", /second comparable case/i);
});

test("non-material accepted work cannot create learning authority", () => {
  const weak: Outcome = {
    ...outcome,
    materialDelta: "Plan queued for later.",
    evidence: [],
  };
  const evaluation = evaluateMaterialProgress(pkg, weak);
  const compiled = compileLearningCandidate(pkg, weak, evaluation);
  assert.equal(compiled.accepted, false);
  assert.equal(compiled.candidate, undefined);
});

test("failed or correction outcomes cannot disappear without a failure-learning record", () => {
  const failed: Outcome = {
    ...outcome,
    status: "CORRECT",
    evidence: [],
    materialDelta: "Mobile change regressed accepted story flow.",
    actual: "The accepted story flow became harder to use.",
    limitation: "Root cause not yet proven.",
  };
  const evaluation = evaluateMaterialProgress(pkg, failed);
  const compiled = compileLearningCandidate(pkg, failed, evaluation);
  assert.equal(compiled.accepted, true);
  assert.equal(compiled.candidate?.status, "CANDIDATE");
  assert.match(compiled.candidate?.ruleProposal ?? "", /FAILURE→TEST/);
  assert.match(compiled.candidate?.evidence[0] ?? "", /CONTROL GAP/);
});
