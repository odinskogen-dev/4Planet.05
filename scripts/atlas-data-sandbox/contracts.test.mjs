import test from "node:test";
import assert from "node:assert/strict";
import {
  EMODNET_BATHYMETRY_DESCRIPTOR,
  emodnetBathymetryGetCapabilitiesUrl,
  emodnetBathymetryRasterLayer,
  emodnetBathymetryRasterSource,
} from "./adapters/emodnet-bathymetry.mjs";
import {
  EMODNET_OXYGEN_DESCRIPTOR,
  emodnetOxygenGetCapabilitiesUrl,
  emodnetOxygenRasterSource,
} from "./adapters/emodnet-chemistry-oxygen.mjs";
import {
  GFW_DESCRIPTOR,
  gfwAuthState,
  gfwFishingEffortTileRequest,
  redactGfwRequest,
} from "./adapters/global-fishing-watch.mjs";

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
  assert.equal(EMODNET_BATHYMETRY_DESCRIPTOR.promotionState, "MAP_GREEN_SANDBOX_ONLY");
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

test("EMODnet oxygen climatology adapter keeps month, depth and climatology semantics explicit", () => {
  const source = emodnetOxygenRasterSource();
  assert.equal(source.type, "raster");
  assert.equal(source.tileSize, 256);
  assert.equal(source.tiles.length, 1);

  const tile = decodeURIComponent(source.tiles[0]);
  assert.match(tile, /^https:\/\/ec\.oceanbrowser\.net\/emodnet\/Python\/web\/wms\?/);
  assert.match(tile, /version=1\.3\.0/);
  assert.match(tile, /Water_body_dissolved_oxygen_concentration_L2/);
  assert.match(tile, /styles=pcolor_flat/);
  assert.match(tile, /time=08/);
  assert.match(tile, /elevation=-0\.0/);
  assert.match(tile, /crs=EPSG:3857/);
  assert.match(tile, /bbox=\{bbox-epsg-3857\}/);
  assert.doesNotMatch(tile, /(token|api[_-]?key|secret|password)=/i);

  assert.equal(EMODNET_OXYGEN_DESCRIPTOR.temporalSemantics, "MONTHLY_CLIMATOLOGY_NOT_CURRENT_TIME");
  assert.match(EMODNET_OXYGEN_DESCRIPTOR.limitation, /not a current dissolved-oxygen measurement/i);
  assert.match(EMODNET_OXYGEN_DESCRIPTOR.limitation, /not be presented as live oxygen status/i);
  assert.equal(
    EMODNET_OXYGEN_DESCRIPTOR.rightsState,
    "FINAL_PRODUCT_SPECIFIC_REVIEW_REQUIRED_BEFORE_PRODUCTION",
  );
});

test("EMODnet oxygen capabilities probe uses the exact public service", () => {
  assert.equal(
    emodnetOxygenGetCapabilitiesUrl(),
    "https://ec.oceanbrowser.net/emodnet/Python/web/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
  );
});

test("Global Fishing Watch remains explicitly auth-gated without a token", () => {
  assert.equal(gfwAuthState(undefined), "AUTH_REQUIRED");
  assert.equal(GFW_DESCRIPTOR.tokenHandling, "SERVER_SIDE_ONLY");
  assert.match(GFW_DESCRIPTOR.semanticBoundary, /does not prove illegal fishing/i);

  const request = gfwFishingEffortTileRequest({
    z: 1,
    x: 0,
    y: 0,
    startDate: "2026-08-01",
    endDate: "2026-08-07",
  });
  assert.equal(request.state, "AUTH_REQUIRED");
  assert.equal(request.headers, null);
  assert.match(request.url, /^https:\/\/gateway\.api\.globalfishingwatch\.org\/v3\/4wings\/tile\/heatmap\/1\/0\/0\?/);
  assert.match(decodeURIComponent(request.url), /datasets\[0\]=public-global-fishing-effort:latest/);
  assert.match(decodeURIComponent(request.url), /date-range=2026-08-01,2026-08-07/);
  assert.match(request.url, /format=MVT/);
  assert.doesNotMatch(request.url, /(token|authorization|secret)=/i);
});

test("Global Fishing Watch token is header-only and redacted from evidence", () => {
  const request = gfwFishingEffortTileRequest({
    token: "sandbox-test-token",
    z: 2,
    x: 1,
    y: 1,
    startDate: "2026-08-01",
    endDate: "2026-08-02",
  });
  assert.equal(request.state, "AUTH_AVAILABLE");
  assert.equal(request.headers.authorization, "Bearer sandbox-test-token");
  assert.doesNotMatch(request.url, /sandbox-test-token/);
  assert.equal(redactGfwRequest(request).headers.authorization, "Bearer REDACTED");
});

test("Global Fishing Watch tile contract rejects invalid coordinates", () => {
  assert.throws(
    () => gfwFishingEffortTileRequest({ z: 1, x: 2, y: 0, startDate: "2026-08-01", endDate: "2026-08-02" }),
    /GFW_INVALID_X/,
  );
});
