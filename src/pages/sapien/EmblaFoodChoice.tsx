import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FoodIntelligence from "@/food/FoodIntelligence";
import PickPrototype from "@/food/PickPrototype";
import "./embla-choice.css";

type Priority = "SUGAR" | "SALT" | "PROTEIN" | "ALLERGENS" | "WALLET" | "PLANET" | "BALANCED";

const PRIORITIES: Array<{ id: Priority; label: string; short: string; readiness: "COMPARE" | "SCAN" | "CLARIFY" }> = [
  { id: "SUGAR", label: "Lower sugar", short: "Compare controlled nutrition evidence.", readiness: "COMPARE" },
  { id: "SALT", label: "Lower salt", short: "Compare controlled nutrition evidence.", readiness: "COMPARE" },
  { id: "PROTEIN", label: "More protein", short: "Compare controlled nutrition evidence.", readiness: "COMPARE" },
  { id: "ALLERGENS", label: "Avoid an allergen", short: "Use declared allergen evidence and check the physical label.", readiness: "COMPARE" },
  { id: "WALLET", label: "Spend less", short: "Price observations can inform one product; alternative price ranking is not complete yet.", readiness: "SCAN" },
  { id: "PLANET", label: "Lower planetary pressure", short: "Planet evidence is shown where available, but category-wide ranking is not yet strong enough.", readiness: "SCAN" },
  { id: "BALANCED", label: "Best overall", short: "There is no honest universal score. Choose what matters most first.", readiness: "CLARIFY" },
];

export default function EmblaFoodChoice() {
  const [searchParams] = useSearchParams();
  const researchMode = searchParams.get("research") === "1";
  const [priority, setPriority] = useState<Priority>("BALANCED");
  const [mode, setMode] = useState<"START" | "COMPARE" | "SCAN">("START");
  const selected = useMemo(() => PRIORITIES.find((item) => item.id === priority)!, [priority]);

  const proceed = () => {
    if (selected.readiness === "COMPARE") setMode("COMPARE");
    if (selected.readiness === "SCAN") setMode("SCAN");
  };

  return (
    <main className="embla-choice">
      <header className="embla-choice__top">
        <Link to="/4sapien" className="embla-choice__brand">4PLANET_ / EMBLA</Link>
        <span>{researchMode ? "FOOD DECISION · RESEARCH MODE" : "FOOD DECISION · PRIVATE PROTOTYPE"}</span>
      </header>

      <section className="embla-choice__hero">
        <p>HELP ME MAKE A BETTER CHOICE RIGHT NOW.</p>
        <h1>What matters<br />most <i>today?</i></h1>
        <span>Embla does not hide trade-offs inside one sustainability score. Pick the job first; then inspect the strongest evidence path that actually exists.</span>
      </section>

      <section className="embla-choice__priorities" aria-labelledby="embla-priority-title">
        <div className="embla-choice__section-head"><span>01</span><h2 id="embla-priority-title">Choose the decision.</h2></div>
        <div className="embla-choice__priority-grid" role="radiogroup" aria-label="What matters most in this food choice?">
          {PRIORITIES.map((item) => (
            <button key={item.id} type="button" role="radio" aria-checked={priority === item.id} className={priority === item.id ? "is-active" : ""} onClick={() => { setPriority(item.id); setMode("START"); }}>
              <strong>{item.label}</strong><span>{item.short}</span><b>{item.readiness === "COMPARE" ? "COMPARISON READY" : item.readiness === "SCAN" ? "PRODUCT EVIDENCE" : "NEEDS PRIORITY"}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="embla-choice__answer" aria-live="polite" data-readiness={selected.readiness.toLowerCase()}>
        <div><span>02 · EMBLA RESPONSE</span><h2>{selected.label}</h2></div>
        <div>
          {selected.readiness === "COMPARE" && <><strong>I can help compare this now.</strong><p>Use the controlled FOOD comparison below. It keeps direct substitutes separate from adjacent products, exposes missing evidence and explains why an alternative is or is not eligible.</p><button type="button" onClick={proceed}>COMPARE PRODUCTS ↓</button></>}
          {selected.readiness === "SCAN" && <><strong>I can inspect a real product now, but I cannot honestly rank the whole shelf on this axis yet.</strong><p>{selected.short} Scan a product to see the evidence, uncertainty and available alternatives without turning missing data into a win.</p><button type="button" onClick={proceed}>SCAN A PRODUCT ↓</button></>}
          {selected.readiness === "CLARIFY" && <><strong>“Best overall” is not one factual answer.</strong><p>Price, health, convenience and planetary consequences can conflict. Choose the concern you would regret getting wrong, then Embla can use the relevant evidence instead of inventing a universal score.</p></>}
        </div>
      </section>

      {mode === "COMPARE" && <section className="embla-choice__engine" aria-label="Controlled food comparison"><div className="embla-choice__engine-head"><span>03 · COMPARE</span><h2>Scan one option. Inspect the alternatives.</h2><p>Current ranking is strongest for controlled health and allergen comparisons. Wallet and planetary evidence remain separate until their comparison contracts are strong enough.</p></div><FoodIntelligence /></section>}
      {mode === "SCAN" && <section className="embla-choice__engine" aria-label="Product evidence"><div className="embla-choice__engine-head"><span>03 · PRODUCT EVIDENCE</span><h2>Start with what we actually know.</h2><p>One product can expose HEALTH, WALLET and PLANET separately. That is useful evidence; it is not yet permission to claim the best product in the category.</p></div><PickPrototype /></section>}

      <section className="embla-choice__truth">
        <span>TRUTH BY DESIGN</span><h2>Here is the best we actually know.<br />Here is what we do not know.<br />You decide.</h2>
        {researchMode
          ? <Link to="/labs/food-user-test#food-test-record-title">← RETURN TO HUMAN PROOF RECORD</Link>
          : <Link to="/4sapien">← ASK EMBLA SOMETHING ELSE</Link>}
      </section>
    </main>
  );
}
