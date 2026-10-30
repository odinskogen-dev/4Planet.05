/**
 * UNESCO Open Data returns country fields as JSON-encoded lists, for example
 * iso_codes = '["NO"]' or '["NO","SE"]' and states_names = ['["Norway"]'].
 * Splitting on separators alone left the brackets and quotes on each token,
 * so no record ever matched and every country showed 0 World Heritage sites.
 * This reads the codes and names as plain tokens. Pure, no imports.
 */
export function unescoTokens(value: string | undefined): string[] {
  return String(value ?? "")
    .toUpperCase()
    .split(/[\[\]",;|/]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function unescoRecordMatchesCountry(x: { iso2?: string; country?: string }, iso2: string, name: string): boolean {
  const code = iso2.toUpperCase();
  if (unescoTokens(x.iso2).flatMap((t) => t.split(/\s+/)).includes(code)) return true;
  const n = name.toUpperCase();
  return unescoTokens(x.country).includes(n);
}
