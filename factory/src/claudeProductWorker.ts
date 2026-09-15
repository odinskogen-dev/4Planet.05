import type { ClaudeProductSpecialistSpec, Outcome, WorkPackage } from "./contracts";

const OWNER = "odinskogen-dev";
const REPO = "4Planet.05";
const TEST_BRANCH = "king/test";
const CLAUDE_BRANCH = "factory/claude-product-worker-01";
const QUEUE_PATH = "docs/claude/queue/CURRENT.md";
const RESULT_PATH = "docs/claude/results/LATEST.md";
const CODE_ORDER_DIR = "docs/claude/code-work-orders";
const CODE_STATUS_DIR = "docs/claude/code-status";
const CODE_RESULT_DIR = "docs/claude/candidate-results";
const CODE_CANDIDATE_PREFIX = "factory/claude-code";
const MAX_RESULT_CHARS = 24_000;

export type ClaudeRoutedWorkPackage = WorkPackage & {
  specialist: ClaudeProductSpecialistSpec;
};

type FactoryClaudeEnv = Cloudflare.Env & {
  FACTORY_GITHUB_TOKEN?: string;
};

type GitHubContent = {
  type: string;
  sha: string;
  content?: string;
  encoding?: string;
};

type GitHubWrite = {
  commit?: { sha?: string };
};

type GitHubRef = {
  object?: { sha?: string };
};

const sha40 = /^[0-9a-f]{40}$/i;
const safeId = /^[A-Za-z0-9._-]+$/;

function baseOutcome(
  pkg: WorkPackage,
  values: Omit<Outcome, "workPackageId" | "expected" | "completedAt">,
): Outcome {
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

function pending(pkg: WorkPackage, reason: string, evidence: string[] = []): Outcome {
  return baseOutcome(pkg, {
    status: "CORRECT",
    evidence,
    materialDelta: reason,
    actual: `Claude specialist result is still pending: ${reason}`,
    limitation: "CLAUDE_SPECIALIST_PENDING: Factory Workflow must durably re-observe the same work package; do not redispatch a duplicate job.",
  });
}

function capacityPaused(pkg: WorkPackage, reason: string, retryAfter: string, evidence: string[] = []): Outcome {
  return baseOutcome(pkg, {
    status: "CORRECT",
    evidence: [...evidence, `CLAUDE_RETRY_AFTER=${retryAfter}`],
    materialDelta: reason,
    actual: `Claude specialist provider capacity is paused: ${reason}`,
    limitation: "CLAUDE_PROVIDER_CAPACITY_PAUSED: preserve the exact work package and durably re-observe it after the retry window; do not fail, duplicate, broaden, or spend to bypass subscription capacity.",
  });
}

function acceptedReview(pkg: WorkPackage, result: string): Outcome {
  const bounded = result.trim().slice(0, MAX_RESULT_CHARS);
  return baseOutcome(pkg, {
    status: "ACCEPTED",
    evidence: [
      `CLAUDE_WORK_ORDER=${pkg.id}`,
      `CLAUDE_BRANCH=${CLAUDE_BRANCH}`,
      `CLAUDE_RESULT=${RESULT_PATH}`,
      "CLAUDE_AUTHORITY=REVIEW_ONLY",
    ],
    materialDelta: `Claude Product/Interface Worker completed governed review ${pkg.id}.`,
    actual: bounded,
    limitation: result.length > MAX_RESULT_CHARS
      ? `Claude result was bounded to ${MAX_RESULT_CHARS} characters in the Factory outcome; full evidence remains in ${RESULT_PATH}.`
      : "Claude result is advisory/review evidence only; no LIVE, merge, Canon, spend or external-release authority was granted.",
  });
}

function acceptedCodeCandidate(pkg: WorkPackage, result: string, candidateBranch: string): Outcome {
  const bounded = result.trim().slice(0, MAX_RESULT_CHARS);
  return baseOutcome(pkg, {
    status: "ACCEPTED",
    evidence: [
      `CLAUDE_WORK_ORDER=${pkg.id}`,
      `CLAUDE_CANDIDATE_BRANCH=${candidateBranch}`,
      `CLAUDE_RESULT=${CODE_RESULT_DIR}/${pkg.id}.md`,
      "CLAUDE_AUTHORITY=BOUNDED_CODE_CANDIDATE_ONLY",
      "CLAUDE_VALIDATION=CONTROL_PLANE_ENFORCED",
    ],
    materialDelta: `Claude Product/Interface Worker produced a governed bounded-code candidate for ${pkg.id}.`,
    actual: bounded,
    limitation: result.length > MAX_RESULT_CHARS
      ? `Claude candidate result was bounded to ${MAX_RESULT_CHARS} characters in the Factory outcome; full evidence remains on ${candidateBranch}. No TEST KING or LIVE integration is implied.`
      : "ACCEPTED means the bounded specialist candidate completed its declared machine validation only. TEST KING convergence, Human Gold adjudication, Founder visual judgement where required, LIVE, Canon, spend and external release remain separately gated.",
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

function encodedPath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
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
  if (!response.ok) throw new Error(`GitHub ${response.status} ${path}: ${text.slice(0, 1000)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

async function readFileAtBranch(token: string, path: string, branch: string): Promise<{ sha?: string; content: string }> {
  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedPath(path)}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
        "user-agent": "4PLANET-Production-Factory/1.0",
      },
    },
  );
  if (response.status === 404) return { content: "" };
  const text = await response.text();
  if (!response.ok) throw new Error(`GitHub ${response.status} read ${path}@${branch}: ${text.slice(0, 1000)}`);
  const value = JSON.parse(text) as GitHubContent;
  if (value.type !== "file") throw new Error(`Claude integration path is not a file: ${path}@${branch}`);
  return {
    sha: value.sha,
    content: value.content && value.encoding === "base64" ? fromBase64Utf8(value.content) : "",
  };
}

async function readBranchFile(token: string, path: string): Promise<{ sha?: string; content: string }> {
  return readFileAtBranch(token, path, CLAUDE_BRANCH);
}

async function readBranchHeadSha(token: string, branch: string): Promise<string> {
  const ref = await github<GitHubRef>(token, `/git/ref/heads/${encodedPath(branch)}`);
  const sha = ref.object?.sha ?? "";
  if (!sha40.test(sha)) throw new Error(`GitHub branch ${branch} did not resolve to a valid commit SHA`);
  return sha;
}

async function writeControlFile(
  token: string,
  path: string,
  content: string,
  message: string,
  currentSha?: string,
): Promise<string> {
  const result = await github<GitHubWrite>(token, `/contents/${encodedPath(path)}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: toBase64Utf8(content),
      branch: CLAUDE_BRANCH,
      ...(currentSha ? { sha: currentSha } : {}),
    }),
  });
  const commitSha = result.commit?.sha ?? "";
  if (!sha40.test(commitSha)) throw new Error(`Claude control write did not return a valid GitHub commit SHA for ${path}`);
  return commitSha;
}

