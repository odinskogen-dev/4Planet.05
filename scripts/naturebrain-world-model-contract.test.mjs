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
const { natureBrainProductIdentifiers, natureBrainProductLinks, natureBrainLsiEdges, natureBrainEvidenceFrame, natureBrainRelationshipIsProductReady, NATUREBRAIN_PRODUCT_TRUTH_BOUNDARY } = runtime;

const orca = {
  canonical_id: "taxon:gbif:2440483",
  entity_type: "taxon",
  name: "Orca",
  observation_count: 2056,
  signal_count: 0,
  taxon: { scientific_name: "Orcinus orca", rank: "species", taxonomic_status: "accepted" },
  external_identifiers: [
    {
      namespace: "GBIF_TAXON",
      external_id: "2440483",
      canonical_uri: "https://www.gbif.org/species/2440483",
    },
    {
      namespace: "WORMS_APHIA",
      external_id: "137102",
      canonical_uri: "https://www.marinespecies.org/aphia.php?p=taxdetails&id=137102",
    },
    {
      namespace: "ITIS_TSN",
      external_id: "180469",
      canonical_uri: "https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=180469",
      provenance: { source_authority: "ITIS" },
    },
  ],
  outbound_relationships: [
    {
      relationship_id: "relationship:naturebrain:orca:consumes:nssh",
      predicate: "consumes",
      object: { canonical_id: "population:imr:nssh", entity_type: "population", name: "Norwegian spring-spawning herring" },
      claim_id: "claim:naturebrain:orca:preys-on-nssh",
      review_status: "needs_review",
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
      provenance: {
        supported_relationships: [{
          relationship_id: "relationship:naturebrain:orca:consumes:nssh",
          predicate: "consumes",
        }],
      },
      evidence: [{
        evidence_id: "evidence:naturebrain:orca:imr-killer-whale",
        relation: "supports",
        evidence_type: "citation",
        source_id: "source:imr_no",
        dataset_id: "dataset:imr:killer-whale-topic",
        source_record_id: "source_record:imr:killer-whale-topic:2024-12-03",
        citation: "https://www.hi.no/en/hi/temasider/species/killer-whale",
        reviewed_at: "2026-10-04T18:05:50Z",
        provenance: { rights_boundary: "citation_and_structured_paraphrase_only" },
      }],
    },
    {
      claim_id: "claim:naturebrain:orca:fishery-interaction",
      statement: "Source-backed fishery interaction.",
      review_status: "reviewed",
      evidence_strength: "primary_institutional_report",
      interpretation_status: "source_paraphrase",
      provenance: {
        supported_relationships: [
          {
            relationship_id: "relationship:naturebrain:orca:interacts-with:nssh-fishery",
            predicate: "interacts_with_human_system",
          },
          {
            relationship_id: "relationship:naturebrain:pressure:affects:orca",
            predicate: "affects",
          },
        ],
      },
      evidence: [{
        evidence_id: "evidence:naturebrain:orca:imr-fishery-interaction",
        relation: "supports",
        evidence_type: "citation",
        source_id: "source:imr_no",
        dataset_id: "dataset:imr:fhf-901926",
        source_record_id: "source_record:imr:fhf-901926:2026-30",
        citation: "https://www.hi.no/en/hi/nettrapporter/rapport-fra-havforskningen-en-2026-30",
        reviewed_at: "2026-10-04T18:05:50Z",
        provenance: { rights_boundary: "citation_and_structured_paraphrase_only" },
      }],
    },
  ],
  measurements: [],
};

test("namespace-qualified GBIF and WoRMS references survive without asserting equivalence", () => {
  const identifiers = natureBrainProductIdentifiers(orca);
  assert.deepEqual(
    identifiers.map((identifier) => identifier.namespaceQualifiedId),
    ["GBIF_TAXON:2440483", "WORMS_APHIA:137102"],
  );
  assert.ok(identifiers.every((identifier) => identifier.state === "SOURCE_QUALIFIED_REFERENCE"));
  assert.ok(identifiers.every((identifier) => identifier.equivalence === "NOT_ASSERTED"));
  assert.equal(identifiers.some((identifier) => identifier.namespace === "ITIS_TSN"), false);
});

