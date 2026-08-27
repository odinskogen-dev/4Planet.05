export type SourceEvidenceState = "KNOWN" | "INTERPRETED" | "UNKNOWN";

export interface SpeciesSourceRecord {
  id: string;
  sourceFamily: "GBIF" | "OBIS" | "NOAA" | "OTHER";
  label: string;
  sourceUrl: string;
  checkedAt: string;
  purpose: "TAXONOMY" | "OCCURRENCE_LAYER" | "DESCRIPTOR" | "PRESSURE" | "MEDIA";
  provenance: string;
  rightsOrTerms: string;
  evidenceState: SourceEvidenceState;
  uncertainty: string;
  updateSemantics: string;
}

export interface SpeciesSourceEnvelope {
  schema: "4PLANET_SPECIES_SOURCE_ENVELOPE_01";
  speciesId: string;
  scientificName: string;
  records: SpeciesSourceRecord[];
  forbiddenInferences: string[];
}

export const ORCA_SOURCE_ENVELOPE: SpeciesSourceEnvelope = {
  schema: "4PLANET_SPECIES_SOURCE_ENVELOPE_01",
  speciesId: "taxon:gbif:2440483",
  scientificName: "Orcinus orca",
  records: [
    {
      id: "orca-gbif-taxonomy-2026-08-28",
      sourceFamily: "GBIF",
      label: "GBIF — Orcinus orca",
      sourceUrl: "https://www.gbif.org/species/2440483",
      checkedAt: "2026-08-28",
      purpose: "TAXONOMY",
      provenance: "GBIF taxon identity used by the canonical 4PLANET Species object.",
      rightsOrTerms: "GBIF source page; downstream occurrence records retain dataset-level licences and citations.",
      evidenceState: "KNOWN",
      uncertainty: "Accepted taxon identity does not establish population, ecotype, abundance, range, trend or live location.",
      updateSemantics: "Re-check taxonomic status when GBIF backbone identity or accepted-name status changes.",
    },
    {
      id: "orca-obis-marine-layer-2026-08-28",
      sourceFamily: "OBIS",
      label: "OBIS — Orcinus orca / WoRMS 137102",
      sourceUrl: "https://obis.org/taxon/137102",
      checkedAt: "2026-08-28",
      purpose: "OCCURRENCE_LAYER",
      provenance: "OBIS taxon page aggregates marine occurrence datasets and exposes dataset provenance for Orcinus orca.",
      rightsOrTerms: "OBIS aggregation; individual dataset licences and citations govern downstream reuse and must remain attached at record ingestion.",
      evidenceState: "KNOWN",
      uncertainty: "Occurrence availability is not range, abundance, population trend, ecological condition or a live animal track.",
      updateSemantics: "Refresh only through controlled occurrence ingestion that preserves dataset, event date, coordinates, licence and source record identifiers.",
    },
    {
      id: "orca-noaa-descriptor-2026-08-28",
      sourceFamily: "NOAA",
      label: "NOAA Fisheries — Killer Whale",
      sourceUrl: "https://www.fisheries.noaa.gov/species/killer-whale",
      checkedAt: "2026-08-28",
      purpose: "DESCRIPTOR",
      provenance: "Public NOAA species profile used for bounded descriptive and population-specific context.",
      rightsOrTerms: "US government/public information page; retain source attribution and do not imply NOAA endorsement.",
      evidenceState: "KNOWN",
      uncertainty: "Population-specific statements must not be transferred to an unidentified Orca occurrence or another population without evidence.",
      updateSemantics: "Re-check when public NOAA species guidance materially changes.",
    },
  ],
  forbiddenInferences: [
    "pod from generic species identity",
    "ecotype from generic occurrence",
    "population from map proximity",
    "abundance or trend from occurrence count",
    "range from observation points alone",
    "live location from historical occurrence data",
    "ecological health from species presence alone",
  ],
};
