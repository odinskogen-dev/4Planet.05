export const OSLOFJORDEN_SEMANTIC_IDENTITY = {
  productId: "place:marine-regions:3379",
  name: "Oslofjorden",
  plainType: "Fjord",
  source: "Marine Regions / VLIZ Marine Gazetteer",
  sourceId: "MRGID 3379",
  sourceUrl: "https://www.marineregions.org/mrgid/3379",
  representativePoint: {
    lat: 59.66666667,
    lng: 10.61666667,
    precisionMetres: 56000,
    crs: "WGS 84",
  },
  sourceStatus: "PROPOSED STANDARD",
  checkedAt: "2026-08-09",
  geometryState: "NOT_YET_SELECTED" as const,
  geometryLimitation:
    "The Marine Regions record supports a persistent semantic fjord identity and representative coordinate, not one authoritative ecological, legal, management or display polygon for all Oslofjorden uses.",
  implementationRule:
    "Keep semantic identity separate from display geometry, scientific/management boundaries, official waterbody geometries, local query areas and administrative context.",
} as const;
