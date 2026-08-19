import {
  projects as baseProjects,
  earlyStageProjects as baseEarlyStageProjects,
  projectionState,
  recentSystemMoves as baseRecentSystemMoves,
  type LabProject,
} from "./labsProjection";

export type { LabProject } from "./labsProjection";
export { projectionState };

export const verifiedAt = "20 AUG 2026";

function prependAssets(project: LabProject, assets: NonNullable<LabProject["assets"]>): NonNullable<LabProject["assets"]> {
  const combined = [...assets, ...(project.assets ?? [])];
  return combined.filter((asset, index) => combined.findIndex((candidate) => candidate.href === asset.href) === index);
}

const currentOverrides: Record<string, Partial<LabProject>> = {
  "4planet": {
    now: "Strategy & Goal Cascade v4.0 remains current authority. Current GitHub implementation evidence has advanced beyond the last durable BRAIN writeback: ONE INTERFACE PR #74 is OPEN / DRAFT / UNMERGED at exact head 0338e94cea19942d99655239550cec72d75aa316, and stacked Public Experience Convergence PR #86 is OPEN / DRAFT / UNMERGED at reconciliation head 88fdc8552a532a9a269702e9fc3b063169eae3bb. PR #86 now spans About / Founder, Magazine, navigation, Missions and shared public-experience convergence. Neither candidate is promoted into production by LABS. Capital truth remains 15 historical submissions / 14 awaiting / 1 rejected / 0 secured or awarded / 0 cash.",
    freshness: "BRAIN through 19 Aug 23:15 + GitHub reconciliation snapshot 20 Aug 2026",
  },
  "4planet/product": {
    now: "ONE INTERFACE remains the controlled public-product path. PR #74 is OPEN / DRAFT / UNMERGED at 0338e94cea19942d99655239550cec72d75aa316. The stacked Public Experience Convergence PR #86 is OPEN / DRAFT / UNMERGED at reconciliation head 88fdc8552a532a9a269702e9fc3b063169eae3bb and extends About / Founder, Magazine, navigation, Missions and shared public-experience convergence. These are implementation-state deltas after the last durable BRAIN writeback, not automatic BRAIN, Gold or production promotion.",
    freshness: "BRAIN + GitHub reconciliation snapshot · 20 Aug 2026",
  },
  "4planet/product/one-interface": {
    now: "20 AUG GITHUB RECONCILIATION — ONE INTERFACE PR #74 is OPEN / DRAFT / UNMERGED at exact head 0338e94cea19942d99655239550cec72d75aa316. The newer stacked Public Experience Convergence PR #86 is OPEN / DRAFT / UNMERGED at reconciliation head 88fdc8552a532a9a269702e9fc3b063169eae3bb and now spans About / Founder, Magazine, navigation, Missions and shared public-experience convergence. BRAIN remains durable authority; its last Programme Log writeback predates PR #86, so the newer PR is implementation evidence, not a BRAIN promotion or production release.",
    next: "Reconcile the current PR #74/#86 implementation line against exact-head QA and BRAIN, then present the same accepted artifact for Founder JUDGE / controlled release. Do not infer production promotion from draft PR state.",
    freshness: "BRAIN through 19 Aug 23:15 + GitHub reconciliation snapshot 20 Aug 2026",
    assets: [
      { label: "CURRENT · ONE INTERFACE PR #74", href: "https://github.com/odinskogen-dev/4Planet.05/pull/74", kind: "PREVIEW" },
      { label: "CURRENT · PUBLIC EXPERIENCE PR #86", href: "https://github.com/odinskogen-dev/4Planet.05/pull/86", kind: "PREVIEW" },
      { label: "BRANCH PREVIEW · ONE INTERFACE", href: "https://release-one-interface-univer.4planet-05.pages.dev", kind: "PREVIEW" },
    ],
  },
  "4planet/brand": {
    now: "Brand core remains proof-led and Founder-controlled. Current GitHub implementation evidence includes the stacked Public Experience Convergence PR #86, OPEN / DRAFT / UNMERGED at reconciliation head 88fdc8552a532a9a269702e9fc3b063169eae3bb, covering About / Founder, Magazine, navigation, Missions and public-surface convergence. This is a candidate implementation, not a production or BRAIN promotion.",
    freshness: "Founder Control + GitHub reconciliation snapshot · 20 Aug 2026",
  },

  "4planet/oce4n/wh4les": {
    state: "ACTIVE",
    priority: "ACTIVE NOW",
    now: "Founder Control current state: strong internal Orca proof path; external scientific review and delivery/protection proof remain open. WH4LES is the active whale reference implementation, not proof that intelligence/storytelling alone protects whales.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/oce4n/cor4l": {
    state: "QUEUED",
    priority: "MONITOR",
    now: "Founder Control current state: portfolio concept; no current partner or delivery proof. Keep authoritative reef heat-stress intelligence ready, but do not imply an active restoration programme.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/oce4n/plastic-clean": {
    state: "CONFLICT",
    priority: "FIRST-DELIVERY PREP / NAME CONFLICT",
    now: "Founder Control current state: prepared partner route, but no active/contracted partner and no delivery. PL4STIC won FIRST-DELIVERY PREP on proofability/speed/unit clarity/operator readiness; the PL4STIC/CLE4N naming conflict remains explicitly open.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/oce4n/rewild-marine": {
    state: "QUEUED",
    priority: "DEVELOP NEXT",
    now: "Founder Control current state: science/gap review and partner choice remain open. No field organisation, permit, operator or delivery should be inferred.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/e4rth/clim4te": {
    state: "QUEUED",
    priority: "DEVELOP NEXT",
    now: "Founder Control current state: internal Decision Intelligence architecture exists; external human validation remains incomplete. CLIM4TE stays a bounded decision-intelligence project rather than a generic climate dashboard.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/e4rth/am4zonia": {
    state: "HOLD",
    priority: "HOLD",
    now: "Founder Control current state: strategic concept with material legitimacy and partner gates open. AM4ZONIA remains HOLD until an Indigenous-first protocol and genuinely authorised local route exist; no public Impact Unit or extractive representation is implied.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/e4rth/species": {
    state: "ACTIVE",
    priority: "ACTIVE NOW / GOLD",
    now: "Founder Control current state: Jaguar Habitat World v1 is live on 4planet.org and the next build is the Jaguar Gold Reference with ATLAS / Ecosystem / Living Systems traversal and motion media. Orca remains the truth/dependency flagship. Current isolated Jaguar Journey PR #79 is separate implementation evidence and has unresolved exact-head acceptance after its latest gate was cancelled.",
    freshness: "Founder Control + GitHub current-state reconciliation · 20 Aug 2026",
  },
  "4planet/e4rth/rewild-land": {
    state: "HOLD",
    priority: "HOLD → DEVELOP NEXT",
    now: "Founder Control current state: prepared hypotheses; no contracted operator or delivery. Advance only after the first delivery-model proof or an unusually strong operator/funder route.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/s4piens/food": {
    state: "ACTIVE",
    priority: "P0",
    now: "20 AUG Founder Control current state: FOOD-4 implementation materially advanced. PICK v0.8 PR #85 exact head 7abd18e0a66992c339b1654d9f01dd540d3441ae passed its dedicated Prototype Gate and remains OPEN / DRAFT / UNMERGED / PRIVATE REVIEW. PICK remains a child implementation/economic object under SAP-FOOD-01 / CHOICE-V1, not a new Project Home. User/expert validation and public release remain open.",
    freshness: "Founder Control current row + GitHub exact readback · 20 Aug 2026",
  },
  "4planet/s4piens/energy": {
    state: "CONFLICT",
    priority: "MONITOR / NAME CONFLICT",
    now: "Founder Control current state: portfolio hold with no external pilot proof. The EN3RGY/EN4RGY identity conflict remains open and must not be silently resolved by LABS.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/s4piens/circular-city": {
    state: "QUEUED",
    priority: "DEVELOP NEXT",
    now: "Founder Control current state: bounded pilot concept only; no current external action. Develop after first reference proof or a strong municipality/buyer route.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/s4piens/f4shion": {
    state: "QUEUED",
    priority: "DEVELOP NEXT",
    now: "Founder Control current state: pilot definition only. F4SHION remains a later S4PIENS transfer case after FOOD/reference methodology proves useful; no universal green score or traceability=good claim.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/4culture/m4gazine": {
    priority: "MAINTAIN + FUNDING",
    now: "Founder Control current state: strong internal editorial architecture; funding, publication and rights gates remain. Editorial output should remain downstream of real proof/story triggers rather than become a detached content factory.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/4culture/4film": {
    state: "QUEUED",
    priority: "MAINTAIN + FUNDING",
    now: "Founder Control current state: active funding/evidence work, with production rights and producer gates still open. Deeper production remains gated on financing and rights safety.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/4culture/4rt": {
    state: "QUEUED",
    priority: "MAINTAIN + FUNDING",
    now: "Founder Control current state: prepared/funding-oriented; the underlying Impact partner/unit gate remains open. No active store, transferred Impact funds or ecological outcome is implied.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
  "4planet/4culture/4play": {
    state: "HOLD",
    priority: "HOLD",
    now: "Founder Control current state: concept/prepared, no current proof. Hold until proof, brand and capital make one activation unusually high leverage.",
    freshness: "Founder Control Project Pack · reviewed 19 Aug 2026",
  },
};

export const projects: LabProject[] = baseProjects.map((project) => {
  const override = currentOverrides[project.slug];
  if (!override) return project;
  const merged: LabProject = { ...project, ...override };
  if (project.slug === "4planet/product/one-interface" && override.assets) {
    merged.assets = prependAssets(project, override.assets);
  }
  return merged;
});

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

export const earlyStageProjects = baseEarlyStageProjects
  .map((project) => projectBySlug(project.slug))
  .filter((project): project is LabProject => Boolean(project));

export const founderQueue = projects.flatMap((project) =>
  (project.founderDecisions ?? []).map((decision) => ({
    slug: project.slug,
    project: project.title,
    decision,
  })),
);

const movingStates = new Set(["ACTIVE", "BUILDING", "PUBLIC"]);
const queuedStates = new Set(["QUEUED", "EXPERIMENT", "HOLD"]);

export const portfolioStats = {
  active: projects.filter((project) => movingStates.has(project.state)).length,
  queued: projects.filter((project) => queuedStates.has(project.state)).length,
  conflicts: projects.filter((project) => project.state === "CONFLICT").length,
  founder: founderQueue.length,
  aiActive: projects.reduce(
    (count, project) => count + (project.tasks ?? []).filter((task) => ["ACTIVE", "NEXT"].includes(task.state)).length,
    0,
  ),
};

export const recentSystemMoves: Array<readonly [string, string, string]> = [
  ["AUG20-PR86", "ONE INTERFACE Public Experience Convergence PR #86 is captured at reconciliation head 88fdc85…; it remains draft/unmerged and is not promoted into BRAIN or production by LABS.", "CURRENT"],
  ["AUG20-PR74", "ONE INTERFACE PR #74 current GitHub head is 0338e94…; current implementation state is kept separate from the older durable BRAIN writeback.", "CURRENT"],
  ["AUG20-GOALS", "Wave-01 Mission Project Goal Contracts are BASELINE COMPLETE in Founder Control; current Mission states have been reconciled from the same packs.", "SYNCED"],
  ...baseRecentSystemMoves,
];
