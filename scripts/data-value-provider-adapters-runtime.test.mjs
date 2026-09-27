import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import ts from "typescript";

async function moduleFrom(path){
  const source=await readFile(new URL(path,import.meta.url),"utf8");
  const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}
const ok=(payload)=>({ok:true,status:200,json:async()=>payload});

test("Matvaretabellen adapter searches generic foods without turning them into branded products",async()=>{
  const m=await moduleFrom("../src/data/providers/matvaretabellenReferenceAdapter.ts");
  const payload={foods:[
    {foodId:"01.001",foodName:"Havregryn",foodGroupId:"6.1",searchKeywords:["havre","gryn"],constituents:[{nutrientId:"Protein",quantity:13}]},
    {foodId:"01.002",foodName:"Havregrøt, kokt",foodGroupId:"6.3",searchKeywords:["havre","grøt"]},
  ]};
  const result=await m.fetchMatvaretabellenReference("havregryn","2026-09-27T19:30:00Z",{fetcher:async(url)=>{assert.equal(String(url),m.MATVARETABELLEN_FOODS_URL);return ok(payload);}});
  assert.equal(result.snapshot.available,true);
  assert.equal(result.matches[0].foodId,"01.001");
  assert.equal(result.scope,"GENERIC_FOOD_COMPOSITION_REFERENCE_NOT_BRANDED_PRODUCT");
  assert.equal(result.attribution,"Matvaretabellen");
});

test("Matvaretabellen malformed/upstream failure fails closed",async()=>{
  const m=await moduleFrom("../src/data/providers/matvaretabellenReferenceAdapter.ts");
  const result=await m.fetchMatvaretabellenReference("havre","2026-09-27T19:30:00Z",{fetcher:async()=>({ok:false,status:503,json:async()=>({})})});
  assert.equal(result.snapshot.available,false);
  assert.equal(result.snapshot.verification,"REVIEW_REQUIRED");
});

test("OpenAlex adapter exposes metadata only and sanitises control characters",async()=>{
  const m=await moduleFrom("../src/data/providers/openAlexWorkAdapter.ts");
  const result=await m.searchOpenAlexWorks("Orcinus orca","2026-09-27T19:30:00Z",{fetcher:async(url)=>{
    assert.match(String(url),/api\.openalex\.org\/works\?/);
    return ok({results:[{id:"https://openalex.org/W123",doi:"https://doi.org/10.1/test",title:"Orca\u0000 ecology",publication_year:2026,publication_date:"2026-08-01",type:"article",cited_by_count:3,primary_location:{source:{display_name:"Journal"}},open_access:{is_oa:true,oa_status:"gold"},abstract_inverted_index:{do:"not expose"}}]});
  }});
  assert.equal(result.works.length,1);
  assert.equal(result.works[0].title,"Orca ecology");
  assert.equal("abstract" in result.works[0],false);
  assert.match(result.rights,/METADATA_CC0/);
});

test("GloBI adapter keeps study provenance and stays review-gated",async()=>{
  const m=await moduleFrom("../src/data/providers/globiInteractionAdapter.ts");
  const result=await m.fetchGlobiInteractions("Orcinus orca","2026-09-27T19:30:00Z",{fetcher:async(url)=>{
    assert.match(String(url),/sourceTaxon=Orcinus\+orca/);
    return ok([{source_taxon_name:"Orcinus orca",interaction_type:"eats",target_taxon_name:"Clupea harengus",study_citation:"Example study",study_external_id:"doi:10.x/test",study_source_citation:"Dataset citation"}]);
  }});
  assert.equal(result.interactions[0].targetTaxonName,"Clupea harengus");
  assert.equal(result.interactions[0].studyExternalId,"doi:10.x/test");
  assert.equal(result.snapshot.verification,"REVIEW_REQUIRED");
  assert.match(result.rights,/ORIGINAL_DATASET_PROVENANCE_REQUIRED/);
});
