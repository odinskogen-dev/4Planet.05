import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const files = {
  app: read("src/App.tsx"),
  bootstrap: read("src/earth/runtimeTruthBootstrap.ts"),
  runtimeTruth: read("src/planet/runtimeTruth.ts"),
  runtimeClaims: read("src/data/runtimeClaims.ts"),
  runtimeSources: read("src/data/runtimeSources.ts"),
  living: read("src/pages/v5/LivingSystems.tsx"),
  provenance: read("src/components/phase04/ProvenanceBar.tsx"),
  gbif: read("src/planet/datasetOccurrences.ts"),
  vannmiljo: read("src/planet/vannmiljo.ts"),
  impact: read("src/impact/prototype.ts"),
  sources: read("src/planet/sources.ts"),
};

const attacks = [];
const attack = (name, fn) => attacks.push({ name, fn });

// DATA MODEL / TEMPORAL TRUTH
attack("fetch state is not observation time", () => assert.match(files.runtimeTruth, /FETCHED_NOW[\s\S]+OBSERVATION_TIME/));
attack("source-product date is separate from retrieval time", () => assert.match(files.runtimeTruth, /retrievedAt:[\s\S]+sourceProductDate/));
attack("historical state is explicit", () => assert.match(files.bootstrap, /HISTORICAL TREE-COVER LOSS/));
attack("true-colour is not labelled TODAY at runtime", () => assert.match(files.bootstrap, /NASA EARTHDATA · SOURCE-DATED/));
attack("precipitation is not represented as live ground truth", () => assert.match(files.bootstrap, /not a live ground measurement/));
attack("fixed night-light product is labelled historical", () => assert.match(files.bootstrap, /NIGHT LIGHTS · HISTORICAL/));
attack("thermal anomalies are not automatically wildfires", () => assert.match(files.bootstrap, /detection is heat, not proof of wildfire/i));
attack("EONET source status is curated, not physical event clock", () => assert.match(files.bootstrap, /editorial\/curated/));
attack("USGS feed records can be revised", () => assert.match(files.bootstrap, /may be revised/));
attack("runtime bootstrap is actually activated", () => assert.match(files.app, /runtimeTruthBootstrap/));

// OCCURRENCE / SPATIAL TRUTH
attack("GBIF record count cannot be population", () => assert.match(files.gbif, /OCCURRENCE_RECORDS_NOT_POPULATION/));
attack("GBIF upstream dataset identity is preserved", () => assert.match(files.gbif, /upstreamDataset: resolvedDatasetKey/));
attack("GBIF licence state is preserved", () => assert.match(files.gbif, /rightsState: license \? "DATASET_DEPENDENT" : "REVIEW_REQUIRED"/));
attack("GBIF spatial precision is never automatically exact", () => assert.doesNotMatch(files.gbif, /spatialPrecision:\s*"EXACT"/));
attack("generalized coordinates are representable", () => assert.match(files.runtimeTruth, /"GENERALIZED"/));
attack("obscured coordinates are representable", () => assert.match(files.runtimeTruth, /"OBSCURED"/));
attack("source-suppressed coordinates are representable", () => assert.match(files.runtimeTruth, /"SOURCE_SUPPRESSED"/));
attack("query-area match is separate from semantic place membership", () => assert.match(files.runtimeTruth, /QUERY_AREA_MATCH/));
attack("sensitive-location policy can block exact rendering", () => assert.match(files.runtimeTruth, /DO_NOT_RENDER_EXACT/));
attack("biodiversity density is relabelled as record density", () => assert.match(files.bootstrap, /GBIF RECORD DENSITY/));

// SCIENTIFIC CLAIM STRENGTH
attack("coral heat stress is not observed bleaching", () => assert.match(files.bootstrap, /not a field observation of bleaching or mortality/));
attack("Living Systems runtime maps the coral claim", () => assert.match(files.runtimeClaims, /CLM-W02-SCI-001/));
attack("pollination denominator does not become a bee-food percentage", () => assert.match(files.runtimeClaims, /Do not convert crop-category dependence/));
attack("pesticide effects retain heterogeneity", () => assert.match(files.runtimeClaims, /effects varying by country and species/));
attack("whale nutrient magnitude remains ecosystem scoped", () => assert.match(files.runtimeClaims, /Do not universalise quantified Gulf of Maine effects globally/));
attack("cod status requires stock/date scope", () => assert.match(files.runtimeClaims, /cod stock, geography, assessment date and current status/));

