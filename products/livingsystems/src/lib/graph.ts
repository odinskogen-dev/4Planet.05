// ============================================================================
// DEPENDENCY GRAPH ENGINE (v0.7)
// A unified directed graph over the existing nodes, expressed as SUPPORTS edges:
//   "A SUPPORTS B"  ==  "B depends on A"  ==  "if A is lost, B is weakened".
//
// This is the spine of Dependency Intelligence:
//   - failureCascade(id)  -> downstream: what weakens if this is lost
//   - dependsUpon(id)      -> upstream: what this rests on
//   - directDependents(id) -> reverse intelligence: what depends on this
// Built once from the existing graph (no duplicate data, no new node types).
// ============================================================================

import { speciesList } from "@/data/species";
import {
  FUNCTIONS,
  SERVICES,
  RECIPIENTS,
  ECOSYSTEMS,
  THREATS,
  DRIVERS,
  SOLUTIONS,
  MISSIONS,
} from "@/data/nodes";
import { HUMAN_SYSTEMS } from "@/data/humanSystems";
import { DEPENDENCIES } from "@/data/dependencies";

export type GraphKind =
  | "Species"
  | "Function"
  | "Service"
  | "Recipient"
  | "Ecosystem"
  | "Human System"
  | "Threat"
  | "Driver"
  | "Solution"
  | "Mission"
  | "Node";

export interface GraphNode {
  id: string;
  name: string;
  kind: GraphKind;
  href?: string;
}

// --- Node metadata resolution (name + kind + href) --------------------------
const slugBySpeciesId = new Map(speciesList.map((s) => [s.id as string, s.slug]));

export function nodeMeta(id: string): GraphNode {
  if (slugBySpeciesId.has(id)) {
    const s = speciesList.find((x) => (x.id as string) === id)!;
    return { id, name: s.commonName, kind: "Species", href: `/species/${s.slug}` };
  }
  if (FUNCTIONS[id as keyof typeof FUNCTIONS])
    return { id, name: FUNCTIONS[id as keyof typeof FUNCTIONS].name, kind: "Function", href: `/functions/${id}` };
  if (SERVICES[id as keyof typeof SERVICES])
    return { id, name: SERVICES[id as keyof typeof SERVICES].name, kind: "Service", href: `/services/${id}` };
  if (HUMAN_SYSTEMS[id as keyof typeof HUMAN_SYSTEMS])
    return { id, name: HUMAN_SYSTEMS[id as keyof typeof HUMAN_SYSTEMS].name, kind: "Human System", href: `/human-systems/${id}` };
  if (ECOSYSTEMS[id as keyof typeof ECOSYSTEMS])
    return { id, name: ECOSYSTEMS[id as keyof typeof ECOSYSTEMS].name, kind: "Ecosystem", href: `/ecosystems/${id}` };
  if (RECIPIENTS[id as keyof typeof RECIPIENTS])
    return { id, name: RECIPIENTS[id as keyof typeof RECIPIENTS].name, kind: "Recipient" };
  if (THREATS[id as keyof typeof THREATS])
    return { id, name: THREATS[id as keyof typeof THREATS].name, kind: "Threat", href: `/threats/${id}` };
  if (SOLUTIONS[id as keyof typeof SOLUTIONS])
    return { id, name: SOLUTIONS[id as keyof typeof SOLUTIONS].name, kind: "Solution", href: `/solutions/${id}` };
  if (DRIVERS[id as keyof typeof DRIVERS])
    return { id, name: DRIVERS[id as keyof typeof DRIVERS].name, kind: "Driver" };
  if (MISSIONS[id as keyof typeof MISSIONS])
    return { id, name: MISSIONS[id as keyof typeof MISSIONS].code, kind: "Mission", href: `/missions/${id}` };
  return { id, name: id, kind: "Node" };
}

// --- Build SUPPORTS adjacency (A -> [nodes A supports]) ---------------------
const SUPPORTS = new Map<string, Set<string>>();
const add = (a: string, b: string) => {
  if (!SUPPORTS.has(a)) SUPPORTS.set(a, new Set());
  SUPPORTS.get(a)!.add(b);
};

// Ecosystem supports the species living in it.
for (const s of speciesList) {
  for (const link of s.distribution.ecosystems) add(link.ecosystem as string, s.id as string);
  // Species supports the functions it performs.
  for (const fn of s.functions) add(s.id as string, fn as string);
}
// Ecosystem-level provision (v0.9): an ecosystem can provide services/functions
// directly, independent of its species (e.g. Amazon → Rainfall Regulation).
for (const e of Object.values(ECOSYSTEMS)) {
  for (const sv of e.providesServices ?? []) add(e.id as string, sv as string);
  for (const fn of e.providesFunctions ?? []) add(e.id as string, fn as string);
}
// Function supports its services.
for (const f of Object.values(FUNCTIONS))
  for (const sv of f.supportsServices) add(f.id as string, sv as string);
// Service supports its recipients.
for (const v of Object.values(SERVICES))
  for (const r of v.benefitsRecipients) add(v.id as string, r as string);
// Dependency edges: target SUPPORTS source human system (source depends on target).
for (const d of DEPENDENCIES) {
  if (["SUPPORTED_BY", "REQUIRED_FOR", "ENHANCED_BY"].includes(d.relationshipType))
    add(d.targetNodeId, d.sourceNodeId);
}

