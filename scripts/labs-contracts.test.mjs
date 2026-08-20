import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const overview = fs.readFileSync("src/pages/labs/LabsOverviewCurrent.tsx", "utf8");
const fresh = fs.readFileSync("src/pages/labs/labsFreshProjection.ts", "utf8");
const gold = fs.readFileSync("src/pages/labs/labsGoldMeta.ts", "utf8");
const humanState = fs.readFileSync("src/pages/labs/labsHumanState.ts", "utf8");
const detail = fs.readFileSync("src/pages/labs/LabsProjectDetailPremium.tsx", "utf8");
const route = fs.readFileSync("src/pages/labs/LabsV4.tsx", "utf8");
const goldCss = fs.readFileSync("src/pages/labs/labsGold.css", "utf8");
const indexCss = fs.readFileSync("src/pages/labs/labsIndex.css", "utf8");
const mobileFix = fs.readFileSync("src/pages/labs/labsMobileFix.css", "utf8");
const data = fs.readFileSync("src/pages/labs/labsData.ts", "utf8");
const inventory = `${fresh}\n${gold}\n${humanState}`;

test("LABS remains a dated read-only BRAIN projection", () => {
  assert.match(data, /MANUAL BRAIN PROJECTION · READ ONLY/);
  assert.match(fresh, /verifiedAt = "20 AUG 2026"/);
  assert.match(overview, /BRAIN remains authority/);
  assert.match(overview, /missing values stay UNKNOWN/i);
  assert.match(detail, /noindex,nofollow,noarchive/);
});

test("aggregate command cards filter the index instead of navigating to an arbitrary project", () => {
  assert.match(overview, /PROJECT HOMES/);
  assert.match(overview, /ACTIVE NOW/);
  assert.match(overview, /PRODUCT SURFACES/);
  assert.match(overview, /LAB \/ PROTOTYPES/);
  assert.match(overview, /OPEN CONFLICTS/);
  assert.match(overview, /click = filter project index/i);
  assert.doesNotMatch(overview, /window\.location\.href\s*=\s*labHref\(item\.project\.slug\)/);
});

test("complete project index exists with search and filters", () => {
  assert.match(overview, /ALL 4PLANET PROJECTS \+ CONTROLLED TRACKS/);
  assert.match(overview, /FIND PROJECT/);
  assert.match(overview, /ATLAS, TREE OF LIFE, ECONOMY_, FOOD/);
  for (const filter of ["ALL","PROJECT HOMES","ACTIVE","PRODUCT","LABS","CONFLICTS"]) assert.ok(overview.includes(`"${filter}"`), `missing filter ${filter}`);
});

test("important canonical and bounded projects are present and routable", () => {
  for (const slug of [
    "4planet/strategy",
    "4planet/product",
    "4planet/naturebrain",
    "4planet/proof",
    "4planet/capital",
    "4planet/company",
    "4planet/relations",
    "4planet/solutions",
    "4planet/economy",
    "4planet/digital-pitch",
    "4planet/labs-system",
    "4planet/tree-of-life",
    "4planet/product/organisations",
    "4planet/product/oslofjorden",
    "4planet/naturebrain/decision-intelligence",
  ]) assert.ok(inventory.includes(slug), `missing ${slug}`);
  assert.match(route, /projectBySlug/);
  assert.match(route, /LabsProjectDetailV5/);
});

