import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { normalizeGtin, normaliseSourceEnvelope, type CanonicalFoodProduct } from "./core.js";
import { buildDecisionAxes, buildProductTruthSummary, buildTruthPassport } from "./pick-core.js";
import "./food.css";
import "./food-02.css";
import "./pick.css";

type LoadState = "idle" | "loading" | "found" | "not_found" | "source_error" | "malformed";

interface SourceMeta { id?: string; apiVersion?: string; adapterVersion?: string; licence?: Record<string, unknown>; }
interface PickResult { state: LoadState; source?: SourceMeta; product?: CanonicalFoodProduct; message?: string; }

const DEFAULT_GTIN = "7038010055652";

function fmt(value: number | null, unit = "g") {
  return value === null ? "—" : `${value.toLocaleString("nb-NO", { maximumFractionDigits: 1 })} ${unit}`;
}

function AxisCard({ axis }: { axis: ReturnType<typeof buildDecisionAxes>[number] }) {
  return (
    <article className="pick-axis" data-axis={axis.id} data-confidence={axis.confidence.toLowerCase()}>
      <div className="pick-axis__head"><span className="pick-kicker">{axis.label}</span><span className="pick-confidence">{axis.confidence}</span></div>
      <strong>{axis.state}</strong>
      <p>{axis.summary}</p>
      <small>{axis.directness} · {axis.limitation}</small>
    </article>
  );
}

function EmptyState() {
  return <section className="pick-empty"><span className="pick-kicker">PRIVATE PROTOTYPE · NORWAY</span><h2>One product.<br />Three truths.</h2><p>Scan or enter a barcode. PICK_ keeps HEALTH, WALLET and PLANET separate and shows unknowns instead of inventing certainty.</p></section>;
}

