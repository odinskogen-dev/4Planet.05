import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import ts from "typescript";

async function loadApi(){
 const source=await readFile(new URL("../functions/api/nation-cases.ts",import.meta.url),"utf8");
 const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

test("Stortinget case adapter preserves source id and status without policy verdict",async()=>{
 const m=await loadApi();
 const row=m.normalizeStortingCase({id:"12345",tittel:"Tiltak for Oslofjorden",status:"til_behandling",type:"alminneligsak",dokumentgruppe:"melding",sist_oppdatert_dato:"/Date(1790452800000+0200)/",komite:{navn:"Energi- og miljøkomiteen"}});
 assert.equal(row.id,"public-decision:stortinget:12345");
 assert.equal(row.status,"til_behandling");
 assert.equal(row.committee,"Energi- og miljøkomiteen");
 assert.match(row.sourceUrl,/sakid=12345/);
 assert.equal("recommendation" in row,false);
});

test("Stortinget gateway is cached, attributed and explicitly bounded",async()=>{
 const source=await readFile(new URL("../functions/api/nation-cases.ts",import.meta.url),"utf8");
 assert.match(source,/data\.stortinget\.no\/eksport\/saker\?format=JSON/);
 assert.match(source,/CACHE_SECONDS=600/);
 assert.match(source,/license:"NLOD"/);
 assert.match(source,/100 API calls\/minute/);
 assert.match(source,/does not rank, recommend or infer political positions/);
});

test("4NATION finder remains neutral and does not replace the curated case",async()=>{
 const page=await readFile(new URL("../src/pages/nation/NationPage.tsx",import.meta.url),"utf8");
 assert.match(page,/LiveStortingCaseFinder/);
 assert.match(page,/does not rank policy choices/);
 assert.match(page,/current parliamentary session only/i);
 assert.match(page,/Proposal, not an adopted plan/);
 assert.match(page,/NOT A NATIONAL FEED/);
});
