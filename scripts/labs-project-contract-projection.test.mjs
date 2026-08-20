import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const projection = fs.readFileSync("src/pages/labs/labsProjectContractProjection.ts", "utf8");
const component = fs.readFileSync("src/pages/labs/LabsProjectContract.tsx", "utf8");
const detail = fs.readFileSync("src/pages/labs/LabsProjectDetailPremium.tsx", "utf8");
const css = fs.readFileSync("src/pages/labs/labsProjectContract.css", "utf8");

test("Project Contract projection covers current canonical Project Homes without becoming a status store", () => {
  for (const id of [
    "SYS-P00-01", "SYS-P00-STRAT", "SYS-P00-PRODUCT", "SYS-P00-TRUTH", "SYS-P00-PROOF", "SYS-P00-CAPITAL",
    "SYS-P00-COMPANY", "SYS-P00-REL", "SYS-P00-BRAND", "SYS-P00-SOLUTIONS", "SYS-P00-LABS", "SYS-P00-PMAP",
    "SYS-P00-ECONOMY", "SYS-SONIC-01", "SAP-SAPIENS-01", "SYS-P00-DPITCH", "LAB-CREATOR-01",
    "OCE-WH4LES-01", "OCE-COR4L-01", "OCE-PL4STIC-01", "OCE-REWILD-M-01",
    "EAR-CLIM4TE-01", "EAR-AM4ZONIA-01", "EAR-SPECIES-01", "EAR-REWILD-L-01",
    "SAP-FOOD-01", "SAP-EN3RGY-01", "SAP-CIRCULAR-01", "SAP-F4SHION-01",
    "CUL-M4GAZINE-01", "CUL-4FILM-01", "CUL-4RT-01", "CUL-4PLAY-01",
  ]) assert.ok(projection.includes(`"${id}"`), `missing safe Project Contract projection for ${id}`);

  assert.match(projection, /BRAIN \/ Founder Control remains authority/);
  assert.match(projection, /does NOT copy current state\/current gate\/money\/code\/deployment state/);
  assert.match(projection, /read-only projection/i);
});

test("Project Contract UI exposes the Founder-useful stable Project Pack grammar", () => {
  for (const label of [
    "PROJECT CONTRACT",
    "THEORY / HYPOTHESIS",
    "SCOPE IN",
    "OUT / LATER",
    "OPERATING MODEL",
    "DECISION RIGHTS",
    "CAPITAL ROUTING",
    "PROOF / SCIENCE / IP / RISK",
    "STRATEGIC ROLE + MECHANISMS",
  ]) assert.ok(component.includes(label), `missing Project Contract label ${label}`);

  assert.match(detail, /LabsProjectContract/);
  const goalsPosition = detail.indexOf("<Goals project={project} />");
  const contractPosition = detail.indexOf("<LabsProjectContract project={project} />");
  const executionPosition = detail.indexOf("<Execution project={project} />");
  assert.ok(goalsPosition >= 0 && contractPosition > goalsPosition && executionPosition > contractPosition, "Project Contract must sit between Goals and Execution");
});

test("Project Contract projection is public-safe and fail-closed", () => {
  const combined = `${projection}\n${component}`;
  for (const forbidden of ["forced sale", "ulcerative", "Nordnet", "AAP"]) assert.doesNotMatch(combined, new RegExp(forbidden, "i"));
  assert.doesNotMatch(projection, /\b[a-f0-9]{40}\b/i, "stable Project Contract projection must not embed fast-moving artifact SHAs");
  assert.match(component, /UNKNOWN \/ NOT PROJECTED/);
});

test("Project Contract visual layer preserves the existing LABS system and mobile containment", () => {
  assert.match(css, /var\(--accent\)/);
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /grid-template-columns:1fr/);
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}/, "Project Contract should inherit LABS accents rather than invent new brand colours");
});
