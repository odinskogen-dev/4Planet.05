import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const memory = await readFile(new URL("../src/food/pantryMemory.ts", import.meta.url), "utf8");
const ui = await readFile(new URL("../src/pages/sapien/PantryChoice.tsx", import.meta.url), "utf8");
const emblaRuntime = await readFile(new URL("../products/4sapien/supabase/functions/embla-core-preview/index.ts", import.meta.url), "utf8");
const liveFoodPantry = await readFile(new URL("../products/4sapien/source/4sapien-pantry-proof.jsx", import.meta.url), "utf8");

test("FOOD pantry persistence reuses canonical 4PLANET ID and private Person memory", () => {
  assert.match(memory, /getIdentityClient/);
  assert.match(memory, /four_sapien_embla_memories/);
  assert.match(memory, /memory_type:\s*"durable_fact"/);
  assert.match(memory, /confirmation_state:\s*"user_confirmed"/);
  assert.match(memory, /privacy:\s*"private_person"/);
  assert.match(memory, /namespace:\s*"food_pantry_v1"/);
  assert.doesNotMatch(memory, /service_role/i);
});

test("pantry write is verified before it is treated as remembered", () => {
  assert.match(memory, /PANTRY_WRITE_READBACK_FAILED/);
  assert.match(memory, /select=id,value,created_at/);
  assert.match(memory, /supersedes_id/);
  assert.match(memory, /state:\s*"superseded"/);
  assert.match(memory, /state:\s*"deleted"/);
});

test("live 4SAPIEN pantry exposes explicit consent, return value and privacy boundary", () => {
  assert.match(ui, /Remember this pantry/);
  assert.match(ui, /Sign in to remember this/);
  assert.match(ui, /return_value/);
  assert.match(ui, /memory_written/);
  assert.match(ui, /value_reached/);
  assert.match(ui, /value_action/);
  assert.match(ui, /not shared PLANETBRAIN truth/i);
  assert.match(ui, /user-confirmed pantry items/i);
});


test("FOOD loop records only bounded privacy-safe measurement fields", () => {
  assert.match(memory, /four_sapien_embla_events/);
  assert.match(memory, /FOOD_VALUE_PAYLOAD_KEYS/);
  assert.match(memory, /food_second_value_reached/);
  assert.match(memory, /embla-core-preview/);
  assert.match(memory, /measurement_event/);
  assert.match(memory, /useful_outcome/);
  assert.doesNotMatch(memory, /food_value_signal/);
  assert.doesNotMatch(memory, /payload:\s*\{[^}]*pantry/s);
  assert.doesNotMatch(memory, /payload:\s*\{[^}]*prompt/s);
});

test("FOOD choice can persist private user decision state without claiming outcome", () => {
  assert.match(memory, /four_sapien_decisions/);
  assert.match(memory, /evidence_class:\s*"USER_DECISION"/);
  assert.match(ui, /Use this option/);
  assert.match(ui, /not that the meal was cooked or useful/i);
  assert.match(ui, /Was this comparison useful for this task/);
  assert.match(ui, /never ingredient names, pantry contents, prompts or free text/i);
});


test("Embla reads the same owner-RLS pantry memory instead of a parallel pantry schema", () => {
  assert.match(emblaRuntime, /name==="read_pantry"/);
  assert.match(emblaRuntime, /four_sapien_embla_memories/);
  assert.match(emblaRuntime, /namespace==="food_pantry_v1"/);
  assert.match(emblaRuntime, /truth:"USER_CONFIRMED"/);
  assert.match(emblaRuntime, /UNKNOWN_NO_PANTRY/);
  assert.doesNotMatch(emblaRuntime, /PANTRY_SCHEMA_NOT_IMPLEMENTED/);
  assert.match(emblaRuntime, /Purchased is not consumed/);
});

test("Human Utility recruitment attribution is bounded and never stores raw query parameters", () => {
  assert.match(ui, /get\('src'\) === 'human_utility'/);
  assert.match(ui, /human_utility_recruitment/);
  assert.match(ui, /direct_or_unknown/);
  assert.match(ui, /food_landing/);
  assert.doesNotMatch(ui, /utm_/i);
});


