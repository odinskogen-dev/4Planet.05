export type PlanetProofState = "FOUNDER_REVIEW" | "TRANSFER_SEEDED";
export type ProofConfidence = "HIGH" | "MEDIUM" | "OPEN";

export interface ProofSource {
  id: string;
  label: string;
  authority: string;
  url: string;
  supports: string;
  state: "AUTHORITATIVE" | "OPERATIONAL";
}

export interface ProofMapLayer {
  id: string;
  label: string;
  sourceId: string;
  description: string;
  tileUrl: string;
  opacity: number;
}

export interface ProofSection {
  id: "WHAT_IS_HERE" | "WHAT_IS_HAPPENING" | "WHY" | "DEPENDS_ON" | "WHAT_CHANGED" | "HOW_WE_KNOW" | "WHO_CAN_ACT" | "WHAT_CAN_BE_DONE";
  question: string;
  headline: string;
  summary: string;
  facts: string[];
  sourceIds: string[];
  confidence: ProofConfidence;
}

export interface PlanetProof {
  slug: string;
  index: string;
  name: string;
  domain: string;
  state: PlanetProofState;
  oneLine: string;
  truthBoundary: string;
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
  mapLayers: ProofMapLayer[];
  sections: ProofSection[];
  sources: ProofSource[];
  transferNote: string;
}

const NGU_BATHYMETRY = "https://geo.ngu.no/mapserver/MarineGrunnkartWMS?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=Dybdeforhold&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}";
const MDIR_WATER_STATUS = "https://kart3.miljodirektoratet.no/arcgis/services/vannforekomster/MapServer/WMSServer?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=oekologisk_tilstand_eller_potensial_kyst&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}";
const MDIR_INTERVENTIONS = "https://kart2.miljodirektoratet.no/arcgis/services/inngrep_oslofjorden/inngrep_oslofjorden/MapServer/WMSServer?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=inngrep_i_naturtyper&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}";

