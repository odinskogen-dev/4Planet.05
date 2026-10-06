// ============================================================================
// RELATIONSHIP ONTOLOGY
// The edge vocabulary of the Nature Knowledge Graph. This is NOT a graph engine
// — it makes the graph's relationship semantics explicit, typed and reusable so
// that current code and any future graph database speak the same language.
//
// Each edge already implemented in the data maps to one of these types:
//   Species  --PERFORMS-->    Function        (species.functions)
//   Function --SUPPORTS-->    Service         (FunctionNode.supportsServices)
//   Service  --BENEFITS-->    Recipient       (ServiceNode.benefitsRecipients)
//   Species  --DEPENDS_ON-->  Ecosystem       (SpeciesEcosystemLink)
//   Threat   --CAUSED_BY-->   Driver          (ThreatNode.driver)
//   Threat   --PRESSURES-->   Species         (SpeciesThreatLink, reversed)
//   Solution --ADDRESSES-->   Threat          (SolutionNode.addressesThreats)
//   Species  --CONNECTS_TO--> Species/Mission (SpeciesProfile.connections)
// ============================================================================

export const REL = {
  PERFORMS: "PERFORMS", // Species → Function
  SUPPORTS: "SUPPORTS", // Function → Service
  BENEFITS: "BENEFITS", // Service → Recipient
  DEPENDS_ON: "DEPENDS_ON", // Species → Ecosystem / Service
  BELONGS_TO: "BELONGS_TO", // Node → Category / grouping
  CONTAINS: "CONTAINS", // Ecosystem → Species (inverse of LIVES_IN)
  PRESSURES: "PRESSURES", // Threat → Species / Ecosystem
  CAUSED_BY: "CAUSED_BY", // Threat → Driver
  ADDRESSES: "ADDRESSES", // Solution → Threat
  RESTORES: "RESTORES", // Solution → Ecosystem / Function
  PROTECTS: "PROTECTS", // Solution / Mission → Species / Ecosystem
  LIVES_IN: "LIVES_IN", // Species → Ecosystem
  THREATENS: "THREATENS", // Driver / Threat → Species / Ecosystem
  FOCUSES_ON: "FOCUSES_ON", // Mission → Species / Ecosystem / Threat
  CONNECTS_TO: "CONNECTS_TO", // Generic graph link (Species ↔ Species, Mission)
} as const;

export type RelationshipType = (typeof REL)[keyof typeof REL];

/** Human-readable gloss for each relationship type. */
export const REL_LABEL: Record<RelationshipType, string> = {
  PERFORMS: "performs",
  SUPPORTS: "supports",
  BENEFITS: "benefits",
  DEPENDS_ON: "depends on",
  BELONGS_TO: "belongs to",
  CONTAINS: "contains",
  PRESSURES: "pressures",
  CAUSED_BY: "is caused by",
  ADDRESSES: "addresses",
  RESTORES: "helps restore",
  PROTECTS: "protects",
  LIVES_IN: "lives in",
  THREATENS: "threatens",
  FOCUSES_ON: "focuses on",
  CONNECTS_TO: "connects to",
};

/** The two canonical chains the platform is built to express. */
export const CANONICAL_CHAINS = {
  systemSupport: [
    "Species",
    REL.PERFORMS,
    "Function",
    REL.SUPPORTS,
    "Service",
    REL.BENEFITS,
    "Recipient",
  ],
  threatResponse: ["Driver", REL.CAUSED_BY, "Threat", REL.ADDRESSES, "Solution"],
} as const;
