import type { ProjectProjection, WorkPackage } from "./contracts";

export const ORCHESTRA_V04_PREFIX_RECOVERY_MARKER_ID = "factory-shadow-orchestra-v04-prefixed-queue-recovery-01";
export const ORCHESTRA_V04_READY_DRAIN_MARKER_ID = "factory-shadow-orchestra-v04-ready-drain-recovery-01";

/**
 * Exact durable-state fingerprint observed after the first 429 recovery fix was
 * deployed. These rows pre-date the fix and therefore cannot repair themselves:
 * the Durable Object survives code deploys and still stores them as RUNNING.
 */
export const ORCHESTRA_V04_PREFIX_STALE_IDS = [
  "orch-orca-desktop-v04",
  "orch-jaguar-mobile-v04",
  "orch-bay-mobile-v04",
  "orch-one-interface-mobile-v04",
] as const;

export function planLegacyOrchestraV04QueueRecovery(input: {
  mode: string;
  markerPresent: boolean;
  work: Array<{ id: string; status: string }>;
  recordedOutcomeIds: Set<string>;
}): string[] {
  if (input.mode !== "SHADOW" || input.markerPresent) return [];
  const state = new Map(input.work.map((item) => [item.id, item.status] as const));
  return ORCHESTRA_V04_PREFIX_STALE_IDS.filter((id) => {
    if (input.recordedOutcomeIds.has(id)) return false;
    const status = state.get(id);
    return status === "RUNNING" || status === "READY";
  });
}

/**
 * The first one-time migration correctly changed legacy RUNNING rows to READY
 * before queueing them. Runtime evidence later proved that two deliveries could
 * exhaust Queue retries while the durable rows remained READY. Because normal
 * ensureOrchestra treats every existing row as active, those exact rows would
 * never be queued again. This second receipt is deliberately narrower: one
 * additional enqueue only for unresolved READY rows from the exact V04 legacy
 * fingerprint, only in SHADOW, and never after an outcome exists.
 */
export function planPostRecoveryReadyDrain(input: {
  mode: string;
  markerPresent: boolean;
  work: Array<{ id: string; status: string }>;
  recordedOutcomeIds: Set<string>;
}): string[] {
  if (input.mode !== "SHADOW" || input.markerPresent) return [];
  const state = new Map(input.work.map((item) => [item.id, item.status] as const));
  return ORCHESTRA_V04_PREFIX_STALE_IDS.filter((id) =>
    !input.recordedOutcomeIds.has(id) && state.get(id) === "READY"
  );
}

export function createLegacyOrchestraV04RecoveryMarker(nowIso: string, recoveredIds: string[]): ProjectProjection {
  return {
    id: ORCHESTRA_V04_PREFIX_RECOVERY_MARKER_ID,
    name: "Orchestra 04 pre-fix durable queue recovery receipt",
    northStar: "Preserve one Factory and recover exact pre-fix SHADOW state without weakening acceptance or creating a second queue authority.",
    goal: "Record the one-time migration of pre-fix Orchestra 04 queue rows after the 429 retry repair.",
    current: `One-time SHADOW durable-state migration executed for: ${recoveredIds.join(", ") || "none"}.`,
    gold: "Legacy pre-fix RUNNING rows are retried once under the corrected queue contract; all subsequent 429 recovery uses the normal retry path.",
    gap: "Closed for this exact pre-fix state migration; runtime outcome proof remains separate.",
    priority: "P0",
    user: "4PLANET Production Factory control",
    authorityRefs: [
      "FD-2026-09-02",
      "FACT-G02",
      "FACT-G07",
      "Production Factory Autonomous Activation #33577758694",
    ],
    lastMaterialProgressAt: nowIso,
  };
}

export function createPostRecoveryReadyDrainMarker(nowIso: string, recoveredIds: string[]): ProjectProjection {
  return {
    id: ORCHESTRA_V04_READY_DRAIN_MARKER_ID,
    name: "Orchestra 04 post-recovery READY drain receipt",
    northStar: "Preserve one Factory and finish exact SHADOW queue recovery without duplicate recovery loops.",
    goal: "Record one additional enqueue of unresolved READY rows left after the first V04 migration and exhausted Queue delivery.",
    current: `One-time SHADOW READY-drain recovery executed for: ${recoveredIds.join(", ") || "none"}.`,
    gold: "Exact legacy V04 READY survivors receive one bounded re-enqueue; recorded outcomes, unrelated rows and future work remain untouched.",
    gap: "Closed only when deployed evidence proves the Orchestra drains 8/8 with no stranded RUNNING or duplicate persisted outcomes.",
    priority: "P0",
    user: "4PLANET Production Factory control",
    authorityRefs: [
      "FD-2026-09-02",
      "FACT-G02",
      "FACT-G07",
      "Production Factory Autonomous Activation #33593226194",
    ],
    lastMaterialProgressAt: nowIso,
  };
}

export function recoveredQueuePackage(pkg: WorkPackage): WorkPackage {
  return { ...pkg, status: "READY" };
}
