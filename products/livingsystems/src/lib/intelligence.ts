// ============================================================================
// NODE INTELLIGENCE
// Turns any node into a uniform "intelligence" shape: its description plus the
// nodes it connects to, resolved through the graph (including reverse edges
// like "which species perform this function"). One builder per node type; one
// component renders them all. This is the graph made visible.
// ============================================================================

import { speciesList } from "@/data/species";
import {
  FUNCTIONS,
  SERVICES,
  RECIPIENTS,
  THREATS,
  DRIVERS,
  SOLUTIONS,
  ECOSYSTEMS,
  MISSIONS,
} from "@/data/nodes";
import { SOURCES } from "@/data/sources";
import { IMPACT_OPPORTUNITIES } from "@/data/impact";
import { HUMAN_SYSTEMS } from "@/data/humanSystems";
import { DEPENDENCIES, dependenciesFrom } from "@/data/dependencies";
import { ACTORS } from "@/data/actors";
import { LOCATIONS } from "@/data/locations";
import { CAPITAL } from "@/data/foundations";
import type {
  FunctionNode,
  ServiceNode,
  RecipientNode,
  ThreatNode,
  DriverNode,
  SolutionNode,
  EcosystemNode,
  MissionNode,
} from "@/types";

// String-keyed views of the ID-branded registries (for dynamic lookups).
const F = FUNCTIONS as Record<string, FunctionNode>;
const SV = SERVICES as Record<string, ServiceNode>;
const RC = RECIPIENTS as Record<string, RecipientNode>;
const TH = THREATS as Record<string, ThreatNode>;
const DR = DRIVERS as Record<string, DriverNode>;
const SOL = SOLUTIONS as Record<string, SolutionNode>;
const EC = ECOSYSTEMS as Record<string, EcosystemNode>;
const MS = MISSIONS as Record<string, MissionNode>;
import type {
  SpeciesProfile,
  FunctionId,
  ServiceId,
  MissionId,
} from "@/types";

export type IntelLink = { id: string; name: string; sub?: string; href?: string };
export type IntelSection = { label: string; items: IntelLink[] };
export interface NodeIntel {
  kind: string;
  id: string;
  title: string;
  subtitle?: string;
  humanTranslation?: string;
  flagship?: boolean;
  showCascade?: boolean;
  sections: IntelSection[];
}

const uniq = (items: IntelLink[]): IntelLink[] => {
  const seen = new Set<string>();
  const out: IntelLink[] = [];
  for (const i of items) if (!seen.has(i.id)) (seen.add(i.id), out.push(i));
  return out;
};
const nonEmpty = (sections: IntelSection[]) =>
  sections.filter((s) => s.items.length > 0);

// --- Link factories ---------------------------------------------------------
const spLink = (s: SpeciesProfile): IntelLink => ({
  id: s.id,
  name: s.commonName,
  sub: s.roleLabel,
  href: `/species/${s.slug}`,
});
const fnLink = (id: string): IntelLink => ({ id, name: F[id].name, href: `/functions/${id}` });
const svLink = (id: string): IntelLink => ({ id, name: SV[id].name, href: `/services/${id}` });
const rcLink = (id: string): IntelLink => ({ id, name: RC[id].name });
const thLink = (id: string): IntelLink => ({ id, name: TH[id].name, sub: TH[id].category, href: `/threats/${id}` });
const drLink = (id: string): IntelLink => ({ id, name: DR[id].name });
const solLink = (id: string): IntelLink => ({ id, name: SOL[id].name, href: `/solutions/${id}` });
const ecLink = (id: string): IntelLink => ({ id, name: EC[id].name, href: `/ecosystems/${id}` });
const msLink = (id: string): IntelLink => ({ id, name: MS[id].code, sub: MS[id].name, href: `/missions/${id}` });
const srcLink = (id: string): IntelLink => ({ id, name: SOURCES[id]?.title ?? id, sub: SOURCES[id]?.trustLevel });
const hsLink = (id: string): IntelLink => ({
  id,
  name: HUMAN_SYSTEMS[id as keyof typeof HUMAN_SYSTEMS]?.name ?? id,
  href: `/human-systems/${id}`,
});

