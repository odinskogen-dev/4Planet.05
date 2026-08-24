import { assertCoordinationGraph, type CoordinationGraph } from "./coordinationGraph";

export type CoordinationFixture = {
  id: "ORCA_BAY_OF_BISCAY" | "JAGUAR_AMAZONIA" | "S4PIENS_FOOD";
  fixtureOnly: true;
  publicUseAllowed: false;
  purpose: string;
  graph: CoordinationGraph;
};

const draftNode = (id: string, kind: CoordinationGraph["nodes"][number]["kind"], label: string) => ({
  id,
  kind,
  label,
  reviewState: "DRAFT" as const,
  visibility: "INTERNAL" as const,
  sourceIds: [],
  limitation: "SYNTHETIC CONTRACT FIXTURE — not a factual claim, partner statement or public content.",
});

const draftEdge = (
  id: string,
  fromId: string,
  toId: string,
  relation: CoordinationGraph["edges"][number]["relation"],
) => ({
  id,
  fromId,
  toId,
  relation,
  sourceIds: [],
  reviewState: "DRAFT" as const,
  visibility: "INTERNAL" as const,
  confidence: "UNRESOLVED" as const,
  limitation: "SYNTHETIC CONTRACT FIXTURE — relation exists only to test shared grammar.",
});

function fixtureGraph(prefix: string, contextKind: "ECOSYSTEM" | "VALUE_CHAIN_NODE"): CoordinationGraph {
  const nodes: CoordinationGraph["nodes"] = [
    draftNode(`${prefix}:problem`, "PROBLEM", "Synthetic problem"),
    draftNode(`${prefix}:context`, contextKind, "Synthetic context"),
    draftNode(`${prefix}:evidence`, "EVIDENCE", "Synthetic evidence slot"),
    draftNode(`${prefix}:gap`, "ACTIONABLE_GAP", "Synthetic actionable gap"),
    draftNode(`${prefix}:solution`, "SOLUTION", "Synthetic solution pathway"),
    draftNode(`${prefix}:actor`, "ACTOR", "Synthetic capable actor slot"),
    draftNode(`${prefix}:capability`, "CAPABILITY", "Synthetic capability slot"),
    draftNode(`${prefix}:capital-need`, "CAPITAL_NEED", "Synthetic capital need slot"),
    draftNode(`${prefix}:project`, "PROJECT", "Synthetic project slot"),
    draftNode(`${prefix}:action`, "ACTION", "Synthetic action slot"),
    draftNode(`${prefix}:result`, "RESULT", "Synthetic result slot"),
    draftNode(`${prefix}:learning`, "LEARNING", "Synthetic learning slot"),
  ];

  const edges: CoordinationGraph["edges"] = [
    draftEdge(`${prefix}:problem-context`, `${prefix}:problem`, `${prefix}:context`, "LOCATED_IN"),
    draftEdge(`${prefix}:problem-evidence`, `${prefix}:problem`, `${prefix}:evidence`, "EVIDENCED_BY"),
    draftEdge(`${prefix}:problem-gap`, `${prefix}:problem`, `${prefix}:gap`, "DERIVES_GAP"),
    draftEdge(`${prefix}:gap-solution`, `${prefix}:gap`, `${prefix}:solution`, "ADDRESSED_BY"),
    draftEdge(`${prefix}:actor-capability`, `${prefix}:actor`, `${prefix}:capability`, "HAS_CAPABILITY"),
    draftEdge(`${prefix}:capability-solution`, `${prefix}:capability`, `${prefix}:solution`, "CAPABLE_OF"),
    draftEdge(`${prefix}:solution-capital`, `${prefix}:solution`, `${prefix}:capital-need`, "REQUIRES_CAPITAL"),
    draftEdge(`${prefix}:actor-action`, `${prefix}:actor`, `${prefix}:action`, "IMPLEMENTS"),
    draftEdge(`${prefix}:project-action`, `${prefix}:project`, `${prefix}:action`, "IMPLEMENTS"),
    draftEdge(`${prefix}:action-result`, `${prefix}:action`, `${prefix}:result`, "PRODUCES_RESULT"),
    draftEdge(`${prefix}:result-learning`, `${prefix}:result`, `${prefix}:learning`, "GENERATES_LEARNING"),
    draftEdge(`${prefix}:learning-problem`, `${prefix}:learning`, `${prefix}:problem`, "INFORMS"),
  ];

  return assertCoordinationGraph({ nodes, edges });
}

export const COORDINATION_TRANSFER_FIXTURES: CoordinationFixture[] = [
  {
    id: "ORCA_BAY_OF_BISCAY",
    fixtureOnly: true,
    publicUseAllowed: false,
    purpose: "Prove the shared grammar can represent a marine monitoring / ecosystem context without encoding unsupported ORCA facts.",
    graph: fixtureGraph("fixture:marine", "ECOSYSTEM"),
  },
  {
    id: "JAGUAR_AMAZONIA",
    fixtureOnly: true,
    publicUseAllowed: false,
    purpose: "Prove the same grammar transfers to a terrestrial ecosystem context without encoding unsupported Jaguar/Amazonia claims.",
    graph: fixtureGraph("fixture:terrestrial", "ECOSYSTEM"),
  },
  {
    id: "S4PIENS_FOOD",
    fixtureOnly: true,
    publicUseAllowed: false,
    purpose: "Prove the same grammar transfers to a human-system value-chain context without encoding unsupported FOOD claims.",
    graph: fixtureGraph("fixture:food", "VALUE_CHAIN_NODE"),
  },
];

export function assertTransferFixtureSafety(fixtures: CoordinationFixture[] = COORDINATION_TRANSFER_FIXTURES): void {
  for (const fixture of fixtures) {
    if (!fixture.fixtureOnly || fixture.publicUseAllowed) throw new Error(`${fixture.id} must remain fixture-only and non-public.`);
    if (fixture.graph.nodes.some((node) => node.visibility !== "INTERNAL" || node.reviewState !== "DRAFT")) {
      throw new Error(`${fixture.id} contains a node that could be mistaken for reviewed/public truth.`);
    }
    if (fixture.graph.edges.some((edge) => edge.visibility !== "INTERNAL" || edge.reviewState !== "DRAFT")) {
      throw new Error(`${fixture.id} contains an edge that could be mistaken for reviewed/public truth.`);
    }
  }
}
