// ============================================================================
// NODE REGISTRY
// Shared, first-class nodes. Species reference these by ID; the registry never
// references species. Edges between nodes (Function→Service→Recipient,
// Threat→Driver, Solution→Threat) live here so they are defined once and reused.
//
// Adding a species = referencing existing node IDs + adding any genuinely new
// node here. Two species pointing at FN_PREDATION share the exact same node.
// ============================================================================

import type {
  FunctionNode,
  ServiceNode,
  RecipientNode,
  DriverNode,
  ThreatNode,
  SolutionNode,
  EcosystemNode,
  MissionNode,
  FunctionId,
  ServiceId,
  RecipientId,
  DriverId,
  ThreatId,
  SolutionId,
  EcosystemId,
  MissionId,
} from "@/types";
import { fid, svid, rid, did, tid, solid, eid, mid } from "@/types";

// --- RECIPIENTS (terminal nodes: who/what benefits) -------------------------

export const RECIPIENTS: Record<RecipientId, RecipientNode> = {
  [rid("RC_BIODIVERSITY")]: {
    id: rid("RC_BIODIVERSITY"),
    name: "Biodiversity",
    humanTranslation: "The full variety of living things in a place.",
  },
  [rid("RC_FORESTS")]: {
    id: rid("RC_FORESTS"),
    name: "Forests",
    humanTranslation: "Wooded ecosystems and the life they hold.",
  },
  [rid("RC_WILD_PLANTS")]: {
    id: rid("RC_WILD_PLANTS"),
    name: "Wild Plants",
    humanTranslation: "Plant communities growing without cultivation.",
  },
  [rid("RC_HUMANS")]: {
    id: rid("RC_HUMANS"),
    name: "Humans",
    humanTranslation: "People and the societies that depend on nature.",
  },
  [rid("RC_FARMS")]: {
    id: rid("RC_FARMS"),
    name: "Farms",
    humanTranslation: "Agricultural land that produces food.",
  },
  [rid("RC_FISHERIES")]: {
    id: rid("RC_FISHERIES"),
    name: "Fisheries",
    humanTranslation: "Wild and managed fish populations people rely on.",
  },
  [rid("RC_WATERSHEDS")]: {
    id: rid("RC_WATERSHEDS"),
    name: "Watersheds",
    humanTranslation: "Land areas that collect and supply fresh water.",
  },
  [rid("RC_CLIMATE_SYSTEM")]: {
    id: rid("RC_CLIMATE_SYSTEM"),
    name: "Climate System",
    humanTranslation: "The global processes that regulate Earth's climate.",
  },
  [rid("RC_FUTURE_GENERATIONS")]: {
    id: rid("RC_FUTURE_GENERATIONS"),
    name: "Future Generations",
    humanTranslation: "The people who will inherit the planet we leave behind.",
  },
  [rid("RC_FOOD_SYSTEMS")]: {
    id: rid("RC_FOOD_SYSTEMS"),
    name: "Food Systems",
    humanTranslation: "How food is grown, supplied and reaches people.",
  },
  [rid("RC_FRESHWATER_SYSTEMS")]: {
    id: rid("RC_FRESHWATER_SYSTEMS"),
    name: "Freshwater Systems",
    humanTranslation: "Rivers, lakes and groundwater that life and people rely on.",
  },
  [rid("RC_COASTAL_COMMUNITIES")]: {
    id: rid("RC_COASTAL_COMMUNITIES"),
    name: "Coastal Communities",
    humanTranslation: "People living along coasts, exposed to ocean change.",
  },
};

// --- SERVICES (Function → Service → Recipient) ------------------------------

