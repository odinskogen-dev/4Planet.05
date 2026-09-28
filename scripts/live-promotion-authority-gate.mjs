#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function fail(message) {
  console.error(`LIVE PROMOTION AUTHORITY GUARD: FAIL — ${message}`);
  process.exit(1);
}
function git(args) {
  try { return execFileSync('git', args, { encoding: 'utf8' }).trim(); }
  catch { return ''; }
}
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
