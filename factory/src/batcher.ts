import type { BatchSelection, ProjectProjection, Section, WorkPackage } from "./contracts";
import { scoreWorkPackage } from "./scoring";

const HOUR = 60 * 60 * 1000;

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
  maxPackages = 10,
  now = Date.now(),
): BatchSelection {
  const scored = packages
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
    if (selected.length >= maxPackages || selectedIds.has(entry.pkg.id)) return false;
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

  // P0 remains first-class every productive hour. Reserve the strongest
  // conflict-free P0 package before normal scoring when one exists.
  const strongestP0 = scored.find((entry) => entry.pkg.priority === "P0");
  if (strongestP0) trySelect(strongestP0);

  // Hard anti-stagnation: overdue P1/P2 projects receive one protected attempt,
  // ordered by service-level breach severity and then package value. This is
  // stronger than merely adding an aging score and prevents quiet starvation.
  const overdueProjectIds = [...projects.values()]
    .filter((project) => !project.blockedReason && serviceLevelOverdue(project, now))
    .sort((a, b) => serviceUrgency(b, now) - serviceUrgency(a, now))
    .map((project) => project.id);

  for (const projectId of overdueProjectIds) {
    if (selected.length >= maxPackages) {
      serviceLevelDeferred.push(projectId);
      continue;
    }
    const candidates = scored.filter((entry) => entry.pkg.projectId === projectId && !selectedIds.has(entry.pkg.id));
    const accepted = candidates.some((entry) => trySelect(entry));
    if (accepted) serviceLevelProtected.push(projectId);
    else serviceLevelDeferred.push(projectId);
  }

  // Fill remaining capacity by portfolio value while preserving write isolation
  // and useful section diversity once a substantive core batch exists.
  for (const entry of scored) {
    if (selected.length >= maxPackages) break;
    if (selectedIds.has(entry.pkg.id)) continue;
    if (overlaps(entry.pkg.writeScopes, usedScopes)) {
      if (!rejectedForConflict.includes(entry.pkg.id)) rejectedForConflict.push(entry.pkg.id);
      continue;
    }

    const unseenSectionExists = scored.some(
      (candidate) => !selectedIds.has(candidate.pkg.id) && !sections.has(candidate.pkg.section) && !overlaps(candidate.pkg.writeScopes, usedScopes),
    );
    if (selected.length >= 5 && sections.has(entry.pkg.section) && unseenSectionExists) continue;
    trySelect(entry);
  }

  return {
    generatedAt: new Date(now).toISOString(),
    packages: selected,
    rejectedForConflict,
    serviceLevelProtected,
    serviceLevelDeferred: [...new Set(serviceLevelDeferred)],
    rationale: [
      "Strongest conflict-free P0 work protected first",
      "Overdue P1/P2 projects receive a hard service-level selection attempt",
      "No overlapping write scopes",
      "Highest-value ready work fills remaining capacity",
      "Section diversity preferred once the critical path is protected",
    ],
  };
}
