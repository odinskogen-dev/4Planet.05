#!/usr/bin/env node
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const IMMEDIATE_PRE_RELEASE = {
  project: '4planet-05',
  sha: 'd5540905de7e57a2a781db92771da4d87c472c60',
  deployment: 'https://1387126b.4planet-05.pages.dev',
  asset: '/assets/index-CrCdYuxo.js',
  sha256: '46514cd2eb489dd532a3ac831d246d0c22a00672aca9508c621ac84fe089297d',
  bytes: 1765323,
};

export const SUPERSEDED_MAIN_DEPLOYMENT = {
  sha: '1700b646bb9e1139e4dc514b4c777546a0c81fea',
  deployment: 'https://3d1e7976.4planet-05.pages.dev',
  asset: '/assets/index-ByJwZ9e4.js',
};

export function exactDeploymentOrigin(value) {
  if (typeof value !== 'string') return null;
  let url;
  try { url = new URL(value); } catch { return null; }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password || url.port || url.search || url.hash) return null;
  if (url.pathname !== '/' && url.pathname !== '') return null;
  if (url.hostname !== '1387126b.4planet-05.pages.dev') return null;
  return url.origin;
}

export function observePinnedDeployment() {
  const page = spawnSync('curl', ['-fsS', '--max-time', '25', '-A', '4planet-control', `${IMMEDIATE_PRE_RELEASE.deployment}/`], { encoding: 'utf8' });
  if (page.status !== 0) return { available: false, assetReferenced: false, sha256: '', bytes: 0 };
  if (!page.stdout.includes(IMMEDIATE_PRE_RELEASE.asset)) return { available: true, assetReferenced: false, sha256: '', bytes: 0 };
  const asset = spawnSync('curl', ['-fsS', '--max-time', '25', '-A', '4planet-control', `${IMMEDIATE_PRE_RELEASE.deployment}${IMMEDIATE_PRE_RELEASE.asset}`], { encoding: 'buffer', maxBuffer: 8 * 1024 * 1024 });
  if (asset.status !== 0 || !asset.stdout) return { available: false, assetReferenced: false, sha256: '', bytes: 0 };
  return {
    available: true,
    assetReferenced: true,
    sha256: createHash('sha256').update(asset.stdout).digest('hex'),
    bytes: asset.stdout.length,
  };
}

export function rollbackProblems(targeted, observation) {
  const problems = [];
  const expected = IMMEDIATE_PRE_RELEASE;
  if (!targeted || targeted.rollbackSha !== expected.sha || targeted.liveSourceSha !== expected.sha) problems.push('rollback SHA is not the immediate pre-release source');
  if (exactDeploymentOrigin(targeted?.rollbackDeployment) !== expected.deployment) problems.push('rollback deployment is not the exact pre-release host');
  if (targeted?.rollbackAsset !== expected.asset || targeted?.rollbackAssetSha256 !== expected.sha256 || targeted?.rollbackAssetBytes !== expected.bytes) problems.push('rollback runtime identity drifted');
  if (targeted?.rollbackSha === SUPERSEDED_MAIN_DEPLOYMENT.sha || targeted?.rollbackDeployment === SUPERSEDED_MAIN_DEPLOYMENT.deployment) problems.push('older main deployment is not the immediate pre-release');
  if (!observation || observation.available !== true) problems.push('rollback deployment is unavailable');
  else if (observation.assetReferenced !== true || observation.sha256 !== expected.sha256 || observation.bytes !== expected.bytes) problems.push('rollback deployment bytes do not match the pre-release runtime');
  return problems;
}

export function promotionDecision(targeted, observation, testedHead) {
  const provenance = rollbackProblems(targeted, observation);
  if (provenance.length) return { ok: false, message: provenance.join('; ') };
  if (targeted.authorityState !== 'UNSPENT' && targeted.authorityState !== 'CLOSED') return { ok: false, message: 'targeted release authority state is invalid' };
  if (targeted.authorityState === 'CLOSED' || targeted.closureReceipt != null) return { ok: false, message: 'targeted identity release authority is already spent' };
  if (targeted.liveAuthority !== true || !targeted.goldEvidenceRef || !sha(targeted.candidateSha)) return { ok: false, message: 'targeted identity release is not live-authorised' };
  if (targeted.candidateSha === targeted.liveSourceSha) return { ok: false, message: 'targeted release candidate drifted onto the live source' };
  if (testedHead && targeted.candidateSha !== testedHead) return { ok: false, message: 'targeted release candidate drifted from the tested head' };
  return { ok: true, message: 'targeted identity release is authorised once' };
}

