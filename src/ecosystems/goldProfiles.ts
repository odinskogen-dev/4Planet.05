import type { EcosystemProfile } from "@/ecosystems/types";

const source = (authority: string, label: string, href: string, establishes: string, limitation: string) => ({ authority, label, href, establishes, limitation });

export const BAY_OF_BISCAY_GOLD: EcosystemProfile = {
  id: "ecosystem:bay-of-biscay:gold-01",
  slug: "bay-of-biscay",
  name: "BAY OF BISCAY",
  eyebrow: "ECOSYSTEM_ · OCE4N_",
  maturity: "GOLD_REFERENCE",
  lead: "A living marine system where ocean conditions, food webs, cetaceans and human activity meet.",
  body: "The Bay of Biscay is used here as a regional marine-system entry, not one uniform ecological unit. The experience connects species, ocean conditions, survey effort, pressures and actors while keeping observation, effort and inference separate.",
  accent: "#5BC7F0",
  background: "#02070A",
  hero: {
    src: "/assets/missions/wh4les/hero-real.jpg",
    srcMobile: "/assets/missions/wh4les/hero-real-mobile.jpg",
    alt: "Marine context for the Bay of Biscay ecosystem journey",
    objectPosition: "50% 50%",
  },
  geographyNote: "Bay of Biscay is a regional narrative focus for the England–Spain survey context discussed with ORCA. Survey routes, ecological boundaries and source coverage are separate geometries. A pilot corridor is not an Orca migration track.",
  centreLabel: "BISCAY",
  nodes: [
    { id: "cetaceans", label: "CETACEANS", kicker: "LIFE", detail: "Whales, dolphins and porpoises are entry points into observation records, habitat, food webs and monitoring effort. Records are not live animal positions.", kind: "SPECIES", x: 50, y: 8, href: "/species/orca", relation: "LIVES WITHIN" },
    { id: "prey", label: "PREY WEB", kicker: "RELATIONSHIP", detail: "Cetaceans depend on wider food webs. Prey relationships must remain source-backed rather than decorative food-chain claims.", kind: "FUNCTION", x: 82, y: 24, relation: "SUPPORTS" },
    { id: "conditions", label: "OCEAN", kicker: "CONDITION", detail: "Bathymetry, temperature, oxygen and other marine conditions provide context. Each variable keeps its own source, scale and time semantics.", kind: "HABITAT", x: 90, y: 62, href: "/atlas?journey=bay-of-biscay", relation: "CONDITIONS" },
    { id: "vessels", label: "VESSELS", kicker: "HUMAN SYSTEM", detail: "Shipping and ferry traffic share the same space. Vessel presence can create both monitoring opportunity and pressure, but co-location alone does not prove ecological harm.", kind: "HUMAN", x: 68, y: 90, relation: "SHARES SPACE" },
    { id: "pressure", label: "PRESSURE", kicker: "CHANGE", detail: "Noise, vessel interaction, fishing and climate-related change are distinct pressure classes. Effects require species-, exposure-, place- and evidence-specific qualification.", kind: "PRESSURE", x: 31, y: 90, relation: "CAN ALTER" },
    { id: "effort", label: "SURVEY EFFORT", kicker: "EVIDENCE", detail: "Route, hours, distance, conditions and method explain where observers looked. Effort must travel with observations before distribution or change is interpreted.", kind: "EVIDENCE", x: 10, y: 62, relation: "MAKES VISIBLE" },
    { id: "actors", label: "ACTORS", kicker: "RESPONSE", detail: "NGOs, observers, researchers, operators and public institutions can hold different roles. Actor presence never implies a 4PLANET partnership or outcome.", kind: "ACTOR", x: 18, y: 24, href: "/actors", relation: "RESPONDS" },
  ],
  chapters: [
    { id: "meet", number: "01", kicker: "MEET THE SYSTEM", title: "An ocean region made legible through relationships.", body: "The useful question is not only where the Bay is, but how life, conditions, monitoring effort and human activity overlap through space and time." },
    { id: "life", number: "02", kicker: "LIFE", title: "Meet the animal. Then inspect the system around it.", body: "Orca and other cetaceans become gateways into observations, habitats, prey, pressures and uncertainty without pretending one species represents the entire region." },
    { id: "function", number: "03", kicker: "HOW IT WORKS", title: "Depth, water and food webs shape what is possible.", body: "Multiple environmental and biological signals can be viewed together, but they must not be collapsed into one health score or causal claim." },
    { id: "human", number: "04", kicker: "WHY IT MATTERS TO US", title: "We use the same ocean we are trying to understand.", body: "Transport, fisheries, coastal economies, science and stewardship are inside the system rather than outside the nature story." },
    { id: "pressure", number: "05", kicker: "MONITORING + PRESSURE", title: "Seeing more clearly starts with knowing where we looked.", body: "Survey effort is first-class evidence context. Sightings without effort cannot safely carry the same interpretation as systematic observations with known coverage." },
    { id: "response", number: "06", kicker: "ACTORS + ACTION", title: "Monitoring becomes useful when it reaches people and decisions.", body: "The actor layer connects roles, evidence and geography while keeping partnership, delivery and outcome claims fail-closed." },
  ],
  species: [
    { label: "Orca", href: "/species/orca", meta: "FLAGSHIP JOURNEY" },
    { label: "Sperm whale", href: "/species/sperm-whale", meta: "DEEP-OCEAN CONTEXT" },
    { label: "Humpback whale", href: "/species/humpback-whale", meta: "CETACEAN CONTEXT" },
  ],
  actors: [
    { label: "ORCA", href: "/actors/orca", meta: "MONITORING / SCIENCE ACTOR" },
    { label: "WH4LES_", href: "/missions/wh4les", meta: "MISSION CONTEXT" },
  ],
  sources: [
    source("OBIS", "Marine species observations", "https://obis.org/", "Marine occurrence records where available.", "Occurrence is not live position, abundance or migration."),
    source("GBIF", "Biodiversity occurrence records", "https://www.gbif.org/", "Taxon identity and occurrence records from contributing datasets.", "Record density reflects sampling and data availability as well as biodiversity."),
    source("EMODnet", "Marine spatial context", "https://emodnet.ec.europa.eu/", "European marine products including bathymetry and environmental context.", "Coverage, resolution, date and semantics vary by product."),
  ],
  primaryActions: [
    { label: "MEET THE ORCA", href: "/journey/orca/" },
    { label: "OPEN IN ATLAS", href: "/atlas?journey=bay-of-biscay" },
    { label: "SEE THE ACTORS", href: "/actors" },
  ],
};

