import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";
import { LEGAL_VERSION, OPERATOR } from "@/legal/legal";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 11, letterSpacing: ".13em", textTransform: "uppercase", color: T.blue };
const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.04em" };
const copy: React.CSSProperties = { color: T.ink, lineHeight: 1.68, fontSize: "clamp(15px,1.2vw,17px)" };

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ borderTop: `1px solid ${T.line}`, padding: "20px 0 30px" }}><div style={mono}>{title}</div><div style={{ ...copy, marginTop: 12 }}>{children}</div></section>;
}

function Frame({ title, label, path, children }: { title: string; label: string; path: string; children: React.ReactNode }) {
  return <PublicShell><Seo title={`${title} | 4PLANET`} description={`${title} for 4PLANET services operated by ${OPERATOR.legalName}.`} path={path} /><Section pad="clamp(56px,8vw,110px)"><div style={mono}>{label}</div><h1 style={{ ...display, color: T.ink, fontSize: "clamp(36px,6vw,72px)", lineHeight: .98, marginTop: 18, maxWidth: 900 }}>{title}</h1><p style={{ ...copy, color: T.dim, maxWidth: 760, marginTop: 20 }}>Version {LEGAL_VERSION}. Seller / service provider: {OPERATOR.legalName}, org. no. {OPERATOR.orgNumber}, {OPERATOR.address}.</p><div style={{ marginTop: 46, maxWidth: 840 }}>{children}</div><div style={{ marginTop: 44, display: "flex", gap: 18, flexWrap: "wrap" }}><Link to="/privacy" className="link" style={{ color: T.blue }}>Privacy</Link><Link to="/legal/payments" className="link" style={{ color: T.blue }}>Payment & cancellation</Link><Link to="/legal/withdrawal" className="link" style={{ color: T.blue }}>Withdrawal form</Link><Link to="/join" className="link" style={{ color: T.blue }}>Join & support</Link></div></Section></PublicShell>;
}

export function Terms() {
  return <Frame title="Terms for 4PLANET" label="LEGAL · TERMS" path="/legal/terms">
    <Block title="1 · WHO YOU DEAL WITH"><p>The public 4PLANET payment services are currently operated by {OPERATOR.legalName}, org. no. {OPERATOR.orgNumber}. Contact: <a href={`mailto:${OPERATOR.email}`} className="link">{OPERATOR.email}</a>. A negotiated agreement may state a different counterparty only when that is explicitly shown before commitment.</p></Block>
    <Block title="2 · PUBLIC PAYMENT TYPES"><p>Public self-service options include recurring SUPPORT 4PLANET, optional recurring Supporting Membership, recurring Mission Supporter and one-time Tree, Plastic, Coral and Rewild IMPACT pathway contributions. ME4PLANET / 4PEOPLE basic participation remains free. Project Sponsor, Mission Sponsor, Sponsor Package, Pilot / Funder and Founding Patron are public enquiry-and-agreement flows paid later through a reviewed Stripe Invoice.</p></Block>
    <Block title="3 · PRICE AND VAT"><p>The price shown immediately before Stripe Checkout is the current configured charge. {OPERATOR.legalName} is not registered in the Norwegian VAT Register in this version. Negotiated agreements and invoices require transaction-specific tax/VAT review before sending. If the operator's VAT status changes, affected offers must be updated before new transactions use the changed treatment.</p></Block>
    <Block title="4 · WHAT SUPPORT MEANS"><p>Support, Supporting Membership and Mission Supporter payments support 4PLANET's platform, participation layer or named Mission pathway as described before payment. They are not presented as tax-deductible charitable donations and do not themselves establish ecological delivery, evidence or outcome.</p></Block>
    <Block title="5 · RECURRING PAYMENTS"><p>Recurring amount and billing interval are shown before payment. A recurring subscription renews at that interval until cancelled. Future renewals can be stopped through Stripe Customer Portal when enabled or by contacting 4PLANET. Cancelling future renewals does not remove mandatory rights concerning payments already made. Free participation remains separate from paid Supporting Membership.</p></Block>
    <Block title="6 · STRIPE"><p>Stripe processes payment details in Stripe-hosted Checkout or, for negotiated business support, Stripe's Hosted Invoice Page. 4PLANET does not need to receive or store full card numbers. 4PLANET keeps transaction, invoice and subscription information needed for payment status, customer service, accounting, fraud/dispute handling and audit.</p></Block>
    <Block title="7 · SPONSORSHIP / PATRON / PILOT"><p>The public slider records an intended amount only. It does not charge a card. A specific agreement must define the counterparty, amount, scope, consideration/recognition, deliverables, period, tax/VAT treatment, cancellation/remedies and any claim rights before an invoice is sent. The reviewed invoice is the payment instrument for Project Sponsor, Mission Sponsor, Sponsor Package, Pilot / Funder and Founding Patron.</p></Block>
    <Block title="8 · IMPACT CONTRIBUTIONS"><p>Tree, Plastic, Coral and Rewild can accept one-time pathway contributions. They are not currently sold as delivered ecological units. A contribution may never be used as proof that a tree was planted, a kilogram collected, coral outplanted, habitat restored or another ecological outcome occurred. A pathway can be promoted to a defined unit only after real partner, economics, delivery, evidence, claims, double-counting and remedy controls are active.</p></Block>
    <Block title="9 · PAYMENT TRUTH"><p>Financial state is separate from ecological state: PAYMENT ≠ DELIVERY ≠ EVIDENCE ≠ OUTCOME. Stripe events update financial truth only.</p></Block>
    <Block title="10 · MANDATORY RIGHTS"><p>These terms do not reduce rights that cannot lawfully be waived under applicable Norwegian consumer law.</p></Block>
  </Frame>;
}

