import type { Outcome } from "./contracts";

export function isClaudeCapacityPausedOutcome(outcome: Outcome): boolean {
  return outcome.status === "CORRECT"
    && (outcome.limitation ?? "").includes("CLAUDE_PROVIDER_CAPACITY_PAUSED")
    && (outcome.limitation ?? "").includes("preserve the exact work package")
    && outcome.actual.includes("Claude specialist provider capacity is paused");
}

export function isPendingCiOutcome(outcome: Outcome): boolean {
  if (outcome.status !== "CORRECT" || isClaudeCapacityPausedOutcome(outcome)) return false;

  const pendingCandidateCi = outcome.actual.includes("registered checks are still pending")
    && (outcome.limitation ?? "").includes("durably re-observe the same candidate");

  const pendingClaudeSpecialist = outcome.actual.includes("Claude specialist result is still pending")
    && (outcome.limitation ?? "").includes("CLAUDE_SPECIALIST_PENDING")
    && (outcome.limitation ?? "").includes("durably re-observe the same work package");

  return pendingCandidateCi || pendingClaudeSpecialist;
}
