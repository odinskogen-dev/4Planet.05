export const COORDINATION_CONTRACT_VERSION = "PCI-01" as const;

export const COORDINATION_NODE_KINDS = [
  "PROBLEM",
  "PLACE",
  "ECOSYSTEM",
  "VALUE_CHAIN_NODE",
  "EVIDENCE",
  "ACTIONABLE_GAP",
  "SOLUTION",
  "INNOVATION",
  "ACTOR",
  "CAPABILITY",
  "CAPITAL_ACTOR",
  "CAPITAL_INSTRUMENT",
  "CAPITAL_NEED",
  "PROJECT",
  "ACTION",
  "RESULT",
  "LEARNING",
] as const;

export type CoordinationNodeKind = (typeof COORDINATION_NODE_KINDS)[number];
export type CoordinationReviewState = "DRAFT" | "SOURCE_BACKED" | "REVIEWED" | "BLOCKED";
export type CoordinationVisibility = "PUBLIC_SAFE" | "INTERNAL" | "RESTRICTED";
export type CoordinationConfidence = "HIGH" | "MEDIUM" | "LOW" | "UNRESOLVED";

export type CoordinationNode = {
  id: string;
  kind: CoordinationNodeKind;
  label: string;
  reviewState: CoordinationReviewState;
  visibility: CoordinationVisibility;
  sourceIds: string[];
  externalIds?: Record<string, string>;
  placeIds?: string[];
  validFrom?: string;
  validTo?: string;
  reviewedAt?: string;
  limitation?: string;
};

export const COORDINATION_RELATION_KINDS = [
  "LOCATED_IN",
  "PART_OF",
  "EVIDENCED_BY",
  "DERIVES_GAP",
  "ADDRESSED_BY",
  "INSTANTIATED_BY",
  "HAS_CAPABILITY",
  "CAPABLE_OF",
  "REQUIRES_CAPITAL",
  "OFFERS_INSTRUMENT",
  "ELIGIBLE_FOR",
  "FUNDS",
  "IMPLEMENTS",
  "PRODUCES_RESULT",
  "GENERATES_LEARNING",
  "INFORMS",
  "RELATED_TO",
] as const;

export type CoordinationRelationKind = (typeof COORDINATION_RELATION_KINDS)[number];

export type CoordinationEdge = {
  id: string;
  fromId: string;
  toId: string;
  relation: CoordinationRelationKind;
  sourceIds: string[];
  reviewState: CoordinationReviewState;
  visibility: CoordinationVisibility;
  confidence: CoordinationConfidence;
  checkedAt?: string;
  limitation?: string;
};

export type CoordinationGraph = {
  nodes: CoordinationNode[];
  edges: CoordinationEdge[];
};

export const PROBLEM_TO_ACTION_CHAIN = [
  "PROBLEM",
  "PLACE / ECOSYSTEM / VALUE_CHAIN_NODE",
  "EVIDENCE",
  "ACTIONABLE_GAP",
  "SOLUTION / INNOVATION",
  "ACTOR / CAPABILITY",
  "CAPITAL_ACTOR / CAPITAL_INSTRUMENT / CAPITAL_NEED",
  "PROJECT / ACTION",
  "RESULT",
  "LEARNING",
] as const;

export const COORDINATION_GOLD_CASE_IDS = [
  "ORCA_BAY_OF_BISCAY",
  "JAGUAR_AMAZONIA",
  "S4PIENS_FOOD",
] as const;

export const COORDINATION_HARD_RULES = [
  "Problem is upstream. Need or opportunity is a derived actionable gap, not the root object.",
  "Actor existence is not partnership, endorsement, capability proof or delivery readiness.",
  "Solution existence is not evidence that it works in every place, population or operating context.",
  "Innovation is distinct from a solution pathway and from the actor implementing it.",
  "Capital actor is distinct from capital instrument, capital need, award, contract and cash event.",
  "A large capital opportunity never overrides failed eligibility or failed delivery truth.",
  "External data enriches canonical objects but never becomes 4PLANET truth without provenance and review.",
  "Public projection is allowlisted. Internal relationship history, private capital intelligence and restricted data stay private.",
  "Contribution, delivery, result, outcome and impact claims remain distinct.",
  "Unknown is not pass. High-consequence matching fails closed when a hard gate is unknown.",
  "One canonical identity may have many provider identifiers; provider IDs do not become the canonical 4PLANET ID.",
  "Scale is earned by useful matches, conversion, coordination, correction quality and outcomes — never by record count alone.",
] as const;

