export type CompanyBrainRecoveryKind = "twin" | "ledger";

export const ANONYMOUS_COMPANY_BRAIN_SCOPE = "anonymous";

export function companyBrainPersonScope(userId: string) {
  const normalized = userId.trim();
  return normalized ? `person:${normalized}` : ANONYMOUS_COMPANY_BRAIN_SCOPE;
}

function storageSegment(value: string) {
  return encodeURIComponent(value.trim().toLowerCase());
}

export function companyBrainRecoveryKey(
  kind: CompanyBrainRecoveryKind,
  actorScope: string,
  companyIdentity: string,
) {
  const scope = actorScope.trim() || ANONYMOUS_COMPANY_BRAIN_SCOPE;
  return `4brands:${kind}:${storageSegment(scope)}:${storageSegment(companyIdentity)}`;
}
