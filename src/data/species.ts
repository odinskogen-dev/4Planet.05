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
}

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
    context: "Working execution profile. Taxonomy is source-grounded; ecological claims remain in review.",
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
