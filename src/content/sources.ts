import type { Source } from "@/types/content";
// Real, reviewed sources only. Empty until a credible source is added → "Sources in development".
export const SOURCES: Record<string, Source[]> = {};
export const sourcesFor = (missionSlug: string): Source[] => SOURCES[missionSlug] ?? [];
