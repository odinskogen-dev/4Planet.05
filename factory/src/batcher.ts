import type { BatchSelection, ProjectProjection, Section, WorkPackage } from "./contracts";
import { scoreWorkPackage } from "./scoring";

function overlaps(a: string[], b: string[]): boolean {
  return a.some((scopeA) => b.some((scopeB) => scopeA === scopeB || scopeA.startsWith(`${scopeB}/`) || scopeB.startsWith(`${scopeA}/`)));
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
      return project ? { pkg, score: scoreWorkPackage(pkg, project, now) } : null;
    })
    .filter((entry): entry is { pkg: WorkPackage; score: number } => Boolean(entry) && Number.isFinite(entry!.score))
    .sort((a, b) => b.score - a.score);

  const selected: WorkPackage[] = [];
  const rejectedForConflict: string[] = [];
  const usedScopes: string[] = [];
  const sections = new Set<Section>();

  for (const entry of scored) {
    if (selected.length >= maxPackages) break;
    if (overlaps(entry.pkg.writeScopes, usedScopes)) {
      rejectedForConflict.push(entry.pkg.id);
      continue;
    }

    const diversityBonus = sections.has(entry.pkg.section) ? 0 : 1;
    if (selected.length >= 5 && diversityBonus === 0 && scored.some((x) => !sections.has(x.pkg.section))) continue;

    selected.push(entry.pkg);
    usedScopes.push(...entry.pkg.writeScopes);
    sections.add(entry.pkg.section);
  }

  return {
    generatedAt: new Date(now).toISOString(),
    packages: selected,
    rejectedForConflict,
    rationale: [
      "Highest-value ready work first",
      "No overlapping write scopes",
      "P0 protected without monopolising the portfolio",
      "P1/P2 aging increases priority when material progress stalls",
      "Section diversity preferred once the critical path is protected",
    ],
  };
}
