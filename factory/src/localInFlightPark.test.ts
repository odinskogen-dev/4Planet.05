import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { LOCAL_IN_FLIGHT_PARK_AFTER_MS, localReadOnlyWorkflowParkDecision } from "./localInFlightPark";

describe("local read-only workflow park immunity", () => {
  it("parks a stale running read-only workflow so the next legal package can dispatch", () => {
    const createdAt = "2026-09-06T21:14:32.000Z";
    const nowMs = Date.parse(createdAt) + LOCAL_IN_FLIGHT_PARK_AFTER_MS + 1;
    assert.deepEqual(
      localReadOnlyWorkflowParkDecision({ status: "running", createdAt, writeScopes: [], nowMs }),
      { park: true, reason: "LOCAL_READ_ONLY_WORKFLOW_STALE" },
    );
  });

  it("never bypasses a mutable in-flight package", () => {
    assert.deepEqual(
      localReadOnlyWorkflowParkDecision({
        status: "running",
        createdAt: "2026-09-06T20:00:00.000Z",
        writeScopes: ["king/test"],
        nowMs: Date.parse("2026-09-06T23:00:00.000Z"),
      }),
      { park: false, reason: "MUTABLE_PACKAGE_MUST_NOT_BE_BYPASSED" },
    );
  });

  it("fails closed when tracked workflow age is unavailable", () => {
    assert.deepEqual(
      localReadOnlyWorkflowParkDecision({ status: "running", createdAt: null, writeScopes: [] }),
      { park: false, reason: "WORKFLOW_CREATED_AT_MISSING_FAIL_CLOSED" },
    );
  });

  it("parks terminal local provider failure without retrying a duplicate", () => {
    assert.deepEqual(
      localReadOnlyWorkflowParkDecision({ status: "errored", createdAt: null, writeScopes: [] }),
      { park: true, reason: "LOCAL_WORKFLOW_ERRORED" },
    );
  });
});
