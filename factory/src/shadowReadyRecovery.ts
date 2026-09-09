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
 * recovery receipts are observability evidence only: they must never make a
 * currently unresolved READY Work Package disappear from scheduling.
 *
 * Recovery is therefore bound to the exact Factory build and may select only
 * allowlisted Orchestra package IDs that are currently READY and have no
 * persisted outcome. The caller moves selected rows to DISPATCHED before the
 * queue send, which prevents concurrent canary reads from creating duplicate
 * deliveries. If a later bounded Queue retry cycle exhausts and returns the row
 * to READY, a subsequent canary is allowed to re-enqueue it rather than strand
 * valuable work forever.
 */
export function planBuildBoundShadowReadyDrain(input: {
  mode: string;
  factoryBuildSha: string;
  markerPresent: boolean;
  orchestraPackageIds: readonly string[];
  work: Array<{ id: string; status: string }>;
  recordedOutcomeIds: Set<string>;
}): string[] {
  if (input.mode !== "SHADOW") return [];
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
