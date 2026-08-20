import {
  projects as baseProjects,
  labTracks as baseLabTracks,
  productSurfaces as baseProductSurfaces,
  projectionState,
  recentSystemMoves as baseRecentSystemMoves,
  type LabProject,
} from "./labsFreshProjection";

export type { LabProject } from "./labsFreshProjection";
export { projectionState };
export const verifiedAt = "21 AUG 2026";

const overrides: Record<string, Partial<LabProject>> = {
  "4planet": {
    now: "4PLANET is operating from Founder-approved Strategy & Goal Cascade v4.0. The immediate public-product bottleneck is Founder visual judgement of the exact PR #92 candidate; capital remains pre-award, pre-contract and pre-cash.",
    next: "Judge the exact current public candidate, then move only the accepted artifact through controlled release while proof, capital, delivery and autonomous production continue in parallel.",
    freshness: "Founder Control + GitHub readback · 21 Aug 2026",
  },
  "4planet/product": {
    now: "The current public-product candidate is ONE INTERFACE PR #92. Its exact artifact passed technical, browser, rights, source and security convergence and its immutable Cloudflare preview identity is verified. Production is unchanged; Founder visual judgement is the remaining release authority.",
    next: "Open the current immutable PR #92 preview and decide ACCEPT / EDIT / HOLD. Only the same accepted artifact may be promoted.",
    freshness: "Founder Control SYS-P00-PRODUCT + PR #92 · read 21 Aug 2026",
    assets: [
      { label: "OPEN CURRENT PUBLIC CANDIDATE", href: "https://e32a35e9.4planet-05.pages.dev", kind: "PREVIEW" },
      { label: "OPEN PR #92", href: "https://github.com/odinskogen-dev/4Planet.05/pull/92", kind: "REPO" },
      { label: "OPEN PRODUCTION", href: "https://4planet.org", kind: "WEB" },
    ],
  },
  "4planet/product/one-interface": {
    now: "ONE INTERFACE PR #92 is the current Founder-review candidate. The exact artifact is technically and rights-clean, the immutable preview is verified and production remains unchanged.",
    next: "Founder visual judgement on the exact current preview. If accepted, promote only that artifact; if not, iterate on a new bounded candidate and re-gate it.",
    freshness: "Founder Control + PR #92 · read 21 Aug 2026",
    assets: [
      { label: "OPEN CURRENT PREVIEW", href: "https://e32a35e9.4planet-05.pages.dev", kind: "PREVIEW" },
      { label: "OPEN PR #92", href: "https://github.com/odinskogen-dev/4Planet.05/pull/92", kind: "REPO" },
      { label: "OPEN 4PLANET.ORG", href: "https://4planet.org", kind: "WEB" },
    ],
  },
  "4planet/e4rth/species": {
    now: "SPECIES is active Gold work. An accepted internal shared-context Jaguar baseline exists and has a verified immutable preview. PR #79 has advanced beyond that baseline into a premium Jaguar + Orca transfer line; the newer exact head remains draft until current exact-head convergence proves it.",
    next: "Exact-head gate the current PR #79 premium line, then inspect Jaguar + Orca + Solutions on the same accepted artifact before any Gold or production promotion.",
    freshness: "Founder Control EAR-SPECIES-01 + current PR #79 readback · 21 Aug 2026",
    assets: [
      { label: "OPEN SPECIES PRODUCT", href: "https://4planet.org/species", kind: "WEB" },
      { label: "OPEN ACCEPTED JAGUAR BASELINE", href: "https://756dff8b.4planet-05.pages.dev/journey/jaguar/", kind: "PREVIEW" },
      { label: "OPEN CURRENT JOURNEY PR #79", href: "https://github.com/odinskogen-dev/4Planet.05/pull/79", kind: "REPO" },
      { label: "OPEN SPECIES MISSION", href: "https://4planet.org/missions/species", kind: "WEB" },
    ],
  },
  "4planet/economy": {
    now: "ECONOMY_ is a canonical shared Project Home. v0.1 exists as a DEMO / NOT LIVE control-surface concept, but the previously projected GitHub PR link is currently broken and is withheld here. No bank or accounting source is connected.",
    next: "Recover a verified digital home, then map one bounded real source period and prove 100% reconciliation before wider source integration or any live-finance claim.",
    freshness: "Founder Control SYS-P00-ECONOMY + LABS link QA · read 21 Aug 2026",
    assets: [],
  },
  "4planet/labs-system": {
    now: "LABS remains an open draft read-only projection over BRAIN. The current V6 pass is replacing stale hard-coded current-state seams with a controlled projection adapter and materially strengthening every Project Detail without changing the visual system.",
    next: "Close exact-head browser/link/mobile QA, verify the current preview identity and only then return the candidate for Founder use/judgement.",
    freshness: "Founder Control SYS-P00-LABS + PR #54 current work · 21 Aug 2026",
    assets: [{ label: "OPEN LABS PR #54", href: "https://github.com/odinskogen-dev/4Planet.05/pull/54", kind: "REPO" }],
  },
};

