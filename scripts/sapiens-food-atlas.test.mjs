import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const router = read("src/routes/router.tsx");
const page = read("src/pages/integrated/SapiensAtlasSandbox.tsx");
const systems = read("src/pages/integrated/SapiensSystemsProfiles.tsx");
const actors = read("src/data/actorProfiles.ts");
const styles = read("src/styles/sapiens-atlas-story.css");
const goldStyles = read("src/styles/sapiens-atlas-gold.css");
const chains = read("src/data/sapiensChains.ts");
const api = read("functions/api/sapiens-food.ts");
const lifeApi = read("functions/api/sapiens-life.ts");
const earthLayers = read("src/earth/layers.ts");

test("S4PIENS domain has a host-aware Human front door while 4PLANET keeps canonical redirect", () => {
  assert.match(router, /path="\/sandbox\/s4piens"/);
  assert.match(router, /const isSapiensUniverseHost/);
  assert.match(router, /path="\/s4piens" element=\{sapiensHost \? <SapiensFrontDoor \/> : <Navigate to="\/domains\/s4piens" replace \/>\}/);
  assert.match(router, /path="\/food" element=\{sapiensHost \? <SapiensFoodEntry \/> : <Navigate to="\/missions\/food" replace \/>\}/);
  assert.match(systems, /SPECIES · HOMO SAPIENS/);
  assert.match(systems, /FOOD_ OPEN · OTHER SYSTEMS LOCKED/);
});

test("S4PIENS response chain includes Innovations, Actors and Action without collapsing their roles", () => {
  for (const token of ["UNDERSTANDING", "SOLUTIONS", "INNOVATIONS", "ACTORS", "ACTION"]) assert.match(systems, new RegExp(token));
  assert.match(router, /path="\/actors"/);
  assert.match(router, /path="\/actors\/:slug"/);
  assert.match(router, /path="\/innovations\/:slug"/);
  assert.match(actors, /P17-A036/);
  assert.match(actors, /P17-A307/);
  assert.match(actors, /GOLD 01 · SCIENCE \+ MONITORING/);
  assert.match(actors, /GOLD 02 · RESTORATION \+ IMPLEMENTATION/);
  assert.match(actors, /No sponsorship price, contract, funding commitment or outcome claim is locked/);
  assert.match(actors, /do not equal acceptance, partnership, contract, price or verified outcome/i);
});

test("FOOD is the one Gold Standard chain and the registry has 20 working families", () => {
  assert.match(chains, /id: "food"[\s\S]*status: "GOLD_STANDARD"/);
  const chainRows = [...chains.matchAll(/\{ id: "[^"]+", label: "[^"]+", humanNeed: "[^"]+", status: "(?:GOLD_STANDARD|MAPPED_NEXT)"/g)];
  assert.equal(chainRows.length, 20);
  assert.equal(chainRows.filter((match) => match[0].includes('status: "GOLD_STANDARD"')).length, 1);
});

test("Gold story keeps one persistent scene and seven progressive chapters", () => {
  for (const token of ["You are here.", "Follow one meal.", "Now put it on Earth.", "Where does demand meet pressure?", "Then find the living system.", "Where can the system change?", "The story stays open."]) {
    assert.match(page, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(page, /data-sapiens-story-step/);
  assert.match(styles, /position:\s*sticky/);
  assert.match(styles, /sapiens-story-chapter:nth-child\(even\)/);
  assert.match(goldStyles, /min-height:\s*700svh/);
  assert.match(goldStyles, /sapiens-stage__aurora/);
  assert.match(goldStyles, /prefers-reduced-motion/);
});

test("FOOD causal grammar spans demand, chain, pressure, life, source and response", () => {
  for (const token of ["DEMAND + DIET", "FARM + SEA", "INPUTS", "PROCESSING", "TRADE + LOGISTICS", "LOSS + WASTE", "LAND CONVERSION", "WATER", "CLIMATE", "LIFE", "SOLUTIONS MAP"]) {
    assert.ok(chains.includes(token) || page.includes(token), `missing ${token}`);
  }
  for (const relation of ["DEPENDENCY", "PRESSURE", "RESPONSE"]) assert.match(page, new RegExp(relation));
  assert.match(page, /What does a meal touch\?/);
  assert.match(page, /SYSTEM STAGE · NOT PRODUCT PROVENANCE/);
});

test("Gold uses the shared ATLAS layer registry rather than a second map truth system", () => {
  assert.match(page, /import \{ LAYERS \} from "@\/earth\/layers"/);
  assert.match(page, /sapiens-raster-/);
  for (const token of ["bluemarble", "truecolor", "ndvi", "precip", "aerosol", "fires"]) assert.match(page, new RegExp(token));
  assert.match(earthLayers, /NASA GIBS/);
  assert.match(earthLayers, /BlueMarble_ShadedRelief_Bathymetry/);
  assert.match(earthLayers, /MODIS_Terra_NDVI_8Day/);
  assert.match(earthLayers, /IMERG_Precipitation_Rate/);
  assert.match(page, /ONE SHARED MODEL/);
  assert.match(page, /No second map/);
});

test("first live FOOD seam uses Climate TRACE v7 agriculture and fails honestly", () => {
  assert.match(api, /api\.climatetrace\.org\/v7/);
  assert.match(api, /sectors: "agriculture"/);
  assert.match(api, /SCHEMA_CHANGED/);
  assert.match(api, /REQUEST_FAILED/);
  assert.match(page, /\/api\/sapiens-food/);
  assert.match(page, /not a live plume/i);
});

test("live life seam uses bounded GBIF occurrence search and preserves epistemic limits", () => {
  assert.match(lifeApi, /api\.gbif\.org\/v1/);
  assert.match(lifeApi, /occurrence\/search/);
  assert.match(lifeApi, /hasCoordinate/);
  assert.match(lifeApi, /occurrenceStatus/);
  assert.match(lifeApi, /Apis mellifera/);
  assert.match(lifeApi, /Panthera onca/);
  assert.match(lifeApi, /not population estimates/i);
  assert.match(lifeApi, /sampling effort/i);
  assert.match(lifeApi, /does not establish causal ecological impact/i);
  assert.match(page, /\/api\/sapiens-life/);
  assert.match(page, /GBIF · LIVE OCCURRENCE API/);
});

test("source spine keeps live, existing, qualified-next and gated states distinct", () => {
  for (const token of ["FAOSTAT", "Gridded Livestock of the World v4", "AQUASTAT", "Global Forest Watch", "NASA GIBS", "GBIF", "UN Comtrade", "Global Fishing Watch"]) {
    assert.match(chains, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(chains, /LIVE_API/);
  assert.match(chains, /EXISTING_ATLAS/);
  assert.match(chains, /OPEN_DATASET/);
  assert.match(chains, /ACCESS_GATED/);
  assert.match(page, /QUALIFIED NEXT/);
  assert.match(page, /not falsely rendered as live/i);
});

test("Gold response remains evidence-bounded and mission-connected", () => {
  assert.match(page, /INTERVENTION HYPOTHESIS · NOT VERIFIED OUTCOME/);
  assert.match(page, /RESPONSE ≠ OUTCOME/);
  assert.match(page, /\/missions\/food/);
  assert.match(page, /OPEN LIVING SYSTEMS/);
  assert.match(page, /EXPLORE SPECIES/);
});