export const OSLOFJORD_PROOF: PlanetProof = {
  slug: "oslofjorden",
  index: "01",
  name: "Oslofjorden",
  domain: "OCE4N_",
  state: "FOUNDER_REVIEW",
  oneLine: "A real fjord read through real seabed, habitat, water-status, pressure and action evidence.",
  truthBoundary: "This surface does not invent an ecological boundary, migration route, population estimate or causal attribution. Map overlays come from named public geospatial services. Claims remain bounded to what their sources support.",
  center: [10.58, 59.35],
  zoom: 7.2,
  bounds: [[9.75, 58.75], [11.25, 60.05]],
  sources: [
    {
      id: "ngu-bathy-1m",
      label: "Dybdedata i Oslofjorden – terrengmodell – 1-m-grid",
      authority: "Norges geologiske undersøkelse / Geonorge",
      url: "https://data.norge.no/nb/datasets/819b3fc2-9bc5-3610-9e76-f80245be8f12/dybdedata-i-oslofjorden-terrengmodell-1-m-grid",
      supports: "Detailed bathymetry for the mapped Inner Oslofjord coverage; source data were collected using interferometric sonar and multibeam echo sounding.",
      state: "AUTHORITATIVE",
    },
    {
      id: "ngu-marine-wms",
      label: "Marine grunnkart WMS",
      authority: "Norges geologiske undersøkelse",
      url: "https://data.norge.no/nb/data-services/48076542-e93c-3a79-9c4d-74c66f76fd37/marine-grunnkart-wms",
      supports: "Operational seabed-derived map layers including depth and marine ground-map themes where detailed mapping exists.",
      state: "OPERATIONAL",
    },
    {
      id: "mdir-state-2025",
      label: "Tilstandsrapport for Oslofjorden",
      authority: "Miljødirektoratet",
      url: "https://www.miljodirektoratet.no/publikasjoner/2025/januar-2025/tilstandsrapport-for-oslofjorden/",
      supports: "Current state and development of important parts of the Oslofjord ecosystem.",
      state: "AUTHORITATIVE",
    },
    {
      id: "regjeringen-oslofjord",
      label: "Oslofjorden – miljøtilstand og tiltaksarbeid",
      authority: "Klima- og miljødepartementet / Regjeringen",
      url: "https://www.regjeringen.no/no/tema/klima-og-miljo/naturmangfold/innsiktsartikler-naturmangfold/oslofjorden/id3139220/",
      supports: "Current public synthesis of condition, principal pressures, habitat decline, actor responsibility and plan direction.",
      state: "AUTHORITATIVE",
    },
    {
      id: "mdir-water",
      label: "Vannforekomster – ecological status",
      authority: "Miljødirektoratet / Vann-Nett",
      url: "https://kartkatalog.miljodirektoratet.no/MapService/Details/Vannforekomster",
      supports: "Operational coastal water-body ecological status/potential and related water-framework status layers.",
      state: "OPERATIONAL",
    },
    {
      id: "mdir-interventions",
      label: "Fysiske inngrep i Oslofjorden",
      authority: "Miljødirektoratet",
      url: "https://kartkatalog.miljodirektoratet.no/MapService/Details/inngrep_oslofjorden",
      supports: "Mapped physical interventions in eelgrass, shallow soft-bottom and kelp habitats, time-referenced from 1950 through 2024.",
      state: "OPERATIONAL",
    },
    {
      id: "hi-frisk-oslofjord",
      label: "Sluttrapport for Frisk Oslofjord",
      authority: "Havforskningsinstituttet",
      url: "https://www.hi.no/templates/reporteditor/report-pdf?id=89800&nc=5179296299",
      supports: "Marine ecological base-map work, shallow-water mapping and documented mapping of the Tisler cold-water coral reef.",
      state: "AUTHORITATIVE",
    },
    {
      id: "regjeringen-plan",
      label: "Helhetlig tiltaksplan for Oslofjorden",
      authority: "Klima- og miljødepartementet",
      url: "https://www.regjeringen.no/no/dokumenter/helhetlig-tiltaksplan-for-en-ren-og-rik-oslofjord-med-et-aktivt-friluftsliv/id2842258/",
      supports: "Governance, measures and responsibility across wastewater, agriculture, fisheries, restoration and other action areas.",
      state: "AUTHORITATIVE",
    },
  ],
  mapLayers: [
    { id: "bathymetry", label: "SEABED / DEPTH", sourceId: "ngu-marine-wms", description: "NGU MarineGrunnkart · Dybdeforhold", tileUrl: NGU_BATHYMETRY, opacity: 0.72 },
    { id: "water-status", label: "ECOLOGICAL STATUS", sourceId: "mdir-water", description: "Miljødirektoratet / Vann-Nett coastal ecological status", tileUrl: MDIR_WATER_STATUS, opacity: 0.68 },
    { id: "physical-interventions", label: "PHYSICAL INTERVENTIONS", sourceId: "mdir-interventions", description: "Mapped interventions in selected shallow marine habitats", tileUrl: MDIR_INTERVENTIONS, opacity: 0.78 },
  ],
  sections: [
    {
      id: "WHAT_IS_HERE", question: "WHAT IS HERE?", headline: "A fjord is terrain, water and living habitat — not a blue polygon.",
      summary: "The proof begins with the real seabed and the habitats that sit on it. Detailed bathymetry exists for mapped parts of the Inner Oslofjord, while marine mapping programmes provide ecological and geological context at finer scales than the old seeded bounding box.",
      facts: ["The Inner Oslofjord bathymetry dataset is a regular 1 m grid.", "Its source measurements include interferometric sonar and multibeam echo sounding.", "Frisk Oslofjord documented marine ecological mapping including the Tisler cold-water coral reef and shallow-water mapping work."],
      sourceIds: ["ngu-bathy-1m", "ngu-marine-wms", "hi-frisk-oslofjord"], confidence: "HIGH",
    },
    {
      id: "WHAT_IS_HAPPENING", question: "WHAT IS HAPPENING?", headline: "The system is under severe cumulative pressure.",
      summary: "Official assessments describe a serious ecological situation. Large parts of the fjord have moderate ecological status and poor chemical status; cod is at historically low levels, important kelp and eelgrass habitats are declining, and some enclosed bays and basins experience critically low bottom-water oxygen.",
      facts: ["Water-body status can be inspected as live official map data rather than converted into a single invented fjord score.", "The condition report separates ecosystem components and their development instead of implying one universal trend."],
      sourceIds: ["mdir-state-2025", "regjeringen-oslofjord", "mdir-water"], confidence: "HIGH",
    },
    {
      id: "WHY", question: "WHY?", headline: "No single villain explains the fjord.",
      summary: "The pressure picture is cumulative: nutrient inputs from agriculture and wastewater, industrial pollution, fisheries and coastal development interact with a changing climate. The interface keeps these as separate pressures instead of collapsing them into one causal claim.",
      facts: ["The Oslofjord catchment connects land activity across much of eastern Norway to coastal water quality.", "Climate change can amplify effects of existing human pressures."],
      sourceIds: ["regjeringen-oslofjord", "regjeringen-plan"], confidence: "HIGH",
    },
    {
      id: "DEPENDS_ON", question: "WHAT DEPENDS ON WHAT?", headline: "Habitat quality is part of the food web.",
      summary: "Eelgrass meadows and kelp forests are not decorative layers: official synthesis identifies them as important nursery habitat for fish and other marine life. Oxygen, light and seabed condition determine which communities can persist locally.",
      facts: ["Eelgrass and kelp are important nursery habitats.", "Local oxygen conditions can become low enough that bottom-water life is lost in some enclosed areas."],
      sourceIds: ["regjeringen-oslofjord", "mdir-state-2025"], confidence: "HIGH",
    },
    {
      id: "WHAT_CHANGED", question: "WHAT CHANGED?", headline: "Change must be spatial and time-bounded.",
      summary: "The physical-intervention service records mapped interventions in selected shallow habitats and time-references them from 1950 through 2024. The condition report supplies a separate ecological development view. 4PLANET does not merge these into causation unless the evidence supports that link.",
      facts: ["Mapped intervention types include marinas, dredging, infill, cables, buildings, roads and bridges.", "The intervention dataset specifically covers eelgrass, shallow soft-bottom areas and kelp occurrences within its programme scope."],
      sourceIds: ["mdir-interventions", "mdir-state-2025"], confidence: "HIGH",
    },
    {
      id: "HOW_WE_KNOW", question: "HOW DO WE KNOW?", headline: "Every visible layer has an owner, method and boundary.",
      summary: "Bathymetry, ecological status, physical interventions and ecosystem assessment come from different authorities and methods. They stay separate in the map and converge only in the human explanation where their scopes genuinely overlap.",
      facts: ["Bathymetry is measurement-derived, not AI-drawn coastline or seabed.", "Operational WMS layers remain attributable to their source authority.", "Source links remain directly inspectable from the proof."],
      sourceIds: ["ngu-bathy-1m", "ngu-marine-wms", "mdir-water", "mdir-interventions", "mdir-state-2025"], confidence: "HIGH",
    },
    {
      id: "WHO_CAN_ACT", question: "WHO CAN ACT?", headline: "Responsibility is distributed across real institutions.",
      summary: "The Oslofjord plan assigns work across environmental and sector authorities, municipalities, counties and state administrators. The product should connect a pressure to the competent actor rather than present a generic donate button.",
      facts: ["The national plan is coordinated by the climate and environment authorities with participation across sectors.", "Municipal and sector responsibilities matter because major pressures originate in wastewater, agriculture, fisheries and land use."],
      sourceIds: ["regjeringen-plan", "regjeringen-oslofjord"], confidence: "HIGH",
    },
    {
      id: "WHAT_CAN_BE_DONE", question: "WHAT CAN BE DONE?", headline: "Actions already exist; the intelligence problem is fit, responsibility and proof.",
      summary: "Current public action directions include wastewater nitrogen removal, reduced agricultural runoff, fisheries measures, habitat restoration and stronger protection of shallow coastal nature. 4PLANET presents these as source-backed action pathways — not as proof that outcomes have already occurred.",
      facts: ["The existing plan contains 63 measures and 19 knowledge-acquisition points.", "A renewed 2026–2030 plan is being developed, so action state must remain time-stamped and updateable."],
      sourceIds: ["regjeringen-plan", "regjeringen-oslofjord"], confidence: "HIGH",
    },
  ],
  transferNote: "Oslofjord is the first Human Gold proof. The interface/data contract is designed to transfer next to Great Barrier Reef and Amazonia without copying truth manually or inventing new page architecture.",
};

