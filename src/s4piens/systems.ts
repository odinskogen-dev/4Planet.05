/**
 * S4PIENS — Human Systems model.
 *
 * A reusable grammar for any human system:
 *   NEED → INPUTS → PRODUCTION → PROCESSING → TRADE & TRANSPORT → USE → END OF LIFE
 * plus the 4PLANET chain: PLACE → LIVING SYSTEMS → PRESSURES → PROBLEMS → SOLUTIONS.
 *
 * Not a new truth store. Station text is 4PLANET CONTEXT (editorial explanation of
 * how a system works), visibly labelled as such. Pressures, living systems and
 * solutions are read from the SHARED registry (src/planet/livingSystems.ts).
 * Quantities come only from source adapters (Climate TRACE, WDI via 4NATION).
 */
import { humanSystemId, pressureId, solutionId, systemId } from "@/planet/ids";

export type SystemStatus = "GOLD" | "PROOF" | "NEXT";
export type StationKind = "NEED" | "INPUTS" | "PRODUCTION" | "PROCESSING" | "MOVEMENT" | "USE" | "END";

export interface Station {
  id: string;
  kind: StationKind;
  label: string;
  /** The one question this step answers. */
  question: string;
  body: string;
  /** Concrete parts of this step — nouns a person recognises. */
  parts: string[];
  /** Existing ATLAS layer keys where this step becomes physical (optional). */
  atlas?: { layers: string[]; caption: string };
  /** Honest notice for data we intentionally do not show yet. */
  held?: string;
}

export interface Problem {
  id: string;
  title: string;
  /** Shared pressure this problem expresses. */
  pressureId: string;
  definition: string;
  where: string;
  drivers: string[];
  uncertainty: string;
  /** Which station(s) it arises in. */
  stations: string[];
}

export interface HumanSystem {
  id: string;
  slug: string;
  name: string;
  short: string;
  status: SystemStatus;
  need: string;
  /** The sentence that opens the system. */
  thesis: string;
  stations: Station[];
  livingSystemIds: string[];
  problems: Problem[];
  /** Curated solution families from the shared registry (ids). */
  solutionIds: string[];
  /** Climate TRACE sectors used for the country lens (bounded, server proxy). */
  traceSectors?: { label: string; sectors: string }[];
  example?: { title: string; steps: string[] };
  mission?: string;
}

