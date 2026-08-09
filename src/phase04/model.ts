export type Phase04Maturity =
  | "CANON"
  | "FOUNDER-APPROVED"
  | "PROTOTYPE-VALIDATED"
  | "EXTERNALLY VALIDATED"
  | "EXPERIMENT"
  | "NOT YET BUILT";

/**
 * Public data state describes product/runtime availability, not observation time.
 * Never infer "happening now" from LIVE DATA alone.
 */
export type PublicDataState =
  | "LIVE DATA"
  | "CACHED DATA"
  | "CURATED SOURCE"
  | "HISTORICAL DATA"
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
  | "SUPERSEDED"
  | "RIGHTS REVIEW"
  | "CLAIM QUALIFIED";

export interface ProvenancePresentation {
  state: ProofState;
  actor: string;
  source?: string;
  sources?: string[];
  method?: string;
  /** Legacy generic time label. Prefer dataDate / lastChecked for new surfaces. */
  time?: string;
  dataDate?: string;
  lastChecked?: string;
  claimIds?: string[];
  rightsState?: string;
  whyWeSayThis?: string;
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
