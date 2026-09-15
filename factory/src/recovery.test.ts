import test from "node:test";
import assert from "node:assert/strict";
import { decideInFlightRecovery, workflowExecutionConfirmedInactive } from "./recovery";

const NOW = Date.parse("2026-09-01T00:00:00.000Z");

test("recorded outcome is finalized instead of re-executed", () => {
  assert.equal(
    decideInFlightRecovery(
      {
        status: "RUNNING",
        updatedAt: "2026-08-31T23:59:00.000Z",
        hasRecordedOutcome: true,
        workflowStatus: "running",
      },
      NOW,
    ),
    "FINALIZE_RECORDED_OUTCOME",
  );
});

test("only terminal workflow states count as explicit inactive-workflow proof", () => {
  for (const status of ["queued", "running", "paused", "waiting"] as const) {
    assert.equal(workflowExecutionConfirmedInactive(status), false);
  }
  for (const status of ["complete", "errored", "terminated"] as const) {
    assert.equal(workflowExecutionConfirmedInactive(status), true);
  }
  assert.equal(workflowExecutionConfirmedInactive(undefined), false);
});

test("stale in-flight work recovers only when the tracked workflow is terminal", () => {
  for (const workflowStatus of ["complete", "errored", "terminated"] as const) {
    assert.equal(
      decideInFlightRecovery(
        {
          status: "DISPATCHED",
          updatedAt: "2026-08-31T23:20:00.000Z",
          hasRecordedOutcome: false,
          workflowStatus,
        },
        NOW,
      ),
      "RECOVER_TO_READY",
    );
  }

  for (const workflowStatus of [undefined, "queued", "running", "paused", "waiting"] as const) {
    assert.equal(
      decideInFlightRecovery(
        {
          status: "DISPATCHED",
          updatedAt: "2026-08-31T23:20:00.000Z",
          hasRecordedOutcome: false,
          workflowStatus,
        },
        NOW,
      ),
      "LEAVE",
    );
  }

  assert.equal(
    decideInFlightRecovery(
      {
        status: "RUNNING",
        updatedAt: "2026-08-31T23:50:00.000Z",
        hasRecordedOutcome: false,
        workflowStatus: "terminated",
      },
      NOW,
    ),
    "LEAVE",
  );
});

test("accepted, blocked, future-dated and corrupt records are not silently recycled", () => {
  assert.equal(
    decideInFlightRecovery(
      {
        status: "ACCEPTED",
        updatedAt: "2026-08-31T20:00:00.000Z",
        hasRecordedOutcome: false,
        workflowStatus: "terminated",
      },
      NOW,
    ),
    "LEAVE",
  );
  assert.equal(
    decideInFlightRecovery(
      {
        status: "BLOCKED",
        updatedAt: "2026-08-31T20:00:00.000Z",
        hasRecordedOutcome: false,
        workflowStatus: "terminated",
      },
      NOW,
    ),
    "LEAVE",
  );
  assert.equal(
    decideInFlightRecovery(
      {
        status: "RUNNING",
        updatedAt: "2026-09-01T00:10:00.000Z",
        hasRecordedOutcome: false,
        workflowStatus: "terminated",
      },
      NOW,
    ),
    "LEAVE",
  );
  assert.equal(
    decideInFlightRecovery(
      {
        status: "DISPATCHED",
        updatedAt: "not-a-timestamp",
        hasRecordedOutcome: false,
        workflowStatus: "terminated",
      },
      NOW,
    ),
    "LEAVE",
  );
});
