import { useEffect, useMemo, useState } from "react";
import { FIRST_MARKET_PRODUCTS } from "@/market/firstCreatorCatalogue";
import "@/styles/market-first-products.css";

type CommerceStatus = {
  ok: boolean;
  environment: "TEST" | "LIVE";
  publicCheckoutEnabled: boolean;
  testCheckoutEnabled: boolean;
  releasedProductIds: string[];
};

type OrderStatus = {
  ok: boolean;
  paymentState?: string;
  fulfilmentState?: string;
  title?: string;
  creator?: string;
  tracking?: { carrier?: string | null; number?: string | null; url?: string | null } | null;
};

const nok = new Intl.NumberFormat("en-GB", { style: "currency", currency: "NOK", maximumFractionDigits: 0 });

export function FirstMarketProducts() {
  const productCount = String(FIRST_MARKET_PRODUCTS.length).padStart(2, "0");
  const creatorCount = new Set(FIRST_MARKET_PRODUCTS.map((product) => product.creator)).size;
  const [commerce, setCommerce] = useState<CommerceStatus | null>(null);
  const [busyProduct, setBusyProduct] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [orderSessionId, setOrderSessionId] = useState<string | null>(null);
  const released = useMemo(() => new Set(commerce?.releasedProductIds ?? []), [commerce]);

  useEffect(() => {
    fetch("/api/market-commerce-status", { headers: { accept: "application/json" } })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => payload?.ok && setCommerce(payload))
      .catch(() => undefined);

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (params.get("checkout") === "success" && sessionId) {
      setOrderSessionId(sessionId);
      window.localStorage.setItem("4market:last_session", sessionId);
    }
  }, []);

  const refreshOrder = async () => {
    if (!orderSessionId) return;
    try {
      const response = await fetch(`/api/market-order-status?session_id=${encodeURIComponent(orderSessionId)}`, { headers: { accept: "application/json" } });
      const payload = await response.json();
      if (response.ok && payload?.ok) setOrder(payload);
    } catch {
      // The order page remains truthful if provider status is temporarily unavailable.
    }
  };

  useEffect(() => {
    if (!orderSessionId) return;
    void refreshOrder();
  }, [orderSessionId]);

  const startCheckout = async (productId: string) => {
    setCheckoutError(null);
    setBusyProduct(productId);
    try {
      const response = await fetch("/api/market-checkout", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ productId, attemptId: crypto.randomUUID().replace(/-/g, "") }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.url) throw new Error(payload?.error ?? "checkout_unavailable");
      window.location.assign(payload.url);
    } catch {
      setCheckoutError("Checkout is not available yet. No payment was taken.");
      setBusyProduct(null);
    }
  };

  const live = commerce?.publicCheckoutEnabled === true;

  return (
    <section className="mkt-first-products" aria-labelledby="mkt-first-products-title">
      <div className="mkt-first-products__head">
        <div>
          <span>FIRST PRODUCTS / REAL CATALOGUE</span>
          <h2 id="mkt-first-products-title">THE FIRST<br /><em>WORKS.</em></h2>
        </div>
        <div className="mkt-first-products__status">
          <strong>{productCount}</strong>
          <span>PRODUCTS · {creatorCount} CREATORS</span>
        </div>
      </div>

      <div className={`mkt-first-products__boundary ${live ? "is-live" : ""}`}>
        <b>{live ? "LIVE CHECKOUT · POD FULFILMENT" : "RELEASE GATED · COMMERCE BUILT"}</b>
        <span>{live
          ? "Secure Stripe checkout. Prints are produced on demand and shipped directly to the customer in Norway."
          : "Stripe checkout, automated POD fulfilment and tracking are release-gated until provider credentials and physical print samples pass."}</span>
      </div>

      {checkoutError && <div className="mkt-commerce-note" role="alert">{checkoutError}</div>}

      {orderSessionId && (
        <div className="mkt-order-state" aria-live="polite">
          <div>
            <small>YOUR ORDER</small>
            <strong>{order?.title ?? "Checking order…"}</strong>
            <span>{order ? `${order.paymentState ?? "UNKNOWN"} · ${order.fulfilmentState ?? "UNKNOWN"}` : "Reading payment and production state…"}</span>
          </div>
          {order?.tracking?.url ? (
            <a href={order.tracking.url} target="_blank" rel="noreferrer">TRACK SHIPMENT ↗</a>
          ) : (
            <button type="button" onClick={() => void refreshOrder()}>REFRESH STATUS</button>
          )}
        </div>
      )}

      <div className="mkt-first-products__grid">
        {FIRST_MARKET_PRODUCTS.map((product, index) => {
          const canBuy = live && released.has(product.id);
          return (
            <article className="mkt-first-product" key={product.id} data-product={product.slug}>
              <div className="mkt-first-product__image">
                <img
                  src={product.imageUrl}
                  alt={`${product.title} — ${product.creator}`}
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="mkt-first-product__meta">
                <small>{product.productType}</small>
                <h3>{product.title}</h3>
                <p>{product.creator}</p>
                <div className="mkt-first-product__spec">
                  <span>{product.commerce.printSize} · ENHANCED MATTE ART PAPER<br />STANDARD SHIPPING · NORWAY</span>
                  <strong>{nok.format(product.commerce.candidatePriceNok)}</strong>
                </div>
                <div className="mkt-first-product__commerce">
                  {canBuy ? (
                    <button type="button" disabled={busyProduct === product.id} onClick={() => void startCheckout(product.id)}>
                      {busyProduct === product.id ? "OPENING CHECKOUT…" : "BUY PRINT →"}
                    </button>
                  ) : (
                    <b>{live ? "SAMPLE GATE" : "LAUNCH PRICE CANDIDATE"}</b>
                  )}
                  <span>{product.location} · {product.year}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
