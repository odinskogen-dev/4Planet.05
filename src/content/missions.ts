// Canonical public content layer — from 4PLANET_DOMAIN_MISSION_CONTENT_PACK_v1.
// Structured data, not hardcoded fragments. No partner names, prices, totals or fake states.

import type { DomainKey } from "@/types/content";

export type MissionStatusLabel =
  | "STRATEGIC CONCEPT" | "PARTNER PATHWAY IN DEVELOPMENT" | "PARTNER VALIDATION PENDING"
  | "UNIT DESIGN IN PROGRESS";

export interface MissionSource { title: string; url: string; confidence: "high" | "medium" | "needs-review"; }

export interface MissionContent {
  slug: string;
  domain: DomainKey;
  code: string;          // "OCE4N_ / 01"
  name: string;          // "WH4LES_"
  hero: string;
  thesis: string;
  issue: string;
  whyItMatters: string;
  livingSystem: string[];
  whatCanHelp: string;
  fourPlanetRole: string;
  currentStatus: MissionStatusLabel;
  impactPathway?: string;     // public unit label
  impactPathwaySlug?: string; // route under /impact/:slug
  publicStatus?: string;      // "PUBLIC SUPPORT CLOSED"
  joinLabel: string;
  visualDirection: string;
  atStake?: string;
  question?: string;           // optional narrative entrance where a question makes the mission clearer (#24)
  sources: MissionSource[];
}

const ls = (s: string) => s.split("·").map((x) => x.trim()).filter(Boolean);

