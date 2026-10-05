export type SapiensChain = {
  id: string;
  label: string;
  humanNeed: string;
  status: "GOLD_STANDARD" | "MAPPED_NEXT";
  primaryMission?: string;
  pressureFamilies: string[];
  sourceFamilies: string[];
};

export type FoodSourceLayer = {
  id: string;
  label: string;
  authority: string;
  state: "LIVE_API" | "EXISTING_ATLAS" | "OPEN_DATASET" | "ACCESS_GATED" | "RIGHTS_REVIEW";
  role: string;
  limitation: string;
  url: string;
  checkedOn: string;
  coverage?: string;
};

/**
 * Working S4PIENS Atlas families — not a scientific taxonomy and not Locked Canon.
 * Overlap is intentional: the graph should show that the same mine, port, farm,
 * grid, factory or consumer demand can participate in several value chains.
 */
export const SAPIENS_CHAINS: SapiensChain[] = [
  { id: "food", label: "FOOD", humanNeed: "Eat", status: "GOLD_STANDARD", primaryMission: "food", pressureFamilies: ["land", "water", "nutrients", "climate", "biodiversity", "waste"], sourceFamilies: ["FAOSTAT", "Climate TRACE", "FAO GLW4", "AQUASTAT", "Trase", "GLORIA MRIO", "GFW", "GBIF", "Global Fishing Watch", "UN Comtrade"] },
  { id: "energy", label: "ENERGY", humanNeed: "Power", status: "MAPPED_NEXT", primaryMission: "en4rgy", pressureFamilies: ["climate", "air", "land", "water", "extraction"], sourceFamilies: ["Climate TRACE", "Global Energy Monitor", "NASA GIBS"] },
  { id: "road-mobility", label: "ROAD MOBILITY", humanNeed: "Move", status: "MAPPED_NEXT", pressureFamilies: ["climate", "air", "land", "materials"], sourceFamilies: ["Climate TRACE", "OpenStreetMap", "UNEP IRP"] },
  { id: "aviation", label: "AVIATION", humanNeed: "Move", status: "MAPPED_NEXT", pressureFamilies: ["climate", "air", "infrastructure"], sourceFamilies: ["Climate TRACE", "OpenStreetMap"] },
  { id: "shipping", label: "SHIPPING + PORTS", humanNeed: "Move goods", status: "MAPPED_NEXT", pressureFamilies: ["climate", "air", "ocean", "noise"], sourceFamilies: ["Climate TRACE", "Global Fishing Watch", "OpenStreetMap"] },
  { id: "buildings", label: "BUILDINGS + CITIES", humanNeed: "Shelter", status: "MAPPED_NEXT", primaryMission: "circular-city", pressureFamilies: ["materials", "energy", "land", "climate", "waste"], sourceFamilies: ["Climate TRACE", "OpenStreetMap", "UNEP IRP"] },
  { id: "cement", label: "CEMENT + CONCRETE", humanNeed: "Build", status: "MAPPED_NEXT", pressureFamilies: ["climate", "quarrying", "air", "energy"], sourceFamilies: ["Climate TRACE", "Global Energy Monitor", "UNEP IRP"] },
  { id: "steel", label: "STEEL + METALS", humanNeed: "Build", status: "MAPPED_NEXT", pressureFamilies: ["climate", "mining", "energy", "water"], sourceFamilies: ["Climate TRACE", "Global Energy Monitor", "USGS", "UNEP IRP"] },
  { id: "mining", label: "MINING + MINERALS", humanNeed: "Materials", status: "MAPPED_NEXT", pressureFamilies: ["land", "water", "pollution", "biodiversity"], sourceFamilies: ["USGS", "Global Energy Monitor", "Climate TRACE"] },
  { id: "fashion", label: "FASHION + TEXTILES", humanNeed: "Wear", status: "MAPPED_NEXT", primaryMission: "f4shion", pressureFamilies: ["water", "land", "chemicals", "climate", "waste"], sourceFamilies: ["FAOSTAT", "UN Comtrade", "Open Supply Hub", "Climate TRACE"] },
  { id: "plastics", label: "PLASTICS + PACKAGING", humanNeed: "Package", status: "MAPPED_NEXT", pressureFamilies: ["fossil", "climate", "waste", "ocean", "toxicity"], sourceFamilies: ["Climate TRACE", "UNEP IRP", "UN Comtrade"] },
  { id: "chemicals", label: "CHEMICALS + FERTILISERS", humanNeed: "Produce", status: "MAPPED_NEXT", pressureFamilies: ["nutrients", "toxicity", "climate", "water"], sourceFamilies: ["FAOSTAT", "Climate TRACE", "Global Energy Monitor"] },
  { id: "forestry", label: "TIMBER + PAPER", humanNeed: "Build + use", status: "MAPPED_NEXT", pressureFamilies: ["forest", "biodiversity", "water", "climate"], sourceFamilies: ["Global Forest Watch", "FAOSTAT", "UN Comtrade"] },
  { id: "electronics", label: "ELECTRONICS", humanNeed: "Connect", status: "MAPPED_NEXT", pressureFamilies: ["mining", "energy", "chemicals", "waste"], sourceFamilies: ["USGS", "UN Comtrade", "Open Supply Hub", "Climate TRACE"] },
  { id: "freshwater", label: "FRESHWATER USE", humanNeed: "Drink + produce", status: "MAPPED_NEXT", pressureFamilies: ["withdrawal", "scarcity", "pollution", "habitat"], sourceFamilies: ["AQUASTAT", "NASA", "FAOSTAT"] },
  { id: "seafood", label: "FISHERIES + SEAFOOD", humanNeed: "Eat", status: "MAPPED_NEXT", primaryMission: "food", pressureFamilies: ["extraction", "bycatch", "habitat", "climate"], sourceFamilies: ["Global Fishing Watch", "FAO", "OBIS", "GBIF"] },
  { id: "waste", label: "WASTE + LANDFILLS", humanNeed: "Discard", status: "MAPPED_NEXT", primaryMission: "circular-city", pressureFamilies: ["methane", "pollution", "materials", "leakage"], sourceFamilies: ["Climate TRACE", "UNEP IRP"] },
  { id: "tourism", label: "TOURISM + TRAVEL", humanNeed: "Experience", status: "MAPPED_NEXT", pressureFamilies: ["transport", "land", "water", "waste"], sourceFamilies: ["Climate TRACE", "OpenStreetMap", "UNEP IRP"] },
  { id: "consumer-goods", label: "CONSUMER GOODS", humanNeed: "Use", status: "MAPPED_NEXT", pressureFamilies: ["materials", "manufacturing", "climate", "waste"], sourceFamilies: ["UNEP IRP", "UN Comtrade", "Open Supply Hub", "Climate TRACE"] },
  { id: "trade", label: "GLOBAL TRADE + LOGISTICS", humanNeed: "Exchange", status: "MAPPED_NEXT", pressureFamilies: ["transport", "ports", "embedded materials", "embedded pressures"], sourceFamilies: ["UN Comtrade", "Climate TRACE", "Global Fishing Watch"] },
];

