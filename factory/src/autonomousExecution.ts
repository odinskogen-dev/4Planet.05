import type { Outcome, WorkPackage } from "./contracts";
import { qualitySystemPrompt, validateGeneratedCandidate } from "./brandContract";

const REPOSITORY = "odinskogen-dev/4Planet.05";
const OWNER = "odinskogen-dev";
const REPO = "4Planet.05";
const TEST_BRANCH = "king/test";
const DEFAULT_MODEL = "@cf/zai-org/glm-4.7-flash";
const MAX_EXISTING_FILE_BYTES = 120_000;
const MAX_AI_ATTEMPTS = 2;
const MAX_CANDIDATE_EDITS = 8;
const CHECK_POLL_ATTEMPTS = 8;
const PREVIEW_POLL_ATTEMPTS = 6;

export interface GitHubTestWriteSpec {
  kind: "GITHUB_TEST_WRITE";
  repository: typeof REPOSITORY;
  baseBranch: typeof TEST_BRANCH;
  expectedBaseSha: string;
  targetPath: string;
  brief: string;
  candidateBranch?: string;
  previewDomain?: string;
  sourceRefs?: string[];
  maxCorrectionAttempts?: number;
}

export type AutonomousWorkPackage = WorkPackage & { autonomous?: GitHubTestWriteSpec };

interface BrowserQuickActionResponse {
  ok: boolean;
  status: number;
}

interface BrowserBinding {
  quickAction(action: "snapshot", input: Record<string, unknown>): Promise<BrowserQuickActionResponse>;
}

type FactoryRuntimeEnv = Cloudflare.Env & {
  AI?: { run(model: string, input: unknown): Promise<unknown> };
  BROWSER?: BrowserBinding;
  FACTORY_GITHUB_TOKEN?: string;
  FACTORY_AI_MODEL?: string;
};

type GitHubContent = { type: string; sha: string; content?: string; encoding?: string };
type GitHubRef = { object?: { sha?: string } };
type GitHubPull = { number: number; html_url: string; draft?: boolean; head?: { sha?: string; ref?: string } };
type GitHubCheckRun = { name: string; status: string; conclusion: string | null; html_url?: string };
type GitHubChecks = { total_count: number; check_runs: GitHubCheckRun[] };
type JsonRecord = Record<string, unknown>;

type CandidateEdit = { search: string; replace: string };
type CandidatePayload =
  | { mode: "edits"; edits: CandidateEdit[]; summary: string; selfChecks: string[] }
  | { mode: "replace_file"; content: string; summary: string; selfChecks: string[] };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
const sha40 = /^[0-9a-f]{40}$/i;

function baseOutcome(pkg: WorkPackage, values: Omit<Outcome, "workPackageId" | "expected" | "completedAt">): Outcome {
  return {
    workPackageId: pkg.id,
    expected: pkg.definitionOfDone.join("; "),
    completedAt: new Date().toISOString(),
    ...values,
  };
}

function blocked(pkg: WorkPackage, reason: string, evidence: string[] = [], limitation?: string): Outcome {
  return baseOutcome(pkg, {
    status: "BLOCKED",
    evidence,
    materialDelta: reason,
    actual: reason,
    limitation,
  });
}

function toBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunk = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunk) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunk));
  }
  return btoa(binary);
}

