#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

function fail(message) {
  console.error(`LIVE PROMOTION AUTHORITY GUARD: FAIL — ${message}`);
  process.exit(1);
}
function git(args) {
  try { return execFileSync('git', args, { encoding: 'utf8' }).trim(); }
  catch { return ''; }
}
const FOUNDER_LOGIN = 'odinskogen-dev';
const FOUNDER_ID = 289761792;
const REQUIRED_FOUNDER_ACTION = 'LIVE_DEPLOY';
const REQUIRED_FOUNDER_TARGET_ROUTE = 'git:main';
const CLOUDFLARE_PROJECT = '4planet-05';
const CLOUDFLARE_PRODUCTION_ROUTE = 'https://4planet.org';
const decisionRefPattern = /^https:\/\/github\.com\/odinskogen-dev\/4Planet\.05\/issues\/(\d+)#issuecomment-(\d+)$/;
const cloudflareDeploymentRefPattern = /^https:\/\/api\.cloudflare\.com\/client\/v4\/accounts\/([0-9a-f]{32})\/pages\/projects\/4planet-05\/deployments\/([0-9a-f-]{36})$/;

export function founderDecisionApiUrl(ref) {
  const match = String(ref || '').match(decisionRefPattern);
  if (!match) throw new Error('founderDecisionRef is not a canonical 4Planet.05 GitHub issue-comment receipt');
  return `https://api.github.com/repos/odinskogen-dev/4Planet.05/issues/comments/${match[2]}`;
}

export function validateFounderDecisionReceipt({ receipt, ref, testKingSha }) {
  const apiUrl = founderDecisionApiUrl(ref);
  const commentId = Number(apiUrl.split('/').at(-1));
  if (!receipt || receipt.id !== commentId) throw new Error('Founder decision receipt ID mismatch');
  if (receipt.user?.login !== FOUNDER_LOGIN || receipt.user?.id !== FOUNDER_ID) {
    throw new Error('Founder decision issuer mismatch');
  }
  if (!receipt.created_at || receipt.updated_at !== receipt.created_at) {
    throw new Error('Founder decision receipt is edited or lacks immutable timestamps');
  }
  const body = String(receipt.body || '');
  const requiredLines = [
    '4PLANET FOUNDER RELEASE APPROVED',
    'STATUS: APPROVED',
    `ACTION: ${REQUIRED_FOUNDER_ACTION}`,
    `TARGET_ROUTE: ${REQUIRED_FOUNDER_TARGET_ROUTE}`,
    `TEST_KING_SHA: ${testKingSha}`,
  ];
  for (const line of requiredLines) {
    if (!body.split(/\r?\n/).includes(line)) throw new Error(`Founder decision receipt missing exact line: ${line}`);
  }
  return { apiUrl, commentId, issuer: FOUNDER_LOGIN };
}

export function validateCloudflareProjectReceipt({ receipt, accountId }) {
  const project = receipt?.success === true && receipt?.errors?.length === 0 ? receipt.result : null;
  if (!project || project.name !== CLOUDFLARE_PROJECT) throw new Error('Cloudflare project receipt mismatch');
  if (project.production_branch !== 'main') throw new Error('Cloudflare production branch is not main');
  if (!Array.isArray(project.domains) || !project.domains.includes(new URL(CLOUDFLARE_PRODUCTION_ROUTE).host)) {
    throw new Error('Cloudflare project receipt does not bind production route 4planet.org');
  }
  const canonicalDeploymentId = project.canonical_deployment?.id;
  if (typeof canonicalDeploymentId !== 'string' || !/^[0-9a-f-]{36}$/i.test(canonicalDeploymentId)) {
    throw new Error('Cloudflare canonical production deployment is missing or invalid');
  }
  return { accountId, project: project.name, productionRoute: CLOUDFLARE_PRODUCTION_ROUTE, canonicalDeploymentId };
}

export function cloudflareDeploymentApiUrl(ref, accountId) {
  const match = String(ref || '').match(cloudflareDeploymentRefPattern);
  if (!match || match[1] !== accountId) {
    throw new Error('Cloudflare deployment reference is not a canonical authenticated 4planet-05 receipt');
  }
  return ref;
}

