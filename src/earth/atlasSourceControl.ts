export type AtlasSourceStage =
  | "DISCOVERED"
  | "TERMS_CHECKED"
  | "ENDPOINT_VERIFIED"
  | "PROBED"
  | "ADAPTER_GREEN"
  | "MAP_GREEN"
  | "PROMOTION_CANDIDATE"
  | "AUTH_REQUIRED"
  | "RIGHTS_GATED"
  | "RESEARCH_REQUIRED"
  | "SOURCE_DOWN"
  | "UNSUITABLE";

export type AtlasGateState = "PASS" | "PENDING" | "BLOCKED" | "NOT_CHECKED";

export interface AtlasSourceControlRecord {
  id: string;
  authority: string;
  value: string;
  stage: AtlasSourceStage;
  endpoint: AtlasGateState;
  layerContract: AtlasGateState;
  map: AtlasGateState;
  rights: AtlasGateState;
  auth: "NONE" | "FREE_KEY_SERVER_SIDE" | "TOKEN_REQUIRED" | "MIXED" | "VERIFY";
  temporalSemantics: string;
  failureMeaning: string;
  limitation: string;
  checkedAt: string;
  evidenceRefs: string[];
}

/**
 * Canonical ATLAS source-control projection recovered from the Data Lab.
 *
 * Important: this does not replace BRAIN/source canon. It is the runtime release
 * control for the spatial product. The four gates deliberately remain separate:
 * ENDPOINT PASS does not imply LAYER CONTRACT PASS; contract PASS does not imply
 * MAP PASS; none of those imply RIGHTS PASS.
 */