export function closureAfterDeploy(targeted, deployOk, observation, testedHead) {
  const original = structuredClone(targeted);
  const decision = promotionDecision(original, observation, testedHead);
  if (deployOk !== true || !decision.ok) {
    return { spent: false, mutated: false, targeted: original, message: deployOk === true ? decision.message : 'failed deploy leaves authority unspent' };
  }
  return {
    spent: true,
    mutated: true,
    targeted: { ...original, authorityState: 'CLOSED', closureReceipt: { candidateSha: original.candidateSha } },
    message: 'targeted identity release authority is already spent',
  };
}

function fail(message) {
  console.error(`LIVE PROMOTION AUTHORITY GUARD: FAIL — ${message}`);
  process.exit(1);
}
function git(args) {
  try { return execFileSync('git', args, { encoding: 'utf8' }).trim(); }
  catch { return ''; }
}
function gitOk(args) {
  try { execFileSync('git', args, { stdio: 'ignore' }); return true; }
  catch { return false; }
}
const sha = (value) => typeof value === 'string' && /^[0-9a-f]{40}$/i.test(value);
const manifestPath = 'docs/control/LIVE_PROMOTION_MANIFEST.json';
const authorityPath = 'docs/control/PROJECT_CANDIDATE_AUTHORITY.json';

