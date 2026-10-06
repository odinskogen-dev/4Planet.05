// ============================================================================
// SPECIES DATA
// Species reference shared nodes by ID. No ecological function, service,
// recipient, threat or driver is written as free text here — only contextual
// fields (severity, explanation, dependency) live on the species.
//
// Language is deliberately cautious: "supports / contributes to / associated
// with / linked to". No absolute causal claims. Figures are stated as reported,
// with source keys, never invented citations.
// ============================================================================

import type { SpeciesProfile } from "@/types";
import { sid, fid, tid, solid, eid, mid } from "@/types";

export const jaguar: SpeciesProfile = {
  id: sid("SP_JAGUAR"),
  referenceCode: "REFERENCE_001",
  slug: "jaguar",
  status: "active",

  commonName: "Jaguar",
  alternativeNames: ["Onça-pintada", "El Tigre"],
  scientificName: "Panthera onca",
  roleLabel: "Apex predator",
  whyItMatters:
    "By regulating prey populations, the jaguar is linked to ecosystem stability — which supports the resilience of the forests it lives in.",
  signals: {
    urgency: "High",
    leverage: "High",
    confidence: "High",
    scale: "High",
    reversibility: "Partly reversible",
    knowledgeQuality: "High",
    decisionRelevance: "High",
  },
  knowledge: {
    status: "Well Established",
    evidenceQuality: "High",
    lastReviewDate: "2025-11-01",
    known: "Role as apex predator and its link to prey regulation is well documented.",
    unknown: "Precise thresholds at which range loss destabilises forest dynamics.",
    researchGaps: ["Corridor connectivity outcomes", "Long-term population viability"],
  },
  summary:
    "The largest cat in the Americas and the top predator across much of its range. As an apex predator, the jaguar is associated with keeping prey populations in balance, which in turn is linked to the stability of the ecosystems it lives in — from the Amazon to the Pantanal.",

  identity: {
    className: "Mammalia",
    order: "Carnivora",
    family: "Felidae",
    genus: "Panthera",
    species: "onca",
    humanTranslation:
      "A big cat in the same genus as lions, tigers and leopards. It is the only Panthera species native to the Americas.",
  },

  conservation: {
    iucnStatus: "Near Threatened",
    populationTrend: "Decreasing",
    estimatedWildPopulation: "~173,000 individuals (reported estimate)",
    mainConservationIssue:
      "Habitat loss and fragmentation, compounded by conflict with livestock ranching.",
    citesStatus: "CITES Appendix I",
    cmsStatus: undefined,
    humanTranslation:
      "Near Threatened means the jaguar is not endangered yet, but is close to qualifying and trending the wrong way. CITES Appendix I means international commercial trade is banned. The species has reportedly lost around half of its historic range.",
  },

  distribution: {
    nativeRange:
      "From the south-western United States historically, through Mexico and Central America, to northern Argentina.",
    currentRange:
      "Now concentrated in South America, with the Amazon Basin as its main stronghold; largely absent from the northern edges of its historic range.",
    ecosystems: [
      { ecosystem: eid("EC_AMAZON_RAINFOREST"), dependency: "Critical" },
      { ecosystem: eid("EC_PANTANAL_WETLANDS"), dependency: "High" },
      { ecosystem: eid("EC_CERRADO_SAVANNA"), dependency: "Moderate" },
      { ecosystem: eid("EC_TROPICAL_DRY_FOREST"), dependency: "Moderate" },
    ],
    humanTranslation:
      "Jaguars once ranged from the U.S. to Argentina. Today most live in South America, and the Amazon is the single most important region for the species.",
  },

  biology: {
    length: "1.1–1.85 m body length (excluding tail)",
    weight: "Typically 36–100 kg; large males can exceed 100 kg",
    lifespan: "~12–15 years in the wild",
    diet: "Carnivore — an unusually broad diet of 85+ prey species",
    keyFoodSources: ["Capybara", "Caiman", "Peccary", "Deer", "Fish & turtles"],
    reproduction:
      "Gestation ~93–105 days; usually 1–2 cubs (up to 4), raised by the mother.",
    behaviour: [
      "Solitary and territorial",
      "Strong swimmer — comfortable hunting in water",
      "Has the most powerful bite relative to size of any big cat",
      "Mostly active at dawn, dusk and night",
    ],
    humanTranslation:
      "Jaguars are powerful, solitary hunters that, unlike most big cats, readily swim and hunt aquatic prey such as caiman. Their bite is strong enough to pierce skulls and shells.",
  },

  ecologicalIntelligence: {
    ecologicalRole:
      "Apex predator and widely regarded as a keystone species across much of its range.",
    keystoneSpecies:
      "Yes — its influence on the ecosystem is considered larger than its numbers alone would suggest.",
    trophicLevel: "Tertiary consumer (top of the food chain)",
    humanTranslation:
      "Apex predator = a hunter at the very top of the food chain with no natural predators of its own. Keystone species = a species whose presence holds an ecosystem's structure together. By controlling prey numbers, jaguars are linked to healthier, more balanced ecosystems.",
  },

  // Graph-native core: the jaguar points at the shared Predation node.
  // The downstream chain (→ Ecosystem Stability / Biodiversity Maintenance →
  // Biodiversity / Forests / Wild Plants) is resolved through the registry.
  functions: [fid("FN_PREDATION")],

  threats: [
    {
      threat: tid("TH_HABITAT_LOSS"),
      severity: 5,
      explanation:
        "Deforestation for agriculture and pasture is the leading pressure, steadily shrinking available range.",
    },
    {
      threat: tid("TH_HABITAT_FRAGMENTATION"),
      severity: 4,
      explanation:
        "Roads and development split populations into isolated pockets, reducing gene flow.",
    },
    {
      threat: tid("TH_HUMAN_WILDLIFE_CONFLICT"),
      severity: 4,
      explanation:
        "Jaguars are often killed in retaliation after preying on livestock near ranches.",
    },
    {
      threat: tid("TH_PREY_LOSS"),
      severity: 3,
      explanation:
        "Overhunting of wild prey by people forces jaguars toward livestock and lowers survival.",
    },
    {
      threat: tid("TH_ILLEGAL_HUNTING"),
      severity: 3,
      explanation:
        "Direct illegal killing persists, including for body parts entering illicit trade.",
    },
    {
      threat: tid("TH_WILDLIFE_TRADE"),
      severity: 3,
      explanation:
        "Demand for jaguar parts has been linked to emerging trafficking routes.",
    },
    {
      threat: tid("TH_CLIMATE_CHANGE"),
      severity: 2,
      explanation:
        "Shifting rainfall and fire regimes are associated with longer-term changes to habitat suitability.",
    },
  ],

  solutions: [
    {
      solution: solid("SO_HABITAT_PROTECTION"),
      importance: 5,
      explanation:
        "Protecting large, intact blocks of forest is the single most important measure.",
    },
    {
      solution: solid("SO_WILDLIFE_CORRIDORS"),
      importance: 5,
      explanation:
        "Connecting protected areas lets jaguars move, breed and maintain genetic diversity.",
    },
    {
      solution: solid("SO_INDIGENOUS_STEWARDSHIP"),
      importance: 4,
      explanation:
        "Indigenous-managed territories overlap heavily with the most important jaguar habitat.",
    },
    {
      solution: solid("SO_CONFLICT_REDUCTION"),
      importance: 4,
      explanation:
        "Better livestock protection reduces the retaliatory killing that drives local losses.",
    },
    {
      solution: solid("SO_ANTI_POACHING"),
      importance: 3,
      explanation:
        "Enforcement against illegal killing and trafficking protects existing populations.",
    },
    {
      solution: solid("SO_PROTECTED_AREA_MGMT"),
      importance: 3,
      explanation:
        "Well-run reserves keep both jaguars and their prey base intact.",
    },
    {
      solution: solid("SO_SCIENTIFIC_MONITORING"),
      importance: 3,
      explanation:
        "Tracking populations is needed to direct limited conservation resources well.",
    },
  ],

  fourPlanetIntelligence: {
    ecologicalImportance: 5,
    extinctionRisk: 3,
    culturalImportance: 5,
    publicRecognition: 5,
    dataAvailability: 4,
    missionRelevance: 5,
  },

  connections: {
    species: [sid("SP_ORCA"), sid("SP_ELEPHANT"), sid("SP_POLAR_BEAR")],
    missions: [
      mid("MS_AMAZONIA"),
      mid("MS_SPECIES"),
      mid("MS_REWILD"),
    ],
  },

  highlights: [
    "Largest cat in the Americas; only Panthera native to the continent.",
    "Reportedly lost ~50% of its historic range.",
    "Amazon Basin is its single most important stronghold.",
    "Strongest bite-to-size ratio of any big cat.",
  ],

  sourceIds: ["IUCN_RED_LIST", "CITES", "PANTHERA", "SMITHSONIAN"],
  lastUpdated: "2026-06-07",
};