function fromBase64Utf8(value: string): string {
  const binary = atob(value.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}

function pathAllowed(path: string, scopes: string[]): boolean {
  const clean = path.replace(/^\.\//, "").replace(/^\//, "");
  return scopes.some((scope) => {
    const allowed = scope.replace(/^\.\//, "").replace(/^\//, "").replace(/\/$/, "");
    return clean === allowed || clean.startsWith(`${allowed}/`);
  });
}

async function github<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "4PLANET-Production-Factory/1.0",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`GitHub ${response.status} ${path}: ${text.slice(0, 1200)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

async function githubMaybe<T>(token: string, path: string): Promise<{ status: number; value?: T }> {
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "4PLANET-Production-Factory/1.0",
    },
  });
  const text = await response.text();
  if (response.status === 404) return { status: 404 };
  if (!response.ok) throw new Error(`GitHub ${response.status} ${path}: ${text.slice(0, 1200)}`);
  return { status: response.status, value: (text ? JSON.parse(text) : {}) as T };
}

async function branchSha(token: string, branch: string): Promise<string> {
  const encoded = branch.split("/").map(encodeURIComponent).join("/");
  const ref = await github<GitHubRef>(token, `/git/ref/heads/${encoded}`);
  const sha = ref.object?.sha ?? "";
  if (!sha40.test(sha)) throw new Error(`GitHub branch ${branch} did not return a valid SHA`);
  return sha;
}

async function ensureCandidateBranch(token: string, branch: string, baseSha: string): Promise<void> {
  const encoded = branch.split("/").map(encodeURIComponent).join("/");
  const existing = await githubMaybe<GitHubRef>(token, `/git/ref/heads/${encoded}`);
  if (existing.status !== 404) return;
  await github(token, "/git/refs", {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
  });
}

async function readFile(token: string, path: string, ref: string): Promise<{ sha?: string; content: string }> {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const response = await githubMaybe<GitHubContent>(token, `/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`);
  if (response.status === 404) return { content: "" };
  const value = response.value;
  if (!value || value.type !== "file") throw new Error(`Target path is not a file: ${path}`);
  const content = value.content && value.encoding === "base64" ? fromBase64Utf8(value.content) : "";
  if (new TextEncoder().encode(content).byteLength > MAX_EXISTING_FILE_BYTES) throw new Error(`Target file exceeds ${MAX_EXISTING_FILE_BYTES} byte bounded context`);
  return { sha: value.sha, content };
}

function record(value: unknown): JsonRecord | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as JsonRecord : undefined;
}

function nestedRecord(parent: JsonRecord | undefined, key: string): JsonRecord | undefined {
  return parent ? record(parent[key]) : undefined;
}

export function aiText(raw: unknown): string {
  const value = record(raw);
  const choices = value?.choices;
  let candidate: unknown;
  if (Array.isArray(choices)) {
    candidate = nestedRecord(record(choices[0]), "message")?.content;
  }
  candidate ??= value?.response;
  const result = nestedRecord(value, "result");
  candidate ??= result?.response;
  candidate ??= value?.result;
  candidate ??= value?.text;
  candidate ??= value;
  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  const structured = record(candidate);
  if (structured && (structured.mode === "edits" || structured.mode === "replace_file")) {
    return JSON.stringify(structured);
  }
  throw new Error("Workers AI returned no usable text response");
}

function parseSelfChecks(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 12) : [];
}

function parseCandidate(rawText: string): CandidatePayload {
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = record(JSON.parse(cleaned));
  if (!parsed) throw new Error("AI candidate JSON must be an object");
  const summary = typeof parsed.summary === "string" ? parsed.summary : "Generated bounded TEST candidate.";
  const selfChecks = parseSelfChecks(parsed.selfChecks);

  if (parsed.mode === "edits") {
    if (!Array.isArray(parsed.edits) || parsed.edits.length === 0 || parsed.edits.length > MAX_CANDIDATE_EDITS) {
      throw new Error(`AI candidate must contain 1-${MAX_CANDIDATE_EDITS} bounded edits`);
    }
    const edits = parsed.edits.map((rawEdit, index): CandidateEdit => {
      const edit = record(rawEdit);
      if (!edit || typeof edit.search !== "string" || typeof edit.replace !== "string" || !edit.search) {
        throw new Error(`AI candidate edit ${index + 1} is invalid`);
      }
      return { search: edit.search, replace: edit.replace };
    });
    return { mode: "edits", edits, summary, selfChecks };
  }

  if (parsed.mode === "replace_file" && typeof parsed.content === "string") {
    return { mode: "replace_file", content: parsed.content, summary, selfChecks };
  }

  throw new Error("AI candidate must use mode=edits for existing files or mode=replace_file for new files");
}

function applyCandidate(candidate: CandidatePayload, existingContent: string): string {
  if (candidate.mode === "replace_file") {
    if (existingContent) throw new Error("Full-file replacement is forbidden for an existing target; use bounded exact edits");
    return candidate.content;
  }
  if (!existingContent) throw new Error("Bounded edit mode cannot create an empty/new target file");

  let content = existingContent;
  for (const [index, edit] of candidate.edits.entries()) {
    const first = content.indexOf(edit.search);
    if (first < 0) throw new Error(`AI edit ${index + 1} search text was not found in current candidate`);
    if (content.indexOf(edit.search, first + edit.search.length) >= 0) {
      throw new Error(`AI edit ${index + 1} search text is not unique; refusing ambiguous mutation`);
    }
    content = `${content.slice(0, first)}${edit.replace}${content.slice(first + edit.search.length)}`;
  }
  return content;
}

async function generateCandidate(
  env: FactoryRuntimeEnv,
  pkg: WorkPackage,
  spec: GitHubTestWriteSpec,
  existingContent: string,
  correctionContext?: string,
): Promise<{ content: string; summary: string; selfChecks: string[]; model: string }> {
  if (!env.AI) throw new Error("Workers AI binding is not configured");
  const model = env.FACTORY_AI_MODEL || DEFAULT_MODEL;
  const existing = Boolean(existingContent);
  const outputContract = existing
    ? `Return strict JSON only: {"mode":"edits","edits":[{"search":"EXACT UNIQUE CURRENT TEXT","replace":"REPLACEMENT TEXT"}],"summary":"short change summary","selfChecks":["check"]}. Use at most ${MAX_CANDIDATE_EDITS} surgical edits. Never return the complete file.`
    : "Return strict JSON only: {\"mode\":\"replace_file\",\"content\":\"COMPLETE NEW FILE CONTENT\",\"summary\":\"short change summary\",\"selfChecks\":[\"check\"]}.";
  const prompt = [
    qualitySystemPrompt(),
    "\nTASK AUTHORITY / WORK PACKAGE:",
    `Project: ${pkg.projectId}`,
    `Task: ${pkg.title}`,
    `Goal link: ${pkg.goalLink}`,
    `Gap to close: ${pkg.gapClosed}`,
    `Brief: ${spec.brief}`,
    `Target file: ${spec.targetPath}`,
    `Deliverables: ${pkg.deliverables.join(" | ")}`,
    `Definition of Done: ${pkg.definitionOfDone.join(" | ")}`,
    `Required evidence: ${pkg.requiredEvidence.join(" | ")}`,
    `Source refs: ${(spec.sourceRefs ?? []).join(" | ") || "NONE SUPPLIED — do not invent source facts"}`,
    correctionContext ? `Previous candidate failed these gates: ${correctionContext}` : "This is the first candidate attempt.",
    "\nCURRENT FILE CONTENT (empty means create a new file):",
    existingContent || "<EMPTY>",
    "\nOUTPUT CONTRACT:",
    outputContract,
    "For edit mode, every search string must be copied exactly from CURRENT FILE CONTENT and must identify exactly one location. Make the smallest material change that closes the stated gap. Preserve unrelated working behaviour.",
    "Never add LIVE release, external send, payment, Canon promotion or unsupported ecological/scientific claims.",
  ].join("\n");

  const raw = await env.AI.run(model, {
    messages: [
      { role: "system", content: "You are a bounded senior product engineer inside 4PLANET Production Factory. Follow the machine-readable quality contract exactly." },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
    reasoning_effort: "low",
    response_format: { type: "json_object" },
    max_completion_tokens: 2400,
  });
  const candidate = parseCandidate(aiText(raw));
  const content = applyCandidate(candidate, existingContent);
  const validation = validateGeneratedCandidate(content);
  if (!validation.ok) throw new Error(`Generated candidate failed 4PLANET safety/truth preflight: ${validation.reasons.join(", ")}`);
  return { content, summary: candidate.summary, selfChecks: candidate.selfChecks, model };
}

async function writeFile(token: string, branch: string, path: string, content: string, currentSha: string | undefined, message: string): Promise<string> {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const result = await github<{ commit?: { sha?: string } }>(token, `/contents/${encodedPath}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: toBase64Utf8(content),
      branch,
      ...(currentSha ? { sha: currentSha } : {}),
    }),
  });
  const sha = result.commit?.sha ?? "";
  if (!sha40.test(sha)) throw new Error("GitHub write did not return a valid commit SHA");
  return sha;
}

