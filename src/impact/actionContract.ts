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

/**
 * Generic pre-action instance view of the canonical Universal IMPACT ActionContract.
 * This is an additive runtime projection of the existing docs/IMPACT_CONTRACT_V0.md
 * schema, not a second ActionContract authority or transaction system.
 */
export interface UniversalActionContractInstance {
  id: string;
  cellId: string;
  version: string;
  environment: "TEST" | "CONTROLLED" | "PRODUCTION";
  problem: string;
  actionScope: string;
  providerCandidateIds: string[];
  selectedProviderId: ActionContractEvidenceField<string>;
  actorDiligenceState: "DILIGENCE_PENDING" | "DILIGENCE_COMPLETE";
  proposedResourceFlow: {
    currency: "GBP" | "NOK" | "EUR" | "USD";
    amount: ActionContractEvidenceField<number>;
    quantity: ActionContractEvidenceField<number>;
    quantityLabel: string;
  };
  deliveryDefinition: string;
  baseline: string;
  counterfactual: string;
  acceptanceCriteria: string[];
  evidenceRequired: string[];
  claimsAllowed: string[];
  claimsProhibited: string[];
  remedy: string;
  independentReviewRequired: boolean;
  sourceRefs: string[];
  authorityState: "DRAFT" | "FOUNDER_RELEASE_REQUIRED" | "RELEASED";
  successCriteriaLockedAt: string;
  blockers: string[];
}

