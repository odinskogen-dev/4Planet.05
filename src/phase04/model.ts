export type Phase04Maturity =
  | "CANON"
  | "FOUNDER-APPROVED"
  | "PROTOTYPE-VALIDATED"
  | "EXTERNALLY VALIDATED"
  | "EXPERIMENT"
  | "NOT YET BUILT";

export type PublicDataState =
  | "LIVE DATA"
  | "CACHED DATA"
  | "CURATED SOURCE"
  | "PROTOTYPE DATA"
  | "DEMO FIXTURE"
  | "NOT YET IMPLEMENTED";

export type ProofState =
  | "SOURCE"
  | "4PLANET CONTEXT"
  | "PARTNER REPORT"
  | "ASSESSED OUTCOME"
  | "VERIFIED OUTCOME";

export type ProofFlag =
  | "UNCERTAIN"
  | "CONTESTED"
  | "CORRECTED"
  | "SUPERSEDED";

export interface ProvenancePresentation {
  state: ProofState;
  actor: string;
  source?: string;
  method?: string;
  time?: string;
  limitation: string;
  flags?: ProofFlag[];
}

export interface SignalPresentation {
  what: string;
  where: string;
  when: string;
  source: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNCLASSIFIED";
  whyItMatters: string;
  relationship: string;
  followNext: string;
  dataState: PublicDataState;
}

export interface RelationshipStep {
  id: string;
  label: string;
  kind: string;
  status?: string;
}
