// ============================================================================
// REGISTRY LIB
// The only place the UI asks for node data. Resolves ID references into
// hydrated objects and walks the Species → Function → Service → Recipient chain.
// If a referenced ID is missing it throws loudly in dev — a broken edge should
// never render silently.
// ============================================================================

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
import type {
  FunctionId,
  ServiceId,
  RecipientId,
  ThreatId,
  DriverId,
  SolutionId,
  EcosystemId,
  MissionId,
  FunctionNode,
  ServiceNode,
  RecipientNode,
  ThreatNode,
  DriverNode,
  SolutionNode,
  EcosystemNode,
  MissionNode,
  SpeciesProfile,
  ResolvedFunctionChain,
} from "@/types";

function need<T>(table: Record<string, T>, id: string, kind: string): T {
  const node = table[id];
  if (!node) throw new Error(`[registry] missing ${kind} node: ${id}`);
  return node;
}

export const getFunction = (id: FunctionId): FunctionNode =>
  need(FUNCTIONS, id, "function");
export const getService = (id: ServiceId): ServiceNode =>
  need(SERVICES, id, "service");
export const getRecipient = (id: RecipientId): RecipientNode =>
  need(RECIPIENTS, id, "recipient");
export const getThreat = (id: ThreatId): ThreatNode =>
  need(THREATS, id, "threat");
export const getDriver = (id: DriverId): DriverNode =>
  need(DRIVERS, id, "driver");
export const getSolution = (id: SolutionId): SolutionNode =>
  need(SOLUTIONS, id, "solution");
export const getEcosystem = (id: EcosystemId): EcosystemNode =>
  need(ECOSYSTEMS, id, "ecosystem");
export const getMission = (id: MissionId): MissionNode =>
  need(MISSIONS, id, "mission");

/** Sources may be referenced loosely; return null rather than throw. */
export const getSource = (id: string) => SOURCES[id] ?? null;

/**
 * Walk the full dominant chain for a species:
 *   Function → Service → Recipient
 * Returns hydrated, de-duplicated nodes ready to render.
 */
export function resolveFunctionChains(
  species: SpeciesProfile
): ResolvedFunctionChain[] {
  return species.functions.map((fnId) => {
    const fn = getFunction(fnId);
    return {
      function: fn,
      services: fn.supportsServices.map((svId) => {
        const service = getService(svId);
        return {
          service,
          recipients: service.benefitsRecipients.map(getRecipient),
        };
      }),
    };
  });
}

/** Flat, de-duplicated list of every recipient a species ultimately touches. */
export function resolveRecipients(species: SpeciesProfile): RecipientNode[] {
  const seen = new Set<string>();
  const out: RecipientNode[] = [];
  for (const chain of resolveFunctionChains(species)) {
    for (const sc of chain.services) {
      for (const r of sc.recipients) {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          out.push(r);
        }
      }
    }
  }
  return out;
}

/** Primary ecosystem (first Critical dependency, else first listed). */
export function primaryEcosystem(species: SpeciesProfile): EcosystemNode | null {
  const links = species.distribution.ecosystems;
  if (links.length === 0) return null;
  const critical = links.find((l) => l.dependency === "Critical");
  return getEcosystem((critical ?? links[0]).ecosystem);
}

// --- Reverse-edge counts (the species list is passed in to keep this pure) ---

export function countSpeciesByEcosystem(
  list: SpeciesProfile[],
  id: EcosystemId
): number {
  return list.filter((s) =>
    s.distribution.ecosystems.some((l) => l.ecosystem === id)
  ).length;
}

export function countSpeciesByThreat(
  list: SpeciesProfile[],
  id: ThreatId
): number {
  return list.filter((s) => s.threats.some((l) => l.threat === id)).length;
}

export function countSpeciesBySolution(
  list: SpeciesProfile[],
  id: SolutionId
): number {
  return list.filter((s) => s.solutions.some((l) => l.solution === id)).length;
}
