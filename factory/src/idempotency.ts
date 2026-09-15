export type SideEffectKind =
  | "QUEUE_DISPATCH"
  | "WORKFLOW_START"
  | "GITHUB_BRANCH_CREATE"
  | "GITHUB_CONTENT_WRITE"
  | "GITHUB_PR_CREATE"
  | "BROWSER_CAPTURE"
  | "SANDBOX_EXECUTION";

export interface SideEffectIntent {
  workPackageId: string;
  runId: string;
  inputStateHash: string;
  kind: SideEffectKind;
  target: string;
  operationVersion: string;
}

export type SideEffectState = "STARTED" | "COMMITTED" | "FAILED_RETRYABLE" | "FAILED_FINAL";

export interface SideEffectReceipt {
  idempotencyKey: string;
  workPackageId: string;
  runId: string;
  inputStateHash: string;
  kind: SideEffectKind;
  target: string;
  operationVersion: string;
  state: SideEffectState;
  attempt: number;
  providerReceipt?: string;
  lastProgressAt: string;
  updatedAt: string;
}

function required(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`IDEMPOTENCY_INTENT_INVALID:${field}`);
  return trimmed;
}

function canonicalIntent(intent: SideEffectIntent): string {
  return JSON.stringify({
    workPackageId: required(intent.workPackageId, "workPackageId"),
    runId: required(intent.runId, "runId"),
    inputStateHash: required(intent.inputStateHash, "inputStateHash"),
    kind: intent.kind,
    target: required(intent.target, "target"),
    operationVersion: required(intent.operationVersion, "operationVersion"),
  });
}

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

/**
 * Side-effect identity is bound to the logical run AND exact input state. A new
 * TEST KING/input hash therefore cannot accidentally inherit a committed effect
 * from an older execution.
 */
export async function sideEffectIdempotencyKey(intent: SideEffectIntent): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalIntent(intent)));
  return `factory-idem-v1-${toHex(digest)}`;
}

export type ReplayDecision =
  | { action: "EXECUTE"; reason: "NO_RECEIPT" }
  | { action: "RETURN_RECORDED"; reason: "ALREADY_COMMITTED"; providerReceipt?: string }
  | { action: "WAIT"; reason: "IN_FLIGHT" }
  | { action: "RECOVER"; reason: "STALE_IN_FLIGHT" }
  | { action: "RETRY"; reason: "RETRYABLE_FAILURE" }
  | { action: "PARK"; reason: "FINAL_FAILURE" | "RETRY_BUDGET_EXHAUSTED" | "RECEIPT_MISMATCH" };

export interface ReplayPolicy {
  nowMs: number;
  staleAfterMs: number;
  maxAttempts: number;
}

function receiptMatchesIntent(receipt: SideEffectReceipt, intent: SideEffectIntent): boolean {
  return receipt.workPackageId === intent.workPackageId
    && receipt.runId === intent.runId
    && receipt.inputStateHash === intent.inputStateHash
    && receipt.kind === intent.kind
    && receipt.target === intent.target
    && receipt.operationVersion === intent.operationVersion;
}

/**
 * Deterministic at-least-once replay law. The caller must persist STARTED before
 * the external effect and COMMITTED + provider receipt after success.
 */
export function decideSideEffectReplay(
  intent: SideEffectIntent,
  receipt: SideEffectReceipt | undefined,
  policy: ReplayPolicy,
): ReplayDecision {
  if (!receipt) return { action: "EXECUTE", reason: "NO_RECEIPT" };
  if (!receiptMatchesIntent(receipt, intent)) return { action: "PARK", reason: "RECEIPT_MISMATCH" };
  if (receipt.state === "COMMITTED") {
    return { action: "RETURN_RECORDED", reason: "ALREADY_COMMITTED", providerReceipt: receipt.providerReceipt };
  }
  if (receipt.state === "FAILED_FINAL") return { action: "PARK", reason: "FINAL_FAILURE" };
  if (receipt.attempt >= policy.maxAttempts) return { action: "PARK", reason: "RETRY_BUDGET_EXHAUSTED" };
  if (receipt.state === "FAILED_RETRYABLE") return { action: "RETRY", reason: "RETRYABLE_FAILURE" };

  const lastProgress = Date.parse(receipt.lastProgressAt);
  if (!Number.isFinite(lastProgress) || policy.nowMs - lastProgress > policy.staleAfterMs) {
    return { action: "RECOVER", reason: "STALE_IN_FLIGHT" };
  }
  return { action: "WAIT", reason: "IN_FLIGHT" };
}

export function createStartedReceipt(
  intent: SideEffectIntent,
  idempotencyKey: string,
  nowIso: string,
  attempt = 1,
): SideEffectReceipt {
  canonicalIntent(intent);
  if (!idempotencyKey.startsWith("factory-idem-v1-")) throw new Error("IDEMPOTENCY_KEY_INVALID");
  if (!Number.isInteger(attempt) || attempt < 1) throw new Error("IDEMPOTENCY_ATTEMPT_INVALID");
  if (!Number.isFinite(Date.parse(nowIso))) throw new Error("IDEMPOTENCY_TIMESTAMP_INVALID");
  return {
    idempotencyKey,
    ...intent,
    state: "STARTED",
    attempt,
    lastProgressAt: nowIso,
    updatedAt: nowIso,
  };
}