export const FOOD_STAGES = [
  { id: "demand", label: "DEMAND + DIET", text: "What people buy and eat shapes the quantities and commodities moving through the system." },
  { id: "production", label: "FARM + SEA", text: "Crops, livestock and fisheries turn land, water, nutrients, feed and marine biomass into food." },
  { id: "inputs", label: "INPUTS", text: "Fertiliser, feed, energy, machinery and water connect food to other industrial systems." },
  { id: "processing", label: "PROCESSING", text: "Milling, slaughter, refrigeration and manufacturing add facilities, energy and material flows." },
  { id: "trade", label: "TRADE + LOGISTICS", text: "Commodities cross borders and move through ports, roads, ships and cold chains." },
  { id: "retail", label: "RETAIL + CONSUMPTION", text: "The chain reaches shops, restaurants and households — where demand decisions become visible." },
  { id: "waste", label: "LOSS + WASTE", text: "Loss and waste can carry embedded land, water, energy and emissions through the chain without becoming nutrition." },
] as const;

export const FOOD_PRESSURES = [
  { id: "land", label: "LAND CONVERSION", question: "Where does food production overlap forest and habitat change?", atlasLayers: ["forest", "ndvi", "fires", "biodiv"] },
  { id: "water", label: "WATER", question: "Where is agricultural demand interacting with water availability and stress?", atlasLayers: ["precip", "ndvi"] },
  { id: "nutrients", label: "NUTRIENTS + CHEMICALS", question: "Where do fertiliser and nutrient flows create pressure beyond the farm?", atlasLayers: ["ndvi", "precip"] },
  { id: "climate", label: "CLIMATE", question: "Where are greenhouse-gas sources embedded in food production and processing?", atlasLayers: ["emissions", "fires", "aerosol"] },
  { id: "biodiversity", label: "LIFE", question: "Which species and living systems occupy the same places as production and pressure?", atlasLayers: ["biodiv", "species"] },
  { id: "ocean", label: "OCEAN EXTRACTION", question: "Where does seafood demand meet apparent fishing activity and marine life?", atlasLayers: ["whales", "sst"] },
  { id: "waste", label: "LOSS + WASTE", question: "Where can avoided loss remove pressure before more production is required?", atlasLayers: ["emissions", "night"] },
] as const;

