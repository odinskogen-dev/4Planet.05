import type { PlaceGeometryRef, PlaceSourceRef } from "@/planet/placeModel";

/**
 * Spatial truth for the Oslofjorden proof.
 *
 * Rule: a spatial object is admitted for one declared job. It does not become
 * the canonical boundary of Oslofjorden by being useful for that job.
 */

const NLOD_2_URL = "https://data.norge.no/nlod/no/2.0";

export const MARINE_REGIONS_OSLOFJORD_SOURCE: PlaceSourceRef = {
  id: "marine-regions-3379",
  label: "Marine Regions — Oslofjorden (MRGID 3379)",
  publisher: "Flanders Marine Institute / Marine Regions",
  url: "https://www.marineregions.org/gazetteer.php?id=3379&p=details",
  checkedAt: "2026-08-09",
};

export const VANN_NETT_COASTAL_SOURCE: PlaceSourceRef = {
  id: "vann-nett-kystvannforekomster",
  label: "Vann-Nett — Kystvannforekomster",
  publisher: "Miljødirektoratet",
  url: "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1",
  checkedAt: "2026-08-09",
  sourceVersion: "Vann-Nett service checked 2026-08-09",
};

export const VANNMILJO_API_SOURCE: PlaceSourceRef = {
  id: "vannmiljo-public-api",
  label: "Vannmiljø Web API — GetRegistrations",
  publisher: "Miljødirektoratet",
  url: "https://vannmiljoapi.miljodirektoratet.no/swagger/ui/index",
  checkedAt: "2026-08-09",
};

export const INNER_OSLOFJORD_PHYTOPLANKTON_SPATIAL_SOURCE: PlaceSourceRef = {
  id: "gbif-inner-oslofjord-phytoplankton",
  label: "Inner Oslofjorden Phytoplankton Database",
  publisher: "University of Oslo / GBIF Norway",
  url: "https://ipt.gbif.no/resource?r=oslofjord_phytoplankton",
  checkedAt: "2026-08-09",
  publishedAt: "2022-11-17",
};

export const OSLOFJORD_PRIMARY_WATERBODY_ID = "0101020601-C" as const;

