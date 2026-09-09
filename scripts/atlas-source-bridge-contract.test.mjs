import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const wms = read("functions/api/atlas-wms.ts");
const feed = read("functions/api/atlas-feed.ts");
const climate = read("functions/api/climate-trace.ts");
const firms = read("functions/api/firms.ts");
const obis = read("functions/api/obis.ts");
const inat = read("functions/api/inaturalist.ts");
const truth = read("src/data/truthSpine.ts");

const requiredRasterProfiles = [
  "emodnet-bathymetry",
  "emodnet-seabed-habitats",
  "emodnet-human-activities",
  "emodnet-chemistry",
  "noaa-coral-dhw",
];

test("ATLAS WMS bridge stays allowlisted and bounded", () => {
  assert.match(wms, /const PROFILES:/);
  for (const profile of requiredRasterProfiles) assert.ok(wms.includes(`\"${profile}\"`), `missing ${profile}`);
  assert.match(wms, /UNSUPPORTED_SOURCE/);
  assert.match(wms, /INVALID_BBOX/);
  assert.match(wms, /INVALID_LAYER/);
  assert.doesNotMatch(wms, /incoming\.searchParams\.get\(["']url["']\)/);
});

test("source failure is not converted to zero-data success", () => {
  assert.match(wms, /UPSTREAM_\$\{response\.status\}/);
  assert.match(wms, /UPSTREAM_EMPTY_IMAGE/);
  assert.match(feed, /UPSTREAM_\$\{response\.status\}/);
  assert.match(feed, /CONTRACT_MISMATCH/);
  assert.match(climate, /EMPTY_OR_CONTRACT_MISMATCH/);
  assert.match(climate, /NO_MAPPABLE_COORDINATES/);
});

test("public JSON feed bridge stays source-key allowlisted", () => {
  assert.match(feed, /const SOURCES = \{/);
  assert.match(feed, /eonet:/);
  assert.match(feed, /UNSUPPORTED_SOURCE/);
  assert.doesNotMatch(feed, /searchParams\.get\(["']url["']\)/);
});

test("Climate TRACE stays on v7 sources contract", () => {
  assert.match(climate, /api\.climatetrace\.org\/v7/);
  assert.match(climate, /\/sources\?/);
  assert.doesNotMatch(climate, /\/v6/);
  assert.doesNotMatch(climate, /\/assets\?/);
});

test("FIRMS remains credentialed, bounded and semantically fail-closed", () => {
  assert.match(firms, /FIRMS_MAP_KEY_NOT_CONFIGURED/);
  assert.match(firms, /INVALID_OR_TOO_LARGE_BBOX/);
  assert.match(firms, /INVALID_DAY_RANGE/);
  assert.match(firms, /dayRange < 1 \|\| dayRange > 5/);
  assert.match(firms, /NO_DETECTIONS_RETURNED_FOR_QUERY/);
  assert.match(firms, /Satellite fire\/thermal-anomaly detections are not automatically wildfires/);
  assert.match(firms, /sourceAuthority: "NASA Earthdata \/ LANCE FIRMS"/);
});

test("marine/citizen-science occurrence adapters retain provenance and rights boundaries", () => {
  for (const needle of ["occurrenceID", "basisOfRecord", "dataset", "institution", "collection", "license", "informationWithheld", "dataGeneralizations"]) {
    assert.ok(obis.includes(needle), `OBIS missing ${needle}`);
  }
  assert.match(obis, /abundance|range|population|live position/i);
  assert.match(inat, /api\.inaturalist\.org/);
  for (const needle of ["geoprivacy", "taxon_geoprivacy", "quality_grade", "license", "photos"]) {
    assert.ok(inat.includes(needle), `iNaturalist missing ${needle}`);
  }
  assert.match(inat, /obscured|private/i);
  assert.match(inat, /CC0|CC BY/i);
});

test("Truth Spine can retain precision/generalisation/citation state from source adapters", () => {
  for (const needle of ["sourceAuthority", "datasetName", "citationIdentifier", "coordinateUncertaintyM", "locationGeneralised", "generalisationNote", "occurrenceStatus"]) {
    assert.ok(truth.includes(needle), `Truth Spine missing ${needle}`);
  }
});
