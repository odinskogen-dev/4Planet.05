// Generated from src/data/impactDiscovery.json. Do not hand-author profile truth here.
export const IMPACT_PUBLIC_PROJECT_SLUGS = ["african-forest-gardens","florida-coral-restoration","great-pacific-garbage-patch","northern-mozambique-channel"];
export const IMPACT_PUBLIC_ACTOR_SLUGS = ["coral-restoration-foundation","northern-mozambique-restoration-network","the-ocean-cleanup","trees-for-the-future"];
export const IMPACT_PUBLIC_ISSUE_SLUGS = ["land-degradation","ocean-plastic","reef-degradation"];
export const IMPACT_PUBLIC_SOLUTION_SLUGS = [];

const sets = {
  project: new Set(IMPACT_PUBLIC_PROJECT_SLUGS),
  actors: new Set(IMPACT_PUBLIC_ACTOR_SLUGS),
  issue: new Set(IMPACT_PUBLIC_ISSUE_SLUGS),
  solution: new Set(IMPACT_PUBLIC_SOLUTION_SLUGS),
};

export function isKnownImpactProfileRoute(pathname) {
  const p = pathname.replace(/\/+$/, "") || "/";
  const match = p.match(/^\/impact\/(project|actors|issue|solution)\/([^/]+)$/);
  if (!match) return null;
  return sets[match[1]].has(match[2]);
}
