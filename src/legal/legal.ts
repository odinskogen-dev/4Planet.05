export const LEGAL_VERSION = "2026-08-24";

export const OPERATOR = {
  legalName: "SKOG COMMUNICATIONS AS",
  orgNumber: "923 003 789",
  address: "Sandakerveien 52, 0477 Oslo, Norway",
  email: "odin.skogen@gmail.com",
  vatRegistered: false,
} as const;

export type ConsumerFamily = "IMPACT" | "SUPPORT" | "PATRON" | "MEMBERSHIP" | "MISSION_SUPPORT" | "SPONSOR";

export const CONSUMER_DISCLOSURES: Record<ConsumerFamily, {
  title: string;
  nature: string;
  recurring: boolean;
  withdrawal: string;
  cancellation: string;
}> = {
  IMPACT: {
    title: "IMPACT contribution",
    nature: "Payment records a defined contribution. It does not by itself prove partner delivery, ecological evidence or ecological outcome.",
    recurring: false,
    withdrawal: "For consumer transactions, 4PLANET applies a 14-day cancellation/refund window unless a different mandatory right applies. We do not rely on an early-performance waiver unless you explicitly request and acknowledge it in a specific transaction.",
    cancellation: "If you cancel before irreversible partner allocation or delivery has begun, the payment is refunded. If performance has lawfully begun at your explicit request, any deduction must follow applicable consumer law and the terms shown before payment.",
  },
  SUPPORT: {
    title: "Support 4PLANET",
    nature: "Voluntary support to 4PLANET's platform and mission work. It is not presented as a tax-deductible donation.",
    recurring: false,
    withdrawal: "For consumer transactions, 4PLANET applies a 14-day cancellation/refund window unless a different mandatory right applies.",
    cancellation: "Contact 4PLANET within the applicable cancellation period and we will process the request without reducing mandatory consumer rights.",
  },
  PATRON: {
    title: "Founding Patron support",
    nature: "Support for 4PLANET's platform and mission development. Any stated recognition or benefits are limited to what is explicitly described before payment. It is not presented as a tax-deductible donation.",
    recurring: false,
    withdrawal: "For consumer transactions, 4PLANET applies a 14-day cancellation/refund window unless a different mandatory right applies.",
    cancellation: "Contact 4PLANET within the applicable cancellation period and we will process the request without reducing mandatory consumer rights.",
  },
  MEMBERSHIP: {
    title: "4PLANET Membership",
    nature: "Recurring membership/support. The amount and billing interval are shown immediately before payment.",
    recurring: true,
    withdrawal: "The initial consumer agreement is subject to applicable withdrawal rights. 4PLANET does not rely on a waiver unless you explicitly request early performance and acknowledge the legal effect.",
    cancellation: "You may stop future renewals through ME4PLANET / Stripe Customer Portal once enabled, or by contacting 4PLANET. Cancellation must not be made unnecessarily difficult.",
  },
  MISSION_SUPPORT: {
    title: "Mission Supporter",
    nature: "Recurring support connected to a named 4PLANET Mission. This does not automatically purchase or verify a specific ecological outcome.",
    recurring: true,
    withdrawal: "The initial consumer agreement is subject to applicable withdrawal rights. 4PLANET does not rely on a waiver unless you explicitly request early performance and acknowledge the legal effect.",
    cancellation: "You may stop future renewals through ME4PLANET / Stripe Customer Portal once enabled, or by contacting 4PLANET.",
  },
  SPONSOR: {
    title: "Sponsorship",
    nature: "Payment is tied to the specific sponsorship package, project or Mission identified before payment. Rights and consideration are limited to the written offer/terms.",
    recurring: false,
    withdrawal: "Consumer withdrawal rights apply where legally relevant. Business sponsorships are governed by the specific written agreement.",
    cancellation: "Refund, cancellation and remedy follow the specific sponsorship agreement and mandatory law.",
  },
};

export const PAYMENT_TRUTH = [
  "PAYMENT RECEIVED",
  "DELIVERY PENDING",
  "DELIVERED",
  "EVIDENCE AVAILABLE",
  "OUTCOME — ONLY IF ESTABLISHED",
] as const;
