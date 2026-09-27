import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import ts from "typescript";

async function loadApi(){
  const source=await readFile(new URL("../functions/api/procurement-demand.ts",import.meta.url),"utf8");
  const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

test("TED notice normalization creates source-stable procurement identity without company claim",async()=>{
  const m=await loadApi();
  const row=m.normalizeTedNotice({
    "publication-number":"123456-2026",
    "notice-title":{eng:["Biodiversity monitoring services"]},
    "buyer-name":{eng:["Example Municipality"]},
    "buyer-country":["NOR"],
    "publication-date":"2026-09-20",
    "form-type":"cn-standard",
    "classification-cpv":["90711500"],
  });
  assert.equal(row.id,"procurement:ted:123456-2026");
  assert.equal(row.title,"Biodiversity monitoring services");
  assert.equal(row.buyer,"Example Municipality");
  assert.equal(row.sourceUrl,"https://ted.europa.eu/en/notice/-/detail/123456-2026");
  assert.equal("companyId" in row,false);
  assert.equal("demandValue" in row,false);
});

test("procurement adapter uses official anonymous TED v3 search and truthful boundary",async()=>{
  const source=await readFile(new URL("../functions/api/procurement-demand.ts",import.meta.url),"utf8");
  assert.match(source,/api\.ted\.europa\.eu\/v3\/notices\/search/);
  assert.match(source,/scope:"ACTIVE"/);
  assert.match(source,/buyer-country=/);
  assert.match(source,/not evidence of a sale, award, supplier fit/i);
  assert.match(source,/Doffin-only\/national notices/);
});

test("4BRANDS demand search is user-controlled and never automatic from company sector",async()=>{
  const ui=await readFile(new URL("../src/pages/partners/FourBrand.tsx",import.meta.url),"utf8");
  assert.match(ui,/ProcurementDemandPanel/);
  assert.match(ui,/Search published notices/);
  assert.match(ui,/company sector text is never converted into demand automatically/i);
  assert.doesNotMatch(ui,/autoSearchProcurement|analysis\.company\.sector.*procurement-demand/);
  assert.match(ui,/not a sale, contract award, supplier fit/i);
});