export const OSLOFJORD_SPATIAL_REGISTRY: PlaceGeometryRef[] = [
  {
    id: "oslofjord-semantic-identity",
    use: "SCIENTIFIC",
    role: "SEMANTIC_IDENTITY",
    label: "Oslofjorden semantic identity",
    availability: "INGESTED",
    source: MARINE_REGIONS_OSLOFJORD_SOURCE,
    sourceRecordId: "MRGID 3379",
    geometryType: "POINT",
    crs: "WGS 84",
    rights: {
      status: "REVIEW_REQUIRED",
      label: "Source terms must be rechecked before geometry redistribution",
      reuseNote: "The candidate stores the source identity and representative point, not a republished universal fjord polygon.",
    },
    intendedUse: "Persistent semantic identity and representative location only.",
    precision: "Representative point precision reported in the product as 56,000 m.",
    supersessionState: "CURRENT",
    limitation: "MRGID 3379 identifies the fjord. It does not define one authoritative polygon for display, biodiversity queries, science, management or regulation.",
  },
  {
    id: "oslofjord-display",
    use: "DISPLAY",
    role: "DISPLAY",
    label: "Public display geometry",
    availability: "NOT_SELECTED",
    intendedUse: "Future visual orientation only.",
    supersessionState: "CURRENT",
    limitation: "No display polygon has been selected. The product must not draw a source-looking Oslofjorden outline merely to make the map feel complete.",
  },
  {
    id: "oslofjord-vannnett-waterbody-status-0101020601-C",
    use: "WATERBODY",
    role: "WATERBODY_STATUS",
    label: "Vann-Nett coastal waterbody — Oslofjorden",
    availability: "RUNTIME_SOURCE",
    source: VANN_NETT_COASTAL_SOURCE,
    sourceRecordId: OSLOFJORD_PRIMARY_WATERBODY_ID,
    geometryType: "POLYGON",
    crs: "ETRS89 / UTM zone 33N at source; requested as WGS 84 for display",
    sourceVersion: "Live Vann-Nett external map service; checked 2026-08-09",
    rights: {
      status: "OPEN",
      label: "Norsk lisens for offentlige data (NLOD) 2.0 — attribution required",
      url: NLOD_2_URL,
      reuseNote: "Miljødirektoratet is the source. 4PLANET must preserve attribution/source context, identify material transformations and must not imply source endorsement. NLOD permits copying, redistribution, modification and combination subject to its terms.",
    },
    intendedUse: "Show one official coastal-waterbody area and its source identity/status context; never define the whole fjord.",
    precision: "Source polygon; no 4PLANET simplification is treated as source geometry.",
    supersessionState: "CURRENT",
    limitation: "Waterbody 0101020601-C is an official management/status unit named Oslofjorden. It is not the semantic, ecological, regulatory or universal display boundary of the fjord.",
  },
  {
    id: "oslofjord-vannmiljo-query-0101020601-C",
    use: "QUERY",
    role: "BIODIVERSITY_QUERY",
    label: "Vannmiljø registrations filtered by official WaterBodyID",
    availability: "RUNTIME_SOURCE",
    source: VANNMILJO_API_SOURCE,
    sourceRecordId: OSLOFJORD_PRIMARY_WATERBODY_ID,
    geometryType: "WATERBODY_SET",
    rights: {
      status: "OPEN",
      label: "Norsk lisens for offentlige data (NLOD) 2.0 — attribution required",
      url: NLOD_2_URL,
      reuseNote: "Miljødirektoratet is the source. 4PLANET must preserve attribution/source context, identify material transformations and must not imply source endorsement. Runtime access does not change the underlying NLOD conditions.",
    },
    intendedUse: "Retrieve Vannmiljø registrations explicitly attached by the source to WaterBodyID 0101020601-C.",
    precision: "Record coordinates are source-supplied; source attachment to the waterbody is authoritative for the query contract, not a 4PLANET point-in-polygon inference.",
    supersessionState: "CURRENT",
    limitation: "A record returned under this WaterBodyID is a Vannmiljø registration linked to that official waterbody. It is not a live organism position, whole-fjord inventory, abundance estimate or trend.",
  },
  {
    id: "inner-oslofjord-phytoplankton-source-extent",
    use: "SCIENTIFIC",
    role: "SCIENTIFIC_AREA",
    label: "Inner Oslofjorden Phytoplankton Database source extent",
    availability: "INGESTED",
    source: INNER_OSLOFJORD_PHYTOPLANKTON_SPATIAL_SOURCE,
    sourceRecordId: "GBIF UUID 777ea835-48a3-4136-bf3a-32c5b897563f",
    geometryType: "BOUNDING_BOX",
    crs: "WGS 84",
    rights: {
      status: "OPEN",
      label: "CC-BY 4.0 dataset",
      url: "https://creativecommons.org/licenses/by/4.0/",
    },
    intendedUse: "Describe the published dataset extent and constrain interpretation of its historical records.",
    resolution: "Dataset extent south 59.661 / west 10.415 / north 59.933 / east 10.956.",
    supersessionState: "CURRENT",
    limitation: "A dataset extent is not a place boundary and must never be promoted to Inner Oslofjord or Oslofjorden display/query geometry.",
  },
  {
    id: "oslofjord-regulatory-fisheries",
    use: "REGULATORY",
    role: "REGULATORY",
    label: "Fisheries regulation area",
    availability: "SOURCE_AVAILABLE_NOT_INGESTED",
    source: {
      id: "oslofjord-fisheries-regulation-2026",
      label: "Forskrift om regulering av fiske i Oslofjorden",
      publisher: "Lovdata / Nærings- og fiskeridepartementet",
      url: "https://lovdata.no/dokument/SF/forskrift/2025-12-19-2889",
      checkedAt: "2026-08-09",
      publishedAt: "2025-12-29",
    },
    sourceRecordId: "FOR-2025-12-19-2889 §2 / Vedlegg 1",
    geometryType: "POLYGON",
    rights: {
      status: "REVIEW_REQUIRED",
      label: "Legal source available; geometry reuse not separately cleared in candidate",
      reuseNote: "The regulatory geometry is intentionally not ingested or redistributed in this candidate. It cannot become a release dependency unless that use is separately cleared.",
    },
    intendedUse: "Explain the geographic scope of the fisheries regulation only.",
    supersessionState: "CURRENT",
    limitation: "Regulatory geography is not the canonical ecological, semantic, biodiversity-query or display geometry of Oslofjorden.",
  },
  {
    id: "oslofjord-administrative",
    use: "ADMINISTRATIVE",
    role: "ADMINISTRATIVE",
    label: "Administrative coverage",
    availability: "NOT_SELECTED",
    intendedUse: "Future municipality/county/governance context only.",
    supersessionState: "CURRENT",
    limitation: "Municipal and county boundaries overlap the fjord but do not define it. No administrative union is promoted to an Oslofjorden boundary.",
  },
];

export const geometryForRole = (role: PlaceGeometryRef["role"]) =>
  OSLOFJORD_SPATIAL_REGISTRY.filter((item) => item.role === role);
