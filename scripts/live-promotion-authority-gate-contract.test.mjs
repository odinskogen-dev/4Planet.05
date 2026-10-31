import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  validateCloudflareDeploymentReceipt,
  validateCurrentLiveDeployment,
  validateCloudflareProjectReceipt,
  validateFounderDecisionReceipt,
} from './live-promotion-authority-gate.mjs';

const gatePath = path.resolve('scripts/live-promotion-authority-gate.mjs');
const git = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

const cloudflareAccountId = 'a'.repeat(32);
const candidateSha = 'b'.repeat(40);
const deploymentId = '11111111-2222-4333-8444-555555555555';
const newerDeploymentId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const deploymentRef = `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/pages/projects/4planet-05/deployments/${deploymentId}`;

function cloudflareDeployment({ environment = 'preview', branch = 'king/test', sha = candidateSha } = {}) {
  return {
    success: true,
    errors: [],
    result: {
      id: deploymentId,
      project_name: '4planet-05',
      environment,
      latest_stage: { status: 'success' },
      deployment_trigger: { metadata: { branch, commit_hash: sha } },
    },
  };
}

function fixture() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), '4planet-release-gate-'));
  fs.mkdirSync(path.join(cwd, 'docs/control'), { recursive: true });
  git(cwd, ['init', '-b', 'main']);
  git(cwd, ['config', 'user.email', 'factory@example.invalid']);
  git(cwd, ['config', 'user.name', 'Factory Contract']);
  fs.writeFileSync(path.join(cwd, 'README.md'), 'main\n');
  git(cwd, ['add', '.']);
  git(cwd, ['commit', '-m', 'main']);
  const mainSha = git(cwd, ['rev-parse', 'HEAD']);
  git(cwd, ['switch', '-c', 'king/test']);
  fs.writeFileSync(path.join(cwd, 'product.txt'), 'tested\n');
  fs.writeFileSync(path.join(cwd, 'docs/control/PROJECT_CANDIDATE_AUTHORITY.json'), JSON.stringify({
    authority_model: { test_heir: { branch: 'king/test' } },
    promotion_contract: { live_promotion: 'FOUNDER_AUTHORITY_REQUIRED_EXACT_TESTED_ARTIFACT' },
  }));
  git(cwd, ['add', '.']);
  git(cwd, ['commit', '-m', 'tested product']);
  const testedSha = git(cwd, ['rev-parse', 'HEAD']);
  const manifest = {
    schemaVersion: 2,
    status: 'FOUNDER_AUTHORISED',
    sourceBranch: 'king/test',
    targetBranch: 'main',
    targetObservedSha: mainSha,
    testKingSha: testedSha,
    liveRollbackState: 'VERIFIED',
    priorLiveSha: mainSha,
    rollbackRef: `main@${mainSha}`,
    founderDecisionRef: 'fixture decision',
    founderDecisionTestKingSha: testedSha,
    evidenceRef: 'fixture evidence',
    releaseControlCommit: true,
  };
  fs.writeFileSync(path.join(cwd, 'docs/control/LIVE_PROMOTION_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  git(cwd, ['add', 'docs/control/LIVE_PROMOTION_MANIFEST.json']);
  git(cwd, ['commit', '-m', 'release control']);
  return { cwd, manifest };
}

function run(cwd) {
  return spawnSync(process.execPath, [gatePath], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GITHUB_REF_NAME: 'king/test', ALLOW_PREPROMOTION_CHECK: '1' },
  });
}

test('accepts an unedited action-specific receipt from the expected Founder account', () => {
  const testKingSha = 'a'.repeat(40);
  const ref = 'https://github.com/odinskogen-dev/4Planet.05/issues/145#issuecomment-123456';
  const receipt = {
    id: 123456,
    user: { login: 'odinskogen-dev', id: 289761792 },
    created_at: '2026-10-30T22:00:00Z',
    updated_at: '2026-10-30T22:00:00Z',
    body: `4PLANET FOUNDER RELEASE APPROVED\nSTATUS: APPROVED\nACTION: LIVE_DEPLOY\nTARGET_ROUTE: git:main\nTEST_KING_SHA: ${testKingSha}`,
  };
  assert.equal(validateFounderDecisionReceipt({ receipt, ref, testKingSha }).commentId, 123456);
});

test('rejects fabricated rollback and evidence strings without an authenticated Cloudflare deployment receipt', () => {
  assert.throws(() => validateCloudflareDeploymentReceipt({
    receipt: { success: true, errors: [], result: { id: deploymentId } },
    ref: `https://example.invalid/unverified/${'c'.repeat(40)}`,
    accountId: cloudflareAccountId,
    expected: { environment: 'production', branch: 'main', sha: 'c'.repeat(40) },
  }), /not a canonical authenticated 4planet-05 receipt/);
});

test('accepts authenticated project and exact candidate deployment receipts', () => {
  assert.deepEqual(validateCloudflareProjectReceipt({
    receipt: {
      success: true,
      errors: [],
      result: {
        name: '4planet-05',
        production_branch: 'main',
        domains: ['4planet.org', '4planet-05.pages.dev'],
        canonical_deployment: { id: deploymentId },
      },
    },
    accountId: cloudflareAccountId,
  }), {
    accountId: cloudflareAccountId,
    project: '4planet-05',
    productionRoute: 'https://4planet.org',
    canonicalDeploymentId: deploymentId,
  });
  assert.deepEqual(validateCloudflareDeploymentReceipt({
    receipt: cloudflareDeployment(),
    ref: deploymentRef,
    accountId: cloudflareAccountId,
    expected: { environment: 'preview', branch: 'king/test', sha: candidateSha },
  }), { id: deploymentId, environment: 'preview', branch: 'king/test', sha: candidateSha });
});

