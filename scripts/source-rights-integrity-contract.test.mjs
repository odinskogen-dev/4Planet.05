import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const firms = read("functions/api/firms.ts");
const obis = read("functions/api/obis.ts");
const inat = read("functions/api/inaturalist.ts");
const truth = read("src/data/truthSpine.ts");

test("FIRMS remains credentialed, bounded and semantically fail-closed", () => {
  assert.match(firms, /FIRMS_MAP_KEY_NOT_CONFIGURED/);
  assert.match(firms, /INVALID_OR_TOO_LARGE_BBOX/);
  assert.match(firms, /INVALID_DAY_RANGE/);
  assert.match(firms, /dayRange < 1 \|\| dayRange > 5/);
  assert.match(firms, /NO_DETECTIONS_RETURNED_FOR_QUERY/);
  assert.match(firms, /Satellite fire\/thermal-anomaly detections are not automatically wildfires/);
  assert.match(firms, /sourceAuthority: "NASA Earthdata \/ LANCE FIRMS"/);
  assert.doesNotMatch(firms, /FIRMS_MAP_KEY\s*[:=]\s*["'][A-Za-z0-9_-]{8,}["']/);
});

test("OBIS preserves occurrence provenance and does not imply abundance", () => {
  for (const needle of ["occurrenceID", "eventID", "basisOfRecord", "dataset", "institution", "collection", "license", "informationWithheld", "dataGeneralizations"]) {
    assert.ok(obis.includes(needle), `OBIS missing provenance field ${needle}`);
  }
  assert.match(obis, /occurrence/i);
  assert.match(obis, /abundance|range|population|live position/i);
  assert.match(obis, /UPSTREAM_|CONTRACT_MISMATCH|UPSTREAM_FAILURE/);
});

test("iNaturalist keeps observation and media rights separate and geoprivacy public-safe", () => {
  assert.match(inat, /api\.inaturalist\.org/);
  for (const needle of ["geoprivacy", "taxon_geoprivacy", "quality_grade", "license", "photos"]) {
    assert.ok(inat.includes(needle), `iNaturalist missing ${needle}`);
  }
  assert.match(inat, /CC0|CC BY/i);
  assert.match(inat, /CC BY-NC|CC_BY_NC|non-commercial|commercial/i);
  assert.match(inat, /obscured|private/i);
});

test("Truth Spine can retain source precision, generalisation and citation state", () => {
  for (const needle of ["sourceAuthority", "datasetName", "citationIdentifier", "coordinateUncertaintyM", "locationGeneralised", "generalisationNote", "occurrenceStatus"]) {
    assert.ok(truth.includes(needle), `Truth Spine missing ${needle}`);
  }
  assert.match(truth, /SOURCE_RECORD/);
  assert.match(truth, /OBSERVATION/);
  assert.match(truth, /PRODUCT_CONTEXT|ProductContext/);
});
