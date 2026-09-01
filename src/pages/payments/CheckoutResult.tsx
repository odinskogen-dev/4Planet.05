import { Link, useLocation } from "react-router-dom";

export function CheckoutSuccess() {
  const location = useLocation();
  const sessionId = new URLSearchParams(location.search).get("session_id");

  return (
    <main style={{ minHeight: "100vh", background: "#0A0A0A", color: "#FFFFFF", padding: "clamp(32px, 8vw, 120px)" }}>
      <p style={{ fontFamily: "monospace", letterSpacing: ".08em", opacity: 0.68 }}>4PLANET_ MARKET</p>
      <h1 style={{ maxWidth: 760, fontSize: "clamp(42px, 8vw, 96px)", lineHeight: 0.94, margin: "32px 0" }}>
        Checkout complete.
      </h1>
      <p style={{ maxWidth: 680, fontSize: 18, lineHeight: 1.6, opacity: 0.8 }}>
        Stripe is confirming the payment state. Fulfilment begins only from verified payment status.
        Any linked impact contribution, provider delivery, evidence or ecological outcome is tracked separately.
      </p>
      {sessionId ? (
        <p style={{ marginTop: 28, fontFamily: "monospace", fontSize: 12, opacity: 0.52 }}>
          Checkout session: {sessionId}
        </p>
      ) : null}
      <Link to="/" style={{ display: "inline-block", marginTop: 48, color: "#FFFFFF" }}>Return to 4PLANET</Link>
    </main>
  );
}

export function CheckoutCancelled() {
  return (
    <main style={{ minHeight: "100vh", background: "#FFFFFF", color: "#0A0A0A", padding: "clamp(32px, 8vw, 120px)" }}>
      <p style={{ fontFamily: "monospace", letterSpacing: ".08em", opacity: 0.56 }}>4PLANET_ MARKET</p>
      <h1 style={{ maxWidth: 760, fontSize: "clamp(42px, 8vw, 96px)", lineHeight: 0.94, margin: "32px 0" }}>
        Checkout cancelled.
      </h1>
      <p style={{ maxWidth: 640, fontSize: 18, lineHeight: 1.6, opacity: 0.72 }}>
        No completed checkout is being represented here. You can return to 4PLANET without creating an order claim.
      </p>
      <Link to="/" style={{ display: "inline-block", marginTop: 48, color: "#0A0A0A" }}>Return to 4PLANET</Link>
    </main>
  );
}
