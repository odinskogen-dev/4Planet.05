import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import {
  IMMEDIATE_PRE_RELEASE,
  SUPERSEDED_MAIN_DEPLOYMENT,
  closureAfterDeploy,
  observePinnedDeployment,
  promotionDecision,
  rollbackProblems,
} from "./live-promotion-authority-gate.mjs";

const SOURCE = "d5540905de7e57a2a781db92771da4d87c472c60";
const BRANCH = "release/targeted-4planet-id-20260929";
const DECISION = "ENIG TARGETED RELEASE CONTROL AMENDMENT";
const ALLOW = [
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
];

function allowlist(source, label) {
  const start = source.indexOf("const TARGETED_ID_RELEASE = {");
  assert.notEqual(start, -1, `${label} missing targeted release pin`);
  const block = source.slice(start, source.indexOf("};", start));
  const setStart = block.indexOf("new Set([");
  const setBody = block.slice(setStart, block.indexOf("])", setStart));
  const files = [...setBody.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
  return { block, files };
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

test("both gates pin the same one-time source, branch and allowlist", () => {
  const product = allowlist(fs.readFileSync("scripts/product-authority-gate.mjs", "utf8"), "product gate");
  const promotion = allowlist(fs.readFileSync("scripts/live-promotion-authority-gate.mjs", "utf8"), "promotion gate");
  for (const gate of [product, promotion]) {
    assert.match(gate.block, new RegExp(BRANCH));
    assert.match(gate.block, new RegExp(SOURCE));
    assert.match(gate.block, new RegExp(DECISION));
    assert.deepEqual(gate.files, ALLOW);
  }
});

test("the one-time manifest is unbound until Gold binds a manifest-only child", () => {
  const manifest = JSON.parse(fs.readFileSync("docs/control/LIVE_PROMOTION_MANIFEST.json", "utf8"));
  const targeted = manifest.targetedIdentityRelease;
  assert.equal(targeted.branch, BRANCH);
  assert.equal(targeted.liveSourceSha, SOURCE);
  assert.match(targeted.founderDecisionRef, new RegExp(DECISION));
  assert.equal(targeted.rollbackDeployment, IMMEDIATE_PRE_RELEASE.deployment);
  assert.equal(targeted.rollbackSha, IMMEDIATE_PRE_RELEASE.sha);
  assert.equal(targeted.rollbackAsset, IMMEDIATE_PRE_RELEASE.asset);
  assert.equal(targeted.rollbackAssetSha256, IMMEDIATE_PRE_RELEASE.sha256);
  assert.equal(targeted.rollbackAssetBytes, IMMEDIATE_PRE_RELEASE.bytes);
  assert.equal(targeted.authorityState, "UNSPENT");
  assert.equal(targeted.closureReceipt, null);
  assert.equal(targeted.notImmediateRollback.rollbackDeployment, SUPERSEDED_MAIN_DEPLOYMENT.deployment);
  assert.equal(targeted.notImmediateRollback.rollbackSha, SUPERSEDED_MAIN_DEPLOYMENT.sha);
  assert.equal(targeted.immutableSourceDeployment, "https://1387126b.4planet-05.pages.dev");
  assert.equal(targeted.liveAsset, "/assets/index-CrCdYuxo.js");
  if (targeted.liveAuthority === false) {
    assert.equal(manifest.status, "NOT_AUTHORISED");
    assert.equal(manifest.founderDecisionRef, null);
    assert.equal(targeted.candidateSha, null);
    assert.equal(targeted.goldEvidenceRef, null);
    return;
  }
  assert.equal(targeted.liveAuthority, true);
  assert.match(targeted.candidateSha, /^[0-9a-f]{40}$/);
  assert.ok(targeted.goldEvidenceRef);
  const head = git(["rev-parse", "HEAD"]);
  const parent = git(["rev-parse", "HEAD^"]);
  assert.ok(head === targeted.candidateSha || parent === targeted.candidateSha);
  if (head !== targeted.candidateSha) {
    const child = git(["diff", "--name-only", targeted.candidateSha, "HEAD"]).split("\n").filter(Boolean);
    assert.deepEqual(child, ["docs/control/LIVE_PROMOTION_MANIFEST.json"]);
  }
});

test("the canonical live workflow cannot deploy a closed release", () => {
  const workflow = fs.readFileSync(".github/workflows/identity-canonical-live.yml", "utf8");
  assert.match(workflow, /targeted identity release is not live-authorised/);
  assert.match(workflow, /LIVE PROMOTION AUTHORITY GUARD: PASS/);
  assert.match(workflow, /project-name "\$PAGES_PROJECT"/);
  assert.match(workflow, /PAGES_PROJECT: 4planet-05/);
  assert.doesNotMatch(workflow, /ALLOW_PREPROMOTION_CHECK/);
  assert.doesNotMatch(workflow, /--branch "release\/targeted-4planet-id-20260929"/);
  assert.match(workflow, /production_branch/);
  assert.match(workflow, /test "\$production" != "release\/targeted-4planet-id-20260929"/);
  const deploy = workflow.slice(workflow.indexOf("Deploy tested runtime"));
  const guard = deploy.indexOf("NO DEPLOY. Promotion result is not a pass.");
  const wrangler = deploy.indexOf("npx wrangler@4.128.0 pages deploy dist");
  assert.ok(guard !== -1 && wrangler !== -1 && guard < wrangler);
});

test("the complete delta from the live source is the allowlist and has no merge", () => {
  assert.equal(git(["rev-parse", `${SOURCE}^{commit}`]), SOURCE);
  execFileSync("git", ["merge-base", "--is-ancestor", SOURCE, "HEAD"], { stdio: "ignore" });
  const merges = git(["rev-list", "--merges", `${SOURCE}..HEAD`]);
  assert.equal(merges, "");
  const tracked = new Set(
    execFileSync("git", ["diff", "--name-only", SOURCE], { encoding: "utf8" })
      .split("\n")
      .filter(Boolean),
  );
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  const files = [...tracked, ...untracked].sort();
  assert.ok(files.length > 0, "refusing an empty diff");
  const unexpected = files.filter((file) => !ALLOW.includes(file));
  assert.deepEqual(unexpected, []);
});

const MATCHING = {
  available: true,
  assetReferenced: true,
  sha256: IMMEDIATE_PRE_RELEASE.sha256,
  bytes: IMMEDIATE_PRE_RELEASE.bytes,
};
const CANDIDATE = "933801c251ea4653cd0fb70a8106a997145f9c37";

function authorised(overrides = {}) {
  return {
    branch: BRANCH,
    liveSourceSha: SOURCE,
    founderDecisionRef: DECISION,
    liveAuthority: true,
    goldEvidenceRef: "https://github.com/odinskogen-dev/4Planet.05/pull/346#issuecomment-5880658004",
    candidateSha: CANDIDATE,
    rollbackSha: IMMEDIATE_PRE_RELEASE.sha,
    rollbackDeployment: IMMEDIATE_PRE_RELEASE.deployment,
    rollbackAsset: IMMEDIATE_PRE_RELEASE.asset,
    rollbackAssetSha256: IMMEDIATE_PRE_RELEASE.sha256,
    rollbackAssetBytes: IMMEDIATE_PRE_RELEASE.bytes,
    authorityState: "UNSPENT",
    closureReceipt: null,
    ...overrides,
  };
}

function historicalRollbackAccepted(rollbackSha, rollbackDeployment) {
  return Boolean(String(rollbackSha || "")) && String(rollbackDeployment || "").includes("pages.dev");
}

function historicalAuthorised(targeted) {
  return targeted.liveAuthority === true
    && Boolean(targeted.goldEvidenceRef)
    && /^[0-9a-f]{40}$/i.test(targeted.candidateSha)
    && Boolean(String(targeted.rollbackSha || ""))
    && String(targeted.rollbackDeployment || "").includes("pages.dev");
}

test("the old rollback check accepted a spoof and the corrected check rejects it", () => {
  assert.equal(historicalRollbackAccepted("not-a-sha", "https://example.com/pages.dev"), true);
  const spoof = authorised({ rollbackSha: "not-a-sha", rollbackDeployment: "https://example.com/pages.dev" });
  assert.ok(rollbackProblems(spoof, MATCHING).length > 0);
  for (const deployment of [
    "https://example.com/pages.dev",
    "https://1387126b.4planet-05.pages.dev.evil.com",
    "http://1387126b.4planet-05.pages.dev",
    "https://1387126b.4planet-05.pages.dev/extra",
    SUPERSEDED_MAIN_DEPLOYMENT.deployment,
  ]) {
    assert.ok(rollbackProblems(authorised({ rollbackDeployment: deployment }), MATCHING).length > 0, deployment);
  }
  assert.deepEqual(rollbackProblems(authorised(), MATCHING), []);
});

test("the old gate passed the same authorisation twice and the corrected gate spends it once", () => {
  const release = authorised();
  assert.equal(historicalAuthorised(release), true);
  assert.equal(historicalAuthorised(release), true);
  assert.equal(promotionDecision(release, MATCHING, CANDIDATE).ok, true);
  assert.equal(promotionDecision(release, MATCHING, CANDIDATE).ok, true);
  const failed = closureAfterDeploy(release, false, MATCHING, CANDIDATE);
  assert.equal(failed.spent, false);
  assert.equal(failed.mutated, false);
  assert.deepEqual(failed.targeted, release);
  const closed = closureAfterDeploy(release, true, MATCHING, CANDIDATE);
  assert.equal(closed.spent, true);
  assert.equal(closed.targeted.authorityState, "CLOSED");
  assert.equal(promotionDecision(closed.targeted, MATCHING, CANDIDATE).ok, false);
  assert.match(promotionDecision(closed.targeted, MATCHING, CANDIDATE).message, /already spent/);
  const replay = closureAfterDeploy(closed.targeted, true, MATCHING, CANDIDATE);
  assert.equal(replay.spent, false);
  assert.deepEqual(replay.targeted, closed.targeted);
});

test("malformed, mismatched, unavailable, drifted and failed-authority states do not pass", () => {
  assert.ok(rollbackProblems(authorised(), { available: false }).some((problem) => problem.includes("unavailable")));
  assert.ok(rollbackProblems(authorised(), { available: true, assetReferenced: true, sha256: "a".repeat(64), bytes: 1 }).some((problem) => problem.includes("do not match")));
  assert.equal(promotionDecision(authorised({ candidateSha: SOURCE }), MATCHING, SOURCE).ok, false);
  assert.equal(promotionDecision(authorised({ liveSourceSha: SUPERSEDED_MAIN_DEPLOYMENT.sha, rollbackSha: SUPERSEDED_MAIN_DEPLOYMENT.sha }), MATCHING, CANDIDATE).ok, false);
  assert.equal(promotionDecision(authorised(), MATCHING, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa").ok, false);
  const unauthorised = authorised({ liveAuthority: false, candidateSha: null, goldEvidenceRef: null });
  const spentAnyway = closureAfterDeploy(unauthorised, true, MATCHING);
  assert.equal(spentAnyway.spent, false);
  assert.deepEqual(spentAnyway.targeted, unauthorised);
  assert.equal(promotionDecision({ ...unauthorised, authorityState: "CLOSED", closureReceipt: { candidateSha: CANDIDATE } }, MATCHING).ok, false);
});

test("the served pre-release deployment still matches the rollback pin", () => {
  const observed = observePinnedDeployment();
  assert.deepEqual(rollbackProblems(authorised(), observed), []);
  for (const gate of ["scripts/product-authority-gate.mjs", "scripts/live-promotion-authority-gate.mjs"]) {
    const source = fs.readFileSync(gate, "utf8");
    assert.equal(source.includes("pages.dev"), source.includes("1387126b.4planet-05.pages.dev"));
    assert.doesNotMatch(source, /includes\(["']pages\.dev["']\)/);
  }
});
