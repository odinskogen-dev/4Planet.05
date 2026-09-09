import type { ProjectProjection, WorkPackage } from "./contracts";

const SHA40 = /^[0-9a-f]{40}$/i;

export const PORTFOLIO_FALLBACK_AUTHORITY = "FOUNDER_ORDER:4PLANET_FACTORY_PRODUCTION_RAMP_03";
export const PORTFOLIO_FALLBACK_CONTROL = "ISSUE_273:GIGA_IMMUNITY_EXECUTION_CONTROL";
export const PORTFOLIO_FALLBACK_LEASE = "CONCURRENCY_LAW_GIGA01:LANE_D:OSLOFJORD_TO_GREAT_BARRIER_REEF_TRANSFER";
export const PORTFOLIO_OSLOFJORD_REVIEW_LEASE = "ISSUE_273:LANE_A:PLANET_GOLD_01_OSLOFJORD";

function key(sha: string): string {
  const clean = sha.trim().toLowerCase();
  if (!SHA40.test(clean)) throw new Error("PORTFOLIO_FALLBACK_SHA_INVALID");
  return clean.slice(0, 12);
}

function project(
  id: string,
  name: string,
  northStar: string,
  user: string,
  goal: string,
  current: string,
  gold: string,
  gap: string,
  priority: "P0" | "P1",
  authorityRefs: string[],
): ProjectProjection {
  return { id, name, northStar, user, goal, current, gold, gap, priority, authorityRefs };
}

function sourcePackage(input: {
  id: string;
  projectId: string;
  title: string;
  sourceLabel: string;
  targetUrl: string;
  allowedHost: string;
  exactTestSha: string;
  exactFactorySha: string;
  priority: "P0" | "P1";
  createdAt: string;
}): WorkPackage {
  return {
    id: input.id,
    projectId: input.projectId,
    title: input.title,
    section: "RESEARCH_DATA",
    priority: input.priority,
    goalLink: "CONDUCTOR LANE D — OSLOFJORD_TO_GREAT_BARRIER_REEF_TRANSFER",
    gapClosed: `Re-verify ${input.sourceLabel} from the deployed Factory before any new transfer claim or product mutation is promoted.`,
    deliverables: [
      `Bounded current-source reachability evidence for ${input.sourceLabel}`,
      "Content fingerprint and final URL",
      "Explicit limitation that reachability is not semantic/scientific validation",
    ],
    dependencies: [],
    writeScopes: [],
    definitionOfDone: [
      "The source is fetched only over HTTPS from an explicit allowlisted public host",
      "HTTP result, final URL, bounded byte count and content fingerprint are persisted as evidence",
      "No source failure is converted into ecological absence or a scientific conclusion",
      "No product, LIVE, Canon, partnership, spend or external-release mutation occurs",
    ],
    requiredEvidence: ["source PASS", "final url", "bounded bytes", "content fingerprint"],
    execution: { kind: "HTTP_SOURCE_CHECK", targetUrl: input.targetUrl, allowedHosts: [input.allowedHost] },
    run: {
      runId: `portfolio-production-ramp-${input.id}`,
      attemptId: "01",
      idempotencyKey: `portfolio-fallback:${input.id}:${input.exactTestSha}:${input.exactFactorySha}`,
      inputStateHash: `factory=${input.exactFactorySha};test=${input.exactTestSha};source=${input.targetUrl}`,
      expectedBaseSha: input.exactTestSha,
      workerId: "portfolio-fallback-research-data",
      createdAt: input.createdAt,
    },
    resourceBudget: {
      maxAttempts: 1,
      maxModelCalls: 0,
      maxExternalRequests: 1,
      maxGithubCalls: 0,
      maxBrowserCalls: 0,
      maxQueueRetries: 3,
    },
    learningQuestion: "Can the Factory keep producing bounded evidence on the current Conductor-authorised GBR transfer while a separate TEST receiver remains writer-blocked?",
    createdAt: input.createdAt,
    estimatedValue: 7,
    criticalPath: 8,
    dependencyUnlock: 9,
    proofValue: 9,
    cashValue: 1,
    learningValue: 10,
    risk: 1,
    founderBurden: 0,
    concurrencyCost: 0,
    status: "READY",
  };
}