function main() {
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const authority = JSON.parse(fs.readFileSync(authorityPath, 'utf8'));
const head = git(['rev-parse', 'HEAD']);
const parent = git(['rev-parse', 'HEAD^']);
const branch = process.env.GITHUB_REF_NAME || git(['branch', '--show-current']);

const TARGETED_ID_RELEASE = {
  branch: 'release/targeted-4planet-id-20260929',
  liveSourceSha: 'd5540905de7e57a2a781db92771da4d87c472c60',
  founderDecision: 'ENIG TARGETED RELEASE CONTROL AMENDMENT',
  allow: new Set([
    'src/identity/identityClient.ts',
    'src/components/layout/PublicShell.tsx',
    'src/pages/v5/Join.tsx',
    'scripts/identity-contract.test.mjs',
    'scripts/identity-label-ownership.test.mjs',
    'scripts/product-authority-gate.mjs',
    'scripts/live-promotion-authority-gate.mjs',
    'scripts/targeted-id-release-contract.test.mjs',
    '.github/workflows/identity-canonical-live.yml',
    '.github/workflows/product-authority-enforcement.yml',
    'docs/control/LIVE_PROMOTION_MANIFEST.json',
    'docs/control/GOLD_CURRENT_BRIEF.md',
  ]),
};

function targetedFiles() {
  let names = '';
  try {
    names = execFileSync('git', ['diff', '--name-only', TARGETED_ID_RELEASE.liveSourceSha, 'HEAD'], { encoding: 'utf8' }).trim();
  } catch (error) {
    fail(`targeted release comparison failed: ${error.message}`);
  }
  return names ? names.split('\n').filter(Boolean) : [];
}

if (authority?.authority_model?.test_heir?.branch !== 'king/test') fail('king/test is not the sole configured HEIR');
if (authority?.promotion_contract?.live_promotion !== 'FOUNDER_AUTHORITY_REQUIRED_EXACT_TESTED_ARTIFACT') fail('Founder exact-artifact law missing');

if (branch === TARGETED_ID_RELEASE.branch) {
  const source = TARGETED_ID_RELEASE.liveSourceSha;
  if (!sha(source) || !gitOk(['rev-parse', '--verify', `${source}^{commit}`])) fail('targeted release LIVE_SOURCE_SHA cannot be resolved');
  if (!gitOk(['merge-base', '--is-ancestor', source, 'HEAD'])) fail('targeted release carrier does not descend from LIVE_SOURCE_SHA');
  if (git(['rev-list', '--merges', `${source}..HEAD`])) fail('targeted release carrier imported unrelated merge commits');
  const files = targetedFiles();
  if (files.length === 0) fail('targeted release comparison was empty; refusing an empty diff');
  const unexpected = files.filter((file) => !TARGETED_ID_RELEASE.allow.has(file));
  if (unexpected.length) fail(`targeted release unexpected files: ${unexpected.join(', ')}`);
  const targeted = manifest.targetedIdentityRelease;
  if (!targeted) fail('targeted identity release is not live-authorised');
  if (targeted.branch !== TARGETED_ID_RELEASE.branch || targeted.liveSourceSha !== source) fail('targeted release pin mismatch');
  if (!String(targeted.founderDecisionRef || '').includes(TARGETED_ID_RELEASE.founderDecision)) fail('targeted release founder decision pin mismatch');
  const decision = promotionDecision(targeted, observePinnedDeployment(), head === targeted.candidateSha ? head : parent);
  if (!decision.ok) fail(decision.message);
  const releaseHead = head === targeted.candidateSha ? head : parent;
  if (releaseHead !== targeted.candidateSha) fail('targeted release HEAD is not the tested candidate or its manifest-only child');
  if (head !== targeted.candidateSha) {
    const child = git(['diff', '--name-only', targeted.candidateSha, head]).split('\n').filter(Boolean);
    if (child.length !== 1 || child[0] !== manifestPath) fail(`targeted release-control commit changed non-manifest files: ${child.join(', ') || 'NONE'}`);
  }
  console.log('LIVE PROMOTION AUTHORITY GUARD: PASS');
  console.log(JSON.stringify({ branch, releaseHead: head, exactTestedArtifact: targeted.candidateSha, runtimeDelta: head === targeted.candidateSha ? 'NONE' : 'MANIFEST_ONLY', liveAuthority: true }, null, 2));
  process.exit(0);
}

if (manifest.status !== 'FOUNDER_AUTHORISED') fail(`manifest status is ${manifest.status || 'MISSING'}, not FOUNDER_AUTHORISED`);
if (manifest.sourceBranch !== 'king/test') fail(`sourceBranch must be king/test, got ${manifest.sourceBranch || 'MISSING'}`);
if (!sha(manifest.testKingSha)) fail('manifest testKingSha invalid');
if (!sha(manifest.priorLiveSha)) fail('manifest priorLiveSha invalid');
if (!manifest.founderDecisionRef || !String(manifest.founderDecisionRef).trim()) fail('founderDecisionRef missing');
if (!manifest.rollbackRef || !String(manifest.rollbackRef).includes(manifest.priorLiveSha)) fail('rollbackRef does not bind priorLiveSha');
if (!manifest.evidenceRef || !String(manifest.evidenceRef).trim()) fail('evidenceRef missing');
if (!head) fail('cannot resolve exact checked-out SHA');
if (branch && branch !== 'main' && process.env.ALLOW_PREPROMOTION_CHECK !== '1') fail(`LIVE guard may only authorise main; observed ${branch}`);

if (head !== manifest.testKingSha) {
  // A release needs to record its own tested SHA and Founder decision, which
  // necessarily changes the manifest after the tested commit exists. Permit
  // exactly one control-only child commit; runtime/product bytes remain those
  // of the exact tested parent. No other file may differ.
  if (manifest.schemaVersion !== 2 || manifest.releaseControlCommit !== true) {
    fail(`checked-out SHA ${head} is not authorised exact artifact ${manifest.testKingSha}`);
  }
  if (parent !== manifest.testKingSha) {
    fail(`release-control parent ${parent || 'MISSING'} is not exact tested artifact ${manifest.testKingSha}`);
  }
  const changed = git(['diff', '--name-only', manifest.testKingSha, head]).split('\n').filter(Boolean);
  if (changed.length !== 1 || changed[0] !== manifestPath) {
    fail(`release-control commit changed non-manifest files: ${changed.join(', ') || 'NONE'}`);
  }
}

console.log('LIVE PROMOTION AUTHORITY GUARD: PASS');
console.log(JSON.stringify({
  branch,
  releaseHead: head,
  exactTestedArtifact: manifest.testKingSha,
  runtimeDelta: head === manifest.testKingSha ? 'NONE' : 'MANIFEST_ONLY',
  priorLiveSha: manifest.priorLiveSha,
  founderDecisionRef: manifest.founderDecisionRef,
  evidenceRef: manifest.evidenceRef,
  rollbackRef: manifest.rollbackRef
}, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