const additions: LabProject[] = [
  {
    slug: "4planet/sonic",
    universe: "4PLANET",
    kind: "SYSTEM",
    parent: "4planet",
    projectId: "SYS-SONIC-01",
    projectClass: "PROJECT HOME",
    title: "SONIC",
    eyebrow: "PROJECT HOME / SOUND + CULTURE",
    state: "ACTIVE",
    priority: "P1 / BOUNDED BUILD",
    accent: "culture",
    summary: "A shared rights-aware sound layer for species, place, learning, acoustic evidence, immersion and culture.",
    why: "Sound is a real biological, spatial, educational and cultural dimension of the living planet; treating it as shared infrastructure can strengthen SPECIES, WH4LES, ATLAS, XR and 4CULTURE without duplicating product stacks.",
    now: "Founder activated SONIC on 20 Aug. The Project Home and contracts exist; no coded SONIC primitive or verified public prototype is projected yet.",
    next: "Build AudioAsset + CreatorPermissionGrant v0.1, close rights/source boundaries and produce Orca Sonic Gold before unlike-species transfer.",
    aiPlan: "Shared audio/rights contract → reusable player → Orca Gold → unlike-species transfer → creator permission/value proof → evidence-based scale/hold.",
    evidence: "Founder Control · SYS-SONIC-01 Project Pack",
    owner: "AXE / PRODUCT / TRUTH / 4CULTURE",
    authority: "BRAIN / FOUNDER CONTROL / RIGHTS GATES",
    freshness: "Founder Control readback · 21 Aug 2026",
  },
  {
    slug: "4planet/labs-system/creator-engine",
    universe: "4PLANET",
    kind: "LAB",
    parent: "4planet/labs-system",
    projectId: "LAB-CREATOR-01",
    projectClass: "LAB / PROTOTYPE",
    labStage: "EARLY",
    title: "CREATOR ENGINE",
    eyebrow: "LABS PROJECT / CRE4TORS_",
    state: "BUILDING",
    priority: "P1/P2 / HUMAN VALIDATION NEXT",
    accent: "culture",
    summary: "Creator operating infrastructure for reducing admin/economic friction and returning more time, agency and opportunity to independent creators.",
    why: "Creators experience work, rights, money, opportunities and time as one system. A complete loop may create more human value than isolated creator tools while supplying voluntary creative capacity to living-planet work.",
    now: "CRE4TORS_ v0.3 is Founder-visible and exact-head technically verified. The exact Cloudflare preview is live; dedicated cre4tors.com custom-domain binding and real human/economic validation remain open.",
    next: "Founder visual judgement → dedicated domain binding verification → two private creator workflow tests → one real complete rights-safe creator-value loop.",
    aiPlan: "Prototype → comprehension → typed contracts → private unlike-user tests → one real value/economic loop → scale / hold / kill from evidence.",
    evidence: "Founder Control · LAB-CREATOR-01 · GitHub PR #95",
    owner: "AXE / PRODUCT / ECONOMY / SONIC",
    authority: "LABS / BRAIN / FOUNDER RELEASE / PROFESSIONAL REGULATED BOUNDARIES",
    freshness: "Founder Control + PR #95 readback · 21 Aug 2026",
    assets: [
      { label: "OPEN CRE4TORS_ V0.3", href: "https://e8c3e7d9.4planet-05.pages.dev/cre4tors", kind: "PREVIEW" },
      { label: "OPEN CREATOR ENGINE PR #95", href: "https://github.com/odinskogen-dev/4Planet.05/pull/95", kind: "REPO" },
    ],
  },
];

