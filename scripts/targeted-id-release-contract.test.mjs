import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import {
  CURRENT_LIVE_ORIGIN,
  IMMEDIATE_PRE_RELEASE,
  SUPERSEDED_MAIN_DEPLOYMENT,
  assembleProviderPages,
  closureAfterDeploy,
  currentLiveProblems,
  decideProductLive,
  decidePromotion,
  observeCurrentLive,
  observePinnedDeployment,
  persistenceRecovery,
  productionConsumption,
  promotionDecision,
  providerProblems,
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
  assert.equal(targeted.currentLiveOrigin, CURRENT_LIVE_ORIGIN);
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
  const lifecycle = deploy.indexOf("--release-lifecycle");
  const wrangler = deploy.indexOf("npx wrangler@4.128.0 pages deploy dist");
  const persistExit = deploy.indexOf("echo \"PERSIST_ONLY\"");
  assert.ok(guard !== -1 && lifecycle !== -1 && wrangler !== -1 && guard < lifecycle && lifecycle < wrangler);
  assert.ok(persistExit !== -1 && persistExit < wrangler);
  assert.doesNotMatch(workflow, /latest_stage/);
  assert.doesNotMatch(workflow, /--fixture/);
  assert.doesNotMatch(workflow, /--manifest-out/);
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
const LIVE_MATCHING = {
  available: true,
  assetReferenced: true,
  asset: IMMEDIATE_PRE_RELEASE.asset,
  sha256: IMMEDIATE_PRE_RELEASE.sha256,
  bytes: IMMEDIATE_PRE_RELEASE.bytes,
};
const CANDIDATE = "933801c251ea4653cd0fb70a8106a997145f9c37";
const PRODUCTION_URL = "https://c0ffee00.4planet-05.pages.dev";
const PRODUCTION_ASSET = "/assets/index-Cy2Z-iuM.js";
const PRODUCTION_SHA = "c86ba793284ba5e0190ee8f30f87296b19ca6400479d9ca94536d18f760fc701";
const HISTORICAL_JQ = '[.result[]? | select((.deployment_trigger.metadata.commit_hash // "") == $sha and ((.latest_stage.status // "") == "success"))] | length';

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

function productionReadback(overrides = {}) {
  return {
    available: true,
    assetReferenced: true,
    id: "prod-1",
    deployment: PRODUCTION_URL,
    asset: PRODUCTION_ASSET,
    sha256: PRODUCTION_SHA,
    bytes: 1767493,
    commitHash: CANDIDATE,
    ...overrides,
  };
}

function deploymentRecord({ environment, sha = CANDIDATE, status = "success", id, url }) {
  return {
    id,
    environment,
    url,
    latest_stage: { name: "deploy", status },
    deployment_trigger: { metadata: { commit_hash: sha, branch: environment === "production" ? "main" : BRANCH } },
  };
}

function providerPayload(result, info = {}) {
  const list = Array.isArray(result) ? result : [];
  return {
    success: info.success ?? true,
    errors: info.errors ?? [],
    messages: [],
    result: info.result === undefined ? list : info.result,
    result_info: {
      page: info.page ?? 1,
      per_page: 25,
      count: info.count ?? list.length,
      total_count: info.total_count ?? list.length,
      total_pages: info.total_pages ?? 1,
    },
  };
}

function lifecycleFixture(overrides = {}) {
  return {
    targeted: authorised(),
    rollbackObservation: MATCHING,
    currentLive: LIVE_MATCHING,
    provider: providerPayload([]),
    artifactSha: CANDIDATE,
    testedHead: CANDIDATE,
    deployOk: null,
    productionReadback: null,
    closureWriteOk: null,
    ...overrides,
  };
}

function runLifecycle(fixture) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "id-release-"));
  const file = path.join(dir, "fixture.json");
  fs.writeFileSync(file, JSON.stringify(fixture));
  const result = spawnSync(process.execPath, ["scripts/live-promotion-authority-gate.mjs", "--release-lifecycle", "--fixture", file], { encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return { status: result.status, body: JSON.parse(result.stdout), stderr: result.stderr };
}

function historicalAlready(payload, sha) {
  const run = spawnSync("jq", ["-r", "--arg", "sha", sha, HISTORICAL_JQ], { input: JSON.stringify(payload), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  return Number(run.stdout.trim());
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
  assert.equal(promotionDecision(release, MATCHING, CANDIDATE, LIVE_MATCHING).ok, true);
  assert.equal(promotionDecision(release, MATCHING, CANDIDATE, LIVE_MATCHING).ok, true);
  const failed = closureAfterDeploy(release, false, MATCHING, CANDIDATE, productionReadback());
  assert.equal(failed.spent, false);
  assert.equal(failed.mutated, false);
  assert.deepEqual(failed.targeted, release);
  const oldRuntime = closureAfterDeploy(release, true, MATCHING, CANDIDATE, {
    ...productionReadback(),
    deployment: IMMEDIATE_PRE_RELEASE.deployment,
    asset: IMMEDIATE_PRE_RELEASE.asset,
    sha256: IMMEDIATE_PRE_RELEASE.sha256,
    bytes: IMMEDIATE_PRE_RELEASE.bytes,
  });
  assert.equal(oldRuntime.spent, false);
  assert.equal(oldRuntime.mutated, false);
  const closed = closureAfterDeploy(release, true, MATCHING, CANDIDATE, productionReadback());
  assert.equal(closed.spent, true);
  assert.equal(closed.targeted.authorityState, "CLOSED");
  assert.equal(closed.targeted.closureReceipt.productionDeploymentUrl, PRODUCTION_URL);
  assert.notEqual(closed.targeted.closureReceipt.productionAssetSha256, IMMEDIATE_PRE_RELEASE.sha256);
  assert.equal(promotionDecision(closed.targeted, MATCHING, CANDIDATE, LIVE_MATCHING).ok, false);
  assert.match(promotionDecision(closed.targeted, MATCHING, CANDIDATE, LIVE_MATCHING).message, /already spent/);
  const replay = closureAfterDeploy(closed.targeted, true, MATCHING, CANDIDATE, productionReadback());
  assert.equal(replay.spent, false);
  assert.deepEqual(replay.targeted, closed.targeted);
});

test("malformed, mismatched, unavailable, drifted and failed-authority states do not pass", () => {
  assert.ok(rollbackProblems(authorised(), { available: false }).some((problem) => problem.includes("unavailable")));
  assert.ok(rollbackProblems(authorised(), { available: true, assetReferenced: true, sha256: "a".repeat(64), bytes: 1 }).some((problem) => problem.includes("do not match")));
  assert.equal(promotionDecision(authorised({ candidateSha: SOURCE }), MATCHING, SOURCE, LIVE_MATCHING).ok, false);
  assert.equal(promotionDecision(authorised({ liveSourceSha: SUPERSEDED_MAIN_DEPLOYMENT.sha, rollbackSha: SUPERSEDED_MAIN_DEPLOYMENT.sha }), MATCHING, CANDIDATE, LIVE_MATCHING).ok, false);
  assert.equal(promotionDecision(authorised(), MATCHING, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", LIVE_MATCHING).ok, false);
  const unauthorised = authorised({ liveAuthority: false, candidateSha: null, goldEvidenceRef: null });
  const spentAnyway = closureAfterDeploy(unauthorised, true, MATCHING);
  assert.equal(spentAnyway.spent, false);
  assert.deepEqual(spentAnyway.targeted, unauthorised);
  assert.equal(promotionDecision({ ...unauthorised, authorityState: "CLOSED", closureReceipt: { candidateSha: CANDIDATE } }, MATCHING, CANDIDATE, LIVE_MATCHING).ok, false);
});

test("the served pre-release deployment still matches the rollback pin", () => {
  const observed = observePinnedDeployment();
  assert.deepEqual(rollbackProblems(authorised(), observed), []);
  assert.deepEqual(currentLiveProblems(observeCurrentLive()), []);
  for (const gate of ["scripts/product-authority-gate.mjs", "scripts/live-promotion-authority-gate.mjs"]) {
    const source = fs.readFileSync(gate, "utf8");
    assert.equal(source.includes("pages.dev"), source.includes("1387126b.4planet-05.pages.dev"));
    assert.doesNotMatch(source, /includes\(["']pages\.dev["']\)/);
  }
});

test("the old provider check counts a preview and the corrected check does not", () => {
  const preview = providerPayload([
    deploymentRecord({ environment: "preview", id: "preview-1", url: "https://694e6d47.4planet-05.pages.dev" }),
  ]);
  assert.equal(historicalAlready(preview, CANDIDATE), 1);
  const corrected = productionConsumption(preview, CANDIDATE);
  assert.equal(corrected.ok, true);
  assert.equal(corrected.consumed, false);
  assert.equal(corrected.previewOnly, true);
  const decision = runLifecycle(lifecycleFixture({ provider: preview }));
  assert.equal(decision.status, 0);
  assert.equal(decision.body.action, "DEPLOY");
  assert.equal(decision.body.deploy, true);
  assert.equal(decision.body.mutated, false);
});

test("a verified production deployment is consumed once and closure binds the new runtime", () => {
  const produced = providerPayload([
    deploymentRecord({ environment: "production", id: "prod-1", url: PRODUCTION_URL }),
  ]);
  assert.equal(historicalAlready(produced, CANDIDATE), 1);
  assert.equal(productionConsumption(produced, CANDIDATE).consumed, true);
  assert.equal(productionConsumption(produced, "a".repeat(40)).consumed, false);
  const decision = runLifecycle(lifecycleFixture({
    provider: produced,
    productionReadback: productionReadback(),
  }));
  assert.equal(decision.status, 0);
  assert.equal(decision.body.action, "PERSIST_CLOSURE");
  assert.equal(decision.body.deploy, false);
  assert.equal(decision.body.targeted.closureReceipt.productionDeploymentUrl, PRODUCTION_URL);
  assert.equal(decision.body.targeted.closureReceipt.productionAsset, PRODUCTION_ASSET);
  assert.equal(decision.body.targeted.closureReceipt.candidateSha, CANDIDATE);
  assert.notEqual(decision.body.targeted.closureReceipt.productionAssetSha256, IMMEDIATE_PRE_RELEASE.sha256);
});

test("api errors, malformed bodies and partial pages fail closed", () => {
  const apiError = { success: false, errors: [{ code: 9109, message: "auth" }], messages: [], result: null };
  assert.equal(historicalAlready(apiError, CANDIDATE), 0);
  assert.ok(providerProblems(apiError).some((problem) => problem.includes("not successful")));
  const apiDecision = runLifecycle(lifecycleFixture({ provider: apiError }));
  assert.equal(apiDecision.status, 1);
  assert.equal(apiDecision.body.deploy, false);
  assert.match(apiDecision.body.message, /not successful/);

  const malformed = { success: true, errors: [] };
  assert.equal(historicalAlready(malformed, CANDIDATE), 0);
  assert.ok(providerProblems(malformed).length > 0);
  const malformedDecision = runLifecycle(lifecycleFixture({ provider: malformed }));
  assert.equal(malformedDecision.status, 1);
  assert.equal(malformedDecision.body.deploy, false);

  const partial = providerPayload(
    [deploymentRecord({ environment: "preview", id: "other", sha: "b".repeat(40), url: "https://11111111.4planet-05.pages.dev" })],
    { total_pages: 2, total_count: 2, count: 1 },
  );
  assert.equal(historicalAlready(partial, CANDIDATE), 0);
  assert.ok(providerProblems(partial).some((problem) => problem.includes("partial") || problem.includes("incomplete")));
  const partialDecision = runLifecycle(lifecycleFixture({ provider: partial }));
  assert.equal(partialDecision.status, 1);
  assert.equal(partialDecision.body.deploy, false);

  const page1 = {
    success: true,
    errors: [],
    result: [deploymentRecord({ environment: "preview", id: "other", sha: "b".repeat(40), url: "https://11111111.4planet-05.pages.dev" })],
    result_info: { page: 1, per_page: 1, count: 1, total_count: 2, total_pages: 2 },
  };
  const page2 = {
    success: true,
    errors: [],
    result: [deploymentRecord({ environment: "production", id: "prod-1", url: PRODUCTION_URL })],
    result_info: { page: 2, per_page: 1, count: 1, total_count: 2, total_pages: 2 },
  };
  assert.equal(historicalAlready(page1, CANDIDATE), 0);
  const assembled = assembleProviderPages([page1, page2]);
  assert.equal(assembled.ok, true);
  assert.equal(productionConsumption(assembled.payload, CANDIDATE).consumed, true);
  assert.equal(assembleProviderPages([page1]).ok, false);
});

test("current live drift blocks promotion before a deploy", () => {
  const decision = runLifecycle(lifecycleFixture({
    currentLive: { ...LIVE_MATCHING, asset: "/assets/index-Other.js", sha256: "d".repeat(64), bytes: 10 },
  }));
  assert.equal(decision.status, 1);
  assert.equal(decision.body.action, "FAIL");
  assert.equal(decision.body.deploy, false);
  assert.equal(decision.body.mutated, false);
  assert.match(decision.body.message, /drifted/);
});

test("a failed deploy leaves authority unspent and can be retried", () => {
  const preview = providerPayload([
    deploymentRecord({ environment: "preview", id: "preview-1", url: "https://694e6d47.4planet-05.pages.dev" }),
  ]);
  const failed = runLifecycle(lifecycleFixture({ provider: preview, deployOk: false }));
  assert.equal(failed.status, 1);
  assert.equal(failed.body.deploy, false);
  assert.equal(failed.body.mutated, false);
  assert.equal(failed.body.targeted.authorityState, "UNSPENT");
  assert.match(failed.body.message, /failed deploy/);
  const retry = runLifecycle(lifecycleFixture({ provider: preview }));
  assert.equal(retry.status, 0);
  assert.equal(retry.body.action, "DEPLOY");
  assert.equal(retry.body.deploy, true);
});

test("a successful deploy whose closure write fails does not deploy again", () => {
  const produced = providerPayload([
    deploymentRecord({ environment: "production", id: "prod-1", url: PRODUCTION_URL }),
  ]);
  const unconfirmed = runLifecycle(lifecycleFixture({
    provider: providerPayload([
      deploymentRecord({ environment: "preview", id: "preview-1", url: "https://694e6d47.4planet-05.pages.dev" }),
    ]),
    deployOk: true,
  }));
  assert.equal(unconfirmed.body.action, "HOLD");
  assert.equal(unconfirmed.body.deploy, false);
  assert.equal(unconfirmed.body.mutated, false);

  const writeFailed = runLifecycle(lifecycleFixture({
    provider: produced,
    productionReadback: productionReadback(),
    closureWriteOk: false,
  }));
  assert.equal(writeFailed.status, 1);
  assert.equal(writeFailed.body.deploy, false);
  assert.equal(writeFailed.body.mutated, false);
  assert.equal(writeFailed.body.spent, false);
  assert.equal(writeFailed.body.targeted.authorityState, "UNSPENT");
  assert.match(writeFailed.body.message, /closure persistence failed/);

  const retry = runLifecycle(lifecycleFixture({
    provider: produced,
    productionReadback: productionReadback(),
  }));
  assert.equal(retry.status, 0);
  assert.equal(retry.body.action, "PERSIST_CLOSURE");
  assert.equal(retry.body.deploy, false);
  assert.equal(retry.body.targeted.authorityState, "CLOSED");
  assert.equal(retry.body.targeted.closureReceipt.productionDeploymentUrl, PRODUCTION_URL);
  assert.notEqual(retry.body.targeted.closureReceipt.productionDeploymentUrl, IMMEDIATE_PRE_RELEASE.deployment);

  const unauthorised = runLifecycle(lifecycleFixture({
    targeted: authorised({ liveAuthority: false, goldEvidenceRef: null }),
    provider: produced,
    productionReadback: productionReadback(),
    deployOk: true,
  }));
  assert.equal(unauthorised.body.deploy, false);
  assert.equal(unauthorised.body.mutated, false);
  assert.equal(unauthorised.body.targeted.liveAuthority, false);
  assert.equal(unauthorised.body.targeted.authorityState, "UNSPENT");
});

test("the workflow shell deploys only from a DEPLOY action", () => {
  const workflow = fs.readFileSync(".github/workflows/identity-canonical-live.yml", "utf8");
  const start = workflow.indexOf("# RELEASE_LIFECYCLE_BEGIN\n");
  const end = workflow.indexOf("# RELEASE_LIFECYCLE_END");
  assert.ok(start !== -1 && end > start);
  const script = workflow.slice(start + "# RELEASE_LIFECYCLE_BEGIN\n".length, end);
  function run(action, deploy, code = 0) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "id-node-"));
    fs.writeFileSync(path.join(dir, "out.json"), JSON.stringify({ action, deploy, message: action }));
    fs.writeFileSync(path.join(dir, "node"), `#!/bin/sh\ncat "${dir}/out.json"\nexit ${code}\n`);
    fs.chmodSync(path.join(dir, "node"), 0o755);
    const result = spawnSync("bash", ["-euo", "pipefail", "-c", script], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}` },
    });
    fs.rmSync(dir, { recursive: true, force: true });
    return result;
  }
  const deployed = run("DEPLOY", true);
  assert.equal(deployed.status, 0, deployed.stderr);
  assert.match(deployed.stdout, /DEPLOY_NOW/);
  assert.doesNotMatch(deployed.stdout, /PERSIST_ONLY/);
  const persisted = run("PERSIST_CLOSURE", false);
  assert.equal(persisted.status, 0, persisted.stderr);
  assert.match(persisted.stdout, /PERSIST_ONLY/);
  assert.doesNotMatch(persisted.stdout, /DEPLOY_NOW/);
  const failed = run("FAIL", false);
  assert.equal(failed.status, 1);
  assert.match(failed.stdout, /NO DEPLOY/);
  assert.doesNotMatch(failed.stdout, /DEPLOY_NOW/);
  const aborted = run("DEPLOY", true, 1);
  assert.equal(aborted.status, 1);
  assert.doesNotMatch(aborted.stdout, /DEPLOY_NOW/);
});

test("persist closure writes only the new production receipt", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "id-persist-"));
  const file = path.join(dir, "fixture.json");
  const out = path.join(dir, "manifest.json");
  fs.writeFileSync(file, JSON.stringify(lifecycleFixture({
    provider: providerPayload([
      deploymentRecord({ environment: "production", id: "prod-1", url: PRODUCTION_URL }),
    ]),
    productionReadback: productionReadback(),
  })));
  const before = fs.readFileSync("docs/control/LIVE_PROMOTION_MANIFEST.json", "utf8");
  const result = spawnSync(process.execPath, [
    "scripts/live-promotion-authority-gate.mjs",
    "--persist-closure",
    "--fixture",
    file,
    "--manifest-out",
    out,
  ], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const written = JSON.parse(fs.readFileSync(out, "utf8"));
  assert.equal(written.targetedIdentityRelease.authorityState, "CLOSED");
  assert.equal(written.targetedIdentityRelease.closureReceipt.productionDeploymentUrl, PRODUCTION_URL);
  assert.equal(written.targetedIdentityRelease.closureReceipt.productionAssetSha256, PRODUCTION_SHA);
  assert.equal(fs.readFileSync("docs/control/LIVE_PROMOTION_MANIFEST.json", "utf8"), before);
  fs.rmSync(dir, { recursive: true, force: true });
});

const PARENT = "1111111111111111111111111111111111111111";
const CHILD = "2222222222222222222222222222222222222222";
const LIVE_NEW = {
  available: true,
  assetReferenced: true,
  asset: PRODUCTION_ASSET,
  sha256: PRODUCTION_SHA,
  bytes: 1767493,
};

function childProduction() {
  return providerPayload([
    deploymentRecord({ environment: "production", id: "prod-child", url: PRODUCTION_URL, sha: CHILD }),
  ]);
}

function childReadback() {
  return productionReadback({ id: "prod-child", commitHash: CHILD, manifestChild: true });
}

function recoveryInput(overrides = {}) {
  return {
    targeted: authorised({ candidateSha: PARENT }),
    rollbackObservation: MATCHING,
    currentLive: LIVE_NEW,
    provider: childProduction(),
    productionReadback: childReadback(),
    testedHead: PARENT,
    deployedSha: CHILD,
    manifestChild: true,
    ...overrides,
  };
}

test("lookup binds the deployed child without rewriting it to the tested parent", () => {
  const produced = childProduction();
  assert.notEqual(PARENT, CHILD);
  assert.equal(productionConsumption(produced, PARENT).consumed, false);
  assert.equal(productionConsumption(produced, { candidateSha: PARENT, deployedSha: CHILD }).ok, false);
  const bound = productionConsumption(produced, { candidateSha: PARENT, deployedSha: CHILD, manifestChild: true });
  assert.equal(bound.ok, true);
  assert.equal(bound.consumed, true);
  assert.equal(bound.previewOnly, false);
  assert.equal(bound.match.deployment_trigger.metadata.commit_hash, CHILD);
  const preview = providerPayload([
    deploymentRecord({ environment: "preview", id: "preview-child", url: "https://694e6d47.4planet-05.pages.dev", sha: CHILD }),
  ]);
  assert.equal(productionConsumption(preview, { candidateSha: PARENT, deployedSha: CHILD, manifestChild: true }).consumed, false);
  const closed = closureAfterDeploy(authorised({ candidateSha: PARENT }), true, MATCHING, PARENT, childReadback());
  assert.equal(closed.spent, true);
  assert.equal(closed.targeted.closureReceipt.candidateSha, PARENT);
  assert.equal(closed.targeted.closureReceipt.deployedCommitSha, CHILD);
  const persisted = runLifecycle(lifecycleFixture({
    targeted: authorised({ candidateSha: PARENT }),
    provider: produced,
    productionReadback: childReadback(),
    artifactSha: PARENT,
    deployedSha: CHILD,
    manifestChild: true,
    testedHead: PARENT,
    currentLive: LIVE_NEW,
  }));
  assert.equal(persisted.status, 0);
  assert.equal(persisted.body.action, "PERSIST_CLOSURE");
  assert.equal(persisted.body.deploy, false);
  assert.equal(persisted.body.targeted.closureReceipt.candidateSha, PARENT);
  assert.equal(persisted.body.targeted.closureReceipt.deployedCommitSha, CHILD);
  const parentLookup = runLifecycle(lifecycleFixture({
    targeted: authorised({ candidateSha: PARENT }),
    provider: produced,
    artifactSha: PARENT,
    testedHead: PARENT,
    currentLive: LIVE_MATCHING,
  }));
  assert.equal(parentLookup.body.action, "DEPLOY");
  assert.equal(parentLookup.body.deploy, true);
  const source = fs.readFileSync("scripts/live-promotion-authority-gate.mjs", "utf8");
  assert.match(source, /commitHash: consumption\.match\.deployment_trigger\.metadata\.commit_hash/);
  const workflow = fs.readFileSync(".github/workflows/identity-canonical-live.yml", "utf8");
  assert.match(workflow, /--commit-hash "\$GITHUB_SHA"/);
});

test("ordinary promotion stays closed on apex drift and verified recovery is a separate evaluator", () => {
  assert.equal(promotionDecision(authorised(), MATCHING, CANDIDATE, LIVE_MATCHING).ok, true);
  const drifted = promotionDecision(authorised(), MATCHING, CANDIDATE, LIVE_NEW);
  assert.equal(drifted.ok, false);
  assert.match(drifted.message, /current live baseline drifted/);
  const recovered = decidePromotion(recoveryInput());
  assert.equal(recovered.code, 2);
  assert.match(recovered.lines[0], /LIVE PROMOTION AUTHORITY GUARD: PERSIST_RECOVERY/);
  assert.equal(decideProductLive(recoveryInput()).recovery, true);
  assert.match(persistenceRecovery(recoveryInput()).message, /without another deploy/);
  const missed = persistenceRecovery(recoveryInput({ deployedSha: PARENT, manifestChild: false }));
  assert.equal(missed.ok, false);
  assert.match(missed.message, /drifted/);
  const unverified = decidePromotion(recoveryInput({ provider: providerPayload([]), productionReadback: null }));
  assert.equal(unverified.code, 1);
  assert.match(unverified.lines.join("\n"), /drifted/);
  assert.doesNotMatch(unverified.lines.join("\n"), /PERSIST_RECOVERY/);
  const unauthorised = decidePromotion(recoveryInput({
    targeted: authorised({ candidateSha: PARENT, liveAuthority: false, goldEvidenceRef: null }),
  }));
  assert.equal(unauthorised.code, 1);
  assert.match(unauthorised.lines.join("\n"), /not live-authorised/);
  const passed = decidePromotion(recoveryInput({
    currentLive: LIVE_MATCHING,
    provider: null,
    productionReadback: null,
    targeted: authorised(),
    testedHead: CANDIDATE,
    deployedSha: CANDIDATE,
    manifestChild: false,
  }));
  assert.equal(passed.code, 0);
  assert.match(passed.lines[0], /LIVE PROMOTION AUTHORITY GUARD: PASS/);
});

function stepScript(workflow, name) {
  const at = workflow.indexOf(`- name: ${name}`);
  assert.notEqual(at, -1, name);
  const runAt = workflow.indexOf("\n        run: |\n", at);
  assert.notEqual(runAt, -1, name);
  const bodyStart = runAt + "\n        run: |\n".length;
  const next = workflow.indexOf("\n      - ", bodyStart);
  const raw = workflow.slice(bodyStart, next === -1 ? workflow.length : next);
  return `${raw.split("\n").map((line) => (line.startsWith("          ") ? line.slice(10) : line)).join("\n").trim()}\n`;
}

function cleanStepFiles() {
  fs.rmSync("product-authority-result.txt", { force: true });
  fs.rmSync("promotion-result.txt", { force: true });
}

function runReleaseJob(scripts, input) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "id-steps-"));
  const bin = path.join(dir, "bin");
  fs.mkdirSync(bin);
  const names = ["product", "promotion", "lifecycle", "persist"];
  const files = Object.fromEntries(names.map((name) => [name, path.join(dir, `${name}.json`)]));
  for (const name of names) fs.writeFileSync(files[name], JSON.stringify(input[name]));
  const wranglerLog = path.join(dir, "wrangler.log");
  const gitLog = path.join(dir, "git.log");
  const manifestOut = path.join(dir, "manifest-out.json");
  const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  const stub = (name, body) => {
    const file = path.join(bin, name);
    fs.writeFileSync(file, body);
    fs.chmodSync(file, 0o755);
  };
  stub("node", `#!/bin/bash
set -euo pipefail
mode=""
for arg in "$@"; do
  if [ "$arg" = "--release-lifecycle" ]; then mode=lifecycle; fi
  if [ "$arg" = "--persist-closure" ]; then mode=persist; fi
done
if [ "$mode" = "lifecycle" ]; then exec "$REAL_NODE" "$@" --fixture "$LIFECYCLE_FIXTURE"; fi
if [ "$mode" = "persist" ]; then exec "$REAL_NODE" "$@" --fixture "$PERSIST_FIXTURE" --manifest-out "$MANIFEST_OUT"; fi
case "$1" in
  *product-authority-gate.mjs) exec "$REAL_NODE" "$@" --fixture "$PRODUCT_FIXTURE" ;;
  *) exec "$REAL_NODE" "$@" --fixture "$PROMOTION_FIXTURE" ;;
esac
`);
  stub("curl", `#!/bin/bash
if printf '%s\\n' "$@" | grep -q 'zones?name=4planet.org'; then
  printf '%s\\n' '{"success":true,"result":[{"account":{"id":"acct-test"}}]}'
else
  printf '%s\\n' '{"success":true,"result":{"production_branch":"main"}}'
fi
`);
  stub("npm", "#!/bin/bash\nexit 0\n");
  stub("npx", "#!/bin/bash\nprintf '%s\\n' \"$*\" >> \"$WRANGLER_LOG\"\nexit 0\n");
  stub("git", `#!/bin/bash
joined=" $* "
if [[ "$joined" == *" diff "* && "$joined" == *" --name-only "* ]]; then
  if [ -s "$MANIFEST_OUT" ]; then
    printf '%s\\n' "docs/control/LIVE_PROMOTION_MANIFEST.json"
    exit 0
  fi
fi
if [[ "$joined" == *" commit "* ]]; then printf '%s\\n' commit >> "$GIT_LOG"; exit 0; fi
if [[ "$joined" == *" push "* ]]; then printf '%s\\n' push >> "$GIT_LOG"; exit 0; fi
if [[ "$joined" == *" add "* ]]; then printf '%s\\n' add >> "$GIT_LOG"; exit 0; fi
exec "$REAL_GIT" "$@"
`);
  const env = {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
    REAL_NODE: process.execPath,
    REAL_GIT: realGit,
    PRODUCT_FIXTURE: files.product,
    PROMOTION_FIXTURE: files.promotion,
    LIFECYCLE_FIXTURE: files.lifecycle,
    PERSIST_FIXTURE: files.persist,
    MANIFEST_OUT: manifestOut,
    WRANGLER_LOG: wranglerLog,
    GIT_LOG: gitLog,
    CF1: "test-token",
    GITHUB_SHA: input.githubSha || CHILD,
    PAGES_PROJECT: "4planet-05",
  };
  let productRun = null;
  let promotionRun = null;
  let deployRun = null;
  try {
    cleanStepFiles();
    productRun = spawnSync("bash", ["-c", scripts.product], { encoding: "utf8", env });
    if (productRun.status === 0) {
      promotionRun = spawnSync("bash", ["-c", scripts.promotion], { encoding: "utf8", env });
      if (promotionRun.status === 0) {
        deployRun = spawnSync("bash", ["-c", scripts.deploy], { encoding: "utf8", env });
      }
    }
    return {
      productRun,
      promotionRun,
      deployRun,
      wrangler: fs.existsSync(wranglerLog) ? fs.readFileSync(wranglerLog, "utf8") : "",
      gitTrace: fs.existsSync(gitLog) ? fs.readFileSync(gitLog, "utf8") : "",
      closure: fs.existsSync(manifestOut) ? JSON.parse(fs.readFileSync(manifestOut, "utf8")) : null,
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    cleanStepFiles();
  }
}

test("release steps deploy once, fail closure, then persist the child without a second deploy", () => {
  const workflow = fs.readFileSync(".github/workflows/identity-canonical-live.yml", "utf8");
  assert.doesNotMatch(workflow, /--fixture/);
  assert.doesNotMatch(workflow, /--manifest-out/);
  const wranglerAt = workflow.indexOf("npx wrangler@4.128.0 pages deploy dist");
  assert.ok(workflow.indexOf("refusing a second deploy") < wranglerAt);
  const scripts = {
    product: stepScript(workflow, "Product authority must pass"),
    promotion: stepScript(workflow, "Live promotion stays closed until Gold binds the candidate"),
    deploy: stepScript(workflow, "Deploy tested runtime only when the promotion gate passed"),
  };
  const manifestBefore = fs.readFileSync("docs/control/LIVE_PROMOTION_MANIFEST.json", "utf8");
  const previewChild = providerPayload([
    deploymentRecord({ environment: "preview", id: "preview-child", url: "https://694e6d47.4planet-05.pages.dev", sha: CHILD }),
  ]);
  const firstDecision = recoveryInput({
    currentLive: LIVE_MATCHING,
    provider: previewChild,
    productionReadback: null,
  });
  const first = runReleaseJob(scripts, {
    product: firstDecision,
    promotion: firstDecision,
    lifecycle: lifecycleFixture({
      targeted: authorised({ candidateSha: PARENT }),
      provider: previewChild,
      artifactSha: PARENT,
      deployedSha: CHILD,
      manifestChild: true,
      testedHead: PARENT,
      currentLive: LIVE_MATCHING,
    }),
    persist: lifecycleFixture({
      targeted: authorised({ candidateSha: PARENT }),
      provider: childProduction(),
      productionReadback: childReadback(),
      artifactSha: PARENT,
      deployedSha: CHILD,
      manifestChild: true,
      testedHead: PARENT,
      currentLive: LIVE_NEW,
      closureWriteOk: false,
    }),
  });
  assert.equal(first.productRun.status, 0, first.productRun.stderr);
  assert.match(first.productRun.stdout, /PRODUCT AUTHORITY GATE: PASS/);
  assert.equal(first.promotionRun.status, 0, first.promotionRun.stderr);
  assert.match(first.promotionRun.stdout, /Promotion gate passed/);
  assert.doesNotMatch(first.promotionRun.stdout, /PERSIST_RECOVERY/);
  assert.equal(first.deployRun.status, 1, first.deployRun.stderr);
  assert.match(first.wrangler, new RegExp(`--commit-hash ${CHILD}`));
  assert.doesNotMatch(first.wrangler, new RegExp(PARENT));
  assert.match(first.wrangler, /--project-name 4planet-05/);
  assert.equal(first.closure, null);
  assert.equal(first.gitTrace, "");

  const retryDecision = recoveryInput();
  const retry = runReleaseJob(scripts, {
    product: retryDecision,
    promotion: retryDecision,
    lifecycle: lifecycleFixture({
      targeted: authorised({ candidateSha: PARENT }),
      provider: childProduction(),
      productionReadback: childReadback(),
      artifactSha: PARENT,
      deployedSha: CHILD,
      manifestChild: true,
      testedHead: PARENT,
      currentLive: LIVE_NEW,
    }),
    persist: lifecycleFixture({
      targeted: authorised({ candidateSha: PARENT }),
      provider: childProduction(),
      productionReadback: childReadback(),
      artifactSha: PARENT,
      deployedSha: CHILD,
      manifestChild: true,
      testedHead: PARENT,
      currentLive: LIVE_NEW,
    }),
  });
  assert.equal(retry.productRun.status, 0, retry.productRun.stderr);
  assert.match(retry.productRun.stdout, /PRODUCT AUTHORITY GATE: PERSIST_RECOVERY/);
  assert.equal(retry.promotionRun.status, 0, retry.promotionRun.stderr);
  assert.match(retry.promotionRun.stdout, /PERSIST_RECOVERY/);
  assert.doesNotMatch(retry.promotionRun.stdout, /Promotion gate passed/);
  assert.equal(retry.deployRun.status, 0, `${retry.deployRun.stdout}\n${retry.deployRun.stderr}`);
  assert.equal(retry.wrangler, "");
  assert.match(retry.deployRun.stdout, /PERSIST_ONLY/);
  assert.doesNotMatch(retry.deployRun.stdout, /DEPLOY_NOW/);
  assert.equal(retry.closure.targetedIdentityRelease.authorityState, "CLOSED");
  assert.equal(retry.closure.targetedIdentityRelease.closureReceipt.candidateSha, PARENT);
  assert.equal(retry.closure.targetedIdentityRelease.closureReceipt.deployedCommitSha, CHILD);
  assert.match(retry.gitTrace, /commit/);
  assert.match(retry.gitTrace, /push/);
  assert.equal((retry.gitTrace.match(/commit/g) || []).length, 1);

  const drifted = recoveryInput({ provider: providerPayload([]), productionReadback: null });
  const drift = runReleaseJob(scripts, {
    product: drifted,
    promotion: drifted,
    lifecycle: lifecycleFixture({ currentLive: LIVE_NEW }),
    persist: lifecycleFixture({ currentLive: LIVE_NEW }),
  });
  assert.equal(drift.productRun.status, 1);
  assert.match(`${drift.productRun.stdout}\n${drift.productRun.stderr}`, /drifted/);
  assert.equal(drift.promotionRun, null);
  assert.equal(drift.deployRun, null);
  assert.equal(drift.wrangler, "");

  const unauthorisedDecision = recoveryInput({
    currentLive: LIVE_MATCHING,
    provider: null,
    productionReadback: null,
    targeted: authorised({ liveAuthority: false, candidateSha: null, goldEvidenceRef: null }),
    testedHead: null,
    deployedSha: CHILD,
    manifestChild: false,
  });
  const unauthorised = runReleaseJob(scripts, {
    product: unauthorisedDecision,
    promotion: unauthorisedDecision,
    lifecycle: lifecycleFixture(),
    persist: lifecycleFixture(),
  });
  assert.equal(unauthorised.productRun.status, 0, unauthorised.productRun.stderr);
  assert.equal(unauthorised.promotionRun.status, 0, unauthorised.promotionRun.stderr);
  assert.match(unauthorised.promotionRun.stdout, /not live-authorised/);
  assert.doesNotMatch(unauthorised.promotionRun.stdout, /Promotion gate passed/);
  assert.equal(unauthorised.deployRun.status, 0, unauthorised.deployRun.stderr);
  assert.match(unauthorised.deployRun.stdout, /Promotion result is not a pass/);
  assert.equal(unauthorised.wrangler, "");
  assert.equal(unauthorised.closure, null);

  const refused = runReleaseJob(scripts, {
    product: retryDecision,
    promotion: retryDecision,
    lifecycle: lifecycleFixture({
      targeted: authorised({ candidateSha: PARENT }),
      provider: previewChild,
      artifactSha: PARENT,
      deployedSha: CHILD,
      manifestChild: true,
      testedHead: PARENT,
      currentLive: LIVE_MATCHING,
    }),
    persist: lifecycleFixture(),
  });
  assert.equal(refused.promotionRun.status, 0, refused.promotionRun.stderr);
  assert.equal(refused.deployRun.status, 1, refused.deployRun.stdout);
  assert.match(refused.deployRun.stdout, /refusing a second deploy/);
  assert.equal(refused.wrangler, "");
  assert.equal(refused.closure, null);
  assert.equal(fs.readFileSync("docs/control/LIVE_PROMOTION_MANIFEST.json", "utf8"), manifestBefore);
});

test("real product authority entry classifies recovery and persists one closure", { timeout: 120000 }, () => {
  const workflow = fs.readFileSync(".github/workflows/identity-canonical-live.yml", "utf8");
  const scripts = {
    product: stepScript(workflow, "Product authority must pass"),
    promotion: stepScript(workflow, "Live promotion stays closed until Gold binds the candidate"),
    deploy: stepScript(workflow, "Deploy tested runtime only when the promotion gate passed"),
  };
  for (const script of Object.values(scripts)) {
    assert.doesNotMatch(script, /--fixture/);
    assert.doesNotMatch(script, /--manifest-out/);
  }
  const workspaceHead = git(["rev-parse", "HEAD"]);
  const workspaceManifest = fs.readFileSync("docs/control/LIVE_PROMOTION_MANIFEST.json", "utf8");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "id-real-entry-"));
  const repo = path.join(dir, "repo");
  const bare = path.join(dir, "bare.git");
  const bin = path.join(dir, "bin");
  const rollbackFile = path.join(dir, "rollback.js");
  const newFile = path.join(dir, "new.js");
  const providerFile = path.join(dir, "provider.json");
  const mutationLog = path.join(dir, "mutation.log");
  const stubPath = path.join(dir, "curl-stub.mjs");
  fs.mkdirSync(bin);
  const realCurl = execFileSync("bash", ["-lc", "command -v curl"], { encoding: "utf8" }).trim();
  try {
    execFileSync(realCurl, ["-fsS", "--max-time", "25", "-A", "4planet-control", "-o", rollbackFile, `${IMMEDIATE_PRE_RELEASE.deployment}${IMMEDIATE_PRE_RELEASE.asset}`], { stdio: "ignore" });
    const rollbackBytes = fs.readFileSync(rollbackFile);
    assert.equal(rollbackBytes.length, IMMEDIATE_PRE_RELEASE.bytes);
    assert.equal(createHash("sha256").update(rollbackBytes).digest("hex"), IMMEDIATE_PRE_RELEASE.sha256);
    const novel = Buffer.alloc(192, 0x71);
    fs.writeFileSync(newFile, novel);
    assert.notEqual(createHash("sha256").update(novel).digest("hex"), IMMEDIATE_PRE_RELEASE.sha256);
    fs.writeFileSync(stubPath, `import fs from 'node:fs';
const url = [...process.argv.slice(2)].reverse().find((arg) => arg.startsWith('http'));
if (!url) process.exit(1);
const write = (body) => {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  let offset = 0;
  while (offset < buf.length) offset += fs.writeSync(1, buf, offset, buf.length - offset);
  process.exit(0);
};
if (url.includes('zones?name=4planet.org')) write(JSON.stringify({ success: true, result: [{ account: { id: 'acct-test' } }] }));
if (url.includes('/deployments')) write(fs.readFileSync(process.env.PROVIDER_FILE));
if (url.includes('/pages/projects/4planet-05')) write(JSON.stringify({ success: true, result: { production_branch: 'main' } }));
const rollbackHost = '1387126b.4planet-05.pages.dev';
if (url.includes(rollbackHost) && url.includes('.js')) write(fs.readFileSync(process.env.ROLLBACK_FILE));
if (url.includes(rollbackHost)) write('<script type="module" src="/assets/index-CrCdYuxo.js"></script>\\n');
if (process.env.CURL_MODE === 'baseline') {
  if (url.includes('.js')) write(fs.readFileSync(process.env.ROLLBACK_FILE));
  write('<script type="module" src="/assets/index-CrCdYuxo.js"></script>\\n');
}
if (url.includes('.js')) write(fs.readFileSync(process.env.NEW_FILE));
write('<script type="module" src="/assets/index-NewRel.js"></script>\\n');
`);
    fs.writeFileSync(path.join(bin, "curl"), `#!/bin/bash\nexec ${JSON.stringify(process.execPath)} ${JSON.stringify(stubPath)} "$@"\n`);
    fs.writeFileSync(path.join(bin, "npm"), `#!/bin/bash\nprintf '%s\\n' "npm $*" >> ${JSON.stringify(mutationLog)}\nexit 1\n`);
    fs.writeFileSync(path.join(bin, "npx"), `#!/bin/bash\nprintf '%s\\n' "npx $*" >> ${JSON.stringify(mutationLog)}\nexit 1\n`);
    for (const name of ["curl", "npm", "npx"]) fs.chmodSync(path.join(bin, name), 0o755);
    execFileSync("git", ["clone", "--shared", "--quiet", process.cwd(), repo], { stdio: "ignore" });
    execFileSync("git", ["init", "--bare", "--quiet", bare], { stdio: "ignore" });
    const gitRepo = (args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
    gitRepo(["remote", "set-url", "origin", bare]);
    assert.equal(gitRepo(["remote", "get-url", "origin"]), bare);
    for (const file of ["scripts/product-authority-gate.mjs", "scripts/live-promotion-authority-gate.mjs"]) {
      fs.copyFileSync(path.join(process.cwd(), file), path.join(repo, file));
    }
    if (gitRepo(["diff", "--name-only"])) {
      gitRepo(["add", "scripts/product-authority-gate.mjs", "scripts/live-promotion-authority-gate.mjs"]);
      gitRepo(["-c", "user.name=id-release-test", "-c", "user.email=noreply@4planet.org", "commit", "-m", "Sync the targeted release gates under test."]);
    }
    const candidate = gitRepo(["rev-parse", "HEAD"]);
    const authorise = (manifest) => {
      const targeted = manifest.targetedIdentityRelease;
      targeted.liveAuthority = true;
      targeted.candidateSha = candidate;
      targeted.goldEvidenceRef = "https://github.com/odinskogen-dev/4Planet.05/pull/346#issuecomment-5884300773";
      targeted.authorityState = "UNSPENT";
      targeted.closureReceipt = null;
    };
    const commitChild = (mutate, extra) => {
      gitRepo(["reset", "--hard", candidate]);
      gitRepo(["clean", "-fd"]);
      const manifestPath = path.join(repo, "docs/control/LIVE_PROMOTION_MANIFEST.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      mutate(manifest);
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      if (extra) extra();
      gitRepo(["add", "-A"]);
      gitRepo(["-c", "user.name=id-release-test", "-c", "user.email=noreply@4planet.org", "commit", "-m", "Bind the manifest-only release child under test."]);
      const child = gitRepo(["rev-parse", "HEAD"]);
      assert.equal(gitRepo(["rev-parse", "HEAD^"]), candidate);
      assert.notEqual(child, candidate);
      return child;
    };
    const baseEnv = () => {
      const env = { ...process.env };
      for (const key of ["GITHUB_HEAD_REF", "GITHUB_BASE_REF", "GITHUB_EVENT_BEFORE", "GITHUB_EVENT_NAME", "GITHUB_SHA", "GITHUB_REF", "GITHUB_REF_NAME", "CLOUDFLARE_API_TOKEN", "PAGES_ACCOUNT_ID"]) delete env[key];
      env.PATH = `${bin}${path.delimiter}${process.env.PATH}`;
      env.PROVIDER_FILE = providerFile;
      env.ROLLBACK_FILE = rollbackFile;
      env.NEW_FILE = newFile;
      env.CURL_MODE = "recovery";
      env.CLOUDFLARE_API_TOKEN = "test-token";
      env.CF1 = "test-token";
      env.PAGES_PROJECT = "4planet-05";
      env.GITHUB_REF_NAME = BRANCH;
      return env;
    };
    const writeProvider = (records) => fs.writeFileSync(providerFile, JSON.stringify(providerPayload(records)));
    const productionRecord = (child) => deploymentRecord({ environment: "production", id: "prod-child", url: PRODUCTION_URL, sha: child });
    const previewRecord = (child) => deploymentRecord({ environment: "preview", id: "preview-child", url: "https://694e6d47.4planet-05.pages.dev", sha: child });
    const runCli = (script, child) => spawnSync(process.execPath, [script], { cwd: repo, env: { ...baseEnv(), GITHUB_SHA: child }, encoding: "utf8" });
    const runStep = (script, child) => spawnSync("bash", ["-c", script], { cwd: repo, env: { ...baseEnv(), GITHUB_SHA: child }, encoding: "utf8" });
    const outputOf = (result) => `${result.stdout}\n${result.stderr}`;

    const child = commitChild(authorise);
    writeProvider([productionRecord(child)]);
    const product = runCli("scripts/product-authority-gate.mjs", child);
    assert.equal(product.status, 0, outputOf(product));
    assert.match(product.stdout, /ONE_TIME_TARGETED_ID_RELEASE_PERSIST_RECOVERY_NO_DEPLOY/);
    assert.doesNotMatch(outputOf(product), /QUARANTINE_PENDING_ARCHIVE/);
    const promotion = runCli("scripts/live-promotion-authority-gate.mjs", child);
    assert.equal(promotion.status, 2, outputOf(promotion));
    assert.match(promotion.stdout, /LIVE PROMOTION AUTHORITY GUARD: PERSIST_RECOVERY/);
    assert.doesNotMatch(promotion.stdout, /LIVE PROMOTION AUTHORITY GUARD: PASS/);

    const promoted = runStep(scripts.promotion, child);
    assert.equal(promoted.status, 0, outputOf(promoted));
    assert.match(fs.readFileSync(path.join(repo, "promotion-result.txt"), "utf8"), /LIVE PROMOTION AUTHORITY GUARD: PERSIST_RECOVERY/);
    const refusedEnv = baseEnv();
    refusedEnv.CURL_MODE = "baseline";
    refusedEnv.GITHUB_SHA = child;
    writeProvider([previewRecord(child)]);
    fs.rmSync(mutationLog, { force: true });
    const refused = spawnSync("bash", ["-c", scripts.deploy], { cwd: repo, env: refusedEnv, encoding: "utf8" });
    assert.equal(refused.status, 1, outputOf(refused));
    assert.match(refused.stdout, /refusing a second deploy/);
    assert.equal(fs.existsSync(mutationLog), false);
    assert.equal(JSON.parse(fs.readFileSync(path.join(repo, "docs/control/LIVE_PROMOTION_MANIFEST.json"), "utf8")).targetedIdentityRelease.authorityState, "UNSPENT");

    writeProvider([productionRecord(child)]);
    const promotedAgain = runStep(scripts.promotion, child);
    assert.equal(promotedAgain.status, 0, outputOf(promotedAgain));
    fs.rmSync(mutationLog, { force: true });
    const persisted = runStep(scripts.deploy, child);
    assert.equal(persisted.status, 0, outputOf(persisted));
    assert.equal(fs.existsSync(mutationLog), false);
    assert.doesNotMatch(persisted.stdout, /DEPLOY_NOW/);
    const closed = JSON.parse(gitRepo(["show", "HEAD:docs/control/LIVE_PROMOTION_MANIFEST.json"]));
    assert.equal(closed.targetedIdentityRelease.authorityState, "CLOSED");
    assert.equal(closed.targetedIdentityRelease.closureReceipt.candidateSha, candidate);
    assert.equal(closed.targetedIdentityRelease.closureReceipt.deployedCommitSha, child);
    assert.notEqual(closed.targetedIdentityRelease.closureReceipt.deployedCommitSha, candidate);
    const closureSubjects = gitRepo(["log", "--format=%s"]).split("\n").filter((line) => line === "Close the one-time 4PLANET ID release authority.");
    assert.deepEqual(closureSubjects, ["Close the one-time 4PLANET ID release authority."]);
    assert.equal(execFileSync("git", ["rev-parse", "release/targeted-4planet-id-20260929"], { cwd: bare, encoding: "utf8" }).trim(), gitRepo(["rev-parse", "HEAD"]));

    const invalid = commitChild(authorise, () => fs.writeFileSync(path.join(repo, "evil-lineage.txt"), "no\n"));
    writeProvider([productionRecord(invalid)]);
    const invalidProduct = runCli("scripts/product-authority-gate.mjs", invalid);
    const invalidPromotion = runCli("scripts/live-promotion-authority-gate.mjs", invalid);
    assert.equal(invalidProduct.status, 1, outputOf(invalidProduct));
    assert.equal(invalidPromotion.status, 1, outputOf(invalidPromotion));
    assert.match(outputOf(invalidProduct), /unexpected files/);
    assert.match(outputOf(invalidPromotion), /unexpected files/);

    const nonManifest = commitChild(authorise, () => fs.appendFileSync(path.join(repo, "docs/control/GOLD_CURRENT_BRIEF.md"), "\nrecovery probe\n"));
    writeProvider([productionRecord(nonManifest)]);
    const nonManifestProduct = runCli("scripts/product-authority-gate.mjs", nonManifest);
    const nonManifestPromotion = runCli("scripts/live-promotion-authority-gate.mjs", nonManifest);
    assert.equal(nonManifestProduct.status, 1, outputOf(nonManifestProduct));
    assert.equal(nonManifestPromotion.status, 1, outputOf(nonManifestPromotion));
    assert.match(outputOf(nonManifestProduct), /non-manifest/);
    assert.match(outputOf(nonManifestPromotion), /non-manifest/);

    gitRepo(["reset", "--hard", candidate]);
    gitRepo(["clean", "-fd"]);
    writeProvider([productionRecord(candidate)]);
    const unauthorisedProduct = runCli("scripts/product-authority-gate.mjs", candidate);
    const unauthorisedPromotion = runCli("scripts/live-promotion-authority-gate.mjs", candidate);
    assert.equal(unauthorisedProduct.status, 1, outputOf(unauthorisedProduct));
    assert.equal(unauthorisedPromotion.status, 1, outputOf(unauthorisedPromotion));
    assert.match(outputOf(unauthorisedProduct), /not live-authorised/);
    assert.match(outputOf(unauthorisedPromotion), /not live-authorised/);
    assert.doesNotMatch(outputOf(unauthorisedProduct), /PERSIST_RECOVERY_NO_DEPLOY/);

    const drifted = commitChild(authorise);
    writeProvider([previewRecord(drifted)]);
    const driftedProduct = runCli("scripts/product-authority-gate.mjs", drifted);
    const driftedPromotion = runCli("scripts/live-promotion-authority-gate.mjs", drifted);
    assert.equal(driftedProduct.status, 1, outputOf(driftedProduct));
    assert.equal(driftedPromotion.status, 1, outputOf(driftedPromotion));
    assert.match(outputOf(driftedProduct), /drifted/);
    assert.match(outputOf(driftedPromotion), /drifted/);
    assert.doesNotMatch(outputOf(driftedProduct), /QUARANTINE_PENDING_ARCHIVE/);
    assert.doesNotMatch(outputOf(driftedPromotion), /PERSIST_RECOVERY/);

    assert.equal(git(["rev-parse", "HEAD"]), workspaceHead);
    assert.equal(fs.readFileSync("docs/control/LIVE_PROMOTION_MANIFEST.json", "utf8"), workspaceManifest);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