function oslofjordReviewPackage(input: {
  id: string;
  projectId: string;
  exactTestSha: string;
  exactFactorySha: string;
  createdAt: string;
}): WorkPackage {
  return {
    id: input.id,
    projectId: input.projectId,
    title: "Oslofjord Human Gold — focused current-HEIR comprehension and provenance review",
    section: "PRODUCT_DESIGN",
    priority: "P0",
    goalLink: "CONDUCTOR LANE A — PLANET_GOLD_01_OSLOFJORD",
    gapClosed: "Produce one fresh, narrowly scoped Product/Interface correction contract for the current Oslofjord HEIR without becoming a second writer or repeating the failed multipass Claude pattern.",
    deliverables: [
      "Rank the three highest-impact blockers to 5-second comprehension of the current Oslofjord Planet proof",
      "Identify the single most important provenance/source-presentation blocker that could undermine trust",
      "Return one minimal next correction contract for the existing maker; do not propose a redesign or new product architecture",
    ],
    dependencies: [],
    writeScopes: [],
    definitionOfDone: [
      "Review is bound to exact current TEST KING and current Factory build",
      "Only the current Oslofjord/Planet proof is reviewed; unrelated repo archaeology is explicitly out of scope",
      "Findings distinguish OBSERVED, INFERRED, PROPOSED and UNKNOWN where material",
      "The result is a compact ranked correction contract usable by the existing maker without Founder reconstruction",
      "No repository, TEST KING, LIVE, Canon, outreach, spend or external-release mutation occurs",
    ],
    requiredEvidence: [
      "fresh correlated Claude work-order result",
      "top three comprehension blockers",
      "one provenance/source-presentation blocker",
      "one minimal next correction contract",
    ],
    specialist: {
      provider: "CLAUDE",
      role: "PRODUCT_INTERFACE",
      mode: "REVIEW_ONLY",
      model: "claude-opus-5",
      sourceRefs: [
        `king/test@${input.exactTestSha}`,
        PORTFOLIO_OSLOFJORD_REVIEW_LEASE,
        "PLANET_PROOF_READING_GRAMMAR:WHAT_IS_HERE→WHAT_IS_HAPPENING→WHY→DEPENDENCIES→CHANGE→EVIDENCE→ACTOR→ACTION",
        "SCOPE_LAW:ONE_PASS_ONE_DELIVERABLE_NO_UNRELATED_REPO_ARCHAEOLOGY",
      ],
    },
    run: {
      runId: `portfolio-production-ramp-${input.id}`,
      attemptId: "01",
      idempotencyKey: `portfolio-oslofjord-review:${input.id}:${input.exactTestSha}:${input.exactFactorySha}`,
      inputStateHash: `factory=${input.exactFactorySha};test=${input.exactTestSha};specialist=CLAUDE_REVIEW_ONLY;scope=OSLOFJORD_ONE_PASS`,
      expectedBaseSha: input.exactTestSha,
      workerId: "portfolio-oslofjord-claude-review",
      createdAt: input.createdAt,
    },
    resourceBudget: { maxAttempts: 1, maxCorrectionAttempts: 0, maxQueueRetries: 3 },
    learningQuestion: "Can a one-pass, review-only specialist package complete reliably and produce a materially useful current-HEIR correction contract after the failed oversized Claude multipass work order?",
    createdAt: input.createdAt,
    estimatedValue: 10,
    criticalPath: 10,
    dependencyUnlock: 9,
    proofValue: 10,
    cashValue: 2,
    learningValue: 10,
    risk: 1,
    founderBurden: 0,
    concurrencyCost: 0,
    status: "READY",
  };
}