const RELATION_RULES: Partial<Record<CoordinationRelationKind, { from?: CoordinationNodeKind[]; to?: CoordinationNodeKind[] }>> = {
  LOCATED_IN: {
    from: ["PROBLEM", "EVIDENCE", "ACTIONABLE_GAP", "SOLUTION", "INNOVATION", "ACTOR", "PROJECT", "ACTION", "RESULT"],
    to: ["PLACE", "ECOSYSTEM", "VALUE_CHAIN_NODE"],
  },
  EVIDENCED_BY: {
    from: ["PROBLEM", "ACTIONABLE_GAP", "SOLUTION", "INNOVATION", "ACTOR", "CAPABILITY", "PROJECT", "RESULT"],
    to: ["EVIDENCE"],
  },
  DERIVES_GAP: { from: ["PROBLEM"], to: ["ACTIONABLE_GAP"] },
  ADDRESSED_BY: { from: ["PROBLEM", "ACTIONABLE_GAP"], to: ["SOLUTION", "INNOVATION"] },
  INSTANTIATED_BY: { from: ["SOLUTION"], to: ["INNOVATION"] },
  HAS_CAPABILITY: { from: ["ACTOR"], to: ["CAPABILITY"] },
  CAPABLE_OF: { from: ["ACTOR", "CAPABILITY"], to: ["SOLUTION", "INNOVATION", "ACTION", "PROJECT"] },
  REQUIRES_CAPITAL: { from: ["ACTIONABLE_GAP", "SOLUTION", "INNOVATION", "PROJECT", "ACTION"], to: ["CAPITAL_NEED"] },
  OFFERS_INSTRUMENT: { from: ["CAPITAL_ACTOR"], to: ["CAPITAL_INSTRUMENT"] },
  ELIGIBLE_FOR: { from: ["CAPITAL_NEED", "PROJECT", "ACTOR"], to: ["CAPITAL_INSTRUMENT"] },
  FUNDS: { from: ["CAPITAL_INSTRUMENT", "CAPITAL_ACTOR"], to: ["CAPITAL_NEED", "PROJECT", "ACTION"] },
  IMPLEMENTS: { from: ["ACTOR", "PROJECT"], to: ["SOLUTION", "INNOVATION", "ACTION"] },
  PRODUCES_RESULT: { from: ["PROJECT", "ACTION"], to: ["RESULT"] },
  GENERATES_LEARNING: { from: ["RESULT", "PROJECT", "ACTION"], to: ["LEARNING"] },
  INFORMS: { from: ["EVIDENCE", "LEARNING"], to: ["PROBLEM", "ACTIONABLE_GAP", "SOLUTION", "INNOVATION", "PROJECT", "ACTION"] },
};

export type CoordinationGraphIssue = {
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
};

export function validateCoordinationGraph(graph: CoordinationGraph): CoordinationGraphIssue[] {
  const issues: CoordinationGraphIssue[] = [];
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();
  const nodes = new Map<string, CoordinationNode>();

  for (const node of graph.nodes) {
    if (!node.id.trim()) issues.push({ code: "NODE_ID_REQUIRED", message: "Every coordination node requires a stable id." });
    if (nodeIds.has(node.id)) issues.push({ code: "DUPLICATE_NODE_ID", message: `Duplicate coordination node ${node.id}.`, nodeId: node.id });
    nodeIds.add(node.id);
    nodes.set(node.id, node);

    if (!node.label.trim()) issues.push({ code: "NODE_LABEL_REQUIRED", message: `Node ${node.id} requires a label.`, nodeId: node.id });
    if (!COORDINATION_NODE_KINDS.includes(node.kind)) issues.push({ code: "UNKNOWN_NODE_KIND", message: `Unknown node kind ${node.kind}.`, nodeId: node.id });
    if (node.reviewState !== "DRAFT" && node.sourceIds.length === 0) {
      issues.push({ code: "SOURCE_REQUIRED", message: `Non-draft node ${node.id} requires source provenance.`, nodeId: node.id });
    }
    if (node.visibility === "PUBLIC_SAFE" && !["SOURCE_BACKED", "REVIEWED"].includes(node.reviewState)) {
      issues.push({ code: "PUBLIC_NODE_NOT_REVIEWED", message: `Public node ${node.id} must be source-backed or reviewed.`, nodeId: node.id });
    }
  }

  for (const edge of graph.edges) {
    if (!edge.id.trim()) issues.push({ code: "EDGE_ID_REQUIRED", message: "Every coordination edge requires a stable id." });
    if (edgeIds.has(edge.id)) issues.push({ code: "DUPLICATE_EDGE_ID", message: `Duplicate coordination edge ${edge.id}.`, edgeId: edge.id });
    edgeIds.add(edge.id);

    const from = nodes.get(edge.fromId);
    const to = nodes.get(edge.toId);
    if (!from || !to) {
      issues.push({ code: "EDGE_NODE_MISSING", message: `Edge ${edge.id} references a missing node.`, edgeId: edge.id });
      continue;
    }
    if (from.id === to.id) issues.push({ code: "SELF_RELATION", message: `Edge ${edge.id} cannot relate a node to itself.`, edgeId: edge.id });
    if (edge.reviewState !== "DRAFT" && edge.sourceIds.length === 0) {
      issues.push({ code: "EDGE_SOURCE_REQUIRED", message: `Non-draft edge ${edge.id} requires source provenance.`, edgeId: edge.id });
    }
    if (edge.visibility === "PUBLIC_SAFE" && (from.visibility !== "PUBLIC_SAFE" || to.visibility !== "PUBLIC_SAFE")) {
      issues.push({ code: "PUBLIC_EDGE_LEAK", message: `Public edge ${edge.id} cannot expose a non-public node.`, edgeId: edge.id });
    }
    if (edge.visibility === "PUBLIC_SAFE" && !["SOURCE_BACKED", "REVIEWED"].includes(edge.reviewState)) {
      issues.push({ code: "PUBLIC_EDGE_NOT_REVIEWED", message: `Public edge ${edge.id} must be source-backed or reviewed.`, edgeId: edge.id });
    }

    const rule = RELATION_RULES[edge.relation];
    if (rule?.from && !rule.from.includes(from.kind)) {
      issues.push({ code: "INVALID_RELATION_FROM", message: `${edge.relation} cannot start at ${from.kind}.`, edgeId: edge.id });
    }
    if (rule?.to && !rule.to.includes(to.kind)) {
      issues.push({ code: "INVALID_RELATION_TO", message: `${edge.relation} cannot end at ${to.kind}.`, edgeId: edge.id });
    }
  }

  const incomingGapDerivations = new Map<string, number>();
  for (const edge of graph.edges) {
    if (edge.relation === "DERIVES_GAP") incomingGapDerivations.set(edge.toId, (incomingGapDerivations.get(edge.toId) ?? 0) + 1);
  }
  for (const node of graph.nodes) {
    if (node.kind === "ACTIONABLE_GAP" && (incomingGapDerivations.get(node.id) ?? 0) === 0) {
      issues.push({
        code: "ORPHAN_ACTIONABLE_GAP",
        message: `Actionable gap ${node.id} must be explicitly derived from a Problem node.`,
        nodeId: node.id,
      });
    }
  }

  return issues;
}

