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
