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
  assert.match(page, /SOLUTIONS/);
  assert.match(page, /Follow one meal\./);
  assert.match(page, /SOURCE LEDGER/i);
});

test("current choreography starts on shared Earth, then human, FOOD, pressure, evidence, living systems and solutions", () => {
  assert.match(page, /\["earth", "EARTH \/ ATLAS"\][\s\S]*\["human", "HOMO SAPIENS"\][\s\S]*\["food", "FOOD_"\][\s\S]*\["pressure", "PRESSURE"\][\s\S]*\["evidence", "EVIDENCE"\][\s\S]*\["living", "LIVING SYSTEMS"\][\s\S]*\["solutions", "SOLUTIONS"\]/);
  assert.match(page, /id="s4x-earth"[\s\S]*<h1>You are here\.<\/h1>/);
  assert.match(page, /id="s4x-human"[\s\S]*One species\.[\s\S]*Many systems\./);
  assert.match(page, /id="s4x-food"[\s\S]*Follow one meal\./);
  assert.match(page, /gibs\("BlueMarble_ShadedRelief_Bathymetry"/);
  assert.match(page, /sapiens-blue-marble/);
  assert.match(page, /NASA GIBS/);
});

test("Homo sapiens is the semantic centre and the graph opens ordinary human needs without collapsing relation classes", () => {
  assert.match(page, /function HumanGraph/);
  assert.match(page, /s4x-human-core/);
  assert.match(page, /Homo sapiens human systems graph/);
  assert.match(page, /SPECIES_ · GBIF 10856082 · IDENTITY KNOWN/);
  for (const token of ["EAT", "DRINK", "POWER", "SHELTER", "WEAR", "MOVE"]) assert.match(page, new RegExp(token));
  for (const relation of ["DEPENDENCY", "PRESSURE", "RESPONSE"]) assert.match(page, new RegExp(relation));
});

test("the linked Homo sapiens Species route remains a photographic Gold reference", () => {
  assert.match(profile, /img\("cultureAnchor"\)/);
  assert.match(profile, /img\("foodHero"\)/);
  assert.match(profile, /We are not outside the living system\./);
  assert.match(profile, /OPEN HUMAN SYSTEMS ATLAS/);
  assert.match(profile, /GOLD STANDARD 01 · FOOD_/);
  assert.match(profile, /FOOD_PROOF_SIGNALS/);
  for (const state of ["KNOWN", "INTERPRETED", "UNKNOWN WITHOUT MORE EVIDENCE"]) assert.match(profile, new RegExp(state));
  assert.match(profile, /global profile cannot infer one person.s footprint/i);
  assert.match(profileStyles, /--hs-accent:#FF4D22/);
  assert.match(profileStyles, /hs-gold-proof/);
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
  assert.equal([...evidence.matchAll(/limitation:/g)].length, 4);
});

test("story choreography remains progressive and relation classes stay distinct", () => {
  for (const id of ["earth", "human", "food", "pressure", "evidence", "living", "solutions"]) {
    assert.match(page, new RegExp(`id="s4x-${id}"`));
  }
  assert.match(page, /data-s4x-chapter/);
  assert.match(page, /HUMAN NEED → VALUE CHAIN → PLACE → PRESSURE → LIFE → RESPONSE/);
  assert.match(page, /Co-location is useful evidence — but it is not causation\./);
  assert.match(page, /Missing or failed sources stay missing — never rendered as zero\./);
  for (const relation of ["DEPENDENCY", "PRESSURE", "RESPONSE"]) assert.match(page, new RegExp(relation));
  assert.match(styles, /position:\s*sticky/);
  assert.match(styles, /s4x-human-graph/);
  assert.match(styles, /s4x-food-cinema/);
  assert.match(styles, /prefers-reduced-motion/);
});

test("premium visual grammar is coded rather than flattened into a screenshot", () => {
  assert.match(styles, /--s4x-accent:#FF4D22/);
  assert.match(styles, /s4x-earth/);
  assert.match(styles, /s4x-human-graph/);
  assert.match(styles, /s4x-food-cinema/);
  assert.match(styles, /s4x-pressure/);
  assert.match(styles, /sapiens-immersive-nav/);
  assert.match(styles, /Instrument Sans/);
  assert.match(styles, /Fragment Mono/);
  assert.match(styles, /background:#000/);
});

test("first live FOOD seam uses Climate TRACE v7 agriculture and fails honestly", () => {
  assert.match(api, /api\.climatetrace\.org\/v7/);
  assert.match(api, /sectors: "agriculture"/);
  assert.match(api, /SCHEMA_CHANGED/);
  assert.match(api, /REQUEST_FAILED/);
  assert.match(page, /\/api\/sapiens-food/);
  assert.match(page, /CLIMATE TRACE · SOURCE UNAVAILABLE/);
  assert.match(page, /Missing or failed sources stay missing — never rendered as zero\./);
  assert.match(page, /NOT LOCAL CAUSAL PROOF/);
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