async function ensureDraftPullRequest(token: string, branch: string, pkg: WorkPackage): Promise<GitHubPull> {
  const existing = await github<GitHubPull[]>(token, `/pulls?state=open&head=${encodeURIComponent(`${OWNER}:${branch}`)}&base=${encodeURIComponent(TEST_BRANCH)}`);
  if (existing[0]) return existing[0];
  return github<GitHubPull>(token, "/pulls", {
    method: "POST",
    body: JSON.stringify({
      title: `FACTORY CANDIDATE — ${pkg.title}`.slice(0, 120),
      head: branch,
      base: TEST_BRANCH,
      draft: true,
      body: [
        "## 4PLANET FACTORY — AUTONOMOUS TEST CANDIDATE",
        "",
        `Work package: \`${pkg.id}\``,
        `Project: \`${pkg.projectId}\``,
        "",
        "Factory-generated candidate only. Human Gold is NOT claimed.",
        "No LIVE release, Canon promotion, external send or payment authority.",
      ].join("\n"),
    }),
  });
}

async function checkState(token: string, commitSha: string): Promise<{ state: "PENDING" | "PASS" | "FAIL"; evidence: string[]; failures: string[] }> {
  const checks = await github<GitHubChecks>(token, `/commits/${commitSha}/check-runs?per_page=100`);
  if (checks.total_count === 0) return { state: "PENDING", evidence: ["GitHub checks not registered yet"], failures: [] };
  const pending = checks.check_runs.filter((check) => check.status !== "completed");
  const failures = checks.check_runs.filter((check) => check.status === "completed" && !["success", "neutral", "skipped"].includes(check.conclusion ?? ""));
  const evidence = checks.check_runs.map((check) => `${check.name}:${check.status}:${check.conclusion ?? "pending"}`);
  if (failures.length > 0) return { state: "FAIL", evidence, failures: failures.map((check) => `${check.name}=${check.conclusion}`) };
  if (pending.length > 0) return { state: "PENDING", evidence, failures: [] };
  return { state: "PASS", evidence, failures: [] };
}