export const SERVICES: Record<ServiceId, ServiceNode> = {
  [svid("SV_RAINFALL_REGULATION")]: {
    id: svid("SV_RAINFALL_REGULATION"),
    name: "Rainfall Regulation",
    humanTranslation:
      "Forests recycling moisture that falls as rain across a region.",
    benefitsRecipients: [
      rid("RC_FARMS"),
      rid("RC_WATERSHEDS"),
      rid("RC_HUMANS"),
      rid("RC_FOOD_SYSTEMS"),
    ],
  },
  [svid("SV_WATER_CYCLING")]: {
    id: svid("SV_WATER_CYCLING"),
    name: "Water Cycling",
    humanTranslation:
      "Moving water through plants, soil and air via evapotranspiration.",
    benefitsRecipients: [
      rid("RC_WATERSHEDS"),
      rid("RC_FRESHWATER_SYSTEMS"),
      rid("RC_FORESTS"),
    ],
  },
  [svid("SV_CLIMATE_REGULATION")]: {
    id: svid("SV_CLIMATE_REGULATION"),
    name: "Climate Regulation",
    humanTranslation:
      "Helping keep the climate within a stable, liveable range.",
    benefitsRecipients: [
      rid("RC_CLIMATE_SYSTEM"),
      rid("RC_HUMANS"),
      rid("RC_FUTURE_GENERATIONS"),
    ],
  },
  [svid("SV_BIODIVERSITY_HABITAT")]: {
    id: svid("SV_BIODIVERSITY_HABITAT"),
    name: "Biodiversity Habitat",
    humanTranslation:
      "Providing the living space many species need to survive.",
    benefitsRecipients: [
      rid("RC_BIODIVERSITY"),
      rid("RC_WILD_PLANTS"),
      rid("RC_FORESTS"),
    ],
  },
  [svid("SV_ECOSYSTEM_STABILITY")]: {
    id: svid("SV_ECOSYSTEM_STABILITY"),
    name: "Ecosystem Stability",
    humanTranslation:
      "Ecosystems staying balanced enough to keep functioning over time.",
    benefitsRecipients: [rid("RC_BIODIVERSITY"), rid("RC_FORESTS")],
  },
  [svid("SV_BIODIVERSITY_MAINTENANCE")]: {
    id: svid("SV_BIODIVERSITY_MAINTENANCE"),
    name: "Biodiversity Maintenance",
    humanTranslation:
      "Keeping a wide range of species present rather than a few dominant ones.",
    benefitsRecipients: [rid("RC_BIODIVERSITY"), rid("RC_WILD_PLANTS")],
  },
  [svid("SV_FOREST_REGENERATION")]: {
    id: svid("SV_FOREST_REGENERATION"),
    name: "Forest Regeneration",
    humanTranslation: "Forests regrowing and renewing themselves naturally.",
    benefitsRecipients: [rid("RC_FORESTS"), rid("RC_WILD_PLANTS")],
  },
  [svid("SV_CARBON_STORAGE")]: {
    id: svid("SV_CARBON_STORAGE"),
    name: "Carbon Storage",
    humanTranslation:
      "Locking carbon into living systems instead of the atmosphere.",
    benefitsRecipients: [rid("RC_CLIMATE_SYSTEM"), rid("RC_HUMANS"), rid("RC_FUTURE_GENERATIONS")],
  },
  [svid("SV_FOOD_PRODUCTION")]: {
    id: svid("SV_FOOD_PRODUCTION"),
    name: "Food Production",
    humanTranslation: "The supply of food that people and animals eat.",
    benefitsRecipients: [rid("RC_HUMANS"), rid("RC_FARMS"), rid("RC_FOOD_SYSTEMS")],
  },
  [svid("SV_WATER_SECURITY")]: {
    id: svid("SV_WATER_SECURITY"),
    name: "Water Security",
    humanTranslation: "Reliable access to clean fresh water.",
    benefitsRecipients: [rid("RC_WATERSHEDS"), rid("RC_HUMANS"), rid("RC_FRESHWATER_SYSTEMS")],
  },
  [svid("SV_OCEAN_PRODUCTIVITY")]: {
    id: svid("SV_OCEAN_PRODUCTIVITY"),
    name: "Ocean Productivity",
    humanTranslation:
      "The ocean's capacity to grow the plankton and prey that feed marine life.",
    benefitsRecipients: [rid("RC_FISHERIES"), rid("RC_BIODIVERSITY")],
  },
  [svid("SV_LANDSCAPE_STRUCTURE")]: {
    id: svid("SV_LANDSCAPE_STRUCTURE"),
    name: "Landscape Structure",
    humanTranslation:
      "The physical shape of a habitat — clearings, paths and mix of trees and grass — that other species rely on.",
    benefitsRecipients: [rid("RC_BIODIVERSITY"), rid("RC_WILD_PLANTS")],
  },
};

// --- FUNCTIONS (ecological roles; Species → Function) -----------------------

export const FUNCTIONS: Record<FunctionId, FunctionNode> = {
  [fid("FN_PREDATION")]: {
    id: fid("FN_PREDATION"),
    name: "Predation",
    humanTranslation:
      "Hunting other animals — which keeps prey numbers in balance.",
    supportsServices: [
      svid("SV_ECOSYSTEM_STABILITY"),
      svid("SV_BIODIVERSITY_MAINTENANCE"),
    ],
  },
  [fid("FN_SEED_DISPERSAL")]: {
    id: fid("FN_SEED_DISPERSAL"),
    name: "Seed Dispersal",
    humanTranslation: "Moving plant seeds away from the parent plant.",
    supportsServices: [svid("SV_FOREST_REGENERATION")],
  },
  [fid("FN_HABITAT_ENGINEERING")]: {
    id: fid("FN_HABITAT_ENGINEERING"),
    name: "Habitat Engineering",
    humanTranslation:
      "Physically reshaping the environment in ways other species depend on.",
    supportsServices: [
      svid("SV_ECOSYSTEM_STABILITY"),
      svid("SV_LANDSCAPE_STRUCTURE"),
    ],
  },
  [fid("FN_NUTRIENT_CYCLING")]: {
    id: fid("FN_NUTRIENT_CYCLING"),
    name: "Nutrient Cycling",
    humanTranslation:
      "Moving nutrients through an ecosystem so life can reuse them.",
    supportsServices: [
      svid("SV_OCEAN_PRODUCTIVITY"),
      svid("SV_ECOSYSTEM_STABILITY"),
    ],
  },
  [fid("FN_POLLINATION")]: {
    id: fid("FN_POLLINATION"),
    name: "Pollination",
    humanTranslation:
      "Carrying pollen between flowers so plants can produce seeds and fruit.",
    supportsServices: [svid("SV_FOOD_PRODUCTION"), svid("SV_FOREST_REGENERATION")],
  },
  [fid("FN_WATER_ENGINEERING")]: {
    id: fid("FN_WATER_ENGINEERING"),
    name: "Water Engineering",
    humanTranslation:
      "Digging or opening water sources that other animals come to depend on.",
    supportsServices: [svid("SV_WATER_SECURITY")],
  },
  [fid("FN_HERBIVORY")]: {
    id: fid("FN_HERBIVORY"),
    name: "Herbivory",
    humanTranslation:
      "Heavy grazing and browsing that keeps grasslands open and shapes which plants grow.",
    supportsServices: [
      svid("SV_ECOSYSTEM_STABILITY"),
      svid("SV_BIODIVERSITY_MAINTENANCE"),
    ],
  },
};

