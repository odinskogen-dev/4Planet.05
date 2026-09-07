export const EVIDENCE_STATES = Object.freeze([
  "OBSERVED",
  "MODELLED",
  "CACHED",
  "UNKNOWN",
  "UNAVAILABLE",
]);

const STATE_SET = new Set(EVIDENCE_STATES);

export function isEvidenceState(value) {
  return STATE_SET.has(value);
}

export function evidenceState(value, fallback = "UNKNOWN") {
  return isEvidenceState(value) ? value : fallback;
}

export function sourceEvidenceState({ available = false, cached = false, modelled = false } = {}) {
  if (!available) return "UNAVAILABLE";
  if (modelled) return "MODELLED";
  if (cached) return "CACHED";
  return "OBSERVED";
}

export function unknownEvidence(reason = "Evidence has not been established.") {
  return { state: "UNKNOWN", reason };
}

export function unavailableEvidence(reason = "Evidence source is unavailable.") {
  return { state: "UNAVAILABLE", reason };
}

export function assertEvidenceState(value) {
  if (!isEvidenceState(value)) throw new TypeError(`Invalid evidence state: ${String(value)}`);
  return value;
}