export const orca: SpeciesProfile = {
  id: sid("SP_ORCA"),
  referenceCode: "REFERENCE_002",
  slug: "orca",
  status: "active",

  commonName: "Orca",
  alternativeNames: ["Killer Whale", "Spekkhogger"],
  scientificName: "Orcinus orca",
  roleLabel: "Marine apex predator",
  whyItMatters:
    "As an ocean apex predator, the orca is associated with the balance of marine food webs that ocean productivity and fisheries depend on.",
  summary:
    "The largest member of the dolphin family and a top predator in every ocean. Orcas are associated with shaping marine food webs from the top down, though their role varies sharply between populations, which differ in diet, calls and hunting behaviour.",

  identity: {
    className: "Mammalia",
    order: "Cetacea",
    family: "Delphinidae",
    genus: "Orcinus",
    species: "orca",
    humanTranslation:
      "Despite the name 'killer whale', the orca is the largest dolphin — a toothed whale, not a baleen whale.",
  },

  conservation: {
    iucnStatus: "Data Deficient",
    populationTrend: "Unknown globally",
    estimatedWildPopulation: "At least ~50,000 individuals (reported estimate)",
    mainConservationIssue:
      "Varies by population — some local groups are highly threatened even where the species globally is not assessed.",
    citesStatus: "CITES Appendix II",
    humanTranslation:
      "Data Deficient means there isn't enough global data for a complete extinction-risk assessment. It does not mean the orca is safe: several well-studied local populations are in serious decline.",
  },

  distribution: {
    nativeRange: "All oceans, from polar seas to the tropics.",
    currentRange:
      "Still found worldwide, with notable concentrations in cold, productive waters.",
    ecosystems: [
      {
        ecosystem: eid("EC_GLOBAL_OCEANS"),
        dependency: "Critical",
        confidence: "High",
      },
      { ecosystem: eid("EC_POLAR_MARINE"), dependency: "High", confidence: "High" },
      {
        ecosystem: eid("EC_COASTAL_MARINE"),
        dependency: "High",
        confidence: "High",
      },
      {
        ecosystem: eid("EC_CONTINENTAL_SHELF"),
        dependency: "Moderate",
        confidence: "Medium",
      },
      {
        ecosystem: eid("EC_FJORDS"),
        dependency: "Moderate",
        explanation: "Norwegian fjords host orcas following overwintering herring.",
        confidence: "Medium",
      },
    ],
    humanTranslation:
      "Orcas live in every ocean, but individual populations tend to specialise in particular regions and prey.",
  },

  biology: {
    length: "6–8 m; large males can approach ~9 m",
    weight: "Up to ~6,000 kg in large males",
    lifespan: "Females often 50–80+ years; males typically shorter",
    diet: "Carnivore — varies markedly by population",
    keyFoodSources: ["Salmon", "Herring", "Seals", "Other cetaceans", "Rays & sharks"],
    reproduction:
      "Gestation ~15–18 months; usually a single calf, with long intervals between births.",
    behaviour: [
      "Highly social — lives in stable, often matrilineal pods",
      "Population-specific vocal dialects",
      "Cooperative, sometimes culturally transmitted hunting techniques",
      "Distinct ecotypes with different diets and behaviour",
    ],
    humanTranslation:
      "Different orca populations behave almost like distinct cultures — separate diets, calls and hunting methods passed down within the group. Some eat only fish; others specialise in marine mammals.",
  },

  ecologicalIntelligence: {
    ecologicalRole:
      "Apex marine predator, often regarded as a keystone species in its food web.",
    keystoneSpecies:
      "Frequently — its predation is linked to the structure of marine communities.",
    trophicLevel: "Apex consumer (top of the marine food chain)",
    humanTranslation:
      "As an ocean apex predator, the orca's hunting is associated with regulating populations of prey such as seals and fish, which is linked to the balance of marine ecosystems.",
  },

  // Predation is shared with the jaguar. Nutrient cycling is included cautiously:
  // large marine predators are associated with moving nutrients through the
  // water column (the "whale pump"). Language stays non-absolute.
  functions: [fid("FN_PREDATION"), fid("FN_NUTRIENT_CYCLING")],

  threats: [
    {
      threat: tid("TH_PREY_DEPLETION"),
      severity: 5,
      explanation:
        "Fish-eating populations are closely tied to prey such as Chinook salmon; declines in prey are linked to poor body condition and low calf survival.",
      confidence: "High",
      sourceIds: ["NOAA"],
    },
    {
      threat: tid("TH_CHEMICAL_POLLUTION"),
      severity: 5,
      explanation:
        "As long-lived top predators, orcas accumulate persistent pollutants such as PCBs, which are associated with reproductive and immune harm.",
      confidence: "High",
      sourceIds: ["NOAA", "IWC"],
    },
    {
      threat: tid("TH_NOISE_POLLUTION"),
      severity: 4,
      explanation:
        "Underwater noise can interfere with the echolocation and communication orcas rely on to hunt.",
      confidence: "Medium",
    },
    {
      threat: tid("TH_VESSEL_DISTURBANCE"),
      severity: 3,
      explanation:
        "Vessel traffic can disrupt feeding and movement, particularly near coastal populations.",
      confidence: "Medium",
    },
    {
      threat: tid("TH_BYCATCH"),
      severity: 3,
      explanation:
        "Entanglement and competition with fisheries affect some populations.",
      confidence: "Medium",
    },
    {
      threat: tid("TH_CLIMATE_CHANGE"),
      severity: 3,
      explanation:
        "Warming and shifting prey distributions are associated with longer-term changes for some populations.",
      confidence: "Medium",
    },
    {
      threat: tid("TH_CAPTIVITY_TRADE"),
      severity: 2,
      explanation:
        "Historic live capture damaged some populations; pressure has declined but persists in places.",
      confidence: "High",
    },
  ],

  solutions: [
    {
      solution: solid("SO_PREY_RECOVERY"),
      importance: 5,
      explanation:
        "Rebuilding key prey stocks such as salmon is central for fish-eating populations.",
      confidence: "High",
    },
    {
      solution: solid("SO_POLLUTION_CONTROL"),
      importance: 5,
      explanation:
        "Reducing persistent chemicals lowers the toxic burden carried by top predators.",
      confidence: "High",
    },
    {
      solution: solid("SO_MARINE_PROTECTED_AREAS"),
      importance: 4,
      explanation:
        "Protected ocean zones can shield critical feeding and resting habitat.",
    },
    {
      solution: solid("SO_VESSEL_REGULATION"),
      importance: 4,
      explanation: "Speed and approach limits reduce disturbance and noise.",
    },
    {
      solution: solid("SO_FISHERIES_REFORM"),
      importance: 4,
      explanation: "Managing fisheries reduces both bycatch and prey competition.",
    },
    {
      solution: solid("SO_POPULATION_MONITORING"),
      importance: 4,
      explanation:
        "Closing the data gaps behind the Data Deficient status is itself a priority.",
      confidence: "High",
    },
    {
      solution: solid("SO_NOISE_REDUCTION"),
      importance: 3,
      explanation: "Quieter vessels help protect communication and hunting.",
    },
    {
      solution: solid("SO_CAPTIVITY_PHASE_OUT"),
      importance: 3,
      explanation: "Ending live capture removes a historic source of decline.",
    },
  ],

  fourPlanetIntelligence: {
    ecologicalImportance: 5,
    extinctionRisk: 3,
    culturalImportance: 5,
    publicRecognition: 5,
    dataAvailability: 2,
    missionRelevance: 5,
  },

  connections: {
    species: [sid("SP_JAGUAR"), sid("SP_POLAR_BEAR")],
    missions: [
      mid("MS_WHALES"),
      mid("MS_SPECIES"),
      mid("MS_REWILD"),
    ],
  },

  highlights: [
    "Largest member of the dolphin family.",
    "Found in every ocean on Earth.",
    "Distinct populations differ in diet, calls and culture.",
    "Globally Data Deficient — yet some local populations are at serious risk.",
  ],

  sourceIds: ["IUCN_RED_LIST", "CITES", "NOAA", "IWC", "SMITHSONIAN"],
  lastUpdated: "2026-06-07",
};

