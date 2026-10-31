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
const DECIMAL_COORDINATE_PAIR = /(?:^|[^0-9])[-+]?(?:[0-8]?\d(?:\.\d+)?|90(?:\.0+)?)\s*[,;/]\s*[-+]?(?:(?:1[0-7]\d|[0-9]?\d)(?:\.\d+)?|180(?:\.0+)?)(?:[^0-9]|$)/;
const PRIVATE_GEOGRAPHY_MARKER = /(?:https?:\/\/|\bgeo:|\b(?:lat(?:itude)?|lon(?:gitude)?)\b|openstreetmap|maps?\.)/i;
const PLUS_CODE = /\b[A-Z0-9]{4,8}\+[A-Z0-9]{2,3}\b/i;
const OPAQUE_OBSERVER_REF = /^(?:observer|source-owned-observer)-(?:ref-)?[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/;

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

  if (typeof raw.publicGeography === "string") {
    const publicGeography = raw.publicGeography.trim();
    if (
      publicGeography.length > 160
      || DECIMAL_COORDINATE_PAIR.test(publicGeography)
      || PRIVATE_GEOGRAPHY_MARKER.test(publicGeography)
      || PLUS_CODE.test(publicGeography)
    ) reasons.push("unsafe:publicGeography");
  }

  if (typeof raw.observerRef === "string" && !OPAQUE_OBSERVER_REF.test(raw.observerRef.trim())) {
    reasons.push("unsafe:observerRef");
  }

  if (reasons.length > 0) return { admitted: false, reasons };

  return {
    admitted: true,
    record: {
      recordId: (raw.recordId as string).trim(),
      observedAt: raw.observedAt as string,
      siteRef: (raw.siteRef as string).trim(),
      publicGeography: (raw.publicGeography as string).trim(),
      sitePermissionRef: (raw.sitePermissionRef as string).trim(),
      methodRef: (raw.methodRef as string).trim(),
      sourceRef: (raw.sourceRef as string).trim(),
      observerRef: (raw.observerRef as string).trim(),
      observation: (raw.observation as string).trim(),
      limitations: (raw.limitations as string[]).map((limitation) => limitation.trim()),
      evidenceClass: "FIELD_OBSERVATION",
      claimBoundary: "OBSERVATION_ONLY_NO_DELIVERY_RECOVERY_CAUSALITY_OR_IMPACT",
    },
  };
}