export function validateCloudflareDeploymentReceipt({ receipt, ref, accountId, expected }) {
  const apiUrl = cloudflareDeploymentApiUrl(ref, accountId);
  const match = apiUrl.match(cloudflareDeploymentRefPattern);
  const deployment = receipt?.success === true && receipt?.errors?.length === 0 ? receipt.result : null;
  if (!deployment || deployment.id !== match[2]) throw new Error('Cloudflare deployment receipt ID mismatch');
  if (deployment.project_name !== CLOUDFLARE_PROJECT) throw new Error('Cloudflare deployment project mismatch');
  if (deployment.environment !== expected.environment) throw new Error(`Cloudflare deployment environment mismatch: expected ${expected.environment}`);
  if (deployment.latest_stage?.status !== 'success') throw new Error('Cloudflare deployment is not successful');
  if (deployment.deployment_trigger?.metadata?.branch !== expected.branch) throw new Error(`Cloudflare deployment branch mismatch: expected ${expected.branch}`);
  if (deployment.deployment_trigger?.metadata?.commit_hash !== expected.sha) throw new Error(`Cloudflare deployment artifact mismatch: expected ${expected.sha}`);
  return { id: deployment.id, environment: deployment.environment, branch: expected.branch, sha: expected.sha };
}

export function validateCurrentLiveDeployment({ project, liveDeployment }) {
  if (!project?.canonicalDeploymentId) throw new Error('Cloudflare canonical production deployment is missing');
  if (liveDeployment?.id !== project.canonicalDeploymentId) {
    throw new Error('Purported LIVE deployment is not the current canonical production deployment');
  }
  return liveDeployment;
}

async function fetchFounderDecisionReceipt(ref) {
  const apiUrl = founderDecisionApiUrl(ref);
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': '4planet-live-promotion-guard' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(apiUrl, { headers });
  if (!response.ok) throw new Error(`Founder decision receipt fetch failed: HTTP ${response.status}`);
  return response.json();
}

