import type { ProjectProjection, WorkPackage } from "./contracts";

export const SHADOW_CANARY_PROJECT_ID = "factory-shadow-canary-v01";
export const SHADOW_SOURCE_PACKAGE_ID = "factory-shadow-canary-source-v01";
export const SHADOW_BROWSER_PACKAGE_ID = "factory-shadow-canary-browser-v01";

export const SHADOW_SOURCE_WORKFLOW_ID = "factory-shadow-source-v01";
export const SHADOW_BROWSER_WORKFLOW_ID = "factory-shadow-browser-v01";

export function createShadowCanaryProject(nowIso = new Date().toISOString()): ProjectProjection {
  return {
    id: SHADOW_CANARY_PROJECT_ID,
    name: "Production Factory SHADOW canary",
    northStar: "Prove the 4PLANET Production Factory can execute durable, bounded, evidence-bearing work without LIVE or irreversible authority.",
    goal: "Verify real Cloudflare Agent → Workflow → specialist → tool → evaluator → learning plumbing.",
    current: "Dedicated SHADOW runtime candidate deployed or pending deployment.",
    gold: "Two deterministic read-only canaries complete with persisted outcomes, workflow proof and at least one learning candidate.",
    gap: "Real deployed runtime round-trip evidence.",
    priority: "INCUBATING",
    user: "Internal factory QA only",
    authorityRefs: ["GitHub PR #212", "GitHub issue #211"],
    lastMaterialProgressAt: nowIso,
  };
}

const basePackage = (nowIso: string): Omit<WorkPackage, "id" | "title" | "section" | "execution" | "learningQuestion"> => ({
  projectId: SHADOW_CANARY_PROJECT_ID,
  priority: "INCUBATING",
  goalLink: "Production Factory V01 deployed SHADOW runtime proof",
  gapClosed: "Real durable read-only execution evidence",
  deliverables: ["Persisted workflow outcome", "Material-progress evaluation input", "Learning candidate when accepted"],
  dependencies: [],
  writeScopes: [],
  definitionOfDone: [
    "Cloudflare durable workflow reaches a specialist sub-agent",
    "Specialist performs only its explicit bounded read-only execution",
    "Outcome persists in parent Agent state",
    "No LIVE, external send, payment, signature, canon promotion or arbitrary code write occurs",
  ],
  requiredEvidence: ["PASS", "source or browser runtime evidence"],
  zeroLoss: {
    required: false,
    donorUniverseRefs: [],
    dispositions: [],
    orphanCount: 0,
    winnerParityEvidence: [],
    checkedAt: nowIso,
  },
  createdAt: nowIso,
  estimatedValue: 10,
  criticalPath: 10,
  dependencyUnlock: 10,
  proofValue: 10,
  cashValue: 0,
  learningValue: 9,
  risk: 1,
  founderBurden: 0,
  concurrencyCost: 1,
  status: "READY",
});

export function createShadowCanaryPackages(nowIso = new Date().toISOString()): WorkPackage[] {
  const base = basePackage(nowIso);
  return [
    {
      ...base,
      id: SHADOW_SOURCE_PACKAGE_ID,
      title: "SHADOW source-verification round-trip",
      section: "RESEARCH_DATA",
      execution: {
        kind: "HTTP_SOURCE_CHECK",
        targetUrl: "https://developers.cloudflare.com/robots.txt",
        allowedHosts: ["developers.cloudflare.com"],
      },
      learningQuestion: "Can the durable Factory execute and persist a real bounded source-verification package without unsafe side effects?",
    },
    {
      ...base,
      id: SHADOW_BROWSER_PACKAGE_ID,
      title: "SHADOW browser-QA round-trip",
      section: "CODE_QA",
      execution: {
        kind: "BROWSER_QA",
        targetUrl: "https://developers.cloudflare.com/agents/",
        allowedHosts: ["developers.cloudflare.com"],
        viewport: { width: 390, height: 844, deviceScaleFactor: 1 },
      },
      learningQuestion: "Can the durable Factory execute and persist real bounded browser QA through a specialist without unsafe side effects?",
    },
  ];
}