export function createPortfolioFallbackQueue(
  exactTestSha: string,
  exactFactorySha: string,
  createdAt = new Date().toISOString(),
): { projects: ProjectProjection[]; packages: WorkPackage[] } {
  const testKey = key(exactTestSha);
  const factoryKey = key(exactFactorySha);

  const oslofjord = project(
    "PLANET_GOLD_01_OSLOFJORD",
    "PLANET Gold 01 — Oslofjord Human Gold",
    "Make one real place understandable, trustworthy and action-relevant to a normal person using the existing Planet proof architecture.",
    "A normal public 4PLANET visitor",
    "Move the existing Oslofjord proof toward Human Gold while preserving the sole TEST writer and all MUST-NOT-LOSE product value.",
    "The current HEIR is writer-owned by another active lane, so mutation is illegal from this Factory fallback; a read-only specialist review remains conflict-free.",
    "A current-HEIR correction contract that materially improves the next legal maker pass without inventing a second writer, renderer or product line.",
    "Obtain one focused Product/Interface review now; defer mutation until receiver authority is legal.",
    "P0",
    [PORTFOLIO_FALLBACK_AUTHORITY, PORTFOLIO_FALLBACK_CONTROL, PORTFOLIO_OSLOFJORD_REVIEW_LEASE],
  );

  const gbr = project(
    "PLANET_GBR_TRANSFER_02",
    "PLANET Proof 02 — Great Barrier Reef transfer",
    "Advance the current Conductor-authorised Great Barrier Reef transfer proof while a separate mutable receiver is locally parked, without creating a second writer, product line or bypass branch.",
    "A normal public 4PLANET visitor",
    "Prove the Oslofjord PlanetProof contract transfers to a fundamentally different marine system without inventing a second renderer or flattening source scale.",
    "The shared PlanetProof schema and eight-question reading grammar are seeded with AIMS and NOAA Coral Reef Watch evidence; product mutation is not legal while the sole TEST receiver has another writer.",
    "A source-bounded transfer pack whose current primary evidence is machine-reverified before later route/browser/Human Gold work.",
    "Use the conflict-free read-only Lane D scope to verify current primary evidence now; preserve OPEN relationship/action fields until separate evidence resolves them.",
    "P0",
    [PORTFOLIO_FALLBACK_AUTHORITY, PORTFOLIO_FALLBACK_CONTROL, PORTFOLIO_FALLBACK_LEASE],
  );

  const packages = [
    oslofjordReviewPackage({
      id: `portfolio-oslofjord-human-gold-review-${testKey}-${factoryKey}`,
      projectId: oslofjord.id,
      exactTestSha,
      exactFactorySha,
      createdAt,
    }),
    sourcePackage({
      id: `portfolio-gbr-aims-source-${testKey}-${factoryKey}`,
      projectId: gbr.id,
      title: "GBR transfer — verify current AIMS 2025–26 condition source",
      sourceLabel: "Australian Institute of Marine Science Great Barrier Reef Annual Summary 2025–26",
      targetUrl: "https://www.aims.gov.au/monitoring-great-barrier-reef/gbr-condition-summary-2025-26",
      allowedHost: "aims.gov.au",
      exactTestSha,
      exactFactorySha,
      priority: "P0",
      createdAt,
    }),
    sourcePackage({
      id: `portfolio-gbr-noaa-crw-source-${testKey}-${factoryKey}`,
      projectId: gbr.id,
      title: "GBR transfer — verify NOAA Coral Reef Watch heat-stress source",
      sourceLabel: "NOAA Coral Reef Watch Daily 5 km heat-stress monitoring",
      targetUrl: "https://coralreefwatch.noaa.gov/product/5km/",
      allowedHost: "coralreefwatch.noaa.gov",
      exactTestSha,
      exactFactorySha,
      priority: "P0",
      createdAt,
    }),
  ];

  return { projects: [oslofjord, gbr], packages };
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

export function isOnlyReceiverWriterConflict(body: unknown): boolean {
  const root = record(body);
  if (root?.error !== "ACTIVATION_PREFLIGHT_BLOCKED") return false;
  const preflight = record(root.preflight);
  const authority = preflight?.authority;
  if (!Array.isArray(authority) || authority.length === 0) return false;
  return authority.every((row) => record(row)?.code === "RECEIVER_SINGLE_WRITER_CONFLICT");
}
