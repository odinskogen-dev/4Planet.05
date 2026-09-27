import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=(path)=>readFile(new URL("../"+path,import.meta.url),"utf8");

test("Matvaretabellen source gate carries exact citation, cache and generic-object boundary",async()=>{
  const s=await read("functions/api/food-reference.ts");
  for(const needle of ["Matvaretabellen 2026. Mattilsynet. www.matvaretabellen.no","30-day edge cache","commercialReuse","redistribution","accessCost","rateLimit","generic-food:matvaretabellen:<foodId>"]) assert.ok(s.includes(needle),needle);
});

test("company identity source gate records BRREG NLOD 2.0 and GLEIF CC0 with no fuzzy canonical join",async()=>{
  const s=await read("functions/api/company-identity.ts");
  for(const needle of ["NLOD 2.0","CC0 1.0","PERMITTED_WITH_NLOD_CONDITIONS","PERMITTED_CC0","EXACT_REGISTERED_AS_EQUALS_BRREG_ORGNR","NO_AUTOMATIC_JOIN"]) assert.ok(s.includes(needle),needle);
});

test("Climate TRACE separates core emissions reuse from mixed upstream owner rights",async()=>{
  const [emissions,owners]=await Promise.all([read("functions/api/climate-trace.ts"),read("functions/api/climate-trace-owners.ts")]);
  assert.match(emissions,/CC BY 4\.0 for Climate TRACE emissions data\/metadata/);
  assert.match(emissions,/external-dataset exceptions/);
  assert.match(owners,/MIXED_UPSTREAM_OWNERSHIP_SOURCES_REVIEW_REQUIRED/);
  assert.match(owners,/REVIEW_UPSTREAM_OWNERSHIP_SOURCE_TERMS/);
});

test("TED, Stortinget and SSB carry explicit reuse, access and rate boundaries",async()=>{
  const [ted,stortinget,ssb]=await Promise.all([read("functions/api/procurement-demand.ts"),read("functions/api/nation-cases.ts"),read("functions/api/statbank-context.ts")]);
  assert.match(ted,/commercialReuse:"PERMITTED_UNLESS_OTHERWISE_NOTED"/);
  assert.match(ted,/SIMAP metadata CC0/);
  assert.match(stortinget,/PERMITTED_UNDER_NLOD_WITH_ATTRIBUTION_AND_NO_MISLEADING_PRESENTATION/);
  assert.match(stortinget,/100 API calls\/minute/);
  assert.match(ssb,/CC BY 4\.0/);
  assert.match(ssb,/800000 data cells/);
  assert.match(ssb,/30 queries\/minute/);
});
