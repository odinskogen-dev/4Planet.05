import { validateBrainProjection, type BrainProjectionSnapshot } from "./brainProjection";
import { selectHourlyBatch } from "./batcher";
import type { BatchSelection, ProjectProjection, WorkPackage } from "./contracts";

export interface ProjectionReceipt {
  authority: "CURRENT_DRIVE_BRAIN";
  readOnly: true;
  snapshotRetrievedAt: string;
  ingestedAt: string;
  sourceRefs: string[];
  projectIds: string[];
  projectCount: number;
  candidatePackageCount: number;
  unresolvedPackageIds: string[];
}

export interface ShadowTrialResult {
  mode: "SHADOW";
  receipt: ProjectionReceipt;
  projects: ProjectProjection[];
  batch: BatchSelection;
}

export interface ShadowTrialOptions {
  maxPackages?: number;
  now?: number;
  maxSnapshotAgeMs?: number;
}

/**
 * Builds a comparison-ready SHADOW batch directly from a read-only CURRENT
 * Drive/BRAIN projection. This function has no persistence, write adapter,
 * workflow dispatch or production side effect. It is deliberately usable by
 * tests/simulations before the runtime is allowed to ingest authority state.
 */
export function runShadowTrial(
  snapshot: BrainProjectionSnapshot,
  packages: WorkPackage[],
  options: ShadowTrialOptions = {},
): ShadowTrialResult {
  const now = options.now ?? Date.now();
  const maxSnapshotAgeMs = options.maxSnapshotAgeMs ?? 6 * 60 * 60 * 1000;
  const validated = validateBrainProjection(snapshot);
  const retrievedAtMs = Date.parse(validated.retrievedAt);

  if (retrievedAtMs > now + 5 * 60 * 1000) {
    throw new Error("BRAIN projection retrievedAt is implausibly in the future");
  }
  if (now - retrievedAtMs > maxSnapshotAgeMs) {
    throw new Error("BRAIN projection is stale for shadow scheduling");
  }

  const projects = new Map(validated.projects.map((project) => [project.id, project] as const));
  const unresolvedPackageIds = packages
    .filter((pkg) => !projects.has(pkg.projectId))
    .map((pkg) => pkg.id);
  const resolvedPackages = packages.filter((pkg) => projects.has(pkg.projectId));
  const batch = selectHourlyBatch(projects, resolvedPackages, options.maxPackages ?? 10, now);

  return Object.freeze({
    mode: "SHADOW" as const,
    receipt: Object.freeze({
      authority: validated.authority,
      readOnly: true as const,
      snapshotRetrievedAt: validated.retrievedAt,
      ingestedAt: new Date(now).toISOString(),
      sourceRefs: [...validated.sourceRefs],
      projectIds: validated.projects.map((project) => project.id),
      projectCount: validated.projects.length,
      candidatePackageCount: packages.length,
      unresolvedPackageIds,
    }),
    projects: [...validated.projects],
    batch,
  });
}