export const elephant: SpeciesProfile = {
  id: sid("SP_ELEPHANT"),
  referenceCode: "REFERENCE_003",
  slug: "african-savanna-elephant",
  status: "active",

  commonName: "African Savanna Elephant",
  alternativeNames: ["African Bush Elephant"],
  scientificName: "Loxodonta africana",
  roleLabel: "Ecosystem engineer",
  whyItMatters:
    "By engineering habitat and dispersing seeds, the elephant shapes the savannas and forests that many other species depend on.",
  summary:
    "The largest living land animal and a powerful ecosystem engineer. Through feeding, movement and water use, savanna elephants are linked to seed dispersal, open habitat and water access that many other species depend on.",

  identity: {
    className: "Mammalia",
    order: "Proboscidea",
    family: "Elephantidae",
    genus: "Loxodonta",
    species: "africana",
    humanTranslation:
      "The African savanna elephant is a separate species from the smaller African forest elephant (Loxodonta cyclotis), and is the largest land animal alive today.",
  },

  conservation: {
    iucnStatus: "Endangered",
    populationTrend: "Decreasing",
    estimatedWildPopulation:
      "Difficult to isolate; savanna and forest elephants are often reported together in the low hundreds of thousands.",
    mainConservationIssue:
      "Poaching for ivory, alongside habitat loss, fragmentation and conflict with people.",
    citesStatus: "CITES Appendix I (most populations)",
    humanTranslation:
      "Assessed as Endangered for the savanna elephant specifically — it has been evaluated separately from the forest elephant since 2021. Combined estimates should be read carefully, as the two species are counted together in many surveys.",
  },

  distribution: {
    nativeRange: "Savannas and woodlands across sub-Saharan Africa.",
    currentRange:
      "Now fragmented across eastern and southern Africa, concentrated in protected areas.",
    ecosystems: [
      {
        ecosystem: eid("EC_AFRICAN_SAVANNA"),
        dependency: "Critical",
        confidence: "High",
      },
      { ecosystem: eid("EC_GRASSLANDS"), dependency: "High", confidence: "High" },
      { ecosystem: eid("EC_WOODLANDS"), dependency: "High", confidence: "High" },
      {
        ecosystem: eid("EC_WETLANDS"),
        dependency: "Moderate",
        confidence: "Medium",
      },
      {
        ecosystem: eid("EC_MIGRATION_CORRIDORS"),
        dependency: "High",
        explanation:
          "Seasonal movement between ranges is essential and increasingly obstructed.",
        confidence: "High",
      },
    ],
    humanTranslation:
      "Savanna elephants once roamed most of sub-Saharan Africa. Today their range is broken into fragments, with much of the population inside protected areas.",
  },

  biology: {
    length: "Up to ~3.2 m shoulder height",
    weight: "Up to ~6,000 kg in large males",
    lifespan: "~60–70 years",
    diet: "Herbivore — bulk feeder on a wide range of plants",
    keyFoodSources: ["Grasses", "Leaves", "Bark", "Fruit", "Roots"],
    reproduction:
      "Gestation ~22 months — the longest of any land mammal; usually one calf, with several years between births.",
    behaviour: [
      "Lives in matriarchal family herds led by an older female",
      "Moves long distances between seasonal feeding and water",
      "Strong long-term memory of routes and resources",
      "Digs for water in dry riverbeds, opening access for others",
    ],
    humanTranslation:
      "Elephants live in tight female-led families and reproduce slowly, which makes lost individuals hard to replace. Their daily activity reshapes the landscape around them.",
  },

  ecologicalIntelligence: {
    ecologicalRole:
      "Keystone ecosystem engineer of African savannas and woodlands.",
    keystoneSpecies:
      "Yes — widely considered to shape habitat far beyond its own numbers.",
    trophicLevel: "Primary consumer (herbivore) with keystone influence",
    humanTranslation:
      "Ecosystem engineer = a species that physically reshapes its habitat in ways many others depend on. By toppling trees, dispersing seeds and digging for water, elephants are linked to keeping savannas open and diverse.",
  },

  functions: [
    fid("FN_SEED_DISPERSAL"),
    fid("FN_HABITAT_ENGINEERING"),
    fid("FN_WATER_ENGINEERING"),
    fid("FN_HERBIVORY"),
  ],

  threats: [
    {
      threat: tid("TH_POACHING"),
      severity: 5,
      explanation:
        "Illegal killing for ivory has driven major declines across much of the range.",
      confidence: "High",
      sourceIds: ["CITES"],
    },
    {
      threat: tid("TH_IVORY_TRADE"),
      severity: 5,
      explanation:
        "Demand for ivory sustains the trafficking that fuels poaching.",
      confidence: "High",
      sourceIds: ["CITES"],
    },
    {
      threat: tid("TH_HABITAT_FRAGMENTATION"),
      severity: 4,
      explanation:
        "Farmland and infrastructure break up the large ranges elephants need.",
      confidence: "High",
    },
    {
      threat: tid("TH_HUMAN_WILDLIFE_CONFLICT"),
      severity: 4,
      explanation:
        "Crop-raiding near settlements leads to retaliatory killing of elephants.",
      confidence: "High",
    },
    {
      threat: tid("TH_BLOCKED_MIGRATION"),
      severity: 3,
      explanation:
        "Fences, roads and farmland increasingly cut the seasonal routes elephants depend on.",
      confidence: "Medium",
    },
    {
      threat: tid("TH_CLIMATE_DROUGHT"),
      severity: 3,
      explanation:
        "More severe droughts are associated with food and water shortages, especially for calves.",
      confidence: "Medium",
    },
  ],

  solutions: [
    {
      solution: solid("SO_ANTI_POACHING"),
      importance: 5,
      explanation:
        "Enforcement against ivory poaching directly protects existing populations.",
      confidence: "High",
    },
    {
      solution: solid("SO_COMMUNITY_CONSERVATION"),
      importance: 5,
      explanation:
        "When communities benefit from living elephants, both conflict and poaching tend to fall.",
      confidence: "High",
    },
    {
      solution: solid("SO_WILDLIFE_CORRIDORS"),
      importance: 4,
      explanation:
        "Reconnecting ranges restores the movement elephants need across seasons.",
    },
    {
      solution: solid("SO_LANDSCAPE_PLANNING"),
      importance: 4,
      explanation:
        "Planning land use keeps room for elephants alongside people and farms.",
    },
    {
      solution: solid("SO_PROTECTED_AREA_MGMT"),
      importance: 4,
      explanation: "Well-run parks hold most of the remaining population.",
    },
    {
      solution: solid("SO_CONFLICT_REDUCTION"),
      importance: 4,
      explanation:
        "Deterrents and compensation reduce retaliatory killing near farmland.",
    },
    {
      solution: solid("SO_WATER_ACCESS_PROTECTION"),
      importance: 3,
      explanation:
        "Safeguarding dry-season water helps elephants through drought.",
    },
  ],

  fourPlanetIntelligence: {
    ecologicalImportance: 5,
    extinctionRisk: 4,
    culturalImportance: 5,
    publicRecognition: 5,
    dataAvailability: 4,
    missionRelevance: 5,
  },

  connections: {
    species: [sid("SP_JAGUAR")],
    missions: [mid("MS_SPECIES"), mid("MS_REWILD")],
  },

  highlights: [
    "Largest living land animal.",
    "Recognised as a separate species from the African forest elephant since 2021.",
    "Longest pregnancy of any land mammal (~22 months).",
    "A keystone engineer of savanna landscapes.",
  ],

  sourceIds: ["IUCN_RED_LIST", "CITES", "SMITHSONIAN"],
  lastUpdated: "2026-06-07",
};

