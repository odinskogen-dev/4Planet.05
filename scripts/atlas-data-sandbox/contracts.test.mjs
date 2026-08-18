import test from "node:test";
import assert from "node:assert/strict";
import {
  EMODNET_BATHYMETRY_DESCRIPTOR,
  emodnetBathymetryGetCapabilitiesUrl,
  emodnetBathymetryRasterLayer,
  emodnetBathymetryRasterSource,
} from "./adapters/emodnet-bathymetry.mjs";

test("EMODnet Bathymetry adapter is bounded to official WMS and contains no credential fields", () => {
  const source = emodnetBathymetryRasterSource();
  assert.equal(source.type, "raster");
  assert.equal(source.tileSize, 256);
  assert.equal(source.tiles.length, 1);

  const tile = source.tiles[0];
  assert.match(tile, /^https:\/\/ows\.emodnet-bathymetry\.eu\/wms\?/);
  assert.match(tile, /layers=emodnet%3Amean_multicolour/);
  assert.match(tile, /srs=EPSG%3A3857/);
  assert.match(tile, /bbox=\{bbox-epsg-3857\}/);
  assert.doesNotMatch(tile, /(token|api[_-]?key|secret|password)=/i);
});

test("EMODnet Bathymetry WMS metadata remains separate from ecological interpretation", () => {
  assert.equal(EMODNET_BATHYMETRY_DESCRIPTOR.sourceClass, "RASTER_PRODUCT");
  assert.equal(EMODNET_BATHYMETRY_DESCRIPTOR.temporalSemantics, "PRODUCT_VERSION_NOT_EVENT_TIME");
  assert.match(EMODNET_BATHYMETRY_DESCRIPTOR.limitation, /not an ecological condition/i);
  assert.match(EMODNET_BATHYMETRY_DESCRIPTOR.promotionState, /AWAITING_NETWORK_AND_MAP_PROOF/);
});

test("EMODnet Bathymetry MapLibre layer is raster-only and opacity is clamped", () => {
  assert.equal(emodnetBathymetryRasterLayer().type, "raster");
  assert.equal(emodnetBathymetryRasterLayer({ opacity: 2 }).paint["raster-opacity"], 1);
  assert.equal(emodnetBathymetryRasterLayer({ opacity: -2 }).paint["raster-opacity"], 0);
});

test("EMODnet Bathymetry capabilities probe uses official service", () => {
  assert.equal(
    emodnetBathymetryGetCapabilitiesUrl(),
    "https://ows.emodnet-bathymetry.eu/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
  );
});
