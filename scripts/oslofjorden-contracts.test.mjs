import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const data = read("src/data/oslofjordenProof.ts");
const media = read("src/data/oslofjordenMedia.ts");
const datasets = read("src/data/oslofjordenDatasets.ts");
const places = read("src/data/oslofjordenPlaces.ts");
const relationshipDeepening = read("src/data/oslofjordenRelationshipDeepening.ts");
const relationshipComponent = read("src/components/place/OslofjordRelationshipDeepening.tsx");
const evidenceComponent = read("src/components/place/ScientificDatasetEvidence.tsx");
const model = read("src/planet/placeModel.ts");
const follow = read("src/planet/follow.ts");
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

test("source-backed sub-place relation does not manufacture child geometry", () => {
  assert.match(model, /PlaceRelationRef/);
  assert.match(places, /MRGID 5333/);
  assert.match(places, /relation: "PART_OF"/);
  assert.match(places, /toPlaceId: "place:marine-regions:3379"/);
  assert.match(places, /does not provide 4PLANET with a universal child polygon/i);
  assert.match(evidenceComponent, /SOURCE-BACKED SUB-PLACE/);
  assert.match(page, /PlaceRelationEvidence/);
});

test("real LIFE proof uses bounded survey evidence and exposes uncertainty", () => {
  for (const token of ["Sprattus sprattus", "Clupea harengus", "Engraulis encrasicolus", "Zostera marina"]) assert.match(data, new RegExp(token));
  for (const value of ["261 million", "75 million", "50 million", "2,971 tonnes", "2,718 tonnes", "196 tonnes"]) assert.ok(data.includes(value), value);
  assert.match(data, /90% CI 190–334 million/);
  assert.match(data, /Survey estimate/);
  assert.match(data, /not a live count/i);
  assert.match(data, /few positions in Oslofjord are trawlable/i);
});

test("microscopic LIFE adds source-bounded datasets without turning archive counts into current abundance", () => {
  for (const token of ["22,635", "3,816", "411", "18", "1896-02-14", "2020-12-14", "CC-BY 4.0"]) assert.ok(datasets.includes(token), token);
  assert.match(datasets, /DATASET/);
  assert.match(datasets, /EXTENT only/i);
  assert.match(datasets, /not organism abundance or current ecological condition/i);
  assert.match(datasets, /living benthic foraminifera/i);
  assert.match(datasets, /three sites in one basin/i);
  assert.match(page, /MICROSCOPIC LIFE/);
  assert.match(page, /The life you do not see drives the place story too/i);
  assert.match(evidenceComponent, /NOT A PLACE BOUNDARY/);
});

test("official future occurrence sources remain source-ready rather than silently queried", () => {
  assert.match(datasets, /Vannmiljø — artsforekomster/);
  assert.match(datasets, /1,985,360/);
  assert.match(datasets, /not an Oslofjord count/i);
  assert.match(page, /has not selected or ingested an Oslofjorden subset/i);
});

test("pressure intelligence is multi-causal and scoped", () => {
  for (const id of ["pressure-nitrogen", "pressure-agriculture-wastewater", "pressure-oxygen", "pressure-fisheries", "pressure-habitat"]) assert.ok(data.includes(id), id);
  assert.match(data, /30–40%/);
  assert.match(data, /one profile at one place\/time/i);
  assert.match(page, /There is no single cause/);
});

test("Relationship Reveal now exposes two source-aware threads without manufacturing certainty", () => {
  assert.match(relationshipDeepening, /relationship-phytoplankton-foodweb/);
  assert.match(relationshipDeepening, /Phytoplankton/);
  assert.match(relationshipDeepening, /Base of the marine food web/);
  assert.match(relationshipDeepening, /Zooplankton graze on phytoplankton/);
  assert.match(relationshipDeepening, /historical UiO phytoplankton archive/);
  assert.match(relationshipDeepening, /together with other factors/);
  assert.match(relationshipDeepening, /not presented as 'nitrogen caused the Oslofjord problem'/i);
  assert.match(relationshipDeepening, /Restoration guidance is not proof/);
  assert.match(relationshipComponent, /initialMode="THREAD"/);
  assert.match(page, /TWO SOURCE-AWARE THREADS/);
  assert.match(page, /high nitrogen acts together with other factors/i);
});

test("legacy weak relationship context remains distinguishable rather than silently promoted", () => {
  assert.match(data, /rel-human[\s\S]*grade: "4PLANET_CONTEXT"/);
  assert.match(data, /rel-eelgrass-life[\s\S]*grade: "DOCUMENTED"/);
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

test("real Oslofjord hero has explicit open rights and cannot masquerade as ecological evidence", () => {
  assert.match(media, /rightsClass: "OPEN_LICENSE"/);
  assert.match(media, /Leonhard Lenz/);
  assert.match(media, /CC0 1.0 Universal Public Domain Dedication/);
  assert.match(media, /not an ecological observation/i);
  assert.match(page, /REAL OSLOFJORD PHOTO/);
  assert.match(front, /REAL OSLOFJORD PHOTO/);
  assert.doesNotMatch(page, /oce4nDomainHero/);
});

test("front door exposes real Oslofjord LIFE evidence without calling it live data", () => {
  assert.match(front, /261 million/);
  assert.match(front, /75 million/);
  assert.match(front, /50 million/);
  assert.match(front, /Survey estimate with uncertainty/);
  assert.doesNotMatch(front, /LIVE DATA/);
});

test("Oslofjorden Follow reuses the canonical local-first store", () => {
  assert.match(follow, /4planet\.follows\.v1/);
  assert.match(page, /useFollows/);
  assert.match(page, /place:marine-regions:3379|place\.id/);
  assert.match(page, /survives refresh on this device/i);
  assert.match(page, /Automated Oslofjord notifications are not built yet/i);
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