export const FOOD_SOURCES: FoodSourceLayer[] = [
  { id: "climate-trace-agriculture", label: "AGRICULTURE EMISSIONS SOURCES", authority: "Climate TRACE", state: "LIVE_API", role: "Geolocated agriculture-sector greenhouse-gas source records for the first live FOOD pressure seam.", limitation: "Inventory/model source records; not live plumes and not proof of ecological damage at a point.", url: "https://climatetrace.org/data", checkedOn: "2026-08-19", coverage: "Global · source/asset inventory" },
  { id: "nasa", label: "EARTH · VEGETATION · RAIN · FIRE", authority: "NASA GIBS", state: "EXISTING_ATLAS", role: "Blue Marble, vegetation, precipitation, true-colour imagery and thermal-anomaly context around production landscapes.", limitation: "Remote-sensing products have source-specific dates and semantics; thermal anomaly is not automatically wildfire.", url: "https://nasa-gibs.github.io/gibs-api-docs/", checkedOn: "2026-08-19", coverage: "Global raster products" },
  { id: "gfw", label: "TREE COVER LOSS", authority: "Global Forest Watch · UMD", state: "EXISTING_ATLAS", role: "Spatial forest-loss context for land-pressure investigation.", limitation: "Tree-cover loss is not automatically deforestation and does not establish a commodity driver by itself.", url: "https://data-api.globalforestwatch.org/", checkedOn: "2026-08-19", coverage: "Global forest data products" },
  { id: "gbif", label: "SPECIES RECORDS", authority: "GBIF", state: "EXISTING_ATLAS", role: "Occurrence records connect food-production geographies to recorded life.", limitation: "Observation density reflects sampling effort as well as biodiversity; occurrence counts are not population estimates.", url: "https://techdocs.gbif.org/en/openapi/", checkedOn: "2026-08-19", coverage: "Global biodiversity occurrence records" },
  { id: "faostat", label: "PRODUCTION + INPUTS + TRADE STATISTICS", authority: "FAO · FAOSTAT", state: "OPEN_DATASET", role: "Country/commodity production, inputs, food balances, emissions and other food-system statistics.", limitation: "Mostly statistical geography; not farm-level traceability. Different indicators have different reporting years and methods.", url: "https://www.fao.org/faostat/en/", checkedOn: "2026-08-19", coverage: "245+ countries and territories · 1961 to latest available year" },
  { id: "glw4", label: "LIVESTOCK DISTRIBUTION", authority: "FAO · Gridded Livestock of the World v4", state: "OPEN_DATASET", role: "Peer-reviewed spatial distributions of major livestock species aligned to FAOSTAT 2020 totals.", limitation: "Modelled gridded estimates aligned to 2020; not current individual-animal positions.", url: "https://www.fao.org/livestock-systems/global-distributions/en/", checkedOn: "2026-08-19", coverage: "Global gridded livestock distributions" },
  { id: "aquastat", label: "WATER + AGRICULTURE", authority: "FAO · AQUASTAT", state: "OPEN_DATASET", role: "Water resources, use, irrigation and agricultural water-management indicators.", limitation: "Primarily country/statistical reporting; values can be official, estimated, imputed or external and cadence differs by indicator.", url: "https://www.fao.org/aquastat/en/", checkedOn: "2026-08-19", coverage: "Global country-level water and agriculture indicators" },
  { id: "trase", label: "COMMODITY SUPPLY CHAINS", authority: "Trase", state: "OPEN_DATASET", role: "Downloadable commodity supply-chain and sustainability datasets can connect selected production regions, traders and markets.", limitation: "Coverage is commodity- and country-specific; a Trase chain should not be generalized to uncovered commodities or geographies.", url: "https://trase.earth/open-data", checkedOn: "2026-08-19", coverage: "Selected commodities and producing countries" },
  { id: "gloria", label: "CONSUMPTION FOOTPRINT · MRIO", authority: "UNEP IRP · GLORIA", state: "RIGHTS_REVIEW", role: "Multi-regional input-output tables can trace final demand through global economic sectors and connect consumption to environmental footprint accounting.", limitation: "Commercial-use licensing requires review before 4PLANET public activation; MRIO results are modelled economic attribution, not physical product traceability.", url: "https://footprint.unep.org/gloria-mrio", checkedOn: "2026-08-19", coverage: "1990–2024 · 164 regions · 97 sectors" },
  { id: "comtrade", label: "COMMODITY TRADE FLOWS", authority: "UN Comtrade", state: "ACCESS_GATED", role: "Reporter-partner-commodity trade can connect production regions to consumption markets.", limitation: "Programmatic scale and current terms require a controlled access route; trade flow alone does not prove exact farm-to-buyer provenance.", url: "https://comtradeplus.un.org/", checkedOn: "2026-08-19", coverage: "Global bilateral merchandise trade" },
  { id: "gfw-fishing", label: "APPARENT FISHING EFFORT", authority: "Global Fishing Watch", state: "ACCESS_GATED", role: "AIS-derived apparent fishing activity can extend FOOD into seafood supply and marine pressure.", limitation: "API token required; AIS-derived apparent effort is not proof of illegal fishing and does not cover every vessel.", url: "https://globalfishingwatch.org/our-apis/documentation", checkedOn: "2026-08-19", coverage: "Global AIS-equipped fishing vessels · 2012 onward" },
];

