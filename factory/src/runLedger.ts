export type RunState =
  | "QUEUED"
  | "LEASED"
  | "RUNNING"
  | "TESTING"
  | "EVALUATING"
  | "CORRECTING"
  | "PROVEN"
  | "ACCEPTED"
  | "REJECTED"
  | "BLOCKED"
  | "PARKED";

export interface RunLedgerEntry {
  runId: string;
  workPackageId: string;
  attemptId: string;
  idempotencyKey: string;
  inputStateHash: string;
  expectedBaseSha?: string;
  workerId?: string;
  leaseGeneration?: number;
  state: RunState;
  createdAt: string;
  startedAt?: string;
  lastProgressAt: string;
  finishedAt?: string;
  resultRef?: string;
  failureCode?: string;
}

const TERMINAL = new Set<RunState>(["ACCEPTED", "REJECTED", "BLOCKED", "PARKED"]);

const ALLOWED: Record<RunState, ReadonlySet<RunState>> = {
  QUEUED: new Set(["LEASED", "BLOCKED", "PARKED"]),
  LEASED: new Set(["RUNNING", "QUEUED", "BLOCKED", "PARKED"]),
  RUNNING: new Set(["TESTING", "CORRECTING", "BLOCKED", "PARKED"]),
  TESTING: new Set(["EVALUATING", "CORRECTING", "BLOCKED", "PARKED"]),
  EVALUATING: new Set(["PROVEN", "CORRECTING", "REJECTED", "BLOCKED", "PARKED"]),
  CORRECTING: new Set(["RUNNING", "TESTING", "BLOCKED", "PARKED"]),
  PROVEN: new Set(["ACCEPTED", "REJECTED", "BLOCKED", "PARKED"]),
  ACCEPTED: new Set(),
  REJECTED: new Set(),
  BLOCKED: new Set(),
  PARKED: new Set(),
};

export function isTerminalRunState(state: RunState): boolean {
  return TERMINAL.has(state);
}

export function canTransitionRun(from: RunState, to: RunState): boolean {
  return ALLOWED[from].has(to);
}

export function transitionRun(
  entry: RunLedgerEntry,
  to: RunState,
  values: Partial<Pick<RunLedgerEntry, "workerId" | "leaseGeneration" | "resultRef" | "failureCode">> = {},
  nowIso = new Date().toISOString(),
): RunLedgerEntry {
  if (!canTransitionRun(entry.state, to)) {
    throw new Error(`RUN_TRANSITION_FORBIDDEN:${entry.state}->${to}`);
  }
  if (!Number.isFinite(Date.parse(nowIso))) throw new Error("RUN_TIMESTAMP_INVALID");
  const startedAt = entry.startedAt ?? (to === "RUNNING" ? nowIso : undefined);
  const finishedAt = TERMINAL.has(to) ? nowIso : undefined;
  return {
    ...entry,
    ...values,
    state: to,
    startedAt,
    lastProgressAt: nowIso,
    finishedAt,
  };
}

export function sameRunIdentity(
  entry: Pick<RunLedgerEntry, "idempotencyKey" | "inputStateHash" | "expectedBaseSha">,
  incoming: Pick<RunLedgerEntry, "idempotencyKey" | "inputStateHash" | "expectedBaseSha">,
): "SAME_EXECUTION" | "STATE_CHANGED" | "DIFFERENT_WORK" {
  if (entry.idempotencyKey !== incoming.idempotencyKey) return "DIFFERENT_WORK";
  if (entry.inputStateHash !== incoming.inputStateHash || entry.expectedBaseSha !== incoming.expectedBaseSha) return "STATE_CHANGED";
  return "SAME_EXECUTION";
}

/**
 * At-least-once delivery: a duplicate terminal run is replay-safe; a duplicate
 * active run is ignored by the dispatcher; the same idempotency key against a
 * changed state must become a new run instead of inheriting old evidence.
 */
export function duplicateDeliveryDecision(
  existing: RunLedgerEntry | undefined,
  incoming: Pick<RunLedgerEntry, "idempotencyKey" | "inputStateHash" | "expectedBaseSha">,
): "START_NEW" | "RETURN_TERMINAL" | "IGNORE_DUPLICATE_ACTIVE" | "RECOMPILE_NEW_RUN" {
  if (!existing) return "START_NEW";
  const identity = sameRunIdentity(existing, incoming);
  if (identity === "DIFFERENT_WORK") return "START_NEW";
  if (identity === "STATE_CHANGED") return "RECOMPILE_NEW_RUN";
  return TERMINAL.has(existing.state) ? "RETURN_TERMINAL" : "IGNORE_DUPLICATE_ACTIVE";
}

export function createRunEntry(input: Omit<RunLedgerEntry, "state" | "lastProgressAt">, nowIso = input.createdAt): RunLedgerEntry {
  if (!input.runId || !input.workPackageId || !input.attemptId || !input.idempotencyKey || !input.inputStateHash) {
    throw new Error("RUN_IDENTITY_INCOMPLETE");
  }
  if (!Number.isFinite(Date.parse(nowIso))) throw new Error("RUN_TIMESTAMP_INVALID");
  return { ...input, state: "QUEUED", lastProgressAt: nowIso };
}
