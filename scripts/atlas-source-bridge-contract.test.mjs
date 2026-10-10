import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const wms = read("functions/api/atlas-wms.ts");
const feed = read("functions/api/atlas-feed.ts");
const climate = read("functions/api/climate-trace.ts");
const firms = read("functions/api/firms.ts");
const obis = read("functions/api/obis.ts");
const atlas = read("src/pages/v5/Atlas.tsx");
const inat = read("functions/api/inaturalist.ts");
const truth = read("src/data/truthSpine.ts");
const obisRuntime = await import(`data:text/javascript;base64,${Buffer.from(ts.transpileModule(obis, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText).toString("base64")}`);

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

test("OBIS rejects malformed or impossible supplied dates without fetching upstream", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error("invalid dates must fail before upstream fetch");
  };

  try {
    for (const query of [
      "startDate=2026-2-01",
      "startDate=2026-02-31",
      "startDate=2026-02-29",
      "endDate=2026-13-01",
      "startDate=",
    ]) {
      const response = await obisRuntime.onRequestGet({
        request: new Request(`https://test.4planet.org/api/obis?scientificName=Orcinus+orca&${query}`),
      });
      assert.equal(response.status, 400, query);
      assert.deepEqual(await response.json(), { ok: false, error: "INVALID_DATE" }, query);
    }
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("OBIS rejects inverted date ranges without silently widening the query", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error("inverted ranges must fail before upstream fetch");
  };

  try {
    const response = await obisRuntime.onRequestGet({
      request: new Request("https://test.4planet.org/api/obis?scientificName=Orcinus+orca&startDate=2026-06-02&endDate=2026-06-01"),
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { ok: false, error: "INVALID_DATE_RANGE" });
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("OBIS accepts a real leap day and forwards both bounded dates", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = async (url) => {
    requestedUrl = String(url);
    return new Response(JSON.stringify({ results: [], total: 0 }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const response = await obisRuntime.onRequestGet({
      request: new Request("https://test.4planet.org/api/obis?scientificName=Orcinus+orca&startDate=2028-02-29&endDate=2028-03-01"),
    });
    assert.equal(response.status, 200);
    assert.match(requestedUrl, /startdate=2028-02-29/);
    assert.match(requestedUrl, /enddate=2028-03-01/);
    const body = await response.json();
    assert.equal(body.query.startDate, "2028-02-29");
    assert.equal(body.query.endDate, "2028-03-01");
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("ATLAS WH4LES point detail consumes governed open-rights OBIS evidence", () => {
  assert.match(atlas, /fetch\("\/api\/obis\?scientificName=Cetacea&size=200"\)/);
  assert.doesNotMatch(atlas, /api\.obis\.org\/v3\/occurrence\?scientificname=Cetacea/);
  assert.match(atlas, /Number\.isFinite\(o\.latitude\)/);
  assert.match(atlas, /Number\.isFinite\(o\.longitude\)/);
  assert.match(atlas, /o\.licenceClass === "OPEN_CC0"/);
  assert.match(atlas, /o\.licenceClass === "OPEN_ATTRIBUTION"/);
  for (const field of ["eventDate", "coordinateUncertaintyM", "datasetName", "datasetId", "datasetCitation", "datasetDoi", "datasetUrl", "licence", "occurrenceId"]) {
    assert.ok(atlas.includes(`o.${field}`), `ATLAS WH4LES detail missing ${field}`);
  }
});


test("OBIS missing or blank size keeps the default and null total stays unknown", async () => {
  const originalFetch = globalThis.fetch;
  const requestedUrls = [];
  globalThis.fetch = async (url) => {
    requestedUrls.push(String(url));
    return new Response(JSON.stringify({ results: [], total: null }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    for (const suffix of ["", "&size="]) {
      const response = await obisRuntime.onRequestGet({
        request: new Request(`https://test.4planet.org/api/obis?scientificName=Orcinus+orca${suffix}`),
      });
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.query.size, 50);
      assert.equal(body.total, null);
    }
    assert.equal(requestedUrls.length, 2);
    for (const requestedUrl of requestedUrls) assert.match(requestedUrl, /size=50/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("OBIS keeps accepted licences narrow and preserves original dataset evidence", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    results: [
      { occurrenceID: "plain-by", license: "CC BY 4.0", bibliographicCitation: "Dataset Alpha. Original occurrence dataset.", datasetDOI: "10.1234/alpha", datasetURL: "https://obis.org/dataset/alpha" },
      { occurrenceID: "share-alike", license: "CC BY-SA 4.0" },
      { occurrenceID: "noncommercial-share-alike", license: "https://creativecommons.org/licenses/by-nc-sa/4.0/" },
      { occurrenceID: "public-domain", license: "CC0 1.0" },
    ],
    total: 4,
  }), { status: 200, headers: { "content-type": "application/json" } });

  try {
    const response = await obisRuntime.onRequestGet({
      request: new Request("https://test.4planet.org/api/obis?scientificName=Cetacea&size=4"),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    const byId = Object.fromEntries(body.records.map((record) => [record.occurrenceId, record]));
    assert.equal(byId["plain-by"].licenceClass, "OPEN_ATTRIBUTION");
    assert.equal(byId["share-alike"].licenceClass, "SHARE_ALIKE_REVIEW");
    assert.notEqual(byId["share-alike"].licenceClass, "OPEN_ATTRIBUTION");
    assert.equal(byId["noncommercial-share-alike"].licenceClass, "NONCOMMERCIAL");
    assert.equal(byId["public-domain"].licenceClass, "OPEN_CC0");
    assert.equal(byId["plain-by"].datasetCitation, "Dataset Alpha. Original occurrence dataset.");
    assert.equal(byId["plain-by"].datasetDoi, "10.1234/alpha");
    assert.equal(byId["plain-by"].datasetUrl, "https://obis.org/dataset/alpha");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Truth Spine can retain precision/generalisation/citation state from source adapters", () => {
  for (const needle of ["sourceAuthority", "datasetName", "citationIdentifier", "coordinateUncertaintyM", "locationGeneralised", "generalisationNote", "occurrenceStatus"]) {
    assert.ok(truth.includes(needle), `Truth Spine missing ${needle}`);
  }
});
