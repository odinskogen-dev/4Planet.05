import type { BatchSelection, WorkPackage } from "./contracts";

export type TrafficDisposition =
  | "RUNNING"
  | "SELECTED"
  | "WAITING_CONFLICT"
  | "QUEUED_CAPACITY"
  | "BLOCKED_CONTROL"
  | "BLOCKED"
  | "PARKED"
  | "DONE"
  | "FAILED";

export interface TrafficItem {
  workPackageId: string;
  projectId: string;
  priority: WorkPackage["priority"];
  disposition: TrafficDisposition;
  reason: string;
}

export interface TrafficControlSnapshot {
  generatedAt: string;
  total: number;
  active: number;
  waiting: number;
  blocked: number;
  done: number;
  items: TrafficItem[];
  integrity: {
    uniqueInputIds: number;
    representedIds: number;
    lostWorkPackageIds: string[];
  };
}

function controlFailureMap(batch: BatchSelection): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of batch.rejectedForControl ?? []) {
    const separator = entry.indexOf(":");
    if (separator <= 0) continue;
    map.set(entry.slice(0, separator), entry.slice(separator + 1).trim());
  }
  return map;
}

/**
 * Human-readable traffic projection over the durable Factory queue.
 *
 * This function does not mutate Work Packages. A package omitted from the
 * current execution batch remains represented explicitly as waiting/blocked;
 * current scheduling never means cancellation or deletion.
 */
export function buildTrafficControlSnapshot(
  packages: WorkPackage[],
  batch: BatchSelection,
  generatedAt = batch.generatedAt,
): TrafficControlSnapshot {
  const selected = new Set(batch.packages.map((pkg) => pkg.id));
  const conflict = new Set(batch.rejectedForConflict);
  const controlFailures = controlFailureMap(batch);
  const items: TrafficItem[] = [];

  for (const pkg of packages) {
    let disposition: TrafficDisposition;
    let reason: string;

    if (pkg.status === "DISPATCHED" || pkg.status === "RUNNING") {
      disposition = "RUNNING";
      reason = "Already in-flight in the durable Factory runtime.";
    } else if (pkg.status === "ACCEPTED") {
      disposition = "DONE";
      reason = "Accepted outcome is already recorded.";
    } else if (pkg.status === "REJECTED") {
      disposition = "FAILED";
      reason = "Rejected outcome requires correction or explicit replacement.";
    } else if (pkg.status === "BLOCKED") {
      disposition = "BLOCKED";
      reason = "Package is explicitly blocked and remains preserved.";
    } else if (pkg.status === "PARKED") {
      disposition = "PARKED";
      reason = "Package is intentionally parked and remains preserved.";
    } else if (selected.has(pkg.id)) {
      disposition = "SELECTED";
      reason = "Selected for the next conflict-free execution batch.";
    } else if (conflict.has(pkg.id)) {
      disposition = "WAITING_CONFLICT";
      reason = "Waiting because its declared write scope overlaps work selected ahead of it.";
    } else if (controlFailures.has(pkg.id)) {
      disposition = "BLOCKED_CONTROL";
      reason = controlFailures.get(pkg.id) ?? "Factory control preflight failed.";
    } else {
      disposition = "QUEUED_CAPACITY";
      reason = "Ready work is preserved in queue and waits for capacity/priority selection.";
    }

    items.push({
      workPackageId: pkg.id,
      projectId: pkg.projectId,
      priority: pkg.priority,
      disposition,
      reason,
    });
  }

  const inputIds = packages.map((pkg) => pkg.id);
  const uniqueInputIds = new Set(inputIds);
  const represented = new Set(items.map((item) => item.workPackageId));
  const lostWorkPackageIds = [...uniqueInputIds].filter((id) => !represented.has(id));

  const active = items.filter((item) => item.disposition === "RUNNING" || item.disposition === "SELECTED").length;
  const waiting = items.filter((item) => item.disposition === "WAITING_CONFLICT" || item.disposition === "QUEUED_CAPACITY").length;
  const blocked = items.filter((item) => item.disposition === "BLOCKED" || item.disposition === "BLOCKED_CONTROL" || item.disposition === "PARKED").length;
  const done = items.filter((item) => item.disposition === "DONE").length;

  return {
    generatedAt,
    total: packages.length,
    active,
    waiting,
    blocked,
    done,
    items,
    integrity: {
      uniqueInputIds: uniqueInputIds.size,
      representedIds: represented.size,
      lostWorkPackageIds,
    },
  };
}