export const SYSTEMS: HumanSystem[] = [
  {
    id: humanSystemId("food-system"),
    slug: "food",
    name: "Food",
    short: "FOOD",
    status: "GOLD",
    mission: "FOOD_",
    need: "Energy and nutrients, every day, for every person.",
    thesis: "Every meal is the last step of a chain that runs through soil, water, seed, fuel, weather and the work of many people — usually across several countries.",
    example: { title: "One loaf of bread", steps: ["Seed + fertiliser + rain", "Wheat field", "Grain store", "Mill", "Bakery", "Shop", "Kitchen", "Crusts, compost, wastewater"] },
    stations: [
      { id: "need", kind: "NEED", label: "Need", question: "Why does this system exist?",
        body: "People need energy and nutrients every day. Food systems exist to meet that need — and they are also how a large part of humanity earns a living, from farm work to logistics to retail.",
        parts: ["Energy", "Protein", "Vitamins and minerals", "Culture and taste", "Livelihoods"] },
      { id: "inputs", kind: "INPUTS", label: "Inputs", question: "What does food depend on before it grows?",
        body: "Before anything is harvested, a food system draws on land, fresh water, seeds and breeds, fertiliser, fuel, machinery, labour — and on living systems such as pollinators and healthy soil.",
        parts: ["Land", "Fresh water", "Seeds and breeds", "Fertiliser", "Fuel", "Pollinators", "Soil life", "Labour"],
        atlas: { layers: ["ndvi", "precip"], caption: "Vegetation and rainfall — the living conditions crops depend on." } },
      { id: "production", kind: "PRODUCTION", label: "Production", question: "Where and how is it produced?",
        body: "Food is grown on cropland and pasture, raised as livestock, caught at sea and farmed in water. Production is concentrated: a few regions grow much of the world's staple grain, and a few fishing grounds land much of its catch.",
        parts: ["Cropland", "Pasture and livestock", "Wild-capture fisheries", "Aquaculture", "Forests and wild foods"],
        atlas: { layers: ["truecolor", "forest", "fires"], caption: "Satellite imagery, forest cover and fire detections show where land is farmed, kept or cleared." } },
      { id: "processing", kind: "PROCESSING", label: "Processing", question: "What happens between field and shelf?",
        body: "Raw harvest is cleaned, stored, milled, slaughtered, cooled, cooked, packed and branded. Processing adds safety, shelf life and value — and uses energy, water and packaging.",
        parts: ["Storage", "Milling", "Slaughter and dairy", "Cooling", "Packaging", "Brands"] },
      { id: "movement", kind: "MOVEMENT", label: "Trade & transport", question: "How does food move around the world?",
        body: "Food crosses borders by ship, rail, road and air. Ports, grain terminals and cold chains are the physical pinch points — when one of them closes, prices move far away.",
        parts: ["Ports and terminals", "Shipping", "Cold chain", "Wholesale markets", "Import dependency"],
        held: "Trade-flow maps are not shown yet. We will draw only flows we can source, with year and partner country." },
      { id: "use", kind: "USE", label: "Eating", question: "Where does it reach people?",
        body: "Food reaches people through shops, markets, canteens, restaurants and their own kitchens. What is affordable, available and familiar shapes what is eaten far more than individual intention.",
        parts: ["Shops and markets", "Public meals", "Restaurants", "Home kitchens", "Price and access"] },
      { id: "end", kind: "END", label: "End of life", question: "What is left over — and where does it go?",
        body: "Some food is lost after harvest and some is thrown away in shops and homes. Leftovers can become compost, energy or feed — or methane in a landfill. Nutrients that pass through people and animals end up in water.",
        parts: ["Losses after harvest", "Waste in shops and homes", "Compost and biogas", "Wastewater nutrients"] },
    ],
    livingSystemIds: [systemId("pollination"), systemId("tropical-forest"), systemId("coastal-sea")],
    problems: [
      { id: "land-conversion", title: "Land conversion for farming", pressureId: pressureId("habitat-loss"),
        definition: "Forests, grasslands and wetlands turned into cropland or pasture.", where: "Concentrated at agricultural frontiers, especially in the tropics.",
        drivers: ["Demand for feed, oils and meat", "Land prices and tenure", "Weak enforcement"], uncertainty: "Satellite data shows where land changed; attributing a cleared area to a single product or buyer needs supply-chain evidence.",
        stations: ["production"] },
      { id: "nutrient-loss", title: "Nutrients that leave the field", pressureId: pressureId("nutrient-pollution"),
        definition: "Nitrogen and phosphorus from fertiliser and manure reaching rivers and coastal seas.", where: "Intensively farmed catchments and the coastal waters they drain into.",
        drivers: ["Application beyond crop uptake", "Bare soil in winter", "Manure concentration"], uncertainty: "Effects on a fjord or sea also depend on wastewater, currents and temperature.",
        stations: ["inputs", "end"] },
      { id: "pollinator-pressure", title: "Pressure on pollinators", pressureId: pressureId("pesticide-pressure"),
        definition: "Insecticides and loss of flowering habitat reducing wild pollinators that many crops depend on.", where: "Farmland with little remaining semi-natural habitat.",
        drivers: ["Routine spraying", "Monocultures", "Habitat loss"], uncertainty: "Chronic, sub-lethal effects are hard to measure in the field.",
        stations: ["inputs", "production"] },
      { id: "overfishing", title: "Fish taken faster than they recover", pressureId: pressureId("overexploitation"),
        definition: "Catching more than a population can replace.", where: "Specific stocks and fishing grounds, not the ocean as a whole.",
        drivers: ["Fleet capacity", "Weak quotas", "Illegal fishing"], uncertainty: "Stock status is known for assessed stocks; many stocks are not assessed.",
        stations: ["production"] },
      { id: "food-emissions", title: "Emissions along the chain", pressureId: pressureId("ghg-emissions"),
        definition: "Methane, nitrous oxide and carbon dioxide from livestock, rice, fertiliser, land clearing, energy use and waste.", where: "Every station — from field to landfill.",
        drivers: ["Ruminant livestock", "Fertiliser", "Deforestation", "Food waste"], uncertainty: "Farm-level emissions are mostly modelled, not measured.",
        stations: ["production", "end"] },
    ],
    solutionIds: [solutionId("ipm"), solutionId("pollinator-corridors"), solutionId("nutrient-management"), solutionId("food-loss-reduction"), solutionId("protected-restoration")],
    traceSectors: [{ label: "Agriculture", sectors: "agriculture" }],
  },
  {
    id: humanSystemId("energy-and-industry"),
    slug: "energy-and-industry",
    name: "Energy & Industry",
    short: "ENERGY",
    status: "PROOF",
    mission: "EN3RGY_",
    need: "Warmth, light, movement — and the materials everything is made of.",
    thesis: "Every switch you flip and almost every object you own depends on energy pulled from the ground, the wind or the sun — and on a few heavy industries that turn rock into steel, cement and chemicals.",
    example: { title: "One steel beam", steps: ["Iron ore + coal or hydrogen", "Mine", "Port", "Blast furnace or electric furnace", "Rolling mill", "Construction site", "Building", "Scrap and recycling"] },
    stations: [
      { id: "need", kind: "NEED", label: "Need", question: "Why does this system exist?",
        body: "People need heat, light, cooling, cooking, transport and communication. Industry needs energy to turn raw materials into the steel, cement, glass, plastics and fertiliser that modern life is built from.",
        parts: ["Heat and cooling", "Light", "Transport", "Machines and data", "Materials"] },
      { id: "inputs", kind: "INPUTS", label: "Sources", question: "Where does the energy come from?",
        body: "Energy comes from fuels taken out of the ground — coal, oil, gas, uranium — and from flows of nature: wind, sunlight, moving water, heat from the Earth and plant matter.",
        parts: ["Coal", "Oil", "Gas", "Uranium", "Wind", "Sun", "Water", "Biomass"] },
      { id: "production", kind: "PRODUCTION", label: "Extraction", question: "Where is it taken from the Earth?",
        body: "Mines, oil and gas fields and quarries supply fuels and raw materials. They are highly concentrated geographically, which makes supply — and its pressures — specific to a small number of places.",
        parts: ["Coal mines", "Oil and gas fields", "Metal mines", "Quarries"],
        atlas: { layers: ["emissions"], caption: "Energy and fossil-fuel assets from Climate TRACE, sized by estimated emissions." } },
      { id: "processing", kind: "PROCESSING", label: "Conversion & industry", question: "What turns raw resources into power and materials?",
        body: "Power stations turn fuels and flows into electricity. Refineries turn crude oil into fuels and feedstocks. Steelworks, cement kilns and chemical plants turn rock and gas into materials — and are among the largest single emitters on Earth.",
        parts: ["Power stations", "Refineries", "Steelworks", "Cement kilns", "Chemical plants", "Aluminium smelters"],
        atlas: { layers: ["emissions", "night"], caption: "Emitting assets and lights at night trace where energy is converted and used." } },
      { id: "movement", kind: "MOVEMENT", label: "Grids & transport", question: "How does energy reach people?",
        body: "Electricity moves through transmission grids; fuels move through pipelines, tankers and trucks. Grids have to match supply and demand every second, which is why storage and connections between regions matter.",
        parts: ["Transmission grid", "Pipelines", "Tankers", "Storage", "Interconnectors"],
        held: "Grid and pipeline maps are not shown yet. We will add them only from sourced infrastructure datasets." },
      { id: "use", kind: "USE", label: "Use", question: "Who uses it, and for what?",
        body: "Energy is used in buildings, vehicles and factories. Much of it is lost as heat along the way. Efficiency — doing the same with less — is often the cheapest source of supply.",
        parts: ["Homes and buildings", "Transport", "Industry", "Data and devices", "Losses as heat"],
        atlas: { layers: ["night"], caption: "Lights at night: a proxy for settlement and electricity use, not population or wealth." } },
      { id: "end", kind: "END", label: "End of life", question: "What is left behind?",
        body: "Burning fuels leaves carbon dioxide and air pollutants. Industry leaves slag, ash and scrap. Metals can be recycled many times; cement and most plastics are much harder to recover.",
        parts: ["CO₂ and methane", "Air pollutants", "Ash and slag", "Scrap metal", "Recycling"] },
    ],
    livingSystemIds: [systemId("coral-reef"), systemId("coastal-sea"), systemId("tropical-forest")],
    problems: [
      { id: "energy-emissions", title: "Emissions from power and industry", pressureId: pressureId("ghg-emissions"),
        definition: "Carbon dioxide and methane released by fossil power stations, fuel production, steel, cement and chemicals.", where: "Concentrated in specific facilities — which is why facility-level data matters.",
        drivers: ["Coal and gas power", "Coal-based steel", "Cement chemistry", "Methane leaks"], uncertainty: "Facility figures are estimates from satellites and models; they can differ from company reports.",
        stations: ["production", "processing", "end"] },
      { id: "extraction-land", title: "Land and habitat lost to extraction", pressureId: pressureId("habitat-loss"),
        definition: "Mines, roads and infrastructure replacing habitat.", where: "Mining regions and new resource frontiers.",
        drivers: ["Demand for metals and fuels", "New roads into intact areas"], uncertainty: "Footprints are often small in area but can open access to much larger regions.",
        stations: ["production"] },
    ],
    solutionIds: [solutionId("renewable-electricity"), solutionId("long-duration-storage"), solutionId("low-carbon-steel"), solutionId("protected-restoration")],
    traceSectors: [
      { label: "Power", sectors: "power" },
      { label: "Fossil-fuel operations", sectors: "fossil-fuel-operations" },
      { label: "Manufacturing", sectors: "manufacturing" },
    ],
  },
];

/** The human-needs orbit. Only GOLD/PROOF systems open; others are shown honestly as next. */
export const ORBIT: { slug: string; label: string; status: SystemStatus }[] = [
  { slug: "food", label: "Food", status: "GOLD" },
  { slug: "water", label: "Water", status: "NEXT" },
  { slug: "energy-and-industry", label: "Energy", status: "PROOF" },
  { slug: "built-environment", label: "Built environment", status: "NEXT" },
  { slug: "mobility", label: "Mobility", status: "NEXT" },
  { slug: "fashion", label: "Fashion & materials", status: "NEXT" },
  { slug: "technology", label: "Technology", status: "NEXT" },
  { slug: "trade", label: "Trade & logistics", status: "NEXT" },
];

export const systemBySlug = (slug: string) => SYSTEMS.find((s) => s.slug === slug);

/** The full grammar, shown on the home page. */
export const GRAMMAR = ["Human", "Need", "Value chain", "Place", "Nature", "Problem", "Innovation", "Action"];
