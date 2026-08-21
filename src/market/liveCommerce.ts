export type LiveTruthState = "TEST" | "PENDING" | "VERIFIED" | "REVERSED";

export type LiveOrderState =
  | "ORDER_CREATED"
  | "PAYMENT_PENDING"
  | "PAYMENT_CAPTURED"
  | "FULFILMENT_REVIEW"
  | "POD_ORDER_SUBMITTED"
  | "PRODUCTION_ACCEPTED"
  | "SHIPPED"
  | "DELIVERED"
  | "CREATOR_PAYABLE_CREATED"
  | "CREATOR_PAID"
  | "IMPACT_LIABILITY_CREATED"
  | "IMPACT_FUNDED"
  | "IMPACT_EVIDENCE_LINKED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "REPLACEMENT_PENDING"
  | "CANCELLED"
  | "TRANSACTION_RECONCILED";

export type Money = {
  amountMinor: number;
  currency: "NOK";
};

export type MarketWaterfall = {
  gross: Money;
  taxReserve: Money;
  paymentCost: Money;
  production: Money;
  shipping: Money;
  qualityReserve: Money;
  creatorPayable: Money;
  impactLiability: Money;
  fourPlanetContribution: Money;
};

export type ProviderMode = "test" | "live";

export type CheckoutInput = {
  orderId: string;
  publicOrderRef: string;
  customerEmail: string;
  amount: Money;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
};

export type CheckoutResult = {
  provider: "stripe";
  checkoutSessionId: string;
  checkoutUrl: string;
  mode: ProviderMode;
};

export interface PaymentProvider {
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  refund(input: { paymentId: string; amount: Money; idempotencyKey: string; reason: string }): Promise<{ refundId: string; state: "SUBMITTED" | "COMPLETED" }>;
}

export type PodSubmitInput = {
  orderId: string;
  publicOrderRef: string;
  recipient: {
    name: string;
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    countryCode: "NO";
  };
  items: Array<{
    sku: string;
    providerSku: string;
    quantity: number;
    assetUrl: string;
  }>;
  idempotencyKey: string;
  releaseMode: "HUMAN_REVIEW" | "AUTOMATIC";
};

export type PodSubmitResult = {
  provider: string;
  providerOrderId: string;
  state: "HELD" | "SUBMITTED" | "ACCEPTED";
  mode: ProviderMode;
};

export interface PodProvider {
  quote(input: { countryCode: "NO"; items: Array<{ providerSku: string; quantity: number }> }): Promise<{ production: Money; shipping: Money; sourceCheckedAt: string }>;
  submit(input: PodSubmitInput): Promise<PodSubmitResult>;
  cancel(input: { providerOrderId: string; idempotencyKey: string }): Promise<{ state: "CANCELLED" | "TOO_LATE" }>;
}

export type ImpactActionInput = {
  orderId: string;
  impactContractKey: string;
  attribution: string;
  idempotencyKey: string;
  amount: Money;
};

export type ImpactActionResult = {
  provider: string;
  providerEventId: string;
  truth: LiveTruthState;
  evidenceRef?: string;
  mode: ProviderMode;
};

export interface ImpactProvider {
  createAction(input: ImpactActionInput): Promise<ImpactActionResult>;
  reverseAction(input: { providerEventId: string; idempotencyKey: string; reason: string }): Promise<{ truth: "REVERSED" | "PENDING" }>;
  getEvidence(input: { providerEventId: string }): Promise<{ truth: LiveTruthState; sourceUrl?: string; sourceDate?: string }>;
}

