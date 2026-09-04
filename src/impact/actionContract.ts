export type ActionContractReadiness =
  | "DISCOVERY"
  | "BLOCKED_EXTERNAL_FACTS"
  | "READY_FOR_FUNDER_MATCH"
  | "COMMITTED"
  | "DELIVERING"
  | "DELIVERED"
  | "OUTCOME_ASSESSMENT";

export type EvidenceState = "KNOWN" | "UNKNOWN" | "TO_VERIFY";

export interface ActionContractEvidenceField<T> {
  state: EvidenceState;
  value: T | null;
  sourceNote: string;
}

export interface ActionMilestone {
  id: string;
  label: string;
  state: "PENDING" | "READY" | "DONE";
  evidenceRequired: string[];
}

export interface ActionContract {
  id: string;
  title: string;
  system: "OCE4N_" | "E4RTH_" | "S4PIENS_" | "4CULTURE_";
  need: string;
  place: string;
  actor: {
    id: string;
    name: string;
    role: string;
    relationshipState: "PROJECT_CONTEXT_EXISTS_TERMS_TO_VERIFY" | "DILIGENCE_PENDING" | "DILIGENCE_COMPLETE";
  };
  boundedAction: string;
  deliveryUnit: string;
  programmeEvidence: {
    annualSurveys: ActionContractEvidenceField<{ min: number; max: number }>;
    annualSurveyDays: ActionContractEvidenceField<{ min: number; max: number }>;
  };
  fundingNeed: {
    currency: "GBP" | "NOK" | "EUR" | "USD";
    amount: ActionContractEvidenceField<number>;
    quantity: ActionContractEvidenceField<number>;
    quantityLabel: string;
  };
  suitableFunderTypes: string[];
  milestones: ActionMilestone[];
  deliveryProof: string[];
  outcomeBoundary: string;
  readiness: ActionContractReadiness;
  blockers: string[];
  evidenceLinks: Array<{ label: string; href: string }>;
}

/**
 * First bounded Universal IMPACT action-contract seam.
 *
 * It deliberately reuses the existing ORCA / Bay monitoring proof rather than
 * creating a new project narrative. Route geometry, hours and distance are the
 * delivery proof dimensions already locked by the Bay contract. ORCA's COO
 * confirmed the current Portsmouth–Santander programme scale on 4 Sep 2026:
 * 10 or 12 surveys, with a four-day return crossing, equating to 40–48 survey
 * days. The sponsorship prices previously shared by ORCA were explicitly
 * described as placeholders, so current GBP amount and the bounded quantity to
 * fund remain unresolved and this contract MUST stay closed to funding match.
 */
