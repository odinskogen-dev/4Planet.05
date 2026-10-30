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
const ALLOWED_INPUT_KEYS = new Set<keyof OslofjordFieldObservationInput>([
  "recordId",
  "observedAt",
  "siteRef",
  "publicGeography",
  "sitePermissionRef",
  "methodRef",
  "sourceRef",
  "observerRef",
  "observation",
  "limitations",
]);
const PERMISSION_DENIAL = /^(?:denied|no[_ -]?permission|not[_ -]?granted|refused)$/i;

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

  for (const key of Object.keys(raw)) {
    if (!ALLOWED_INPUT_KEYS.has(key as keyof OslofjordFieldObservationInput)) reasons.push(`unknown:${key}`);
  }

  if (typeof raw.sitePermissionRef === "string" && PERMISSION_DENIAL.test(raw.sitePermissionRef.trim())) {
    reasons.push("denied:sitePermissionRef");
  }

  if (reasons.length > 0) return { admitted: false, reasons };

  return {
    admitted: true,
    record: {
      recordId: raw.recordId as string,
      observedAt: raw.observedAt as string,
      siteRef: raw.siteRef as string,
      publicGeography: raw.publicGeography as string,
      sitePermissionRef: raw.sitePermissionRef as string,
      methodRef: raw.methodRef as string,
      sourceRef: raw.sourceRef as string,
      observerRef: raw.observerRef as string,
      observation: raw.observation as string,
      limitations: [...(raw.limitations as string[])],
      evidenceClass: "FIELD_OBSERVATION",
      claimBoundary: "OBSERVATION_ONLY_NO_DELIVERY_RECOVERY_CAUSALITY_OR_IMPACT",
    },
  };
}
