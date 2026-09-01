import type { ProductionLineId, ProjectProjection, Section, WorkPackage } from "./contracts";

export const SHADOW_ORCHESTRA_ID = "4planet-first-real-orchestra-v02";
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
    id: "orch-orca-mobile-v02",
    title: "Orca recovery candidate mobile runtime evidence — Orchestra 02",
    projectId: "orch-species-v02",
    section: "CODE_QA",
    lineId: "SPECIES_JOURNEY",
    instanceId: "orca",
    url: `https://${ORCA_RECOVERY_HOST}/journey/orca/`,
    allowedHosts: [ORCA_RECOVERY_HOST],
    width: 390,
    height: 844,
  },
  {
    id: "orch-orca-desktop-v02",
    title: "Orca recovery candidate desktop runtime evidence — Orchestra 02",
    projectId: "orch-species-v02",
    section: "PRODUCT_DESIGN",
    lineId: "SPECIES_JOURNEY",
    instanceId: "orca",
    url: `https://${ORCA_RECOVERY_HOST}/journey/orca/`,
    allowedHosts: [ORCA_RECOVERY_HOST],
    width: 1440,
    height: 1000,
  },
  {
    id: "orch-jaguar-mobile-v02",
    title: "Jaguar reference candidate mobile runtime evidence — Orchestra 02",
    projectId: "orch-species-v02",
    section: "CODE_QA",
    lineId: "SPECIES_JOURNEY",
    instanceId: "jaguar",
    url: `https://${FACTORY_PREVIEW_HOST}/journey/jaguar/`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 390,
    height: 844,
  },
  {
    id: "orch-acropora-mobile-v02",
    title: "Acropora transfer candidate mobile runtime evidence — Orchestra 02",
    projectId: "orch-species-v02",
    section: "PRODUCT_DESIGN",
    lineId: "SPECIES_JOURNEY",
    instanceId: "acropora-palmata",
    url: `https://${FACTORY_PREVIEW_HOST}/species/acropora-palmata`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 390,
    height: 844,
  },
  {
    id: "orch-bay-mobile-v02",
    title: "Bay of Biscay ecosystem mobile runtime evidence — Orchestra 02",
    projectId: "orch-ecosystem-v02",
    section: "CODE_QA",
    lineId: "ECOSYSTEM_PLACE",
    instanceId: "bay-of-biscay",
    url: `https://${FACTORY_PREVIEW_HOST}/ecosystem/bay-of-biscay/`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 390,
    height: 844,
  },
  {
    id: "orch-bay-desktop-v02",
    title: "Bay of Biscay ecosystem desktop runtime evidence — Orchestra 02",
    projectId: "orch-ecosystem-v02",
    section: "PRODUCT_DESIGN",
    lineId: "ECOSYSTEM_PLACE",
    instanceId: "bay-of-biscay",
    url: `https://${FACTORY_PREVIEW_HOST}/ecosystem/bay-of-biscay/`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 1440,
    height: 1000,
  },
  {
    id: "orch-one-interface-mobile-v02",
    title: "ONE INTERFACE mobile entry runtime evidence — Orchestra 02",
    projectId: "orch-product-v02",
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
  "orch-story-source-v02",
] as const;

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
    current: "Orchestra 01 exposed real Browser concurrency and source-size adapter defects; those defects are corrected without rewriting historical outcomes.",
    gold: "A conflict-free multi-project Orchestra 02 completes with persisted evidence, independent quality decisions and no unsafe side effects.",
    gap: "Prove corrected bounded Browser concurrency and authoritative source handling on the same real 4PLANET surfaces.",
    priority: "INCUBATING",
    user: "4PLANET Factory internal QA; Founder remains Human Gold judge.",
    authorityRefs: ["BRAIN current state", "GitHub PR #212", "Founder Human Gold direction 2026-09-01", "Orchestra 01 runtime evidence"],
    productionLine,
    lastMaterialProgressAt: nowIso,
  };
}

export function createShadowOrchestraProjects(nowIso = new Date().toISOString()): ProjectProjection[] {
  return [
    project("orch-species-v02", "Species/Journey runtime evidence orchestra 02", nowIso, {
      lineId: "SPECIES_JOURNEY",
      instanceId: "orchestra-batch-02",
      templateVersion: "02",
      role: "BATCH",
    }),
    project("orch-ecosystem-v02", "Ecosystem/Place runtime evidence orchestra 02", nowIso, {
      lineId: "ECOSYSTEM_PLACE",
      instanceId: "orchestra-batch-02",
      templateVersion: "02",
      role: "BATCH",
    }),
    project("orch-story-v02", "Story source-truth evidence orchestra 02", nowIso, {
      lineId: "STORY",
      instanceId: "humpback-source-proof-02",
      templateVersion: "02",
      role: "BATCH",
    }),
    project("orch-product-v02", "ONE INTERFACE entry evidence orchestra 02", nowIso),
  ];
}

const base = (projectId: string, nowIso: string): Omit<WorkPackage, "id" | "title" | "section" | "execution" | "learningQuestion" | "productionLine"> => ({
  projectId,
  priority: "INCUBATING",
  goalLink: "FACTORY WORLD CLASS BUILD 03 — real 4PLANET Orchestra 02",
  gapClosed: "Corrected independent real-world evidence on current 4PLANET work",
  deliverables: ["Persisted bounded evidence", "Independent quality decision", "Traceable outcome", "Learning candidate when material"],
  dependencies: [],
  writeScopes: [],
  definitionOfDone: [
    "A real current 4PLANET surface or authoritative source is checked through a bounded runtime adapter",
    "Independent quality authority evaluates the specialist evidence",
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
  criticalPath: 8,
  dependencyUnlock: 8,
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
          templateVersion: "02",
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
    learningQuestion: `Can Factory collect reliable ${probe.width}x${probe.height} evidence for ${probe.instanceId} after correcting bounded Browser concurrency, without confusing technical render proof with Human Gold?`,
  }));

  const storySource: WorkPackage = {
    ...base("orch-story-v02", nowIso),
    id: "orch-story-source-v02",
    title: "Living Ocean humpback NOAA source reachability and bounded provenance fingerprint — Orchestra 02",
    section: "RESEARCH_DATA",
    productionLine: {
      lineId: "STORY",
      instanceId: "humpback-cooperative-feeding",
      templateVersion: "02",
      stage: "SOURCE",
      role: "BATCH",
    },
    execution: {
      kind: "HTTP_SOURCE_CHECK",
      targetUrl: "https://www.fisheries.noaa.gov/species/humpback-whale",
      allowedHosts: ["fisheries.noaa.gov"],
    },
    learningQuestion: "Can Story Factory verify a normal-sized authoritative NOAA species page within a bounded source envelope without turning reachability into an unsupported scientific claim?",
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
