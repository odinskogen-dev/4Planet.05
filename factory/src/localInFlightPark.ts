export const LOCAL_IN_FLIGHT_PARK_AFTER_MS = 30 * 60 * 1000;

const TERMINAL_FAILURE = new Set(["errored", "terminated"]);
const NONTERMINAL = new Set(["queued", "running", "paused", "waiting", "complete"]);

export function localReadOnlyWorkflowParkDecision(input: {
  status: string;
  createdAt?: string | null;
  writeScopes: string[];
  nowMs?: number;
}) {
  if (input.writeScopes.length > 0) {
    return { park: false, reason: "MUTABLE_PACKAGE_MUST_NOT_BE_BYPASSED" } as const;
  }

  const status = input.status.trim().toLowerCase();
  if (TERMINAL_FAILURE.has(status)) {
    return { park: true, reason: `LOCAL_WORKFLOW_${status.toUpperCase()}` } as const;
  }
  if (!NONTERMINAL.has(status)) {
    return { park: false, reason: "UNKNOWN_WORKFLOW_STATUS_FAIL_CLOSED" } as const;
  }

  const createdAtMs = Date.parse(input.createdAt ?? "");
  if (!Number.isFinite(createdAtMs)) {
    return { park: false, reason: "WORKFLOW_CREATED_AT_MISSING_FAIL_CLOSED" } as const;
  }
  const nowMs = input.nowMs ?? Date.now();
  if (nowMs - createdAtMs >= LOCAL_IN_FLIGHT_PARK_AFTER_MS) {
    return { park: true, reason: "LOCAL_READ_ONLY_WORKFLOW_STALE" } as const;
  }
  return { park: false, reason: "WORKFLOW_STILL_WITHIN_BOUNDED_WINDOW" } as const;
}
