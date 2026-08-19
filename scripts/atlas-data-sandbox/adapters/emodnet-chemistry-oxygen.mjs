const SERVICE = "https://ec.oceanbrowser.net/emodnet/Python/web/wms";
const LAYER = "All_European_Seas/Water_body_dissolved_oxygen_concentration.nc*Water_body_dissolved_oxygen_concentration_L2";
const STYLE = "pcolor_flat";
const MONTH = "08";
const ELEVATION = "-0.0";

export const EMODNET_OXYGEN_DESCRIPTOR = Object.freeze({
  id: "emodnet-dissolved-oxygen-climatology",
  authority: "EMODnet Chemistry / University of Liege, GeoHydrodynamics and Environment Research",
  product: "Water body dissolved oxygen concentration · monthly climatology · L2 relative-error mask",
  protocol: "OGC WMS 1.3.0",
  officialService: SERVICE,
  officialLayer: LAYER,
  officialStyle: STYLE,
  selectedMonth: MONTH,
  selectedElevationM: ELEVATION,
  units: "umol/l",
  sourceClass: "CLIMATOLOGY_RASTER_PRODUCT",
  temporalSemantics: "MONTHLY_CLIMATOLOGY_NOT_CURRENT_TIME",
  limitation:
    "Monthly climatology is a long-term seasonal pattern, not a current dissolved-oxygen measurement. The selected layer is masked using the provider relative-error threshold 0.5. It must not be presented as live oxygen status or proof of hypoxia at a specific place/time.",
  rightsState: "FINAL_PRODUCT_SPECIFIC_REVIEW_REQUIRED_BEFORE_PRODUCTION",
  promotionState: "ADAPTER_CANDIDATE_AWAITING_CANONICAL_ATLAS_MAP_PROOF",
});

export function emodnetOxygenRasterSource() {
  const q = new URLSearchParams({
    service: "WMS",
    request: "GetMap",
    version: "1.3.0",
    layers: LAYER,
    styles: STYLE,
    time: MONTH,
    elevation: ELEVATION,
    format: "image/png",
    transparent: "true",
    tiled: "true",
    crs: "EPSG:3857",
    width: "256",
    height: "256",
  });

  return {
    type: "raster",
    tiles: [`${SERVICE}?${q.toString()}&bbox={bbox-epsg-3857}`],
    tileSize: 256,
    attribution: "EMODnet Chemistry · University of Liege",
  };
}

export function emodnetOxygenGetCapabilitiesUrl() {
  return `${SERVICE}?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0`;
}