test("ITIS TSN admission requires reviewed version, matching name/rank, valid standing, citation and rights", () => {
  const reviewed = structuredClone(orca);
  reviewed.external_identifiers[2].provenance = {
    source_authority: "ITIS",
    authority_version: "2026-09-22",
    scientific_name: "Orcinus orca",
    rank: "species",
    taxonomic_standing: "valid",
    reviewed_at: "2026-10-17T16:00:00Z",
    citation: "https://doi.org/10.5066/F7KH0KBK",
    rights_boundary: "ITIS-produced taxonomy facts are CC0; third-party media excluded",
  };

  const identifiers = natureBrainProductIdentifiers(reviewed);
  const itis = identifiers.find((identifier) => identifier.namespace === "ITIS_TSN");
  assert.equal(itis?.namespaceQualifiedId, "ITIS_TSN:180469");
  assert.equal(itis?.authorityVersion, "2026-09-22");
  assert.equal(itis?.taxonomicStanding, "VALID");
  assert.equal(itis?.equivalence, "NOT_ASSERTED");

  for (const field of ["authority_version", "scientific_name", "rank", "taxonomic_standing", "reviewed_at", "citation", "rights_boundary"]) {
    const incomplete = structuredClone(reviewed);
    delete incomplete.external_identifiers[2].provenance[field];
    assert.equal(
      natureBrainProductIdentifiers(incomplete).some((identifier) => identifier.namespace === "ITIS_TSN"),
      false,
      `ITIS must fail closed without ${field}`,
    );
  }

  const conflict = structuredClone(reviewed);
  conflict.external_identifiers[2].provenance.rank = "subspecies";
  assert.equal(natureBrainProductIdentifiers(conflict).some((identifier) => identifier.namespace === "ITIS_TSN"), false);
});

test("Node Intelligence consumes the source-reference projection without creating relationships", () => {
  assert.match(nodeSource, /natureBrainProductIdentifiers/);
  assert.match(nodeSource, /externalIdentifiers: ReturnType<typeof natureBrainProductIdentifiers>/);
  assert.match(nodeSource, /externalIdentifiers,/);
  assert.match(nodeSource, /const externalIdentifiers = currentNatureContext \? natureBrainProductIdentifiers\(currentNatureContext\) : \[\]/);
});

test("NATUREBRAIN adapter projects only product-ready relationships into product and LSI views", () => {
  const links = natureBrainProductLinks(orca);
  const edges = natureBrainLsiEdges(orca);
  assert.equal(links.length, 2);
  assert.equal(edges.length, 2);
  assert.equal(edges.some((e) => e.relationshipId === "relationship:naturebrain:orca:consumes:nssh"), false);
  assert.equal(edges.find((e) => e.predicate === "interacts_with_human_system")?.category, "HUMAN_SYSTEM");
  assert.equal(edges.find((e) => e.predicate === "affects")?.category, "PRESSURE");
  assert.ok(edges.every((e) => e.claimId));
});

test("held ecological interpretations remain negative fixtures even with reviewed claim evidence", () => {
  const herring = {
    ...orca,
    canonical_id: "population:imr:nssh",
    name: "Norwegian spring-spawning herring",
    outbound_relationships: [{
      relationship_id: "relationship:naturebrain:nssh:part-of:norwegian-sea-pelagic",
      predicate: "part_of_living_system",
      object: { canonical_id: "living-system:4p:norwegian-sea-pelagic", entity_type: "living_system", name: "Norwegian Sea pelagic system" },
      claim_id: "claim:naturebrain:nssh:pelagic-context",
      review_status: "needs_review",
      evidence_strength: "primary_institutional_source",
    }],
    inbound_relationships: [],
    claims: [{
      claim_id: "claim:naturebrain:nssh:pelagic-context",
      statement: "Source-backed pelagic context.",
      review_status: "reviewed",
      evidence_strength: "primary_institutional_source",
      evidence: [{
        evidence_id: "evidence:naturebrain:nssh:imr-herring",
        source_id: "source:imr_no",
        dataset_id: "dataset:imr:nssh-herring-topic",
        source_record_id: "source_record:imr:nssh-herring-topic:2025-08-19",
        citation: "https://www.hi.no/en/hi/temasider/species/herring",
        reviewed_at: "2026-10-04T18:05:50Z",
        provenance: { rights_boundary: "citation_and_structured_paraphrase_only" },
      }],
    }],
  };

  assert.equal(natureBrainRelationshipIsProductReady(orca, orca.outbound_relationships[0]), false);
  assert.equal(natureBrainProductLinks(herring).length, 0);
  assert.equal(natureBrainLsiEdges(herring).length, 0);
});

