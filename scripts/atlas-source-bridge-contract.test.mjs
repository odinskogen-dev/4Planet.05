import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const wms = readFileSync(new URL("../functions/api/atlas-wms.ts", import.meta.url), "utf8");
const feed = readFileSync(new URL("../functions/api/atlas-feed.ts", import.meta.url), "utf8");
const climate = readFileSync(new URL("../functions/api/climate-trace.ts", import.meta.url), "utf8");

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
