import { useMemo, useState } from "react";
import type { PickBasketSummary } from "./pick-basket.js";
import { HOUSEHOLD_NEEDS, availableMealPatterns, nextHouseholdAction, persistShop, safeReadShop, shopSummary, toggleNeed } from "./pick-household.js";

const CORRECTION_KEY = "p18:pick:corrections:v1";

export default function PickHouseholdPanel({ basketStats }: { basketStats: PickBasketSummary }) {
  const [shop, setShop] = useState<Record<string, boolean>>(() => typeof window === "undefined" ? {} : safeReadShop(window.localStorage));
  const [correction, setCorrection] = useState("");
  const [savedCorrection, setSavedCorrection] = useState(false);
  const summary = useMemo(() => shopSummary(shop), [shop]);
  const meals = useMemo(() => availableMealPatterns(shop), [shop]);
  const nextAction = useMemo(() => nextHouseholdAction(shop, basketStats), [shop, basketStats]);

  const setNeed = (id: string) => {
    const next = toggleNeed(shop, id);
    setShop(next);
    if (typeof window !== "undefined") persistShop(window.localStorage, next);
  };

  const saveCorrection = () => {
    const note = correction.trim();
    if (!note || typeof window === "undefined") return;
    const existing = JSON.parse(window.localStorage.getItem(CORRECTION_KEY) || "[]") as Array<Record<string, unknown>>;
    existing.push({ createdAt: new Date().toISOString(), note, transmitted: false });
    window.localStorage.setItem(CORRECTION_KEY, JSON.stringify(existing));
    setCorrection("");
    setSavedCorrection(true);
  };

  return (
    <section className="pick-household" aria-labelledby="pick-household-title">
      <div className="pick-section-head">
        <div><span className="pick-kicker">HOUSEHOLD / ACTION</span><h2 id="pick-household-title">Shop mode</h2></div>
        <span>Manual first. Local only. Learn from the real shop.</span>
      </div>

      <div className="pick-household-summary">
        <div><strong>{summary.coverage}%</strong><span>BASIC NEEDS MARKED</span></div>
        <div><strong>{summary.mealBaseReady ? "READY" : "OPEN"}</strong><span>SIMPLE MEAL BASE</span></div>
        <div><strong>{summary.missing.length}</strong><span>NEEDS UNMARKED</span></div>
      </div>

      <div className="pick-next-action"><span className="pick-kicker">NEXT BEST ACTION</span><p>{nextAction}</p></div>

      <div className="pick-needs-grid" role="group" aria-label="Basic household needs">
        {HOUSEHOLD_NEEDS.map((need) => (
          <button key={need.id} type="button" className="pick-need" data-checked={shop[need.id] ? "yes" : "no"} aria-pressed={Boolean(shop[need.id])} onClick={() => setNeed(need.id)}>
            <span>{shop[need.id] ? "✓" : "+"}</span><strong>{need.label}</strong><small>{need.group}</small>
          </button>
        ))}
      </div>

      <div className="pick-meals">
        <span className="pick-kicker">MEAL PATTERNS AVAILABLE FROM MARKED BASICS</span>
        {meals.length === 0 ? <p>Mark household basics to reveal simple meal patterns. PICK_ does not invent ingredients that are not present.</p> : <div className="pick-meal-grid">{meals.map((meal) => <article key={meal.id}><strong>{meal.label}</strong><p>{meal.note}</p></article>)}</div>}
      </div>

      <details className="pick-correct">
        <summary>PRODUCT / SOURCE LOOKS WRONG?</summary>
        <p>Record a correction locally. This prototype does not transmit it automatically.</p>
        <textarea value={correction} onChange={(event) => { setCorrection(event.target.value); setSavedCorrection(false); }} rows={3} placeholder="What looks wrong? Product, formulation, price, source mapping…" />
        <button type="button" onClick={saveCorrection} disabled={!correction.trim()}>SAVE LOCALLY</button>
        {savedCorrection && <small role="status">Saved locally. Not transmitted.</small>}
      </details>
    </section>
  );
}
