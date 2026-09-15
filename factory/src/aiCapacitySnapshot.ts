export type AiCapacityDecision = "AVAILABLE" | "DAILY_CAP" | "MONTHLY_CAP" | "INVALID";

export interface AiCapacitySnapshotInput {
  utcDay: string;
  utcMonth: string;
  requestedCalls: number;
  dayReserved: number;
  monthReserved: number;
  dayCap: number;
  monthCap: number;
}

export interface AiCapacitySnapshot extends AiCapacitySnapshotInput {
  dayRemaining: number;
  monthRemaining: number;
  decision: AiCapacityDecision;
  allowed: boolean;
  readOnly: true;
}

function nonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Pure, read-only capacity classification. This function never reserves or
 * mutates capacity; it only interprets persisted usage from the same tables
 * used by the reservation path.
 */
export function buildAiCapacitySnapshot(input: AiCapacitySnapshotInput): AiCapacitySnapshot {
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(input.utcDay)
    && /^\d{4}-\d{2}$/.test(input.utcMonth)
    && nonNegativeInteger(input.requestedCalls)
    && input.requestedCalls > 0
    && nonNegativeInteger(input.dayReserved)
    && nonNegativeInteger(input.monthReserved)
    && nonNegativeInteger(input.dayCap)
    && nonNegativeInteger(input.monthCap);

  const dayRemaining = Math.max(0, input.dayCap - input.dayReserved);
  const monthRemaining = Math.max(0, input.monthCap - input.monthReserved);

  if (!valid) {
    return { ...input, dayRemaining, monthRemaining, decision: "INVALID", allowed: false, readOnly: true };
  }
  if (input.dayReserved + input.requestedCalls > input.dayCap) {
    return { ...input, dayRemaining, monthRemaining, decision: "DAILY_CAP", allowed: false, readOnly: true };
  }
  if (input.monthReserved + input.requestedCalls > input.monthCap) {
    return { ...input, dayRemaining, monthRemaining, decision: "MONTHLY_CAP", allowed: false, readOnly: true };
  }
  return { ...input, dayRemaining, monthRemaining, decision: "AVAILABLE", allowed: true, readOnly: true };
}