// Resolve any node id to a link across every registry (for dependency edges).
const REF_TABLES: { reg: Record<string, { name: string }>; base: string }[] = [
  { reg: F, base: "/functions" },
  { reg: SV, base: "/services" },
  { reg: TH, base: "/threats" },
  { reg: SOL, base: "/solutions" },
  { reg: EC, base: "/ecosystems" },
  { reg: MS, base: "/missions" },
  { reg: HUMAN_SYSTEMS as Record<string, { name: string }>, base: "/human-systems" },
];
function resolveNodeRef(id: string, sub?: string): IntelLink {
  for (const { reg, base } of REF_TABLES) {
    if (reg[id]) return { id, name: (reg[id] as any).name, sub, href: `${base}/${id}` };
  }
  if (RC[id]) return { id, name: RC[id].name, sub };
  if (DR[id]) return { id, name: DR[id].name, sub };
  return { id, name: id, sub };
}

// --- Reverse-edge resolvers -------------------------------------------------
export const speciesByEcosystem = (id: string) =>
  speciesList.filter((s) => s.distribution.ecosystems.some((l) => l.ecosystem === id));
export const speciesByThreat = (id: string) =>
  speciesList.filter((s) => s.threats.some((l) => l.threat === id));
export const speciesBySolution = (id: string) =>
  speciesList.filter((s) => s.solutions.some((l) => l.solution === id));
export const speciesByFunction = (id: string) =>
  speciesList.filter((s) => s.functions.includes(id as FunctionId));
export const speciesByMission = (id: string) =>
  speciesList.filter((s) => s.connections.missions.includes(id as MissionId));
export const functionsSupportingService = (id: string) =>
  Object.values(FUNCTIONS).filter((f) => f.supportsServices.includes(id as ServiceId));
export const speciesByService = (id: string) => {
  const fns = functionsSupportingService(id).map((f) => f.id as string);
  return speciesList.filter((s) => s.functions.some((f) => fns.includes(f)));
};
export const solutionsForThreat = (id: string) =>
  Object.values(SOLUTIONS).filter((s) => s.addressesThreats.includes(id as any));

// Aggregate helpers over a species set
const aggFunctions = (sp: SpeciesProfile[]) => uniq(sp.flatMap((s) => s.functions.map((f) => fnLink(f))));
const aggServices = (sp: SpeciesProfile[]) =>
  uniq(sp.flatMap((s) => s.functions.flatMap((f) => F[f].supportsServices.map((v) => svLink(v)))));
const aggRecipients = (sp: SpeciesProfile[]) =>
  uniq(
    sp.flatMap((s) =>
      s.functions.flatMap((f) =>
        F[f].supportsServices.flatMap((v) =>
          SV[v].benefitsRecipients.map((r) => rcLink(r))
        )
      )
    )
  );
const aggThreats = (sp: SpeciesProfile[]) => uniq(sp.flatMap((s) => s.threats.map((l) => thLink(l.threat))));
const aggSolutions = (sp: SpeciesProfile[]) => uniq(sp.flatMap((s) => s.solutions.map((l) => solLink(l.solution))));
const aggMissions = (sp: SpeciesProfile[]) => uniq(sp.flatMap((s) => s.connections.missions.map((m) => msLink(m))));
const aggEcosystems = (sp: SpeciesProfile[]) =>
  uniq(sp.flatMap((s) => s.distribution.ecosystems.map((l) => ecLink(l.ecosystem))));
const aggSources = (sp: SpeciesProfile[]) => uniq(sp.flatMap((s) => s.sourceIds.map((k) => srcLink(k))));

// --- Engine helpers (forward + reverse traversal) ---------------------------
const inReg = (id: string, reg: Record<string, unknown>) => Boolean(reg[id]);