export function PaymentRights() {
  return <Frame title="Payment, cancellation & withdrawal" label="LEGAL · CONSUMER" path="/legal/payments">
    <Block title="BEFORE PAYMENT"><p>Before Stripe Checkout, 4PLANET displays the selected product, server-verified price, billing cadence where recurring, seller and the material nature of the payment. The final 4PLANET action before Stripe explicitly states that the order carries an obligation to pay.</p></Block>
    <Block title="RECURRING SUPPORT"><p>SUPPORT 4PLANET, Supporting Membership and Mission Supporter renew at the interval shown before payment until cancelled. You may stop future renewals at any time. Free ME4PLANET / 4PEOPLE participation is not cancelled merely because a paid Supporting Membership ends.</p></Block>
    <Block title="IMPACT CONTRIBUTIONS"><p>Tree, Plastic, Coral and Rewild payments are one-time pathway contributions in this version. Payment itself is not partner delivery, ecological evidence or outcome. Refund or dispute state is financial truth and does not rewrite any separately established ecological record.</p></Block>
    <Block title="WITHDRAWAL RIGHTS"><p>Mandatory statutory withdrawal rights apply where applicable. 4PLANET does not rely on an early-performance waiver unless a specific transaction clearly requests the legally required consent and acknowledgement. Use the withdrawal form or send an unambiguous message to {OPERATOR.email}.</p></Block>
    <Block title="REFUNDS / ERRORS"><p>Duplicate or incorrect charges and other valid refund claims are investigated and corrected. Financial history is not rewritten: refund and dispute states are recorded separately so the transaction remains auditable.</p></Block>
    <Block title="NEGOTIATED PAYMENTS"><p>High-value sponsorship, pilot/funder and patron flows do not create a public anonymous card charge. Payment, cancellation, remedies and tax/VAT treatment are governed by the reviewed specific agreement, the Stripe Invoice and mandatory law.</p></Block>
  </Frame>;
}

export function WithdrawalForm() {
  return <Frame title="Withdrawal form" label="LEGAL · WITHDRAWAL" path="/legal/withdrawal">
    <Block title="HOW TO USE IT"><p>You may copy the information below into an email to <a href={`mailto:${OPERATOR.email}`} className="link">{OPERATOR.email}</a>. You do not need to use this exact wording if you otherwise make it unambiguous that you want to withdraw from an agreement where a statutory withdrawal right applies.</p></Block>
    <Block title="STANDARD INFORMATION"><p>To: {OPERATOR.legalName}, {OPERATOR.address}, {OPERATOR.email}</p><p>I hereby notify you that I wish to withdraw from my agreement for: [product/service].</p><p>Ordered on: [date]<br />Name: [name]<br />Email used for payment: [email]<br />Address, if relevant: [address]<br />Date: [date]</p><p>Do not send full card details or security codes.</p></Block>
  </Frame>;
}
