import { FIRST_MARKET_PRODUCTS } from "@/market/firstCreatorCatalogue";
import "@/styles/market-first-products.css";

export function FirstMarketProducts() {
  const productCount = String(FIRST_MARKET_PRODUCTS.length).padStart(2, "0");
  const creatorCount = new Set(FIRST_MARKET_PRODUCTS.map((product) => product.creator)).size;

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

      <div className="mkt-first-products__boundary">
        <b>REAL WORK · COMMERCE NOT LIVE</b>
        <span>These are real creator works inside the existing 4PLANET MARKET. Price, edition, POD, checkout, payout and ecological outcomes are not yet activated.</span>
      </div>

      <div className="mkt-first-products__grid">
        {FIRST_MARKET_PRODUCTS.map((product, index) => (
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
              <div><span>{product.location} · {product.year}</span><b>{product.state}</b></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
