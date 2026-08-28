export type SourceRefreshStatus = "UNCHANGED" | "CHANGED" | "CONFLICT" | "UNAVAILABLE";
export type SourceVerificationState = "VERIFIED" | "REVIEW_REQUIRED" | "REJECTED";
export type SourceTruthEffect = "NONE" | "UPDATE" | "REVIEW_REQUIRED";
export type SourceFingerprintMethod = "SEMANTIC_VERSION" | "CONTENT_SHA256" | "PROVIDER_VERSION";
export type SourceChangeScope = "METADATA_ONLY" | "CLAIM_RELEVANT" | "UNKNOWN";
export type SourceReviewDecision = "ACCEPT" | "REJECT" | "PENDING";

export interface SourceRefreshContext {
  provider?: string;
  providerId?: string;
  canonicalLocator?: string;
  canonicalObjectIds?: readonly string[];
  affectedClaimIds?: readonly string[];
  syntheticFixture?: boolean;
}

export interface SourceRefreshSnapshot {
  checkedAt: string;
  fingerprint: string;
  fingerprintMethod: SourceFingerprintMethod;
  sourceVersion?: string;
  verification: SourceVerificationState;
  available: boolean;
  conflict?: string;
  providerId?: string;
  changeScope?: SourceChangeScope;
  changedFields?: readonly string[];
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

export interface SourceRefreshAuditEntry extends SourceRefreshState {
  auditId: string;
  sourceId: string;
  provider?: string;
  providerId?: string;
  canonicalLocator?: string;
  canonicalObjectIds: readonly string[];
  affectedClaimIds: readonly string[];
  changeScope: SourceChangeScope;
  changedFields: readonly string[];
  syntheticFixture: boolean;
  decision: SourceReviewDecision;
  previousSourceVersion?: string;
  previousCheckedAt?: string;
  actionTaken: string;
  actionNotTaken: string;
}

export interface RefreshableSourceRecord {
  id: string;
  checkedAt: string;
  sourceFingerprint?: string;
  sourceFingerprintMethod?: SourceFingerprintMethod;
  sourceVersion?: string;
  providerId?: string;
  lastRefresh?: SourceRefreshState;
  refreshHistory?: readonly SourceRefreshAuditEntry[];
}

export interface SourceRefreshResult<T extends RefreshableSourceRecord> {
  record: T;
  audit: SourceRefreshAuditEntry;
  publicUpdateAllowed: boolean;
}

export interface CanonicalEvidenceObject<TSource extends RefreshableSourceRecord, TClaim = unknown> {
  id: string;
  sourceRecords: readonly TSource[];
  claims?: readonly TClaim[];
  evidenceUpdatedAt?: string;
}

export interface SourcePropagationResult<TObject> {
  object: TObject;
  propagated: boolean;
  note: string;
}

const asArray = (value?: readonly string[]) => value ? [...value] : [];

const makeAuditId = (
  sourceId: string,
  snapshot: SourceRefreshSnapshot,
  status: SourceRefreshStatus,
) => [sourceId, snapshot.checkedAt, snapshot.fingerprint, status, snapshot.verification].join("|");

const appendAudit = <T extends RefreshableSourceRecord>(
  record: T,
  audit: SourceRefreshAuditEntry,
): readonly SourceRefreshAuditEntry[] => {
  const history = record.refreshHistory ? [...record.refreshHistory] : [];
  const existing = history.find((entry) => entry.auditId === audit.auditId);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(audit)) {
      throw new Error(`Audit id collision with different content: ${audit.auditId}`);
    }
    return Object.freeze(history);
  }
  return Object.freeze([...history, Object.freeze({ ...audit })]);
};

const makeAudit = (
  record: RefreshableSourceRecord,
  snapshot: SourceRefreshSnapshot,
  status: SourceRefreshStatus,
  verification: SourceVerificationState,
  truthEffect: SourceTruthEffect,
  note: string,
  context: SourceRefreshContext,
  decision: SourceReviewDecision,
  actionTaken: string,
  actionNotTaken: string,
): SourceRefreshAuditEntry => ({
  auditId: makeAuditId(record.id, snapshot, status),
  sourceId: record.id,
  provider: context.provider,
  providerId: snapshot.providerId ?? context.providerId,
  canonicalLocator: context.canonicalLocator,
  canonicalObjectIds: asArray(context.canonicalObjectIds),
  affectedClaimIds: asArray(context.affectedClaimIds),
  status,
  checkedAt: snapshot.checkedAt,
  fingerprint: snapshot.fingerprint,
  fingerprintMethod: snapshot.fingerprintMethod,
  sourceVersion: snapshot.sourceVersion,
  verification,
  truthEffect,
  previousFingerprint: record.sourceFingerprint,
  previousSourceVersion: record.sourceVersion,
  previousCheckedAt: record.checkedAt,
  changeScope: snapshot.changeScope ?? "UNKNOWN",
  changedFields: asArray(snapshot.changedFields),
  syntheticFixture: Boolean(context.syntheticFixture),
  decision,
  note,
  actionTaken,
  actionNotTaken,
});

