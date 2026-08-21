export type TruthState = "DEMO" | "VERIFIED" | "UNKNOWN";
export type ProductState = "DRAFT" | "CURATION_PENDING" | "APPROVED" | "PUBLISHED";
export type ImpactContractState = "DEMO" | "DILIGENCE" | "APPROVED" | "PAUSED";
export type OrderState =
  | "ORDER_CREATED"
  | "PAYMENT_CAPTURED"
  | "PRODUCTION_ACCEPTED"
  | "CREATOR_PAYABLE_CREATED"
  | "IMPACT_LIABILITY_CREATED"
  | "SHIPPED"
  | "IMPACT_FUNDED"
  | "IMPACT_EVIDENCE_LINKED"
  | "CREATOR_PAID"
  | "TRANSACTION_RECONCILED";

export type ImpactContract = {
  id: string;
  mission: string;
  publicName: string;
  unitLabel: string;
  unitFundingNok: number;
  claim: string;
  evidence: string;
  state: ImpactContractState;
  accent: string;
  truth: TruthState;
};

export type Waterfall = {
  customerPriceNok: number;
  taxAndPaymentReserveNok: number;
  productionAndFulfilmentNok: number;
  impactFundingNok: number;
  creatorPayableNok: number;
  fourPlanetContributionNok: number;
};

export type CreatorProduct = {
  id: string;
  creator: string;
  title: string;
  productType: "FINE ART PRINT" | "ART PRINT" | "PHOTO PRINT";
  size: "A3" | "A2" | "50 × 70 CM";
  rights: string;
  impactContractId: string;
  state: ProductState;
  waterfall: Waterfall;
  truth: TruthState;
};

export type CommerceEvent = {
  state: OrderState;
  label: string;
  detail: string;
};

export const IMPACT_CONTRACTS: ImpactContract[] = [
  {
    id: "impact:whales-demo",
    mission: "WH4LES_",
    publicName: "Ocean habitat action",
    unitLabel: "1 DEMO ACTION UNIT",
    unitFundingNok: 140,
    claim: "Prototype only — a successful sale would create a NOK 140 Impact obligation for an approved WH4LES_ pathway.",
    evidence: "No delivery partner, live unit or transferred funds are represented in this prototype.",
    state: "DEMO",
    accent: "#74f5ff",
    truth: "DEMO",
  },
  {
    id: "impact:rewild-demo",
    mission: "RE:WILD_",
    publicName: "Habitat recovery action",
    unitLabel: "1 DEMO RESTORE UNIT",
    unitFundingNok: 160,
    claim: "Prototype only — a successful sale would create a NOK 160 Impact obligation for an approved restoration pathway.",
    evidence: "No square metres restored, partner delivery or ecological outcome is claimed here.",
    state: "DEMO",
    accent: "#b9ff2f",
    truth: "DEMO",
  },
  {
    id: "impact:climate-demo",
    mission: "CLIM4TE_",
    publicName: "Living landscape action",
    unitLabel: "1 DEMO LAND UNIT",
    unitFundingNok: 120,
    claim: "Prototype only — a successful sale would create a NOK 120 Impact obligation for an approved CLIM4TE_ pathway.",
    evidence: "No tree, carbon, offset or restoration claim is authorised by this fixture.",
    state: "DEMO",
    accent: "#ff3eb5",
    truth: "DEMO",
  },
];

export const GOLD_PRODUCT: CreatorProduct = {
  id: "print:tidal-memory-01",
  creator: "DEMO CREATOR",
  title: "TIDAL MEMORY 01",
  productType: "FINE ART PRINT",
  size: "50 × 70 CM",
  rights: "Creator-owned · bounded commerce/display licence · no AI-training permission",
  impactContractId: "impact:whales-demo",
  state: "CURATION_PENDING",
  waterfall: {
    customerPriceNok: 1200,
    taxAndPaymentReserveNok: 150,
    productionAndFulfilmentNok: 310,
    impactFundingNok: 140,
    creatorPayableNok: 400,
    fourPlanetContributionNok: 200,
  },
  truth: "DEMO",
};

export function calculateWaterfall(price: number, impactFunding: number): Waterfall {
  const customerPriceNok = Math.max(900, Math.round(price / 50) * 50);
  const taxAndPaymentReserveNok = Math.round(customerPriceNok * 0.125);
  const productionAndFulfilmentNok = 310;
  const creatorPayableNok = Math.max(250, Math.round(customerPriceNok * 0.33));
  const fourPlanetContributionNok = Math.max(
    0,
    customerPriceNok - taxAndPaymentReserveNok - productionAndFulfilmentNok - impactFunding - creatorPayableNok,
  );

  return {
    customerPriceNok,
    taxAndPaymentReserveNok,
    productionAndFulfilmentNok,
    impactFundingNok: impactFunding,
    creatorPayableNok,
    fourPlanetContributionNok,
  };
}

export function waterfallTotal(waterfall: Waterfall) {
  return (
    waterfall.taxAndPaymentReserveNok +
    waterfall.productionAndFulfilmentNok +
    waterfall.impactFundingNok +
    waterfall.creatorPayableNok +
    waterfall.fourPlanetContributionNok
  );
}

export const ORDER_EVENTS: CommerceEvent[] = [
  { state: "ORDER_CREATED", label: "ORDER", detail: "Customer intent exists. No money or impact is inferred yet." },
  { state: "PAYMENT_CAPTURED", label: "PAYMENT", detail: "DEMO payment captured. This is not connected to a payment provider." },
  { state: "PRODUCTION_ACCEPTED", label: "POD", detail: "DEMO print job accepted by a future quality-validated fulfilment adapter." },
  { state: "CREATOR_PAYABLE_CREATED", label: "CREATOR", detail: "Creator payable becomes a distinct obligation, not immediate cash." },
  { state: "IMPACT_LIABILITY_CREATED", label: "IMPACT", detail: "The selected Impact Contract creates a separate funding obligation." },
  { state: "SHIPPED", label: "FULFILMENT", detail: "DEMO shipment state. No physical product has been produced or shipped." },
  { state: "IMPACT_FUNDED", label: "IMPACT", detail: "DEMO funding state only. No funds have been transferred to a delivery partner." },
  { state: "IMPACT_EVIDENCE_LINKED", label: "PROOF", detail: "DEMO evidence link closes the designed proof path without claiming a real outcome." },
  { state: "CREATOR_PAID", label: "CREATOR", detail: "DEMO payout state only. No creator has been paid by this prototype." },
  { state: "TRANSACTION_RECONCILED", label: "ECONOMY", detail: "Every output is classified and the synthetic transaction reconciles." },
];
