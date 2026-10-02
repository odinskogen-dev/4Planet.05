import type { ProductionLineId, ProjectProjection, Section, WorkPackage } from "./contracts";

const ORCHESTRA_VERSION = "04" as const;
const versioned = (stem: string) => `${stem}-v${ORCHESTRA_VERSION}`;

export const SHADOW_ORCHESTRA_ID = `4planet-first-real-orchestra-v${ORCHESTRA_VERSION}` as const;
export const FACTORY_PREVIEW_HOST = "factory-symphony-runtime-v01.4planet-05.pages.dev";
export const ORCA_RECOVERY_HOST = "recovery-orca-human-gold-01.4planet-05.pages.dev";

interface BrowserProbe {
  id: string;
  title: string;
  projectId: string;
  section: Section;
  lineId?: ProductionLineId;
  instanceId: string;
  url: string;
  allowedHosts: string[];
  width: number;
  height: number;
}

const browserProbes: BrowserProbe[] = [
  {
    id: versioned("orch-orca-mobile"),
    title: "Orca recovery candidate mobile runtime evidence — Orchestra 04",
    projectId: versioned("orch-species"),
    section: "CODE_QA",
    lineId: "SPECIES_JOURNEY",
    instanceId: "orca",
    url: `https://${ORCA_RECOVERY_HOST}/journey/orca/`,
    allowedHosts: [ORCA_RECOVERY_HOST],
    width: 390,
    height: 844,
  },
  {
    id: versioned("orch-orca-desktop"),
    title: "Orca recovery candidate desktop runtime evidence — Orchestra 04",
    projectId: versioned("orch-species"),
    section: "PRODUCT_DESIGN",
    lineId: "SPECIES_JOURNEY",
    instanceId: "orca",
    url: `https://${ORCA_RECOVERY_HOST}/journey/orca/`,
    allowedHosts: [ORCA_RECOVERY_HOST],
    width: 1440,
    height: 1000,
  },
  {
    id: versioned("orch-jaguar-mobile"),
    title: "Jaguar reference candidate mobile runtime evidence — Orchestra 04",
    projectId: versioned("orch-species"),
    section: "CODE_QA",
    lineId: "SPECIES_JOURNEY",
    instanceId: "jaguar",
    url: `https://${FACTORY_PREVIEW_HOST}/journey/jaguar/`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 390,
    height: 844,
  },
  {
    id: versioned("orch-acropora-mobile"),
    title: "Acropora transfer candidate mobile runtime evidence — Orchestra 04",
    projectId: versioned("orch-species"),
    section: "PRODUCT_DESIGN",
    lineId: "SPECIES_JOURNEY",
    instanceId: "acropora-palmata",
    url: `https://${FACTORY_PREVIEW_HOST}/species/acropora-palmata`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 390,
    height: 844,
  },
  {
    id: versioned("orch-bay-mobile"),
    title: "Bay of Biscay ecosystem mobile runtime evidence — Orchestra 04",
    projectId: versioned("orch-ecosystem"),
    section: "CODE_QA",
    lineId: "ECOSYSTEM_PLACE",
    instanceId: "bay-of-biscay",
    url: `https://${FACTORY_PREVIEW_HOST}/ecosystem/bay-of-biscay/`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 390,
    height: 844,
  },
  {
    id: versioned("orch-bay-desktop"),
    title: "Bay of Biscay ecosystem desktop runtime evidence — Orchestra 04",
    projectId: versioned("orch-ecosystem"),
    section: "PRODUCT_DESIGN",
    lineId: "ECOSYSTEM_PLACE",
    instanceId: "bay-of-biscay",
    url: `https://${FACTORY_PREVIEW_HOST}/ecosystem/bay-of-biscay/`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 1440,
    height: 1000,
  },
  {
    id: versioned("orch-one-interface-mobile"),
    title: "ONE INTERFACE mobile entry runtime evidence — Orchestra 04",
    projectId: versioned("orch-product"),
    section: "USER_DISTRIBUTION",
    instanceId: "one-interface",
    url: `https://${FACTORY_PREVIEW_HOST}/`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 390,
    height: 844,
  },
];

export const ORCHESTRA_PACKAGE_IDS = [
  ...browserProbes.map((probe) => probe.id),
  versioned("orch-story-source"),
];

function project(
  id: string,
  name: string,
  nowIso: string,
  productionLine?: { lineId: ProductionLineId; instanceId: string; templateVersion: string; role: "BATCH" },
): ProjectProjection {
  return {
    id,
    name,
    northStar: "Prove real 4PLANET work can flow through a bounded, observable, quality-gated 24/7 Factory without granting LIVE authority.",
    goal: "Collect independent runtime evidence on current 4PLANET product and story work through the real Factory transport layer.",
    current: "Orchestra 03 proved the source adapter but exposed that Cloudflare consumer concurrency does not serialize messages inside one Queue batch; HTTP 429 capacity was also being misclassified as product correction.",
    gold: "Orchestra 04 drains all eight real packages with sequential in-batch execution, transient capacity retries, persisted evidence and independent quality decisions.",
    gap: "Prove a real multi-surface Browser/source queue can drain reliably without turning temporary Browser capacity into false product failure.",
    priority: "INCUBATING",
    user: "4PLANET Factory internal QA; Founder remains Human Gold judge.",
    authorityRefs: ["BRAIN current state", "GitHub PR #212", "Founder Human Gold direction 2026-09-01", "Orchestra 01–03 runtime evidence"],
    productionLine,
    lastMaterialProgressAt: nowIso,
  };
}

