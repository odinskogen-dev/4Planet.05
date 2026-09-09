import type { ProjectProjection, WorkPackage } from "./contracts";

const HOUR = 60 * 60 * 1000;

export function agingBonus(project: ProjectProjection, now = Date.now()): number {
  if (!project.lastMaterialProgressAt) return project.priority === "P0" ? 30 : 20;
  const ageHours = Math.max(0, (now - Date.parse(project.lastMaterialProgressAt)) / HOUR);

  if (project.priority === "P0") return Math.min(40, ageHours * 2);
  if (project.priority === "P1") return ageHours >= 24 ? Math.min(35, 10 + (ageHours - 24)) : ageHours / 6;
  if (project.priority === "P2") return ageHours >= 72 ? Math.min(30, 8 + (ageHours - 72) / 2) : ageHours / 18;
  return 0;
}

export function deadlineBonus(deadlineAt?: string, now = Date.now()): number {
  if (!deadlineAt) return 0;
  const hours = (Date.parse(deadlineAt) - now) / HOUR;
  if (hours <= 0) return 30;
  if (hours <= 6) return 25;
  if (hours <= 24) return 18;
  if (hours <= 72) return 10;
  return 2;
}

export function scoreWorkPackage(pkg: WorkPackage, project: ProjectProjection, now = Date.now()): number {
  if (pkg.status !== "READY") return Number.NEGATIVE_INFINITY;
  if (pkg.priority === "PARKED" || pkg.priority === "INCUBATING") return Number.NEGATIVE_INFINITY;
  if (pkg.dependencies.length > 0 || project.blockedReason) return Number.NEGATIVE_INFINITY;

  const priorityBase = pkg.priority === "P0" ? 60 : pkg.priority === "P1" ? 35 : pkg.priority === "P2" ? 20 : 0;

  return (
    priorityBase +
    pkg.estimatedValue * 4 +
    pkg.criticalPath * 5 +
    pkg.dependencyUnlock * 4 +
    pkg.proofValue * 4 +
    pkg.cashValue * 4 +
    pkg.learningValue * 3 +
    agingBonus(project, now) +
    deadlineBonus(pkg.deadlineAt, now) -
    pkg.risk * 4 -
    pkg.founderBurden * 4 -
    pkg.concurrencyCost * 3
  );
}