async function fetchCloudflareReceipt(url, token) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Cloudflare receipt fetch failed: HTTP ${response.status}`);
  return response.json();
}

async function main() {
const manifestPath = 'docs/control/LIVE_PROMOTION_MANIFEST.json';
const authorityPath = 'docs/control/PROJECT_CANDIDATE_AUTHORITY.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const authority = JSON.parse(fs.readFileSync(authorityPath, 'utf8'));
const head = git(['rev-parse', 'HEAD']);
const parent = git(['rev-parse', 'HEAD^']);
const branch = process.env.GITHUB_REF_NAME || git(['branch', '--show-current']);
const sha = (value) => typeof value === 'string' && /^[0-9a-f]{40}$/i.test(value);

if (authority?.authority_model?.test_heir?.branch !== 'king/test') fail('king/test is not the sole configured HEIR');
if (authority?.promotion_contract?.live_promotion !== 'FOUNDER_AUTHORITY_REQUIRED_EXACT_TESTED_ARTIFACT') fail('Founder exact-artifact law missing');
if (manifest.sourceBranch !== 'king/test') fail(`sourceBranch must be king/test, got ${manifest.sourceBranch || 'MISSING'}`);
if (manifest.targetBranch !== 'main') fail(`targetBranch must be main, got ${manifest.targetBranch || 'MISSING'}`);
if (!sha(manifest.targetObservedSha)) fail('manifest targetObservedSha invalid');
const targetHead = git(['rev-parse', `refs/remotes/origin/${manifest.targetBranch}`]) || git(['rev-parse', manifest.targetBranch]);
if (!sha(targetHead)) fail(`cannot resolve target branch ${manifest.targetBranch}`);
if (targetHead !== manifest.targetObservedSha) {
  fail(`target branch drift: observed ${targetHead}, manifest records ${manifest.targetObservedSha}`);
}
if (manifest.status !== 'FOUNDER_AUTHORISED') fail(`manifest status is ${manifest.status || 'MISSING'}, not FOUNDER_AUTHORISED`);
if (!sha(manifest.testKingSha)) fail('manifest testKingSha invalid');
if (manifest.liveRollbackState !== 'VERIFIED') fail(`LIVE rollback state is ${manifest.liveRollbackState || 'MISSING'}, not VERIFIED`);
if (!sha(manifest.priorLiveSha)) fail('manifest priorLiveSha invalid');
if (!manifest.founderDecisionRef || !String(manifest.founderDecisionRef).trim()) fail('founderDecisionRef missing');
if (!sha(manifest.founderDecisionTestKingSha)) fail('founderDecisionTestKingSha invalid');
if (manifest.founderDecisionTestKingSha !== manifest.testKingSha) {
  fail(`Founder decision artifact mismatch: decision binds ${manifest.founderDecisionTestKingSha}, manifest tests ${manifest.testKingSha}`);
}
let founderReceipt;
try {
  const receipt = await fetchFounderDecisionReceipt(manifest.founderDecisionRef);
  founderReceipt = validateFounderDecisionReceipt({
    receipt,
    ref: manifest.founderDecisionRef,
    testKingSha: manifest.testKingSha,
  });
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
const cloudflareAccountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || '');
const cloudflareToken = String(process.env.CLOUDFLARE_API_TOKEN || '');
if (!/^[0-9a-f]{32}$/.test(cloudflareAccountId) || !cloudflareToken) fail('authenticated Cloudflare receipt access unavailable');
let cloudflareProject;
let candidateDeployment;
let liveDeployment;
let rollbackDeployment;
try {
  const projectUrl = `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/pages/projects/${CLOUDFLARE_PROJECT}`;
  cloudflareProject = validateCloudflareProjectReceipt({
    receipt: await fetchCloudflareReceipt(projectUrl, cloudflareToken),
    accountId: cloudflareAccountId,
  });
  const candidateEvidenceUrl = cloudflareDeploymentApiUrl(manifest.candidateEvidenceRef, cloudflareAccountId);
  const liveEvidenceUrl = cloudflareDeploymentApiUrl(manifest.evidenceRef, cloudflareAccountId);
  const rollbackEvidenceUrl = cloudflareDeploymentApiUrl(manifest.rollbackRef, cloudflareAccountId);
  candidateDeployment = validateCloudflareDeploymentReceipt({
    receipt: await fetchCloudflareReceipt(candidateEvidenceUrl, cloudflareToken),
    ref: candidateEvidenceUrl,
    accountId: cloudflareAccountId,
    expected: { environment: 'preview', branch: 'king/test', sha: manifest.testKingSha },
  });
  liveDeployment = validateCloudflareDeploymentReceipt({
    receipt: await fetchCloudflareReceipt(liveEvidenceUrl, cloudflareToken),
    ref: liveEvidenceUrl,
    accountId: cloudflareAccountId,
    expected: { environment: 'production', branch: 'main', sha: manifest.targetObservedSha },
  });
  liveDeployment = validateCurrentLiveDeployment({ project: cloudflareProject, liveDeployment });
  rollbackDeployment = validateCloudflareDeploymentReceipt({
    receipt: await fetchCloudflareReceipt(rollbackEvidenceUrl, cloudflareToken),
    ref: rollbackEvidenceUrl,
    accountId: cloudflareAccountId,
    expected: { environment: 'production', branch: 'main', sha: manifest.priorLiveSha },
  });
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
if (!head) fail('cannot resolve exact checked-out SHA');
if (branch && branch !== 'main' && process.env.ALLOW_PREPROMOTION_CHECK !== '1') fail(`LIVE guard may only authorise main; observed ${branch}`);

if (head !== manifest.testKingSha) {
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
  targetBranch: manifest.targetBranch,
  targetObservedSha: manifest.targetObservedSha,
  liveRollbackState: manifest.liveRollbackState,
  priorLiveSha: manifest.priorLiveSha,
  founderDecisionRef: manifest.founderDecisionRef,
  founderDecisionTestKingSha: manifest.founderDecisionTestKingSha,
  founderDecisionAction: REQUIRED_FOUNDER_ACTION,
  founderDecisionTargetRoute: REQUIRED_FOUNDER_TARGET_ROUTE,
  founderDecisionReceiptId: founderReceipt.commentId,
  founderDecisionIssuer: founderReceipt.issuer,
  cloudflareProject: cloudflareProject.project,
  cloudflareProductionRoute: cloudflareProject.productionRoute,
  candidateDeployment,
  liveDeployment,
  rollbackDeployment,
  evidenceRef: manifest.evidenceRef,
  rollbackRef: manifest.rollbackRef
}, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
