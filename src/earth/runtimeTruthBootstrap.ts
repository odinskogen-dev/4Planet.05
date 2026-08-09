/*
 * 4PLANET_ ATLAS RUNTIME TRUTH BOOTSTRAP
 *
 * Bounded additive repair over the preserved V36 layer registry. The large
 * layer file remains historical implementation evidence; this module corrects
 * only material public truth semantics at runtime, reducing regression risk.
 */

import { LAYERS } from "./layers";

export type AtlasLayerTruth = {
  freshness: "COMPUTED_NOW" | "SOURCE_DATED" | "HISTORICAL" | "CURATED_STATUS" | "UNKNOWN";
  claimId?: string;
  limitation: string;
};

const layer = (id: string) => LAYERS.find((candidate: any) => candidate.id === id) as any;

const patch = (id: string, values: Record<string, unknown>, truth: AtlasLayerTruth) => {
  const target = layer(id);
  if (!target) return;
  Object.assign(target, values, { truth });
};

patch("truecolor", {
  label: "NASA EARTHDATA · SOURCE-DATED",
  note: "Source-dated MODIS true-colour imagery. The default request is offset from today to improve source availability; dark wedges are unimaged areas, not empty ones.",
}, {
  freshness: "SOURCE_DATED",
  claimId: "CLM-PROD-007",
  limitation: "Fetched in the current session does not mean observed today. Use the requested source date.",
});

patch("sst", {
  note: "Source-dated GHRSST L4 MUR sea-surface-temperature analysis. This layer is requested with a source-date offset and is not a live ocean thermometer.",
}, {
  freshness: "SOURCE_DATED",
  claimId: "CLM-PROD-010",
  limitation: "Daily analysis and browser fetch time are distinct from observation/product time.",
});

patch("night", {
  label: "NASA · NIGHT LIGHTS · HISTORICAL",
  note: "Historical VIIRS Black Marble imagery requested for 2016-01-01. Brightness shows night-time radiance in that source product; it is not a current city or energy-use reading.",
}, {
  freshness: "HISTORICAL",
  limitation: "Fixed source product date: 2016-01-01.",
});

patch("fires", {
  label: "THERMAL ANOMALIES · SOURCE-DATED",
  note: "Source-dated MODIS thermal anomalies requested for the prior UTC day. Detections can include fire, gas flares and industrial heat; a detection is heat, not proof of wildfire.",
}, {
  freshness: "SOURCE_DATED",
  claimId: "CLM-PROD-010",
  limitation: "The current request uses a dated product; do not infer a precise rolling 24-hour window from browser fetch time.",
});

patch("ndvi", {
  note: "Source-dated MODIS 8-day vegetation-index product. NDVI represents vegetation greenness, not a current field measurement of ecosystem condition.",
}, {
  freshness: "SOURCE_DATED",
  limitation: "The current request is intentionally date-offset and product-specific.",
});

patch("seaice", {
  note: "Source-dated AMSR2 sea-ice-concentration product. It shows the requested product date, not an automatically current condition at browser fetch time.",
}, {
  freshness: "SOURCE_DATED",
  limitation: "Source product date and fetch time are distinct.",
});

patch("aerosol", {
  note: "Source-dated MODIS aerosol optical depth: an atmospheric-column proxy for aerosols such as smoke, dust and pollution, not a ground-level air-quality measurement.",
}, {
  freshness: "SOURCE_DATED",
  limitation: "AOD is a satellite-derived column property, not a direct ground concentration measurement.",
});

patch("precip", {
  note: "Source-dated GPM IMERG precipitation-rate product requested for the prior UTC day. It is not a live ground measurement and should not be read as rain or snow falling right now.",
}, {
  freshness: "SOURCE_DATED",
  claimId: "CLM-PROD-007",
  limitation: "The current implementation requests a dated prior-day product; browser fetch time is not observation time.",
});

patch("forest", {
  label: "HISTORICAL TREE-COVER LOSS",
  note: "Historical Hansen/UMD tree-cover-loss raster served through Global Forest Watch. Loss is not synonymous with deforestation and this implementation is not a live forest-loss feed.",
  legend: {
    ...layer("forest")?.legend,
    sub: "Year-of-loss raster · implementation source version v1.11 · not live",
  },
}, {
  freshness: "HISTORICAL",
  claimId: "CLM-DATA-006",
  limitation: "The active tile path is version v1.11; do not relabel it with a newer dataset period without exact implementation evidence.",
});

patch("coral", {
  note: "Satellite-derived accumulated coral heat stress (Degree Heating Weeks). This indicates thermal stress and bleaching risk under NOAA Coral Reef Watch methodology; it is not a field observation of bleaching or mortality.",
}, {
  freshness: "SOURCE_DATED",
  claimId: "CLM-W02-SCI-001",
  limitation: "Heat stress/risk is not an observed ecological outcome.",
});

patch("biodiv", {
  label: "GBIF RECORD DENSITY",
  note: "Density of GBIF occurrence records. Bright areas are heavily recorded, not necessarily more biodiverse or more abundant; absence of density is not confirmed absence of life.",
}, {
  freshness: "UNKNOWN",
  claimId: "CLM-DATA-009",
  limitation: "Occurrence-record density reflects recording effort and source coverage as well as biological patterns.",
});

patch("whales", {
  note: "Bounded OBIS cetacean occurrence records. These are historical/source records — not live positions, migration routes or population estimates.",
}, {
  freshness: "UNKNOWN",
  claimId: "CLM-W02-DATA-002",
  limitation: "Returned record count is not animal abundance or population size.",
});

patch("species", {
  note: "Bounded GBIF vertebrate occurrence records sampled across continents. A record means an occurrence was reported; no dot does not mean no life, and record count does not equal population.",
}, {
  freshness: "UNKNOWN",
  claimId: "CLM-DATA-009",
  limitation: "Sampling/recording effort and upstream dataset coverage affect the visible distribution.",
});

patch("events", {
  note: "Events currently marked open in NASA EONET's curated feed. Source status is editorial/curated and does not establish the exact physical start or end of an event.",
}, {
  freshness: "CURATED_STATUS",
  claimId: "CLM-DATA-001",
  limitation: "EONET open/closed status is a source-curation state, not an exact physical-event clock.",
});

patch("quakes", {
  note: "USGS earthquake-feed records from the past-day feed. Feed records can be revised as events are reviewed; retrieval time does not make an event final.",
}, {
  freshness: "SOURCE_DATED",
  claimId: "CLM-DATA-003",
  limitation: "USGS event parameters may be revised after initial publication.",
});

// Day/night is computed from the current solar position rather than fetched ecology.
patch("shade", {}, {
  freshness: "COMPUTED_NOW",
  limitation: "Computed astronomical context; not an ecological observation.",
});

export const ATLAS_TRUTH_BOOTSTRAP_VERSION = "atlas-truth-bootstrap-v1.0.0";
