import { getMission, type NarrativeStatus } from "@/content/narrativeContract";

export type PublicStatus = NarrativeStatus;

export const publicStatus = (slug: string): PublicStatus => getMission(slug)?.status ?? "CONCEPT";

export const evidenceStatus = (slug: string): string => {
  const mission = getMission(slug);
  if (!mission) return "SOURCE FOUNDATION NOT ESTABLISHED";
  if (mission.sources.length === 0) return "SOURCE FOUNDATION IN DEVELOPMENT";
  if (mission.sourceNeeds.length > 0) return "SOURCES PUBLISHED / GAPS REMAIN VISIBLE";
  return "SOURCE FOUNDATION PUBLISHED";
};
