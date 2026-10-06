// ============================================================================
// DEPENDENCIES
// Typed edges answering: what does this depend on? what depends on it? what
// breaks if it disappears? These wire Human Systems to the ecosystem services
// and functions that underpin them, and to the threats that endanger them.
// Seeded minimally and honestly; expand over time.
// ============================================================================

import type { DependencyEdge } from "@/types";

export const DEPENDENCIES: DependencyEdge[] = [
  // --- Amazon living-system pathways (v0.9) --------------------------------
  {
    id: "DEP_AGRI_RAINFALL",
    sourceNodeId: "HS_AGRICULTURE",
    targetNodeId: "SV_RAINFALL_REGULATION",
    relationshipType: "SUPPORTED_BY",
    strength: "High",
    confidence: "Medium",
    explanation: "Regional agriculture depends on forest-regulated rainfall.",
    sourceIds: ["AMAZON_INSTITUTIONAL"],
  },
  {
    id: "DEP_FOOD_AGRI",
    sourceNodeId: "HS_FOOD",
    targetNodeId: "HS_AGRICULTURE",
    relationshipType: "SUPPORTED_BY",
    strength: "Critical",
    confidence: "High",
    explanation: "The food system rests on regional agriculture.",
  },
  {
    id: "DEP_WATER_CYCLING",
    sourceNodeId: "HS_WATER",
    targetNodeId: "SV_WATER_CYCLING",
    relationshipType: "SUPPORTED_BY",
    strength: "High",
    confidence: "Medium",
    explanation: "Freshwater supply depends on forest water cycling.",
  },
  {
    id: "DEP_WATER_RAINFALL",
    sourceNodeId: "HS_WATER",
    targetNodeId: "SV_RAINFALL_REGULATION",
    relationshipType: "ENHANCED_BY",
    strength: "Moderate",
    confidence: "Medium",
    explanation: "Rainfall regulation supports regional water availability.",
  },
  {
    id: "DEP_CLIMATE_CARBON",
    sourceNodeId: "HS_CLIMATE",
    targetNodeId: "SV_CARBON_STORAGE",
    relationshipType: "SUPPORTED_BY",
    strength: "High",
    confidence: "Medium",
    explanation: "Climate stability depends on carbon kept in living systems.",
    sourceIds: ["IPCC"],
  },
  {
    id: "DEP_CLIMATE_REGULATION",
    sourceNodeId: "HS_CLIMATE",
    targetNodeId: "SV_CLIMATE_REGULATION",
    relationshipType: "SUPPORTED_BY",
    strength: "High",
    confidence: "Medium",
    explanation: "Climate stability rests on climate-regulating systems.",
  },
  {
    id: "DEP_FOOD_CLIMATE",
    sourceNodeId: "HS_FOOD",
    targetNodeId: "HS_CLIMATE",
    relationshipType: "ENHANCED_BY",
    strength: "High",
    confidence: "Medium",
    explanation: "A stable climate supports reliable food production.",
  },
  {
    id: "DEP_INDIG_HABITAT",
    sourceNodeId: "HS_INDIGENOUS_LIVELIHOODS",
    targetNodeId: "SV_BIODIVERSITY_HABITAT",
    relationshipType: "SUPPORTED_BY",
    strength: "High",
    confidence: "Medium",
    explanation:
      "Indigenous livelihoods are closely tied to intact forest habitat.",
  },
  // Food System
  {
    id: "DEP_FOOD_POLLINATION",
    sourceNodeId: "HS_FOOD",
    targetNodeId: "FN_POLLINATION",
    relationshipType: "SUPPORTED_BY",
    strength: "High",
    confidence: "High",
    explanation:
      "A large share of food crops is linked to animal pollination.",
    sourceIds: ["FAO"],
  },
  {
    id: "DEP_FOOD_FOODPROD",
    sourceNodeId: "HS_FOOD",
    targetNodeId: "SV_FOOD_PRODUCTION",
    relationshipType: "REQUIRED_FOR",
    strength: "Critical",
    confidence: "High",
    explanation: "The food system rests on the food-production service.",
  },
  {
    id: "DEP_FOOD_PESTICIDES",
    sourceNodeId: "HS_FOOD",
    targetNodeId: "TH_PESTICIDES",
    relationshipType: "VULNERABLE_TO",
    strength: "Moderate",
    confidence: "Medium",
    explanation:
      "Over-reliance on pesticides can undermine the pollinators food depends on.",
  },
  {
    id: "DEP_FOOD_WATER",
    sourceNodeId: "HS_FOOD",
    targetNodeId: "SV_WATER_SECURITY",
    relationshipType: "SUPPORTED_BY",
    strength: "High",
    confidence: "High",
    explanation: "Food production depends on reliable fresh water.",
  },
  {
    id: "DEP_FOOD_NUTRIENT",
    sourceNodeId: "HS_FOOD",
    targetNodeId: "FN_NUTRIENT_CYCLING",
    relationshipType: "SUPPORTED_BY",
    strength: "High",
    confidence: "Medium",
    explanation: "Soil fertility rests on nutrient cycling.",
  },
  {
    id: "DEP_FOOD_FORAGE",
    sourceNodeId: "HS_FOOD",
    targetNodeId: "TH_FORAGE_LOSS",
    relationshipType: "VULNERABLE_TO",
    strength: "Moderate",
    confidence: "Medium",
    explanation: "Loss of pollinator forage weakens crop pollination.",
  },
  {
    id: "DEP_FOOD_DROUGHT",
    sourceNodeId: "HS_FOOD",
    targetNodeId: "TH_CLIMATE_DROUGHT",
    relationshipType: "VULNERABLE_TO",
    strength: "High",
    confidence: "Medium",
    explanation: "Drought reduces yields and stresses food supply.",
  },
  // Water System
  {
    id: "DEP_WATER_WATERSEC",
    sourceNodeId: "HS_WATER",
    targetNodeId: "SV_WATER_SECURITY",
    relationshipType: "REQUIRED_FOR",
    strength: "Critical",
    confidence: "High",
    explanation: "The water system depends on the water-security service.",
  },
  {
    id: "DEP_WATER_DROUGHT",
    sourceNodeId: "HS_WATER",
    targetNodeId: "TH_CLIMATE_DROUGHT",
    relationshipType: "VULNERABLE_TO",
    strength: "High",
    confidence: "Medium",
    explanation: "Drought directly stresses freshwater supply.",
  },
  // Healthcare System
  {
    id: "DEP_HEALTH_BIODIV",
    sourceNodeId: "HS_HEALTHCARE",
    targetNodeId: "SV_BIODIVERSITY_MAINTENANCE",
    relationshipType: "ENHANCED_BY",
    strength: "Moderate",
    confidence: "Medium",
    explanation:
      "Biodiversity is associated with discovery of medicines and disease regulation.",
  },
  // Urban / Energy / Financial — climate exposure
  {
    id: "DEP_URBAN_CARBON",
    sourceNodeId: "HS_URBAN",
    targetNodeId: "SV_CARBON_STORAGE",
    relationshipType: "ENHANCED_BY",
    strength: "Moderate",
    confidence: "Medium",
    explanation:
      "Carbon storage in living systems supports a stable climate for cities.",
  },
  {
    id: "DEP_ENERGY_CLIMATE",
    sourceNodeId: "HS_ENERGY",
    targetNodeId: "TH_CLIMATE_CHANGE",
    relationshipType: "CONSTRAINED_BY",
    strength: "High",
    confidence: "Medium",
    explanation:
      "Energy choices both drive and are constrained by climate change.",
  },
  {
    id: "DEP_FINANCIAL_STABILITY",
    sourceNodeId: "HS_FINANCIAL",
    targetNodeId: "SV_ECOSYSTEM_STABILITY",
    relationshipType: "VULNERABLE_TO",
    strength: "Moderate",
    confidence: "Low",
    explanation:
      "Economic value is exposed to the breakdown of ecosystem stability.",
  },
];

export const dependenciesFrom = (nodeId: string) =>
  DEPENDENCIES.filter((d) => d.sourceNodeId === nodeId);
export const dependenciesTo = (nodeId: string) =>
  DEPENDENCIES.filter((d) => d.targetNodeId === nodeId);
