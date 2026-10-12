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

test("SSB cells retain per-ContentsCode units, precision, reference period and missing-value status",async()=>{
 const m=await loadApi();
 const dataset={role:{time:["Tid"],metric:["ContentsCode"]},id:["Region","ContentsCode","Tid"],size:[1,2,2],dimension:{
  Region:{label:"region",category:{index:{"0301":0},label:{"0301":"Oslo"}}},
  ContentsCode:{label:"contents",category:{index:{Persons:0,Share:1},label:{Persons:"Persons",Share:"Share"},unit:{Persons:{base:"number",decimals:0},Share:{base:"percent",decimals:1}},note:{Share:["Rounded to one decimal place."]}},extension:{refperiod:{Persons:"1 January",Share:"calendar year"}}},
  Tid:{label:"year",category:{index:{"2025":0,"2026":1},label:{"2025":"2025","2026":"2026"}}},
 },note:["Dataset-level footnote."],value:[720000,725000,42.1,null],status:{3:".."}};
 const normalized=m.normalizeSsbDataset(dataset,24);
 assert.equal(normalized.totalCellCount,4);
 assert.equal(normalized.returnedCellCount,4);
 assert.equal(normalized.truncated,false);
 assert.deepEqual(normalized.footnotes,["Dataset-level footnote."]);
 assert.deepEqual(normalized.cells.map(cell=>[cell.value,cell.unit,cell.decimals,cell.referencePeriod,cell.status]),[
  [720000,"number",0,"1 January",null],[725000,"number",0,"1 January",null],[42.1,"percent",1,"calendar year",null],[null,"percent",1,"calendar year",".."],
 ]);
 assert.deepEqual(normalized.cells[2].footnotes,["Rounded to one decimal place."]);
});

test("SSB adapter discloses the bounded 24-cell preview and UI never renders a bare value",async()=>{
 const m=await loadApi();
 const dataset={role:{metric:["ContentsCode"]},id:["ContentsCode","Tid"],size:[1,25],dimension:{
  ContentsCode:{category:{index:{Persons:0},label:{Persons:"Persons"},unit:{Persons:{base:"people",decimals:0}}},extension:{refperiod:{Persons:"year end"}}},
  Tid:{category:{index:Object.fromEntries(Array.from({length:25},(_,i)=>[String(2000+i),i]))}},
 },value:Array.from({length:25},(_,i)=>i)};
 const normalized=m.normalizeSsbDataset(dataset,24);
 assert.equal(normalized.totalCellCount,25);
 assert.equal(normalized.returnedCellCount,24);
 assert.equal(normalized.truncated,true);
 const page=await readFile(new URL("../src/pages/nation/NationPage.tsx",import.meta.url),"utf8");
 assert.match(page,/24-cell preview/);
 assert.match(page,/formatSsbValue/);
 assert.match(page,/UNKNOWN UNIT/);
 assert.match(page,/aria-label=.*reference period/i);
});
