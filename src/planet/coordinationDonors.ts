export type DonorAdoptionState = "ADOPTED" | "SELECTIVE_ADOPTION" | "HOLD" | "SUPERSEDED" | "REVERIFY";

export type CoordinationDonor = {
  id: string;
  pullRequest: number;
  branch: string;
  verifiedHead?: string;
  headState: "VERIFIED_THIS_RECOVERY" | "CONFLICT_REVERIFY";
  provenValue: string[];
  adopt: string[];
  doNotAdoptBlindly: string[];
  state: DonorAdoptionState;
  rationale: string;
};

export const COORDINATION_DONORS: CoordinationDonor[] = [
  {
    id: "P17_ACTOR_ATLAS_PRIVATE_BETA",
    pullRequest: 20,
    branch: "build/p17-actor-atlas-private-beta",
    verifiedHead: "387e276d",
    headState: "VERIFIED_THIS_RECOVERY",
    provenValue: ["shared Actor profiles", "Actor index", "Actor Mode prototype", "claim/correction controls"],
    adopt: ["identity/source/geography/claim semantics where still compatible", "correction/review patterns"],
    doNotAdoptBlindly: ["old profile presentation", "old routes", "old public maturity state"],
    state: "SELECTIVE_ADOPTION",
    rationale: "Current TEST KING Actor Gold is the leading presentation line; donor remains evidence for reusable intelligence primitives.",
  },
  {
    id: "P17_ORGANISATIONS_SCALE_GATE",
    pullRequest: 21,
    branch: "build/p17-organisations-discovery-scale-gate-final",
    verifiedHead: "ed04832e",
    headState: "VERIFIED_THIS_RECOVERY",
    provenValue: ["10 flagship Actor profiles", "50 source-mapped claims", "curated collections", "native ATLAS Actor Mode", "typed correction/review contract"],
    adopt: ["Actor identity/source/geography grammar", "ATLAS Actor overlay pattern", "stress-test archetypes"],
    doNotAdoptBlindly: ["profile facts without revalidation", "whole data file", "whole branch merge"],
    state: "SELECTIVE_ADOPTION",
    rationale: "High reusable value, but current identities/claims must be reconciled to Global Actor Master and current Actor Gold before reuse.",
  },
  {
    id: "P17_KNOWLEDGE_SOURCE_GRAPH",
    pullRequest: 28,
    branch: "build/p17-knowledge-institutions-source-graph",
    verifiedHead: "c4f801bc",
    headState: "VERIFIED_THIS_RECOVERY",
    provenValue: ["454 Source Graph nodes", "823 source-bearing relations", "15-source queue", "typed Source Graph", "bounded OBIS/WoRMS connector proofs"],
    adopt: ["typed Source Graph contract", "semantic hard stops", "connector provenance/failure contract", "OBIS/WoRMS bounded proofs"],
    doNotAdoptBlindly: ["scheduled ingestion", "all 151 institution profiles", "source breadth before current product need"],
    state: "ADOPTED",
    rationale: "Core contracts are recovered in PR #164; breadth remains demand-gated under federation-before-replication.",
  },
  {
    id: "TREE_OF_LIFE_ACTION_INTELLIGENCE",
    pullRequest: 80,
    branch: "build/tree-of-life-action-intelligence-sandbox",
    verifiedHead: "434bcffc",
    headState: "VERIFIED_THIS_RECOVERY",
    provenValue: ["Planetary Action loop", "Actor/Capital separation", "public/private Capital boundary", "interactive Tree sandbox"],
    adopt: ["action-loop intent", "Actor/Capital/Impact separation", "shared-core renderer principle"],
    doNotAdoptBlindly: ["old TREE ordering", "TREE UI as canonical ontology", "Need-first S4PIENS chain"],
    state: "SELECTIVE_ADOPTION",
    rationale: "Founder correction makes PROBLEM upstream and NEED a derived actionable gap; PCI-01 supersedes the donor ordering while preserving its useful separation principles.",
  },
  {
    id: "CHOICE_DECISION_INTELLIGENCE",
    pullRequest: 82,
    branch: "build/tree-of-life-choice-lab",
    headState: "CONFLICT_REVERIFY",
    provenValue: ["explainable Problem→Solution→Innovation→Actor→Capital→Impact trace", "separate match dimensions", "under-solved gap concept"],
    adopt: ["explainability", "hard-gate-before-ranking principle", "separate dimensions rather than opaque score"],
    doNotAdoptBlindly: ["old maturity labels", "old UI", "any exact-head assumption until branch head is reverified"],
    state: "REVERIFY",
    rationale: "Current control records disagree on the remembered exact head. Semantics are useful; exact donor artifact must be reverified before file-level adoption.",
  },
  {
    id: "S4PIENS_ACTOR_INNOVATION_ENGINE",
    pullRequest: 83,
    branch: "build/s4piens-universe-domain",
    verifiedHead: "a5c87f85",
    headState: "VERIFIED_THIS_RECOVERY",
    provenValue: ["Actor distinct from Solution", "Innovation first-class", "Actor Gold pair", "S4PIENS response chain"],
    adopt: ["Actor/Solution/Innovation separation", "shared Actor identity intent", "cross-domain transfer requirements"],
    doNotAdoptBlindly: ["old S4PIENS route/product state", "whole branch merge", "Need-first ordering as current canonical grammar"],
    state: "SELECTIVE_ADOPTION",
    rationale: "Current S4PIENS/FOOD and TEST KING lines remain leading; semantic separation transfers into PCI-01.",
  },
];

export const DONOR_RECOVERY_RULES = [
  "king/test remains sole integration authority.",
  "Recover proven primitives, not stale whole branches.",
  "Revalidate public facts and relationship states before reuse.",
  "A conflicting remembered donor head fails closed to REVERIFY.",
  "Current Actor Gold presentation is not replaced by older Actor UI without a separate product-quality gate.",
  "No donor may create a second Actor, Capital, Solution, Source or Project truth store.",
] as const;
