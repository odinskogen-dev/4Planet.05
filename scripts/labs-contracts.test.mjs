import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const legacyOverview = fs.readFileSync("src/pages/labs/LabsOverview.tsx", "utf8");
const currentOverview = fs.readFileSync("src/pages/labs/LabsOverviewCurrent.tsx", "utf8");
const projection = fs.readFileSync("src/pages/labs/labsProjection.ts", "utf8");
const freshProjection = fs.readFileSync("src/pages/labs/labsFreshProjection.ts", "utf8");
const route = fs.readFileSync("src/pages/labs/LabsV4.tsx", "utf8");
const detail = fs.readFileSync("src/pages/labs/LabsProjectDetailPremium.tsx", "utf8");
const detailV5 = fs.readFileSync("src/pages/labs/LabsProjectDetailV5.tsx", "utf8");
const projectMeta = fs.readFileSync("src/pages/labs/labsProjectMeta.ts", "utf8");
const currentMeta = fs.readFileSync("src/pages/labs/labsCurrentMeta.ts", "utf8");
const data = fs.readFileSync("src/pages/labs/labsData.ts", "utf8");
const css = fs.readFileSync("src/pages/labs/labs.css", "utf8");
const v4css = fs.readFileSync("src/pages/labs/labsV4.css", "utf8");
const rootCss = fs.readFileSync("src/pages/labs/labsV4Root.css", "utf8");
const mobileFix = fs.readFileSync("src/pages/labs/labsMobileFix.css", "utf8");