/** Human systems with a dependency edge targeting any of these node ids. */
export const humanSystemsDependingOn = (targetIds: string[]) =>
  uniq(
    DEPENDENCIES.filter((d) => targetIds.includes(d.targetNodeId)).map((d) =>
      hsLink(d.sourceNodeId)
    )
  );

/** Impact opportunities referencing any of these species. */
const impactForSpecies = (sp: SpeciesProfile[]) => {
  const ids = new Set(sp.map((s) => s.id as string));
  return Object.values(IMPACT_OPPORTUNITIES)
    .filter((o) => o.speciesIds.some((s) => ids.has(s as string)))
    .map((o) => ({ id: o.id, name: o.title, href: `/impact/${o.id}` }));
};

/** Resolve a Human System into the functions/services/species it rests on. */
function humanSystemGraph(id: string) {
  const targets = dependenciesFrom(id).map((d) => d.targetNodeId);
  const directFunctions = targets.filter((t) => inReg(t, F));
  const directServices = targets.filter((t) => inReg(t, SV));
  const vulnThreats = targets.filter((t) => inReg(t, TH));
  const functionsFromServices = directServices.flatMap((sv) =>
    functionsSupportingService(sv).map((f) => f.id as string)
  );
  const servicesFromFunctions = directFunctions.flatMap((f) => F[f].supportsServices as unknown as string[]);
  const functions = Array.from(new Set([...directFunctions, ...functionsFromServices]));
  const services = Array.from(new Set([...directServices, ...servicesFromFunctions]));
  const species = uniq(functions.flatMap((f) => speciesByFunction(f).map(spLink)));
  const speciesNodes = functions.flatMap((f) => speciesByFunction(f));
  return { directFunctions, directServices, vulnThreats, functions, services, species, speciesNodes };
}

// --- Builders ---------------------------------------------------------------
function ecosystemIntel(id: string): NodeIntel {
  const n = EC[id];
  const sp = speciesByEcosystem(id);
  const threats = aggThreats(sp);
  const drivers = uniq(threats.map((t) => drLink(TH[t.id].driver)));
  const serviceIds = aggServices(sp).map((s) => s.id);
  const humanSystems = uniq(
    DEPENDENCIES.filter((d) => serviceIds.includes(d.targetNodeId)).map((d) =>
      hsLink(d.sourceNodeId)
    )
  );
  const impacts = Object.values(IMPACT_OPPORTUNITIES)
    .filter((o) => o.ecosystemIds.includes(id as any))
    .map((o) => ({ id: o.id, name: o.title, href: `/impact/${o.id}` }));
  return {
    kind: "Ecosystem",
    id,
    showCascade: true,
    title: n.name,
    subtitle: "Living System",
    humanTranslation: n.humanTranslation,
    flagship: id === "EC_AMAZON_RAINFOREST",
    sections: nonEmpty([
      { label: "Species", items: sp.map(spLink) },
      { label: "Ecological Functions", items: aggFunctions(sp) },
      { label: "Ecosystem Services", items: aggServices(sp) },
      { label: "Recipients", items: aggRecipients(sp) },
      { label: "Human Systems Depending On It", items: humanSystems },
      { label: "Threats", items: threats },
      { label: "Threat Drivers", items: drivers },
      { label: "Solutions", items: aggSolutions(sp) },
      { label: "Missions", items: aggMissions(sp) },
      { label: "Impact Opportunities", items: impacts },
      { label: "Sources", items: aggSources(sp) },
    ]),
  };
}

