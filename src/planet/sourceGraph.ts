export const SOURCE_GRAPH_ENTITY_TYPES = [
  "ACTOR",
  "INSTITUTION",
  "NETWORK",
  "PROGRAMME",
  "PLATFORM",
  "DATASET",
  "DATA_PRODUCT",
  "API",
  "SOURCE",
  "SOURCE_RECORD",
  "OBSERVATION",
  "MODEL_OUTPUT",
  "ASSESSMENT",
  "CLAIM",
  "EVIDENCE",
  "METHOD",
  "GEOGRAPHY",
  "TAXON",
  "ECOSYSTEM",
  "ISSUE",
  "SOLUTION",
  "MISSION",
  "PRODUCT_SURFACE",
] as const;

export type SourceGraphEntityType = (typeof SOURCE_GRAPH_ENTITY_TYPES)[number];

export const SOURCE_GRAPH_RELATION_TYPES = [
  "OPERATES",
  "MAINTAINS",
  "PUBLISHES",
  "FUNDS",
  "HOSTS",
  "PRODUCES",
  "DISTRIBUTED_THROUGH",
  "DERIVED_FROM",
  "CONTAINS",
  "SUPPORTS",
  "REPRESENTS",
  "INTERPRETS",
  "COVERS_GEOGRAPHY",
  "COVERS_TIME",
  "CONCERNS",
  "HAS_LICENCE",
  "HAS_SENSITIVITY_RULE",
  "HAS_FRESHNESS_STATE",
  "USES_METHOD",
  "USED_BY_4PLANET",
  "SUPERSEDES",
  "DEPRECATED_BY",
  "MEMBER_OF",
  "PART_OF",
] as const;

export type SourceGraphRelationType = (typeof SOURCE_GRAPH_RELATION_TYPES)[number];
export type SourceGraphEvidenceState = "CONFIRMED" | "PARTIALLY_CONFIRMED" | "UNRESOLVED" | "CONFLICTING_SOURCES";
export type SourceGraphRightsState = "CONFIRMED" | "REQUIRES_LEGAL_REVIEW" | "RESTRICTED" | "UNRESOLVED";
export type SourceGraphPrecision = "EXACT" | "DOCUMENTED" | "APPROXIMATE" | "GENERALISED" | "NOT_APPLICABLE";
export type SourceGraphReviewState = "DRAFT" | "INTERNAL_REVIEW" | "REVIEWED" | "BLOCKED";

export type SourceGraphNode = {
  id: string;
  type: SourceGraphEntityType;
  label: string;
  canonicalUrl?: string;
  sourceIds: string[];
  reviewState: SourceGraphReviewState;
};

export type SourceGraphEdge = {
  id: string;
  fromId: string;
  toId: string;
  relation: SourceGraphRelationType;
  sourceId: string;
  evidenceState: SourceGraphEvidenceState;
  validFrom?: string;
  validTo?: string;
  lastChecked: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNRESOLVED";
  limitation?: string;
  rightsState: SourceGraphRightsState;
  precision: SourceGraphPrecision;
  reviewState: SourceGraphReviewState;
  createdAt: string;
  updatedAt: string;
};

export type SourceGraph = { nodes: SourceGraphNode[]; edges: SourceGraphEdge[] };

const RELATION_RULES: Partial<Record<SourceGraphRelationType, { from?: SourceGraphEntityType[]; to?: SourceGraphEntityType[] }>> = {
  OPERATES: { from: ["ACTOR", "INSTITUTION", "NETWORK"], to: ["PROGRAMME", "PLATFORM"] },
  MAINTAINS: { from: ["ACTOR", "INSTITUTION", "NETWORK", "PROGRAMME"], to: ["DATASET", "DATA_PRODUCT", "PLATFORM", "API"] },
  PUBLISHES: { from: ["ACTOR", "INSTITUTION", "NETWORK", "PROGRAMME"], to: ["DATASET", "DATA_PRODUCT", "SOURCE"] },
  HOSTS: { from: ["ACTOR", "INSTITUTION", "NETWORK"], to: ["PLATFORM", "API"] },
  PRODUCES: { from: ["PROGRAMME", "PLATFORM"], to: ["DATASET", "DATA_PRODUCT", "MODEL_OUTPUT", "ASSESSMENT"] },
  DISTRIBUTED_THROUGH: { from: ["DATASET", "DATA_PRODUCT"], to: ["API", "PLATFORM"] },
  DERIVED_FROM: { from: ["DATASET", "DATA_PRODUCT", "MODEL_OUTPUT", "ASSESSMENT", "CLAIM"], to: ["SOURCE", "SOURCE_RECORD", "OBSERVATION", "MODEL_OUTPUT", "EVIDENCE", "DATASET"] },
  CONTAINS: { from: ["DATASET", "SOURCE"], to: ["SOURCE_RECORD"] },
  SUPPORTS: { from: ["SOURCE_RECORD", "EVIDENCE", "ASSESSMENT"], to: ["CLAIM"] },
  REPRESENTS: { from: ["SOURCE_RECORD"], to: ["OBSERVATION", "MODEL_OUTPUT", "ASSESSMENT"] },
  INTERPRETS: { from: ["ASSESSMENT"], to: ["EVIDENCE", "OBSERVATION", "MODEL_OUTPUT", "DATASET"] },
  COVERS_GEOGRAPHY: { from: ["DATASET", "DATA_PRODUCT", "PROGRAMME", "PLATFORM"], to: ["GEOGRAPHY"] },
  CONCERNS: { from: ["DATASET", "DATA_PRODUCT", "ASSESSMENT", "CLAIM"], to: ["TAXON", "ECOSYSTEM", "ISSUE", "SOLUTION"] },
  USES_METHOD: { from: ["ACTOR", "INSTITUTION", "NETWORK", "PROGRAMME", "DATASET", "DATA_PRODUCT", "ASSESSMENT"], to: ["METHOD"] },
  USED_BY_4PLANET: { from: ["DATASET", "DATA_PRODUCT", "API", "SOURCE", "ASSESSMENT"], to: ["PRODUCT_SURFACE"] },
  SUPERSEDES: { from: ["DATASET", "DATA_PRODUCT", "ASSESSMENT"], to: ["DATASET", "DATA_PRODUCT", "ASSESSMENT"] },
  DEPRECATED_BY: { from: ["DATASET", "DATA_PRODUCT", "API", "PLATFORM"], to: ["DATASET", "DATA_PRODUCT", "API", "PLATFORM"] },
};

