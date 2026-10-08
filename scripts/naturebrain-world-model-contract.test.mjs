import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const adapterSource = await readFile(new URL("../src/planet/naturebrainContext.ts", import.meta.url), "utf8");
const nodeSource = await readFile(new URL("../src/planet/nodeIntelligence.ts", import.meta.url), "utf8");
const gbifMigration = await readFile(new URL("../supabase/migrations/20261004175812_naturebrain_gbif_legacy_record_idempotency_v01.sql", import.meta.url), "utf8");
const orcaMigration = await readFile(new URL("../supabase/migrations/20261004180550_naturebrain_orca_world_model_gold_slice_v01.sql", import.meta.url), "utf8");
const contextMigration = await readFile(new URL("../supabase/migrations/20261004180906_naturebrain_entity_context_graph_v03.sql", import.meta.url), "utf8");
const rpcMigration = await readFile(new URL("../supabase/migrations/20261004181516_naturebrain_internal_entity_context_rpc_v01.sql", import.meta.url), "utf8");

const compiled = ts.transpileModule(adapterSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const runtime = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const { natureBrainProductLinks, natureBrainLsiEdges, natureBrainEvidenceFrame, NATUREBRAIN_PRODUCT_TRUTH_BOUNDARY } = runtime;

const orca = {
  canonical_id: "taxon:gbif:2440483",
  entity_type: "taxon",
  name: "Orca",
  observation_count: 2056,
  signal_count: 0,
  external_identifiers: [],
  outbound_relationships: [
    {
      relationship_id: "relationship:naturebrain:orca:consumes:nssh",
      predicate: "consumes",
      object: { canonical_id: "population:imr:nssh", entity_type: "population", name: "Norwegian spring-spawning herring" },
      claim_id: "claim:naturebrain:orca:preys-on-nssh",
      review_status: "reviewed",
      evidence_strength: "primary_institutional_source",
    },
    {
      relationship_id: "relationship:naturebrain:orca:interacts-with:nssh-fishery",
      predicate: "interacts_with_human_system",
      object: { canonical_id: "human-system:4p:nssh-purse-seine-fishery", entity_type: "human_system", name: "NSSH purse-seine fishery" },
      claim_id: "claim:naturebrain:orca:fishery-interaction",
      review_status: "reviewed",
      evidence_strength: "primary_institutional_report",
    },
  ],
  inbound_relationships: [
    {
      relationship_id: "relationship:naturebrain:pressure:affects:orca",
      predicate: "affects",
      subject: { canonical_id: "pressure:4p:whale-purse-seine-interaction-risk", entity_type: "pressure", name: "Whale–purse-seine interaction risk" },
      claim_id: "claim:naturebrain:orca:fishery-interaction",
      review_status: "reviewed",
      evidence_strength: "primary_institutional_report",
    },
  ],
  claims: [
    {
      claim_id: "claim:naturebrain:orca:preys-on-nssh",
      statement: "Source-backed prey relation.",
      review_status: "reviewed",
      evidence_strength: "primary_institutional_source",
      interpretation_status: "source_paraphrase",
      evidence: [{
        evidence_id: "evidence:naturebrain:orca:imr-killer-whale",
        relation: "supports",
        evidence_type: "citation",
        source_id: "source:imr_no",
        dataset_id: "dataset:imr:killer-whale-topic",
        source_record_id: "source_record:imr:killer-whale-topic:2024-12-03",
        citation: "https://www.hi.no/en/hi/temasider/species/killer-whale",
        reviewed_at: "2026-10-04T18:05:50Z",
      }],
    },
  ],
  measurements: [],
};

test("NATUREBRAIN adapter projects the same relationship state into product and LSI views", () => {
  const links = natureBrainProductLinks(orca);
  const edges = natureBrainLsiEdges(orca);
  assert.equal(links.length, 3);
  assert.equal(edges.length, 3);
  assert.equal(edges.find((e) => e.predicate === "consumes")?.category, "DEPENDENCY");
  assert.equal(edges.find((e) => e.predicate === "interacts_with_human_system")?.category, "HUMAN_SYSTEM");
  assert.equal(edges.find((e) => e.predicate === "affects")?.category, "PRESSURE");
  assert.ok(edges.every((e) => e.claimId));
});

test("answer evidence frame returns stored claims and recorded HTTPS citations only", () => {
  const frame = natureBrainEvidenceFrame(orca);
  assert.equal(frame.length, 1);
  assert.equal(frame[0].claimId, "claim:naturebrain:orca:preys-on-nssh");
  assert.equal(frame[0].citations.length, 1);
  assert.match(frame[0].citations[0].citation, /^https:\/\//);
  assert.equal(frame[0].citations[0].evidenceId, "evidence:naturebrain:orca:imr-killer-whale");
  assert.equal(frame[0].citations[0].datasetId, "dataset:imr:killer-whale-topic");
  assert.equal(frame[0].citations[0].reviewedAt, "2026-10-04T18:05:50Z");
});

test("Node Intelligence exposes the canonical evidence frame without a second claim store", () => {
  assert.match(nodeSource, /natureBrainEvidenceFrame/);
  assert.match(nodeSource, /evidenceFrame: ReturnType<typeof natureBrainEvidenceFrame>/);
  assert.match(nodeSource, /currentNatureContext \? natureBrainEvidenceFrame\(currentNatureContext\) : \[\]/);
});

test("truth boundary forbids the central ecological overclaims", () => {
  assert.match(NATUREBRAIN_PRODUCT_TRUTH_BOUNDARY, /observation into range/i);
  assert.match(NATUREBRAIN_PRODUCT_TRUTH_BOUNDARY, /correlation into causation/i);
  assert.match(NATUREBRAIN_PRODUCT_TRUTH_BOUNDARY, /candidate solution into proven outcome/i);
  assert.match(NATUREBRAIN_PRODUCT_TRUTH_BOUNDARY, /unreviewed\/synthesis edge into verified fact/i);
});

test("generic Node Intelligence can consume NATUREBRAIN without creating a second graph", () => {
  assert.match(nodeSource, /natureBrainProductLinks/);
  assert.match(nodeSource, /natureBrainLsiEdges/);
  assert.match(nodeSource, /lsiEdges/);
  assert.match(nodeSource, /\/domains\/s4piens\?entity=/);
  assert.match(nodeSource, /NatureBrainEntityContext/);
  assert.match(nodeSource, /NATUREBRAIN_PRODUCT_TRUTH_BOUNDARY/);
  assert.match(nodeSource, /currentNatureContext/);
  assert.doesNotMatch(nodeSource, /new Map\(.*naturebrain/i);
});

test("GBIF live ingest converges legacy provider records instead of duplicating them", () => {
  assert.match(gbifMigration, /dataset_id=f\.dataset_id and sr\.external_record_id=k/i);
  assert.match(gbifMigration, /canonical_record_reused/i);
  assert.match(gbifMigration, /on conflict\(record_id,fingerprint\) do nothing/i);
  assert.match(gbifMigration, /no abundance inference/i);
});

test("Orca World Model uses the canonical graph and explicit evidence boundaries", () => {
  for (const needle of [
    "taxon:gbif:2440483",
    "population:imr:nssh",
    "function:4p:apex-predation",
    "human-system:4p:nssh-purse-seine-fishery",
    "pressure:4p:whale-purse-seine-interaction-risk",
    "solution:4p:tast-whale-fishery-mitigation",
    "claim:naturebrain:orca:preys-on-nssh",
    "relationship:naturebrain:orca:consumes:nssh",
    "relationship:naturebrain:tast:addresses:interaction-risk",
    "universal_effectiveness",
    "unknown",
  ]) assert.ok(orcaMigration.includes(needle), `missing Orca world-model contract: ${needle}`);
  assert.match(orcaMigration, /citation_and_structured_paraphrase_only/);
  assert.match(orcaMigration, /not_universal_effect/);
});

test("entity context separates raw observation volume from model claims", () => {
  assert.match(contextMigration, /observation_count/);
  assert.match(contextMigration, /interpretation_status is distinct from 'provider_record_only'/i);
  assert.match(contextMigration, /outbound_relationships/);
  assert.match(contextMigration, /inbound_relationships/);
  assert.match(contextMigration, /measurements/);
});

test("NATUREBRAIN read seam is server-only and does not expose private schema directly", () => {
  assert.match(rpcMigration, /security definer/i);
  assert.match(rpcMigration, /revoke all .* from public/i);
  assert.match(rpcMigration, /revoke all .* from anon/i);
  assert.match(rpcMigration, /revoke all .* from authenticated/i);
  assert.match(rpcMigration, /grant execute .* to service_role/i);
  assert.match(rpcMigration, /planetbrain\.api_entity_context/);
});
