import type { WorkPackage } from "./contracts";

export type PackageStatusMap = ReadonlyMap<string, WorkPackage["status"]>;

/**
 * A blocked package may move to READY only when every declared dependency is
 * materially ACCEPTED. Missing, rejected, running or merely completed-looking
 * dependencies keep the package blocked. This is intentionally fail-closed.
 */
export function dependenciesAccepted(pkg: WorkPackage, statuses: PackageStatusMap): boolean {
  if (pkg.dependencies.length === 0) return true;
  return pkg.dependencies.every((dependencyId) => statuses.get(dependencyId) === "ACCEPTED");
}

export function releasableBlockedPackageIds(packages: WorkPackage[], statuses: PackageStatusMap): string[] {
  return packages
    .filter((pkg) => pkg.status === "BLOCKED" && pkg.dependencies.length > 0 && dependenciesAccepted(pkg, statuses))
    .map((pkg) => pkg.id);
}
