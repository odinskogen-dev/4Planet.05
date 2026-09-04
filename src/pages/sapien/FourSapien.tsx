import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { parseEmblaShoppingList } from "../../choice/embla";
import { controlledComparisonGroups, resolveChoiceIntent, type ChoiceIntent } from "../../choice/intent";
import {
  addReceipt,
  browserStorage,
  readList,
  readReceipts,
  removeReceipt,
  setReceiptFeedback,
  writeList,
  writeReceipts,
  type ChoiceFeedback,
  type ChoiceReceipt,
} from "../../choice/receipts";
import EmblaFoodDecision from "./EmblaFoodDecision";
import "./embla-03.css";
import "./embla-02.css";

const SUGGESTIONS = ["Yoghurt", "Breakfast cereal", "Crisps for the weekend", "A car for the next five years"];

const financeModules = [
  { title: "MONEY MAP", text: "One honest picture of income, fixed costs, debt, assets, goals and recurring commitments. Manual-first; connected accounts later." },
  { title: "CHOICE COST", text: "Turn everyday decisions into 1, 5 and 10-year consequences: cash, total cost, risk and opportunity cost." },
  { title: "INVESTMENT INTELLIGENCE", text: "Fundamentals, valuation ranges, scenarios, company evidence and uncertainty. Analysis and comparison — not BUY / SELL instructions." },
];

function scrollToWorkspace(node: HTMLElement | null) {
  if (!node || typeof window === "undefined") return;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  window.requestAnimationFrame(() => node.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }));
}

