export type SandboxRasterDescriptor = {
  id: string;
  sourceId: string;
  proxyKey: string;
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

export type RasterRequestOverrides = {
  time?: string;
  elevation?: string;
};

export const EMODNET_BATHYMETRY: SandboxRasterDescriptor = {
  id: "sandbox-emodnet-bathymetry",
  sourceId: "emodnet-bathymetry",
  proxyKey: "emodnet-bathymetry",
  buttonLabel: "BATHYMETRY",
  label: "EMODNET · BATHYMETRY",
  authority: "European Marine Observation and Data Network (EModnet)",
  product: "Mean depth in multi colour (no land)",
  layer: "emodnet:mean_multicolour",
  style: "mean_multicolour",
  version: "1.3.0",
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
  proxyKey: "emodnet-seabed-habitats",
  buttonLabel: "SEABED HABITATS",
  label: "EMODNET · SEABED HABITATS",
  authority: "European Marine Observation and Data Network (EModnet)",
  product: "EUSeaMap 2023 · EUNIS 2019 classification group · scale-adaptive",
  layer: "eusm2023_eunis2019_group",
  style: "default-style-eusm2023_eunis2019_group",
  version: "1.3.0",
  docs: "https://emodnet.ec.europa.eu/en/seabed-habitats",
  service: "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/ows",
  attribution: "EModnet Seabed Habitats / EUSeaMap 2023 · CC BY 4.0",
  limitation:
    "This is the provider's EUSeaMap 2023 EUNIS 2019 scale-adaptive group, containing multiple simplification levels for WMS viewing across scales. EUSeaMap is a broad-scale predictive habitat map, not direct field observation or current ecological condition. EMODnet's portal now exposes 2025 products, but the lab keeps the 2025 WMS path as a candidate rather than the default until its broad-Europe rendering passes the same visual acceptance standard.",
  checkedAt: "2026-08-19",
  opacity: 0.72,
};

export const EMODNET_FISHING_VESSEL_DENSITY: SandboxRasterDescriptor = {
  id: "sandbox-emodnet-fishing-vessel-density",
  sourceId: "emodnet-human-activities",
  proxyKey: "emodnet-human-activities",
  buttonLabel: "FISHING DENSITY",
  label: "EMODNET · HUMAN ACTIVITIES",
  authority: "European Marine Observation and Data Network (EModnet)",
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
  proxyKey: "emodnet-chemistry",
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

function isLocalPreview() {
  if (typeof window === "undefined") return true;
  return window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
}

export function directWmsRasterTileUrl(descriptor: SandboxRasterDescriptor, overrides: RasterRequestOverrides = {}): string {
  const version = descriptor.version || "1.1.1";
  const time = overrides.time ?? descriptor.time;
  const elevation = overrides.elevation ?? descriptor.elevation;
  const query = [
    "service=WMS",
    "request=GetMap",
    `version=${version}`,
    `layers=${encodeURIComponent(descriptor.layer)}`,
    `styles=${encodeURIComponent(descriptor.style || "")}`,
    ...(time ? [`time=${encodeURIComponent(time)}`] : []),
    ...(elevation ? [`elevation=${encodeURIComponent(elevation)}`] : []),
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

export function proxiedWmsRasterTileUrl(descriptor: SandboxRasterDescriptor, overrides: RasterRequestOverrides = {}): string {
  const time = overrides.time ?? descriptor.time;
  const elevation = overrides.elevation ?? descriptor.elevation;
  const params = new URLSearchParams({
    source: descriptor.proxyKey,
    version: descriptor.version || "1.1.1",
    layers: descriptor.layer,
    styles: descriptor.style || "",
    width: "256",
    height: "256",
    bbox: "{bbox-epsg-3857}",
  });
  if (time) params.set("time", time);
  if (elevation) params.set("elevation", elevation);
  return `/api/atlas-wms?${params.toString().replace(encodeURIComponent("{bbox-epsg-3857}"), "{bbox-epsg-3857}")}`;
}

export function wmsRasterTileUrl(descriptor: SandboxRasterDescriptor, overrides: RasterRequestOverrides = {}): string {
  return isLocalPreview()
    ? directWmsRasterTileUrl(descriptor, overrides)
    : proxiedWmsRasterTileUrl(descriptor, overrides);
}

export function sandboxRasterSource(descriptor: SandboxRasterDescriptor, overrides: RasterRequestOverrides = {}) {
  return {
    type: "raster" as const,
    tiles: [wmsRasterTileUrl(descriptor, overrides)],
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
