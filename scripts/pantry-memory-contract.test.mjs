import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const memory = await readFile(new URL("../src/food/pantryMemory.ts", import.meta.url), "utf8");
const ui = await readFile(new URL("../src/pages/sapien/PantryChoice.tsx", import.meta.url), "utf8");
const emblaRuntime = await readFile(new URL("../products/4sapien/supabase/functions/embla-core-preview/index.ts", import.meta.url), "utf8");

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