export const AMAZONIA_GOLD: EcosystemProfile = {
  id: "ecosystem:amazonia:gold-01",
  slug: "amazonia",
  name: "AMAZONIA",
  eyebrow: "ECOSYSTEM_ · E4RTH_",
  maturity: "GOLD_REFERENCE",
  lead: "A region made of relationships, not one uniform ecosystem.",
  body: "Amazonia connects water, climate, soils, forests, species and people across many scales. This is a doorway into those relationships — not a claim that one map, metric or story represents the whole region.",
  accent: "#45D879",
  background: "#020603",
  hero: {
    src: "/assets/missions/am4zonia/hero.jpg",
    srcMobile: "/assets/missions/am4zonia/hero-mobile.jpg",
    alt: "Amazon rainforest canopy",
    objectPosition: "center 48%",
  },
  geographyNote: "Basin, biome, forest-cover and political boundaries differ by dataset and question. Place-specific claims require place-specific evidence.",
  centreLabel: "AMAZONIA",
  nodes: [
    { id: "water", label: "WATER", kicker: "FUNCTION", detail: "Vegetation, rivers, rainfall and atmospheric moisture are coupled across the region. Water is both condition and connector.", kind: "FUNCTION", x: 50, y: 8, relation: "CONNECTS" },
    { id: "forest", label: "FOREST", kicker: "HABITAT", detail: "Forest structure creates habitat and shapes local and regional conditions. Amazonia contains many forest types, not one homogeneous canopy.", kind: "HABITAT", x: 82, y: 24, relation: "SUPPORTS" },
    { id: "jaguar", label: "JAGUAR", kicker: "SPECIES", detail: "The jaguar is an entry point into prey, habitat continuity, observations and pressure. A species opens the wider system rather than standing alone.", kind: "SPECIES", x: 90, y: 62, href: "/species/jaguar", relation: "LIVES WITHIN" },
    { id: "people", label: "PEOPLE", kicker: "HUMAN SYSTEM", detail: "Human livelihoods, cultures, governance, infrastructure and economies are part of the wider Amazon system, not external to it.", kind: "HUMAN", x: 68, y: 90, relation: "DEPENDS + SHAPES" },
    { id: "pressure", label: "PRESSURE", kicker: "CHANGE", detail: "Land-use change, fragmentation, fire, extraction, infrastructure, warming and drying can interact. Importance remains place-, period- and source-specific.", kind: "PRESSURE", x: 31, y: 90, relation: "ALTERS" },
    { id: "responses", label: "RESPONSES", kicker: "SOLUTION", detail: "Protection, stewardship, restoration, monitoring, policy and production change are response classes. A response is not an outcome without delivery and evidence.", kind: "SOLUTION", x: 10, y: 62, href: "/missions/am4zonia", relation: "CAN CHANGE" },
    { id: "evidence", label: "EVIDENCE", kicker: "SOURCE", detail: "Earth observation, biodiversity records, hydrology, climate data and field research reveal different parts of the system. No single source establishes the whole story.", kind: "EVIDENCE", x: 18, y: 24, href: "/atlas?journey=amazonia", relation: "MAKES VISIBLE" },
  ],
  chapters: [
    { id: "meet", number: "01", kicker: "MEET THE SYSTEM", title: "A region made of relationships.", body: "The useful question is what moves through Amazonia, what depends on what, and how changes propagate across linked living and human systems." },
    { id: "life", number: "02", kicker: "LIFE", title: "Enter through a species. Keep going.", body: "A jaguar, river dolphin, tree, fungus or pollinator can each open a different path into habitat, food, movement, ecological function and pressure." },
    { id: "function", number: "03", kicker: "FUNCTION", title: "Water, habitat and climate connect the whole.", body: "Ecosystem functions are represented as relationships to explore, with scale and uncertainty preserved rather than flattened into decorative facts." },
    { id: "human", number: "04", kicker: "WHY IT MATTERS TO US", title: "Humans are inside the dependency graph.", body: "Climate, water, food systems, economies and cultures connect human wellbeing to functioning living systems." },
    { id: "pressure", number: "05", kicker: "CHANGE", title: "Pressure is a pattern, not one score.", body: "Forest loss, fire, roads, mining, warming and drying may overlap, but remain separate source-backed signals until evidence supports stronger interpretation." },
    { id: "response", number: "06", kicker: "ACTORS + SOLUTIONS", title: "Who is changing the system — and how?", body: "The next layer links stewardship, science, public institutions, NGOs, companies and capital to specific places, interventions and evidence." },
  ],
  species: [
    { label: "Jaguar", href: "/species/jaguar", meta: "FLAGSHIP SPECIES" },
    { label: "Hyacinth macaw", href: "/species/hyacinth-macaw", meta: "REGIONAL CONTEXT" },
  ],
  actors: [
    { label: "Actor intelligence", href: "/actors", meta: "WHO SHAPES THE SYSTEM" },
    { label: "AM4ZONIA_", href: "/missions/am4zonia", meta: "MISSION CONTEXT" },
  ],
  sources: [
    source("NASA Earth Observatory", "Amazon mapping", "https://science.nasa.gov/earth/earth-observatory/mapping-the-amazon-145649/", "Regional Earth-observation and mapping context.", "Regional overview does not establish one condition for the whole Amazon."),
    source("NASA Earth Observatory", "Vegetation–atmosphere interaction", "https://science.nasa.gov/earth/earth-observatory/the-amazon-makes-its-own-wet-season-91161/", "Research context on vegetation and seasonal moisture.", "Mechanisms and effects vary across space, time and study design."),
    source("NASA Earth Observatory", "Atmospheric drying", "https://science.nasa.gov/earth/earth-observatory/human-activities-are-drying-out-the-amazon-145834/", "Research-based context on atmospheric drying and human influence.", "Does not establish one local cause or uniform regional condition."),
  ],
  primaryActions: [
    { label: "MEET THE JAGUAR", href: "/species/jaguar" },
    { label: "OPEN IN ATLAS", href: "/atlas?journey=amazonia" },
    { label: "AM4ZONIA_", href: "/missions/am4zonia" },
  ],
};

