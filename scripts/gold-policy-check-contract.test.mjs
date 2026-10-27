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
const CONTRACT_TEST = "scripts/gold-policy-check-contract.test.mjs";
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

const nextContract = newestContractOnly.replace(
  "# EARTH NOW + ABOUT — CANONICAL ACCEPTANCE CONTRACT — 27 OCTOBER 2026",
  "# NEXT BOUNDED GOLD CONTRACT — FIXTURE",
);
const legitimatePrepend = `${nextContract.trimEnd()}\n\n---\n\n${currentBrief}`;
const requiredHeadings = [
  "## USER ARRIVES BECAUSE",
  "## ONE THING TO UNDERSTAND",
  "## PRIMARY ACTION",
  "## SECONDARY DEPTH",
  "## P1 DOMINANT",
  "## P2 ORIENTATION",
  "## P3 ACTION / NEXT",
  "## P4 DEPTH",
  "## WHAT CAN BE REMOVED",
  "## WHAT MUST BE REUSED",
  "## TRUTH BOUNDARY",
  "## MOBILE-FIRST RISK",
  "## HUMAN SUCCESS",
];
const hiddenAnswers = requiredHeadings.map((heading) => `${heading}\nHidden fixture answer.`).join("\n\n");
const hiddenHtmlCommentPrepend = `# HIDDEN HTML COMMENT CONTRACT\n\n<!--\n${hiddenAnswers}\n-->\n\n---\n\n${currentBrief}`;
const hiddenFencedCodePrepend = [
  "# HIDDEN FENCED CODE CONTRACT",
  "",
  "```markdown",
  hiddenAnswers,
  "```",
  "",
  "---",
  "",
  currentBrief,
].join("\n");
const renderedHeadingPrepend = `# VISIBLE MARKDOWN CONTRACT\n\n${requiredHeadings.map((heading) => `${heading}\nVisible fixture answer.`).join("\n\n")}\n\n---\n\n${currentBrief}`;
const hiddenRawHtmlPrepend = (tag, attributes = "", { close = true } = {}) => [
  `# HIDDEN RAW HTML ${tag.toUpperCase()} CONTRACT`,
  "",
  `<${tag}${attributes}>`,
  hiddenAnswers,
  ...(close ? [`</${tag}>`] : []),
  "",
  "---",
  "",
  currentBrief,
].join("\n");
const renderedHeadingAfterClosedRawHtmlPrepend = [
  "# VISIBLE MARKDOWN AFTER RAW HTML CONTRACT",
  "",
  '<PRE data-fixture="same-line">## USER ARRIVES BECAUSE\nHidden fixture answer.</PRE>',
  "",
  requiredHeadings.map((heading) => `${heading}\nVisible fixture answer.`).join("\n\n"),
  "",
  "---",
  "",
  currentBrief,
].join("\n");

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

    mkdirSync(dirname(join(directory, CONTRACT_TEST)), { recursive: true });
    copyFileSync(new URL(`../${CONTRACT_TEST}`, import.meta.url), join(directory, CONTRACT_TEST));
    git("add", CONTRACT_TEST);
    git("commit", "-qm", "install history contract");

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

const runTwoCommitCandidate = ({
  firstBrief,
  mode = "king-push",
  mainBrief = currentBrief,
  establishTestKingCheckpoint = false,
}) => {
  const directory = mkdtempSync(join(tmpdir(), "gold-policy-history-range-"));
  try {
    for (const relative of REQUIRED) {
      const source = new URL(`../${relative}`, import.meta.url);
      const destination = join(directory, relative);
      mkdirSync(dirname(destination), { recursive: true });
      copyFileSync(source, destination);
    }

    writeFileSync(join(directory, BRIEF), mainBrief, "utf8");
    const git = (...args) => {
      const result = spawnSync("git", args, { cwd: directory, encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr);
    };
    git("init", "-q");
    git("config", "user.email", "gold-contract@example.invalid");
    git("config", "user.name", "Gold contract fixture");
    git("add", ".");
    git("commit", "-qm", "main baseline");
    git("branch", "-M", "main");
    git("checkout", "-qb", "king/test");

    if (establishTestKingCheckpoint) {
      writeFileSync(join(directory, BRIEF), currentBrief, "utf8");
      git("add", BRIEF);
      git("commit", "-qm", "trusted TEST KING checkpoint");
    }

    mkdirSync(dirname(join(directory, CONTRACT_TEST)), { recursive: true });
    copyFileSync(new URL(`../${CONTRACT_TEST}`, import.meta.url), join(directory, CONTRACT_TEST));
    git("add", CONTRACT_TEST);
    git("commit", "-qm", "install history contract");

    writeFileSync(join(directory, BRIEF), firstBrief, "utf8");
    git("add", BRIEF);
    git("commit", "-qm", "brief candidate");
    writeFileSync(join(directory, "README.md"), "unrelated final commit\n", "utf8");
    git("add", "README.md");
    git("commit", "-qm", "unrelated final commit");

    return spawnSync(process.execPath, [POLICY, `--mode=${mode}`], {
      cwd: directory,
      env: {
        ...process.env,
        GITHUB_EVENT_NAME: mode === "pr-main" ? "pull_request" : "push",
        GOLD_BASE_REF: "main",
        GOLD_HEAD_REF: "king/test",
        GOLD_PR_DRAFT: "true",
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
  const result = run(legitimatePrepend);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("rejects newest contract headings hidden inside an HTML comment", () => {
  const result = run(hiddenHtmlCommentPrepend);
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /newest GOLD brief contract missing heading/i);
});

test("rejects newest contract headings hidden inside fenced Markdown code", () => {
  const result = run(hiddenFencedCodePrepend);
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /newest GOLD brief contract missing heading/i);
});

test("accepts all required rendered headings with substantive answers", () => {
  const result = run(renderedHeadingPrepend);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

for (const [tag, attributes, options] of [
  ["pre", "", {}],
  ["script", ' type="text/plain"', {}],
  ["style", "", {}],
  ["textarea", "", { close: false }],
]) {
  test(`rejects newest contract headings hidden inside a raw HTML ${tag} block`, () => {
    const result = run(hiddenRawHtmlPrepend(tag, attributes, options));
    assert.notEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stderr, /newest GOLD brief contract missing heading/i);
  });
}

test("accepts visible headings after a same-line case-insensitive raw HTML block", () => {
  const result = run(renderedHeadingAfterClosedRawHtmlPrepend);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("rejects destructive brief loss followed by an unrelated king-push commit", () => {
  const result = runTwoCommitCandidate({ firstBrief: newestContractOnly });
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /GOLD brief.*history/i);
});

test("rejects destructive brief loss followed by an unrelated pr-main commit", () => {
  const result = runTwoCommitCandidate({ firstBrief: newestContractOnly, mode: "pr-main" });
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /GOLD brief.*history/i);
});

test("accepts a legitimate multi-commit prepend when the final commit is unrelated", () => {
  const result = runTwoCommitCandidate({ firstBrief: legitimatePrepend });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("accepts TEST KING lineage when main has a divergent shorter brief", () => {
  const result = runTwoCommitCandidate({
    firstBrief: legitimatePrepend,
    mode: "pr-main",
    mainBrief: newestContractOnly,
    establishTestKingCheckpoint: true,
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