// --- DRIVERS (underlying forces behind threats) -----------------------------

export const DRIVERS: Record<DriverId, DriverNode> = {
  [did("DR_LAND_CLEARING")]: {
    id: did("DR_LAND_CLEARING"),
    name: "Land Clearing for Commodities",
    humanTranslation: "Clearing forest for cattle, soy and other commodities.",
  },
  [did("DR_MINING")]: {
    id: did("DR_MINING"),
    name: "Mining",
    humanTranslation: "Extracting minerals, including illegal gold mining.",
  },
  [did("DR_COMMODITY_DEMAND")]: {
    id: did("DR_COMMODITY_DEMAND"),
    name: "Global Commodity Demand",
    humanTranslation: "Demand for goods whose supply chains drive forest loss.",
  },
  [did("DR_GLOBAL_WARMING")]: {
    id: did("DR_GLOBAL_WARMING"),
    name: "Global Warming",
    humanTranslation: "The long-term heating of Earth from greenhouse gases.",
  },
  [did("DR_AGRICULTURE")]: {
    id: did("DR_AGRICULTURE"),
    name: "Agricultural Expansion",
    humanTranslation: "Clearing land to grow crops or raise livestock.",
  },
  [did("DR_INFRASTRUCTURE")]: {
    id: did("DR_INFRASTRUCTURE"),
    name: "Infrastructure & Roads",
    humanTranslation: "Roads, dams and development that cut through habitat.",
  },
  [did("DR_HUNTING")]: {
    id: did("DR_HUNTING"),
    name: "Overhunting",
    humanTranslation: "Hunting animals faster than populations can recover.",
  },
  [did("DR_WILDLIFE_TRADE")]: {
    id: did("DR_WILDLIFE_TRADE"),
    name: "Illegal Wildlife Trade",
    humanTranslation: "Buying and selling protected animals or their parts.",
  },
  [did("DR_HUMAN_SETTLEMENT")]: {
    id: did("DR_HUMAN_SETTLEMENT"),
    name: "Human Settlement",
    humanTranslation:
      "People, farms and livestock expanding into areas wildlife use.",
  },
  [did("DR_OVERFISHING")]: {
    id: did("DR_OVERFISHING"),
    name: "Overfishing",
    humanTranslation: "Catching fish faster than populations can replace themselves.",
  },
  [did("DR_SHIPPING")]: {
    id: did("DR_SHIPPING"),
    name: "Shipping & Vessel Traffic",
    humanTranslation: "Boats and ships crossing the ocean, adding noise and risk.",
  },
  [did("DR_INDUSTRIAL_CHEMICALS")]: {
    id: did("DR_INDUSTRIAL_CHEMICALS"),
    name: "Industrial Chemicals",
    humanTranslation:
      "Pollutants from industry that build up in the bodies of marine animals.",
  },
  [did("DR_FISHERIES")]: {
    id: did("DR_FISHERIES"),
    name: "Commercial Fisheries",
    humanTranslation: "Large-scale fishing operations and their gear.",
  },
  [did("DR_CAPTIVITY_INDUSTRY")]: {
    id: did("DR_CAPTIVITY_INDUSTRY"),
    name: "Captivity Industry",
    humanTranslation: "Capturing wild animals for display in captivity.",
  },
  [did("DR_IVORY_MARKET")]: {
    id: did("DR_IVORY_MARKET"),
    name: "Ivory Market",
    humanTranslation: "Demand for ivory that drives the killing of elephants.",
  },
  [did("DR_WATER_STRESS")]: {
    id: did("DR_WATER_STRESS"),
    name: "Water Stress",
    humanTranslation:
      "Less reliable water from a warming climate and human water use.",
  },
  [did("DR_PESTICIDE_USE")]: {
    id: did("DR_PESTICIDE_USE"),
    name: "Pesticide Use",
    humanTranslation:
      "Chemicals applied to crops that can harm pollinators and other insects.",
  },
  [did("DR_INTENSIVE_AGRICULTURE")]: {
    id: did("DR_INTENSIVE_AGRICULTURE"),
    name: "Intensive Agriculture",
    humanTranslation:
      "Large single-crop farming that removes the varied flowers pollinators need.",
  },
  [did("DR_INTRODUCED_PESTS")]: {
    id: did("DR_INTRODUCED_PESTS"),
    name: "Introduced Pests & Pathogens",
    humanTranslation:
      "Parasites and diseases spread beyond their native range, such as the Varroa mite.",
  },
};

// --- THREATS (Threat → Category → Driver) -----------------------------------

