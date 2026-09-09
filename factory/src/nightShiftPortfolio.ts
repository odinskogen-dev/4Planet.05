import type { ProjectProjection, WorkPackage } from "./contracts";

// Finite deploy-triggered SHADOW run only. This module installs no cron or standing scheduler.
const SHA40 = /^[0-9a-f]{40}$/i;
export const NIGHT_SHIFT_PROJECT_ID = "FACTORY_ACTIVE_01";
export const NIGHT_SHIFT_AUTHORITY = "FOUNDER_ORDER:FACTORY_CLOUD_WORKERS_NIGHT_SHIFT_01";

function key(sha: string): string {
  const clean = sha.trim().toLowerCase();
  if (!SHA40.test(clean)) throw new Error("NIGHT_SHIFT_SHA_INVALID");
  return clean.slice(0, 12);
}

function browserPackage(input: {
  slug: string;
  title: string;
  targetUrl: string;
  viewport: { width: number; height: number };
  exactTestSha: string;
  exactFactorySha: string;
  createdAt: string;
}): WorkPackage {
  const testKey = key(input.exactTestSha);
  const factoryKey = key(input.exactFactorySha);
  return {
    id: `night-${input.slug}-${testKey}-${factoryKey}`,
    projectId: NIGHT_SHIFT_PROJECT_ID,
    title: input.title,
    section: "CODE_QA",
    priority: "P0",
    goalLink: "FACTORY_ACTIVE_01 — bounded SHADOW production evidence",
    gapClosed: `Collect current public runtime evidence for ${input.title} without mutating LIVE, HEIR, Canon or external state.`,
    deliverables: [
      "Cloudflare Browser Rendering screenshot/Markdown/accessibility evidence",
      "Exact target URL + viewport + bounded payload fingerprint",
      "Explicit limitation: automated render evidence is not Human Gold judgement",
    ],
    dependencies: [],
    writeScopes: [],
    definitionOfDone: [
      "Task Contract V1 and context hash are bound before dispatch",
      "Current HEIR and production-control projection are fresh at dispatch",
      "Browser execution is HTTPS + allowlist bounded and succeeds",
      "Current HEIR and production-control projection are unchanged at terminal readback",
      "No LIVE/HEIR/Canon/outreach/spend mutation occurs",
    ],
    requiredEvidence: ["TASK_CONTRACT_V1", "context_hash", "browser snapshot PASS", "snapshot-sha256", "terminal authority reread"],
    execution: {
      kind: "BROWSER_QA",
      targetUrl: input.targetUrl,
      allowedHosts: ["4planet.org"],
      viewport: { ...input.viewport, deviceScaleFactor: 1 },
    },
    run: {
      runId: `factory-night-shift-${input.slug}`,
      attemptId: "01",
      idempotencyKey: `factory-night:${input.slug}:${input.exactTestSha}:${input.exactFactorySha}`,
      inputStateHash: `factory=${input.exactFactorySha};test=${input.exactTestSha};target=${input.targetUrl};viewport=${input.viewport.width}x${input.viewport.height}`,
      expectedBaseSha: input.exactTestSha,
      workerId: "factory-cloudflare-night-readonly",
      createdAt: input.createdAt,
    },
    resourceBudget: {
      maxAttempts: 1,
      maxCorrectionAttempts: 0,
      maxModelCalls: 0,
      maxTokens: 0,
      maxModelCostUsd: 0,
      maxExternalRequests: 1,
      maxGithubCalls: 0,
      maxBrowserCalls: 1,
      maxWallClockMinutes: 5,
      maxQueueRetries: 3,
    },
    learningQuestion: `Can the Factory collect reliable current production evidence for ${input.slug} under Amendment-M fail-closed controls with zero Founder execution minutes?`,
    createdAt: input.createdAt,
    estimatedValue: 9,
    criticalPath: 10,
    dependencyUnlock: 9,
    proofValue: 10,
    cashValue: 0,
    learningValue: 10,
    risk: 1,
    founderBurden: 0,
    concurrencyCost: 0,
    status: "READY",
  };
}

export function createNightShiftPortfolio(
  exactTestSha: string,
  exactFactorySha: string,
  createdAt = new Date().toISOString(),
): { projects: ProjectProjection[]; packages: WorkPackage[] } {
  key(exactTestSha);
  key(exactFactorySha);
  const project: ProjectProjection = {
    id: NIGHT_SHIFT_PROJECT_ID,
    name: "FACTORY_ACTIVE_01 — Cloud Workers Night Shift",
    northStar: "Prove one bounded autonomous build/test/evidence/learn loop while reducing Founder routing burden and preserving all release gates.",
    user: "4PLANET Founder / Programme QA",
    goal: "Collect current read-only CORE production evidence through the existing Cloudflare Factory with WIP=1 and Amendment-M runtime controls.",
    current: "Post-publish product state is moving; LIVE and HEIR must be observed, not mutated, by this night run.",
    gold: "A finite, independently readable SHADOW QLoop produces evidence, failures and learning without self-promoting activity into truth.",
    gap: "Run bounded current CORE checks and prove fail-closed context/authority behaviour.",
    priority: "P0",
    authorityRefs: [NIGHT_SHIFT_AUTHORITY, "FOUNDER_AMENDMENT_M", "CSR-2026-09-08-05", "FACTORY_ACTIVE_01"],
    lastMaterialProgressAt: createdAt,
  };

  const defs = [
    ["core-main-desktop", "4PLANET MAIN desktop", "https://4planet.org/", 1440, 1000],
    ["core-main-mobile-390", "4PLANET MAIN mobile 390", "https://4planet.org/", 390, 844],
    ["atlas-desktop", "ATLAS desktop", "https://4planet.org/atlas", 1440, 1000],
    ["atlas-mobile-430", "ATLAS mobile 430", "https://4planet.org/atlas", 430, 932],
    ["species-mobile-390", "SPECIES mobile 390", "https://4planet.org/species", 390, 844],
    ["living-systems-mobile-390", "LIVING SYSTEMS mobile 390", "https://4planet.org/living-systems", 390, 844],
    ["impact-mobile-390", "IMPACT mobile 390", "https://4planet.org/impact", 390, 844],
  ] as const;

  const packages = defs.map(([slug, title, targetUrl, width, height]) => browserPackage({
    slug, title, targetUrl, viewport: { width, height }, exactTestSha, exactFactorySha, createdAt,
  }));
  return { projects: [project], packages };
}
