export const COORDINATION_CONTRACT_VERSION = "PCI-02" as const;

export const COORDINATION_NODE_KINDS = [
  "PROBLEM",
  "PLACE",
  "ECOSYSTEM",
  "VALUE_CHAIN_NODE",
  "EVIDENCE",
  "RESEARCH",
  "DECISION",
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
  "AUTHORED_BY",
  "AFFILIATED_WITH",
  "FUNDED_BY",
  "STUDIES",
  "INFORMS_DECISION",
  "DECIDED_BY",
  "CONSULTATION_FOR",
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

export type CoordinationGraph = { nodes: CoordinationNode[]; edges: CoordinationEdge[] };

export const PROBLEM_TO_ACTION_CHAIN = [
  "PROBLEM",
  "PLACE / ECOSYSTEM / VALUE_CHAIN_NODE",
  "EVIDENCE / RESEARCH",
  "ACTIONABLE_GAP",
  "SOLUTION / INNOVATION",
  "ACTOR / CAPABILITY",
  "CAPITAL / LEVER",
  "DECISION / PROJECT / ACTION",
  "RESULT",
  "LEARNING",
] as const;

export const LIVING_PLANET_LOOP = ["SENSE", "UNDERSTAND", "CHOOSE", "COORDINATE", "ACT", "LEARN"] as const;

export const COORDINATION_HARD_RULES = [
  "Problem is upstream. Need or opportunity is a derived actionable gap, not the root object.",
  "Research metadata, a paper, an assessment and a scientific claim are distinct objects/claims.",
  "AI explanation must never strengthen a scientific claim beyond the source.",
  "Research funding is context, not evidence of bias or corruption.",
  "A decision, proposal, consultation, vote and implementing institution are distinct.",
  "Decision correlation is not causality and a vote is not an outcome.",
  "Actor existence is not partnership, endorsement, capability proof or delivery readiness.",
  "Capital actor is distinct from capital instrument, capital need, award, contract and cash event.",
  "A large opportunity never overrides failed eligibility, authority or delivery truth.",
  "Data source is not a partner and external data never becomes 4PLANET truth without provenance and review.",
  "Public projection is allowlisted; private relationship history and restricted intelligence stay private.",
  "Action, delivery, result, outcome, impact and contribution remain distinct.",
  "UNKNOWN is not negative evidence, but UNKNOWN on a hard gate blocks high-consequence matching.",
  "One canonical identity may have many provider identifiers; provider IDs never replace the 4PLANET ID.",
  "Scale is earned by usefulness, corrections, repeated coordination and outcomes — never by record count alone.",
] as const;

const RELATION_RULES: Partial<Record<CoordinationRelationKind, { from?: CoordinationNodeKind[]; to?: CoordinationNodeKind[] }>> = {
  LOCATED_IN: { from: ["PROBLEM", "EVIDENCE", "RESEARCH", "DECISION", "ACTIONABLE_GAP", "SOLUTION", "INNOVATION", "ACTOR", "PROJECT", "ACTION", "RESULT"], to: ["PLACE", "ECOSYSTEM", "VALUE_CHAIN_NODE"] },
  EVIDENCED_BY: { from: ["PROBLEM", "DECISION", "ACTIONABLE_GAP", "SOLUTION", "INNOVATION", "ACTOR", "CAPABILITY", "PROJECT", "RESULT"], to: ["EVIDENCE", "RESEARCH"] },
  AUTHORED_BY: { from: ["RESEARCH", "EVIDENCE"], to: ["ACTOR"] },
  AFFILIATED_WITH: { from: ["ACTOR"], to: ["ACTOR"] },
  FUNDED_BY: { from: ["RESEARCH", "PROJECT"], to: ["ACTOR", "CAPITAL_ACTOR", "CAPITAL_INSTRUMENT"] },
  STUDIES: { from: ["RESEARCH"], to: ["PROBLEM", "PLACE", "ECOSYSTEM", "VALUE_CHAIN_NODE"] },
  INFORMS_DECISION: { from: ["RESEARCH", "EVIDENCE", "LEARNING"], to: ["DECISION"] },
  DECIDED_BY: { from: ["DECISION"], to: ["ACTOR"] },
  CONSULTATION_FOR: { from: ["ACTION"], to: ["DECISION"] },
  DERIVES_GAP: { from: ["PROBLEM"], to: ["ACTIONABLE_GAP"] },
  ADDRESSED_BY: { from: ["PROBLEM", "ACTIONABLE_GAP"], to: ["SOLUTION", "INNOVATION"] },
  INSTANTIATED_BY: { from: ["SOLUTION"], to: ["INNOVATION"] },
  HAS_CAPABILITY: { from: ["ACTOR"], to: ["CAPABILITY"] },
  CAPABLE_OF: { from: ["ACTOR", "CAPABILITY"], to: ["SOLUTION", "INNOVATION", "ACTION", "PROJECT"] },
  REQUIRES_CAPITAL: { from: ["ACTIONABLE_GAP", "SOLUTION", "INNOVATION", "PROJECT", "ACTION"], to: ["CAPITAL_NEED"] },
  OFFERS_INSTRUMENT: { from: ["CAPITAL_ACTOR"], to: ["CAPITAL_INSTRUMENT"] },
  ELIGIBLE_FOR: { from: ["CAPITAL_NEED", "PROJECT", "ACTOR"], to: ["CAPITAL_INSTRUMENT"] },
  FUNDS: { from: ["CAPITAL_INSTRUMENT", "CAPITAL_ACTOR"], to: ["CAPITAL_NEED", "PROJECT", "ACTION"] },
  IMPLEMENTS: { from: ["ACTOR", "PROJECT", "DECISION"], to: ["SOLUTION", "INNOVATION", "ACTION"] },
  PRODUCES_RESULT: { from: ["PROJECT", "ACTION"], to: ["RESULT"] },
  GENERATES_LEARNING: { from: ["RESULT", "PROJECT", "ACTION"], to: ["LEARNING"] },
  INFORMS: { from: ["EVIDENCE", "RESEARCH", "LEARNING"], to: ["PROBLEM", "ACTIONABLE_GAP", "SOLUTION", "INNOVATION", "PROJECT", "ACTION", "DECISION"] },
};

export type CoordinationGraphIssue = { code: string; message: string; nodeId?: string; edgeId?: string };

export function validateCoordinationGraph(graph: CoordinationGraph): CoordinationGraphIssue[] {
  const issues: CoordinationGraphIssue[] = [];
  const nodes = new Map<string, CoordinationNode>();
  const edgeIds = new Set<string>();

  for (const node of graph.nodes) {
    if (!node.id.trim()) issues.push({ code: "NODE_ID_REQUIRED", message: "Every node requires a stable id." });
    if (nodes.has(node.id)) issues.push({ code: "DUPLICATE_NODE_ID", message: `Duplicate node ${node.id}.`, nodeId: node.id });
    nodes.set(node.id, node);
    if (!node.label.trim()) issues.push({ code: "NODE_LABEL_REQUIRED", message: `Node ${node.id} requires a label.`, nodeId: node.id });
    if (node.reviewState !== "DRAFT" && node.sourceIds.length === 0) issues.push({ code: "SOURCE_REQUIRED", message: `Non-draft node ${node.id} requires provenance.`, nodeId: node.id });
    if (node.visibility === "PUBLIC_SAFE" && !["SOURCE_BACKED", "REVIEWED"].includes(node.reviewState)) issues.push({ code: "PUBLIC_NODE_NOT_REVIEWED", message: `Public node ${node.id} must be source-backed or reviewed.`, nodeId: node.id });
  }

  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) issues.push({ code: "DUPLICATE_EDGE_ID", message: `Duplicate edge ${edge.id}.`, edgeId: edge.id });
    edgeIds.add(edge.id);
    const from = nodes.get(edge.fromId); const to = nodes.get(edge.toId);
    if (!from || !to) { issues.push({ code: "EDGE_NODE_MISSING", message: `Edge ${edge.id} references a missing node.`, edgeId: edge.id }); continue; }
    if (from.id === to.id) issues.push({ code: "SELF_RELATION", message: `Edge ${edge.id} cannot relate a node to itself.`, edgeId: edge.id });
    if (edge.reviewState !== "DRAFT" && edge.sourceIds.length === 0) issues.push({ code: "EDGE_SOURCE_REQUIRED", message: `Non-draft edge ${edge.id} requires provenance.`, edgeId: edge.id });
    if (edge.visibility === "PUBLIC_SAFE" && (from.visibility !== "PUBLIC_SAFE" || to.visibility !== "PUBLIC_SAFE")) issues.push({ code: "PUBLIC_EDGE_LEAK", message: `Public edge ${edge.id} cannot expose a non-public node.`, edgeId: edge.id });
    const rule = RELATION_RULES[edge.relation];
    if (rule?.from && !rule.from.includes(from.kind)) issues.push({ code: "INVALID_RELATION_FROM", message: `${edge.relation} cannot start at ${from.kind}.`, edgeId: edge.id });
    if (rule?.to && !rule.to.includes(to.kind)) issues.push({ code: "INVALID_RELATION_TO", message: `${edge.relation} cannot end at ${to.kind}.`, edgeId: edge.id });
  }

  const gapDerivations = new Set(graph.edges.filter((edge) => edge.relation === "DERIVES_GAP").map((edge) => edge.toId));
  for (const node of graph.nodes) if (node.kind === "ACTIONABLE_GAP" && !gapDerivations.has(node.id)) issues.push({ code: "ORPHAN_ACTIONABLE_GAP", message: `Actionable gap ${node.id} must be derived from a Problem.`, nodeId: node.id });

  return issues;
}