test("reviewed stock-to-taxon edges fail closed without exact claim support for relationship id and predicate", () => {
  const misaligned = structuredClone(orca);
  const stockTaxon = {
    relationship_id: "relationship:naturebrain:nssh:taxon:herring",
    predicate: "has_taxon",
    object: { canonical_id: "taxon:aphia:126417", entity_type: "taxon", name: "Atlantic herring" },
    claim_id: "claim:naturebrain:nssh:pelagic-feeding-context",
    review_status: "reviewed",
    evidence_strength: "primary_institutional_source",
  };
  misaligned.canonical_id = "population:imr:nssh";
  misaligned.outbound_relationships = [stockTaxon];
  misaligned.inbound_relationships = [];
  misaligned.claims = [{
    claim_id: "claim:naturebrain:nssh:pelagic-feeding-context",
    statement: "Herring is an important prey species in the pelagic food web.",
    review_status: "reviewed",
    evidence_strength: "primary_institutional_source",
    provenance: {
      supported_relationships: [{
        relationship_id: "relationship:naturebrain:nssh:consumes:plankton",
        predicate: "consumes",
      }],
    },
    evidence: [{
      evidence_id: "evidence:naturebrain:nssh:imr-herring",
      source_id: "source:imr_no",
      dataset_id: "dataset:imr:nssh-herring-topic",
      source_record_id: "source_record:imr:nssh-herring-topic:2025-08-19",
      citation: "https://www.hi.no/en/hi/temasider/species/herring",
      reviewed_at: "2026-10-04T18:05:50Z",
      provenance: { rights_boundary: "citation_and_structured_paraphrase_only" },
    }],
  }];

  assert.equal(natureBrainRelationshipIsProductReady(misaligned, stockTaxon), false);
  assert.equal(natureBrainProductLinks(misaligned).length, 0);
  assert.equal(natureBrainLsiEdges(misaligned).length, 0);

  for (const malformedSupport of [
    undefined,
    [],
    [{ relationship_id: stockTaxon.relationship_id }],
    [{ predicate: stockTaxon.predicate }],
    [{ relationship_id: stockTaxon.relationship_id, predicate: "consumes" }],
  ]) {
    const candidate = structuredClone(misaligned);
    candidate.claims[0].provenance = malformedSupport === undefined
      ? {}
      : { supported_relationships: malformedSupport };
    assert.equal(
      natureBrainRelationshipIsProductReady(candidate, candidate.outbound_relationships[0]),
      false,
      "semantic support must match both relationship id and predicate",
    );
  }
});

test("reviewed edges require reviewed claim, reviewed source evidence and an explicit rights boundary", () => {
  const reviewedConsumes = {
    ...orca.outbound_relationships[0],
    review_status: "reviewed",
  };
  const reviewedContext = {
    ...orca,
    outbound_relationships: [reviewedConsumes],
    inbound_relationships: [],
  };
  assert.equal(natureBrainRelationshipIsProductReady(reviewedContext, reviewedConsumes), true);
  assert.equal(natureBrainLsiEdges(reviewedContext)[0]?.category, "DEPENDENCY");

  const missingRights = structuredClone(reviewedContext);
  delete missingRights.claims[0].evidence[0].provenance;
  assert.equal(natureBrainRelationshipIsProductReady(missingRights, missingRights.outbound_relationships[0]), false);
  assert.equal(natureBrainProductLinks(missingRights).length, 0);
});

test("answer evidence frame returns stored claims and recorded HTTPS citations only", () => {
  const frame = natureBrainEvidenceFrame(orca);
  assert.equal(frame.length, 2);
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
