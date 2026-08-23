import type { Story } from "@/content/stories";

export type MagazineExperience = "ARTICLE" | "VISUAL_ESSAY" | "INTELLIGENCE_STORY" | "JOURNEY_FEATURE";

export interface MagazineExperienceContract {
  id: MagazineExperience;
  label: string;
  promise: string;
  readerRule: string;
  visualRule: string;
  motionRule: string;
}

export const MAGAZINE_EXPERIENCE_CONTRACTS: Record<MagazineExperience, MagazineExperienceContract> = {
  ARTICLE: {
    id: "ARTICLE",
    label: "ARTICLE",
    promise: "A calm, exceptionally legible long-form reading surface.",
    readerRule: "Headline → dek → human/source context → uninterrupted narrative → evidence → one useful next object.",
    visualRule: "Editorial restraint. One dominant image is enough; typography, measure and pacing do most of the work.",
    motionRule: "Only progress, subtle entrance and interaction feedback. Reading must never compete with animation.",
  },
  VISUAL_ESSAY: {
    id: "VISUAL_ESSAY",
    label: "VISUAL ESSAY",
    promise: "Images carry information, sequence and emotion rather than decorating prose.",
    readerRule: "Visual sequence → short text beats → captions/credits → source and rights context → relevant deeper object.",
    visualRule: "Full-bleed or near-full-bleed frames, deliberate crops and captions. Context imagery must be labelled as context.",
    motionRule: "Slow reveals and image transitions only where they preserve orientation and reduced-motion parity.",
  },
  INTELLIGENCE_STORY: {
    id: "INTELLIGENCE_STORY",
    label: "INTELLIGENCE STORY",
    promise: "A story that lets the reader inspect how we know, what is measured and what remains uncertain.",
    readerRule: "Question → evidence object → interpretation → limitations → connected species/place/actor/system → next object.",
    visualRule: "Source/data panels, timelines, maps or relationship objects outrank decorative imagery.",
    motionRule: "Progressive disclosure follows comprehension: sense → inspect → compare → settle.",
  },
  JOURNEY_FEATURE: {
    id: "JOURNEY_FEATURE",
    label: "JOURNEY FEATURE",
    promise: "A cinematic chaptered experience reserved for stories that benefit from spatial or temporal immersion.",
    readerRule: "Arrival → chapters → environmental/spatial reveal → evidence checkpoints → quiet landing → one next object.",
    visualRule: "Large spatial frames and chapter transitions; never manufacture documentary evidence or false geography.",
    motionRule: "Homeostatic pacing: rest → sense → respond → settle. Reduced-motion mode must preserve the same information hierarchy.",
  },
};

/**
 * Explicit high-value assignments, then conservative rules. The engine never
 * randomly selects a reading experience; editorial judgement can promote a
 * story to a richer mode only when its material supports it.
 */
const EXPERIENCE_BY_SLUG: Partial<Record<string, MagazineExperience>> = {
  "five-am-bay-of-biscay": "JOURNEY_FEATURE",
  "ocean-watch-1-8-million-kilometres": "INTELLIGENCE_STORY",
  "air-filter-biodiversity-time-machine": "INTELLIGENCE_STORY",
  "ai-coral-photomosaics": "INTELLIGENCE_STORY",
  "amazonia-more-than-a-forest": "VISUAL_ESSAY",
  "why-4planet-exists": "ARTICLE",
};

export function experienceForStory(story: Story): MagazineExperience {
  const explicit = EXPERIENCE_BY_SLUG[story.slug];
  if (explicit) return explicit;
  if (story.mode === "VISUAL") return "VISUAL_ESSAY";
  if (story.mode === "EVERGREEN") return "INTELLIGENCE_STORY";
  return "ARTICLE";
}

export function experienceContractForStory(story: Story) {
  return MAGAZINE_EXPERIENCE_CONTRACTS[experienceForStory(story)];
}

export const MAGAZINE_EXPERIENCE_PROOF_SET: Record<MagazineExperience, string> = {
  ARTICLE: "why-4planet-exists",
  VISUAL_ESSAY: "amazonia-more-than-a-forest",
  INTELLIGENCE_STORY: "air-filter-biodiversity-time-machine",
  JOURNEY_FEATURE: "five-am-bay-of-biscay",
};
