import type { ProductionLineId, ProjectProjection, Section, WorkPackage } from "./contracts";

export const SHADOW_ORCHESTRA_ID = "4planet-first-real-orchestra-v01";
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
    id: "orch-orca-mobile-v01",
    title: "Orca Human Gold candidate mobile runtime evidence",
    projectId: "orch-species-v01",
    section: "CODE_QA",
    lineId: "SPECIES_JOURNEY",
    instanceId: "orca",
    url: `https://${ORCA_RECOVERY_HOST}/journey/orca/`,
    allowedHosts: [ORCA_RECOVERY_HOST],
    width: 390,
    height: 844,
  },
  {
    id: "orch-orca-desktop-v01",
    title: "Orca Human Gold candidate desktop runtime evidence",
    projectId: "orch-species-v01",
    section: "PRODUCT_DESIGN",
    lineId: "SPECIES_JOURNEY",
    instanceId: "orca",
    url: `https://${ORCA_RECOVERY_HOST}/journey/orca/`,
    allowedHosts: [ORCA_RECOVERY_HOST],
    width: 1440,
    height: 1000,
  },
  {
    id: "orch-jaguar-mobile-v01",
    title: "Jaguar reference candidate mobile runtime evidence",
    projectId: "orch-species-v01",
    section: "CODE_QA",
    lineId: "SPECIES_JOURNEY",
    instanceId: "jaguar",
    url: `https://${FACTORY_PREVIEW_HOST}/journey/jaguar/`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 390,
    height: 844,
  },
  {
    id: "orch-acropora-mobile-v01",
    title: "Acropora transfer candidate mobile runtime evidence",
    projectId: "orch-species-v01",
    section: "PRODUCT_DESIGN",
    lineId: "SPECIES_JOURNEY",
    instanceId: "acropora-palmata",
    url: `https://${FACTORY_PREVIEW_HOST}/species/acropora-palmata`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 390,
    height: 844,
  },
  {
    id: "orch-bay-mobile-v01",
    title: "Bay of Biscay ecosystem mobile runtime evidence",
    projectId: "orch-ecosystem-v01",
    section: "CODE_QA",
    lineId: "ECOSYSTEM_PLACE",
    instanceId: "bay-of-biscay",
    url: `https://${FACTORY_PREVIEW_HOST}/ecosystem/bay-of-biscay/`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 390,
    height: 844,
  },
  {
    id: "orch-bay-desktop-v01",
    title: "Bay of Biscay ecosystem desktop runtime evidence",
    projectId: "orch-ecosystem-v01",
    section: "PRODUCT_DESIGN",
    lineId: "ECOSYSTEM_PLACE",
    instanceId: "bay-of-biscay",
    url: `https://${FACTORY_PREVIEW_HOST}/ecosystem/bay-of-biscay/`,
    allowedHosts: [FACTORY_PREVIEW_HOST],
    width: 1440,
    height: 1000,
  },
  {
    id: "orch-one-interface-mobile-v01",
    title: "ONE INTERFACE mobile entry runtime evidence",
    projectId: "orch-product-v01",
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
  "orch-story-source-v01",
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
    current: "Founder-approved products exist as pre-Gold/reference/transfer candidates and require continuous evidence-bearing QA.",
    gold: "A conflict-free multi-project orchestra completes with persisted evidence, independent quality decisions and no unsafe side effects.",
    gap: "First real 5–10 package Factory orchestra proof.",
    priority: "INCUBATING",
    user: "4PLANET Factory internal QA; Founder remains Human Gold judge.",
    authorityRefs: ["BRAIN current state", "GitHub PR #212", "Founder Human Gold direction 2026-09-01"],
    productionLine,
    lastMaterialProgressAt: nowIso,
  };
}

export function createShadowOrchestraProjects(nowIso = new Date().toISOString()): ProjectProjection[] {
  return [
    project("orch-species-v01", "Species/Journey Human Gold evidence orchestra", nowIso, {
      lineId: "SPECIES_JOURNEY",
      instanceId: "orchestra-batch-01",
      templateVersion: "01",
      role: "BATCH",
    }),
    project("orch-ecosystem-v01", "Ecosystem/Place Human Gold evidence orchestra", nowIso, {
      lineId: "ECOSYSTEM_PLACE",
      instanceId: "orchestra-batch-01",
      templateVersion: "01",
      role: "BATCH",
    }),
    project("orch-story-v01", "Story source-truth evidence orchestra", nowIso, {
      lineId: "STORY",
      instanceId: "living-ocean-source-proof",
      templateVersion: "01",
      role: "BATCH",
    }),
    project("orch-product-v01", "ONE INTERFACE entry evidence orchestra", nowIso),
  ];
}

const base = (projectId: string, nowIso: string): Omit<WorkPackage, "id" | "title" | "section" | "execution" | "learningQuestion" | "productionLine"> => ({
  projectId,
  priority: "INCUBATING",
  goalLink: "FACTORY WORLD CLASS BUILD 03 — first real 4PLANET orchestra",
  gapClosed: "Independent real-world evidence on current 4PLANET work",
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
  criticalPath: 7,
  dependencyUnlock: 6,
  proofValue: 10,
  cashValue: 0,
  learningValue: 8,
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
          templateVersion: "01",
          // OBSERVE deliberately does not equal the Human Gold QA stage. A
          // successful screenshot proves render evidence only, never Gold.
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
    learningQuestion: `Can Factory collect reliable ${probe.width}x${probe.height} evidence for ${probe.instanceId} without confusing technical render proof with Human Gold?`,
  }));

  const storySource: WorkPackage = {
    ...base("orch-story-v01", nowIso),
    id: "orch-story-source-v01",
    title: "Living Ocean humpback source reachability and provenance fingerprint",
    section: "RESEARCH_DATA",
    productionLine: {
      lineId: "STORY",
      instanceId: "humpback-cooperative-feeding",
      templateVersion: "01",
      stage: "SOURCE",
      role: "BATCH",
    },
    execution: {
      kind: "HTTP_SOURCE_CHECK",
      targetUrl: "https://www.fisheries.noaa.gov/species/humpback-whale",
      allowedHosts: ["fisheries.noaa.gov"],
    },
    learningQuestion: "Can Story Factory continuously verify an authoritative source endpoint without turning reachability into an unsupported scientific claim?",
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
