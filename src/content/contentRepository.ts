import type { DomainKey } from "@/types/content";
import { DOMAIN_CONTENT } from "@/content/domains";
import { MISSIONS, getMission, getMissionsByDomain } from "@/content/narrativeContract";
import { IMPACT_PATHWAYS, findImpactPathway } from "@/content/impactPathways";

// One public content source for every Domain/Mission surface.
// A hosted repository may implement the same read contract later without changing public semantics.
export const content = {
  getDomains: () => Object.values(DOMAIN_CONTENT),
  getDomain: (key: DomainKey) => DOMAIN_CONTENT[key],
  getMissions: () => MISSIONS,
  getMission: (slug: string) => getMission(slug),
  getMissionsByDomain: (key: DomainKey) => getMissionsByDomain(key),
  getImpactPathways: () => IMPACT_PATHWAYS,
  getImpactPathway: (slug: string) => findImpactPathway(slug),
  getSources: (missionSlug: string) => getMission(missionSlug)?.sources ?? [],
};

export { DOMAIN_CONTENT } from "@/content/domains";
export { MISSIONS as MISSION_CONTENT, getMission as findMissionContent } from "@/content/narrativeContract";
export { IMPACT_PATHWAYS, findImpactPathway } from "@/content/impactPathways";