export const SEMANTIC_HARD_STOPS = [
  "Institution is not a dataset.",
  "Dataset is not an API.",
  "API is not the original source.",
  "Source is not a source record.",
  "Observation is not automatically a signal.",
  "Observation is not a model output.",
  "Model output is not direct observation.",
  "Assessment is not raw data.",
  "Claim is not evidence.",
  "Actor headquarters is not dataset coverage.",
  "Dataset coverage is not actor operating geography.",
  "Record presence is not abundance.",
  "No record is not confirmed absence.",
  "Near-real-time is not live.",
  "Historic is not current.",
  "Open access is not unrestricted commercial use.",
  "Attribution is not partnership.",
  "Dataset use is not institutional endorsement.",
  "Institutional authority is not claim-level evidence.",
  "Modelled coverage is not measured coverage.",
  "Public data is not proof of 4PLANET impact.",
] as const;

export type SourceGraphIssue = { code: string; message: string; edgeId?: string; nodeId?: string };

export function validateSourceGraph(graph: SourceGraph): SourceGraphIssue[] {
  const issues: SourceGraphIssue[] = [];
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();
  const nodeById = new Map<string, SourceGraphNode>();

  for (const node of graph.nodes) {
    if (!node.id.trim()) issues.push({ code: "NODE_ID_REQUIRED", message: "Every node requires a canonical id." });
    if (nodeIds.has(node.id)) issues.push({ code: "DUPLICATE_NODE_ID", message: `Duplicate node id: ${node.id}`, nodeId: node.id });
    nodeIds.add(node.id);
    nodeById.set(node.id, node);
    if (!SOURCE_GRAPH_ENTITY_TYPES.includes(node.type)) issues.push({ code: "UNKNOWN_NODE_TYPE", message: `Unknown node type: ${node.type}`, nodeId: node.id });
    if (!node.sourceIds.length && node.reviewState !== "DRAFT") issues.push({ code: "SOURCE_REQUIRED", message: `Reviewed node ${node.id} requires at least one source.`, nodeId: node.id });
  }

  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) issues.push({ code: "DUPLICATE_EDGE_ID", message: `Duplicate edge id: ${edge.id}`, edgeId: edge.id });
    edgeIds.add(edge.id);
    const from = nodeById.get(edge.fromId);
    const to = nodeById.get(edge.toId);
    if (!from || !to) {
      issues.push({ code: "EDGE_NODE_MISSING", message: `Edge ${edge.id} references a missing node.`, edgeId: edge.id });
      continue;
    }
    if (!edge.sourceId.trim()) issues.push({ code: "EDGE_SOURCE_REQUIRED", message: `Edge ${edge.id} requires source provenance.`, edgeId: edge.id });
    if (!edge.lastChecked) issues.push({ code: "EDGE_LAST_CHECKED_REQUIRED", message: `Edge ${edge.id} requires lastChecked.`, edgeId: edge.id });
    const rule = RELATION_RULES[edge.relation];
    if (rule?.from && !rule.from.includes(from.type)) {
      issues.push({ code: "INVALID_RELATION_FROM", message: `${edge.relation} cannot start at ${from.type}.`, edgeId: edge.id });
    }
    if (rule?.to && !rule.to.includes(to.type)) {
      issues.push({ code: "INVALID_RELATION_TO", message: `${edge.relation} cannot end at ${to.type}.`, edgeId: edge.id });
    }
    if (from.id === to.id && edge.relation !== "SUPERSEDES") {
      issues.push({ code: "SELF_RELATION", message: `Unexpected self relation on ${edge.id}.`, edgeId: edge.id });
    }
  }
  return issues;
}

export function assertSourceGraph(graph: SourceGraph): SourceGraph {
  const issues = validateSourceGraph(graph);
  if (issues.length) throw new Error(`Invalid Planetary Source Graph: ${issues.map((item) => `${item.code}: ${item.message}`).join(" | ")}`);
  return graph;
}

export function sameEntityType(graph: SourceGraph, leftId: string, rightId: string): boolean {
  const left = graph.nodes.find((node) => node.id === leftId);
  const right = graph.nodes.find((node) => node.id === rightId);
  return Boolean(left && right && left.type === right.type);
}
