import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const base = (process.env.PARTNERS_BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const hub = JSON.parse(fs.readFileSync(new URL("../src/content/partnersHub.json", import.meta.url), "utf8"));
const out = path.resolve("dist/downloads");
const evidence = path.resolve("partners-release-evidence");
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(evidence, { recursive: true });

const briefs = [
  ["overview", "4planet-overview.pdf"],
  ["partner", "4planet-partner-brief.pdf"],
  ["capital", "4planet-capital-funder-brief.pdf"],
  ["company", "4planet-company-pilot-brief.pdf"],
  ["foundation", "4planet-foundation-brief.pdf"],
  ["science", "4planet-science-data-brief.pdf"],
];

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const footer = () => `<footer><strong>4PLANET_</strong><span>For a Living Planet.</span><span>partners.4planet.org · ${esc(hub.meta.updated)}</span></footer>`;
const sectionLabel = (index, label) => `<div class="kicker"><b>${esc(index)}</b><span>${esc(label)}</span></div>`;
const trustPills = () => `<div class="pills">${hub.trust.invariants.map((x) => `<span>${esc(x)}</span>`).join("")}</div>`;
const systemLine = () => `<div class="system-line">${hub.system.map((x) => `<div><b>${esc(x.index)}</b><strong>${esc(x.title)}</strong><small>${esc(x.question)}</small></div>`).join("")}</div>`;
const productGrid = () => `<div class="product-grid">${hub.products.map((x, i) => `<article><b>0${i + 1}</b><span>${esc(x.state)}</span><h3>${esc(x.name)}</h3><strong>${esc(x.question)}</strong><p>${esc(x.summary)}</p></article>`).join("")}</div>`;
const proofGrid = (limit = 2) => `<div class="proof-grid">${hub.proofCases.slice(0, limit).map((x) => `<article><div class="meta">${esc(x.index)} · ${esc(x.domain)} · ${esc(x.state)}</div><h3>${esc(x.name)}</h3><strong>${esc(x.headline)}</strong><p>${esc(x.body)}</p><small><b>BOUNDARY</b> ${esc(x.boundary)}</small></article>`).join("")}</div>`;
const capitalGrid = (items = hub.capital) => `<div class="module-grid">${items.map((x) => `<article><h3>${esc(x.name)}</h3><strong>${esc(x.for)}</strong><p>${esc(x.enables)}</p><small><b>PROOF</b> ${esc(x.proof)}</small></article>`).join("")}</div>`;
const routesGrid = () => `<div class="route-grid">${hub.partnerships.map((x) => `<article><h3>${esc(x.name)}</h3><p>${esc(x.why)}</p><small>${esc(x.example)}</small></article>`).join("")}</div>`;
const roadmap = () => `<div class="roadmap">${hub.roadmap.map((x) => `<div><strong>${esc(x.name)}</strong><p>${esc(x.body)}</p></div>`).join("")}</div>`;

function audienceRoute(slug) {
  if (slug === "company") return hub.partnerships.find((x) => x.slug === "company");
  if (slug === "foundation") return hub.partnerships.find((x) => x.slug === "foundation");
  if (slug === "science") return hub.partnerships.find((x) => x.slug === "science");
  return null;
}

function overviewHtml(brief) {
  return `<main class="brief-pdf overview-pdf">
    <section class="sheet overview-sheet">
      ${sectionLabel("BRIEF", brief.audience.toUpperCase())}
      <div class="overview-head"><div><h1>${esc(brief.name)}</h1><p>${esc(brief.purpose)}</p></div><div class="date">CURRENT PUBLIC EXPLANATION<br>${esc(hub.meta.updated)}</div></div>
      <div class="rule"></div>
      <div class="overview-thesis"><div><span>THE IDEA</span><h2>${esc(hub.hero.headline)}</h2></div><div><p>${esc(hub.hero.body)}</p><blockquote>${esc(hub.problem.insight)}</blockquote></div></div>
      ${sectionLabel("01", "THE SYSTEM")}
      ${systemLine()}
      ${sectionLabel("02", "WHAT EXISTS")}
      <div class="overview-products">${hub.products.map((x) => `<article><span>${esc(x.name)}</span><strong>${esc(x.question)}</strong><p>${esc(x.summary)}</p></article>`).join("")}</div>
      <div class="overview-bottom"><div><span class="mini-label">PROOF DISCIPLINE</span><p>A prototype is not an outcome. Funding, delivery and verified ecological outcome remain different evidence states.</p>${trustPills()}</div><div><span class="mini-label">WAYS TO WORK TOGETHER</span><p>${hub.partnerships.map((x) => esc(x.name)).join(" · ")}</p><strong>Start with one bounded object that can be inspected.</strong></div></div>
      ${footer()}
    </section>
  </main>`;
}

function specialistPage(slug) {
  const route = audienceRoute(slug);
  if (slug === "company" && route) {
    const paid = hub.capital.find((x) => x.name === "COMPANY PAID PILOT");
    return `<section class="sheet audience-sheet">${sectionLabel("03", "COMPANY / PAID PILOT")}
      <h2>One real decision problem. One bounded proof.</h2>
      <div class="two"><div><h3>WHY THIS ROUTE</h3><p>${esc(route.why)}</p><h3>4PLANET MAY BRING</h3><p>${esc(route.brings)}</p></div><div><h3>THE BUYER MUST BRING</h3><p>${esc(route.partner)}</p><h3>EXAMPLE OBJECT</h3><p>${esc(route.example)}</p></div></div>
      <div class="callout"><b>PAID PILOT</b><p>${esc(paid?.enables)}</p><small>${esc(paid?.proof)}</small></div>
      <div class="check-grid"><div><b>BUYER PROBLEM</b><span>Named and current</span></div><div><b>DECISION OWNER</b><span>Real person/function</span></div><div><b>DELIVERABLE</b><span>Bounded and inspectable</span></div><div><b>PAYMENT</b><span>Explicit before called paid</span></div><div><b>ACCEPTANCE</b><span>Defined before build</span></div><div><b>NEXT DECISION</b><span>Go / iterate / stop</span></div></div>
      <p class="boundary"><b>BOUNDARY</b> ${esc(route.boundary)}</p>${footer()}</section>`;
  }
  if (slug === "foundation" && route) {
    const modules = hub.capital.filter((x) => ["FOUNDING BUILD", "PUBLIC-INTEREST INTELLIGENCE", "CULTURE & COMMUNICATION"].includes(x.name));
    return `<section class="sheet audience-sheet">${sectionLabel("03", "FOUNDATION / PHILANTHROPY")}
      <h2>Fund public value without buying the conclusion.</h2>
      <div class="two"><div><h3>WHY THIS ROUTE</h3><p>${esc(route.why)}</p><h3>4PLANET MAY BRING</h3><p>${esc(route.brings)}</p></div><div><h3>FUNDER MAY BRING</h3><p>${esc(route.partner)}</p><h3>EXAMPLE OBJECT</h3><p>${esc(route.example)}</p></div></div>
      ${capitalGrid(modules)}<p class="boundary"><b>BOUNDARY</b> ${esc(route.boundary)}</p>${footer()}</section>`;
  }
  if (slug === "science" && route) {
    const module = hub.capital.find((x) => x.name === "SCIENCE & DATA PARTNERSHIP");
    return `<section class="sheet audience-sheet">${sectionLabel("03", "SCIENCE / DATA")}
      <h2>Keep source authority intact while making relationships more usable.</h2>
      <div class="two"><div><h3>WHY THIS ROUTE</h3><p>${esc(route.why)}</p><h3>4PLANET MAY BRING</h3><p>${esc(route.brings)}</p></div><div><h3>SCIENCE / DATA PARTNER MAY BRING</h3><p>${esc(route.partner)}</p><h3>EXAMPLE OBJECT</h3><p>${esc(route.example)}</p></div></div>
      <div class="callout"><b>${esc(module?.name)}</b><p>${esc(module?.enables)}</p><small>${esc(module?.proof)}</small></div>
      <div class="state-grid">${hub.trust.states.map((x) => `<div><b>${esc(x.name)}</b><p>${esc(x.body)}</p></div>`).join("")}</div>
      <p class="boundary"><b>BOUNDARY</b> ${esc(route.boundary)}</p>${footer()}</section>`;
  }
  if (slug === "capital") {
    return `<section class="sheet audience-sheet">${sectionLabel("03", "CAPITAL ARCHITECTURE")}
      <h2>Capital follows the need. The evidence follows the money.</h2>
      <p class="lede">4PLANET does not have one universal public ask. Different objects require different instruments, legal routes, deliverables and proof. Amounts and terms stay route-specific.</p>
      ${capitalGrid()}<div class="callout compact"><b>ECONOMIC TRUTH</b><p>PLANNED ≠ ASKED ≠ SUBMITTED ≠ AWARDED ≠ CONTRACTED ≠ CASH</p><small>Pilot ≠ paid pilot. Contract ≠ cash.</small></div>${footer()}</section>`;
  }
  return `<section class="sheet audience-sheet">${sectionLabel("03", "PARTNERSHIP PATHS")}
    <h2>Bring a real problem, capability, place or resource.</h2><p class="lede">The core explanation stays stable. Relevance changes by audience, problem, proof object and role.</p>${routesGrid()}${footer()}</section>`;
}

function longBriefHtml(slug, brief) {
  return `<main class="brief-pdf long-brief">
    <section class="sheet cover-sheet">${sectionLabel("BRIEF", brief.audience.toUpperCase())}
      <div class="cover-title"><h1>${esc(brief.name)}</h1><p>${esc(brief.purpose)}</p></div>
      <div class="cover-thesis"><span>4PLANET / THE IDEA</span><h2>${esc(hub.hero.headline)}</h2><p>${esc(hub.hero.body)}</p><blockquote>${esc(hub.problem.insight)}</blockquote></div>${footer()}</section>
    <section class="sheet system-sheet">${sectionLabel("02", "SYSTEM + PRODUCTS")}
      <h2>Reality → evidence → understanding → decision → action → proof → learning.</h2>${systemLine()}<div class="compact-products">${hub.products.map((x, i) => `<article><b>0${i + 1}</b><h3>${esc(x.name)}</h3><strong>${esc(x.question)}</strong><p>${esc(x.summary)}</p></article>`).join("")}</div>${footer()}</section>
    ${specialistPage(slug)}
    <section class="sheet close-sheet">${sectionLabel("04", "PROOF + TRUST + NEXT")}
      <h2>Stronger claims require stronger evidence.</h2>${proofGrid(2)}<div class="close-grid"><div><h3>TRUST</h3><p>${esc(hub.trust.intro)}</p>${trustPills()}</div><div><h3>NEXT</h3>${roadmap()}</div></div>
      <div class="next-step"><b>ONE SYSTEM / MANY CONTROLLED DEPTHS</b><p>Understand the system. Find the right role. Define one bounded object. Follow what happens next.</p><strong>partners.4planet.org</strong></div>${footer()}</section>
  </main>`;
}

const printCss = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; color: #0a0a0a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "DM Sans", Arial, sans-serif; }
.brief-pdf { width: 210mm; margin: 0 auto; }
.sheet { width: 210mm; height: 297mm; padding: 13mm 14mm 11mm; position: relative; overflow: hidden; page-break-after: always; break-after: page; background: #fff; }
.sheet:last-child { page-break-after: auto; break-after: auto; }
h1,h2,h3,p,blockquote { margin: 0; }
h1,h2,h3 { font-family: "Instrument Sans", "DM Sans", Arial, sans-serif; letter-spacing: -.045em; font-weight: 500; }
h1 { font-size: 34pt; line-height: .92; max-width: 14ch; }
h2 { font-size: 24pt; line-height: .96; max-width: 18ch; }
h3 { font-size: 13pt; line-height: 1; }
p { font-size: 9pt; line-height: 1.38; }
strong { font-weight: 650; }
.kicker { font: 600 6.5pt/1.2 "Fragment Mono", monospace; letter-spacing: .11em; display:flex; gap:4mm; text-transform:uppercase; margin-bottom:8mm; }
.kicker b { color:#2e2eff; }
.rule { border-top: .3mm solid #111; margin: 7mm 0; }
footer { position:absolute; left:14mm; right:14mm; bottom:7mm; border-top:.2mm solid #bbb; padding-top:3mm; display:grid; grid-template-columns:1fr 1fr 1fr; gap:4mm; font-size:6.5pt; align-items:end; }
footer strong { font-family:"Instrument Sans",sans-serif; font-size:9pt; }
footer span:last-child { text-align:right; }
.overview-head { display:grid; grid-template-columns: 1fr auto; gap:10mm; align-items:end; }
.overview-head p { margin-top:4mm; max-width:100mm; font-size:8.5pt; }
.date { font:600 6pt/1.5 "Fragment Mono",monospace; letter-spacing:.08em; text-align:right; }
.overview-thesis { display:grid; grid-template-columns: 1.05fr .95fr; gap:10mm; margin:6mm 0 8mm; }
.overview-thesis span,.mini-label { font:600 6pt/1 "Fragment Mono",monospace; letter-spacing:.09em; }
.overview-thesis h2 { margin-top:3mm; font-size:22pt; }
.overview-thesis p { font-size:8.4pt; }
.overview-thesis blockquote { margin-top:5mm; font:500 13pt/1.05 "Instrument Sans",sans-serif; letter-spacing:-.035em; }
.system-line { display:grid; grid-template-columns:repeat(7,1fr); margin:3mm 0 7mm; border-top:.2mm solid #bbb; border-left:.2mm solid #bbb; }
.system-line > div { min-height:22mm; padding:3mm 2.5mm; border-right:.2mm solid #bbb; border-bottom:.2mm solid #bbb; }
.system-line b { display:block; color:#2e2eff; font:600 6pt/1 "Fragment Mono",monospace; margin-bottom:3mm; }
.system-line strong { display:block; font:650 7pt/1.05 "Instrument Sans",sans-serif; }
.system-line small { display:block; font-size:5.6pt; line-height:1.2; margin-top:1.5mm; color:#555; }
.overview-products { display:grid; grid-template-columns:1fr 1fr; border-top:.2mm solid #bbb; border-left:.2mm solid #bbb; margin:3mm 0 6mm; }
.overview-products article { padding:3mm; min-height:27mm; border-right:.2mm solid #bbb; border-bottom:.2mm solid #bbb; }
.overview-products span { font:500 13pt/1 "Instrument Sans",sans-serif; display:block; }
.overview-products strong { display:block; font-size:6.6pt; margin:1mm 0; }
.overview-products p { font-size:6.2pt; line-height:1.25; color:#444; }
.overview-bottom { display:grid; grid-template-columns:1.15fr .85fr; gap:7mm; border-top:.3mm solid #111; padding-top:4mm; }
.overview-bottom p { font-size:7pt; margin:2mm 0; }
.overview-bottom strong { font-size:7pt; }
.pills { display:flex; flex-wrap:wrap; gap:1.2mm; margin-top:3mm; }
.pills span { border:.2mm solid currentColor; padding:1.2mm 1.7mm; font:600 5pt/1 "Fragment Mono",monospace; letter-spacing:.03em; }
.cover-title { margin-top:14mm; }
.cover-title p { margin-top:6mm; max-width:105mm; font-size:11pt; }
.cover-thesis { position:absolute; left:14mm; right:14mm; bottom:30mm; display:grid; grid-template-columns: 1fr 1fr; gap:10mm; border-top:.4mm solid #111; padding-top:8mm; }
.cover-thesis span { grid-column:1/-1; font:600 6.5pt/1 "Fragment Mono",monospace; letter-spacing:.1em; }
.cover-thesis h2 { font-size:29pt; }
.cover-thesis p { font-size:10pt; }
.cover-thesis blockquote { grid-column:2; font:500 16pt/1.05 "Instrument Sans",sans-serif; letter-spacing:-.04em; margin-top:5mm; }
.system-sheet > h2 { font-size:28pt; max-width:17ch; margin-bottom:8mm; }
.compact-products { display:grid; grid-template-columns:1fr 1fr; border-top:.2mm solid #bbb; border-left:.2mm solid #bbb; }
.compact-products article { min-height:45mm; padding:4mm; border-right:.2mm solid #bbb; border-bottom:.2mm solid #bbb; }
.compact-products b { color:#2e2eff; font:600 6pt/1 "Fragment Mono",monospace; }
.compact-products h3 { margin:4mm 0 2mm; font-size:17pt; }
.compact-products strong { font-size:7.5pt; }
.compact-products p { font-size:7.2pt; margin-top:2mm; color:#444; }
.audience-sheet > h2 { font-size:29pt; margin-bottom:8mm; }
.lede { font-size:11pt; max-width:150mm; margin-bottom:8mm; }
.two { display:grid; grid-template-columns:1fr 1fr; gap:10mm; border-top:.3mm solid #111; padding-top:5mm; margin-bottom:7mm; }
.two h3 { font:650 6.5pt/1 "Fragment Mono",monospace; letter-spacing:.08em; margin:0 0 2mm; }
.two p { margin-bottom:5mm; }
.callout { border:.4mm solid #2e2eff; padding:5mm; margin:6mm 0; display:grid; grid-template-columns:40mm 1fr; gap:5mm; align-items:start; }
.callout b { color:#2e2eff; font:650 8pt/1 "Fragment Mono",monospace; }
.callout small { grid-column:2; font-size:7pt; }
.callout.compact { grid-template-columns:45mm 1fr; }
.check-grid,.state-grid { display:grid; grid-template-columns:repeat(3,1fr); border-top:.2mm solid #bbb; border-left:.2mm solid #bbb; margin-top:5mm; }
.check-grid div,.state-grid div { min-height:25mm; padding:3mm; border-right:.2mm solid #bbb; border-bottom:.2mm solid #bbb; }
.check-grid b,.state-grid b { display:block; font:650 6pt/1.2 "Fragment Mono",monospace; }
.check-grid span { font-size:7pt; display:block; margin-top:2mm; }
.state-grid p { font-size:6.6pt; margin-top:2mm; }
.boundary { border-left:.8mm solid #2e2eff; padding-left:3mm; margin-top:6mm; font-size:7pt; }
.module-grid { display:grid; grid-template-columns:1fr 1fr; border-top:.2mm solid #bbb; border-left:.2mm solid #bbb; }
.module-grid article { min-height:46mm; padding:4mm; border-right:.2mm solid #bbb; border-bottom:.2mm solid #bbb; }
.module-grid h3 { font-size:13pt; margin-bottom:2mm; }
.module-grid strong { font-size:7pt; }
.module-grid p { font-size:7pt; margin:2mm 0; }
.module-grid small { font-size:6pt; line-height:1.25; }
.route-grid { display:grid; grid-template-columns:1fr 1fr; border-top:.2mm solid #bbb; border-left:.2mm solid #bbb; }
.route-grid article { min-height:50mm; padding:4mm; border-right:.2mm solid #bbb; border-bottom:.2mm solid #bbb; }
.route-grid h3 { font-size:13pt; }
.route-grid p { font-size:7.2pt; margin:2mm 0; }
.route-grid small { font-size:6pt; color:#555; }
.close-sheet > h2 { font-size:29pt; margin-bottom:7mm; }
.proof-grid { display:grid; grid-template-columns:1fr 1fr; border-top:.3mm solid #111; border-left:.2mm solid #bbb; }
.proof-grid article { padding:4mm; min-height:69mm; border-right:.2mm solid #bbb; border-bottom:.2mm solid #bbb; }
.proof-grid .meta { font:600 5.5pt/1.3 "Fragment Mono",monospace; letter-spacing:.05em; margin-bottom:4mm; }
.proof-grid h3 { font-size:16pt; margin-bottom:2mm; }
.proof-grid strong { font-size:7pt; }
.proof-grid p { font-size:6.8pt; margin:2mm 0; }
.proof-grid small { font-size:5.8pt; line-height:1.25; }
.close-grid { display:grid; grid-template-columns:1fr 1fr; gap:9mm; margin-top:8mm; }
.close-grid h3 { font:650 7pt/1 "Fragment Mono",monospace; letter-spacing:.08em; margin-bottom:3mm; }
.close-grid p { font-size:7.2pt; }
.roadmap { border-top:.2mm solid #bbb; }
.roadmap > div { display:grid; grid-template-columns:31mm 1fr; gap:3mm; padding:2.2mm 0; border-bottom:.2mm solid #bbb; }
.roadmap strong { font:650 5.7pt/1.2 "Fragment Mono",monospace; }
.roadmap p { font-size:6.3pt; line-height:1.25; }
.next-step { position:absolute; left:14mm; right:14mm; bottom:20mm; background:#0a0a0a; color:white; padding:5mm; display:grid; grid-template-columns:45mm 1fr auto; gap:5mm; align-items:center; }
.next-step b { font:650 6pt/1.2 "Fragment Mono",monospace; }
.next-step p { font-size:8pt; }
.next-step strong { font-size:8pt; }
`;

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await desktop.goto(`${base}/`, { waitUntil: "networkidle" });
  const body = await desktop.locator("body").innerText();
  if (!body.includes("The living world is connected.")) throw new Error("PARTNERS_RENDER_FAIL homepage thesis missing");
  const robots = await desktop.locator('meta[name="robots"]').getAttribute("content");
  if (!robots?.includes("noindex")) throw new Error("PARTNERS_RENDER_FAIL noindex meta missing");
  await desktop.screenshot({ path: path.join(evidence, "partners-home-desktop.png"), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto(`${base}/`, { waitUntil: "networkidle" });
  const horizontalOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (horizontalOverflow > 2) throw new Error(`PARTNERS_RENDER_FAIL mobile horizontal overflow ${horizontalOverflow}px`);
  await mobile.screenshot({ path: path.join(evidence, "partners-home-mobile.png"), fullPage: true });
  await mobile.close();

  for (const [slug, filename] of briefs) {
    const brief = hub.briefs.find((x) => x.slug === slug) || hub.briefs[0];
    await desktop.goto(`${base}/briefs/${slug}`, { waitUntil: "networkidle" });
    const html = slug === "overview" ? overviewHtml(brief) : longBriefHtml(slug, brief);
    await desktop.evaluate((markup) => { document.body.innerHTML = markup; }, html);
    await desktop.addStyleTag({ content: printCss });
    await desktop.emulateMedia({ media: "print" });
    const target = path.join(out, filename);
    await desktop.pdf({ path: target, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    const stat = fs.statSync(target);
    if (stat.size < 15000) throw new Error(`PARTNERS_RENDER_FAIL PDF suspiciously small ${filename} ${stat.size}`);
    const header = fs.readFileSync(target).subarray(0, 5).toString("ascii");
    if (header !== "%PDF-") throw new Error(`PARTNERS_RENDER_FAIL invalid PDF signature ${filename}`);
    await desktop.emulateMedia({ media: "screen" });
  }
  await desktop.close();
} finally {
  await browser.close();
}

console.log(`PARTNERS_BRIEFS_RENDERED=${briefs.length}`);
console.log("PARTNERS_BRIEF_TARGET=overview:1page;others:4pages");
console.log(`PARTNERS_EVIDENCE_DIR=${evidence}`);