async function writeQueue(token: string, content: string, currentSha?: string): Promise<string> {
  return writeControlFile(
    token,
    QUEUE_PATH,
    content,
    `dispatch(factory): Claude Product Worker ${extractWorkOrderId(content) ?? "unknown"}`,
    currentSha,
  );
}

function scalar(markdown: string, key: string): string | undefined {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^${escaped}:\\s*(.+?)\\s*$`, "m"));
  return match?.[1]?.trim();
}

export function extractWorkOrderId(markdown: string): string | undefined {
  const match = markdown.match(/^id:\s*([A-Za-z0-9._-]+)\s*$/m);
  return match?.[1];
}

export function extractResultWorkOrderId(markdown: string): string | undefined {
  const match = markdown.match(/^work_order_id:\s*([A-Za-z0-9._-]+)\s*$/m);
  return match?.[1];
}

export function extractClaudeStatus(markdown: string): string | undefined {
  return scalar(markdown, "status");
}

export function extractDispatchAttempt(markdown: string): number {
  const raw = scalar(markdown, "dispatch_attempt");
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

export function extractRetryAfter(markdown: string): string | undefined {
  return scalar(markdown, "retry_after");
}

function withDispatchAttempt(markdown: string, attempt: number): string {
  if (/^dispatch_attempt:/m.test(markdown)) {
    return markdown.replace(/^dispatch_attempt:\s*.*$/m, `dispatch_attempt: ${attempt}`);
  }
  if (/^id:/m.test(markdown)) {
    return markdown.replace(/^(id:\s*[^\n]+)$/m, `$1\ndispatch_attempt: ${attempt}`);
  }
  return `dispatch_attempt: ${attempt}\n${markdown}`;
}

function withRetryRequestedAt(markdown: string): string {
  const value = new Date().toISOString();
  if (/^retry_requested_at:/m.test(markdown)) {
    return markdown.replace(/^retry_requested_at:\s*.*$/m, `retry_requested_at: ${value}`);
  }
  return `${markdown.trimEnd()}\nretry_requested_at: ${value}\n`;
}

function retryIsDue(retryAfter: string | undefined): boolean {
  if (!retryAfter) return false;
  const millis = Date.parse(retryAfter);
  return Number.isFinite(millis) && Date.now() >= millis;
}

export function isClaudeProductWorkPackage(pkg: WorkPackage): pkg is ClaudeRoutedWorkPackage {
  const spec = pkg.specialist;
  return pkg.section === "PRODUCT_DESIGN"
    && spec?.provider === "CLAUDE"
    && spec.role === "PRODUCT_INTERFACE"
    && (spec.mode === "REVIEW_ONLY" || spec.mode === "BOUNDED_CODE");
}

function bulletList(values: string[], fallback: string): string {
  return values.length > 0 ? values.map((value) => `- ${value}`).join("\n") : `- ${fallback}`;
}

export function buildClaudeWorkOrder(pkg: ClaudeRoutedWorkPackage): string {
  const spec = pkg.specialist;
  return `# CLAUDE FACTORY WORK ORDER\n\nid: ${pkg.id}\ndispatch_attempt: 1\nmode: REVIEW_ONLY\nowner: 4PLANET Production Factory / AXE\nworker_role: PRODUCT_INTERFACE\npriority: ${pkg.priority}\nproject_id: ${pkg.projectId}\n\n## Goal\n\n${pkg.title}\n\n## Goal link\n\n${pkg.goalLink}\n\n## Gap to close\n\n${pkg.gapClosed}\n\n## Deliverables\n\n${bulletList(pkg.deliverables, "No deliverables supplied — mark UNKNOWN rather than inventing.")}\n\n## Definition of done\n\n${bulletList(pkg.definitionOfDone, "No definition supplied — fail closed.")}\n\n## Required evidence\n\n${bulletList(pkg.requiredEvidence, "Repository evidence and governed current context.")}\n\n## Source refs\n\n${bulletList(spec.sourceRefs ?? [], "No additional source refs supplied; do not invent source facts.")}\n\n## Authority\n\nREAD / REVIEW ONLY. No repository mutation. No branch creation. No merge. No LIVE. No Canon promotion. No external outreach. No spend.\n\n## MUST NOT LOSE\n\n- one existing 4PLANET Production Factory; no parallel Claude factory\n- TEST KING remains the integration receiver\n- BRAIN / governed context remains programme authority\n- Founder release gates remain intact\n- active write scopes must not be duplicated\n- distinguish OBSERVED / INFERRED / PROPOSED / UNKNOWN where material\n\n## Return contract\n\nReturn a compact Factory-ingestible review that directly closes the stated gap. Include: STATUS, MATERIAL FINDINGS, RECOMMENDED ACTION, MUST-NOT-LOSE, RISKS, UNKNOWN. Do not require Founder reconstruction.\n`;
}

