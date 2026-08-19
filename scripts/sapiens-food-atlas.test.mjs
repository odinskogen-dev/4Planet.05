import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const router = read("src/routes/router.tsx");
const page = read("src/pages/integrated/SapiensAtlasSandbox.tsx");
const profile = read("src/pages/integrated/HomoSapiensWorld.tsx");
const styles = read("src/styles/sapiens-atlas-story.css");
const profileStyles = read("src/styles/homo-sapiens-gold.css");
const chains = read("src/data/sapiensChains.ts");
const evidence = read("src/data/sapiensFoodEvidence.ts");
const api = read("functions/api/sapiens-food.ts");

test("S4PIENS sandbox is isolated from the canonical S4PIENS domain route", () => {
  assert.match(router, /path="\/sandbox\/s4piens"/);
  assert.match(router, /path="\/s4piens" element={<Navigate to="\/domains\/s4piens" replace \/>}/);
  assert.match(router, /path="\/species\/homo-sapiens"/);
});

test("FOOD is the one Gold Standard chain and the registry has 20 working families", () => {
  assert.match(chains, /id: "food"[\s\S]*status: "GOLD_STANDARD"/);
  const chainRows = [...chains.matchAll(/\{ id: "[^"]+", label: "[^"]+", humanNeed: "[^"]+", status: "(?:GOLD_STANDARD|MAPPED_NEXT)"/g)];
  assert.equal(chainRows.length, 20);
  assert.equal(chainRows.filter((match) => match[0].includes('status: "GOLD_STANDARD"')).length, 1);
});

test("FOOD causal grammar spans human demand, chain, pressure, life and solutions", () => {
  for (const token of ["DEMAND + DIET", "FARM + SEA", "INPUTS", "PROCESSING", "TRADE + LOGISTICS", "LOSS + WASTE", "LAND CONVERSION", "WATER", "CLIMATE", "LIFE"]) {
    assert.ok(chains.includes(token) || page.includes(token), `missing ${token}`);
  }
  assert.match(page, /SOLUTIONS MAP/);
  assert.match(page, /Follow one meal\./);
  assert.match(page, /source records/i);
});

test("v0.3 is Atlas-first and uses the shared NASA globe from frame one", () => {
  assert.match(page, /gibs\("BlueMarble_ShadedRelief_Bathymetry"/);
  assert.match(page, /id: "atlas"[\s\S]*title: "You are here\."[\s\S]*scene: "ATLAS"/);
  assert.doesNotMatch(page, /activeChapter >= 2/);
  assert.match(page, /sapiens-blue-marble/);
  assert.match(page, /NASA EARTH/);
  assert.match(page, /OPEN FREE ATLAS/);
});

test("Homo sapiens Gold experience uses 4PLANET media-registry imagery and the shared graph", () => {
  assert.match(page, /img\("storyHero"\)/);
  assert.match(page, /HumanSpeciesCard/);
  assert.match(page, /SPECIES_ · GBIF 10856082 · IDENTITY KNOWN/);
  assert.match(page, /KnowledgeGraph/);
  assert.match(page, /One species\. Many systems\./);
  for (const token of ["EAT", "DRINK", "POWER", "SHELTER", "WEAR", "MOVE"]) assert.match(page, new RegExp(token));
});

test("the linked Homo sapiens Species route is a photographic Gold reference, not a dead-end", () => {
  assert.match(profile, /img\("cultureAnchor"\)/);
  assert.match(profile, /img\("foodHero"\)/);
  assert.match(profile, /We are not outside the living system\./);
  assert.match(profile, /OPEN HUMAN SYSTEMS ATLAS/);
  assert.match(profile, /GOLD STANDARD 01 · FOOD_/);
  assert.match(profile, /FOOD_PROOF_SIGNALS/);
  for (const state of ["KNOWN", "INTERPRETED", "UNKNOWN WITHOUT MORE EVIDENCE"]) assert.match(profile, new RegExp(state));
  assert.match(profileStyles, /--hs-accent:#FF4D22/);
  assert.match(profileStyles, /hs-gold-proof/);
  assert.match(profileStyles, /Instrument Sans/);
  assert.match(profileStyles, /Fragment Mono/);
});

test("first-contact FOOD proof uses three bounded primary-source signals", () => {
  assert.match(evidence, /value: "32%"/);
  assert.match(evidence, /FAO · FAOSTAT/);
  assert.match(evidence, /dataYear: "2023"/);
  assert.match(evidence, /value: "72%"/);
  assert.match(evidence, /FAO · Land & Water/);
  assert.match(evidence, /value: "1\.05B t"/);
  assert.match(evidence, /UNEP · Food Waste Index 2024/);
  assert.equal([...evidence.matchAll(/checkedOn: "2026-08-19"/g)].length, 3);
  assert.equal([...evidence.matchAll(/limitation:/g)].length, 4); // type + three records
});

test("story choreography remains progressive and relation classes stay distinct", () => {
  for (const token of ["You are here.", "One species. Many systems.", "Follow one meal.", "Now locate the pressure.", "Find what the system depends on.", "Then find leverage."]) {
    assert.match(page, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const relation of ["DEPENDENCY", "PRESSURE", "RESPONSE"]) assert.match(page, new RegExp(relation));
  assert.match(page, /data-sapiens-story-step/);
  assert.match(styles, /position:\s*sticky/);
  assert.match(styles, /sapiens-knowledge__node/);
  assert.match(styles, /sapiens-chainrail/);
  assert.match(styles, /prefers-reduced-motion/);
});

test("4PLANET visual grammar replaces glass dashboard styling", () => {
  assert.match(styles, /--sapiens-accent:\s*#FF4D22/);
  assert.match(styles, /background:\s*#000/);
  assert.match(styles, /sapiens-editorial--paper/);
  assert.match(styles, /sapiens-species-card/);
  assert.match(styles, /Instrument Sans/);
  assert.match(styles, /Fragment Mono/);
  assert.doesNotMatch(styles, /backdrop-filter/);
  assert.doesNotMatch(styles, /border-radius:\s*999px/);
});

test("first live FOOD seam uses Climate TRACE v7 agriculture and fails honestly", () => {
  assert.match(api, /api\.climatetrace\.org\/v7/);
  assert.match(api, /sectors: "agriculture"/);
  assert.match(api, /SCHEMA_CHANGED/);
  assert.match(api, /REQUEST_FAILED/);
  assert.match(page, /\/api\/sapiens-food/);
  assert.match(page, /not a live plume/i);
});

test("FOOD source ledger separates integration, open data, rights review and access gates", () => {
  for (const token of ["FAOSTAT", "Gridded Livestock of the World v4", "AQUASTAT", "Trase", "GLORIA", "Global Forest Watch", "NASA GIBS", "GBIF", "UN Comtrade", "Global Fishing Watch"]) {
    assert.match(chains, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(chains, /LIVE_API/);
  assert.match(chains, /EXISTING_ATLAS/);
  assert.match(chains, /OPEN_DATASET/);
  assert.match(chains, /RIGHTS_REVIEW/);
  assert.match(chains, /ACCESS_GATED/);
  assert.match(chains, /checkedOn: "2026-08-19"/);
});