export const ATLAS_SOURCE_CONTROL: Record<string, AtlasSourceControlRecord> = {
  "emodnet-bathymetry": {
    id: "emodnet-bathymetry",
    authority: "European Marine Observation and Data Network (EMOdnet)",
    value: "Pan-European seabed depth / bathymetric context",
    stage: "PROMOTION_CANDIDATE",
    endpoint: "PASS",
    layerContract: "PASS",
    map: "PENDING",
    rights: "PASS",
    auth: "NONE",
    temporalSemantics: "STATIC PRODUCT",
    failureMeaning: "Source/tile unavailable — never zero depth or absent seabed.",
    limitation: "Depth context only; not habitat condition or ecological status.",
    checkedAt: "2026-09-01",
    evidenceRefs: ["PR#72", "PR#217", "EMODnet web-service documentation"],
  },
  "emodnet-seabed-habitats": {
    id: "emodnet-seabed-habitats",
    authority: "EMOdnet Seabed Habitats / EUSeaMap",
    value: "Broad-scale predictive seabed habitat classification",
    stage: "PROMOTION_CANDIDATE",
    endpoint: "PASS",
    layerContract: "PASS",
    map: "PENDING",
    rights: "PASS",
    auth: "NONE",
    temporalSemantics: "EUSeaMap 2025 SNAPSHOT",
    failureMeaning: "Tile failure is source unavailable, not absence of habitat.",
    limitation: "Predictive broad habitat class; not field observation, current condition or local confirmation.",
    checkedAt: "2026-09-01",
    evidenceRefs: ["PR#72", "PR#217", "EUSeaMap 2025 / CC BY 4.0"],
  },
  "emodnet-chemistry-oxygen": {
    id: "emodnet-chemistry-oxygen",
    authority: "EMOdnet Chemistry / University of Liège",
    value: "Dissolved-oxygen monthly climatology",
    stage: "ADAPTER_GREEN",
    endpoint: "PASS",
    layerContract: "PASS",
    map: "PENDING",
    rights: "PENDING",
    auth: "NONE",
    temporalSemantics: "MONTHLY CLIMATOLOGY · MONTH 01–12 · NOT CURRENT",
    failureMeaning: "Source failure is unavailable; never interpreted as zero oxygen.",
    limitation: "Climatology is a long-term seasonal pattern, not a current measurement or proof of hypoxia.",
    checkedAt: "2026-09-01",
    evidenceRefs: ["PR#72", "PR#217", "EMODnet Chemistry service"],
  },
  "emodnet-fishing-vessel-density": {
    id: "emodnet-fishing-vessel-density",
    authority: "EMOdnet Human Activities",
    value: "Historical AIS-derived fishing-vessel density",
    stage: "PROMOTION_CANDIDATE",
    endpoint: "PASS",
    layerContract: "PASS",
    map: "PENDING",
    rights: "PASS",
    auth: "NONE",
    temporalSemantics: "ANNUAL SLICES 2017–2024 · HISTORICAL",
    failureMeaning: "Source failure is unavailable; never no fishing activity.",
    limitation: "Vessel density is not live fishing, catch, legality or ecological impact.",
    checkedAt: "2026-09-01",
    evidenceRefs: ["PR#72", "PR#217", "EMODnet Human Activities service"],
  },
  "artsdatabanken-artskart": {
    id: "artsdatabanken-artskart",
    authority: "Artsdatabanken / Artskart",
    value: "Norwegian taxon names and georeferenced occurrence records",
    stage: "ENDPOINT_VERIFIED",
    endpoint: "PASS",
    layerContract: "NOT_CHECKED",
    map: "NOT_CHECKED",
    rights: "PENDING",
    auth: "NONE",
    temporalSemantics: "SOURCE RECORD DATES · ARTSKART INGEST/INDEX UPDATES",
    failureMeaning: "No response or no query result cannot be converted into species absence.",
    limitation: "Sensitive-species masking/generalisation and duplicate/source identity must be preserved; exact locality may intentionally be unavailable.",
    checkedAt: "2026-09-01",
    evidenceRefs: [
      "https://artsdatabanken.no/Pages/195884",
      "https://artskart.artsdatabanken.no/publicapi/swagger",
      "https://artsdatabanken.no/kart/artskart/kvalitetssikring-og-foredling-av-data-i-artskart",
    ],
  },
  "kartverket-stedsnavn": {
    id: "kartverket-stedsnavn",
    authority: "Kartverket / Geonorge",
    value: "Authoritative Norwegian place names",
    stage: "ENDPOINT_VERIFIED",
    endpoint: "PASS",
    layerContract: "NOT_CHECKED",
    map: "NOT_CHECKED",
    rights: "PENDING",
    auth: "NONE",
    temporalSemantics: "CURRENT REGISTER LOOKUP",
    failureMeaning: "No name result is not proof a place does not exist.",
    limitation: "Place-name identity is not an ecological, hydrological or administrative boundary.",
    checkedAt: "2026-09-01",
    evidenceRefs: ["Data Lab PR#72 source registry", "https://ws.geonorge.no/stedsnavn/v1/"],
  },
  "nasa-firms": {
    id: "nasa-firms",
    authority: "NASA LANCE / FIRMS",
    value: "Record-level VIIRS/MODIS thermal anomaly detections",
    stage: "AUTH_REQUIRED",
    endpoint: "PASS",
    layerContract: "PENDING",
    map: "BLOCKED",
    rights: "PASS",
    auth: "FREE_KEY_SERVER_SIDE",
    temporalSemantics: "BOUNDED NRT/RT DETECTIONS · PROVIDER PROCESSING STATE",
    failureMeaning: "Unavailable/credential failure is not zero fires.",
    limitation: "Thermal anomaly is not automatically wildfire, burned area, cause, severity or ecological impact.",
    checkedAt: "2026-09-01",
    evidenceRefs: ["Issue#144 source/data pack", "NASA FIRMS Area API"],
  },
  "global-fishing-watch": {
    id: "global-fishing-watch",
    authority: "Global Fishing Watch",
    value: "Vessel/apparent fishing activity data where licensed and authorised",
    stage: "AUTH_REQUIRED",
    endpoint: "PENDING",
    layerContract: "BLOCKED",
    map: "BLOCKED",
    rights: "PENDING",
    auth: "TOKEN_REQUIRED",
    temporalSemantics: "SOURCE-DEFINED ACTIVITY WINDOWS",
    failureMeaning: "Auth/source failure is not no vessels/no fishing.",
    limitation: "Apparent fishing effort is not catch, illegality or ecological impact.",
    checkedAt: "2026-09-01",
    evidenceRefs: ["PR#72 adapter seam", "Issue#144"],
  },
  "unesco-mab": {
    id: "unesco-mab",
    authority: "UNESCO — Man and the Biosphere Programme",
    value: "Global biosphere-reserve places and designation context",
    stage: "MAP_GREEN",
    endpoint: "PASS",
    layerContract: "PASS",
    map: "PASS",
    rights: "PASS",
    auth: "NONE",
    temporalSemantics: "DESIGNATION / SOURCE-RECORD DATES · NOT LIVE ECOLOGICAL CONDITION",
    failureMeaning: "Source failure is unavailable; never no reserve / no nature value.",
    limitation: "Representative point is not reserve boundary; designation is not current ecosystem-health proof.",
    checkedAt: "2026-10-14",
    evidenceRefs: ["GitHub Actions run 38549826114 — functional base 8dc330f: endpoint/schema + contract + typecheck + build + Chromium/WebKit desktop/mobile map proof PASS", "https://data.unesco.org/explore/dataset/mab001/?flg=en-us", "CC BY-SA 4.0", "axe/green-data-atlas-20261013", "GitHub Actions run 38393160065 — live endpoint/schema + typecheck + build PASS"],
  },
  "unesco-world-heritage": {
    id: "unesco-world-heritage",
    authority: "UNESCO World Heritage Centre",
    value: "Global World Heritage places for country/place exploration",
    stage: "MAP_GREEN",
    endpoint: "PASS",
    layerContract: "PASS",
    map: "PASS",
    rights: "PASS",
    auth: "NONE",
    temporalSemantics: "INSCRIPTION / ANNUAL LIST STATE",
    failureMeaning: "Source failure is unavailable; never absence of heritage.",
    limitation: "Source point is not complete site boundary; designation is not present-condition proof.",
    checkedAt: "2026-10-14",
    evidenceRefs: ["GitHub Actions run 38549826114 — functional base 8dc330f: endpoint/schema + contract + typecheck + build + Chromium/WebKit desktop/mobile map proof PASS", "https://data.unesco.org/explore/dataset/whc001/?flg=en-us", "CC BY-SA 4.0", "axe/green-data-atlas-20261013", "GitHub Actions run 38393160065 — live endpoint/schema + typecheck + build PASS"],
  },
  "unesco-geoparks": {
    id: "unesco-geoparks",
    authority: "UNESCO Global Geoparks",
    value: "Globally significant geological places and human/nature context",
    stage: "MAP_GREEN",
    endpoint: "PASS",
    layerContract: "PASS",
    map: "PASS",
    rights: "PASS",
    auth: "NONE",
    temporalSemantics: "DESIGNATION RECORDS · MIXED EDITION VISIBLE · FOUR-YEAR REVALIDATION · NOT CURRENT-STATUS PROOF",
    failureMeaning: "Source failure is unavailable; never no geopark/geological value.",
    limitation: "Representative point is not a geopark boundary. DataHub description is stale; designation does not establish current legal protection, current revalidation status or ecological outcome.",
    checkedAt: "2026-10-14",
    evidenceRefs: ["GitHub Actions run 38549826114 — functional base 8dc330f: endpoint/schema + contract + typecheck + build + Chromium/WebKit desktop/mobile map proof PASS", "https://data.unesco.org/explore/dataset/eg0001/?flg=en-us — description 2025-01-15; processed 2026-05-28", "https://www.unesco.org/en/iggp/geoparks — updated 2026-07-24; 241 geoparks / 51 countries", "CC BY-SA 4.0", "axe/green-data-atlas-20261013", "GitHub Actions run 38393160065 — live endpoint/schema + typecheck + build PASS"],
  },
  "unesco-obis-ocean-areas": {
    id: "unesco-obis-ocean-areas",
    authority: "IOC-UNESCO / IODE — Ocean Biodiversity Information System",
    value: "Area-level marine biodiversity summaries for EEZ, ABNJ/high seas and EBSA contexts",
    stage: "MAP_GREEN",
    endpoint: "PASS",
    layerContract: "PASS",
    map: "PASS",
    rights: "PASS",
    auth: "NONE",
    temporalSemantics: "HISTORICAL OCCURRENCE-RECORD SPAN PER AREA · NOT LIVE CONDITIONS",
    failureMeaning: "Source failure is unavailable; never zero species / zero observations.",
    limitation: "Counts include sampling effort and are not abundance, complete richness, range or live positions; point is not area boundary.",
    checkedAt: "2026-10-14",
    evidenceRefs: ["GitHub Actions run 38549826114 — functional base 8dc330f: endpoint/schema + contract + typecheck + build + Chromium/WebKit desktop/mobile map proof PASS", "https://data.unesco.org/explore/dataset/ioc001/?flg=en-us", "https://obis.org", "CC BY-SA 4.0", "axe/green-data-atlas-20261013", "GitHub Actions run 38393160065 — live endpoint/schema + typecheck + build PASS"],
  },
  "protected-planet": {
    id: "protected-planet",
    authority: "UNEP-WCMC / IUCN Protected Planet",
    value: "Protected and conserved area records/boundaries",
    stage: "RIGHTS_GATED",
    endpoint: "PENDING",
    layerContract: "BLOCKED",
    map: "BLOCKED",
    rights: "BLOCKED",
    auth: "TOKEN_REQUIRED",
    temporalSemantics: "DATASET RELEASE / RECORD UPDATE",
    failureMeaning: "Not wired means NOT CHECKED, never no protected area.",
    limitation: "Commercial-use/access terms require explicit clearance before activation.",
    checkedAt: "2026-09-01",
    evidenceRefs: ["Current src/planet/sources.ts", "Data Lab source backlog"],
  },
};

export const atlasSourceControl = (id: string) => ATLAS_SOURCE_CONTROL[id];

export function atlasPromotionBlockers(id: string) {
  const record = atlasSourceControl(id);
  if (!record) return ["SOURCE_NOT_REGISTERED"];
  const blockers: string[] = [];
  if (record.endpoint !== "PASS") blockers.push("ENDPOINT");
  if (record.layerContract !== "PASS") blockers.push("LAYER_CONTRACT");
  if (record.map !== "PASS") blockers.push("MAP");
  if (record.rights !== "PASS") blockers.push("RIGHTS");
  return blockers;
}