export function assertCoordinationGraph(graph: CoordinationGraph): CoordinationGraph {
  const issues = validateCoordinationGraph(graph);
  if (issues.length) {
    throw new Error(`Invalid Planetary Coordination Graph: ${issues.map((issue) => `${issue.code}: ${issue.message}`).join(" | ")}`);
  }
  return graph;
}

export function publicCoordinationProjection(graph: CoordinationGraph): CoordinationGraph {
  const publicNodes = graph.nodes.filter(
    (node) => node.visibility === "PUBLIC_SAFE" && ["SOURCE_BACKED", "REVIEWED"].includes(node.reviewState),
  );
  const allowedIds = new Set(publicNodes.map((node) => node.id));
  return {
    nodes: publicNodes,
    edges: graph.edges.filter(
      (edge) =>
        edge.visibility === "PUBLIC_SAFE" &&
        ["SOURCE_BACKED", "REVIEWED"].includes(edge.reviewState) &&
        edge.sourceIds.length > 0 &&
        allowedIds.has(edge.fromId) &&
        allowedIds.has(edge.toId),
    ),
  };
}

export type MatchGateState = "PASS" | "FAIL" | "UNKNOWN";
export type MatchGate = {
  id: "ELIGIBILITY" | "DELIVERY_TRUTH" | "RIGHTS" | "FRESHNESS" | "AUTHORITY";
  state: MatchGateState;
  reason: string;
  evidenceIds: string[];
};

export type MatchDimension = {
  id:
    | "PROBLEM_RELEVANCE"
    | "GEOGRAPHY"
    | "STAGE"
    | "CAPITAL_SIZE"
    | "EVIDENCE_FIT"
    | "TIMING"
    | "FOUNDER_BURDEN"
    | "RELATIONSHIP"
    | "RESTRICTIONS";
  value: 0 | 1 | 2 | 3 | 4;
  reason: string;
  evidenceIds: string[];
};

export type ExplainableMatch = {
  id: string;
  leftId: string;
  rightId: string;
  hardGates: MatchGate[];
  dimensions: MatchDimension[];
  state: "BLOCKED" | "ELIGIBLE_FOR_REVIEW";
  blockers: string[];
  explanation: string[];
};

export function evaluateExplainableMatch(input: Omit<ExplainableMatch, "state" | "blockers" | "explanation">): ExplainableMatch {
  const blockers = input.hardGates
    .filter((gate) => gate.state !== "PASS")
    .map((gate) => `${gate.id}: ${gate.state} — ${gate.reason}`);

  return {
    ...input,
    state: blockers.length ? "BLOCKED" : "ELIGIBLE_FOR_REVIEW",
    blockers,
    explanation: [
      ...input.hardGates.map((gate) => `${gate.id}: ${gate.state} — ${gate.reason}`),
      ...input.dimensions.map((dimension) => `${dimension.id}: ${dimension.value}/4 — ${dimension.reason}`),
    ],
  };
}

export function hasOpaqueCompositeScore(match: ExplainableMatch): boolean {
  return Object.prototype.hasOwnProperty.call(match, "score") || Object.prototype.hasOwnProperty.call(match, "confidenceScore");
}