function humanSystemIntel(id: string): NodeIntel {
  const n = HUMAN_SYSTEMS[id as keyof typeof HUMAN_SYSTEMS];
  const deps = dependenciesFrom(id);
  const g = humanSystemGraph(id);
  const dependsOn = deps
    .filter((d) => d.relationshipType !== "VULNERABLE_TO")
    .map((d) => resolveNodeRef(d.targetNodeId, d.relationshipType.replace(/_/g, " ").toLowerCase()));
  const threats = uniq([
    ...g.vulnThreats.map((t) => thLink(t)),
    ...aggThreats(g.speciesNodes),
  ]);
  const solutions = uniq(threats.flatMap((t) => solutionsForThreat(t.id).map((s) => solLink(s.id))));
  return {
    kind: "Human System",
    id,
    showCascade: true,
    title: n.name,
    subtitle: "How civilization depends on living systems",
    humanTranslation: n.humanTranslation,
    sections: nonEmpty([
      { label: "Depends On", items: dependsOn },
      { label: "Ecological Functions Supporting It", items: g.functions.map((f) => fnLink(f)) },
      { label: "Ecosystem Services Supporting It", items: g.services.map((s) => svLink(s)) },
      { label: "Species Indirectly Supporting It", items: g.species },
      { label: "Threats It Is Vulnerable To", items: threats },
      { label: "Solutions That Reduce Vulnerability", items: solutions },
      { label: "Relevant Impact Opportunities", items: impactForSpecies(g.speciesNodes) },
      { label: "Connected Missions", items: aggMissions(g.speciesNodes) },
    ]),
  };
}

function impactIntel(id: string): NodeIntel {
  const o = IMPACT_OPPORTUNITIES[id];
  return {
    kind: "Impact Opportunity",
    id,
    title: o.title,
    subtitle: "Where action creates impact",
    humanTranslation: o.description,
    sections: nonEmpty([
      { label: "Solutions", items: o.solutionIds.map((s) => solLink(s)) },
      { label: "Species", items: o.speciesIds.map((sid) => {
        const s = speciesList.find((x) => x.id === sid);
        return s ? spLink(s) : { id: sid, name: sid };
      }) },
      { label: "Ecosystems", items: o.ecosystemIds.map((e) => ecLink(e)) },
      { label: "Threats", items: o.threatIds.map((t) => thLink(t)) },
      { label: "Expected Outcomes", items: o.expectedOutcomes.map((x, i) => ({ id: `out${i}`, name: x })) },
      { label: "Measurement", items: [{ id: "m", name: o.measurementMethod }] },
      { label: "Cost Model", items: [{ id: "c", name: o.costModel }] },
      {
        label: "Capital (draft)",
        items: Object.values(CAPITAL)
          .filter((c) => c.impactId === id)
          .map((c) => ({ id: c.id, name: c.title, sub: c.capitalType })),
      },
    ]),
  };
}

function threatIntel(id: string): NodeIntel {
  const n = TH[id];
  const sp = speciesByThreat(id);
  const exposed = uniq(
    DEPENDENCIES.filter((d) => d.targetNodeId === id).map((d) => hsLink(d.sourceNodeId))
  );
  return {
    kind: "Threat",
    id,
    showCascade: true,
    title: n.name,
    subtitle: `${n.category} · driver: ${DR[n.driver].name}`,
    humanTranslation: n.humanTranslation,
    sections: nonEmpty([
      { label: "Affected Species", items: sp.map(spLink) },
      { label: "Driver", items: [drLink(n.driver)] },
      { label: "Human Systems Exposed", items: exposed },
      { label: "Solutions Addressing It", items: solutionsForThreat(id).map((s) => solLink(s.id)) },
      { label: "Affected Ecosystems", items: aggEcosystems(sp) },
      { label: "Connected Missions", items: aggMissions(sp) },
    ]),
  };
}

function solutionIntel(id: string): NodeIntel {
  const n = SOL[id];
  const sp = speciesBySolution(id);
  return {
    kind: "Solution",
    id,
    title: n.name,
    humanTranslation: n.humanTranslation,
    sections: nonEmpty([
      { label: "Threats Addressed", items: n.addressesThreats.map((t) => thLink(t)) },
      { label: "Species Supported", items: sp.map(spLink) },
      { label: "Ecosystems Supported", items: aggEcosystems(sp) },
      { label: "Connected Missions", items: aggMissions(sp) },
    ]),
  };
}