export const polarBear: SpeciesProfile = {
  id: sid("SP_POLAR_BEAR"),
  referenceCode: "REFERENCE_004",
  slug: "polar-bear",
  status: "active",

  commonName: "Polar Bear",
  alternativeNames: ["Isbjørn", "Nanuq"],
  scientificName: "Ursus maritimus",
  roleLabel: "Sea-ice predator",
  whyItMatters:
    "As the Arctic\u2019s apex predator, the polar bear tracks the health of the sea-ice system itself — an early signal of a warming climate.",
  summary:
    "The Arctic's largest land predator — and, in practice, a marine one. Polar bears hunt seals from sea ice, which makes them closely linked to the extent of Arctic ice and one of the clearest examples of a species pressured directly by a warming climate.",

  identity: {
    className: "Mammalia",
    order: "Carnivora",
    family: "Ursidae",
    genus: "Ursus",
    species: "maritimus",
    humanTranslation:
      "A bear so dependent on the sea and sea ice that its scientific name means 'maritime bear'. It is classified as a marine mammal.",
  },

  conservation: {
    iucnStatus: "Vulnerable",
    populationTrend: "Uncertain; projected to decline with sea-ice loss",
    estimatedWildPopulation: "~22,000–31,000 individuals across 19 subpopulations (reported)",
    mainConservationIssue:
      "Loss of the sea ice polar bears rely on to hunt, driven by a warming climate.",
    citesStatus: "CITES Appendix II",
    humanTranslation:
      "Vulnerable means a high risk of endangerment in the wild. The central concern is not hunting but habitat: as Arctic sea ice shrinks, bears have less time and platform to catch the seals they depend on.",
  },

  distribution: {
    nativeRange: "Circumpolar Arctic — across the sea-ice regions of five nations.",
    currentRange:
      "Still circumpolar, but increasingly tied to where seasonal sea ice persists.",
    ecosystems: [
      {
        ecosystem: eid("EC_ARCTIC_SEA_ICE"),
        dependency: "Critical",
        explanation: "Sea ice is the hunting platform the species is built around.",
        confidence: "High",
      },
      { ecosystem: eid("EC_POLAR_MARINE"), dependency: "Critical", confidence: "High" },
      {
        ecosystem: eid("EC_COASTAL_MARINE"),
        dependency: "Moderate",
        explanation: "Bears spend more time ashore as ice retreats.",
        confidence: "Medium",
      },
    ],
    humanTranslation:
      "Polar bears live right around the Arctic. Their range increasingly follows the seasonal sea ice they need to hunt.",
  },

  biology: {
    length: "1.8–2.8 m body length",
    weight: "Males ~350–600 kg (occasionally more); females smaller",
    lifespan: "~25–30 years in the wild",
    diet: "Carnivore — primarily seals, hunted from the sea ice",
    keyFoodSources: ["Ringed seals", "Bearded seals", "Carcasses"],
    reproduction:
      "Usually 2 cubs born in winter dens; long maternal care of about 2–2.5 years.",
    behaviour: [
      "Largely solitary",
      "Roams long distances across sea ice",
      "Strong swimmer between ice floes",
      "Relies on sea ice to reach prey efficiently",
    ],
    humanTranslation:
      "Polar bears are built to hunt seals from the ice. Slow reproduction and long cub-rearing mean populations recover slowly from losses.",
  },

  ecologicalIntelligence: {
    ecologicalRole: "Apex predator of the Arctic sea-ice ecosystem.",
    keystoneSpecies:
      "Regarded as a top predator and an indicator of Arctic ecosystem health.",
    trophicLevel: "Apex consumer (top of the Arctic food chain)",
    humanTranslation:
      "As the Arctic's apex predator, the polar bear's condition is widely treated as a signal of the health of the wider sea-ice ecosystem.",
  },

  functions: [fid("FN_PREDATION")],

  threats: [
    {
      threat: tid("TH_SEA_ICE_LOSS"),
      severity: 5,
      explanation:
        "Less and shorter-lasting sea ice is linked to less hunting time, longer fasting and poorer body condition.",
      confidence: "High",
      sourceIds: ["NOAA", "IUCN_RED_LIST"],
    },
    {
      threat: tid("TH_CLIMATE_CHANGE"),
      severity: 4,
      explanation:
        "Broader Arctic warming is associated with shifting prey and denning conditions beyond ice extent alone.",
      confidence: "High",
    },
    {
      threat: tid("TH_CHEMICAL_POLLUTION"),
      severity: 3,
      explanation:
        "As an Arctic top predator, the polar bear accumulates persistent pollutants carried north and concentrated up the food chain.",
      confidence: "Medium",
    },
    {
      threat: tid("TH_HUMAN_WILDLIFE_CONFLICT"),
      severity: 3,
      explanation:
        "As bears spend more time ashore, encounters with coastal communities are rising.",
      confidence: "Medium",
    },
  ],

  solutions: [
    {
      solution: solid("SO_CLIMATE_ACTION"),
      importance: 5,
      explanation:
        "Cutting greenhouse-gas emissions is the only measure that addresses the root cause — sea-ice loss.",
      confidence: "High",
    },
    {
      solution: solid("SO_POPULATION_MONITORING"),
      importance: 4,
      explanation:
        "Tracking the 19 subpopulations is needed because trends vary widely between regions.",
      confidence: "High",
    },
    {
      solution: solid("SO_CONFLICT_REDUCTION"),
      importance: 3,
      explanation:
        "Community deterrence and waste management reduce dangerous encounters as bears come ashore.",
    },
    {
      solution: solid("SO_POLLUTION_CONTROL"),
      importance: 3,
      explanation:
        "Reducing persistent pollutants lowers the toxic burden carried by Arctic predators.",
    },
    {
      solution: solid("SO_PROTECTED_AREA_MGMT"),
      importance: 3,
      explanation: "Protecting key denning and coastal areas supports resilience.",
    },
  ],

  fourPlanetIntelligence: {
    ecologicalImportance: 4,
    extinctionRisk: 4,
    culturalImportance: 5,
    publicRecognition: 5,
    dataAvailability: 4,
    missionRelevance: 5,
  },

  connections: {
    species: [sid("SP_ORCA"), sid("SP_JAGUAR")],
    missions: [mid("MS_CLIMATE"), mid("MS_SPECIES"), mid("MS_REWILD")],
  },

  highlights: [
    "Classified as a marine mammal — built around sea ice.",
    "~19 subpopulations with widely differing trends.",
    "Among the clearest species-level signals of a warming Arctic.",
    "Slow to reproduce, so losses are hard to reverse.",
  ],

  sourceIds: ["IUCN_RED_LIST", "CITES", "NOAA", "SMITHSONIAN"],
  lastUpdated: "2026-06-08",
};

