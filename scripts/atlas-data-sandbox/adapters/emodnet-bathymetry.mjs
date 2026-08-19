const EMODNET_BATHYMETRY_WMS = "https://ows.emodnet-bathymetry.eu/wms";
const LAYER = "emodnet:mean_multicolour";

export const EMODNET_BATHYMETRY_DESCRIPTOR = Object.freeze({
  id: "emodnet-bathymetry",
  authority: "European Marine Observation and Data Network (EMODnet)",
  product: "Bathymetry · Mean depth in multi colour (no land)",
  protocol: "OGC WMS 1.1.1",
  officialService: EMODNET_BATHYMETRY_WMS,
  officialLayer: LAYER,
  docs: "https://emodnet.ec.europa.eu/en/emodnet-web-service-documentation",
  sourceClass: "RASTER_PRODUCT",
  recordIdentity: "NO_PER_PIXEL_SOURCE_RECORD_IN_ATLAS_RASTER_VIEW",
  temporalSemantics: "PRODUCT_VERSION_NOT_EVENT_TIME",
  limitation:
    "A bathymetric raster describes seabed depth/product coverage. It is not an ecological condition, habitat state or current event. Product/version metadata must remain available separately from map rendering.",
  promotionState: "MAP_GREEN_SANDBOX_ONLY",
});

/**
 * MapLibre-compatible WMS raster source.
 *
 * MapLibre substitutes {bbox-epsg-3857} for each raster tile request. We use
 * WMS 1.1.1 + SRS=EPSG:3857 deliberately to avoid WMS 1.3 axis-order ambiguity.
 * No credentials or query-time user data are embedded in the tile URL.
 */
export function emodnetBathymetryRasterSource() {
  const q = new URLSearchParams({
    service: "WMS",
    request: "GetMap",
    version: "1.1.1",
    layers: LAYER,
    styles: "",
    format: "image/png",
    transparent: "true",
    tiled: "true",
    width: "256",
    height: "256",
    srs: "EPSG:3857",
  });

  // URLSearchParams percent-encodes braces, so append the MapLibre token last.
  const tileUrl = `${EMODNET_BATHYMETRY_WMS}?${q.toString()}&bbox={bbox-epsg-3857}`;

  return {
    type: "raster",
    tiles: [tileUrl],
    tileSize: 256,
    attribution: "EModnet Bathymetry",
  };
}

export function emodnetBathymetryRasterLayer({ opacity = 0.78 } = {}) {
  return {
    id: "sandbox-emodnet-bathymetry",
    type: "raster",
    source: "sandbox-emodnet-bathymetry",
    paint: {
      "raster-opacity": Math.max(0, Math.min(1, Number(opacity))),
      "raster-fade-duration": 150,
    },
  };
}

export function emodnetBathymetryGetCapabilitiesUrl() {
  return `${EMODNET_BATHYMETRY_WMS}?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0`;
}
