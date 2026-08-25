import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const pci = read("src/planet/coordinationGraph.ts");
const cell = read("src/content/livingPlanetCell.ts");
const research = read("src/content/researchGold.ts");
const projection = read("src/planet/livingPlanetProjection.ts");
const federation = read("src/planet/sourceAdapterRegistry.ts");
const actors = read("src/content/actorGold.ts");
const page = read("src/pages/v5/LivingPlanetCell.tsx");
const atlas = read("src/components/LivingPlanetAtlasBridge.tsx");
const router = read("src/routes/router.tsx");
const css = read("src/styles/living-planet-cell.css");

test("PCI-02 makes Research and Decision first-class without making Need the root", () => {
  assert.match(pci, /COORDINATION_CONTRACT_VERSION = "PCI-02"/);
  assert.match(pci, /"RESEARCH"/);
  assert.match(pci, /"DECISION"/);
  assert.match(pci, /"DERIVES_GAP"/);
  assert.match(pci, /Actionable gap .* must be derived from a Problem/);
  assert.match(pci, /Research funding is context, not evidence of bias or corruption/);
  assert.match(pci, /Decision correlation is not causality/);
  assert.match(pci, /UNKNOWN is not negative evidence/);
});

test("source federation is demand-gated rather than a replication programme", () => {
  for (const source of ["source:ror", "source:openalex", "source:crossref", "source:brreg", "source:gbif", "source:obis", "source:360giving", "source:iati", "source:ted", "source:grants-gov"]) assert.ok(federation.includes(source), `missing source adapter ${source}`);
  assert.match(federation, /Federation before replication/);
  assert.match(federation, /No adapter is promoted from CANDIDATE to production merely because an API is open/);
  assert.match(federation, /Unavailable source is distinct from zero results/);
});

test("Bergen DNA cell is source-backed and keeps consultation status exact", () => {
  assert.match(cell, /PLACE-BERGEN/);
  assert.match(cell, /DEC-BGO-KPA-2027/);
  assert.match(cell, /CONSULTATION_OPEN/);
  assert.match(cell, /openedAt: "2026-08-22"/);
  assert.match(cell, /closesAt: "2026-10-06"/);
  assert.match(cell, /This is a consultation stage, not the final plan/);
  assert.match(cell, /P17-A1798/);
});

test("Global Research Gold is a real published Bergen paper with provenance and limitations", () => {
  assert.match(research, /RES-BGO-FLESLAND-PFAS-01/);
  assert.match(research, /10\.1016\/j\.jchromb\.2025\.124868/);
  assert.match(research, /P17-A296/);
  assert.match(research, /P17-A1770/);
  assert.match(research, /FEARLESS/);
  assert.match(research, /does not prove that the marine area is free of PFAS/i);
  assert.match(research, /Funding context is disclosed/);
  assert.match(page, /What did they find\?/);
  assert.match(page, /What didn’t they prove\?/);
  assert.match(page, /Who funded it\?/);
});

test("ongoing research fails closed rather than inventing findings", () => {
  assert.match(cell, /RES-BGO-PROCLIMATE-01/);
  assert.match(cell, /This is ongoing research, so 4PLANET does not present final findings/);
  assert.match(page, /does not manufacture results that the source has not published/);
});

test("five unlike Actor archetypes resolve to canonical P17 identities", () => {
  for (const id of ["P17-A036", "P17-A307", "P17-A296", "P17-A1798", "P17-A1787"]) assert.ok(actors.includes(id), `missing ${id}`);
  assert.match(actors, /A capital actor is not a capital opportunity/);
  assert.match(actors, /A government actor is not a decision/);
  assert.match(actors, /A research institution is not a scientific claim/);
});

