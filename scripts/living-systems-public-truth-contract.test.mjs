import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path, import.meta.url),"utf8");
test("public Living Systems species never present unsourced generic multi-hop causation",()=>{
  const page=read("products/livingsystems/src/app/species/[slug]/page.tsx");
  const chain=read("products/livingsystems/src/components/RelationshipChain.tsx");
  const graph=read("products/livingsystems/src/lib/graph.ts");
  const claims=read("products/livingsystems/src/data/claims.ts");
  assert.match(chain,/resolveFunctionChains\(species\)/);
  assert.match(graph,/export function failureCascade/);
  assert.match(claims,/reviewStatus: "Reviewed"/);
  assert.doesNotMatch(page, /<RelationshipChain\b/);
  assert.doesNotMatch(page, /<FailureCascade\b/);
  assert.match(page,/We do not yet present modelled multi-step pathways as established/);
  assert.match(page,/href="\/trust"/);
  assert.match(page,/<NodeEvidence nodeId=\{s\.id\}/);
  assert.match(page,/<SpeciesThreatMatrix threats=\{s\.threats\}/);
  assert.match(page,/<SpeciesSolutionMatrix solutions=\{s\.solutions\}/);
});

test("seeded Atlantic cod pressure edge preserves stock-specific 2026 source boundaries", () => {
  const src = read("src/planet/livingSystems.ts");
  const match = src.match(/id: "r-overexploit-affects-cod",[\\s\\S]*?reviewStatus: "UNREVIEWED",/);
  assert.ok(match, "Atlantic cod pressure edge must remain present");
  const edge = match[0];
  assert.match(edge, /1992 moratorium/);
  assert.match(edge, /NAFO 2J3KL/);
  assert.match(edge, /Healthy Zone as of DFO 12 June 2026/);
  assert.match(edge, /3Pn4RS/);
  assert.match(edge, /Critical Zone/);
  assert.match(edge, /canada\\.ca\\/en\\/fisheries-oceans\\/news\\/2026\\/06/);
  assert.match(edge, /not species-wide or proof of pre-collapse biomass recovery/);
  assert.match(edge, /reviewStatus: "UNREVIEWED"/);
  assert.doesNotMatch(edge, /The stock has still not recovered/);
});
