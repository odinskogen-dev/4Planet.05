import type { Occurrence, ObservationItem } from "@/planet/types";

/**
 * Workstream C — deterministic bundled Orca occurrence for the Gate 1 vertical
 * slice. It is imported and rendered through the real ATLAS Context panel, works
 * with NO live API (GBIF/OBIS/Supabase), and is clearly labelled as a bundled,
 * checked, non-live historical observation.
 *
 * Base: real GBIF occurrence 5939349319 (an orca human-observation in
 * Åstfjorden, Norway, CC BY 4.0). Verified source fields only; no invented data.
 */
export const BUNDLED_ORCA_RECORD_ID = "5939349319";
export const BUNDLED_ORCA_SOURCE_URL = "https://www.gbif.org/occurrence/5939349319";
export const BUNDLED_ORCA_SOURCE_CHECKED = "2026-08-07";

export const DEMO_WHALE_OCCURRENCE: Occurrence = {
  lat: 63.44559,
  lng: 9.304561,
  scientificName: "Orcinus orca",
  commonName: "Orca",
  eventDate: "2026-01-03",
  sourceRecordId: BUNDLED_ORCA_RECORD_ID,
  sourceUrl: BUNDLED_ORCA_SOURCE_URL,
  taxonKey: 2440483,
  coordinateUncertaintyM: 1000,
  // A separate 4PLANET-created illustration, used ONLY as an illustration of the
  // species — never as a photo of this exact occurrence. The Context panel labels
  // it "ILLUSTRATIVE OF SPECIES — NOT THIS OCCURRENCE".
  mediaUrl: "/assets/species/orca/illustrative.jpg",
  mediaLicence: "Owned work — INTERNAL PROTOTYPE ART (4PLANET-created)",
  mediaAttribution: "4PLANET illustration — illustrative of the species, not this occurrence",
};

/** A complete ObservationItem the ATLAS Context panel can render directly. */
export const DEMO_WHALE_OBSERVATION: ObservationItem = {
  id: `observation:gbif:${BUNDLED_ORCA_RECORD_ID}`,
  taxon: { id: "taxon:gbif:2440483", type: "TAXON", label: "Orca", sub: "Orcinus orca" },
  occurrence: DEMO_WHALE_OCCURRENCE,
  provenance: {
    sourceId: "gbif",
    sourceRecordId: BUNDLED_ORCA_RECORD_ID,
    sourceUrl: BUNDLED_ORCA_SOURCE_URL,
    interpretation: "SOURCE_RECORD",
    confidence: "HIGH",
    occurredAt: "2026-01-03",
    checkedAt: BUNDLED_ORCA_SOURCE_CHECKED,
  },
};

/** Labels the panel must show for a bundled, non-live record. */
export const BUNDLED_SNAPSHOT_LABELS = {
  bundled: "BUNDLED SOURCE SNAPSHOT",
  notLive: "NOT LIVE",
  source: "GBIF",
  recordId: BUNDLED_ORCA_RECORD_ID,
  checked: BUNDLED_ORCA_SOURCE_CHECKED,
  historical: "HISTORICAL OBSERVATION — NOT THE ANIMAL'S CURRENT POSITION",
  imageLabel: "ILLUSTRATIVE OF SPECIES — NOT THIS OCCURRENCE",
};

export const DEMO_WHALE_META = {
  recordId: BUNDLED_ORCA_RECORD_ID,
  identity: "Orca (Orcinus orca)",
  observed: "2026-01-03",
  sourceUrl: BUNDLED_ORCA_SOURCE_URL,
  coordinateUncertaintyM: 1000,
  imageUrl: DEMO_WHALE_OCCURRENCE.mediaUrl!,
  licence: DEMO_WHALE_OCCURRENCE.mediaLicence!,
  attribution: DEMO_WHALE_OCCURRENCE.mediaAttribution!,
  disclosure: BUNDLED_SNAPSHOT_LABELS.historical,
};