export function buildClaudeCodeWorkOrder(pkg: ClaudeRoutedWorkPackage): string {
  const spec = pkg.specialist;
  const baseSha = spec.baseSha ?? pkg.run?.expectedBaseSha ?? "";
  const testProfile = spec.testProfile ?? "PRODUCT_UI";
  const model = spec.model ?? "claude-opus-5";
  const scopes = pkg.writeScopes.map((scope) => `write_scope: ${scope}`).join("\n");
  const preserve = pkg.preservation?.mustNotLose ?? [];
  return `# CLAUDE BOUNDED PRODUCT BUILD\n\nid: ${pkg.id}\ndispatch_attempt: 1\nbase_sha: ${baseSha}\ntest_profile: ${testProfile}\nmodel: ${model}\n${scopes}\n\nstatus: BOUNDED_FACTORY_CANDIDATE_ONLY\nowner: AXE / 4PLANET Production Factory\nproject_id: ${pkg.projectId}\npriority: ${pkg.priority}\n\n## Goal\n\n${pkg.title}\n\n## Goal link\n\n${pkg.goalLink}\n\n## Gap to close\n\n${pkg.gapClosed}\n\n## Deliverables\n\n${bulletList(pkg.deliverables, "No deliverables supplied — fail closed rather than inventing output.")}\n\n## Definition of done\n\n${bulletList(pkg.definitionOfDone, "No definition supplied — fail closed.")}\n\n## Required evidence\n\n${bulletList(pkg.requiredEvidence, "Exact diff + declared validation evidence.")}\n\n## Source refs\n\n${bulletList(spec.sourceRefs ?? [], "No additional source refs supplied; repository truth and Product + Brand Core govern.")}\n\n## MUST NOT LOSE\n\n${bulletList(preserve, "Existing accepted product behaviour, truth/source boundaries and TEST KING lineage.")}\n\n## Authority\n\nBOUNDED CODE CANDIDATE ONLY. Edit only declared write_scope paths. No dependency/workflow/secret mutation. No merge. No TEST KING mutation. No LIVE. No Canon promotion. No external outreach. No spend.\n\n## Product judgement\n\nUse independent Product/Interface judgement inside the goal, truth, write-scope and MUST-NOT-LOSE boundaries. Reject or simplify a weak implementation hypothesis rather than expanding authority.\n\n## Return\n\nReturn a compact implementation handoff: CHANGED, UNCHANGED, TRUTH/PRODUCT DECISIONS, LIMITATIONS, and what remains separately gated.\n`;
}

