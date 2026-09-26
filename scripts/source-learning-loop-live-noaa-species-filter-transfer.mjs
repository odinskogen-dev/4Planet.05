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

const source = {
  provider: "NOAA_NMFS",
  datasetTitle: "Species Filter CURRENT",
  inPortGuid: "gov.noaa.nmfs.inport:69741",
  inPortUrl: "https://www.fisheries.noaa.gov/inport/item/69741",
  serviceUrl: "https://services2.arcgis.com/C8EMgrsFcRFL6LrL/arcgis/rest/services/Species_Filter_CURRENT/FeatureServer",
  licence: "CC0-1.0",
  licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  publicationDate: "2026-02-01",
  revisionDate: "2026-05-19",
  sourceVersion: "Species_Filter_CURRENT:2026-02-01:rev-2026-05-19",
  scope: "NOAA/NMFS DisMAP species-filter/index layer; U.S./DisMAP context; not occurrence evidence or global conservation-status truth",
  useConstraint: "NO WARRANTY — preserve dataset limitations, intended-use boundaries, lineage and source metadata",
};

function nonEmpty(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

async function fetchJson(url) {
  const started = performance.now();
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });
  const runtimeMs = Math.round(performance.now() - started);
  assert.equal(response.ok, true, `NOAA ArcGIS HTTP ${response.status}`);
  const payload = await response.json();
  assert.equal(Boolean(payload?.error), false, `NOAA ArcGIS error: ${JSON.stringify(payload?.error)}`);
  return { payload, runtimeMs };
}

const serviceUrl = new URL(source.serviceUrl);
serviceUrl.searchParams.set("f", "json");
const service = await fetchJson(serviceUrl);
const candidates = [
  ...(Array.isArray(service.payload?.tables) ? service.payload.tables : []),
  ...(Array.isArray(service.payload?.layers) ? service.payload.layers : []),
];
assert.ok(candidates.length > 0, "NOAA Species Filter service exposes no table/layer; fail closed");
const selected = candidates[0];
assert.ok(Number.isInteger(selected?.id), "NOAA Species Filter table/layer has no stable numeric id");

const layerUrl = new URL(`${source.serviceUrl}/${selected.id}`);
layerUrl.searchParams.set("f", "json");
const layer = await fetchJson(layerUrl);
assert.ok(Array.isArray(layer.payload?.fields) && layer.payload.fields.length > 0, "NOAA Species Filter layer exposes no fields");

const queryUrl = new URL(`${source.serviceUrl}/${selected.id}/query`);
queryUrl.searchParams.set("where", "1=1");
queryUrl.searchParams.set("outFields", "*");
queryUrl.searchParams.set("returnGeometry", "false");
queryUrl.searchParams.set("resultRecordCount", "1");
queryUrl.searchParams.set("f", "json");
const query = await fetchJson(queryUrl);
const feature = Array.isArray(query.payload?.features) ? query.payload.features[0] : null;
assert.ok(feature?.attributes && typeof feature.attributes === "object", "NOAA Species Filter returned no bounded object");

const attributes = Object.fromEntries(
  Object.entries(feature.attributes).map(([key, value]) => [key, nonEmpty(value) ? value : "UNKNOWN"]),
);
const objectIdField = layer.payload?.objectIdField || layer.payload?.objectIdFieldName || "OBJECTID";
const objectId = attributes[objectIdField];
assert.ok(nonEmpty(objectId) && objectId !== "UNKNOWN", `NOAA Species Filter object missing ${objectIdField}`);

const semanticEnvelope = {
  provider: source.provider,
  dataset: source.datasetTitle,
  inPortGuid: source.inPortGuid,
  licence: source.licence,
  publicationDate: source.publicationDate,
  revisionDate: source.revisionDate,
  scope: source.scope,
  useConstraint: source.useConstraint,
  layerId: selected.id,
  layerName: selected.name || layer.payload?.name || "UNKNOWN",
  objectIdField,
  objectId,
  attributes,
};
const fingerprint = `NOAA:species-filter-semantic-v1:${createHash("sha256").update(JSON.stringify(semanticEnvelope)).digest("hex")}`;
const providerId = `NOAA_NMFS:Species_Filter_CURRENT:${selected.id}:${objectId}`;
const canonicalObjectId = `SOURCE_OBJECT:${providerId}`;
const snapshot = {
  checkedAt,
  available: true,
  fingerprint,
  fingerprintMethod: "SEMANTIC_CONTENT",
  sourceVersion: source.sourceVersion,
  verification: "VERIFIED",
};
const record = {
  id: providerId,
  checkedAt,
  sourceFingerprint: fingerprint,
  sourceFingerprintMethod: snapshot.fingerprintMethod,
  sourceVersion: source.sourceVersion,
  providerId,
  refreshHistory: [],
};
const evaluated = refreshModule.evaluateSourceRefresh(record, snapshot, {
  provider: source.provider,
  providerId,
  canonicalLocator: `${source.serviceUrl}/${selected.id}/${objectId}`,
  canonicalObjectIds: [canonicalObjectId],
  affectedClaimIds: [`${canonicalObjectId}:SOURCE_METADATA`],
});

assert.equal(evaluated.audit.status, "UNCHANGED");
assert.equal(evaluated.audit.verification, "VERIFIED");
assert.equal(evaluated.audit.truthEffect, "NONE");
assert.equal(evaluated.publicUpdateAllowed, false);
assert.equal(evaluated.audit.syntheticFixture, false);
assert.equal(source.licence, "CC0-1.0");
assert.match(source.scope, /not occurrence evidence/i);
assert.match(source.useConstraint, /NO WARRANTY/i);

console.log(JSON.stringify({
  proof: "SPEC-FP-01 bounded NOAA Species Filter transfer",
  checkedAt,
  boundary: "ONE NOAA SOURCE OBJECT / NO BULK INGESTION / NO PUBLIC PROPAGATION",
  source: {
    provider: source.provider,
    datasetTitle: source.datasetTitle,
    inPortGuid: source.inPortGuid,
    inPortUrl: source.inPortUrl,
    serviceUrl: source.serviceUrl,
    licence: source.licence,
    licenceUrl: source.licenceUrl,
    publicationDate: source.publicationDate,
    revisionDate: source.revisionDate,
    sourceVersion: source.sourceVersion,
    scope: source.scope,
    useConstraint: source.useConstraint,
  },
  object: {
    providerId,
    canonicalObjectId,
    layerId: selected.id,
    layerName: selected.name || layer.payload?.name || "UNKNOWN",
    objectIdField,
    objectId,
    attributes,
    fingerprint,
    refreshStatus: evaluated.audit.status,
    verification: evaluated.audit.verification,
    truthEffect: evaluated.audit.truthEffect,
    publicUpdateAllowed: evaluated.publicUpdateAllowed,
  },
  runtimeMs: service.runtimeMs + layer.runtimeMs + query.runtimeMs,
  founderHandlingTime: "UNKNOWN",
  marginalMonetaryCost: "UNKNOWN",
}, null, 2));