const resultWithAudit = <T extends RefreshableSourceRecord>(
  record: T,
  audit: SourceRefreshAuditEntry,
  publicUpdateAllowed: boolean,
  updateCurrentState: boolean,
): SourceRefreshResult<T> => {
  const refreshHistory = appendAudit(record, audit);
  const next = updateCurrentState
    ? {
        ...record,
        checkedAt: audit.checkedAt,
        sourceFingerprint: audit.fingerprint,
        sourceFingerprintMethod: audit.fingerprintMethod,
        sourceVersion: audit.sourceVersion ?? record.sourceVersion,
        providerId: audit.providerId ?? record.providerId,
        lastRefresh: audit,
        refreshHistory,
      }
    : { ...record, lastRefresh: audit, refreshHistory };
  return { record: next as T, audit, publicUpdateAllowed };
};

/**
 * Fail-closed refresh evaluation for canonical source records.
 *
 * Change detection is not truth verification. Provider changes can update public
 * source metadata only when the change is verified, metadata-only and non-synthetic.
 * Claim-relevant changes always remain review-gated here and require a separate
 * evidence/claim decision before factual content may change.
 */
export function evaluateSourceRefresh<T extends RefreshableSourceRecord>(
  record: T,
  snapshot: SourceRefreshSnapshot,
  context: SourceRefreshContext = {},
): SourceRefreshResult<T> {
  const previousFingerprint = record.sourceFingerprint;
  const previousProviderId = record.providerId ?? context.providerId;
  const nextProviderId = snapshot.providerId ?? context.providerId;

  if (snapshot.checkedAt < record.checkedAt) {
    const audit = makeAudit(
      record,
      snapshot,
      "CONFLICT",
      "REVIEW_REQUIRED",
      "REVIEW_REQUIRED",
      "A source snapshot older than the current checked state was returned. Existing public evidence remains unchanged.",
      context,
      "PENDING",
      "Recorded stale-source conflict in append-only audit history.",
      "Did not roll the source record back to an older checked state.",
    );
    return resultWithAudit(record, audit, false, false);
  }

  if (previousProviderId && nextProviderId && previousProviderId !== nextProviderId) {
    const audit = makeAudit(
      record,
      snapshot,
      "CONFLICT",
      "REVIEW_REQUIRED",
      "REVIEW_REQUIRED",
      `Provider identifier changed from ${previousProviderId} to ${nextProviderId}. Existing public evidence remains unchanged.`,
      context,
      "PENDING",
      "Recorded provider-identity conflict in append-only audit history.",
      "Did not silently rebind the canonical source to a different provider identifier.",
    );
    return resultWithAudit(record, audit, false, false);
  }

  if (!snapshot.available) {
    const audit = makeAudit(
      record,
      snapshot,
      "UNAVAILABLE",
      "REVIEW_REQUIRED",
      "REVIEW_REQUIRED",
      "Source could not be verified. Existing public evidence remains unchanged.",
      context,
      "PENDING",
      "Recorded source unavailability in append-only audit history.",
      "Did not delete, downgrade or rewrite existing public evidence.",
    );
    return resultWithAudit(record, audit, false, false);
  }

  if (snapshot.conflict) {
    const audit = makeAudit(
      record,
      snapshot,
      "CONFLICT",
      "REVIEW_REQUIRED",
      "REVIEW_REQUIRED",
      `Conflicting source state: ${snapshot.conflict}. Existing public evidence remains unchanged.`,
      context,
      "PENDING",
      "Recorded source conflict in append-only audit history.",
      "Did not resolve the conflict silently or publish a preferred interpretation.",
    );
    return resultWithAudit(record, audit, false, false);
  }

  const changed = Boolean(previousFingerprint) && previousFingerprint !== snapshot.fingerprint;
  const declaredFieldChangeWithoutFingerprintChange = !changed && Boolean(snapshot.changedFields?.length);

  if (declaredFieldChangeWithoutFingerprintChange) {
    const audit = makeAudit(
      record,
      snapshot,
      "CONFLICT",
      "REVIEW_REQUIRED",
      "REVIEW_REQUIRED",
      "Changed fields were reported without a corresponding fingerprint change. Existing public evidence remains unchanged.",
      context,
      "PENDING",
      "Recorded fingerprint/change inconsistency in append-only audit history.",
      "Did not trust either signal until the provider adapter or fingerprint contract is reviewed.",
    );
    return resultWithAudit(record, audit, false, false);
  }

  if (!changed) {
    const audit = makeAudit(
      record,
      snapshot,
      "UNCHANGED",
      snapshot.verification,
      "NONE",
      "Source checked; no provider-version/fingerprint change detected.",
      context,
      snapshot.verification === "REJECTED" ? "REJECT" : "ACCEPT",
      "Recorded successful source check and current source metadata.",
      "Did not alter any factual claim because no source change was detected.",
    );
    return resultWithAudit(record, audit, false, true);
  }

  if (snapshot.verification === "REJECTED") {
    const audit = makeAudit(
      record,
      snapshot,
      "CHANGED",
      "REJECTED",
      "NONE",
      "A source change was detected and rejected after review. Existing public evidence remains unchanged.",
      context,
      "REJECT",
      "Preserved the rejected change in append-only audit history.",
      "Did not update the canonical source fingerprint, source version or public claim state.",
    );
    return resultWithAudit(record, audit, false, false);
  }

  if (snapshot.verification !== "VERIFIED") {
    const audit = makeAudit(
      record,
      snapshot,
      "CHANGED",
      "REVIEW_REQUIRED",
      "REVIEW_REQUIRED",
      "A source change was detected but is not verified. Existing public evidence remains unchanged.",
      context,
      "PENDING",
      "Preserved the detected change in append-only audit history for review.",
      "Did not update the canonical source fingerprint, source version or any factual claim.",
    );
    return resultWithAudit(record, audit, false, false);
  }

  if (context.syntheticFixture) {
    const audit = makeAudit(
      record,
      snapshot,
      "CHANGED",
      "VERIFIED",
      "NONE",
      "Synthetic test fixture change verified for test purposes only. Synthetic fixtures are never allowed to propagate to public truth.",
      context,
      "ACCEPT",
      "Recorded the fixture result in isolated test audit history.",
      "Did not update public or canonical production truth from synthetic data.",
    );
    return resultWithAudit(record, audit, false, false);
  }

  if ((snapshot.changeScope ?? "UNKNOWN") !== "METADATA_ONLY") {
    const audit = makeAudit(
      record,
      snapshot,
      "CHANGED",
      "VERIFIED",
      "REVIEW_REQUIRED",
      "The provider change is verified, but it may affect factual claims. Claim/content changes require their own evidence review before propagation.",
      context,
      "PENDING",
      "Verified and preserved the provider change in append-only audit history.",
      "Did not update factual claims or canonical source state because the change is not proven metadata-only.",
    );
    return resultWithAudit(record, audit, false, false);
  }

  const audit = makeAudit(
    record,
    snapshot,
    "CHANGED",
    "VERIFIED",
    "UPDATE",
    "Verified metadata-only provider change. Source metadata may propagate; factual claims remain untouched.",
    context,
    "ACCEPT",
    "Updated canonical source metadata and preserved the prior state in append-only audit history.",
    "Did not alter any factual claim or infer a real-world change from a source metadata change.",
  );
  return resultWithAudit(record, audit, true, true);
}

