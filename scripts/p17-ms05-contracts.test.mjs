import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { pathToFileURL } from "node:url";

const profiles = JSON.parse(fs.readFileSync(new URL("../src/data/p17KnowledgeProfiles.json", import.meta.url), "utf8"));
const manifest = JSON.parse(fs.readFileSync(new URL("../docs/p17-ms05-register-manifest.json", import.meta.url), "utf8"));

const outDir = new URL("../.tmp/p17-ms05-runtime/", import.meta.url);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
execFileSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "tsc",
    "src/planet/sourceGraph.ts",
    "src/planet/p17KnowledgeConnectors.ts",
    "--target", "ES2020",
    "--module", "ESNext",
    "--moduleResolution", "bundler",
    "--lib", "ES2020,DOM",
    "--skipLibCheck",
    "--outDir", ".tmp/p17-ms05-runtime",
  ],
  { cwd: new URL("..", import.meta.url), stdio: "pipe" },
);

const sourceGraph = await import(pathToFileURL(new URL("../.tmp/p17-ms05-runtime/sourceGraph.js", import.meta.url).pathname));
const connectors = await import(pathToFileURL(new URL("../.tmp/p17-ms05-runtime/p17KnowledgeConnectors.js", import.meta.url).pathname));

const node = (id, type) => ({ id, type, label: id, sourceIds: ["source:official"], reviewState: "REVIEWED" });
const edge = (id, fromId, toId, relation) => ({
  id,
  fromId,
  toId,
  relation,
  sourceId: "source:official",
  evidenceState: "CONFIRMED",
  lastChecked: "2026-08-09",
  confidence: "HIGH",
  rightsState: "CONFIRMED",
  precision: "DOCUMENTED",
  reviewState: "REVIEWED",
  createdAt: "2026-08-09T00:00:00Z",
  updatedAt: "2026-08-09T00:00:00Z",
});

test("MS05 Drive manifest meets the contracted research thresholds", () => {
  assert.ok(manifest.counts.knowledgeInstitutions >= manifest.minimums.knowledgeInstitutions);
  assert.ok(manifest.counts.datasetsProgrammesServices >= manifest.minimums.datasetsProgrammesServices);
  assert.equal(manifest.counts.priority40, 40);
  assert.equal(manifest.counts.deep20, 20);
  assert.equal(manifest.counts.knowledgeProfiles, 12);
  assert.equal(manifest.counts.integrationQueue, 15);
  assert.ok(manifest.counts.sourceGraphNodes > 0);
  assert.ok(manifest.counts.sourceGraphRelationships > 0);
  assert.equal(manifest.releaseState, "PRIVATE_BETA_NO_EXTERNAL_ACTIVATION");
});

test("twelve knowledge profiles are unique, sourced and relationship-safe", () => {
  assert.equal(profiles.length, 12);
  assert.equal(new Set(profiles.map((profile) => profile.researchId)).size, 12);
  assert.equal(new Set(profiles.map((profile) => profile.slug)).size, 12);
  for (const profile of profiles) {
    assert.match(profile.researchId, /^PKI-\d{3}$/);
    assert.match(profile.canonicalActorId, /^actor:p17:/);
    assert.ok(profile.sourceUrls.length > 0, `${profile.researchId} must have official sources`);
    assert.equal(profile.relationshipStatus, "INDEPENDENT_RESEARCH_PROFILE_NO_PARTNERSHIP");
    assert.ok(profile.limitations.length >= 3, `${profile.researchId} must expose material limitations`);
    assert.ok(profile.licenceState, `${profile.researchId} must expose a licence state`);
    assert.ok(profile.apiState, `${profile.researchId} must expose an API/access state`);
    assert.ok(profile.freshnessState, `${profile.researchId} must expose a freshness state`);
  }
});

test("GBIF and IUCN research records resolve to existing canonical P17 identities", () => {
  const gbif = profiles.find((profile) => profile.researchId === "PKI-001");
  const iucn = profiles.find((profile) => profile.researchId === "PKI-002");
  assert.equal(gbif.canonicalActorId, "actor:p17:P17-A003");
  assert.equal(iucn.canonicalActorId, "actor:p17:P17-A001");
});