export const THREATS: Record<ThreatId, ThreatNode> = {
  [tid("TH_DEFORESTATION")]: {
    id: tid("TH_DEFORESTATION"),
    name: "Deforestation",
    humanTranslation: "Permanent clearing of forest, mostly for agriculture.",
    category: "Habitat",
    driver: did("DR_LAND_CLEARING"),
  },
  [tid("TH_FOREST_DEGRADATION")]: {
    id: tid("TH_FOREST_DEGRADATION"),
    name: "Forest Degradation",
    humanTranslation: "Forest left standing but thinned and damaged.",
    category: "Habitat",
    driver: did("DR_LAND_CLEARING"),
  },
  [tid("TH_FIRE")]: {
    id: tid("TH_FIRE"),
    name: "Fire",
    humanTranslation: "Fires, often set for clearing, that escape and spread.",
    category: "Habitat",
    driver: did("DR_LAND_CLEARING"),
  },
  [tid("TH_ILLEGAL_MINING")]: {
    id: tid("TH_ILLEGAL_MINING"),
    name: "Illegal Mining",
    humanTranslation: "Unregulated mining that pollutes rivers and clears land.",
    category: "Pollution",
    driver: did("DR_MINING"),
  },
  [tid("TH_LAND_USE_CHANGE")]: {
    id: tid("TH_LAND_USE_CHANGE"),
    name: "Land-use Change",
    humanTranslation: "Conversion of forest to farmland, pasture or roads.",
    category: "Habitat",
    driver: did("DR_LAND_CLEARING"),
  },
  [tid("TH_SUPPLY_CHAIN_PRESSURE")]: {
    id: tid("TH_SUPPLY_CHAIN_PRESSURE"),
    name: "Supply Chain Pressure",
    humanTranslation: "Commodity demand that pushes deforestation upstream.",
    category: "Exploitation",
    driver: did("DR_COMMODITY_DEMAND"),
  },
  [tid("TH_HABITAT_LOSS")]: {
    id: tid("TH_HABITAT_LOSS"),
    name: "Habitat Loss",
    humanTranslation: "The places a species needs to live are being destroyed.",
    category: "Habitat",
    driver: did("DR_AGRICULTURE"),
  },
  [tid("TH_HABITAT_FRAGMENTATION")]: {
    id: tid("TH_HABITAT_FRAGMENTATION"),
    name: "Habitat Fragmentation",
    humanTranslation:
      "Habitat broken into isolated pieces animals can't move between.",
    category: "Habitat",
    driver: did("DR_INFRASTRUCTURE"),
  },
  [tid("TH_HUMAN_WILDLIFE_CONFLICT")]: {
    id: tid("TH_HUMAN_WILDLIFE_CONFLICT"),
    name: "Human–Wildlife Conflict",
    humanTranslation:
      "Animals killed in retaliation after coming into contact with people, crops or livestock.",
    category: "Exploitation",
    driver: did("DR_HUMAN_SETTLEMENT"),
  },
  [tid("TH_ILLEGAL_HUNTING")]: {
    id: tid("TH_ILLEGAL_HUNTING"),
    name: "Illegal Hunting",
    humanTranslation: "Unlawful killing of a protected species.",
    category: "Exploitation",
    driver: did("DR_WILDLIFE_TRADE"),
  },
  [tid("TH_PREY_LOSS")]: {
    id: tid("TH_PREY_LOSS"),
    name: "Loss of Wild Prey",
    humanTranslation:
      "The animals a predator depends on for food are declining.",
    category: "Exploitation",
    driver: did("DR_HUNTING"),
  },
  [tid("TH_WILDLIFE_TRADE")]: {
    id: tid("TH_WILDLIFE_TRADE"),
    name: "Illegal Wildlife Trade",
    humanTranslation:
      "Trafficking of animals or their body parts for sale.",
    category: "Exploitation",
    driver: did("DR_WILDLIFE_TRADE"),
  },
  [tid("TH_CLIMATE_CHANGE")]: {
    id: tid("TH_CLIMATE_CHANGE"),
    name: "Climate Change",
    humanTranslation:
      "Shifting temperatures and weather altering where species can survive.",
    category: "Climate",
    driver: did("DR_GLOBAL_WARMING"),
  },
  // --- Marine (Orca) ---
  [tid("TH_PREY_DEPLETION")]: {
    id: tid("TH_PREY_DEPLETION"),
    name: "Prey Depletion",
    humanTranslation: "The fish and marine mammals a predator eats are declining.",
    category: "Exploitation",
    driver: did("DR_OVERFISHING"),
  },
  [tid("TH_CHEMICAL_POLLUTION")]: {
    id: tid("TH_CHEMICAL_POLLUTION"),
    name: "Chemical Pollution",
    humanTranslation:
      "Toxic chemicals building up in animals' bodies, especially top predators.",
    category: "Pollution",
    driver: did("DR_INDUSTRIAL_CHEMICALS"),
  },
  [tid("TH_NOISE_POLLUTION")]: {
    id: tid("TH_NOISE_POLLUTION"),
    name: "Noise Pollution",
    humanTranslation:
      "Underwater noise that interferes with how marine animals communicate and hunt.",
    category: "Pollution",
    driver: did("DR_SHIPPING"),
  },
  [tid("TH_VESSEL_DISTURBANCE")]: {
    id: tid("TH_VESSEL_DISTURBANCE"),
    name: "Vessel Disturbance",
    humanTranslation: "Boats disrupting feeding, resting and movement.",
    category: "Disturbance",
    driver: did("DR_SHIPPING"),
  },
  [tid("TH_BYCATCH")]: {
    id: tid("TH_BYCATCH"),
    name: "Bycatch",
    humanTranslation: "Animals accidentally caught and killed in fishing gear.",
    category: "Exploitation",
    driver: did("DR_FISHERIES"),
  },
  [tid("TH_CAPTIVITY_TRADE")]: {
    id: tid("TH_CAPTIVITY_TRADE"),
    name: "Captivity Trade",
    humanTranslation: "Live capture of wild animals for display.",
    category: "Exploitation",
    driver: did("DR_CAPTIVITY_INDUSTRY"),
  },
  // --- Savanna (Elephant) ---
  [tid("TH_POACHING")]: {
    id: tid("TH_POACHING"),
    name: "Poaching",
    humanTranslation: "Illegal killing of a protected species, here mainly for ivory.",
    category: "Exploitation",
    driver: did("DR_IVORY_MARKET"),
  },
  [tid("TH_IVORY_TRADE")]: {
    id: tid("TH_IVORY_TRADE"),
    name: "Ivory Trade",
    humanTranslation: "Trafficking of elephant tusks for sale.",
    category: "Exploitation",
    driver: did("DR_IVORY_MARKET"),
  },
  [tid("TH_CLIMATE_DROUGHT")]: {
    id: tid("TH_CLIMATE_DROUGHT"),
    name: "Drought",
    humanTranslation: "Longer, harsher dry periods reducing food and water.",
    category: "Climate",
    driver: did("DR_WATER_STRESS"),
  },
  [tid("TH_BLOCKED_MIGRATION")]: {
    id: tid("TH_BLOCKED_MIGRATION"),
    name: "Blocked Migration",
    humanTranslation:
      "Fences, roads and farmland cutting off the routes animals need to travel.",
    category: "Habitat",
    driver: did("DR_INFRASTRUCTURE"),
  },
  [tid("TH_SEA_ICE_LOSS")]: {
    id: tid("TH_SEA_ICE_LOSS"),
    name: "Sea Ice Loss",
    humanTranslation:
      "Shrinking Arctic sea ice removing the platform some species need to hunt and travel.",
    category: "Climate",
    driver: did("DR_GLOBAL_WARMING"),
  },
  // --- Pollinator (Honey Bee) ---
  [tid("TH_PESTICIDES")]: {
    id: tid("TH_PESTICIDES"),
    name: "Pesticides",
    humanTranslation:
      "Farm chemicals that can weaken or kill pollinators, even at low doses.",
    category: "Pollution",
    driver: did("DR_PESTICIDE_USE"),
  },
  [tid("TH_FORAGE_LOSS")]: {
    id: tid("TH_FORAGE_LOSS"),
    name: "Forage Loss",
    humanTranslation:
      "Loss of the varied wild flowers pollinators need to feed across the season.",
    category: "Habitat",
    driver: did("DR_INTENSIVE_AGRICULTURE"),
  },
  [tid("TH_PARASITES_DISEASE")]: {
    id: tid("TH_PARASITES_DISEASE"),
    name: "Parasites & Disease",
    humanTranslation:
      "Parasites and pathogens, especially the Varroa mite, that weaken bee colonies.",
    category: "Disease",
    driver: did("DR_INTRODUCED_PESTS"),
  },
};

