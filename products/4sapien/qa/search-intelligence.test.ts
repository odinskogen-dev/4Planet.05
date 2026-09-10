import assert from "node:assert/strict";
import fs from "node:fs";
import { rankByIntent, relevanceFor } from "../supabase/functions/embla-products/core/relevance.ts";
import { compareHealth, healthEvidence } from "../supabase/functions/embla-products/core/health.ts";
import { resolveStoreFamily, storeCodeMatches } from "../supabase/functions/embla-products/core/store.ts";

const no = ["en:norway"];
const p=(name:string, extra:any={})=>({product_name_nb:name,countries_tags:no,...extra});
const band=(x:any)=>x.embla_relevance_band==="DIRECT"?2:x.embla_relevance_band==="RELATED"?1:0;

// Founder/user-test regression: a normal Norwegian query for skinke must prefer actual ham/cold-cut products.
const hamPool=[
  p("Kokt skinke",{nutriscore_grade:"c",nova_group:3}),
  p("Skinkepålegg",{nutriscore_grade:"b",nova_group:4}),
  p("Røkt skinke",{nutriscore_grade:"d",nova_group:3}),
  p("Peppes skinkepizza",{nutriscore_grade:"a",nova_group:4}),
  p("Pizza med skinke",{nutriscore_grade:"a",nova_group:3}),
  p("Pastasalat med skinke",{nutriscore_grade:"a",nova_group:2}),
];
const ranked=rankByIntent(hamPool,"skinke");
assert.equal(ranked[0].embla_relevance_band,"DIRECT");
assert.ok(ranked.slice(0,3).every(x=>!String(x.product_name_nb).toLowerCase().includes("pizza")),"pizza leaked into top direct ham results");
assert.equal(relevanceFor(p("Pizza med skinke"),"skinke").band,"RELATED");
assert.equal(relevanceFor(p("Peppes skinkepizza"),"skinke").band,"RELATED");
assert.equal(relevanceFor(p("Kokt skinke"),"skinke").band,"DIRECT");
assert.equal(relevanceFor(p("Skinkepålegg"),"skinke").band,"DIRECT");

// Health lens is allowed to optimize only after intent. An A-rated pizza cannot outrank direct skinke.
const healthRank=[...ranked].sort((a,b)=>band(b)-band(a) || compareHealth(a,b) || (b.embla_relevance-a.embla_relevance));
assert.equal(healthRank[0].embla_relevance_band,"DIRECT");
assert.ok(!String(healthRank[0].product_name_nb).toLowerCase().includes("pizza"));

// Within the same relevant product class, stronger nutrition evidence can rank higher.
const sameIntent=[
  {...p("Kokt skinke original"),nutriscore_grade:"d",nova_group:4},
  {...p("Kokt skinke lett"),nutriscore_grade:"b",nova_group:3},
].map(x=>({...x,...(()=>{const r=relevanceFor(x,"skinke");return {embla_relevance:r.score,embla_relevance_band:r.band};})()}));
sameIntent.sort((a,b)=>band(b)-band(a)||compareHealth(a,b));
assert.equal(sameIntent[0].product_name_nb,"Kokt skinke lett");

const h=healthEvidence({nutriscore_grade:"b",nova_group:4,nutriments:{sugars_100g:2,salt_100g:1.5,fiber_100g:0}});
assert.ok(h.signals.some(s=>s.kind==="nutri"));
assert.ok(h.signals.some(s=>s.kind==="nova"));
assert.ok(h.signals.some(s=>s.kind==="salt"));
assert.notEqual(h.nutritionRank,h.processingRank,"nutrition and processing must stay separate signals");

// Store-family normalization is chain-aware but does not claim stock.
assert.equal(resolveStoreFamily("Rema 1000")?.id,"REMA_1000");
assert.equal(resolveStoreFamily("Coop")?.id,"COOP");
assert.ok(storeCodeMatches("Coop","COOP_EXTRA"));
assert.ok(storeCodeMatches("Meny","MENY_NO"));
assert.ok(storeCodeMatches("Oda","ODA_NO"));
assert.ok(storeCodeMatches("Bunnpris","BUNNPRIS"));
assert.ok(!storeCodeMatches("KIWI","REMA_1000"));

const gold=JSON.parse(fs.readFileSync(new URL("./search-gold.json",import.meta.url),"utf8"));
assert.ok(Array.isArray(gold.queries));
assert.ok(gold.queries.length>=100,`Search Gold too small: ${gold.queries.length}`);
assert.ok(gold.queries.includes("skinke"));
assert.ok(gold.queries.includes("havregryn"));
assert.ok(gold.queries.includes("laks"));

console.log(`SEARCH_INTELLIGENCE_02_FOUNDATION PASS · ${gold.queries.length} Norwegian gold queries · skinke regression PASS · health intent gate PASS · store mapping PASS`);
