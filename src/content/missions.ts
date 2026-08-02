// Compatibility surface only.
// The single public Domain/Mission truth source is narrativeContract.ts.

import {
  MISSIONS,
  getMission,
  type NarrativeMission,
  type NarrativeSource,
  type NarrativeStatus,
} from "@/content/narrativeContract";

export type MissionStatusLabel = NarrativeStatus;
export type MissionSource = NarrativeSource;
export type MissionContent = NarrativeMission;

export const MISSION_CONTENT = MISSIONS;
export const findMissionContent = getMission;
