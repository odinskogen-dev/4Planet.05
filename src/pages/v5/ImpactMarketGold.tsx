import { Link } from "react-router-dom";
import { FIRST_MARKET_PRODUCTS, ODIN_ODDEKALV_CREATOR } from "@/market/firstCreatorCatalogue";
import ImpactMarketGoldLegacy from "./ImpactMarketGoldLegacy";
import "@/styles/market-live-front.css";

function MarketLiveFront() {
  return (
    <div className="mkt-live-front">
      <header className="mkt-live-nav">
        <Link to="/market" className="mkt-live-wordmark">4PLANET <b>MARKET_</b></Link>
        <div className="mkt-live-nav__state"><i />FIRST CREATOR · LIVE CATALOGUE</div>
        <nav aria-label="4PLANET Market navigation">
          <a href="#catalogue">MARKET</a>
          <a href="#creator-01">CREATOR 01</a>
          <a href="#market-model">MODEL</a>
          <a href="https://4planet.org">4PLANET ↗</a>
        </nav>
      </header>

      <section className="mkt-live-hero">
        <div className="mkt-live-kicker">4RT_ × CREATOR ENGINE × IMPACT</div>
        <h1>ART THAT<br />DOES<br /><em>SOMETHING.</em></h1>
        <div className="mkt-live-hero__bottom">
          <p>Creative work can carry value in more than one direction. 4PLANET MARKET begins with real creators, real work and explicit rules about what is — and is not — live.</p>
          <div className="mkt-live-hero__facts">
            <span>6 REAL WORKS</span><span>1 CREATOR</span><span>PRINTS FIRST</span>
          </div>
        </div>
        <div className="mkt-live-boundary"><strong>CATALOGUE LIVE · COMMERCE NOT LIVE</strong><span>No payment · POD · creator payout or ecological outcome is represented as real.</span></div>
      </section>

      <section className="mkt-live-catalogue" id="catalogue">
        <div className="mkt-live-catalogue__head">
          <div>
            <span className="mkt-live-label">NEW / CREATOR 01</span>
            <h2>ODIN ODDEKALV.<br /><em>PHOTOGRAPHS.</em></h2>
          </div>
          <div className="mkt-live-catalogue__count"><strong>06</strong><span>FIRST DROP</span></div>
        </div>

        <div className="mkt-maze" aria-label="Odin Oddekalv first photographic print catalogue">
          {FIRST_MARKET_PRODUCTS.map((product, index) => (
            <article className="mkt-maze-card" key={product.id} data-product-slug={product.slug}>
              <div className="mkt-maze-card__image">
                <img src={product.imageUrl} alt={`${product.title}, ${product.location}`} loading={index < 4 ? "eager" : "lazy"} decoding="async" />
                <span className="mkt-maze-card__index">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="mkt-maze-card__meta">
                <span>PHOTOGRAPHIC PRINT · CREATOR 01</span>
                <h3>{product.title}</h3>
                <p>{product.location} · {product.year}</p>
                <div className="mkt-maze-card__footer"><span>ODIN ODDEKALV</span><span>NOT YET FOR SALE</span></div>
              </div>
            </article>
          ))}
        </div>

        <div className="mkt-live-creator" id="creator-01">
          <div>
            <span className="mkt-live-label">CREATOR 01 / PHOTOGRAPHY</span>
            <h3>{ODIN_ODDEKALV_CREATOR.name}</h3>
            <p>Norway · first real creator catalogue in 4PLANET MARKET</p>
          </div>
          <a href={ODIN_ODDEKALV_CREATOR.sourceUrl} target="_blank" rel="noreferrer">SOURCE PHOTOGRAPHY ↗</a>
        </div>
      </section>

      <section className="mkt-model-divider" id="market-model">
        <span>MARKET ENGINE / CONTROLLED DEMO BELOW</span>
        <h2>THE WORK IS REAL. THE COMMERCE MODEL IS STILL A FIXTURE.</h2>
        <p>The existing Gold transaction model remains available below for product economics, curation, rights and impact-state testing. It is deliberately separated from the real creator catalogue above.</p>
      </section>
    </div>
  );
}

export default function ImpactMarketGold() {
  return (
    <div className="mkt-live-composite">
      <MarketLiveFront />
      <div className="mkt-legacy-model">
        <ImpactMarketGoldLegacy />
      </div>
    </div>
  );
}
