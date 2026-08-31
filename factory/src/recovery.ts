import type { WorkPackage } from "./contracts";

export const DEFAULT_IN_FLIGHT_LEASE_MS = 30 * 60 * 1000;

export interface InFlightRecoveryInput {
  status: WorkPackage["status"];
  updatedAt: string;
  hasRecordedOutcome: boolean;
}

export type InFlightRecoveryDecision = "LEAVE" | "FINALIZE_RECORDED_OUTCOME" | "RECOVER_TO_READY";

/**
 * Pure recovery policy for durable workflow interruption.
 *
 * A recorded outcome always wins: re-finalize it idempotently rather than
 * re-running external evidence collection. Otherwise only stale DISPATCHED or
 * RUNNING packages are eligible to return to READY. Fresh work is untouched.
 */
export function decideInFlightRecovery(
  input: InFlightRecoveryInput,
  now = Date.now(),
  leaseMs = DEFAULT_IN_FLIGHT_LEASE_MS,
): InFlightRecoveryDecision {
  if (input.status !== "DISPATCHED" && input.status !== "RUNNING") return "LEAVE";
  if (input.hasRecordedOutcome) return "FINALIZE_RECORDED_OUTCOME";

  const updatedAtMs = Date.parse(input.updatedAt);
  if (!Number.isFinite(updatedAtMs)) return "RECOVER_TO_READY";
  if (updatedAtMs > now + 5 * 60 * 1000) return "LEAVE";
  return now - updatedAtMs >= leaseMs ? "RECOVER_TO_READY" : "LEAVE";
}
