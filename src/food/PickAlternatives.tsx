import { useEffect, useState } from "react";
import { trackChoiceFeedback, trackChoiceResult, trackPaymentSignal, type ChoiceFeedback } from "@/analytics/ProductAnalytics";
import type { PickAlternativeEvaluation } from "./pick-compare.js";

export default function PickAlternatives({ items }: { items: PickAlternativeEvaluation[] }) {
  const visible = items.filter((item) => item.eligible).slice(0, 5);
  const proofResult = visible.length > 0 ? "recommendation" : items.length > 0 ? "withheld" : "insufficient_evidence";
  const evidenceState = visible.length > 0 ? "sufficient" : items.length > 0 ? "partial" : "unknown";
  const [feedback, setFeedback] = useState<ChoiceFeedback | null>(null);
  const [paymentInterest, setPaymentInterest] = useState(false);

  useEffect(() => {
    trackChoiceResult("food", proofResult, evidenceState);
    setFeedback(null);
    setPaymentInterest(false);
  }, [proofResult, evidenceState]);

  const recordFeedback = (next: ChoiceFeedback) => {
    if (feedback === next) return;
    setFeedback(next);
    trackChoiceFeedback("food", next);
  };

  const recordPaymentInterest = () => {
    if (paymentInterest) return;
    setPaymentInterest(true);
    trackPaymentSignal("food", "consumer_interest");
  };

  return (
    <section className="pick-alternatives" aria-labelledby="pick-alt-title" data-proof-result={proofResult}>
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

      <div className="pick-proof" aria-label="Choice proof">
        <span className="pick-kicker">DECISION PROOF</span>
        <strong>{proofResult === "recommendation" ? "CONTROLLED ALTERNATIVE AVAILABLE" : proofResult === "withheld" ? "RECOMMENDATION WITHHELD" : "INSUFFICIENT COMPARISON EVIDENCE"}</strong>
        <p>{proofResult === "recommendation" ? "At least one returned alternative passed the controlled eligibility rules." : proofResult === "withheld" ? "Candidates were returned, but none passed the controlled eligibility rules. Missing evidence does not become a win." : "No comparison candidate was returned, so PICK_ does not invent a recommendation."}</p>
        <div className="pick-proof__feedback">
          <span>Did this help you make the choice?</span>
          <button type="button" aria-pressed={feedback === "helpful"} onClick={() => recordFeedback("helpful")}>YES</button>
          <button type="button" aria-pressed={feedback === "not_helpful"} onClick={() => recordFeedback("not_helpful")}>NO</button>
        </div>
        {feedback === "helpful" && <div className="pick-proof__payment">
          <span>Would decision support like this be worth paying for?</span>
          <button type="button" aria-pressed={paymentInterest} onClick={recordPaymentInterest}>{paymentInterest ? "INTEREST RECORDED" : "I WOULD PAY FOR THIS"}</button>
          <small>No payment occurs. This records only a bounded interest signal, not proven willingness to pay.</small>
        </div>}
      </div>
    </section>
  );
}