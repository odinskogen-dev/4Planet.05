import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const overview = fs.readFileSync("src/pages/labs/LabsOverviewCurrent.tsx", "utf8");
const baseFresh = fs.readFileSync("src/pages/labs/labsFreshProjection.ts", "utf8");
const current = fs.readFileSync("src/pages/labs/labsCurrentProjection.ts", "utf8");
const currentControl = fs.readFileSync("src/pages/labs/labsCurrentControl.ts", "utf8");
const wbs = fs.readFileSync("src/pages/labs/labsWbsProjection.ts", "utf8");
const gold = fs.readFileSync("src/pages/labs/labsGoldMeta.ts", "utf8");
const complete = fs.readFileSync("src/pages/labs/labsCompleteMeta.ts", "utf8");
const humanState = fs.readFileSync("src/pages/labs/labsHumanState.ts", "utf8");
const pulse = fs.readFileSync("src/pages/labs/labsProjectPulse.ts", "utf8");
const detail = fs.readFileSync("src/pages/labs/LabsProjectDetailPremium.tsx", "utf8");
const route = fs.readFileSync("src/pages/labs/LabsV4.tsx", "utf8");
const goldCss = fs.readFileSync("src/pages/labs/labsGold.css", "utf8");
const pulseCss = fs.readFileSync("src/pages/labs/labsProjectPulse.css", "utf8");
const indexCss = fs.readFileSync("src/pages/labs/labsIndex.css", "utf8");
const mobileFix = fs.readFileSync("src/pages/labs/labsMobileFix.css", "utf8");
const data = fs.readFileSync("src/pages/labs/labsData.ts", "utf8");
const inventory = `${baseFresh}\n${current}\n${gold}\n${currentControl}\n${humanState}\n${wbs}`;

test("LABS remains a dated read-only BRAIN projection", () => {
  assert.match(data, /MANUAL BRAIN PROJECTION · READ ONLY/);
  assert.match(current, /verifiedAt = "21 AUG 2026"/);
  assert.match(overview, /BRAIN remains authority/);
  assert.match(overview, /missing values stay UNKNOWN/i);
  assert.match(detail, /noindex,nofollow,noarchive/);
  assert.match(complete, /reconcileCurrentControl/);
  assert.match(wbs, /not a second task database/i);
});

test("aggregate command cards filter the index instead of navigating to an arbitrary project", () => {
  for (const label of ["PROJECT HOMES", "ACTIVE NOW", "PRODUCT SURFACES", "LAB / PROTOTYPES", "OPEN CONFLICTS"]) assert.match(overview, new RegExp(label.replace("/", "\\/")));
  assert.match(overview, /click = filter project index/i);
  assert.doesNotMatch(overview, /window\.location\.href\s*=\s*labHref\(item\.project\.slug\)/);
});

test("complete project index exists with search and filters", () => {
  assert.match(overview, /ALL 4PLANET PROJECTS \+ CONTROLLED TRACKS/);
  assert.match(overview, /FIND PROJECT/);
  assert.match(overview, /ATLAS, TREE OF LIFE, SONIC, CREATOR, ECONOMY_, FOOD/);
  for (const filter of ["ALL","PROJECT HOMES","ACTIVE","PRODUCT","LABS","CONFLICTS"]) assert.ok(overview.includes(`"${filter}"`), `missing filter ${filter}`);
});

test("important canonical and bounded projects are present and routable", () => {
  for (const slug of [
    "4planet/strategy", "4planet/product", "4planet/naturebrain", "4planet/proof", "4planet/capital", "4planet/company",
    "4planet/relations", "4planet/solutions", "4planet/economy", "4planet/sonic", "4planet/digital-pitch", "4planet/labs-system",
    "4planet/labs-system/creator-engine", "4planet/tree-of-life", "4planet/product/organisations", "4planet/product/oslofjorden",
    "4planet/naturebrain/decision-intelligence",
  ]) assert.ok(inventory.includes(slug), `missing ${slug}`);
  assert.match(route, /labsCurrentProjection/);
  assert.match(route, /LabsProjectDetailV5/);
});