async function resumeReviewAfterCapacity(
  token: string,
  pkg: WorkPackage,
  queue: { sha?: string; content: string },
  resultContent: string,
): Promise<Outcome> {
  const retryAfter = extractRetryAfter(resultContent);
  const resultAttempt = extractDispatchAttempt(resultContent);
  const queueAttempt = extractDispatchAttempt(queue.content);

  if (queueAttempt > resultAttempt) {
    return pending(pkg, `provider-capacity retry attempt ${queueAttempt} is already dispatched.`, [
      `CLAUDE_DISPATCH_ATTEMPT=${queueAttempt}`,
      "No duplicate retry attempted",
    ]);
  }
  if (!retryAfter) {
    return blocked(pkg, "CLAUDE_CAPACITY_STATE_INVALID: capacity pause omitted retry_after.", ["No retry attempted"]);
  }
  if (!retryIsDue(retryAfter)) {
    return capacityPaused(pkg, `subscription/session capacity unavailable for ${pkg.id}.`, retryAfter, [
      `CLAUDE_DISPATCH_ATTEMPT=${resultAttempt}`,
      "Same work order preserved",
    ]);
  }

  const nextAttempt = Math.max(queueAttempt, resultAttempt) + 1;
  const retryOrder = withRetryRequestedAt(withDispatchAttempt(queue.content, nextAttempt));
  const commitSha = await writeQueue(token, retryOrder, queue.sha);
  return pending(pkg, `provider-capacity retry attempt ${nextAttempt} dispatched at ${commitSha}.`, [
    `CLAUDE_DISPATCH_ATTEMPT=${nextAttempt}`,
    `CLAUDE_DISPATCH_SHA=${commitSha}`,
    "Same governed work order preserved",
  ]);
}

async function executeClaudeReview(token: string, pkg: ClaudeRoutedWorkPackage): Promise<Outcome> {
  const result = await readBranchFile(token, RESULT_PATH);
  const resultId = extractResultWorkOrderId(result.content);
  const queue = await readBranchFile(token, QUEUE_PATH);
  const queuedId = extractWorkOrderId(queue.content);

  if (resultId === pkg.id) {
    if (extractClaudeStatus(result.content) === "CAPACITY_PAUSED") {
      return resumeReviewAfterCapacity(token, pkg, queue, result.content);
    }
    return acceptedReview(pkg, result.content);
  }

  if (queuedId === pkg.id) {
    return pending(pkg, `work order ${pkg.id} is dispatched and awaiting correlated Claude result.`, [
      `CLAUDE_QUEUE=${QUEUE_PATH}`,
      `CLAUDE_WORK_ORDER=${pkg.id}`,
      `CLAUDE_DISPATCH_ATTEMPT=${extractDispatchAttempt(queue.content)}`,
    ]);
  }

  if (queuedId) {
    const completedQueuedId = extractResultWorkOrderId(result.content);
    const completedQueuedStatus = extractClaudeStatus(result.content);
    if (completedQueuedId !== queuedId || completedQueuedStatus === "CAPACITY_PAUSED") {
      return pending(pkg, `single-flight Claude review queue is occupied by ${queuedId}.`, [
        `CLAUDE_ACTIVE_WORK_ORDER=${queuedId}`,
        "No overwrite attempted",
      ]);
    }
  }

  const order = buildClaudeWorkOrder(pkg);
  const commitSha = await writeQueue(token, order, queue.sha);
  return pending(pkg, `work order ${pkg.id} dispatched at ${commitSha}.`, [
    `CLAUDE_DISPATCH_SHA=${commitSha}`,
    `CLAUDE_QUEUE=${QUEUE_PATH}`,
    "CLAUDE_AUTHORITY=REVIEW_ONLY",
  ]);
}

