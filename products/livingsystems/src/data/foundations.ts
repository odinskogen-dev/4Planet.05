// ============================================================================
// FOUNDATIONS — Temporal / Capital / Decision / Learning Intelligence.
// ARCHITECTURE ONLY. These are deliberately minimal: typed registries with a
// small number of clearly-marked draft entries, so the long-term intelligence
// chain (… → Capital → Decisions → Learning) has real structure to grow into.
// Do not build advanced behaviour on these yet.
// ============================================================================

import type {
  TemporalObject,
  CapitalObject,
  DecisionObject,
  LearningFoundationRecord,
} from "@/types";

export const TEMPORAL: Record<string, TemporalObject> = {
  TMP_AMAZON_FOREST_COVER: {
    id: "TMP_AMAZON_FOREST_COVER",
    temporalType: "TimeSeries",
    title: "Amazon forest cover (draft)",
    subjectNodeId: "EC_AMAZON_RAINFOREST",
    metric: "Forest cover",
    draft: true,
    notes: "Placeholder for satellite-derived forest-cover series.",
  },
  TMP_JAGUAR_RANGE_TARGET: {
    id: "TMP_JAGUAR_RANGE_TARGET",
    temporalType: "Target",
    title: "Jaguar connected-range target (draft)",
    subjectNodeId: "SP_JAGUAR",
    draft: true,
  },
};

export const CAPITAL: Record<string, CapitalObject> = {
  CAP_PHILANTHROPIC: {
    id: "CAP_PHILANTHROPIC",
    capitalType: "Capital Source",
    title: "Philanthropic capital (draft)",
    draft: true,
  },
  CAP_RANGER_ALLOCATION: {
    id: "CAP_RANGER_ALLOCATION",
    capitalType: "Capital Allocation",
    title: "Allocation to ranger teams (draft)",
    draft: true,
    impactId: "IO_RANGER_TEAM",
  },
};

export const DECISIONS: Record<string, DecisionObject> = {
  DEC_AMAZON_PRIORITY: {
    id: "DEC_AMAZON_PRIORITY",
    decisionType: "Priority",
    title: "Prioritise Amazon habitat protection (draft)",
    draft: true,
  },
};

export const LEARNING: Record<string, LearningFoundationRecord> = {
  LRN_RANGER_OUTCOME: {
    id: "LRN_RANGER_OUTCOME",
    learningType: "Learning Record",
    title: "Ranger-team outcomes vs expectations (draft)",
    draft: true,
  },
};
