/**
 * Workstream B — canonical ProductContext for the Gate 1 vertical slice.
 *
 * One mechanism that preserves and reconstructs the exact prior ATLAS state so
 * SPECIES, Living Systems and WH4LES_ can return to it through visible controls,
 * without manual URL reconstruction.
 *
 * The ATLAS camera/panel state already lives in its own URL query as:
 *   m (map mode), l (layers), z (zoom), c (centre), t (theme), p (projection),
 *   lens, entity, journey, and record (the opened occurrence). We capture that
 *   whole ATLAS query, encode it into a single `returnTo` token, carry it across
 *   products, and decode it on return. (ctx was reserved earlier but never
 *   round-tripped; it is deferred — see DEFERRED KEYS below.)
 *
 * Safety: `returnTo` only ever reconstructs an internal `/atlas` destination.
 * Any attempt to encode a different path, an absolute URL or a malformed token
 * is rejected and the caller falls back to a plain `/atlas` link.
 */

/**
 * DEFERRED KEYS (not in the active schema):
 *   ctx — a context-level field was reserved in an earlier draft, but the ATLAS
 *   URL writer never wrote it and the reader never consumed it, so it round-trips
 *   nothing. Rather than ship a schema key with no behaviour, it is removed from
 *   the active contract. When a real, reconstructable context level exists in the
 *   map writer/reader, reintroduce it here with an actual read/write round-trip
 *   and test. The current entity/record/journey keys already carry the panel's
 *   subject, so no information is lost by deferring ctx.
 */
export const ATLAS_STATE_KEYS = [
  "m", "l", "z", "c", "t", "p", "lens", "entity", "journey", "record",
] as const;
export type AtlasStateKey = (typeof ATLAS_STATE_KEYS)[number];
export type AtlasState = Partial<Record<AtlasStateKey, string>>;

const RETURN_PATH = "/atlas";

/** base64url (no padding) — safe in a URL query value. */
function b64urlEncode(input: string): string {
  const b64 = btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64 + "===".slice((b64.length + 3) % 4);
  const raw = atob(pad);
  try {
    return decodeURIComponent(escape(raw));
  } catch {
    return raw;
  }
}

/** Read the current ATLAS state from a raw location.search string. */
export function readAtlasState(search: string): AtlasState {
  const p = new URLSearchParams(search);
  const out: AtlasState = {};
  ATLAS_STATE_KEYS.forEach((k) => {
    const v = p.get(k);
    if (v) out[k] = v;
  });
  return out;
}

/** Build the exact ATLAS href for a captured state (used on return). */
export function atlasHrefFromState(state: AtlasState): string {
  const p = new URLSearchParams();
  ATLAS_STATE_KEYS.forEach((k) => {
    if (state[k]) p.set(k, state[k]!);
  });
  const q = p.toString();
  return q ? `${RETURN_PATH}?${q}` : RETURN_PATH;
}

/**
 * Encode a returnTo token from the ATLAS search string. Returns "" if there is
 * no meaningful ATLAS state to preserve (so callers can omit the param).
 */
export function encodeReturnTo(atlasSearch: string): string {
  const state = readAtlasState(atlasSearch);
  if (Object.keys(state).length === 0) return "";
  const href = atlasHrefFromState(state);
  return b64urlEncode(href);
}

/**
 * Decode a returnTo token to a safe internal ATLAS href, or null if the token
 * is missing, malformed, or does not resolve to an internal /atlas destination.
 */
export function decodeReturnTo(token: string | null | undefined): string | null {
  if (!token) return null;
  let decoded: string;
  try {
    decoded = b64urlDecode(token);
  } catch {
    return null;
  }
  // Must be an internal /atlas path — never an absolute or off-site URL.
  if (!decoded.startsWith(RETURN_PATH)) return null;
  if (decoded.includes("://") || decoded.startsWith("//")) return null;
  // Re-validate: only known ATLAS keys survive, dropping anything unexpected.
  const qIndex = decoded.indexOf("?");
  const search = qIndex >= 0 ? decoded.slice(qIndex + 1) : "";
  const clean = atlasHrefFromState(readAtlasState(search));
  return clean;
}

/**
 * Append a returnTo token to a destination href (e.g. a SPECIES/LS/WH4LES link)
 * so that surface can offer a "Return to Atlas" control. No-op if empty.
 */
export function withReturnTo(destHref: string, atlasSearch: string): string {
  // Downstream products (SPECIES, Living Systems, WH4LES_) don't carry raw ATLAS
  // state — they carry the already-encoded returnTo token. If one is present and
  // valid, forward it as-is so context survives the whole chain. Only when the
  // caller holds raw ATLAS state (the ATLAS page itself) do we encode afresh.
  const existing = new URLSearchParams(atlasSearch).get("returnTo");
  const token = (existing && decodeReturnTo(existing)) ? existing : encodeReturnTo(atlasSearch);
  if (!token) return destHref;
  const sep = destHref.includes("?") ? "&" : "?";
  return `${destHref}${sep}returnTo=${token}`;
}

/** Convenience: pull a decoded, safe return href from a location.search. */
export function returnHrefFromSearch(search: string): string | null {
  const token = new URLSearchParams(search).get("returnTo");
  return decodeReturnTo(token);
}