test("actual 4SAPIEN Food source closes the bounded measurement and decision seams without raw pantry analytics", () => {
  assert.match(liveFoodPantry, /four_sapien_decisions/);
  assert.match(liveFoodPantry, /USER_DECISION/);
  assert.match(liveFoodPantry, /food_second_value_reached/);
  assert.match(liveFoodPantry, /food_context_saved/);
  assert.match(liveFoodPantry, /food_context_loaded/);
  assert.match(liveFoodPantry, /SB\.functions\.invoke\("embla-core-preview"/);
  assert.match(liveFoodPantry, /measurement_event:"useful_outcome"/);
  assert.match(liveFoodPantry, /human_utility_recruitment/);
  assert.match(liveFoodPantry, /aldri ingrediensnavn, beholdning, prompts eller fritekst/i);
  assert.doesNotMatch(liveFoodPantry, /payload:\s*\{[^}]*pantry/s);
  assert.doesNotMatch(liveFoodPantry, /payload:\s*\{[^}]*entry/s);
});


test("async FOOD pantry state remains bound to the initiating authenticated owner", () => {
  const guardSource = liveFoodPantry.match(/function foodOwnerCurrent\([^}]+\n\}/)?.[0];
  assert.ok(guardSource, "owner guard helper must be present");
  const foodOwnerCurrent = Function(`${guardSource}; return foodOwnerCurrent;`)();
  assert.equal(foodOwnerCurrent("user-a", "user-a"), true);
  assert.equal(foodOwnerCurrent("user-b", "user-a"), false);
  assert.equal(foodOwnerCurrent(null, "user-a"), false);
  assert.equal(foodOwnerCurrent("user-a", null), false);

  assert.match(liveFoodPantry, /recordHumanUtility=async\(helpful,ownerId\)/);
  assert.match(liveFoodPantry, /recordHumanUtility\(helpful,ownerId\)/);
  assert.match(liveFoodPantry, /const ownerId=userId, currentRecord=record;/);
  assert.match(liveFoodPantry, /startedAtRef\.current=Date\.now\(\);/);
  assert.match(liveFoodPantry, /setSave\("UNSAVED"\);setBusy\(false\);/);
  assert.match(liveFoodPantry, /\.eq\("user_id",ownerId\)/);
  assert.match(liveFoodPantry, /catch\(_\)\{if\(foodOwnerCurrent\(identityRef\.current,ownerId\)\)setSave\("SAVE_FAILED_RECHECK"\);\}/);
  assert.match(liveFoodPantry, /catch\(_\)\{if\(foodOwnerCurrent\(identityRef\.current,ownerId\)\)setSave\("REMOVE_FAILED_RECHECK"\);\}/);
  assert.doesNotMatch(liveFoodPantry, /catch\(_\)\{setDecisionState\("ERROR"\)/);
  assert.doesNotMatch(liveFoodPantry, /catch\(_\)\{setSave\("(?:SAVE|REMOVE)_FAILED_RECHECK"\)/);
  const guardCount = liveFoodPantry.match(/foodOwnerCurrent\(identityRef\.current,ownerId\)/g)?.length ?? 0;
  assert.ok(guardCount >= 12, `expected async owner guards, found ${guardCount}`);
});


test("FOOD choice surface exposes and blocks constraint-conflict and unknown options", () => {
  assert.match(liveFoodPantry, /const choiceBlocked=o\.status==="CONSTRAINT_CONFLICT"\|\|o\.status==="UNKNOWN"/);
  assert.match(liveFoodPantry, /option\.status==="CONSTRAINT_CONFLICT"\|\|option\.status==="UNKNOWN"/);
  assert.match(liveFoodPantry, /o\.status==="CONSTRAINT_CONFLICT"&&<p role="alert">/);
  assert.match(liveFoodPantry, /o\.status==="UNKNOWN"&&<p role="status">UKJENT:/);
  assert.match(liveFoodPantry, /disabled=\{busy\|\|decisionState==="SAVING"\|\|choiceBlocked\}/);
  assert.match(liveFoodPantry, /aria-disabled=\{choiceBlocked\}/);
  const blocked = status => status === "CONSTRAINT_CONFLICT" || status === "UNKNOWN";
  assert.equal(blocked("CONSTRAINT_CONFLICT"), true);
  assert.equal(blocked("UNKNOWN"), true);
  assert.equal(blocked("CAN_MAKE_WITH_REPORTED_STOCK"), false);
  assert.equal(blocked("NEEDS_ITEMS"), false);
});


test("pantry supersede and delete fail closed without one exact owner-bound mutation receipt", () => {
  assert.match(memory, /function requirePantryMutationReceipt/);
  assert.match(memory, /!Array\.isArray\(rows\) \|\| rows\.length !== 1/);
  assert.match(memory, /row\.id !== expectedId/);
  assert.match(memory, /row\.user_id !== expectedUserId/);
  assert.match(memory, /row\.state !== expectedState/);
  assert.match(memory, /requireDeletedAt && \(typeof row\.deleted_at !== "string" \|\| row\.deleted_at\.length === 0\)/);

  const returnedRepresentationCount = memory.match(/Prefer: "return=representation"/g)?.length ?? 0;
  assert.ok(returnedRepresentationCount >= 4, "insert, decision, supersede and delete must request receipts");
  assert.match(memory, /state=eq\.active&deleted_at=is\.null&select=id,user_id,state,deleted_at/);
  assert.match(memory, /await patch\.json\(\)[\s\S]*"superseded"[\s\S]*"PANTRY_PRIOR_REVISION_REVIEW_REQUIRED"/);
  assert.match(memory, /await response\.json\(\)[\s\S]*"deleted"[\s\S]*"PANTRY_DELETE_FAILED"[\s\S]*true/);
  assert.doesNotMatch(memory, /Prefer: "return=minimal"[\s\S]{0,500}state: "(?:superseded|deleted)"/);
});
