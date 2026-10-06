#!/usr/bin/env node
import fs from "node:fs";
import { execFileSync } from "node:child_process";

function fail(message) {
  console.error(`LIVE PROMOTION AUTHORITY GUARD: FAIL — ${message}`);
  process.exit(1);
}
function git(args, fallback = "") {
  try { return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(); }
  catch { return fallback; }
}
function sha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
}

const manifestPath = "docs/control/LIVE_PROMOTION_MANIFEST.json";
const authorityPath = "docs/control/PROJECT_CANDIDATE_AUTHORITY.json";
const sourceManifestPath = "docs/control/LIVING_SYSTEMS_V142_SOURCE_MANIFEST.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const authority = JSON.parse(fs.readFileSync(authorityPath, "utf8"));
const head = git(["rev-parse", "HEAD"]);
const branch = process.env.GITHUB_REF_NAME || git(["branch", "--show-current"]);

if (authority?.authority_model?.test_heir?.branch !== "king/test") fail("king/test is not the sole configured HEIR");
if (authority?.promotion_contract?.live_promotion !== "FOUNDER_AUTHORITY_REQUIRED_EXACT_TESTED_ARTIFACT") fail("Founder exact-artifact law missing");
if (!["FOUNDER_ACCEPTED", "FOUNDER_AUTHORISED"].includes(manifest.status)) fail(`manifest status is ${manifest.status || "MISSING"}`);
if (manifest.sourceBranch !== "king/test") fail(`sourceBranch must be king/test, got ${manifest.sourceBranch || "MISSING"}`);
for (const key of ["testKingSha","priorLiveSha"]) if (!sha(manifest[key])) fail(`${key} invalid`);
if (!manifest.founderDecisionRef || !String(manifest.founderDecisionRef).trim()) fail("founderDecisionRef missing");
if (!manifest.evidenceRef || !String(manifest.evidenceRef).trim()) fail("evidenceRef missing");
if (!manifest.rollbackRef || !String(manifest.rollbackRef).includes(manifest.priorLiveSha)) fail("rollbackRef does not bind priorLiveSha");
if (!head) fail("cannot resolve exact checked-out SHA");
if (branch && branch !== "main" && process.env.ALLOW_PREPROMOTION_CHECK !== "1") fail(`LIVE guard may only authorise main; observed ${branch}`);

