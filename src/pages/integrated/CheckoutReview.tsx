import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";
import { startStripeCheckout, type StripeProductKey } from "@/payments/stripe";
import { CONSUMER_DISCLOSURES, OPERATOR, type ConsumerFamily } from "@/legal/legal";

type Offer = {
  ok: boolean;
  environment: "TEST" | "LIVE";
  productKey: StripeProductKey;
  productKind: string;
  productFamily: ConsumerFamily;
  checkoutMode: "payment" | "subscription";
  name: string;
  description?: string | null;
  unitAmount: number;
  currency: string;
  recurring?: { interval: string | null; intervalCount: number } | null;
};

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: T.blue };
const box: React.CSSProperties = { borderTop: `1px solid ${T.line}`, padding: "18px 0" };

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: 0 }).format(amount / 100);
}

function cadence(offer: Offer) {
  if (!offer.recurring) return "One-time payment";
  const interval = offer.recurring.interval === "year" ? "year" : offer.recurring.interval === "week" ? "week" : offer.recurring.interval === "day" ? "day" : "month";
  return `Recurring · every ${offer.recurring.intervalCount > 1 ? `${offer.recurring.intervalCount} ` : ""}${interval}`;
}

export default function CheckoutReview() {
  const { productKey = "" } = useParams();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [opening, setOpening] = useState(false);
  const disclosure = useMemo(() => offer ? CONSUMER_DISCLOSURES[offer.productFamily] : null, [offer]);

  useEffect(() => {
    let active = true;
    fetch(`/api/stripe/offer?productKey=${encodeURIComponent(productKey)}`, { credentials: "same-origin" })
      .then(async (response) => ({ response, body: await response.json().catch(() => null) as Offer | null }))
      .then(({ response, body }) => {
        if (!active) return;
        if (!response.ok || !body?.ok) setError("This support option is not available right now.");
        else setOffer(body);
      })
      .catch(() => active && setError("This support option is not available right now."));
    return () => { active = false; };
  }, [productKey]);

  const pay = async () => {
    if (!offer || !accepted) return;
    setOpening(true);
    setError("");
    try { await startStripeCheckout({ productKey: offer.productKey, quantity: 1 }); }
    catch { setError("Stripe Checkout could not be opened. No payment has been made."); setOpening(false); }
  };

  return (
    <PublicShell>
      <Seo title="Review support | 4PLANET" description="Review price, recurring terms and consumer information before opening Stripe Checkout." path={`/checkout/review/${productKey}`} />
      <Section pad="clamp(48px,7vw,90px)">
        <div style={mono}>4PLANET · PAYMENT REVIEW</div>
        <h1 style={{ color: T.ink, marginTop: 18, fontSize: "clamp(36px,6vw,72px)", letterSpacing: "-.05em", lineHeight: .98, fontWeight: 500, maxWidth: 860 }}>Know what you are supporting before you pay.</h1>
        <p style={{ color: T.dim, maxWidth: 690, marginTop: 20, fontSize: 17, lineHeight: 1.6 }}>4PLANET verifies the active Stripe price before showing this page. Card details are entered on Stripe, not stored by 4PLANET.</p>

        {!offer && !error && <div style={{ marginTop: 40, color: T.dim }}>Loading verified offer…</div>}
        {error && <div role="alert" style={{ marginTop: 36, border: `1px solid ${T.line}`, padding: 18, color: T.dim }}>{error}</div>}

        {offer && <div style={{ marginTop: 42, maxWidth: 820 }}>
          {offer.environment === "TEST" && <div style={{ border: `1px solid ${T.blue}`, padding: 14, marginBottom: 22, color: T.blue, fontFamily: T.mono, fontSize: 11, letterSpacing: ".08em" }}>TEST MODE · NO REAL PAYMENT OR DELIVERY</div>}
          <div style={box}>
            <div style={mono}>WHAT</div>
            <div style={{ fontSize: 25, marginTop: 9, color: T.ink, fontWeight: 500 }}>{offer.name}</div>
            {offer.description && <p style={{ color: T.dim, lineHeight: 1.55 }}>{offer.description}</p>}
            {disclosure && <p style={{ color: T.dim, lineHeight: 1.55 }}>{disclosure.nature}</p>}
          </div>
          <div style={{ ...box, display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "end" }}>
            <div><div style={mono}>PRICE</div><div style={{ color: T.dim, marginTop: 8 }}>{cadence(offer)} · future renewals can be cancelled</div></div>
            <div style={{ fontSize: 30, color: T.ink, fontWeight: 600 }}>{money(offer.unitAmount, offer.currency)}</div>
          </div>
          <div style={box}>
            <div style={mono}>SELLER</div>
            <p style={{ color: T.ink, lineHeight: 1.6 }}><strong>{OPERATOR.legalName}</strong><br />Org. no. {OPERATOR.orgNumber}<br />{OPERATOR.address}<br /><a className="link" href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a></p>
            <p style={{ color: T.dim, lineHeight: 1.55 }}>The company is not registered in the Norwegian VAT Register in this legal version. The amount shown above is the configured total recurring charge.</p>
          </div>
          {disclosure && <div style={box}>
            <div style={mono}>CANCEL / WITHDRAWAL</div>
            <p style={{ color: T.dim, lineHeight: 1.6 }}>{disclosure.withdrawal}</p>
            <p style={{ color: T.dim, lineHeight: 1.6 }}>{disclosure.cancellation}</p>
          </div>}
          <div style={box}>
            <label style={{ display: "flex", gap: 11, alignItems: "flex-start", color: T.ink, lineHeight: 1.55 }}>
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} style={{ marginTop: 4 }} />
              <span>I have reviewed the recurring price and <Link to="/legal/terms" className="link">terms</Link>, including <Link to="/legal/payments" className="link">payment, cancellation and withdrawal information</Link>. This is separate from any marketing consent.</span>
            </label>
            <button type="button" onClick={pay} disabled={!accepted || opening} style={{ marginTop: 20, border: `1px solid ${accepted ? T.ink : T.line}`, background: accepted ? T.ink : "transparent", color: accepted ? T.bg : T.faint, padding: "13px 17px", font: "inherit", fontWeight: 700, cursor: accepted ? "pointer" : "not-allowed" }}>
              {opening ? "OPENING STRIPE…" : "ORDER WITH OBLIGATION TO PAY"}
            </button>
            <p style={{ color: T.faint, fontSize: 12.5, lineHeight: 1.55, marginTop: 14 }}>Stripe Checkout opens next. 4PLANET verifies payment server-side; a browser redirect alone is never accepted as proof of payment.</p>
          </div>
        </div>}
      </Section>
    </PublicShell>
  );
}
