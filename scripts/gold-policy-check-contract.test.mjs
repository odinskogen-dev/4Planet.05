import test from "node:test";
import assert from "node:assert/strict";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const BRIEF = "docs/control/GOLD_CURRENT_BRIEF.md";
const POLICY = "scripts/gold-policy-check.mjs";
const REQUIRED = [
  "docs/GOLD_WORLD_CLASS_QUALITY_GATE.md",
  "docs/control/GOLD_ENFORCEMENT_MATRIX.md",
  BRIEF,
  "docs/control/GOLD_PRIMITIVE_REGISTRY.md",
  "docs/control/GOLD_VISUAL_BASELINES.json",
  "docs/control/LIVE_PROMOTION_MANIFEST.json",
  "docs/control/CODE_LINEAGE_REGISTER.md",
  "docs/control/TEST_KING_DONOR_LEDGER.md",
  "docs/control/REPOSITORY_AUTHORITY_REGISTER.md",
  "AGENTS.md",
  ".github/pull_request_template.md",
  POLICY,
];

const currentBrief = readFileSync(new URL(`../${BRIEF}`, import.meta.url), "utf8");
const separator = currentBrief.indexOf("\n---\n");
assert.notEqual(separator, -1, "current brief must separate its newest contract from preserved history");
const newestContractOnly = `${currentBrief.slice(0, separator).trimEnd()}\n`;
const preservedHistoryOnly = currentBrief.slice(separator + "\n---\n".length).replace(/^\n/, "");

const run = (mutateBrief, { changed = true } = {}) => {
  const directory = mkdtempSync(join(tmpdir(), "gold-policy-history-"));
  try {
    for (const relative of REQUIRED) {
      const source = new URL(`../${relative}`, import.meta.url);
      const destination = join(directory, relative);
      mkdirSync(dirname(destination), { recursive: true });
      copyFileSync(source, destination);
    }

    const git = (...args) => {
      const result = spawnSync("git", args, { cwd: directory, encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr);
    };
    git("init", "-q");
    git("config", "user.email", "gold-contract@example.invalid");
    git("config", "user.name", "Gold contract fixture");
    git("add", ".");
    git("commit", "-qm", "baseline");

    if (mutateBrief !== null) {
      writeFileSync(join(directory, BRIEF), mutateBrief, "utf8");
      git("add", BRIEF);
      git("commit", "-qm", "candidate");
    }

    return spawnSync(process.execPath, [POLICY, "--mode=king-push"], {
      cwd: directory,
      env: {
        ...process.env,
        GOLD_CHANGED_FILES: changed ? BRIEF : "README.md",
      },
      encoding: "utf8",
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

test("rejects the escaped 2,809-line to binary-line history loss", () => {
  const result = run("\u0000broken historical replacement\n");
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /GOLD brief.*history|current GOLD brief/i);
});

test("rejects a substantive newest contract when preserved history is deleted", () => {
  const result = run(newestContractOnly);
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /GOLD brief.*history/i);
});

test("rejects preserved old history when the newest contract is deleted", () => {
  const result = run(preservedHistoryOnly);
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /GOLD brief.*history|newest GOLD brief/i);
});

test("accepts the unchanged current document", () => {
  const result = run(null, { changed: false });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("accepts a substantive newest contract prepended to exact preserved history", () => {
  const nextContract = newestContractOnly.replace(
    "# EARTH NOW + ABOUT — CANONICAL ACCEPTANCE CONTRACT — 27 OCTOBER 2026",
    "# NEXT BOUNDED GOLD CONTRACT — FIXTURE",
  );
  const result = run(`${nextContract.trimEnd()}\n\n---\n\n${currentBrief}`);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
