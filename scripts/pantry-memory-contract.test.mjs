import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const memory = await readFile(new URL("../src/food/pantryMemory.ts", import.meta.url), "utf8");
const ui = await readFile(new URL("../src/pages/sapien/PantryChoice.tsx", import.meta.url), "utf8");

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
