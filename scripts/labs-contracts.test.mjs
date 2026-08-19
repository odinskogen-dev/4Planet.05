import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const overview = fs.readFileSync("src/pages/labs/LabsOverview.tsx", "utf8");
const data = fs.readFileSync("src/pages/labs/labsData.ts", "utf8");
const css = fs.readFileSync("src/pages/labs/labs.css", "utf8");

test("LABS remains a read-only BRAIN projection, never an invented live status system", () => {
  assert.match(data, /MANUAL BRAIN PROJECTION · READ ONLY/);
  assert.match(overview, /BRAIN remains the authority/);
  assert.match(overview, /Missing values stay UNKNOWN/);
  assert.doesNotMatch(data, /projectionState\s*=\s*["'`]LIVE/i);
});

test("LABS exposes the approved human project OS grammar", () => {
  for (const token of [
    "DONE / MILESTONES",
    "ROADMAP",
    "PROCESSES",
    "ACTIVE TASKS",
    "AXE / AI FORWARD PLAN",
    "FOUNDER DECISIONS",
    "EVIDENCE / AUTHORITY",
    "LINKED ASSETS",
  ]) assert.ok(overview.includes(token), `missing LABS project grammar token: ${token}`);
});

test("LABS project universe keeps major worlds structurally separate and ordered", () => {
  for (const universe of ["4PLANET", "ODIN", "P4NTHER", "SANDBOX"]) {
    assert.ok(data.includes(`universe: "${universe}"`), `missing universe: ${universe}`);
  }
  for (const slug of ["4planet", "odin", "p4nther", "sandbox"]) {
    assert.ok(data.includes(`slug: "${slug}"`), `missing root: ${slug}`);
  }
  assert.match(overview, /childrenOf\(root\.slug\)/);
  assert.match(data, /\["4planet", "odin", "p4nther", "sandbox"\]/);
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

test("LABS preserves the filled-colour maze, hover inspector and dark-white theme contracts", () => {
  assert.match(overview, /labs-project-box/);
  assert.match(overview, /labs-box-hover/);
  assert.match(overview, /labs-inspector/);
  assert.match(overview, /4planet-labs-theme/);
  assert.match(css, /grid-template-columns:repeat\(12/);
  assert.match(css, /--accent-brand:#2e2eff/i);
  assert.match(css, /background:var\(--accent\)/);
  assert.match(css, /data-theme="light"/);
  assert.match(css, /--bg:#000000/i);
  assert.match(css, /--bg:#fff/i);
});

test("LABS project details fail visibly closed when structured state is absent", () => {
  assert.match(overview, /UNKNOWN — no milestone set is projected/);
  assert.match(overview, /UNKNOWN — no project roadmap is projected/);
  assert.match(overview, /UNKNOWN — process projection not connected/);
  assert.match(overview, /UNKNOWN — no current tasks are projected/);
  assert.match(overview, /UNKNOWN — no public-safe linked assets are projected/);
});

test("LABS public interface remains noindex", () => {
  assert.match(overview, /noindex,nofollow,noarchive/);
});
