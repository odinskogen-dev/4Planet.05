/*
  4PLANET_ — SOURCE CHANGE / WATCH CONTRACT

  A Follow is intent. A source snapshot is evidence of what 4PLANET actually
  observed at a source check. A Return Object exists only when a later source
  check differs. First check establishes a baseline and never fabricates an
  alert. This module is local-first and does not claim notification delivery.
*/

const STORAGE_KEY = "4planet.source-watch.v1";

export interface SourceWatchRecord {
  id: string;
  fingerprint: string;
  occurredAt?: string;
  sourceUrl?: string;
  label: string;
}

export interface SourceSnapshot {
  version: "4PLANET_SOURCE_SNAPSHOT_V1";
  entityId: string;
  sourceId: string;
  queryKey: string;
  checkedAt: string;
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
  const snapshot: SourceSnapshot = { version: "4PLANET_SOURCE_SNAPSHOT_V1", ...input };
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

  for (const record of snapshot.records) {
    const old = before.get(record.id);
    if (!old) changes.push({ kind: "ADDED", record });
    else if (old.fingerprint !== record.fingerprint) changes.push({ kind: "UPDATED", record, previous: old });
  }
  for (const record of previous.records) {
    if (!after.has(record.id)) changes.push({ kind: "REMOVED_FROM_SOURCE_RESPONSE", record });
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