async function executeClaudeCode(token: string, pkg: ClaudeRoutedWorkPackage): Promise<Outcome> {
  if (!safeId.test(pkg.id)) return blocked(pkg, `CLAUDE_CODE_INVALID_ID: ${pkg.id}`);
  if (pkg.writeScopes.length === 0) {
    return blocked(pkg, "CLAUDE_CODE_NO_WRITE_SCOPE: bounded code requires at least one explicit write scope.");
  }
  const spec = pkg.specialist;
  const baseSha = spec.baseSha ?? pkg.run?.expectedBaseSha ?? "";
  if (!sha40.test(baseSha)) {
    return blocked(pkg, "CLAUDE_CODE_BASE_SHA_REQUIRED: bounded code requires an exact 40-character TEST KING base SHA.");
  }

  const currentTestSha = await readBranchHeadSha(token, TEST_BRANCH);
  if (currentTestSha !== baseSha) {
    return blocked(
      pkg,
      `CLAUDE_CODE_STALE_BASE: declared base ${baseSha} is not current TEST KING ${currentTestSha}.`,
      [`TEST_KING_CURRENT=${currentTestSha}`, `CLAUDE_DECLARED_BASE=${baseSha}`],
      "Recompile the work package against current TEST KING and re-run Zero Loss / overlap checks before dispatch.",
    );
  }

  const candidateBranch = `${CODE_CANDIDATE_PREFIX}/${pkg.id}`;
  const resultPath = `${CODE_RESULT_DIR}/${pkg.id}.md`;
  const candidateResult = await readFileAtBranch(token, resultPath, candidateBranch);
  if (extractResultWorkOrderId(candidateResult.content) === pkg.id && extractClaudeStatus(candidateResult.content) !== "CAPACITY_PAUSED") {
    return acceptedCodeCandidate(pkg, candidateResult.content, candidateBranch);
  }

  const statusPath = `${CODE_STATUS_DIR}/${pkg.id}.md`;
  const status = await readBranchFile(token, statusPath);
  const orderPath = `${CODE_ORDER_DIR}/${pkg.id}.md`;
  const order = await readBranchFile(token, orderPath);

  if (extractResultWorkOrderId(status.content) === pkg.id) {
    const state = extractClaudeStatus(status.content);
    if (state === "FAILED") {
      return blocked(
        pkg,
        `CLAUDE_CODE_EXECUTION_FAILED_SAFE: ${pkg.id} failed before a validated candidate existed.`,
        [`CLAUDE_CODE_STATUS=${statusPath}`, "No partial candidate mutation retained"],
        "Exact execution detail remains in the immutable GitHub Actions artifact. Correct the same bounded work package; do not broaden scope.",
      );
    }
    if (state === "CAPACITY_PAUSED") {
      const retryAfter = extractRetryAfter(status.content);
      const statusAttempt = extractDispatchAttempt(status.content);
      const orderAttempt = extractDispatchAttempt(order.content);
      if (orderAttempt > statusAttempt) {
        return pending(pkg, `bounded-code provider-capacity retry attempt ${orderAttempt} is already dispatched.`, [
          `CLAUDE_DISPATCH_ATTEMPT=${orderAttempt}`,
          `CLAUDE_CODE_ORDER=${orderPath}`,
        ]);
      }
      if (!retryAfter) {
        return blocked(pkg, "CLAUDE_CODE_CAPACITY_STATE_INVALID: capacity pause omitted retry_after.");
      }
      if (!retryIsDue(retryAfter)) {
        return capacityPaused(pkg, `bounded-code subscription/session capacity unavailable for ${pkg.id}.`, retryAfter, [
          `CLAUDE_DISPATCH_ATTEMPT=${statusAttempt}`,
          `CLAUDE_CODE_ORDER=${orderPath}`,
          "No partial candidate mutation retained",
        ]);
      }
      if (!order.sha || !order.content) {
        return blocked(pkg, "CLAUDE_CODE_RETRY_ORDER_MISSING: capacity marker exists but original governed code work order is missing.");
      }
      const nextAttempt = Math.max(statusAttempt, orderAttempt) + 1;
      const retryOrder = withRetryRequestedAt(withDispatchAttempt(order.content, nextAttempt));
      const commitSha = await writeControlFile(
        token,
        orderPath,
        retryOrder,
        `retry(factory): Claude bounded code ${pkg.id} attempt ${nextAttempt}`,
        order.sha,
      );
      return pending(pkg, `bounded-code provider-capacity retry attempt ${nextAttempt} dispatched at ${commitSha}.`, [
        `CLAUDE_DISPATCH_ATTEMPT=${nextAttempt}`,
        `CLAUDE_DISPATCH_SHA=${commitSha}`,
        `CLAUDE_CODE_ORDER=${orderPath}`,
        "Same governed work order and exact base preserved",
      ]);
    }
  }

  if (order.content) {
    return pending(pkg, `bounded code work order ${pkg.id} is dispatched and awaiting candidate evidence.`, [
      `CLAUDE_CODE_ORDER=${orderPath}`,
      `CLAUDE_CANDIDATE_BRANCH=${candidateBranch}`,
      `CLAUDE_DISPATCH_ATTEMPT=${extractDispatchAttempt(order.content)}`,
    ]);
  }

  const codeOrder = buildClaudeCodeWorkOrder(pkg);
  const commitSha = await writeControlFile(
    token,
    orderPath,
    codeOrder,
    `dispatch(factory): Claude bounded code ${pkg.id}`,
  );
  return pending(pkg, `bounded code work order ${pkg.id} dispatched at ${commitSha}.`, [
    `CLAUDE_DISPATCH_SHA=${commitSha}`,
    `CLAUDE_CODE_ORDER=${orderPath}`,
    `CLAUDE_CANDIDATE_BRANCH=${candidateBranch}`,
    `CLAUDE_BASE_SHA=${baseSha}`,
    "CLAUDE_AUTHORITY=BOUNDED_CODE_CANDIDATE_ONLY",
  ]);
}

