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
    title: "IMPACT pathway contribution",
    nature: "A one-time contribution to the named 4PLANET IMPACT pathway. Payment does not by itself prove partner allocation, ecological delivery, evidence or outcome. Until a partner-backed unit contract is active, this is not sold as a delivered tree, kilogram, coral fragment, restored area or other ecological unit.",
    recurring: false,
    withdrawal: "Mandatory consumer withdrawal and refund rights apply where applicable. The terms shown before payment do not reduce rights granted by mandatory Norwegian consumer law.",
    cancellation: "If a contribution is cancelled or refunded where required by law or the applicable terms, financial state is updated separately from any later ecological delivery state. Payment is never treated as ecological proof.",
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
    nature: "Negotiated founding support for the shared 4PLANET build. The public website records the intended amount and enquiry; terms, amount and any recognition are agreed before a Stripe invoice is sent. It is not presented as a tax-deductible donation.",
    recurring: false,
    withdrawal: "Any rights depend on the counterparty and written agreement, without reducing mandatory rights that apply.",
    cancellation: "Payment follows a reviewed agreement and Stripe invoice rather than an anonymous high-value public card charge.",
  },
  MEMBERSHIP: {
    title: "4PLANET Supporting Membership",
    nature: "Optional recurring paid membership for people who want a stronger supporting relationship with 4PLANET. Basic ME4PLANET / 4PEOPLE participation remains free. Only benefits explicitly described by 4PLANET are included, and the payment is not presented as tax-deductible or as ecological delivery.",
    recurring: true,
    withdrawal: "Mandatory consumer withdrawal rights apply to the initial agreement where applicable. 4PLANET does not reduce rights granted by mandatory Norwegian consumer law.",
    cancellation: "You can stop future renewals at any time through Stripe Customer Portal when available, or by contacting 4PLANET. Free participation remains separate from the paid subscription.",
  },
  SPONSOR: {
    title: "Sponsorship / negotiated support",
    nature: "Project Sponsor, Mission Sponsor, Sponsor Package and negotiated business support use an enquiry and reviewed-invoice flow. The public amount selector records intended scope only and never charges a card. Consideration, visibility, deliverables and tax/VAT treatment are set in the specific agreement.",
    recurring: false,
    withdrawal: "Business sponsorship and negotiated support terms, consideration, tax/VAT treatment, cancellation and remedies are stated in the specific written agreement. Mandatory rights are not reduced where they apply.",
    cancellation: "No invoice is sent until scope, counterparty, amount, consideration and tax/VAT treatment have been reviewed.",
  },
};

export const PAYMENT_TRUTH = [
  "PAYMENT",
  "DELIVERY",
  "EVIDENCE",
  "OUTCOME",
] as const;
