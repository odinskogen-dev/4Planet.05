import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import ts from "typescript";

async function loadApi(){
 const source=await readFile(new URL("../functions/api/statbank-context.ts",import.meta.url),"utf8");
 const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

test("SSB table normalization creates stable statistical-table identity",async()=>{
 const m=await loadApi();
 const row=m.normalizeSsbTable({id:"05810",label:"05810: Population, by sex and age",updated:"2026-02-25T07:00:00Z",firstPeriod:"1845",lastPeriod:"2026",variableNames:["kjønn","alder","innhold","år"],source:"Statistisk sentralbyrå"});
 assert.equal(row.id,"statistical-table:ssb:05810");
 assert.equal(row.tableId,"05810");
 assert.equal(row.lastPeriod,"2026");
 assert.match(row.sourceUrl,/tables\/05810\?lang=no/);
});

test("SSB adapter uses PxWebApi v2, caches and keeps causal boundary explicit",async()=>{
 const source=await readFile(new URL("../functions/api/statbank-context.ts",import.meta.url),"utf8");
 assert.match(source,/data\.ssb\.no\/api\/pxwebapi\/v2/);
 assert.match(source,/CACHE_SECONDS=900/);
 assert.match(source,/license:"CC BY 4.0"/);
 assert.match(source,/Statistical association is not causal evidence for a policy outcome/);
 assert.match(source,/30 queries\/minute/);
});

test("4NATION SSB surface requires explicit table selection and does not auto-bind stats to a decision",async()=>{
 const page=await readFile(new URL("../src/pages/nation/NationPage.tsx",import.meta.url),"utf8");
 assert.match(page,/StatbankContextFinder/);
 assert.match(page,/Find official tables/);
 assert.match(page,/openTable\(table\)/);
 assert.match(page,/does not pick the statistic for you or treat correlation as policy causation/);
 assert.doesNotMatch(page,/autoSelectSsb|autoBindStatisticToDecision/);
});
