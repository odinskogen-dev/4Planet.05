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
  {id:"malformed-emissions-boolean",name:"Malformed emissions boolean",latitude:1.5,longitude:11.5,emissionsQuantity:false},
  {id:"malformed-emissions-array",name:"Malformed emissions array",latitude:1.6,longitude:11.6,emissionsQuantity:[]},
  {id:"malformed-coordinate-boolean",name:"Malformed coordinate boolean",latitude:false,longitude:12,emissionsQuantity:1},
  {id:"malformed-coordinate-array",name:"Malformed coordinate array",latitude:[],longitude:12,emissionsQuantity:1},
  {id:"malformed-coordinate-object",name:"Malformed coordinate object",latitude:{},longitude:12,emissionsQuantity:1},
  {id:"latitude-out-of-range",name:"Latitude out of range",latitude:90.0001,longitude:12,emissionsQuantity:1},
  {id:"longitude-out-of-range",name:"Longitude out of range",latitude:2,longitude:-180.0001,emissionsQuantity:1},
  {id:"real-zero",name:"Real zero",latitude:2,longitude:12,emissionsQuantity:0},
  {id:"numeric-string",name:"Numeric string",latitude:"3",longitude:"13",emissionsQuantity:"42.5"},
  {id:"boundary-coordinates",name:"Boundary coordinates",latitude:"-90",longitude:"180",emissionsQuantity:"1e2"},
 ]),{status:200,headers:{"content-type":"application/json"}});

 try{
  const response=await m.onRequestGet({request:new Request("https://test.4planet.org/api/climate-trace?countries=NOR&sectors=power"),env:{CLIMATE_TRACE_BASE:"https://example.test/v7"}});
  assert.equal(response.status,200);
  const body=await response.json();
  assert.equal(body.ok,true);
  assert.deepEqual(body.assets.map((asset)=>asset.id),[
   "missing-emissions-null","missing-emissions-blank","malformed-emissions-boolean",
   "malformed-emissions-array","real-zero","numeric-string","boundary-coordinates",
  ]);
  assert.deepEqual(body.assets.map((asset)=>asset.co2e),[null,null,null,null,0,42.5,100]);
  assert.equal(body.assets[0].lat,0,"a real equator coordinate remains valid");
  const boundary=body.assets.find((asset)=>asset.id==="boundary-coordinates");
  assert.equal(boundary.lat,-90);
  assert.equal(boundary.lon,180);
 }finally{
  globalThis.fetch=originalFetch;
 }
});

test("shared Climate TRACE proxy never advertises reusable caching for failures",async()=>{
 const m=await load("../functions/api/climate-trace.ts");
 const originalFetch=globalThis.fetch;
 const steps=[
  async()=>new Response("upstream unavailable",{status:503}),
  async()=>new Response(JSON.stringify([]),{status:200,headers:{"content-type":"application/json"}}),
  async()=>new Response(JSON.stringify([{id:"unmappable",latitude:null,longitude:""}]),{status:200,headers:{"content-type":"application/json"}}),
  async()=>{throw new Error("network unavailable");},
  async()=>new Response(JSON.stringify([{id:"recovered",latitude:59.91,longitude:10.75,emissionsQuantity:0}]),{status:200,headers:{"content-type":"application/json"}}),
 ];
 globalThis.fetch=async(...args)=>steps.shift()(...args);

 try{
  const request=()=>m.onRequestGet({request:new Request("https://test.4planet.org/api/climate-trace?countries=NOR&sectors=power"),env:{CLIMATE_TRACE_BASE:"https://example.test/v7"}});
  for(const expectedError of ["UPSTREAM_503","EMPTY_OR_CONTRACT_MISMATCH","NO_MAPPABLE_COORDINATES","network unavailable"]){
   const response=await request();
   assert.equal(response.status,502);
   assert.equal(response.headers.get("cache-control"),"no-store");
   assert.match((await response.json()).error,new RegExp(expectedError));
  }

  const recovered=await request();
  assert.equal(recovered.status,200);
  assert.equal(recovered.headers.get("cache-control"),"public, max-age=3600");
  const recoveredBody=await recovered.json();
  assert.equal(recoveredBody.assets[0].id,"recovered");
  assert.match(recoveredBody.sourceMeta.cachePolicy,/failures are no-store/);
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
