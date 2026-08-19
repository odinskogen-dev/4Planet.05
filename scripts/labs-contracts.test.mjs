import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const legacyOverview = fs.readFileSync("src/pages/labs/LabsOverview.tsx", "utf8");
const currentOverview = fs.readFileSync("src/pages/labs/LabsOverviewCurrent.tsx", "utf8");
const projection = fs.readFileSync("src/pages/labs/labsProjection.ts", "utf8");
const route = fs.readFileSync("src/pages/labs/LabsV4.tsx", "utf8");
const detail = fs.readFileSync("src/pages/labs/LabsProjectDetailPremium.tsx", "utf8");
const detailV5 = fs.readFileSync("src/pages/labs/LabsProjectDetailV5.tsx", "utf8");
const projectMeta = fs.readFileSync("src/pages/labs/labsProjectMeta.ts", "utf8");
const data = fs.readFileSync("src/pages/labs/labsData.ts", "utf8");
const css = fs.readFileSync("src/pages/labs/labs.css", "utf8");
const v4css = fs.readFileSync("src/pages/labs/labsV4.css", "utf8");
const rootCss = fs.readFileSync("src/pages/labs/labsV4Root.css", "utf8");

test("LABS remains a read-only BRAIN projection, never an invented live status system", () => {
  assert.match(data, /MANUAL BRAIN PROJECTION · READ ONLY/);
  assert.match(currentOverview, /BRAIN remains the authority/);
  assert.match(currentOverview, /MISSING VALUES STAY UNKNOWN/);
  assert.match(detail, /UNKNOWN/);
  assert.doesNotMatch(data, /projectionState\s*=\s*["'`]LIVE/i);
});

test("LABS v5 preserves the founder-loved maze while routing project pages through current projection + goal metadata", () => {
  assert.match(route, /LabsOverviewCurrent/);
  assert.match(route, /if \(!slug\) return <LabsOverview \/>/);
  assert.match(route, /LabsProjectDetailV5/);
  assert.match(detailV5, /LabsProjectDetailPremium/);
  assert.match(detailV5, /withProjectMeta/);
  assert.match(projectMeta, /goalMeta/);
  assert.match(currentOverview, /PROJECT MAZE \/ CONTROL MAP/);
});

test("LABS v4 exposes goals, phases, process overview and upcoming production early in project detail", () => {
  for (const token of [
    "GOALS",
    "PHASES / ROADMAP",
    "PRODUCTION CONTROL",
    "PROCESS OVERVIEW",
    "UPCOMING TASKS / PRODUCTIONS",
    "PROJECT FEED",
    "FOUNDER DECISIONS",
    "CHECKPOINT LOG",
    "LINKED ASSETS",
    "EVIDENCE / AUTHORITY / FRESHNESS",
  ]) assert.ok(detail.includes(token), `missing LABS v4 project-control token: ${token}`);
});

test("4PLANET root carries current locked 30/90 day goals without invented progress percentages", () => {
  assert.match(detail, /30 DAYS · 17 SEP/);
  assert.match(detail, /90 DAYS · 16 NOV/);
  assert.match(detail, /≥1,000 real users/);
  assert.match(detail, /first-money target ≥NOK1\.5m/);
  assert.doesNotMatch(detail, /avg progress/i);
});

test("4PLANET hierarchy includes core systems, domains, missions and explicit BRAIN boundaries", () => {
  for (const token of [
    'title: "NATUREBRAIN"',
    'title: "BRAND"',
    'title: "CONTENT"',
    'title: "CAPITAL"',
    'title: "PRODUCT"',
    'title: "RESEARCH"',
    'title: "FIELD PARTNERS"',
    'title: "4MBASSADORS"',
    'title: "OCE4N"',
    'title: "E4RTH"',
    'title: "S4PIENS"',
    'title: "4CULTURE"',
    'slug: "odin/brain"',
  ]) assert.ok(data.includes(token), `missing hierarchy token: ${token}`);
  assert.match(data, /PL4STIC \/ CLE4N/);
  assert.match(data, /EN3RGY \/ EN4RGY/);
});

test("Aug 19 BRAIN projection surfaces the bounded early-stage 4PLANET project set", () => {
  assert.match(currentOverview, /EARLY STAGE \/ CODE \+ SYSTEM LABS/);
  for (const token of [
    'title: "ATLAS DATA LAB"',
    'title: "NATURE XR"',
    'title: "JAGUAR JOURNEY"',
    'title: "S4PIENS \/ FOOD GOLD"',
    'title: "TREE OF LIFE"',
    'title: "CHOICE"',
    'title: "PLANETARY MAP"',
  ]) assert.ok(projection.includes(token), `missing early-stage project: ${token}`);
  assert.match(projection, /15 historical submissions \/ 14 awaiting \/ 1 rejected \/ 0 secured or awarded \/ 0 cash/);
});

test("LABS dark mode maps brand and product blue to green without flattening semantic domain accents", () => {
  assert.match(legacyOverview, /labs-project-box/);
  assert.match(currentOverview, /labs-box-hover/);
  assert.match(css, /grid-template-columns:repeat\(12/);
  assert.match(css, /--accent-brand:#2e2eff/i);
  assert.match(css, /background:var\(--accent\)/);
  assert.match(v4css, /--accent-fourplanet:#39ff78/i);
  assert.match(rootCss, /data-theme="dark"[^}]*--accent-brand:#39ff78[^}]*--accent-product:#39ff78/is);
  assert.match(rootCss, /data-theme="light"[^}]*--accent-brand:#2e2eff[^}]*--accent-product:#2e2eff/is);
  assert.doesNotMatch(rootCss, /--accent-ocean:#39ff78/i);
});

test("LABS mobile keeps the project maze dense and removes the desktop inspector", () => {
  assert.match(rootCss, /max-width:760px[^}]*\.labs-page--portfolio \.labs-inspector\s*\{\s*display:none/is);
  assert.match(rootCss, /max-width:620px[\s\S]*?\.labs-core-grid,\s*\.labs-early-grid\s*\{\s*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/i);
});

test("LABS project details fail visibly closed when structured state is absent", () => {
  assert.match(detail, /UNKNOWN — no project phase\/roadmap projection is connected/);
  assert.match(detail, /UNKNOWN — process projection not connected/);
  assert.match(detail, /UNKNOWN — no current tasks are projected/);
  assert.match(detail, /UNKNOWN — no public-safe linked assets are projected/);
});

test("LABS public interface remains noindex", () => {
  assert.match(currentOverview, /noindex,nofollow,noarchive/);
  assert.match(detail, /noindex,nofollow,noarchive/);
});