// Reverse adjacency (B -> [nodes that support B] == what B depends on).
const DEPENDS_ON = new Map<string, Set<string>>();
for (const [a, bs] of SUPPORTS)
  for (const b of bs) {
    if (!DEPENDS_ON.has(b)) DEPENDS_ON.set(b, new Set());
    DEPENDS_ON.get(b)!.add(a);
  }

export const directDependents = (id: string): GraphNode[] =>
  Array.from(SUPPORTS.get(id) ?? []).map(nodeMeta);
export const dependsUpon = (id: string): GraphNode[] =>
  Array.from(DEPENDS_ON.get(id) ?? []).map(nodeMeta);

// --- Layered BFS downstream (the failure cascade) ---------------------------
function cascadeLayers(seedIds: string[], maxDepth = 6): GraphNode[][] {
  const layers: GraphNode[][] = [];
  const seen = new Set<string>(seedIds);
  let frontier = seedIds;
  layers.push(seedIds.map(nodeMeta));
  let depth = 0;
  while (frontier.length && depth < maxDepth) {
    const next: string[] = [];
    for (const id of frontier)
      for (const dep of SUPPORTS.get(id) ?? [])
        if (!seen.has(dep)) (seen.add(dep), next.push(dep));
    if (next.length) layers.push(next.map(nodeMeta));
    frontier = next;
    depth += 1;
  }
  return layers;
}

/**
 * The failure cascade for a node: what weakens, layer by layer, if it is lost.
 * For a Threat, the cascade starts from the species it affects (Pesticides →
 * Honey Bee → Pollination → Food Production → Food System).
 */
export function failureCascade(id: string, maxDepth = 6): GraphNode[][] {
  const meta = nodeMeta(id);
  if (meta.kind === "Threat") {
    const affected = speciesList
      .filter((s) => s.threats.some((t) => (t.threat as string) === id))
      .map((s) => s.id as string);
    const affectedEco = Object.values(ECOSYSTEMS)
      .filter((e) => (e.threats ?? []).some((t) => (t as string) === id))
      .map((e) => e.id as string);
    const seeds = Array.from(new Set([...affected, ...affectedEco]));
    if (seeds.length === 0) return [[meta]];
    const down = cascadeLayers(seeds, maxDepth - 1);
    return [[meta], ...down];
  }
  return cascadeLayers([id], maxDepth);
}

/**
 * A single representative chain from a node down to a human-relevant endpoint,
 * used for the systemic "why this matters" sentence. Greedy: prefer the
 * dependent that itself reaches furthest toward a Human System / Recipient.
 */
export function primaryChain(id: string, maxDepth = 6): GraphNode[] {
  const chain: GraphNode[] = [nodeMeta(id)];
  const seen = new Set([id]);
  let current = id;
  for (let i = 0; i < maxDepth; i++) {
    const options = Array.from(SUPPORTS.get(current) ?? []).filter((x) => !seen.has(x));
    if (options.length === 0) break;
    // Prefer Human System, then Recipient, then anything.
    const rank = (x: string) => {
      const k = nodeMeta(x).kind;
      return k === "Human System" ? 0 : k === "Recipient" ? 1 : 2;
    };
    options.sort((a, b) => rank(a) - rank(b));
    current = options[0];
    seen.add(current);
    chain.push(nodeMeta(current));
  }
  return chain;
}

/** Systemic "why this matters" sentence, generated from the primary chain. */
export function whyItMattersGenerated(id: string): string | null {
  const chain = primaryChain(id);
  if (chain.length < 2) return null;
  const names = chain.map((n) => n.name);
  return `${names[0]} supports ${names.slice(1).join(", which supports ")}.`;
}

// --- v0.9 helpers for the Amazon living-system case -------------------------
const downstreamRank = (id: string) => {
  const k = nodeMeta(id).kind;
  return k === "Human System" ? 0 : k === "Recipient" ? 1 : 2;
};

/** Direct dependents of a node, filtered to a kind. */
export const servicesSupportedBy = (nodeId: string): GraphNode[] =>
  directDependents(nodeId).filter((n) => n.kind === "Service");

/** All human systems reachable downstream of a node (via the cascade). */
export function humanSystemsDownstream(nodeId: string): GraphNode[] {
  const seen = new Map<string, GraphNode>();
  for (const layer of failureCascade(nodeId))
    for (const n of layer) if (n.kind === "Human System" && n.id !== nodeId) seen.set(n.id, n);
  return Array.from(seen.values());
}

/** One pathway per service a node provides: node → service → …downstream. */
export function ecosystemPathways(nodeId: string, maxDepth = 4): GraphNode[][] {
  return servicesSupportedBy(nodeId).map((sv) => {
    const chain: GraphNode[] = [nodeMeta(nodeId), sv];
    const seen = new Set<string>([nodeId, sv.id]);
    let cur = sv.id;
    for (let i = 0; i < maxDepth; i++) {
      const opts = (Array.from(SUPPORTS.get(cur) ?? [])).filter((x) => !seen.has(x));
      if (opts.length === 0) break;
      opts.sort((a, b) => downstreamRank(a) - downstreamRank(b));
      cur = opts[0];
      seen.add(cur);
      chain.push(nodeMeta(cur));
    }
    return chain;
  });
}
