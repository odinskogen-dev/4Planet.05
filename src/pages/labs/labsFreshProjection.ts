import {
  projects as baseProjects,
  earlyStageProjects as baseEarlyStageProjects,
  projectionState,
  verifiedAt as baseVerifiedAt,
  type LabProject,
} from "./labsProjection";

export type { LabProject } from "./labsProjection";
export { projectionState };

export const verifiedAt = "20 AUG 2026";

const ONE_INTERFACE_SLUG = "4planet/product/one-interface";

function prependAssets(project: LabProject, assets: NonNullable<LabProject["assets"]>): NonNullable<LabProject["assets"]> {
  const combined = [...assets, ...(project.assets ?? [])];
  return combined.filter((asset, index) => combined.findIndex((candidate) => candidate.href === asset.href) === index);
}

export const projects: LabProject[] = baseProjects.map((project) => {
  if (project.slug !== ONE_INTERFACE_SLUG) return project;
  return {
    ...project,
    now: "20 AUG GITHUB READBACK — ONE INTERFACE PR #74 is OPEN / DRAFT / UNMERGED at exact head 0338e94cea19942d99655239550cec72d75aa316. A newer stacked About × Founder narrative slice exists as PR #86 at 5b9f359dfceffbe134ef8ee64a5dac2a6f75909c. BRAIN remains durable authority; its last Programme Log writeback predates PR #86, so the newer PR is implementation evidence, not a BRAIN promotion or production release.",
    next: "Reconcile the current PR #74/#86 implementation line against exact-head QA and BRAIN, then present the same accepted artifact for Founder JUDGE / controlled release. Do not infer production promotion from draft PR state.",
    freshness: "BRAIN through 19 Aug 23:15 + GitHub exact readback 20 Aug 2026",
    assets: prependAssets(project, [
      { label: "CURRENT · ONE INTERFACE PR #74", href: "https://github.com/odinskogen-dev/4Planet.05/pull/74", kind: "PREVIEW" },
      { label: "CURRENT · ABOUT / FOUNDER PR #86", href: "https://github.com/odinskogen-dev/4Planet.05/pull/86", kind: "PREVIEW" },
      { label: "BRANCH PREVIEW · ONE INTERFACE", href: "https://release-one-interface-univer.4planet-05.pages.dev", kind: "PREVIEW" },
    ]),
  };
});

export function projectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function childrenOf(slug: string) {
  return projects.filter((project) => project.parent === slug);
}

export function descendantsOf(slug: string) {
  const direct = childrenOf(slug);
  return direct.flatMap((project) => [project, ...descendantsOf(project.slug)]);
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

export const recentSystemMoves: Array<[string, string, string]> = [
  ["AUG20-PR86", "ONE INTERFACE gained a newer stacked About × Founder narrative slice (PR #86); it remains draft/unmerged and is not promoted into BRAIN or production by LABS.", "CURRENT"],
  ["AUG20-PR74", "ONE INTERFACE PR #74 current GitHub head is 0338e94…; current implementation state is kept separate from the older durable BRAIN writeback.", "CURRENT"],
  ...baseProjects.length && baseVerifiedAt ? [] : [],
];

// Preserve the dated base feed after the two newest implementation deltas.
// Imported lazily below to keep BRAIN authority wording unchanged.
import { recentSystemMoves as baseRecentSystemMoves } from "./labsProjection";
recentSystemMoves.push(...baseRecentSystemMoves);
