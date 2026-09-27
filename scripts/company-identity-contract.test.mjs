import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import ts from "typescript";

async function loadShared(){
  const source=await readFile(new URL("../products/4sapien/supabase/functions/_shared/brreg.ts",import.meta.url),"utf8");
  const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}
const ok=(payload)=>({ok:true,status:200,json:async()=>payload});

test("one shared BRREG provider normalizes search and exact identity",async()=>{
  const m=await loadShared();
  const search=await m.searchBrregByName("TOMRA",{fetcher:async(url)=>{
    assert.match(String(url),/enheter\?navn=TOMRA/);
    return ok({_embedded:{enheter:[{organisasjonsnummer:"976500198",navn:"TOMRA SYSTEMS ASA",organisasjonsform:{kode:"ASA"}}]}});
  }});
  assert.equal(search[0].organizationNumber,"976500198");
  assert.equal(search[0].sourceLicense,"NLOD 2.0");

  const exact=await m.fetchBrregExact("976500198",{fetcher:async()=>ok({organisasjonsnummer:"976500198",navn:"TOMRA SYSTEMS ASA"})});
  assert.equal(exact.entityName,"TOMRA SYSTEMS ASA");
});

test("BRREG exact lookup fails closed on identity mismatch",async()=>{
  const m=await loadShared();
  await assert.rejects(
    ()=>m.fetchBrregExact("976500198",{fetcher:async()=>ok({organisasjonsnummer:"999999999",navn:"WRONG ENTITY"})}),
    /different organisation number/i
  );
});

test("4BRANDS requires user legal-entity selection before Norwegian identity join",async()=>{
  const ui=await readFile(new URL("../src/pages/partners/FourBrand.tsx",import.meta.url),"utf8");
  assert.match(ui,/Which legal entity do you mean\?/);
  assert.match(ui,/Name search is discovery only/);
  assert.match(ui,/confirmIdentity\(candidate\)/);
  assert.match(ui,/continueWithoutNorwegianIdentity/);
  assert.doesNotMatch(ui,/autoSelectBrreg|firstCandidate.*analyseResolved/);
});

test("GLEIF is optional and only exact registeredAs crosswalk is auto-accepted",async()=>{
  const api=await readFile(new URL("../functions/api/company-identity.ts",import.meta.url),"utf8");
  assert.match(api,/exact\.length===1\?"EXACT_REGISTRATION_ID"/);
  assert.match(api,/registeredAs===entity\.organizationNumber/);
  assert.match(api,/NO_AUTOMATIC_JOIN/);
  assert.match(api,/license:"CC0"/);
});
