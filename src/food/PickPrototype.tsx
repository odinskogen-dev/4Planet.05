import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { companyProofForProduct } from "@/content/companyProof";
import { normalizeGtin, normaliseSourceEnvelope, type CanonicalFoodProduct } from "./core.js";
import { buildDecisionAxes, buildProductTruthSummary, buildTruthPassport } from "./pick-core.js";
import { rankPickAlternatives } from "./pick-compare.js";
import { evaluatePlanet } from "./pick-planet.js";
import { normaliseWalletEnvelope, unknownWallet, type PickWalletResult } from "./pick-wallet.js";
import { addBasketItem, basketSummary, makeBasketItem, persistBasket, removeBasketItem, safeReadBasket, type PickBasketItem } from "./pick-basket.js";
import PickAlternatives from "./PickAlternatives";
import PickHouseholdPanel from "./PickHouseholdPanel";
import PickScanner from "./PickScanner";
import "./food.css";
import "./food-02.css";
import "./pick.css";
import "./pick-04.css";
import "./pick-v2.css";

type LoadState = "idle" | "loading" | "found" | "not_found" | "source_error" | "malformed";
interface PickResult { state: LoadState; product?: CanonicalFoodProduct; alternatives?: CanonicalFoodProduct[]; message?: string; }
interface EvidenceSourceView { id?: string; sourceId?: string; title?: string; sourceClass?: string; class?: string; url?: string; checkedAt?: string; }
const DEFAULT_GTIN = "7038010055652";

function fmt(value: number | null, unit = "g") {
  return value === null ? "—" : `${value.toLocaleString("nb-NO", { maximumFractionDigits: 1 })} ${unit}`;
}

function AxisCard({ axis }: { axis: ReturnType<typeof buildDecisionAxes>[number] }) {
  return (
    <article className="pick-axis" data-axis={axis.id} data-confidence={axis.confidence.toLowerCase()}>
      <div className="pick-axis__head"><span className="pick-kicker">{axis.label}</span><span className="pick-confidence">{axis.confidence}</span></div>
      <strong>{axis.state}</strong><p>{axis.summary}</p><small>{axis.directness} · {axis.limitation}</small>
    </article>
  );
}

function EmptyState() {
  return (
    <section className="pick-empty pick-empty--v2">
      <div><span className="pick-kicker">PRIVATE PROTOTYPE · NORWAY</span><h2>Scan.<br />Know.<br /><i>Pick.</i></h2></div>
      <p>The scanner above is the primary action. PICK_ keeps HEALTH, WALLET and PLANET separate and leaves uncertainty visible.</p>
    </section>
  );
}

