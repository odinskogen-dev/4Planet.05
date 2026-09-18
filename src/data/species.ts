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
   * boundary. Never surfaced as a settled 4PLANET assertion. Orca uses the richer
   * narrativeChapters model instead.
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
    group: "Marine mammals",
    intro: "The orca is the largest member of the dolphin family — a fast, social, wide-ranging predator found in every ocean. Populations differ in prey, behaviour and calls, so a species label does not describe every group.",
    habitat: "All oceans, from polar seas to the tropics. Coastal groups follow prey along shelves and fjords; others range across open water.",
    descriptorSource: { source: "NOAA Fisheries & GBIF", sourceUrl: "https://www.fisheries.noaa.gov/species/killer-whale", checkedAt: "2026-08-06", note: "General descriptive summary of identity and habitat; not a measured population or range claim." },
    journey: "orca",
    missionSlug: "wh4les",
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
    context: "Working execution profile. The largest cat in the Americas and a wide-ranging Amazonian predator.",
    group: "Land mammals",
    intro: "The largest cat in the Americas, a powerful, wide-ranging predator whose presence signals connected, functioning forest.",
    habitat: "Tropical forests and wetlands of Central and South America, including the Amazon basin.",
    descriptorSource: { source: "IUCN & GBIF", sourceUrl: "https://www.gbif.org/species/5219426", checkedAt: "2026-08-06", note: "General descriptive summary of identity and habitat; not a measured population or range claim." },
    journey: "amazonia",
    missionSlug: "am4zonia",
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
