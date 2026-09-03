import type { Outcome, WorkPackage } from "./contracts";

const OWNER = "odinskogen-dev";
const REPO = "4Planet.05";
const CLAUDE_BRANCH = "factory/claude-product-worker-01";
const QUEUE_PATH = "docs/claude/queue/CURRENT.md";
const RESULT_PATH = "docs/claude/results/LATEST.md";
const MAX_RESULT_CHARS = 24_000;

export interface ClaudeProductSpecialistSpec {
  provider: "CLAUDE";
  role: "PRODUCT_INTERFACE";
  mode: "REVIEW_ONLY";
  sourceRefs?: string[];
}

export type ClaudeRoutedWorkPackage = WorkPackage & {
  specialist?: ClaudeProductSpecialistSpec;
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

const sha40 = /^[0-9a-f]{40}$/i;

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

function accepted(pkg: WorkPackage, result: string): Outcome {
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

async function readBranchFile(token: string, path: string): Promise<{ sha?: string; content: string }> {
  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedPath(path)}?ref=${encodeURIComponent(CLAUDE_BRANCH)}`,
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
  if (!response.ok) throw new Error(`GitHub ${response.status} read ${path}: ${text.slice(0, 1000)}`);
  const value = JSON.parse(text) as GitHubContent;
  if (value.type !== "file") throw new Error(`Claude integration path is not a file: ${path}`);
  return {
    sha: value.sha,
    content: value.content && value.encoding === "base64" ? fromBase64Utf8(value.content) : "",
  };
}

async function writeQueue(token: string, content: string, currentSha?: string): Promise<string> {
  const result = await github<GitHubWrite>(token, `/contents/${encodedPath(QUEUE_PATH)}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `dispatch(factory): Claude Product Worker ${extractWorkOrderId(content) ?? "unknown"}`,
      content: toBase64Utf8(content),
      branch: CLAUDE_BRANCH,
      ...(currentSha ? { sha: currentSha } : {}),
    }),
  });
  const commitSha = result.commit?.sha ?? "";
  if (!sha40.test(commitSha)) throw new Error("Claude queue dispatch did not return a valid GitHub commit SHA");
  return commitSha;
}

export function extractWorkOrderId(markdown: string): string | undefined {
  const match = markdown.match(/^id:\s*([A-Za-z0-9._-]+)\s*$/m);
  return match?.[1];
}

export function extractResultWorkOrderId(markdown: string): string | undefined {
  const match = markdown.match(/^work_order_id:\s*([A-Za-z0-9._-]+)\s*$/m);
  return match?.[1];
}

export function isClaudeProductWorkPackage(pkg: WorkPackage): pkg is ClaudeRoutedWorkPackage {
  const spec = (pkg as ClaudeRoutedWorkPackage).specialist;
  return pkg.section === "PRODUCT_DESIGN"
    && spec?.provider === "CLAUDE"
    && spec.role === "PRODUCT_INTERFACE"
    && spec.mode === "REVIEW_ONLY";
}

function bulletList(values: string[], fallback: string): string {
  return values.length > 0 ? values.map((value) => `- ${value}`).join("\n") : `- ${fallback}`;
}

export function buildClaudeWorkOrder(pkg: ClaudeRoutedWorkPackage): string {
  const spec = pkg.specialist;
  if (!spec) throw new Error("Claude specialist spec is missing");
  return `# CLAUDE FACTORY WORK ORDER\n\nid: ${pkg.id}\nmode: REVIEW_ONLY\nowner: 4PLANET Production Factory / AXE\nworker_role: PRODUCT_INTERFACE\npriority: ${pkg.priority}\nproject_id: ${pkg.projectId}\n\n## Goal\n\n${pkg.title}\n\n## Goal link\n\n${pkg.goalLink}\n\n## Gap to close\n\n${pkg.gapClosed}\n\n## Deliverables\n\n${bulletList(pkg.deliverables, "No deliverables supplied — mark UNKNOWN rather than inventing.")}\n\n## Definition of done\n\n${bulletList(pkg.definitionOfDone, "No definition supplied — fail closed.")}\n\n## Required evidence\n\n${bulletList(pkg.requiredEvidence, "Repository evidence and governed current context.")}\n\n## Source refs\n\n${bulletList(spec.sourceRefs ?? [], "No additional source refs supplied; do not invent source facts.")}\n\n## Authority\n\nREAD / REVIEW ONLY. No repository mutation. No branch creation. No merge. No LIVE. No Canon promotion. No external outreach. No spend.\n\n## MUST NOT LOSE\n\n- one existing 4PLANET Production Factory; no parallel Claude factory\n- TEST KING remains the integration receiver\n- BRAIN / governed context remains programme authority\n- Founder release gates remain intact\n- active write scopes must not be duplicated\n- distinguish OBSERVED / INFERRED / PROPOSED / UNKNOWN where material\n\n## Return contract\n\nReturn a compact Factory-ingestible review that directly closes the stated gap. Include: STATUS, MATERIAL FINDINGS, RECOMMENDED ACTION, MUST-NOT-LOSE, RISKS, UNKNOWN. Do not require Founder reconstruction.\n`;
}

/**
 * Durable two-phase Claude adapter.
 *
 * Phase 1 dispatches one bounded REVIEW_ONLY work order to the isolated Claude
 * branch. Phase 2 is reached by the existing Factory Workflow re-observing the
 * same Work Package until the correlated result is persisted. The queue is
 * intentionally single-flight in v1 to prevent competing Claude writes/jobs.
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
    const result = await readBranchFile(token, RESULT_PATH);
    if (extractResultWorkOrderId(result.content) === pkg.id) return accepted(pkg, result.content);

    const queue = await readBranchFile(token, QUEUE_PATH);
    const queuedId = extractWorkOrderId(queue.content);

    if (queuedId === pkg.id) {
      return pending(pkg, `work order ${pkg.id} is dispatched and awaiting correlated Claude result.`, [
        `CLAUDE_QUEUE=${QUEUE_PATH}`,
        `CLAUDE_WORK_ORDER=${pkg.id}`,
      ]);
    }

    if (queuedId) {
      const completedQueuedId = extractResultWorkOrderId(result.content);
      if (completedQueuedId !== queuedId) {
        return pending(pkg, `single-flight Claude queue is occupied by ${queuedId}.`, [
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
