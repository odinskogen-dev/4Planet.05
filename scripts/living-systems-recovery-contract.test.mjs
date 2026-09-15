import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const intel = read("src/planet/decisionIntelligence.ts");
const trust = read("src/planet/trustIntelligence.ts");
const nodeIntel = read("src/planet/nodeIntelligence.ts");
const panel = read("src/components/living/LivingSystemsIntelligencePanel.tsx");
const page = read("src/pages/v5/LivingSystems.tsx");

test("LSI 1.4.2 deep-intelligence primitives are physically recovered", () => {
  assert.match(intel, /SOLUTION_PATHWAYS/);
  assert.match(intel, /DECISION_SIGNALS/);
  assert.match(intel, /LEARNING_RECORDS/);
  assert.match(intel, /failureCascade/);
  assert.match(intel, /RECOVERED_SOURCE_REFS/);
  assert.match(intel, /structured decision intelligence, not automated advice/i);
});

test("Amazonia and Pollination recovered decision contexts survive", () => {
  for (const id of [
    "DS_PROTECTED_AREAS",
    "DS_INDIGENOUS",
    "DS_MONITORING",
    "DS_RESTORATION",
    "DS_PESTICIDE_REDUCTION",
    "DS_POLLINATOR_HABITAT",
  ]) assert.match(intel, new RegExp(id));

  for (const id of [
    "LR_PROTECTED_AREAS",
    "LR_MONITORING",
    "LR_RESTORATION",
    "LR_PESTICIDE_REDUCTION",
    "LR_POLLINATOR_HABITAT",
  ]) assert.match(intel, new RegExp(id));
});

test("claim trust and data-quality intelligence are recovered without upgrading donor verification", () => {
  assert.match(trust, /RECOVERED_CLAIMS/);
  assert.match(trust, /RECOVERED_DATA_QUALITY/);
  assert.match(trust, /trustSummaryForContext/);
  assert.match(trust, /donor trust metadata is preserved/i);
  for (const id of ["CLAIM_AMAZON_CARBON", "CLAIM_FOOD_DEP_POLLINATION", "DQ_AMAZON_RAINFALL_QUANT", "DQ_POLLINATION_VARIATION"]) {
    assert.match(trust, new RegExp(id));
  }
});

test("generic node intelligence is restored on the current shared Planet Model", () => {
  assert.match(nodeIntel, /nodeIntelligence/);
  assert.match(nodeIntel, /currentNodeIntelligenceInventory/);
  assert.match(nodeIntel, /OUTBOUND RELATIONSHIPS/);
  assert.match(nodeIntel, /DEPENDS ON \/ INBOUND/);
  assert.match(nodeIntel, /read-only traversal of the current shared Planet Model/i);
});

test("deep intelligence stays progressive disclosure inside current Living Systems", () => {
  assert.match(panel, /<details/);
  assert.match(panel, /DEEP INTELLIGENCE · RECOVERED LSI 1\.4\.2/);
  assert.match(panel, /TRUST INTELLIGENCE · RECOVERED CLAIM GRAPH/);
  assert.match(panel, /DATA QUALITY · KNOWN LIMITS ARE PRODUCT STATE/);
  assert.match(panel, /SOURCE \/ TRUST RECOVERY BOUNDARY/);
  assert.match(page, /LivingSystemsIntelligencePanel/);
  assert.match(page, /anchorSlug=\{a\.slug\}/);
});