export const GREAT_BARRIER_REEF_TRANSFER: PlanetProof = {
  slug: "great-barrier-reef", index: "02", name: "Great Barrier Reef", domain: "OCE4N_", state: "TRANSFER_SEEDED",
  oneLine: "Transfer test: long-term reef condition plus near-real-time heat stress.",
  truthBoundary: "Seeded transfer pack only. Regional coral-cover indicators do not describe every reef or all dimensions of reef health.",
  center: [147.3, -18.2], zoom: 4.6, bounds: [[142, -24.5], [154, -10]], mapLayers: [],
  sources: [
    { id: "aims-2026", label: "Great Barrier Reef Annual Summary Report 2025–26", authority: "Australian Institute of Marine Science", url: "https://www.aims.gov.au/monitoring-great-barrier-reef/gbr-condition-summary-2025-26", supports: "2025–26 LTMP condition results from 121 surveyed reefs, including regional hard-coral-cover estimates and disturbance context.", state: "AUTHORITATIVE" },
    { id: "noaa-crw", label: "Daily 5 km Coral Bleaching Heat Stress Monitoring", authority: "NOAA Coral Reef Watch", url: "https://coralreefwatch.noaa.gov/product/5km", supports: "Daily satellite SST, anomaly, HotSpot, Degree Heating Weeks and bleaching-alert products.", state: "OPERATIONAL" },
  ],
  sections: [
    { id: "WHAT_IS_HERE", question: "WHAT IS HERE?", headline: "A reef system large enough that regional summaries are not local truth.", summary: "AIMS provides reef-level and regional monitoring; the transfer must preserve that spatial hierarchy.", facts: ["The 2025–26 LTMP surveyed 121 reefs."], sourceIds: ["aims-2026"], confidence: "HIGH" },
    { id: "WHAT_IS_HAPPENING", question: "WHAT IS HAPPENING?", headline: "Initial recovery sits inside continuing climate pressure.", summary: "In 2026 regional hard coral cover increased in the north and centre and was relatively stable in the south, while heat stress and disturbance continued.", facts: ["Regional hard coral cover was reported at 35.1% north, 31.6% central and 26.4% south in 2026."], sourceIds: ["aims-2026", "noaa-crw"], confidence: "HIGH" },
    { id: "WHY", question: "WHY?", headline: "Heat, cyclones and crown-of-thorns act at different scales.", summary: "The transfer will keep disturbances separate and time-stamped rather than convert them into one reef-health score.", facts: [], sourceIds: ["aims-2026", "noaa-crw"], confidence: "HIGH" },
    { id: "DEPENDS_ON", question: "WHAT DEPENDS ON WHAT?", headline: "OPEN FOR TRANSFER", summary: "Dependency graph will be populated through the shared Living Systems contract after reef/habitat identity is resolved.", facts: [], sourceIds: ["aims-2026"], confidence: "OPEN" },
    { id: "WHAT_CHANGED", question: "WHAT CHANGED?", headline: "Long-term monitoring makes change measurable.", summary: "AIMS annual and long-term series allow current condition to be read against earlier observations.", facts: [], sourceIds: ["aims-2026"], confidence: "HIGH" },
    { id: "HOW_WE_KNOW", question: "HOW DO WE KNOW?", headline: "Field monitoring + satellite heat stress.", summary: "The transfer intentionally combines distinct evidence modes without treating either as the whole ecosystem.", facts: [], sourceIds: ["aims-2026", "noaa-crw"], confidence: "HIGH" },
    { id: "WHO_CAN_ACT", question: "WHO CAN ACT?", headline: "OPEN FOR ACTOR RESOLUTION", summary: "Actor graph is not yet promoted in this transfer pack.", facts: [], sourceIds: [], confidence: "OPEN" },
    { id: "WHAT_CAN_BE_DONE", question: "WHAT CAN BE DONE?", headline: "OPEN FOR ACTION RESOLUTION", summary: "No generic solution claim is promoted before actor, place and intervention evidence are resolved.", facts: [], sourceIds: [], confidence: "OPEN" },
  ],
  transferNote: "Transfer 02 reuses the Oslofjord reading sequence while forcing it to handle a very different marine system, monitoring scale and near-real-time thermal signal.",
};

