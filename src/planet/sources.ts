/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — ADAPTATION LAYER — SOURCE REGISTRY
   STATUS: ADAPTATION. NOT THE CANONICAL SOURCE CONTRACT. (Brief §35)

   Brief §35 DATA RIGHTS: "A connector may not move from API EXISTS to
   PRODUCTION INGESTION without a source compliance assessment appropriate to
   its risk."

   V36 was already using every one of these APIs. It just never wrote down what
   it was allowed to do with them. This file is that missing page — the honest
   version, including the parts where the answer is "we have not checked".

   IMPORTANT: 4PLANET currently *reads* these APIs live from the browser. It
   does not ingest, cache, store or redistribute. That is the lowest-rights
   posture available and it is the correct one until Perplexity's SOURCE
   INTELLIGENCE MAP v1.0 lands and Codex builds real connectors server-side.
   Every rate-limit and cost risk below is a real risk *at public scale*, not a
   theoretical one. Flagged, not solved. See ADAPTATION.md §COST.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * P0 (V38R): IMPLEMENTATION STATUS ≠ RIGHTS STATUS.
 *
 * `implStatus` says what 4PLANET currently DOES with a source. It does NOT say
 * the source has been cleared for that use. The dedicated licensing, attribution,
 * caching and rights assessment is Perplexity's Source Intelligence work and is
 * not yet synthesised. So there is no value here that means "rights approved".
 *
 *   LIVE_READ_IN_PROTOTYPE  we read it live from the browser, right now
 *   NEEDS_KEY               needs a credential 4PLANET has not registered
 *
 * A separate `rightsReview` field records the review state explicitly, and in v1
 * it is PENDING for every source, because that is the truth.
 */
export type ImplStatus = "LIVE_READ_IN_PROTOTYPE" | "NEEDS_KEY";
export type RightsReview = "PENDING";

export interface SourceDescriptor {
  id: string;
  name: string;
  authority: string;
  /** What this source is authoritative *for*. Not what it happens to return. */
  covers: string;
  /** Brief §29: what it does NOT cover. Shown to users. */
  limitation: string;
  licence: string;
  attribution: string;
  /** What 4PLANET currently does. NOT a rights judgement. */
  implStatus: ImplStatus;
  /** Rights review state. PENDING for all sources in v1. */
  rightsReview: RightsReview;
  /** Honest note on rate limits / cost at public scale. */
  costRisk: string;
  home: string;
}

