export type SourceRefreshStatus = "UNCHANGED" | "CHANGED" | "CONFLICT" | "UNAVAILABLE";
export type SourceVerificationState = "VERIFIED" | "REVIEW_REQUIRED";
export type SourceTruthEffect = "NONE" | "UPDATE" | "REVIEW_REQUIRED";
export type SourceFingerprintMethod = "SEMANTIC_VERSION" | "CONTENT_SHA256" | "PROVIDER_VERSION";

export interface SourceRefreshSnapshot {
  checkedAt: string;
  fingerprint: string;
  fingerprintMethod: SourceFingerprintMethod;
  sourceVersion?: string;
  verification: SourceVerificationState;
  available: boolean;
  conflict?: string;
}

export interface SourceRefreshState {
  status: SourceRefreshStatus;
  checkedAt: string;
  fingerprint: string;
  fingerprintMethod: SourceFingerprintMethod;
  sourceVersion?: string;
  verification: SourceVerificationState;
  truthEffect: SourceTruthEffect;
  previousFingerprint?: string;
  note: string;
}

export interface RefreshableSourceRecord {
  id: string;
  checkedAt: string;
  sourceFingerprint?: string;
  sourceFingerprintMethod?: SourceFingerprintMethod;
  sourceVersion?: string;
  lastRefresh?: SourceRefreshState;
}

export interface SourceRefreshResult<T extends RefreshableSourceRecord> {
  record: T;
  audit: SourceRefreshState;
  publicUpdateAllowed: boolean;
}

/**
 * Fail-closed refresh evaluation for canonical source records.
 *
 * This function detects whether a provider snapshot differs from the fingerprint
 * already attached to the object. It never infers truth from the change itself:
 * a changed source can update the public object only after explicit verification.
 * Unavailable/conflicting/unverified states preserve the existing public record.
 */
export function evaluateSourceRefresh<T extends RefreshableSourceRecord>(
  record: T,
  snapshot: SourceRefreshSnapshot,
): SourceRefreshResult<T> {
  const previousFingerprint = record.sourceFingerprint;

  if (!snapshot.available) {
    const audit: SourceRefreshState = {
      status: "UNAVAILABLE",
      checkedAt: snapshot.checkedAt,
      fingerprint: snapshot.fingerprint,
      fingerprintMethod: snapshot.fingerprintMethod,
      sourceVersion: snapshot.sourceVersion,
      verification: "REVIEW_REQUIRED",
      truthEffect: "REVIEW_REQUIRED",
      previousFingerprint,
      note: "Source could not be verified. Existing public evidence remains unchanged.",
    };
    return { record: { ...record, lastRefresh: audit }, audit, publicUpdateAllowed: false };
  }

  if (snapshot.conflict) {
    const audit: SourceRefreshState = {
      status: "CONFLICT",
      checkedAt: snapshot.checkedAt,
      fingerprint: snapshot.fingerprint,
      fingerprintMethod: snapshot.fingerprintMethod,
      sourceVersion: snapshot.sourceVersion,
      verification: "REVIEW_REQUIRED",
      truthEffect: "REVIEW_REQUIRED",
      previousFingerprint,
      note: `Conflicting source state: ${snapshot.conflict}. Existing public evidence remains unchanged.`,
    };
    return { record: { ...record, lastRefresh: audit }, audit, publicUpdateAllowed: false };
  }

  const changed = Boolean(previousFingerprint) && previousFingerprint !== snapshot.fingerprint;

  if (!changed) {
    const audit: SourceRefreshState = {
      status: "UNCHANGED",
      checkedAt: snapshot.checkedAt,
      fingerprint: snapshot.fingerprint,
      fingerprintMethod: snapshot.fingerprintMethod,
      sourceVersion: snapshot.sourceVersion,
      verification: snapshot.verification,
      truthEffect: "NONE",
      previousFingerprint,
      note: "Source checked; no provider-version/fingerprint change detected.",
    };
    return {
      record: {
        ...record,
        checkedAt: snapshot.checkedAt,
        sourceFingerprint: snapshot.fingerprint,
        sourceFingerprintMethod: snapshot.fingerprintMethod,
        sourceVersion: snapshot.sourceVersion ?? record.sourceVersion,
        lastRefresh: audit,
      },
      audit,
      publicUpdateAllowed: false,
    };
  }

  if (snapshot.verification !== "VERIFIED") {
    const audit: SourceRefreshState = {
      status: "CHANGED",
      checkedAt: snapshot.checkedAt,
      fingerprint: snapshot.fingerprint,
      fingerprintMethod: snapshot.fingerprintMethod,
      sourceVersion: snapshot.sourceVersion,
      verification: "REVIEW_REQUIRED",
      truthEffect: "REVIEW_REQUIRED",
      previousFingerprint,
      note: "A source change was detected but is not verified. Existing public evidence remains unchanged.",
    };
    return { record: { ...record, lastRefresh: audit }, audit, publicUpdateAllowed: false };
  }

  const audit: SourceRefreshState = {
    status: "CHANGED",
    checkedAt: snapshot.checkedAt,
    fingerprint: snapshot.fingerprint,
    fingerprintMethod: snapshot.fingerprintMethod,
    sourceVersion: snapshot.sourceVersion,
    verification: "VERIFIED",
    truthEffect: "UPDATE",
    previousFingerprint,
    note: "Verified provider change. Source metadata may propagate; claim/content changes still require their own evidence review.",
  };

  return {
    record: {
      ...record,
      checkedAt: snapshot.checkedAt,
      sourceFingerprint: snapshot.fingerprint,
      sourceFingerprintMethod: snapshot.fingerprintMethod,
      sourceVersion: snapshot.sourceVersion ?? record.sourceVersion,
      lastRefresh: audit,
    },
    audit,
    publicUpdateAllowed: true,
  };
}
