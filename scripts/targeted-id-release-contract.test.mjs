import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

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

test("the manifest stays unbound and the carrier is not live authority", () => {
  const manifest = JSON.parse(fs.readFileSync("docs/control/LIVE_PROMOTION_MANIFEST.json", "utf8"));
  assert.equal(manifest.status, "NOT_AUTHORISED");
  assert.equal(manifest.founderDecisionRef, null);
  const targeted = manifest.targetedIdentityRelease;
  assert.equal(targeted.liveAuthority, false);
  assert.equal(targeted.branch, BRANCH);
  assert.equal(targeted.liveSourceSha, SOURCE);
  assert.equal(targeted.candidateSha, null);
  assert.equal(targeted.goldEvidenceRef, null);
  assert.match(targeted.founderDecisionRef, new RegExp(DECISION));
  assert.equal(targeted.rollbackDeployment, "https://3d1e7976.4planet-05.pages.dev");
  assert.equal(targeted.rollbackSha, "1700b646bb9e1139e4dc514b4c777546a0c81fea");
  assert.equal(targeted.immutableSourceDeployment, "https://1387126b.4planet-05.pages.dev");
  assert.equal(targeted.liveAsset, "/assets/index-CrCdYuxo.js");
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
