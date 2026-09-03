const SHA40 = /^[0-9a-f]{40}$/i;

/**
 * Reserve model-call capacity only when a candidate still needs its first
 * material mutation. Re-observing an already-mutated candidate is GitHub/QA
 * work and must not consume the zero-cash Workers AI reservation budget.
 * Unknown or malformed state fails closed by requiring a reservation.
 */
export function shouldReserveAiForCandidate(candidateHeadSha: string | undefined, expectedBaseSha: string): boolean {
  if (!SHA40.test(expectedBaseSha)) return true;
  if (!candidateHeadSha || !SHA40.test(candidateHeadSha)) return true;
  return candidateHeadSha.toLowerCase() === expectedBaseSha.toLowerCase();
}

export function factoryCandidateBranch(workPackageId: string, explicitBranch?: string): string {
  if (explicitBranch) return explicitBranch;
  const slug = workPackageId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return `factory-candidate-${slug}`;
}