if (manifest.boundedRelease === true) {
  if (!sha(manifest.releaseCommitSha)) fail("bounded releaseCommitSha invalid");
  try { execFileSync("git", ["fetch", "--no-tags", "origin", "king/test"], { stdio: "ignore" }); }
  catch { fail("unable to fetch king/test for exact source comparison"); }

  const releaseParent = git(["rev-parse", `${manifest.releaseCommitSha}^`]);
  if (releaseParent !== manifest.priorLiveSha) {
    fail(`bounded release parent ${releaseParent || "MISSING"} is not priorLiveSha ${manifest.priorLiveSha}`);
  }
  if (git(["merge-base", "--is-ancestor", manifest.releaseCommitSha, head], "FAIL") === "FAIL") {
    // merge-base --is-ancestor is silent on success, so verify using merge-base equality instead.
    const mb = git(["merge-base", manifest.releaseCommitSha, head]);
    if (mb !== manifest.releaseCommitSha) fail("current main does not descend from bounded release commit");
  }

  const changed = git(["diff", "--name-only", manifest.priorLiveSha, manifest.releaseCommitSha]).split("\n").filter(Boolean);
  if (manifest.releaseType === "DISCOVERY_ENGINE_01") {
    const descriptorPath = "docs/control/DISCOVERY_ENGINE_01_RELEASE.json";
    if (!fs.existsSync(descriptorPath)) fail("Discovery release descriptor missing");
    const descriptor = JSON.parse(fs.readFileSync(descriptorPath, "utf8"));
    if (descriptor.releaseType !== "DISCOVERY_ENGINE_01") fail("Discovery release type mismatch");
    if (descriptor.priorLiveSha !== manifest.priorLiveSha) fail("Discovery prior LIVE mismatch");
    if (descriptor.testKingSha !== manifest.testKingSha) fail("Discovery TEST KING mismatch");

    const declared = Array.isArray(manifest.releaseFiles) ? [...manifest.releaseFiles].sort() : [];
    const descriptorFiles = Array.isArray(descriptor.releaseFiles) ? [...descriptor.releaseFiles].sort() : [];
    const actual = [...changed].sort();
    if (!declared.length || JSON.stringify(declared) !== JSON.stringify(descriptorFiles)) fail("Discovery release file manifest mismatch");
    if (JSON.stringify(actual) !== JSON.stringify(declared)) {
      fail(`Discovery bounded release files differ: actual=${actual.join(",")} declared=${declared.join(",")}`);
    }

    const sourceExact = Array.isArray(manifest.sourceExactFiles) ? manifest.sourceExactFiles : [];
    const descriptorExact = Array.isArray(descriptor.sourceExactFiles) ? descriptor.sourceExactFiles : [];
    if (!sourceExact.length || JSON.stringify([...sourceExact].sort()) !== JSON.stringify([...descriptorExact].sort())) {
      fail("Discovery source-exact file manifest mismatch");
    }

    let exact = 0;
    for (const path of sourceExact) {
      const liveBlob = git(["rev-parse", `${manifest.releaseCommitSha}:${path}`]);
      const testBlob = git(["rev-parse", `${manifest.testKingSha}:${path}`]);
      if (!liveBlob || !testBlob || liveBlob !== testBlob) fail(`Discovery source blob mismatch: ${path}`);
      exact += 1;
    }

    console.log("LIVE PROMOTION AUTHORITY GUARD: PASS — BOUNDED DISCOVERY ENGINE 01");
    console.log(JSON.stringify({
      branch,
      currentHead: head,
      releaseCommit: manifest.releaseCommitSha,
      exactTestedArtifact: manifest.testKingSha,
      priorLiveSha: manifest.priorLiveSha,
      releaseFiles: actual.length,
      exactSourceBlobs: exact,
      founderDecisionRef: manifest.founderDecisionRef,
      evidenceRef: manifest.evidenceRef,
      rollbackRef: manifest.rollbackRef
    }, null, 2));
    process.exit(0);
  }

  const exactAllowed = new Set([
    "package.json",
    "src/pages/v5/Home.tsx",
    "public/_redirects",
    "scripts/generate-sitemap.mjs",
    "scripts/user-proof-analytics-contract.test.mjs",
    "scripts/build-living-systems-v142.mjs",
    "scripts/living-systems-v142-zero-loss.test.mjs",
    "docs/control/LIVING_SYSTEMS_V142_SOURCE_MANIFEST.json",
    "docs/control/LIVING_SYSTEMS_V142_ZERO_LOSS_RELEASE_20261006.md",
    "docs/control/GOLD_CURRENT_BRIEF.md",
    "docs/control/LIVE_PROMOTION_MANIFEST.json",
    ".github/workflows/discovery-main-live.yml",
  ]);
  const unexpected = changed.filter((file) => !file.startsWith("products/livingsystems/") && !exactAllowed.has(file));
  if (unexpected.length) fail(`bounded release contains unexpected files: ${unexpected.join(", ")}`);

  const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, "utf8"));
  if (sourceManifest.source_commit !== manifest.sourceCommit) fail("source commit mismatch between manifests");
  if (sourceManifest.source_file_count !== 88 || sourceManifest.source_paths.length !== 88) fail("ZERO LOSS source manifest is not 88 files");

  let exact = 0;
  for (const rel of sourceManifest.source_paths) {
    const path = `products/livingsystems/${rel}`;
    const liveBlob = git(["rev-parse", `${manifest.releaseCommitSha}:${path}`]);
    const testBlob = git(["rev-parse", `${manifest.testKingSha}:${path}`]);
    if (!liveBlob || !testBlob || liveBlob !== testBlob) fail(`ZERO LOSS blob mismatch: ${rel}`);
    exact += 1;
  }
  if (exact !== 88) fail(`ZERO LOSS exact blob count is ${exact}, expected 88`);

  console.log("LIVE PROMOTION AUTHORITY GUARD: PASS — BOUNDED ZERO LOSS");
  console.log(JSON.stringify({
    branch,
    currentHead: head,
    releaseCommit: manifest.releaseCommitSha,
    exactTestedArtifact: manifest.testKingSha,
    priorLiveSha: manifest.priorLiveSha,
    sourceCommit: manifest.sourceCommit,
    exactHistoricalBlobs: exact,
    unexpectedReleaseFiles: unexpected.length,
    founderDecisionRef: manifest.founderDecisionRef,
    evidenceRef: manifest.evidenceRef,
    rollbackRef: manifest.rollbackRef
  }, null, 2));
  process.exit(0);
}

// Legacy exact-artifact path remains fail-closed for non-bounded releases.
const parent = git(["rev-parse", "HEAD^"]);
if (head !== manifest.testKingSha) {
  if (manifest.schemaVersion !== 2 || manifest.releaseControlCommit !== true) fail(`checked-out SHA ${head} is not authorised exact artifact ${manifest.testKingSha}`);
  if (parent !== manifest.testKingSha) fail(`release-control parent ${parent || "MISSING"} is not exact tested artifact ${manifest.testKingSha}`);
  const changed = git(["diff", "--name-only", manifest.testKingSha, head]).split("\n").filter(Boolean);
  if (changed.length !== 1 || changed[0] !== manifestPath) fail(`release-control commit changed non-manifest files: ${changed.join(", ") || "NONE"}`);
}

console.log("LIVE PROMOTION AUTHORITY GUARD: PASS");
