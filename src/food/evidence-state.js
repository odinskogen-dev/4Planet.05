export const EVIDENCE_STATES = Object.freeze(["OBSERVED", "MODELLED", "CACHED", "UNKNOWN", "UNAVAILABLE"]);
const STATE_SET = new Set(EVIDENCE_STATES);
export const isEvidenceState = (value) => STATE_SET.has(value);
export const evidenceState = (value, fallback = "UNKNOWN") => isEvidenceState(value) ? value : fallback;
export function sourceEvidenceState({ available = false, cached = false, modelled = false } = {}) { if (!available) return "UNAVAILABLE"; if (modelled) return "MODELLED"; if (cached) return "CACHED"; return "OBSERVED"; }
export const unknownEvidence = (reason = "Evidence has not been established.") => ({ state: "UNKNOWN", reason });
export const unavailableEvidence = (reason = "Evidence source is unavailable.") => ({ state: "UNAVAILABLE", reason });
export function assertEvidenceState(value) { if (!isEvidenceState(value)) throw new TypeError(`Invalid evidence state: ${String(value)}`); return value; }
