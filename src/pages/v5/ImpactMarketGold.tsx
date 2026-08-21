import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  GOLD_PRODUCT,
  IMPACT_CONTRACTS,
  ORDER_EVENTS,
  calculateWaterfall,
  waterfallTotal,
  type ImpactContract,
} from "@/market/impactCommerce";
import "@/styles/impact-market-gold.css";

const nok = (value: number) => `NOK ${value.toLocaleString("nb-NO")}`;

function TruthPill({ children }: { children: React.ReactNode }) {
  return <span className="mkt-truth">{children}</span>;
}

function ImpactCard({ contract, active, onSelect }: { contract: ImpactContract; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      className={`mkt-impact-card ${active ? "is-active" : ""}`}
      onClick={onSelect}
      style={{ "--impact-accent": contract.accent } as React.CSSProperties}
    >
      <span className="mkt-impact-top"><b>{contract.mission}</b><TruthPill>{contract.state}</TruthPill></span>
      <strong>{contract.publicName}</strong>
      <span>{contract.unitLabel}</span>
      <small>{contract.claim}</small>
    </button>
  );
}

export default function ImpactMarketGold() {
  const [impactId, setImpactId] = useState(GOLD_PRODUCT.impactContractId);
  const [price, setPrice] = useState(GOLD_PRODUCT.waterfall.customerPriceNok);
  const [submitted, setSubmitted] = useState(false);
  const [approved, setApproved] = useState(false);
  const [eventIndex, setEventIndex] = useState(-1);
  const [selfDistribution, setSelfDistribution] = useState(36);

  const impact = IMPACT_CONTRACTS.find((item) => item.id === impactId) ?? IMPACT_CONTRACTS[0];
  const waterfall = useMemo(() => calculateWaterfall(price, impact.unitFundingNok), [price, impact.unitFundingNok]);
  const currentEvent = eventIndex >= 0 ? ORDER_EVENTS[eventIndex] : null;
  const reconciled = currentEvent?.state === "TRANSACTION_RECONCILED";
  const saleCount = reconciled ? 1 : 0;
  const creatorEarned = reconciled ? waterfall.creatorPayableNok : 0;
  const impactFunded = reconciled ? waterfall.impactFundingNok : 0;

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
    document.title = "4PLANET MARKET — Creator × Impact Gold";
    return () => {
      document.title = previousTitle;
      if (created) target?.remove();
      else if (target && oldRobots != null) target.content = oldRobots;
    };
  }, []);

  const nextEvent = () => setEventIndex((current) => Math.min(current + 1, ORDER_EVENTS.length - 1));
  const resetOrder = () => setEventIndex(-1);

  return (
    <main className="mkt-page">
      <div className="mkt-projection mkt-projection-a" aria-hidden="true" />
      <div className="mkt-projection mkt-projection-b" aria-hidden="true" />
      <div className="mkt-grain" aria-hidden="true" />

      <header className="mkt-nav">
        <Link to="/cre4tors" className="mkt-wordmark">CRE4TORS<span>_</span></Link>
        <div className="mkt-nav-mid"><span />4PLANET MARKET · GOLD 01</div>
        <nav aria-label="Market prototype navigation">
          <a href="#market">MARKET</a>
          <a href="#create">CREATE</a>
          <a href="#economy">ECONOMY</a>
          <a href="#dashboard">DASH</a>
        </nav>
      </header>

      <section className="mkt-hero" id="market">
        <div className="mkt-kicker">4RT_ × CREATOR ENGINE × IMPACT</div>
        <h1>ART THAT<br />DOES<br /><em>SOMETHING.</em></h1>
        <div className="mkt-hero-bottom">
          <p>Creators make work people want. Every approved product can carry an explicit Impact Contract. One purchase can create creator value, 4PLANET value and evidence-backed action — without hiding the economics.</p>
          <div className="mkt-hero-rules">
            <span>PRINTS FIRST</span><span>CURATED</span><span>CREATOR-OWNED</span><span>IMPACT EXPLICIT</span>
          </div>
        </div>
        <div className="mkt-livebar"><TruthPill>DEMO · NOT LIVE COMMERCE</TruthPill><span>No payment · POD · creator payout or ecological outcome is represented as real.</span></div>
      </section>

      <section className="mkt-product-stage">
        <div className="mkt-art-frame" aria-label="Synthetic abstract artwork fixture">
          <div className="mkt-art mkt-art-one"><i /><i /><i /></div>
          <span>DEMO ARTWORK · FIXTURE</span>
        </div>
        <div className="mkt-product-copy">
          <div className="mkt-eyebrow">4RT_ EDITION / GOLD FIXTURE</div>
          <h2>TIDAL<br />MEMORY 01</h2>
          <p className="mkt-byline">BY DEMO CREATOR · FINE ART PRINT · 50 × 70 CM</p>
          <p className="mkt-lead">A desirable object first. A transparent impact obligation second. The work does not need a charitable excuse to exist.</p>
          <div className="mkt-product-facts">
            <div><span>PRICE</span><strong>{nok(waterfall.customerPriceNok)}</strong></div>
            <div><span>CREATOR</span><strong>{nok(waterfall.creatorPayableNok)}</strong></div>
            <div><span>IMPACT</span><strong>{nok(waterfall.impactFundingNok)}</strong></div>
            <div><span>4PLANET</span><strong>{nok(waterfall.fourPlanetContributionNok)}</strong></div>
          </div>
          <div className="mkt-impact-claim" style={{ "--impact-accent": impact.accent } as React.CSSProperties}>
            <span>{impact.mission}</span>
            <strong>{impact.publicName}</strong>
            <p>{impact.claim}</p>
            <small>{impact.evidence}</small>
          </div>
          <button className="mkt-primary" type="button" onClick={() => document.getElementById("economy")?.scrollIntoView({ behavior: "smooth" })}>SEE THE TRANSACTION →</button>
        </div>
      </section>

      <section className="mkt-statement">
        <span>THE MODEL</span>
        <h2>ONE SALE.<br /><i>FOUR OUTPUTS.</i></h2>
        <div className="mkt-four-output">
          <article><b>01</b><strong>CUSTOMER</strong><p>A creative object worth owning.</p></article>
          <article><b>02</b><strong>CREATOR</strong><p>Income, proof, distribution and independence.</p></article>
          <article><b>03</b><strong>4PLANET</strong><p>Transparent contribution margin to sustain the system.</p></article>
          <article><b>04</b><strong>IMPACT</strong><p>A separate, traceable funding obligation with evidence rules.</p></article>
        </div>
      </section>

      <section className="mkt-create" id="create">
        <div className="mkt-section-head">
          <span>CREATOR PUBLISH / GOLD</span>
          <h2>MAKE IT.<br />CONNECT IT.<br /><em>KNOW THE DEAL.</em></h2>
          <p>The creator should not need to become a fulfilment company, accountant or impact-claims specialist. The system constrains the boring parts and keeps material choices explicit.</p>
        </div>

        <div className="mkt-builder">
          <div className="mkt-builder-main">
            <div className="mkt-builder-step"><span>01 / WORK</span><strong>TIDAL MEMORY 01</strong><small>Creator-owned artwork · print suitability DEMO PASS</small></div>
            <div className="mkt-builder-step"><span>02 / PRODUCT</span><strong>FINE ART PRINT</strong><small>50 × 70 CM · POD substrate pending physical quality validation</small></div>

            <div className="mkt-builder-step mkt-builder-impact">
              <span>03 / CHOOSE AN APPROVED IMPACT CONTRACT</span>
              <div className="mkt-impact-grid">
                {IMPACT_CONTRACTS.map((contract) => (
                  <ImpactCard key={contract.id} contract={contract} active={contract.id === impact.id} onSelect={() => { setImpactId(contract.id); setEventIndex(-1); }} />
                ))}
              </div>
            </div>

            <div className="mkt-builder-step">
              <span>04 / PRICE</span>
              <div className="mkt-slider-row">
                <input aria-label="Demo print price" type="range" min="900" max="2200" step="50" value={price} onChange={(event) => { setPrice(Number(event.target.value)); setEventIndex(-1); }} />
                <strong>{nok(waterfall.customerPriceNok)}</strong>
              </div>
              <small>Prototype pricing control. No tax, margin or market recommendation is implied.</small>
            </div>

            <div className="mkt-builder-step">
              <span>05 / RIGHTS</span>
              <div className="mkt-rights-grid">
                <div><b>OWNERSHIP</b><p>Creator retained</p></div>
                <div><b>COMMERCE USE</b><p>Bounded licence</p></div>
                <div><b>ATTRIBUTION</b><p>Required</p></div>
                <div><b>AI TRAINING</b><p>Not granted</p></div>
              </div>
            </div>
          </div>

          <aside className="mkt-waterfall-card">
            <div className="mkt-eyebrow">06 / ECONOMIC CONTRACT</div>
            <h3>THE WATERFALL</h3>
            <p>Not “a percentage goes to nature.” Every output is explicit before publish.</p>
            <div className="mkt-waterfall">
              <div><span>CUSTOMER PRICE</span><strong>{nok(waterfall.customerPriceNok)}</strong></div>
              <div><span>TAX + PAYMENT RESERVE</span><strong>{nok(waterfall.taxAndPaymentReserveNok)}</strong></div>
              <div><span>PRODUCTION + FULFILMENT</span><strong>{nok(waterfall.productionAndFulfilmentNok)}</strong></div>
              <div className="is-impact"><span>IMPACT OBLIGATION</span><strong>{nok(waterfall.impactFundingNok)}</strong></div>
              <div className="is-creator"><span>CREATOR PAYABLE</span><strong>{nok(waterfall.creatorPayableNok)}</strong></div>
              <div><span>4PLANET CONTRIBUTION</span><strong>{nok(waterfall.fourPlanetContributionNok)}</strong></div>
              <div className="mkt-waterfall-check"><span>ALLOCATED</span><strong>{nok(waterfallTotal(waterfall))} / {nok(waterfall.customerPriceNok)}</strong></div>
            </div>
            <TruthPill>ALL VALUES DEMO</TruthPill>
          </aside>
        </div>

        <div className="mkt-curation">
          <div><span>07 / CURATION</span><h3>{approved ? "APPROVED FOR DEMO MARKET" : submitted ? "CURATION PENDING" : "READY TO SUBMIT"}</h3><p>Quality · IP · print file · substrate · Impact Contract · margin floor · claim grammar.</p></div>
          <div className="mkt-curation-actions">
            {!submitted && <button type="button" onClick={() => setSubmitted(true)}>SUBMIT PRODUCT →</button>}
            {submitted && !approved && <button type="button" onClick={() => setApproved(true)}>SIMULATE CURATOR APPROVAL →</button>}
            {approved && <span className="mkt-approved">✓ PUBLISHED FIXTURE</span>}
          </div>
        </div>
      </section>

      <section className="mkt-economy" id="economy">
        <div className="mkt-section-head dark">
          <span>REALTIME ECONOMY / SYNTHETIC TRANSACTION</span>
          <h2>AN ORDER IS NOT<br /><em>THE SAME THING AS MONEY.</em></h2>
          <p>Payment, production, creator payable and Impact funding remain separate states until each actually happens. The prototype makes that distinction visible.</p>
        </div>

        <div className="mkt-ledger-layout">
          <div className="mkt-event-rail">
            {ORDER_EVENTS.map((event, index) => (
              <div key={event.state} className={`mkt-event ${index <= eventIndex ? "is-done" : ""} ${index === eventIndex ? "is-current" : ""}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{event.label}</b>
                <strong>{event.state.replaceAll("_", " ")}</strong>
              </div>
            ))}
          </div>
          <aside className="mkt-event-control">
            <TruthPill>DEMO EVENT ENGINE</TruthPill>
            <h3>{currentEvent ? currentEvent.state.replaceAll("_", " ") : approved ? "READY TO RUN" : "CURATION REQUIRED"}</h3>
            <p>{currentEvent?.detail ?? (approved ? "Run one synthetic order through the complete commerce state machine." : "Approve the product fixture before a transaction can begin.")}</p>
            <div className="mkt-output-mini">
              <div><span>CREATOR PAYABLE</span><strong>{eventIndex >= 3 ? nok(waterfall.creatorPayableNok) : "—"}</strong></div>
              <div><span>IMPACT LIABILITY</span><strong>{eventIndex >= 4 ? nok(waterfall.impactFundingNok) : "—"}</strong></div>
              <div><span>4PLANET CONTRIBUTION</span><strong>{eventIndex >= 1 ? nok(waterfall.fourPlanetContributionNok) : "—"}</strong></div>
              <div><span>RECONCILED</span><strong>{reconciled ? "YES" : "NO"}</strong></div>
            </div>
            <div className="mkt-event-buttons">
              <button type="button" disabled={!approved || reconciled} onClick={nextEvent}>{eventIndex < 0 ? "RUN DEMO ORDER" : reconciled ? "RECONCILED" : "NEXT EVENT"} →</button>
              {eventIndex >= 0 && <button className="secondary" type="button" onClick={resetOrder}>RESET</button>}
            </div>
          </aside>
        </div>
      </section>

      <section className="mkt-dashboard" id="dashboard">
        <div className="mkt-section-head">
          <span>CREATOR DASHBOARD</span>
          <h2>YOUR WORK.<br />YOUR ECONOMY.<br /><em>YOUR IMPACT.</em></h2>
          <p>The intended proof is not “4PLANET sold a print.” It is whether creative work produces legitimate creator value and traceable action while the operating burden stays low.</p>
        </div>

        <div className="mkt-dash-grid">
          <article className="mkt-dash-primary">
            <span>MY INDEPENDENCE</span>
            <div className="mkt-big-number">{nok(creatorEarned)}</div>
            <small>DEMO CREATOR VALUE FROM RECONCILED MARKET SALES</small>
            <div className="mkt-dash-stats">
              <div><b>{saleCount}</b><span>SALES</span></div>
              <div><b>{reconciled ? "PAYABLE → PAID" : "—"}</b><span>PAYMENT STATE</span></div>
              <div><b>{reconciled ? "1.6 H" : "0 H"}</b><span>MODELLED ADMIN AVOIDED</span></div>
            </div>
          </article>

          <article className="mkt-dash-impact" style={{ "--impact-accent": impact.accent } as React.CSSProperties}>
            <span>MY IMPACT</span>
            <div className="mkt-big-number">{nok(impactFunded)}</div>
            <small>{reconciled ? "DEMO IMPACT FUNDING STATE — NOT A REAL TRANSFER" : "NO RECONCILED IMPACT EVENT YET"}</small>
            <div className="mkt-impact-result"><b>{impact.mission}</b><strong>{reconciled ? impact.unitLabel : "WAITING FOR TRANSACTION"}</strong><p>{impact.evidence}</p></div>
          </article>
        </div>
      </section>

      <section className="mkt-distribution">
        <div className="mkt-section-head dark">
          <span>4PEOPLE × 4CULTURE / DISTRIBUTION HYPOTHESIS</span>
          <h2>THE PEOPLE MAKING<br />THE WORK CAN ALSO<br /><em>MOVE THE STORY.</em></h2>
          <p>Not because they are required to market for 4PLANET. Because the creator has legitimate self-interest in the work succeeding. If value alignment is real, creator distribution can become a new route into audiences environmental organisations rarely reach.</p>
        </div>
        <div className="mkt-distribution-lab">
          <div className="mkt-distribution-control">
            <span>DEMO SHARE OF PRODUCT DISCOVERY FROM CREATOR-ORIGINATED DISTRIBUTION</span>
            <strong>{selfDistribution}%</strong>
            <input aria-label="Creator originated distribution share" type="range" min="0" max="80" value={selfDistribution} onChange={(event) => setSelfDistribution(Number(event.target.value))} />
            <small>Hypothesis control only. No audience or conversion data is represented as observed.</small>
          </div>
          <div className="mkt-flywheel">
            {[
              "BETTER WORK",
              "CREATOR DISTRIBUTION",
              "NEW AUDIENCES",
              "MORE DEMAND",
              "CREATOR INCOME",
              "4PLANET VALUE",
              "IMPACT FUNDING",
              "PROOF + STORY",
            ].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</div>)}
          </div>
        </div>
      </section>

      <section className="mkt-boundary">
        <span>GOLD 01 / TRUTH BOUNDARY</span>
        <h2>BUILD THE WHOLE LOOP.<br /><em>FAKE NONE OF IT.</em></h2>
        <div className="mkt-boundary-grid">
          <div><b>BUILT NOW</b><p>Product contract · curated print flow · Impact Contract selector · transparent DEMO waterfall · rights state · transaction state machine · creator earnings/impact dashboard · distribution hypothesis.</p></div>
          <div><b>REAL NEXT</b><p>Quality-validated POD print partner · physical sample · one approved real Impact Contract · marketplace/payment/KYC/tax/legal architecture · one real creator + one real customer transaction.</p></div>
          <div><b>NOT CLAIMED</b><p>No real sale · no real creator payout · no product manufactured or shipped · no funds transferred to Impact · no tree/plastic/coral/habitat outcome · no live margin proof.</p></div>
        </div>
        <Link className="mkt-back" to="/cre4tors">← BACK TO CRE4TORS_</Link>
      </section>
    </main>
  );
}
