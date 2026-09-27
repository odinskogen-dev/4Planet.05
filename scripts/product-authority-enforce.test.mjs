import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wrapper = path.join(root, "scripts/product-authority-enforce.sh");
const workflow = path.join(root, ".github/workflows/product-authority-enforcement.yml");

function runWrapper({ exitCode, text, cwd, pathPrefix }) {
  const result = spawnSync("bash", [wrapper], {
    cwd,
    env: {
      ...process.env,
      PATH: pathPrefix ? `${pathPrefix}:${process.env.PATH}` : process.env.PATH,
      AUTHORITY_BASE_REF: process.env.AUTHORITY_BASE_REF || "king/test",
    },
    encoding: "utf8",
  });
  const file = path.join(cwd, "product-authority-result.txt");
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    file: fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "",
  };
}

function fakeNode(exitCode, text) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "product-authority-exit-"));
  const bin = path.join(dir, "bin");
  fs.mkdirSync(bin);
  fs.writeFileSync(
    path.join(bin, "node"),
    `#!/bin/sh\nprintf '%s\\n' ${JSON.stringify(text)}\nexit ${exitCode}\n`,
    { mode: 0o755 },
  );
  return { dir, bin };
}

test("the workflow calls the shared wrapper and does not pipe the gate straight to tee", () => {
  const source = fs.readFileSync(workflow, "utf8");
  const script = fs.readFileSync(wrapper, "utf8");
  assert.match(source, /bash scripts\/product-authority-enforce\.sh/);
  assert.doesNotMatch(source, /node scripts\/product-authority-gate\.mjs \| tee /);
  assert.match(script, /set -o pipefail/);
  assert.match(script, /node scripts\/product-authority-gate\.mjs \| tee product-authority-result\.txt/);
});

test("bash -e without pipefail masks a failing gate piped to tee", () => {
  const { dir, bin } = fakeNode(1, "PRODUCT AUTHORITY GATE: FAIL — masked");
  const result = spawnSync("bash", ["-e", "-c", "node scripts/product-authority-gate.mjs | tee product-authority-result.txt"], {
    cwd: dir,
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
  assert.match(fs.readFileSync(path.join(dir, "product-authority-result.txt"), "utf8"), /masked/);
});

test("gate exit 1 stays a wrapper failure and the diagnostic is retained", () => {
  const { dir, bin } = fakeNode(1, "PRODUCT AUTHORITY GATE: FAIL — synthetic exit");
  const result = runWrapper({ cwd: dir, pathPrefix: bin });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /PRODUCT AUTHORITY GATE: FAIL — synthetic exit/);
  assert.match(result.file, /PRODUCT AUTHORITY GATE: FAIL — synthetic exit/);
});

test("gate exit 0 stays wrapper success and the diagnostic is retained", () => {
  const { dir, bin } = fakeNode(0, "PRODUCT AUTHORITY GATE: PASS");
  const result = runWrapper({ cwd: dir, pathPrefix: bin });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /PRODUCT AUTHORITY GATE: PASS/);
  assert.match(result.file, /PRODUCT AUTHORITY GATE: PASS/);
});

test("the real authority gate passes through the same wrapper", () => {
  const resultFile = path.join(root, "product-authority-result.txt");
  fs.rmSync(resultFile, { force: true });
  const result = runWrapper({ cwd: root });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /PRODUCT AUTHORITY GATE: PASS/);
  assert.match(result.file, /PRODUCT AUTHORITY GATE: PASS/);
  fs.rmSync(resultFile, { force: true });
});