async function waitForChecks(token: string, commitSha: string) {
  let latest = await checkState(token, commitSha);
  for (let attempt = 1; attempt < CHECK_POLL_ATTEMPTS && latest.state === "PENDING"; attempt += 1) {
    await sleep(10_000);
    latest = await checkState(token, commitSha);
  }
  return latest;
}

function previewUrl(branch: string, domain = "4planet-05.pages.dev") {
  const subdomain = branch.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  return `https://${subdomain}.${domain}`;
}

async function waitForBrowserQa(env: FactoryRuntimeEnv, url: string): Promise<{ ok: boolean; evidence: string[] }> {
  const browser = env.BROWSER;
  if (!browser?.quickAction) return { ok: false, evidence: ["Cloudflare Browser binding unavailable"] };
  let last = "no response";
  for (let attempt = 1; attempt <= PREVIEW_POLL_ATTEMPTS; attempt += 1) {
    try {
      const response = await browser.quickAction("snapshot", {
        url,
        formats: ["markdown", "accessibilityTree"],
        viewport: { width: 390, height: 844, deviceScaleFactor: 1 },
        gotoOptions: { waitUntil: "networkidle2", timeout: 30_000 },
      });
      last = `HTTP ${response.status}`;
      if (response.ok) {
        return { ok: true, evidence: [`preview PASS ${url}`, "viewport 390x844", "accessibility-tree captured", `attempt ${attempt}`] };
      }
    } catch (error) {
      last = error instanceof Error ? error.message : "browser snapshot failed";
    }
    if (attempt < PREVIEW_POLL_ATTEMPTS) await sleep(10_000);
  }
  return { ok: false, evidence: [`preview FAIL ${url}`, last] };
}

