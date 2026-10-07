export type EvidenceState = "KNOWN" | "INTERPRETED" | "UNKNOWN";

export interface EvidenceClaim {
  id: string;
  state: EvidenceState;
  label: string;
  text: string;
  sourceLabel?: string;
  sourceUrl?: string;
  checkedAt: string;
  limitation?: string;
}

export interface NarrativeChapter {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  claims: EvidenceClaim[];
}

export interface SpeciesTruthBoundary {
  persistedBy: string;
  text: string;
  rows: { label: string; value: string }[];
  disclosure: string;
  sourceUrl: string;
}

export interface SpeciesProfile {
  id: string;
  slug: string;
  commonName: string;
  scientificName: string;
  gbifKey: number;
  rank: "SPECIES";
  taxonomicStatus: "ACCEPTED";
  kingdom: string;
  taxonSourceUrl: string;
  livingSystemId: string;
  issue: { id: string; label: string; status: "SOURCE_REVIEW_PENDING" };
  solution: { id: string; label: string; status: "SOURCE_REVIEW_PENDING" };
  context: string;
  narrativeChapters?: NarrativeChapter[];
  /** Parent-owned chapter heading. Content only; the section stays shared. */
  chaptersEyebrow?: string;
  chaptersTitle?: string;
  chaptersLede?: string;
  /** Parent-owned truth-boundary panel. Content only; the section stays shared. */
  truthBoundary?: SpeciesTruthBoundary;
  /** ATLAS journey id. Absent means the profile slug is the journey key. */
  atlasJourney?: string;
  /** Optional next-surface handoff. The action row is shared. */
  continuation?: { href: string; label: string; toProduct: string; testId: string };
  fieldEyebrow?: string;
  fieldImages?: { src: string; alt: string }[];
  fieldNote?: string;
  // ── WS-E premium presentation (optional, life-first; never replaces the
  //    KNOWN/INTERPRETED/UNKNOWN evidence model) ──
  group?: "Marine mammals" | "Land mammals" | "Birds" | "Insects" | "Other";
  /** short, plain, non-sentimental introduction */
  intro?: string;
  /** where it lives, in plain language */
  habitat?: string;
  /**
   * Blocker 9: source record that bounds the descriptive intro/habitat prose.
   * These are general descriptive summaries, not measured claims — this states
   * where the description comes from, when it was checked, and its limitation.
   */
  descriptorSource?: { source: string; sourceUrl: string; checkedAt: string; note: string };
  /** flagship journey this species strengthens */
  journey?: "orca" | "amazonia" | "oslofjord";
  /** related mission slug */
  missionSlug?: string;
  /** region tag used for filtering (e.g. Norwegian marine) */
  region?: string;
  /**
   * ORCA-04: source-backed public claims for non-Orca profiles. Each is labelled
   * KNOWN / INTERPRETED / UNKNOWN, carries an authority + URL, and states its own
   * boundary. Never surfaced as a settled 4PLANET assertion. Profiles with
   * narrativeChapters use that shared chapter model for the same section.
   */
  publicClaims?: {
    state: "KNOWN" | "INTERPRETED" | "UNKNOWN";
    text: string;
    source: string;
    sourceUrl: string;
    checkedAt: string;
    limitation: string;
  }[];
}

const ORCA_CHAPTERS: NarrativeChapter[] = [
  {
    id: "whales-01-family-culture",
    eyebrow: "WH4LES_ 01 · FAMILY & CULTURE",
    title: "A whale is never only a whale.",
    summary: "Orcas live through durable social relationships. Their groups can differ in calls, diet, behaviour and habitat use, so a species-level label does not describe every population.",
    claims: [
      {
        id: "orca-social-groups",
        state: "KNOWN",
        label: "Population-specific lives",
        text: "Killer whale populations can have distinct diets, behaviours, social structures and habitat use.",
        sourceLabel: "NOAA Fisheries — Killer Whale",
        sourceUrl: "https://www.fisheries.noaa.gov/species/killer-whale",
        checkedAt: "2026-08-03",
        limitation: "This is a population-level statement. It must not be used to infer the behaviour of an unidentified individual or occurrence record.",
      },
      {
        id: "orca-calls-culture",
        state: "KNOWN",
        label: "Calls carry group identity",
        text: "Some killer whale groups use distinct call structures that help maintain group cohesion and separate social traditions.",
        sourceLabel: "International Whaling Commission — Killer whale",
        sourceUrl: "https://iwc.int/about-whales/whale-species/killer-whale",
        checkedAt: "2026-08-03",
        limitation: "The public prototype does not identify dialect, pod or ecotype from a generic species record.",
      },
    ],
  },
  {
    id: "whales-02-food-web",
    eyebrow: "WH4LES_ 02 · FOOD WEB",
    title: "What an orca eats depends on who it is.",
    summary: "The species has an exceptionally varied diet, but populations and ecotypes often specialise. Food connects the animal to prey, fisheries, habitat quality and human decisions.",
    claims: [
      {
        id: "orca-diet-specialisation",
        state: "KNOWN",
        label: "Specialised foraging",
        text: "Different killer whale populations can specialise in different prey and hunting strategies.",
        sourceLabel: "NOAA Fisheries — Killer Whale",
        sourceUrl: "https://www.fisheries.noaa.gov/species/killer-whale",
        checkedAt: "2026-08-03",
        limitation: "A GBIF occurrence does not reveal diet, prey availability or ecological condition.",
      },
      {
        id: "orca-food-web-interpretation",
        state: "INTERPRETED",
        label: "A relationship, not a diagnosis",
        text: "Food-web context can help explain why prey and habitat matter, but it is not evidence that a specific observed whale is food-limited.",
        checkedAt: "2026-08-03",
        limitation: "4PLANET interpretation. Requires local population and prey evidence before any stronger public claim.",
      },
    ],
  },
  {
    id: "whales-03-place-record",
    eyebrow: "WH4LES_ 03 · PLACE & RECORD",
    title: "A point on a map is a record of observation.",
    summary: "Occurrence data can connect a taxon to a reported place and date. It cannot, by itself, establish range, abundance, population trend, live location or ecological health.",
    claims: [
      {
        id: "orca-taxonomy",
        state: "KNOWN",
        label: "Accepted taxon identity",
        text: "The prototype preserves the accepted GBIF taxon identity for Orcinus orca across SPECIES and ATLAS.",
        sourceLabel: "GBIF — Orcinus orca",
        sourceUrl: "https://www.gbif.org/species/2440483",
        checkedAt: "2026-08-03",
        limitation: "Taxonomic acceptance is not a conservation-status or population assessment.",
      },
      {
        id: "orca-record-unknowns",
        state: "UNKNOWN",
        label: "Unknown until a record is inspected",
        text: "Population, ecotype, pod, abundance, health and present location remain unknown unless a specific source record supports them.",
        checkedAt: "2026-08-03",
        limitation: "Fail-closed rule: the interface must show unknown rather than infer from species identity or map proximity.",
      },
    ],
  },
  {
    id: "whales-04-pressure-response",
    eyebrow: "WH4LES_ 04 · PRESSURE & RESPONSE",
    title: "Threats are real — and population-specific.",
    summary: "Food limitation, contaminants, vessel disturbance and underwater sound affect some killer whale populations. Responsible action begins by identifying the population, place, evidence and competent actor.",
    claims: [
      {
        id: "orca-threats",
        state: "KNOWN",
        label: "Documented pressure categories",
        text: "NOAA identifies food limitations, chemical contaminants, vessel traffic and sound among threats faced by some killer whale populations.",
        sourceLabel: "NOAA Fisheries — Killer Whale",
        sourceUrl: "https://www.fisheries.noaa.gov/species/killer-whale",
        checkedAt: "2026-08-03",
        limitation: "Do not transfer a threat assessment from one population to another without supporting evidence.",
      },
      {
        id: "orca-response-hold",
        state: "UNKNOWN",
        label: "No generic intervention claim",
        text: "The prototype does not claim that one universal intervention will protect all orcas.",
        checkedAt: "2026-08-03",
        limitation: "A response path requires population-specific science, responsible institutions and an evidence-backed implementation partner.",
      },
    ],
  },
];