export const AMAZONIA_TRANSFER: PlanetProof = {
  slug: "amazonia", index: "03", name: "Amazonia", domain: "E4RTH_", state: "TRANSFER_SEEDED",
  oneLine: "Transfer test: annual land-cover history, fire and forest-system relationships.",
  truthBoundary: "Seeded transfer pack only. Amazon boundaries, land-cover classes and national statistics differ by source; the interface must expose those boundaries rather than merge them silently.",
  center: [-62, -4], zoom: 3.4, bounds: [[-79, -18], [-44, 6]], mapLayers: [],
  sources: [
    { id: "mapbiomas-amazonia", label: "MapBiomas Amazonia Collection", authority: "MapBiomas Amazonia / RAISG network", url: "https://amazonia.mapbiomas.org/en/en/mapbiomas-amazonia-collection/", supports: "Annual Landsat-derived land-cover and land-use maps organised by country and year, with explicit class/boundary methodology.", state: "AUTHORITATIVE" },
    { id: "nasa-firms", label: "NASA FIRMS", authority: "NASA", url: "https://firms.modaps.eosdis.nasa.gov/", supports: "Satellite active-fire / thermal-anomaly observations for time-bounded fire signals.", state: "OPERATIONAL" },
  ],
  sections: [
    { id: "WHAT_IS_HERE", question: "WHAT IS HERE?", headline: "A continental forest system, not a single green polygon.", summary: "The transfer starts from annual land-cover classes and explicit source boundaries.", facts: [], sourceIds: ["mapbiomas-amazonia"], confidence: "HIGH" },
    { id: "WHAT_IS_HAPPENING", question: "WHAT IS HAPPENING?", headline: "Change must be read through land cover and time-stamped disturbance.", summary: "Annual land-cover history and fire observations provide two separate views of change.", facts: [], sourceIds: ["mapbiomas-amazonia", "nasa-firms"], confidence: "HIGH" },
    { id: "WHY", question: "WHY?", headline: "OPEN FOR DRIVER RESOLUTION", summary: "Drivers will not be inferred from a land-cover transition alone.", facts: [], sourceIds: ["mapbiomas-amazonia"], confidence: "OPEN" },
    { id: "DEPENDS_ON", question: "WHAT DEPENDS ON WHAT?", headline: "OPEN FOR LIVING-SYSTEM TRANSFER", summary: "Moisture recycling, biodiversity and human-system dependencies require explicit source-bounded relationships before promotion.", facts: [], sourceIds: [], confidence: "OPEN" },
    { id: "WHAT_CHANGED", question: "WHAT CHANGED?", headline: "Annual maps make spatial change inspectable.", summary: "MapBiomas provides a yearly land-cover series rather than a static forest illustration.", facts: [], sourceIds: ["mapbiomas-amazonia"], confidence: "HIGH" },
    { id: "HOW_WE_KNOW", question: "HOW DO WE KNOW?", headline: "Landsat classifications + satellite fire observations.", summary: "Different sensors and methodologies remain visibly separate.", facts: [], sourceIds: ["mapbiomas-amazonia", "nasa-firms"], confidence: "HIGH" },
    { id: "WHO_CAN_ACT", question: "WHO CAN ACT?", headline: "OPEN FOR ACTOR RESOLUTION", summary: "Actor graph is not yet promoted in this transfer pack.", facts: [], sourceIds: [], confidence: "OPEN" },
    { id: "WHAT_CAN_BE_DONE", question: "WHAT CAN BE DONE?", headline: "OPEN FOR ACTION RESOLUTION", summary: "No universal intervention is promoted before place, actor and evidence fit are resolved.", facts: [], sourceIds: [], confidence: "OPEN" },
  ],
  transferNote: "Transfer 03 forces the same interface to cross from marine ecology into a terrestrial forest system without creating a second Planet architecture.",
};

export const PLANET_PROOFS = [OSLOFJORD_PROOF, GREAT_BARRIER_REEF_TRANSFER, AMAZONIA_TRANSFER] as const;
export function planetProofBySlug(slug: string) { return PLANET_PROOFS.find((proof) => proof.slug === slug); }
