#!/usr/bin/env node
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const IMMEDIATE_PRE_RELEASE = {
  project: '4planet-05',
  sha: 'f4e3f33807bb8ca1919d09f4f0a12eb1fb58fe24',
  deployment: 'https://0d3c403d.4planet-05.pages.dev',
  asset: '/assets/index-B19g76B_.js',
  sha256: '1a6444489e50cb06e32799508f536ee512e86068f9409f992dfbd8a7c35365a7',
  bytes: 1847105,
};

export const SUPERSEDED_MAIN_DEPLOYMENT = {
  sha: '359f687f91470a8ee40f8558ade56d578d76accb',
  deployment: 'https://3b786854.4planet-05.pages.dev',
  asset: '/assets/index-BlYT68qY.js',
};

export const CURRENT_LIVE_ORIGIN = 'https://4planet.org';
const PROJECT_HOST_SUFFIX = '.4planet-05.pages.dev';
const PREVIEW_ALIAS_HOST = 'release-targeted-4planet-id.4planet-05.pages.dev';
const PRE_RELEASE_HOST = '0d3c403d.4planet-05.pages.dev';

export function exactDeploymentOrigin(value) {
  if (typeof value !== 'string') return null;
  let url;
  try { url = new URL(value); } catch { return null; }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password || url.port || url.search || url.hash) return null;
  if (url.pathname !== '/' && url.pathname !== '') return null;
  if (url.hostname !== '0d3c403d.4planet-05.pages.dev') return null;
  return url.origin;
}

