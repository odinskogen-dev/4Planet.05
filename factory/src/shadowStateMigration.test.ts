import assert from "node:assert/strict";
import test from "node:test";
import {
  ORCHESTRA_V04_PREFIX_RECOVERY_MARKER_ID,
  ORCHESTRA_V04_PREFIX_STALE_IDS,
  createLegacyOrchestraV04RecoveryMarker,
  planLegacyOrchestraV04QueueRecovery,
} from "./shadowStateMigration";

test("plans only exact pre-fix Orchestra 04 rows in SHADOW without outcomes", () => {
  const planned = planLegacyOrchestraV04QueueRecovery({
    mode: "SHADOW",
    markerPresent: false,
    work: ORCHESTRA_V04_PREFIX_STALE_IDS.map((id) => ({ id, status: "RUNNING" })),
    recordedOutcomeIds: new Set(),
  });
  assert.deepEqual(planned, [...ORCHESTRA_V04_PREFIX_STALE_IDS]);
});

test("recorded outcomes and unrelated work are never migrated", () => {
  const [recorded, ...remaining] = ORCHESTRA_V04_PREFIX_STALE_IDS;
  const planned = planLegacyOrchestraV04QueueRecovery({
    mode: "SHADOW",
    markerPresent: false,
    work: [
      ...remaining.map((id) => ({ id, status: "RUNNING" })),
      { id: "unrelated-running", status: "RUNNING" },
    ],
    recordedOutcomeIds: new Set([recorded]),
  });
  assert.deepEqual(planned, remaining);
});

test("migration is fail-closed outside SHADOW or after receipt exists", () => {
  const work = ORCHESTRA_V04_PREFIX_STALE_IDS.map((id) => ({ id, status: "RUNNING" }));
  assert.deepEqual(planLegacyOrchestraV04QueueRecovery({ mode: "ACTIVE", markerPresent: false, work, recordedOutcomeIds: new Set() }), []);
  assert.deepEqual(planLegacyOrchestraV04QueueRecovery({ mode: "SHADOW", markerPresent: true, work, recordedOutcomeIds: new Set() }), []);
});

test("READY is eligible only for the one-time receipt path, other states remain untouched", () => {
  const [ready, accepted] = ORCHESTRA_V04_PREFIX_STALE_IDS;
  const planned = planLegacyOrchestraV04QueueRecovery({
    mode: "SHADOW",
    markerPresent: false,
    work: [
      { id: ready, status: "READY" },
      { id: accepted, status: "ACCEPTED" },
    ],
    recordedOutcomeIds: new Set(),
  });
  assert.deepEqual(planned, [ready]);
});

test("receipt is explicit, P0 and tied to the existing WBS/evidence", () => {
  const marker = createLegacyOrchestraV04RecoveryMarker("2026-09-02T04:00:00.000Z", [ORCHESTRA_V04_PREFIX_STALE_IDS[0]]);
  assert.equal(marker.id, ORCHESTRA_V04_PREFIX_RECOVERY_MARKER_ID);
  assert.equal(marker.priority, "P0");
  assert.ok(marker.authorityRefs?.includes("FACT-G07"));
  assert.ok(marker.authorityRefs?.some((ref) => ref.includes("33577758694")));
});
