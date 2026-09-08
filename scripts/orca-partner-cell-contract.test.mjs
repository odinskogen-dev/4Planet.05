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

test("2026 programme range is attributable to partner correspondence, not promoted to public source", () => {
  assert.deepEqual(
    [cell.programme2026.surveysMin, cell.programme2026.surveysMax, cell.programme2026.surveyDaysMin, cell.programme2026.surveyDaysMax],
    [10, 12, 40, 48],
  );
  const sourceRecord = cell.sources.find((item) => item.id === cell.programme2026.sourceId);
  assert.equal(sourceRecord?.state, "PARTNER_CORRESPONDENCE");
  assert.equal(sourceRecord?.url, null);
  assert.ok(sourceRecord?.limitations.some((item) => /placeholder/i.test(item)));
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
