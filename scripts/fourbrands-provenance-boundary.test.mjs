import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { bindBrregIdentity, companyIdentityMatches, markIdentityUnknown, normaliseOrganisationNumber } from "../functions/_shared/fourbrands-provenance.mjs";

const base=()=>({
  company:{name:"TOMRA",legalName:"TOMRA Systems ASA"},
  statusNote:"Public evidence only.",
  evidence:[{id:"S1",title:"Existing",publisher:"TOMRA",url:"https://www.tomra.com",checkedAt:"2026-09-16",note:"Primary"}],
  unknowns:[]
});

test("ordinary nine-digit organisation number is accepted; malformed and old exploit strings are rejected",()=>{
  assert.equal(normaliseOrganisationNumber("923003789"),"923003789");
  assert.equal(normaliseOrganisationNumber("923 003 789"),"923003789");
  assert.equal(normaliseOrganisationNumber("12345678"),null);
  assert.equal(normaliseOrganisationNumber("\\ddddddddd"),null);
  assert.equal(normaliseOrganisationNumber("1234567890"),null);
});

test("legal company mismatch cannot be bound as authoritative identity",()=>{
  const result=bindBrregIdentity(base(),{
    organizationNumber:"987654321",
    entityName:"APPLE NORWAY AS",
    sourceUrl:"https://data.brreg.no/enhetsregisteret/api/enheter/987654321",
    observedAt:"2026-10-01T12:00:00.000Z"
  },"TOMRA");
  assert.equal(result.state,"COMPANY_IDENTITY_MISMATCH");
  assert.equal(result.analysis.company.identityState,"UNKNOWN");
  assert.equal(result.analysis.evidence.some(x=>x.id==="BRREG-LEGAL-IDENTITY"),false);
});

test("server-resolved matching BRREG record is the only identity evidence promoted",()=>{
  assert.equal(companyIdentityMatches("TOMRA SYSTEMS ASA",{name:"TOMRA",legalName:"TOMRA Systems ASA"},"TOMRA"),true);
  const result=bindBrregIdentity(base(),{
    organizationNumber:"976881290",
    entityName:"TOMRA SYSTEMS ASA",
    sourceUrl:"https://data.brreg.no/enhetsregisteret/api/enheter/976881290",
    observedAt:"2026-10-01T12:00:00.000Z"
  },"TOMRA");
  assert.equal(result.state,"EXACT_BRREG_IDENTITY");
  assert.equal(result.analysis.company.organizationNumber,"976881290");
  const source=result.analysis.evidence.find(x=>x.id==="BRREG-LEGAL-IDENTITY");
  assert.equal(source.publisher,"Brønnøysundregistrene");
  assert.equal(source.url,"https://data.brreg.no/enhetsregisteret/api/enheter/976881290");
  assert.equal(source.provenanceState,"SERVER_RESOLVED_PROVIDER_RECORD");
});

test("provider failure remains UNKNOWN and does not fabricate evidence",()=>{
  const result=markIdentityUnknown(base(),"SOURCE_UNAVAILABLE");
  assert.equal(result.company.identityState,"UNKNOWN");
  assert.equal(result.evidence.length,1);
  assert.match(result.unknowns.at(-1),/UNKNOWN/);
});

test("brand-analysis never promotes caller-provided legal name, state, LEI or evidence URLs",()=>{
  const source=readFileSync(new URL("../functions/api/brand-analysis.ts",import.meta.url),"utf8");
  for(const forbidden of ["identity.legalName","identity.identityState","identity.lei","identity.brregSourceUrl","identity.gleifSourceUrl"]){
    assert.equal(source.includes(forbidden),false,`forbidden trust path remains: ${forbidden}`);
  }
  assert.match(source,/fetchBrregExact/);
  assert.match(source,/bindBrregIdentity/);
});
