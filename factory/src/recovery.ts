import type { WorkPackage } from "./contracts";

export const DEFAULT_IN_FLIGHT_LEASE_MS = 30 * 60 * 1000;

export interface InFlightRecoveryInput {
  status: WorkPackage["status"];
  updatedAt: string;
  hasRecordedOutcome: boolean;
  workflowExecutionConfirmedInactive: boolean;
}

export type InFlightRecoveryDecision = "LEAVE" | "FINALIZE_RECORDED_OUTCOME" | "RECOVER_TO_READY";

/**
 * Pure recovery policy for durable workflow interruption.
 *
 * A recorded outcome always wins: re-finalize it idempotently rather than
 * re-running external evidence collection. Otherwise stale DISPATCHED or
 * RUNNING work may return to READY only when the original workflow execution
 * is explicitly confirmed inactive. Lease expiry alone is never sufficient:
 * a slow/retrying workflow must not be duplicated by the hourly recovery pass.
 * Corrupt or implausibly future-dated lease timestamps fail closed.
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
  return input.workflowExecutionConfirmedInactive ? "RECOVER_TO_READY" : "LEAVE";
}