export default function PickPrototype() {
  const [gtin, setGtin] = useState(DEFAULT_GTIN);
  const [state, setState] = useState<LoadState>("idle");
  const [result, setResult] = useState<PickResult | null>(null);
  const [message, setMessage] = useState("");

  const product = result?.product ?? null;
  const axes = useMemo(() => buildDecisionAxes(product), [product]);
  const truth = useMemo(() => buildProductTruthSummary(product), [product]);
  const passport = useMemo(() => buildTruthPassport(product), [product]);

  const readProduct = async (value = gtin) => {
    const parsed = normalizeGtin(value);
    if (!parsed.ok) {
      setState("malformed");
      setMessage(parsed.error === "invalid_check_digit" ? "Invalid GTIN check digit." : "Use an 8, 12, 13 or 14 digit GTIN.");
      setResult(null);
      return;
    }
    setGtin(parsed.normalized); setState("loading"); setMessage("");
    try {
      const response = await fetch(`/api/food?barcode=${encodeURIComponent(parsed.normalized)}`, { headers: { accept: "application/json" } });
      const normalised = normaliseSourceEnvelope(await response.json() as Record<string, unknown>) as PickResult;
      setResult(normalised); setState(normalised.state); setMessage(normalised.message ?? "");
    } catch (error) {
      setResult(null); setState("source_error"); setMessage(error instanceof Error ? error.message : "Source request failed.");
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void readProduct(); };

  return (
    <main className="pick-shell">
      <header className="pick-header">
        <Link to="/" className="pick-wordmark" aria-label="4PLANET home">4PLANET_</Link>
        <div className="pick-header__product"><strong>PICK_</strong><span>FOOD INTELLIGENCE · PRIVATE</span></div>
        <Link to="/labs/food-intelligence" className="pick-header__link">SCANNER</Link>
      </header>

      <section className="pick-hero"><div><span className="pick-kicker">4PEOPLE × 4PLANET</span><h1>Pick better.<br /><i>Know why.</i></h1></div><p>Evidence-grounded product decisions for your health, your wallet and the living planet. No universal score. No paid ranking. No fake precision.</p></section>

      <section className="pick-scan" aria-label="Product lookup">
        <form onSubmit={submit}><label htmlFor="pick-gtin">BARCODE / GTIN</label><div className="pick-input-row"><input id="pick-gtin" inputMode="numeric" autoComplete="off" value={gtin} onChange={(event) => setGtin(event.target.value.replace(/\D/g, ""))} aria-describedby="pick-input-help" /><button type="submit" disabled={state === "loading"}>{state === "loading" ? "READING" : "READ PRODUCT"}</button></div><p id="pick-input-help">Use the camera scanner for shelf testing, or enter a barcode manually here.</p></form>
        <Link className="pick-camera-cta" to="/labs/food-intelligence">OPEN CAMERA SCANNER →</Link>
      </section>

      {state !== "idle" && state !== "found" && <section className="pick-state" aria-live="polite" data-state={state}><span className="pick-kicker">{state.replaceAll("_", " ")}</span><h2>{state === "loading" ? "Reading source…" : state === "not_found" ? "Product not found" : "Cannot establish product truth"}</h2><p>{message || (state === "not_found" ? "No product record was returned. Nothing has been inferred." : "The source result cannot be used safely.")}</p></section>}
      {state === "idle" && <EmptyState />}

      {state === "found" && product && <>
        <section className="pick-product">
          <div className="pick-product__image">{product.imageUrl && !product.imageUrl.startsWith("fixture:") ? <img src={product.imageUrl} alt="" /> : <span>NO IMAGE</span>}</div>
          <div className="pick-product__identity"><span className="pick-kicker">GTIN {product.gtin}</span><h2>{product.name || "Unnamed product"}</h2><p>{product.brand || "Brand unknown"} · {product.quantity || "Quantity unknown"}</p></div>
          <div className="pick-truth-chip"><span>PRODUCT DATA</span><strong>{truth.confidence}</strong><small>{truth.completeness}% fields</small></div>
        </section>

        <section className="pick-axis-grid" aria-label="Decision axes">{axes.map((axis) => <AxisCard key={axis.id} axis={axis} />)}</section>

        <section className="pick-truth-spine" aria-labelledby="pick-truth-title">
          <div className="pick-section-head"><div><span className="pick-kicker">WHY / BASED ON WHAT</span><h2 id="pick-truth-title">Truth spine</h2></div><span>Inspect the chain before trusting the conclusion.</span></div>
          <div className="pick-chain" aria-label="Truth chain">{passport.chain.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2,"0")}</span><strong>{step}</strong>{index < passport.chain.length - 1 && <i aria-hidden="true">→</i>}</div>)}</div>
          <div className="pick-passport-grid">
            <article><span>SOURCE</span><strong>{passport.source.id}</strong><p>{passport.source.class}</p><small>API {passport.source.apiVersion ?? "UNKNOWN"} · Licence: {passport.source.licence}</small></article>
            <article><span>DIRECTNESS</span><strong>{passport.directness}</strong><p>Identity and label fields can be product-specific. Health, price and planet require separate evidence.</p></article>
            <article><span>FRESHNESS</span><strong>{passport.freshness.state}</strong><p>{passport.freshness.detail}</p></article>
            <article><span>CONFLICT STATE</span><strong>{passport.conflictState}</strong><p>{passport.completeness}% controlled field completeness.</p></article>
          </div>
          <details className="pick-evidence-details">
            <summary>SHOW FIELD EVIDENCE</summary>
            <div className="pick-evidence-list">{passport.facts.map((fact) => <div key={fact.id} data-available={fact.available ? "yes" : "no"}><span>{fact.available ? "KNOWN" : "UNKNOWN"}</span><strong>{fact.label}</strong><small>{fact.directness} · {fact.interpretation}</small></div>)}</div>
          </details>
        </section>

        <section className="pick-facts">
          <div className="pick-section-head"><span className="pick-kicker">WHAT THE PRODUCT RECORD SAYS</span><span>Facts are not the same as recommendations.</span></div>
          <div className="pick-fact-grid">
            <article><span>INGREDIENTS</span><p>{product.ingredientsText || "Not available"}</p></article>
            <article><span>ALLERGENS</span><p>{product.allergenDataPresent ? (product.allergenTags.length ? product.allergenTags.join(", ") : "None listed in source") : "Not available — check physical label"}</p></article>
            <article className="pick-nutrients"><span>NUTRITION · /100 G/ML</span><dl><div><dt>Energy</dt><dd>{fmt(product.nutrients.energyKcal, "kcal")}</dd></div><div><dt>Sugar</dt><dd>{fmt(product.nutrients.sugars)}</dd></div><div><dt>Salt</dt><dd>{fmt(product.nutrients.salt)}</dd></div><div><dt>Protein</dt><dd>{fmt(product.nutrients.protein)}</dd></div><div><dt>Fibre</dt><dd>{fmt(product.nutrients.fibre)}</dd></div></dl></article>
          </div>
        </section>

        {(truth.conflicts.length > 0 || truth.missing.length > 0) && <section className="pick-limitations"><span className="pick-kicker">KNOWN LIMITATIONS</span>{truth.conflicts.length > 0 && <p><strong>Conflicts:</strong> {truth.conflicts.join(", ")}</p>}{truth.missing.length > 0 && <p><strong>Missing:</strong> {truth.missing.join(", ")}</p>}</section>}
      </>}

      <footer className="pick-footer"><strong>PICK_ / FOOD_</strong><p>PRIVATE PROTOTYPE · Missing data never improves rank · Verify allergens against the physical label.</p></footer>
    </main>
  );
}
