import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { validateFounderDecisionReceipt } from './live-promotion-authority-gate.mjs';

const gatePath = path.resolve('scripts/live-promotion-authority-gate.mjs');
const git = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

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
    founderDecisionAction: 'DEPLOY',
    founderDecisionTargetRoute: 'main',
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
    body: `4PLANET FOUNDER RELEASE APPROVED\nSTATUS: APPROVED\nACTION: DEPLOY\nTARGET_ROUTE: main\nTEST_KING_SHA: ${testKingSha}`,
  };
  assert.equal(validateFounderDecisionReceipt({ receipt, ref, testKingSha, action: 'DEPLOY', targetRoute: 'main' }).commentId, 123456);
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
    body: `4PLANET FOUNDER RELEASE APPROVED\nSTATUS: APPROVED\nACTION: DEPLOY\nTARGET_ROUTE: main\nTEST_KING_SHA: ${testKingSha}`,
  };
  const check = (receipt) => validateFounderDecisionReceipt({ receipt, ref, testKingSha, action: 'DEPLOY', targetRoute: 'main' });
  assert.throws(() => check({ ...base, updated_at: '2026-10-30T22:01:00Z' }), /edited/);
  assert.throws(() => check({ ...base, user: { login: 'attacker', id: 1 } }), /issuer mismatch/);
  assert.throws(() => check({ ...base, body: base.body.replace('ACTION: DEPLOY', 'ACTION: REVIEW') }), /ACTION: DEPLOY/);
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