export const FOOD_SOLUTION_LEVERS = [
  { label: "AVOID HABITAT CONVERSION", pressure: "LAND", test: "Can supply-chain and landscape data identify where expansion pressure can be avoided?" },
  { label: "NUTRIENT EFFICIENCY", pressure: "NUTRIENTS", test: "Where can fertiliser use and nutrient losses be reduced without shifting pressure elsewhere?" },
  { label: "LOWER METHANE + N₂O", pressure: "CLIMATE", test: "Which production systems and sources are the largest credible intervention points?" },
  { label: "WATER PRODUCTIVITY", pressure: "WATER", test: "Where can food output be decoupled from avoidable freshwater pressure?" },
  { label: "REDUCE FOOD LOSS + WASTE", pressure: "WASTE", test: "Where in the chain is avoidable loss carrying the most embedded resources?" },
  { label: "DEFORESTATION-FREE SOURCING", pressure: "LAND", test: "Can commodity, trade and forest-change evidence converge without overstating provenance?" },
  { label: "BETTER FISHERIES MANAGEMENT", pressure: "OCEAN", test: "Where can effort, ecosystem and species evidence reveal management priorities?" },
  { label: "SHIFT DEMAND WHERE EVIDENCE SUPPORTS IT", pressure: "DEMAND", test: "Which consumption changes reduce pressure when full lifecycle and nutrition trade-offs are considered?" },
] as const;
