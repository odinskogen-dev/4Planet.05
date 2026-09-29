#!/usr/bin/env node

import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { CURRENT_LIVE_ORIGIN, IMMEDIATE_PRE_RELEASE, currentLiveProblems, decideProductLive, fetchProviderLive, observeCurrentLive, observePinnedDeployment, productionReadbackFromProvider, rollbackProblems } from "./live-promotion-authority-gate.mjs";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "docs/control/PRODUCT_SURFACE_REGISTRY.json");
const AUTHORITY_PATH = path.join(ROOT, "docs/control/PROJECT_CANDIDATE_AUTHORITY.json");

// These branches may carry governance/operations/factory support only. They have ZERO product authority.
const SYSTEM_BRANCH_PREFIXES = ["control/", "ops/", "docs/", "factory/"];
const GOVERNANCE_ONLY_PREFIXES = [".github/", "docs/", "scripts/"];

// Treat all application/runtime/data/test surfaces as product code. This intentionally errs on the side of blocking.
const PRODUCT_CODE_PREFIXES = [
  "src/",
  "public/",
  "functions/",
  "supabase/",
  "api/",
  "server/",
  "workers/",
  "tests/",
  "test/",
  "e2e/"
];
const PRODUCT_ROOT_FILES = new Set([
  "index.html",
  "package.json",
  "package-lock.json",
  "vite.config.ts",
  "vite.config.js",
  "wrangler.toml",
  "wrangler.json",
  "wrangler.jsonc",
  "tsconfig.json"
]);

function die(message) {
  console.error(`PRODUCT AUTHORITY GATE: FAIL — ${message}`);
  process.exit(1);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    die(`cannot read ${path.relative(ROOT, file)}: ${error.message}`);
  }
}

function git(args, fallback = "") {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return fallback;
  }
}

