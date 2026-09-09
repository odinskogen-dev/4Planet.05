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
if (head !== manifest.testKingSha) fail(`checked-out SHA ${head} is not authorised exact artifact ${manifest.testKingSha}`);
if (branch && branch !== 'main' && process.env.ALLOW_PREPROMOTION_CHECK !== '1') fail(`LIVE guard may only authorise main; observed ${branch}`);

console.log('LIVE PROMOTION AUTHORITY GUARD: PASS');
console.log(JSON.stringify({ branch, exactSha: head, priorLiveSha: manifest.priorLiveSha, founderDecisionRef: manifest.founderDecisionRef, evidenceRef: manifest.evidenceRef, rollbackRef: manifest.rollbackRef }, null, 2));
