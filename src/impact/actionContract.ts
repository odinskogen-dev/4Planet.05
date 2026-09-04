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
 * delivery proof dimensions already locked by the Bay contract. Current annual
 * survey quantity and current GBP costing are not present in the active product
 * evidence, so this contract MUST remain blocked instead of inventing a funding
 * amount or opening a contribution route.
 */
export const BAY_OF_BISCAY_SURVEY_ACTION: ActionContract = {
  id: "action:4p:orca:bay-of-biscay:survey-effort:v1",
  title: "Bay of Biscay cetacean survey effort",
  system: "OCE4N_",
  need: "Fund bounded, inspectable cetacean monitoring effort on the existing England → Bay of Biscay → Spain ferry survey corridor.",
  place: "Bay of Biscay · existing ferry survey corridor",
  actor: {
    id: "actor:orca",
    name: "ORCA",
    role: "Cetacean survey expertise / delivery context",
    relationshipState: "PROJECT_CONTEXT_EXISTS_TERMS_TO_VERIFY",
  },
  boundedAction: "Support a defined quantity of survey effort measured as confirmed route geometry, observation hours and distance surveyed. Sightings are biological observations, not a delivery-success metric by themselves.",
  deliveryUnit: "confirmed survey effort",
  fundingNeed: {
    currency: "GBP",
    amount: {
      state: "UNKNOWN",
      value: null,
      sourceNote: "Current £ / survey-day costing must be confirmed before this contract can be matched or opened.",
    },
    quantity: {
      state: "UNKNOWN",
      value: null,
      sourceNote: "Current annual survey-day plan must be confirmed before this contract can be matched or opened.",
    },
    quantityLabel: "survey days",
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
      id: "cost",
      label: "Current survey quantity and GBP costing confirmed",
      state: "PENDING",
      evidenceRequired: ["survey days", "cost per unit or bounded budget", "costing date/source"],
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
    "ORCA-confirmed current annual survey-day plan is not yet present in active evidence.",
    "ORCA-confirmed current GBP costing is not yet present in active evidence.",
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
    knownFundingAmount: contract.fundingNeed.amount.state === "KNOWN" ? contract.fundingNeed.amount.value : null,
    knownQuantity: contract.fundingNeed.quantity.state === "KNOWN" ? contract.fundingNeed.quantity.value : null,
    blockers: [...contract.blockers],
    proofBoundary: contract.outcomeBoundary,
  };
}
