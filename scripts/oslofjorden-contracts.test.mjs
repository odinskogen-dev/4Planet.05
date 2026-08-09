import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const data = read("src/data/oslofjordenProof.ts");
const media = read("src/data/oslofjordenMedia.ts");
const datasets = read("src/data/oslofjordenDatasets.ts");
const places = read("src/data/oslofjordenPlaces.ts");
const spatial = read("src/data/oslofjordenSpatial.ts");
const relationshipDeepening = read("src/data/oslofjordenRelationshipDeepening.ts");
const relationshipComponent = read("src/components/place/OslofjordRelationshipDeepening.tsx");
const datasetOccurrenceConnector = read("src/planet/datasetOccurrences.ts");
const datasetOccurrenceComponent = read("src/components/place/DatasetOccurrenceEvidence.tsx");
const evidenceComponent = read("src/components/place/ScientificDatasetEvidence.tsx");
const spatialLifeComponent = read("src/components/place/OslofjordSpatialLifeEvidence.tsx");
const placeBridge = read("src/components/place/PlaceProductBridge.tsx");
const model = read("src/planet/placeModel.ts");
const vannmiljo = read("src/planet/vannmiljo.ts");
const waterbodyGeometry = read("src/planet/waterbodyGeometry.ts");
const sourceWatch = read("src/planet/sourceWatch.ts");
const follow = read("src/planet/follow.ts");
const page = read("src/pages/phase04/OslofjordenJourney.tsx");
const front = read("src/pages/phase04/FrontDoor.tsx");
const validation = read("src/pages/phase04/OslofjordenValidation.tsx");
const validationReview = read("src/pages/phase04/OslofjordenValidationReview.tsx");
const router = read("src/routes/router.tsx");

test("Oslofjorden semantic identity stays separate from role-specific spatial objects", () => {
  assert.match(data, /place:marine-regions:3379/);
  assert.match(data, /MRGID 3379/);
  for (const role of ["SEMANTIC_IDENTITY", "DISPLAY", "BIODIVERSITY_QUERY", "SCIENTIFIC_AREA", "WATERBODY_STATUS", "REGULATORY", "ADMINISTRATIVE"]) assert.match(model, new RegExp(role));
  assert.match(spatial, /sourceRecordId: "MRGID 3379"/);
  assert.match(spatial, /role: "SEMANTIC_IDENTITY"/);
  assert.match(spatial, /id: "oslofjord-display"[\s\S]*availability: "NOT_SELECTED"/);
  assert.match(spatial, /role: "WATERBODY_STATUS"[\s\S]*0101020601-C/);
  assert.match(spatial, /role: "BIODIVERSITY_QUERY"[\s\S]*0101020601-C/);
  assert.match(spatial, /does not define one authoritative polygon for display, biodiversity queries, science, management or regulation/i);
  assert.match(spatial, /never define the whole fjord/i);
  assert.doesNotMatch(spatial, /role: "DISPLAY"[\s\S]{0,300}availability: "INGESTED"/);
});