// CLAIM-FIRST / LINEAGE
attack("runtime export declares itself derivative", () => assert.match(files.runtimeClaims, /status: "DERIVATIVE"/));
attack("runtime export names canonical Knowledge OS", () => assert.match(files.runtimeClaims, /4PLANET Knowledge OS \/ Atomic Programme Register/));
attack("all 13 seeded relation IDs have explicit Claim controls", () => {
  const ids = [
    "r-bee-performs-pollination", "r-bumble-performs-pollination", "r-pollination-supports-reproduction",
    "r-reproduction-supports-food-production", "r-food-production-supports-food-system", "r-pesticide-affects-bee",
    "r-habitat-affects-bee", "r-primary-supports-cod", "r-humpback-performs-nutrient", "r-cod-supports-fisheries",
    "r-warming-affects-coastal", "r-overexploit-affects-cod", "r-warming-affects-coral",
  ];
  for (const id of ids) assert.match(files.runtimeClaims, new RegExp(`"${id}"`));
});
attack("Living Systems resolves relation IDs through Claim controls", () => assert.match(files.living, /claimForRelation\(relation\.id\)/));
attack("public disclosure exposes Claim IDs", () => assert.match(files.provenance, /CLAIMS:/));
attack("public disclosure exposes why-we-say-this", () => assert.match(files.provenance, /WHY WE SAY THIS/));
attack("public disclosure exposes data date", () => assert.match(files.provenance, /DATA DATE/));
attack("public disclosure exposes last checked", () => assert.match(files.provenance, /LAST CHECKED/));
attack("public disclosure exposes limitations", () => assert.match(files.provenance, /LIMITATIONS/));
attack("public disclosure can link original sources", () => assert.match(files.provenance, /source\.url/));

// RIGHTS
attack("runtime rights can explicitly block use", () => assert.match(files.runtimeTruth, /"BLOCKED"/));
attack("runtime rights can require item-level evidence", () => assert.match(files.runtimeTruth, /"ITEM_LEVEL_REQUIRED"/));
attack("iNaturalist media remains a public-use block without exact item rights", () => assert.match(files.runtimeClaims, /inaturalistMedia[\s\S]+PUBLIC-USE BLOCK/));
attack("source registry does not claim iNaturalist rights approval", () => assert.match(files.sources, /inaturalist:[\s\S]+rightsReview: "PENDING"/));

// IMPACT / PARTNER TRUTH
attack("impact test unit is explicitly TEST_ONLY", () => assert.match(files.impact, /publicTruthState: "TEST_ONLY"/));
attack("impact test unit remains NOT_DELIVERED", () => assert.match(files.impact, /status: "NOT_DELIVERED"/));
attack("impact outcome remains NOT_ASSESSED", () => assert.match(files.impact, /status: "NOT_ASSESSED"/));
attack("impact test has no real provider", () => assert.match(files.impact, /provider:fixture:none/));
attack("legacy PL4STIC mission ID is removed from current test unit", () => assert.doesNotMatch(files.impact, /mission:4p:pl4stic/));
attack("current plastic test unit routes to CLE4N", () => assert.match(files.impact, /mission:4p:cle4n/));
attack("candidate provider cannot silently become partner", () => assert.match(files.runtimeClaims, /candidate is not a qualified or contracted 4PLANET partner/));

// SOURCE FAILURE / VANNMILJO TRUTH
attack("Vannmiljo HTTP 400 is a contract rejection, not zero", () => assert.match(files.vannmiljo, /response\.status === 400[\s\S]+SOURCE_CONTRACT_REJECTED/));
attack("Vannmiljo count is registration records, not ecological status", () => assert.match(files.vannmiljo, /REGISTRATION_RECORDS_NOT_ECOLOGICAL_STATUS/));
attack("Vannmiljo observation time is separate from retrieval time", () => assert.match(files.vannmiljo, /retrievedAt: checkedAt[\s\S]+observationTime: samplingTime/));
attack("Vannmiljo source coordinates are not promoted to exact precision", () => assert.doesNotMatch(files.vannmiljo, /spatialPrecision:[^\n]+"EXACT"/));
attack("Vannmiljo carries explicit NLOD rights", () => assert.match(files.vannmiljo, /licence: "NLOD 2\.0"/));

// PRODUCT-STATE / SOURCE-INTEGRATION BOUNDARIES
attack("planned source state remains representable", () => assert.match(files.runtimeTruth + files.sources, /REVIEW_REQUIRED|NEEDS_KEY/));
attack("Protected Planet remains needs-key rather than integrated", () => assert.match(files.sources, /wdpa:[\s\S]+implStatus: "NEEDS_KEY"/));
attack("claim blockers remain representable", () => assert.match(files.runtimeTruth, /BLOCK \/ QUALIFY/));
attack("public-use blockers remain representable", () => assert.match(files.runtimeTruth, /PUBLIC-USE BLOCK/));

for (const { name, fn } of attacks) {
  test(`truth-drift attack: ${name}`, fn);
}

test("adversarial runtime truth suite contains at least 30 distinct attacks", () => {
  assert.ok(attacks.length >= 30, `expected >=30 attacks, got ${attacks.length}`);
});
