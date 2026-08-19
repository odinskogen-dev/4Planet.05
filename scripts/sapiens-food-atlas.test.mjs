import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const router = read("src/routes/router.tsx");
const page = read("src/pages/integrated/SapiensAtlasSandbox.tsx");
const styles = read("src/styles/sapiens-atlas-story.css");
const chains = read("src/data/sapiensChains.ts");
const api = read("functions/api/sapiens-food.ts");

test("S4PIENS sandbox is isolated from the canonical S4PIENS domain route", () => {
  assert.match(router, /path="\/sandbox\/s4piens"/);
  assert.match(router, /path="\/s4piens" element={<Navigate to="\/domains\/s4piens" replace \/>}/);
});

test("FOOD is the one Gold Standard chain and the registry has 20 working families", () => {
  assert.match(chains, /id: "food"[\s\S]*status: "GOLD_STANDARD"/);
  const chainRows = [...chains.matchAll(/\{ id: "[^"]+", label: "[^"]+", humanNeed: "[^"]+", status: "(?:GOLD_STANDARD|MAPPED_NEXT)"/g)];
  assert.equal(chainRows.length, 20);
  assert.equal(chainRows.filter((match) => match[0].includes('status: "GOLD_STANDARD"')).length, 1);
});

test("FOOD causal grammar spans human demand, value chain, pressures, sources and solutions", () => {
  for (const token of ["DEMAND + DIET", "FARM + SEA", "INPUTS", "PROCESSING", "TRADE + LOGISTICS", "LOSS + WASTE", "LAND CONVERSION", "WATER", "CLIMATE", "LIFE", "SOLUTIONS MAP"]) {
    assert.ok(chains.includes(token) || page.includes(token), `missing ${token}`);
  }
  assert.match(page, /What does a meal touch\?/);
  assert.match(page, /source-aware/i);
});

test("cinematic story space keeps human first, globe progressive, and relationships explicit", () => {
  for (const token of ["You are here.", "Follow one meal.", "Now put it on Earth.", "Where does demand meet pressure?", "Then find the living system.", "Where can the system change?"]) {
    assert.match(page, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const relation of ["DEPENDENCY", "PRESSURE", "RESPONSE"]) assert.match(page, new RegExp(relation));
  assert.match(page, /activeChapter >= 2/);
  assert.match(page, /data-sapiens-story-step/);
  assert.match(styles, /position:\s*sticky/);
  assert.match(styles, /sapiens-node-line/);
  assert.match(styles, /sapiens-chainrail/);
  assert.match(styles, /prefers-reduced-motion/);
});

test("v0.4 preserves the alternating narrative article grammar and removes the black tail", () => {
  assert.match(styles, /min-height:\s*600svh/);
  assert.match(styles, /sapiens-story-chapter:nth-child\(even\)\{justify-content:flex-end\}/);
  assert.match(styles, /sapiens-story-chapter:nth-child\(odd\).*sapiens-chapter-card/);
  assert.match(styles, /sapiens-story-chapter\.is-active \.sapiens-chapter-card/);
  assert.match(styles, /menu-trigger\{color:#FF4D22!important\}/);
  assert.match(styles, /body:has\(\.sapiens-story\) header/);
});

test("first live FOOD seam uses Climate TRACE v7 agriculture and fails honestly", () => {
  assert.match(api, /api\.climatetrace\.org\/v7/);
  assert.match(api, /sectors: "agriculture"/);
  assert.match(api, /SCHEMA_CHANGED/);
  assert.match(api, /REQUEST_FAILED/);
  assert.match(page, /\/api\/sapiens-food/);
  assert.match(page, /not a live plume/i);
});

test("FOOD source stack keeps open, existing and gated sources distinct", () => {
  for (const token of ["FAOSTAT", "Gridded Livestock of the World v4", "AQUASTAT", "Global Forest Watch", "NASA GIBS", "GBIF", "UN Comtrade", "Global Fishing Watch"]) {
    assert.match(chains, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(chains, /LIVE_API/);
  assert.match(chains, /EXISTING_ATLAS/);
  assert.match(chains, /OPEN_DATASET/);
  assert.match(chains, /ACCESS_GATED/);
});
