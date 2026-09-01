import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { parseEmblaShoppingList, resolveEmblaIntake, summariseEmblaShoppingList } from "../../choice/embla";
import "./embla-02.css";

type EmblaMode = "LIST" | "ASK";

const financeModules = [
  { title: "MONEY MAP", text: "One honest picture of income, fixed costs, debt, assets, goals and recurring commitments. Manual-first; connected accounts later." },
  { title: "CHOICE COST", text: "Turn everyday decisions into 1, 5 and 10-year consequences: cash, total cost, risk and opportunity cost." },
  { title: "INVESTMENT INTELLIGENCE", text: "Fundamentals, valuation ranges, scenarios, company evidence and uncertainty. Analysis and comparison — not BUY / SELL instructions." },
];

export function FourSapienHome() {
  const [mode, setMode] = useState<EmblaMode>("LIST");
  const [shoppingList, setShoppingList] = useState("Kaffe\nMelk\nSmør");
  const [store, setStore] = useState("KIWI");
  const [budget, setBudget] = useState("150");
  const [analysed, setAnalysed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState<string | null>(null);

  const items = useMemo(() => parseEmblaShoppingList(shoppingList), [shoppingList]);
  const summary = useMemo(() => summariseEmblaShoppingList(items), [items]);
  const embla = useMemo(() => submittedPrompt === null ? null : resolveEmblaIntake(submittedPrompt), [submittedPrompt]);

  const analyseList = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAnalysed(true);
    setSaved(false);
  };

  const runEmbla = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedPrompt(prompt);
  };

  const saveList = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("4planet.embla.shopping-list.v1", JSON.stringify({ shoppingList, store, budget, savedAt: new Date().toISOString() }));
    }
    setSaved(true);
  };

  return (
    <main className="embla02">
      <header className="embla02__header">
        <Link to="/" className="embla02__brand">4PLANET_</Link>
        <span className="embla02__byline">4SAPIEN / EMBLA 02</span>
      </header>

      <section className="embla02__hero">
        <p className="embla02__eyebrow">PERSONAL CHOICE INTELLIGENCE</p>
        <h1>Embla.</h1>
        <p className="embla02__lede">Better choices for your life — without making you do the research first.</p>

        <nav className="embla02__quick" aria-label="Embla quick actions">
          <button type="button" className={mode === "LIST" ? "is-active" : ""} onClick={() => { setMode("LIST"); setAnalysed(false); }}>Shopping list</button>
          <button type="button" onClick={() => { setMode("LIST"); setShoppingList("Kaffe"); setAnalysed(false); }}>Find best</button>
          <Link to="/4sapien/food">Scan</Link>
          <button type="button" className={mode === "ASK" ? "is-active" : ""} onClick={() => setMode("ASK")}>Ask Embla</button>
        </nav>
      </section>

      {mode === "LIST" ? (
        <section className="embla02__workspace" aria-labelledby="embla-list-title">
          <div className="embla02__workspace-head">
            <div>
              <p className="embla02__eyebrow">FIRST REAL JOB</p>
              <h2 id="embla-list-title">Give me your list.</h2>
            </div>
            <span className="embla02__truth-chip">NO EVIDENCE → NO RECOMMENDATION</span>
          </div>

          <form onSubmit={analyseList} className="embla02__list-form">
            <label htmlFor="embla-shopping-list">What do you need?</label>
            <textarea id="embla-shopping-list" value={shoppingList} onChange={(event) => { setShoppingList(event.target.value); setAnalysed(false); }} placeholder="Coffee\nMilk\nButter" />

            <div className="embla02__context-grid">
              <label>Store
                <select value={store} onChange={(event) => setStore(event.target.value)}>
                  <option>KIWI</option>
                  <option>REMA 1000</option>
                  <option>MENY</option>
                  <option>ODA</option>
                  <option>OTHER / UNKNOWN</option>
                </select>
              </label>
              <label>Budget · NOK
                <input inputMode="decimal" value={budget} onChange={(event) => setBudget(event.target.value.replace(/[^0-9.,]/g, ""))} placeholder="Optional" />
              </label>
            </div>

            <p className="embla02__boundary">Store is your shopping context only. Embla does not claim live shelf availability unless matching store evidence exists.</p>
            <button type="submit" className="embla02__primary">Analyse my list</button>
          </form>

          {analysed ? (
            <section className="embla02__results" aria-live="polite">
              <div className="embla02__result-summary">
                <div><strong>{summary.supported}</strong><span>evidence-ready</span></div>
                <div><strong>{summary.unsupported}</strong><span>not covered yet</span></div>
                <div><strong>{budget || "—"}</strong><span>NOK target</span></div>
              </div>

              <div className="embla02__items">
                {items.map((item, index) => (
                  <article key={`${item.raw}-${index}`} className="embla02__item" data-supported={item.supported ? "yes" : "no"}>
                    <div>
                      <span className="embla02__item-status">{item.status.replaceAll("_", " ")}</span>
                      <h3>{item.raw}</h3>
                      {item.supported ? (
                        <p>{item.label} is one of the first three controlled FOOD categories. Embla can use the existing product truth path, but category-wide ranking is withheld until product-level evidence and availability are sufficient.</p>
                      ) : (
                        <p>This item stays on your list, but Embla will not pretend the category is ready yet.</p>
                      )}
                    </div>
                    {item.supported ? <Link to="/4sapien/food">Open food evidence →</Link> : <span className="embla02__muted-action">Keep as-is</span>}
                  </article>
                ))}
              </div>

              <div className="embla02__action-bar">
                <div>
                  <strong>{store}</strong>
                  <span>Context saved only when you choose to save this list.</span>
                </div>
                <button type="button" onClick={saveList}>Use this list</button>
              </div>
              {saved ? <p className="embla02__saved">Saved on this device. This is the first bounded LEARN receipt — not a claim that products were purchased.</p> : null}
            </section>
          ) : null}
        </section>
      ) : (
        <section className="embla02__workspace embla02__workspace--ask" aria-labelledby="embla-ask-title">
          <div className="embla02__workspace-head">
            <div><p className="embla02__eyebrow">ASK EMBLA</p><h2 id="embla-ask-title">What are you trying to decide?</h2></div>
          </div>
          <form onSubmit={runEmbla} className="embla02__ask-form">
            <textarea aria-label="Ask Embla" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Can I afford this home without making the rest of my life tighter?" />
            <button type="submit" className="embla02__primary">Ask Embla</button>
          </form>
          {embla ? (
            <article className="embla02__answer" aria-live="polite">
              <div><span>{embla.eyebrow}</span><strong>{embla.status.replaceAll("_", " ")}</strong></div>
              <h3>{embla.title}</h3>
              <p>{embla.detail}</p>
              <small>{embla.truthBoundary}</small>
              {embla.nextHref && embla.nextLabel ? <Link to={embla.nextHref}>{embla.nextLabel} →</Link> : null}
            </article>
          ) : null}
        </section>
      )}

      <section className="embla02__principle">
        <div>
          <p className="embla02__eyebrow">ONE SAPIEN / MANY CHOICES</p>
          <h2>Understand me. Understand the world. Help me choose. Help me act.</h2>
        </div>
        <div className="embla02__principle-links">
          <Link to="/4sapien/food">FOOD / LIVE PROOF</Link>
          <Link to="/4sapien/finance">4FINANCE / MONEY CONTEXT</Link>
        </div>
      </section>
    </main>
  );
}

export function FourFinanceHome() {
  return (
    <main className="embla-finance">
      <header className="embla-finance__header"><Link to="/4sapien">← EMBLA</Link><span>4FINANCE / PROOF 00</span></header>
      <section className="embla-finance__hero"><p>EMBLA / MONEY INTELLIGENCE</p><h1>Understand money.<br />Choose with it.</h1><span>4FINANCE is the financial lens inside 4SAPIEN. The same Choice Engine links money to the rest of your life.</span></section>
      <section className="embla-finance__modules">{financeModules.map((module, index) => <article key={module.title}><span>0{index + 1}</span><h2>{module.title}</h2><p>{module.text}</p></article>)}</section>
      <section className="embla-finance__boundary"><p>TRUTH BY DESIGN</p><h2>Evidence and scenarios. Not a magic BUY button.</h2><span>Connected accounts and evidence-complete investment comparison are not active in this proof. Missing financial context remains UNKNOWN.</span></section>
    </main>
  );
}