export const honeyBee: SpeciesProfile = {
  id: sid("SP_HONEY_BEE"),
  referenceCode: "REFERENCE_005",
  slug: "western-honey-bee",
  status: "active",

  commonName: "Western Honey Bee",
  alternativeNames: ["European Honey Bee", "Honningbie"],
  scientificName: "Apis mellifera",
  roleLabel: "Pollinator",
  whyItMatters:
    "By pollinating crops and wild plants, the honey bee supports food production — and through it, part of the human food system.",
  signals: {
    urgency: "Critical",
    leverage: "Critical",
    confidence: "High",
    scale: "Critical",
    reversibility: "Partly reversible",
    knowledgeQuality: "Medium",
    decisionRelevance: "Critical",
  },
  knowledge: {
    status: "Well Established",
    evidenceQuality: "Medium",
    lastReviewDate: "2025-12-01",
    known: "Pollination supports a large share of food crops.",
    unknown: "Relative weight of each driver (pesticides, forage loss, disease, climate) in decline.",
    researchGaps: ["Combined-stressor effects", "Wild vs managed pollinator dynamics"],
  },
  summary:
    "One of the world's most important managed pollinators. Through pollination, the honey bee is linked to the reproduction of many wild plants and to the production of a large share of the crops people eat — connecting nature directly to the food system.",

  identity: {
    className: "Insecta",
    order: "Hymenoptera",
    family: "Apidae",
    genus: "Apis",
    species: "mellifera",
    humanTranslation:
      "A social insect that lives in colonies of a queen and thousands of workers. It is both a wild species and the most widely managed pollinator on Earth.",
  },

  conservation: {
    iucnStatus: "Data Deficient",
    populationTrend: "Mixed — managed colonies are widespread; wild status unclear",
    estimatedWildPopulation:
      "Tens of millions of managed colonies worldwide; truly wild/feral numbers are poorly known.",
    mainConservationIssue:
      "Pressures on bee health and on the pollination service — not extinction of the managed species.",
    citesStatus: undefined,
    humanTranslation:
      "Data Deficient means there isn't enough data on wild populations for a full assessment. As a managed animal the honey bee is not at risk of extinction — but the health of colonies and the pollination they provide are under real pressure.",
  },

  distribution: {
    nativeRange: "Europe, Africa and western Asia.",
    currentRange: "Now found on every continent except Antarctica, largely through managed beekeeping.",
    ecosystems: [
      {
        ecosystem: eid("EC_FARMLAND"),
        dependency: "High",
        explanation: "Much of its pollination work — and exposure to risk — happens on farmland.",
        confidence: "High",
      },
      { ecosystem: eid("EC_GRASSLANDS"), dependency: "Moderate", confidence: "Medium" },
      { ecosystem: eid("EC_WOODLANDS"), dependency: "Moderate", confidence: "Medium" },
    ],
    humanTranslation:
      "Originally from the Old World, honey bees are now kept almost everywhere people farm.",
  },

  biology: {
    length: "Workers ~12–15 mm",
    weight: "About 0.1 g per bee",
    lifespan: "Workers weeks to months; a queen can live several years",
    diet: "Nectar and pollen from flowering plants",
    keyFoodSources: ["Nectar", "Pollen"],
    reproduction:
      "Eusocial: a single queen lays the eggs for an entire colony; new colonies form by swarming.",
    behaviour: [
      "Lives in large cooperative colonies",
      "Communicates food locations via the 'waggle dance'",
      "Forages across wide areas for nectar and pollen",
      "Stores honey as a food reserve",
    ],
    humanTranslation:
      "A honey bee colony works as a single superorganism. While foraging for food, bees move pollen between flowers — which is the pollination other plants and crops rely on.",
  },

  ecologicalIntelligence: {
    ecologicalRole:
      "Keystone pollinator and mutualist linking plants to reproduction.",
    keystoneSpecies:
      "Widely treated as a keystone mutualist for the breadth of plants it pollinates.",
    trophicLevel: "Primary consumer (feeds on nectar and pollen)",
    humanTranslation:
      "Mutualist = two species that benefit each other; bees get food while plants get pollinated. This links the honey bee to both wild plant reproduction and human food production.",
  },

  functions: [fid("FN_POLLINATION")],

  threats: [
    {
      threat: tid("TH_PESTICIDES"),
      severity: 4,
      explanation:
        "Some pesticides are associated with harm to bees even at sub-lethal doses.",
      confidence: "High",
      sourceIds: ["FAO"],
      reviewStatus: "Reviewed",
    },
    {
      threat: tid("TH_PARASITES_DISEASE"),
      severity: 4,
      explanation:
        "The Varroa mite and associated diseases are a leading cause of colony losses.",
      confidence: "High",
      reviewStatus: "Reviewed",
    },
    {
      threat: tid("TH_FORAGE_LOSS"),
      severity: 3,
      explanation:
        "Intensive single-crop farming reduces the varied flowers bees need across the season.",
      confidence: "Medium",
    },
    {
      threat: tid("TH_CLIMATE_CHANGE"),
      severity: 3,
      explanation:
        "Shifting seasons can desynchronise bees from the flowering they depend on.",
      confidence: "Medium",
    },
  ],

  solutions: [
    {
      solution: solid("SO_PESTICIDE_REDUCTION"),
      importance: 5,
      explanation: "Cutting and targeting harmful pesticides directly reduces exposure.",
      confidence: "High",
    },
    {
      solution: solid("SO_POLLINATOR_HABITAT"),
      importance: 4,
      explanation: "Restoring wildflowers and margins gives bees season-long forage.",
    },
    {
      solution: solid("SO_DIVERSE_FARMING"),
      importance: 4,
      explanation: "Mixed cropping rebuilds the varied food supply pollinators need.",
    },
    {
      solution: solid("SO_BEE_HEALTH"),
      importance: 4,
      explanation: "Managing Varroa and disease keeps colonies viable.",
      confidence: "High",
    },
    {
      solution: solid("SO_SCIENTIFIC_MONITORING"),
      importance: 3,
      explanation: "Tracking colony health and wild pollinators closes data gaps.",
    },
    {
      solution: solid("SO_CLIMATE_ACTION"),
      importance: 3,
      explanation: "Limiting warming reduces disruption to flowering and foraging.",
    },
  ],

  fourPlanetIntelligence: {
    ecologicalImportance: 5,
    extinctionRisk: 2,
    culturalImportance: 4,
    publicRecognition: 5,
    dataAvailability: 3,
    missionRelevance: 5,
  },

  connections: {
    species: [],
    missions: [mid("MS_FOOD"), mid("MS_SPECIES")],
  },

  highlights: [
    "Among the most important managed pollinators worldwide.",
    "Links wild-plant reproduction to human food production.",
    "Colony works as a single 'superorganism'.",
    "Not at risk of extinction as a managed animal — but bee health is under pressure.",
  ],

  sourceIds: ["IUCN_RED_LIST", "FAO"],
  lastUpdated: "2026-06-08",
};

// --- Placeholders (next session: full data) ---------------------------------

export const placeholders: Pick<
  SpeciesProfile,
  "id" | "referenceCode" | "slug" | "status" | "commonName" | "scientificName" | "summary"
>[] = [];

// Active, fully-implemented species.
export const speciesList: SpeciesProfile[] = [
  jaguar,
  orca,
  elephant,
  polarBear,
  honeyBee,
];

export function getSpeciesBySlug(slug: string): SpeciesProfile | undefined {
  return speciesList.find((s) => s.slug === slug);
}
