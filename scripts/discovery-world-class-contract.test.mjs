import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(p)=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8");

const map=JSON.parse(read("docs/discovery/HUMAN_FIRST_DISCOVERY_DEMAND_MAP_01.json"));
const master=read("src/pages/labs/DiscoveryMasterGold.tsx");
const router=read("src/routes/router.tsx");
const css=read("src/styles/discovery-master-gold.css");

test("demand map is broad, explicit about evidence limits, and does not invent volume",()=>{
  assert.ok(map.universeCount>=100);
  assert.equal(map.opportunities.length,map.universeCount);
  assert.equal(map.top30.length,30);
  assert.equal(map.top10.length,10);
  assert.deepEqual(map.masterGoldPilots.map((x)=>x.id),["orca","great-barrier-reef","global-fires"]);
  assert.ok(map.methodology.limitations.some((x)=>x.includes("Search Console")));
  assert.ok(map.methodology.limitations.some((x)=>x.includes("keyword-volume")));
  for(const item of map.opportunities) assert.equal(item.exactSearchVolume,"UNKNOWN_NOT_FABRICATED");
});

test("three discovery masters are noindex controlled proofs over existing canonical data",()=>{
  assert.match(router,/path="\/labs\/gold\/discovery\/:slug"/);
  assert.match(master,/noindex,nofollow,noarchive,nosnippet/);
  assert.match(master,/speciesBySlug\("orca"\)/);
  assert.match(master,/planetProofBySlug\("great-barrier-reef"\)/);
  assert.match(master,/atlasDiscovery\.objects\.find\(\(entry\) => entry\.slug === "fires"\)/);
  assert.doesNotMatch(master,/<img[^>]+src=["']https?:\/\//);
});

test("designed non-documentary visuals disclose their status and mobile collapses cleanly",()=>{
  assert.match(master,/DESIGNED ORIENTATION \/ NOT OBSERVATIONAL EVIDENCE/);
  assert.match(master,/DESIGNED SIGNAL FIELD \/ NOT LIVE SATELLITE DATA/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/grid-template-columns:1fr/);
});

test("visible master copy is human-first rather than acquisition jargon",()=>{
  assert.doesNotMatch(master,/keyword stuffing/i);
  assert.doesNotMatch(master,/search volume/i);
  assert.doesNotMatch(master,/AI[- ]generated/i);
  assert.match(master,/Where do Orcas live/);
  assert.match(master,/A reef system is not one number/);
  assert.match(master,/Detected heat is not automatically a wildfire/);
});
