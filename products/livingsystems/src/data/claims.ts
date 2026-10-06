// ============================================================================
// CLAIM REGISTRY
// Traceable statements linked to the sources that support them and the nodes /
// relationships they are about. Confidence and review status are explicit so
// the system stays honest about what is well-supported and what is not.
// ============================================================================

import type { ClaimNode } from "@/types";

export const CLAIMS: Record<string, ClaimNode> = {
  // --- Species status claims -----------------------------------------------
  CLAIM_ORCA_POPULATION: {
    id: "CLAIM_ORCA_POPULATION",
    statement:
      "The global orca population is estimated at at least ~50,000 individuals.",
    nodeId: "SP_ORCA",
    sourceIds: ["IUCN_RED_LIST"],
    confidence: "Medium",
    reviewStatus: "Verified",
    lastReviewed: "2026-06-07",
    dataGaps: ["Estimates vary widely between regions and surveys."],
  },
  CLAIM_JAGUAR_RANGE_LOSS: {
    id: "CLAIM_JAGUAR_RANGE_LOSS",
    statement: "Jaguars have reportedly lost around 50% of their historic range.",
    nodeId: "SP_JAGUAR",
    sourceIds: ["IUCN_RED_LIST", "PANTHERA"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    lastReviewed: "2026-06-07",
  },
  CLAIM_ELEPHANT_ENDANGERED: {
    id: "CLAIM_ELEPHANT_ENDANGERED",
    statement:
      "The African savanna elephant is assessed as Endangered, separately from the forest elephant since 2021.",
    nodeId: "SP_ELEPHANT",
    sourceIds: ["IUCN_RED_LIST"],
    confidence: "High",
    reviewStatus: "Verified",
    lastReviewed: "2026-06-07",
  },
  CLAIM_POLAR_BEAR_SEA_ICE: {
    id: "CLAIM_POLAR_BEAR_SEA_ICE",
    statement:
      "Polar bear body condition and survival are linked to the extent and duration of Arctic sea ice.",
    nodeId: "SP_POLAR_BEAR",
    sourceIds: ["IUCN_RED_LIST", "NOAA", "NASA"],
    confidence: "High",
    reviewStatus: "Verified",
    lastReviewed: "2026-06-08",
  },

  // --- Pollination / Honey Bee (the proof chain) ---------------------------
  CLAIM_BEE_POLLINATION: {
    id: "CLAIM_BEE_POLLINATION",
    statement:
      "The western honey bee performs pollination, transferring pollen that fertilises many flowering plants.",
    nodeId: "SP_HONEY_BEE",
    sourceIds: ["IPBES", "FAO"],
    confidence: "High",
    reviewStatus: "Reviewed",
    lastReviewed: "2026-06-08",
    dataGaps: ["Relative contribution varies by crop and region."],
  },
  CLAIM_BEE_HABITAT: {
    id: "CLAIM_BEE_HABITAT",
    statement:
      "Honey bee colonies depend on diverse floral resources and habitat for forage.",
    nodeId: "SP_HONEY_BEE",
    sourceIds: ["IPBES"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Forage availability not yet mapped by region."],
  },
  CLAIM_BEE_THREATS: {
    id: "CLAIM_BEE_THREATS",
    statement:
      "Honey bee health can be weakened by pesticide exposure, disease and habitat loss.",
    nodeId: "SP_HONEY_BEE",
    sourceIds: ["IPBES", "FAO"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Relative weight of each driver remains uncertain."],
  },
  CLAIM_POLLINATION_REPRO: {
    id: "CLAIM_POLLINATION_REPRO",
    statement:
      "Pollination supports the reproduction of many wild flowering plants.",
    nodeId: "FN_POLLINATION",
    sourceIds: ["IPBES"],
    confidence: "High",
    reviewStatus: "Verified",
  },
  CLAIM_POLLINATION_CROPS: {
    id: "CLAIM_POLLINATION_CROPS",
    statement:
      "Pollination supports crop production for a substantial share of food crops.",
    nodeId: "FN_POLLINATION",
    sourceIds: ["IPBES", "FAO"],
    confidence: "High",
    reviewStatus: "Reviewed",
    dataGaps: ["Exact share depends on crop mix and measurement method."],
  },
  CLAIM_POLLINATION_DEPENDS_POLLINATORS: {
    id: "CLAIM_POLLINATION_DEPENDS_POLLINATORS",
    statement:
      "Pollination depends on pollinators such as bees and other insects.",
    nodeId: "FN_POLLINATION",
    sourceIds: ["IPBES"],
    confidence: "High",
    reviewStatus: "Verified",
  },
  CLAIM_FOOD_DEP_POLLINATION: {
    id: "CLAIM_FOOD_DEP_POLLINATION",
    statement:
      "The food system depends in part on pollination through crop production.",
    nodeId: "HS_FOOD",
    relationshipId: "DEP_FOOD_POLLINATION",
    sourceIds: ["IPBES", "FAO"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Quantitative dependency strength not yet modelled."],
  },

  // --- Threat cascade ------------------------------------------------------
  CLAIM_PESTICIDES_POLLINATOR: {
    id: "CLAIM_PESTICIDES_POLLINATOR",
    statement: "Pesticide use can reduce pollinator health and abundance.",
    nodeId: "TH_PESTICIDES",
    sourceIds: ["IPBES"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Field and laboratory effect sizes differ."],
  },
  CLAIM_POLLINATOR_DECLINE_SERVICE: {
    id: "CLAIM_POLLINATOR_DECLINE_SERVICE",
    statement:
      "Pollinator decline can weaken the pollination that crops rely on.",
    nodeId: "FN_POLLINATION",
    relationshipId: "DEP_FOOD_POLLINATION",
    sourceIds: ["IPBES"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
  },

  // --- Amazon (honestly under-sourced for now) -----------------------------
  CLAIM_AMAZON_CARBON: {
    id: "CLAIM_AMAZON_CARBON",
    statement:
      "The Amazon rainforest stores large amounts of carbon, supporting climate regulation.",
    nodeId: "EC_AMAZON_RAINFOREST",
    sourceIds: ["IPCC", "NASA", "AMAZON_INSTITUTIONAL"],
    confidence: "Medium",
    reviewStatus: "NeedsSource",
    dataGaps: ["Specific carbon-stock sources still to be itemised."],
  },
  CLAIM_AMAZON_BIODIVERSITY: {
    id: "CLAIM_AMAZON_BIODIVERSITY",
    statement:
      "The Amazon rainforest provides habitat for a very large share of terrestrial biodiversity.",
    nodeId: "EC_AMAZON_RAINFOREST",
    sourceIds: ["AMAZON_INSTITUTIONAL"],
    confidence: "Medium",
    reviewStatus: "NeedsSource",
  },
  CLAIM_AMAZON_RAINFALL: {
    id: "CLAIM_AMAZON_RAINFALL",
    statement:
      "The Amazon is associated with regional rainfall generation ('flying rivers') that can influence agriculture.",
    nodeId: "EC_AMAZON_RAINFOREST",
    sourceIds: ["AMAZON_INSTITUTIONAL"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Strength of the effect varies regionally."],
  },
  CLAIM_AMAZON_EVAPOTRANSPIRATION: {
    id: "CLAIM_AMAZON_EVAPOTRANSPIRATION",
    statement:
      "Amazon forest cover contributes to water cycling through evapotranspiration.",
    nodeId: "SV_WATER_CYCLING",
    sourceIds: ["AMAZON_INSTITUTIONAL", "NASA"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
  },
  CLAIM_RAINFALL_AGRICULTURE: {
    id: "CLAIM_RAINFALL_AGRICULTURE",
    statement:
      "Rainfall regulation supports regional agriculture and water availability.",
    nodeId: "SV_RAINFALL_REGULATION",
    relationshipId: "DEP_AGRI_RAINFALL",
    sourceIds: ["AMAZON_INSTITUTIONAL", "FAO"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Quantitative dependency strength not yet modelled."],
  },
  CLAIM_DEFOR_CARBON: {
    id: "CLAIM_DEFOR_CARBON",
    statement:
      "Deforestation and forest degradation can weaken carbon storage.",
    nodeId: "TH_DEFORESTATION",
    sourceIds: ["IPCC", "INPE"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
  },
  CLAIM_AMAZON_BIODIV_HABITAT: {
    id: "CLAIM_AMAZON_BIODIV_HABITAT",
    statement:
      "The Amazon provides habitat for high levels of biodiversity.",
    nodeId: "SV_BIODIVERSITY_HABITAT",
    sourceIds: ["AMAZON_INSTITUTIONAL", "WWF_AMAZON"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
  },
  CLAIM_AMAZON_FIRE: {
    id: "CLAIM_AMAZON_FIRE",
    statement:
      "Fire and forest degradation threaten Amazon ecosystem integrity.",
    nodeId: "TH_FIRE",
    sourceIds: ["INPE", "WWF_AMAZON"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Fire, climate and deforestation interactions are complex."],
  },
  CLAIM_INDIGENOUS_PROTECTION: {
    id: "CLAIM_INDIGENOUS_PROTECTION",
    statement:
      "Indigenous territories and stewardship are associated with significant forest protection outcomes in many contexts.",
    nodeId: "SO_INDIGENOUS_STEWARDSHIP",
    sourceIds: ["RAISG", "WWF_AMAZON"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    explanation:
      "Association observed in many studies; outcomes are context-dependent, not guaranteed.",
    dataGaps: ["Outcomes vary by territory and governance context."],
  },
  CLAIM_ILLEGAL_MINING_WATER: {
    id: "CLAIM_ILLEGAL_MINING_WATER",
    statement:
      "Illegal mining can threaten water quality, ecosystems and Indigenous communities.",
    nodeId: "TH_ILLEGAL_MINING",
    sourceIds: ["RAISG"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Extent and mercury impacts not fully mapped."],
  },
  CLAIM_FOREST_RESTORATION: {
    id: "CLAIM_FOREST_RESTORATION",
    statement:
      "Forest restoration can support biodiversity habitat and carbon storage.",
    nodeId: "SO_FOREST_RESTORATION",
    sourceIds: ["AMAZON_INSTITUTIONAL"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Outcomes depend on method, scale and time."],
  },
  CLAIM_PROTECTED_AREAS: {
    id: "CLAIM_PROTECTED_AREAS",
    statement:
      "Protected areas can help reduce ecosystem conversion and habitat loss.",
    nodeId: "SO_PROTECTED_AREAS",
    sourceIds: ["WWF_AMAZON", "RAISG"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
  },
  CLAIM_SUPPLY_CHAIN: {
    id: "CLAIM_SUPPLY_CHAIN",
    statement:
      "Supply chain pressure is a driver of deforestation risk in parts of the Amazon.",
    nodeId: "TH_SUPPLY_CHAIN_PRESSURE",
    sourceIds: ["WWF_AMAZON"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Attribution by commodity is partial."],
  },
  CLAIM_CLIMATE_INTERACTION: {
    id: "CLAIM_CLIMATE_INTERACTION",
    statement: "Climate stress can interact with deforestation and fire risk.",
    nodeId: "TH_CLIMATE_CHANGE",
    sourceIds: ["IPCC"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
  },
  CLAIM_RAINFALL_RISK: {
    id: "CLAIM_RAINFALL_RISK",
    statement:
      "Weakening rainfall regulation may create risks for agriculture and water systems.",
    nodeId: "SV_RAINFALL_REGULATION",
    relationshipId: "DEP_AGRI_RAINFALL",
    sourceIds: ["AMAZON_INSTITUTIONAL"],
    confidence: "Low",
    reviewStatus: "NeedsSource",
    dataGaps: ["Thresholds and regional variation not yet quantified."],
  },
  CLAIM_AMAZON_CASCADE: {
    id: "CLAIM_AMAZON_CASCADE",
    statement:
      "Amazon ecosystem degradation can create cascading risks across ecological and human systems.",
    nodeId: "EC_AMAZON_RAINFOREST",
    sourceIds: ["AMAZON_INSTITUTIONAL", "IPCC"],
    confidence: "Low",
    reviewStatus: "Draft",
    dataGaps: ["Cascade magnitudes are illustrative, not yet quantified."],
  },
  CLAIM_PESTICIDES_REDUCTION: {
    id: "CLAIM_PESTICIDES_REDUCTION",
    statement:
      "Pesticide reduction can reduce pressure on pollinators and support pollination services.",
    nodeId: "SO_PESTICIDE_REDUCTION",
    sourceIds: ["IPBES"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
    dataGaps: ["Outcomes depend on practice and context."],
  },
  CLAIM_POLLINATOR_HABITAT: {
    id: "CLAIM_POLLINATOR_HABITAT",
    statement:
      "Pollinator habitat can support pollinator populations and pollination resilience.",
    nodeId: "SO_POLLINATOR_HABITAT",
    sourceIds: ["IPBES"],
    confidence: "Medium",
    reviewStatus: "Reviewed",
  },
};