function gitSucceeds(args) {
  try {
    execFileSync("git", args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function isSha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
}

function isProductCode(file) {
  return PRODUCT_CODE_PREFIXES.some((prefix) => file.startsWith(prefix)) || PRODUCT_ROOT_FILES.has(file);
}

function isGovernanceOnly(file) {
  return GOVERNANCE_ONLY_PREFIXES.some((prefix) => file.startsWith(prefix));
}

const TARGETED_ID_RELEASE = {
  branch: "release/targeted-4planet-id-20260929",
  liveSourceSha: "d5540905de7e57a2a781db92771da4d87c472c60",
  founderDecision: "ENIG TARGETED RELEASE CONTROL AMENDMENT",
  allow: new Set([
    "src/identity/identityClient.ts",
    "src/components/layout/PublicShell.tsx",
    "src/pages/v5/Join.tsx",
    "scripts/identity-contract.test.mjs",
    "scripts/identity-label-ownership.test.mjs",
    "scripts/product-authority-gate.mjs",
    "scripts/live-promotion-authority-gate.mjs",
    "scripts/targeted-id-release-contract.test.mjs",
    ".github/workflows/identity-canonical-live.yml",
    ".github/workflows/product-authority-enforcement.yml",
    "docs/control/LIVE_PROMOTION_MANIFEST.json",
    "docs/control/GOLD_CURRENT_BRIEF.md",
  ]),
};

function targetedReleaseFiles() {
  let names = "";
  try {
    names = execFileSync("git", ["diff", "--name-only", TARGETED_ID_RELEASE.liveSourceSha, "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    die(`targeted release comparison failed: ${error.message}`);
  }
  return names.split("\n").filter(Boolean);
}

function assertTargetedIdentityRelease(headBranch) {
  if (headBranch !== TARGETED_ID_RELEASE.branch) return false;
  const source = TARGETED_ID_RELEASE.liveSourceSha;
  if (!gitSucceeds(["rev-parse", "--verify", `${source}^{commit}`])) {
    die("targeted release LIVE_SOURCE_SHA cannot be resolved");
  }
  if (!gitSucceeds(["merge-base", "--is-ancestor", source, "HEAD"])) {
    die("targeted release carrier does not descend from LIVE_SOURCE_SHA");
  }
  const merges = git(["rev-list", "--merges", `${source}..HEAD`]);
  if (merges) die("targeted release carrier imported unrelated merge commits");
  const files = targetedReleaseFiles();
  if (files.length === 0) die("targeted release comparison was empty; refusing an empty diff");
  const unexpected = files.filter((file) => !TARGETED_ID_RELEASE.allow.has(file));
  if (unexpected.length > 0) die(`targeted release unexpected files: ${unexpected.join(", ")}`);
  const manifest = readJson(path.join(ROOT, "docs/control/LIVE_PROMOTION_MANIFEST.json"));
  const targeted = manifest.targetedIdentityRelease;
  if (!targeted) die("targeted release manifest block missing");
  if (targeted.branch !== TARGETED_ID_RELEASE.branch) die("targeted release manifest branch pin mismatch");
  if (targeted.liveSourceSha !== source) die("targeted release manifest source pin mismatch");
  if (!String(targeted.founderDecisionRef || "").includes(TARGETED_ID_RELEASE.founderDecision)) {
    die("targeted release founder decision pin mismatch");
  }
  const rollbackObservation = observePinnedDeployment();
  const provenance = rollbackProblems(targeted, rollbackObservation);
  if (provenance.length > 0) die(provenance.join("; "));
  if (targeted.currentLiveOrigin !== CURRENT_LIVE_ORIGIN) die("current live origin pin mismatch");
  const headNow = git(["rev-parse", "HEAD"]);
  const parentNow = git(["rev-parse", "HEAD^"]);
  const deployedSha = process.env.GITHUB_SHA || headNow;
  const manifestChild = Boolean(targeted.candidateSha) && deployedSha !== targeted.candidateSha;
  const currentLive = observeCurrentLive();
  let provider = null;
  let productionReadback = null;
  if (currentLiveProblems(currentLive).length > 0 && process.env.CLOUDFLARE_API_TOKEN) {
    const fetched = fetchProviderLive();
    if (fetched.ok) {
      provider = fetched.payload;
      productionReadback = productionReadbackFromProvider(provider, { candidateSha: targeted.candidateSha, deployedSha, manifestChild });
    }
  }
  const liveDecision = decideProductLive({
    targeted,
    rollbackObservation,
    currentLive,
    provider,
    productionReadback,
    testedHead: headNow === targeted.candidateSha ? headNow : parentNow,
    deployedSha,
    manifestChild,
  });
  if (!liveDecision.ok) die(liveDecision.message);
  if (liveDecision.recovery) {
    if (headNow !== targeted.candidateSha && parentNow !== targeted.candidateSha) {
      die("targeted release HEAD is not the tested candidate or its manifest-only child");
    }
    if (manifestChild) {
      if (parentNow !== targeted.candidateSha || (process.env.GITHUB_SHA && process.env.GITHUB_SHA !== headNow)) {
        die("deployed commit does not match the checked out release child");
      }
      const childDiff = git(["diff", "--name-only", targeted.candidateSha, deployedSha]).split("\n").filter(Boolean);
      if (childDiff.length !== 1 || childDiff[0] !== "docs/control/LIVE_PROMOTION_MANIFEST.json") {
        die(`targeted release-control commit changed non-manifest files: ${childDiff.join(", ") || "NONE"}`);
      }
    }
    return "recovery";
  }
  if (targeted.authorityState !== "UNSPENT" && targeted.authorityState !== "CLOSED") die("targeted release authority state is invalid");
  if (targeted.authorityState === "CLOSED" || targeted.closureReceipt != null) {
    if (targeted.authorityState !== "CLOSED" || targeted.liveAuthority !== true || !isSha(targeted.closureReceipt?.candidateSha)) {
      die("cannot spend a targeted release that failed authority");
    }
    if (!targeted.closureReceipt.productionDeploymentUrl || !targeted.closureReceipt.productionAsset || !isSha(targeted.closureReceipt.deployedCommitSha) || targeted.closureReceipt.productionDeploymentUrl === IMMEDIATE_PRE_RELEASE.deployment || targeted.closureReceipt.productionAssetSha256 === IMMEDIATE_PRE_RELEASE.sha256) {
      die("closure is not bound to the new production");
    }
    const closedHead = git(["rev-parse", "HEAD"]);
    const closedParent = git(["rev-parse", "HEAD^"]);
    const deployedCommit = targeted.closureReceipt.deployedCommitSha;
    const anchors = new Set([targeted.closureReceipt.candidateSha, deployedCommit]);
    if (!anchors.has(closedHead) && !anchors.has(closedParent)) {
      die("spent release is not the tested candidate or its manifest-only child");
    }
    if (closedHead !== targeted.closureReceipt.candidateSha && closedHead !== deployedCommit) {
      const closedDiff = git(["diff", "--name-only", closedParent, "HEAD"]).split("\n").filter(Boolean);
      if (closedDiff.length !== 1 || closedDiff[0] !== "docs/control/LIVE_PROMOTION_MANIFEST.json") {
        die(`targeted release-control commit changed non-manifest files: ${closedDiff.join(", ") || "NONE"}`);
      }
    }
    if (deployedCommit !== targeted.closureReceipt.candidateSha) {
      const childDiff = git(["diff", "--name-only", targeted.closureReceipt.candidateSha, deployedCommit]).split("\n").filter(Boolean);
      if (childDiff.length !== 1 || childDiff[0] !== "docs/control/LIVE_PROMOTION_MANIFEST.json") {
        die("deployed commit is not a manifest-only child of the tested candidate");
      }
    }
    return "closed";
  }
  if (targeted.liveAuthority === false) {
    if (targeted.candidateSha != null || targeted.goldEvidenceRef != null) {
      die("targeted release stays unbound until the manifest-only release child");
    }
    return "carrier";
  }
  if (targeted.liveAuthority !== true || !targeted.goldEvidenceRef || !isSha(targeted.candidateSha)) {
    die("targeted identity release is not live-authorised");
  }
  const head = git(["rev-parse", "HEAD"]);
  const parent = git(["rev-parse", "HEAD^"]);
  if (head !== targeted.candidateSha && parent !== targeted.candidateSha) {
    die("targeted release HEAD is not the tested candidate or its manifest-only child");
  }
  if (head !== targeted.candidateSha) {
    const child = git(["diff", "--name-only", targeted.candidateSha, "HEAD"]).split("\n").filter(Boolean);
    if (child.length !== 1 || child[0] !== "docs/control/LIVE_PROMOTION_MANIFEST.json") {
      die(`targeted release-control commit changed non-manifest files: ${child.join(", ") || "NONE"}`);
    }
  }
  return "release";
}

if (process.argv.includes("--fixture")) {
  const fixture = JSON.parse(fs.readFileSync(process.argv[process.argv.indexOf("--fixture") + 1], "utf8"));
  const decision = decideProductLive(fixture);
  if (!decision.ok) {
    console.error(`PRODUCT AUTHORITY GATE: FAIL — ${decision.message}`);
    process.exit(1);
  }
  console.log(decision.recovery ? "PRODUCT AUTHORITY GATE: PERSIST_RECOVERY" : "PRODUCT AUTHORITY GATE: PASS");
  process.exit(0);
}

const registry = readJson(REGISTRY_PATH);
const authority = readJson(AUTHORITY_PATH);

if (registry.schema_version !== "1.0") die("unsupported surface registry schema");
if (authority.schema_version !== "2.0") die("PROJECT_CANDIDATE_AUTHORITY must be schema 2.0");
if (authority.surface_registry !== "docs/control/PRODUCT_SURFACE_REGISTRY.json") die("authority registry pointer mismatch");

const heir = registry.global_heir;
if (!heir || heir.branch !== "king/test" || heir.role !== "SOLE_HEIR_INTEGRATION_LINE") {
  die("king/test must remain the sole HEIR integration line");
}
if (!isSha(heir.sha_at_activation)) die("global HEIR activation SHA missing/invalid");

const law = registry.state_law || {};
const states = law.human_visible_states || [];
const expectedStates = ["LIVE", "HEIR", "SANDBOX", "ARCHIVED"];
if (JSON.stringify(states) !== JSON.stringify(expectedStates)) die("human-visible state model drifted");
if (JSON.stringify(law.product_development_write_targets) !== JSON.stringify(["HEIR", "SANDBOX"])) {
  die("product development write targets must be exactly HEIR and SANDBOX");
}
if (law.live_development_write_authority !== false) die("LIVE must have zero development write authority");
if (law.archive_development_write_authority !== false) die("ARCHIVED must have zero development write authority");
if (law.quarantine_pending_archive_write_authority !== false) die("QUARANTINE_PENDING_ARCHIVE must have zero write authority");
if (law.new_candidate_classes_allowed !== false) die("new candidate classes are forbidden");
if (law.all_material_active_product_work_requires_founder_visible_url !== true) die("Founder-visible URL requirement must remain enabled");
if (law.new_user_facing_idea_requires_registry_before_material_code !== true) die("new-idea registry-before-code law must remain enabled");
if (law.max_heirs_per_product !== 1) die("max HEIR count must equal 1");
if (law.max_active_user_facing_sandboxes_per_product !== 1) die("max active sandbox count must equal 1");
if (law.newest_wins !== false) die("newest-wins must be false");
if (law.unknown_user_facing_lineage !== "FAIL_CLOSED") die("unknown lineage must fail closed");

if (registry.archive?.write_authority !== false || registry.archive?.development_authority !== false) {
  die("ARCHIVE must be immutable/read-only");
}

const reviewPaths = new Set();
const registeredSandboxes = new Map();
for (const [product, record] of Object.entries(registry.products || {})) {
  const liveReleased = Boolean(record?.live?.url);
  const liveUnreleased = record?.live?.state === "UNRELEASED" || record?.live?.identity_state === "UNRELEASED";
  if (!liveReleased && !liveUnreleased) die(`${product} missing LIVE released/unreleased state`);
  if (!record?.heir?.review_path || !record?.heir?.origin_path) {
    die(`${product} missing HEIR Founder-visible surface contract`);
  }

  const heirPath = record.heir.review_path;
  if (reviewPaths.has(`heir:${heirPath}`)) die(`duplicate HEIR review path ${heirPath}`);
  reviewPaths.add(`heir:${heirPath}`);

  const sandbox = record.sandbox;
  if (!sandbox) continue;
  if (!sandbox.branch || !isSha(sandbox.sha_at_registration) || !sandbox.review_path || !sandbox.origin_path) {
    die(`${product} sandbox missing branch/registration-SHA/review/origin identity`);
  }
  if (!sandbox.review_path.endsWith("/sandbox")) die(`${product} sandbox review path must end in /sandbox`);
  if (sandbox.live_authority !== false) die(`${product} sandbox may never carry LIVE authority`);
  if (registeredSandboxes.has(sandbox.branch)) die(`sandbox branch ${sandbox.branch} registered to multiple products`);
  if (reviewPaths.has(`sandbox:${sandbox.review_path}`)) die(`duplicate SANDBOX review path ${sandbox.review_path}`);
  reviewPaths.add(`sandbox:${sandbox.review_path}`);
  registeredSandboxes.set(sandbox.branch, { product, ...sandbox });
}

const headBranch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || git(["branch", "--show-current"]);
const baseRef = process.env.GITHUB_BASE_REF || process.env.AUTHORITY_BASE_REF || "";
const eventName = process.env.GITHUB_EVENT_NAME || "local";

let changed = [];
if (baseRef) {
  const remoteBase = gitSucceeds(["rev-parse", `origin/${baseRef}`]) ? `origin/${baseRef}` : baseRef;
  const diff = git(["diff", "--name-only", `${remoteBase}...HEAD`]);
  changed = diff ? diff.split("\n").filter(Boolean) : [];
} else if (process.env.GITHUB_EVENT_BEFORE && !/^0+$/.test(process.env.GITHUB_EVENT_BEFORE)) {
  const diff = git(["diff", "--name-only", `${process.env.GITHUB_EVENT_BEFORE}...HEAD`]);
  changed = diff ? diff.split("\n").filter(Boolean) : [];
} else {
  const diff = git(["diff", "--name-only", "HEAD^...HEAD"]);
  changed = diff ? diff.split("\n").filter(Boolean) : [];
}

const productChanges = changed.filter(isProductCode);
const governanceOnlyChanges = changed.length > 0 && changed.every(isGovernanceOnly);
const isSystemBranch = SYSTEM_BRANCH_PREFIXES.some((prefix) => headBranch.startsWith(prefix));
const isHeir = headBranch === "king/test";
const registeredSandbox = registeredSandboxes.get(headBranch);
const isAuthorisedProductWriteBranch = isHeir || Boolean(registeredSandbox);
const targetedRelease = assertTargetedIdentityRelease(headBranch);
const targetedCarrier = targetedRelease === "carrier" || targetedRelease === "release" || targetedRelease === "closed" || targetedRelease === "recovery";

// Absolute freeze: an unregistered historical branch is not a work surface at all.
// The one-time identity carrier is not a branch-name exemption: the pin check above already failed closed.
if (!targetedCarrier && !isAuthorisedProductWriteBranch && !isSystemBranch && changed.length > 0) {
  die(`branch ${headBranch || "UNKNOWN"} is QUARANTINE_PENDING_ARCHIVE / read-only donor; all writes are forbidden. Copy donor value into HEIR or the one registered SANDBOX instead`);
}

// System/control/factory branches may not hide application changes.
if (isSystemBranch && productChanges.length > 0) {
  die(`system branch ${headBranch} has zero product authority and may not carry product-code changes: ${productChanges.join(", ")}`);
}

// Product code is legal only on HEIR or the single registered SANDBOX.
if (!targetedCarrier && productChanges.length > 0 && !isAuthorisedProductWriteBranch) {
  die(`product mutation on unauthorised branch ${headBranch || "UNKNOWN"}; only king/test HEIR or the single registered SANDBOX may receive product writes`);
}

// Material product work must carry the current human contract in the same bounded change.
if (productChanges.length > 0 && !changed.includes("docs/control/GOLD_CURRENT_BRIEF.md")) {
  die("material product mutation must update docs/control/GOLD_CURRENT_BRIEF.md in the same change so product/state/human-review intent is explicit");
}

if (registeredSandbox) {
  const heirSha = git(["rev-parse", "origin/king/test"]);
  if (!heirSha) die("cannot resolve current origin/king/test for sandbox ancestry check");
  if (!gitSucceeds(["merge-base", "--is-ancestor", heirSha, "HEAD"])) {
    die(`${registeredSandbox.product} sandbox is not proven to descend from current king/test; forward-sync the SAME registered sandbox or fail closed`);
  }
}

if (eventName === "pull_request" && productChanges.length > 0 && baseRef !== "king/test") {
  die(`product PR must return to king/test HEIR; current base is ${baseRef || "UNKNOWN"}`);
}

if (headBranch === "main" && productChanges.length > 0) {
  die("main/LIVE may not be used for development; LIVE changes only through Founder-gated exact-artifact promotion");
}

console.log("PRODUCT AUTHORITY GATE: PASS");
console.log(JSON.stringify({
  headBranch,
  headSha: git(["rev-parse", "HEAD"]) || null,
  eventName,
  baseRef: baseRef || null,
  changedFiles: changed.length,
  productChanges: productChanges.length,
  governanceOnlyChanges,
  role: targetedRelease === "release"
    ? "ONE_TIME_TARGETED_ID_RELEASE_BOUND_NO_CONTINUING_AUTHORITY"
    : targetedRelease === "closed"
    ? "ONE_TIME_TARGETED_ID_RELEASE_SPENT_NO_REPLAY"
    : targetedRelease === "recovery"
    ? "ONE_TIME_TARGETED_ID_RELEASE_PERSIST_RECOVERY_NO_DEPLOY"
    : targetedRelease === "carrier"
    ? "ONE_TIME_TARGETED_ID_RELEASE_CARRIER_NO_LIVE_AUTHORITY"
    : isHeir
    ? "HEIR_PRODUCT_WRITE_AUTHORITY"
    : registeredSandbox
      ? `SANDBOX_PRODUCT_WRITE_AUTHORITY:${registeredSandbox.product}`
      : isSystemBranch
        ? "SYSTEM_SUPPORT_ZERO_PRODUCT_AUTHORITY"
        : "QUARANTINE_PENDING_ARCHIVE_READ_ONLY_DONOR",
  productWriteAuthority: isAuthorisedProductWriteBranch,
  liveDevelopmentWriteAuthority: false,
  archiveDevelopmentWriteAuthority: false,
  registeredSandboxes: [...registeredSandboxes.entries()].map(([branch, value]) => ({
    branch,
    product: value.product,
    shaAtRegistration: value.sha_at_registration,
    reviewPath: value.review_path
  }))
}, null, 2));
