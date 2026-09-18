import type { WorkPackage } from "./contracts";

export const DEFAULT_IN_FLIGHT_LEASE_MS = 30 * 60 * 1000;

export type TrackedWorkflowStatus =
  | "queued"
  | "running"
  | "paused"
  | "waiting"
  | "complete"
  | "errored"
  | "terminated";

export interface InFlightRecoveryInput {
  status: WorkPackage["status"];
  updatedAt: string;
  hasRecordedOutcome: boolean;
  workflowStatus?: TrackedWorkflowStatus;
  /**
   * Compatibility-only field for the existing caller. It is deliberately NOT
   * trusted as recovery evidence; only an observed tracked workflowStatus can
   * authorize requeue.
   */
  workflowExecutionConfirmedInactive?: boolean;
}

export type InFlightRecoveryDecision = "LEAVE" | "FINALIZE_RECORDED_OUTCOME" | "RECOVER_TO_READY";

export function workflowExecutionConfirmedInactive(status: TrackedWorkflowStatus | undefined): boolean {
  return status === "complete" || status === "errored" || status === "terminated";
}

/**
 * Pure recovery policy for durable workflow interruption.
 *
 * A recorded outcome always wins: re-finalize it idempotently rather than
 * re-running external evidence collection. Otherwise stale DISPATCHED or
 * RUNNING work may return to READY only when the tracked workflow execution is
 * explicitly terminal. queued/running/paused/waiting and missing workflow
 * state fail closed. Lease expiry alone is never sufficient: a slow/retrying
 * workflow must not be duplicated by the hourly recovery pass. Corrupt or
 * implausibly future-dated lease timestamps also fail closed.
 */
export function decideInFlightRecovery(
  input: InFlightRecoveryInput,
  now = Date.now(),
  leaseMs = DEFAULT_IN_FLIGHT_LEASE_MS,
): InFlightRecoveryDecision {
  if (input.status !== "DISPATCHED" && input.status !== "RUNNING") return "LEAVE";
  if (input.hasRecordedOutcome) return "FINALIZE_RECORDED_OUTCOME";

  const updatedAtMs = Date.parse(input.updatedAt);
  if (!Number.isFinite(updatedAtMs)) return "LEAVE";
  if (updatedAtMs > now + 5 * 60 * 1000) return "LEAVE";
  if (now - updatedAtMs < leaseMs) return "LEAVE";
  return workflowExecutionConfirmedInactive(input.workflowStatus) ? "RECOVER_TO_READY" : "LEAVE";
}
