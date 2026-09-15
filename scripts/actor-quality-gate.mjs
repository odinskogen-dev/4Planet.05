import fs from "node:fs";
import ts from "typescript";

const path = "src/content/actorGold.ts";
const sourceText = fs.readFileSync(path, "utf8");
const source = ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const failures = [];

function fail(message) { failures.push(message); }
function property(object, name) {
  return object.properties.find((item) => ts.isPropertyAssignment(item) && ((ts.isIdentifier(item.name) && item.name.text === name) || (ts.isStringLiteral(item.name) && item.name.text === name)))?.initializer;
}
function text(node) {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined;
}
function array(node) { return node && ts.isArrayLiteralExpression(node) ? node.elements : []; }
function object(node) { return node && ts.isObjectLiteralExpression(node) ? node : undefined; }

let profilesNode;
source.forEachChild((node) => {
  if (!ts.isVariableStatement(node)) return;
  for (const declaration of node.declarationList.declarations) {
    if (ts.isIdentifier(declaration.name) && declaration.name.text === "ACTOR_GOLD_PROFILES") profilesNode = declaration.initializer;
  }
});

if (!profilesNode || !ts.isArrayLiteralExpression(profilesNode)) fail("ACTOR_GOLD_PROFILES must be a literal array so the release gate can inspect it");
const profiles = profilesNode && ts.isArrayLiteralExpression(profilesNode) ? profilesNode.elements.filter(ts.isObjectLiteralExpression) : [];
if (profiles.length < 1) fail("at least one controlled Actor Gold profile is required");

const ids = new Set();
const slugs = new Set();
for (const profile of profiles) {
  const id = text(property(profile, "id"));
  const slug = text(property(profile, "slug"));
  const name = text(property(profile, "name"));
  const actorType = text(property(profile, "actorType"));
  const oneLine = text(property(profile, "oneLine"));
  const publicationState = text(property(profile, "publicationState"));
  const disclosure = text(property(profile, "editorialDisclosure"));
  const sourceAuthority = text(property(profile, "sourceAuthority"));
  const correctionsPath = text(property(profile, "correctionsPath"));
  const work = array(property(profile, "work"));
  const places = array(property(profile, "places"));
  const evidence = array(property(profile, "evidence"));
  const fieldFeed = array(property(profile, "fieldFeed"));
  const actions = array(property(profile, "actions"));
  const visual = object(property(profile, "visual"));

  const key = name || slug || id || "unknown actor";
  if (!id || !/^P17-A\d{3,}$/.test(id)) fail(`${key}: canonical P17 actor id required`);
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) fail(`${key}: stable lowercase slug required`);
  if (!name || name.length < 2) fail(`${key}: actor name required`);
  if (!actorType || actorType.length < 8) fail(`${key}: meaningful actor type required`);
  if (!oneLine || oneLine.length < 40) fail(`${key}: one-line public job statement is too weak`);
  if (!disclosure || disclosure.length < 60) fail(`${key}: relationship/editorial disclosure required`);
  if (!sourceAuthority || sourceAuthority.length < 20) fail(`${key}: source authority required`);
  if (!correctionsPath?.startsWith("/")) fail(`${key}: corrections path required`);
  if (work.length < 2) fail(`${key}: at least two concrete work classes required`);
  if (places.length < 1) fail(`${key}: at least one geography role required`);
  if (evidence.length < 2) fail(`${key}: at least two evidence/source states required`);
  if (!publicationState || !["DEVELOPMENT", "PUBLIC"].includes(publicationState)) fail(`${key}: publication state invalid`);
  if (id && ids.has(id)) fail(`${key}: duplicate canonical actor id ${id}`); else if (id) ids.add(id);
  if (slug && slugs.has(slug)) fail(`${key}: duplicate slug ${slug}`); else if (slug) slugs.add(slug);

  for (const placeNode of places) {
    const place = object(placeNode);
    if (!place) { fail(`${key}: geography records must be literal objects`); continue; }
    if (!text(property(place, "label")) || !text(property(place, "role")) || !text(property(place, "precision"))) fail(`${key}: geography needs label, role and precision`);
  }

  for (const evidenceNode of evidence) {
    const item = object(evidenceNode);
    if (!item) { fail(`${key}: evidence records must be literal objects`); continue; }
    const state = text(property(item, "state"));
    if (!text(property(item, "label")) || !state || !text(property(item, "note"))) fail(`${key}: evidence needs label, state and note`);
    if (publicationState === "PUBLIC" && state === "OPEN") fail(`${key}: PUBLIC profile cannot retain OPEN material evidence`);
  }

  for (const dispatchNode of fieldFeed) {
    const dispatch = object(dispatchNode);
    if (!dispatch) { fail(`${key}: field dispatch must be a literal object`); continue; }
    if (text(property(dispatch, "state")) !== "PUBLIC") fail(`${key}: non-PUBLIC dispatch cannot enter public field feed`);
    if (!text(property(dispatch, "sourcePackId"))) fail(`${key}: field dispatch needs source pack id`);
  }

  for (const actionNode of actions) {
    const action = object(actionNode);
    if (!action) { fail(`${key}: actions must be literal objects`); continue; }
    const state = text(property(action, "state"));
    const actionPath = text(property(action, "path"));
    if (state === "OPEN" && !actionPath) fail(`${key}: OPEN action needs an executable path`);
  }

  if (!visual) {
    fail(`${key}: signature visual contract required`);
  } else {
    const primary = text(property(visual, "primary"));
    const truthBoundary = text(property(visual, "truthBoundary"));
    const documentaryRightsState = text(property(visual, "documentaryRightsState"));
    if (!primary) fail(`${key}: primary signature visual required`);
    if (!truthBoundary || truthBoundary.length < 60) fail(`${key}: visual truth boundary required`);
    if (primary === "DOCUMENTARY" && documentaryRightsState !== "CLEARED") fail(`${key}: documentary hero cannot release without CLEARED rights`);
  }
}

if (!/Every profile must work without partner photography or logo permissions/i.test(sourceText)) fail("global no-photo-dependency rule missing");
if (!/Synthetic photoreal media must never imply documentary field evidence/i.test(sourceText)) fail("synthetic documentary truth rule missing");
if (!/Human visual\/editorial judgement remains a release gate for GOLD/i.test(sourceText)) fail("human Gold judgement gate missing");

if (failures.length) {
  console.error(`ACTOR GOLD FAIL: ${failures.length} issue(s)`);
  failures.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`ACTOR GOLD PASS: ${profiles.length} controlled profile(s); unique ids/slugs; visual, source, action and field-feed gates closed.`);