function pendingCandidateOutcome(pkg: WorkPackage, evidence: string[], branch: string, commitSha: string): Outcome {
  return baseOutcome(pkg, {
    status: "CORRECT",
    evidence,
    materialDelta: "Factory produced a bounded real TEST candidate; CI is non-terminal, so no speculative corrective mutation was attempted.",
    actual: `Candidate remains isolated on ${branch}; commit ${commitSha}; registered checks are still pending.`,
    limitation: "Workflow must durably re-observe the same candidate. Pending evidence must never be treated as failure, completion or a trigger for a new AI write.",
  });
}

export async function executeAutonomousPackage(envInput: Cloudflare.Env, pkgInput: WorkPackage): Promise<Outcome | undefined> {
  const pkg = pkgInput as AutonomousWorkPackage;
  const spec = pkg.autonomous;
  if (!spec) return undefined;
  if (spec.repository !== REPOSITORY || spec.baseBranch !== TEST_BRANCH) {
    return blocked(pkg, "Autonomous code execution is restricted to 4Planet.05 → king/test candidates.");
  }
  if (!sha40.test(spec.expectedBaseSha)) return blocked(pkg, "Autonomous package requires an exact 40-character TEST KING base SHA.");
  if (!pathAllowed(spec.targetPath, pkg.writeScopes)) {
    return blocked(pkg, `Target path ${spec.targetPath} is outside declared work-package write scopes.`);
  }

  const env = envInput as FactoryRuntimeEnv;
  const token = env.FACTORY_GITHUB_TOKEN?.trim();
  if (!token) {
    return blocked(
      pkg,
      "Permanent GitHub TEST-write credential is not configured.",
      ["FACTORY_GITHUB_TOKEN=MISSING", "No repository write attempted"],
      "Factory remains fail-closed until a least-privilege credential is stored as a Worker secret.",
    );
  }
  if (!env.AI) return blocked(pkg, "Workers AI binding is not configured; no generative production attempted.");

  try {
    const currentBaseSha = await branchSha(token, TEST_BRANCH);
    if (currentBaseSha !== spec.expectedBaseSha) {
      return blocked(pkg, "TEST KING moved after work-package approval; stale-base execution refused.", [
        `expected-base ${spec.expectedBaseSha}`,
        `current-base ${currentBaseSha}`,
      ]);
    }

    const branch = spec.candidateBranch || `factory-candidate-${slug(pkg.id)}`;
    if (!/^factory-candidate-[a-z0-9-]+$/.test(branch)) return blocked(pkg, "Candidate branch is outside the Factory TEST namespace.");
    await ensureCandidateBranch(token, branch, currentBaseSha);

    let candidateHeadSha = await branchSha(token, branch);
    let target = await readFile(token, spec.targetPath, branch);
    const maxAttempts = Math.max(1, Math.min(spec.maxCorrectionAttempts ?? MAX_AI_ATTEMPTS, MAX_AI_ATTEMPTS));
    const evidence: string[] = [
      `TEST KING base ${currentBaseSha}`,
      `candidate branch ${branch}`,
      `target ${spec.targetPath}`,
      "LIVE authority=false",
      "Human Gold candidate only",
    ];
    let correctionContext: string | undefined;
    let finalCommit = "";
    let model = "";
    let pr: GitHubPull | undefined;

    if (candidateHeadSha !== currentBaseSha) {
      finalCommit = candidateHeadSha;
      pr = await ensureDraftPullRequest(token, branch, pkg);
      evidence.push(`REOBSERVE existing candidate commit ${candidateHeadSha}`, `draft PR ${pr.html_url}`);
      const checks = await checkState(token, candidateHeadSha);
      evidence.push(...checks.evidence.map((item) => `CHECK ${item}`));
      if (checks.state === "PENDING") return pendingCandidateOutcome(pkg, evidence, branch, candidateHeadSha);
      if (checks.state === "PASS") {
        const preview = previewUrl(branch, spec.previewDomain);
        const browserQa = await waitForBrowserQa(env, preview);
        evidence.push(...browserQa.evidence);
        if (browserQa.ok) {
          return baseOutcome(pkg, {
            status: "ACCEPTED",
            evidence,
            materialDelta: "Re-observed the existing bounded TEST candidate after durable CI wait; registered GitHub checks and rendered mobile Browser QA passed. Candidate remains draft and Founder-gated.",
            actual: `PR ${pr.html_url}; commit ${candidateHeadSha}; preview ${preview}; no additional AI mutation.`,
            limitation: "Technical/browser acceptance does not constitute Human Gold, scientific truth approval, Canon promotion or LIVE release.",
          });
        }
        correctionContext = `Existing candidate passed GitHub checks but mobile preview Browser QA failed: ${browserQa.evidence.join(" | ")}`;
      } else {
        correctionContext = `Existing candidate checks failed: ${checks.failures.join(" | ")}`;
      }
      evidence.push(`REOBSERVE terminal gate requires bounded correction: ${correctionContext}`);
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const generated = await generateCandidate(env, pkg, spec, target.content, correctionContext);
      model = generated.model;
      finalCommit = await writeFile(
        token,
        branch,
        spec.targetPath,
        generated.content,
        target.sha,
        `Factory candidate: ${pkg.title} [attempt ${attempt}]`,
      );
      candidateHeadSha = finalCommit;
      evidence.push(`AI ${model} attempt ${attempt}`, `commit ${finalCommit}`, `self-checks ${generated.selfChecks.join(" | ") || "none"}`);
      pr = await ensureDraftPullRequest(token, branch, pkg);
      evidence.push(`draft PR ${pr.html_url}`);

      const checks = await waitForChecks(token, finalCommit);
      evidence.push(...checks.evidence.map((item) => `CHECK ${item}`));
      if (checks.state === "PASS") {
        const preview = previewUrl(branch, spec.previewDomain);
        const browserQa = await waitForBrowserQa(env, preview);
        evidence.push(...browserQa.evidence);
        if (browserQa.ok) {
          return baseOutcome(pkg, {
            status: "ACCEPTED",
            evidence,
            materialDelta: "Produced a bounded real TEST candidate from current TEST KING, passed registered GitHub checks and rendered mobile Browser QA. Candidate remains draft and Founder-gated.",
            actual: `PR ${pr.html_url}; commit ${finalCommit}; preview ${preview}; model ${model}; attempts ${attempt}.`,
            limitation: "Technical/browser acceptance does not constitute Human Gold, scientific truth approval, Canon promotion or LIVE release.",
          });
        }
        correctionContext = `GitHub checks passed but mobile preview Browser QA failed: ${browserQa.evidence.join(" | ")}`;
      } else if (checks.state === "FAIL") {
        correctionContext = `GitHub candidate checks failed: ${checks.failures.join(" | ")}`;
      } else {
        return pendingCandidateOutcome(pkg, evidence, branch, finalCommit);
      }

      if (attempt < maxAttempts) {
        target = await readFile(token, spec.targetPath, branch);
        evidence.push(`CORRECTION LOOP ${attempt} → ${attempt + 1}: ${correctionContext}`);
      }
    }

    return baseOutcome(pkg, {
      status: "CORRECT",
      evidence,
      materialDelta: "Factory produced a real TEST candidate but bounded autonomous correction did not reach all acceptance gates.",
      actual: `Candidate remains isolated on ${spec.candidateBranch || `factory-candidate-${slug(pkg.id)}`}; last commit ${finalCommit || "UNKNOWN"}; ${correctionContext ?? "quality gate incomplete"}`,
      limitation: "No merge or LIVE release is permitted. Founder/AXE review is required only after bounded correction attempts are exhausted.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown autonomous execution failure";
    return blocked(pkg, `Autonomous TEST execution failed closed: ${message}`, ["No LIVE action possible"]);
  }
}