export function FourSapienHome() {
  const storage = useMemo(() => browserStorage(), []);
  const [draft, setDraft] = useState("");
  const [intent, setIntent] = useState<ChoiceIntent | null>(null);
  const [session, setSession] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const [listText, setListText] = useState(() => readList(storage));
  const [receipts, setReceipts] = useState<ChoiceReceipt[]>(() => readReceipts(storage));
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLElement | null>(null);

  const listItems = useMemo(
    () => parseEmblaShoppingList(listText).map((item) => item.raw).slice(0, 12),
    [listText],
  );
  const groups = useMemo(() => controlledComparisonGroups().slice(0, 5).join(", "), []);

  const start = (value: string) => {
    const resolved = resolveChoiceIntent(value);
    if (!resolved) return;
    setIntent(resolved);
    setSession((current) => current + 1);
    scrollToWorkspace(workspaceRef.current);
  };

  const submitIntent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    start(draft);
  };

  const restart = () => {
    setIntent(null);
    setDraft("");
    scrollToWorkspace(introRef.current);
  };

  const persist = (next: ChoiceReceipt[]) => {
    setReceipts(next);
    writeReceipts(storage, next);
  };

  const handleReceipt = (receipt: ChoiceReceipt) => persist(addReceipt(receipts, receipt));
  const handleFeedback = (id: string, feedback: ChoiceFeedback) => persist(setReceiptFeedback(receipts, id, feedback));

  const saveList = () => {
    writeList(storage, listText);
  };

  return (
    <main className="embla" data-stage={intent ? "decision" : "intent"}>
      <header className="embla__header">
        <Link to="/" className="embla__brand">4PLANET_</Link>
        <span className="embla__mono">EMBLA · 4SAPIEN</span>
      </header>

      <section className="embla__hero" ref={introRef}>
        <p className="embla__eyebrow">CHOICE INTELLIGENCE</p>
        <h1>Choose better.</h1>
        <p className="embla__lede">
          Tell Embla what you are choosing. It reads the evidence, shows what you gain and what you give up, and says plainly
          when it does not know.
        </p>

        {intent ? (
          <div className="embla__intent-bar">
            <div>
              <span className="embla__mono">CHOOSING</span>
              <strong>{intent.label}</strong>
            </div>
            <button type="button" className="embla__quiet-button" onClick={restart}>
              Choose something else
            </button>
          </div>
        ) : (
          <>
            <form className="embla__intent-form" onSubmit={submitIntent}>
              <label htmlFor="embla-intent">What are you choosing?</label>
              <div className="embla__intent-row">
                <input
                  id="embla-intent"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Yoghurt for breakfast"
                  autoComplete="off"
                />
                <button type="submit" className="embla__button embla__button--primary">Start</button>
              </div>
            </form>

            <div className="embla__chips" role="group" aria-label="Example decisions">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} type="button" className="embla__chip" onClick={() => start(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="embla__quiet-button embla__list-toggle"
              aria-expanded={listOpen}
              onClick={() => setListOpen((value) => !value)}
            >
              {listOpen ? "Hide my shopping list" : "Or start from your shopping list"}
            </button>

            {listOpen ? (
              <div className="embla__list">
                <label htmlFor="embla-list">Your list — one item per line</label>
                <textarea
                  id="embla-list"
                  value={listText}
                  onChange={(event) => setListText(event.target.value)}
                  placeholder={"Yoghurt\nMuesli\nCrisps"}
                />
                <div className="embla__list-actions">
                  <button type="button" className="embla__quiet-button" onClick={saveList}>Keep this list on my device</button>
                </div>
                {listItems.length > 0 ? (
                  <>
                    <p className="embla__fine">Pick the one item you want to improve. Embla works on one decision at a time.</p>
                    <div className="embla__chips">
                      {listItems.map((item, index) => (
                        <button key={`${item}-${index}`} type="button" className="embla__chip" onClick={() => start(item)}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </section>

      <div className="embla__workspace" ref={workspaceRef}>
        {intent === null ? (
          <section className="embla__step embla__intro">
            <p className="embla__step-label">HOW EMBLA WORKS</p>
            <h2>Evidence first. Then a real answer — or none.</h2>
            <ol className="embla__how">
              <li><strong>Your product.</strong> Embla reads one real product record before it says anything.</li>
              <li><strong>Your priorities.</strong> You say what matters. Nothing is scored behind your back.</li>
              <li><strong>The answer.</strong> Switch, keep, or an honest “not enough evidence”, with the trade-offs shown.</li>
            </ol>
            <p className="embla__fine">
              Food is the first decision Embla can actually complete. Comparisons run inside controlled groups such as {groups} —
              never across products that are not real substitutes.
            </p>
          </section>
        ) : intent.domain === "FOOD" ? (
          <EmblaFoodDecision key={session} intentLabel={intent.label} onReceipt={handleReceipt} />
        ) : (
          <section className="embla__answer" data-verdict="CANNOT_COMPARE">
            <p className="embla__step-label">{intent.intake.eyebrow}</p>
            <h2>{intent.intake.title}</h2>
            <p className="embla__answer-lede">{intent.intake.detail}</p>
            <p className="embla__fine">{intent.intake.truthBoundary}</p>
            <div className="embla__actions">
              {intent.intake.nextHref && intent.intake.nextLabel ? (
                <Link className="embla__button embla__button--ghost" to={intent.intake.nextHref}>
                  {intent.intake.nextLabel}
                </Link>
              ) : null}
              <button type="button" className="embla__quiet-button" onClick={restart}>Choose something else</button>
            </div>
          </section>
        )}
      </div>

      {receipts.length > 0 ? (
        <section className="embla__saved" aria-labelledby="embla-saved-title">
          <div className="embla__saved-head">
            <div>
              <p className="embla__step-label">YOUR DECISIONS</p>
              <h2 id="embla-saved-title">Kept on this device.</h2>
            </div>
            <button type="button" className="embla__quiet-button" onClick={restart}>Make another choice</button>
          </div>
          <div className="embla__saved-list">
            {receipts.map((receipt) => (
              <article key={receipt.id} className="embla__saved-item">
                <p className="embla__mono">
                  {receipt.action === "SWITCH" ? "SWITCHED" : "KEPT"} · {receipt.recordType === "SAMPLE_TEST_RECORD" ? "TEST RECORD" : "LIVE SOURCE READ"}
                </p>
                <strong>{receipt.chosenTitle}</strong>
                <p className="embla__fine">
                  {receipt.action === "SWITCH" ? `Instead of ${receipt.baselineTitle}. ` : ""}
                  {receipt.priorities.length > 0 ? `Priorities: ${receipt.priorities.join(", ")}.` : "No priorities set."}
                </p>
                <div className="embla__feedback">
                  {receipt.feedback === null ? (
                    <>
                      <span className="embla__mono">WAS THIS USEFUL?</span>
                      <button type="button" className="embla__quiet-button" onClick={() => handleFeedback(receipt.id, "USEFUL")}>Useful</button>
                      <button type="button" className="embla__quiet-button" onClick={() => handleFeedback(receipt.id, "NOT_USEFUL")}>Not useful</button>
                    </>
                  ) : (
                    <span className="embla__mono">{receipt.feedback === "USEFUL" ? "MARKED USEFUL" : "MARKED NOT USEFUL"}</span>
                  )}
                  <button
                    type="button"
                    className="embla__quiet-button"
                    onClick={() => persist(removeReceipt(receipts, receipt.id))}
                    aria-label={`Delete decision: ${receipt.chosenTitle}`}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p className="embla__fine">
            Saved decisions stay in this browser. They are a record of what you decided — not proof of a purchase, a health outcome
            or an environmental outcome.
          </p>
        </section>
      ) : null}

      <footer className="embla__footer">
        <p className="embla__mono">ONE SAPIEN · MANY CHOICES</p>
        <p>Understand me. Understand the world. Help me choose. Help me act.</p>
        <nav aria-label="Related 4SAPIEN surfaces">
          <Link to="/4sapien/food">FOOD evidence workspace</Link>
          <Link to="/4sapien/finance">4FINANCE money context</Link>
        </nav>
      </footer>
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
