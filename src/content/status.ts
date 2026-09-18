// Restrained public mission statuses (brief §06). Never surface internal "STRATEGIC CONCEPT".
// P1.3: "FIELD RESEARCH" removed — 4PLANET is not running field research; that label
// was unsupported. Missions carry honest development/foundation states instead.
export type PublicStatus =
  | "IN DEVELOPMENT"
  | "PARTNER VALIDATION"
  | "EVIDENCE FOUNDATION"
  | "OPENING SOON"
  | "PROTOTYPE";

const MAP: Record<string, PublicStatus> = {
  clim4te: "PARTNER VALIDATION",
  pl4stic: "IN DEVELOPMENT", "am4zonia": "IN DEVELOPMENT", "rewild-land": "IN DEVELOPMENT",
  wh4les: "EVIDENCE FOUNDATION", cor4l: "EVIDENCE FOUNDATION", species: "EVIDENCE FOUNDATION", "rewild-marine": "IN DEVELOPMENT",
  food: "IN DEVELOPMENT", en4rgy: "IN DEVELOPMENT", "circular-city": "IN DEVELOPMENT", f4shion: "IN DEVELOPMENT",
  "4play": "PROTOTYPE", "4film": "PROTOTYPE", "4rt": "PROTOTYPE", m4gazine: "PROTOTYPE",
};
export const publicStatus = (slug: string): PublicStatus => MAP[slug] ?? "IN DEVELOPMENT";

// Evidence-foundation status for the honest evidence block (brief §14).
const EVID: Record<string, string> = {
  wh4les: "EVIDENCE FOUNDATION IN DEVELOPMENT", clim4te: "PARTNER VALIDATION IN PROGRESS",
  am4zonia: "EVIDENCE FOUNDATION IN DEVELOPMENT", pl4stic: "EVIDENCE FOUNDATION IN DEVELOPMENT",
};
export const evidenceStatus = (slug: string): string => EVID[slug] ?? "EVIDENCE FOUNDATION IN DEVELOPMENT";
