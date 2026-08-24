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
    <Block title="2 · PUBLIC LAUNCH PRODUCTS"><p>The approved self-service paid products are recurring SUPPORT 4PLANET and recurring Mission Supporter. ME4PLANET / 4PEOPLE participation is free. Project Sponsor, Mission Sponsor and Founding Patron are enquiry-and-agreement flows; the website does not charge the selected amount directly.</p></Block>
    <Block title="3 · PRICE AND VAT"><p>The price shown immediately before Stripe Checkout is the current configured recurring price. {OPERATOR.legalName} is not registered in the Norwegian VAT Register in this version. If tax/VAT treatment changes, affected public offers must be updated before new transactions use the changed treatment.</p></Block>
    <Block title="4 · WHAT SUPPORT MEANS"><p>Support and Mission Supporter payments support 4PLANET's platform or a named Mission pathway. They are not presented as tax-deductible charitable donations and do not themselves establish a particular ecological delivery, evidence record or ecological outcome.</p></Block>
    <Block title="5 · RECURRING PAYMENTS"><p>Recurring amount and billing interval are shown before payment. The subscription renews at that interval until cancelled. Future renewals can be stopped through Stripe Customer Portal when enabled or by contacting 4PLANET. Cancelling future renewals does not remove mandatory rights concerning payments already made.</p></Block>
    <Block title="6 · STRIPE"><p>Stripe processes payment details in Stripe-hosted Checkout. 4PLANET does not need to receive or store full card numbers. 4PLANET keeps the transaction and subscription information necessary for payment status, customer service, accounting, fraud/dispute handling and, where relevant, later Personal Impact records.</p></Block>
    <Block title="7 · SPONSORSHIP / PATRON"><p>The public slider records an intended amount only. No card charge is created. A specific agreement must define the counterparty, amount, scope, consideration/recognition, period, tax/VAT treatment, cancellation/remedies and any claim rights before an invoice is sent.</p></Block>
    <Block title="8 · IMPACT"><p>Real-money Tree, Plastic, Coral and Rewild IMPACT units remain closed until implementation partner, exact unit, economics, delivery conditions, proof, claims, no-double-counting and remedy gates are complete. A payment may never be used as proof that an ecological outcome occurred.</p></Block>
    <Block title="9 · MANDATORY RIGHTS"><p>These terms do not reduce rights that cannot lawfully be waived under applicable Norwegian consumer law.</p></Block>
  </Frame>;
}

export function PaymentRights() {
  return <Frame title="Payment, cancellation & withdrawal" label="LEGAL · CONSUMER" path="/legal/payments">
    <Block title="BEFORE PAYMENT"><p>Before Stripe Checkout, 4PLANET displays the selected product, verified price, recurring interval, seller and the material nature of the support. The final 4PLANET action before Stripe explicitly states that the order carries an obligation to pay.</p></Block>
    <Block title="RECURRING SUPPORT"><p>SUPPORT 4PLANET and Mission Supporter renew monthly until cancelled. You may stop future renewals at any time. We do not design cancellation to require unnecessary steps.</p></Block>
    <Block title="WITHDRAWAL RIGHTS"><p>Mandatory statutory withdrawal rights apply where applicable. 4PLANET does not rely on an early-performance waiver unless a future specific transaction clearly requests the legally required consent and acknowledgement. Use the withdrawal form or send an unambiguous message to {OPERATOR.email}.</p></Block>
    <Block title="REFUNDS / ERRORS"><p>Duplicate or incorrect charges and other valid refund claims are investigated and corrected. Financial history is not rewritten: refund and dispute states are recorded separately so the transaction remains auditable.</p></Block>
    <Block title="SPONSORSHIP"><p>High-value sponsorship and patron flows do not create a consumer card charge from the public site. Their payment, cancellation, remedies and tax/VAT treatment are governed by the reviewed specific agreement and mandatory law.</p></Block>
  </Frame>;
}

export function WithdrawalForm() {
  return <Frame title="Withdrawal form" label="LEGAL · WITHDRAWAL" path="/legal/withdrawal">
    <Block title="HOW TO USE IT"><p>You may copy the information below into an email to <a href={`mailto:${OPERATOR.email}`} className="link">{OPERATOR.email}</a>. You do not need to use this exact wording if you otherwise make it unambiguous that you want to withdraw from an agreement where a statutory withdrawal right applies.</p></Block>
    <Block title="STANDARD INFORMATION"><p>To: {OPERATOR.legalName}, {OPERATOR.address}, {OPERATOR.email}</p><p>I hereby notify you that I wish to withdraw from my agreement for: [product/service].</p><p>Ordered on: [date]<br />Name: [name]<br />Email used for payment: [email]<br />Address, if relevant: [address]<br />Date: [date]</p><p>Do not send full card details or security codes.</p></Block>
  </Frame>;
}
