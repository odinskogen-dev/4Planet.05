import type { Occurrence } from "@/planet/types";

/**
 * Blocker 10 — one exact, complete whale occurrence used to DEMONSTRATE the
 * image-aware ATLAS panel end-to-end: record ID, common + scientific identity,
 * observed date, source URL, coordinate uncertainty, image URL, exact licence,
 * attribution, and the historical-not-current-position disclosure.
 *
 * This is explicitly a DEMONSTRATION record, not a live GBIF read. Its base is
 * the real GBIF occurrence 5939349319 (an orca human-observation in Åstfjorden,
 * Norway, CC BY 4.0). Live occurrences come from the GBIF/OBIS connectors at
 * runtime; this fixture guarantees one worked example is always inspectable, and
 * the image is a NOAA Fisheries public-domain photograph with a full rights record.
 */
export const DEMO_WHALE_OCCURRENCE: Occurrence = {
  lat: 63.44559,
  lng: 9.304561,
  scientificName: "Orcinus orca",
  commonName: "Orca",
  eventDate: "2026-01-03",
  sourceRecordId: "5939349319",
  sourceUrl: "https://www.gbif.org/occurrence/5939349319",
  taxonKey: 2440483,
  coordinateUncertaintyM: 1000,
  // Media is a separate NOAA Fisheries public-domain photograph (the base GBIF
  // record itself carries no media); shown here to demonstrate the licensed-image
  // path. The caption states it is illustrative of the species, not this event.
  mediaUrl: "https://www.fisheries.noaa.gov/s3/styles/original/s3/dam-migration/killer-whale_orca-noaa.jpg",
  mediaLicence: "Public domain (U.S. Government work)",
  mediaAttribution: "NOAA Fisheries (public domain) — illustrative of the species",
};

export const DEMO_WHALE_META = {
  recordId: "5939349319",
  identity: "Orca (Orcinus orca)",
  observed: "2026-01-03",
  sourceUrl: "https://www.gbif.org/occurrence/5939349319",
  coordinateUncertaintyM: 1000,
  imageUrl: DEMO_WHALE_OCCURRENCE.mediaUrl!,
  licence: DEMO_WHALE_OCCURRENCE.mediaLicence!,
  attribution: DEMO_WHALE_OCCURRENCE.mediaAttribution!,
  disclosure:
    "This point is where a record was reported on 2026-01-03, not where the animal is now. The image is illustrative of the species, not this event. Coordinate was rounded by the source (±1000 m).",
};
