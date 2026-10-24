const SHA40 = /^[0-9a-f]{40}$/i;

export type CandidateCheckState = "PENDING" | "TERMINAL" | "UNKNOWN";

/**
 * Resource accounting follows the actual possibility of a model mutation.
 * - no candidate / exact-base candidate: first mutation may run => reserve
 * - material candidate with PENDING checks: execution can only re-observe => no reserve
 * - terminal or unknown material candidate: CI/browser failure may require correction => reserve
 * Unknown or malformed identity always fails closed to reservation.
 */
export function shouldReserveAiForCandidate(
  candidateHeadSha: string | undefined,
  expectedBaseSha: string,
  checkState: CandidateCheckState = "UNKNOWN",
): boolean {
  if (!SHA40.test(expectedBaseSha)) return true;
  if (!candidateHeadSha || !SHA40.test(candidateHeadSha)) return true;
  if (candidateHeadSha.toLowerCase() === expectedBaseSha.toLowerCase()) return true;
  return checkState !== "PENDING";
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
