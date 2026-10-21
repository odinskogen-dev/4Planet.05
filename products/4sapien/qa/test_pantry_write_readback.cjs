#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = path.join(__dirname, "../source/4sapien-pantry-proof.jsx");
const source = fs.readFileSync(sourcePath, "utf8");
const helperSource = source.match(/function pantryWriteReadbackMatches\([\s\S]*?\n}\nfunction FoodPantryProof/);
assert.ok(helperSource, "pantry readback helper must remain adjacent to the FOOD proof");

const sandbox = {};
vm.runInNewContext(helperSource[0].replace(/\nfunction FoodPantryProof[\s\S]*$/, ""), sandbox);
const matches = sandbox.pantryWriteReadbackMatches;
assert.equal(typeof matches, "function");

const expectedValue = {
  namespace: "food_pantry_v1",
  pantry: [
    { name: "Havregryn", amount: 80, unit: "g" },
    { name: "Melk", amount: null, unit: "ml" },
  ],
  budgetNok: 120,
  dataState: "user_confirmed",
  purchasedIsNotConsumed: true,
};
const receipt = {
  id: "memory-1",
  state: "active",
  confirmation_state: "user_confirmed",
  value: structuredClone(expectedValue),
};

assert.equal(matches(receipt, "memory-1", expectedValue), true, "exact authoritative receipt passes");

for (const [label, mutate] of [
  ["canonical id mismatch", value => { value.id = "memory-2"; }],
  ["inactive row", value => { value.state = "superseded"; }],
  ["unconfirmed row", value => { value.confirmation_state = "inferred"; }],
  ["namespace mismatch", value => { value.value.namespace = "other"; }],
  ["pantry item mismatch", value => { value.value.pantry[0].amount = 40; }],
  ["pantry order mismatch", value => { value.value.pantry.reverse(); }],
  ["budget mismatch", value => { value.value.budgetNok = 80; }],
  ["data-state mismatch", value => { value.value.dataState = "inferred"; }],
  ["consumption boundary missing", value => { value.value.purchasedIsNotConsumed = false; }],
]) {
  const candidate = structuredClone(receipt);
  mutate(candidate);
  assert.equal(matches(candidate, "memory-1", expectedValue), false, label);
}

assert.match(source, /\.select\("id,value,state,confirmation_state"\)/, "readback selects receipt state");
assert.match(source, /pantryWriteReadbackMatches\(readback,data\.id,row\.value\)/, "save state uses exact receipt contract");
console.log("4SAPIEN pantry write readback contract: PASS");
