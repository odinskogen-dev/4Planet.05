import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("four public products have distinct routes and a context-preserving switcher", () => {
  const routes = read("src/routes/router.tsx");
  const nav = read("src/product/ProductNav.tsx");
  for (const route of ["/atlas", "/species", "/impact"]) assert.match(routes + nav, new RegExp(route.replace("/", "\\/")));
  assert.match(routes, /<Route path="\/" element=\{<PublicCredibilityHome \/>\}/);
  assert.match(routes, /<Route path="\/story" element=\{<Navigate to="\/" replace \/>\}/);
  assert.match(routes, /function AtlasRoute\(\)[\s\S]+<PublicWorld/);
  assert.match(routes, /<Route path="\/atlas" element=\{<AtlasRoute \/>\}/);
  assert.match(nav, /key: "4PLANET", label: "4PLANET", path: "\/"/);
  for (const key of ["entity", "journey", "record"]) assert.match(nav, new RegExp(`"${key}"`));
  assert.match(routes, /SpeciesCredibilityProfile/);
  assert.match(routes, /<Route path="\/species\/orca" element=\{<OrcaGold \/>\}/);
  assert.match(routes, /PersonalImpactRecordPage/);
});

test("integrated controls expose keyboard and assistive-technology contracts", () => {
  const nav = read("src/product/ProductNav.tsx");
  const species = read("src/pages/integrated/Species.tsx");
  const impact = read("src/pages/integrated/ImpactPrototype.tsx");
  const world = read("src/earth/World.tsx");
  const publicWorld = read("src/earth/PublicWorld.tsx");
  assert.match(nav, /<nav[^>]+aria-label="4PLANET product navigation"/);
  assert.match(nav, /aria-current=/);
  assert.match(nav, /PUBLIC PREVIEW/);
  assert.match(species, /<button[\s\S]+ADD TO LOCAL WATCH/);
  assert.match(impact, /<button[\s\S]+CREATE LOCAL TEST RECORD/);
  assert.match(impact, /aria-label="Personal Impact test share card"/);
  assert.match(impact, /role="alert"/);
  assert.match(world, /keyboard: true/);
  assert.match(publicWorld, /document\.createElement\("canvas"\)/);
  assert.match(publicWorld, /getContext\("webgl2"/);
  assert.match(publicWorld, /failIfMajorPerformanceCaveat: true/);
  assert.match(publicWorld, /INTERACTIVE ATLAS UNAVAILABLE ON THIS DEVICE/);
  assert.match(publicWorld, /NO SOURCE, DELIVERY OR IMPACT STATUS HAS BEEN INFERRED/);
});

test("globe suppresses basemap symbols and disables duplicate world copies", () => {
  const world = read("src/earth/World.tsx");
  assert.match(world, /setBackfaceSafeLabels/);
  assert.match(world, /layer\.type !== "symbol"/);
  assert.match(world, /renderWorldCopies: false/);
  assert.match(world, /flat \? originalVisibility\.get\(layer\.id\) : "none"/);
});

test("truth spine keeps eight record classes separate", () => {
  const truth = read("src/data/truthSpine.ts");
  for (const recordType of ["SOURCE_RECORD", "OBSERVATION", "SIGNAL", "INTERPRETATION", "CONTRIBUTION", "DELIVERY", "OUTCOME", "IMPACT"]) assert.match(truth, new RegExp(`"${recordType}"`));
  assert.match(truth, /signalIds: \[\]/);
  assert.match(truth, /No Signal has been created from this Observation/);
});

test("working species identities use accepted GBIF keys", () => {
  const profiles = read("src/data/species.ts");
  const systems = read("src/planet/livingSystems.ts");
  for (const key of [2440483, 5220086, 1341976]) assert.match(profiles + systems, new RegExp(String(key)));
  assert.doesNotMatch(systems, /humpback: taxonId\(2440735\)/);
});

test("Orca fixture is an exact attributed occurrence, not fabricated activity", () => {
  const truth = read("src/data/truthSpine.ts");
  assert.match(truth, /5939349319/);
  assert.match(truth, /Karl Anders Olaussen/);
  assert.match(truth, /CC BY 4\.0/);
  assert.match(truth, /COORDINATE_ROUNDED/);
  assert.match(truth, /HUMAN_OBSERVATION/);
  assert.doesNotMatch(truth, /Orca population (rose|fell|declined|increased)/i);
});

test("new source-aware journeys add no unregistered media rights burden", () => {
  const species = read("src/pages/integrated/Species.tsx");
  const impact = read("src/pages/integrated/ImpactPrototype.tsx");
  const truth = read("src/data/truthSpine.ts");
  assert.doesNotMatch(species + impact, /<img|backgroundImage|url\(/);
  assert.match(truth, /licence: "CC BY 4\.0"/);
  assert.match(truth, /attribution: "Karl Anders Olaussen; record published through GBIF"/);
  assert.match(truth, /rightsStatus: "CONDITIONAL"/);
});

test("migration enables RLS and exposes no public Impact records", () => {
  const sql = read("supabase/migrations/20260722163000_truth_spine.sql");
  for (const table of ["source_records", "taxon_observations", "signals", "interpretations", "impact_unit_definitions", "contributions", "deliveries", "outcomes", "impacts", "product_contexts"]) assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  assert.match(sql, /revoke all on public\.contributions, public\.deliveries, public\.outcomes, public\.impacts from anon, authenticated/i);
  assert.doesNotMatch(sql, /create policy .*contributions.* for insert/i);
  assert.match(sql, /source_records_immutable/);
});

test("Tree and Plastic remain local TEST records with no delivery", () => {
  const impact = read("src/impact/prototype.ts");
  for (const token of ["tree", "plastic", "TEST RECORD — NO PHYSICAL DELIVERY", "NOT_DELIVERED", "NOT_ASSESSED", "provider:fixture:none", "NO_PROVIDER_REQUEST"]) assert.match(impact, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(impact, /fetch\(/);
});

test("public preview headers and status boundaries are committed", () => {
  const headers = read("public/_headers");
  const status = read("docs/PUBLIC_PREVIEW_STATUS.md");
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(status, /PUBLIC PREVIEW CANDIDATE \/ DEPLOYED \/ RELEASE GATE CLOSED/);
  assert.match(status, /TEST RECORD — NO PHYSICAL DELIVERY/);
  assert.match(status, /does not claim/);
});

test("rollback removes only the prototype truth-spine objects", () => {
  const down = read("supabase/rollback/20260722163000_truth_spine.down.sql");
  assert.match(down, /^begin;/);
  assert.match(down, /drop table if exists public\.product_contexts/);
  assert.match(down, /drop table if exists public\.source_records/);
  assert.match(down, /commit;/);
  assert.doesNotMatch(down, /drop schema|drop database/i);
});
