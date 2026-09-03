import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { activationProofIds } from "./activationProofIdentity";
import { ORCHESTRA_PACKAGE_IDS } from "./shadowOrchestra";
import {
  ORCHESTRA_V04_PREFIX_STALE_IDS,
  planPostRecoveryReadyDrain,
} from "./shadowStateMigration";

const indexSource = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
const activeRuntimeSource = readFileSync(new URL("./activeRuntime.ts", import.meta.url), "utf8");
const worldClassRuntimeSource = readFileSync(new URL("./worldClassRuntime.ts", import.meta.url), "utf8");
const runtimeEntrypointSource = readFileSync(new URL("./runtimeEntrypoint.ts", import.meta.url), "utf8");

const BUILD_SHA = "1234567890abcdef1234567890abcdef12345678";

test("required orchestra and activation outcomes remain discoverable after more than 20 newer outcomes", () => {
  const required = [...ORCHESTRA_PACKAGE_IDS, ...activationProofIds(BUILD_SHA)];
  const historical = [
    ...required.map((id, index) => ({ id, completedAt: new Date(index * 1000).toISOString() })),
    ...Array.from({ length: 25 }, (_, index) => ({
      id: `newer-history-${index}`,
      completedAt: new Date((required.length + index + 1) * 1000).toISOString(),
    })),
  ];

  const recent20 = [...historical]
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
    .slice(0, 20)
    .map((item) => item.id);
  assert.equal(required.some((id) => recent20.includes(id)), false, "fixture must evict all required proof IDs from the recent window");

  const exactLookup = (ids: readonly string[]) => ids.filter((id) => historical.some((item) => item.id === id));
  assert.deepEqual(new Set(exactLookup(required)), new Set(required));
});

test("completed legacy orchestra work is not requeued when its outcome is older than the recent-20 window", () => {
  const required = [...ORCHESTRA_V04_PREFIX_STALE_IDS];
  const historical = [
    ...required.map((id, index) => ({ id, completedAt: new Date(index * 1000).toISOString() })),
    ...Array.from({ length: 25 }, (_, index) => ({
      id: `newer-recovery-${index}`,
      completedAt: new Date((required.length + index + 1) * 1000).toISOString(),
    })),
  ];
  const recentRecorded = new Set(
    [...historical]
      .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
      .slice(0, 20)
      .map((item) => item.id),
  );
  const exactRecorded = new Set(required.filter((id) => historical.some((item) => item.id === id)));
  const work = required.map((id) => ({ id, status: "READY" }));

  assert.deepEqual(
    planPostRecoveryReadyDrain({ mode: "SHADOW", markerPresent: false, work, recordedOutcomeIds: exactRecorded }),
    [],
  );
  assert.notDeepEqual(
    planPostRecoveryReadyDrain({ mode: "SHADOW", markerPresent: false, work, recordedOutcomeIds: recentRecorded }),
    [],
    "the test must reproduce the old false-requeue bug when recent history is misused",
  );
});

test("correctness consumers use exact bounded lookup while recent-20 remains observability only", () => {
  assert.match(indexSource, /getOutcomesByIds\(workPackageIds: string\[\]\)/);
  assert.match(indexSource, /ORDER BY completed_at DESC LIMIT 20/);

  assert.match(activeRuntimeSource, /getOutcomesByIds\(cases\.map\(\(proof\) => proof\.pkg\.id\)\)/);
  assert.match(activeRuntimeSource, /getOutcomesByIds\(ids\)/);
  assert.doesNotMatch(activeRuntimeSource, /new Set\(state\.outcomes\.map\(\(item\) => item\.work_package_id\)\)/);

  assert.match(worldClassRuntimeSource, /getOutcomesByIds\(\[\.\.\.ORCHESTRA_PACKAGE_IDS\]\)/);
  assert.match(worldClassRuntimeSource, /recentPersistedOutcomes: state\.outcomes\.length/);
  assert.doesNotMatch(worldClassRuntimeSource, /new Set\([^\n]*state\.outcomes/);

  assert.match(runtimeEntrypointSource, /getOutcomesByIds\(\[\.\.\.ORCHESTRA_PACKAGE_IDS\]\)/);
  assert.doesNotMatch(runtimeEntrypointSource, /new Set\(state\.outcomes\.map/);
});