export const MISSION_CONTENT: MissionContent[] = [
  // ───────────── OCE4N_ ─────────────
  {
    slug: "cle4n", domain: "OCE4N_", code: "OCE4N_ / 01", name: "CLE4N_",
    hero: "A cleaner ocean, from source to sea.",
    thesis: "A clean ocean is a systems problem, not only a clean-up problem. It begins with production, consumption, collection, rivers, coastlines and infrastructure — long before waste reaches the water.",
    issue: "Pollution and waste enter marine systems through poorly managed material flows, stormwater, rivers, coastlines, ports and consumer systems. Recovery matters, but prevention and interception matter too.",
    whyItMatters: "Ocean pollution affects species, habitats, coastlines, food systems and public trust in the health of the sea.",
    livingSystem: ls("Rivers · coastlines · marine species · seabirds · fisheries · beaches · waste systems · material flows"),
    whatCanHelp: "Source reduction, better material systems, interception before the sea, coastal recovery, transparent weighing and reporting, local field operations and policy change.",
    fourPlanetRole: "A measurable pathway designed to support one kilogram of marine waste recovery only after an approved delivery partner, measurement method, evidence standard and reporting model are confirmed.",
    currentStatus: "PARTNER PATHWAY IN DEVELOPMENT", impactPathway: "1 KG OCEAN WASTE_", impactPathwaySlug: "ocean-waste",
    publicStatus: "PUBLIC SUPPORT CLOSED", joinLabel: "TRACK CLE4N_",
    visualDirection: "Deep blue, rough coastlines, boats, material close-ups, recovery teams, clean white reporting overlays.",
    sources: [],
  },
  {
    slug: "wh4les", domain: "OCE4N_", code: "OCE4N_ / 02", name: "WH4LES_",
    hero: "Migratory intelligence across the oceans.",
    thesis: "Whales are not isolated animals. They are part of the ocean's living infrastructure — moving through food webs, migration corridors and nutrient cycles across enormous distances.",
    issue: "Shipping, underwater noise, vessel strike, fishing pressure and climate-driven changes in prey distribution can disrupt whale populations and the waters they depend on. Many marine corridors remain difficult to monitor across large distances and jurisdictions.",
    whyItMatters: "Whale protection is not only about a single species. Whale populations are connected to marine food webs, ocean productivity, public imagination and the wider biological systems that keep oceans alive.",
    livingSystem: ls("Cetaceans · migration corridors · prey systems · nutrient cycling · plankton productivity · marine food webs · coastal and ocean governance"),
    whatCanHelp: "Better monitoring, quieter and safer shipping practices, protected routes, reduction of entanglement risk, field research, policy pressure and public understanding.",
    fourPlanetRole: "A public mission domain for whale intelligence, storytelling and credible future partner pathways — connecting ecological understanding, evidence, field documentation and cultural reach.",
    currentStatus: "STRATEGIC CONCEPT", joinLabel: "TRACK WH4LES_",
    visualDirection: "Deep ocean blue, storm seas, sonar lines, hydrophone interfaces, migration traces, whale silhouettes, cinematic documentary gravity.",
    sources: [],
  },
  {
    slug: "cor4l", domain: "OCE4N_", code: "OCE4N_ / 03", name: "COR4L_",
    hero: "Rebuilding reef resilience.",
    thesis: "Coral reefs are living structures: dense ecological systems that support marine life, coastal livelihoods and the integrity of vulnerable shorelines.",
    issue: "Warming water, ocean acidification, pollution, disease and bleaching events place reef systems under severe pressure.",
    whyItMatters: "When reefs weaken, biodiversity, fisheries, coastal protection and local livelihoods can weaken with them. Reef loss is a system failure, not only a visual loss.",
    livingSystem: ls("Coral animals · reef structure · fish nurseries · coastal protection · water quality · fisheries · local communities"),
    whatCanHelp: "Reducing local pressure, protecting reef areas, improving water quality, supporting evidence-led restoration and monitoring, and strengthening public understanding of reef systems.",
    fourPlanetRole: "A mission domain for reef intelligence, restoration pathways and cultural communication that makes reef systems emotionally and scientifically legible.",
    currentStatus: "STRATEGIC CONCEPT", joinLabel: "TRACK COR4L_",
    visualDirection: "Reef macro photography, underwater light, scientific fragments, blue-white overlays, fragile but powerful atmosphere.",
    sources: [],
  },
  {
    slug: "rewild-marine", domain: "OCE4N_", code: "OCE4N_ / 04", name: "RE:WILD_ Marine",
    hero: "Rebuilding the coastal habitats that ocean life depends on.",
    thesis: "Marine rewilding is the long work of returning function to degraded coastal and shallow-sea systems — seagrass meadows, kelp forests, shellfish and oyster beds and the food webs they support.",
    issue: "Coastal and shallow-marine habitats have been lost or simplified through physical damage, pollution, nutrient loading, warming and the removal of key species and natural processes. What remains is often fragmented.",
    whyItMatters: "Recovered marine habitats store carbon, buffer shorelines, filter water, and rebuild the nurseries that fish, birds and mammals depend on. Coastal recovery is some of the most achievable marine restoration there is.",
    livingSystem: ls("Seagrass · kelp · shellfish and oyster beds · fish nurseries · marine mammals · nutrients · currents · habitat connectivity"),
    whatCanHelp: "Protecting and reconnecting coastal habitat, restoring seagrass and kelp, rebuilding shellfish and oyster beds, reducing nutrient and pollution pressure, and monitoring recovery over time with credible partners.",
    fourPlanetRole: "A pathway to support restoration of degraded coastal and marine habitat through approved local models. 4PLANET is not currently delivering marine restoration itself.",
    currentStatus: "STRATEGIC CONCEPT", joinLabel: "TRACK RE:WILD_ Marine",
    visualDirection: "Deep water, kelp and seagrass texture, shellfish reefs, tidal field notes, restraint and marine scale.",
    sources: [],
  },

  // ───────────── E4RTH_ ─────────────
  {
    slug: "clim4te", domain: "E4RTH_", code: "E4RTH_ / 01", name: "CLIM4TE_",
    hero: "From climate concern to visible restoration.",
    thesis: "Climate action becomes easier to understand when it is tied to real places, living systems and specific ecological work.",
    issue: "Climate change is often communicated through abstract targets and distant numbers. People understand the scale of the problem, but struggle to see where meaningful action can begin.",
    whyItMatters: "Forests, soils, wetlands and restored landscapes can contribute to ecological resilience, biodiversity, water regulation and climate stability when restoration is designed for place, species and long-term care.",
    livingSystem: ls("Forests · soils · wetlands · water cycles · biodiversity · carbon cycles · land management · local communities"),
    whatCanHelp: "Protecting intact ecosystems, restoring degraded land, planting appropriate species where planting is ecologically justified, improving soil and wetland health, and monitoring outcomes over time.",
    fourPlanetRole: "Tree Unit — the first operational proof path. It is designed to support one tree through a verified delivery pathway once species, location, cost, capacity, evidence requirements and reporting are confirmed.",
    currentStatus: "PARTNER VALIDATION PENDING", impactPathway: "TREE UNIT_", impactPathwaySlug: "tree-unit",
    publicStatus: "PUBLIC SUPPORT CLOSED", joinLabel: "TRACK CLIM4TE_",
    visualDirection: "Nordic landscapes, seedlings, soil, fog, slow restoration, quiet optimism, no generic green brand treatment.",
    sources: [],
  },
  {
    slug: "am4zonia", domain: "E4RTH_", code: "E4RTH_ / 02", name: "AM4ZONIA_",
    hero: "The rainforest as planetary infrastructure.",
    thesis: "The Amazon is not simply a forest. It is a living climate system, a biodiversity system and a foundation for people far beyond its borders.",
    issue: "Deforestation, fires, extraction, fragmentation and biodiversity loss weaken the ecological relationships that allow rainforest systems to remain intact.",
    whyItMatters: "Rainforest systems influence rainfall, atmospheric moisture, biodiversity, carbon storage and regional climate patterns. Damage to the Amazon affects living systems far beyond the forest itself.",
    livingSystem: ls("Forest canopy · rivers · rainfall · soil · pollinators · seed dispersers · predators · Indigenous communities · regional climate"),
    whatCanHelp: "Stronger protection of intact forest, support for Indigenous and local stewardship, credible conservation finance, restoration where appropriate, better monitoring and public understanding.",
    fourPlanetRole: "A pathway designed to support protection of one square metre of Amazon rainforest through an approved delivery model. The final unit model, allocation method, cost, evidence and reporting standard remain subject to partner agreement.",
    currentStatus: "PARTNER PATHWAY IN DEVELOPMENT", impactPathway: "PROTECT 1 M² OF AMAZON RAINFOREST_", impactPathwaySlug: "amazon-square",
    publicStatus: "PUBLIC SUPPORT CLOSED", joinLabel: "TRACK AM4ZONIA_",
    visualDirection: "Aerial rainforest, river systems, mist, canopy texture, respectful stewardship, ecological cartography, restrained technical green only inside this mission domain.",
    sources: [],
  },
  {
    slug: "species", domain: "E4RTH_", code: "E4RTH_ / 03", name: "SPECIES_",
    hero: "Protecting the relationships that keep ecosystems alive.",
    thesis: "Species are not isolated biological objects. They are participants in food webs, migration cycles, pollination, nutrient flows and ecological balance.",
    issue: "Habitat fragmentation, exploitation, pollution, disease and climate pressure can remove species from ecosystems before the wider consequences are understood.",
    whyItMatters: "Predators, pollinators, grazers, seed dispersers, decomposers and marine mammals all shape the systems around them. When species disappear, ecological relationships can weaken or collapse.",
    livingSystem: ls("Species · ecological functions · ecosystem services · food webs · migration · pollination · seed dispersal · human dependence"),
    whatCanHelp: "Habitat protection, monitoring, field protection, reducing direct pressures, public education, better evidence and targeted conservation action.",
    fourPlanetRole: "A mission domain that connects species intelligence, field protection pathways, public education and cultural storytelling.",
    currentStatus: "STRATEGIC CONCEPT", joinLabel: "TRACK SPECIES_",
    visualDirection: "Technical species drawings, documentary wildlife, tracking maps, field notebooks, elegant science communication.",
    sources: [],
  },
  {
    slug: "rewild-land", domain: "E4RTH_", code: "E4RTH_ / 04", name: "RE:WILD_ Land",
    hero: "Returning damaged landscapes to life.",
    thesis: "Rewilding is not decoration. It is the long work of rebuilding ecological function in damaged or simplified landscapes.",
    issue: "Land can lose complexity through fragmentation, intensive use, drainage, pollution, erosion and the removal of species and natural processes.",
    whyItMatters: "Healthy landscapes hold water, support biodiversity, create habitat, reduce erosion and provide resilience against disturbance.",
    livingSystem: ls("Soil · vegetation · insects · fungi · wetlands · herbivores · predators · water · habitat connectivity"),
    whatCanHelp: "Protecting and reconnecting habitats, restoring wetlands, allowing natural regeneration, reintroducing ecological processes where appropriate, and monitoring recovery over time.",
    fourPlanetRole: "A pathway designed to support restoration of one square metre of degraded habitat through an approved local model.",
    currentStatus: "PARTNER PATHWAY IN DEVELOPMENT", impactPathway: "1 M² HABITAT RECOVERY_", impactPathwaySlug: "habitat-recovery",
    publicStatus: "PUBLIC SUPPORT CLOSED", joinLabel: "TRACK RE:WILD_",
    visualDirection: "Soil textures, wild grass, topographic markers, restoration field notes, long-term ecological atmosphere.",
    sources: [],
  },

  // ───────────── S4PIENS_ ─────────────
  {
    slug: "food", domain: "S4PIENS_", code: "S4PIENS_ / 01", name: "FOOD_",
    question: "How can we feed a growing population without destroying the living systems food depends on?",
    hero: "Food is ecological infrastructure.",
    thesis: "Every meal connects land, water, soil, biodiversity, labour, energy, culture and health.",
    issue: "Food systems can place large pressure on land, water, climate and biodiversity while making lower-impact choices difficult to understand or access.",
    whyItMatters: "Food is one of the most direct ways human systems shape living systems. Better food systems can strengthen soil, biodiversity, resilience and public health together.",
    livingSystem: ls("Soil · pollinators · farms · water · nutrient cycles · land use · supply chains · kitchens · communities"),
    whatCanHelp: "Regenerative and agroecological practices, improved soil health, reduced waste, more transparent supply chains, lower-impact diets and local systems designed for resilience.",
    fourPlanetRole: "A mission domain for food-system intelligence, practical partnerships and cultural communication around the systems that feed people and shape landscapes.",
    currentStatus: "STRATEGIC CONCEPT", joinLabel: "TRACK FOOD_",
    visualDirection: "Soil, farms, ingredients, kitchens, land-use maps, editorial food systems rather than lifestyle food photography.",
    sources: [],
  },
  {
    slug: "en4rgy", domain: "S4PIENS_", code: "S4PIENS_ / 02", name: "EN4RGY_",
    hero: "Energy shapes every other system.",
    thesis: "Energy is not only a technical sector. It is the infrastructure behind homes, transport, industry, food, communication and public life.",
    issue: "Energy decisions are often communicated as simple binaries, even though they involve trade-offs across ecosystems, materials, cost, access, reliability and justice.",
    whyItMatters: "Energy systems influence emissions, extraction, land use, air quality, economic security and the capacity of societies to transition.",
    livingSystem: ls("Energy infrastructure · materials · land use · water · grids · households · industry · mobility · public policy"),
    whatCanHelp: "Energy efficiency, demand reduction, clean generation, better grids, responsible material use, accessible public understanding and transition models that account for people and ecosystems.",
    fourPlanetRole: "A mission domain for energy intelligence and public explanation — making complex system choices more legible without reducing them to slogans.",
    currentStatus: "STRATEGIC CONCEPT", joinLabel: "TRACK EN4RGY_",
    visualDirection: "Infrastructure, grids, geothermal, hydro, solar, materials, architecture, technical diagrams and restrained system photography.",
    sources: [],
  },
  {
    slug: "circular-city", domain: "S4PIENS_", code: "S4PIENS_ / 03", name: "CIRCULAR CITY_",
    question: "Can a city become a loop — where resources keep circulating instead of becoming waste?",
    hero: "Cities can become loops, not endpoints.",
    thesis: "Cities concentrate people, materials, energy, food, waste and knowledge. They can either accelerate extraction or become places where resources circulate longer and more intelligently.",
    issue: "Urban systems often treat materials, food, water and energy as linear flows: take, use, discard.",
    whyItMatters: "The way cities are designed affects emissions, resource use, health, access, public space and the ecological pressure exported beyond city boundaries.",
    livingSystem: ls("Buildings · mobility · food · water · energy · waste · public space · material flows · local ecosystems"),
    whatCanHelp: "Reuse systems, repair, local material loops, circular construction, shared infrastructure, better waste prevention and urban nature integrated into planning.",
    fourPlanetRole: "A mission domain for circular urban systems, visible pilots, public understanding and future city-based partnerships.",
    currentStatus: "STRATEGIC CONCEPT", joinLabel: "TRACK CIRCULAR CITY_",
    visualDirection: "Urban grids, material archives, infrastructure diagrams, architecture, repair details, public-space systems.",
    sources: [],
  },
  {
    slug: "f4shion", domain: "S4PIENS_", code: "S4PIENS_ / 04", name: "F4SHION_",
    hero: "Make fewer things matter more.",
    thesis: "Fashion is a material system, a cultural language and a public expression of how value, identity and consumption are organised.",
    issue: "High volumes, short product cycles, unclear supply chains and disposal culture can create environmental and social pressure across fibres, water, chemicals, labour and waste.",
    whyItMatters: "Fashion reaches public culture directly. It can normalise speed and disposability, or it can make longevity, repair, reuse and material intelligence desirable.",
    livingSystem: ls("Fibres · water · soil · dyes · labour · supply chains · garments · repair · reuse · cultural value"),
    whatCanHelp: "Better materials, longer use, repair, resale, smaller batches, circular design, transparent production and a cultural shift away from disposability.",
    fourPlanetRole: "A mission domain for material intelligence, circular fashion, small-scale proof projects and cultural formats that make lower-impact choices more desirable.",
    currentStatus: "STRATEGIC CONCEPT", joinLabel: "TRACK F4SHION_",
    visualDirection: "Material swatches, repair detail, garment architecture, studio light, restrained editorial fashion, no generic eco-fashion imagery.",
    sources: [],
  },

  // ───────────── 4CULTURE_ ─────────────
  {
    slug: "m4gazine", domain: "4CULTURE_", code: "4CULTURE_ / 01", name: "M4GAZINE_",
    hero: "Field intelligence for a living planet.",
    thesis: "Facts matter. But facts without attention, context and emotional relevance often fail to enter public life.",
    issue: "Ecological work can remain fragmented, technical or invisible when it lacks a strong narrative layer.",
    whyItMatters: "Journalism, essays, photography, field notes and editorial systems can make complex ecological reality understandable, memorable and culturally present.",
    livingSystem: ls("Reporting · field documentation · science communication · public attention · culture · learning · participation"),
    whatCanHelp: "Rigorous editorial work, source-based storytelling, field reporting, visual essays and formats that connect ecological systems to daily life.",
    fourPlanetRole: "The editorial engine of 4Planet — mission notes, field intelligence, essays, reports and public storytelling across the system.",
    currentStatus: "STRATEGIC CONCEPT", impactPathway: "Not an Impact Unit. A cultural mission.", joinLabel: "TRACK M4GAZINE_",
    visualDirection: "Editorial layouts, field notes, documentary photography, technical captions, printed matter, precise typography.",
    sources: [],
  },
  {
    slug: "4film", domain: "4CULTURE_", code: "4CULTURE_ / 02", name: "4FILM_",
    hero: "Documentary storytelling for living systems.",
    thesis: "Some ecological realities need more than explanation. They need image, sound, time, human presence and cinematic force.",
    issue: "Many ecological stories fail to reach people because they are communicated without enough emotional depth, cultural relevance or visual precision.",
    whyItMatters: "Film can make complex systems visible, memorable and emotionally intelligible without simplifying them into slogans.",
    livingSystem: ls("Documentary · fieldwork · science · sound · place · species · public attention · cultural memory"),
    whatCanHelp: "Long-form and short-form documentary, field-based storytelling, collaboration with researchers and local communities, and distribution that connects audiences back to credible action.",
    fourPlanetRole: "A film pathway for documentaries about whales, forests, species, field partners, cultural change and ecological restoration.",
    currentStatus: "STRATEGIC CONCEPT", impactPathway: "Not an Impact Unit. A cultural mission.", joinLabel: "TRACK 4FILM_",
    visualDirection: "Cinematic documentary, Nordic ocean, field footage, black-blue atmosphere, restrained typography, high emotional gravity.",
    sources: [],
  },
  {
    slug: "4rt", domain: "4CULTURE_", code: "4CULTURE_ / 03", name: "4RT_",
    hero: "Prints for Planet — art that carries the mission.",
    thesis: "4RT_ is Prints for Planet: limited-edition art, photography and illustration where each edition carries a transparent split between the artist, production and 4PLANET, and routes a defined contribution toward a mission or a verified Impact pathway.",
    issue: "Ecological attention fades when it has no lasting form. Art can hold it — but only if the money behind a print is honest about who is paid and what, if anything, reaches the ground.",
    whyItMatters: "Prints and editions can create durable cultural memory and a clear, auditable route from a purchase to a mission — without overstating what has actually been delivered.",
    livingSystem: ls("Artists · photographers · illustrators · designers · print production · editions · rights · mission funding · public imagination"),
    whatCanHelp: "Limited editions with a stated artist share, production share and 4PLANET share; clear edition and rights state; and a defined mission or verified Impact-pathway contribution — never an implied ecological outcome.",
    fourPlanetRole: "A cultural studio and print pathway (Prints for Planet) connecting artists, editions and mission storytelling through shared 4Planet infrastructure. No active store, no completed sales and no transferred Impact funds exist yet.",
    currentStatus: "STRATEGIC CONCEPT", impactPathway: "Not an Impact Unit. A cultural mission.", joinLabel: "TRACK 4RT_",
    visualDirection: "Gallery architecture, print editions, paper and ink, restrained object photography, white space and exact alignment.",
    sources: [],
  },
  {
    slug: "4play", domain: "4CULTURE_", code: "4CULTURE_ / 04", name: "4PLAY_",
    hero: "Bring the living world into culture.",
    thesis: "Participation becomes stronger when ecological work enters the places where people already gather, listen, create and belong.",
    issue: "Environmental work can remain separate from public culture, even when the audiences needed for change are already present in music, art, fashion and social life.",
    whyItMatters: "Events and cultural formats can turn attention into participation, make missions socially visible and create routes into ecological action that do not begin with guilt or abstraction.",
    livingSystem: ls("Music · events · communities · artists · venues · public participation · cultural networks · mission visibility"),
    whatCanHelp: "Thoughtful cultural programming, mission-linked events, artist participation, low-overhead formats and transparent pathways from attention to support.",
    fourPlanetRole: "A lightweight cultural activation layer powered through existing networks and platforms before it becomes a larger operating track.",
    currentStatus: "STRATEGIC CONCEPT", impactPathway: "Not an Impact Unit. A cultural mission.", joinLabel: "TRACK 4PLAY_",
    visualDirection: "Sound systems, venues, posters, field recordings, nightlife minimalism, editorial black-white-blue compositions.",
    sources: [],
  },
];


