import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getStripeCheckoutStatus, trackStripeCheckoutCancelled, type StripeCheckoutStatus } from "@/payments/stripe";

function money(amountMinor: number | null, currency: string | null) {
  if (amountMinor == null || !currency) return null;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currency.toUpperCase() }).format(amountMinor / 100);
  } catch {
    return `${amountMinor / 100} ${currency.toUpperCase()}`;
  }
}

function destination(status: StripeCheckoutStatus | null) {
  if (!status) return "/";
  if (status.productFamily === "IMPACT") return "/impact";
  if (status.productFamily === "SPONSOR") return "/brands";
  return "/join";
}

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") ?? "";
  const cancelledProduct = params.get("product") ?? "";
  const cancelled = params.get("checkout") === "cancel";
  const [status, setStatus] = useState<StripeCheckoutStatus | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">(cancelled ? "ready" : "loading");

  useEffect(() => {
    document.title = "Payment status — 4PLANET";
  }, []);

  useEffect(() => {
    if (!cancelled || !cancelledProduct) return;
    trackStripeCheckoutCancelled(cancelledProduct);
  }, [cancelled, cancelledProduct]);

  useEffect(() => {
    if (cancelled) return;
    if (!sessionId) {
      setState("error");
      return;
    }
    let active = true;
    getStripeCheckoutStatus(sessionId)
      .then((result) => {
        if (!active) return;
        setStatus(result);
        setState("ready");
      })
      .catch(() => {
        if (!active) return;
        setState("error");
      });
    return () => { active = false; };
  }, [cancelled, sessionId]);

  const amount = useMemo(() => money(status?.amountMinor ?? null, status?.currency ?? null), [status]);
  const isImpact = status?.productFamily === "IMPACT";
  const portalUrl = import.meta.env.VITE_STRIPE_PORTAL_URL?.trim() || "";

  const title = cancelled
    ? "Payment cancelled"
    : state === "loading"
      ? "Checking payment"
      : status?.confirmed
        ? "Payment confirmed"
        : state === "error"
          ? "We could not verify this payment"
          : "Payment not confirmed";

  return (
    <main style={{ minHeight: "100vh", background: "#070707", color: "#fff", display: "grid", placeItems: "center", padding: "40px 20px", fontFamily: "DM Sans, Arial, sans-serif" }}>
      <section style={{ width: "min(760px, 100%)", borderTop: "1px solid rgba(255,255,255,.7)", paddingTop: 26 }}>
        <Link to="/" style={{ color: "inherit", textDecoration: "none", fontSize: 13, letterSpacing: ".08em" }}>4PLANET_</Link>
        <p style={{ margin: "72px 0 12px", fontSize: 12, letterSpacing: ".12em", opacity: .65 }}>
          {status?.environment === "TEST" ? "STRIPE TEST MODE · NO REAL MONEY" : "PAYMENT STATUS"}
        </p>
        <h1 style={{ margin: 0, maxWidth: 640, fontSize: "clamp(42px, 8vw, 78px)", lineHeight: .94, letterSpacing: "-.055em", fontWeight: 500 }}>{title}</h1>

        {cancelled ? (
          <p style={{ marginTop: 28, maxWidth: 580, fontSize: 18, lineHeight: 1.55, opacity: .78 }}>Nothing was confirmed. You can return to 4PLANET without any delivery, membership or sponsorship state being created.</p>
        ) : state === "loading" ? (
          <p style={{ marginTop: 28, fontSize: 18, opacity: .7 }}>Verifying the Checkout Session directly with Stripe…</p>
        ) : status ? (
          <div style={{ marginTop: 34 }}>
            <dl style={{ display: "grid", gridTemplateColumns: "minmax(140px, .5fr) 1fr", gap: "12px 24px", margin: 0, padding: "22px 0", borderTop: "1px solid rgba(255,255,255,.16)", borderBottom: "1px solid rgba(255,255,255,.16)" }}>
              <dt style={{ opacity: .55 }}>Product</dt><dd style={{ margin: 0 }}>{status.productKey ?? "—"}</dd>
              <dt style={{ opacity: .55 }}>Financial state</dt><dd style={{ margin: 0 }}>{status.financialState}</dd>
              {amount ? <><dt style={{ opacity: .55 }}>Amount</dt><dd style={{ margin: 0 }}>{amount}</dd></> : null}
              {status.mission ? <><dt style={{ opacity: .55 }}>Mission</dt><dd style={{ margin: 0 }}>{status.mission}</dd></> : null}
              {status.referenceKey ? <><dt style={{ opacity: .55 }}>Reference</dt><dd style={{ margin: 0 }}>{status.referenceKey}</dd></> : null}
            </dl>

            <p style={{ marginTop: 24, maxWidth: 620, fontSize: 16, lineHeight: 1.6, opacity: .76 }}>
              {isImpact && status.confirmed
                ? "Your payment establishes a contribution record only. Partner delivery, evidence and ecological outcome remain separate states and are not established by this payment."
                : status.disclosure}
            </p>
          </div>
        ) : (
          <p style={{ marginTop: 28, maxWidth: 600, fontSize: 17, lineHeight: 1.55, opacity: .74 }}>The browser redirect is never treated as proof of payment. We could not obtain a verified Stripe status for this session.</p>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 38 }}>
          <Link to={destination(status)} style={{ display: "inline-block", background: "#fff", color: "#070707", padding: "12px 18px", textDecoration: "none", fontWeight: 600 }}>RETURN TO 4PLANET</Link>
          {portalUrl && status?.checkoutMode === "subscription" ? (
            <a href={portalUrl} style={{ display: "inline-block", border: "1px solid rgba(255,255,255,.45)", color: "#fff", padding: "12px 18px", textDecoration: "none" }}>MANAGE MEMBERSHIP</a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
