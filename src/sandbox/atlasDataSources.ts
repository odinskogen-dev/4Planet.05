export const EMODNET_BATHYMETRY = {
  id: "sandbox-emodnet-bathymetry",
  sourceId: "emodnet-bathymetry",
  label: "EMODNET · BATHYMETRY",
  authority: "European Marine Observation and Data Network (EMODnet)",
  product: "Mean depth in multi colour (no land)",
  layer: "emodnet:mean_multicolour",
  docs: "https://emodnet.ec.europa.eu/en/emodnet-web-service-documentation",
  service: "https://ows.emodnet-bathymetry.eu/wms",
  limitation:
    "Bathymetry describes seabed depth/product coverage. It is not habitat condition, ecological status or a current event.",
  checkedAt: "2026-08-19",
} as const;

export function emodnetBathymetryTileUrl(): string {
  const query = [
    "service=WMS",
    "request=GetMap",
    "version=1.1.1",
    `layers=${encodeURIComponent(EMODNET_BATHYMETRY.layer)}`,
    "styles=",
    "format=image%2Fpng",
    "transparent=true",
    "tiled=true",
    "srs=EPSG%3A3857",
    "width=256",
    "height=256",
    "bbox={bbox-epsg-3857}",
  ].join("&");
  return `${EMODNET_BATHYMETRY.service}?${query}`;
}

export function emodnetBathymetrySource() {
  return {
    type: "raster" as const,
    tiles: [emodnetBathymetryTileUrl()],
    tileSize: 256,
    attribution: "EMODnet Bathymetry",
  };
}