test("LABS remains a read-only BRAIN projection, never an invented live status system", () => {
  assert.match(data, /MANUAL BRAIN PROJECTION · READ ONLY/);
  assert.match(currentOverview, /BRAIN remains the authority/);
  assert.match(currentOverview, /MISSING VALUES STAY UNKNOWN/);
  assert.match(currentOverview, /20 AUG RECONCILIATION/);
  assert.match(freshProjection, /verifiedAt = "20 AUG 2026"/);
  assert.match(detail, /UNKNOWN/);
  assert.doesNotMatch(data, /projectionState\s*=\s*["'`]LIVE/i);
});

test("LABS preserves the founder-loved maze while routing project pages through current projection + Goal Contract metadata", () => {
  assert.match(route, /LabsOverviewCurrent/);
  assert.match(route, /labsFreshProjection/);
  assert.match(route, /if \(!slug\) return <LabsOverview \/>/);
  assert.match(route, /LabsProjectDetailV5/);
  assert.match(detailV5, /LabsProjectDetailPremium/);
  assert.match(detailV5, /withCurrentProjectMeta/);
  assert.match(currentMeta, /withProjectMeta/);
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

test("main ATLAS, SPECIES and the public product family are visible on the front page without duplicate Project Homes", () => {
  assert.match(currentOverview, /LEADING PRODUCT SURFACES/);
  for (const slug of [
    "4planet/product/one-interface",
    "4planet/product/atlas",
    "4planet/e4rth/species",
    "4planet/product/living-systems",
    "4planet/product/impact",
  ]) assert.ok(currentOverview.includes(`"${slug}"`), `missing leading product surface: ${slug}`);
  assert.match(currentOverview, /same Project Homes · surfaced here for direct access/);
});

test("current Goal Contracts and Leading One links are projected from controlled authority", () => {
  for (const id of [
    "SYS-P00-PRODUCT-G01",
    "OCE-WH4LES-01-G01",
    "OCE-COR4L-01-G01",
    "OCE-PL4STIC-01-G01",
    "OCE-REWILD-M-01-G01",
    "EAR-CLIM4TE-01-G01",
    "EAR-AM4ZONIA-01-G01",
    "EAR-SPECIES-01-G01",
    "EAR-REWILD-L-01-G01",
    "SAP-FOOD-01-G01",
    "SAP-EN3RGY-01-G01",
    "SAP-CIRCULAR-01-G01",
    "SAP-F4SHION-01-G01",
    "CUL-M4GAZINE-01-G01",
    "CUL-4FILM-01-G01",
    "CUL-4RT-01-G01",
    "CUL-4PLAY-01-G01",
    "SAP-SAPIENS-01-G01",
    "SYS-P00-PMAP-G01",
  ]) assert.ok(currentMeta.includes(id), `missing Goal Contract: ${id}`);
  assert.match(currentMeta, /BASELINE COMPLETE/);
  assert.match(currentMeta, /INHERITED \/ CURRENT AUTHORITY/);
  assert.match(currentMeta, /LEADING ONE/);
  assert.match(currentMeta, /MISSION PAGE/);
  assert.match(currentMeta, /https:\/\/4planet\.org\/atlas/);
  assert.match(currentMeta, /https:\/\/4planet\.org\/species/);
  assert.match(currentMeta, /https:\/\/4planet\.org\/missions\/wh4les/);
  assert.match(currentMeta, /https:\/\/4planet\.org\/missions\/food/);
});

test("Aug 20 reconciliation surfaces the bounded early-stage 4PLANET set without creating a new PICK Project Home", () => {
  assert.match(currentOverview, /EARLY STAGE \/ CODE \+ SYSTEM LABS/);
  for (const token of [
    'title: "ATLAS DATA LAB"',
    'title: "NATURE XR"',
    'title: "JAGUAR JOURNEY"',
    'title: "S4PIENS \/ FOOD GOLD"',
    'title: "PICK_"',
    'title: "TREE OF LIFE"',
    'title: "CHOICE"',
    'title: "PLANETARY MAP"',
  ]) assert.ok(projection.includes(token), `missing early-stage project: ${token}`);
  assert.match(projection, /slug: "4planet\/s4piens\/food\/pick"/);
  assert.match(projection, /parent: "4planet\/s4piens\/food"/);
  assert.match(projection, /not a new Project Home/i);
  assert.match(projection, /"8 TRACKS"/);
  assert.match(projection, /15 historical submissions \/ 14 awaiting \/ 1 rejected \/ 0 secured or awarded \/ 0 cash/);
});

test("base evidence gates are preserved while current GitHub implementation snapshot stays separate", () => {
  assert.match(projection, /ad7f14e09d0f565a5d534605f76996d1eca2e3c3/);
  assert.match(projection, /Convergence Gate #410 succeeded/i);
  assert.match(freshProjection, /0338e94cea19942d99655239550cec72d75aa316/);
  assert.match(freshProjection, /88fdc8552a532a9a269702e9fc3b063169eae3bb/);
  assert.match(freshProjection, /implementation evidence, not a BRAIN promotion or production release/i);
  assert.match(freshProjection, /reconciliation snapshot/i);
  assert.match(projection, /0dcc5268e0405ae78a4d27a41c155ef465be56d2/);
  assert.match(projection, /42\/44 smoke contracts/);
  assert.match(projection, /cd208fbee92598c90f5dbd3ab7677ea076d49b78/);
  assert.match(projection, /current-head acceptance remains unresolved/i);
  assert.match(projection, /f1149bc5c305ebbc4d6605e86debaf6637950c2b/);
  assert.match(projection, /946041d04beaf5db86ad317f854b7986d731b694/);
  assert.match(projection, /NOT presumed fixed or QA-passed/i);
  assert.match(projection, /7abd18e0a66992c339b1654d9f01dd540d3441ae/);
  assert.match(projection, /32310081759 completed SUCCESS/);
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

test("LABS mobile keeps the dense two-column maze, hides desktop inspector and guards the right edge", () => {
  assert.match(rootCss, /max-width:760px[^}]*\.labs-page--portfolio \.labs-inspector\s*\{\s*display:none/is);
  assert.match(rootCss, /max-width:620px[\s\S]*?\.labs-core-grid,\s*\.labs-early-grid\s*\{\s*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/i);
  assert.match(mobileFix, /\.labs-grid-section\s*\{[\s\S]*?margin-inline:\s*14px;[\s\S]*?inset-inline:\s*auto;/i);
  assert.match(mobileFix, /overflow-x:\s*clip/i);
  assert.match(route, /labsMobileFix\.css/);
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