/**
 * Propagates only an already-verified metadata-only refresh into a canonical object.
 * Claims are deliberately copied through untouched. This is the bounded proof that a
 * correction can reach a shared object without turning source change into claim change.
 */
export function propagateVerifiedSourceMetadata<
  TSource extends RefreshableSourceRecord,
  TClaim,
  TObject extends CanonicalEvidenceObject<TSource, TClaim>,
>(
  object: TObject,
  refresh: SourceRefreshResult<TSource>,
): SourcePropagationResult<TObject> {
  const audit = refresh.audit;
  if (
    !refresh.publicUpdateAllowed ||
    audit.status !== "CHANGED" ||
    audit.verification !== "VERIFIED" ||
    audit.truthEffect !== "UPDATE" ||
    audit.changeScope !== "METADATA_ONLY" ||
    audit.syntheticFixture
  ) {
    return {
      object,
      propagated: false,
      note: "Refresh did not satisfy the verified metadata-only propagation gate; canonical object remained unchanged.",
    };
  }

  const sourceIndex = object.sourceRecords.findIndex((source) => source.id === refresh.record.id);
  if (sourceIndex < 0) {
    return {
      object,
      propagated: false,
      note: "Canonical object does not contain the refreshed source record; no propagation performed.",
    };
  }

  const sourceRecords = object.sourceRecords.map((source, index) => index === sourceIndex ? refresh.record : source);
  return {
    object: {
      ...object,
      sourceRecords,
      claims: object.claims,
      evidenceUpdatedAt: audit.checkedAt,
    },
    propagated: true,
    note: "Verified source metadata propagated to the canonical object; factual claims were preserved unchanged.",
  };
}
