import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { resetAnalyticsConsent } from "@/analytics/Analytics";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/Cinematic";
import { OPERATOR } from "@/legal/legal";

const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.025em" };
const h: React.CSSProperties = { fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: T.blue };

const SECTIONS: [string, React.ReactNode][] = [
  ["Controller", <>{OPERATOR.legalName}, org. no. {OPERATOR.orgNumber}, {OPERATOR.address}, is the current controller for personal data processed through the public 4PLANET account, support, payment and enquiry services. Privacy questions can be sent to <a href={`mailto:${OPERATOR.email}`} className="link" style={{ color: T.blue }}>{OPERATOR.email}</a>.</>],
  ["What we collect", "Depending on what you use, we may process contact and account details you provide, participation preferences, enquiry information, the Stripe customer/subscription/transaction identifiers needed to operate payments, payment state, product or Mission selected, support history, fraud/dispute/refund status and technical security logs. 4PLANET does not need to store full card numbers or card security codes."],
  ["Why we use it", "We use necessary account and transaction data to provide the service you request, administer recurring support, respond to enquiries, provide customer service, prevent misuse, maintain security and meet accounting or other legal obligations. We do not treat a payment as evidence of an ecological outcome."],
  ["Marketing is separate", "Creating an account, sending an enquiry or paying for support does not by itself opt you into marketing. Where we ask whether you want 4PLANET updates, that choice is separate and should be off by default unless you actively choose it. You can withdraw a marketing choice without losing necessary service or accounting processing."],
  ["Payment processor", <>Card and payment details are entered in Stripe-hosted payment surfaces. Stripe processes payment data as part of the payment service. 4PLANET stores or receives only the identifiers and financial status needed to operate, reconcile and support the transaction. See the current <Link to="/legal/terms" className="link" style={{ color: T.blue }}>4PLANET terms</Link> for the seller and payment model.</>],
  ["Infrastructure providers", "4PLANET may use service providers such as Stripe for payments, Supabase for hosted application/database infrastructure and Cloudflare for hosting, delivery and security. Access is limited to what is needed for the service, and provider arrangements must be reviewed for the applicable controller/processor roles and data-transfer safeguards."],
  ["Retention", "We aim to keep ordinary account/profile information only as long as needed for the service and applicable purposes. Some transaction, invoice and accounting records cannot simply be deleted on account closure because law may require retention. Security, dispute and fraud records may also be retained for an appropriate period where necessary."],
  ["Your rights", <>Subject to the conditions in applicable data-protection law, you may request access, correction, deletion, restriction, objection or portability of relevant personal data. Contact <a href={`mailto:${OPERATOR.email}`} className="link" style={{ color: T.blue }}>{OPERATOR.email}</a>. A deletion request does not require 4PLANET to erase records that must lawfully be retained, but those records should not be used for unrelated purposes.</>],
  ["International processing", "Some service providers may process data outside Norway or the EEA. Where this occurs, 4PLANET must rely on an applicable transfer mechanism and appropriate safeguards rather than treating provider use as a waiver of European data-protection requirements."],
  ["Security and incidents", "4PLANET uses separation between browser and server secrets, hosted payment collection, access controls and no-store rules on sensitive surfaces. No system can promise absolute security. Suspected incidents are assessed for containment, affected data and any notification duties."],
  ["Privacy-first site measurement", "Where enabled, Cloudflare Web Analytics provides aggregate measurement. Optional Google Analytics is separate and is loaded only after you choose ALLOW. Advertising personalisation and Google Signals are disabled in the 4PLANET implementation."],
  ["Your optional analytics choice", <><button type="button" onClick={resetAnalyticsConsent} style={{ border: `1px solid ${T.ink}`, background: "transparent", color: T.ink, padding: "9px 12px", cursor: "pointer", font: "inherit" }}>RESET ANALYTICS CHOICE</button><span style={{ display: "block", marginTop: 10, opacity: .7 }}>This removes the local optional GA4 choice and reloads the page so you can choose again. It does not cancel a subscription or change necessary service/account processing.</span></>],
  ["Complaints", <>You can contact 4PLANET first so we can address the issue. You also have the right to complain to the competent data-protection authority, including Datatilsynet in Norway where applicable.</>],
];

export default function Privacy() {
  return (
    <PublicShell>
      <Seo title="Privacy | 4PLANET" description="How 4PLANET handles account, enquiry, payment and optional analytics data." path="/privacy" />
      <Section pad="clamp(56px,8vw,110px)">
        <Reveal><div style={{ ...h, marginBottom: 20 }}>PRIVACY · 24 AUG 2026</div><h1 style={{ ...display, color: T.ink, fontSize: "clamp(30px,4.4vw,56px)", lineHeight: 1.02, maxWidth: 760 }}>Privacy should be part of the product, not an afterthought.</h1><p style={{ fontSize: "clamp(16px,1.3vw,19px)", color: T.ink, opacity: .7, marginTop: 20, maxWidth: 690, lineHeight: 1.6 }}>This notice covers the current public participation, support, payment and enquiry model. It will be updated as ME4PLANET account functionality expands.</p></Reveal>
        <div style={{ marginTop: "clamp(40px,6vw,72px)", display: "grid", gap: "clamp(28px,4vw,44px)", maxWidth: 820 }}>{SECTIONS.map(([title, body]) => <Reveal key={title}><div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 18 }}><div style={h}>{title}</div><div style={{ fontSize: "clamp(15px,1.2vw,17px)", color: T.ink, marginTop: 12, lineHeight: 1.65 }}>{body}</div></div></Reveal>)}</div>
        <div style={{ marginTop: "clamp(40px,5vw,64px)", display: "flex", gap: 18, flexWrap: "wrap" }}><Link to="/join" className="link" style={{ color: T.blue }}>Join & support</Link><Link to="/legal/terms" className="link" style={{ color: T.blue }}>Terms</Link><Link to="/legal/payments" className="link" style={{ color: T.blue }}>Payment & cancellation</Link></div>
      </Section>
    </PublicShell>
  );
}
