import type { Outcome, WorkPackage } from "./contracts";

export function isTransientCapacityOutcome(outcome: Outcome): boolean {
  return outcome.status === "BLOCKED" && outcome.evidence.some((item) => /^HTTP 429$/i.test(item.trim()));
}

export function retryableTransientCapacityPackage(pkg: WorkPackage, outcome: Outcome): WorkPackage | undefined {
  if (!isTransientCapacityOutcome(outcome)) return undefined;
  return { ...pkg, status: "READY" };
}
