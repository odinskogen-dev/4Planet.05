import { CANONICAL_CORRECTION_EXAMPLE, CANONICAL_UPDATE_KPA_OPEN, type CanonicalUpdate } from "@/content/livingPlanetCell";

export const LIVING_PLANET_SURFACES = ["BRAIN", "ACTOR", "ATLAS_PLACE", "RESEARCH", "MAGAZINE", "FEED", "GET_INVOLVED", "IMPACT"] as const;
export type LivingPlanetSurface = (typeof LIVING_PLANET_SURFACES)[number];

export type SurfaceProjection = {
  surface: LivingPlanetSurface;
  updateId: string;
  revision: number;
  title: string;
  fact: string;
  sourceIds: string[];
  correctionOf?: string;
};

const surfaceMap: Record<(typeof CANONICAL_UPDATE_KPA_OPEN.projectsTo)[number], LivingPlanetSurface> = {
  BRAIN: "BRAIN",
  ACTOR: "ACTOR",
  PLACE: "ATLAS_PLACE",
  RESEARCH: "RESEARCH",
  MAGAZINE: "MAGAZINE",
  FEED: "FEED",
  GET_INVOLVED: "GET_INVOLVED",
  IMPACT: "IMPACT",
};

export function projectCanonicalUpdate(update: CanonicalUpdate): SurfaceProjection[] {
  if (update.visibility !== "PUBLIC_SAFE" || !update.sourceIds.length) return [];
  return update.projectsTo.map((surface) => ({
    surface: surfaceMap[surface],
    updateId: update.id,
    revision: update.revision,
    title: update.title,
    fact: update.fact,
    sourceIds: [...update.sourceIds],
    correctionOf: update.correctionOf,
  }));
}

export function applyCanonicalCorrection(existing: SurfaceProjection[], correction: CanonicalUpdate): SurfaceProjection[] {
  if (!correction.correctionOf) return existing;
  const corrected = projectCanonicalUpdate(correction);
  const correctedSurfaces = new Set(corrected.map((item) => item.surface));
  return [
    ...existing.filter((item) => !(item.updateId === correction.correctionOf && correctedSurfaces.has(item.surface))),
    ...corrected,
  ];
}

export const KPA_OPEN_PROJECTIONS = projectCanonicalUpdate(CANONICAL_UPDATE_KPA_OPEN);
export const KPA_CORRECTED_PROJECTIONS = applyCanonicalCorrection(KPA_OPEN_PROJECTIONS, CANONICAL_CORRECTION_EXAMPLE);

export function projectionFor(surface: LivingPlanetSurface, corrected = true) {
  const source = corrected ? KPA_CORRECTED_PROJECTIONS : KPA_OPEN_PROJECTIONS;
  return source.find((item) => item.surface === surface);
}
