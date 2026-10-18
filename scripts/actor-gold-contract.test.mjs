import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const engine = read("src/content/actorGold.ts");
const page = read("src/pages/v5/ActorGold.tsx");
const css = read("src/styles/actor-gold.css");
const router = read("src/routes/router.tsx");

test("Actor Engine has one shared premium profile grammar and no photo dependency", () => {
  assert.match(engine, /ACTOR_GOLD_REQUIRED_SECTIONS/);
  assert.match(engine, /ACTOR_GOLD_VISUAL_LADDER/);
  assert.match(engine, /IDENTITY_FIELD/);
  assert.match(engine, /ATLAS_PLACE/);
  assert.match(engine, /RELATIONSHIP_GRAPH/);
  assert.match(engine, /SOURCE_DATA/);
  assert.match(engine, /Every profile must work without partner photography or logo permissions/i);
  assert.match(engine, /a photograph is not/i);
  assert.match(engine, /Synthetic photoreal media must never imply documentary field evidence/i);
});

test("ORCA Gold remains truth-bounded and field feed fails closed", () => {
  assert.match(engine, /P17-A036/);
  assert.match(engine, /DIRECT_DIALOGUE/);
  assert.match(engine, /Bay of Biscay/);
  assert.match(engine, /not an Orca migration track/i);
  assert.match(engine, /fieldFeed: \[\]/);
  assert.match(engine, /Fund a survey/);
  assert.match(engine, /state: "LOCKED"/);
  assert.match(engine, /does not imply a signed delivery partnership/i);
  assert.match(page, /NO PUBLIC FIELD DISPATCHES YET/);
  assert.match(page, /Intake → source QA → editorial review → public/);
});

test("Actor Gold page exposes work place living context editorial proof and action layers", () => {
  for (const token of [
    "WHAT THEY ACTUALLY DO",
    "PLACES / ATLAS",
    "LIVING CONTEXT",
    "FIELD FEED",
    "MAGAZINE",
    "PROJECTS / DATA / PROOF",
    "FOLLOW / SUPPORT / ACT",
    "RELATIONSHIP / EDITORIAL DISCLOSURE",
  ]) assert.match(page, new RegExp(token.replace(/[\/]/g, "\\/")));
  assert.match(router, /path="\/actors"/);
  assert.match(router, /path="\/actors\/:slug"/);
});

test("Actor Gold product consumes the typed 4NGO value and proof path", () => {
  for (const field of [
    "identifiedNeeds",
    "operationalCapabilities",
    "partnerRequirements",
    "capitalRequirements",
    "actionContractIds",
    "deliveryEvidence",
    "outcomeEvidence",
    "claimsAllowed",
    "claimsProhibited",
  ]) assert.match(page, new RegExp(`actor\\.${field}`));
  assert.match(page, /NEED → CAPABILITY → REQUIREMENTS → PROOF/);
  assert.match(page, /No reviewed delivery evidence is attached/);
  assert.match(page, /No reviewed outcome evidence is attached/);
  assert.match(page, /No delivery, outcome or impact claim is currently cleared/);
});

test("Actor Gold renders only claims admitted by the authoritative publication gate", () => {
  assert.match(page, /actorClaimCanPublish/);
  assert.match(
    page,
    /actor\.claimsAllowed\.filter\(\(claim\) =>\s*actorClaimCanPublish\(claim, actor\.sourceRecords, actor\.evidenceRecords\)/,
  );
  assert.match(page, /publishableClaims\.map/);
  assert.doesNotMatch(page, /actor\.claimsAllowed\.map/);
  assert.doesNotMatch(page, /actor\.claimsAllowed\.length/);
  assert.match(engine, /sourceRecords: ActorSourceRecord\[\]/);
  assert.match(engine, /evidenceRecords: ActorEvidenceRecord\[\]/);
});

test("Actor Gold has a responsive rights-safe signature visual", () => {
  assert.match(page, /actor-gold-route/);
  assert.match(page, /Illustrative monitoring corridor/);
  assert.match(css, /actor-gold-corridor/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("Actor scale strategy is torture-test-first not x100 generation", () => {
  assert.match(engine, /ACTOR_TORTURE_TEST_ARCHETYPES/);
  assert.match(page, /ORCA is Gold 01/);
  assert.match(page, /One exceptional system\. Ten unlike actors\. Then scale\./i);
});


test("Actor Gold links only the reviewed canonical Actor-owned IMPACT action", () => {
  assert.match(page, /BAY_OF_BISCAY_SURVEY_ACTION/);
  assert.match(page, /actorForActionContract\(canonicalAction\)\?\.id === actor\.id/);
  assert.match(page, /actor\.actionContractIds\.includes\(canonicalAction\.id\)/);
  assert.match(page, /to="\/impact\/actions\/bay-of-biscay-survey"/);
  assert.match(page, /OPEN ACTION STATUS \/ PROOF/);
  assert.match(page, /not an open funding route, delivery claim, outcome claim or impact claim/i);
  assert.match(page, /ACTION LINK UNRESOLVED/);
  assert.match(page, /not owned by this canonical Actor or has no reviewed route/i);
  assert.doesNotMatch(page, /to=\{.*actionContractIds/i);
});