test("visible DNA-cell routes exist for place, country, research, choices, feed and Get Involved", () => {
  for (const route of ["/places/bergen", "/places/norway", "/research", "/get-involved", "/follow/bergen", "/choices/bergen-mobility", "/coordination-proof"]) assert.ok(router.includes(`path="${route}"`), `missing route ${route}`);
  for (const question of ["WHAT’S HAPPENING?", "WHAT DOES SCIENCE SAY?", "WHY DOES IT MATTER?", "WHO IS INVOLVED?", "WHAT IS BEING DECIDED?", "WHAT ARE OUR CHOICES?", "WHAT CAN I DO?"]) assert.ok(page.includes(question), `missing question ${question}`);
  assert.match(page, /COUNTRY GOLD 01/);
  assert.match(page, /Scale is earned, not simulated/);
});

test("Better Choices is transparent, human-first and not guilt-driven", () => {
  assert.match(cell, /Which option best fits this trip — for you and the city around you\?/);
  assert.match(cell, /does not pretend to know your exact route/);
  assert.match(cell, /Do not shame a necessary car trip/);
  assert.match(page, /NO GUILT\. NO FAKE PRECISION\./);
  assert.doesNotMatch(cell, /confidenceScore|matchScore|planetScore/i);
});

test("Get Involved is contextual and truthful about open versus locked actions", () => {
  for (const verb of ["FOLLOW", "LEARN", "CHOOSE", "PARTICIPATE", "FUND", "RESEARCH", "BUILD"]) assert.ok(cell.includes(`verb: "${verb}"`), `missing action verb ${verb}`);
  assert.match(cell, /Participate in KPA 2027/);
  assert.match(cell, /Fund a survey/);
  assert.match(cell, /state: "LOCKED"/);
  assert.match(page, /4PLANET IS 4EVERYONE/);
});

test("Follow Bergen includes research, decision, explanation and action without pretending notifications are live", () => {
  assert.match(cell, /FOLLOW_BERGEN_ITEMS/);
  assert.match(research, /GLOBAL_RESEARCH_FEED_ITEM/);
  assert.match(page, /Follow what matters to a place/);
  assert.match(page, /Push notifications, user accounts and subscriptions are not claimed live yet/);
});

test("capital dogfood proves eligible and blocked matching with hard gates", () => {
  assert.match(cell, /MATCH-PCI-HMF-PLASTIC/);
  assert.match(cell, /P17-A1787:APP-025/);
  assert.match(cell, /MATCH-PCI-INNOVASJON-NO-OLD-ENTITY/);
  assert.match(cell, /state: "FAIL"/);
  assert.match(cell, /state: "UNKNOWN"/);
  assert.match(page, /Good thematic fit cannot override eligibility, delivery truth, rights, freshness or authority/);
});

test("one canonical update projects to eight surfaces and correction replaces stale surface copies", () => {
  for (const surface of ["BRAIN", "ACTOR", "ATLAS_PLACE", "RESEARCH", "MAGAZINE", "FEED", "GET_INVOLVED", "IMPACT"]) assert.ok(projection.includes(`"${surface}"`), `missing projection ${surface}`);
  assert.match(cell, /CANONICAL_UPDATE_KPA_OPEN/);
  assert.match(cell, /CANONICAL_CORRECTION_EXAMPLE/);
  assert.match(projection, /applyCanonicalCorrection/);
  assert.match(projection, /correction\.correctionOf/);
  assert.match(projection, /existing\.filter/);
  assert.match(projection, /correctedSurfaces\.has/);
});

test("ATLAS carries the same Bergen canonical intelligence without fabricating a spatial impact surface", () => {
  assert.match(atlas, /projectionFor\("ATLAS_PLACE"\)/);
  assert.match(atlas, /PLACE GOLD 01 · BERGEN_/);
  assert.match(atlas, /does not imply a spatial impact surface, live environmental condition or final policy outcome/);
  assert.match(page, /\/atlas\?place=bergen&entity=DEC-BGO-KPA-2027/);
});

test("Living Planet surfaces are responsive and preserve progressive disclosure", () => {
  assert.match(css, /@media\(max-width:900px\)/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(css, /lp-question/);
  assert.match(css, /lp-research-questions/);
  assert.match(css, /lp-actions/);
});