export function assertCoordinationGraph(graph: CoordinationGraph): CoordinationGraph {
  const issues = validateCoordinationGraph(graph);
  if (issues.length) throw new Error(`Invalid PCI graph: ${issues.map((issue) => `${issue.code}: ${issue.message}`).join(" | ")}`);
  return graph;
}

export function publicCoordinationProjection(graph: CoordinationGraph): CoordinationGraph {
  const nodes = graph.nodes.filter((node) => node.visibility === "PUBLIC_SAFE" && ["SOURCE_BACKED", "REVIEWED"].includes(node.reviewState));
  const ids = new Set(nodes.map((node) => node.id));
  return { nodes, edges: graph.edges.filter((edge) => edge.visibility === "PUBLIC_SAFE" && ["SOURCE_BACKED", "REVIEWED"].includes(edge.reviewState) && edge.sourceIds.length > 0 && ids.has(edge.fromId) && ids.has(edge.toId)) };
}

export type MatchGateState = "PASS" | "FAIL" | "UNKNOWN";
export type MatchGate = { id: "ELIGIBILITY" | "DELIVERY_TRUTH" | "RIGHTS" | "FRESHNESS" | "AUTHORITY"; state: MatchGateState; reason: string; evidenceIds: string[] };
export type MatchDimension = { id: "PROBLEM_RELEVANCE" | "GEOGRAPHY" | "STAGE" | "CAPITAL_SIZE" | "EVIDENCE_FIT" | "TIMING" | "FOUNDER_BURDEN" | "RELATIONSHIP" | "RESTRICTIONS"; value: 0 | 1 | 2 | 3 | 4; reason: string; evidenceIds: string[] };
export type ExplainableMatch = { id: string; leftId: string; rightId: string; hardGates: MatchGate[]; dimensions: MatchDimension[]; state: "BLOCKED" | "ELIGIBLE_FOR_REVIEW"; blockers: string[]; explanation: string[] };

export function evaluateExplainableMatch(input: Omit<ExplainableMatch, "state" | "blockers" | "explanation">): ExplainableMatch {
  const blockers = input.hardGates.filter((gate) => gate.state !== "PASS").map((gate) => `${gate.id}: ${gate.state} — ${gate.reason}`);
  return { ...input, state: blockers.length ? "BLOCKED" : "ELIGIBLE_FOR_REVIEW", blockers, explanation: [...input.hardGates.map((gate) => `${gate.id}: ${gate.state} — ${gate.reason}`), ...input.dimensions.map((d) => `${d.id}: ${d.value}/4 — ${d.reason}`)] };
}

export function hasOpaqueCompositeScore(match: ExplainableMatch): boolean {
  return Object.prototype.hasOwnProperty.call(match, "score") || Object.prototype.hasOwnProperty.call(match, "confidenceScore");
}
