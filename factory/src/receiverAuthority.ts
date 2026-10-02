const SHA40 = /^[0-9a-f]{40}$/i;

export function requireCurrentReceiver(baseSha: string, currentSha: string, phase: string): string {
  const base = baseSha.trim().toLowerCase();
  const current = currentSha.trim().toLowerCase();
  if (!SHA40.test(base)) throw new Error(`TEST_KING_BASE_SHA_INVALID:${phase}`);
  if (!SHA40.test(current)) throw new Error(`CURRENT_TEST_KING_SHA_INVALID:${phase}`);
  if (current !== base) throw new Error(`TEST_KING_MOVED:${phase}:${base}->${current}`);
  return current;
}

export function receiverAuthorityCurrent(baseSha: string, currentSha: string): boolean {
  try {
    requireCurrentReceiver(baseSha, currentSha, "CHECK");
    return true;
  } catch {
    return false;
  }
}
