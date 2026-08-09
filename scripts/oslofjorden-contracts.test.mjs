import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const data = read("src/data/oslofjordenProof.ts");
const model = read("src/planet/placeModel.ts");
const page = read("src/pages/phase04/OslofjordenJourney.tsx");
const front = read("src/pages/phase04/FrontDoor.tsx");
const validation = read("src/pages/phase04/OslofjordenValidation.tsx");
const router = read("src/routes/router.tsx");

test("Oslofjorden semantic identity stays separate from query and display geometry", () => {
  assert.match(data, /place:marine-regions:3379/);
  assert.match(data, /MRGID 3379/);
  assert.match(model, /"DISPLAY"/);
  assert.match(model, /"QUERY"/);
  assert.match(model, /"WATERBODY"/);
  assert.match(model, /"REGULATORY"/);
  assert.match(data, /id: "oslofjord-display"[\s\S]*availability: "NOT_SELECTED"/);
  assert.match(data, /id: "oslofjord-query"[\s\S]*availability: "NOT_SELECTED"/);
  assert.match(data, /id: "oslofjord-regulatory-fisheries"[\s\S]*SOURCE_AVAILABLE_NOT_INGESTED/);
  assert.doesNotMatch(data, /id: "oslofjord-query"[\s\S]{0,400}availability: "INGESTED"/);
});

test("real LIFE proof uses bounded survey evidence and exposes uncertainty", () => {
  for (const token of ["Sprattus sprattus", "Clupea harengus", "Engraulis encrasicolus", "Zostera marina"]) assert.match(data, new RegExp(token));
  for (const value of ["261 million", "75 million", "50 million", "2,971 tonnes", "2,718 tonnes", "196 tonnes"]) assert.ok(data.includes(value), value);
  assert.match(data, /90% CI 190–334 million/);
  assert.match(data, /Survey estimate/);
  assert.match(data, /not a live count/i);
  assert.match(data, /few positions in Oslofjord are trawlable/i);
});

test("pressure intelligence is multi-causal and scoped", () => {
  for (const id of ["pressure-nitrogen", "pressure-agriculture-wastewater", "pressure-oxygen", "pressure-fisheries", "pressure-habitat"]) assert.ok(data.includes(id), id);
  assert.match(data, /30–40%/);
  assert.match(data, /one profile at one place\/time/i);
  assert.match(page, /There is no single cause/);
});

test("relationship chain distinguishes documented evidence from 4PLANET context", () => {
  assert.match(data, /rel-human[\s\S]*grade: "4PLANET_CONTEXT"/);
  assert.match(data, /rel-eelgrass-life[\s\S]*grade: "DOCUMENTED"/);
  assert.match(page, /mark the weak link/i);
});

test("Signals are real source events, not generic news or ecological outcome claims", () => {
  for (const id of ["signal-plan-hearing-2026", "signal-fisheries-2026", "signal-pelagic-survey-2026", "signal-nitrogen-model-2026"]) assert.ok(data.includes(id), id);
  assert.match(data, /consultation closes 15 Sep 2026/i);
  assert.match(data, /policy decision is not an ecological outcome/i);
  assert.match(data, /One survey year is not a long-term trend/i);
});

test("actors never become partners and solutions never become verified outcomes by existence", () => {
  assert.match(data, /relationship: "ACTOR_ONLY"/);
  assert.match(data, /No 4PLANET partnership is implied/);
  assert.match(data, /Funding and modelled potential are not verified ecological outcomes/);
  assert.match(data, /Active regulation is an intervention state, not evidence of ecological recovery/);
});

test("one real time-bounded public action exists without an impact promise", () => {
  assert.match(data, /action-plan-consultation-2026/);
  assert.match(data, /status: "OPEN_NOW"/);
  assert.match(data, /deadline: "2026-09-15"/);
  assert.match(data, /anyone may comment|anyone may submit|anyone may/i);
  assert.match(data, /does not claim that one response will change policy or improve ecological condition/i);
  assert.match(page, /One credible action is better than ten generic buttons/);
});

test("Oslofjorden hero cannot imply non-local whale evidence while the real local hero is missing", () => {
  assert.match(page, /img\("heroEarth"\)/);
  assert.doesNotMatch(page, /img\("oce4nDomainHero"\)/);
  assert.match(page, /NASA PUBLIC-DOMAIN FRAME/);
  assert.match(page, /NOT OSLOFJORDEN LOCATION EVIDENCE/);
  assert.match(page, /REAL OSLOFJORDEN HERO ASSET STILL REQUIRED/);
});

test("front door now exposes real Oslofjord LIFE evidence without calling it live data", () => {
  assert.match(front, /261 million/);
  assert.match(front, /75 million/);
  assert.match(front, /50 million/);
  assert.match(front, /Survey estimate with uncertainty/);
  assert.doesNotMatch(front, /LIVE DATA/);
});

test("human validation route is local-only and does not claim results", () => {
  assert.match(router, /\/labs\/oslofjorden-validation/);
  assert.match(validation, /localStorage/);
  assert.match(validation, /HUMAN RESULTS NOT RUN BY 4PLANET/);
  assert.match(validation, /does not create an account or send results to 4PLANET/);
  assert.match(validation, /EXPORT JSON/);
  assert.match(validation, /DELETE LOCAL TEST DATA/);
  assert.doesNotMatch(validation, /fetch\(/);
});

test("product leaves higher proof states absent until real evidence exists", () => {
  assert.match(page, /No Oslofjorden Partner Report, Assessed Outcome or Verified Outcome is claimed/);
  assert.doesNotMatch(data, /relationship: "PARTNER"/);
  assert.doesNotMatch(data, /VERIFIED OUTCOME/);
});