function functionIntel(id: string): NodeIntel {
  const n = F[id];
  const sp = speciesByFunction(id);
  const hs = humanSystemsDependingOn([id, ...(n.supportsServices as unknown as string[])]);
  return {
    kind: "Ecological Function",
    id,
    showCascade: true,
    title: n.name,
    humanTranslation: n.humanTranslation,
    sections: nonEmpty([
      { label: "Species Performing It", items: sp.map(spLink) },
      { label: "Services Supported", items: n.supportsServices.map((v) => svLink(v)) },
      {
        label: "Recipients",
        items: uniq(n.supportsServices.flatMap((v) => SV[v].benefitsRecipients.map((r) => rcLink(r)))),
      },
      { label: "Human Systems Depending On It", items: hs },
      { label: "Threats Affecting It", items: aggThreats(sp) },
      { label: "Solutions Supporting It", items: aggSolutions(sp) },
      { label: "Impact Opportunities", items: impactForSpecies(sp) },
      { label: "Connected Missions", items: aggMissions(sp) },
    ]),
  };
}

function serviceIntel(id: string): NodeIntel {
  const n = SV[id];
  const sp = speciesByService(id);
  const humanSystems = uniq(
    DEPENDENCIES.filter((d) => d.targetNodeId === id).map((d) => hsLink(d.sourceNodeId))
  );
  return {
    kind: "Ecosystem Service",
    id,
    showCascade: true,
    title: n.name,
    humanTranslation: n.humanTranslation,
    sections: nonEmpty([
      { label: "Supporting Functions", items: functionsSupportingService(id).map((f) => fnLink(f.id)) },
      { label: "Supporting Species", items: sp.map(spLink) },
      { label: "Benefiting Recipients", items: n.benefitsRecipients.map((r) => rcLink(r)) },
      { label: "Human Systems Depending On It", items: humanSystems },
      { label: "Threats Affecting It", items: aggThreats(sp) },
      { label: "Solutions Supporting It", items: aggSolutions(sp) },
      { label: "Impact Opportunities", items: impactForSpecies(sp) },
      { label: "Connected Missions", items: aggMissions(sp) },
    ]),
  };
}

function missionIntel(id: string): NodeIntel {
  const n = MS[id];
  const sp = speciesByMission(id);
  return {
    kind: "Mission",
    id,
    title: n.code,
    subtitle: n.name,
    humanTranslation: n.humanTranslation,
    sections: nonEmpty([
      { label: "Species", items: sp.map(spLink) },
      { label: "Ecosystems", items: aggEcosystems(sp) },
      { label: "Functions", items: aggFunctions(sp) },
      { label: "Services", items: aggServices(sp) },
      { label: "Threats", items: aggThreats(sp) },
      { label: "Solutions", items: aggSolutions(sp) },
    ]),
  };
}

function actorIntel(id: string): NodeIntel {
  const a = ACTORS[id];
  return {
    kind: "Actor",
    id,
    title: a.name,
    subtitle: a.actorType + (a.draft ? " · draft" : ""),
    humanTranslation: a.humanTranslation,
    sections: nonEmpty([
      { label: "Solutions", items: (a.solutionIds ?? []).map((s) => solLink(s)) },
      { label: "Ecosystems", items: (a.ecosystemIds ?? []).map((e) => ecLink(e)) },
      { label: "Missions", items: (a.missionIds ?? []).map((m) => msLink(m)) },
      {
        label: "Impact Opportunities",
        items: (a.impactIds ?? []).map((i) => ({
          id: i,
          name: IMPACT_OPPORTUNITIES[i]?.title ?? i,
          href: `/impact/${i}`,
        })),
      },
    ]),
  };
}