export const SOURCES: Record<string, SourceDescriptor> = {
  gbif: {
    id: "gbif",
    name: "GBIF",
    authority: "Global Biodiversity Information Facility",
    covers: "Occurrence records and taxonomic backbone for life on land and in water.",
    limitation:
      "Records show where people have looked and reported. Sparse records mean sparse observers, not absent life.",
    licence: "Records are CC0 / CC-BY / CC-BY-NC depending on the publishing dataset.",
    attribution: "GBIF.org and the publishing institutions",
    implStatus: "LIVE_READ_IN_PROTOTYPE",
    rightsReview: "PENDING",
    costRisk:
      "Free public API, no key. Fair-use rate limits are undocumented. Live browser reads are fine at current scale; server-side ingestion needs an agreement.",
    home: "https://www.gbif.org",
  },
  obis: {
    id: "obis",
    name: "OBIS",
    authority: "Ocean Biodiversity Information System (IOC/UNESCO)",
    covers: "Marine occurrence records, including cetaceans.",
    limitation:
      "Occurrence records only. Not live positions, not migration routes, not population estimates.",
    licence: "CC-BY (dataset-dependent).",
    attribution: "OBIS / IOC-UNESCO and contributing datasets",
    implStatus: "LIVE_READ_IN_PROTOTYPE",
    rightsReview: "PENDING",
    costRisk: "Free public API. Same caveat as GBIF for server-side ingestion.",
    home: "https://obis.org",
  },
  eonet: {
    id: "eonet",
    name: "NASA EONET",
    authority: "NASA Earth Observatory Natural Event Tracker",
    covers: "Currently open natural events: wildfires, volcanoes, severe storms, sea ice.",
    limitation:
      "Curated event feed, not a complete record of every event on Earth. Open status is editorial, not physical.",
    licence: "NASA open data — generally free of copyright restriction.",
    attribution: "NASA EONET",
    implStatus: "LIVE_READ_IN_PROTOTYPE",
    rightsReview: "PENDING",
    costRisk: "Free, no key. Low risk.",
    home: "https://eonet.gsfc.nasa.gov",
  },
  usgs: {
    id: "usgs",
    name: "USGS",
    authority: "United States Geological Survey",
    covers: "Global earthquake catalogue, past 24 hours.",
    limitation:
      "A seismic event is a geophysical fact, not automatically an ecological one. 4PLANET makes no ecological claim from a quake.",
    licence: "US Government public domain.",
    attribution: "USGS Earthquake Hazards Program",
    implStatus: "LIVE_READ_IN_PROTOTYPE",
    rightsReview: "PENDING",
    costRisk: "Free, no key. Low risk.",
    home: "https://earthquake.usgs.gov",
  },
  gibs: {
    id: "gibs",
    name: "NASA GIBS",
    authority: "NASA Global Imagery Browse Services / EOSDIS",
    covers: "Satellite imagery and derived raster products (true colour, SST, NDVI, fire, ice, aerosol, precipitation, night lights).",
    limitation:
      "Imagery is what the instrument saw. Dark wedges are unimaged areas, not empty ones.",
    licence: "NASA open imagery.",
    attribution: "NASA GIBS / EOSDIS",
    implStatus: "LIVE_READ_IN_PROTOTYPE",
    rightsReview: "PENDING",
    costRisk:
      "Tile requests scale with users and zoom. At public scale this is the single largest external request volume in the product. Needs a tile-caching decision before launch.",
    home: "https://nasa-gibs.github.io",
  },
  gfw: {
    id: "gfw",
    name: "Global Forest Watch",
    authority: "Hansen / UMD / Google / USGS / NASA via WRI",
    covers: "Annual tree cover loss tiles since 2001.",
    limitation:
      "Loss is not deforestation. It also captures fire, storms and harvest cycles. There is no per-event record — only raster.",
    licence: "CC-BY 4.0.",
    attribution: "Hansen/UMD/Google/USGS/NASA · Global Forest Watch",
    implStatus: "LIVE_READ_IN_PROTOTYPE",
    rightsReview: "PENDING",
    costRisk: "Public tile service. Attribution is mandatory and is rendered.",
    home: "https://www.globalforestwatch.org",
  },
  noaa: {
    id: "noaa",
    name: "NOAA Coral Reef Watch",
    authority: "US National Oceanic and Atmospheric Administration",
    covers: "Accumulated coral heat stress (Degree Heating Weeks).",
    limitation: "This is the pressure, not the bleaching. Heat stress is not an observed outcome.",
    licence: "US Government public domain.",
    attribution: "NOAA Coral Reef Watch",
    implStatus: "LIVE_READ_IN_PROTOTYPE",
    rightsReview: "PENDING",
    costRisk: "ERDDAP WMS. Occasionally slow; degrades to SOURCE_UNAVAILABLE.",
    home: "https://coralreefwatch.noaa.gov",
  },
  inaturalist: {
    id: "inaturalist",
    name: "iNaturalist",
    authority: "iNaturalist / California Academy of Sciences",
    covers: "Taxon reference photographs.",
    limitation: "Photography only. 4PLANET makes no ecological claim from an iNat photo.",
    licence: "Photo licences vary per photographer. Attribution string is rendered verbatim.",
    attribution: "iNaturalist contributors — see per-photo attribution",
    implStatus: "LIVE_READ_IN_PROTOTYPE",
    rightsReview: "PENDING",
    costRisk:
      "Photo licences are per-photo and heterogeneous. We display the attribution the API returns and never re-host. A real assessment is still owed before any caching.",
    home: "https://www.inaturalist.org",
  },
  worms: {
    id: "worms",
    name: "WoRMS",
    authority: "World Register of Marine Species",
    covers: "Marine taxonomy and vernacular names.",
    limitation: "Taxonomy only.",
    licence: "CC-BY.",
    attribution: "WoRMS Editorial Board",
    implStatus: "LIVE_READ_IN_PROTOTYPE",
    rightsReview: "PENDING",
    costRisk: "Low.",
    home: "https://www.marinespecies.org",
  },
  wdpa: {
    id: "wdpa",
    name: "Protected Planet / WDPA",
    authority: "UNEP-WCMC & IUCN",
    covers: "The world's protected and conserved areas.",
    limitation:
      "NOT WIRED. The API needs a free UNEP-WCMC token which 4PLANET has not registered. Every protected-area question in this product therefore answers NOT CHECKED. We would rather show nothing than draw a boundary we cannot source.",
    licence: "Non-commercial use permitted; commercial use requires permission.",
    attribution: "UNEP-WCMC and IUCN, Protected Planet",
    implStatus: "NEEDS_KEY",
    rightsReview: "PENDING",
    costRisk: "Free token. The licence restricts commercial use — this matters for §65 economic pathways.",
    home: "https://www.protectedplanet.net",
  },
  fourplanet: {
    id: "fourplanet",
    name: "4PLANET (seeded)",
    authority: "4PLANET — founder-seeded prototype content",
    covers:
      "Living-system relationships, pressures, solution pathways, mission connections and the place registry.",
    limitation:
      "THIS IS NOT SOURCE DATA. It is 4PLANET prototype architecture, authored to prove that relationship intelligence can traverse. It is unreviewed and carries no evidence entity. It must not be read as verified ecological fact.",
    licence: "4PLANET internal.",
    attribution: "4PLANET — seeded prototype",
    implStatus: "LIVE_READ_IN_PROTOTYPE",
    rightsReview: "PENDING",
    costRisk: "None.",
    home: "/about",
  },
};

export const src = (id: string): SourceDescriptor =>
  SOURCES[id] ?? {
    id,
    name: id.toUpperCase(),
    authority: "Unknown",
    covers: "—",
    limitation: "Source not registered.",
    licence: "Unknown",
    attribution: id,
    implStatus: "LIVE_READ_IN_PROTOTYPE",
    rightsReview: "PENDING",
    costRisk: "Unknown",
    home: "",
  };

/** Sources the Earth interface actually reaches in a normal session. */
export const CONNECTED = ["gbif", "obis", "eonet", "usgs", "gibs", "gfw", "noaa", "inaturalist"];