// --- SOLUTIONS (Solution → Threat) ------------------------------------------

export const SOLUTIONS: Record<SolutionId, SolutionNode> = {
  [solid("SO_PROTECTED_AREAS")]: {
    id: solid("SO_PROTECTED_AREAS"),
    name: "Protected Areas",
    humanTranslation: "Legally protecting forest from conversion.",
    addressesThreats: [tid("TH_DEFORESTATION"), tid("TH_LAND_USE_CHANGE")],
    evidenceLevel: "High",
    scalability: "Regional",
    timeHorizon: "Long-term",
    implementationDifficulty: "Moderate",
  },
  [solid("SO_FOREST_RESTORATION")]: {
    id: solid("SO_FOREST_RESTORATION"),
    name: "Forest Restoration",
    humanTranslation: "Helping degraded forest grow back.",
    addressesThreats: [tid("TH_FOREST_DEGRADATION"), tid("TH_DEFORESTATION")],
    evidenceLevel: "Medium",
    scalability: "Regional",
    timeHorizon: "Long-term",
    implementationDifficulty: "High",
  },
  [solid("SO_SUPPLY_CHAIN_REFORM")]: {
    id: solid("SO_SUPPLY_CHAIN_REFORM"),
    name: "Supply Chain Reform",
    humanTranslation: "Removing deforestation from commodity supply chains.",
    addressesThreats: [tid("TH_SUPPLY_CHAIN_PRESSURE"), tid("TH_DEFORESTATION")],
    evidenceLevel: "Medium",
    scalability: "Global",
    timeHorizon: "Short-term",
    implementationDifficulty: "High",
  },
  [solid("SO_LEGAL_PROTECTION")]: {
    id: solid("SO_LEGAL_PROTECTION"),
    name: "Legal Protection",
    humanTranslation: "Enforcing laws against illegal clearing and mining.",
    addressesThreats: [tid("TH_ILLEGAL_MINING"), tid("TH_LAND_USE_CHANGE")],
    evidenceLevel: "Medium",
    scalability: "Regional",
    timeHorizon: "Short-term",
    implementationDifficulty: "High",
  },
  [solid("SO_MONITORING_SYSTEMS")]: {
    id: solid("SO_MONITORING_SYSTEMS"),
    name: "Monitoring Systems",
    humanTranslation: "Satellite and field monitoring to detect forest loss.",
    addressesThreats: [tid("TH_DEFORESTATION"), tid("TH_FIRE"), tid("TH_ILLEGAL_MINING")],
    evidenceLevel: "High",
    scalability: "Global",
    timeHorizon: "Immediate",
    implementationDifficulty: "Moderate",
  },
  [solid("SO_HABITAT_PROTECTION")]: {
    id: solid("SO_HABITAT_PROTECTION"),
    name: "Habitat Protection",
    humanTranslation: "Legally safeguarding the land a species needs.",
    addressesThreats: [tid("TH_HABITAT_LOSS")],
  },
  [solid("SO_WILDLIFE_CORRIDORS")]: {
    id: solid("SO_WILDLIFE_CORRIDORS"),
    name: "Wildlife Corridors",
    humanTranslation:
      "Connected strips of habitat that let animals move safely between areas.",
    addressesThreats: [tid("TH_HABITAT_FRAGMENTATION"), tid("TH_BLOCKED_MIGRATION")],
  },
  [solid("SO_INDIGENOUS_STEWARDSHIP")]: {
    id: solid("SO_INDIGENOUS_STEWARDSHIP"),
    name: "Indigenous Stewardship",
    humanTranslation:
      "Indigenous peoples managing and protecting their own territories.",
    addressesThreats: [tid("TH_HABITAT_LOSS"), tid("TH_ILLEGAL_HUNTING")],
  },
  [solid("SO_CONFLICT_REDUCTION")]: {
    id: solid("SO_CONFLICT_REDUCTION"),
    name: "Livestock Conflict Reduction",
    humanTranslation:
      "Helping farmers protect livestock so wildlife isn't killed in return.",
    addressesThreats: [tid("TH_HUMAN_WILDLIFE_CONFLICT")],
  },
  [solid("SO_ANTI_POACHING")]: {
    id: solid("SO_ANTI_POACHING"),
    name: "Anti-Poaching Enforcement",
    humanTranslation: "Patrols and laws that stop illegal killing.",
    addressesThreats: [
      tid("TH_ILLEGAL_HUNTING"),
      tid("TH_WILDLIFE_TRADE"),
      tid("TH_POACHING"),
      tid("TH_IVORY_TRADE"),
    ],
  },
  [solid("SO_SCIENTIFIC_MONITORING")]: {
    id: solid("SO_SCIENTIFIC_MONITORING"),
    name: "Scientific Monitoring",
    humanTranslation:
      "Tracking populations so decisions are based on real data.",
    addressesThreats: [tid("TH_PREY_LOSS")],
  },
  [solid("SO_PROTECTED_AREA_MGMT")]: {
    id: solid("SO_PROTECTED_AREA_MGMT"),
    name: "Protected Area Management",
    humanTranslation: "Actively running parks and reserves so they work.",
    addressesThreats: [tid("TH_HABITAT_LOSS"), tid("TH_PREY_LOSS")],
  },
  // --- Marine (Orca) ---
  [solid("SO_PREY_RECOVERY")]: {
    id: solid("SO_PREY_RECOVERY"),
    name: "Prey Recovery",
    humanTranslation: "Rebuilding the fish and prey populations predators rely on.",
    addressesThreats: [tid("TH_PREY_DEPLETION")],
  },
  [solid("SO_MARINE_PROTECTED_AREAS")]: {
    id: solid("SO_MARINE_PROTECTED_AREAS"),
    name: "Marine Protected Areas",
    humanTranslation: "Ocean zones where harmful activity is limited or banned.",
    addressesThreats: [
      tid("TH_PREY_DEPLETION"),
      tid("TH_VESSEL_DISTURBANCE"),
      tid("TH_BYCATCH"),
    ],
  },
  [solid("SO_VESSEL_REGULATION")]: {
    id: solid("SO_VESSEL_REGULATION"),
    name: "Vessel Regulation",
    humanTranslation: "Rules on where and how fast boats can travel.",
    addressesThreats: [tid("TH_VESSEL_DISTURBANCE"), tid("TH_NOISE_POLLUTION")],
  },
  [solid("SO_NOISE_REDUCTION")]: {
    id: solid("SO_NOISE_REDUCTION"),
    name: "Underwater Noise Reduction",
    humanTranslation: "Quieter ship technology and traffic management.",
    addressesThreats: [tid("TH_NOISE_POLLUTION")],
  },
  [solid("SO_POLLUTION_CONTROL")]: {
    id: solid("SO_POLLUTION_CONTROL"),
    name: "Pollution Control",
    humanTranslation: "Phasing out and cleaning up harmful chemicals.",
    addressesThreats: [tid("TH_CHEMICAL_POLLUTION")],
  },
  [solid("SO_FISHERIES_REFORM")]: {
    id: solid("SO_FISHERIES_REFORM"),
    name: "Fisheries Reform",
    humanTranslation: "Managing fishing to cut bycatch and protect prey.",
    addressesThreats: [tid("TH_BYCATCH"), tid("TH_PREY_DEPLETION")],
  },
  [solid("SO_POPULATION_MONITORING")]: {
    id: solid("SO_POPULATION_MONITORING"),
    name: "Population Monitoring",
    humanTranslation:
      "Tracking populations so gaps in data can be closed and trends caught early.",
    addressesThreats: [],
  },
  [solid("SO_CAPTIVITY_PHASE_OUT")]: {
    id: solid("SO_CAPTIVITY_PHASE_OUT"),
    name: "Captivity Phase-Out",
    humanTranslation: "Ending the capture and display of wild animals.",
    addressesThreats: [tid("TH_CAPTIVITY_TRADE")],
  },
  // --- Savanna (Elephant) ---
  [solid("SO_COMMUNITY_CONSERVATION")]: {
    id: solid("SO_COMMUNITY_CONSERVATION"),
    name: "Community Conservation",
    humanTranslation:
      "Local communities benefiting from and helping protect nearby wildlife.",
    addressesThreats: [tid("TH_HUMAN_WILDLIFE_CONFLICT"), tid("TH_POACHING")],
  },
  [solid("SO_LANDSCAPE_PLANNING")]: {
    id: solid("SO_LANDSCAPE_PLANNING"),
    name: "Landscape Planning",
    humanTranslation:
      "Planning land use so wildlife keeps the space and routes it needs.",
    addressesThreats: [
      tid("TH_BLOCKED_MIGRATION"),
      tid("TH_HABITAT_FRAGMENTATION"),
    ],
  },
  [solid("SO_WATER_ACCESS_PROTECTION")]: {
    id: solid("SO_WATER_ACCESS_PROTECTION"),
    name: "Water Access Protection",
    humanTranslation:
      "Safeguarding the water sources wildlife depends on in dry seasons.",
    addressesThreats: [tid("TH_CLIMATE_DROUGHT")],
  },
  [solid("SO_CLIMATE_ACTION")]: {
    id: solid("SO_CLIMATE_ACTION"),
    name: "Climate Action",
    humanTranslation:
      "Cutting greenhouse-gas emissions — the only thing that addresses the root of sea-ice loss and climate pressures.",
    addressesThreats: [
      tid("TH_SEA_ICE_LOSS"),
      tid("TH_CLIMATE_CHANGE"),
      tid("TH_CLIMATE_DROUGHT"),
    ],
  },
  // --- Pollinator (Honey Bee) ---
  [solid("SO_PESTICIDE_REDUCTION")]: {
    id: solid("SO_PESTICIDE_REDUCTION"),
    name: "Pesticide Reduction",
    humanTranslation: "Cutting and better-targeting farm chemicals that harm pollinators.",
    addressesThreats: [tid("TH_PESTICIDES")],
  },
  [solid("SO_POLLINATOR_HABITAT")]: {
    id: solid("SO_POLLINATOR_HABITAT"),
    name: "Pollinator Habitat",
    humanTranslation: "Restoring wildflowers, hedgerows and margins for pollinators to feed.",
    addressesThreats: [tid("TH_FORAGE_LOSS")],
  },
  [solid("SO_DIVERSE_FARMING")]: {
    id: solid("SO_DIVERSE_FARMING"),
    name: "Diverse Farming",
    humanTranslation: "Mixed crops and flowering plants instead of single-crop fields.",
    addressesThreats: [tid("TH_FORAGE_LOSS")],
  },
  [solid("SO_BEE_HEALTH")]: {
    id: solid("SO_BEE_HEALTH"),
    name: "Bee Health Management",
    humanTranslation: "Managing parasites and disease to keep colonies healthy.",
    addressesThreats: [tid("TH_PARASITES_DISEASE")],
  },
};

