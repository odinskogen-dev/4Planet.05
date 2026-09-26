import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

async function importTs(relativePath) {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const source = await fs.readFile(absolutePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, moduleResolution: ts.ModuleResolutionKind.Bundler },
    fileName: absolutePath,
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);
}

const refreshModule = await importTs("src/data/sourceRefresh.ts");
const checkedAt = new Date().toISOString();
const target = { taxonKey: 5219426, scientificName: "Panthera onca", canonicalObjectId: "SPECIES:PANTHERA_ONCA" };

function clean(value) { return typeof value === "string" && value.trim() ? value.trim() : null; }
function first(record, keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return null;
}

function normalize(record) {
  const key = first(record, ["key"]);
  const occurrenceID = clean(first(record, ["occurrenceID"])) || (key ? `GBIF:${key}` : null);
  const datasetKey = clean(first(record, ["datasetKey"]));
  const datasetTitle = clean(first(record, ["datasetTitle"]));
  const license = clean(first(record, ["license"]));
  const eventDate = clean(first(record, ["eventDate", "dateIdentified"]));
  const lat = first(record, ["decimalLatitude"]);
  const lon = first(record, ["decimalLongitude"]);
  const uncertainty = first(record, ["coordinateUncertaintyInMeters"]);
  const issues = Array.isArray(record?.issues) ? record.issues : [];

  assert.ok(key, "Jaguar: missing GBIF occurrence key");
  assert.ok(occurrenceID, "Jaguar: missing occurrenceID");
  assert.ok(datasetKey || datasetTitle, "Jaguar: missing dataset provenance");
  assert.ok(license, "Jaguar: missing machine-readable licence; fail closed");
  assert.notEqual(lat, null, "Jaguar: missing latitude");
  assert.notEqual(lon, null, "Jaguar: missing longitude");

  return {
    key: String(key), occurrenceID, datasetKey, datasetTitle,
    scientificName: clean(first(record, ["scientificName"])) || target.scientificName,
    license,
    rightsHolder: clean(first(record, ["rightsHolder"])) || "UNKNOWN",
    recordedBy: clean(first(record, ["recordedBy"])) || "UNKNOWN",
    eventDate: eventDate || "UNKNOWN",
    modified: clean(first(record, ["modified", "lastInterpreted"])) || "UNKNOWN",
    basisOfRecord: clean(first(record, ["basisOfRecord"])) || "UNKNOWN",
    decimalLatitude: Number(lat), decimalLongitude: Number(lon),
    coordinateUncertaintyInMeters: uncertainty === null ? "UNKNOWN" : Number(uncertainty),
    issues,
    publishingOrgKey: clean(first(record, ["publishingOrgKey"])) || "UNKNOWN",
  };
}

const url = new URL("https://api.gbif.org/v1/occurrence/search");
url.searchParams.set("taxon_key", String(target.taxonKey));
url.searchParams.set("limit", "25");
const started = performance.now();
const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(20000) });
const runtimeMs = Math.round(performance.now() - started);
assert.equal(response.ok, true, `GBIF HTTP ${response.status}`);
const payload = await response.json();
const results = Array.isArray(payload?.results) ? payload.results : [];
assert.ok(results.length > 0, "Jaguar: no GBIF occurrences returned");

let normalized = null;
let lastError = null;
for (const candidate of results) {
  try { normalized = normalize(candidate); break; } catch (error) { lastError = error; }
}
assert.ok(normalized, `Jaguar: none of first ${results.length} GBIF records satisfy bounded provenance/rights contract: ${lastError?.message || "UNKNOWN"}`);

const semantic = JSON.stringify(normalized);
const fingerprint = `GBIF:occurrence-semantic-v1:${createHash("sha256").update(semantic).digest("hex")}`;
const sourceRecordUrl = `https://api.gbif.org/v1/occurrence/${encodeURIComponent(normalized.key)}`;
const snapshot = {
  checkedAt, available: true, fingerprint, fingerprintMethod: "SEMANTIC_CONTENT",
  sourceVersion: normalized.modified === "UNKNOWN" ? `GBIF:v1:record:${normalized.key}` : `GBIF:v1:${normalized.modified}`,
  verification: "VERIFIED",
};
const record = {
  id: `GBIF_OCCURRENCE_${normalized.key}`, checkedAt, sourceFingerprint: fingerprint,
  sourceFingerprintMethod: snapshot.fingerprintMethod, sourceVersion: snapshot.sourceVersion,
  providerId: `GBIF:occurrence:${normalized.key}`, refreshHistory: [],
};
const evaluated = refreshModule.evaluateSourceRefresh(record, snapshot, {
  provider: "GBIF",
  providerId: record.providerId,
  canonicalLocator: sourceRecordUrl,
  canonicalObjectIds: [target.canonicalObjectId],
  affectedClaimIds: [`${target.canonicalObjectId}:OCCURRENCE_LAYER`],
});
assert.equal(evaluated.audit.status, "UNCHANGED");
assert.equal(evaluated.audit.verification, "VERIFIED");
assert.equal(evaluated.audit.truthEffect, "NONE");
assert.equal(evaluated.publicUpdateAllowed, false);
assert.equal(evaluated.audit.syntheticFixture, false);

console.log(JSON.stringify({
  proof: "SPEC-FP-01 bounded cross-provider occurrence transfer — Jaguar / GBIF",
  checkedAt,
  benchmarkPrinciple: "GBIF recommends API use for bounded occurrence retrieval; record/dataset licence and provenance remain explicit rather than flattened.",
  boundary: "ONE TERRESTRIAL RECORD / NO BULK INGESTION / NO PUBLIC PROPAGATION",
  record: {
    scientificName: target.scientificName,
    providerId: record.providerId,
    occurrenceID: normalized.occurrenceID,
    datasetKey: normalized.datasetKey || "UNKNOWN",
    datasetTitle: normalized.datasetTitle || "UNKNOWN",
    publishingOrgKey: normalized.publishingOrgKey,
    license: normalized.license,
    rightsHolder: normalized.rightsHolder,
    recordedBy: normalized.recordedBy,
    eventDate: normalized.eventDate,
    basisOfRecord: normalized.basisOfRecord,
    coordinates: [normalized.decimalLongitude, normalized.decimalLatitude],
    coordinateUncertaintyInMeters: normalized.coordinateUncertaintyInMeters,
    issues: normalized.issues,
    sourceRecordUrl,
    apiVersion: "GBIF Occurrence API v1",
    fingerprint,
    refreshStatus: evaluated.audit.status,
    verification: evaluated.audit.verification,
    truthEffect: evaluated.audit.truthEffect,
    publicUpdateAllowed: evaluated.publicUpdateAllowed,
    runtimeMs,
  },
  founderHandlingTime: "UNKNOWN",
  marginalMonetaryCost: "UNKNOWN",
}, null, 2));
