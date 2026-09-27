import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import ts from "typescript";

async function loadApi(){
  const source=await readFile(new URL("../functions/api/food-reference.ts",import.meta.url),"utf8");
  const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

test("Matvaretabellen reference search returns source-linked generic nutrition without branded identity",async()=>{
  const m=await loadApi();
  const payload={foods:[
    {foodId:"06.178",foodName:"Havregryn",foodGroupId:"6.1",searchKeywords:["havre"],calories:{quantity:369,unit:"kcal",sourceId:"SRC-E"},constituents:[
      {nutrientId:"Protein",quantity:13,unit:"g",sourceId:"SRC-P"},
      {nutrientId:"Fiber",quantity:10,unit:"g",sourceId:"SRC-F"},
      {nutrientId:"NaCl",quantity:.01,unit:"g",sourceId:"SRC-S"}
    ]},
    {foodId:"06.179",foodName:"Havregrøt, kokt",foodGroupId:"6.3",searchKeywords:["havre"]}
  ]};
  const rows=m.searchMatvaretabellen(payload,"havregryn",8);
  assert.equal(rows[0].foodId,"06.178");
  assert.equal(rows[0].nutritionPer100.protein.quantity,13);
  assert.equal(rows[0].nutritionPer100.protein.sourceId,"SRC-P");
  assert.equal("gtin" in rows[0],false);
  assert.equal("brand" in rows[0],false);
});

test("FOOD UI requires explicit user-confirmed generic reference and local-only return boundary",async()=>{
  const ui=await readFile(new URL("../src/food/FoodIntelligence.tsx",import.meta.url),"utf8");
  assert.match(ui,/USER_CONFIRMED_GENERIC_REFERENCE/);
  assert.match(ui,/No result is selected automatically/);
  assert.match(ui,/not Personal Brain or shared PLANETBRAIN truth/);
  assert.match(ui,/GenericFoodReferencePanel product=\{result\.product\}/);
  assert.doesNotMatch(ui,/autoConfirmGeneric|autoJoinMatvaretabellen/);
});

test("reference gateway uses official foods endpoint, bounded edge cache and truthful scope",async()=>{
  const source=await readFile(new URL("../functions/api/food-reference.ts",import.meta.url),"utf8");
  assert.match(source,/matvaretabellen\.mattilsynet\.io\/api\/nb\/foods\.json/);
  assert.match(source,/CACHE_SECONDS = 60 \* 60 \* 24 \* 30/);
  assert.match(source,/GENERIC_FOOD_COMPOSITION_REFERENCE_NOT_BRANDED_PRODUCT/);
  assert.match(source,/user must explicitly confirm/i);
  assert.match(source,/attribution:"Matvaretabellen"/);
});