/**
 * Durable Claude adapter behind the existing PRODUCT_DESIGN worker.
 *
 * REVIEW_ONLY uses the single-flight review queue. BOUNDED_CODE writes one
 * isolated work-order file and lets the existing GitHub worker create a
 * write-scope-firewalled candidate from exact TEST KING. Provider capacity is
 * a durable PAUSED state: no partial code survives, no work is duplicated and
 * the same work package is retried after the governed retry window.
 */
export async function executeClaudeProductReview(env: FactoryClaudeEnv, pkg: WorkPackage): Promise<Outcome> {
  if (!isClaudeProductWorkPackage(pkg)) return blocked(pkg, "Claude adapter rejected non-Claude/non-product work package.");

  const token = env.FACTORY_GITHUB_TOKEN?.trim();
  if (!token) {
    return blocked(
      pkg,
      "CLAUDE_FACTORY_BRIDGE_BLOCKED: FACTORY_GITHUB_TOKEN is not configured in Factory runtime.",
      ["Claude OAuth may be healthy in GitHub Actions, but Factory cannot dispatch without its governed GitHub bridge token."],
      "Configure the existing FACTORY_GITHUB_TOKEN secret; do not move CLAUDE_CODE_OAUTH_TOKEN into Cloudflare.",
    );
  }

  try {
    return pkg.specialist.mode === "BOUNDED_CODE"
      ? await executeClaudeCode(token, pkg)
      : await executeClaudeReview(token, pkg);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Claude Factory bridge failure";
    return blocked(
      pkg,
      `CLAUDE_FACTORY_BRIDGE_FAILED_SAFE: ${message}`,
      ["No duplicate dispatch authority", "No LIVE authority", "No Claude OAuth secret exposed to Cloudflare"],
      "Factory kept the work package fail-closed.",
    );
  }
}
