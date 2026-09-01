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
  },
];

export const speciesBySlug = (slug?: string) => SPECIES_PROFILES.find((profile) => profile.slug === slug);
export const speciesById = (id?: string) => SPECIES_PROFILES.find((profile) => profile.id === id);
