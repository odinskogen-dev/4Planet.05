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
 * Return-camera ownership: when an explicit camera (`z` + `c`) is preserved
 * together with a `record`, that record is the canonical context-restoration
 * seam. ATLAS reconstructs the record panel without a camera move. A simultaneous
 * `entity` is only a transient panel-derived focus hint and would trigger a
 * second async focus/fit that can overwrite the saved camera. The return boundary
 * therefore omits only that redundant entity in the camera+record case. Direct
 * entity deep links and entity-only return states are preserved unchanged.
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

/**
 * Canonicalise a state specifically for cross-product return.
 *
 * `record` + explicit `z`/`c` already reconstructs both the exact camera and the
 * occurrence context. Keeping a simultaneous `entity` would make ATLAS execute
 * its generic entity focus path as well, which can asynchronously fit the map and
 * overwrite the preserved camera. Remove only that redundant focus hint. The
 * entity key remains fully supported everywhere else.
 */
export function canonicalReturnState(state: AtlasState): AtlasState {
  if (!(state.record && state.z && state.c && state.entity)) return state;
  const { entity: _redundantEntity, ...cameraOwnedRecordState } = state;
  return cameraOwnedRecordState;
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
  const state = canonicalReturnState(readAtlasState(atlasSearch));
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
  // Also canonicalise historical tokens so a stale camera+record+entity token
  // cannot reintroduce the boot-time camera race when it finally returns.
  const qIndex = decoded.indexOf("?");
  const search = qIndex >= 0 ? decoded.slice(qIndex + 1) : "";
  const cleanState = canonicalReturnState(readAtlasState(search));
  return atlasHrefFromState(cleanState);
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
  // decodeReturnTo canonicalises historical tokens on final return, including the
  // explicit-camera + record ownership rule above.
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
