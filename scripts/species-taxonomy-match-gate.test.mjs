import test from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let gate;
let scratch;

test.before(async () => {
  scratch = await mkdtemp(join(tmpdir(), "species-match-gate-"));
  const outfile = join(scratch, "matchGate.mjs");
  const source = await readFile("src/species/matchGate.ts", "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  await writeFile(outfile, compiled.outputText, "utf8");
  gate = await import(`${pathToFileURL(outfile).href}?v=${Date.now()}`);
});

test.after(async () => {
  if (scratch) await rm(scratch, { recursive: true, force: true });
});

const exactSpecies = (overrides = {}) => ({
  sourceAuthority: gate.COL_XR_SOURCE_AUTHORITY,
  checklistKey: "7ddf754f-d193-4cc9-b351-99906754a03b",
  requestedName: "Orcinus orca",
  requestedRank: "species",
  matchedName: "Orcinus orca (Linnaeus, 1758)",
  acceptedName: "Orcinus orca (Linnaeus, 1758)",
  returnedRank: "SPECIES",
  matchType: "EXACT",
  confidence: 99,
  alternatives: [],
  issues: [],
  ...overrides,
});

test("only exact high-confidence expected-rank matches qualify for TEST registry persistence", () => {
  const result = gate.reviewTaxonomyMatch(exactSpecies());
  assert.equal(result.state, "ELIGIBLE_FOR_TEST_REGISTRY");
  assert.deepEqual(result.reasons, []);
  assert.equal(result.requestedRank, "SPECIES");
  assert.equal(result.returnedRank, "SPECIES");
});

test("missing requested rank remains review-required instead of copying the returned rank", () => {
  const result = gate.reviewTaxonomyMatch(exactSpecies({ requestedRank: undefined }));
  assert.equal(result.state, "REVIEW_REQUIRED");
  assert.match(result.reasons.join(" "), /REQUESTED_RANK_UNKNOWN/);
});

test("fuzzy, higher-rank and no-match diagnostics remain review-required", () => {
  for (const matchType of ["FUZZY", "HIGHERRANK", "NONE"]) {
    const result = gate.reviewTaxonomyMatch(exactSpecies({ matchType }));
    assert.equal(result.state, "REVIEW_REQUIRED", matchType);
    assert.ok(result.reasons.includes(`MATCH_TYPE_${matchType}`));
  }
});

test("low or missing confidence, alternatives and diagnostic conflicts fail closed", () => {
  const fixtures = [
    exactSpecies({ confidence: 94 }),
    exactSpecies({ confidence: undefined }),
    exactSpecies({ alternatives: [{ key: "other" }] }),
    exactSpecies({ issues: ["SCIENTIFIC_NAME_ID_INCONSISTENT"] }),
  ];
  for (const fixture of fixtures) {
    assert.equal(gate.reviewTaxonomyMatch(fixture).state, "REVIEW_REQUIRED");
  }
});

test("species/subspecies rank conflict cannot persist a canonical TEST identity", () => {
  const result = gate.reviewTaxonomyMatch(exactSpecies({ returnedRank: "SUBSPECIES" }));
  assert.equal(result.state, "REVIEW_REQUIRED");
  assert.ok(result.reasons.includes("RANK_CONFLICT"));
});

test("exact accepted synonym preserves requested, matched and accepted names", () => {
  const result = gate.reviewTaxonomyMatch(exactSpecies({
    requestedName: "Orca gladiator",
    matchedName: "Orca gladiator (Bonnaterre, 1789)",
    acceptedName: "Orcinus orca (Linnaeus, 1758)",
    synonym: true,
  }));
  assert.equal(result.state, "ELIGIBLE_FOR_TEST_REGISTRY");
  assert.equal(result.requestedName, "Orca gladiator");
  assert.match(result.matchedName, /Orca gladiator/);
  assert.match(result.acceptedName, /Orcinus orca/);
  assert.equal(result.synonym, true);
});

test("legacy identifier matches use the same gate and require an explicit expected rank", () => {
  const qualified = gate.reviewTaxonomyMatch(exactSpecies({ identifierBased: true }));
  assert.equal(qualified.state, "ELIGIBLE_FOR_TEST_REGISTRY");
  assert.equal(qualified.identifierBased, true);

  const unqualified = gate.reviewTaxonomyMatch(exactSpecies({ identifierBased: true, requestedRank: undefined }));
  assert.equal(unqualified.state, "REVIEW_REQUIRED");
});
