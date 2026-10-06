// ============================================================================
// LOCATIONS — Spatial intelligence foundation.
// Minimal seed hierarchy; ecosystems link to places via ecosystemIds.
// ============================================================================

import type { LocationNode } from "@/types";
import { eid } from "@/types";

export const LOCATIONS: Record<string, LocationNode> = {
  LOC_EARTH: {
    id: "LOC_EARTH",
    name: "Earth",
    locationType: "Planet",
    humanTranslation: "The planet — the whole living system.",
  },
  LOC_SOUTH_AMERICA: {
    id: "LOC_SOUTH_AMERICA",
    name: "South America",
    locationType: "Continent",
    parentId: "LOC_EARTH",
    humanTranslation: "The continent holding most of the Amazon.",
  },
  LOC_BRAZIL: {
    id: "LOC_BRAZIL",
    name: "Brazil",
    locationType: "Country",
    parentId: "LOC_SOUTH_AMERICA",
    humanTranslation: "The country with the largest share of the Amazon.",
  },
  LOC_AMAZON_BASIN: {
    id: "LOC_AMAZON_BASIN",
    name: "Amazon Basin",
    locationType: "Region",
    parentId: "LOC_SOUTH_AMERICA",
    ecosystemIds: [eid("EC_AMAZON_RAINFOREST")],
    humanTranslation: "The river basin defining the Amazon rainforest region.",
  },
  LOC_AMAZON_BIOME: {
    id: "LOC_AMAZON_BIOME",
    name: "Amazon Rainforest Biome",
    locationType: "Biome",
    parentId: "LOC_AMAZON_BASIN",
    ecosystemIds: [eid("EC_AMAZON_RAINFOREST")],
    humanTranslation: "The tropical-forest biome of the Amazon.",
  },
  LOC_ARCTIC_OCEAN: {
    id: "LOC_ARCTIC_OCEAN",
    name: "Arctic Ocean",
    locationType: "Marine Area",
    parentId: "LOC_EARTH",
    humanTranslation: "The polar ocean and sea-ice region.",
  },
};
