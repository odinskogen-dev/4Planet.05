import type { DomainKey } from "@/types/content";

export type NarrativeStatus =
  | "CONCEPT"
  | "IN DEVELOPMENT"
  | "PARTNER VALIDATION"
  | "PILOT PREPARATION"
  | "TEST ONLY"
  | "COMING"
  | "AVAILABLE"
  | "REPORTING"
  | "VERIFIED RESULT";

export type ActionCapability = "READ" | "EXPLORE" | "FOLLOW" | "PARTICIPATE" | "SUPPORT";

export interface NarrativeSource {
  title: string;
  url: string;
  role: "PRIMARY" | "METHOD" | "CONTEXT" | "RIGHTS";
}

export interface NarrativeAction {
  label: string;
  href: string;
  capability: ActionCapability;
  available: boolean;
}

export interface NarrativeMission {
  slug: string;
  domain: DomainKey;
  code: string;
  name: string;
  status: NarrativeStatus;
  hero: string;
  mobileHero: string;
  lead: string;
  relationship: string;
  issue: string;
  whyItMatters: string;
  approach: string;
  contribution: string;
  livingSystem: string[];
  opening: string[];
  whatChanges: string[];
  whatFourPlanetBuilds: string[];
  nextMilestone: string;
  action: NarrativeAction;
  seoTitle: string;
  seoDescription: string;
  sourceNeeds: string[];
  sources: NarrativeSource[];
  mediaRequirements: string[];
  rightsRequirements: string[];
}

export interface NarrativeDomain {
  key: DomainKey;
  code: string;
  name: string;
  descriptor: string;
  hero: string;
  lead: string;
  relationship: string;
  body: string[];
  question: string;
}

export const DOMAIN_ORDER: DomainKey[] = ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"];

export const NARRATIVE_STATUSES: NarrativeStatus[] = [
  "CONCEPT",
  "IN DEVELOPMENT",
  "PARTNER VALIDATION",
  "PILOT PREPARATION",
  "TEST ONLY",
  "COMING",
  "AVAILABLE",
  "REPORTING",
  "VERIFIED RESULT",
];

export const STATUS_MEANING: Record<NarrativeStatus, string> = {
  "CONCEPT": "The public idea and boundaries are defined. No delivery pathway is active.",
  "IN DEVELOPMENT": "Research, product definition and evidence requirements are being assembled.",
  "PARTNER VALIDATION": "Potential delivery roles are being checked. No partner status is implied.",
  "PILOT PREPARATION": "A bounded test is being designed. No outcome is claimed.",
  "TEST ONLY": "A local or controlled test exists. It is not a production service.",
  "COMING": "The surface is announced but not yet available.",
  "AVAILABLE": "The stated public capability is available under its published terms.",
  "REPORTING": "Delivery evidence is being assembled and reported.",
  "VERIFIED RESULT": "A precisely defined result has passed the stated verification method.",
};

export const DOMAINS: Record<DomainKey, NarrativeDomain> = {
  "OCE4N_": {
    key: "OCE4N_",
    code: "DOMAIN 01",
    name: "OCE4N_",
    descriptor: "Life in motion",
    hero: "The ocean is not a backdrop. It is a moving system that connects climate, coastlines and life across the planet.",
    lead: "Currents carry heat. Plankton make oxygen. Whales move nutrients. Reefs shelter entire communities of life.",
    relationship: "What happens far offshore can shape weather, food and safety on land.",
    body: [
      "OCE4N_ follows the relationships that are easy to lose beneath the surface: movement, sound, temperature, food webs, waste flows and ecological recovery.",
      "Its Missions make those relationships visible without pretending that visibility alone is action.",
      "Every pathway must show the issue, the living system, the proposed role, the evidence required and the honest current status.",
    ],
    question: "How do we protect a system that never stays still?",
  },
  "E4RTH_": {
    key: "E4RTH_",
    code: "DOMAIN 02",
    name: "E4RTH_",
    descriptor: "The ground beneath every system",
    hero: "Land is where water, climate, species and human decisions meet.",
    lead: "Forests move moisture. Soils hold memory. Wetlands slow water. Species keep landscapes functioning.",
    relationship: "A living landscape is infrastructure — but only while its relationships remain intact.",
    body: [
      "E4RTH_ looks beyond scenery to the ecological processes that make places resilient.",
      "Its Missions connect climate, rainforest, species and restoration without collapsing them into one generic nature story.",
      "Protection, recovery and measurement remain separate claims until evidence connects them.",
    ],
    question: "What does it take for a damaged place to become alive again?",
  },
  "S4PIENS_": {
    key: "S4PIENS_",
    code: "DOMAIN 03",
    name: "S4PIENS_",
    descriptor: "Human systems inside living systems",
    hero: "The systems people design decide where pressure lands.",
    lead: "Food, energy, cities and clothing are not separate from nature. They are ways society moves land, water, materials and labour.",
    relationship: "Every ordinary choice sits inside an extraordinary network of dependencies.",
    body: [
      "S4PIENS_ examines the infrastructures of daily life rather than placing responsibility on isolated consumers.",
      "Its Missions reveal where design, policy, business and culture can reduce pressure or move it elsewhere.",
      "The aim is not moral perfection. It is clearer choices, better systems and visible trade-offs.",
    ],
    question: "How can human systems become compatible with the systems that keep us alive?",
  },
  "4CULTURE_": {
    key: "4CULTURE_",
    code: "DOMAIN 04",
    name: "4CULTURE_",
    descriptor: "What a society learns to notice",
    hero: "Culture changes what people can see, feel and imagine together.",
    lead: "An image can make a species present. A film can make a system legible. A song can carry attention further than a report.",
    relationship: "Before a society changes its behaviour, it often changes its story.",
    body: [
      "4CULTURE_ is the public imagination layer of 4PLANET.",
      "Its Missions publish, film, print and play work that returns attention to the living world and connects culture back to ecological action.",
      "Cultural reach is not reported as ecological impact. Rights, revenue allocation and contribution claims must remain explicit.",
    ],
    question: "What happens when the living planet becomes part of culture again?",
  },
};

