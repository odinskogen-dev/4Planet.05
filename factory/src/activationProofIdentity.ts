const SHA_40 = /^[0-9a-f]{40}$/i;

export const ACTIVATION_PROOF_BASE_IDS = [
  "factory-real-species-evidence-affordance-01",
  "factory-real-bay-accessibility-01",
  "factory-real-actor-relationship-a11y-01",
] as const;

export function activationProofBuildKey(buildSha: string): string {
  const clean = buildSha.trim().toLowerCase();
  if (!SHA_40.test(clean)) throw new Error("ACTIVATION_PROOF_BUILD_SHA_INVALID");
  return clean.slice(0, 12);
}

export function activationProofId(baseId: string, buildSha: string): string {
  const key = activationProofBuildKey(buildSha);
  if (!/-01$/.test(baseId)) throw new Error("ACTIVATION_PROOF_BASE_ID_INVALID");
  return baseId.replace(/-01$/, `-${key}`);
}

export function activationProofIds(buildSha: string): string[] {
  return ACTIVATION_PROOF_BASE_IDS.map((id) => activationProofId(id, buildSha));
}

/**
 * A previous build's outcome can never satisfy a new build's activation proof.
 * This is both an idempotency rule and a stale-evidence boundary.
 */
export function isCurrentActivationProofId(id: string, buildSha: string): boolean {
  return activationProofIds(buildSha).includes(id);
}
