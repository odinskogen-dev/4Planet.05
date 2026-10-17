import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import ts from "typescript";

async function load(path){
 const source=await readFile(new URL(path,import.meta.url),"utf8");
 const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

test("Climate TRACE owner discovery normalises ids but remains review-required",async()=>{
 const m=await load("../functions/api/climate-trace-owners.ts");
 const owner=m.normalizeClimateTraceOwner({id:"owner-17",name:"Example Energy",registration_country:"NO"});
 assert.equal(owner.id,"owner-17");
 assert.equal(owner.name,"Example Energy");
 assert.equal(owner.country,"NO");
 const source=await readFile(new URL("../functions/api/climate-trace-owners.ts",import.meta.url),"utf8");
 assert.match(source,/CANDIDATES_REVIEW_REQUIRED/);
 assert.match(source,/requires explicit user review/);
});

test("shared Climate TRACE source proxy supports ownerIds and emits canonical facility ids",async()=>{
 const source=await readFile(new URL("../functions/api/climate-trace.ts",import.meta.url),"utf8");
 assert.match(source,/ownerIds/);
 assert.match(source,/facility:climatetrace:/);
 assert.match(source,/Owner filtering does not by itself prove a legal-company crosswalk/);
 assert.match(source,/EMPTY_OR_CONTRACT_MISMATCH/);
});

test("shared Climate TRACE proxy keeps missing values unknown without erasing real zeroes",async()=>{
 const m=await load("../functions/api/climate-trace.ts");
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify([
  {id:"missing-coordinate",name:"Missing coordinate",latitude:null,longitude:"",emissionsQuantity:900},
  {id:"missing-emissions-null",name:"Missing emissions null",latitude:"0",longitude:"10",emissionsQuantity:null},
  {id:"missing-emissions-blank",name:"Missing emissions blank",latitude:"1",longitude:"11",emissionsQuantity:""},
  {id:"real-zero",name:"Real zero",latitude:2,longitude:12,emissionsQuantity:0},
  {id:"numeric-string",name:"Numeric string",latitude:"3",longitude:"13",emissionsQuantity:"42.5"},
 ]),{status:200,headers:{"content-type":"application/json"}});

 try{
  const response=await m.onRequestGet({request:new Request("https://test.4planet.org/api/climate-trace?countries=NOR&sectors=power"),env:{CLIMATE_TRACE_BASE:"https://example.test/v7"}});
  assert.equal(response.status,200);
  const body=await response.json();
  assert.equal(body.ok,true);
  assert.deepEqual(body.assets.map((asset)=>asset.id),["missing-emissions-null","missing-emissions-blank","real-zero","numeric-string"]);
  assert.deepEqual(body.assets.map((asset)=>asset.co2e),[null,null,0,42.5]);
  assert.equal(body.assets[0].lat,0,"a real equator coordinate remains valid");
 }finally{
  globalThis.fetch=originalFetch;
 }
});

test("4BRANDS requires user review before fetching owner facilities",async()=>{
 const ui=await readFile(new URL("../src/pages/partners/FourBrand.tsx",import.meta.url),"utf8");
 assert.match(ui,/Find owner candidates/);
 assert.match(ui,/REVIEW THIS OWNER/);
 assert.match(ui,/confirmOwner\(owner\)/);
 assert.match(ui,/not automatically promoted to Company Brain or PLANETBRAIN truth/);
 assert.doesNotMatch(ui,/autoConfirmClimateOwner|autoJoinClimateTraceOwner/);
});

test("ATLAS reuses the same climate-trace endpoint and exposes source identity",async()=>{
 const layers=await readFile(new URL("../src/earth/layers.ts",import.meta.url),"utf8");
 assert.match(layers,/fetch\(\x60\/api\/climate-trace\?/);
 assert.match(layers,/CLIMATE TRACE SOURCE/);
});
