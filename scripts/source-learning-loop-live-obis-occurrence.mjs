import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

async function importTs(relativePath) {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const source = await fs.readFile(absolutePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    },
    fileName: absolutePath,
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);
}

const refreshModule = await importTs("src/data/sourceRefresh.ts");
const checkedAt = new Date().toISOString();

const targets = [
  { scientificName: "Orcinus orca", canonicalObjectId: "SPECIES:ORCINUS_ORCA" },
  { scientificName: "Acropora palmata", canonicalObjectId: "SPECIES:ACROPORA_PALMATA" },
];

function clean(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function first(record, keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return null;
}

function normalize(record, scientificName) {
  const id = first(record, ["id", "occurrenceID", "materialSampleID"]);
  const occurrenceID = clean(first(record, ["occurrenceID"])) || (id ? String(id) : null);
  const datasetID = clean(first(record, ["datasetID", "dataset_id"]));
  const datasetName = clean(first(record, ["datasetName", "dataset"]));
  const license = clean(first(record, ["license", "licence"]));
  const institutionCode = clean(first(record, ["institutionCode", "institution_code"]));
  const collectionCode = clean(first(record, ["collectionCode", "collection_code"]));
  const eventDate = clean(first(record, ["eventDate", "eventdate"]));
  const decimalLatitude = first(record, ["decimalLatitude", "decimal_latitude"]);
  const decimalLongitude = first(record, ["decimalLongitude", "decimal_longitude"]);
  const coordinateUncertaintyInMeters = first(record, ["coordinateUncertaintyInMeters", "coordinate_uncertainty"]);
  const rightsHolder = clean(first(record, ["rightsHolder", "rights_holder"]));
  const recordedBy = clean(first(record, ["recordedBy", "recorded_by"]));
  const modified = clean(first(record, ["modified"]));
  const basisOfRecord = clean(first(record, ["basisOfRecord", "basis_of_record"]));
  const flags = Array.isArray(record?.flags) ? record.flags : [];

  assert.ok(id, `${scientificName}: missing provider occurrence id`);
  assert.ok(occurrenceID, `${scientificName}: missing occurrenceID`);
  assert.ok(datasetID || datasetName, `${scientificName}: missing dataset provenance`);
  assert.ok(license, `${scientificName}: missing dataset/record licence; fail closed`);
  assert.ok(eventDate, `${scientificName}: missing eventDate`);
  assert.notEqual(decimalLatitude, null, `${scientificName}: missing latitude`);
  assert.notEqual(decimalLongitude, null, `${scientificName}: missing longitude`);

  return {
    id: String(id),
    occurrenceID,
    scientificName: clean(first(record, ["scientificName", "scientific_name"])) || scientificName,
    datasetID,
    datasetName,
    institutionCode,
    collectionCode,
    license,
    rightsHolder: rightsHolder || "UNKNOWN",
    recordedBy: recordedBy || "UNKNOWN",
    eventDate,
    modified: modified || "UNKNOWN",
    basisOfRecord: basisOfRecord || "UNKNOWN",
    decimalLatitude: Number(decimalLatitude),
    decimalLongitude: Number(decimalLongitude),
    coordinateUncertaintyInMeters: coordinateUncertaintyInMeters === null ? "UNKNOWN" : Number(coordinateUncertaintyInMeters),
    flags,
  };
}

async function fetchBoundedOccurrence(target) {
  const url = new URL("https://api.obis.org/v3/occurrence");
  url.searchParams.set("scientificname", target.scientificName);
  url.searchParams.set("size", "25");

  const started = performance.now();
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(20000) });
  const runtimeMs = Math.round(performance.now() - started);
  assert.equal(response.ok, true, `${target.scientificName}: OBIS HTTP ${response.status}`);
  const payload = await response.json();
  const results = Array.isArray(payload?.results) ? payload.results : [];
  assert.ok(results.length > 0, `${target.scientificName}: no OBIS occurrence records returned`);

  let normalized = null;
  let lastError = null;
  for (const candidate of results) {
    try {
      normalized = normalize(candidate, target.scientificName);
      break;
    } catch (error) {
      lastError = error;
    }
  }
  assert.ok(normalized, `${target.scientificName}: none of first ${results.length} records satisfy bounded provenance/rights contract: ${lastError?.message || "UNKNOWN"}`);

  const semantic = JSON.stringify(normalized);
  const fingerprint = `OBIS:occurrence-semantic-v1:${createHash("sha256").update(semantic).digest("hex")}`;
  const sourceRecordUrl = `https://api.obis.org/v3/occurrence/${encodeURIComponent(normalized.id)}`;
  const snapshot = {
    checkedAt,
    available: true,
    fingerprint,
    fingerprintMethod: "SEMANTIC_CONTENT",
    sourceVersion: normalized.modified === "UNKNOWN" ? `OBIS:v3:record:${normalized.id}` : `OBIS:v3:${normalized.modified}`,
    verification: "VERIFIED",
  };

  const record = {
    id: `OBIS_OCCURRENCE_${normalized.id}`,
    checkedAt,
    sourceFingerprint: fingerprint,
    sourceFingerprintMethod: snapshot.fingerprintMethod,
    sourceVersion: snapshot.sourceVersion,
    providerId: `OBIS:occurrence:${normalized.id}`,
    refreshHistory: [],
  };

  const evaluated = refreshModule.evaluateSourceRefresh(record, snapshot, {
    provider: "OBIS",
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

  return {
    scientificName: target.scientificName,
    providerId: record.providerId,
    occurrenceID: normalized.occurrenceID,
    datasetID: normalized.datasetID || "UNKNOWN",
    datasetName: normalized.datasetName || "UNKNOWN",
    institutionCode: normalized.institutionCode || "UNKNOWN",
    collectionCode: normalized.collectionCode || "UNKNOWN",
    license: normalized.license,
    rightsHolder: normalized.rightsHolder,
    recordedBy: normalized.recordedBy,
    eventDate: normalized.eventDate,
    modified: normalized.modified,
    basisOfRecord: normalized.basisOfRecord,
    coordinates: [normalized.decimalLongitude, normalized.decimalLatitude],
    coordinateUncertaintyInMeters: normalized.coordinateUncertaintyInMeters,
    flags: normalized.flags,
    sourceRecordUrl,
    apiVersion: "OBIS API v3",
    checkedAt,
    fingerprint,
    refreshStatus: evaluated.audit.status,
    verification: evaluated.audit.verification,
    truthEffect: evaluated.audit.truthEffect,
    publicUpdateAllowed: evaluated.publicUpdateAllowed,
    runtimeMs,
  };
}

const proofs = [];
for (const target of targets) proofs.push(await fetchBoundedOccurrence(target));
assert.equal(proofs.length, 2);
assert.equal(proofs.every((proof) => proof.publicUpdateAllowed === false), true);

console.log(JSON.stringify({
  proof: "SPEC-FP-01 bounded OBIS occurrence-rights pair",
  coverage: "2/2",
  boundary: "NO BULK INGESTION / NO PUBLIC PROPAGATION",
  records: proofs,
  totalRuntimeMs: proofs.reduce((sum, item) => sum + item.runtimeMs, 0),
  founderHandlingTime: "UNKNOWN",
  marginalMonetaryCost: "UNKNOWN",
}, null, 2));
