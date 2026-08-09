import { createHash } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const dir = process.env.PSI_PACKAGE_DIR;
if (!dir) {
  console.error("PSI_PACKAGE_DIR is required. The private BRAIN package must be mounted explicitly; it is never pulled into this public repository.");
  process.exit(2);
}

const readJson = async (name) => JSON.parse(await readFile(path.join(dir, name), "utf8"));
const readJsonl = async (name) => (await readFile(path.join(dir, name), "utf8"))
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const sha256 = async (name) => createHash("sha256").update(await readFile(path.join(dir, name))).digest("hex");

const manifest = await readJson("manifest.json");
const verifiedFiles = {};
let manifestOk = true;
for (const [name, expected] of Object.entries(manifest.files ?? {})) {
  const actualSha = await sha256(name);
  const actualBytes = (await stat(path.join(dir, name))).size;
  const shaMatch = actualSha === expected.sha256;
  const bytesMatch = actualBytes === expected.bytes;
  verifiedFiles[name] = { expectedSha256: expected.sha256, actualSha256: actualSha, shaMatch, expectedBytes: expected.bytes, actualBytes, bytesMatch };
  manifestOk &&= shaMatch && bytesMatch;
}

const objects = await readJsonl("objects.jsonl");
const hierarchy = await readJsonl("hierarchy.jsonl");
const causal = await readJsonl("causal_edges.jsonl");
const claims = await readJsonl("claims.jsonl");
const relations = await readJsonl("solution_problem_m2m.jsonl");
const coverage = await readJsonl("coverage_matrix.jsonl");

const problemRefs = new Set(objects.filter((row) => String(row["Source ref"]).startsWith("4P-PX-")).map((row) => row["Source ref"]));
const solutionRefs = new Set(relations.map((row) => row["Solution ID"]));
const relationIds = new Set(relations.map((row) => row["Relation ID"]));

const lowConfidence = relations.filter((row) => row["Mapping confidence"] === "LOW");
const invalidEffectiveness = relations.filter((row) => row["Effectiveness implication"] !== "NONE");
const orphanProblems = relations.filter((row) => !problemRefs.has(row["Problem Complex ID"]));

const causalStatus = causal.reduce((acc, row) => {
  const k = row["V2 classification"];
  acc[k] = (acc[k] ?? 0) + 1;
  return acc;
}, {});

const plan = {
  release: manifest.release,
  packageManifestValid: manifestOk,
  verifiedFiles,
  counts: {
    migrationObjects: objects.length,
    hierarchyRelations: hierarchy.length,
    causalEdges: causal.length,
    claims: claims.length,
    solutionProblemRelations: relations.length,
    uniqueRelationIds: relationIds.size,
    coverageRows: coverage.length,
    uniqueSolutionRefsObservedInRelations: solutionRefs.size,
    lowConfidenceRelationsHeldForReview: lowConfidence.length,
    effectivenessViolations: invalidEffectiveness.length,
    orphanProblemRelations: orphanProblems.length,
  },
  causalReviewRouting: {
    traversableAfterReview: (causalStatus.SUPPORTED ?? 0) + (causalStatus.QUALIFIED ?? 0),
    researchOnlyUnreviewed: (causalStatus.REQUIRES_RESEARCH ?? 0) + (causalStatus.INSUFFICIENT_EVIDENCE ?? 0),
    challengedRejectedFromNormalTraversal: causalStatus.CHALLENGED ?? 0,
  },
  quarantine: lowConfidence.map((row) => ({
    relationId: row["Relation ID"],
    solutionId: row["Solution ID"],
    problemComplexId: row["Problem Complex ID"],
    reason: "LOW_CONFIDENCE_DERIVED_ADDRESSES_REQUIRES_HUMAN_REVIEW",
  })),
  truthBoundary: {
    manifestVerificationIsDatabaseIngest: false,
    relationRelevanceIsEffectiveness: false,
    lowConfidenceIsAutoPromoted: false,
    privateCorpusBelongsInPublicRepo: false,
  },
};

const output = process.env.PSI_AUDIT_OUTPUT;
if (output) await writeFile(output, JSON.stringify(plan, null, 2));
console.log(JSON.stringify(plan, null, 2));
if (!manifestOk || invalidEffectiveness.length || orphanProblems.length || relationIds.size !== relations.length) process.exit(1);