function merge(project: LabProject): LabProject {
  const override = overrides[project.slug];
  if (!override) return project;
  const merged = { ...project, ...override } as LabProject;
  if (override.assets) merged.assets = override.assets;
  return merged;
}

const baseSlugs = new Set(baseProjects.map((project) => project.slug));
export const projects: LabProject[] = [
  ...baseProjects.map((project) => merge(project)),
  ...additions.filter((project) => !baseSlugs.has(project.slug)),
];

export function projectBySlug(slug: string): LabProject | undefined {
  return projects.find((project) => project.slug === slug);
}

export function childrenOf(slug: string): LabProject[] {
  return projects.filter((project) => project.parent === slug);
}

export function descendantsOf(slug: string): LabProject[] {
  const direct = childrenOf(slug);
  return direct.flatMap((project): LabProject[] => [project, ...descendantsOf(project.slug)]);
}

export const universeRoots = projects.filter((project) => project.kind === "ROOT");
export const projectHomes = projects.filter((project) => project.universe === "4PLANET" && project.projectClass === "PROJECT HOME");

const productSlugs = new Set(baseProductSurfaces.map((project) => project.slug));
export const productSurfaces = projects.filter((project) => productSlugs.has(project.slug));

const labSlugs = new Set([
  ...baseLabTracks.map((project) => project.slug),
  ...additions.filter((project) => project.projectClass === "LAB / PROTOTYPE").map((project) => project.slug),
]);
export const labTracks = projects.filter((project) => labSlugs.has(project.slug));

export const founderQueue = projects.flatMap((project) =>
  (project.founderDecisions ?? []).map((decision) => ({ slug: project.slug, project: project.title, decision })),
);

const activeStates = new Set(["ACTIVE", "BUILDING", "PUBLIC"]);
export const portfolioStats = {
  projectHomes: projectHomes.length,
  activeProjectHomes: projectHomes.filter((project) => activeStates.has(project.state)).length,
  labTracks: labTracks.length,
  founder: founderQueue.filter((item) => item.slug.startsWith("4planet")).length,
  conflicts: projects.filter((project) => project.universe === "4PLANET" && project.state === "CONFLICT").length,
};

export const recentSystemMoves: Array<readonly [string, string, string]> = [
  ["AUG21-LABS", "LABS V6 is reconciling current BRAIN into a richer read-only Project Detail and removing stale/broken Founder-facing links.", "BUILDING"],
  ["AUG20-PUBLIC", "PR #92 is the current verified immutable ONE INTERFACE Founder-review candidate; production remains unchanged until Founder visual acceptance.", "CURRENT"],
  ["AUG20-SONIC", "SONIC is now a bounded Project Home for shared rights-aware sound, beginning with Orca Gold and transfer proof.", "ACTIVE"],
  ["AUG20-CREATOR", "CREATOR ENGINE / CRE4TORS_ v0.3 has exact-head technical proof; domain binding and real creator-value validation remain open.", "BUILDING"],
  ["AUG20-SPECIES", "SPECIES has an accepted shared-context baseline; newer Jaguar + Orca premium work remains draft until exact-head acceptance.", "GATED"],
  ...baseRecentSystemMoves,
];
