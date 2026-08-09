export interface ScientificDatasetRecord {
  id: string;
  title: string;
  publisher: string;
  datasetType: "SAMPLING_EVENT" | "OCCURRENCE";
  sourceUrl: string;
  sourceId: string;
  publishedAt: string;
  checkedAt: string;
  license: string;
  licenseUrl: string;
  geographicScope: string;
  /** Source-reported data extent. Never a 4PLANET place boundary. */
  sourceExtent?: { south: number; west: number; north: number; east: number };
  temporalCoverage: string;
  metrics: Array<{ label: string; value: string; meaning: string }>;
  samplingContext: string;
  whyItMatters: string;
  limitation: string;
}

/**
 * Latest published IPT resource checked 2026-08-09.
 * The source itself labels its geographic coverage Inner Oslofjorden and gives
 * the bounding coordinates below. 4PLANET stores that rectangle as DATASET
 * EXTENT only: it is not promoted to Oslofjorden semantic/query/display geometry.
 */
export const INNER_OSLOFJORD_PHYTOPLANKTON: ScientificDatasetRecord = {
  id: "dataset:gbif-no:777ea835-48a3-4136-bf3a-32c5b897563f",
  title: "Inner Oslofjorden Phytoplankton Database",
  publisher: "UiO Department of Biosciences",
  datasetType: "SAMPLING_EVENT",
  sourceUrl: "https://ipt.gbif.no/resource?r=oslofjord_phytoplankton",
  sourceId: "GBIF UUID 777ea835-48a3-4136-bf3a-32c5b897563f",
  publishedAt: "2022-11-17",
  checkedAt: "2026-08-09",
  license: "CC-BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  geographicScope: "Inner Oslofjorden, Norway",
  sourceExtent: { south: 59.661, west: 10.415, north: 59.933, east: 10.956 },
  temporalCoverage: "1896-02-14 → 2020-12-14",
  metrics: [
    { label: "Sampling events", value: "732", meaning: "Event-core records in version 1.16." },
    { label: "Occurrence records", value: "22,635", meaning: "Taxon-occurrence extension records attached to sampling events." },
    { label: "Measurements", value: "3,816", meaning: "MeasurementOrFacts extension records." },
    { label: "Accepted taxa", value: "411", meaning: "Unique accepted taxa registrations reported in the dataset metadata." },
    { label: "Classes", value: "18", meaning: "Taxonomic classes represented in the dataset metadata." },
  ],
  samplingContext: "Long-term quantitative phytoplankton cell-count compilation. The primary monitoring programme dates from 1973; 2006–2020 was sampled approximately monthly. The dataset also includes earlier projects back to 1896. The source reports that 61% of samples are from Dk1/S1 at 59.814999°N, 10.569384°E.",
  whyItMatters: "It makes microscopic life visible as a first-class part of the place story and supplies a bounded historical monitoring record rather than a charismatic-species-only view of the fjord.",
  limitation: "The archive ends in 2020 and its record counts are database records, not organism abundance or current ecological condition. Its source-reported bounding box is a dataset extent, not a universal Inner Oslofjord or Oslofjorden boundary. Dinoflagellate/diatom record shares describe the archive's records, not present-day population shares.",
};

export const BEKKELAG_BENTHIC_FORAMINIFERA: ScientificDatasetRecord = {
  id: "dataset:gbif-no:101f5645-c5c0-4981-a1a2-3d2bb1853edf",
  title: "Bekkelag basin, Inner Oslofjord",
  publisher: "University of Oslo",
  datasetType: "OCCURRENCE",
  sourceUrl: "https://ipt.gbif.no/resource?r=foram-bekkelag",
  sourceId: "GBIF UUID 101f5645-c5c0-4981-a1a2-3d2bb1853edf",
  publishedAt: "2021-08-04",
  checkedAt: "2026-08-09",
  license: "CC-BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  geographicScope: "Three sites in Bekkelag basin, Inner Oslofjord",
  temporalCoverage: "2008 → 2014",
  metrics: [
    { label: "Occurrence records", value: "498", meaning: "Published dataset records in version 1.7." },
    { label: "Sampling context", value: "3 sites", meaning: "Living benthic foraminifera sampled at three sites in the Bekkelag basin." },
    { label: "Sediment depth", value: "0–3 cm", meaning: "Upper sediment interval represented by the samples." },
  ],
  samplingContext: "Living benthic foraminifera (>63 µm) collected during 2008–2014 for a recolonisation study. Gravity-corer samples represent the upper 0–3 cm of sediment, with three replicates per sampling event.",
  whyItMatters: "It adds sediment-dwelling microscopic life and a recovery/recolonisation research context, preventing the product from reducing 'life in the fjord' to fish and visible habitat alone.",
  limitation: "This is a historical research dataset from three sites in one basin. It does not describe the whole Oslofjord, current benthic condition or a verified recovery outcome.",
};

/** Current national source readiness, not an Oslofjord query result. */
export const VANNMILJO_LIFE_SOURCE: ScientificDatasetRecord = {
  id: "dataset:gbif-no:46293000-ddd1-4c32-a1e7-b5e793223ecd",
  title: "Vannmiljø — artsforekomster",
  publisher: "Norwegian Environment Agency",
  datasetType: "OCCURRENCE",
  sourceUrl: "https://ipt.gbif.no/resource?r=vannmiljo",
  sourceId: "GBIF UUID 46293000-ddd1-4c32-a1e7-b5e793223ecd",
  publishedAt: "2026-07-21",
  checkedAt: "2026-08-09",
  license: "CC-BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  geographicScope: "Norway — rivers, lakes and coastal waters; no Oslofjord subset selected in this candidate",
  temporalCoverage: "Continually updated source",
  metrics: [
    { label: "Source records", value: "1,985,360", meaning: "Records in the published national version checked 21 July 2026; not an Oslofjord count." },
    { label: "Update frequency", value: "Continually", meaning: "Source metadata update frequency; not a promise of real-time observations." },
  ],
  samplingContext: "The Environment Agency's Vannmiljø system is used to register and analyse environmental-quality data in rivers, lakes and coastal waters and publishes species occurrences through GBIF Norway.",
  whyItMatters: "It is a strong official source candidate for future local coastal-water LIFE and monitoring records once a defensible query geometry and record contract are selected.",
  limitation: "No Oslofjorden subset has been queried or ingested here. The national record total must never be displayed as Oslofjorden coverage, and 'continually updated' does not mean every record is current or live.",
};

export const OSLOFJORD_SCIENTIFIC_DATASETS = [
  INNER_OSLOFJORD_PHYTOPLANKTON,
  BEKKELAG_BENTHIC_FORAMINIFERA,
] as const;
