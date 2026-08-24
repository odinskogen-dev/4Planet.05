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
    nature: "Payment would record a defined contribution. It would not by itself prove partner delivery, ecological evidence or ecological outcome. Real IMPACT payments are not released yet.",
    recurring: false,
    withdrawal: "Any future consumer IMPACT offer must state the applicable withdrawal and refund conditions before payment.",
    cancellation: "No public real-money IMPACT offer is active until partner, delivery, proof, economics, claims and remedy gates are closed.",
  },
  SUPPORT: {
    title: "Support 4PLANET",
    nature: "Recurring support for building and operating 4PLANET. It is not presented as a tax-deductible donation and is not tied to a specific ecological delivery or outcome.",
    recurring: true,
    withdrawal: "Mandatory consumer withdrawal rights apply to the initial agreement where applicable. 4PLANET does not reduce rights granted by mandatory Norwegian consumer law.",
    cancellation: "You can stop future renewals at any time through Stripe Customer Portal when available, or by contacting 4PLANET. Cancellation of future renewals is separate from any statutory right concerning a payment already made.",
  },
  MISSION_SUPPORT: {
    title: "Mission Supporter",
    nature: "Recurring support for 4PLANET's work to develop and operate one named Mission pathway. It does not by itself establish a specific ecological delivery or outcome and is not presented as tax-deductible.",
    recurring: true,
    withdrawal: "Mandatory consumer withdrawal rights apply to the initial agreement where applicable. 4PLANET does not reduce rights granted by mandatory Norwegian consumer law.",
    cancellation: "You can stop future renewals at any time through Stripe Customer Portal when available, or by contacting 4PLANET.",
  },
  PATRON: {
    title: "Founding Patron",
    nature: "Negotiated founding support for the shared 4PLANET build. No public card charge is created from the website. Terms, amount and any recognition are agreed before an invoice is sent. It is not presented as a tax-deductible donation.",
    recurring: false,
    withdrawal: "Any rights depend on the counterparty and written agreement, without reducing mandatory rights that apply.",
    cancellation: "The public website records interest only. Payment follows a reviewed agreement and invoice.",
  },
  MEMBERSHIP: {
    title: "ME4PLANET / 4PEOPLE",
    nature: "The public account and basic participation layer is free. There is no separate paid membership product in the approved launch model.",
    recurring: false,
    withdrawal: "No payment is required to create the free participation account.",
    cancellation: "Account/privacy controls are handled separately from paid support subscriptions.",
  },
  SPONSOR: {
    title: "Sponsorship",
    nature: "Project and Mission sponsorship are negotiated business relationships. The public amount selector records intended scope only and never charges a card.",
    recurring: false,
    withdrawal: "Business sponsorship terms, consideration, tax/VAT treatment, cancellation and remedies are stated in the specific written agreement.",
    cancellation: "No invoice is sent until scope, counterparty, amount, consideration and tax/VAT treatment have been reviewed.",
  },
};

export const PAYMENT_TRUTH = [
  "PAYMENT",
  "DELIVERY",
  "EVIDENCE",
  "OUTCOME",
] as const;
