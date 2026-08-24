import fs from "node:fs";

const coordinationPath = "src/planet/coordinationGraph.ts";
const sourceGraphPath = "src/planet/sourceGraph.ts";
const coordination = fs.readFileSync(coordinationPath, "utf8");
const sourceGraph = fs.readFileSync(sourceGraphPath, "utf8");
const failures = [];

function requireText(haystack, needle, message) {
  if (!haystack.includes(needle)) failures.push(message);
}

const nodeKinds = [
  "PROBLEM",
  "PLACE",
  "ECOSYSTEM",
  "VALUE_CHAIN_NODE",
  "EVIDENCE",
  "ACTIONABLE_GAP",
  "SOLUTION",
  "INNOVATION",
  "ACTOR",
  "CAPABILITY",
  "CAPITAL_ACTOR",
  "CAPITAL_INSTRUMENT",
  "CAPITAL_NEED",
  "PROJECT",
  "ACTION",
  "RESULT",
  "LEARNING",
];
for (const kind of nodeKinds) requireText(coordination, `"${kind}"`, `coordination node kind missing: ${kind}`);

const chainMarkers = [
  '"PROBLEM"',
  '"PLACE / ECOSYSTEM / VALUE_CHAIN_NODE"',
  '"EVIDENCE"',
  '"ACTIONABLE_GAP"',
  '"SOLUTION / INNOVATION"',
  '"ACTOR / CAPABILITY"',
  '"CAPITAL_ACTOR / CAPITAL_INSTRUMENT / CAPITAL_NEED"',
  '"PROJECT / ACTION"',
  '"RESULT"',
  '"LEARNING"',
];
let lastIndex = -1;
for (const marker of chainMarkers) {
  const index = coordination.indexOf(marker, lastIndex + 1);
  if (index < 0) failures.push(`Problem→Action chain marker missing: ${marker}`);
  else if (index <= lastIndex) failures.push(`Problem→Action chain order invalid at: ${marker}`);
  lastIndex = Math.max(lastIndex, index);
}

requireText(coordination, 'DERIVES_GAP: { from: ["PROBLEM"], to: ["ACTIONABLE_GAP"] }', "Actionable Gap must be derived from Problem");
requireText(coordination, 'code: "ORPHAN_ACTIONABLE_GAP"', "orphan actionable gaps must fail validation");
requireText(coordination, 'node.visibility === "PUBLIC_SAFE"', "public-safe projection boundary missing");
requireText(coordination, 'edge.sourceIds.length > 0', "public edges must retain provenance");
requireText(coordination, 'gate.state !== "PASS"', "hard matching gates must fail closed on FAIL or UNKNOWN");
requireText(coordination, 'state: blockers.length ? "BLOCKED" : "ELIGIBLE_FOR_REVIEW"', "matching must block when any hard gate is unresolved");
requireText(coordination, 'Object.prototype.hasOwnProperty.call(match, "score")', "opaque-score detector missing");
requireText(coordination, '"ORCA_BAY_OF_BISCAY"', "marine Gold transfer case missing");
requireText(coordination, '"JAGUAR_AMAZONIA"', "terrestrial Gold transfer case missing");
requireText(coordination, '"S4PIENS_FOOD"', "human-system Gold transfer case missing");

const sourceHardStops = [
  "Institution is not a dataset.",
  "Observation is not a model output.",
  "No record is not confirmed absence.",
  "Open access is not unrestricted commercial use.",
  "Attribution is not partnership.",
  "Public data is not proof of 4PLANET impact.",
];
for (const stop of sourceHardStops) requireText(sourceGraph, stop, `recovered Source Graph hard stop missing: ${stop}`);
requireText(sourceGraph, "export function validateSourceGraph", "Source Graph validator missing");

if (failures.length) {
  console.error(`PLANETARY COORDINATION FAIL: ${failures.length} issue(s)`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`PLANETARY COORDINATION PASS: ${nodeKinds.length} typed coordination objects; Problem→Action order, fail-closed matching, public projection and Source Graph hard stops present.`);
