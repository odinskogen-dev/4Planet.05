import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const model = read("src/content/participation.ts");
const page = read("src/pages/v5/Participation.tsx");
const actorPage = read("src/pages/v5/ActorGold.tsx");
const router = read("src/routes/router.tsx");
const adapter = read("functions/api/volunteer-opportunities.ts");
const css = read("src/styles/actor-participation.css");

test("Participation Opportunity is a first-class source-aware object, not another Actor store", () => {
  assert.match(model, /interface ParticipationOpportunity/);
  for (const type of ["VOLUNTEER", "SKILLS", "FIELD", "CITIZEN_SCIENCE", "INTERNSHIP", "PAID", "WORK_EXCHANGE", "REMOTE"]) {
    assert.match(model, new RegExp(`\\| \\\"${type}\\\"|\\\"${type}\\\"`));
  }
  assert.match(model, /Participation Opportunity is a first-class Actor Graph object/);
  assert.match(model, /not a second Actor identity or a separate Get Involved database/i);
});

test("ORCA Get Involved keeps real source, costs, requirements and canonical identity", () => {
  assert.match(model, /P17-A036/);
  assert.match(model, /participation:orca:oceanwatchers/);
  assert.match(model, /https:\/\/orca\.org\.uk\/training\/oceanwatchers/);
  assert.match(model, /participation:orca:marine-mammal-surveyor/);
  assert.match(model, /https:\/\/orca\.org\.uk\/training\/marine-mammal-surveyor/);
  assert.match(model, /£15 identification course \+ £20 OceanWatchers course/);
  assert.match(model, /£120 surveyor course \+ £15 prerequisite/);
  assert.match(model, /Survey-route ticket is provided; volunteer pays travel to and from the port/);
  assert.match(model, /Training does not guarantee a survey place/);
  assert.match(model, /checkedAt: CHECKED_AT/);
});

test("Matching is explainable and unknown external terms cannot become a recommendation", () => {
  assert.match(model, /availability: "UNKNOWN"/);
  assert.match(model, /assertion: "EXTERNAL_LISTING"/);
  for (const gate of ["SOURCE", "AVAILABILITY", "TIME", "COST", "LOCATION"]) assert.match(model, new RegExp(`label: \\\"${gate}\\\"`));
  assert.match(model, /eligibleForReview: hardGates\.every\(\(gate\) => gate\.state === "PASS"\)/);
  assert.doesNotMatch(model, /confidenceScore\s*:/);
  assert.doesNotMatch(model, /score\s*:/);
  assert.match(model, /local match requires the user's location/i);
});

test("VolunteerConnector adapter is live-source only and fails closed", () => {
  assert.match(adapter, /https:\/\/www\.volunteerconnector\.org\/api\/search\//);
  assert.match(adapter, /LIVE_EXTERNAL_SOURCE/);
  assert.match(adapter, /verifiedBy4Planet: false/);
  assert.match(adapter, /SOURCE_UNAVAILABLE/);
  assert.match(adapter, /opportunities: \[\]/);
  assert.match(adapter, /status: 503/);
});

test("Get Involved is visible on Actor Gold and discovery is routed", () => {
  assert.match(actorPage, /GetInvolvedSection/);
  assert.match(actorPage, /GET INVOLVED/);
  assert.match(page, /Find your way to help/);
  assert.match(page, /LIVE EXTERNAL SOURCE PROOF/);
  assert.match(page, /Real supply\. Not automatically recommended/);
  assert.match(router, /path="\/get-involved"/);
  assert.match(css, /participation-opportunity-grid/);
  assert.match(css, /@media \(max-width: 680px\)/);
});

test("Transfer proof and Actor Engine foundation stay shared across unlike actor archetypes", () => {
  assert.match(model, /P17-A036/);
  assert.match(model, /P17-A307/);
  assert.match(model, /P17-A003/);
  assert.match(model, /SCIENCE \/ MONITORING/);
  assert.match(model, /RESTORATION \/ IMPLEMENTATION/);
  assert.match(model, /KNOWLEDGE \/ DATA INFRASTRUCTURE/);
  assert.match(model, /DISCOVER ACTOR/);
  assert.match(model, /RESOLVE IDENTITY/);
  assert.match(model, /FIND PROJECTS \/ NEEDS \/ OPPORTUNITIES/);
  assert.match(model, /PROJECT TO PUBLIC SURFACES/);
});
