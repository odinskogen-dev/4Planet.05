export const FOOD_SPECIES_HANDOFF_SOURCE = "s4piens-food";

export type FoodSpeciesHandoff = {
  scientificName: string;
  rank: "species";
  source: typeof FOOD_SPECIES_HANDOFF_SOURCE;
};

const SAFE_SCIENTIFIC_NAME = /^[\p{L}\p{M}×.' -]{2,120}$/u;

function normaliseScientificName(value: string | null | undefined): string | null {
  const scientificName = String(value ?? "").trim().replace(/\s+/g, " ");
  return SAFE_SCIENTIFIC_NAME.test(scientificName) ? scientificName : null;
}

export function buildFoodSpeciesHandoffHref(scientificName: string): string {
  const safeName = normaliseScientificName(scientificName);
  if (!safeName) return "/species/lab";
  const query = new URLSearchParams({
    source: FOOD_SPECIES_HANDOFF_SOURCE,
    scientificName: safeName,
    rank: "species",
  });
  return `/species/lab?${query.toString()}`;
}

export function parseFoodSpeciesHandoff(search: string): FoodSpeciesHandoff | null {
  const query = new URLSearchParams(search);
  if (query.get("source") !== FOOD_SPECIES_HANDOFF_SOURCE) return null;
  if (query.get("rank") !== "species") return null;
  const scientificName = normaliseScientificName(query.get("scientificName"));
  if (!scientificName) return null;
  return { scientificName, rank: "species", source: FOOD_SPECIES_HANDOFF_SOURCE };
}

export function isFoodSpeciesHandoffRequest(search: string): boolean {
  return new URLSearchParams(search).get("source") === FOOD_SPECIES_HANDOFF_SOURCE;
}
