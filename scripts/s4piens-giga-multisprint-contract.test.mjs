import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DECISION_AXIS_IDS, DECISION_EVIDENCE_STATES, buildDecisionProof } from "../src/choice/decision-proof.js";
import { EVIDENCE_STATES } from "../src/food/evidence-state.js";
import { normaliseWalletEnvelope } from "../src/food/pick-wallet.js";
import { evaluatePlanet } from "../src/food/pick-planet.js";

const foodReferenceSource = await readFile(new URL("../functions/api/food-reference.ts", import.meta.url), "utf8");
const emblaSource = await readFile(new URL("../src/choice/embla.ts", import.meta.url), "utf8");

const canonicalAxes = [
  { id: "YOU", evidenceState: "MODELLED", confidence: "MODERATE", summary: "Health evidence interpreted from product facts and guidance." },
  { id: "WALLET", evidenceState: "OBSERVED", confidence: "MODERATE", summary: "Observed NOK price." },
  { id: "PLANET", evidenceState: "MODELLED", confidence: "LIMITED", summary: "Category proxy only." },
];

const twoOptions = [
  { id: "a", label: "Option A" },
  { id: "b", label: "Option B" },
];

test("S4PIENS uses exactly the canonical five evidence states", () => {
  assert.deepEqual(EVIDENCE_STATES, ["OBSERVED", "MODELLED", "CACHED", "UNKNOWN", "UNAVAILABLE"]);
  assert.deepEqual(DECISION_EVIDENCE_STATES, EVIDENCE_STATES);
  assert.deepEqual(DECISION_AXIS_IDS, ["YOU", "WALLET", "PLANET"]);
});

test("Decision Proof cannot collapse YOU/WALLET/PLANET into one score", () => {
  const proof = buildDecisionProof({
    domain: "FOOD",
    options: twoOptions,
    axes: canonicalAxes,
    quorum: { status: "QUORUM", independentEvidenceFamilies: 3 },
    recommendation: { optionId: "a" },
  });
  assert.equal(proof.recommendation.status, "ELIGIBLE");
  assert.equal(proof.recommendation.gate, "EVIDENCE_QUORUM");
  assert.equal(proof.axes.length, 3);
  assert.equal("score" in proof, false);
  assert.equal("combinedScore" in proof, false);
  assert.match(proof.truthBoundary, /No universal or moral score/i);
});

test("Decision Proof withholds recommendation without quorum", () => {
  const proof = buildDecisionProof({ domain: "FOOD", options: twoOptions, axes: canonicalAxes, quorum: { status: "NO_QUORUM" }, recommendation: { optionId: "a" } });
  assert.equal(proof.recommendation.status, "WITHHELD");
  assert.equal(proof.recommendation.gate, "WITHHELD_NO_QUORUM");
  assert.equal(proof.recommendation.value, null);
});

test("paid ranking influence is a hard Decision Proof stop", () => {
  const proof = buildDecisionProof({
    domain: "FOOD",
    options: twoOptions,
    axes: canonicalAxes,
    quorum: { status: "QUORUM" },
    sources: [{ id: "sponsor-feed", sourceClass: "COMMERCIAL", independenceKey: "sponsor", paidRankingInfluence: true }],
    recommendation: { optionId: "a" },
  });
  assert.equal(proof.evidence.sponsorIndependent, false);
  assert.equal(proof.recommendation.status, "WITHHELD");
  assert.equal(proof.recommendation.gate, "WITHHELD_SPONSOR_CONFLICT");
});

test("WALLET distinguishes an observation from unavailable and unknown evidence", () => {
  const observed = normaliseWalletEnvelope({
    kind: "found",
    latest: { price: 39.9, currency: "NOK", date: new Date().toISOString(), unitPrice: 79.8, unitPriceUnit: "NOK/kg", location: { brand: "Test store", city: "Oslo" } },
    source: { id: "open_prices" },
  });
  assert.equal(observed.evidenceState, "OBSERVED");
  assert.equal(normaliseWalletEnvelope({ kind: "source_error" }).evidenceState, "UNAVAILABLE");
  assert.equal(normaliseWalletEnvelope({ kind: "not_found" }).evidenceState, "UNKNOWN");
});

test("PLANET is explicitly MODELLED when category proxy evidence exists and never pretends SKU footprint", () => {
  const product = {
    name: "Havregryn",
    categoryTags: ["en:rolled-oats", "en:breakfast-cereals"],
    categoryControl: { profileId: "rolled_oats", family: "breakfast_cereal", label: "Rolled oats" },
    dataQuality: { state: "complete", conflicts: [] },
  };
  const planet = evaluatePlanet(product);
  assert.equal(planet.evidenceState, "MODELLED");
  assert.equal(planet.exactSkuFootprint, false);
  assert.equal(planet.directness, "CATEGORY PROXY");
  assert.match(planet.limitation, /No brand winner|not resolved at product level/i);
});

test("Matvaretabellen adapter is a Norwegian official reference spine, never a silent SKU substitute", () => {
  assert.match(foodReferenceSource, /www\.matvaretabellen\.no\/api\/nb\/foods\.json/);
  assert.match(foodReferenceSource, /Mattilsynet/);
  assert.match(foodReferenceSource, /OFFICIAL NORWEGIAN FOOD COMPOSITION TABLE/);
  assert.match(foodReferenceSource, /evidenceState: "OBSERVED"/);
  assert.match(foodReferenceSource, /evidenceState: "UNAVAILABLE"/);
  assert.match(foodReferenceSource, /not silently substituted for a barcode-specific product record/i);
});

test("Embla recognition does not manufacture controlled FOOD category readiness", () => {
  assert.match(emblaSource, /recognised shopping-list noun is not automatically a controlled comparison category/i);
  assert.doesNotMatch(emblaSource, /category: "COFFEE"/);
  assert.doesNotMatch(emblaSource, /category: "MILK"/);
  assert.doesNotMatch(emblaSource, /category: "BUTTER"/);
});