const JAGUAR_CHAPTERS: NarrativeChapter[] = [
  {
    id: "jaguar-01-identity",
    eyebrow: "JAGUAR · 01 IDENTITY",
    title: "The largest cat in the Americas.",
    summary: "This is a species-level description. It does not describe the size, sex, age or health of any one observed animal.",
    claims: [
      {
        id: "jaguar-largest-cat",
        state: "KNOWN",
        label: "The largest cat in the Americas",
        text: "The jaguar is the largest cat in the Americas — a muscular, mostly solitary predator.",
        sourceLabel: "USFWS — Jaguar",
        sourceUrl: "https://www.fws.gov/species/jaguar-panthera-onca",
        checkedAt: "2026-10-03",
        limitation: "Species-level description. Not evidence about the size, sex, age or health of an observed individual.",
      },
      {
        id: "jaguar-local-unknown",
        state: "UNKNOWN",
        label: "Local condition",
        text: "Current local abundance, population trend, corridor use, ecosystem health and live location remain UNKNOWN unless a separate place-and-time evidence object supports them.",
        checkedAt: "2026-10-03",
        limitation: "A species profile cannot fill these unknowns.",
      },
    ],
  },
  {
    id: "jaguar-02-habitat",
    eyebrow: "JAGUAR · 02 HABITAT",
    title: "One species, many habitats.",
    summary: "Documented environments include tropical forest, swampy savanna, wetland, dry forest and thorn scrub. Range-wide habitat use does not prove current occupancy at a specific place.",
    claims: [
      {
        id: "jaguar-habitats",
        state: "KNOWN",
        label: "Many habitats, often near water",
        text: "Jaguars use tropical forests, swampy grasslands and savannas, wetlands, dry forest and thorn scrub, and are often associated with water.",
        sourceLabel: "USFWS and IUCN SSC Cat Specialist Group",
        sourceUrl: "https://www.catsg.org/living-species-jaguar",
        checkedAt: "2026-10-03",
        limitation: "Range-wide habitat use does not prove current occupancy, corridor use or condition at a specific place.",
      },
    ],
  },
  {
    id: "jaguar-03-ecology",
    eyebrow: "JAGUAR · 03 ECOLOGY",
    title: "A flexible predator.",
    summary: "USFWS reports a wide range of prey and says jaguars generally favour medium-to-large prey while adapting to the fauna of different biomes.",
    claims: [
      {
        id: "jaguar-prey",
        state: "KNOWN",
        label: "Wide prey range",
        text: "USFWS reports that jaguars take a wide range of prey, generally favouring medium-to-large prey and adapting to the fauna of different biomes.",
        sourceLabel: "USFWS — Jaguar",
        sourceUrl: "https://www.fws.gov/species/jaguar-panthera-onca",
        checkedAt: "2026-10-03",
        limitation: "Do not infer local prey, diet, predation pressure or behaviour from this species profile or from an occurrence point.",
      },
    ],
  },
  {
    id: "jaguar-04-place",
    eyebrow: "JAGUAR · 04 PLACE & RECORD",
    title: "A reported point is not a range.",
    summary: "Reported observations are evidence of reporting at a place and time, not a complete range map or a live animal position.",
    claims: [
      {
        id: "jaguar-occurrence-boundary",
        state: "UNKNOWN",
        label: "Occurrence is not range",
        text: "An occurrence point does not establish range, abundance, population trend, corridor use or a live location.",
        sourceLabel: "GBIF — Panthera onca",
        sourceUrl: "https://www.gbif.org/species/5219426",
        checkedAt: "2026-10-03",
        limitation: "Historical occurrence data remains a report of a record, not a current animal position.",
      },
    ],
  },
  {
    id: "jaguar-05-status",
    eyebrow: "JAGUAR · 05 STATUS & PRESSURE",
    title: "Global category; regional realities differ.",
    summary: "The IUCN SSC Cat Specialist Group identifies the species as Near Threatened and says regional status varies. A global category is not a local population assessment.",
    claims: [
      {
        id: "jaguar-status",
        state: "KNOWN",
        label: "Near Threatened, with regional differences",
        text: "The IUCN SSC Cat Specialist Group identifies the jaguar as Near Threatened and states that regional status varies. The page cites Red List version 2024-2.",
        sourceLabel: "IUCN SSC Cat Specialist Group — Jaguar",
        sourceUrl: "https://www.catsg.org/living-species-jaguar",
        checkedAt: "2026-10-03",
        limitation: "Never convert a global category into a local population assessment.",
      },
      {
        id: "jaguar-population-unknown",
        state: "UNKNOWN",
        label: "No single global population number",
        text: "A single global population number remains UNKNOWN until published estimates are reconciled by method and date.",
        checkedAt: "2026-10-03",
        limitation: "Conflicting published estimates are not silently averaged or selected on this page.",
      },
      {
        id: "jaguar-pressures",
        state: "KNOWN",
        label: "Pressures differ by place",
        text: "Documented pressures include habitat loss and fragmentation, prey reduction, retaliatory killing, trophy and illegal trade, and competition perceptions.",
        sourceLabel: "USFWS and IUCN SSC Cat Specialist Group",
        sourceUrl: "https://www.fws.gov/species/jaguar-panthera-onca",
        checkedAt: "2026-10-03",
        limitation: "This page does not quantify current pressure intensity or conservation outcome at any named site.",
      },
    ],
  },
];

