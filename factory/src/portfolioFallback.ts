import type { ProjectProjection, WorkPackage } from "./contracts";

const SHA40 = /^[0-9a-f]{40}$/i;

export const PORTFOLIO_FALLBACK_AUTHORITY = "FOUNDER_ORDER:4PLANET_AUTONOMOUS_VALUE_CLOSURE_02";
export const PORTFOLIO_FALLBACK_CONTROL = "ISSUE_273:PORTFOLIO_LEARNING_FACTORY";

function key(sha: string): string {
  const clean = sha.trim().toLowerCase();
  if (!SHA40.test(clean)) throw new Error("PORTFOLIO_FALLBACK_TEST_SHA_INVALID");
  return clean.slice(0, 12);
}

function project(
  id: string,
  name: string,
  goal: string,
  current: string,
  gold: string,
  gap: string,
  priority: "P0" | "P1",
): ProjectProjection {
  return {
    id,
    name,
    northStar: "Advance a real 4PLANET proof while a separate mutable receiver is locally parked, without creating a second writer or bypass branch.",
    user: "A normal public 4PLANET visitor",
    goal,
    current,
    gold,
    gap,
    priority,
    authorityRefs: [PORTFOLIO_FALLBACK_AUTHORITY, PORTFOLIO_FALLBACK_CONTROL],
  };
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
    goalLink: "4PLANET AUTONOMOUS VALUE CLOSURE 02 — second-project dispatch and source-bounded transfer proof",
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
    execution: {
      kind: "HTTP_SOURCE_CHECK",
      targetUrl: input.targetUrl,
      allowedHosts: [input.allowedHost],
    },
    run: {
      runId: `portfolio-value-closure-${input.id}`,
      attemptId: "01",
      idempotencyKey: `portfolio-fallback:${input.id}:${input.exactTestSha}`,
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
    learningQuestion: "Can the Factory keep producing bounded evidence on the next highest-value conflict-free project while a separate TEST receiver remains writer-blocked?",
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

export function createPortfolioFallbackQueue(
  exactTestSha: string,
  exactFactorySha: string,
  createdAt = new Date().toISOString(),
): { projects: ProjectProjection[]; packages: WorkPackage[] } {
  const testKey = key(exactTestSha);
  if (!SHA40.test(exactFactorySha.trim().toLowerCase())) throw new Error("PORTFOLIO_FALLBACK_FACTORY_SHA_INVALID");

  const gbr = project(
    "PLANET_GBR_TRANSFER_02",
    "PLANET Proof 02 — Great Barrier Reef transfer",
    "Prove the Oslofjord PlanetProof contract transfers to a fundamentally different marine system without inventing a second renderer or flattening source scale.",
    "The shared PlanetProof schema and eight-question reading grammar are seeded with AIMS and NOAA Coral Reef Watch evidence; product mutation is not legal while the sole TEST receiver has another writer.",
    "A source-bounded transfer pack whose current primary evidence is machine-reverified before later route/browser/Human Gold work.",
    "Use the conflict-free read-only lane to verify current primary evidence now; preserve OPEN relationship/action fields until separate evidence resolves them.",
    "P0",
  );
  const amazonia = project(
    "PLANET_AMAZONIA_TRANSFER_03",
    "PLANET Proof 03 — Amazonia transfer",
    "Prepare the third PlanetProof transfer with source-bounded land-cover/fire evidence without creating a second Planet architecture.",
    "Amazonia is seeded behind GBR with MapBiomas Amazonia and NASA FIRMS source contracts; no product mutation is authorised by this fallback lane.",
    "Current primary transfer sources are machine-reverified and ready for the later governed product-transfer step.",
    "Only perform read-only source proof after the higher-priority GBR source checks are terminal.",
    "P1",
  );

  const packages = [
    sourcePackage({
      id: `portfolio-gbr-aims-source-${testKey}`,
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
      id: `portfolio-gbr-noaa-crw-source-${testKey}`,
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
    sourcePackage({
      id: `portfolio-amazonia-mapbiomas-source-${testKey}`,
      projectId: amazonia.id,
      title: "Amazonia transfer — verify MapBiomas Amazonia collection source",
      sourceLabel: "MapBiomas Amazonia Collection",
      targetUrl: "https://amazonia.mapbiomas.org/en/en/mapbiomas-amazonia-collection/",
      allowedHost: "amazonia.mapbiomas.org",
      exactTestSha,
      exactFactorySha,
      priority: "P1",
      createdAt,
    }),
  ];

  return { projects: [gbr, amazonia], packages };
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
