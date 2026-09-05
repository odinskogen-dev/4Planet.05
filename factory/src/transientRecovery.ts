import type { Outcome, WorkPackage } from "./contracts";

export const DEFAULT_SHADOW_QUEUE_LEASE_MS = 30 * 60 * 1000;

export function isTransientCapacityOutcome(outcome: Outcome): boolean {
  return outcome.status === "BLOCKED" && outcome.evidence.some((item) => /^HTTP 429$/i.test(item.trim()));
}

export function retryableTransientCapacityPackage(pkg: WorkPackage, outcome: Outcome): WorkPackage | undefined {
  if (!isTransientCapacityOutcome(outcome)) return undefined;
  return { ...pkg, status: "READY" };
}

export type ShadowQueueRecoveryDecision = "LEAVE" | "RECOVER_TO_READY";

/**
 * Queue-delivered Orchestra work is not represented by a durable Workflow
 * instance, so the generic workflow recovery contract cannot prove terminal
 * execution for it. In SHADOW only, a bounded queue package may be requeued
 * after a conservative lease when it is still RUNNING, has no persisted
 * outcome, and its durable row timestamp is sane and stale.
 *
 * This never classifies the package as successful or failed. It only restores
 * retry eligibility for read-only Orchestra evidence collection. Same package
 * IDs keep at-least-once duplicate delivery idempotent at the outcome boundary.
 */
export function decideStaleShadowQueueRecovery(
  input: { status: WorkPackage["status"]; updatedAt: string; hasRecordedOutcome: boolean },
  now = Date.now(),
  leaseMs = DEFAULT_SHADOW_QUEUE_LEASE_MS,
): ShadowQueueRecoveryDecision {
  if (input.status !== "RUNNING") return "LEAVE";
  if (input.hasRecordedOutcome) return "LEAVE";

  const updatedAtMs = Date.parse(input.updatedAt);
  if (!Number.isFinite(updatedAtMs)) return "LEAVE";
  if (updatedAtMs > now + 5 * 60 * 1000) return "LEAVE";
  if (now - updatedAtMs < leaseMs) return "LEAVE";
  return "RECOVER_TO_READY";
}
