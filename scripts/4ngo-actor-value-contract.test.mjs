import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const actor = fs.readFileSync("src/content/actorGold.ts", "utf8");

test("shared Actor Gold grammar can represent a 4NGO need-to-capability value path", () => {
  for (const field of [
    "identifiedNeeds",
    "operationalCapabilities",
    "partnerRequirements",
    "capitalRequirements",
  ]) {
    assert.match(actor, new RegExp(`\\b${field}\\b`), `ActorGoldProfile is missing ${field}`);
  }
});

test("4NGO value proof keeps delivery evidence separate from outcome evidence", () => {
  assert.match(actor, /\bdeliveryEvidence\b/, "ActorGoldProfile is missing deliveryEvidence");
  assert.match(actor, /\boutcomeEvidence\b/, "ActorGoldProfile is missing outcomeEvidence");
  assert.doesNotMatch(
    actor,
    /deliveryEvidence\s*:\s*[^;\n]*outcomeEvidence/,
    "delivery and outcome evidence must remain separate fields",
  );
});

test("4NGO reuses the Universal IMPACT action contract instead of a second action system", () => {
  assert.match(actor, /\bactionContractIds\b/, "ActorGoldProfile has no typed Universal IMPACT link");
  assert.doesNotMatch(actor, /ngoAction(?:Contract|Lifecycle|Proof)/i, "4NGO must not create a parallel action/proof model");
});

test("4NGO claims fail closed until source and proof states support them", () => {
  assert.match(actor, /\bclaimsAllowed\b/, "ActorGoldProfile is missing a structured allowed-claims boundary");
  assert.match(actor, /\bclaimsProhibited\b/, "ActorGoldProfile is missing a structured prohibited-claims boundary");
});