export const AC_SC01_0001: UniversalActionContractInstance = {
  id: "AC-SC01-0001",
  cellId: "CELL-SC01-VERIFIED-PLASTIC-RECOVERY",
  version: "1.0-pre-action",
  environment: "CONTROLLED",
  problem: "Test whether 4PLANET can turn a small real plastic-recovery resource flow into inspectable, non-inflated delivery proof and a reusable Proof Passport without confusing payment, provider evidence, ecological outcome or verified impact.",
  actionScope: "One smallest legitimate fixed plastic-recovery contribution through a provider that passes current evidence-payload, rights, price and claims diligence. No recurring subscription and no automatic escalation.",
  providerCandidateIds: [
    "provider-pattern:plastic-bank:fixed-contribution:v1",
    "provider-pattern:plastic-fischer:certificate:v1",
    "provider-pattern:cleanhub:recovery:v1",
  ],
  selectedProviderId: {
    state: "TO_VERIFY",
    value: null,
    sourceNote: "Plastic Bank is the current working activation candidate because public evidence combines low fixed-entry friction with unique claim identity and chain-of-custody. It remains unqualified until exact fixed-tier checkout, evidence payload, rights and terms are read back.",
  },
  actorDiligenceState: "DILIGENCE_PENDING",
  proposedResourceFlow: {
    currency: "USD",
    amount: {
      state: "TO_VERIFY",
      value: null,
      sourceNote: "Plastic Bank public pricing says every US$100 Fixed Contribution unlocks two weeks of Professional Impact Account access and Fixed Contribution starts at 5,000 bottles. Exact same-day checkout amount/currency must be confirmed before Founder release.",
    },
    quantity: {
      state: "TO_VERIFY",
      value: null,
      sourceNote: "Public pricing says Fixed Contribution starts at 5,000 bottles. Do not convert this into kg or treat it as the exact purchased quantity until checkout confirms the order terms.",
    },
    quantityLabel: "provider-defined bottles / authenticated plastic recovery claim",
  },
  deliveryDefinition: "A provider-authenticated recovery/allocation record is returned for the exact funded quantity with inspectable unique claim/allocation identity and evidence sufficient to distinguish resource flow from delivery. Provider claim alone is not independent verification.",
  baseline: "No 4PLANET real provider transaction, delivery record or production Proof Passport exists for SUPER CELL 01 before this contract.",
  counterfactual: "Without 4PLANET, a purchaser can fund the provider directly and receive provider-native account/certificate proof. The experiment succeeds for 4PLANET only if 4PLANET adds inspectable state separation, evidence provenance, claim boundaries, reusable Decision Trace/Learning, or lower downstream diligence/reporting burden beyond the native receipt/certificate.",
  acceptanceCriteria: [
    "Exact provider, checkout amount, quantity and terms are read back before resource flow.",
    "Success criteria remain unchanged after resource flow begins.",
    "Real payment/resource flow is recorded separately from delivery.",
    "Actual provider evidence payload is captured without fabricating unavailable fields.",
    "Unique claim/allocation identity and double-count semantics are recorded exactly as evidenced.",
    "Delivery may advance only when actual delivery evidence exists.",
    "Passport STANDARD/VERIFIED depth is derived mechanically rather than chosen for marketing.",
    "No ecological outcome or verified impact claim is made unless later independent evidence supports it.",
    "Counterfactual value of 4PLANET versus provider-native proof is explicitly assessed.",
  ],
  evidenceRequired: [
    "checkout/order confirmation",
    "actual amount/currency and quantity",
    "provider transaction/order reference",
    "provider certificate/account record",
    "unique claim/allocation ID if supplied",
    "provider methodology/source reference",
    "delivery/allocation evidence actually supplied",
    "evidence timestamps",
    "rights/display terms actually applicable to the purchased tier",
    "refund/remedy terms applicable to the purchased tier",
  ],
  claimsAllowed: [
    "A real resource flow occurred when actual payment evidence exists.",
    "Provider-reported recovery/allocation may be described as provider-reported when the actual evidence payload supports it.",
    "4PLANET may describe its own Proof Passport state and limitations.",
  ],
  claimsProhibited: [
    "Plastic Bank, Plastic Fischer or CleanHub is a 4PLANET partner unless separately agreed.",
    "Provider candidate is qualified before diligence closes.",
    "Enterprise API/audit/location features apply to a Fixed Contribution without evidence.",
    "Payment equals delivery.",
    "Provider-reported delivery equals independent verification.",
    "Recovered plastic proves ecological outcome or verified impact.",
    "Ocean leakage avoided, biodiversity improved or ecosystem recovery unless separately evidenced.",
  ],
  remedy: "If checkout terms, quantity, rights or evidence differ materially from the preflight, HOLD before payment. If payment occurs but delivery/evidence fails, preserve the full history, record the failed state, use the provider's applicable remedy/refund path if justified, and do not auto-escalate spend to another provider.",
  independentReviewRequired: true,
  sourceRefs: [
    "https://plasticbank.com/pricing/",
    "https://plasticbank.com/plastic-credit-methodology/",
    "https://plasticbank.com/faq/",
    "https://shop.plasticfischer.com/products/plastic-certificate",
    "https://www.cleanhub.com/api-integration",
  ],
  authorityState: "FOUNDER_RELEASE_REQUIRED",
  successCriteriaLockedAt: "2026-09-07T22:54:00Z",
  blockers: [
    "Exact provider is not yet qualified/selected.",
    "Same-day checkout amount, quantity and applicable terms are not yet locked.",
    "Actual fixed-tier evidence payload and public reuse/display rights are not yet observed.",
    "Founder has not released the exact payment/transaction.",
  ],
};

export function universalActionContractCanBeginResourceFlow(contract: UniversalActionContractInstance): boolean {
  return (
    contract.selectedProviderId.state === "KNOWN" &&
    Boolean(contract.selectedProviderId.value) &&
    contract.actorDiligenceState === "DILIGENCE_COMPLETE" &&
    contract.proposedResourceFlow.amount.state === "KNOWN" &&
    typeof contract.proposedResourceFlow.amount.value === "number" &&
    contract.proposedResourceFlow.amount.value > 0 &&
    contract.proposedResourceFlow.quantity.state === "KNOWN" &&
    typeof contract.proposedResourceFlow.quantity.value === "number" &&
    contract.proposedResourceFlow.quantity.value > 0 &&
    contract.authorityState === "RELEASED" &&
    Boolean(contract.successCriteriaLockedAt) &&
    contract.blockers.length === 0
  );
}
