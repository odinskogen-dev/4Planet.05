import type { PlaceRelationRef } from "@/planet/placeModel";

export const INNER_OSLOFJORD_SOURCE = {
  id: "marine-regions-5333",
  label: "Marine Regions — Inner Oslofjord (MRGID 5333)",
  publisher: "Flanders Marine Institute / Marine Regions",
  url: "https://marineregions.org/mrgid/5333",
  checkedAt: "2026-08-09",
};

/**
 * Marine Regions explicitly records Inner Oslofjord / Indre Oslofjord as a
 * Fjord with MRGID 5333 and relation "Part of Oslofjorden".
 *
 * This adds a semantic sub-place relation only. It does not create a query,
 * display, scientific or management polygon for Inner Oslofjord.
 */
export const OSLOFJORD_PLACE_RELATIONS: PlaceRelationRef[] = [
  {
    id: "place-relation:marine-regions:5333-part-of-3379",
    relation: "PART_OF",
    fromPlaceId: "place:marine-regions:5333",
    toPlaceId: "place:marine-regions:3379",
    label: "Inner Oslofjord / Indre Oslofjord",
    source: INNER_OSLOFJORD_SOURCE,
    sourceRecordId: "MRGID 5333",
    representativePoint: { lat: 59.83333333, lng: 10.66666667, crs: "WGS 84" },
    limitation: "Marine Regions supports the named place identity and PART_OF relation. This record does not provide 4PLANET with a universal child polygon or permission to use the representative point as a biodiversity query boundary.",
  },
];
