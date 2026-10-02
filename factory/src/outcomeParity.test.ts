import assert from "node:assert/strict";
import test from "node:test";
import type { Outcome, WorkPackage } from "./contracts";
import { evaluateOutcomeParity, type ConductorRunEvidence } from "./outcomeParity";

function pkg(id: string, founderBurden = 1): WorkPackage {
  return {
    id,
    projectId: "parity-project",
    title: id,
    section: "CODE_QA",
    priority: "P0",
    goalLink: "Outcome parity",
    gapClosed: "Parity proof",
    deliverables: ["material outcome"],
    dependencies: [],
    writeScopes: [],
    definitionOfDone: ["PASS"],
    requiredEvidence: ["PASS"],
    createdAt: "2026-09-01T00:00:00.000Z",
    estimatedValue: 10,
    criticalPath: 10,
    dependencyUnlock: 10,
    proofValue: 10,
    cashValue: 0,
    learningValue: 5,
    risk: 1,
    founderBurden,
    concurrencyCost: 1,
    status: "READY",
  };
}

function accepted(id: string): Outcome {
  return {
    workPackageId: id,
    status: "ACCEPTED",
    evidence: ["PASS exact evidence"],
    materialDelta: "A real capability or verified blocker was materially advanced.",
    expected: "PASS",
    actual: "PASS exact evidence",
    completedAt: "2026-09-01T00:10:00.000Z",
  };
}

function run(id: string, withOutcome = true, founderBurden = 1): ConductorRunEvidence {
  const work = pkg(`${id}-wp`, founderBurden);
  return {
    runId: id,
    packages: [work],
    outcomes: withOutcome ? [accepted(work.id)] : [],
  };
}

test("outcome parity rejects nominal factory runs without terminal outcomes", () => {
  const reference = [run("ref-1"), run("ref-2"), run("ref-3")];
  const factory = [run("fac-1", false), run("fac-2", false), run("fac-3", false)];

  const result = evaluateOutcomeParity(reference, factory);

  assert.equal(result.ready, false);
  assert.equal(result.factoryRuns, 3);
  assert.equal(result.factorySettledRuns, 0);
  assert.ok(result.missing.includes("FACTORY_SETTLED_RUNS:3"));
});

test("outcome parity rejects partial or duplicate outcome coverage", () => {
  const first = pkg("fac-partial-a");
  const second = pkg("fac-partial-b");
  const reference = [run("ref-1"), run("ref-2"), run("ref-3")];
  const invalid: ConductorRunEvidence = {
    runId: "fac-partial",
    packages: [first, second],
    outcomes: [accepted(first.id)],
  };
  const duplicate: ConductorRunEvidence = {
    runId: "fac-duplicate",
    packages: [first],
    outcomes: [accepted(first.id), accepted(first.id)],
  };

  const result = evaluateOutcomeParity(reference, [invalid, duplicate, run("fac-good")]);

  assert.equal(result.factorySettledRuns, 1);
  assert.ok(result.missing.includes("FACTORY_SETTLED_RUNS:3"));
});

test("outcome parity passes only with enough fully settled equal-or-better runs", () => {
  const reference = [run("ref-1", true, 2), run("ref-2", true, 2), run("ref-3", true, 2)];
  const factory = [run("fac-1", true, 1), run("fac-2", true, 1), run("fac-3", true, 1)];

  const result = evaluateOutcomeParity(reference, factory);

  assert.equal(result.ready, true);
  assert.equal(result.referenceSettledRuns, 3);
  assert.equal(result.factorySettledRuns, 3);
  assert.equal(result.factoryMaterialRate, 1);
  assert.equal(result.factoryEvidenceRate, 1);
  assert.ok(result.factoryFounderBurden < result.referenceFounderBurden);
});
