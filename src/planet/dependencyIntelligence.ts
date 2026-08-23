/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — GENERIC DEPENDENCY INTELLIGENCE

   Bounded recovery of the historical Living Systems graph semantics into the
   CURRENT shared Planet Model. This module creates no second graph and adds no
   scientific claims. It only normalises already-present relation semantics plus
   explicitly-labelled recovered LSI support edges into one directed dependency
   traversal.

   Direction rule:
   - A SUPPORTS B / A PERFORMS B  => A supports B.
   - B DEPENDS_ON A               => A supports B (reverse the stored edge).
   - Pressure A AFFECTS B         => A starts a failure/exposure cascade at B.

   OCCURS_IN / ADDRESSES / ACCELERATES are context/action relations, not support
   dependencies, so they are intentionally excluded from cascade traversal.
   ═══════════════════════════════════════════════════════════════════════════ */

import { PRESSURES, RELATIONS } from "./livingSystems";
import { entityLabel, RECOVERED_SUPPORT_EDGES } from "./decisionIntelligence";

export type DependencyEdgeProvenance = "CURRENT_GRAPH" | "RECOVERED_LSI_1_4_2";
export type DependencyEdgeKind = "SUPPORTS" | "PERFORMS" | "DEPENDS_ON" | "AFFECTS" | "PRESSURE_AFFECTS" | "RECOVERED_SUPPORT";

export interface DependencyEdge {
  from: string;
  to: string;
  kind: DependencyEdgeKind;
  provenance: DependencyEdgeProvenance;
}

export interface DependencyNode {
  id: string;
  label: string;
  depth: number;
  provenance: DependencyEdgeProvenance;
}

const key = (edge: Pick<DependencyEdge, "from" | "to">) => `${edge.from}→${edge.to}`;

function buildEdges(): DependencyEdge[] {
  const edges: DependencyEdge[] = [];

  for (const relation of RELATIONS) {
    if (relation.type === "SUPPORTS" || relation.type === "PERFORMS") {
      edges.push({
        from: relation.from,
        to: relation.to,
        kind: relation.type,
        provenance: "CURRENT_GRAPH",
      });
      continue;
    }

    if (relation.type === "DEPENDS_ON") {
      // Stored as "B depends on A". Dependency traversal needs "A supports B".
      edges.push({
        from: relation.to,
        to: relation.from,
        kind: "DEPENDS_ON",
        provenance: "CURRENT_GRAPH",
      });
      continue;
    }

    if (relation.type === "AFFECTS") {
      // A pressure/threat starts its consequence cascade at the affected node.
      edges.push({
        from: relation.from,
        to: relation.to,
        kind: "AFFECTS",
        provenance: "CURRENT_GRAPH",
      });
    }
  }

  // Some pressure→target relationships are represented in the Pressure object
  // rather than duplicated as Relation records. Preserve those semantics too.
  for (const pressure of PRESSURES) {
    for (const affected of pressure.affects) {
      edges.push({
        from: pressure.id,
        to: affected,
        kind: "PRESSURE_AFFECTS",
        provenance: "CURRENT_GRAPH",
      });
    }
  }

  for (const recovered of RECOVERED_SUPPORT_EDGES) {
    edges.push({
      from: recovered.from,
      to: recovered.to,
      kind: "RECOVERED_SUPPORT",
      provenance: "RECOVERED_LSI_1_4_2",
    });
  }

  const seen = new Set<string>();
  return edges.filter((edge) => {
    const k = key(edge);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export const DEPENDENCY_EDGES = buildEdges();

const outgoing = new Map<string, DependencyEdge[]>();
const incoming = new Map<string, DependencyEdge[]>();
for (const edge of DEPENDENCY_EDGES) {
  const out = outgoing.get(edge.from) ?? [];
  out.push(edge);
  outgoing.set(edge.from, out);

  const inc = incoming.get(edge.to) ?? [];
  inc.push(edge);
  incoming.set(edge.to, inc);
}

const node = (id: string, depth: number, provenance: DependencyEdgeProvenance): DependencyNode => ({
  id,
  label: entityLabel(id),
  depth,
  provenance,
});

/** What directly weakens downstream if this node is lost/pressured. */
export function directDependents(id: string): DependencyNode[] {
  return (outgoing.get(id) ?? []).map((edge) => node(edge.to, 1, edge.provenance));
}

/** What this node directly rests on. */
export function dependsUpon(id: string): DependencyNode[] {
  return (incoming.get(id) ?? []).map((edge) => node(edge.from, 1, edge.provenance));
}

/**
 * Layered downstream failure/exposure cascade. Preserves the historical LSI
 * behaviour where a pressure can start at affected species/system nodes and a
 * DEPENDS_ON edge is traversed in support direction.
 */
export function dependencyCascade(startId: string, maxDepth = 6): DependencyNode[][] {
  const layers: DependencyNode[][] = [[node(startId, 0, "CURRENT_GRAPH")]];
  const seen = new Set<string>([startId]);
  let frontier = [startId];

  for (let depth = 1; depth <= maxDepth && frontier.length; depth += 1) {
    const next: DependencyNode[] = [];
    for (const from of frontier) {
      for (const edge of outgoing.get(from) ?? []) {
        if (seen.has(edge.to)) continue;
        seen.add(edge.to);
        next.push(node(edge.to, depth, edge.provenance));
      }
    }
    if (!next.length) break;
    layers.push(next);
    frontier = next.map((item) => item.id);
  }

  return layers;
}

/** One representative chain, useful for progressive human explanation. */
export function primaryDependencyChain(startId: string, maxDepth = 6): DependencyNode[] {
  const chain: DependencyNode[] = [node(startId, 0, "CURRENT_GRAPH")];
  const seen = new Set<string>([startId]);
  let current = startId;

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const options = (outgoing.get(current) ?? []).filter((edge) => !seen.has(edge.to));
    if (!options.length) break;

    // Prefer explicitly human-system/service endpoints when choosing one clear
    // explanatory path; the full network remains available via cascade layers.
    const rank = (id: string) =>
      id.startsWith("human-system:") ? 0 : id.startsWith("service:") ? 1 : id.startsWith("function:") ? 2 : 3;
    options.sort((a, b) => rank(a.to) - rank(b.to));

    const chosen = options[0];
    seen.add(chosen.to);
    chain.push(node(chosen.to, depth, chosen.provenance));
    current = chosen.to;
  }

  return chain;
}

export function dependencyIntegrity() {
  const duplicateEdges = DEPENDENCY_EDGES.map(key).filter((id, index, all) => all.indexOf(id) !== index);
  const recoveredEdges = DEPENDENCY_EDGES.filter((edge) => edge.provenance === "RECOVERED_LSI_1_4_2").length;
  const currentEdges = DEPENDENCY_EDGES.length - recoveredEdges;
  return {
    edges: DEPENDENCY_EDGES.length,
    currentEdges,
    recoveredEdges,
    duplicateEdges,
    truthBoundary:
      "Dependency traversal normalises current relation direction plus explicitly recovered LSI support edges. It does not upgrade seeded ecological relationships into verified evidence or automated advice.",
  };
}