const AT_STAKE: Record<string, string> = {
  "wh4les": "If whale populations decline, the ocean loses navigators of its food webs and nutrient cycles — and a species that moves the public to care.",
  "cor4l": "Lose reef structure and the nurseries, coastal protection and livelihoods built on it weaken together.",
  "cle4n": "Every uncollected flow of waste compounds downstream — in species, coastlines and public trust in the sea.",
  "rewild-marine": "Recovered seagrass, kelp and shellfish beds rebuild the food webs and carbon stores coastal life depends on.",
  "clim4te": "Without restoration tied to real places, climate concern stays abstract and meaningful action stays delayed.",
  "am4zonia": "Past a threshold of forest loss, rainforest systems can shift toward drier, simpler and less recoverable states.",
  "species": "Remove key species and the relationships holding an ecosystem together can quietly weaken or fail.",
  "rewild-land": "Simplified landscapes hold less water, less life and less resilience against the next disturbance.",
  "food": "How we farm and eat shapes the fate of soil, water and biodiversity at landscape scale.",
  "en4rgy": "Energy choices lock in decades of emissions, extraction and land use — for better or worse.",
  "circular-city": "Linear cities export their pressure outward; the design choices made now compound for generations.",
  "f4shion": "A culture of disposability normalises waste; a culture of longevity makes the opposite desirable.",
  "m4gazine": "Without a narrative layer, ecological work stays invisible to the people who could carry it forward.",
  "4film": "Stories that never reach people cannot move them; attention is the scarce resource.",
  "4rt": "Art and prints carry ecological attention into daily life, and route support back to missions.",
  "4play": "If ecological action stays separate from culture, it never reaches the rooms where change spreads.",
};
MISSION_CONTENT.forEach((m) => { m.atStake = AT_STAKE[m.slug]; });

export const findMissionContent = (slug: string) => MISSION_CONTENT.find((m) => m.slug === slug) || null;

export const MISSIONS = MISSION_CONTENT;
export const findMission = findMissionContent;
