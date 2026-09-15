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

export interface TransferAudit {
  basis: "STRUCTURAL_COMPONENT_CLASSIFICATION";
  reused: string[];
  adapted: string[];
  netNew: string[];
  structuralReuseRatio: number;
  founderMinutes: number | null;
  elapsedBuildMinutes: number | null;
  dependencies: string[];
  defectsOrRetries: string[];
  qualityState: string;
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
  transferAudit?: TransferAudit;
}

const NGU_BATHYMETRY = "https://geo.ngu.no/mapserver/MarineGrunnkartWMS?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=Dybdeforhold&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}";
const MDIR_WATER_STATUS = "https://kart3.miljodirektoratet.no/arcgis/services/vannforekomster/MapServer/WMSServer?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=oekologisk_tilstand_eller_potensial_kyst&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}";
const MDIR_INTERVENTIONS = "https://kart2.miljodirektoratet.no/arcgis/services/inngrep_oslofjorden/inngrep_oslofjorden/MapServer/WMSServer?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=inngrep_i_naturtyper&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}";

export const OSLOFJORD_PROOF: PlanetProof = {
  slug: "oslofjorden",
  index: "01",
  name: "Bunnefjorden",
  domain: "OCE4N_",
  state: "FOUNDER_REVIEW",
  oneLine: "A bounded threshold-fjord microcosm where oxygen, deep-water renewal and one measured wastewater intervention make system change inspectable.",
  truthBoundary: "Bunnefjorden is used as a bounded Reference Cell inside the wider Oslofjord system. The map extent is a product reading boundary, not an ecological border. The NIVA intervention result is reported for bottom-water oxygen conditions; it is not evidence that the whole Oslofjord ecosystem was restored.",
  center: [10.70, 59.80],
  zoom: 9.2,
  bounds: [[10.50, 59.70], [10.88, 59.91]],
  sources: [
    {
      id: "ngu-bathy-1m",
      label: "Dybdedata i Oslofjorden – terrengmodell – 1-m-grid",
      authority: "Norges geologiske undersøkelse / Geonorge",
      url: "https://data.norge.no/nb/datasets/819b3fc2-9bc5-3610-9e76-f80245be8f12/dybdedata-i-oslofjorden-terrengmodell-1-m-grid",
      supports: "Detailed bathymetry for mapped Inner Oslofjord coverage; source measurements include interferometric sonar and multibeam echo sounding.",
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
      id: "niva-bunnefjorden-2025",
      label: "Mulighetsvurdering – Overføring av Gjersjøvann til Bunnefjorden",
      authority: "NIVA",
      url: "https://www.niva.no/publikasjoner/publikasjon?cristinid=10302191",
      supports: "Reports the observed/model-supported oxygen-condition effect associated with lowering the Nordre Follo wastewater outfall from 45 m to 137 m, including an 82% reduction in the area of anoxic bottom water immediately before deep-water renewal.",
      state: "AUTHORITATIVE",
    },
    {
      id: "niva-deepwater-2021",
      label: "Ny utslippsledning kan ha gitt hyppigere dypvannsfornyelse i Bunnefjorden",
      authority: "NIVA",
      url: "https://www.niva.no/nyheter/ny-utslippsledning-kan-ha-gitt-hyppigere-dypvannsfornyelse-i-bunnefjorden",
      supports: "Explains Bunnefjorden as a threshold basin, the oxygen/deep-water-renewal mechanism and the bounded hypothesis that the deeper outfall contributed to more frequent renewal.",
      state: "AUTHORITATIVE",
    },
    {
      id: "mdir-state-2025",
      label: "Tilstandsrapport for Oslofjorden",
      authority: "Miljødirektoratet",
      url: "https://www.miljodirektoratet.no/publikasjoner/2025/januar-2025/tilstandsrapport-for-oslofjorden/",
      supports: "State and development of important parts of the wider Oslofjord ecosystem; used only where the claim scope is wider than Bunnefjorden.",
      state: "AUTHORITATIVE",
    },
    {
      id: "regjeringen-oslofjord",
      label: "Oslofjorden – miljøtilstand og tiltaksarbeid",
      authority: "Klima- og miljødepartementet / Regjeringen",
      url: "https://www.regjeringen.no/no/tema/klima-og-miljo/naturmangfold/innsiktsartikler-naturmangfold/oslofjorden/id3139220/",
      supports: "Public synthesis of wider Oslofjord condition, principal pressures, habitat decline, actor responsibility and plan direction.",
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
      supports: "Mapped physical interventions in eelgrass, shallow soft-bottom and kelp habitats, time-referenced from 1950 through 2024 within the programme scope.",
      state: "OPERATIONAL",
    },
    {
      id: "regjeringen-plan",
      label: "Helhetlig tiltaksplan for Oslofjorden",
      authority: "Klima- og miljødepartementet",
      url: "https://www.regjeringen.no/no/dokumenter/helhetlig-tiltaksplan-for-en-ren-og-rik-oslofjord-med-et-aktivt-friluftsliv/id2842258/",
      supports: "Governance, measures and responsibility across wastewater, agriculture, fisheries, restoration and other action areas in the wider Oslofjord system.",
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
      id: "WHAT_IS_HERE", question: "WHAT IS HERE?", headline: "A deep basin behind a shallow threshold.",
      summary: "Bunnefjorden is a threshold fjord inside the Inner Oslofjord. A shallow ridge near the entrance restricts exchange with the rest of the fjord, making deep-water renewal and oxygen a legible control on what can persist at depth.",
      facts: ["NIVA describes a threshold around 50 m separating Bunnefjorden deep water from the rest of Inner Oslofjord.", "Detailed Inner Oslofjord bathymetry is measurement-derived rather than an illustrated seabed."],
      sourceIds: ["niva-deepwater-2021", "ngu-bathy-1m", "ngu-marine-wms"], confidence: "HIGH",
    },
    {
      id: "WHAT_IS_HAPPENING", question: "WHAT IS HAPPENING?", headline: "The core signal is oxygen debt at depth.",
      summary: "When deep water is not renewed, oxygen is consumed and anoxic conditions can persist. NIVA monitoring has documented periods of near-anoxic deep water followed by full deep-water renewal; the wider Oslofjord remains under cumulative ecological pressure.",
      facts: ["In February 2021 NIVA reported water below 70 m was almost oxygen-free before full deep-water renewal later that spring.", "Oxygen conditions at depth are a bounded state signal, not a universal health score for the whole fjord."],
      sourceIds: ["niva-deepwater-2021", "mdir-state-2025"], confidence: "HIGH",
    },
    {
      id: "WHY", question: "WHY?", headline: "Physical shape and human inputs meet in the same basin.",
      summary: "The threshold limits renewal of deep water while organic loading and other human pressures consume oxygen. The Reference Cell keeps the physical mechanism, wastewater intervention and wider nutrient/pressure picture separate so that causality is not overstated.",
      facts: ["Deep water below the threshold is oxygenated when denser new water enters the basin.", "The wider Oslofjord pressure picture includes wastewater, agriculture, fisheries and coastal development; these are not collapsed into one Bunnefjorden cause."],
      sourceIds: ["niva-deepwater-2021", "regjeringen-oslofjord", "regjeringen-plan"], confidence: "HIGH",
    },
    {
      id: "DEPENDS_ON", question: "WHAT DEPENDS ON WHAT?", headline: "Oxygen availability constrains bottom-water life.",
      summary: "NIVA explains that marine organisms have minimum oxygen requirements and that low concentrations force mobile species to leave while anoxia can eliminate bottom-water life. This is a dependency between water state and biological viability, not a population estimate.",
      facts: ["NIVA notes shrimp occurrence is limited to areas above a minimum oxygen concentration and cod has higher oxygen requirements.", "Observation of oxygen conditions does not establish local abundance or population trend."],
      sourceIds: ["niva-deepwater-2021"], confidence: "HIGH",
    },
    {
      id: "WHAT_CHANGED", question: "WHAT CHANGED?", headline: "One intervention produced a measurable oxygen-state delta.",
      summary: "NIVA's 2025 assessment reports that lowering the Nordre Follo wastewater outfall from 45 m to 137 m radically improved Bunnefjorden oxygen conditions: the area with anoxic bottom water immediately before deep-water renewal was reduced by 82%. This is unusually strong Reference Cell evidence because intervention, mechanism and measured state change can be read together.",
      facts: ["Intervention: wastewater outfall depth changed from 45 m to 137 m.", "Reported state delta: 82% reduction in area with anoxic bottom water immediately before deep-water renewal.", "Claim boundary: oxygen-condition improvement in Bunnefjorden is not equivalent to restored biodiversity or verified whole-ecosystem impact."],
      sourceIds: ["niva-bunnefjorden-2025", "niva-deepwater-2021"], confidence: "HIGH",
    },
    {
      id: "HOW_WE_KNOW", question: "HOW DO WE KNOW?", headline: "Measurement, monitoring and model interpretation stay attributable.",
      summary: "Bathymetry, water-body status, physical interventions, repeated monitoring and NIVA's intervention assessment use different methods. 4PLANET keeps those sources visible and does not merge them into a synthetic confidence score.",
      facts: ["The 82% figure is attributed directly to NIVA's 2025 assessment.", "Operational WMS layers remain attributable to their source authority.", "The 2021 NIVA article describes the mechanism as a bounded possibility, not certainty, for the earlier renewal event."],
      sourceIds: ["niva-bunnefjorden-2025", "niva-deepwater-2021", "ngu-marine-wms", "mdir-water"], confidence: "HIGH",
    },
    {
      id: "WHO_CAN_ACT", question: "WHO CAN ACT?", headline: "The Cell resolves competent actors before generic calls to action.",
      summary: "Wastewater operators and municipalities can affect discharge infrastructure; environmental authorities coordinate wider Oslofjord measures; research and monitoring institutions establish evidence. The interface should connect each pressure/intervention to the actor with actual authority or delivery capability.",
      facts: ["Nordre Follo wastewater infrastructure is part of the observed Bunnefjorden intervention case.", "The national Oslofjord plan distributes responsibility across municipal, sector and state actors."],
      sourceIds: ["niva-bunnefjorden-2025", "regjeringen-plan"], confidence: "HIGH",
    },
    {
      id: "WHAT_CAN_BE_DONE", question: "WHAT CAN BE DONE?", headline: "Measure first; scale only what has an inspectable mechanism and owner.",
      summary: "The Bunnefjorden case shows that an infrastructure intervention can alter a measurable ecological state variable. Wider action still includes wastewater nitrogen removal, reduced runoff, fisheries measures and restoration, but each pathway requires its own actor, delivery and Proof Passport before stronger claims.",
      facts: ["The current Cell does not convert the 82% oxygen-state result into a biodiversity or impact score.", "Oslofjord restoration and Handelens Miljøfond remain a separate later Action opportunity rather than being forced into this first international Action Cell."],
      sourceIds: ["niva-bunnefjorden-2025", "regjeringen-plan", "regjeringen-oslofjord"], confidence: "HIGH",
    },
  ],
  transferNote: "Bunnefjorden is the provisional Super Cell winner because one bounded place links physical form, ecological state, a real intervention, measurable change, real actors and inspectable sources. The same page/data grammar is transferred next to Great Barrier Reef; transfer quality is measured separately from visual similarity.",
};

