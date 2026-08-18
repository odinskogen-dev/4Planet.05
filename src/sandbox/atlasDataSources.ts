export type SandboxRasterDescriptor = {
  id: string;
  sourceId: string;
  label: string;
  authority: string;
  product: string;
  layer: string;
  style?: string;
  docs: string;
  service: string;
  attribution: string;
  limitation: string;
  checkedAt: string;
  opacity: number;
};

export const EMODNET_BATHYMETRY: SandboxRasterDescriptor = {
  id: "sandbox-emodnet-bathymetry",
  sourceId: "emodnet-bathymetry",
  label: "EMODNET · BATHYMETRY",
  authority: "European Marine Observation and Data Network (EMODnet)",
  product: "Mean depth in multi colour (no land)",
  layer: "emodnet:mean_multicolour",
  docs: "https://emodnet.ec.europa.eu/en/emodnet-web-service-documentation",
  service: "https://ows.emodnet-bathymetry.eu/wms",
  attribution: "EMODnet Bathymetry",
  limitation:
    "Bathymetry describes seabed depth/product coverage. It is not habitat condition, ecological status or a current event.",
  checkedAt: "2026-08-19",
  opacity: 0.78,
};

export const EMODNET_SEABED_HABITATS: SandboxRasterDescriptor = {
  id: "sandbox-emodnet-seabed-habitats",
  sourceId: "emodnet-seabed-habitats",
  label: "EMODNET · SEABED HABITATS",
  authority: "European Marine Observation and Data Network (EMODnet)",
  product: "EUSeaMap 2025 · MSFD habitat classification · 800 m simplification",
  layer: "eusm2025_msfd_800",
  style: "eusm2019_msfd_800",
  docs: "https://emodnet.ec.europa.eu/en/emodnet-web-service-documentation",
  service: "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms",
  attribution: "EMODnet Seabed Habitats / EUSeaMap 2025 · CC BY 4.0",
  limitation:
    "This is a broad-scale predictive habitat-map product. Classification, scale and model confidence must not be presented as direct field observation or current ecological condition.",
  checkedAt: "2026-08-19",
  opacity: 0.72,
};

export const SANDBOX_RASTERS = [EMODNET_BATHYMETRY, EMODNET_SEABED_HABITATS] as const;

export function wmsRasterTileUrl(descriptor: SandboxRasterDescriptor): string {
  const query = [
    "service=WMS",
    "request=GetMap",
    "version=1.1.1",
    `layers=${encodeURIComponent(descriptor.layer)}`,
    `styles=${encodeURIComponent(descriptor.style || "")}`,
    "format=image%2Fpng",
    "transparent=true",
    "tiled=true",
    "srs=EPSG%3A3857",
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
