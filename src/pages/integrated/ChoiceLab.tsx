import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/choice-lab.css";

type View = "innovation" | "capital" | "system";
type Readiness = "RESEARCH" | "PROTOTYPE" | "PILOT" | "DEPLOYED" | "SCALING" | "OPEN GAP";

type Option = {
  id: string;
  label: string;
  type: string;
  readiness: Readiness;
  mechanism: string;
  evidenceNeed: string;
  capitalFit: string;
  actorNeed: string;
  status: "working-hypothesis" | "model-object";
};

const OPTIONS: Option[] = [
  {
    id: "prevent",
    label: "PREVENT THE PRESSURE",
    type: "Solution pathway",
    readiness: "DEPLOYED",
    mechanism: "Change the upstream system so the pressure is avoided before restoration is required.",
    evidenceNeed: "Context-specific proof that the intervention changes the identified pressure without shifting harm elsewhere.",
    capitalFit: "Procurement · operational investment · policy / incentive design",
    actorNeed: "Producer · buyer · public actor · implementer",
    status: "model-object",
  },
  {
    id: "efficiency",
    label: "USE LESS INPUT PER OUTPUT",
    type: "Innovation family",
    readiness: "PILOT",
    mechanism: "Reduce material, water, nutrient or energy intensity at a defined value-chain stage.",
    evidenceNeed: "Measured baseline, intervention delta, rebound / displacement check and operational economics.",
    capitalFit: "Paid pilot · corporate capex · concessional / blended route",
    actorNeed: "Technology / method developer · adopter · verifier",
    status: "working-hypothesis",
  },
  {
    id: "substitute",
    label: "SUBSTITUTE THE HIGH-PRESSURE INPUT",
    type: "Innovation family",
    readiness: "PROTOTYPE",
    mechanism: "Replace a material, process or input with a lower-pressure alternative where full-system evidence supports it.",
    evidenceNeed: "Lifecycle comparison, scalability, supply constraints, affordability and unintended consequences.",
    capitalFit: "R&D · venture / growth capital · strategic partnership",
    actorNeed: "Researcher · innovator · manufacturer · customer",
    status: "working-hypothesis",
  },
  {
    id: "restore",
    label: "RESTORE LOST FUNCTION",
    type: "Solution pathway",
    readiness: "DEPLOYED",
    mechanism: "Repair an ecological function after prevention and pressure reduction are addressed.",
    evidenceNeed: "Delivery evidence, ecological response metrics, time horizon, durability and counterfactual limits.",
    capitalFit: "Grant · philanthropy · public finance · project finance where applicable",
    actorNeed: "Field implementer · land / rights holder · scientist · verifier",
    status: "model-object",
  },
  {
    id: "gap",
    label: "UNSOLVED SYSTEM GAP",
    type: "Opportunity space",
    readiness: "OPEN GAP",
    mechanism: "A material bottleneck is evidenced, but no sufficiently mature capability is currently represented in the graph.",
    evidenceNeed: "Problem validation first; then falsifiable requirements for what a successful new capability would need to achieve.",
    capitalFit: "Research challenge · prize · grant · venture creation · mission-driven procurement",
    actorNeed: "Scientist · founder · engineer · policy designer · coalition",
    status: "model-object",
  },
];

const TRACE = [
  ["HUMAN NEED", "FOOD"],
  ["VALUE CHAIN", "INPUTS"],
  ["PRESSURE", "MATERIAL / RESOURCE INTENSITY"],
  ["SOLUTION", "REDUCE / AVOID PRESSURE"],
  ["INNOVATION", "CAPABILITY OPTIONS + OPEN GAPS"],
  ["ACTOR", "DEVELOPER / ADOPTER / IMPLEMENTER"],
  ["CAPITAL", "NEXT CREDIBLE INSTRUMENT"],
  ["IMPACT", "DELIVERY"],
  ["PROOF", "EVIDENCE / OUTCOME"],
] as const;

function noIndex() {
  const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  const created = !existing;
  const meta = existing ?? document.createElement("meta");
  const previous = meta.content;
  meta.name = "robots";
  meta.content = "noindex,nofollow";
  if (created) document.head.appendChild(meta);
  return () => {
    if (created) meta.remove();
    else meta.content = previous;
  };
}

