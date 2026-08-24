import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";
import { startStripeCheckout, type StripeProductKey } from "@/payments/stripe";
import { CONSUMER_DISCLOSURES, OPERATOR, PAYMENT_TRUTH, type ConsumerFamily } from "@/legal/legal";

type Offer = {
  ok: boolean;
  environment: "TEST" | "LIVE";
  productKey: StripeProductKey;
  productKind: string;
  productFamily: ConsumerFamily | "B2B";
  checkoutMode: "payment" | "subscription";
  name: string;
  description?: string | null;
  unitAmount: number;
  currency: string;
  recurring?: { interval: string | null; intervalCount: number } | null;
  maxQuantity: number;
};

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: T.blue };
const box: React.CSSProperties = { borderTop: `1px solid ${T.line}`, padding: "18px 0" };

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}

function recurringLabel(offer: Offer) {
  if (!offer.recurring) return "Éngangsbetaling";
  const interval = offer.recurring.interval === "year" ? "år" : offer.recurring.interval === "week" ? "uke" : offer.recurring.interval === "day" ? "dag" : "måned";
  return `Gjentakende betaling · hver ${offer.recurring.intervalCount > 1 ? `${offer.recurring.intervalCount}. ` : ""}${interval}`;
}

export default function CheckoutReview() {
  const { productKey = "" } = useParams();
  const [search] = useSearchParams();
  const referenceKey = search.get("reference") ?? undefined;
  const [offer, setOffer] = useState<Offer | null>(null);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [opening, setOpening] = useState(false);
  const family = useMemo(() => offer?.productFamily && offer.productFamily !== "B2B" ? CONSUMER_DISCLOSURES[offer.productFamily] : null, [offer]);

  useEffect(() => {
    let active = true;
    fetch(`/api/stripe/offer?productKey=${encodeURIComponent(productKey)}`, { credentials: "same-origin" })
      .then(async (response) => ({ response, body: await response.json().catch(() => null) as Offer | null }))
      .then(({ response, body }) => {
        if (!active) return;
        if (!response.ok || !body?.ok) setError("Dette tilbudet er ikke tilgjengelig akkurat nå.");
        else setOffer(body);
      })
      .catch(() => active && setError("Dette tilbudet er ikke tilgjengelig akkurat nå."));
    return () => { active = false; };
  }, [productKey]);

  const pay = async () => {
    if (!offer || !accepted) return;
    setOpening(true);
    setError("");
    try { await startStripeCheckout({ productKey: offer.productKey, quantity: 1, referenceKey }); }
    catch { setError("Betalingsvinduet kunne ikke åpnes. Ingen betaling er gjennomført."); setOpening(false); }
  };

  return (
    <PublicShell>
      <Seo title="Review payment | 4PLANET" description="Review price, seller, recurring terms and consumer rights before opening Stripe Checkout." path={`/checkout/review/${productKey}`} />
      <Section pad="clamp(48px,7vw,90px)">
        <div style={mono}>4PLANET · PAYMENT REVIEW</div>
        <h1 style={{ color: T.ink, marginTop: 18, fontSize: "clamp(36px,6vw,72px)", letterSpacing: "-.05em", lineHeight: .98, fontWeight: 500 }}>Know exactly what happens next.</h1>
        <p style={{ color: T.dim, maxWidth: 680, marginTop: 20, fontSize: 17, lineHeight: 1.6 }}>4PLANET viser avtalen før Stripe åpnes. Kortdata behandles hos Stripe. Det som skjer i naturen må dokumenteres separat fra betalingen.</p>

        {!offer && !error && <div style={{ marginTop: 40, color: T.dim }}>Henter verifisert tilbud…</div>}
        {error && <div role="alert" style={{ marginTop: 36, border: `1px solid ${T.line}`, padding: 18, color: T.dim }}>{error}</div>}

        {offer && <div style={{ marginTop: 42, maxWidth: 820 }}>
          {offer.environment === "TEST" && <div style={{ border: `1px solid ${T.blue}`, padding: 14, marginBottom: 22, color: T.blue, fontFamily: T.mono, fontSize: 11, letterSpacing: ".08em" }}>TEST MODE · SYNTHETIC PAYMENT ONLY · NO REAL DELIVERY</div>}

          <div style={box}>
            <div style={mono}>WHAT</div>
            <div style={{ fontSize: 25, marginTop: 9, color: T.ink, fontWeight: 500 }}>{offer.name}</div>
            {offer.description && <p style={{ color: T.dim, lineHeight: 1.55 }}>{offer.description}</p>}
            {family && <p style={{ color: T.dim, lineHeight: 1.55 }}>{family.nature}</p>}
            {referenceKey && <div style={{ ...mono, marginTop: 10, color: T.dim }}>REFERENCE · {referenceKey}</div>}
          </div>

          <div style={{ ...box, display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "end" }}>
            <div><div style={mono}>TOTAL PRICE</div><div style={{ color: T.dim, marginTop: 8 }}>{recurringLabel(offer)}</div></div>
            <div style={{ fontSize: 30, color: T.ink, fontWeight: 600 }}>{money(offer.unitAmount, offer.currency)}</div>
          </div>

          <div style={box}>
            <div style={mono}>SELLER</div>
            <p style={{ color: T.ink, lineHeight: 1.6 }}><strong>{OPERATOR.legalName}</strong><br />Org.nr. {OPERATOR.orgNumber}<br />{OPERATOR.address}<br /><a className="link" href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a></p>
            {!OPERATOR.vatRegistered && <p style={{ color: T.dim, lineHeight: 1.55 }}>Selskapet er ikke registrert i Merverdiavgiftsregisteret i denne avtaleversjonen. Prisen over er totalprisen som er konfigurert for tilbudet.</p>}
          </div>

          {family && <div style={box}>
            <div style={mono}>CANCEL / WITHDRAW</div>
            <p style={{ color: T.dim, lineHeight: 1.6 }}>{family.withdrawal}</p>
            <p style={{ color: T.dim, lineHeight: 1.6 }}>{family.cancellation}</p>
          </div>}

          {offer.productFamily === "IMPACT" && <div style={box}>
            <div style={mono}>IMPACT TRUTH CHAIN</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 13, color: T.dim, fontFamily: T.mono, fontSize: 10.5 }}>{PAYMENT_TRUTH.map((state, index) => <span key={state}>{index ? "→ " : ""}{state}</span>)}</div>
          </div>}

          <div style={box}>
            <label style={{ display: "flex", gap: 11, alignItems: "flex-start", color: T.ink, lineHeight: 1.55 }}>
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} style={{ marginTop: 4 }} />
              <span>Jeg har lest opplysningene over og <Link to="/legal/terms" className="link">vilkårene</Link>, inkludert <Link to="/legal/payments" className="link">betaling, oppsigelse og angrerett</Link>. Personvern er ikke et markedsføringssamtykke og håndteres separat.</span>
            </label>
            <button type="button" onClick={pay} disabled={!accepted || opening} style={{ marginTop: 20, border: `1px solid ${accepted ? T.ink : T.line}`, background: accepted ? T.ink : "transparent", color: accepted ? T.bg : T.faint, padding: "13px 17px", font: "inherit", fontWeight: 700, cursor: accepted ? "pointer" : "not-allowed" }}>
              {opening ? "ÅPNER STRIPE…" : "BESTILL MED BETALINGSPLIKT"}
            </button>
            <p style={{ color: T.faint, fontSize: 12.5, lineHeight: 1.55, marginTop: 14 }}>Neste side er Stripe Checkout. Du er ikke bundet av en betaling før du fullfører den der. 4PLANET bruker serververifisering og stoler ikke på en retur-URL alene som bevis på betaling.</p>
          </div>
        </div>}
      </Section>
    </PublicShell>
  );
}
