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
  assert.match(overview, /public surface/);
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
  ]) assert.ok(overview.includes(token), `missing LABS project grammar token: ${token}`);
});

test("LABS project universe keeps 4PLANET, ODIN and P4NTHER structurally separate", () => {
  for (const universe of ["4PLANET", "ODIN", "P4NTHER"]) {
    assert.ok(data.includes(`universe: "${universe}"`), `missing universe: ${universe}`);
  }
  assert.match(data, /slug: "4planet"/);
  assert.match(data, /slug: "odin"/);
  assert.match(data, /slug: "p4nther"/);
  assert.match(overview, /childrenOf\(root\.slug\)/);
});

test("LABS preserves the approved mosaic, hover and theme interaction contracts", () => {
  assert.match(overview, /labs-project-box/);
  assert.match(overview, /labs-box-hover/);
  assert.match(overview, /4planet-labs-theme/);
  assert.match(css, /grid-template-columns:\s*repeat\(12/);
  assert.match(css, /--brand:\s*#2e2eff/i);
  assert.match(css, /data-theme="light"/);
});

test("LABS project details fail visibly closed when structured state is absent", () => {
  assert.match(overview, /UNKNOWN — no milestone set is projected/);
  assert.match(overview, /UNKNOWN — no project roadmap is projected/);
  assert.match(overview, /UNKNOWN — process projection not connected/);
  assert.match(overview, /UNKNOWN — no current tasks are projected/);
});

test("LABS public interface remains noindex", () => {
  assert.match(overview, /noindex,nofollow,noarchive/);
});
