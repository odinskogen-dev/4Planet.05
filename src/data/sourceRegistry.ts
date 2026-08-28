import type { RefreshableSourceRecord, SourceRefreshStatus, SourceVerificationState } from "./sourceRefresh";

export type LearningObjectType =
  | "SPECIES"
  | "ECOSYSTEM"
  | "PLACE"
  | "ACTOR"
  | "COMPANY"
  | "SOLUTION"
  | "PRESSURE"
  | "RESEARCH";

export type SourceEvidenceClass = "INDEPENDENT" | "ENTITY_REPORTED" | "PUBLIC_AUTHORITY" | "SCIENTIFIC_INFRASTRUCTURE";
export type SourceRegistryState = SourceRefreshStatus | "NOT_REFRESHED";

export interface LearningSourceRecord extends RefreshableSourceRecord {
  provider: string;
  canonicalLocator: string;
  providerId?: string;
  evidenceClass: SourceEvidenceClass;
  objectRefs: readonly { objectId: string; objectType: LearningObjectType }[];
  refreshPolicy: "LIVE_ADAPTER" | "PERIODIC_MANUAL" | "EVENT_DRIVEN";
  nextCheck?: string;
  limitations: readonly string[];
}

export interface SourceRegistryRow {
  sourceId: string;
  provider: string;
  canonicalLocator: string;
  evidenceClass: SourceEvidenceClass;
  objectRefs: LearningSourceRecord["objectRefs"];
  lastChecked: string;
  currentState: SourceRegistryState;
  verification: SourceVerificationState | "NOT_REFRESHED";
  version?: string;
  fingerprint?: string;
  openReview: boolean;
  historyCount: number;
  refreshPolicy: LearningSourceRecord["refreshPolicy"];
  nextCheck?: string;
  limitations: readonly string[];
}

export interface SourceRegistryHealth {
  totalSources: number;
  refreshCapableSources: number;
  refreshCapablePercent: number;
  staleSources: number;
  openReviewCount: number;
  brokenLineageCount: number;
  knownParallelTruthPaths: number;
}

export const buildSourceRegistry = (records: readonly LearningSourceRecord[]): readonly SourceRegistryRow[] =>
  Object.freeze(records.map((record) => {
    const last = record.lastRefresh;
    return Object.freeze({
      sourceId: record.id,
      provider: record.provider,
      canonicalLocator: record.canonicalLocator,
      evidenceClass: record.evidenceClass,
      objectRefs: record.objectRefs,
      lastChecked: last?.checkedAt ?? record.checkedAt,
      currentState: last?.status ?? "NOT_REFRESHED",
      verification: last?.verification ?? "NOT_REFRESHED",
      version: last?.sourceVersion ?? record.sourceVersion,
      fingerprint: last?.fingerprint ?? record.sourceFingerprint,
      openReview: last?.verification === "REVIEW_REQUIRED",
      historyCount: record.refreshHistory?.length ?? 0,
      refreshPolicy: record.refreshPolicy,
      nextCheck: record.nextCheck,
      limitations: record.limitations,
    }));
  }));

export const calculateSourceRegistryHealth = (
  rows: readonly SourceRegistryRow[],
  nowIso: string,
  knownParallelTruthPaths = 0,
): SourceRegistryHealth => {
  const now = Date.parse(nowIso);
  const refreshCapableSources = rows.filter((row) => row.refreshPolicy === "LIVE_ADAPTER").length;
  const staleSources = rows.filter((row) => row.nextCheck && Date.parse(row.nextCheck) < now).length;
  const brokenLineageCount = rows.filter((row) => row.objectRefs.length === 0 || !row.canonicalLocator).length;
  return {
    totalSources: rows.length,
    refreshCapableSources,
    refreshCapablePercent: rows.length ? Math.round((refreshCapableSources / rows.length) * 1000) / 10 : 0,
    staleSources,
    openReviewCount: rows.filter((row) => row.openReview).length,
    brokenLineageCount,
    knownParallelTruthPaths,
  };
};
