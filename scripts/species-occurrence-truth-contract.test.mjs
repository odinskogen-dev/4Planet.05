import test from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let engine;
let connectors;
let truth;
let scratch;
let requested = [];

async function compile(sourcePath, outputName, replacements = []) {
  let source = await readFile(sourcePath, "utf8");
  for (const [from, to] of replacements) source = source.replaceAll(from, to);
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  await writeFile(join(scratch, outputName), compiled.outputText, "utf8");
}

const rows = [
  { key: 1, occurrenceStatus: "PRESENT", hasGeospatialIssue: false, decimalLatitude: 0, decimalLongitude: 10, license: "https://creativecommons.org/publicdomain/zero/1.0/", eventDate: "2026-10-12T01:02:03Z", datasetKey: "d1", datasetTitle: "Open One", publisher: "Publisher One", publishingOrgKey: "p1", bibliographicCitation: "Citation One", datasetDOI: "10.1/one" },
  { key: 2, occurrenceStatus: "PRESENT", hasGeospatialIssue: false, decimalLatitude: 10, decimalLongitude: 0, license: "https://creativecommons.org/licenses/by/4.0/", eventDate: "2026-10-11T02:03:04Z" },
  { key: 3, occurrenceStatus: "PRESENT", hasGeospatialIssue: false, decimalLatitude: 11, decimalLongitude: 12 },
  { key: 4, occurrenceStatus: "PRESENT", hasGeospatialIssue: false, decimalLatitude: 13, decimalLongitude: 14, license: "CC BY-NC 4.0" },
  { key: 5, occurrenceStatus: "PRESENT", hasGeospatialIssue: false, decimalLatitude: 15, decimalLongitude: 16, license: "CC BY-SA 4.0" },
  { key: 6, occurrenceStatus: "ABSENT", hasGeospatialIssue: false, decimalLatitude: 17, decimalLongitude: 18, license: "CC0" },
  { key: 7, hasGeospatialIssue: false, decimalLatitude: 19, decimalLongitude: 20, license: "CC0" },
  { key: 8, occurrenceStatus: "PRESENT", hasGeospatialIssue: true, decimalLatitude: 21, decimalLongitude: 22, license: "CC0" },
  { key: 9, occurrenceStatus: "PRESENT", hasGeospatialIssue: false, decimalLatitude: null, decimalLongitude: 23, license: "CC0" },
  { key: 10, occurrenceStatus: "PRESENT", hasGeospatialIssue: false, decimalLatitude: 91, decimalLongitude: 181, license: "CC0" },
  { key: 11, occurrenceStatus: "PRESENT", hasGeospatialIssue: false, decimalLatitude: 24, decimalLongitude: 25, license: "CC BY 4.0", datasetKey: "d11", datasetTitle: "Attributed Eleven", publisher: "Publisher Eleven", bibliographicCitation: "Citation Eleven" },
];

test.before(async () => {
  scratch = await mkdtemp(join(tmpdir(), "species-occurrence-truth-"));
  await compile("src/data/gbifOccurrenceTruth.ts", "gbifOccurrenceTruth.mjs");
  truth = await import(`${pathToFileURL(join(scratch, "gbifOccurrenceTruth.mjs")).href}?v=${Date.now()}`);
  await compile("src/species/registry.ts", "registry.mjs");
  await compile("src/species/matchGate.ts", "matchGate.mjs");
  await compile("src/species/engine.ts", "engine.mjs", [
    ['from "./registry"', 'from "./registry.mjs"'],
    ['from "./matchGate"', 'from "./matchGate.mjs"'],
    ['from "../data/gbifOccurrenceTruth"', 'from "./gbifOccurrenceTruth.mjs"'],
  ]);
  await compile("src/planet/types.ts", "types.mjs");
  await compile("src/planet/ids.ts", "ids.mjs");
  await compile("src/planet/connectors.ts", "connectors.mjs", [
    ['from "./types"', 'from "./types.mjs"'],
    ['from "./ids"', 'from "./ids.mjs"'],
    ['from "../data/gbifOccurrenceTruth"', 'from "./gbifOccurrenceTruth.mjs"'],
  ]);
  engine = await import(`${pathToFileURL(join(scratch, "engine.mjs")).href}?v=${Date.now()}`);
  connectors = await import(`${pathToFileURL(join(scratch, "connectors.mjs")).href}?v=${Date.now()}`);
});

