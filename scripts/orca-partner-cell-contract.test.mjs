import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/partners/orcaPartnerCell.ts", import.meta.url), "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const partner = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);
const page = await readFile(new URL("../src/pages/integrated/ImpactActionProof.tsx", import.meta.url), "utf8");
const cell = partner.ORCA_BAY_PARTNER_CELL;

test("fresh ORCA Partner Cell starts from human decision utility", () => {
  assert.match(cell.humanGold.primaryUser, /non-expert funder|route stakeholder|partner reviewer/i);
  assert.match(cell.humanGold.job, /decision-ready/i);
  assert.match(cell.humanGold.fiveSecond, /real ferry route/i);
  assert.match(cell.humanGold.thirtySecond, /sightings are not population trends/i);
});

test("route and observation semantics fail closed against migration/population inflation", () => {
  assert.match(cell.place.boundary, /not an orca migration route/i);
  for (const rule of [
    "OBSERVATION ≠ POPULATION",
    "OBSERVATION ≠ HABITAT",
    "OBSERVATION ≠ MIGRATION ROUTE",
    "PAYMENT ≠ DELIVERY",
    "DELIVERY ≠ OUTCOME",
    "OUTCOME ≠ VERIFIED IMPACT",
  ]) assert.ok(cell.monitoringSemantics.rules.includes(rule), `missing truth rule: ${rule}`);
});

test("uncleared programme correspondence is absent from the public Partner Cell", () => {
  assert.deepEqual(
    [cell.programme2026.surveysMin, cell.programme2026.surveysMax, cell.programme2026.surveyDaysMin, cell.programme2026.surveyDaysMax],
    [null, null, null, null],
  );
  assert.equal(cell.programme2026.state, "SOURCE_CLEARANCE_REQUIRED");
  assert.equal(cell.programme2026.sourceId, null);
  assert.equal(cell.sources.every((item) => item.state === "PUBLIC_AUTHORITATIVE"), true);
  assert.doesNotMatch(source, /Steve Jones|4 Sep 2026|10 or 12 surveys|40–48 survey days|PARTNER_CORRESPONDENCE/i);
  assert.doesNotMatch(page, /Steve Jones|4 Sep 2026|10–12|40–48|PARTNER CORRESPONDENCE/i);
});

test("current public ORCA evidence is source-bound and programme totals are not misattributed", () => {
  const sources = partner.publicOrcaCellSources(cell);
  assert.ok(sources.some((item) => item.url?.includes("survey-highlights-portsmouth-santander-22-06-2026")));
  const season = sources.find((item) => item.id === "orca-season-2025");
  assert.ok(season?.limitations.some((item) => /aggregate multiple routes/i.test(item)));
  assert.equal(sources.some((item) => item.state !== "PUBLIC_AUTHORITATIVE"), false);
});

test("funding seam remains closed until real ORCA terms and proof fields are confirmed", () => {
  assert.equal(cell.fundingSeam.canOpen, false);
  assert.equal(cell.fundingSeam.state, "CLOSED_PENDING_CURRENT_TERMS");
  for (const required of ["current actual sponsorship terms", "exact funded unit / quantity", "double-count treatment", "permitted public claims"]) {
    assert.ok(cell.fundingSeam.nextTruthRequired.includes(required));
  }
});

test("fresh React candidate does not route the user back into legacy LUME/XR", () => {
  assert.match(page, /PARTNER CELL · ORCA \/ BAY/);
  assert.match(page, /A real route\. A real monitoring programme\. Proof without pretending\./);
  assert.match(page, /to="\/species\/orca"/);
  assert.doesNotMatch(page, /to="\/species\/orca\/lume"/);
  assert.doesNotMatch(page, /href="\/journey\/orca/);
  assert.doesNotMatch(page, /LUME ROOM|XR EXPERIENCE/i);
});