test("current public release truth uses PR92 and its immutable Founder-review preview", () => {
  assert.match(current, /PR #92/);
  assert.match(current, /https:\/\/e32a35e9\.4planet-05\.pages\.dev/);
  assert.match(currentControl, /OPEN CURRENT PREVIEW/);
  assert.match(currentControl, /Founder visual/i);
  assert.doesNotMatch(current, /ONE INTERFACE PR #74 is OPEN/);
});

test("all 16 Wave-01 Mission Goal Contracts remain projected with economics", () => {
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

test("current BRAIN WBS projection covers core control and all 16 Mission Project Homes", () => {
  for (const id of [
    "SYS-P00-STRAT","SYS-P00-PRODUCT","SYS-P00-TRUTH","SYS-P00-PROOF","SYS-P00-CAPITAL","SYS-P00-COMPANY","SYS-P00-REL","SYS-P00-BRAND","SYS-P00-PMAP",
    "OCE-WH4LES-01","OCE-COR4L-01","OCE-PL4STIC-01","OCE-REWILD-M-01","EAR-CLIM4TE-01","EAR-AM4ZONIA-01","EAR-SPECIES-01","EAR-REWILD-L-01",
    "SAP-FOOD-01","SAP-EN3RGY-01","SAP-CIRCULAR-01","SAP-F4SHION-01","CUL-M4GAZINE-01","CUL-4FILM-01","CUL-4RT-01","CUL-4PLAY-01",
  ]) assert.ok(wbs.includes(`"${id}"`), `missing WBS projection ${id}`);
  assert.match(pulse, /wbsProjectionFor/);
  assert.match(pulse, /BRAIN WBS/);
});

test("shared Project Homes have real goals and money boundaries", () => {
  for (const id of ["SYS-P00-STRAT-G01","SYS-P00-PRODUCT-G01","SYS-P00-TRUTH-G01","SYS-P00-PROOF-G01","SYS-P00-CAPITAL-G01","SYS-P00-COMPANY-G01","SYS-P00-REL-G01","SYS-P00-SOLUTIONS-G01","SYS-P00-ECONOMY-G01","SYS-P00-DPITCH-G01","SYS-P00-LABS-G01","SYS-P00-PMAP-G01"]) assert.ok(gold.includes(id) || currentControl.includes(id), `missing ${id}`);
  assert.match(gold, /15 historical submissions · 14 awaiting · 1 rejected · 0 award\/secured · 0 contracted · 0 cash/);
  assert.match(currentControl, /DEMO \/ NOT LIVE/);
  assert.match(currentControl, /SYS-SONIC-01-G01/);
  assert.match(currentControl, /LAB-CREATOR-01-G01/);
});

test("project detail is human-first and materially richer than the old status page", () => {
  for (const token of [
    "PROJECT BRIEF", "CURRENT STATE", "WHY THIS PROJECT EXISTS", "OWNER / OPERATING MODEL", "AI EXECUTION LOGIC",
    "GOAL CONTRACT", "MAIN GOAL", "SUCCESS / PROOF", "ECONOMIC GOAL", "EXECUTION", "WORK NOW", "WORK NEXT", "WAITING / BLOCKED", "FOUNDER GATE",
    "WBS / PROCESS COVERAGE", "MONEY + PROOF", "ECONOMICS", "MONEY TRUTH", "EVIDENCE / PROOF", "TECHNICAL / RECOVERY EVIDENCE",
  ]) assert.ok(detail.includes(token), `missing ${token}`);
  assert.match(detail, /PrimaryLinks/);
  assert.match(detail, /NO VERIFIED FOUNDER-FACING LINK YET/);
  assert.match(detail, /collapsed by default/);
  assert.match(detail, /exact tested artifact/);
  assert.match(detail, /projectPulseFor/);
  assert.doesNotMatch(detail, /<small>\{asset\.href/);
});

test("project pulse derives work, waiting, founder, evidence and WBS visibility without creating a new truth store", () => {
  assert.match(pulse, /project\.tasks/);
  assert.match(pulse, /project\.processes/);
  assert.match(pulse, /project\.roadmap/);
  assert.match(pulse, /project\.founderDecisions/);
  assert.match(pulse, /project\.evidence/);
  assert.match(pulse, /waiting/);
  assert.match(pulse, /Full task-detail truth remains in BRAIN \/ WBS \/ Atomic/);
  assert.match(pulse, /rather than being invented here/);
});

test("human-facing current states cover Wave-01 and current high-value tracks", () => {
  for (const slug of [
    "4planet/oce4n/wh4les","4planet/oce4n/cor4l","4planet/oce4n/plastic-clean","4planet/oce4n/rewild-marine",
    "4planet/e4rth/clim4te","4planet/e4rth/am4zonia","4planet/e4rth/species","4planet/e4rth/rewild-land",
    "4planet/s4piens/food","4planet/s4piens/energy","4planet/s4piens/circular-city","4planet/s4piens/f4shion",
    "4planet/4culture/m4gazine","4planet/4culture/4film","4planet/4culture/4rt","4planet/4culture/4play",
    "4planet/tree-of-life","4planet/economy","4planet/product/jaguar-journey","4planet/sonic","4planet/labs-system/creator-engine",
  ]) assert.ok(humanState.includes(slug), `missing current human state ${slug}`);
});

test("SPECIES is fail-closed between accepted baseline and newer draft experiments", () => {
  assert.match(humanState, /accepted internal shared-context Jaguar baseline/i);
  assert.match(currentControl, /OPEN ACCEPTED JAGUAR BASELINE/);
  assert.match(currentControl, /latest checked Convergence runs failed/i);
  assert.match(currentControl, /OPEN CURRENT LIGHT LENS PR #98/);
  assert.doesNotMatch(currentControl, /OPEN SPECIES",/);
  assert.match(currentControl, /OPEN SPECIES PRODUCT/);
});

test("CREATOR exposes the verified live domain but keeps economic proof fail-closed", () => {
  assert.match(currentControl, /OPEN CRE4TORS\.COM/);
  assert.match(currentControl, /https:\/\/cre4tors\.com/);
  assert.match(currentControl, /apex\/www HTTPS and proxy identity verified/i);
  assert.match(humanState, /Real creator workflow\/economic proof remains open/i);
});

test("TREE OF LIFE and ECONOMY remain correctly bounded", () => {
  assert.match(gold, /TREE OF LIFE PR #80/);
  assert.match(gold, /No depicted relationship is money, partnership, delivery or impact/);
  assert.match(currentControl, /previously projected public GitHub PR URL returned 404/);
  assert.doesNotMatch(currentControl, /OPEN ECONOMY_ PR #2/);
  assert.match(gold, /statutory ledger/i);
});

test("all literal LABS URLs are valid https URLs", () => {
  const urls = [...`${baseFresh}\n${current}\n${gold}\n${currentControl}`.matchAll(/https:\/\/[^"'`\s)]+/g)].map((match) => match[0]);
  assert.ok(urls.length >= 20, `expected a substantial controlled link inventory, got ${urls.length}`);
  for (const raw of urls) {
    const url = new URL(raw);
    assert.equal(url.protocol, "https:");
    assert.ok(url.hostname.includes("4planet") || url.hostname === "github.com" || url.hostname === "cre4tors.com", `unexpected host: ${url.hostname}`);
  }
});

test("mobile detail and index guard readable layout and horizontal containment", () => {
  assert.match(goldCss, /@media\(max-width:620px\)/);
  assert.match(goldCss, /overflow-x:clip/);
  assert.match(pulseCss, /@media\(max-width:760px\)/);
  assert.match(pulseCss, /grid-template-columns:1fr/);
  assert.match(indexCss, /@media\(max-width:760px\)/);
  assert.match(indexCss, /labs-index-list/);
  assert.match(mobileFix, /overflow-x:\s*clip/i);
});

test("private Founder finance/health/legal truth is not projected into current LABS metadata/states", () => {
  const publicProjection = `${gold}\n${currentControl}\n${current}\n${humanState}\n${wbs}`;
  assert.doesNotMatch(publicProjection, /forced sale/i);
  assert.doesNotMatch(publicProjection, /ulcerative/i);
  assert.doesNotMatch(publicProjection, /AAP/i);
  assert.doesNotMatch(publicProjection, /Nordnet/i);
});
