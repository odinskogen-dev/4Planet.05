// Restrained public mission statuses (brief §06). Never surface internal "STRATEGIC CONCEPT".
export type PublicStatus = "IN DEVELOPMENT" | "PARTNER VALIDATION" | "FIELD RESEARCH" | "OPENING SOON" | "PROTOTYPE";

const MAP: Record<string, PublicStatus> = {
  clim4te: "PARTNER VALIDATION",
  pl4stic: "IN DEVELOPMENT", "am4zonia": "IN DEVELOPMENT", rewild: "IN DEVELOPMENT",
  wh4les: "FIELD RESEARCH", cor4l: "FIELD RESEARCH", species: "FIELD RESEARCH", "4ntarctica": "FIELD RESEARCH",
  food: "IN DEVELOPMENT", en3rgy: "IN DEVELOPMENT", "circular-city": "IN DEVELOPMENT", f4shion: "IN DEVELOPMENT",
  "4play": "PROTOTYPE", "4film": "PROTOTYPE", "4telier": "PROTOTYPE", m4gazine: "PROTOTYPE",
};
export const publicStatus = (slug: string): PublicStatus => MAP[slug] ?? "IN DEVELOPMENT";

// Evidence-foundation status for the honest evidence block (brief §14).
const EVID: Record<string, string> = {
  wh4les: "FIELD RESEARCH IN DEVELOPMENT", clim4te: "PARTNER VALIDATION IN PROGRESS",
  am4zonia: "FIELD RESEARCH IN DEVELOPMENT", pl4stic: "EVIDENCE FOUNDATION IN DEVELOPMENT",
};
export const evidenceStatus = (slug: string): string => EVID[slug] ?? "EVIDENCE FOUNDATION IN DEVELOPMENT";