export function createShadowOrchestraProjects(nowIso = new Date().toISOString()): ProjectProjection[] {
  return [
    project(versioned("orch-species"), "Species/Journey runtime evidence orchestra 04", nowIso, {
      lineId: "SPECIES_JOURNEY",
      instanceId: "orchestra-batch-04",
      templateVersion: "04",
      role: "BATCH",
    }),
    project(versioned("orch-ecosystem"), "Ecosystem/Place runtime evidence orchestra 04", nowIso, {
      lineId: "ECOSYSTEM_PLACE",
      instanceId: "orchestra-batch-04",
      templateVersion: "04",
      role: "BATCH",
    }),
    project(versioned("orch-story"), "Story source-truth evidence orchestra 04", nowIso, {
      lineId: "STORY",
      instanceId: "humpback-source-proof-04",
      templateVersion: "04",
      role: "BATCH",
    }),
    project(versioned("orch-product"), "ONE INTERFACE entry evidence orchestra 04", nowIso),
  ];
}

const base = (projectId: string, nowIso: string): Omit<WorkPackage, "id" | "title" | "section" | "execution" | "learningQuestion" | "productionLine"> => ({
  projectId,
  priority: "INCUBATING",
  goalLink: "FACTORY WORLD CLASS BUILD 03 — real 4PLANET Orchestra 04",
  gapClosed: "Reliable independent real-world evidence on current 4PLANET work",
  deliverables: ["Persisted bounded evidence", "Independent quality decision", "Traceable outcome", "Learning candidate when material"],
  dependencies: [],
  writeScopes: [],
  definitionOfDone: [
    "A real current 4PLANET surface or authoritative source is checked through a bounded runtime adapter",
    "Independent quality authority evaluates the specialist evidence",
    "Transient infrastructure capacity is retried rather than misclassified as product quality evidence",
    "Outcome is persisted without modifying LIVE, sending externally, spending on AI models or promoting Canon",
  ],
  requiredEvidence: ["PASS", "browser or source runtime evidence"],
  zeroLoss: {
    required: false,
    donorUniverseRefs: [],
    dispositions: [],
    orphanCount: 0,
    winnerParityEvidence: [],
    checkedAt: nowIso,
  },
  createdAt: nowIso,
  estimatedValue: 8,
  criticalPath: 9,
  dependencyUnlock: 9,
  proofValue: 10,
  cashValue: 0,
  learningValue: 9,
  risk: 1,
  founderBurden: 0,
  concurrencyCost: 1,
  status: "READY",
});

export function createShadowOrchestraPackages(nowIso = new Date().toISOString()): WorkPackage[] {
  const browserPackages = browserProbes.map<WorkPackage>((probe) => ({
    ...base(probe.projectId, nowIso),
    id: probe.id,
    title: probe.title,
    section: probe.section,
    productionLine: probe.lineId
      ? {
          lineId: probe.lineId,
          instanceId: probe.instanceId,
          templateVersion: "04",
          stage: "OBSERVE",
          role: "BATCH",
        }
      : undefined,
    execution: {
      kind: "BROWSER_QA",
      targetUrl: probe.url,
      allowedHosts: probe.allowedHosts,
      viewport: { width: probe.width, height: probe.height, deviceScaleFactor: 1 },
    },
    learningQuestion: `Can Factory collect reliable ${probe.width}x${probe.height} evidence for ${probe.instanceId} with true sequential Browser execution, without confusing infrastructure capacity or technical render proof with Human Gold?`,
  }));

  const storySource: WorkPackage = {
    ...base(versioned("orch-story"), nowIso),
    id: versioned("orch-story-source"),
    title: "Living Ocean humpback NOAA source reachability and bounded provenance fingerprint — Orchestra 04",
    section: "RESEARCH_DATA",
    productionLine: {
      lineId: "STORY",
      instanceId: "humpback-cooperative-feeding",
      templateVersion: "04",
      stage: "SOURCE",
      role: "BATCH",
    },
    execution: {
      kind: "HTTP_SOURCE_CHECK",
      targetUrl: "https://www.fisheries.noaa.gov/species/humpback-whale",
      allowedHosts: ["fisheries.noaa.gov"],
    },
    learningQuestion: "Can Story Factory continuously verify the authoritative NOAA species source within the corrected bounded source envelope without turning reachability into an unsupported scientific claim?",
  };

  return [...browserPackages, storySource];
}

export interface FactoryQueueMessage {
  kind: "WORK_PACKAGE";
  orchestraId: typeof SHADOW_ORCHESTRA_ID;
  workPackageId: string;
  traceId: string;
  enqueuedAt: string;
}

export function queueMessageFor(pkg: WorkPackage, nowIso = new Date().toISOString()): FactoryQueueMessage {
  return {
    kind: "WORK_PACKAGE",
    orchestraId: SHADOW_ORCHESTRA_ID,
    workPackageId: pkg.id,
    traceId: `trace:${SHADOW_ORCHESTRA_ID}:${pkg.projectId}:${pkg.id}`,
    enqueuedAt: nowIso,
  };
}