test.after(async () => {
  delete globalThis.fetch;
  if (scratch) await rm(scratch, { recursive: true, force: true });
});

function installFetch() {
  requested = [];
  globalThis.fetch = async (url) => {
    requested.push(String(url));
    return new Response(JSON.stringify({ count: 23, results: rows }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
}


test("GBIF public-use readiness rejects spoofed rights and incomplete CC BY attribution", () => {
  const checkedAt = "2026-10-18T16:00:00.000Z";
  const attributedBy = {
    key: 101,
    license: "CC BY 4.0",
    datasetKey: "dataset-101",
    publisher: "Publisher 101",
    bibliographicCitation: "Publisher 101 (2026). Dataset 101.",
  };

  assert.equal(truth.gbifOccurrenceRightsReviewState("CC BY 4.0", attributedBy), "PUBLIC_USE_READY");
  assert.equal(truth.gbifOccurrenceRightsReviewState("CC BY 4.0", { key: 102 }), "REVIEW_REQUIRED");
  assert.equal(truth.gbifOccurrenceRightsReviewState("CC0", { key: 103 }), "PUBLIC_USE_READY");
  assert.equal(truth.gbifOccurrenceRightsReviewState("NOT CC0", attributedBy), "REVIEW_REQUIRED");
  assert.equal(truth.gbifOccurrenceRightsReviewState("CC0 + CC BY-NC 4.0", attributedBy), "REVIEW_REQUIRED");
  assert.equal(
    truth.gbifOccurrenceRightsReviewState(
      "https://example.org/creativecommons.org/licenses/by/4.0/",
      attributedBy,
    ),
    "REVIEW_REQUIRED",
  );
  assert.equal(
    truth.gbifOccurrenceRightsReviewState("https://creativecommons.org/licenses/by/9.9/", attributedBy),
    "REVIEW_REQUIRED",
  );
  assert.equal(truth.gbifOccurrenceRightsReviewState("CC BY", attributedBy), "REVIEW_REQUIRED");

  const provenance = truth.gbifOccurrenceProvenance(attributedBy, checkedAt);
  assert.equal(provenance.rightsReviewState, "PUBLIC_USE_READY");
  assert.equal(provenance.occurrenceUrl, "https://www.gbif.org/occurrence/101");
  assert.equal(provenance.checkedAt, checkedAt);
  assert.equal(provenance.datasetKey, "dataset-101");
  assert.equal(provenance.publisher, "Publisher 101");
  assert.equal(provenance.datasetCitation, "Publisher 101 (2026). Dataset 101.");
});

test("Universal GBIF path preserves occurrence evidence and explicit count semantics", async () => {
  installFetch();
  const result = await engine.fetchGbifOccurrencesColXr("abc", { limit: 20 });
  assert.equal(result.ok, true);
  assert.match(requested[0], /occurrenceStatus=PRESENT/);
  assert.match(requested[0], /hasGeospatialIssue=false/);
  assert.equal(result.data.total, 23);
  assert.equal(result.data.totalSemantics, "GBIF_FILTERED_PRESENT_NO_GEOSPATIAL_ISSUE");
  assert.equal(result.data.returnedPageCount, 11);
  assert.equal(result.data.sample.length, 6);
  assert.equal(result.data.publicUseSampleCount, 2);
  assert.equal(result.data.rightsReviewRequiredCount, 4);
  assert.equal(result.data.sample[0].lat, 0);
  assert.equal(result.data.sample[1].lng, 0);
  assert.equal(result.data.sample[0].eventDate, "2026-10-12T01:02:03Z");
  assert.equal(result.data.sample[0].datasetCitation, "Citation One");
  assert.equal(result.data.sample[0].datasetDoi, "10.1/one");
  assert.ok(result.data.sample[0].retrievedAt);
});

test("Curated GBIF paths fail closed on occurrence rights while preserving zeros and metadata", async () => {
  installFetch();
  const result = await connectors.taxonOccurrences(2440728, 20);
  assert.equal(result.ok, true);
  assert.equal(result.partial, true);
  assert.match(requested[0], /occurrenceStatus=PRESENT/);
  assert.match(requested[0], /hasGeospatialIssue=false/);
  assert.equal(result.data.total, 23);
  assert.equal(result.data.rows.length, 2);
  assert.equal(result.data.rightsReviewRequiredCount, 4);
  assert.equal(result.data.semanticFilterRejectedCount, 5);
  assert.equal(result.data.sourceUrl, requested[0]);
  assert.equal(result.data.rows[0].lat, 0);
  assert.equal(result.data.rows[1].lng, 0);
  assert.equal(result.data.rows[0].eventDate, "2026-10-12T01:02:03Z");
  assert.equal(result.data.rows[0].licence, "https://creativecommons.org/publicdomain/zero/1.0/");
  assert.equal(result.data.rows[0].datasetKey, "d1");
  assert.equal(result.data.rows[0].publishingOrgKey, "p1");
  assert.equal(result.data.rows[0].rightsReviewState, "PUBLIC_USE_READY");
});

test("WKT path carries the same explicit presence, geospatial and rights boundary", async () => {
  installFetch();
  const result = await connectors.occurrencesInWkt("POLYGON((0 0,1 0,1 1,0 0))");
  assert.equal(result.ok, true);
  assert.match(requested[0], /occurrenceStatus=PRESENT/);
  assert.match(requested[0], /hasGeospatialIssue=false/);
  assert.equal(result.data.rows.length, 2);
  assert.deepEqual(result.data.names, ["Unidentified"]);
  assert.equal(result.data.sourceUrl, requested[0]);
});

test("Curated profile cannot imply public observations from an upstream total alone", async () => {
  requested = [];
  globalThis.fetch = async (url) => {
    requested.push(String(url));
    return new Response(JSON.stringify({
      count: 91,
      results: [{
        key: 44,
        occurrenceStatus: "PRESENT",
        hasGeospatialIssue: false,
        decimalLatitude: 10,
        decimalLongitude: 11,
        license: "CC BY-NC 4.0",
      }],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  const result = await connectors.taxonOccurrences(2440728, 24);
  assert.equal(result.ok, true);
  assert.equal(result.data.total, 91);
  assert.equal(result.data.rows.length, 0);
  assert.equal(result.data.publicUseSampleCount, 0);
  assert.equal(result.data.rightsReviewRequiredCount, 1);
  assert.equal(result.data.semanticFilterRejectedCount, 0);
  assert.equal(result.data.sourceUrl, requested[0]);

  const profileSource = await readFile("src/pages/integrated/Species.tsx", "utf8");
  assert.match(profileSource, /result\.data\.rows\.length > 0 \? "PUBLIC_RECORDS" : "NO_PUBLIC_RECORDS"/);
  assert.match(profileSource, /Nothing from this response is plotted/);
  assert.match(profileSource, /EXACT GBIF QUERY/);
  assert.doesNotMatch(profileSource, /result\.data\.total > 0 \? "LIVE"/);
});

test("Curated occurrence source failure remains unavailable rather than zero or live", async () => {
  globalThis.fetch = async () => new Response("unavailable", { status: 503 });
  const result = await connectors.taxonOccurrences(2440728, 24);
  assert.equal(result.ok, false);

  const profileSource = await readFile("src/pages/integrated/Species.tsx", "utf8");
  assert.match(profileSource, /status: "SOURCE_UNAVAILABLE"/);
  assert.match(profileSource, /source is currently unavailable/);
  assert.match(profileSource, /No public observation is implied or plotted/);
});