const CORE_TRANSITIONS: Record<LiveOrderState, readonly LiveOrderState[]> = {
  ORDER_CREATED: ["PAYMENT_PENDING", "CANCELLED"],
  PAYMENT_PENDING: ["PAYMENT_CAPTURED", "CANCELLED"],
  PAYMENT_CAPTURED: ["FULFILMENT_REVIEW", "REFUND_PENDING"],
  FULFILMENT_REVIEW: ["POD_ORDER_SUBMITTED", "REFUND_PENDING", "CANCELLED"],
  POD_ORDER_SUBMITTED: ["PRODUCTION_ACCEPTED", "REFUND_PENDING", "CANCELLED"],
  PRODUCTION_ACCEPTED: ["SHIPPED", "REPLACEMENT_PENDING", "REFUND_PENDING"],
  SHIPPED: ["DELIVERED", "REPLACEMENT_PENDING", "REFUND_PENDING"],
  DELIVERED: ["CREATOR_PAYABLE_CREATED", "IMPACT_LIABILITY_CREATED", "REFUND_PENDING", "REPLACEMENT_PENDING", "TRANSACTION_RECONCILED"],
  CREATOR_PAYABLE_CREATED: ["CREATOR_PAID", "IMPACT_LIABILITY_CREATED", "TRANSACTION_RECONCILED", "REFUND_PENDING"],
  CREATOR_PAID: ["IMPACT_LIABILITY_CREATED", "TRANSACTION_RECONCILED", "REFUND_PENDING"],
  IMPACT_LIABILITY_CREATED: ["IMPACT_FUNDED", "REFUND_PENDING", "TRANSACTION_RECONCILED"],
  IMPACT_FUNDED: ["IMPACT_EVIDENCE_LINKED", "REFUND_PENDING"],
  IMPACT_EVIDENCE_LINKED: ["CREATOR_PAYABLE_CREATED", "CREATOR_PAID", "TRANSACTION_RECONCILED", "REFUND_PENDING"],
  REFUND_PENDING: ["REFUNDED", "REPLACEMENT_PENDING"],
  REFUNDED: ["TRANSACTION_RECONCILED"],
  REPLACEMENT_PENDING: ["SHIPPED", "REFUND_PENDING"],
  CANCELLED: ["TRANSACTION_RECONCILED"],
  TRANSACTION_RECONCILED: [],
};

export function canTransitionOrder(from: LiveOrderState, to: LiveOrderState): boolean {
  return CORE_TRANSITIONS[from].includes(to);
}

export function assertOrderTransition(from: LiveOrderState, to: LiveOrderState): void {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Invalid 4MARKET order transition: ${from} -> ${to}`);
  }
}

export function makeProviderIdempotencyKey(scope: "checkout" | "pod" | "refund" | "impact", orderId: string, revision = 1): string {
  if (!orderId.trim()) throw new Error("orderId is required for idempotency");
  if (!Number.isInteger(revision) || revision < 1) throw new Error("revision must be a positive integer");
  return `4market:${scope}:${orderId}:v${revision}`;
}

export function validateWaterfall(waterfall: MarketWaterfall): void {
  const parts = [
    waterfall.taxReserve,
    waterfall.paymentCost,
    waterfall.production,
    waterfall.shipping,
    waterfall.qualityReserve,
    waterfall.creatorPayable,
    waterfall.impactLiability,
    waterfall.fourPlanetContribution,
  ];

  if (waterfall.gross.currency !== "NOK" || parts.some((part) => part.currency !== "NOK")) {
    throw new Error("Business Gold launch supports NOK only");
  }
  if (waterfall.gross.amountMinor < 0 || parts.some((part) => part.amountMinor < 0)) {
    throw new Error("Waterfall values cannot be negative");
  }
  const allocated = parts.reduce((sum, part) => sum + part.amountMinor, 0);
  if (allocated !== waterfall.gross.amountMinor) {
    throw new Error(`Waterfall does not reconcile: allocated=${allocated}, gross=${waterfall.gross.amountMinor}`);
  }
}

export const FIRST_LIVE_ORDER_CONTROL = {
  market: "NO" as const,
  currency: "NOK" as const,
  podReleaseMode: "HUMAN_REVIEW" as const,
  automaticPodReleaseAfterSuccessfulOrders: 3,
  impactEnabled: false,
  truth: "VERIFIED" as const,
};
