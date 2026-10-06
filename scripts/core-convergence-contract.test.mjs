import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/data/corePrimitives.ts", import.meta.url), "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const core = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);

test("PERSON and COMPANY use the same actor contract without merging authority", () => {
  const person = core.personActor("user-1");
  const company = core.companyActor("company-1");
  assert.equal(person.actor_type, "PERSON");
  assert.equal(person.authority, "PRIVATE_SELF");
  assert.equal(company.actor_type, "COMPANY");
  assert.equal(company.authority, "COMPANY_MEMBERSHIP");
  assert.notEqual(person.authority, company.authority);
});

test("source evidence fails closed when SOURCE_REFERENCED has no reference", () => {
  assert.throws(() => core.sourceEvidence({ sourceState: "SOURCE_REFERENCED" }), /SOURCE_REFERENCE_REQUIRED/);
  const unknown = core.sourceEvidence({});
  assert.equal(unknown.source_state, "UNKNOWN");
  assert.equal(unknown.source_ref, null);
});

test("4SAPIEN demo decision can never masquerade as verified source evidence", () => {
  const context = core.foodDecisionCoreContext("user-1", "DEMO_FIXTURE_NOT_VERIFIED");
  assert.equal(context.schema_version, "4PLANET_CORE_V1");
  assert.equal(context.product, "4sapien");
  assert.equal(context.stage, "DECISION");
  assert.equal(context.claim_boundary, "DECISION_NOT_OUTCOME");
  assert.equal(context.evidence[0].source_state, "DEMO_FIXTURE_NOT_VERIFIED");
  assert.equal(context.evidence[0].confidence, "LOW");
});

test("4BRANDS maps public evidence into the same source/provenance primitive", () => {
  const context = core.companyAnalysisCoreContext("company-1", {
    evidence: [{
      id: "BRREG:123",
      url: "https://example.test/source",
      checkedAt: "2026-10-06T00:00:00Z",
      note: "Legal entity source.",
    }],
  });
  assert.equal(context.product, "4brands");
  assert.equal(context.actor.actor_type, "COMPANY");
  assert.equal(context.claim_boundary, "DECISION_NOT_OUTCOME");
  assert.equal(context.evidence[0].source_ref, "BRREG:123");
  assert.equal(context.evidence[0].source_state, "SOURCE_REFERENCED");
});

test("decision/action/outcome/proof boundaries cannot collapse into one claim", () => {
  const actor = core.personActor("user-1");
  assert.equal(core.coreContext({ actor, product: "4sapien", stage: "DECISION" }).claim_boundary, "DECISION_NOT_OUTCOME");
  assert.equal(core.coreContext({ actor, product: "4sapien", stage: "ACTION" }).claim_boundary, "ACTION_NOT_OUTCOME");
  assert.equal(core.coreContext({ actor, product: "4sapien", stage: "OUTCOME" }).claim_boundary, "OUTCOME_NOT_VERIFIED_IMPACT");
  assert.equal(core.coreContext({ actor, product: "4sapien", stage: "PROOF" }).claim_boundary, "PROOF_ONLY_TO_EVIDENCE_REACHED");
});

test("CORE_REUSE_RATE V1 reports only physically shared target primitives", () => {
  const result = core.coreReuseRate({
    IDENTITY: ["4sapien", "4brands"],
    ACTOR: ["4sapien"],
    SOURCE_PROVENANCE: ["4sapien"],
    DECISION_BOUNDARY: ["4sapien"],
    LIFECYCLE_CLAIM_BOUNDARY: ["4sapien"],
  });
  assert.equal(result.reused, 1);
  assert.equal(result.total, 5);
  assert.equal(result.rate, 0.2);
  assert.deepEqual(result.primitives, ["IDENTITY"]);
});

const sapienRuntime = await readFile(new URL("../src/food/pantryMemory.ts", import.meta.url), "utf8");
const brandsRuntime = await readFile(new URL("../src/product/FourBrandBrainClient.ts", import.meta.url), "utf8");
const sapienUi = await readFile(new URL("../src/pages/sapien/PantryChoice.tsx", import.meta.url), "utf8");

test("physical runtime consumers already share canonical 4PLANET ID", () => {
  assert.match(sapienRuntime, /identityClient/);
  assert.match(brandsRuntime, /identityClient/);
});

test("4SAPIEN physically consumes shared core semantics through its existing private store", () => {
  assert.match(sapienRuntime, /corePrimitives/);
  assert.match(sapienRuntime, /foodDecisionCoreContext/);
  assert.match(sapienRuntime, /provenance:\s*\{[\s\S]*?core,/);
  assert.match(sapienUi, /trackCoreLifecycle\('4sapien','PERSON'/);
});

test("4BRANDS cross-product core adoption remains unclaimed until product authority is reconciled", () => {
  assert.doesNotMatch(brandsRuntime, /corePrimitives/);
  assert.match(brandsRuntime, /identityClient/);
});
