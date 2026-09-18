import type { BatchSelection, ProjectProjection, Section, WorkPackage } from "./contracts";
import { assertMutationPreservation, assertWorkPackageControl } from "./compoundControl";
import { scoreWorkPackage } from "./scoring";

const HOUR = 60 * 60 * 1000;
const HARD_WIP_CEILING = 5;

function overlaps(a: string[], b: string[]): boolean {
  return a.some((scopeA) => b.some((scopeB) => scopeA === scopeB || scopeA.startsWith(`${scopeB}/`) || scopeB.startsWith(`${scopeA}/`)));
}

function ageHours(project: ProjectProjection, now: number): number {
  if (!project.lastMaterialProgressAt) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(project.lastMaterialProgressAt);
  if (!Number.isFinite(parsed)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (now - parsed) / HOUR);
}

function serviceLevelOverdue(project: ProjectProjection, now: number): boolean {
  const age = ageHours(project, now);
  if (project.priority === "P1") return age >= 24;
  if (project.priority === "P2") return age >= 72;
  return false;
}

function serviceUrgency(project: ProjectProjection, now: number): number {
  const age = ageHours(project, now);
  if (!Number.isFinite(age)) return 1_000;
  if (project.priority === "P1") return age / 24;
  if (project.priority === "P2") return age / 72;
  return 0;
}

export function selectHourlyBatch(
  projects: Map<string, ProjectProjection>,
  packages: WorkPackage[],
  maxPackages = HARD_WIP_CEILING,
  now = Date.now(),
): BatchSelection {
  // Founder Decision FD-2026-09-02 sets a default hard ceiling of five
  // principal active mutations per execution line. Callers may request less,
  // but cannot silently widen the line above five.
  const effectiveMaxPackages = Math.max(1, Math.min(maxPackages, HARD_WIP_CEILING));
  const rejectedForControl: string[] = [];

  // Compound Control preflight. An orphan or a write without preservation/Zero
  // Loss evidence is not merely deprioritised; it is removed from this batch and
  // returned explicitly as a control rejection for correction/writeback.
  const controlled = packages.filter((pkg) => {
    try {
      assertWorkPackageControl(pkg);
      assertMutationPreservation(pkg);
      return true;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown control failure";
      rejectedForControl.push(`${pkg.id || "UNKNOWN"}: ${reason}`);
      return false;
    }
  });

  const scored = controlled
    .map((pkg) => {
      const project = projects.get(pkg.projectId);
      return project ? { pkg, project, score: scoreWorkPackage(pkg, project, now) } : null;
    })
    .filter((entry): entry is { pkg: WorkPackage; project: ProjectProjection; score: number } => Boolean(entry) && Number.isFinite(entry!.score))
    .sort((a, b) => b.score - a.score);

  const selected: WorkPackage[] = [];
  const rejectedForConflict: string[] = [];
  const usedScopes: string[] = [];
  const sections = new Set<Section>();
  const selectedIds = new Set<string>();
  const serviceLevelProtected: string[] = [];
  const serviceLevelDeferred: string[] = [];

  const trySelect = (entry: { pkg: WorkPackage; project: ProjectProjection; score: number }): boolean => {
    if (selected.length >= effectiveMaxPackages || selectedIds.has(entry.pkg.id)) return false;
    if (overlaps(entry.pkg.writeScopes, usedScopes)) {
      if (!rejectedForConflict.includes(entry.pkg.id)) rejectedForConflict.push(entry.pkg.id);
      return false;
    }
    selected.push(entry.pkg);
    selectedIds.add(entry.pkg.id);
    usedScopes.push(...entry.pkg.writeScopes);
    sections.add(entry.pkg.section);
    return true;
  };

  const strongestP0 = scored.find((entry) => entry.pkg.priority === "P0");
  if (strongestP0) trySelect(strongestP0);

  const overdueProjectIds = [...projects.values()]
    .filter((project) => !project.blockedReason && serviceLevelOverdue(project, now))
    .sort((a, b) => serviceUrgency(b, now) - serviceUrgency(a, now))
    .map((project) => project.id);

  for (const projectId of overdueProjectIds) {
    if (selected.length >= effectiveMaxPackages) {
      serviceLevelDeferred.push(projectId);
      continue;
    }
    const candidates = scored.filter((entry) => entry.pkg.projectId === projectId && !selectedIds.has(entry.pkg.id));
    const accepted = candidates.some((entry) => trySelect(entry));
    if (accepted) serviceLevelProtected.push(projectId);
    else serviceLevelDeferred.push(projectId);
  }

  for (const entry of scored) {
    if (selected.length >= effectiveMaxPackages) break;
    if (selectedIds.has(entry.pkg.id)) continue;
    if (overlaps(entry.pkg.writeScopes, usedScopes)) {
      if (!rejectedForConflict.includes(entry.pkg.id)) rejectedForConflict.push(entry.pkg.id);
      continue;
    }

    const unseenSectionExists = scored.some(
      (candidate) => !selectedIds.has(candidate.pkg.id) && !sections.has(candidate.pkg.section) && !overlaps(candidate.pkg.writeScopes, usedScopes),
    );
    if (selected.length >= 3 && sections.has(entry.pkg.section) && unseenSectionExists) continue;
    trySelect(entry);
  }

  return {
    generatedAt: new Date(now).toISOString(),
    packages: selected,
    rejectedForConflict,
    rejectedForControl,
    serviceLevelProtected,
    serviceLevelDeferred: [...new Set(serviceLevelDeferred)],
    rationale: [
      "NO ORPHANS + PRESERVE BEFORE MUTATE hard preflight before scoring",
      "FD-2026-09-02 hard WIP ceiling: maximum five principal packages per execution line",
      "Strongest conflict-free P0 work protected first",
      "Overdue P1/P2 projects receive a hard service-level selection attempt",
      "No overlapping write scopes",
      "Highest-value ready work fills remaining capacity",
      "Section diversity preferred once the critical path is protected",
    ],
  };
}
