import test from "node:test";
import assert from "node:assert/strict";
import { decideInFlightRecovery } from "./recovery";

const NOW = Date.parse("2026-09-01T00:00:00.000Z");

test("recorded outcome is finalized instead of re-executed", () => {
  assert.equal(
    decideInFlightRecovery(
      { status: "RUNNING", updatedAt: "2026-08-31T23:59:00.000Z", hasRecordedOutcome: true },
      NOW,
    ),
    "FINALIZE_RECORDED_OUTCOME",
  );
});

test("stale in-flight work recovers to READY but fresh work remains untouched", () => {
  assert.equal(
    decideInFlightRecovery(
      { status: "DISPATCHED", updatedAt: "2026-08-31T23:20:00.000Z", hasRecordedOutcome: false },
      NOW,
    ),
    "RECOVER_TO_READY",
  );
  assert.equal(
    decideInFlightRecovery(
      { status: "RUNNING", updatedAt: "2026-08-31T23:50:00.000Z", hasRecordedOutcome: false },
      NOW,
    ),
    "LEAVE",
  );
});

test("accepted, blocked and future-dated records are not silently recycled", () => {
  assert.equal(
    decideInFlightRecovery(
      { status: "ACCEPTED", updatedAt: "2026-08-31T20:00:00.000Z", hasRecordedOutcome: false },
      NOW,
    ),
    "LEAVE",
  );
  assert.equal(
    decideInFlightRecovery(
      { status: "BLOCKED", updatedAt: "2026-08-31T20:00:00.000Z", hasRecordedOutcome: false },
      NOW,
    ),
    "LEAVE",
  );
  assert.equal(
    decideInFlightRecovery(
      { status: "RUNNING", updatedAt: "2026-09-01T00:10:00.000Z", hasRecordedOutcome: false },
      NOW,
    ),
    "LEAVE",
  );
});
