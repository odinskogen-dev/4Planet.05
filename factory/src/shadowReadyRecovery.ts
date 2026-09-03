export const BUILD_READY_DRAIN_MARKER_PREFIX = "factory-shadow-orchestra-build-ready-drain";

const SHA40 = /^[0-9a-f]{40}$/i;

export function buildReadyDrainMarkerId(factoryBuildSha: string): string | undefined {
  const sha = factoryBuildSha.trim().toLowerCase();
  if (!SHA40.test(sha)) return undefined;
  return `${BUILD_READY_DRAIN_MARKER_PREFIX}-${sha.slice(0, 12)}`;
}

/**
 * A deploy-time SHADOW canary may inherit durable Orchestra rows that were
 * returned to READY after a prior transient Queue/Browser failure. Historical
 * one-time migration receipts cannot safely prove those rows are queued now.
 *
 * Recovery is therefore bound to the exact Factory build and may select only
 * allowlisted Orchestra package IDs that are currently READY and have no
 * persisted outcome. The caller must persist the build-bound receipt only
 * after the bounded queue send succeeds.
 */
export function planBuildBoundShadowReadyDrain(input: {
  mode: string;
  factoryBuildSha: string;
  markerPresent: boolean;
  orchestraPackageIds: readonly string[];
  work: Array<{ id: string; status: string }>;
  recordedOutcomeIds: Set<string>;
}): string[] {
  if (input.mode !== "SHADOW" || input.markerPresent) return [];
  if (!buildReadyDrainMarkerId(input.factoryBuildSha)) return [];

  const allowed = new Set(input.orchestraPackageIds);
  return input.work
    .filter((item) =>
      item.status === "READY"
      && allowed.has(item.id)
      && !input.recordedOutcomeIds.has(item.id)
    )
    .map((item) => item.id)
    .sort();
}