function observeOrigin(origin) {
  const page = spawnSync('curl', ['-fsS', '--max-time', '25', '-A', '4planet-control', `${origin}/`], { encoding: 'utf8' });
  if (page.status !== 0) return { available: false, assetReferenced: false, asset: '', sha256: '', bytes: 0 };
  const match = String(page.stdout || '').match(/\/assets\/index-[^"' ]+\.js/);
  const assetPath = match ? match[0] : '';
  if (!assetPath) return { available: true, assetReferenced: false, asset: '', sha256: '', bytes: 0 };
  const asset = spawnSync('curl', ['-fsS', '--max-time', '25', '-A', '4planet-control', `${origin}${assetPath}`], { encoding: 'buffer', maxBuffer: 8 * 1024 * 1024 });
  if (asset.status !== 0 || !asset.stdout) return { available: false, assetReferenced: false, asset: assetPath, sha256: '', bytes: 0 };
  return {
    available: true,
    assetReferenced: true,
    asset: assetPath,
    sha256: createHash('sha256').update(asset.stdout).digest('hex'),
    bytes: asset.stdout.length,
  };
}

export function observePinnedDeployment() {
  return observeOrigin(IMMEDIATE_PRE_RELEASE.deployment);
}

export function observeCurrentLive() {
  return observeOrigin(CURRENT_LIVE_ORIGIN);
}

export function currentLiveProblems(observation) {
  const expected = IMMEDIATE_PRE_RELEASE;
  if (!observation || observation.available !== true) return ['current live baseline is unavailable'];
  if (observation.assetReferenced !== true || observation.asset !== expected.asset || observation.sha256 !== expected.sha256 || observation.bytes !== expected.bytes) {
    return ['current live baseline drifted from the pre-release runtime'];
  }
  return [];
}

function deploymentRecordComplete(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
  if (typeof item.id !== 'string' || !item.id) return false;
  if (item.environment !== 'production' && item.environment !== 'preview') return false;
  if (typeof item.url !== 'string') return false;
  if (typeof item.latest_stage?.status !== 'string' || !item.latest_stage.status) return false;
  const hash = item.deployment_trigger?.metadata?.commit_hash;
  return typeof hash === 'string' && /^[0-9a-f]{40}$/i.test(hash);
}

export function providerProblems(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return ['provider response is malformed'];
  if (payload.success !== true) return ['provider response is not successful'];
  if (!Array.isArray(payload.errors)) return ['provider errors are missing'];
  if (payload.errors.length) return ['provider response contains errors'];
  if (!Array.isArray(payload.result)) return ['provider result is missing'];
  const info = payload.result_info;
  if (!info || typeof info !== 'object' || Array.isArray(info)) return ['provider result_info is missing'];
  for (const key of ['page', 'per_page', 'count', 'total_count', 'total_pages']) {
    if (!Number.isInteger(info[key]) || info[key] < 0) return [`provider result_info.${key} is invalid`];
  }
  if (info.page !== 1 || info.total_pages !== 1) return ['provider response is a partial page'];
  if (info.count !== payload.result.length || info.total_count !== payload.result.length) return ['provider response is incomplete'];
  if (payload.result.some((item) => !deploymentRecordComplete(item))) return ['provider result is malformed'];
  return [];
}

export function assembleProviderPages(pages) {
  if (!Array.isArray(pages) || pages.length === 0) return { ok: false, problems: ['provider response is incomplete'], payload: null };
  const first = pages[0];
  if (!first || typeof first !== 'object' || first.success !== true) return { ok: false, problems: ['provider response is not successful'], payload: null };
  const totalPages = first.result_info?.total_pages;
  const totalCount = first.result_info?.total_count;
  if (!Number.isInteger(totalPages) || totalPages < 1 || totalPages > 50) return { ok: false, problems: ['provider page count is invalid'], payload: null };
  if (pages.length !== totalPages) return { ok: false, problems: ['provider response is a partial page'], payload: null };
  const seen = new Set();
  const result = [];
  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    if (!page || page.success !== true) return { ok: false, problems: ['provider response is not successful'], payload: null };
    if (!Array.isArray(page.errors) || page.errors.length) return { ok: false, problems: ['provider response contains errors'], payload: null };
    if (page.result_info?.page !== index + 1 || page.result_info?.total_pages !== totalPages || page.result_info?.total_count !== totalCount) {
      return { ok: false, problems: ['provider response is incomplete'], payload: null };
    }
    if (!Array.isArray(page.result) || page.result.length !== page.result_info.count) return { ok: false, problems: ['provider response is incomplete'], payload: null };
    for (const item of page.result) {
      if (!deploymentRecordComplete(item)) return { ok: false, problems: ['provider result is malformed'], payload: null };
      if (seen.has(item.id)) return { ok: false, problems: ['provider response contains duplicate deployments'], payload: null };
      seen.add(item.id);
      result.push(item);
    }
  }
  if (result.length !== totalCount) return { ok: false, problems: ['provider response is incomplete'], payload: null };
  const payload = {
    success: true,
    errors: [],
    messages: [],
    result,
    result_info: { page: 1, per_page: Math.max(result.length, 1), count: result.length, total_count: result.length, total_pages: 1 },
  };
  const problems = providerProblems(payload);
  return problems.length ? { ok: false, problems, payload: null } : { ok: true, problems: [], payload };
}

export function releaseIdentity(identity) {
  if (typeof identity === 'string') {
    return sha(identity)
      ? { ok: true, candidateSha: identity, deployedSha: identity, manifestChild: false }
      : { ok: false, problems: ['release identity is incomplete'] };
  }
  const candidateSha = identity?.candidateSha;
  const deployedSha = identity?.deployedSha ?? identity?.candidateSha;
  if (!sha(candidateSha) || !sha(deployedSha)) return { ok: false, problems: ['release identity is incomplete'] };
  if (deployedSha === candidateSha) return { ok: true, candidateSha, deployedSha, manifestChild: false };
  if (identity?.manifestChild !== true) return { ok: false, problems: ['deployed commit is not the tested candidate or its manifest-only child'] };
  return { ok: true, candidateSha, deployedSha, manifestChild: true };
}

export function productionConsumption(payload, identity) {
  const problems = providerProblems(payload);
  if (problems.length) return { ok: false, consumed: false, previewOnly: false, match: null, problems };
  const bound = releaseIdentity(identity);
  if (!bound.ok) return { ok: false, consumed: false, previewOnly: false, match: null, problems: bound.problems };
  const commitOf = (item) => item.deployment_trigger.metadata.commit_hash;
  const matches = payload.result.filter((item) => item.environment === 'production' && item.latest_stage.status === 'success' && commitOf(item) === bound.deployedSha);
  const previews = payload.result.filter((item) => item.environment === 'preview' && item.latest_stage.status === 'success' && commitOf(item) === bound.deployedSha);
  return { ok: true, consumed: matches.length > 0, previewOnly: matches.length === 0 && previews.length > 0, match: matches[0] || null, identity: bound, problems: [] };
}

function productionOrigin(value) {
  if (typeof value !== 'string') return null;
  let url;
  try { url = new URL(value); } catch { return null; }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash) return null;
  if (url.pathname !== '/' && url.pathname !== '') return null;
  if (!url.hostname.endsWith(PROJECT_HOST_SUFFIX)) return null;
  if (url.hostname === PRE_RELEASE_HOST || url.hostname === PREVIEW_ALIAS_HOST) return null;
  return url.origin;
}

