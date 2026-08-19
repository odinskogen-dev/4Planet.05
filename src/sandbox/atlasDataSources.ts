export type SandboxRasterDescriptor = {
  id: string;
  sourceId: string;
  buttonLabel: string;
  label: string;
  authority: string;
  product: string;
  layer: string;
  style?: string;
  time?: string;
  elevation?: string;
  version?: "1.1.1" | "1.3.0";
  units?: string;
  docs: string;
  service: string;
  attribution: string;
  limitation: string;
  rightsNote?: string;
  checkedAt: string;
  opacity: number;
};

export const EMODNET_BATHYMETRY: SandboxRasterDescriptor = {
  id: "sandbox-emodnet-bathymetry",
  sourceId: "emodnet-bathymetry",
  buttonLabel: "BATHYMETRY",
  label: "EMODNET · BATHYMETRY",
  authority: "European Marine Observation and Data Network (EMODnet)",
  product: "Mean depth in multi colour (no land)",
  layer: "emodnet:mean_multicolour",
  docs: "https://emodnet.ec.europa.eu/en/emodnet-web-service-documentation",
  service: "https://ows.emodnet-bathymetry.eu/wms",
  attribution: "EModnet Bathymetry",
  limitation:
    "Bathymetry describes seabed depth/product coverage. It is not habitat condition, ecological status or a current event.",
  checkedAt: "2026-08-19",
  opacity: 0.78,
};

export const EMODNET_SEABED_HABITATS: SandboxRasterDescriptor = {
  id: "sandbox-emodnet-seabed-habitats",
  sourceId: "emodnet-seabed-habitats",
  buttonLabel: "SEABED HABITATS",
  label: "EMODNET · SEABED HABITATS",
  authority: "European Marine Observation and Data Network (EMODnet)",
  product: "EUSeaMap 2025 · MSFD habitat classification · 800 m simplification",
  layer: "eusm2025_msfd_800",
  style: "eusm2019_msfd_800",
  docs: "https://emodnet.ec.europa.eu/en/emodnet-web-service-documentation",
  service: "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms",
  attribution: "EModnet Seabed Habitats / EUSeaMap 2025 · CC BY 4.0",
  limitation:
    "This is a broad-scale predictive habitat-map product. Classification, scale and model confidence must not be presented as direct field observation or current ecological condition.",
  checkedAt: "2026-08-19",
  opacity: 0.72,
};

export const EMODNET_FISHING_VESSEL_DENSITY: SandboxRasterDescriptor = {
  id: "sandbox-emodnet-fishing-vessel-density",
  sourceId: "emodnet-human-activities",
  buttonLabel: "FISHING DENSITY",
  label: "EMODNET · HUMAN ACTIVITIES",
  authority: "European Marine Observation and Data Network (EMODnet)",
  product: "Fishing vessel density · annual average · 2023",
  layer: "vesseldensity_01avg",
  style: "VesselDensity",
  time: "2023-01-01T00:00:00Z",
  docs: "https://emodnet.ec.europa.eu/en/emodnet-web-service-documentation",
  service: "https://ows.emodnet-humanactivities.eu/wms",
  attribution: "EModnet Human Activities",
  limitation:
    "This is an AIS-derived vessel-density product expressed as hours per square kilometre per month and summarised as an annual average. The sandbox deliberately selects the provider-advertised 2023 slice; provider metadata reports reduced satellite-data density during part of 2024. It is historical/reference vessel-density context, not live fishing activity, catch, legality or ecological impact.",
  checkedAt: "2026-08-19",
  opacity: 0.74,
};

export const EMODNET_DISSOLVED_OXYGEN_CLIMATOLOGY: SandboxRasterDescriptor = {
  id: "sandbox-emodnet-dissolved-oxygen-climatology",
  sourceId: "emodnet-chemistry-eutrophication",
  buttonLabel: "DISSOLVED OXYGEN",
  label: "EMODNET · CHEMISTRY",
  authority: "EMODnet Chemistry / University of Liege, GeoHydrodynamics and Environment Research",
  product: "Water body dissolved oxygen concentration · monthly climatology · surface · relative-error mask 0.5",
  layer: "All_European_Seas/Water_body_dissolved_oxygen_concentration.nc*Water_body_dissolved_oxygen_concentration_L2",
  style: "pcolor_flat",
  time: "08",
  elevation: "-0.0",
  version: "1.3.0",
  units: "µmol/L",
  docs: "https://emodnet.ec.europa.eu/en/chemistry",
  service: "https://ec.oceanbrowser.net/emodnet/Python/web/wms",
  attribution: "EModnet Chemistry · University of Liege",
  limitation:
    "Monthly climatology for dissolved oxygen concentration, shown here for month 08 at the surface and masked using provider relative-error threshold 0.5. It is a climatological condition layer, not a live or current oxygen measurement and not evidence of hypoxia at a specific place or time.",
  rightsNote: "Public EMODnet service; final product-specific licence/attribution review remains required before any production promotion.",
  checkedAt: "2026-08-19",
  opacity: 0.72,
};

export const SANDBOX_RASTERS = [
  EMODNET_BATHYMETRY,
  EMODNET_SEABED_HABITATS,
  EMODNET_FISHING_VESSEL_DENSITY,
  EMODNET_DISSOLVED_OXYGEN_CLIMATOLOGY,
] as const;

export function wmsRasterTileUrl(descriptor: SandboxRasterDescriptor): string {
  const version = descriptor.version || "1.1.1";
  const query = [
    "service=WMS",
    "request=GetMap",
    `version=${version}`,
    `layers=${encodeURIComponent(descriptor.layer)}`,
    `styles=${encodeURIComponent(descriptor.style || "")}`,
    ...(descriptor.time ? [`time=${encodeURIComponent(descriptor.time)}`] : []),
    ...(descriptor.elevation ? [`elevation=${encodeURIComponent(descriptor.elevation)}`] : []),
    "format=image%2Fpng",
    "transparent=true",
    "tiled=true",
    version === "1.3.0" ? "crs=EPSG%3A3857" : "srs=EPSG%3A3857",
    "width=256",
    "height=256",
    "bbox={bbox-epsg-3857}",
  ].join("&");
  return `${descriptor.service}?${query}`;
}

export function sandboxRasterSource(descriptor: SandboxRasterDescriptor) {
  return {
    type: "raster" as const,
    tiles: [wmsRasterTileUrl(descriptor)],
    tileSize: 256,
    attribution: descriptor.attribution,
  };
}

export function emodnetBathymetryTileUrl(): string {
  return wmsRasterTileUrl(EMODNET_BATHYMETRY);
}

export function emodnetBathymetrySource() {
  return sandboxRasterSource(EMODNET_BATHYMETRY);
}