export const OSLOFJORD_TRANSFER: EcosystemProfile = {
  id: "ecosystem:oslofjord:transfer-01",
  slug: "oslofjord",
  name: "OSLOFJORD",
  eyebrow: "ECOSYSTEM_ · OCE4N_ · TRANSFER 01",
  maturity: "TRANSFER_CANDIDATE",
  lead: "A fjord where ecological condition, human use, monitoring and public decisions meet at human scale.",
  body: "Oslofjord is the third transfer case for the shared ecosystem grammar. It tests whether the same system can move from open ocean and rainforest to a heavily used coastal place without pretending the places are ecologically equivalent.",
  accent: "#7ED9F6",
  background: "#041013",
  geographyNote: "This surface is a transfer candidate, not a complete condition assessment. Fjord segments, monitoring stations, administrative boundaries and ecological indicators are different objects and must remain distinct.",
  centreLabel: "OSLOFJORD",
  nodes: [
    { id: "habitat", label: "HABITATS", kicker: "PLACE", detail: "Shallow coastal habitat, deeper basins and shoreline systems form different ecological contexts. Habitat condition must be attached to the relevant geography and evidence.", kind: "HABITAT", x: 50, y: 8, relation: "SUPPORTS" },
    { id: "life", label: "MARINE LIFE", kicker: "LIFE", detail: "Fish, seabirds, invertebrates, algae and other organisms connect the fjord to food webs and habitat condition. Observation does not equal abundance or trend.", kind: "SPECIES", x: 82, y: 24, relation: "LIVES WITHIN" },
    { id: "water", label: "WATER", kicker: "CONDITION", detail: "Nutrients, oxygen, temperature and water exchange are separate evidence layers with their own scales, methods and time ranges.", kind: "FUNCTION", x: 90, y: 62, href: "/atlas?journey=oslofjord", relation: "CONDITIONS" },
    { id: "people", label: "PEOPLE", kicker: "HUMAN SYSTEM", detail: "Cities, recreation, boating, fisheries, wastewater, industry and coastal development share the fjord. Human activity belongs inside the system map.", kind: "HUMAN", x: 68, y: 90, relation: "USES + SHAPES" },
    { id: "pressure", label: "PRESSURES", kicker: "CHANGE", detail: "Nutrient loading, habitat alteration, pollution, harvesting and climate-related change are different pressure classes. No single pressure score is implied.", kind: "PRESSURE", x: 31, y: 90, relation: "CAN ALTER" },
    { id: "decisions", label: "DECISIONS", kicker: "RESPONSE", detail: "Public measures, monitoring, restoration, infrastructure and behaviour change can be linked to specific actors and evidence without treating action as proven ecological outcome.", kind: "SOLUTION", x: 10, y: 62, relation: "CAN CHANGE" },
    { id: "evidence", label: "EVIDENCE", kicker: "MONITORING", detail: "Monitoring programmes, research, public datasets and local observations reveal different parts of the fjord. Source coverage and uncertainty must remain visible.", kind: "EVIDENCE", x: 18, y: 24, href: "/atlas?journey=oslofjord", relation: "MAKES VISIBLE" },
  ],
  chapters: [
    { id: "meet", number: "01", kicker: "MEET THE SYSTEM", title: "A living place under shared use.", body: "Oslofjord makes the ecosystem grammar tangible: people can see the place, understand pressures and connect evidence to decisions without losing ecological complexity." },
    { id: "life", number: "02", kicker: "LIFE", title: "Species tell part of the story, not all of it.", body: "Living records should connect to habitats and conditions while preserving the difference between an observation, a population estimate and a trend." },
    { id: "function", number: "03", kicker: "CONDITION", title: "Water and habitat turn place into a system.", body: "Oxygen, nutrients, temperature, bathymetry and habitat condition belong as distinct time-aware layers rather than one synthetic health signal." },
    { id: "human", number: "04", kicker: "WHY IT MATTERS TO US", title: "The fjord is ecological infrastructure and lived place.", body: "Recreation, food, culture, transport, urban development and public management all depend on or shape the same coastal system." },
    { id: "pressure", number: "05", kicker: "PRESSURES", title: "Different problems require different evidence.", body: "Nutrients, pollution, habitat loss, harvesting and climate pressures can interact, but interpretation must remain specific to source, geography and period." },
    { id: "response", number: "06", kicker: "ACTORS + DECISIONS", title: "Close the loop from signal to public choice.", body: "The strongest Oslofjord proof will connect monitoring and research to actors, measures, public decisions and subsequent evidence without claiming action equals outcome." },
  ],
  species: [
    { label: "Open SPECIES_", href: "/species", meta: "SOURCE-AWARE LIFE ENTRY" },
  ],
  actors: [
    { label: "Actor intelligence", href: "/actors", meta: "PUBLIC / SCIENCE / FIELD / CAPITAL" },
    { label: "OCE4N_", href: "/domains/oce4n", meta: "DOMAIN CONTEXT" },
  ],
  sources: [
    source("Miljødirektoratet", "Oslofjord public environmental context", "https://www.miljodirektoratet.no/", "Public environmental authority and programme context relevant to the fjord.", "Authority-level entry only here; indicator-specific claims require exact source records."),
    source("Havforskningsinstituttet", "Marine research context", "https://www.hi.no/", "Marine research and monitoring context relevant to Norwegian coastal waters.", "Research context is not itself a current fjord-wide condition claim."),
  ],
  primaryActions: [
    { label: "OPEN IN ATLAS", href: "/atlas?journey=oslofjord" },
    { label: "SEE SPECIES", href: "/species" },
    { label: "SEE ACTORS", href: "/actors" },
  ],
};

export const ECOSYSTEM_GOLD_PROFILES: Record<string, EcosystemProfile> = {
  "bay-of-biscay": BAY_OF_BISCAY_GOLD,
  amazonia: AMAZONIA_GOLD,
  "amazon-rainforest": AMAZONIA_GOLD,
  oslofjord: OSLOFJORD_TRANSFER,
  oslofjorden: OSLOFJORD_TRANSFER,
};