// --- ECOSYSTEMS (placeholder node type in this beta) ------------------------

export const ECOSYSTEMS: Record<EcosystemId, EcosystemNode> = {
  [eid("EC_AMAZON_RAINFOREST")]: {
    id: eid("EC_AMAZON_RAINFOREST"),
    name: "Amazon Rainforest",
    humanTranslation: "The vast tropical forest of the Amazon Basin.",
    flagship: true,
    shortDefinition:
      "A vast tropical forest system across South America that supports biodiversity, water cycling, rainfall regulation, carbon storage and regional climate stability.",
    systemRole:
      "A major living system supporting biodiversity, rainfall regulation, carbon storage, water cycling, Indigenous livelihoods, regional agriculture and climate stability.",
    providesServices: [
      svid("SV_RAINFALL_REGULATION"),
      svid("SV_CARBON_STORAGE"),
      svid("SV_BIODIVERSITY_HABITAT"),
      svid("SV_WATER_CYCLING"),
      svid("SV_CLIMATE_REGULATION"),
    ],
    threats: [
      tid("TH_DEFORESTATION"),
      tid("TH_FOREST_DEGRADATION"),
      tid("TH_FIRE"),
      tid("TH_ILLEGAL_MINING"),
      tid("TH_LAND_USE_CHANGE"),
      tid("TH_SUPPLY_CHAIN_PRESSURE"),
      tid("TH_CLIMATE_CHANGE"),
    ],
    solutions: [
      solid("SO_INDIGENOUS_STEWARDSHIP"),
      solid("SO_PROTECTED_AREAS"),
      solid("SO_FOREST_RESTORATION"),
      solid("SO_SUPPLY_CHAIN_REFORM"),
      solid("SO_LEGAL_PROTECTION"),
      solid("SO_MONITORING_SYSTEMS"),
    ],
  },
  [eid("EC_PANTANAL_WETLANDS")]: {
    id: eid("EC_PANTANAL_WETLANDS"),
    name: "Pantanal Wetlands",
    humanTranslation: "The world's largest tropical wetland, in South America.",
  },
  [eid("EC_CERRADO_SAVANNA")]: {
    id: eid("EC_CERRADO_SAVANNA"),
    name: "Cerrado Savanna",
    humanTranslation: "A vast tropical savanna region of Brazil.",
  },
  [eid("EC_TROPICAL_DRY_FOREST")]: {
    id: eid("EC_TROPICAL_DRY_FOREST"),
    name: "Tropical Dry Forest",
    humanTranslation:
      "Forests with a long dry season, found across the Americas.",
  },
  // --- Marine ---
  [eid("EC_GLOBAL_OCEANS")]: {
    id: eid("EC_GLOBAL_OCEANS"),
    name: "Global Oceans",
    humanTranslation: "The connected body of seawater covering most of the planet.",
  },
  [eid("EC_POLAR_MARINE")]: {
    id: eid("EC_POLAR_MARINE"),
    name: "Polar Marine",
    humanTranslation: "The cold, often ice-edge seas around the poles.",
  },
  [eid("EC_COASTAL_MARINE")]: {
    id: eid("EC_COASTAL_MARINE"),
    name: "Coastal Marine",
    humanTranslation: "Productive shallow seas close to shore.",
  },
  [eid("EC_CONTINENTAL_SHELF")]: {
    id: eid("EC_CONTINENTAL_SHELF"),
    name: "Continental Shelf",
    humanTranslation: "The gently sloping seabed bordering the continents.",
  },
  [eid("EC_FJORDS")]: {
    id: eid("EC_FJORDS"),
    name: "Fjords",
    humanTranslation: "Deep coastal inlets carved by glaciers, rich in marine life.",
  },
  // --- Savanna / Terrestrial ---
  [eid("EC_AFRICAN_SAVANNA")]: {
    id: eid("EC_AFRICAN_SAVANNA"),
    name: "African Savanna",
    humanTranslation: "Open grassland with scattered trees across much of Africa.",
  },
  [eid("EC_GRASSLANDS")]: {
    id: eid("EC_GRASSLANDS"),
    name: "Grasslands",
    humanTranslation: "Open land dominated by grasses.",
  },
  [eid("EC_WOODLANDS")]: {
    id: eid("EC_WOODLANDS"),
    name: "Woodlands",
    humanTranslation: "Land with a loose, open cover of trees.",
  },
  [eid("EC_WETLANDS")]: {
    id: eid("EC_WETLANDS"),
    name: "Wetlands",
    humanTranslation: "Areas where water covers or saturates the land.",
  },
  [eid("EC_MIGRATION_CORRIDORS")]: {
    id: eid("EC_MIGRATION_CORRIDORS"),
    name: "Migration Corridors",
    humanTranslation: "The routes animals travel between seasonal ranges.",
  },
  [eid("EC_ARCTIC_SEA_ICE")]: {
    id: eid("EC_ARCTIC_SEA_ICE"),
    name: "Arctic Sea Ice",
    humanTranslation:
      "Frozen sea surface that acts as a hunting and travelling platform for Arctic life.",
  },
  [eid("EC_FARMLAND")]: {
    id: eid("EC_FARMLAND"),
    name: "Farmland",
    humanTranslation:
      "Cultivated agricultural land — where much pollination and food production happens.",
  },
};

