import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FIRST_MARKET_PRODUCTS,
  ODIN_ODDEKALV_CREATOR,
  getMarketProduct,
  type MarketProduct,
} from "@/market/firstCreatorCatalogue";
import "@/styles/market-first-creator.css";

function useMarketMetadata(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const previousRobots = robots?.content;
    let target = robots;
    let created = false;
    if (!target) {
      target = document.createElement("meta");
      target.name = "robots";
      document.head.appendChild(target);
      created = true;
    }
    document.title = title;
    target.content = "noindex,follow,max-image-preview:large";
    return () => {
      document.title = previousTitle;
      if (created) target?.remove();
      else if (target && previousRobots != null) target.content = previousRobots;
    };
  }, [title]);
}

function MarketHeader() {
  return (
    <header className="market-header">
      <Link className="market-header__brand" to="/market" aria-label="4PLANET Market home">
        <span>4PLANET</span> MARKET_
      </Link>
      <nav className="market-header__nav" aria-label="Market navigation">
        <Link to="/market">MARKET</Link>
        <a href="#creator">CREATOR</a>
        <a href="https://4planet.org">4PLANET</a>
      </nav>
      <div className="public-header__actions market-header__identity" aria-label="4PLANET identity" />
    </header>
  );
}

function ProductCard({ product, index }: { product: MarketProduct; index: number }) {
  return (
    <article className="market-product-card">
      <Link to={`/market/${product.slug}`} className="market-product-card__image-wrap" aria-label={`Open ${product.title}`}>
        <img
          className="market-product-card__image"
          src={product.imageUrl}
          alt={`${product.title}, ${product.location}`}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
        />
      </Link>
      <div className="market-product-card__meta">
        <div>
          <span className="market-label">PHOTOGRAPHIC PRINT · TEST CATALOGUE</span>
          <h2><Link to={`/market/${product.slug}`}>{product.title}</Link></h2>
          <p>Odin Oddekalv · {product.location} · {product.year}</p>
        </div>
        <span className="market-state">NOT YET FOR SALE</span>
      </div>
    </article>
  );
}

export function MarketHome() {
  useMarketMetadata("4PLANET MARKET — Odin Oddekalv");

  return (
    <main className="market-page">
      <MarketHeader />

      <section className="market-hero">
        <div className="market-hero__eyebrow">4PLANET MARKET · FIRST CREATOR / 01</div>
        <h1>PHOTOGRAPHS<br />FROM A<br /><em>LIVING PLANET.</em></h1>
        <div className="market-hero__bottom">
          <p>Six photographs enter 4PLANET MARKET as the first real creator catalogue. The works are real. Pricing, editions, production and checkout remain deliberately closed until those contracts are ready.</p>
          <div className="market-hero__state">
            <span>6 REAL WORKS</span>
            <span>1 CREATOR</span>
            <span>COMMERCE OFF</span>
          </div>
        </div>
      </section>

      <section className="market-creator" id="creator">
        <div>
          <span className="market-label">CREATOR 01</span>
          <h2>{ODIN_ODDEKALV_CREATOR.name}</h2>
          <p>{ODIN_ODDEKALV_CREATOR.role} · Norway</p>
        </div>
        <a href={ODIN_ODDEKALV_CREATOR.sourceUrl} target="_blank" rel="noreferrer">SOURCE PHOTOGRAPHY ↗</a>
      </section>

      <section className="market-catalogue" aria-label="First Market products">
        {FIRST_MARKET_PRODUCTS.map((product, index) => (
          <ProductCard product={product} index={index} key={product.id} />
        ))}
      </section>

      <section className="market-truth">
        <span className="market-label">CURRENT MARKET STATE</span>
        <h2>REAL WORKS.<br />NO FAKE COMMERCE.</h2>
        <p>These six works are published as test catalogue products under Odin Oddekalv. No price, edition size, paper, fulfilment provider, checkout, sale, payout or ecological outcome is represented as active.</p>
      </section>

      <footer className="market-footer">
        <span>4PLANET MARKET_</span>
        <span>FIRST CREATOR CATALOGUE · 2026</span>
        <a href="https://4planet.org">FOR A LIVING PLANET ↗</a>
      </footer>
    </main>
  );
}

export function MarketProductPage() {
  const { slug } = useParams();
  const product = getMarketProduct(slug);
  useMarketMetadata(product ? `${product.title} — 4PLANET MARKET` : "Product not found — 4PLANET MARKET");

  if (!product) {
    return (
      <main className="market-page">
        <MarketHeader />
        <section className="market-product-missing">
          <span className="market-label">4PLANET MARKET</span>
          <h1>PRODUCT NOT FOUND.</h1>
          <Link to="/market">← MARKET</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="market-page">
      <MarketHeader />
      <section className="market-product-detail">
        <div className="market-product-detail__image-wrap">
          <img src={product.imageUrl} alt={`${product.title}, ${product.location}`} decoding="async" />
        </div>
        <div className="market-product-detail__copy">
          <Link className="market-back" to="/market">← MARKET</Link>
          <span className="market-label">PHOTOGRAPHIC PRINT · CATALOGUE PRODUCT</span>
          <h1>{product.title}</h1>
          <p className="market-product-detail__byline">BY {ODIN_ODDEKALV_CREATOR.name.toUpperCase()}</p>
          <p className="market-product-detail__caption">{product.caption}</p>
          <dl>
            <div><dt>PLACE</dt><dd>{product.location}</dd></div>
            <div><dt>YEAR</dt><dd>{product.year}</dd></div>
            <div><dt>PRODUCT</dt><dd>Photographic print</dd></div>
            <div><dt>PRICE</dt><dd>Not set</dd></div>
            <div><dt>EDITION</dt><dd>Not set</dd></div>
            <div><dt>AVAILABILITY</dt><dd>Not yet for sale</dd></div>
          </dl>
          <div className="market-product-detail__truth">
            <strong>TEST CATALOGUE</strong>
            <p>The work is real and creator-authorised for this Market test. Production, commercial terms and checkout are not active.</p>
          </div>
          <a className="market-source-link" href={product.sourceUrl} target="_blank" rel="noreferrer">VIEW SOURCE PHOTOGRAPHY ↗</a>
        </div>
      </section>
    </main>
  );
}
