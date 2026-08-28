export type SourceEvidenceState = "KNOWN" | "INTERPRETED" | "UNKNOWN";

export interface SpeciesSourceRecord {
  id: string;
  sourceFamily: "GBIF" | "OBIS" | "NOAA" | "USFWS" | "IUCN" | "OTHER";
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

export const JAGUAR_SOURCE_ENVELOPE: SpeciesSourceEnvelope = {
  schema: "4PLANET_SPECIES_SOURCE_ENVELOPE_01",
  speciesId: "taxon:gbif:5219426",
  scientificName: "Panthera onca",
  records: [
    {
      id: "jaguar-gbif-taxonomy-2026-08-28",
      sourceFamily: "GBIF",
      label: "GBIF — Panthera onca",
      sourceUrl: "https://www.gbif.org/species/5219426",
      checkedAt: "2026-08-28",
      purpose: "TAXONOMY",
      provenance: "GBIF Backbone Taxonomy accepted species identity used by the canonical 4PLANET Jaguar object.",
      rightsOrTerms: "GBIF source page; downstream occurrence records retain dataset-level licences and citations.",
      evidenceState: "KNOWN",
      uncertainty: "Accepted taxon identity does not establish local population, abundance, range, trend, corridor use or live location.",
      updateSemantics: "Re-check taxonomic status when GBIF backbone identity or accepted-name status changes.",
    },
    {
      id: "jaguar-usfws-descriptor-2026-08-28",
      sourceFamily: "USFWS",
      label: "U.S. Fish & Wildlife Service — Jaguar",
      sourceUrl: "https://www.fws.gov/species/jaguar-panthera-onca",
      checkedAt: "2026-08-28",
      purpose: "DESCRIPTOR",
      provenance: "Public USFWS species profile used for bounded species-level description, habitat and documented pressure context.",
      rightsOrTerms: "US government/public information page; retain source attribution and do not imply USFWS endorsement.",
      evidenceState: "KNOWN",
      uncertainty: "Range-wide species description does not establish local presence, population condition, individual behaviour or site-specific pressure intensity.",
      updateSemantics: "Re-check when the public USFWS species profile materially changes.",
    },
    {
      id: "jaguar-iucn-catsg-descriptor-2026-08-28",
      sourceFamily: "IUCN",
      label: "IUCN SSC Cat Specialist Group — Jaguar",
      sourceUrl: "https://www.catsg.org/living-species-jaguar",
      checkedAt: "2026-08-28",
      purpose: "DESCRIPTOR",
      provenance: "Public specialist-group species page used as a corroborating descriptive source for Panthera onca.",
      rightsOrTerms: "Public specialist-group page; use facts with attribution only. Do not republish protected prose, images or other media.",
      evidenceState: "KNOWN",
      uncertainty: "Species-level descriptive material is not a local abundance, corridor-use, ecosystem-health or live-location assessment.",
      updateSemantics: "Re-check when the specialist-group species account materially changes.",
    },
  ],
  forbiddenInferences: [
    "population from generic species identity",
    "range from observation points alone",
    "abundance or trend from occurrence count",
    "corridor use from map proximity",
    "local ecological health from species presence alone",
    "live location from historical occurrence data",
    "individual behaviour from species description",
  ],
};

const SPECIES_SOURCE_ENVELOPES: Record<string, SpeciesSourceEnvelope> = {
  orca: ORCA_SOURCE_ENVELOPE,
  jaguar: JAGUAR_SOURCE_ENVELOPE,
};

export const speciesSourceEnvelopeBySlug = (slug?: string) => slug ? SPECIES_SOURCE_ENVELOPES[slug] : undefined;