export const GREAT_BARRIER_REEF_TRANSFER: PlanetProof = {
  slug: "great-barrier-reef", index: "02", name: "Great Barrier Reef", domain: "OCE4N_", state: "TRANSFER_SEEDED",
  oneLine: "Transfer test: 40 years of field monitoring plus current heat-stress context, rendered through the same Planet Proof grammar as Bunnefjorden.",
  truthBoundary: "Transfer candidate only. Regional coral-cover estimates do not describe every reef, every habitat or all dimensions of reef health. Heat stress is a pressure signal, not proof of bleaching or ecological outcome at every reef.",
  center: [147.3, -18.2], zoom: 4.6, bounds: [[142, -24.5], [154, -10]], mapLayers: [],
  sources: [
    { id: "aims-2026", label: "Great Barrier Reef Annual Summary Report 2025–26", authority: "Australian Institute of Marine Science", url: "https://www.aims.gov.au/monitoring-great-barrier-reef/gbr-condition-summary-2025-26", supports: "2025–26 LTMP condition results from 121 surveyed reefs, including regional hard-coral-cover estimates, disturbance context, 5,175 manta tows, about 1,035 km of survey effort and 135 survey days.", state: "AUTHORITATIVE" },
    { id: "noaa-crw", label: "Daily 5 km Coral Bleaching Heat Stress Monitoring", authority: "NOAA Coral Reef Watch", url: "https://coralreefwatch.noaa.gov/product/5km", supports: "Daily satellite SST, anomaly, HotSpot, Degree Heating Weeks and bleaching-alert products.", state: "OPERATIONAL" },
  ],
  sections: [
    { id: "WHAT_IS_HERE", question: "WHAT IS HERE?", headline: "A reef system too large for one regional number to be local truth.", summary: "AIMS monitoring resolves individual reefs and regional summaries. The transfer therefore preserves spatial hierarchy instead of treating the Great Barrier Reef as one homogeneous object.", facts: ["The 2025–26 LTMP surveyed 121 reefs.", "AIMS reports 5,175 manta tows covering about 1,035 km over 135 survey days."], sourceIds: ["aims-2026"], confidence: "HIGH" },
    { id: "WHAT_IS_HAPPENING", question: "WHAT IS HAPPENING?", headline: "Initial coral-cover recovery sits inside continuing disturbance risk.", summary: "AIMS reports slight increases or broadly similar hard coral cover in 2026 after recent bleaching disturbance, while the Reef continues to face heat, cyclones and crown-of-thorns starfish pressure.", facts: ["2026 regional hard coral cover: 35.1% north, 31.6% central and 26.4% south.", "Of 121 surveyed reefs, 16% declined, 56% showed no net change and 28% increased in hard coral cover."], sourceIds: ["aims-2026", "noaa-crw"], confidence: "HIGH" },
    { id: "WHY", question: "WHY?", headline: "Heat, cyclones and crown-of-thorns act at different scales and times.", summary: "The transfer keeps disturbance classes and observation windows separate. A regional average cannot identify the cause of change on an individual reef without supporting evidence.", facts: [], sourceIds: ["aims-2026", "noaa-crw"], confidence: "HIGH" },
    { id: "DEPENDS_ON", question: "WHAT DEPENDS ON WHAT?", headline: "Relationship transfer remains deliberately incomplete.", summary: "The shared eight-question grammar transfers immediately, but reef-specific species/habitat dependencies must be resolved from appropriate sources before the Living Systems graph can be promoted.", facts: [], sourceIds: ["aims-2026"], confidence: "OPEN" },
    { id: "WHAT_CHANGED", question: "WHAT CHANGED?", headline: "Long-term field monitoring makes change comparable across years.", summary: "AIMS' LTMP provides a 40-year observation context. Current regional coral cover is therefore read against earlier observations rather than presented as an isolated snapshot.", facts: ["2026 is the 40th year of LTMP data."], sourceIds: ["aims-2026"], confidence: "HIGH" },
    { id: "HOW_WE_KNOW", question: "HOW DO WE KNOW?", headline: "Field surveys and satellite heat stress remain separate evidence modes.", summary: "AIMS manta-tow monitoring measures reef condition in the field; NOAA Coral Reef Watch supplies thermal-stress observations. Neither source is silently promoted into the other's claim class.", facts: [], sourceIds: ["aims-2026", "noaa-crw"], confidence: "HIGH" },
    { id: "WHO_CAN_ACT", question: "WHO CAN ACT?", headline: "OPEN FOR ACTOR RESOLUTION", summary: "Actor roles are not promoted simply because the transfer page exists. Management, science, Traditional Owner, tourism and restoration actors need explicit role evidence before action routing.", facts: [], sourceIds: [], confidence: "OPEN" },
    { id: "WHAT_CAN_BE_DONE", question: "WHAT CAN BE DONE?", headline: "OPEN FOR INTERVENTION FIT", summary: "The transfer does not manufacture a generic reef solution. Intervention fit, delivery ownership and proof latency remain separate next gates.", facts: [], sourceIds: [], confidence: "OPEN" },
  ],
  transferNote: "Transfer 02 reuses the same PlanetProof schema, PlanetProofPage, EvidenceMap, ReadingSection, SourceLedger and eight-question reading grammar. It adapts geography/source/claim bindings and adds GBR-specific evidence. Structural reuse is inspectable; elapsed time and Founder minutes remain UNKNOWN until instrumented rather than fabricated.",
  transferAudit: {
    basis: "STRUCTURAL_COMPONENT_CLASSIFICATION",
    reused: ["PlanetProof schema", "PlanetProofPage", "EvidenceMap", "ReadingSection", "SourceLedger", "eight-question reading grammar"],
    adapted: ["geography/bounds", "source bindings", "claim wording"],
    netNew: ["AIMS 2025-26 evidence binding", "NOAA Coral Reef Watch evidence binding", "GBR direct product route"],
    structuralReuseRatio: 0.5,
    founderMinutes: null,
    elapsedBuildMinutes: null,
    dependencies: ["AIMS LTMP", "NOAA Coral Reef Watch"],
    defectsOrRetries: [],
    qualityState: "TECHNICAL_TRANSFER_IMPLEMENTED_HUMAN_GOLD_UNPROVEN",
  },
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
