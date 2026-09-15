/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — GENERIC NODE INTELLIGENCE

   Recovery of the LSI 1.4.2 "any node → one intelligence shape" capability,
   rebuilt as a read-only resolver over the CURRENT shared Planet Model.
   It creates no second graph and mutates no source/claim state.
   ═══════════════════════════════════════════════════════════════════════════ */

import {
  LIVING_SYSTEMS,
  MISSIONS,
  NODES,
  PRESSURES,
  RELATIONS,
  SOLUTIONS,
  missionById,
  nodeById,
  pressureById,
  solutionById,
  systemById,
  systemsContaining,
} from "./livingSystems";
import { decisionContextForAnchor, entityLabel, failureCascade } from "./decisionIntelligence";
import { claimsForCurrentEntity } from "./trustIntelligence";

export type IntelLink = {
  id: string;
  label: string;
  kind: string;
  relation?: string;
  href?: string;
};
export type IntelSection = { label: string; items: IntelLink[] };
export interface NodeIntel {
  id: string;
  kind: string;
  title: string;
  subtitle?: string;
  sections: IntelSection[];
  claimCount: number;
  cascade: ReturnType<typeof failureCascade>;
  decisionContext?: ReturnType<typeof decisionContextForAnchor>;
  truthBoundary: string;
}

const uniq = (items: IntelLink[]) => {
  const seen = new Set<string>();
  return items.filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)));
};

const hrefFor = (id: string): string | undefined => {
  if (id.startsWith("taxon:gbif:")) return `/species?entity=${encodeURIComponent(id)}`;
  if (id.startsWith("living-system:4p:")) {
    const slug = id.split(":").slice(2).join(":");
    if (slug === "amazonia") return "/living-systems/amazonia";
    if (slug === "pollination") return "/living-systems/pollination";
  }
  if (id.startsWith("mission:4p:")) return `/missions/${id.split(":").slice(2).join(":")}`;
  if (id.startsWith("pressure:4p:")) return `/atlas?entity=${encodeURIComponent(id)}`;
  if (id.startsWith("solution:4p:")) return `/atlas?entity=${encodeURIComponent(id)}`;
  return undefined;
};

const kindFor = (id: string): string => {
  if (id.startsWith("taxon:")) return "SPECIES";
  if (id.startsWith("function:")) return "FUNCTION";
  if (id.startsWith("human-system:")) return "HUMAN SYSTEM";
  if (id.startsWith("living-system:")) return "LIVING SYSTEM";
  if (id.startsWith("pressure:")) return "PRESSURE";
  if (id.startsWith("solution:")) return "SOLUTION";
  if (id.startsWith("mission:")) return "MISSION";
  if (id.startsWith("service:")) return "ECOSYSTEM SERVICE";
  return "ENTITY";
};

const link = (id: string, relation?: string): IntelLink => ({
  id,
  label: entityLabel(id),
  kind: kindFor(id),
  relation,
  href: hrefFor(id),
});

const relationLinks = (rels: typeof RELATIONS, side: "from" | "to") => uniq(rels.map((r) => link(side === "from" ? r.to : r.from, r.type)));

function titleFor(id: string): { kind: string; title: string; subtitle?: string } | null {
  const node = nodeById(id);
  if (node) return { kind: node.type, title: node.label, subtitle: node.sub };
  const system = systemById(id);
  if (system) return { kind: "LIVING SYSTEM", title: system.name, subtitle: system.sub };
  const pressure = pressureById(id);
  if (pressure) return { kind: "PRESSURE", title: pressure.name };
  const solution = solutionById(id);
  if (solution) return { kind: "SOLUTION", title: solution.name };
  const mission = missionById(id);
  if (mission) return { kind: "MISSION", title: mission.name };
  // Recovered decision intelligence contains service / geo-context nodes that
  // are deliberately not promoted into the current base registries yet.
  const recovered = entityLabel(id);
  if (recovered !== id) return { kind: kindFor(id), title: recovered, subtitle: "RECOVERED LSI CONTEXT" };
  return null;
}

export function nodeIntelligence(id: string): NodeIntel | null {
  const identity = titleFor(id);
  if (!identity) return null;

  const forward = RELATIONS.filter((r) => r.from === id);
  const reverse = RELATIONS.filter((r) => r.to === id);
  const systems = systemsContaining(id).map((s) => link(s.id, "CONTAINED IN"));
  const pressures = PRESSURES.filter((p) => p.affects.includes(id)).map((p) => link(p.id, "AFFECTS"));
  const solutions = SOLUTIONS.filter((s) => s.addresses.includes(id)).map((s) => link(s.id, "ADDRESSES"));
  const missionLinks = MISSIONS.filter((m) => {
    const solIds = SOLUTIONS.filter((s) => s.missionIds?.includes(m.id)).map((s) => s.id);
    return solIds.some((sid) => solutions.some((s) => s.id === sid));
  }).map((m) => link(m.id, "ACCELERATES"));

  const sections: IntelSection[] = [
    { label: "OUTBOUND RELATIONSHIPS", items: relationLinks(forward, "from") },
    { label: "DEPENDS ON / INBOUND", items: relationLinks(reverse, "to") },
    { label: "LIVING SYSTEMS", items: uniq(systems) },
    { label: "PRESSURES", items: uniq(pressures) },
    { label: "SOLUTIONS", items: uniq(solutions) },
    { label: "MISSIONS", items: uniq(missionLinks) },
  ].filter((s) => s.items.length > 0);

  let decisionContext: ReturnType<typeof decisionContextForAnchor> | undefined;
  if (id === "living-system:4p:amazonia") decisionContext = decisionContextForAnchor("amazonia") ?? undefined;
  if (id === "function:4p:pollination" || id === "living-system:4p:pollination") decisionContext = decisionContextForAnchor("pollination") ?? undefined;

  return {
    id,
    kind: identity.kind,
    title: identity.title,
    subtitle: identity.subtitle,
    sections,
    claimCount: claimsForCurrentEntity(id).length,
    cascade: failureCascade(id),
    decisionContext,
    truthBoundary: "Node Intelligence is a read-only traversal of the current shared Planet Model plus explicitly labelled recovered LSI decision context. Connections inherit their source/review boundaries; presence here is not an automated recommendation.",
  };
}

export function currentNodeIntelligenceInventory() {
  const ids = new Set<string>();
  for (const n of NODES) ids.add(n.id);
  for (const s of LIVING_SYSTEMS) ids.add(s.id);
  for (const p of PRESSURES) ids.add(p.id);
  for (const s of SOLUTIONS) ids.add(s.id);
  for (const m of MISSIONS) ids.add(m.id);
  const nodes = Array.from(ids).map((id) => nodeIntelligence(id)).filter(Boolean);
  return {
    addressableNodes: nodes.length,
    withClaims: nodes.filter((n) => (n?.claimCount ?? 0) > 0).length,
    withRelationships: nodes.filter((n) => (n?.sections.length ?? 0) > 0).length,
  };
}