function locationIntel(id: string): NodeIntel {
  const l = LOCATIONS[id];
  const parent = l.parentId ? LOCATIONS[l.parentId] : undefined;
  const children = Object.values(LOCATIONS).filter((x) => x.parentId === id);
  return {
    kind: "Location",
    id,
    title: l.name,
    subtitle: l.locationType,
    humanTranslation: l.humanTranslation,
    sections: nonEmpty([
      {
        label: "Part Of",
        items: parent ? [{ id: parent.id, name: parent.name, href: `/locations/${parent.id}` }] : [],
      },
      {
        label: "Contains",
        items: children.map((c) => ({ id: c.id, name: c.name, sub: c.locationType, href: `/locations/${c.id}` })),
      },
      { label: "Ecosystems", items: (l.ecosystemIds ?? []).map((e) => ecLink(e)) },
    ]),
  };
}

// --- Dependency pathway engine (one complete chain per row) -----------------
export type PathwayStep = { label: string; kind: string; href?: string };

export function buildPathways(systemId: string): PathwayStep[][] {
  const hs = HUMAN_SYSTEMS[systemId as keyof typeof HUMAN_SYSTEMS];
  if (!hs) return [];
  const origin: PathwayStep = {
    label: hs.name,
    kind: "System",
    href: `/human-systems/${systemId}`,
  };
  const chains: PathwayStep[][] = [];

  for (const d of dependenciesFrom(systemId)) {
    const t = d.targetNodeId;
    const chain: PathwayStep[] = [origin];

    if (inReg(t, F)) {
      chain.push({ label: F[t].name, kind: "Function", href: `/functions/${t}` });
      const sp = speciesByFunction(t)[0];
      if (sp) {
        chain.push({ label: sp.commonName, kind: "Species", href: `/species/${sp.slug}` });
        const th = sp.threats[0];
        if (th) {
          chain.push({ label: TH[th.threat].name, kind: "Threat", href: `/threats/${th.threat}` });
          const sol = solutionsForThreat(th.threat)[0];
          if (sol) chain.push({ label: sol.name, kind: "Solution", href: `/solutions/${sol.id}` });
        }
      }
    } else if (inReg(t, SV)) {
      chain.push({ label: SV[t].name, kind: "Service", href: `/services/${t}` });
      const fn = functionsSupportingService(t)[0];
      if (fn) {
        chain.push({ label: fn.name, kind: "Function", href: `/functions/${fn.id}` });
        const sp = speciesByFunction(fn.id as string)[0];
        if (sp) chain.push({ label: sp.commonName, kind: "Species", href: `/species/${sp.slug}` });
      }
    } else if (inReg(t, TH)) {
      chain.push({ label: TH[t].name, kind: "Threat", href: `/threats/${t}` });
      chain.push({ label: DR[TH[t].driver].name, kind: "Driver" });
      const sol = solutionsForThreat(t)[0];
      if (sol) chain.push({ label: sol.name, kind: "Solution", href: `/solutions/${sol.id}` });
    } else {
      const ref = resolveNodeRef(t);
      chain.push({ label: ref.name, kind: "Node", href: ref.href });
    }
    chains.push(chain);
  }
  return chains;
}

const BUILDERS: Record<string, (id: string) => NodeIntel> = {
  ecosystems: ecosystemIntel,
  threats: threatIntel,
  solutions: solutionIntel,
  functions: functionIntel,
  services: serviceIntel,
  missions: missionIntel,
  "human-systems": humanSystemIntel,
  impact: impactIntel,
  actors: actorIntel,
  locations: locationIntel,
};

export const REGISTRY_FOR: Record<string, Record<string, unknown>> = {
  ecosystems: ECOSYSTEMS,
  threats: THREATS,
  solutions: SOLUTIONS,
  functions: FUNCTIONS,
  services: SERVICES,
  missions: MISSIONS,
  "human-systems": HUMAN_SYSTEMS,
  impact: IMPACT_OPPORTUNITIES,
  actors: ACTORS,
  locations: LOCATIONS,
};

export function getNodeIntel(kind: string, id: string): NodeIntel | null {
  const builder = BUILDERS[kind];
  const reg = REGISTRY_FOR[kind];
  if (!builder || !reg || !reg[id]) return null;
  return builder(id);
}

export function idsFor(kind: string): string[] {
  return Object.keys(REGISTRY_FOR[kind] ?? {});
}