export const BAY_OF_BISCAY_SURVEY_ACTION: ActionContract = {
  id: "action:4p:orca:bay-of-biscay:survey-effort:v1",
  title: "Bay of Biscay cetacean survey effort",
  system: "OCE4N_",
  need: "Fund bounded, inspectable cetacean monitoring effort on the existing Portsmouth → Bay of Biscay → Santander ferry survey corridor.",
  place: "Bay of Biscay · Portsmouth–Santander ferry survey corridor",
  actor: {
    id: "actor:orca",
    name: "ORCA",
    role: "Cetacean survey expertise / delivery context",
    relationshipState: "PROJECT_CONTEXT_EXISTS_TERMS_TO_VERIFY",
  },
  boundedAction: "Support a defined quantity of survey effort measured as confirmed route geometry, observation hours and distance surveyed. Sightings are biological observations, not a delivery-success metric by themselves.",
  deliveryUnit: "confirmed survey effort",
  programmeEvidence: {
    annualSurveys: {
      state: "KNOWN",
      value: { min: 10, max: 12 },
      sourceNote: "ORCA COO Steve Jones, 4 Sep 2026: Portsmouth–Santander will have either 10 or 12 surveys this year, pending two date confirmations.",
    },
    annualSurveyDays: {
      state: "KNOWN",
      value: { min: 40, max: 48 },
      sourceNote: "ORCA COO Steve Jones, 4 Sep 2026: the return crossing is four days, producing 40–48 days of survey time from 10–12 surveys.",
    },
  },
  fundingNeed: {
    currency: "GBP",
    amount: {
      state: "TO_VERIFY",
      value: null,
      sourceNote: "ORCA previously shared £4,000/year, £400/month and £250/two-week sponsorship examples but explicitly described the numbers as placeholders. Current bounded GBP terms must be confirmed before matching or opening.",
    },
    quantity: {
      state: "UNKNOWN",
      value: null,
      sourceNote: "The programme is 40–48 survey days in 2026, but the bounded quantity this specific action contract would fund has not yet been selected or agreed.",
    },
    quantityLabel: "survey days funded",
  },
  suitableFunderTypes: [
    "bounded pilot funder",
    "corporate or route-linked sponsor where conflicts and claims are controlled",
    "philanthropic or foundation support for monitoring",
  ],
  milestones: [
    {
      id: "route",
      label: "Exact survey route and operating assumptions confirmed",
      state: "PENDING",
      evidenceRequired: ["route geometry", "operator confirmation", "measurement method"],
    },
    {
      id: "scope-cost",
      label: "Bounded funded quantity and current GBP terms confirmed",
      state: "PENDING",
      evidenceRequired: ["survey days funded", "current bounded budget or unit cost", "costing date/source"],
    },
    {
      id: "commitment",
      label: "Suitable funder commitment recorded",
      state: "PENDING",
      evidenceRequired: ["funder identity", "amount", "scope", "conditions", "commitment date"],
    },
    {
      id: "delivery",
      label: "Survey effort delivered",
      state: "PENDING",
      evidenceRequired: ["actual route geometry", "hours observed", "distance surveyed", "delivery date/window"],
    },
    {
      id: "proof",
      label: "Proof of done accepted",
      state: "PENDING",
      evidenceRequired: ["delivery evidence bundle", "variance from commitment", "provider acknowledgement"],
    },
  ],
  deliveryProof: [
    "actual survey route geometry",
    "observation hours",
    "distance surveyed",
    "delivery window",
    "evidence references",
  ],
  outcomeBoundary: "Delivery proof demonstrates that bounded monitoring work occurred. It does not by itself demonstrate ecological improvement, cetacean population change or verified ecological impact.",
  readiness: "BLOCKED_EXTERNAL_FACTS",
  blockers: [
    "Current bounded GBP sponsorship terms are not confirmed; previously shared prices were explicitly placeholders.",
    "The number of survey days this action contract would fund has not been selected or agreed.",
    "No external funder commitment exists in this contract.",
  ],
  evidenceLinks: [
    { label: "Bay of Biscay ecosystem proof", href: "/ecosystem/bay-of-biscay/" },
    { label: "ORCA journey", href: "/journey/orca/" },
    { label: "IMPACT proof-state lab", href: "/impact/lab" },
    { label: "Actor graph", href: "/actors" },
  ],
};

export function actionContractCanMatchFunding(contract: ActionContract): boolean {
  return (
    contract.readiness === "READY_FOR_FUNDER_MATCH" &&
    contract.fundingNeed.amount.state === "KNOWN" &&
    typeof contract.fundingNeed.amount.value === "number" &&
    contract.fundingNeed.amount.value > 0 &&
    contract.fundingNeed.quantity.state === "KNOWN" &&
    typeof contract.fundingNeed.quantity.value === "number" &&
    contract.fundingNeed.quantity.value > 0 &&
    contract.blockers.length === 0
  );
}

export function actionContractTruthSummary(contract: ActionContract) {
  return {
    id: contract.id,
    readiness: contract.readiness,
    canMatchFunding: actionContractCanMatchFunding(contract),
    confirmedAnnualSurveys: contract.programmeEvidence.annualSurveys.state === "KNOWN" ? contract.programmeEvidence.annualSurveys.value : null,
    confirmedAnnualSurveyDays: contract.programmeEvidence.annualSurveyDays.state === "KNOWN" ? contract.programmeEvidence.annualSurveyDays.value : null,
    knownFundingAmount: contract.fundingNeed.amount.state === "KNOWN" ? contract.fundingNeed.amount.value : null,
    knownQuantity: contract.fundingNeed.quantity.state === "KNOWN" ? contract.fundingNeed.quantity.value : null,
    blockers: [...contract.blockers],
    proofBoundary: contract.outcomeBoundary,
  };
}
