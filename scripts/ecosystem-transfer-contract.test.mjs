import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const profiles = await readFile(new URL("../src/ecosystems/goldProfiles.ts", import.meta.url), "utf8");
const experience = await readFile(new URL("../src/components/ecosystem/EcosystemGoldExperience.tsx", import.meta.url), "utf8");
const router = await readFile(new URL("../src/routes/router.tsx", import.meta.url), "utf8");

test("ecosystem transfer keeps Bay, Amazonia and Oslofjord on one shared grammar", () => {
  assert.match(profiles, /BAY_OF_BISCAY_GOLD/);
  assert.match(profiles, /AMAZONIA_GOLD/);
  assert.match(profiles, /OSLOFJORD_TRANSFER/);
  assert.match(experience, /EcosystemSystemGraph/);
  assert.match(router, /\/ecosystem\/:slug/);
});

test("Bay truth keeps survey corridor separate from migration", () => {
  assert.match(profiles, /pilot corridor is not an Orca migration track/i);
  assert.match(profiles, /effort must travel with observations/i);
});

test("Oslofjord transfer fails closed instead of claiming Gold or complete condition", () => {
  assert.match(profiles, /maturity: "TRANSFER_CANDIDATE"/);
  assert.match(profiles, /not a complete condition assessment/i);
  assert.match(profiles, /indicator-specific claims require exact source records/i);
});

test("shared ecosystem surface keeps action distinct from outcome and actor from partnership", () => {
  assert.match(experience, /ACTION ≠ OUTCOME/);
  assert.match(experience, /does not imply partnership, endorsement or ecological outcome/i);
  assert.match(experience, /Missing evidence stays missing/i);
});