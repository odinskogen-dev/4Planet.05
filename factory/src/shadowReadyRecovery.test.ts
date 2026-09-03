import assert from "node:assert/strict";
import test from "node:test";
import { buildReadyDrainMarkerId, planBuildBoundShadowReadyDrain } from "./shadowReadyRecovery";

const BUILD = "a".repeat(40);
const ORCHESTRA = ["orch-a", "orch-b", "orch-c"] as const;

test("build-bound SHADOW recovery selects only unresolved allowlisted READY packages", () => {
  assert.deepEqual(planBuildBoundShadowReadyDrain({
    mode: "SHADOW",
    factoryBuildSha: BUILD,
    markerPresent: false,
    orchestraPackageIds: ORCHESTRA,
    work: [
      { id: "orch-a", status: "READY" },
      { id: "orch-b", status: "RUNNING" },
      { id: "orch-c", status: "READY" },
      { id: "unrelated", status: "READY" },
    ],
    recordedOutcomeIds: new Set(["orch-c"]),
  }), ["orch-a"]);
});

test("recovery fails closed outside SHADOW, on invalid build identity, or after exact-build receipt", () => {
  const base = {
    factoryBuildSha: BUILD,
    markerPresent: false,
    orchestraPackageIds: ORCHESTRA,
    work: [{ id: "orch-a", status: "READY" }],
    recordedOutcomeIds: new Set<string>(),
  };
  assert.deepEqual(planBuildBoundShadowReadyDrain({ ...base, mode: "ACTIVE" }), []);
  assert.deepEqual(planBuildBoundShadowReadyDrain({ ...base, mode: "SHADOW", factoryBuildSha: "bad" }), []);
  assert.deepEqual(planBuildBoundShadowReadyDrain({ ...base, mode: "SHADOW", markerPresent: true }), []);
});

test("receipt identity is immutable per exact Factory build", () => {
  assert.equal(buildReadyDrainMarkerId(BUILD), "factory-shadow-orchestra-build-ready-drain-aaaaaaaaaaaa");
  assert.notEqual(buildReadyDrainMarkerId(BUILD), buildReadyDrainMarkerId("b".repeat(40)));
  assert.equal(buildReadyDrainMarkerId("not-a-sha"), undefined);
});
