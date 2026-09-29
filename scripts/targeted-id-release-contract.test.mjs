import test from "node:test";
import assert from "node:assert/strict";
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
  observeCurrentLive,
  observePinnedDeployment,
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
