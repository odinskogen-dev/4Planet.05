// ============================================================================
// HUMAN SYSTEMS
// The systems of civilization that depend on living systems. Connected to the
// rest of the graph through Dependency edges (see dependencies.ts).
// ============================================================================

import type { HumanSystemNode, HumanSystemId } from "@/types";

const hs = (s: string) => s as HumanSystemId;

export const HUMAN_SYSTEMS: Record<HumanSystemId, HumanSystemNode> = {
  [hs("HS_AGRICULTURE")]: {
    id: hs("HS_AGRICULTURE"),
    name: "Regional Agriculture",
    humanTranslation: "Farming across a region, dependent on rain and soil.",
  },
  [hs("HS_INDIGENOUS_LIVELIHOODS")]: {
    id: hs("HS_INDIGENOUS_LIVELIHOODS"),
    name: "Indigenous Livelihoods",
    humanTranslation:
      "The ways Indigenous peoples live with and from the forest.",
  },
  [hs("HS_CLIMATE")]: {
    id: hs("HS_CLIMATE"),
    name: "Climate Stability",
    humanTranslation: "A climate stable enough for societies to plan around.",
  },
  [hs("HS_FOOD")]: {
    id: hs("HS_FOOD"),
    name: "Food System",
    humanTranslation: "How food is grown, supplied and reaches people.",
  },
  [hs("HS_WATER")]: {
    id: hs("HS_WATER"),
    name: "Water System",
    humanTranslation: "How fresh water is stored, cleaned and delivered.",
  },
  [hs("HS_ENERGY")]: {
    id: hs("HS_ENERGY"),
    name: "Energy System",
    humanTranslation: "How energy is produced and distributed.",
  },
  [hs("HS_HEALTHCARE")]: {
    id: hs("HS_HEALTHCARE"),
    name: "Healthcare System",
    humanTranslation: "How human health is maintained and treated.",
  },
  [hs("HS_URBAN")]: {
    id: hs("HS_URBAN"),
    name: "Urban System",
    humanTranslation: "How cities house and sustain people.",
  },
  [hs("HS_TRANSPORT")]: {
    id: hs("HS_TRANSPORT"),
    name: "Transport System",
    humanTranslation: "How people and goods move.",
  },
  [hs("HS_FINANCIAL")]: {
    id: hs("HS_FINANCIAL"),
    name: "Financial System",
    humanTranslation: "How capital is stored, moved and allocated.",
  },
  [hs("HS_INFORMATION")]: {
    id: hs("HS_INFORMATION"),
    name: "Information System",
    humanTranslation: "How knowledge and data flow through society.",
  },
  [hs("HS_GOVERNANCE")]: {
    id: hs("HS_GOVERNANCE"),
    name: "Governance System",
    humanTranslation: "How decisions and rules are made and enforced.",
  },
  [hs("HS_MANUFACTURING")]: {
    id: hs("HS_MANUFACTURING"),
    name: "Manufacturing System",
    humanTranslation: "How materials become products.",
  },
};