export function ChoiceLabPage() {
  const [view, setView] = useState<View>("system");
  const [selectedId, setSelectedId] = useState("gap");
  const selected = useMemo(() => OPTIONS.find((option) => option.id === selectedId) ?? OPTIONS[0], [selectedId]);

  useEffect(() => {
    const previous = document.title;
    document.title = "CHOICE_ — Innovation × Capital Intelligence sandbox";
    const restore = noIndex();
    return () => {
      document.title = previous;
      restore();
    };
  }, []);

  return (
    <div className="choice-page">
      <header className="choice-header">
        <Link to="/tree-of-life" className="choice-back">← TREE OF LIFE_</Link>
        <div className="choice-modes" role="group" aria-label="CHOICE view">
          {(["system", "innovation", "capital"] as View[]).map((item) => (
            <button key={item} type="button" className={view === item ? "is-active" : ""} onClick={() => setView(item)}>{item.toUpperCase()}</button>
          ))}
        </div>
        <span>LABS / PRIVATE / NOINDEX</span>
      </header>

      <main>
        <section className="choice-hero">
          <div className="choice-hero-copy">
            <span className="choice-kicker">4PLANET LABS_ / CHOICE PROTOTYPE</span>
            <h1>CHOICE_</h1>
            <p>System context around the decision.</p>
          </div>
          <div className="choice-thesis">
            <span>WORKING PRODUCT THESIS</span>
            <p>Start from a material problem. Make the solution mechanism, innovation landscape, actor capacity, evidence state and capital need legible before asking capital to choose.</p>
          </div>
        </section>

        <section className="choice-trace" aria-label="Decision trace">
          {TRACE.map(([type, value], index) => (
            <div key={type} className="choice-trace-step">
              <span>{String(index + 1).padStart(2, "0")} / {type}</span>
              <strong>{value}</strong>
              {index < TRACE.length - 1 && <i>→</i>}
            </div>
          ))}
        </section>

        <section className={`choice-workspace choice-view-${view}`}>
          <div className="choice-map">
            <div className="choice-map-head">
              <span>01_ INNOVATION LANDSCAPE</span>
              <h2>What already exists — and what is still missing?</h2>
              <p>Prototype data below demonstrates the object model only. It is not a claim that these generic families are complete, superior or appropriate for every FOOD context.</p>
            </div>

            <div className="choice-option-list">
              {OPTIONS.map((option, index) => {
                const active = option.id === selected.id;
                return (
                  <button type="button" key={option.id} className={active ? "is-active" : ""} onClick={() => setSelectedId(option.id)}>
                    <span className="choice-option-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="choice-option-main"><small>{option.type}</small><strong>{option.label}</strong></span>
                    <span className={`choice-readiness choice-readiness-${option.readiness.toLowerCase().replace(" ", "-")}`}>{option.readiness}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="choice-inspector" aria-live="polite">
            <span className="choice-inspector-type">SELECTED / {selected.type}</span>
            <h2>{selected.label}</h2>
            <div className="choice-inspector-grid">
              <div><span>MECHANISM</span><p>{selected.mechanism}</p></div>
              <div><span>EVIDENCE REQUIRED</span><p>{selected.evidenceNeed}</p></div>
              <div><span>ACTOR CAPACITY</span><p>{selected.actorNeed}</p></div>
              <div><span>CAPITAL FIT</span><p>{selected.capitalFit}</p></div>
            </div>
            <div className="choice-next-move">
              <span>NEXT CREDIBLE MOVE</span>
              <strong>{selected.readiness === "OPEN GAP" ? "Define the requirement → validate the gap → recruit builders / science / capital." : "Verify the evidence state → identify qualified actors → match the next instrument."}</strong>
            </div>
          </aside>
        </section>

        <section className="choice-capital">
          <div className="choice-capital-copy">
            <span>02_ CAPITAL DECISION INTELLIGENCE</span>
            <h2>Do not rank capital with one opaque score.</h2>
            <p>Keep the decision explainable. A future CHOICE layer can compare options across materiality, living-system dependency, mechanism, maturity, evidence, implementation capacity, geography, capital fit and proof requirements — with every judgement traceable to its underlying records.</p>
          </div>
          <div className="choice-dimensions">
            {["Problem materiality", "Living-system dependency", "Solution mechanism", "Readiness", "Evidence strength", "Implementation capacity", "Capital fit", "Geography", "Proof requirements"].map((dimension, index) => (
              <div key={dimension}><span>{String(index + 1).padStart(2, "0")}</span><strong>{dimension}</strong></div>
            ))}
          </div>
        </section>

        <section className="choice-incentives">
          <div className="choice-incentive-head"><span>03_ INCENTIVE DESIGN</span><h2>Make every participant better off for contributing truth.</h2></div>
          <div className="choice-incentive-grid">
            <article><span>INNOVATORS</span><strong>Problem context + visibility + adopters + pilots + capital.</strong><p>Strong builders have a reason to keep their profile accurate because it can connect them to the exact system need they address.</p></article>
            <article><span>CAPITAL</span><strong>Lower search cost + better fit + stronger decision context.</strong><p>Capital sees the problem and proof architecture behind the ask rather than receiving another undifferentiated project list.</p></article>
            <article><span>FIELD / SCIENCE</span><strong>Implementation context + evidence + collaboration.</strong><p>Implementers and researchers become part of the same graph, making verification and real-world deployment visible.</p></article>
            <article><span>4PLANET</span><strong>A compounding Planet Model.</strong><p>Every verified contribution strengthens the map of problems, solutions, actors, capital and proof without surrendering independent truth control.</p></article>
          </div>
        </section>

        <section className="choice-boundary">
          <span>TRUTH / PRODUCT BOUNDARY</span>
          <p>CHOICE_ is an internal product hypothesis and interaction prototype. Generic solution families are used here to prove navigation and decision logic. No named company, funder, maturity claim, funding relationship, ecological outcome or recommendation is asserted by this page.</p>
        </section>
      </main>
    </div>
  );
}
