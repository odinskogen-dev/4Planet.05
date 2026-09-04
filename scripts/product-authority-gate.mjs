#!/usr/bin/env node

import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "docs/control/PRODUCT_SURFACE_REGISTRY.json");
const AUTHORITY_PATH = path.join(ROOT, "docs/control/PROJECT_CANDIDATE_AUTHORITY.json");
const CONTROL_BRANCH_PREFIXES = ["control/", "ops/", "docs/"];
const NON_PRODUCT_PREFIXES = [".github/", "docs/", "scripts/", "supabase/", "functions/"];
const USER_FACING_PREFIXES = ["src/", "public/"];
const USER_FACING_ROOT_FILES = new Set(["index.html", "vite.config.ts", "package.json", "package-lock.json"]);

function die(message) {
  console.error(`PRODUCT AUTHORITY GATE: FAIL — ${message}`);
  process.exit(1);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    die(`cannot read ${path.relative(ROOT, file)}: ${error.message}`);
  }
}

function git(args, fallback = "") {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return fallback;
  }
}

function gitSucceeds(args) {
  try {
    execFileSync("git", args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function isSha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
}

const registry = readJson(REGISTRY_PATH);
const authority = readJson(AUTHORITY_PATH);

if (registry.schema_version !== "1.0") die("unsupported surface registry schema");
if (authority.schema_version !== "2.0") die("PROJECT_CANDIDATE_AUTHORITY must be schema 2.0");
if (authority.surface_registry !== "docs/control/PRODUCT_SURFACE_REGISTRY.json") die("authority registry pointer mismatch");

const heir = registry.global_heir;
if (!heir || heir.branch !== "king/test" || heir.role !== "SOLE_HEIR_INTEGRATION_LINE") {
  die("king/test must remain the sole HEIR integration line");
}
if (!isSha(heir.sha_at_activation)) die("global HEIR activation SHA missing/invalid");

const states = registry.state_law?.human_visible_states || [];
const expectedStates = ["LIVE", "HEIR", "SANDBOX", "ARCHIVED"];
if (JSON.stringify(states) !== JSON.stringify(expectedStates)) die("human-visible state model drifted");
if (registry.state_law?.max_heirs_per_product !== 1) die("max HEIR count must equal 1");
if (registry.state_law?.max_active_user_facing_sandboxes_per_product !== 1) die("max active sandbox count must equal 1");
if (registry.state_law?.newest_wins !== false) die("newest-wins must be false");
if (registry.state_law?.unknown_user_facing_lineage !== "FAIL_CLOSED") die("unknown lineage must fail closed");

const reviewPaths = new Set();
const registeredSandboxes = new Map();
for (const [product, record] of Object.entries(registry.products || {})) {
  if (!record?.live?.url || !record?.heir?.review_path || !record?.heir?.origin_path) {
    die(`${product} missing LIVE/HEIR visible-surface contract`);
  }
  const heirPath = record.heir.review_path;
  if (reviewPaths.has(`heir:${heirPath}`)) die(`duplicate HEIR review path ${heirPath}`);
  reviewPaths.add(`heir:${heirPath}`);

  const sandbox = record.sandbox;
  if (!sandbox) continue;
  if (!sandbox.branch || !isSha(sandbox.sha_at_registration) || !sandbox.review_path || !sandbox.origin_path) {
    die(`${product} sandbox missing branch/registration-SHA/review/origin identity`);
  }
  if (!sandbox.review_path.endsWith("/sandbox")) die(`${product} sandbox review path must end in /sandbox`);
  if (sandbox.live_authority !== false) die(`${product} sandbox may never carry LIVE authority`);
  if (registeredSandboxes.has(sandbox.branch)) die(`sandbox branch ${sandbox.branch} registered to multiple products`);
  registeredSandboxes.set(sandbox.branch, { product, ...sandbox });
}

const headBranch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || git(["branch", "--show-current"]);
const baseRef = process.env.GITHUB_BASE_REF || process.env.AUTHORITY_BASE_REF || "";
const eventName = process.env.GITHUB_EVENT_NAME || "local";

let changed = [];
if (baseRef) {
  const remoteBase = gitSucceeds(["rev-parse", `origin/${baseRef}`]) ? `origin/${baseRef}` : baseRef;
  const diff = git(["diff", "--name-only", `${remoteBase}...HEAD`]);
  changed = diff ? diff.split("\n").filter(Boolean) : [];
} else if (process.env.GITHUB_EVENT_BEFORE && !/^0+$/.test(process.env.GITHUB_EVENT_BEFORE)) {
  const diff = git(["diff", "--name-only", `${process.env.GITHUB_EVENT_BEFORE}...HEAD`]);
  changed = diff ? diff.split("\n").filter(Boolean) : [];
} else {
  const diff = git(["diff", "--name-only", "HEAD^...HEAD"]);
  changed = diff ? diff.split("\n").filter(Boolean) : [];
}

const userFacingChanges = changed.filter((file) =>
  USER_FACING_PREFIXES.some((prefix) => file.startsWith(prefix)) || USER_FACING_ROOT_FILES.has(file)
);
const controlOnlyChanges = changed.length > 0 && changed.every((file) => NON_PRODUCT_PREFIXES.some((prefix) => file.startsWith(prefix)));
const isControlBranch = CONTROL_BRANCH_PREFIXES.some((prefix) => headBranch.startsWith(prefix));
const isHeir = headBranch === "king/test";
const registeredSandbox = registeredSandboxes.get(headBranch);

if (userFacingChanges.length > 0 && !isHeir && !registeredSandbox) {
  die(`user-facing mutation on unregistered branch ${headBranch || "UNKNOWN"}; register the single product SANDBOX before first material mutation`);
}

if (isControlBranch && userFacingChanges.length > 0) {
  die(`control/ops/docs branch ${headBranch} may not smuggle user-facing product changes`);
}

if (registeredSandbox) {
  const heirSha = git(["rev-parse", "origin/king/test"]);
  if (!heirSha) die("cannot resolve current origin/king/test for sandbox ancestry check");
  if (!gitSucceeds(["merge-base", "--is-ancestor", heirSha, "HEAD"])) {
    die(`${registeredSandbox.product} sandbox is not proven to descend from current king/test; forward-sync the SAME registered sandbox or fail closed`);
  }
}

if (eventName === "pull_request" && userFacingChanges.length > 0 && baseRef !== "king/test") {
  die(`user-facing PR must target king/test; current base is ${baseRef || "UNKNOWN"}`);
}

console.log("PRODUCT AUTHORITY GATE: PASS");
console.log(JSON.stringify({
  headBranch,
  headSha: git(["rev-parse", "HEAD"]) || null,
  eventName,
  baseRef: baseRef || null,
  changedFiles: changed.length,
  userFacingChanges: userFacingChanges.length,
  role: isHeir ? "HEIR" : registeredSandbox ? `SANDBOX:${registeredSandbox.product}` : isControlBranch ? "CONTROL" : controlOnlyChanges ? "NON_PRODUCT_SUPPORT" : "HISTORY_OR_NON_USER_FACING",
  registeredSandboxes: [...registeredSandboxes.entries()].map(([branch, value]) => ({
    branch,
    product: value.product,
    shaAtRegistration: value.sha_at_registration
  }))
}, null, 2));