// --- MISSIONS (bridge to 4PLANET OS) ----------------------------------------

export const MISSIONS: Record<MissionId, MissionNode> = {
  [mid("MS_CLIMATE")]: {
    id: mid("MS_CLIMATE"),
    code: "CLIM4TE",
    name: "Climate",
    humanTranslation: "4PLANET's program on climate change and its drivers.",
  },
  [mid("MS_AMAZONIA")]: {
    id: mid("MS_AMAZONIA"),
    code: "AM4ZONIA",
    name: "Amazonia",
    humanTranslation: "4PLANET's program focused on the Amazon Basin.",
  },
  [mid("MS_SPECIES")]: {
    id: mid("MS_SPECIES"),
    code: "SPECIES",
    name: "Species",
    humanTranslation: "4PLANET's program focused on threatened species.",
  },
  [mid("MS_REWILD")]: {
    id: mid("MS_REWILD"),
    code: "REWILD",
    name: "Rewild",
    humanTranslation: "4PLANET's program for restoring wild ecosystems.",
  },
  [mid("MS_PLASTIC")]: {
    id: mid("MS_PLASTIC"),
    code: "PL4STIC",
    name: "Plastic",
    humanTranslation: "4PLANET's program on plastic pollution.",
  },
  [mid("MS_WHALES")]: {
    id: mid("MS_WHALES"),
    code: "WH4LES",
    name: "Whales",
    humanTranslation: "4PLANET's program focused on whales and dolphins.",
  },
  [mid("MS_CORAL")]: {
    id: mid("MS_CORAL"),
    code: "COR4L",
    name: "Coral",
    humanTranslation: "4PLANET's program on coral reefs.",
  },
  [mid("MS_ANTARCTICA")]: {
    id: mid("MS_ANTARCTICA"),
    code: "4NTARCTICA",
    name: "Antarctica",
    humanTranslation: "4PLANET's program focused on polar regions.",
  },
  [mid("MS_FOOD")]: {
    id: mid("MS_FOOD"),
    code: "FOOD",
    name: "Food",
    humanTranslation: "4PLANET's program on food systems and agriculture.",
  },
  [mid("MS_ENERGY")]: {
    id: mid("MS_ENERGY"),
    code: "EN4RGY",
    name: "Energy",
    humanTranslation: "4PLANET's program on energy and emissions.",
  },
  [mid("MS_CIRCULAR_CITY")]: {
    id: mid("MS_CIRCULAR_CITY"),
    code: "CIRCULAR_CITY",
    name: "Circular City",
    humanTranslation: "4PLANET's program on circular, regenerative cities.",
  },
  [mid("MS_FASHION")]: {
    id: mid("MS_FASHION"),
    code: "F4SHION",
    name: "Fashion",
    humanTranslation: "4PLANET's program on sustainable fashion.",
  },
  [mid("MS_MAGAZINE")]: {
    id: mid("MS_MAGAZINE"),
    code: "M4GAZINE",
    name: "Magazine",
    humanTranslation: "4PLANET's editorial and storytelling program.",
  },
  [mid("MS_FILM")]: {
    id: mid("MS_FILM"),
    code: "4FILM",
    name: "Film",
    humanTranslation: "4PLANET's film and documentary program.",
  },
  [mid("MS_ATELIER")]: {
    id: mid("MS_ATELIER"),
    code: "4TELIER",
    name: "Atelier",
    humanTranslation: "4PLANET's design and creative studio program.",
  },
  [mid("MS_PLAY")]: {
    id: mid("MS_PLAY"),
    code: "4PLAY",
    name: "Play",
    humanTranslation: "4PLANET's program on culture, events and play.",
  },
};
