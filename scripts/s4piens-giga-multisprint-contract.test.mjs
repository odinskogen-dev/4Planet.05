import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DECISION_AXIS_IDS, DECISION_EVIDENCE_STATES, buildDecisionProof } from "../src/choice/decision-proof.js";
import { EVIDENCE_STATES } from "../src/food/evidence-state.js";
import { normaliseWalletEnvelope } from "../src/food/pick-wallet.js";
import { evaluatePlanet } from "../src/food/pick-planet.js";

const referenceSource = await readFile(new URL("../functions/api/food-reference.ts", import.meta.url), "utf8");
const axes = [
  { id: "YOU", evidenceState: "MODELLED", confidence: "MODERATE" },
  { id: "WALLET", evidenceState: "OBSERVED", confidence: "MODERATE" },
  { id: "PLANET", evidenceState: "MODELLED", confidence: "LIMITED" },
];
const options = [{ id: "a", label: "A" }, { id: "b", label: "B" }];

test("canonical evidence vocabulary is identical across FOOD and Decision Proof", () => { assert.deepEqual(EVIDENCE_STATES, ["OBSERVED", "MODELLED", "CACHED", "UNKNOWN", "UNAVAILABLE"]); assert.deepEqual(DECISION_EVIDENCE_STATES, EVIDENCE_STATES); assert.deepEqual(DECISION_AXIS_IDS, ["YOU", "WALLET", "PLANET"]); });
test("Decision Proof has no combined score and requires quorum", () => { const proof = buildDecisionProof({ domain: "FOOD", axes, options, quorum: { status: "QUORUM" }, recommendation: { optionId: "a" } }); assert.equal(proof.recommendation.status, "ELIGIBLE"); assert.equal("score" in proof, false); assert.equal("combinedScore" in proof, false); assert.match(proof.truthBoundary, /No universal or moral score/i); const withheld = buildDecisionProof({ domain: "FOOD", axes, options, quorum: { status: "NO_QUORUM" }, recommendation: { optionId: "a" } }); assert.equal(withheld.recommendation.status, "WITHHELD"); assert.equal(withheld.recommendation.value, null); });
test("paid ranking influence is a hard stop", () => { const proof = buildDecisionProof({ domain: "FOOD", axes, options, quorum: { status: "QUORUM" }, sources: [{ id: "paid", paidRankingInfluence: true }], recommendation: { optionId: "a" } }); assert.equal(proof.recommendation.gate, "WITHHELD_SPONSOR_CONFLICT"); });
test("WALLET separates OBSERVED, UNKNOWN and UNAVAILABLE", () => { const observed = normaliseWalletEnvelope({ kind: "found", latest: { price: 39.9, currency: "NOK", date: new Date().toISOString() } }); assert.equal(observed.evidenceState, "OBSERVED"); assert.equal(normaliseWalletEnvelope({ kind: "not_found" }).evidenceState, "UNKNOWN"); assert.equal(normaliseWalletEnvelope({ kind: "source_error" }).evidenceState, "UNAVAILABLE"); });
test("PLANET category evidence is MODELLED and never exact SKU footprint", () => { const planet = evaluatePlanet({ name: "Havregryn", categoryTags: ["en:rolled-oats", "en:breakfast-cereals"], categoryControl: { profileId: "rolled_oats", family: "breakfast_cereal", label: "Rolled oats" }, dataQuality: { state: "complete", conflicts: [] } }); assert.equal(planet.evidenceState, "MODELLED"); assert.equal(planet.exactSkuFootprint, false); assert.equal(planet.directness, "CATEGORY PROXY"); });
test("Matvaretabellen is official reference evidence and not a silent barcode substitute", () => { assert.match(referenceSource, /matvaretabellen\.no\/api\/nb\/foods\.json/); assert.match(referenceSource, /Mattilsynet/); assert.match(referenceSource, /OFFICIAL NORWEGIAN FOOD COMPOSITION TABLE/); assert.match(referenceSource, /evidenceState: "OBSERVED"/); assert.match(referenceSource, /evidenceState: "UNAVAILABLE"/); assert.match(referenceSource, /not silently substituted for a barcode-specific product record/i); });
