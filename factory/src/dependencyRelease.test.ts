import test from "node:test";
import assert from "node:assert/strict";
import type { WorkPackage } from "./contracts";
import { dependenciesAccepted, releasableBlockedPackageIds } from "./dependencyRelease";

function pkg(id: string, dependencies: string[], status: WorkPackage["status"]): WorkPackage {
  return {
    id,
    projectId: "P",
    title: id,
    section: "LEARNING",
    priority: "P1",
    goalLink: "goal",
    gapClosed: "gap",
    deliverables: ["d"],
    dependencies,
    writeScopes: [],
    definitionOfDone: ["done"],
    requiredEvidence: ["proof"],
    createdAt: "2026-09-01T09:00:00Z",
    estimatedValue: 5,
    criticalPath: 5,
    dependencyUnlock: 5,
    proofValue: 5,
    cashValue: 0,
    learningValue: 5,
    risk: 1,
    founderBurden: 0,
    concurrencyCost: 1,
    status,
  };
}

test("blocked production-line stage releases only when every dependency is accepted", () => {
  const qa = pkg("qa", ["experience", "truth"], "BLOCKED");
  assert.equal(dependenciesAccepted(qa, new Map([["experience", "ACCEPTED"], ["truth", "RUNNING"]])), false);
  assert.equal(dependenciesAccepted(qa, new Map([["experience", "ACCEPTED"], ["truth", "ACCEPTED"]])), true);
});

test("missing or rejected dependency never becomes implicit success", () => {
  const next = pkg("next", ["source"], "BLOCKED");
  assert.equal(dependenciesAccepted(next, new Map()), false);
  assert.equal(dependenciesAccepted(next, new Map([["source", "REJECTED"]])), false);
});

test("release scan returns only dependency-complete blocked work", () => {
  const packages = [
    pkg("relationships", ["source"], "BLOCKED"),
    pkg("experience", ["relationships"], "BLOCKED"),
    pkg("unrelated", [], "BLOCKED"),
  ];
  const ready = releasableBlockedPackageIds(packages, new Map([["source", "ACCEPTED"], ["relationships", "BLOCKED"]]));
  assert.deepEqual(ready, ["relationships"]);
});
