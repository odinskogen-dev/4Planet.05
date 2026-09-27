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