test("IPBES uses a clean canonical profile slug", () => {
  const ipbes = profiles.find((profile) => profile.researchId === "PKI-006");
  assert.equal(ipbes.slug, "ipbes");
});

test("Planetary Source Graph accepts institution → programme → dataset → API without identity collapse", () => {
  const graph = {
    nodes: [
      node("institution:obis", "INSTITUTION"),
      node("programme:obis", "PROGRAMME"),
      node("dataset:obis-occurrence", "DATASET"),
      node("api:obis", "API"),
      node("source-record:1", "SOURCE_RECORD"),
      node("observation:1", "OBSERVATION"),
      node("claim:1", "CLAIM"),
    ],
    edges: [
      edge("edge:1", "institution:obis", "programme:obis", "OPERATES"),
      edge("edge:2", "programme:obis", "dataset:obis-occurrence", "PRODUCES"),
      edge("edge:3", "dataset:obis-occurrence", "api:obis", "DISTRIBUTED_THROUGH"),
      edge("edge:4", "source-record:1", "observation:1", "REPRESENTS"),
      edge("edge:5", "source-record:1", "claim:1", "SUPPORTS"),
    ],
  };
  assert.deepEqual(sourceGraph.validateSourceGraph(graph), []);
  assert.equal(sourceGraph.sameEntityType(graph, "institution:obis", "dataset:obis-occurrence"), false);
  assert.equal(sourceGraph.sameEntityType(graph, "dataset:obis-occurrence", "api:obis"), false);
});

test("Planetary Source Graph rejects a dataset/API relationship applied to an institution", () => {
  const graph = {
    nodes: [node("institution:a", "INSTITUTION"), node("api:a", "API")],
    edges: [edge("edge:bad", "institution:a", "api:a", "DISTRIBUTED_THROUGH")],
  };
  const issues = sourceGraph.validateSourceGraph(graph);
  assert.ok(issues.some((issue) => issue.code === "INVALID_RELATION_FROM"));
});

test("OBIS parser preserves occurrence semantics and fails closed on malformed records", () => {
  const valid = connectors.parseObisOccurrence({ id: 101, scientificName: "Orcinus orca", decimalLatitude: 60, decimalLongitude: 4, dataset_id: "dataset-1" });
  assert.equal(valid.id, "101");
  assert.equal(valid.scientificName, "Orcinus orca");
  assert.equal(connectors.parseObisOccurrence({ id: 1 }), null);
});

test("WoRMS parser preserves taxonomic semantics and fails closed on malformed records", () => {
  const valid = connectors.parseWormsTaxon({ AphiaID: 137102, scientificname: "Orcinus orca", status: "accepted", isMarine: 1 });
  assert.equal(valid.aphiaId, 137102);
  assert.equal(valid.isMarine, true);
  assert.equal(connectors.parseWormsTaxon({ scientificname: "Orcinus orca" }), null);
});

test("connector proof handles valid, malformed, unavailable and rate-limited responses without fallback fabrication", async () => {
  const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const obisOk = await connectors.fetchObisOccurrences("Orcinus orca", async () => jsonResponse({ results: [{ id: 1, scientificName: "Orcinus orca" }] }));
  assert.equal(obisOk.ok, true);
  assert.equal(obisOk.data.length, 1);
  const obisMalformed = await connectors.fetchObisOccurrences("Orcinus orca", async () => jsonResponse({ records: [] }));
  assert.equal(obisMalformed.ok, false);
  assert.equal(obisMalformed.state, "INVALID_RESPONSE");
  const obisLimited = await connectors.fetchObisOccurrences("Orcinus orca", async () => jsonResponse({}, 429));
  assert.equal(obisLimited.ok, false);
  assert.equal(obisLimited.state, "RATE_LIMITED");
  const wormsUnavailable = await connectors.matchWormsTaxon("Orcinus orca", async () => jsonResponse({}, 503));
  assert.equal(wormsUnavailable.ok, false);
  assert.equal(wormsUnavailable.state, "UNAVAILABLE");
  assert.equal("data" in wormsUnavailable, false);
});

test("connector proof contains no scheduled production ingestion", () => {
  for (const proof of connectors.P17_CONNECTOR_PROOFS) {
    assert.equal(proof.productionIngestion, false);
    assert.equal(proof.scheduledCollection, false);
    assert.match(proof.mode, /fixture-first/);
  }
});
