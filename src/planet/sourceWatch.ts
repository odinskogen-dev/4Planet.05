/*
  4PLANET_ — SOURCE CHANGE / WATCH CONTRACT

  A Follow is intent. A source snapshot is evidence of what 4PLANET actually
  observed at a source check. A Return Object exists only when a later source
  check differs in a way the query contract can support. First check establishes
  a baseline and never fabricates an alert. This module is local-first and does
  not claim notification delivery.

  IMPORTANT: absence from a bounded/rolling response is not evidence that a
  source record was deleted. Removal events are therefore emitted only when the
  snapshot contract explicitly represents a COMPLETE_SET.
*/

const STORAGE_KEY = "4planet.source-watch.v2";

export interface SourceWatchRecord {
  id: string;
  fingerprint: string;
  occurredAt?: string;
  sourceUrl?: string;
  label: string;
}

export type SourceSnapshotCoverage = "COMPLETE_SET" | "BOUNDED_WINDOW";

export interface SourceSnapshot {
  version: "4PLANET_SOURCE_SNAPSHOT_V2";
  entityId: string;
  sourceId: string;
  queryKey: string;
  checkedAt: string;
  coverage: SourceSnapshotCoverage;
  records: SourceWatchRecord[];
}

export interface SourceChange {
  kind: "ADDED" | "UPDATED" | "REMOVED_FROM_SOURCE_RESPONSE";
  record: SourceWatchRecord;
  previous?: SourceWatchRecord;
}

export type ReconcileResult =
  | { state: "BASELINE_ESTABLISHED"; snapshot: SourceSnapshot; changes: [] }
  | { state: "NO_CHANGE"; snapshot: SourceSnapshot; previousCheckedAt: string; changes: [] }
  | { state: "SOURCE_CHANGED"; snapshot: SourceSnapshot; previousCheckedAt: string; changes: SourceChange[] }
  | { state: "STORAGE_UNAVAILABLE"; snapshot: SourceSnapshot; changes: [] };

type SnapshotStore = Record<string, SourceSnapshot>;

const keyFor = (entityId: string, sourceId: string, queryKey: string) => `${entityId}::${sourceId}::${queryKey}`;

const readStore = (): SnapshotStore | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return null;
  }
};

const writeStore = (store: SnapshotStore) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
};

export function reconcileSourceSnapshot(input: Omit<SourceSnapshot, "version">): ReconcileResult {
  const snapshot: SourceSnapshot = { version: "4PLANET_SOURCE_SNAPSHOT_V2", ...input };
  const store = readStore();
  if (!store) return { state: "STORAGE_UNAVAILABLE", snapshot, changes: [] };

  const storeKey = keyFor(input.entityId, input.sourceId, input.queryKey);
  const previous = store[storeKey];
  store[storeKey] = snapshot;
  if (!writeStore(store)) return { state: "STORAGE_UNAVAILABLE", snapshot, changes: [] };
  if (!previous) return { state: "BASELINE_ESTABLISHED", snapshot, changes: [] };

  const before = new Map(previous.records.map((record) => [record.id, record]));
  const after = new Map(snapshot.records.map((record) => [record.id, record]));
  const changes: SourceChange[] = [];

  for (const record of after.values()) {
    const old = before.get(record.id);
    if (!old) changes.push({ kind: "ADDED", record });
    else if (old.fingerprint !== record.fingerprint) changes.push({ kind: "UPDATED", record, previous: old });
  }

  // Only a complete-set query can support a removal assertion. A capped source
  // window can churn because of ordering, pagination or new records, so absence
  // from that response is deliberately ignored rather than promoted to change.
  if (previous.coverage === "COMPLETE_SET" && snapshot.coverage === "COMPLETE_SET") {
    for (const record of before.values()) {
      if (!after.has(record.id)) changes.push({ kind: "REMOVED_FROM_SOURCE_RESPONSE", record });
    }
  }

  return changes.length
    ? { state: "SOURCE_CHANGED", snapshot, previousCheckedAt: previous.checkedAt, changes }
    : { state: "NO_CHANGE", snapshot, previousCheckedAt: previous.checkedAt, changes: [] };
}

export function clearSourceSnapshot(entityId: string, sourceId: string, queryKey: string) {
  const store = readStore();
  if (!store) return false;
  delete store[keyFor(entityId, sourceId, queryKey)];
  return writeStore(store);
}

export const sourceWatchStorageKey = STORAGE_KEY;
