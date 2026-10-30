/**
 * Fail-closed admission for a real Oslofjord field observation.
 *
 * This is a projection over source evidence, not a field register and not
 * authority to publish a location or claim delivery, recovery or impact.
 */
export interface OslofjordFieldObservationInput {
  recordId: string;
  observedAt: string;
  siteRef: string;
  publicGeography: string;
  sitePermissionRef: string;
  methodRef: string;
  sourceRef: string;
  observerRef: string;
  observation: string;
  limitations: string[];
}

export interface AdmittedOslofjordFieldObservation extends OslofjordFieldObservationInput {
  evidenceClass: "FIELD_OBSERVATION";
  claimBoundary: "OBSERVATION_ONLY_NO_DELIVERY_RECOVERY_CAUSALITY_OR_IMPACT";
}

export type OslofjordFieldEvidenceAdmission =
  | { admitted: true; record: AdmittedOslofjordFieldObservation }
  | { admitted: false; reasons: string[] };

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const REQUIRED_TEXT: Array<keyof OslofjordFieldObservationInput> = [
  "recordId",
  "siteRef",
  "publicGeography",
  "sitePermissionRef",
  "methodRef",
  "sourceRef",
  "observerRef",
  "observation",
];
const FORBIDDEN_CLAIM_KEYS = [
  "deliveryClaim",
  "survivalClaim",
  "recoveryClaim",
  "biodiversityGainClaim",
  "causalOutcomeClaim",
  "impactClaim",
] as const;

export function admitOslofjordFieldObservation(
  candidate: OslofjordFieldObservationInput | Record<string, unknown>,
  now = Date.now(),
): OslofjordFieldEvidenceAdmission {
  const reasons: string[] = [];
  const raw = candidate as Record<string, unknown>;

  for (const field of REQUIRED_TEXT) {
    if (typeof raw[field] !== "string" || raw[field].trim().length === 0) reasons.push(`missing:${field}`);
  }

  if (typeof raw.observedAt !== "string" || !ISO_TIMESTAMP.test(raw.observedAt)) {
    reasons.push("invalid:observedAt");
  } else {
    const observedAt = Date.parse(raw.observedAt);
    if (!Number.isFinite(observedAt) || observedAt > now) reasons.push("invalid:observedAt");
  }

  if (!Array.isArray(raw.limitations) || raw.limitations.length === 0 || raw.limitations.some(
    (limitation) => typeof limitation !== "string" || limitation.trim().length === 0,
  )) reasons.push("missing:limitations");

  for (const key of FORBIDDEN_CLAIM_KEYS) {
    if (key in raw) reasons.push(`forbidden:${key}`);
  }

  if (reasons.length > 0) return { admitted: false, reasons };

  const input = candidate as OslofjordFieldObservationInput;
  return {
    admitted: true,
    record: {
      ...input,
      evidenceClass: "FIELD_OBSERVATION",
      claimBoundary: "OBSERVATION_ONLY_NO_DELIVERY_RECOVERY_CAUSALITY_OR_IMPACT",
    },
  };
}
