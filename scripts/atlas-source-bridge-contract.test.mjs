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
const earthLayers = read("src/earth/layers.ts");
const sourceControl = read("src/earth/atlasSourceControl.ts");
const connectors = read("src/planet/connectors.ts");
const contextPanel = read("src/earth/Context.tsx");
const unescoOpenData = read("src/data/unescoOpenData.ts");
const orcaAssetFamily = read("src/data/orcaAssetFamily.ts");
const unescoRuntimeUrl = `data:text/javascript;base64,${Buffer.from(ts.transpileModule(unescoOpenData, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText).toString("base64")}`;
const orcaAssetFamilyRuntimeUrl = `data:text/javascript;base64,${Buffer.from(ts.transpileModule(orcaAssetFamily, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText).toString("base64")}`;
const earthLayersCompiled = ts.transpileModule(earthLayers, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText
  .replace(/(["'])\.\.\/data\/unescoOpenData\1/g, JSON.stringify(unescoRuntimeUrl))
  .replace(/(["'])\.\.\/data\/orcaAssetFamily\1/g, JSON.stringify(orcaAssetFamilyRuntimeUrl));
const earthLayersRuntime = await import(`data:text/javascript;base64,${Buffer.from(earthLayersCompiled).toString("base64")}`);
const obisRuntime = await import(`data:text/javascript;base64,${Buffer.from(ts.transpileModule(obis, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText).toString("base64")}`);

const connectorRuntimeNames = new Set([
  "now",
  "Result",
  "getJson",
  "TaxonPhotoRightsState",
  "TaxonPhoto",
  "classifyInaturalistTaxonPhotoRights",
  "taxonPhoto",
]);
const connectorAst = ts.createSourceFile("connectors.ts", connectors, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
const connectorRuntimeSource = connectorAst.statements
  .filter((statement) => {
    if (ts.isVariableStatement(statement)) {
      return statement.declarationList.declarations.some(
        (declaration) => ts.isIdentifier(declaration.name) && connectorRuntimeNames.has(declaration.name.text),
      );
    }
    if (ts.isFunctionDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
      return Boolean(statement.name && connectorRuntimeNames.has(statement.name.text));
    }
    return false;
  })
  .map((statement) => statement.getFullText(connectorAst))
  .join("\n");
for (const name of connectorRuntimeNames) {
  assert.match(connectorRuntimeSource, new RegExp(`\\b${name}\\b`), `ATLAS connector runtime missing ${name}`);
}
const inatRightsRuntime = await import(`data:text/javascript;base64,${Buffer.from(ts.transpileModule(connectorRuntimeSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText).toString("base64")}`);

const requiredRasterProfiles = [
  "emodnet-bathymetry",
  "emodnet-seabed-habitats",
  "emodnet-human-activities",
  "emodnet-chemistry",
  "noaa-coral-dhw",
];

test("ATLAS layer palette references resolve and point fallbacks are valid colours", () => {
  const paletteKeys = new Set(Object.keys(earthLayersRuntime.C));
  const referencedKeys = new Set(
    [...earthLayers.matchAll(/\bC\.([A-Za-z_$][\w$]*)/g)].map((match) => match[1]),
  );
  const missingKeys = [...referencedKeys].filter((key) => !paletteKeys.has(key)).sort();
  assert.deepEqual(missingKeys, [], `undefined ATLAS palette references: ${missingKeys.join(", ")}`);

  const pointLayers = earthLayersRuntime.LAYERS.filter((layer) => layer.kind === "point");
  assert.ok(pointLayers.length > 0, "ATLAS point-layer registry must not be empty");
  for (const layer of pointLayers) {
    assert.match(layer.color, /^#[0-9A-F]{6}$/i, `${layer.id} requires a six-digit CSS colour fallback`);
  }

  const emissions = pointLayers.find((layer) => layer.id === "emissions");
  assert.ok(emissions, "Climate TRACE emissions layer is missing");
  assert.equal(emissions.color, earthLayersRuntime.C.amber);
});

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

test("FIRMS source control reflects adapter truth without claiming deployed map Gold", () => {
  const firmsControl = sourceControl.match(/"nasa-firms": \{[\s\S]*?\n  \},\n  "global-fishing-watch"/u)?.[0] || "";
  assert.match(firmsControl, /stage: "ADAPTER_GREEN"/);
  assert.match(firmsControl, /layerContract: "PASS"/);
  assert.match(firmsControl, /map: "PENDING"/);
  assert.match(firmsControl, /auth: "FREE_KEY_SERVER_SIDE"/);
  assert.doesNotMatch(firmsControl, /map: "PASS"/);
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

test("OBIS rejects empty, malformed and duplicate bbox values before fetching upstream", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error("invalid bbox must fail before upstream fetch");
  };

  try {
    for (const query of [
      "bbox=",
      "bbox=,,,",
      "bbox=-10,,10,20",
      "bbox=-10,0,10,",
      "bbox=0,0,10",
      "bbox=0,0,Infinity,10",
      "bbox=0x0,0,10,10",
      "bbox=0,0,1e1,10",
      "bbox=0,0,10,10&bbox=1,1,2,2",
    ]) {
      const response = await obisRuntime.onRequestGet({
        request: new Request(`https://test.4planet.org/api/obis?scientificName=Orcinus+orca&${query}`),
      });
      assert.equal(response.status, 400, query);
      assert.deepEqual(await response.json(), { ok: false, error: "INVALID_OR_UNBOUNDED_BBOX" }, query);
    }
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("OBIS bbox preserves legitimate zero and negative coordinates", async () => {
  const originalFetch = globalThis.fetch;
  const requestedUrls = [];
  globalThis.fetch = async (url) => {
    requestedUrls.push(String(url));
    return new Response(JSON.stringify({ results: [], total: 0 }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const fixtures = [
      ["-10,0,10,20", "POLYGON ((-10 0, -10 20, 10 20, 10 0, -10 0))"],
      ["0,-20,10,0", "POLYGON ((0 -20, 0 0, 10 0, 10 -20, 0 -20))"],
    ];
    for (const [bbox, expectedGeometry] of fixtures) {
      const response = await obisRuntime.onRequestGet({
        request: new Request(`https://test.4planet.org/api/obis?scientificName=Orcinus+orca&bbox=${bbox}`),
      });
      assert.equal(response.status, 200, bbox);
      const body = await response.json();
      assert.equal(body.query.bbox, bbox);
      const upstream = new URL(requestedUrls.at(-1));
      assert.equal(upstream.searchParams.get("geometry"), expectedGeometry);
    }
    assert.equal(requestedUrls.length, 2);
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
      { occurrenceID: "plain-by", occurrenceStatus: "PRESENT", license: "CC BY 4.0", bibliographicCitation: "Dataset Alpha. Original occurrence dataset.", datasetDOI: "10.1234/alpha", datasetURL: "https://obis.org/dataset/alpha" },
      { occurrenceID: "share-alike", occurrenceStatus: "PRESENT", license: "CC BY-SA 4.0" },
      { occurrenceID: "noncommercial-share-alike", occurrenceStatus: "PRESENT", license: "https://creativecommons.org/licenses/by-nc-sa/4.0/" },
      { occurrenceID: "public-domain", occurrenceStatus: "PRESENT", license: "CC0 1.0" },
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

test("OBIS licence authority rejects negated and spoofed open-rights claims before map admission", async () => {
  const originalFetch = globalThis.fetch;
  const rows = [
    ["cc0-token", "CC0 1.0", "OPEN_CC0", true],
    ["by-token", "CC BY 4.0", "OPEN_ATTRIBUTION", true],
    ["cc0-url", "https://creativecommons.org/publicdomain/zero/1.0/", "OPEN_CC0", true],
    ["by-url", "https://creativecommons.org/licenses/by/4.0/", "OPEN_ATTRIBUTION", true],
    ["negated-cc0", "NOT CC0", "REVIEW_REQUIRED", false],
    ["spoofed-cc0", "https://evil.example/CC0", "REVIEW_REQUIRED", false],
    ["negated-by", "NOT CC-BY", "REVIEW_REQUIRED", false],
    ["spoofed-by", "https://evil.example/CC-BY", "REVIEW_REQUIRED", false],
    ["lookalike-host", "https://creativecommons.org.evil.example/licenses/by/4.0/", "REVIEW_REQUIRED", false],
    ["ambiguous-by", "CC BY with attribution", "REVIEW_REQUIRED", false],
  ];
  globalThis.fetch = async () => new Response(JSON.stringify({
    results: rows.map(([id, license]) => ({
      occurrenceID: id,
      occurrenceStatus: "PRESENT",
      decimalLatitude: 12,
      decimalLongitude: 32,
      license,
    })),
    total: rows.length,
  }), { status: 200, headers: { "content-type": "application/json" } });

  try {
    const response = await obisRuntime.onRequestGet({
      request: new Request(`https://test.4planet.org/api/obis?scientificName=Cetacea&size=${rows.length}`),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    const byId = Object.fromEntries(body.records.map((record) => [record.occurrenceId, record]));

    for (const [id, , expectedClass, mapAdmitted] of rows) {
      assert.equal(byId[id].licenceClass, expectedClass, id);
      assert.equal(Boolean(earthLayersRuntime.obisOccurrencePoint(byId[id], body.retrievedAt)), mapAdmitted, id);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Truth Spine can retain precision/generalisation/citation state from source adapters", () => {
  for (const needle of ["sourceAuthority", "datasetName", "citationIdentifier", "coordinateUncertaintyM", "locationGeneralised", "generalisationNote", "occurrenceStatus"]) {
    assert.ok(truth.includes(needle), `Truth Spine missing ${needle}`);
  }
});


test("routed ATLAS GBIF points preserve presence, zero coordinates and issued-licence boundaries", () => {
  const retrievedAt = "2026-10-11T07:27:41.000Z";
  const baseRecord = {
    decimalLatitude: 0,
    decimalLongitude: 20,
    occurrenceStatus: "PRESENT",
    hasGeospatialIssues: false,
    issues: [],
    license: "CC BY 4.0",
    eventDate: "2026-09-30",
    coordinateUncertaintyInMeters: 125,
    datasetTitle: "Verified chordate observations",
    datasetKey: "dataset-1",
    datasetID: "10.1234/gbif.dataset",
    occurrenceID: "occurrence-1",
    key: 101,
    speciesKey: 44,
    scientificName: "Chordata",
  };
  const point = earthLayersRuntime.gbifOccurrencePoint(baseRecord, retrievedAt);
  assert.equal(point.lat, 0);
  assert.equal(point.lon, 20);
  assert.equal(point.occurrenceStatus, "PRESENT");
  assert.equal(point.coordinateUncertaintyM, 125);
  assert.equal(point.datasetDoi, "10.1234/gbif.dataset");
  assert.equal(point.retrievedAt, retrievedAt);

  assert.ok(earthLayersRuntime.gbifOccurrencePoint({ ...baseRecord, decimalLatitude: 10, decimalLongitude: 0 }, retrievedAt));
  for (const rejected of [
    { ...baseRecord, occurrenceStatus: "ABSENT" },
    { ...baseRecord, occurrenceStatus: undefined },
    { ...baseRecord, decimalLatitude: null },
    { ...baseRecord, decimalLongitude: "" },
    { ...baseRecord, decimalLatitude: 91 },
    { ...baseRecord, decimalLongitude: 181 },
    { ...baseRecord, hasGeospatialIssues: true },
    { ...baseRecord, issues: ["ZERO_COORDINATE"] },
    { ...baseRecord, license: undefined },
  ]) {
    assert.equal(earthLayersRuntime.gbifOccurrencePoint(rejected, retrievedAt), null);
  }
  assert.ok(earthLayersRuntime.gbifOccurrencePoint({ ...baseRecord, license: "CC0 1.0" }, retrievedAt));
  for (const version of ["1.0", "2.0", "2.5", "3.0", "4.0"]) {
    const licence = `CC BY ${version}`;
    assert.equal(earthLayersRuntime.gbifLicenceClass(licence), "OPEN_ATTRIBUTION");
    assert.ok(earthLayersRuntime.gbifOccurrencePoint({ ...baseRecord, license: licence }, retrievedAt));
  }
  assert.equal(earthLayersRuntime.gbifLicenceClass("CC BY 4.0"), "OPEN_ATTRIBUTION");
  assert.equal(earthLayersRuntime.gbifLicenceClass("CC0 1.0"), "OPEN_CC0");
  assert.equal(earthLayersRuntime.gbifLicenceClass("https://creativecommons.org/licenses/by/4.0/legalcode"), "OPEN_ATTRIBUTION");
  assert.equal(earthLayersRuntime.gbifLicenceClass("https://www.creativecommons.org/publicdomain/zero/1.0/legalcode"), "OPEN_CC0");
  for (const rejectedLicence of [
    "PUBLIC DOMAIN",
    "CC0",
    "CC BY",
    "CC0 9.9",
    "CC BY 9.9",
    "CC BY-NC 4.0",
    "CC BY-SA 4.0",
    "http://creativecommons.org/licenses/by/4.0/legalcode",
    "https://creativecommons.org/publicdomain/zero/9.9/legalcode",
    "https://creativecommons.org/licenses/by/9.9/legalcode",
    "Not public domain",
    "NOT CC0",
    "CC BY-NC-SA 4.0",
    "CC BY with attribution",
    "https://creative-commons.org/licenses/by/4.0/legalcode",
    "https://creativecommons.org.evil.example/licenses/by/4.0/legalcode",
    "https://evil.example/?licence=https://creativecommons.org/licenses/by/4.0/legalcode",
    "https://creativecommons.org/licenses/by-nc/4.0/legalcode",
    "unknown",
  ]) assert.equal(earthLayersRuntime.gbifLicenceClass(rejectedLicence), "REVIEW_REQUIRED");

  for (const rejectedLicence of [
    "PUBLIC DOMAIN",
    "CC0",
    "CC BY",
    "CC0 9.9",
    "CC BY 9.9",
    "http://creativecommons.org/licenses/by/4.0/legalcode",
    "https://creativecommons.org/publicdomain/zero/9.9/legalcode",
    "https://creativecommons.org/licenses/by/9.9/legalcode",
    "Not public domain",
    "NOT CC0",
    "https://creativecommons.org.evil.example/licenses/by/4.0/legalcode",
  ]) {
    assert.equal(earthLayersRuntime.gbifOccurrencePoint({ ...baseRecord, license: rejectedLicence }, retrievedAt), null);
  }
});

test("routed ATLAS GBIF loader fails closed and exposes point evidence", () => {
  assert.match(earthLayers, /occurrenceStatus=PRESENT/);
  assert.match(earthLayers, /hasGeospatialIssue=false/);
  assert.match(earthLayers, /GBIF_UPSTREAM_\$\{response\.status\}/);
  assert.match(earthLayers, /GBIF_CONTRACT_MISMATCH/);
  assert.doesNotMatch(earthLayers, /\.then\(\(r\) => r\.json\(\)\)\.catch\(\(\) => \(\{ results: \[\] \}\)\)/);
  for (const needle of [
    "REPORTED PRESENT · CHORDATA",
    "COORDINATE UNCERTAINTY",
    "GEOSPATIAL QUALITY UNKNOWN",
    "DATASET ·",
    "DOI ·",
    "LICENCE ·",
    "RETRIEVED ·",
    "Open GBIF record",
    "Original dataset",
  ]) assert.ok(earthLayers.includes(needle), `ATLAS GBIF detail missing ${needle}`);
});

test("OBIS measurements preserve UNKNOWN without erasing genuine zero", async () => {
  const originalFetch = globalThis.fetch;
  const fixtures = [
    ["null", null, null],
    ["blank", "  ", null],
    ["missing", undefined, null],
    ["invalid", "not-a-number", null],
    ["negative", -1, null],
    ["array", [], null],
    ["boolean", true, null],
    ["zero-number", 0, 0],
    ["zero-string", "0", 0],
    ["positive", "125", 125],
  ];
  globalThis.fetch = async () => new Response(JSON.stringify({
    results: fixtures.map(([id, measurement]) => ({
      occurrenceID: id,
      occurrenceStatus: "PRESENT",
      coordinateUncertaintyInMeters: measurement,
      minimumDepthInMeters: measurement,
      maximumDepthInMeters: measurement,
      license: "CC0 1.0",
    })),
    total: fixtures.length,
  }), { status: 200, headers: { "content-type": "application/json" } });

  try {
    const response = await obisRuntime.onRequestGet({
      request: new Request(`https://test.4planet.org/api/obis?scientificName=Cetacea&size=${fixtures.length}`),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    const byId = Object.fromEntries(body.records.map((record) => [record.occurrenceId, record]));
    for (const [id, , expected] of fixtures) {
      assert.equal(byId[id].coordinateUncertaintyM, expected, `${id} uncertainty`);
      assert.equal(byId[id].depthMinM, expected, `${id} minimum depth`);
      assert.equal(byId[id].depthMaxM, expected, `${id} maximum depth`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("OBIS preserves composite rights, provider and sensitive-location flags", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    results: [
      { occurrenceID: "cc0", occurrenceStatus: "PRESENT", license: "CC0 1.0", institutionCode: "OBIS-SEAMAP" },
      { occurrenceID: "by", occurrenceStatus: "PRESENT", license: "CC BY 4.0", provider: "Provider A" },
      { occurrenceID: "by-nc", occurrenceStatus: "PRESENT", license: "CC BY-NC 4.0" },
      { occurrenceID: "by-nc-nd", occurrenceStatus: "PRESENT", license: "https://creativecommons.org/licenses/by-nc-nd/4.0/" },
      { occurrenceID: "by-sa", occurrenceStatus: "PRESENT", license: "CC BY-SA 4.0" },
      { occurrenceID: "missing", occurrenceStatus: "PRESENT" },
      { occurrenceID: "withheld", occurrenceStatus: "PRESENT", license: "CC BY 4.0", informationWithheld: "coordinates withheld" },
      { occurrenceID: "generalised", occurrenceStatus: "PRESENT", license: "CC0 1.0", dataGeneralizations: "coordinates generalised" },
    ],
    total: 8,
  }), { status: 200, headers: { "content-type": "application/json" } });

  try {
    const response = await obisRuntime.onRequestGet({
      request: new Request("https://test.4planet.org/api/obis?scientificName=Cetacea&size=8"),
    });
    const body = await response.json();
    const byId = Object.fromEntries(body.records.map((record) => [record.occurrenceId, record]));
    assert.deepEqual(byId.cc0.licenceRestrictions, []);
    assert.deepEqual(byId.by.licenceRestrictions, []);
    assert.deepEqual(byId["by-nc"].licenceRestrictions, ["NONCOMMERCIAL"]);
    assert.deepEqual(byId["by-nc-nd"].licenceRestrictions, ["NONCOMMERCIAL", "NO_DERIVATIVES"]);
    assert.deepEqual(byId["by-sa"].licenceRestrictions, ["SHARE_ALIKE"]);
    assert.deepEqual(byId.missing.licenceRestrictions, ["UNKNOWN_OR_MISSING"]);
    assert.equal(byId.cc0.provider, "OBIS-SEAMAP");
    assert.equal(byId.by.provider, "Provider A");
    assert.equal(byId.withheld.locationSensitive, true);
    assert.equal(byId.generalised.locationSensitive, true);
    assert.match(body.semantics.rightsBoundary, /original occurrence dataset licences still apply/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("routed ATLAS WH4LES fails closed on rights and sensitive locations", () => {
  const retrievedAt = "2026-10-11T12:19:20.000Z";
  const baseRecord = {
    latitude: 0,
    longitude: 20,
    occurrenceStatus: "PRESENT",
    scientificName: "Orcinus orca",
    licence: "CC BY 4.0",
    licenceClass: "OPEN_ATTRIBUTION",
    licenceRestrictions: [],
    locationSensitive: false,
    datasetName: "Cetacean sightings",
    datasetCitation: "Provider. Cetacean sightings.",
    datasetDoi: "10.1234/cetacea",
    datasetUrl: "https://obis.org/dataset/1",
    provider: "OBIS-SEAMAP",
  };
  const accepted = earthLayersRuntime.obisOccurrencePoint(baseRecord, retrievedAt);
  assert.equal(accepted.lat, 0);
  assert.equal(accepted.lon, 20);
  assert.equal(accepted.provider, "OBIS-SEAMAP");
  assert.equal(accepted.datasetCitation, "Provider. Cetacean sightings.");

  for (const rejected of [
    { ...baseRecord, licenceClass: "NONCOMMERCIAL", licenceRestrictions: ["NONCOMMERCIAL"] },
    { ...baseRecord, licenceClass: "OPEN_ATTRIBUTION", licenceRestrictions: ["NO_DERIVATIVES"] },
    { ...baseRecord, licenceClass: "REVIEW_REQUIRED", licenceRestrictions: ["UNKNOWN_OR_MISSING"] },
    { ...baseRecord, locationSensitive: true },
    { ...baseRecord, informationWithheld: "coordinates withheld" },
    { ...baseRecord, dataGeneralizations: "coordinates generalised" },
    { ...baseRecord, latitude: null },
    { ...baseRecord, occurrenceStatus: "ABSENT" },
    { ...baseRecord, occurrenceStatus: "UNKNOWN" },
    { ...baseRecord, occurrenceStatus: undefined },
  ]) assert.equal(earthLayersRuntime.obisOccurrencePoint(rejected, retrievedAt), null);

  assert.match(earthLayers, /fetch\("\/api\/obis\?scientificName=Cetacea&size=200"\)/);
  assert.doesNotMatch(earthLayers, /api\.obis\.org\/v3\/occurrence\?scientificname=Cetacea/);
  for (const marker of ["datasetCitation", "provider", "datasetDoi", "datasetUrl", "licenceRestrictions", "locationSensitive", "OBIS DERIVED PRODUCTS MAY BE CC0"]) {
    assert.ok(earthLayers.includes(marker), `routed WH4LES missing ${marker}`);
  }
});

test("OBIS bridge and routed WH4LES preserve explicit presence and missing-coordinate truth", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    results: [
      { occurrenceID: "null-coordinates", occurrenceStatus: "PRESENT", decimalLatitude: null, decimalLongitude: null, license: "CC0 1.0" },
      { occurrenceID: "blank-coordinates", occurrenceStatus: "PRESENT", decimalLatitude: " ", decimalLongitude: "", license: "CC BY 4.0" },
      { occurrenceID: "zero-latitude", occurrenceStatus: "PRESENT", decimalLatitude: 0, decimalLongitude: 20, license: "CC0 1.0" },
      { occurrenceID: "zero-longitude", occurrenceStatus: "PRESENT", decimalLatitude: 10, decimalLongitude: 0, license: "CC BY 4.0" },
      { occurrenceID: "absent", occurrenceStatus: "ABSENT", decimalLatitude: 1, decimalLongitude: 2, license: "CC0 1.0" },
      { occurrenceID: "unknown", occurrenceStatus: "UNKNOWN", decimalLatitude: 1, decimalLongitude: 2, license: "CC0 1.0" },
      { occurrenceID: "missing-status", decimalLatitude: 1, decimalLongitude: 2, license: "CC0 1.0" },
    ],
    total: 7,
  }), { status: 200, headers: { "content-type": "application/json" } });

  try {
    const response = await obisRuntime.onRequestGet({
      request: new Request("https://test.4planet.org/api/obis?scientificName=Cetacea&size=7"),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    const byId = Object.fromEntries(body.records.map((record) => [record.occurrenceId, record]));
    assert.deepEqual(Object.keys(byId).sort(), ["blank-coordinates", "null-coordinates", "zero-latitude", "zero-longitude"]);
    assert.equal(byId["null-coordinates"].latitude, null);
    assert.equal(byId["null-coordinates"].longitude, null);
    assert.equal(byId["blank-coordinates"].latitude, null);
    assert.equal(byId["blank-coordinates"].longitude, null);
    assert.equal(byId["zero-latitude"].latitude, 0);
    assert.equal(byId["zero-longitude"].longitude, 0);
    assert.equal(earthLayersRuntime.obisOccurrencePoint(byId["null-coordinates"], body.retrievedAt), null);
    assert.equal(earthLayersRuntime.obisOccurrencePoint(byId["blank-coordinates"], body.retrievedAt), null);
    assert.ok(earthLayersRuntime.obisOccurrencePoint(byId["zero-latitude"], body.retrievedAt));
    assert.ok(earthLayersRuntime.obisOccurrencePoint(byId["zero-longitude"], body.retrievedAt));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("GBIF and OBIS reject coercible non-primitive coordinates end to end", async () => {
  const retrievedAt = "2026-10-15T07:30:00.000Z";
  const gbifBase = {
    decimalLatitude: "10.5",
    decimalLongitude: "-20.25",
    occurrenceStatus: "PRESENT",
    hasGeospatialIssues: false,
    issues: [],
    license: "CC0 1.0",
  };
  const obisBase = {
    latitude: "10.5",
    longitude: "-20.25",
    occurrenceStatus: "PRESENT",
    licenceClass: "OPEN_CC0",
    licenceRestrictions: [],
  };

  assert.ok(earthLayersRuntime.gbifOccurrencePoint(gbifBase, retrievedAt));
  assert.ok(earthLayersRuntime.obisOccurrencePoint(obisBase, retrievedAt));
  assert.ok(earthLayersRuntime.gbifOccurrencePoint({ ...gbifBase, decimalLatitude: 0, decimalLongitude: 0 }, retrievedAt));
  assert.ok(earthLayersRuntime.obisOccurrencePoint({ ...obisBase, latitude: 0, longitude: 0 }, retrievedAt));

  const coercibleValues = [
    [],
    [10],
    [[10]],
    true,
    false,
    {},
    { valueOf: () => 10 },
    "0x10",
    "1e1",
    "Infinity",
  ];
  for (const value of coercibleValues) {
    assert.equal(
      earthLayersRuntime.gbifOccurrencePoint({ ...gbifBase, decimalLatitude: value }, retrievedAt),
      null,
      `GBIF admitted ${JSON.stringify(value)}`,
    );
    assert.equal(
      earthLayersRuntime.obisOccurrencePoint({ ...obisBase, latitude: value }, retrievedAt),
      null,
      `OBIS admitted ${JSON.stringify(value)}`,
    );
  }

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    results: [
      { occurrenceID: "array", occurrenceStatus: "PRESENT", decimalLatitude: [10], decimalLongitude: 20, license: "CC0 1.0" },
      { occurrenceID: "nested", occurrenceStatus: "PRESENT", decimalLatitude: [[10]], decimalLongitude: 20, license: "CC0 1.0" },
      { occurrenceID: "boolean", occurrenceStatus: "PRESENT", decimalLatitude: true, decimalLongitude: 20, license: "CC0 1.0" },
      { occurrenceID: "object", occurrenceStatus: "PRESENT", decimalLatitude: {}, decimalLongitude: 20, license: "CC0 1.0" },
      { occurrenceID: "hex", occurrenceStatus: "PRESENT", decimalLatitude: "0x10", decimalLongitude: 20, license: "CC0 1.0" },
      { occurrenceID: "exponent", occurrenceStatus: "PRESENT", decimalLatitude: "1e1", decimalLongitude: 20, license: "CC0 1.0" },
      { occurrenceID: "decimal", occurrenceStatus: "PRESENT", decimalLatitude: "10.5", decimalLongitude: "-20.25", license: "CC0 1.0" },
      { occurrenceID: "zero", occurrenceStatus: "PRESENT", decimalLatitude: 0, decimalLongitude: 0, license: "CC0 1.0" },
    ],
    total: 8,
  }), { status: 200, headers: { "content-type": "application/json" } });

  try {
    const response = await obisRuntime.onRequestGet({
      request: new Request("https://test.4planet.org/api/obis?scientificName=Cetacea&size=8"),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    const byId = Object.fromEntries(body.records.map((record) => [record.occurrenceId, record]));
    for (const id of ["array", "nested", "boolean", "object", "hex", "exponent"]) {
      assert.equal(byId[id].latitude, null, id);
      assert.equal(earthLayersRuntime.obisOccurrencePoint(byId[id], body.retrievedAt), null, id);
    }
    assert.equal(byId.decimal.latitude, 10.5);
    assert.equal(byId.decimal.longitude, -20.25);
    assert.ok(earthLayersRuntime.obisOccurrencePoint(byId.decimal, body.retrievedAt));
    assert.equal(byId.zero.latitude, 0);
    assert.equal(byId.zero.longitude, 0);
    assert.ok(earthLayersRuntime.obisOccurrencePoint(byId.zero, body.retrievedAt));
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("ATLAS iNaturalist taxon photos fail closed on item-specific rights", () => {
  const classify = inatRightsRuntime.classifyInaturalistTaxonPhotoRights;
  for (const licence of [
    "cc0",
    "cc-by",
    "https://creativecommons.org/publicdomain/zero/1.0/",
    "https://creativecommons.org/licenses/by/4.0/",
  ]) {
    assert.equal(classify(licence), "DISPLAYABLE", licence);
  }

  for (const licence of [
    undefined,
    "",
    "cc-by-nc",
    "cc-by-nd",
    "cc-by-sa",
    "all rights reserved",
    "CC BY",
    "https://evil.example/creativecommons.org/licenses/by/4.0/",
    "https://creativecommons.org.evil.example/licenses/by/4.0/",
    "https://creativecommons.org/licenses/by/4.0/?via=forged",
  ]) {
    assert.equal(classify(licence), "BLOCKED", String(licence));
  }
});

test("ATLAS taxon-photo adapter executes the real API path and returns a complete rights envelope", async () => {
  const originalFetch = globalThis.fetch;
  const requestedUrls = [];
  globalThis.fetch = async (url) => {
    requestedUrls.push(String(url));
    return new Response(JSON.stringify({
      results: [
        {
          name: "Orcinus orca lookalike",
          default_photo: {
            id: 1,
            medium_url: "https://inaturalist-open-data.s3.amazonaws.com/photos/1/medium.jpg",
            attribution: "Wrong taxon",
            license_code: "cc0",
          },
        },
        {
          name: "Orcinus orca",
          default_photo: {
            id: 424242,
            medium_url: "https://inaturalist-open-data.s3.amazonaws.com/photos/424242/medium.jpg",
            attribution: "<span>CC BY Jane Scientist</span>",
            license_code: "cc-by",
          },
        },
      ],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  try {
    const photo = await inatRightsRuntime.taxonPhoto("  Orcinus orca  ");
    assert.equal(requestedUrls.length, 1);
    assert.match(requestedUrls[0], /api\.inaturalist\.org\/v1\/taxa\?q=Orcinus%20orca&per_page=5/);
    assert.deepEqual({ ...photo, checkedAt: "<ISO>" }, {
      url: "https://inaturalist-open-data.s3.amazonaws.com/photos/424242/medium.jpg",
      attribution: "CC BY Jane Scientist",
      creator: "CC BY Jane Scientist",
      licence: "cc-by",
      rightsState: "DISPLAYABLE",
      usageScope: "PUBLIC_DISPLAY_CC0_OR_CC_BY",
      sourceId: "inaturalist",
      sourceRecordId: "424242",
      sourceUrl: "https://www.inaturalist.org/photos/424242",
      checkedAt: "<ISO>",
    });
    assert.ok(Number.isFinite(Date.parse(photo.checkedAt)));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ATLAS taxon-photo adapter returns no-photo for incomplete, restricted or untrusted API records", async () => {
  const originalFetch = globalThis.fetch;
  const valid = {
    id: 77,
    medium_url: "https://inaturalist-open-data.s3.amazonaws.com/photos/77/medium.jpg",
    attribution: "CC BY Source Author",
    license_code: "cc-by",
  };
  const cases = [
    ["missing licence", { ...valid, license_code: undefined }],
    ["noncommercial licence", { ...valid, license_code: "cc-by-nc" }],
    ["share-alike licence", { ...valid, license_code: "cc-by-sa" }],
    ["unknown licence", { ...valid, license_code: "unknown" }],
    ["spoofed licence URL", { ...valid, license_code: "https://creativecommons.org.evil.example/licenses/by/4.0/" }],
    ["missing item id", { ...valid, id: undefined }],
    ["missing attribution", { ...valid, attribution: "" }],
    ["missing image URL", { ...valid, medium_url: "" }],
    ["photo identity mismatch", { ...valid, medium_url: "https://inaturalist-open-data.s3.amazonaws.com/photos/999/medium.jpg" }],
    ["untrusted media host", { ...valid, medium_url: "https://images.example/photos/77/medium.jpg" }],
    ["insecure media URL", { ...valid, medium_url: "http://inaturalist-open-data.s3.amazonaws.com/photos/77/medium.jpg" }],
    ["non-network media URL", { ...valid, medium_url: "data:image/jpeg;base64,AAAA" }],
  ];

  try {
    for (const [label, photo] of cases) {
      globalThis.fetch = async () => new Response(JSON.stringify({
        results: [{ name: "Orcinus orca", default_photo: photo }],
      }), { status: 200, headers: { "content-type": "application/json" } });
      assert.equal(await inatRightsRuntime.taxonPhoto("Orcinus orca"), null, label);
    }

    globalThis.fetch = async () => new Response(JSON.stringify({
      results: [{ name: "Orcinus orca subspecies", default_photo: valid }],
    }), { status: 200, headers: { "content-type": "application/json" } });
    assert.equal(await inatRightsRuntime.taxonPhoto("Orcinus orca"), null, "exact scientific-name mismatch");

    globalThis.fetch = async () => new Response("upstream unavailable", { status: 503 });
    assert.equal(await inatRightsRuntime.taxonPhoto("Orcinus orca"), null, "upstream HTTP failure");

    globalThis.fetch = async () => new Response("not json", { status: 200 });
    assert.equal(await inatRightsRuntime.taxonPhoto("Orcinus orca"), null, "malformed upstream body");

    globalThis.fetch = async () => { throw new Error("network unavailable"); };
    assert.equal(await inatRightsRuntime.taxonPhoto("Orcinus orca"), null, "network failure");
    assert.equal(await inatRightsRuntime.taxonPhoto("   "), null, "blank query");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("ATLAS taxon-photo adapter requires a complete rights/source envelope", () => {
  for (const needle of [
    "photo?.id",
    "photo?.attribution",
    "photo?.license_code",
    'rightsState !== "DISPLAYABLE"',
    'usageScope: "PUBLIC_DISPLAY_CC0_OR_CC_BY"',
    "https://www.inaturalist.org/photos/",
    "checkedAt: now()",
    "hasBoundedMediaIdentity",
    "inaturalist-open-data.s3.amazonaws.com",
    "static.inaturalist.org",
  ]) {
    assert.ok(connectors.includes(needle), `missing taxon-photo gate: ${needle}`);
  }
  assert.match(connectors, /rightsState !== "DISPLAYABLE" \|\| !hasBoundedMediaIdentity/);
});

test("ATLAS taxon context links photo source and explains a rights-blocked fallback", () => {
  assert.match(contextPanel, /href=\{photo\.sourceUrl\}/);
  assert.match(contextPanel, /\{photo\.licence\.toUpperCase\(\)\}/);
  assert.match(contextPanel, /RIGHTS CHECKED/);
  assert.match(contextPanel, /No rights-cleared reference photo is available/);
  assert.match(contextPanel, /Observation records and taxon identity are unchanged/);
});


test("NASA GIBS dated layers do not overstate request dates as live observations", () => {
  const firesBlock = earthLayers.match(/\{ id: "fires"[\s\S]*?attr: "NASA GIBS \/ MODIS" \}/)?.[0] || "";
  const precipBlock = earthLayers.match(/\{ id: "precip"[\s\S]*?attr: "NASA GIBS \/ GPM IMERG" \}/)?.[0] || "";

  assert.match(firesBlock, /THERMAL ANOMALIES/);
  assert.match(firesBlock, /REQUESTED DATE/);
  assert.match(firesBlock, /requested UTC date/);
  assert.match(firesBlock, /observation time are not independently verified/);
  assert.match(firesBlock, /not proof of wildfire/);
  assert.match(firesBlock, /daysAgo\(1\)/);
  assert.doesNotMatch(firesBlock, /ACTIVE FIRES|last 24h/i);

  assert.match(precipBlock, /PRECIPITATION/);
  assert.match(precipBlock, /REQUESTED DATE/);
  assert.match(precipBlock, /previous UTC day/);
  assert.match(precipBlock, /not a live ground measurement/);
  assert.match(precipBlock, /daysAgo\(1\)/);
  assert.doesNotMatch(precipBlock, /falling right now|water cycle, live/i);
});