const source = (
  title: string,
  url: string,
  role: NarrativeSource["role"] = "PRIMARY",
): NarrativeSource => ({ title, url, role });

export const MISSIONS: NarrativeMission[] = [
  {
    slug: "wh4les",
    domain: "OCE4N_",
    code: "OCE4N_ / 01",
    name: "WH4LES_",
    status: "IN DEVELOPMENT",
    hero: "A whale crosses borders the ocean does not recognise.",
    mobileHero: "A whale crosses borders.",
    lead: "Migration, feeding, sound and safe passage connect distant waters into one living route.",
    relationship: "Protecting whales means understanding the moving ocean around them — shipping, prey, noise, fishing gear and changing conditions.",
    issue: "Whales travel through busy and rapidly changing seas. Vessel strikes, entanglement, underwater noise and shifting prey can interrupt routes that cross many jurisdictions.",
    whyItMatters: "Whales are part of marine food webs and nutrient movement, but they also reveal whether large ocean corridors can remain usable for life.",
    approach: "Build a public whale-intelligence Mission that connects trusted species evidence, routes, pressures and practical protection pathways without turning one observation into a population claim.",
    contribution: "4PLANET is defining the first WH4LES_ public journey and the evidence required before any partner or protection action is presented.",
    livingSystem: ["whales", "migration corridors", "prey", "sound", "shipping", "fishing activity", "marine governance"],
    opening: [
      "A whale can leave one coast, cross an ocean and return to another season.",
      "The journey looks solitary. It is not. It depends on food appearing in the right place, sound travelling through water, routes remaining passable and human activity leaving enough room.",
    ],
    whatChanges: [
      "Ships move faster than whales can adapt.",
      "Ropes and nets can turn a feeding ground into a hazard.",
      "Noise can occupy the same acoustic space whales use to navigate and communicate.",
    ],
    whatFourPlanetBuilds: [
      "A life-first public Mission centred on movement and safe passage.",
      "A controlled source layer that separates records, observations, interpretation and population-level claims.",
      "A future participation pathway only when a specific role, authority and evidence model exist.",
    ],
    nextMilestone: "Select one whale population or corridor, close its source pack and define one bounded protection pathway.",
    action: { label: "SEE WHAT COMES NEXT", href: "#next", capability: "READ", available: true },
    seoTitle: "WH4LES_ — Migration, sound and safe passage | 4PLANET",
    seoDescription: "Explore the living routes whales depend on, the pressures crossing those routes and what 4PLANET is building next.",
    sourceNeeds: ["Selected population and geography", "Migration and occurrence evidence", "Threat and management sources", "Media rights"],
    sources: [
      source("NOAA Fisheries — Understanding Vessel Strikes", "https://www.fisheries.noaa.gov/insight/understanding-vessel-strikes"),
      source("NOAA Fisheries — North Atlantic Right Whale Science", "https://www.fisheries.noaa.gov/species/north-atlantic-right-whale/science"),
      source("IWC — Ship Strikes", "https://iwc.int/management-and-conservation/ship-strikes"),
    ],
    mediaRequirements: ["Rights-cleared whale portrait", "Open-ocean route image", "Acoustic or migration visualisation"],
    rightsRequirements: ["Species and place caption", "Creator and licence", "No implied partner endorsement"],
  },
  {
    slug: "cor4l",
    domain: "OCE4N_",
    code: "OCE4N_ / 02",
    name: "COR4L_",
    status: "IN DEVELOPMENT",
    hero: "A reef is built by animals smaller than a fingertip.",
    mobileHero: "A reef is alive.",
    lead: "Coral colonies create structure, shelter and possibility for entire coastal ecosystems.",
    relationship: "Heat acts on tiny organisms, but the consequences travel through fisheries, shorelines and communities.",
    issue: "Marine heat, acidification, pollution, disease and local disturbance can push reefs beyond their capacity to recover.",
    whyItMatters: "Reefs support biodiversity, food, livelihoods and coastal protection. Their decline is a systems loss, not only a loss of colour.",
    approach: "Connect live heat-stress intelligence with reef ecology, local context and honest recovery options.",
    contribution: "4PLANET is preparing a coral Mission that can move from signal to place to understanding before any restoration claim is made.",
    livingSystem: ["coral colonies", "algae", "reef fish", "water temperature", "coastal protection", "fisheries", "local stewardship"],
    opening: ["A reef grows slowly, one living layer at a time.", "A period of extreme heat can change that structure in weeks."],
    whatChanges: ["Thermal stress disrupts the coral–algae relationship.", "Repeated disturbance leaves less time for recovery.", "Local pressure can reduce resilience before heat arrives."],
    whatFourPlanetBuilds: ["A heat-stress-to-place journey using controlled data.", "A reef page that distinguishes exposure, observed condition and interpretation.", "Restoration pathways only where local authority, method and monitoring are real."],
    nextMilestone: "Select one reef geography and connect NOAA heat-stress data to a controlled local context.",
    action: { label: "EXPLORE THE REEF SYSTEM", href: "#system", capability: "READ", available: true },
    seoTitle: "COR4L_ — Reef heat, resilience and recovery | 4PLANET",
    seoDescription: "Understand how heat moves through coral reef systems and what credible recovery requires.",
    sourceNeeds: ["Heat-stress data contract", "Reef boundary", "Local condition evidence", "Restoration authority"],
    sources: [
      source("NOAA Coral Reef Watch", "https://coralreefwatch.noaa.gov/"),
      source("NOAA Coral Reef Watch — Degree Heating Week", "https://coralreefwatch.noaa.gov/product/5km_v3.1_op/index_5km_dhw.php", "METHOD"),
    ],
    mediaRequirements: ["Healthy reef detail", "Heat-stressed reef context", "Satellite or thermal layer"],
    rightsRequirements: ["Location and date", "No condition inference from illustrative media", "Dataset attribution"],
  },
  {
    slug: "pl4stic",
    domain: "OCE4N_",
    code: "OCE4N_ / 03",
    name: "PL4STIC_",
    status: "PARTNER VALIDATION",
    hero: "Ocean plastic begins long before the shoreline.",
    mobileHero: "Plastic follows a system.",
    lead: "Production, use, collection, rivers and coastlines form one material journey.",
    relationship: "Removing waste matters, but preventing leakage requires seeing the whole route.",
    issue: "Plastic reaches marine environments through fragmented material systems and unequal waste infrastructure.",
    whyItMatters: "Waste affects habitats, wildlife, coastlines and communities while recovery claims can hide weak measurement or displacement.",
    approach: "Map material flow, prevention, interception and recovery as separate interventions with separate evidence.",
    contribution: "4PLANET is validating provider, measurement and proof requirements. No production Plastic Unit is active.",
    livingSystem: ["materials", "households", "collection", "rivers", "coastlines", "marine species", "waste workers"],
    opening: ["A bottle found at sea has already passed through many hands and systems.", "The visible object is the end of a much longer failure."],
    whatChanges: ["Design affects what can be reused.", "Infrastructure affects what can be collected.", "Rivers and weather move leakage across boundaries."],
    whatFourPlanetBuilds: ["A transparent prevention-versus-recovery model.", "A provider diligence and evidence contract.", "A future unit only after mass, chain of custody, allocation and remedy are proven."],
    nextMilestone: "Complete provider diligence and select one measurable intervention type.",
    action: { label: "VIEW THE VALIDATION LOGIC", href: "#next", capability: "READ", available: true },
    seoTitle: "PL4STIC_ — From material flow to ocean leakage | 4PLANET",
    seoDescription: "Follow plastic from production to coast and see what must be verified before a public contribution pathway opens.",
    sourceNeeds: ["Material-flow baseline", "Provider evidence", "Mass measurement", "Chain of custody"],
    sources: [
      source("UNEP — From Pollution to Solution", "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution"),
      source("UNEP — Plastic Pollution and Marine Litter", "https://www.unep.org/topics/ocean-seas-and-coasts/ecosystem-degradation-pollution/plastic-pollution-and-marine-litter"),
    ],
    mediaRequirements: ["Source-to-sea sequence", "Material detail", "Field recovery with context"],
    rightsRequirements: ["No staged cleanup presented as delivery", "Worker consent", "Measured result separated from illustration"],
  },
  {
    slug: "rewild-marine",
    domain: "OCE4N_",
    code: "OCE4N_ / 04",
    name: "RE:WILD_ MARINE",
    status: "CONCEPT",
    hero: "Marine recovery begins with the ecosystem, not the unit.",
    mobileHero: "Recovery is place-specific.",
    lead: "Kelp, seagrass, mangroves, oyster reefs and tidal wetlands recover in different ways.",
    relationship: "One public restoration standard must still respect different ecologies, authorities and timescales.",
    issue: "Marine restoration is often compressed into area claims that do not show baseline, method, survival, monitoring or ecological function.",
    whyItMatters: "Poorly framed restoration can create a clean number without demonstrating recovery.",
    approach: "Create one umbrella Mission with ecosystem-specific pathways and a common truth standard.",
    contribution: "4PLANET is defining the standard. No ecosystem pathway, partner or universal square-metre unit has been selected.",
    livingSystem: ["kelp", "seagrass", "mangroves", "oyster reefs", "tidal wetlands", "water quality", "coastal communities"],
    opening: ["The sea can recover, but not through one universal recipe.", "A kelp forest, a mangrove and an oyster reef each demand different evidence."],
    whatChanges: ["Baseline determines what recovery means.", "Local authority determines who may act.", "Monitoring determines whether implementation becomes an outcome claim."],
    whatFourPlanetBuilds: ["A common marine restoration truth standard.", "Separate ecosystem entry requirements.", "A four-level verification model from source readiness to monitored outcome."],
    nextMilestone: "Select the first ecosystem and geography only after authority, partner, baseline and monitoring are identified.",
    action: { label: "READ THE RESTORATION STANDARD", href: "#next", capability: "READ", available: true },
    seoTitle: "RE:WILD_ Marine — A standard for honest marine recovery | 4PLANET",
    seoDescription: "Explore the evidence, authority and monitoring required before marine restoration becomes a public pathway.",
    sourceNeeds: ["Ecosystem selection", "Geographic authority", "Baseline and method", "Monitoring protocol"],
    sources: [
      source("UN Decade — Standards of Practice for Ecosystem Restoration", "https://www.decadeonrestoration.org/publications/standards-practice-guide-ecosystem-restoration"),
      source("UN Decade — International Principles and Standards", "https://www.decadeonrestoration.org/publications/international-principles-standards-practice-ecological-restoration", "METHOD"),
    ],
    mediaRequirements: ["Ecosystem-specific documentary set", "Baseline field image", "Monitoring evidence example"],
    rightsRequirements: ["Site and method context", "No before/after claim without matched evidence", "Community and authority consent"],
  },
  {
    slug: "clim4te",
    domain: "E4RTH_",
    code: "E4RTH_ / 01",
    name: "CLIM4TE_",
    status: "PARTNER VALIDATION",
    hero: "Climate becomes real in living places.",
    mobileHero: "Climate lives in places.",
    lead: "Forests, soils, wetlands and cities experience climate pressure differently — and respond through different forms of resilience.",
    relationship: "Carbon is one measure inside a larger ecological system, not a substitute for it.",
    issue: "Climate communication often separates emissions, adaptation, biodiversity and place.",
    whyItMatters: "Actions that improve one metric can still harm water, species or communities if the wider system is ignored.",
    approach: "Connect climate signals to living systems, practical pathways and explicit trade-offs.",
    contribution: "4PLANET is validating a Tree-first pathway while keeping climate, biodiversity and delivery claims separate.",
    livingSystem: ["atmosphere", "forests", "soils", "wetlands", "water cycles", "species", "communities"],
    opening: ["Climate is global. Its consequences always arrive somewhere.", "A dry soil, a flooded street and a shifting forest are different expressions of the same changing system."],
    whatChanges: ["Heat changes water and habitat.", "Land use changes resilience.", "Interventions distribute benefits and risks differently."],
    whatFourPlanetBuilds: ["A place-led climate explanation layer.", "A controlled Tree pathway under partner validation.", "Proof rules that prevent a tree count from becoming an unsupported climate claim."],
    nextMilestone: "Close Tree partner, species, place, cost, evidence and reporting gates.",
    action: { label: "FOLLOW TREE VALIDATION", href: "/impact", capability: "EXPLORE", available: true },
    seoTitle: "CLIM4TE_ — Climate action grounded in living systems | 4PLANET",
    seoDescription: "See how climate, biodiversity, water and place connect — and what must be proven before a Tree pathway opens.",
    sourceNeeds: ["Climate assessment", "Restoration method", "Tree provider evidence", "Claim allocation"],
    sources: [
      source("IPCC — Sixth Assessment Report", "https://www.ipcc.ch/assessment-report/ar6/"),
      source("UN Decade on Ecosystem Restoration", "https://www.decadeonrestoration.org/"),
    ],
    mediaRequirements: ["Place-led climate sequence", "Soil/water detail", "Restoration field context"],
    rightsRequirements: ["No carbon equivalence without method", "No planted-tree image as survival proof", "Location and date"],
  },
  {
    slug: "am4zonia",
    domain: "E4RTH_",
    code: "E4RTH_ / 02",
    name: "AM4ZONIA_",
    status: "IN DEVELOPMENT",
    hero: "A forest can make rain far beyond its own canopy.",
    mobileHero: "The forest moves water.",
    lead: "Trees, rivers, soils, animals and atmospheric moisture connect the Amazon to places far outside the forest.",
    relationship: "The Amazon is not simply stored carbon. It is a living water and climate system.",
    issue: "Deforestation, fire, fragmentation and extraction weaken ecological relationships while public narratives often erase people, place and authority.",
    whyItMatters: "Forest condition affects biodiversity, moisture movement, regional climate and the lives of Indigenous and local communities.",
    approach: "Tell the Amazon as a connected living system and define protection only through specific place, authority and stewardship.",
    contribution: "4PLANET is developing the public Mission. No protection unit, territory, local authority or delivery partner has been selected.",
    livingSystem: ["forest canopy", "rivers", "soil", "rainfall", "seed dispersal", "Indigenous territories", "regional climate"],
    opening: ["The Amazon does not end at the forest edge.", "Water rises from leaves, travels through the atmosphere and returns as rain across a continent."],
    whatChanges: ["Fragmentation opens the forest to heat and fire.", "Loss of species changes regeneration.", "Weak land rights can undermine protection claims."],
    whatFourPlanetBuilds: ["A place-and-water-led public narrative.", "A source contract that respects Indigenous and local authority.", "A future protection pathway only after geography, rights, allocation and evidence are explicit."],
    nextMilestone: "Choose one bounded place and establish authority, source, stewardship and claim requirements.",
    action: { label: "SEE WHAT COMES NEXT", href: "#next", capability: "READ", available: true },
    seoTitle: "AM4ZONIA_ — Forest, water, rights and planetary connection | 4PLANET",
    seoDescription: "Explore the Amazon as a living water and climate system, and what credible protection must establish.",
    sourceNeeds: ["Bounded geography", "Land and governance authority", "Forest condition", "Stewardship evidence"],
    sources: [
      source("Science Panel for the Amazon", "https://www.theamazonwewant.org/"),
      source("IPCC — Climate Change 2022: Impacts, Adaptation and Vulnerability", "https://www.ipcc.ch/report/ar6/wg2/"),
    ],
    mediaRequirements: ["Canopy and river system", "Ground-level forest life", "Stewardship only with consent"],
    rightsRequirements: ["No community representation without consent", "No generic forest image presented as selected place", "No protection claim"],
  },
  {
    slug: "species",
    domain: "E4RTH_",
    code: "E4RTH_ / 03",
    name: "SPECIES_",
    status: "IN DEVELOPMENT",
    hero: "No species lives alone.",
    mobileHero: "Every species is a relationship.",
    lead: "Predators, pollinators, grazers, decomposers and migratory animals shape the systems around them.",
    relationship: "A species profile becomes useful when it shows what the species does, depends on and connects.",
    issue: "Species are often reduced to rarity, charisma or a single conservation status.",
    whyItMatters: "Losing a species can alter relationships that support habitat, food, water and ecological resilience.",
    approach: "Connect identity, evidence, ecological function, place and pressure without overstating what one record can show.",
    contribution: "4PLANET has an Orca-first public prototype and is building a reusable evidence-controlled species model.",
    livingSystem: ["taxa", "habitat", "food webs", "ecological function", "observations", "threats", "conservation action"],
    opening: ["An animal is never only an animal.", "It is a hunter, prey, traveller, engineer, pollinator, grazer or carrier of life."],
    whatChanges: ["Habitat loss removes relationships.", "Climate shifts timing and range.", "Sparse observations can create false certainty if interpretation is not controlled."],
    whatFourPlanetBuilds: ["A reusable species evidence model.", "Progressive depth from identity to relationships.", "Clear boundaries between source record, observation, interpretation and conservation status."],
    nextMilestone: "Extend the accepted Orca model to a controlled first species set.",
    action: { label: "OPEN SPECIES", href: "/species", capability: "EXPLORE", available: true },
    seoTitle: "SPECIES_ — Life understood through relationships | 4PLANET",
    seoDescription: "Explore species as participants in living systems, with sources, uncertainty and ecological relationships kept visible.",
    sourceNeeds: ["Taxonomic authority", "Conservation status", "Occurrence rights", "Ecological function literature"],
    sources: [
      source("IUCN Red List of Threatened Species", "https://www.iucnredlist.org/"),
      source("GBIF", "https://www.gbif.org/"),
      source("IPBES Global Assessment", "https://www.ipbes.net/global-assessment"),
    ],
    mediaRequirements: ["Rights-cleared species portrait", "Habitat context", "Evidence-linked map"],
    rightsRequirements: ["Taxon and occurrence attribution", "No location exposure for sensitive species", "Media licence"],
  },
  {
    slug: "rewild-land",
    domain: "E4RTH_",
    code: "E4RTH_ / 04",
    name: "RE:WILD_ LAND",
    status: "CONCEPT",
    hero: "Recovery is the return of ecological function.",
    mobileHero: "Recovery is more than green.",
    lead: "A landscape can look natural and still lack water, species, connectivity or resilience.",
    relationship: "Restoration is not the addition of scenery. It is the rebuilding of processes.",
    issue: "Simplified land can lose soil health, water retention, habitat and the species interactions that support recovery.",
    whyItMatters: "Living landscapes reduce erosion, hold water, support biodiversity and create room for adaptation.",
    approach: "Define restoration through baseline, target condition, method, authority and monitoring.",
    contribution: "4PLANET is defining a land restoration standard. No universal area unit or delivery pathway is active.",
    livingSystem: ["soil", "water", "vegetation", "fungi", "insects", "herbivores", "predators", "habitat connectivity"],
    opening: ["A field can become greener without becoming more alive.", "Recovery begins when ecological relationships return."],
    whatChanges: ["Drainage changes water.", "Fragmentation changes movement.", "Missing species change succession and resilience."],
    whatFourPlanetBuilds: ["A baseline-first public restoration model.", "Ecosystem-specific pathways.", "Evidence stages that separate implementation from monitored recovery."],
    nextMilestone: "Select one land ecosystem and geography with a qualified authority and monitoring model.",
    action: { label: "READ THE RECOVERY MODEL", href: "#next", capability: "READ", available: true },
    seoTitle: "RE:WILD_ Land — From intervention to ecological recovery | 4PLANET",
    seoDescription: "Understand what restoration must establish before an area claim can become a recovery claim.",
    sourceNeeds: ["Ecosystem and geography", "Baseline", "Authority", "Monitoring"],
    sources: [
      source("UN Decade — Principles for Ecosystem Restoration", "https://www.decadeonrestoration.org/publications/principles-ecosystem-restoration-guide-united-nations-decade-2021-2030"),
      source("IUCN — Global Standard for Nature-based Solutions", "https://portals.iucn.org/library/node/49070", "METHOD"),
    ],
    mediaRequirements: ["Matched baseline and follow-up", "Landscape process detail", "Field monitoring"],
    rightsRequirements: ["No unmatched before/after", "No area result without boundary", "Local consent"],
  },
  {
    slug: "food",
    domain: "S4PIENS_",
    code: "S4PIENS_ / 01",
    name: "FOOD_",
    status: "CONCEPT",
    hero: "Every meal begins in a living system.",
    mobileHero: "Food begins in life.",
    lead: "Soil, water, pollinators, labour, energy and culture meet before food reaches a plate.",
    relationship: "The food system shapes landscapes, while living landscapes determine what food systems can produce.",
    issue: "Food debates often place responsibility on individual diets while hiding infrastructure, access, production and waste.",
    whyItMatters: "Food connects human health directly to soil, biodiversity, water, climate and economic security.",
    approach: "Make food-system relationships and trade-offs legible without prescribing one universal diet.",
    contribution: "4PLANET is defining the first bounded FOOD_ use case. No programme, partner or public action pathway is active.",
    livingSystem: ["soil", "water", "pollinators", "farms", "labour", "energy", "supply chains", "kitchens", "health"],
    opening: ["A meal can fit on one plate and still contain an entire landscape.", "Its ingredients carry decisions about soil, water, work, transport and waste."],
    whatChanges: ["Soil management changes fertility and water.", "Supply chains shape waste and access.", "Policy and price determine which choices are realistic."],
    whatFourPlanetBuilds: ["A systems-first public explanation.", "A use-case selection framework.", "A future pathway only after the audience, place, data and decision it supports are defined."],
    nextMilestone: "Select one first use case: soil, waste, public food, supply-chain transparency or dietary access.",
    action: { label: "EXPLORE THE SYSTEM", href: "#system", capability: "READ", available: true },
    seoTitle: "FOOD_ — Soil, supply chains and the systems behind a meal | 4PLANET",
    seoDescription: "Explore food as ecological infrastructure and see what 4PLANET must define before a public pathway opens.",
    sourceNeeds: ["Selected use case", "Geography", "Food-system data", "Health and environmental boundaries"],
    sources: [
      source("FAO — The State of Food and Agriculture", "https://www.fao.org/publications/home/fao-flagship-publications/the-state-of-food-and-agriculture/en"),
      source("WHO — Sustainable healthy diets", "https://www.who.int/publications/i/item/9789241516648"),
    ],
    mediaRequirements: ["Soil-to-table sequence", "Infrastructure not lifestyle imagery", "Labour represented with consent"],
    rightsRequirements: ["No health claim beyond source", "No moral labelling of people", "Supply-chain context"],
  },
  {
    slug: "en3rgy",
    domain: "S4PIENS_",
    code: "S4PIENS_ / 02",
    name: "EN3RGY_",
    status: "CONCEPT",
    hero: "Energy is the hidden architecture of modern life.",
    mobileHero: "Energy moves everything.",
    lead: "Homes, transport, food, industry and communication all depend on systems that move power and materials.",
    relationship: "A low-emission technology can still create pressure through land, minerals, water or unequal access.",
    issue: "Energy choices are often presented as simple binaries despite real ecological, material and social trade-offs.",
    whyItMatters: "Energy systems shape emissions, air quality, extraction, land use, security and affordability.",
    approach: "Explain energy choices as systems, with benefits, dependencies and trade-offs visible together.",
    contribution: "4PLANET is defining a public energy-intelligence format. No technology, project or recommendation engine is selected.",
    livingSystem: ["generation", "grids", "materials", "land", "water", "households", "industry", "mobility"],
    opening: ["Energy is almost invisible when it works.", "Its infrastructure appears everywhere once we learn to look."],
    whatChanges: ["Efficiency changes demand.", "Generation changes land and materials.", "Grid design changes reliability and access."],
    whatFourPlanetBuilds: ["A non-binary public explanation layer.", "Place- and technology-specific evidence cards.", "Decision support that keeps uncertainty and trade-offs visible."],
    nextMilestone: "Choose one energy question and one geography for the first public comparison.",
    action: { label: "SEE THE FIRST QUESTION", href: "#next", capability: "READ", available: true },
    seoTitle: "EN3RGY_ — Power, materials and public choices | 4PLANET",
    seoDescription: "Understand energy as a connected system of climate, materials, land, access and reliability.",
    sourceNeeds: ["Selected question", "Technology data", "Geography", "Lifecycle boundary"],
    sources: [
      source("IEA — Energy System", "https://www.iea.org/energy-system"),
      source("IPCC — Mitigation of Climate Change", "https://www.ipcc.ch/report/ar6/wg3/"),
    ],
    mediaRequirements: ["Infrastructure at human scale", "Material supply context", "Grid or flow visualisation"],
    rightsRequirements: ["No technology endorsement", "Lifecycle boundary stated", "No project status inference"],
  },
  {
    slug: "circular-city",
    domain: "S4PIENS_",
    code: "S4PIENS_ / 03",
    name: "CIRCULAR CITY_",
    status: "CONCEPT",
    hero: "A city can become a loop instead of an endpoint.",
    mobileHero: "Cities can close loops.",
    lead: "Materials, water, food, energy and buildings move through cities every day.",
    relationship: "Waste is often a design decision made long before disposal.",
    issue: "Urban systems are commonly organised as linear flows: extract, build, use and discard.",
    whyItMatters: "Cities concentrate both pressure and the capacity to redesign systems at scale.",
    approach: "Reveal material flows and the decisions that can keep value in use longer.",
    contribution: "4PLANET is defining a city-flow interface. No city, material stream or pilot is active.",
    livingSystem: ["buildings", "materials", "water", "food", "energy", "mobility", "repair", "waste"],
    opening: ["A city receives millions of objects and tonnes of material each day.", "Most journeys are designed to end."],
    whatChanges: ["Design determines repair.", "Procurement shapes markets.", "Infrastructure determines whether materials circulate or disappear."],
    whatFourPlanetBuilds: ["A public material-flow story.", "A city/place layer for circular evidence.", "A future pilot only with a named problem owner and measurable loop."],
    nextMilestone: "Select one city and one material flow for the first bounded journey.",
    action: { label: "FOLLOW THE FIRST LOOP", href: "#next", capability: "READ", available: true },
    seoTitle: "CIRCULAR CITY_ — Material flows made visible | 4PLANET",
    seoDescription: "Explore how cities can keep materials, water, food and value in circulation for longer.",
    sourceNeeds: ["City selection", "Material-flow baseline", "Problem owner", "Outcome measure"],
    sources: [
      source("UNEP International Resource Panel", "https://www.resourcepanel.org/"),
      source("UN-Habitat — Circular Economy", "https://unhabitat.org/topic/circular-economy"),
    ],
    mediaRequirements: ["Urban material movement", "Repair/reuse infrastructure", "Flow diagram"],
    rightsRequirements: ["No city performance claim without data", "People and workplace consent", "Boundary stated"],
  },
  {
    slug: "f4shion",
    domain: "S4PIENS_",
    code: "S4PIENS_ / 04",
    name: "F4SHION_",
    status: "CONCEPT",
    hero: "A garment is a map of land, labour and material.",
    mobileHero: "Every garment has a system.",
    lead: "Fibre, chemistry, water, work, transport, use and disposal are stitched into one object.",
    relationship: "Fashion makes environmental systems personal, visible and culturally powerful.",
    issue: "Opaque supply chains can separate the beauty of a product from its material and human consequences.",
    whyItMatters: "Clothing connects biodiversity, climate, pollution, labour, identity and waste.",
    approach: "Trace material and claim journeys without reducing sustainability to one label.",
    contribution: "4PLANET is defining an evidence-led fashion narrative and future collaboration standard. No collection or verified product claim is active.",
    livingSystem: ["fibres", "land", "water", "chemistry", "labour", "manufacturing", "use", "repair", "end of life"],
    opening: ["Clothing sits close to the body and far from the places it comes from.", "F4SHION_ reconnects the object to its system."],
    whatChanges: ["Fibre choice shifts pressure.", "Durability changes use.", "Claims change trust only when evidence follows."],
    whatFourPlanetBuilds: ["A material journey format.", "A collaboration and claims standard.", "Future products only with traceable rights, economics and contribution logic."],
    nextMilestone: "Select one material or product journey and define its evidence boundary.",
    action: { label: "READ THE MATERIAL LOGIC", href: "#next", capability: "READ", available: true },
    seoTitle: "F4SHION_ — Material, labour and the life of clothing | 4PLANET",
    seoDescription: "Trace the systems inside a garment and the evidence required for credible fashion claims.",
    sourceNeeds: ["Material selection", "Supply-chain boundary", "Labour and environmental evidence", "Claims review"],
    sources: [
      source("UNEP — Sustainable and Circular Textiles", "https://www.unep.org/topics/chemicals-and-pollution-action/circularity-sectors/sustainable-and-circular-textiles"),
      source("European Commission — EU Strategy for Sustainable and Circular Textiles", "https://environment.ec.europa.eu/strategy/textiles-strategy_en"),
    ],
    mediaRequirements: ["Fibre and material macro", "Production context", "Repair/use/end-of-life"],
    rightsRequirements: ["Worker consent", "No supply-chain inference from illustrative image", "Claim evidence"],
  },
  {
    slug: "m4gazine",
    domain: "4CULTURE_",
    code: "4CULTURE_ / 01",
    name: "M4GAZINE_",
    status: "IN DEVELOPMENT",
    hero: "A publication for the relationships shaping a living planet.",
    mobileHero: "Stories for a living planet.",
    lead: "Reporting, essays, field notes and visual stories can connect ecological complexity to public life.",
    relationship: "What is not understood rarely stays in public attention for long.",
    issue: "Environmental communication is often split between urgent headlines, specialist reports and lifestyle content.",
    whyItMatters: "A durable public culture needs space for evidence, context, disagreement and imagination.",
    approach: "Build an independent editor-led publication with transparent sources, corrections and contributor roles.",
    contribution: "The editorial architecture and first article system are prepared internally. Publication, editor appointment and release remain gated.",
    livingSystem: ["reporting", "science", "place", "photography", "essays", "public debate", "corrections"],
    opening: ["A living planet needs more than occasional attention.", "It needs a public record that can hold complexity over time."],
    whatChanges: ["Editorial independence changes trust.", "Source discipline changes what can be claimed.", "Continuity changes what an audience can learn."],
    whatFourPlanetBuilds: ["An editor-led magazine architecture.", "Claim and correction sidecars.", "A public home for reporting, essays, field notes and visual work."],
    nextMilestone: "Appoint responsible editor, lock charter, contributors, dummy and publication plan.",
    action: { label: "EXPLORE STORIES", href: "/stories", capability: "EXPLORE", available: true },
    seoTitle: "M4GAZINE_ — Editorial intelligence for a living planet | 4PLANET",
    seoDescription: "Explore the planned 4PLANET publication for evidence, field reporting, essays and visual stories.",
    sourceNeeds: ["Editorial charter", "Responsible editor", "Contributor agreements", "Article-level sources"],
    sources: [],
    mediaRequirements: ["Editorial image system", "Contributor portraits with consent", "Field evidence"],
    rightsRequirements: ["Publication rights", "Caption and credit", "Correction route", "Editorial independence"],
  },
  {
    slug: "4film",
    domain: "4CULTURE_",
    code: "4CULTURE_ / 02",
    name: "4FILM_",
    status: "IN DEVELOPMENT",
    hero: "Film lets a living system unfold in time.",
    mobileHero: "Film makes time visible.",
    lead: "Movement, sound, scale and human presence can reveal relationships that a static page cannot hold.",
    relationship: "A documentary image can create attention, but only context can make it truthful.",
    issue: "Environmental film can slide into catastrophe montage, decontextualised beauty or unsupported emotional claims.",
    whyItMatters: "Film shapes memory and public imagination at a scale few formats can match.",
    approach: "Develop rights-controlled films that begin close to life, widen into systems and keep claims attached to evidence.",
    contribution: "The first brand-film direction and film-intelligence catalogue exist internally. Production and publication remain conditional.",
    livingSystem: ["documentary image", "sound", "archive", "field context", "rights", "claims", "distribution"],
    opening: ["Film can slow attention down long enough for a relationship to appear.", "It can also make a false connection feel true. The standard must hold both power and risk."],
    whatChanges: ["Sequence creates meaning.", "Sound creates emotion.", "Rights and context determine whether a scene may be used."],
    whatFourPlanetBuilds: ["A film catalogue and rights model.", "A controlled first-film production path.", "Claim sheets that travel with every edit."],
    nextMilestone: "Close first-film footage, rights, script, team, financing and publication review.",
    action: { label: "EXPLORE 4FILM", href: "/culture/film", capability: "EXPLORE", available: true },
    seoTitle: "4FILM_ — Documentary stories for a living planet | 4PLANET",
    seoDescription: "Explore the 4PLANET film system, where image, sound, rights and evidence stay connected.",
    sourceNeeds: ["Film-specific claim sheet", "Footage rights", "Subject consent", "Release plan"],
    sources: [],
    mediaRequirements: ["Original documentary footage", "Field sound", "Product shown only in context"],
    rightsRequirements: ["Footage licence", "Music licence", "Subject consent", "Archive provenance"],
  },
  {
    slug: "4rt",
    domain: "4CULTURE_",
    code: "4CULTURE_ / 03",
    name: "4RT_",
    status: "CONCEPT",
    hero: "An image can carry attention — and a transparent contribution.",
    mobileHero: "Art can carry attention.",
    lead: "Photography, illustration and art can make the living world present in homes, public spaces and culture.",
    relationship: "The cultural object, the artist and the ecological contribution must remain connected through clear rights and economics.",
    issue: "Cause-linked art can obscure who owns the work, where money goes and what a contribution actually supports.",
    whyItMatters: "Trust depends on making the creative, commercial and ecological parts visible without reducing art to a fundraising device.",
    approach: "Create a Prints for Planet model with explicit artist rights, edition terms, production impact, pricing and contribution allocation.",
    contribution: "4PLANET is defining the 4RT_ model. No marketplace, edition, artist agreement, price or ecological allocation is active.",
    livingSystem: ["artists", "photography", "illustration", "printing", "materials", "collectors", "contribution allocation", "proof"],
    opening: ["A photograph can keep a place present long after the moment has passed.", "4RT_ asks whether that attention can travel with a clear and honest contribution."],
    whatChanges: ["Rights determine what can be sold.", "Materials and production determine physical footprint.", "Allocation language determines what the buyer is actually supporting."],
    whatFourPlanetBuilds: ["A rights-first artist agreement.", "Transparent price and allocation logic.", "Edition-level contribution records without claiming the artwork itself creates an ecological result."],
    nextMilestone: "Select the first artist/work, production method, agreement, pricing and contribution recipient.",
    action: { label: "READ THE 4RT_ MODEL", href: "#next", capability: "READ", available: true },
    seoTitle: "4RT_ — Prints for Planet, built on rights and transparency | 4PLANET",
    seoDescription: "Explore the proposed 4RT_ model for art, artist rights, production and transparent ecological contributions.",
    sourceNeeds: ["Artist and work selection", "Copyright agreement", "Production method", "Pricing and allocation", "Contribution recipient"],
    sources: [
      source("U.S. Copyright Office — Visual Artists", "https://www.copyright.gov/engage/visual-artists/"),
      source("UK CMA — Green Claims Code", "https://greenclaims.campaign.gov.uk/", "METHOD"),
    ],
    mediaRequirements: ["First work with artist permission", "Material/production detail", "Edition documentation"],
    rightsRequirements: ["Signed artist licence", "Edition and territory", "Reproduction rights", "No impact claim beyond allocated contribution"],
  },
  {
    slug: "4play",
    domain: "4CULTURE_",
    code: "4CULTURE_ / 04",
    name: "4PLAY_",
    status: "CONCEPT",
    hero: "Sound can turn attention into a shared experience.",
    mobileHero: "Sound makes attention collective.",
    lead: "Music, listening sessions, records and live formats can connect people to a place, species or Mission.",
    relationship: "Culture travels through feeling, but every release still depends on rights, collaborators and transparent contribution terms.",
    issue: "Cause-linked music can blur creative ownership, licensing, payment and ecological claims.",
    whyItMatters: "Music creates belonging and repetition — qualities environmental communication often lacks.",
    approach: "Build Mission-linked music formats with artist-first rights and explicit financial allocation.",
    contribution: "4PLANET is defining the 4PLAY_ format. No release, event, catalogue agreement or contribution pathway is active.",
    livingSystem: ["artists", "sound", "recording", "performance", "audiences", "rights", "revenue", "Mission context"],
    opening: ["Some ideas are understood before they can be explained.", "Music can carry the feeling of a place into a room full of people."],
    whatChanges: ["Licensing determines use.", "Curation determines context.", "Revenue terms determine whether contribution language is honest."],
    whatFourPlanetBuilds: ["A Mission-linked music format.", "Artist and rights agreements.", "Transparent revenue and contribution records."],
    nextMilestone: "Select the first format, artists, rights model and Mission connection.",
    action: { label: "EXPLORE 4PLAY", href: "/culture/play", capability: "EXPLORE", available: true },
    seoTitle: "4PLAY_ — Music and listening for a living planet | 4PLANET",
    seoDescription: "Explore the proposed 4PLAY_ system for music, rights, culture and transparent Mission contributions.",
    sourceNeeds: ["Format selection", "Artist agreements", "Music rights", "Contribution terms"],
    sources: [],
    mediaRequirements: ["Artist-approved imagery", "Listening/performance context", "Release artwork rights"],
    rightsRequirements: ["Master and publishing rights", "Performance permissions", "Artist payment", "Contribution wording"],
  },
];

export const MISSION_BY_SLUG = new Map(MISSIONS.map((mission) => [mission.slug, mission]));

export const LEGACY_MISSION_REDIRECTS: Record<string, string> = {
  "4ntarctica": "rewild-marine",
  "rewild": "rewild-land",
  "4telier": "4rt",
  "telier": "4rt",
};

export function getMission(slug: string | undefined): NarrativeMission | undefined {
  if (!slug) return undefined;
  return MISSION_BY_SLUG.get(slug) ?? MISSION_BY_SLUG.get(LEGACY_MISSION_REDIRECTS[slug]);
}

export function getMissionsByDomain(domain: DomainKey): NarrativeMission[] {
  return MISSIONS.filter((mission) => mission.domain === domain);
}

export function domainSlug(domain: DomainKey): string {
  return domain.replace("_", "").toLowerCase();
}

export function displayName(value: string): string {
  return value.replace(/_$/, "");
}
