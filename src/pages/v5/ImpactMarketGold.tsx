import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FIRST_SALE, SALE_01_BOUNDARIES } from "@/market/firstSale";
import "@/styles/market-sale-01.css";

const nok = (value: number) => `NOK ${value.toLocaleString("nb-NO")}`;

export default function ImpactMarketGold() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const oldRobots = robots?.content;
    let target = robots;
    let created = false;
    if (!target) {
      target = document.createElement("meta");
      target.name = "robots";
      document.head.appendChild(target);
      created = true;
    }
    target.content = "noindex,nofollow";
    document.title = `${FIRST_SALE.title} — 4PLANET MARKET`;
    return () => {
      document.title = previousTitle;
      if (created) target?.remove();
      else if (target && oldRobots != null) target.content = oldRobots;
    };
  }, []);

  return (
    <main className="sale01-page">
      <header className="sale01-header">
        <Link className="sale01-brand" to="/market" aria-label="4PLANET MARKET home">
          4PLANET MARKET<span>_</span>
        </Link>
        <nav aria-label="Market navigation">
          <a href="#work">WORK</a>
          <a href="#details">DETAILS</a>
          <a href="#order">ORDER</a>
          <Link to="/cre4tors">CRE4TORS_</Link>
        </nav>
      </header>

      <section className="sale01-status" aria-label="Commerce status">
        <span>SALE 01 / SANDBOX</span>
        <p>REAL PRODUCT ROUTE · NO LIVE MONEY · PHYSICAL FULFILMENT NOT YET RELEASED</p>
      </section>

      <section className="sale01-product" id="work">
        <div className={`sale01-image-shell ${imageLoaded ? "is-loaded" : ""}`}>
          <img
            src={FIRST_SALE.imageUrl}
            alt="Mulafossur waterfall and coastal landscape, Faroe Islands"
            onLoad={() => setImageLoaded(true)}
          />
          <div className="sale01-image-meta">
            <span>{FIRST_SALE.location}</span>
            <span>{FIRST_SALE.year}</span>
          </div>
        </div>

        <aside className="sale01-buy" id="order">
          <div className="sale01-eyebrow">FIRST DROP / ODIN ODDEKALV</div>
          <h1>{FIRST_SALE.title}</h1>
          <p className="sale01-sub">PHOTOGRAPH · POSTER · FAROE ISLANDS</p>

          <div className="sale01-price-row">
            <strong>{nok(FIRST_SALE.customerPriceNok)}</strong>
            <span>target retail / sandbox</span>
          </div>

          <div className="sale01-variant">
            <span>FORMAT</span>
            <strong>POSTER / 3:2 PHOTO RATIO</strong>
            <small>Exact first production size locks after provider quote + physical sample.</small>
          </div>

          <div className="sale01-variant">
            <span>PAPER</span>
            <strong>AFFORDABLE MATTE POSTER</strong>
            <small>Good photographic reproduction without fine-art paper pricing.</small>
          </div>

          <a
            className="sale01-checkout"
            href={FIRST_SALE.checkoutUrl}
            target="_blank"
            rel="noreferrer"
          >
            TEST CHECKOUT · {nok(FIRST_SALE.customerPriceNok)} →
          </a>
          <p className="sale01-checkout-note">
            Stripe sandbox. This button validates the payment route only. It cannot create a physical order yet.
          </p>

          <button
            className="sale01-details-toggle"
            type="button"
            onClick={() => setDetailsOpen((value) => !value)}
            aria-expanded={detailsOpen}
          >
            {detailsOpen ? "HIDE PRODUCT DETAILS" : "PRODUCT DETAILS"}
            <span>{detailsOpen ? "−" : "+"}</span>
          </button>

          {detailsOpen && (
            <div className="sale01-details-panel">
              <div><span>CREATOR</span><b>{FIRST_SALE.creator}</b></div>
              <div><span>WORK</span><b>{FIRST_SALE.title}</b></div>
              <div><span>PRODUCT</span><b>Unframed poster</b></div>
              <div><span>FULFILMENT</span><b>POD / provider qualification</b></div>
              <div><span>INVENTORY</span><b>None · made to order</b></div>
              <div><span>EDITION</span><b>Open edition for first pilot</b></div>
            </div>
          )}
        </aside>
      </section>

      <section className="sale01-principle">
        <p>THE OBJECT FIRST.</p>
        <h2>A GOOD POSTER.<br />A SIMPLE PRICE.<br /><em>NO WAREHOUSE.</em></h2>
      </section>

      <section className="sale01-order-flow" id="details">
        <div className="sale01-section-label">ZERO FOUNDER EFFORT / TARGET LOOP</div>
        <div className="sale01-flow-grid">
          <article><span>01</span><b>BUY</b><p>Customer pays through Stripe Checkout.</p></article>
          <article><span>02</span><b>MAKE</b><p>Verified payment creates one POD production order.</p></article>
          <article><span>03</span><b>SHIP</b><p>POD partner prints, packs and ships directly.</p></article>
          <article><span>04</span><b>UPDATE</b><p>Production and tracking events update the order automatically.</p></article>
          <article><span>05</span><b>RECEIPT</b><p>Customer gets payment receipt and operational order messages.</p></article>
          <article><span>06</span><b>RECONCILE</b><p>Payment, provider cost and margin remain separate records.</p></article>
        </div>
      </section>

      <section className="sale01-boundary">
        <div>
          <span>WHAT IS REAL NOW</span>
          <h3>THE SHOP.<br />THE WORK.<br />THE PAYMENT ROUTE.</h3>
        </div>
        <div className="sale01-boundary-copy">
          {SALE_01_BOUNDARIES.map((item) => <p key={item}>{item}</p>)}
        </div>
      </section>

      <footer className="sale01-footer">
        <Link to="/cre4tors">CRE4TORS_</Link>
        <span>4PLANET MARKET · SALE 01</span>
        <a href="#work">BACK TO WORK ↑</a>
      </footer>
    </main>
  );
}
