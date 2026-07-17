import type { DomainKey } from "@/types/content";
import { DOMAIN_CONTENT } from "@/content/domains";
import { MISSION_CONTENT, findMissionContent } from "@/content/missions";
import { IMPACT_PATHWAYS, findImpactPathway } from "@/content/impactPathways";
import { sourcesFor } from "@/content/sources";

// Local repository now; a SupabaseContentRepository can implement the same shape later.
export const content = {
  getDomains: () => Object.values(DOMAIN_CONTENT),
  getDomain: (key: DomainKey) => DOMAIN_CONTENT[key],
  getMissions: () => MISSION_CONTENT,
  getMission: (slug: string) => findMissionContent(slug),
  getMissionsByDomain: (key: DomainKey) => MISSION_CONTENT.filter((m) => m.domain === key),
  getImpactPathways: () => IMPACT_PATHWAYS,
  getImpactPathway: (slug: string) => findImpactPathway(slug),
  getSources: (missionSlug: string) => sourcesFor(missionSlug),
};

// re-exports for convenience
export { DOMAIN_CONTENT } from "@/content/domains";
export { MISSION_CONTENT, findMissionContent } from "@/content/missions";
export { IMPACT_PATHWAYS, findImpactPathway } from "@/content/impactPathways";
