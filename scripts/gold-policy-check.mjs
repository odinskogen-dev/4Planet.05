#!/usr/bin/env node
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
const mode = modeArg ? modeArg.slice("--mode=".length) : "quality-contract";

const REQUIRED_FILES = [
  "docs/GOLD_WORLD_CLASS_QUALITY_GATE.md",
  "docs/control/GOLD_ENFORCEMENT_MATRIX.md",
  "docs/control/GOLD_CURRENT_BRIEF.md",
  "docs/control/GOLD_PRIMITIVE_REGISTRY.md",
  "docs/control/GOLD_VISUAL_BASELINES.json",
  "docs/control/LIVE_PROMOTION_MANIFEST.json",
  "docs/control/CODE_LINEAGE_REGISTER.md",
  "docs/control/TEST_KING_DONOR_LEDGER.md",
  "docs/control/REPOSITORY_AUTHORITY_REGISTER.md",
  "AGENTS.md",
  ".github/pull_request_template.md",
];

const REQUIRED_BRIEF_HEADINGS = [
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

const PRODUCT_PREFIXES = [
  "src/",
  "public/",
  "functions/",
  "supabase/",
  "tests/e2e/",
];
const PRODUCT_FILES = new Set(["package.json", "package-lock.json", "vite.config.ts", "vite.config.js"]);

function fail(message) {
  console.error(`GOLD POLICY FAIL: ${message}`);
  process.exitCode = 1;
}

function git(args, fallback = "") {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return fallback;
  }
}

function changedFiles() {
  const explicit = process.env.GOLD_CHANGED_FILES;
  if (explicit) return explicit.split("\n").map((s) => s.trim()).filter(Boolean);

  if (process.env.GITHUB_EVENT_NAME === "pull_request") {
    const base = process.env.GOLD_BASE_REF || "origin/main";
    const out = git(["diff", "--name-only", `${base}...HEAD`]);
    if (out) return out.split("\n").filter(Boolean);
  }

  const parent = git(["rev-parse", "HEAD^"]);
  if (parent) {
    const out = git(["diff", "--name-only", parent, "HEAD"]);
    if (out) return out.split("\n").filter(Boolean);
  }
  return git(["show", "--pretty=", "--name-only", "HEAD"]).split("\n").filter(Boolean);
}

function isProductFacing(file) {
  return PRODUCT_FILES.has(file) || PRODUCT_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function validateAuthorityFiles() {
  for (const file of REQUIRED_FILES) {
    if (!fs.existsSync(file)) fail(`missing canonical enforcement file: ${file}`);
  }

  if (!fs.existsSync("docs/control/GOLD_CURRENT_BRIEF.md")) return;
  const brief = fs.readFileSync("docs/control/GOLD_CURRENT_BRIEF.md", "utf8");
  for (const heading of REQUIRED_BRIEF_HEADINGS) {
    const idx = brief.indexOf(heading);
    if (idx < 0) {
      fail(`current GOLD brief missing heading: ${heading}`);
      continue;
    }
    const after = brief.slice(idx + heading.length).split(/^## /m)[0].trim();
    if (!after) fail(`current GOLD brief has no answer under: ${heading}`);
  }

  const registry = JSON.parse(fs.readFileSync("docs/control/GOLD_VISUAL_BASELINES.json", "utf8"));
  if (!Array.isArray(registry.screens)) fail("visual baseline registry must contain screens[]");
  for (const screen of registry.screens || []) {
    if (!screen.id || !screen.file || !["CANDIDATE", "APPROVED", "RETIRED"].includes(screen.state)) {
      fail(`invalid visual baseline record: ${JSON.stringify(screen)}`);
      continue;
    }
    if (screen.state === "APPROVED") {
      if (!/^[a-f0-9]{64}$/i.test(screen.expectedSha256 || "")) {
        fail(`APPROVED visual ${screen.id} has no exact SHA-256 lock`);
      }
      if (!screen.founderDecisionRef || !String(screen.founderDecisionRef).trim()) {
        fail(`APPROVED visual ${screen.id} has no Founder decision reference`);
      }
    }
  }
}

function validateNoObsoletePublicCanon(files) {
  const runtimeFiles = files.filter((file) => file.startsWith("src/") && fs.existsSync(file) && fs.statSync(file).isFile());
  const forbidden = [
    { re: /4ntarctica/i, label: "obsolete 4NTARCTICA canon" },
    { re: /4telier/i, label: "obsolete 4TELIER canon" },
  ];
  for (const file of runtimeFiles) {
    const content = fs.readFileSync(file, "utf8");
    for (const rule of forbidden) {
      if (rule.re.test(content)) fail(`${rule.label} found in runtime file ${file}`);
    }
  }
}

function validateUserFacingChange(files) {
  const productFiles = files.filter(isProductFacing);
  if (!productFiles.length) return;

  if (!files.includes("docs/control/GOLD_CURRENT_BRIEF.md")) {
    fail(`user-facing change must update docs/control/GOLD_CURRENT_BRIEF.md in the same bounded change. Product files: ${productFiles.join(", ")}`);
  }
  validateNoObsoletePublicCanon(productFiles);
}

function readPromotionManifest() {
  return JSON.parse(fs.readFileSync("docs/control/LIVE_PROMOTION_MANIFEST.json", "utf8"));
}

function validateLivePromotion() {
  const manifest = readPromotionManifest();
  const requiredText = ["sourceBranch", "testKingSha", "priorLiveSha", "founderDecisionRef", "evidenceRef", "rollbackRef"];
  if (manifest.status !== "FOUNDER_ACCEPTED") fail(`LIVE promotion manifest status is ${manifest.status}; FOUNDER_ACCEPTED required`);
  if (manifest.sourceBranch !== "king/test") fail(`LIVE promotion source must be king/test, got ${manifest.sourceBranch}`);
  for (const key of requiredText) {
    if (!manifest[key] || !String(manifest[key]).trim()) fail(`LIVE promotion manifest missing ${key}`);
  }
  if (manifest.testKingSha && !/^[a-f0-9]{40}$/i.test(manifest.testKingSha)) fail("LIVE promotion testKingSha must be an exact 40-character commit SHA");
  if (manifest.priorLiveSha && !/^[a-f0-9]{40}$/i.test(manifest.priorLiveSha)) fail("LIVE promotion priorLiveSha must be an exact 40-character commit SHA");
}

validateAuthorityFiles();
const files = changedFiles();

if (["king-push", "pr-main", "main-push"].includes(mode)) validateUserFacingChange(files);

if (mode === "pr-main") {
  const head = process.env.GOLD_HEAD_REF || process.env.GITHUB_HEAD_REF || "";
  const draft = String(process.env.GOLD_PR_DRAFT || "false").toLowerCase() === "true";
  const hasProductDelta = files.some(isProductFacing);
  if (hasProductDelta && head !== "king/test") {
    fail(`direct LIVE product promotion from '${head || "unknown"}' is forbidden; user-facing production candidate must come from king/test`);
  }
  // PR #131 remains a TEST KING review vessel while draft. The moment a product
  // promotion is marked ready for merge, release authority must be explicit.
  if (hasProductDelta && head === "king/test" && !draft) validateLivePromotion();
}

if (mode === "main-push" && files.some(isProductFacing)) validateLivePromotion();

if (!process.exitCode) {
  console.log(`GOLD POLICY PASS: mode=${mode}; changed=${files.length}; productFacing=${files.filter(isProductFacing).length}`);
}
