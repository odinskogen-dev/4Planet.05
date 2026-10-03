import test from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const workflow = readFileSync(new URL('../.github/workflows/product-authority-enforcement.yml', import.meta.url), 'utf8');

const workflowRunBlock = (stepName) => {
  const lines = workflow.split('\n');
  const stepIndex = lines.findIndex((line) => line.trim() === `- name: ${stepName}`);
  assert.notEqual(stepIndex, -1, `workflow step not found: ${stepName}`);
  const nextStepIndex = lines.findIndex((line, index) => index > stepIndex && /^\s{6}- name: /.test(line));
  const stepLines = lines.slice(stepIndex, nextStepIndex === -1 ? undefined : nextStepIndex);
  const runIndex = stepLines.findIndex((line) => /^\s+run: \|\s*$/.test(line));
  assert.notEqual(runIndex, -1, `run block not found: ${stepName}`);
  const body = stepLines.slice(runIndex + 1).filter((line) => line.trim() !== '');
  const indentation = Math.min(...body.map((line) => line.match(/^\s*/)[0].length));
  return stepLines.slice(runIndex + 1).map((line) => line.slice(indentation)).join('\n');
};

const executeWithFailingGate = (runBlock) => {
  const directory = mkdtempSync(join(tmpdir(), 'product-authority-pipefail-'));
  try {
    const bin = join(directory, 'bin');
    const fakeNode = join(bin, 'node');
    mkdirSync(bin);
    writeFileSync(fakeNode, '#!/usr/bin/env bash\nexit 23\n');
    chmodSync(fakeNode, 0o755);
    const result = spawnSync('bash', ['-e', '-c', runBlock], {
      cwd: directory,
      env: { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH}` },
      encoding: 'utf8',
    });
    return { result, evidenceExists: existsSync(join(directory, 'product-authority-result.txt')) };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

test('Product Authority workflow preserves the gate exit status while retaining tee evidence', () => {
  const runBlock = workflowRunBlock('Validate registry and current mutation authority');
  const failClosed = executeWithFailingGate(runBlock);
  assert.equal(failClosed.result.status, 23, failClosed.result.stderr);
  assert.equal(failClosed.evidenceExists, true);

  const withoutPipefail = executeWithFailingGate(runBlock.replace(/^set -o pipefail\n/m, ''));
  assert.equal(withoutPipefail.result.status, 0, 'control must reproduce the hidden gate failure without pipefail');
});