export const SPECIES_PROFILES: SpeciesProfile[] = [
  {
    id: "taxon:gbif:2440483",
    slug: "orca",
    commonName: "Orca",
    scientificName: "Orcinus orca",
    gbifKey: 2440483,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/2440483",
    livingSystemId: "living-system:4p:coastal-sea",
    issue: { id: "issue:4p:marine-pressure-review", label: "Marine pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:protected-restoration", label: "Protection and restoration", status: "SOURCE_REVIEW_PENDING" },
    context: "Working execution profile. Taxonomy is source-grounded; ecological claims remain bounded by population, place and evidence.",
    narrativeChapters: ORCA_CHAPTERS,
    chaptersEyebrow: "WH4LES_ · FOUR EVIDENCE CHAPTERS",
    chaptersTitle: "From one animal to the living relationships around it.",
    chaptersLede: "Every statement is labelled KNOWN, INTERPRETED or UNKNOWN. Species-level evidence is never silently converted into a claim about one population, pod or individual.",
    truthBoundary: {
      persistedBy: "BUNDLED_FIXTURE",
      text: "This record shows that a human observation of an orca was published to GBIF at the stated coordinates and date. It does not establish range, abundance, population trend, place membership or ecological change.",
      rows: [
        { label: "SOURCE RECORD", value: "5939349319" },
        { label: "OBSERVATION", value: "observation:gbif:5939349319" },
        { label: "SIGNAL", value: "NONE CREATED" },
        { label: "INTERPRETATION", value: "UNREVIEWED" },
      ],
      disclosure: "Bundled evidence fixture. The Supabase/PostGIS contract and seed are included, but hosted persistence was not exercised because no staging secret was supplied.",
      sourceUrl: "https://www.gbif.org/occurrence/5939349319",
    },
    group: "Marine mammals",
    intro: "The orca is the largest member of the dolphin family — a fast, social, wide-ranging predator found in every ocean. Populations differ in prey, behaviour and calls, so a species label does not describe every group.",
    habitat: "All oceans, from polar seas to the tropics. Coastal groups follow prey along shelves and fjords; others range across open water.",
    descriptorSource: { source: "NOAA Fisheries & GBIF", sourceUrl: "https://www.fisheries.noaa.gov/species/killer-whale", checkedAt: "2026-08-06", note: "General descriptive summary of identity and habitat; not a measured population or range claim." },
    journey: "orca",
    missionSlug: "wh4les",
    atlasJourney: "orca-gbif",
    continuation: { href: "/livingsystems/species/orca/", label: "CONTINUE TO LIVING SYSTEMS →", toProduct: "living_systems", testId: "species-to-ls" },
    fieldEyebrow: "FROM THE FIELD · FOUNDER-SUPPLIED",
    fieldImages: [
      { src: "/assets/species/orca/detail-fjord.jpg", alt: "A wild orca surfacing off a green Norwegian coast" },
      { src: "/assets/species/orca/detail-pod.jpg", alt: "A pod of orcas surfacing together" },
      { src: "/assets/species/orca/detail-spyhop.jpg", alt: "An orca spy-hopping, head raised above the surface" },
      { src: "/assets/species/orca/detail-ice.jpg", alt: "Orcas spy-hopping among Antarctic pack ice" },
    ],
    fieldNote: "Real photographs of wild orcas, founder-supplied and rights-cleared. These are illustrative of the species, not tied to a specific observation record.",
  },
  {
    id: "taxon:gbif:5220086",
    slug: "humpback-whale",
    commonName: "Humpback Whale",
    scientificName: "Megaptera novaeangliae",
    gbifKey: 5220086,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/5220086",
    livingSystemId: "living-system:4p:whale-pump",
    issue: { id: "issue:4p:marine-pressure-review", label: "Marine pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:protected-restoration", label: "Protection and restoration", status: "SOURCE_REVIEW_PENDING" },
    context: "Working execution profile. The accepted GBIF key corrects an earlier prototype identity that pointed to Blue Whale.",
    group: "Marine mammals",
    intro: "A large baleen whale known for long migrations, complex songs and acrobatic surface behaviour. It feeds in cold, productive waters and breeds in warmer seas.",
    habitat: "Worldwide. Feeds at high latitudes in summer and migrates to warmer breeding waters — one of the longest migrations of any mammal.",
    descriptorSource: { source: "NOAA Fisheries", sourceUrl: "https://www.fisheries.noaa.gov/species/humpback-whale", checkedAt: "2026-08-06", note: "General descriptive summary of identity and habitat; not a measured population or range claim." },
    journey: "orca",
    missionSlug: "wh4les",
    publicClaims: [
      { state: "KNOWN", text: "The humpback is assessed globally as Least Concern, following recovery in several regions after the end of most commercial whaling.", source: "IUCN Red List", sourceUrl: "https://www.iucnredlist.org/species/13006/50362794", checkedAt: "2026-08-05", limitation: "A global category; some regional subpopulations remain depleted or separately assessed." },
      { state: "KNOWN", text: "Humpbacks undertake some of the longest migrations of any mammal, between high-latitude feeding grounds and warmer breeding waters.", source: "NOAA Fisheries species profile", sourceUrl: "https://www.fisheries.noaa.gov/species/humpback-whale", checkedAt: "2026-08-05", limitation: "Migration patterns differ by population; not every individual follows the same route." },
      { state: "INTERPRETED", text: "Entanglement in fishing gear and vessel strike are widely studied pressures on humpbacks.", source: "NOAA Fisheries", sourceUrl: "https://www.fisheries.noaa.gov/species/humpback-whale", checkedAt: "2026-08-05", limitation: "Pressure intensity is region-specific and not quantified here." },
    ],
  },
  {
    id: "taxon:gbif:1341976",
    slug: "western-honey-bee",
    commonName: "Western Honey Bee",
    scientificName: "Apis mellifera",
    gbifKey: 1341976,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/1341976",
    livingSystemId: "living-system:4p:pollination",
    issue: { id: "issue:4p:pollinator-pressure-review", label: "Pollinator pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:pollinator-corridors", label: "Pollinator habitat corridors", status: "SOURCE_REVIEW_PENDING" },
    context: "Working execution profile. Taxonomy is source-grounded; relationship and intervention claims remain unreviewed prototype content.",
    group: "Insects",
    intro: "One of the most widely distributed and studied pollinators, kept and wild across most of the world.",
    habitat: "Nearly worldwide alongside human landscapes and flowering plants.",
    descriptorSource: { source: "GBIF", sourceUrl: "https://www.gbif.org/species/1341976", checkedAt: "2026-08-06", note: "General descriptive summary of identity and habitat; not a measured population or range claim." },
    journey: "amazonia",
    missionSlug: "food",
  },
  {
    id: "taxon:gbif:2440617",
    slug: "sperm-whale",
    commonName: "Sperm Whale",
    scientificName: "Physeter macrocephalus",
    gbifKey: 2440617,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/2440617",
    livingSystemId: "living-system:4p:deep-ocean",
    issue: { id: "issue:4p:marine-pressure-review", label: "Marine pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:protected-restoration", label: "Protection and restoration", status: "SOURCE_REVIEW_PENDING" },
    context: "Working execution profile. The accepted GBIF key 2440617 is the correct Physeter macrocephalus identity.",
    group: "Marine mammals",
    intro: "The largest toothed predator on Earth, diving to great depths to hunt squid, carrying the most powerful biological sonar known.",
    habitat: "Deep waters of all oceans; females and young stay in warmer seas while males range to polar waters.",
    descriptorSource: { source: "NOAA Fisheries", sourceUrl: "https://www.fisheries.noaa.gov/species/sperm-whale", checkedAt: "2026-08-06", note: "General descriptive summary of identity and habitat; not a measured population or range claim." },
    journey: "orca",
    missionSlug: "wh4les",
    publicClaims: [
      { state: "KNOWN", text: "The sperm whale is assessed globally as Vulnerable on the IUCN Red List.", source: "IUCN Red List", sourceUrl: "https://www.iucnredlist.org/species/41755/160983555", checkedAt: "2026-08-05", limitation: "A global category; trend and status vary by region." },
      { state: "KNOWN", text: "It is the largest toothed predator and performs among the deepest dives of any mammal to hunt squid.", source: "NOAA Fisheries species profile", sourceUrl: "https://www.fisheries.noaa.gov/species/sperm-whale", checkedAt: "2026-08-05", limitation: "Dive depth and duration figures vary between studies and individuals." },
      { state: "INTERPRETED", text: "Entanglement, vessel strike and ocean noise are studied pressures for the species.", source: "NOAA Fisheries", sourceUrl: "https://www.fisheries.noaa.gov/species/sperm-whale", checkedAt: "2026-08-05", limitation: "Relative importance differs by population and region." },
    ],
  },
  {
    id: "taxon:gbif:2440739",
    slug: "harbour-porpoise",
    commonName: "Harbour Porpoise",
    scientificName: "Phocoena phocoena",
    gbifKey: 2440739,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/2440739",
    livingSystemId: "living-system:4p:coastal-sea",
    issue: { id: "issue:4p:marine-pressure-review", label: "Marine pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:protected-restoration", label: "Protection and restoration", status: "SOURCE_REVIEW_PENDING" },
    context: "Working execution profile. A small coastal cetacean relevant to the Oslofjord journey.",
    group: "Marine mammals",
    intro: "One of the smallest cetaceans — a shy, coastal animal common in cool northern waters, including the Oslofjord region (Norwegian: nise).",
    habitat: "Cool coastal waters of the Northern Hemisphere; frequent in Norwegian fjords and the North Sea.",
    descriptorSource: { source: "NOAA Fisheries & GBIF", sourceUrl: "https://www.fisheries.noaa.gov/species/harbor-porpoise", checkedAt: "2026-08-06", note: "General descriptive summary of identity and habitat; not a measured population or range claim." },
    journey: "oslofjord",
    missionSlug: "rewild-marine",
    region: "Norwegian marine",
    publicClaims: [
      { state: "KNOWN", text: "The harbour porpoise is assessed globally as Least Concern, but several regional populations are separately assessed and of concern.", source: "IUCN Red List", sourceUrl: "https://www.iucnredlist.org/species/17027/50369903", checkedAt: "2026-08-05", limitation: "The global category masks at-risk regional subpopulations." },
      { state: "KNOWN", text: "Bycatch in gillnets is one of the most widely documented pressures on the species.", source: "NOAA Fisheries species profile", sourceUrl: "https://www.fisheries.noaa.gov/species/harbor-porpoise", checkedAt: "2026-08-05", limitation: "Bycatch levels vary strongly by fishery and area." },
      { state: "INTERPRETED", text: "It is a shy, coastal cetacean regularly recorded in Norwegian fjords and the North Sea, relevant to the Oslofjord.", source: "GBIF occurrence records", sourceUrl: "https://www.gbif.org/species/2440739", checkedAt: "2026-08-05", limitation: "Occurrence records show reporting, not abundance or current position." },
    ],
  },
  {
    id: "taxon:gbif:2440601",
    slug: "bottlenose-dolphin",
    commonName: "Common Bottlenose Dolphin",
    scientificName: "Tursiops truncatus",
    gbifKey: 2440601,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/2440601",
    livingSystemId: "living-system:4p:coastal-sea",
    issue: { id: "issue:4p:marine-pressure-review", label: "Marine pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:protected-restoration", label: "Protection and restoration", status: "SOURCE_REVIEW_PENDING" },
    context: "Working execution profile. A widespread, highly social dolphin of coastal and offshore waters.",
    group: "Marine mammals",
    intro: "A familiar, highly social dolphin found in coastal and offshore waters worldwide, known for adaptable feeding and strong group behaviour.",
    habitat: "Temperate and tropical seas worldwide, from shallow coasts and estuaries to the open ocean.",
    descriptorSource: { source: "NOAA Fisheries", sourceUrl: "https://www.fisheries.noaa.gov/species/common-bottlenose-dolphin", checkedAt: "2026-08-06", note: "General descriptive summary of identity and habitat; not a measured population or range claim." },
    journey: "orca",
    missionSlug: "wh4les",
    publicClaims: [
      { state: "KNOWN", text: "The common bottlenose dolphin is assessed globally as Least Concern.", source: "IUCN Red List", sourceUrl: "https://www.iucnredlist.org/species/22563/156932432", checkedAt: "2026-08-05", limitation: "A global category; some local populations face specific threats." },
      { state: "KNOWN", text: "It is a highly social, adaptable dolphin found in coastal and offshore waters worldwide.", source: "NOAA Fisheries species profile", sourceUrl: "https://www.fisheries.noaa.gov/species/common-bottlenose-dolphin", checkedAt: "2026-08-05", limitation: "Coastal and offshore forms differ in ecology and exposure to pressures." },
      { state: "INTERPRETED", text: "Coastal populations can be exposed to pollution, habitat disturbance and fishery interactions.", source: "NOAA Fisheries", sourceUrl: "https://www.fisheries.noaa.gov/species/common-bottlenose-dolphin", checkedAt: "2026-08-05", limitation: "Exposure is population- and location-specific." },
    ],
  },
  {
    id: "taxon:gbif:2378026",
    slug: "atlantic-cod",
    commonName: "Atlantic Cod",
    scientificName: "Gadus morhua",
    gbifKey: 2378026,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/2378026",
    livingSystemId: "living-system:4p:coastal-sea",
    issue: { id: "issue:4p:marine-pressure-review", label: "Marine pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:protected-restoration", label: "Protection and restoration", status: "SOURCE_REVIEW_PENDING" },
    context: "Working execution profile. A keystone commercial fish of the North Atlantic and Norwegian waters (Norwegian: torsk).",
    group: "Other",
    intro: "A cold-water fish central to North Atlantic ecosystems and to Norwegian fisheries history. Local populations, including in the Oslofjord, have seen major change.",
    habitat: "Cool North Atlantic shelf waters; the Oslofjord holds a distinct, much-reduced coastal cod.",
    descriptorSource: { source: "GBIF & ICES", sourceUrl: "https://www.gbif.org/species/2378026", checkedAt: "2026-08-06", note: "General descriptive summary of identity and habitat; not a measured population or range claim." },
    journey: "oslofjord",
    missionSlug: "rewild-marine",
    region: "Norwegian marine",
  },
  {
    id: "taxon:gbif:2286380",
    slug: "blue-mussel",
    commonName: "Blue Mussel",
    scientificName: "Mytilus edulis",
    gbifKey: 2286380,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/2286380",
    livingSystemId: "living-system:4p:coastal-sea",
    issue: { id: "issue:4p:marine-pressure-review", label: "Marine pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:protected-restoration", label: "Protection and restoration", status: "SOURCE_REVIEW_PENDING" },
    context: "Working execution profile. A filter-feeding shellfish that shapes coastal water quality (Norwegian: blåskjell).",
    group: "Other",
    intro: "A filter-feeding shellfish that forms dense beds on northern coasts, cleaning water and building habitat for other life.",
    habitat: "Rocky and soft-bottom coasts across the North Atlantic, including the Oslofjord.",
    descriptorSource: { source: "GBIF", sourceUrl: "https://www.gbif.org/species/2286380", checkedAt: "2026-08-06", note: "General descriptive summary of identity and habitat; not a measured population or range claim." },
    journey: "oslofjord",
    missionSlug: "rewild-marine",
    region: "Norwegian marine",
  },
  {
    id: "taxon:gbif:2435350",
    slug: "african-savanna-elephant",
    commonName: "African Savanna Elephant",
    scientificName: "Loxodonta africana",
    gbifKey: 2435350,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/2435350",
    livingSystemId: "living-system:4p:grassland-savanna",
    issue: { id: "issue:4p:habitat-fragmentation-review", label: "Habitat fragmentation review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:connected-landscapes", label: "Connected landscapes and coexistence", status: "SOURCE_REVIEW_PENDING" },
    context: "Kenya discovery profile. Taxonomy, status and Kenya habitat context are source-grounded; observation points remain records, not range or live tracking.",
    group: "Land mammals",
    intro: "The African savanna elephant is an accepted species assessed as Endangered. In Kenya, elephant conservation spans large connected landscapes where habitat loss, poaching and human–elephant conflict remain important pressures.",
    habitat: "Across its wider African range the species uses varied landscapes. In Kenya, Amboseli illustrates connected open grass plains, acacia woodland, thorn bush, swamps and marshes used by elephant herds.",
    descriptorSource: { source: "GBIF & Kenya Wildlife Service", sourceUrl: "https://kws.go.ke/park/amboseli-national-park/", checkedAt: "2026-10-01", note: "Amboseli is a Kenya habitat example, not a complete species-range description. Occurrence records do not establish abundance or current position." },
    region: "Kenya / sub-Saharan Africa",
    publicClaims: [
      { state: "KNOWN", text: "GBIF's current taxon page identifies Loxodonta africana as an accepted species and displays an IUCN category of Endangered.", source: "GBIF — Loxodonta africana", sourceUrl: "https://www.gbif.org/species/2435350", checkedAt: "2026-10-01", limitation: "A global category does not describe every local population or current site condition." },
      { state: "KNOWN", text: "Kenya Wildlife Service describes Amboseli as open grass plains, acacia woodlands, thorny bushland, swamps and marshes supporting large elephant herds.", source: "Kenya Wildlife Service — Amboseli National Park", sourceUrl: "https://kws.go.ke/park/amboseli-national-park/", checkedAt: "2026-10-01", limitation: "Amboseli is one ecosystem example and must not be treated as the species' complete habitat or range." },
      { state: "KNOWN", text: "Habitat loss, poaching and human–elephant conflict are documented pressures on African elephants.", source: "U.S. Fish & Wildlife Service — African Elephant", sourceUrl: "https://www.fws.gov/cites/species/african-elephant", checkedAt: "2026-10-01", limitation: "Pressure intensity and causes vary by place and population." },
    ],
  },
  {
    id: "taxon:gbif:5219404",
    slug: "lion",
    commonName: "Lion",
    scientificName: "Panthera leo",
    gbifKey: 5219404,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/5219404",
    livingSystemId: "living-system:4p:grassland-savanna",
    issue: { id: "issue:4p:large-carnivore-pressure-review", label: "Large carnivore pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:coexistence-corridors", label: "Coexistence and connected habitat", status: "SOURCE_REVIEW_PENDING" },
    context: "Kenya discovery profile. Global taxon/status and current Kenya census/context are source-labelled; no occurrence record is treated as a population estimate.",
    group: "Land mammals",
    intro: "The lion is a wide-ranging large cat and apex carnivore assessed globally as Vulnerable. Kenya's national recovery work focuses on viable populations, healthy ecosystems and coexistence with people.",
    habitat: "Lions need large landscapes with sufficient prey. In Kenya they occur across protected and community landscapes, including Maasai Mara, Tsavo, Laikipia and other areas.",
    descriptorSource: { source: "Kenya Wildlife Service & GBIF", sourceUrl: "https://kws.go.ke/7501-2/", checkedAt: "2026-10-01", note: "Kenya-specific context is distinct from the global species assessment. National census figures are source-reported, not inferred from occurrence data." },
    region: "Kenya / Africa",
    publicClaims: [
      { state: "KNOWN", text: "GBIF's current taxon page identifies Panthera leo as an accepted species and displays an IUCN category of Vulnerable.", source: "GBIF — Panthera leo", sourceUrl: "https://www.gbif.org/species/5219404", checkedAt: "2026-10-01", limitation: "The global assessment does not establish the condition of a specific local population." },
      { state: "KNOWN", text: "Kenya Wildlife Service reports 2,512 lions in the 2025 National Wildlife Census, compared with 2,589 in 2021.", source: "Kenya Wildlife Service — World Lion Day 2026", sourceUrl: "https://kws.go.ke/7501-2/", checkedAt: "2026-10-01", limitation: "These are KWS-reported national census figures; methods, detectability and local distribution matter when interpreting change." },
      { state: "KNOWN", text: "Kenya's 2020–2030 recovery plan describes lions as wide-ranging animals requiring large areas and a stable prey base, with human conflict a major conservation challenge.", source: "Kenya Wildlife Service — National Recovery and Action Plan for Lion and Spotted Hyena", sourceUrl: "https://kws.go.ke/wp-content/uploads/2026/02/LION_2020-2030.pdf", checkedAt: "2026-10-01", limitation: "Management context is Kenya-specific and does not describe all lion populations across Africa and Asia." },
    ],
  },
  {
    id: "taxon:gbif:2435270",
    slug: "cheetah",
    commonName: "Cheetah",
    scientificName: "Acinonyx jubatus",
    gbifKey: 2435270,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/2435270",
    livingSystemId: "living-system:4p:grassland-savanna",
    issue: { id: "issue:4p:habitat-fragmentation-review", label: "Habitat fragmentation review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:connected-landscapes", label: "Connected landscapes and coexistence", status: "SOURCE_REVIEW_PENDING" },
    context: "Kenya discovery profile. Species identity and global status are source-grounded; Kenya observations and historical sighting maps never become range, abundance or residency claims.",
    group: "Land mammals",
    intro: "The cheetah is an accepted species assessed globally as Vulnerable. Its conservation depends on large connected landscapes because populations occur at low density and face habitat loss, fragmentation and conflict.",
    habitat: "Cheetahs use open and semi-open landscapes including grassland, savanna, shrubland and desert. In Kenya they can occur both inside and outside protected areas where prey and connectivity remain sufficient.",
    descriptorSource: { source: "IUCN SSC Cat Specialist Group & CMS", sourceUrl: "https://www.catsg.org/living-species-cheetah", checkedAt: "2026-10-01", note: "Species-level habitat context does not prove local presence. Historical Kenya sighting records are not current range or residency evidence." },
    region: "Kenya / Africa",
    publicClaims: [
      { state: "KNOWN", text: "GBIF identifies Acinonyx jubatus as an accepted species and displays an IUCN category of Vulnerable.", source: "GBIF — Acinonyx jubatus", sourceUrl: "https://www.gbif.org/species/2435270", checkedAt: "2026-10-01", limitation: "The global category does not establish local abundance or trend." },
      { state: "KNOWN", text: "CMS identifies habitat degradation, severe drought, conflict and poaching among major pressures on cheetahs and lists Kenya among range states.", source: "Convention on Migratory Species — Acinonyx jubatus", sourceUrl: "https://www.cms.int/species/acinonyx-jubatus", checkedAt: "2026-10-01", limitation: "Threat intensity and relevance vary by location and population." },
      { state: "KNOWN", text: "Kenya's cheetah strategy explicitly warns that a sighting proves occurrence at a place and time but does not by itself prove a resident or breeding population.", source: "Kenya Wildlife Service — Conservation and Management Strategy for Cheetah and Wild Dogs in Kenya", sourceUrl: "https://www.kws.go.ke/sites/default/files/2019-11/Conservation%20and%20Management%20Strategy%20for%20Cheetah%20and%20Wildogs%20in%20Kenya_0.pdf", checkedAt: "2026-10-01", limitation: "The strategy's sighting maps are historical; the inference boundary remains useful but the records must not be presented as current distribution." },
    ],
  },

  {
    id:"taxon:gbif:2440735", slug:"blue-whale", commonName:"Blue Whale", scientificName:"Balaenoptera musculus", gbifKey:2440735,
    rank:"SPECIES", taxonomicStatus:"ACCEPTED", kingdom:"Animalia", taxonSourceUrl:"https://www.gbif.org/species/2440735",
    livingSystemId:"living-system:4p:deep-ocean", issue:{id:"issue:4p:marine-pressure-review",label:"Marine pressure review",status:"SOURCE_REVIEW_PENDING"}, solution:{id:"solution:4p:protected-restoration",label:"Protection and restoration",status:"SOURCE_REVIEW_PENDING"},
    context:"Global discovery profile. Source-grounded description is separate from reported occurrence records.",
    group:"Marine mammals", intro:"The blue whale is the largest animal on Earth. NOAA describes it as an endangered baleen whale found in all oceans except the Arctic.", habitat:"Oceanic waters across most of the world's oceans; habitat use and movement vary among populations and seasons.",
    descriptorSource:{source:"NOAA Fisheries",sourceUrl:"https://www.fisheries.noaa.gov/species/blue-whale",checkedAt:"2026-10-01",note:"Range-wide species description; not a local abundance, trend or live-position claim."}, region:"Global ocean",
    publicClaims:[
      {state:"KNOWN",text:"NOAA Fisheries describes blue whales from all oceans except the Arctic Ocean.",source:"NOAA Fisheries — Blue Whale",sourceUrl:"https://www.fisheries.noaa.gov/species/blue-whale",checkedAt:"2026-10-01",limitation:"Global description does not establish local presence at a particular time."},
      {state:"KNOWN",text:"NOAA lists vessel strikes, fishing-gear entanglement and ocean noise among documented pressures.",source:"NOAA Fisheries — Blue Whale",sourceUrl:"https://www.fisheries.noaa.gov/species/blue-whale",checkedAt:"2026-10-01",limitation:"Pressure intensity differs by population, place and time."}
    ],
  },
  {
    id:"taxon:gbif:5219461", slug:"asian-elephant", commonName:"Asian Elephant", scientificName:"Elephas maximus", gbifKey:5219461,
    rank:"SPECIES", taxonomicStatus:"ACCEPTED", kingdom:"Animalia", taxonSourceUrl:"https://www.gbif.org/species/5219461",
    livingSystemId:"living-system:4p:tropical-forest", issue:{id:"issue:4p:habitat-fragmentation-review",label:"Habitat fragmentation review",status:"SOURCE_REVIEW_PENDING"}, solution:{id:"solution:4p:connected-landscapes",label:"Connected landscapes and coexistence",status:"SOURCE_REVIEW_PENDING"},
    context:"Asian discovery profile. Range-wide source context stays distinct from local population condition.",
    group:"Land mammals", intro:"Asian elephants use forest and grassland landscapes across a fragmented range in Asia. Habitat loss and fragmentation, conflict and poaching are documented pressures.", habitat:"Forests and grasslands across remaining Asian range countries; local habitat use varies by landscape and population.",
    descriptorSource:{source:"U.S. Fish & Wildlife Service",sourceUrl:"https://www.fws.gov/species/asian-elephant-elephas-maximus",checkedAt:"2026-10-01",note:"Range-wide description; not a local population estimate or distribution map."}, region:"Asia",
    publicClaims:[
      {state:"KNOWN",text:"U.S. Fish & Wildlife Service describes Asian elephants as an endangered species of Asian forests and grasslands.",source:"U.S. Fish & Wildlife Service — Asian Elephant",sourceUrl:"https://www.fws.gov/species/asian-elephant-elephas-maximus",checkedAt:"2026-10-01",limitation:"Species-level context does not describe every local population."},
      {state:"KNOWN",text:"Habitat loss and fragmentation, human-elephant conflict and poaching are documented pressures.",source:"U.S. Fish & Wildlife Service — Asian Elephant",sourceUrl:"https://www.fws.gov/species/asian-elephant-elephas-maximus",checkedAt:"2026-10-01",limitation:"Pressure intensity differs across landscapes."}
    ],
  },
  {
    id:"taxon:gbif:5219416", slug:"tiger", commonName:"Tiger", scientificName:"Panthera tigris", gbifKey:5219416,
    rank:"SPECIES", taxonomicStatus:"ACCEPTED", kingdom:"Animalia", taxonSourceUrl:"https://www.gbif.org/species/5219416",
    livingSystemId:"living-system:4p:tropical-forest", issue:{id:"issue:4p:large-carnivore-pressure-review",label:"Large carnivore pressure review",status:"SOURCE_REVIEW_PENDING"}, solution:{id:"solution:4p:connected-landscapes",label:"Connected habitat and prey protection",status:"SOURCE_REVIEW_PENDING"},
    context:"Global discovery profile. Subspecies taxonomy and regional conditions remain explicit uncertainties.",
    group:"Land mammals", intro:"The tiger is the largest living cat species. The IUCN SSC Cat Specialist Group lists it as Endangered and documents habitat loss, fragmentation, prey depletion and illegal hunting/trade among major pressures.", habitat:"Tropical and subtropical forests, mangroves, grasslands and temperate forests across remaining Asian range.",
    descriptorSource:{source:"IUCN SSC Cat Specialist Group",sourceUrl:"https://www.catsg.org/living-species-tiger",checkedAt:"2026-10-01",note:"Species-level account; subspecies taxonomy is under review and local conditions vary."}, region:"Asia",
    publicClaims:[
      {state:"KNOWN",text:"The IUCN SSC Cat Specialist Group lists Panthera tigris as Endangered and notes that subspecies taxonomy remains under review.",source:"IUCN SSC Cat Specialist Group — Tiger",sourceUrl:"https://www.catsg.org/living-species-tiger",checkedAt:"2026-10-01",limitation:"Species status does not establish a specific population condition."},
      {state:"KNOWN",text:"The account documents illegal hunting/trade, habitat loss, fragmentation and prey depletion among major pressures.",source:"IUCN SSC Cat Specialist Group — Tiger",sourceUrl:"https://www.catsg.org/living-species-tiger",checkedAt:"2026-10-01",limitation:"Threat mix varies across landscapes."}
    ],
  },
  {
    id:"taxon:gbif:2433451", slug:"polar-bear", commonName:"Polar Bear", scientificName:"Ursus maritimus", gbifKey:2433451,
    rank:"SPECIES", taxonomicStatus:"ACCEPTED", kingdom:"Animalia", taxonSourceUrl:"https://www.gbif.org/species/2433451",
    livingSystemId:"living-system:4p:coastal-sea", issue:{id:"issue:4p:climate-habitat-review",label:"Sea-ice habitat review",status:"SOURCE_REVIEW_PENDING"}, solution:{id:"solution:4p:climate-habitat-protection",label:"Climate and habitat protection",status:"SOURCE_REVIEW_PENDING"},
    context:"Circumpolar discovery profile. Subpopulation status varies; observations do not define sea-ice habitat quality.",
    group:"Land mammals", intro:"The polar bear is a marine mammal of the circumpolar Arctic that depends heavily on sea ice.", habitat:"Seasonally and permanently ice-covered Arctic and Subarctic marine waters across Canada, Greenland, Norway, Russia and the United States.",
    descriptorSource:{source:"U.S. Fish & Wildlife Service",sourceUrl:"https://www.fws.gov/species/polar-bear-ursus-maritimus",checkedAt:"2026-10-01",note:"Circumpolar and U.S. context; individual subpopulations require their own evidence."}, region:"Circumpolar Arctic",
    publicClaims:[
      {state:"KNOWN",text:"U.S. Fish & Wildlife Service describes polar bears as sea-ice-dependent marine mammals across 19 circumpolar subpopulations.",source:"U.S. Fish & Wildlife Service — Polar Bear",sourceUrl:"https://www.fws.gov/species/polar-bear-ursus-maritimus",checkedAt:"2026-10-01",limitation:"Subpopulation status varies."},
      {state:"KNOWN",text:"The current U.S. five-year review retains threatened status and identifies continued sea-ice habitat loss as a central concern.",source:"U.S. Fish & Wildlife Service — Polar Bear 5-Year Review",sourceUrl:"https://www.fws.gov/page/polar-bear-5-year-status-review-FAQ",checkedAt:"2026-10-01",limitation:"U.S. regulatory status is not a global population measurement."}
    ],
  },
  {
    id:"taxon:gbif:2433399", slug:"giant-panda", commonName:"Giant Panda", scientificName:"Ailuropoda melanoleuca", gbifKey:2433399,
    rank:"SPECIES", taxonomicStatus:"ACCEPTED", kingdom:"Animalia", taxonSourceUrl:"https://www.gbif.org/species/2433399",
    livingSystemId:"living-system:4p:tropical-forest", issue:{id:"issue:4p:forest-fragmentation-review",label:"Forest fragmentation review",status:"SOURCE_REVIEW_PENDING"}, solution:{id:"solution:4p:connected-forest",label:"Connected forest habitat",status:"SOURCE_REVIEW_PENDING"},
    context:"China discovery profile. Captive-animal context is not used as wild-population evidence.",
    group:"Land mammals", intro:"The giant panda is a bear endemic to China. U.S. Fish & Wildlife Service describes wild pandas in mountain bamboo and coniferous forests of central China.", habitat:"Dense bamboo and coniferous forests in mountain areas of Sichuan, Gansu and Shaanxi.",
    descriptorSource:{source:"U.S. Fish & Wildlife Service",sourceUrl:"https://www.fws.gov/species/giant-panda-ailuropoda-melanoleuca",checkedAt:"2026-10-01",note:"Species-level habitat description; not a current occupancy or population survey."}, region:"Central China",
    publicClaims:[
      {state:"KNOWN",text:"U.S. Fish & Wildlife Service identifies Ailuropoda melanoleuca as a bear found in mountain areas of central China.",source:"U.S. Fish & Wildlife Service — Giant Panda",sourceUrl:"https://www.fws.gov/species/giant-panda-ailuropoda-melanoleuca",checkedAt:"2026-10-01",limitation:"Species-level context is not a current population survey."},
      {state:"KNOWN",text:"The Service describes dense bamboo and coniferous forest as wild giant-panda habitat.",source:"U.S. Fish & Wildlife Service — Giant Panda",sourceUrl:"https://www.fws.gov/species/giant-panda-ailuropoda-melanoleuca",checkedAt:"2026-10-01",limitation:"Habitat does not establish current presence."}
    ],
  },
  {
    id:"taxon:gbif:2417522", slug:"whale-shark", commonName:"Whale Shark", scientificName:"Rhincodon typus", gbifKey:2417522,
    rank:"SPECIES", taxonomicStatus:"ACCEPTED", kingdom:"Animalia", taxonSourceUrl:"https://www.gbif.org/species/2417522",
    livingSystemId:"living-system:4p:deep-ocean", issue:{id:"issue:4p:marine-pressure-review",label:"Marine pressure review",status:"SOURCE_REVIEW_PENDING"}, solution:{id:"solution:4p:marine-protection",label:"Marine protection and bycatch reduction",status:"SOURCE_REVIEW_PENDING"},
    context:"Migratory marine profile. Occurrence, aggregation and track records retain distinct sampling semantics.",
    group:"Other", intro:"The whale shark is the world's largest living fish and a migratory filter-feeding shark. The Convention on Migratory Species lists it as Endangered.", habitat:"Warm and tropical marine waters across a broad migratory range; local aggregations are seasonal and source-dependent.",
    descriptorSource:{source:"Convention on Migratory Species",sourceUrl:"https://www.cms.int/species/rhincodon-typus",checkedAt:"2026-10-01",note:"Migratory and conservation context; not a local abundance or live-position claim."}, region:"Tropical and warm-temperate ocean",
    publicClaims:[
      {state:"KNOWN",text:"The Convention on Migratory Species identifies Rhincodon typus as the world's largest living fish and lists its IUCN status as Endangered.",source:"Convention on Migratory Species — Whale Shark",sourceUrl:"https://www.cms.int/species/rhincodon-typus",checkedAt:"2026-10-01",limitation:"Global status does not establish local abundance."},
      {state:"KNOWN",text:"Whale sharks are migratory; an observation or tracked individual does not describe the species' complete range.",source:"Convention on Migratory Species — Whale Shark",sourceUrl:"https://www.cms.int/species/rhincodon-typus",checkedAt:"2026-10-01",limitation:"Movement evidence is dataset-, season- and place-specific."}
    ],
  },
  {
    id:"taxon:gbif:2442225", slug:"green-sea-turtle", commonName:"Green Turtle", scientificName:"Chelonia mydas", gbifKey:2442225,
    rank:"SPECIES", taxonomicStatus:"ACCEPTED", kingdom:"Animalia", taxonSourceUrl:"https://www.gbif.org/species/2442225",
    livingSystemId:"living-system:4p:coastal-sea", issue:{id:"issue:4p:marine-pressure-review",label:"Marine pressure review",status:"SOURCE_REVIEW_PENDING"}, solution:{id:"solution:4p:marine-protection",label:"Nesting, foraging habitat and bycatch protection",status:"SOURCE_REVIEW_PENDING"},
    context:"Global marine-turtle profile. Regulatory status is population-segment specific and is not collapsed into one universal label.",
    group:"Other", intro:"Green turtles are large hard-shelled sea turtles found around the world. NOAA documents different protection statuses among distinct population segments.", habitat:"Oceanic habitat early in life, followed by nearshore coastal foraging grounds; adults migrate between foraging areas and nesting beaches.",
    descriptorSource:{source:"NOAA Fisheries",sourceUrl:"https://www.fisheries.noaa.gov/species/green-turtle",checkedAt:"2026-10-01",note:"Species-level life-history and U.S. population-segment context; status varies among populations."}, region:"Global tropical and subtropical ocean",
    publicClaims:[
      {state:"KNOWN",text:"NOAA Fisheries describes green turtles as globally distributed and documents distinct population segments with different U.S. ESA statuses.",source:"NOAA Fisheries — Green Turtle",sourceUrl:"https://www.fisheries.noaa.gov/species/green-turtle",checkedAt:"2026-10-01",limitation:"Do not collapse population-segment status into one universal label."},
      {state:"KNOWN",text:"NOAA documents bycatch, habitat loss/degradation, changing environmental conditions, pollution/debris and vessel strikes among important pressures.",source:"NOAA Fisheries — Green Turtle",sourceUrl:"https://www.fisheries.noaa.gov/species/green-turtle",checkedAt:"2026-10-01",limitation:"Pressure exposure varies by population and place."}
    ],
  },
  {
    id: "taxon:gbif:5219436",
    slug: "leopard",
    commonName: "Leopard",
    scientificName: "Panthera pardus",
    gbifKey: 5219436,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/5219436",
    livingSystemId: "living-system:4p:grassland-savanna",
    issue: { id: "issue:4p:habitat-fragmentation-review", label: "Habitat fragmentation review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:connected-landscapes", label: "Connected landscapes and coexistence", status: "SOURCE_REVIEW_PENDING" },
    context: "Global leopard discovery profile. Species-level status and threats are source-grounded; occurrence records never become range, abundance or live location.",
    group: "Land mammals",
    intro: "Leopards occupy an unusually broad set of habitats across Africa and Asia. The IUCN SSC Cat Specialist Group describes the species as Vulnerable, with habitat loss, prey depletion and exploitation among documented pressures.",
    habitat: "A wide range of habitats across Africa and Asia, from forests and mountains to savannas and dry landscapes. Habitat use varies strongly by region and population.",
    descriptorSource: { source: "IUCN SSC Cat Specialist Group", sourceUrl: "https://www.catsg.org/living-species-leopard", checkedAt: "2026-10-02", note: "Species-level status, range and pressure context; subspecies and local population conditions require separate evidence." },
    region: "Africa / Asia",
    publicClaims: [
      { state: "KNOWN", text: "The IUCN SSC Cat Specialist Group describes Panthera pardus as Vulnerable and documents a wide African and Asian distribution.", source: "IUCN SSC Cat Specialist Group — Leopard", sourceUrl: "https://www.catsg.org/living-species-leopard", checkedAt: "2026-10-02", limitation: "A species-level distribution does not establish local presence or current occupancy." },
      { state: "KNOWN", text: "Habitat loss, prey depletion and exploitation are among documented pressures on leopards.", source: "IUCN SSC Cat Specialist Group — Leopard", sourceUrl: "https://www.catsg.org/living-species-leopard", checkedAt: "2026-10-02", limitation: "Pressure mix and intensity differ across regions and populations." },
    ],
  },
  {
    id: "taxon:gbif:7262070",
    slug: "eastern-gorilla",
    commonName: "Eastern Gorilla",
    scientificName: "Gorilla beringei",
    gbifKey: 7262070,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/7262070",
    livingSystemId: "living-system:4p:tropical-forest",
    issue: { id: "issue:4p:forest-fragmentation-review", label: "Forest fragmentation and pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:connected-forest", label: "Forest protection and connectivity", status: "SOURCE_REVIEW_PENDING" },
    context: "Eastern Gorilla discovery profile. The numeric GBIF key is the pre-2026 Backbone identifier retained for occurrence-adapter compatibility; current GBIF web taxonomy presents the accepted species under Catalogue of Life ID 3H3C3.",
    group: "Land mammals",
    intro: "The eastern gorilla includes mountain gorillas and Grauer’s gorillas. Current GBIF taxonomy presents Gorilla beringei as an accepted species and Critically Endangered at species level.",
    habitat: "Forests of eastern Democratic Republic of the Congo and the mountain forests of the Virunga–Bwindi region, with habitat differing substantially between the two recognised subspecies.",
    descriptorSource: { source: "GBIF + WWF", sourceUrl: "https://www.worldwildlife.org/species/gorilla/", checkedAt: "2026-10-02", note: "Species overview combines current GBIF species identity with bounded WWF subspecies habitat context; local population trends require subspecies/site evidence." },
    region: "Central / East Africa",
    publicClaims: [
      { state: "KNOWN", text: "Current GBIF taxonomy presents Gorilla beringei as an accepted species and displays an IUCN category of Critically Endangered.", source: "GBIF — Gorilla beringei", sourceUrl: "https://www.gbif.org/taxon/3H3C3", checkedAt: "2026-10-02", limitation: "The GBIF web identifier changed with the 2026 taxonomy presentation; the legacy numeric key is retained only for adapter compatibility and must be revalidated on provider migration." },
      { state: "KNOWN", text: "WWF describes mountain gorillas and eastern lowland/Grauer’s gorillas as subspecies of the eastern gorilla occupying distinct forest contexts.", source: "WWF — Gorillas", sourceUrl: "https://www.worldwildlife.org/species/gorilla/", checkedAt: "2026-10-02", limitation: "Subspecies habitat and recovery statements must not be transferred between mountain and Grauer’s gorillas without evidence." },
    ],
  },
  {
    id: "taxon:gbif:5219534",
    slug: "chimpanzee",
    commonName: "Chimpanzee",
    scientificName: "Pan troglodytes",
    gbifKey: 5219534,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/5219534",
    livingSystemId: "living-system:4p:tropical-forest",
    issue: { id: "issue:4p:forest-fragmentation-review", label: "Forest fragmentation and wildlife pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:connected-forest", label: "Forest protection and connectivity", status: "SOURCE_REVIEW_PENDING" },
    context: "Chimpanzee discovery profile. Species-level WWF context is not a substitute for subspecies, site or population evidence.",
    group: "Land mammals",
    intro: "Chimpanzees are highly social great apes living across forests and woodland mosaics in Central and West Africa. WWF lists Pan troglodytes as Endangered.",
    habitat: "Moist and dry forests, savannah woodlands and grassland–forest mosaics across parts of Central and West Africa.",
    descriptorSource: { source: "WWF", sourceUrl: "https://www.worldwildlife.org/species/chimpanzee/", checkedAt: "2026-10-02", note: "Species-level habitat and threat context; population estimates and local conditions remain source- and place-specific." },
    region: "Central / West Africa",
    publicClaims: [
      { state: "KNOWN", text: "WWF lists Pan troglodytes as Endangered and describes its habitats as moist and dry forests, savannah woodlands and grassland–forest mosaics.", source: "WWF — Chimpanzee", sourceUrl: "https://www.worldwildlife.org/species/chimpanzee/", checkedAt: "2026-10-02", limitation: "Species-level habitat does not establish current local presence." },
      { state: "KNOWN", text: "WWF documents habitat pressure, illegal wildlife trade and disease among major chimpanzee threats.", source: "WWF — Chimpanzee", sourceUrl: "https://www.worldwildlife.org/species/chimpanzee/", checkedAt: "2026-10-02", limitation: "Threat intensity varies among subspecies and landscapes." },
    ],
  },
  {
    id: "taxon:gbif:5219532",
    slug: "bornean-orangutan",
    commonName: "Bornean Orangutan",
    scientificName: "Pongo pygmaeus",
    gbifKey: 5219532,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/5219532",
    livingSystemId: "living-system:4p:tropical-forest",
    issue: { id: "issue:4p:forest-fragmentation-review", label: "Forest fragmentation review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:connected-forest", label: "Forest protection and connectivity", status: "SOURCE_REVIEW_PENDING" },
    context: "Bornean Orangutan discovery profile. Population estimates and subspecies conditions remain source-specific and are not inferred from occurrence records.",
    group: "Land mammals",
    intro: "The Bornean orangutan is endemic to Borneo and is assessed as Critically Endangered. WWF describes lowland rainforest, tropical swamp and mountain forest among its habitats.",
    habitat: "Lowland rainforest, tropical swamp forest and mountain forest on Borneo. Habitat quality and connectivity vary across the island.",
    descriptorSource: { source: "WWF", sourceUrl: "https://www.worldwildlife.org/species/orangutan/bornean-orangutan/", checkedAt: "2026-10-02", note: "Species-level habitat, status and pressure context; current local population condition requires site-specific evidence." },
    region: "Borneo",
    publicClaims: [
      { state: "KNOWN", text: "WWF lists Pongo pygmaeus as Critically Endangered and identifies lowland rainforests, tropical swamp forests and mountain forests as habitat.", source: "WWF — Bornean Orangutan", sourceUrl: "https://www.worldwildlife.org/species/orangutan/bornean-orangutan/", checkedAt: "2026-10-02", limitation: "Habitat description does not establish current occupancy across mapped forest." },
      { state: "KNOWN", text: "WWF documents major long-term declines in Bornean orangutan population and habitat.", source: "WWF — Bornean Orangutan", sourceUrl: "https://www.worldwildlife.org/species/orangutan/bornean-orangutan/", checkedAt: "2026-10-02", limitation: "Reported island-wide trends must not be converted into a current local population estimate." },
    ],
  },
  {
    id: "taxon:gbif:2481661",
    slug: "emperor-penguin",
    commonName: "Emperor Penguin",
    scientificName: "Aptenodytes forsteri",
    gbifKey: 2481661,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/2481661",
    livingSystemId: "living-system:4p:coastal-sea",
    issue: { id: "issue:4p:climate-habitat-review", label: "Sea-ice habitat review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:climate-habitat-protection", label: "Climate and habitat protection", status: "SOURCE_REVIEW_PENDING" },
    context: "Antarctic discovery profile. Sea-ice condition is a critical habitat variable, but occurrence records and modelled projections have distinct semantics.",
    group: "Birds",
    intro: "Emperor penguins breed on Antarctic fast ice and depend on sea ice through key parts of their life cycle. The IUCN Red List moved the species to Endangered in 2026.",
    habitat: "Antarctic sea-ice and marine systems. Breeding colonies depend on stable fast ice, while adults forage in surrounding ocean habitat.",
    descriptorSource: { source: "British Antarctic Survey", sourceUrl: "https://www.bas.ac.uk/news/emperor-penguin-and-antarctic-fur-seal-now-endangered-due-to-climate-change-iucn-red-list/", checkedAt: "2026-10-02", note: "Current 2026 IUCN-status and sea-ice context; projections and colony outcomes remain model- and site-specific." },
    region: "Antarctica",
    publicClaims: [
      { state: "KNOWN", text: "British Antarctic Survey reported in April 2026 that the IUCN Red List moved Aptenodytes forsteri from Near Threatened to Endangered.", source: "British Antarctic Survey — Emperor penguin and Antarctic fur seal now Endangered", sourceUrl: "https://www.bas.ac.uk/news/emperor-penguin-and-antarctic-fur-seal-now-endangered-due-to-climate-change-iucn-red-list/", checkedAt: "2026-10-02", limitation: "IUCN status is a species-level assessment, not a statement about every colony." },
      { state: "KNOWN", text: "U.S. Fish & Wildlife Service identifies loss and early break-up of breeding sea ice under climate change as a primary long-term threat.", source: "U.S. Fish & Wildlife Service — Emperor Penguin final rule", sourceUrl: "https://www.fws.gov/sites/default/files/federal_register_document/2022-23164.pdf", checkedAt: "2026-10-02", limitation: "Projected impacts vary by colony and climate scenario; sea ice is not the only ecological variable." },
    ],
  },
  {
    id: "taxon:gbif:5219426",
    slug: "jaguar",
    commonName: "Jaguar",
    scientificName: "Panthera onca",
    gbifKey: 5219426,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/5219426",
    livingSystemId: "living-system:4p:tropical-forest",
    issue: { id: "issue:4p:forest-pressure-review", label: "Forest pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:protected-restoration", label: "Protection and restoration", status: "SOURCE_REVIEW_PENDING" },
    context: "Working execution profile. Species-level description is source-bounded; local abundance, trend, corridor use and live location stay UNKNOWN.",
    narrativeChapters: JAGUAR_CHAPTERS,
    chaptersEyebrow: "JAGUAR · EVIDENCE CHAPTERS",
    chaptersTitle: "What the species record shows, and what stays unknown.",
    chaptersLede: "Every statement is labelled KNOWN, INTERPRETED or UNKNOWN. A species description is never silently converted into local population health, corridor use or a live location.",
    truthBoundary: {
      persistedBy: "SOURCE_ENVELOPE",
      text: "This profile keeps the accepted GBIF taxon identity for Panthera onca and the bounded USFWS and IUCN Cat Specialist Group descriptions. A reported observation is evidence of reporting at a place and time. It does not establish range, abundance, corridor use, ecosystem health or a live animal position.",
      rows: [
        { label: "SOURCE RECORD", value: "jaguar-gbif-taxonomy-2026-08-28" },
        { label: "DESCRIPTOR", value: "USFWS + IUCN SSC Cat Specialist Group" },
        { label: "SIGNAL", value: "NONE CREATED" },
        { label: "LOCAL CONDITION", value: "UNKNOWN" },
      ],
      disclosure: "GBIF occurrence licences stay with each dataset. USFWS is a public information page and is not an endorsement. The Cat Specialist Group page is used for attributed facts only.",
      sourceUrl: "https://www.gbif.org/species/5219426",
    },
    group: "Land mammals",
    intro: "The jaguar is the largest cat in the Americas — a muscular, mostly solitary predator found across wet forests, savannas, wetlands and drier woodland. Range-wide patterns describe the species; a sighting alone does not prove local population health or ecosystem condition.",
    habitat: "Jaguars use many environments across the Americas, including tropical forest, swampy savanna, wetland, dry forest and thorn scrub. They are often associated with water. Reported observations are evidence of reporting at a place and time, not a complete range map or a live animal position.",
    descriptorSource: { source: "USFWS & IUCN SSC Cat Specialist Group", sourceUrl: "https://www.fws.gov/species/jaguar-panthera-onca", checkedAt: "2026-10-03", note: "Species-level description and habitat. A sighting does not prove local population health or ecosystem condition. No single global population number is published here." },
    journey: "amazonia",
    missionSlug: "am4zonia",
    fieldEyebrow: "MEDIA RIGHTS · SP-005",
    fieldNote: "SP-005 is a Pantanal species portrait (Patty Ho, captured 2012-03-17, CC BY 2.0). It is not an Amazonia image, an ATLAS occurrence, a current-location record or evidence of local ecological condition.",
  },
  {
    id: "taxon:gbif:5184657",
    slug: "acropora-palmata",
    commonName: "Elkhorn Coral",
    scientificName: "Acropora palmata",
    gbifKey: 5184657,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/5184657",
    livingSystemId: "living-system:4p:coastal-sea",
    issue: { id: "issue:4p:coral-pressure-review", label: "Coral pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:reef-protection-restoration", label: "Reef protection and restoration", status: "SOURCE_REVIEW_PENDING" },
    context: "Caribbean coral profile. Taxonomy, protected status, habitat and broad pressure context are source-grounded; occurrence records do not establish reef health, coral cover, bleaching state or live condition.",
    group: "Other",
    intro: "Elkhorn coral is a branching Caribbean reef-building coral. NOAA Fisheries lists Acropora palmata as threatened under the U.S. Endangered Species Act and documents major losses from disease and ocean warming.",
    habitat: "Clear, shallow, high-energy coral reefs in Florida, the Bahamas and the wider Caribbean. A reported occurrence is evidence of a record at a place and time, not a measurement of coral cover, colony abundance, bleaching or reef health.",
    descriptorSource: { source: "NOAA Fisheries — Elkhorn Coral", sourceUrl: "https://www.fisheries.noaa.gov/species/elkhorn-coral", checkedAt: "2026-10-06", note: "Species-level habitat, protected-status and pressure context. Current local colony condition and reef health require site-specific evidence." },
    region: "Caribbean / western Atlantic",
    publicClaims: [
      { state: "KNOWN", text: "NOAA Fisheries lists elkhorn coral as threatened under the U.S. Endangered Species Act throughout its range.", source: "NOAA Fisheries — Elkhorn Coral", sourceUrl: "https://www.fisheries.noaa.gov/species/elkhorn-coral", checkedAt: "2026-10-06", limitation: "U.S. legal status is not a measurement of the condition of any individual reef or colony." },
      { state: "KNOWN", text: "NOAA Fisheries documents disease, ocean warming, ocean acidification, habitat degradation, land-based pollution and unsustainable fishing among important pressures on elkhorn coral.", source: "NOAA Fisheries — Elkhorn Coral", sourceUrl: "https://www.fisheries.noaa.gov/species/elkhorn-coral", checkedAt: "2026-10-06", limitation: "Range-wide pressure categories do not establish current local pressure intensity, bleaching or mortality." },
    ],
  },
  {
    id: "taxon:gbif:2474514",
    slug: "hyacinth-macaw",
    commonName: "Hyacinth Macaw",
    scientificName: "Anodorhynchus hyacinthinus",
    gbifKey: 2474514,
    rank: "SPECIES",
    taxonomicStatus: "ACCEPTED",
    kingdom: "Animalia",
    taxonSourceUrl: "https://www.gbif.org/species/2474514",
    livingSystemId: "living-system:4p:tropical-forest",
    issue: { id: "issue:4p:forest-pressure-review", label: "Forest pressure review", status: "SOURCE_REVIEW_PENDING" },
    solution: { id: "solution:4p:protected-restoration", label: "Protection and restoration", status: "SOURCE_REVIEW_PENDING" },
    context: "Working execution profile. The largest flying parrot, dependent on specific palms and old trees.",
    group: "Birds",
    intro: "The largest flying parrot in the world, a vivid blue macaw dependent on particular palms and old, hollow trees for food and nesting.",
    habitat: "Palm swamps, woodlands and forest edges of central South America, including parts of the Amazon.",
    descriptorSource: { source: "IUCN & GBIF", sourceUrl: "https://www.gbif.org/species/2474514", checkedAt: "2026-08-06", note: "General descriptive summary of identity and habitat; not a measured population or range claim." },
    journey: "amazonia",
    missionSlug: "am4zonia",
  },
];

export const speciesBySlug = (slug?: string) => SPECIES_PROFILES.find((profile) => profile.slug === slug);
export const speciesById = (id?: string) => SPECIES_PROFILES.find((profile) => profile.id === id);