export default function PickPrototype() {
  const [gtin, setGtin] = useState(DEFAULT_GTIN);
  const [state, setState] = useState<LoadState>("idle");
  const [result, setResult] = useState<PickResult | null>(null);
  const [message, setMessage] = useState("");
  const [wallet, setWallet] = useState<PickWalletResult>(() => unknownWallet());
  const [shopMode, setShopMode] = useState(true);
  const [basket, setBasket] = useState<PickBasketItem[]>(() => typeof window === "undefined" ? [] : safeReadBasket(window.localStorage));

  const product = result?.product ?? null;
  const planet = useMemo(() => evaluatePlanet(product), [product]);
  const axes = useMemo(() => buildDecisionAxes(product, { wallet, planet }), [product, wallet, planet]);
  const truth = useMemo(() => buildProductTruthSummary(product), [product]);
  const passport = useMemo(() => buildTruthPassport(product, { wallet, planet }), [product, wallet, planet]);
  const alternatives = useMemo(() => product ? rankPickAlternatives(product, result?.alternatives ?? []) : [], [product, result?.alternatives]);
  const company = useMemo(() => companyProofForProduct(product?.gtin, product?.brand), [product?.gtin, product?.brand]);
  const basketStats = useMemo(() => basketSummary(basket), [basket]);
  const inBasket = Boolean(product && basket.some((item) => item.gtin === product.gtin));
  const evidenceSources = passport.evidenceSources as EvidenceSourceView[];

  const readProduct = async (value = gtin) => {
    const parsed = normalizeGtin(value);
    if (!parsed.ok) {
      setState("malformed");
      setMessage(parsed.error === "invalid_check_digit" ? "Invalid GTIN check digit." : "Use an 8, 12, 13 or 14 digit GTIN.");
      setResult(null); setWallet(unknownWallet()); return;
    }
    setGtin(parsed.normalized); setState("loading"); setMessage(""); setWallet(unknownWallet("Checking price observations…"));
    try {
      const [foodRead, priceRead] = await Promise.allSettled([
        fetch(`/api/food?barcode=${encodeURIComponent(parsed.normalized)}`, { headers: { accept: "application/json" } }).then((response) => response.json()),
        fetch(`/api/pick-price?barcode=${encodeURIComponent(parsed.normalized)}`, { headers: { accept: "application/json" } }).then((response) => response.json()),
      ]);
      if (foodRead.status !== "fulfilled") throw foodRead.reason;
      const normalised = normaliseSourceEnvelope(foodRead.value as Record<string, unknown>) as PickResult;
      setResult(normalised); setState(normalised.state); setMessage(normalised.message ?? "");
      setWallet(priceRead.status === "fulfilled" ? normaliseWalletEnvelope(priceRead.value as Record<string, unknown>) : unknownWallet("Price source could not be read."));
    } catch (error) {
      setResult(null); setState("source_error"); setWallet(unknownWallet("Price context unavailable."));
      setMessage(error instanceof Error ? error.message : "Source request failed.");
    }
  };

  const detected = (value: string) => { setGtin(value); void readProduct(value); };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void readProduct(); };
  const saveBasket = (next: PickBasketItem[]) => { setBasket(next); if (typeof window !== "undefined") persistBasket(window.localStorage, next); };
  const addCurrent = () => { if (product) saveBasket(addBasketItem(basket, makeBasketItem(product, axes, { wallet }))); };
  const removeCurrent = () => { if (product) saveBasket(removeBasketItem(basket, product.gtin)); };

  return (
    <main className="pick-shell pick-shell--v2" data-shop-mode={shopMode ? "yes" : "no"}>
      <header className="pick-header">
        <Link to="/" className="pick-wordmark" aria-label="4PLANET home">4PLANET_</Link>
        <div className="pick-header__product"><strong>PICK_</strong><span>FOOD INTELLIGENCE · PRIVATE</span></div>
        <div className="pick-header-actions"><button type="button" className="pick-mode-toggle" aria-pressed={shopMode} onClick={() => setShopMode((value) => !value)}>{shopMode ? "SHOP MODE" : "EXPLORE MODE"}</button><a href="#basket" className="pick-header__link">BASKET {basket.length}</a></div>
      </header>

      <section className="pick-hero pick-hero--v2"><div><span className="pick-kicker">4PEOPLE × 4PLANET</span><h1>Pick better.<br /><i>Know why.</i></h1></div><p>Evidence-grounded product decisions for your health, your wallet and the living planet. No universal score. No paid ranking. No fake precision.</p></section>

      <section className="pick-scan pick-scan--v2" aria-label="Product lookup">
        <PickScanner onDetected={detected} />
        <form onSubmit={submit}><label htmlFor="pick-gtin">BARCODE / GTIN</label><div className="pick-input-row"><input id="pick-gtin" inputMode="numeric" autoComplete="off" value={gtin} onChange={(event) => setGtin(event.target.value.replace(/\D/g, ""))} /><button type="submit" disabled={state === "loading"}>{state === "loading" ? "READING" : "READ PRODUCT"}</button></div><p>Manual fallback remains available when camera detection is unsupported.</p></form>
      </section>

      {state !== "idle" && state !== "found" && <section className="pick-state" aria-live="polite" data-state={state}><span className="pick-kicker">{state.replaceAll("_", " ")}</span><h2>{state === "loading" ? "Reading product truth…" : state === "not_found" ? "Product not found" : "Cannot establish product truth"}</h2><p>{message || (state === "not_found" ? "No product record was returned. Nothing has been inferred." : "The source result cannot be used safely.")}</p></section>}
      {state === "idle" && <EmptyState />}

      {state === "found" && product && <>
        <section className="pick-product pick-product--v2"><div className="pick-product__image">{product.imageUrl && !product.imageUrl.startsWith("fixture:") ? <img src={product.imageUrl} alt="" /> : <span>NO IMAGE</span>}</div><div className="pick-product__identity"><span className="pick-kicker">GTIN {product.gtin}</span><h2>{product.name || "Unnamed product"}</h2><p>{product.brand || "Brand unknown"} · {product.quantity || "Quantity unknown"}</p><button className="pick-basket-action" type="button" onClick={inBasket ? removeCurrent : addCurrent}>{inBasket ? "REMOVE FROM BASKET" : "ADD TO BASKET"}</button></div><div className="pick-truth-chip"><span>PRODUCT DATA</span><strong>{truth.confidence}</strong><small>{truth.completeness}% fields</small></div></section>

        {company && <section className="pick-decision-snapshot" aria-label="Shared company intelligence"><div><span className="pick-kicker">SAME CORE · COMPANY INTELLIGENCE</span><h2>{company.name}</h2></div><div><p>{company.role}. Company evidence is a separate layer from product facts; missing company evidence never becomes a negative product score.</p><p><strong>{company.actorState.replaceAll("_", " ")}</strong> · {company.unknowns.length} explicit unknowns · {company.claims.length} bounded claims.</p><Link className="pick-header__link" to={`/domains/s4piens/company-proof#${company.slug}`}>OPEN S4PIENS COMPANY PROOF →</Link></div></section>}

        <section className="pick-decision-snapshot" aria-labelledby="pick-decision-title"><div><span className="pick-kicker">PICK THIS?</span><h2 id="pick-decision-title">Read the trade-offs.</h2></div><p>No combined score. The strongest available decision is the set of three independent signals below.</p></section>
        <section className="pick-axis-grid" aria-label="Decision axes">{axes.map((axis) => <AxisCard key={axis.id} axis={axis} />)}</section>
        <PickAlternatives items={alternatives} />

        <section className="pick-truth-spine" aria-labelledby="pick-truth-title">
          <div className="pick-section-head"><div><span className="pick-kicker">WHY / BASED ON WHAT</span><h2 id="pick-truth-title">Truth spine</h2></div><span>Inspect the chain before trusting the conclusion.</span></div>
          <div className="pick-chain" aria-label="Truth chain">{passport.chain.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2,"0")}</span><strong>{step}</strong>{index < passport.chain.length - 1 && <i aria-hidden="true">→</i>}</div>)}</div>
          <div className="pick-passport-grid"><article><span>PRODUCT SOURCE</span><strong>{passport.source.id}</strong><p>{passport.source.class}</p><small>API {passport.source.apiVersion ?? "UNKNOWN"} · Licence: {passport.source.licence}</small></article><article><span>DIRECTNESS</span><strong>{passport.directness}</strong><p>Exact product facts stay separate from category/pattern evidence.</p></article><article><span>FRESHNESS</span><strong>{passport.freshness.state}</strong><p>{passport.freshness.detail}</p></article><article><span>CONFLICT STATE</span><strong>{passport.conflictState}</strong><p>{passport.completeness}% controlled field completeness.</p></article></div>
          <details className="pick-evidence-details"><summary>SHOW FIELD EVIDENCE</summary><div className="pick-evidence-list">{passport.facts.map((fact) => <div key={fact.id} data-available={fact.available ? "yes" : "no"}><span>{fact.available ? "KNOWN" : "UNKNOWN"}</span><strong>{fact.label}</strong><small>{fact.directness} · {fact.interpretation}</small></div>)}</div></details>
          {evidenceSources.length > 0 && <div className="pick-source-ledger"><span className="pick-kicker">EVIDENCE SOURCES USED</span>{evidenceSources.map((source, index) => <article key={`${source.id ?? source.sourceId ?? "source"}-${index}`}><strong>{source.title ?? source.id ?? source.sourceId ?? "Source"}</strong><span>{source.sourceClass ?? source.class ?? "SOURCE"}{source.checkedAt ? ` · checked ${source.checkedAt}` : ""}</span>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">OPEN SOURCE ↗</a> : null}</article>)}</div>}
        </section>

        <section className="pick-facts"><div className="pick-section-head"><span className="pick-kicker">WHAT THE PRODUCT RECORD SAYS</span><span>Facts are not the same as recommendations.</span></div><div className="pick-fact-grid"><article><span>INGREDIENTS</span><p>{product.ingredientsText || "Not available"}</p></article><article><span>ALLERGENS</span><p>{product.allergenDataPresent ? (product.allergenTags.length ? product.allergenTags.join(", ") : "None listed in source") : "Not available — check physical label"}</p></article><article className="pick-nutrients"><span>NUTRITION · /100 G/ML</span><dl><div><dt>Energy</dt><dd>{fmt(product.nutrients.energyKcal, "kcal")}</dd></div><div><dt>Sugar</dt><dd>{fmt(product.nutrients.sugars)}</dd></div><div><dt>Salt</dt><dd>{fmt(product.nutrients.salt)}</dd></div><div><dt>Saturated fat</dt><dd>{fmt(product.nutrients.saturatedFat)}</dd></div><div><dt>Protein</dt><dd>{fmt(product.nutrients.protein)}</dd></div><div><dt>Fibre</dt><dd>{fmt(product.nutrients.fibre)}</dd></div></dl></article></div></section>
        {(truth.conflicts.length > 0 || truth.missing.length > 0) && <section className="pick-limitations"><span className="pick-kicker">KNOWN LIMITATIONS</span>{truth.conflicts.length > 0 && <p><strong>Conflicts:</strong> {truth.conflicts.join(", ")}</p>}{truth.missing.length > 0 && <p><strong>Missing:</strong> {truth.missing.join(", ")}</p>}</section>}
      </>}

      <section className="pick-basket" id="basket" aria-labelledby="pick-basket-title"><div className="pick-section-head"><div><span className="pick-kicker">LOCAL · PRIVATE · HOUSEHOLD</span><h2 id="pick-basket-title">Your basket</h2></div><span>Stored only in this browser.</span></div><div className="pick-basket-stats"><div><strong>{basketStats.total}</strong><span>PRODUCTS</span></div><div><strong>{basketStats.healthCoverage}%</strong><span>HEALTH DATA</span></div><div><strong>{basketStats.walletCoverage}%</strong><span>WALLET DATA</span></div><div><strong>{basketStats.planetCoverage}%</strong><span>PLANET DATA</span></div><div><strong>{basketStats.pricedItems ? basketStats.observedBasketPrice.toLocaleString("nb-NO", { maximumFractionDigits: 2 }) : "—"}</strong><span>OBSERVED NOK · {basketStats.priceObservationCoverage}% COVERAGE</span></div></div>{basket.length === 0 ? <p className="pick-basket-empty">Add products to start a household basket.</p> : <div className="pick-basket-list">{basket.map((item) => <article key={item.gtin}><div><span className="pick-kicker">GTIN {item.gtin}</span><strong>{item.name}</strong><small>{item.brand} · {item.quantity}</small>{typeof item.observedPrice === "number" && <small>{item.observedPrice.toLocaleString("nb-NO", { maximumFractionDigits: 2 })} NOK observed {item.observedPriceDate || "date unknown"}{item.observedPricePlace ? ` · ${item.observedPricePlace}` : ""}</small>}</div><div className="pick-basket-axis"><span>H {item.healthConfidence}</span><span>W {item.walletConfidence}</span><span>P {item.planetConfidence}</span></div><button type="button" onClick={() => saveBasket(removeBasketItem(basket, item.gtin))} aria-label={`Remove ${item.name}`}>×</button></article>)}</div>}<p className="pick-basket-rule">{basketStats.rule}</p></section>

      <PickHouseholdPanel basketStats={basketStats} />
      <footer className="pick-footer"><strong>PICK_ / FOOD_</strong><p>PRIVATE PROTOTYPE · Missing data never improves rank · Price observations are not guaranteed shelf prices · Verify allergens against the physical label.</p></footer>
    </main>
  );
}