export function productionReadbackProblems(readback, identity) {
  if (!readback || readback.available !== true || readback.assetReferenced !== true) return ['new production readback is unavailable'];
  const bound = releaseIdentity(identity);
  if (!bound.ok) return bound.problems;
  const origin = productionOrigin(readback.deployment);
  if (!origin) return ['production readback is not a new existing-project deployment'];
  if (readback.sha256 === IMMEDIATE_PRE_RELEASE.sha256 || readback.asset === IMMEDIATE_PRE_RELEASE.asset) return ['production readback is still the pre-release runtime'];
  if (typeof readback.asset !== 'string' || !readback.asset.startsWith('/assets/index-') || typeof readback.sha256 !== 'string' || !/^[0-9a-f]{64}$/i.test(readback.sha256) || !Number.isInteger(readback.bytes) || readback.bytes <= 0) {
    return ['production readback identity is incomplete'];
  }
  if (typeof readback.id !== 'string' || !readback.id) return ['production readback is not bound to a provider deployment'];
  if (readback.commitHash !== bound.deployedSha) return ['production readback is not bound to the deployed commit'];
  if (bound.manifestChild && readback.commitHash === bound.candidateSha) return ['production readback falsifies the deployed commit'];
  return [];
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

function authorityProblems(targeted, testedHead) {
  if (!targeted || (targeted.authorityState !== 'UNSPENT' && targeted.authorityState !== 'CLOSED')) return ['targeted release authority state is invalid'];
  if (targeted.authorityState === 'CLOSED' || targeted.closureReceipt != null) return ['targeted identity release authority is already spent'];
  if (targeted.liveAuthority !== true || !targeted.goldEvidenceRef || !sha(targeted.candidateSha)) return ['targeted identity release is not live-authorised'];
  if (targeted.candidateSha === targeted.liveSourceSha) return ['targeted release candidate drifted onto the live source'];
  if (testedHead && targeted.candidateSha !== testedHead) return ['targeted release candidate drifted from the tested head'];
  return [];
}

export function promotionDecision(targeted, observation, testedHead, currentLive) {
  const provenance = rollbackProblems(targeted, observation);
  if (provenance.length) return { ok: false, message: provenance.join('; ') };
  const live = currentLiveProblems(currentLive);
  if (live.length) return { ok: false, message: live.join('; ') };
  const authority = authorityProblems(targeted, testedHead);
  if (authority.length) return { ok: false, message: authority.join('; ') };
  return { ok: true, message: 'targeted identity release is authorised once' };
}

export function closureAfterDeploy(targeted, deployOk, observation, testedHead, productionReadback) {
  const original = structuredClone(targeted);
  const rollback = rollbackProblems(original, observation);
  const authority = authorityProblems(original, testedHead);
  if (deployOk !== true || rollback.length || authority.length) {
    return {
      spent: false,
      mutated: false,
      targeted: original,
      message: deployOk === true ? [...rollback, ...authority].join('; ') : 'failed deploy leaves authority unspent',
    };
  }
  const identity = releaseIdentity({
    candidateSha: original.candidateSha,
    deployedSha: productionReadback?.commitHash,
    manifestChild: productionReadback?.manifestChild === true,
  });
  if (!identity.ok) return { spent: false, mutated: false, targeted: original, message: identity.problems.join('; ') };
  const readback = productionReadbackProblems(productionReadback, identity);
  if (readback.length) return { spent: false, mutated: false, targeted: original, message: readback.join('; ') };
  return {
    spent: true,
    mutated: true,
    targeted: {
      ...original,
      authorityState: 'CLOSED',
      closureReceipt: {
        candidateSha: identity.candidateSha,
        deployedCommitSha: identity.deployedSha,
        productionDeploymentId: productionReadback.id,
        productionDeploymentUrl: productionOrigin(productionReadback.deployment),
        productionAsset: productionReadback.asset,
        productionAssetSha256: productionReadback.sha256,
        productionAssetBytes: productionReadback.bytes,
      },
    },
    message: 'targeted identity release authority is already spent',
  };
}

export function persistenceRecovery({
  targeted,
  rollbackObservation,
  currentLive,
  provider,
  productionReadback,
  testedHead,
  deployedSha,
  manifestChild,
}) {
  const drifted = 'current live baseline drifted from the pre-release runtime';
  if (currentLiveProblems(currentLive).length === 0) return { ok: false, message: 'baseline still matches the pre-release runtime' };
  const provenance = rollbackProblems(targeted, rollbackObservation);
  if (provenance.length) return { ok: false, message: provenance.join('; ') };
  const authority = authorityProblems(targeted, testedHead);
  if (authority.length) return { ok: false, message: authority.join('; ') };
  const identity = releaseIdentity({ candidateSha: targeted.candidateSha, deployedSha, manifestChild });
  if (!identity.ok || !provider) return { ok: false, message: drifted };
  const consumption = productionConsumption(provider, identity);
  if (!consumption.ok || !consumption.consumed) return { ok: false, message: drifted };
  if (consumption.match.deployment_trigger.metadata.commit_hash !== identity.deployedSha) return { ok: false, message: drifted };
  const readback = productionReadbackProblems(productionReadback, identity);
  if (readback.length) return { ok: false, message: drifted };
  if (currentLive?.asset !== productionReadback.asset || currentLive?.sha256 !== productionReadback.sha256 || currentLive?.bytes !== productionReadback.bytes) {
    return { ok: false, message: drifted };
  }
  return { ok: true, message: 'verified production consumption can persist without another deploy' };
}

export function decidePromotion({
  targeted,
  rollbackObservation,
  currentLive,
  provider = null,
  productionReadback = null,
  testedHead,
  deployedSha,
  manifestChild = false,
}) {
  if (currentLiveProblems(currentLive).length === 0) {
    const decision = promotionDecision(targeted, rollbackObservation, testedHead, currentLive);
    if (!decision.ok) return { code: 1, lines: [`LIVE PROMOTION AUTHORITY GUARD: FAIL — ${decision.message}`] };
    return { code: 0, lines: ['LIVE PROMOTION AUTHORITY GUARD: PASS'] };
  }
  const recovery = persistenceRecovery({
    targeted, rollbackObservation, currentLive, provider, productionReadback, testedHead, deployedSha, manifestChild,
  });
  if (recovery.ok) return { code: 2, lines: ['LIVE PROMOTION AUTHORITY GUARD: PERSIST_RECOVERY', recovery.message] };
  return { code: 1, lines: [`LIVE PROMOTION AUTHORITY GUARD: FAIL — ${recovery.message}`] };
}

export function decideProductLive({
  targeted,
  rollbackObservation,
  currentLive,
  provider = null,
  productionReadback = null,
  testedHead,
  deployedSha,
  manifestChild = false,
}) {
  const provenance = rollbackProblems(targeted, rollbackObservation);
  if (provenance.length) return { ok: false, recovery: false, message: provenance.join('; ') };
  if (currentLiveProblems(currentLive).length === 0) return { ok: true, recovery: false, message: 'baseline' };
  if (targeted?.authorityState === 'CLOSED' || targeted?.closureReceipt) {
    const receipt = targeted.closureReceipt || {};
    if (currentLive?.asset === receipt.productionAsset && currentLive?.sha256 === receipt.productionAssetSha256 && currentLive?.bytes === receipt.productionAssetBytes) {
      return { ok: true, recovery: false, message: 'closed runtime' };
    }
    return { ok: false, recovery: false, message: 'current live baseline drifted from the pre-release runtime' };
  }
  const recovery = persistenceRecovery({
    targeted, rollbackObservation, currentLive, provider, productionReadback, testedHead, deployedSha, manifestChild,
  });
  if (recovery.ok) return { ok: true, recovery: true, message: recovery.message };
  return { ok: false, recovery: false, message: recovery.message };
}

export function releaseLifecycle({
  targeted,
  rollbackObservation,
  currentLive,
  provider,
  artifactSha,
  deployedSha = null,
  manifestChild = false,
  testedHead,
  deployOk = null,
  productionReadback = null,
  closureWriteOk = null,
}) {
  const original = structuredClone(targeted);
  const stopped = (message, action = 'FAIL') => ({ action, deploy: false, persist: false, mutated: false, spent: false, targeted: original, message });
  const provenance = rollbackProblems(original, rollbackObservation);
  if (provenance.length) return stopped(provenance.join('; '));
  if (original.authorityState === 'CLOSED' || original.closureReceipt != null) return stopped('targeted identity release authority is already spent');
  const identity = releaseIdentity({
    candidateSha: original.candidateSha,
    deployedSha: deployedSha ?? artifactSha,
    manifestChild,
  });
  if (!identity.ok) return stopped(identity.problems.join('; '));
  const consumption = productionConsumption(provider, identity);
  if (!consumption.ok) return stopped(consumption.problems.join('; '));
  if (consumption.consumed) {
    const readback = productionReadbackProblems(productionReadback, identity);
    if (readback.length) return stopped(readback.join('; '), 'HOLD');
    if (productionOrigin(productionReadback.deployment) !== productionOrigin(consumption.match.url)) return stopped('production readback is not the consumed deployment', 'HOLD');
    if (closureWriteOk === false) return stopped('closure persistence failed; verified production consumption blocks another deploy', 'HOLD');
    const closed = closureAfterDeploy(original, true, rollbackObservation, testedHead, productionReadback);
    if (!closed.spent) return stopped(closed.message, 'HOLD');
    return { action: 'PERSIST_CLOSURE', deploy: false, persist: true, mutated: true, spent: true, targeted: closed.targeted, message: closed.message };
  }
  const live = currentLiveProblems(currentLive);
  if (live.length) return stopped(live.join('; '));
  const authority = authorityProblems(original, testedHead);
  if (authority.length) return stopped(authority.join('; '));
  if (deployOk === true) return stopped('deploy was reported without a verified production record; refusing another deploy and refusing closure', 'HOLD');
  if (deployOk === false) return stopped('failed deploy leaves authority unspent');
  return { action: 'DEPLOY', deploy: true, persist: false, mutated: false, spent: false, targeted: original, message: 'production consumption is absent; one deploy is allowed' };
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
  branch: 'release/targeted-4planet-id-20261004-baseline',
  liveSourceSha: 'f4e3f33807bb8ca1919d09f4f0a12eb1fb58fe24',
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
  if (targeted.currentLiveOrigin !== CURRENT_LIVE_ORIGIN) fail('current live origin pin mismatch');
  const testedHead = head === targeted.candidateSha ? head : parent;
  const deployedSha = process.env.GITHUB_SHA || head;
  const manifestChild = Boolean(targeted.candidateSha) && deployedSha !== targeted.candidateSha;
  if (manifestChild) {
    if (parent !== targeted.candidateSha || (process.env.GITHUB_SHA && process.env.GITHUB_SHA !== head)) fail('deployed commit does not match the checked out release child');
    const child = git(['diff', '--name-only', targeted.candidateSha, deployedSha]).split('\n').filter(Boolean);
    if (child.length !== 1 || child[0] !== manifestPath) fail(`targeted release-control commit changed non-manifest files: ${child.join(', ') || 'NONE'}`);
  }
  const rollbackObservation = observePinnedDeployment();
  const currentLive = observeCurrentLive();
  let provider = null;
  let productionReadback = null;
  if (currentLiveProblems(currentLive).length > 0 && process.env.CLOUDFLARE_API_TOKEN) {
    const fetched = fetchProviderLive();
    if (fetched.ok) {
      provider = fetched.payload;
      const identity = releaseIdentity({ candidateSha: targeted.candidateSha, deployedSha, manifestChild });
      productionReadback = identity.ok ? productionReadbackFromProvider(provider, identity) : null;
    }
  }
  const verdict = decidePromotion({
    targeted, rollbackObservation, currentLive, provider, productionReadback, testedHead, deployedSha, manifestChild,
  });
  verdict.lines.forEach((line) => (verdict.code === 1 ? console.error(line) : console.log(line)));
  if (verdict.code !== 0) process.exit(verdict.code);
  const releaseHead = testedHead;
  if (releaseHead !== targeted.candidateSha) fail('targeted release HEAD is not the tested candidate or its manifest-only child');
  console.log(JSON.stringify({ branch, releaseHead: head, exactTestedArtifact: targeted.candidateSha, deployedCommitSha: deployedSha, runtimeDelta: manifestChild ? 'MANIFEST_ONLY' : 'NONE', liveAuthority: true }, null, 2));
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

function curlJson(url, token) {
  const response = spawnSync('curl', ['-fsS', '--max-time', '25', '-H', `Authorization: Bearer ${token}`, url], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (response.status !== 0 || !response.stdout) return { ok: false, problems: ['provider response is unavailable'] };
  try { return { ok: true, body: JSON.parse(response.stdout) }; }
  catch { return { ok: false, problems: ['provider response is malformed'] }; }
}

export function fetchProviderLive() {
  const token = process.env.CLOUDFLARE_API_TOKEN || '';
  if (!token) return { ok: false, problems: ['provider credentials are missing'] };
  let account = process.env.PAGES_ACCOUNT_ID || '';
  if (!account) {
    const zone = curlJson('https://api.cloudflare.com/client/v4/zones?name=4planet.org', token);
    account = zone.ok ? (zone.body?.result?.[0]?.account?.id || '') : '';
    if (!account) return { ok: false, problems: ['provider credentials are missing'] };
  }
  const pages = [];
  let totalPages = 1;
  for (let page = 1; page <= totalPages; page += 1) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/4planet-05/deployments?page=${page}`;
    const fetched = curlJson(url, token);
    if (!fetched.ok) return fetched;
    pages.push(fetched.body);
    const reported = fetched.body?.result_info?.total_pages;
    if (!Number.isInteger(reported) || reported < 1 || reported > 50) return { ok: false, problems: ['provider page count is invalid'] };
    totalPages = reported;
  }
  return assembleProviderPages(pages);
}

function printLifecycle(result) {
  console.log(JSON.stringify({
    action: result.action,
    deploy: result.deploy,
    persist: result.persist,
    mutated: result.mutated,
    spent: result.spent,
    message: result.message,
    targeted: result.targeted,
  }));
  process.exit(result.action === 'DEPLOY' || result.action === 'PERSIST_CLOSURE' ? 0 : 1);
}

function fixtureLifecycle(file) {
  const fixture = JSON.parse(fs.readFileSync(file, 'utf8'));
  printLifecycle(releaseLifecycle(fixture));
}

function liveLifecycle() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const targeted = manifest.targetedIdentityRelease;
  const head = git(['rev-parse', 'HEAD']);
  const parent = git(['rev-parse', 'HEAD^']);
  const provider = fetchProviderLive();
  if (!provider.ok) {
    printLifecycle({ action: 'FAIL', deploy: false, persist: false, mutated: false, spent: false, targeted, message: provider.problems.join('; ') });
  }
  const candidateSha = targeted.candidateSha;
  const deployedSha = process.env.GITHUB_SHA || head;
  const manifestChild = Boolean(candidateSha) && deployedSha !== candidateSha;
  const identity = { candidateSha, deployedSha, manifestChild };
  printLifecycle(releaseLifecycle({
    targeted,
    rollbackObservation: observePinnedDeployment(),
    currentLive: observeCurrentLive(),
    provider: provider.payload,
    artifactSha: candidateSha,
    deployedSha,
    manifestChild,
    testedHead: head === candidateSha ? head : parent,
    productionReadback: productionReadbackFromProvider(provider.payload, identity),
  }));
}

export function productionReadbackFromProvider(provider, identity) {
  const bound = releaseIdentity(identity);
  const consumption = productionConsumption(provider, bound.ok ? bound : identity);
  if (!consumption.ok || !consumption.consumed) return null;
  const origin = productionOrigin(consumption.match.url);
  if (!origin) return { available: false };
  const observed = observeOrigin(origin);
  const apex = observeCurrentLive();
  if (!observed.available || apex.sha256 !== observed.sha256 || apex.asset !== observed.asset || apex.bytes !== observed.bytes) return { available: false };
  return {
    ...observed,
    deployment: origin,
    id: consumption.match.id,
    commitHash: consumption.match.deployment_trigger.metadata.commit_hash,
    manifestChild: bound.manifestChild === true,
  };
}

function persistClosure(file, manifestOut) {
  const fixture = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = releaseLifecycle({ ...fixture, closureWriteOk: fixture.closureWriteOk === false ? false : true });
  if (!result.persist || result.deploy) {
    console.error(result.message);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.targetedIdentityRelease = result.targeted;
  fs.writeFileSync(manifestOut, `${JSON.stringify(manifest, null, 2)}\n`);
  process.exit(0);
}

function livePersist() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const targeted = manifest.targetedIdentityRelease;
  const head = git(['rev-parse', 'HEAD']);
  const parent = git(['rev-parse', 'HEAD^']);
  const provider = fetchProviderLive();
  if (!provider.ok) {
    console.error(provider.problems.join('; '));
    process.exit(1);
  }
  const result = releaseLifecycle({
    targeted,
    rollbackObservation: observePinnedDeployment(),
    currentLive: observeCurrentLive(),
    provider: provider.payload,
    artifactSha: targeted.candidateSha,
    deployedSha: process.env.GITHUB_SHA || head,
    manifestChild: Boolean(targeted.candidateSha) && (process.env.GITHUB_SHA || head) !== targeted.candidateSha,
    testedHead: head === targeted.candidateSha ? head : parent,
    productionReadback: productionReadbackFromProvider(provider.payload, {
      candidateSha: targeted.candidateSha,
      deployedSha: process.env.GITHUB_SHA || head,
      manifestChild: Boolean(targeted.candidateSha) && (process.env.GITHUB_SHA || head) !== targeted.candidateSha,
    }),
    closureWriteOk: true,
  });
  if (!result.persist || result.deploy) {
    console.error(result.message);
    process.exit(1);
  }
  manifest.targetedIdentityRelease = result.targeted;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fixtureFlag = process.argv.indexOf('--fixture');
  const fixture = fixtureFlag === -1 ? null : process.argv[fixtureFlag + 1];
  if (process.argv.includes('--release-lifecycle')) {
    if (fixture) fixtureLifecycle(fixture);
    else liveLifecycle();
  } else if (process.argv.includes('--persist-closure')) {
    const outFlag = process.argv.indexOf('--manifest-out');
    if (fixture && outFlag !== -1) persistClosure(fixture, process.argv[outFlag + 1]);
    if (fixture || outFlag !== -1) {
      console.error('closure persistence fixture and manifest output must be paired');
      process.exit(1);
    }
    livePersist();
  } else if (fixture) {
    const body = JSON.parse(fs.readFileSync(fixture, 'utf8'));
    const verdict = decidePromotion(body);
    for (const line of verdict.lines) {
      if (verdict.code === 1) console.error(line);
      else console.log(line);
    }
    process.exit(verdict.code);
  } else main();
}
