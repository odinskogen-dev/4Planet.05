/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET IMPACT — REVIEW / TRUST MODEL (public semantics)
   Source: Founder master brief §9, 14 Oct 2026; Brand OS §21 Proof State.

   This is methodology language, not data. Which state a record holds is
   always read from NATUREBRAIN; this file only explains what each state means
   and keeps the separations explicit. There is deliberately no single
   "verified" badge.
   ═══════════════════════════════════════════════════════════════════════════ */

export type ReviewStateKey =
  | "DISCOVERED"
  | "SOURCE-CHECKED"
  | "EXTERNALLY VETTED"
  | "4PLANET REVIEWED"
  | "PARTNER"
  | "CONTRIBUTION RECORDED"
  | "DELIVERY REPORTED"
  | "EVIDENCE RECEIVED"
  | "OUTCOME REPORTED"
  | "OUTCOME EVIDENCED";

export type ReviewStateDefinition = {
  key: ReviewStateKey;
  /** What the record is about: the entity itself, or a relationship / delivery chain. */
  group: "RECORD" | "RELATIONSHIP" | "DELIVERY";
  meaning: string;
  /** Reserved states are never shown as held until the authority/method exists. */
  reserved?: string;
};

export const REVIEW_STATES: readonly ReviewStateDefinition[] = [
  { key: "DISCOVERED", group: "RECORD", meaning: "A credible public record shows the project or organisation exists." },
  { key: "SOURCE-CHECKED", group: "RECORD", meaning: "Identity, activity, place and selected claims checked against named sources." },
  { key: "EXTERNALLY VETTED", group: "RECORD", meaning: "A named external institution applied its own review or selection process." },
  { key: "4PLANET REVIEWED", group: "RECORD", meaning: "Reviewed by 4PLANET under a published method.", reserved: "Reserved until 4PLANET publishes and applies a defined review method." },
  { key: "PARTNER", group: "RELATIONSHIP", meaning: "A real, current agreement exists with 4PLANET.", reserved: "Shown only when an agreement exists. Inclusion is never partnership." },
  { key: "CONTRIBUTION RECORDED", group: "DELIVERY", meaning: "A real contribution exists in the 4PLANET system." },
  { key: "DELIVERY REPORTED", group: "DELIVERY", meaning: "The organisation reports that work was delivered." },
  { key: "EVIDENCE RECEIVED", group: "DELIVERY", meaning: "Evidence exists for the delivery or claim." },
  { key: "OUTCOME REPORTED", group: "DELIVERY", meaning: "An ecological result is reported." },
  { key: "OUTCOME EVIDENCED", group: "DELIVERY", meaning: "The exact outcome has defensible evidence and an explicit verification level." },
];

export const TRUST_SEPARATIONS = [
  "Listing ≠ endorsement",
  "Actor existence ≠ partnership",
  "External award or flagship ≠ 4PLANET verification",
  "Source-reported ≠ independently verified",
  "Target ≠ delivery",
  "Delivery ≠ outcome",
  "Outcome ≠ system-level impact",
] as const;

export const INDEPENDENCE_RULES = [
  "No one can pay to be listed, ranked or reviewed.",
  "Sponsors never control evidence states or editorial conclusions.",
  "A paid or partner relationship is labelled separately and never changes a record’s evidence state.",
] as const;

/** Normalise free-text review states from NATUREBRAIN onto the public ladder. Unknown → null (shown verbatim). */
export function reviewStateKey(value: string | null | undefined): ReviewStateKey | null {
  const raw = (value ?? "").trim().toUpperCase().replace(/_/g, " ").replace(/\s+/g, " ");
  if (!raw) return null;
  if (raw === "SOURCE CHECKED" || raw === "SOURCE-CHECKED") return "SOURCE-CHECKED";
  if (raw === "EXTERNALLY VETTED" || raw === "EXTERNALLY REVIEWED") return "EXTERNALLY VETTED";
  if (raw === "OUTCOME VERIFIED") return "OUTCOME EVIDENCED";
  const hit = REVIEW_STATES.find((state) => state.key === raw);
  return hit ? hit.key : null;
}

/** Public label for a record's state, never upgraded. */
export function reviewStateLabel(value: string | null | undefined): string {
  const key = reviewStateKey(value);
  if (key) return (key.charAt(0) + key.slice(1).toLowerCase()).replace("4planet", "4PLANET");
  return (value ?? "").trim() || "Not yet assessed";
}

/** Record-ladder position (0..3) for the four RECORD states; −1 if unknown. */
export function recordLadderPosition(value: string | null | undefined): number {
  const key = reviewStateKey(value);
  return REVIEW_STATES.filter((state) => state.group === "RECORD").findIndex((state) => state.key === key);
}

/**
 * What a public record does NOT establish, derived only from the absence of
 * NATUREBRAIN data — never asserting that something does not exist.
 */
export function notEstablishedFor(input: {
  reviewState: string | null;
  hasOutcomeEvidence: boolean;
  hasPartnership: boolean;
  explicit: string[];
}): string[] {
  const lines = [...input.explicit];
  if (recordLadderPosition(input.reviewState) < 3) lines.push("4PLANET has not reviewed this project under its own method (that state is reserved).");
  if (!input.hasPartnership) lines.push("No 4PLANET partnership, endorsement or funding relationship is recorded.");
  if (!input.hasOutcomeEvidence) lines.push("No independently evidenced ecological outcome is published in this record.");
  lines.push("No contribution or delivery through 4PLANET is recorded.");
  return Array.from(new Set(lines));
}