test("current public release truth uses PR90 and an active immutable preview", () => {
  assert.match(fresh, /PR #90/);
  assert.match(fresh, /https:\/\/80023f08\.4planet-05\.pages\.dev/);
  assert.match(gold, /OPEN CURRENT PREVIEW/);
  assert.match(gold, /Founder visual JUDGE/i);
  assert.doesNotMatch(fresh, /ONE INTERFACE PR #74 is OPEN/);
});

test("all 16 Wave-01 Mission Goal Contracts are projected with economics", () => {
  for (const id of [
    "OCE-WH4LES-01-G01","OCE-COR4L-01-G01","OCE-PL4STIC-01-G01","OCE-REWILD-M-01-G01",
    "EAR-CLIM4TE-01-G01","EAR-AM4ZONIA-01-G01","EAR-SPECIES-01-G01","EAR-REWILD-L-01-G01",
    "SAP-FOOD-01-G01","SAP-EN3RGY-01-G01","SAP-CIRCULAR-01-G01","SAP-F4SHION-01-G01",
    "CUL-M4GAZINE-01-G01","CUL-4FILM-01-G01","CUL-4RT-01-G01","CUL-4PLAY-01-G01",
  ]) assert.ok(gold.includes(id), `missing ${id}`);
  assert.match(gold, /Planning model:/);
  assert.match(gold, /Planning ≠ approved spend/);
  assert.match(gold, /actual spend\/committed cost remains UNKNOWN/);
});

test("shared Project Homes have real goals and money boundaries", () => {
  for (const id of ["SYS-P00-STRAT-G01","SYS-P00-PRODUCT-G01","SYS-P00-TRUTH-G01","SYS-P00-PROOF-G01","SYS-P00-CAPITAL-G01","SYS-P00-COMPANY-G01","SYS-P00-REL-G01","SYS-P00-SOLUTIONS-G01","SYS-P00-ECONOMY-G01","SYS-P00-DPITCH-G01","SYS-P00-LABS-G01","SYS-P00-PMAP-G01"]) assert.ok(gold.includes(id), `missing ${id}`);
  assert.match(gold, /15 historical submissions · 14 awaiting · 1 rejected · 0 award\/secured · 0 contracted · 0 cash/);
  assert.match(gold, /DEMO \/ NOT LIVE/);
});

test("project detail is human-first and puts usable links before technical evidence", () => {
  for (const token of ["MAIN GOAL","CURRENT STATE","NEXT GATE","ECONOMICS","SUCCESS LOOKS LIKE","ECONOMIC GOAL","TECHNICAL EVIDENCE"]) assert.ok(detail.includes(token), `missing ${token}`);
  assert.match(detail, /PrimaryLinks/);
  assert.match(detail, /collapsed by default/);
  assert.match(detail, /exact tested artifact/);
  assert.doesNotMatch(detail, /<small>\{asset\.href/);
});

test("human-facing current states cover every Wave-01 mission plus high-value bounded tracks", () => {
  for (const slug of [
    "4planet/oce4n/wh4les","4planet/oce4n/cor4l","4planet/oce4n/plastic-clean","4planet/oce4n/rewild-marine",
    "4planet/e4rth/clim4te","4planet/e4rth/am4zonia","4planet/e4rth/species","4planet/e4rth/rewild-land",
    "4planet/s4piens/food","4planet/s4piens/energy","4planet/s4piens/circular-city","4planet/s4piens/f4shion",
    "4planet/4culture/m4gazine","4planet/4culture/4film","4planet/4culture/4rt","4planet/4culture/4play",
    "4planet/tree-of-life","4planet/economy","4planet/product/jaguar-journey",
  ]) assert.ok(humanState.includes(slug), `missing current human state ${slug}`);
  assert.match(detail, /humanStateFor\(project\)/);
  assert.match(overview, /humanStateFor\(project\)/);
});

test("technical hashes are confined to audit data, not user-facing current-state strings", () => {
  assert.match(gold, /technical:/);
  assert.match(detail, /labs-tech-text/);
  assert.match(detail, /exact tested artifact/);
});

test("SPECIES current gate is fail-closed after exact-head XR regression", () => {
  assert.match(humanState, /Nature XR flat-browser runtime/);
  assert.match(gold, /Run 32356696261 \/ #511: FAILURE/);
  assert.match(gold, /Nature XR flat-browser runtime FAIL/);
});

test("TREE OF LIFE and ECONOMY remain correctly bounded", () => {
  assert.match(gold, /TREE OF LIFE PR #80/);
  assert.match(gold, /No depicted relationship is money, partnership, delivery or impact/);
  assert.match(gold, /OPEN ECONOMY_ PR #2/);
  assert.match(gold, /statutory ledger/i);
});

test("all literal LABS URLs are valid https URLs", () => {
  const urls = [...`${fresh}\n${gold}`.matchAll(/https:\/\/[^"'`\s)]+/g)].map((match) => match[0]);
  assert.ok(urls.length >= 20, `expected a substantial controlled link inventory, got ${urls.length}`);
  for (const raw of urls) {
    const url = new URL(raw);
    assert.equal(url.protocol, "https:");
    assert.ok(url.hostname.includes("4planet") || url.hostname === "github.com", `unexpected host: ${url.hostname}`);
  }
});

test("mobile detail and index guard readable layout and horizontal containment", () => {
  assert.match(goldCss, /@media\(max-width:620px\)/);
  assert.match(goldCss, /overflow-x:clip/);
  assert.match(goldCss, /labs-tech-text/);
  assert.match(indexCss, /@media\(max-width:760px\)/);
  assert.match(indexCss, /labs-index-list/);
  assert.match(mobileFix, /overflow-x:\s*clip/i);
});

test("private Founder finance/health/legal truth is not projected into Gold metadata/current states", () => {
  const publicProjection = `${gold}\n${humanState}`;
  assert.doesNotMatch(publicProjection, /forced sale/i);
  assert.doesNotMatch(publicProjection, /ulcerative/i);
  assert.doesNotMatch(publicProjection, /AAP/i);
  assert.doesNotMatch(publicProjection, /Nordnet/i);
});
