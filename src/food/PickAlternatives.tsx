import type { PickAlternativeEvaluation } from "./pick-compare.js";

export default function PickAlternatives({ items }: { items: PickAlternativeEvaluation[] }) {
  const visible = items.filter((item) => item.eligible).slice(0, 5);
  return (
    <section className="pick-alternatives" aria-labelledby="pick-alt-title">
      <div className="pick-section-head">
        <div><span className="pick-kicker">FAIR ALTERNATIVES</span><h2 id="pick-alt-title">Same job. Better evidence.</h2></div>
        <span>Only controlled direct substitutes or upgrades. Missing comparison data never counts as a win.</span>
      </div>
      {visible.length === 0 ? <p className="pick-alt-empty">No controlled alternative is strong enough to recommend from the returned candidate set.</p> : (
        <div className="pick-alt-grid">
          {visible.map((item, index) => (
            <article key={item.product.gtin} className="pick-alt" data-state={item.state.toLowerCase().replaceAll(" ", "-")}>
              <div className="pick-alt__rank">{String(index + 1).padStart(2, "0")}</div>
              <div className="pick-alt__body">
                <span className="pick-kicker">{item.relation} · {item.health.confidence}</span>
                <h3>{item.product.name || "Unnamed product"}</h3>
                <p>{item.product.brand || "Brand unknown"} · {item.product.quantity || "Quantity unknown"}</p>
                <strong>{item.state}</strong>
                <small>{item.reason}</small>
                {item.comparisons.length > 0 && <ul>{item.comparisons.map((comparison) => <li key={comparison.label} data-known={comparison.known ? "yes" : "no"}>{comparison.text}</li>)}</ul>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