test('rejects a successful historical production deployment that is not current canonical LIVE', () => {
  const historical = validateCloudflareDeploymentReceipt({
    receipt: cloudflareDeployment({ environment: 'production', branch: 'main' }),
    ref: deploymentRef,
    accountId: cloudflareAccountId,
    expected: { environment: 'production', branch: 'main', sha: candidateSha },
  });
  assert.throws(() => validateCurrentLiveDeployment({
    project: { canonicalDeploymentId: newerDeploymentId },
    liveDeployment: historical,
  }), /not the current canonical production deployment/);
});

test('accepts only the canonical production deployment as current LIVE', () => {
  const current = validateCloudflareDeploymentReceipt({
    receipt: cloudflareDeployment({ environment: 'production', branch: 'main' }),
    ref: deploymentRef,
    accountId: cloudflareAccountId,
    expected: { environment: 'production', branch: 'main', sha: candidateSha },
  });
  assert.deepEqual(validateCurrentLiveDeployment({
    project: { canonicalDeploymentId: deploymentId },
    liveDeployment: current,
  }), current);
  assert.throws(() => validateCurrentLiveDeployment({
    project: { canonicalDeploymentId: null },
    liveDeployment: current,
  }), /canonical production deployment is missing/);
});

test('rejects a genuine Cloudflare receipt from the wrong environment', () => {
  assert.throws(() => validateCloudflareDeploymentReceipt({
    receipt: cloudflareDeployment({ environment: 'production' }),
    ref: deploymentRef,
    accountId: cloudflareAccountId,
    expected: { environment: 'preview', branch: 'king/test', sha: candidateSha },
  }), /environment mismatch: expected preview/);
});

test('rejects an arbitrary or unresolvable Founder decision reference even with a matching self-declared SHA', () => {
  const { cwd, manifest } = fixture();
  manifest.founderDecisionRef = 'UNVERIFIED-DECISION-DOES-NOT-EXIST';
  fs.writeFileSync(path.join(cwd, 'docs/control/LIVE_PROMOTION_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const result = run(cwd);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not a canonical 4Planet\.05 GitHub issue-comment receipt/);
});

test('rejects edited, wrong-issuer, wrong-action and wrong-artifact receipts', () => {
  const testKingSha = 'a'.repeat(40);
  const ref = 'https://github.com/odinskogen-dev/4Planet.05/issues/145#issuecomment-123456';
  const base = {
    id: 123456,
    user: { login: 'odinskogen-dev', id: 289761792 },
    created_at: '2026-10-30T22:00:00Z',
    updated_at: '2026-10-30T22:00:00Z',
    body: `4PLANET FOUNDER RELEASE APPROVED\nSTATUS: APPROVED\nACTION: LIVE_DEPLOY\nTARGET_ROUTE: git:main\nTEST_KING_SHA: ${testKingSha}`,
  };
  const check = (receipt) => validateFounderDecisionReceipt({ receipt, ref, testKingSha });
  assert.throws(() => check({ ...base, updated_at: '2026-10-30T22:01:00Z' }), /edited/);
  assert.throws(() => check({ ...base, user: { login: 'attacker', id: 1 } }), /issuer mismatch/);
  assert.throws(() => check({ ...base, body: base.body.replace('ACTION: LIVE_DEPLOY', 'ACTION: REVIEW_ONLY') }), /ACTION: LIVE_DEPLOY/);
  assert.throws(() => check({ ...base, body: base.body.replace('TARGET_ROUTE: git:main', 'TARGET_ROUTE: \/drafts\/preview') }), /TARGET_ROUTE: git:main/);
  assert.throws(() => check({ ...base, body: base.body.replace(testKingSha, 'b'.repeat(40)) }), /TEST_KING_SHA/);
});

test('rejects target-branch drift even when the recorded SHA is syntactically valid', () => {
  const { cwd, manifest } = fixture();
  manifest.targetObservedSha = 'f'.repeat(40);
  fs.writeFileSync(path.join(cwd, 'docs/control/LIVE_PROMOTION_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const result = run(cwd);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /target branch drift/);
});

test('rejects Founder authority when deployed LIVE rollback is unverified', () => {
  const { cwd, manifest } = fixture();
  manifest.liveRollbackState = 'UNVERIFIED';
  manifest.priorLiveSha = null;
  manifest.rollbackRef = null;
  fs.writeFileSync(path.join(cwd, 'docs/control/LIVE_PROMOTION_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const result = run(cwd);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /LIVE rollback state is UNVERIFIED/);
});


test('rejects Founder authority that is not bound to an exact tested artifact', () => {
  const { cwd, manifest } = fixture();
  delete manifest.founderDecisionTestKingSha;
  fs.writeFileSync(path.join(cwd, 'docs/control/LIVE_PROMOTION_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const missing = run(cwd);
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /founderDecisionTestKingSha invalid/);

  manifest.founderDecisionTestKingSha = 'f'.repeat(40);
  fs.writeFileSync(path.join(cwd, 'docs/control/LIVE_PROMOTION_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const mismatched = run(cwd);
  assert.notEqual(mismatched.status, 0);
  assert.match(mismatched.stderr, /Founder decision artifact mismatch/);
});
