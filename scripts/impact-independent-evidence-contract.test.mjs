import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

test("Bay Action Contract attaches OBIS context and keeps independent delivery MRV open",async()=>{
  const source=await readFile(new URL("../src/impact/actionContract.ts",import.meta.url),"utf8");
  assert.match(source,/evidence-source:obis:cetacea:bay-of-biscay:v1/);
  assert.match(source,/relationship: "CONTEXT_ONLY"/);
  assert.match(source,/state: "CONNECTED"/);
  assert.match(source,/independent-survey-effort-mrv:bay-of-biscay:v1/);
  assert.match(source,/relationship: "DELIVERY_LINKED"/);
  assert.match(source,/state: "NOT_CONNECTED"/);
  assert.match(source,/Occurrence records are not abundance, population trend, live position or proof of ecological change/);
});

test("IMPACT exposes the Action Contract evidence relationships without inventing a verifier",async()=>{
  const page=await readFile(new URL("../src/pages/integrated/ImpactActionProof.tsx",import.meta.url),"utf8");
  assert.match(page,/INDEPENDENT EVIDENCE RELATIONSHIPS/);
  assert.match(page,/OPEN BOUNDED SOURCE DATA/);
  assert.match(page,/MRV GAP REMAINS OPEN/);
});

test("Proof Passport VERIFIED requires explicitly impact-linked third-party verification",async()=>{
  const source=await readFile(new URL("../src/impact/proofPassport.ts",import.meta.url),"utf8");
  assert.match(source,/ProofEvidenceRelationship/);
  assert.match(source,/item\.relationship === "IMPACT_LINKED"/);
  assert.match(source,/verified_without_impact_linked_third_party_verification/);
});