test("every admitted canonical spatial role carries intended use, limitation and supersession state", () => {
  assert.match(model, /intendedUse/);
  assert.match(model, /supersessionState/);
  assert.match(model, /GeometryRights/);
  assert.match(spatial, /rights:/);
  assert.match(spatial, /intendedUse:/);
  assert.match(spatial, /supersessionState: "CURRENT"/);
  assert.match(spatial, /SOURCE_AVAILABLE_NOT_INGESTED/);
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

test("real LIFE proof retains bounded surveys and uncertainty", () => {
  for (const token of ["Sprattus sprattus", "Clupea harengus", "Engraulis encrasicolus", "Zostera marina"]) assert.match(data, new RegExp(token));
  for (const value of ["261 million", "75 million", "50 million", "2,971 tonnes", "2,718 tonnes", "196 tonnes"]) assert.ok(data.includes(value), value);
  assert.match(data, /90% CI 190–334 million/);
  assert.match(data, /not a live count/i);
  assert.match(data, /few positions in Oslofjord are trawlable/i);
});

test("microscopic LIFE datasets remain source-bounded scientific areas rather than place polygons", () => {
  for (const token of ["22,635", "3,816", "411", "18", "1896-02-14", "2020-12-14", "CC-BY 4.0"]) assert.ok(datasets.includes(token), token);
  assert.match(datasets, /EXTENT only/i);
  assert.match(datasets, /not organism abundance or current ecological condition/i);
  assert.match(spatial, /role: "SCIENTIFIC_AREA"/);
  assert.match(spatial, /GBIF UUID 777ea835-48a3-4136-bf3a-32c5b897563f/);
  assert.match(evidenceComponent, /NOT A PLACE BOUNDARY/);
});

test("admitted Inner Oslofjord GBIF dataset exposes exact records without inventing place membership", () => {
  assert.match(datasets, /runtimeOccurrenceDatasetKey: "777ea835-48a3-4136-bf3a-32c5b897563f"/);
  for (const token of ["datasetKey", "hasCoordinate", "coordinateUncertaintyInMeters", "eventDate", "license", "issues"]) assert.match(datasetOccurrenceConnector, new RegExp(token));
  assert.match(datasetOccurrenceConnector, /https:\/\/www\.gbif\.org\/occurrence/);
  assert.match(datasetOccurrenceComponent, /REAL SOURCE RECORDS \/ HISTORICAL OCCURRENCES/);
  assert.match(datasetOccurrenceComponent, /not live organism positions/i);
  assert.match(datasetOccurrenceComponent, /not organism abundance/i);
  assert.match(datasetOccurrenceComponent, /does not establish a universal 4PLANET Oslofjorden polygon/i);
});

test("Vannmiljo is queried through the source's own WaterBodyID contract", () => {
  assert.match(vannmiljo, /WaterBodyIDFilter/);
  assert.match(vannmiljo, /0101020601-C|OSLOFJORD_PRIMARY_WATERBODY_ID/);
  assert.match(vannmiljo, /GetRegistrations/);
  assert.match(vannmiljo, /GetWaterLocations/);
  assert.match(vannmiljo, /WaterRegistrationID/);
  assert.match(vannmiljo, /VitenskapligNavn/);
  assert.match(vannmiljo, /SamplingTime/);
  assert.match(vannmiljo, /CoordY_dg/);
  assert.match(vannmiljo, /SOURCE_TERMS_REVIEW_REQUIRED/);
  assert.match(vannmiljo, /NOT_A_SPECIES_REGISTRATION/);
  assert.match(spatialLifeComponent, /Registration ≠ current position/);
  assert.match(spatialLifeComponent, /Loaded count ≠ abundance/);
  assert.match(page, /Vannmiljø is now a real local source adapter/);
  assert.doesNotMatch(page, /has not selected or ingested an Oslofjorden subset/i);
});

test("official Vann-Nett geometry is a runtime waterbody-status source, never universal geometry", () => {
  assert.match(waterbodyGeometry, /MapServer\/1/);
  assert.match(waterbodyGeometry, /returnGeometry/);
  assert.match(waterbodyGeometry, /outSR/);
  assert.match(waterbodyGeometry, /f: "geojson"/);
  assert.match(waterbodyGeometry, /PUBLIC_SERVICE_REUSE_REVIEW_REQUIRED/);
  assert.match(waterbodyGeometry, /not the semantic, ecological, regulatory, display or universal boundary/i);
  assert.match(spatialLifeComponent, /VANN-NETT WATERBODY GEOMETRY/);
});

test("ATLAS and SPECIES reuse the same Oslofjord place/spatial context without rewriting their engines", () => {
  assert.match(placeBridge, /OSLOFJORD_SPATIAL_REGISTRY/);
  assert.match(placeBridge, /mode: "ATLAS" \| "SPECIES"/);
  assert.match(placeBridge, /fetchWaterbodyGeometry/);
  assert.match(placeBridge, /fetchVannmiljoRegistrations/);
  assert.match(placeBridge, /MRGID 3379 remains semantic identity/);
  assert.match(router, /PlaceProductBridge mode="ATLAS"/);
  assert.match(router, /PlaceProductBridge mode="SPECIES"/);
  assert.match(page, /same place context in ATLAS/i);
  assert.match(page, /Oslofjord context in SPECIES/i);
});

test("pressure intelligence is multi-causal and scoped", () => {
  for (const id of ["pressure-nitrogen", "pressure-agriculture-wastewater", "pressure-oxygen", "pressure-fisheries", "pressure-habitat"]) assert.ok(data.includes(id), id);
  assert.match(data, /30–40%/);
  assert.match(data, /one profile at one place\/time/i);
  assert.match(page, /There is no single cause/);
});

test("Relationship Reveal exposes two source-aware THREADs without manufactured certainty", () => {
  assert.match(relationshipDeepening, /relationship-phytoplankton-foodweb/);
  assert.match(relationshipDeepening, /Phytoplankton/);
  assert.match(relationshipDeepening, /Base of the marine food web/);
  assert.match(relationshipDeepening, /together with other factors/);
  assert.match(relationshipDeepening, /not presented as 'nitrogen caused the Oslofjord problem'/i);
  assert.match(relationshipDeepening, /Restoration guidance is not proof/);
  assert.match(relationshipComponent, /initialMode="THREAD"/);
  assert.match(page, /TWO SOURCE-AWARE THREADS/);
});

test("legacy weak relationship context remains distinguishable", () => {
  assert.match(data, /rel-human[\s\S]*grade: "4PLANET_CONTEXT"/);
  assert.match(data, /rel-eelgrass-life[\s\S]*grade: "DOCUMENTED"/);
});

test("Signals are real source events rather than generic news or outcome claims", () => {
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

test("Follow remains local-first and source Watch never manufactures a first-check alert", () => {
  assert.match(follow, /4planet\.follows\.v1/);
  assert.match(sourceWatch, /4planet\.source-watch\.v1/);
  assert.match(sourceWatch, /BASELINE_ESTABLISHED/);
  assert.match(sourceWatch, /NO_CHANGE/);
  assert.match(sourceWatch, /SOURCE_CHANGED/);
  assert.match(sourceWatch, /REMOVED_FROM_SOURCE_RESPONSE/);
  assert.match(sourceWatch, /if \(!previous\) return \{ state: "BASELINE_ESTABLISHED"/);
  assert.match(spatialLifeComponent, /first source check establishes a baseline/i);
  assert.match(spatialLifeComponent, /Return Objects, not ecological alerts/i);
  assert.match(page, /Account sync, push\/email delivery.*not built or claimed/i);
});

test("human validation remains local-only and has a separate import/scoring/synthesis route", () => {
  assert.match(router, /\/labs\/oslofjorden-validation/);
  assert.match(router, /\/labs\/oslofjorden-validation\/review/);
  assert.match(validation, /localStorage/);
  assert.match(validation, /HUMAN RESULTS NOT RUN BY 4PLANET/);
  assert.match(validation, /does not create an account or send results to 4PLANET/);
  assert.match(validation, /EXPORT JSON/);
  assert.doesNotMatch(validation, /fetch\(/);
  assert.match(validationReview, /IMPORT PARTICIPANT JSON/);
  assert.match(validationReview, /REVIEWER CODING/);
  assert.match(validationReview, /HUMAN VALIDATION STATUS \/ NOT RUN/);
  assert.match(validationReview, /rawAnswers/);
  assert.doesNotMatch(validationReview, /fetch\(/);
});

test("higher proof states stay absent until real evidence exists", () => {
  assert.match(page, /No Oslofjorden Partner Report, Assessed Outcome or Verified Outcome is claimed/);
  assert.doesNotMatch(data, /relationship: "PARTNER"/);
  assert.doesNotMatch(data, /VERIFIED OUTCOME/);
});
