import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import "@/styles/human-capacity-lab.css";

type FrictionKey = "admin" | "opportunity" | "money" | "rights" | "coordination" | "distribution";

type Friction = {
  key: FrictionKey;
  label: string;
  weeklyHours: number;
  recoverable: number;
  mode: "AUTOMATE" | "ASSIST" | "ROUTE";
  note: string;
};

type MissionNeed = {
  id: string;
  mission: string;
  need: string;
  fit: number;
  valueClass: "PAID" | "LICENSED" | "CONTRIBUTED";
  value: string;
  rights: string;
  status: string;
};

const BASE_FRICTION: Friction[] = [
  { key: "admin", label: "Admin + follow-up", weeklyHours: 7, recoverable: 0.65, mode: "AUTOMATE", note: "Email triage, reminders, filing, routine document prep." },
  { key: "opportunity", label: "Finding good work", weeklyHours: 5, recoverable: 0.55, mode: "ASSIST", note: "Search, fit checks, repeated portfolio/context explanation." },
  { key: "money", label: "Money + obligations", weeklyHours: 3, recoverable: 0.45, mode: "ASSIST", note: "Translate source-of-record events into cash, runway and next decisions." },
  { key: "rights", label: "Rights + contracts", weeklyHours: 2, recoverable: 0.35, mode: "ASSIST", note: "Track ownership, scope, attribution and permission state." },
  { key: "coordination", label: "Coordination", weeklyHours: 5, recoverable: 0.55, mode: "AUTOMATE", note: "Scheduling, handoffs, versions, approvals and context recovery." },
  { key: "distribution", label: "Distribution", weeklyHours: 4, recoverable: 0.5, mode: "ROUTE", note: "Channel formatting, publishing prep and reuse of existing work." },
];

const MISSION_NEEDS: MissionNeed[] = [
  { id: "whales-story", mission: "WH4LES_", need: "Field story + visual evidence package", fit: 95, valueClass: "PAID", value: "DEMO commission · NOK 28–45k", rights: "Creator retains ownership · bounded editorial/web licence", status: "DEMO / NO REAL JOB" },
  { id: "species-archive", mission: "SPECIES_", need: "Rights-cleared species archive material", fit: 89, valueClass: "LICENSED", value: "DEMO licence · NOK 4–12k", rights: "Non-exclusive licence · exact media/use/term required", status: "DEMO / NO RIGHTS REQUEST" },
  { id: "food-map", mission: "FOOD_", need: "Human-systems visual explanation", fit: 86, valueClass: "PAID", value: "DEMO commission · NOK 18–30k", rights: "Commission scope separate from creator ownership", status: "DEMO / NO REAL COMMISSION" },
  { id: "atlas-place", mission: "ATLAS", need: "Place-based image / field contribution", fit: 82, valueClass: "CONTRIBUTED", value: "Contribution model not defined", rights: "Explicit opt-in required before any use", status: "CONCEPT ONLY" },
];

const SAFETY_FLOOR = [
  ["OWNERSHIP", "Your work stays yours unless you explicitly agree otherwise."],
  ["EXIT", "Export, correct and leave. The product must not require dependence to keep your own history."],
  ["PRIVATE ECONOMY", "Your personal economy is a separate data plane from 4PLANET organisational finance."],
  ["SOURCE OF RECORD", "Accounting, banking, tax and contracts remain visible external authorities; this layer interprets, it does not invent."],
  ["HUMAN OVERRIDE", "Every material automation and recommendation must be inspectable and correctable."],
  ["NO DARK PATTERNS", "The goal is more time and agency under your control — not more engagement with the product."],
  ["FAIR VALUE", "Paid, licensed and contributed work are different states. Participation is never silently treated as free labour."],
  ["MINIMUM DATA", "Unknown is allowed. The system should work without demanding total surveillance of your life."],
] as const;

const ECONOMY_STATES = ["PLAN", "PIPELINE", "CONTRACTED", "INVOICED", "RECEIVABLE", "CASH", "UNKNOWN"] as const;

export default function HumanCapacityLab() {
  const [automationStrength, setAutomationStrength] = useState(70);
  const [availableMissionHours, setAvailableMissionHours] = useState(4);
  const [selectedNeed, setSelectedNeed] = useState(MISSION_NEEDS[0].id);

  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const previous = robots?.content;
    let target = robots;
    let created = false;
    if (!target) {
      target = document.createElement("meta");
      target.name = "robots";
      document.head.appendChild(target);
      created = true;
    }
    target.content = "noindex,nofollow";
    return () => {
      if (created) target?.remove();
      else if (target && previous != null) target.content = previous;
    };
  }, []);

  const model = useMemo(() => {
    const currentFriction = BASE_FRICTION.reduce((sum, item) => sum + item.weeklyHours, 0);
    const recoveryScale = automationStrength / 100;
    const recovered = BASE_FRICTION.reduce((sum, item) => sum + item.weeklyHours * item.recoverable * recoveryScale, 0);
    const retainedFriction = Math.max(currentFriction - recovered, 0);
    const monthlyReturned = recovered * 4.33;
    return { currentFriction, recovered, retainedFriction, monthlyReturned };
  }, [automationStrength]);

  const selected = MISSION_NEEDS.find((item) => item.id === selectedNeed) ?? MISSION_NEEDS[0];

  return (
    <PublicShell>
      <main className="hc-lab">
        <section className="hc-hero">
          <div className="hc-kicker">4PLANET LABS · CREATOR ENGINE v0.2 · HUMAN CAPACITY</div>
          <h1>People are the infrastructure.</h1>
          <p className="hc-lede">Return time, safety and agency to people. Then let them decide what their recovered capacity is for.</p>
          <div className="hc-principle">
            <strong>HUMAN BENEFIT FIRST</strong>
            <span>This prototype does not treat people as labour for 4PLANET. The system must create value for the person before it asks them to contribute anything.</span>
          </div>
          <div className="hc-links">
            <Link to="/labs/creator">CREATOR GOLD</Link>
            <Link to="/labs">ALL LABS</Link>
            <Link to="/">4PLANET</Link>
          </div>
        </section>

        <section className="hc-section hc-capacity">
          <div className="hc-section-head">
            <span>01 · TIME TAX</span>
            <div>
              <h2>How much of a human life is lost to friction?</h2>
              <p>Demo model only. The first job of the engine is to identify avoidable operating work and safely give time back.</p>
            </div>
          </div>

          <div className="hc-capacity-grid">
            <div className="hc-dial">
              <label htmlFor="automation-strength">SYSTEM EFFECTIVENESS · DEMO</label>
              <strong>{automationStrength}%</strong>
              <input id="automation-strength" type="range" min="0" max="100" step="5" value={automationStrength} onChange={(event) => setAutomationStrength(Number(event.target.value))} />
              <small>Scales only the modelled recoverable share. It is not an observed claim.</small>
            </div>

            <div className="hc-big-metric">
              <span>MODELLED TIME RETURNED</span>
              <strong>{model.recovered.toFixed(1)}h<small>/ week</small></strong>
              <p>{model.monthlyReturned.toFixed(0)} hours/month returned to the person in this synthetic scenario.</p>
            </div>
          </div>

          <div className="hc-friction-list">
            {BASE_FRICTION.map((item, index) => {
              const recovered = item.weeklyHours * item.recoverable * (automationStrength / 100);
              return (
                <article key={item.key}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <div><b>{item.label}</b><p>{item.note}</p></div>
                  <span>{item.mode}</span>
                  <strong>{recovered.toFixed(1)}h returned</strong>
                </article>
              );
            })}
          </div>

          <div className="hc-balance">
            <div><span>BEFORE</span><strong>{model.currentFriction.toFixed(0)}h</strong><small>modelled friction / week</small></div>
            <i>→</i>
            <div><span>SYSTEM</span><strong>-{model.recovered.toFixed(1)}h</strong><small>modelled recovery</small></div>
            <i>→</i>
            <div><span>AFTER</span><strong>{model.retainedFriction.toFixed(1)}h</strong><small>friction still owned by the human/system</small></div>
          </div>
        </section>

        <section className="hc-section hc-safety">
          <div className="hc-section-head">
            <span>02 · SAFETY FLOOR</span>
            <div>
              <h2>Useful enough to lean on. Safe enough to leave.</h2>
              <p>The system should reduce cognitive load without quietly taking control of money, identity, rights, data or purpose.</p>
            </div>
          </div>
          <div className="hc-safety-grid">
            {SAFETY_FLOOR.map(([title, body], index) => (
              <article key={title}><small>{String(index + 1).padStart(2, "0")}</small><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
        </section>

        <section className="hc-section hc-economy">
          <div className="hc-section-head">
            <span>03 · REALTIME ECONOMY SEAM</span>
            <div>
              <h2>Reuse the method. Never merge the ledgers.</h2>
              <p>Creator Economy can inherit the event/state discipline from 4PLANET ECONOMY while keeping the human’s private data and permissions completely separate.</p>
            </div>
          </div>
          <div className="hc-economy-map">
            <div className="hc-economy-node"><span>PRIVATE CREATOR SOURCES</span><strong>bank · invoices · accounting · contracts</strong><small>future connectors · explicit consent</small></div>
            <i>→</i>
            <div className="hc-economy-node hc-economy-node-accent"><span>CREATOR ECONOMY</span><strong>event → state → decision</strong><small>interpretation layer</small></div>
            <i>→</i>
            <div className="hc-economy-node"><span>HUMAN DECISION</span><strong>Can I say yes? Wait? Raise price? Take time?</strong><small>user remains authority</small></div>
          </div>
          <div className="hc-state-row">
            {ECONOMY_STATES.map((state) => <span key={state}>{state}</span>)}
          </div>
          <div className="hc-separation"><strong>HARD BOUNDARY</strong><span>4PLANET organisational economy ≠ creator private economy. Shared grammar is allowed; shared private truth is not.</span></div>
        </section>

        <section className="hc-section hc-movement">
          <div className="hc-section-head">
            <span>04 · CREATIVES AS A FORCE FOR NATURE</span>
            <div>
              <h2>Recovered capacity can become a movement.</h2>
              <p>Only when the person chooses it. 4PLANET’s advantage is not a giant supply marketplace; it can create differentiated, mission-linked demand for real skills.</p>
            </div>
          </div>

          <div className="hc-movement-control">
            <label htmlFor="mission-hours">I choose to make available</label>
            <strong>{availableMissionHours}h<small>/ week</small></strong>
            <input id="mission-hours" type="range" min="0" max="15" step="1" value={availableMissionHours} onChange={(event) => setAvailableMissionHours(Number(event.target.value))} />
            <small>Opt-in capacity. Zero is a valid choice.</small>
          </div>

          <div className="hc-needs">
            <div className="hc-need-list" role="list" aria-label="Demo 4PLANET mission opportunities">
              {MISSION_NEEDS.map((need) => (
                <button key={need.id} type="button" className={selectedNeed === need.id ? "is-active" : ""} onClick={() => setSelectedNeed(need.id)}>
                  <span>{need.mission}</span><strong>{need.need}</strong><small>{need.fit}% demo fit · {need.valueClass}</small>
                </button>
              ))}
            </div>
            <article className="hc-need-detail">
              <span>{selected.mission} · {selected.status}</span>
              <h3>{selected.need}</h3>
              <div><b>VALUE</b><p>{selected.value}</p></div>
              <div><b>RIGHTS</b><p>{selected.rights}</p></div>
              <div><b>AVAILABLE CAPACITY</b><p>{availableMissionHours === 0 ? "Not available — and that is valid." : `${availableMissionHours} hours/week chosen by the person.`}</p></div>
              <small>No real opportunity or relationship is represented here.</small>
            </article>
          </div>

          <div className="hc-loop">
            {["TIME RETURNED", "SKILLS", "USER VALUES", "QUALIFIED NEED", "FAIR VALUE", "CREATE", "HUMAN + PLANET VALUE", "MORE AGENCY"].map((item, index) => (
              <div key={item}><small>{String(index + 1).padStart(2, "0")}</small><strong>{item}</strong></div>
            ))}
          </div>
        </section>

        <section className="hc-section hc-learning">
          <div className="hc-section-head">
            <span>05 · AUTONOMOUS IMPROVEMENT</span>
            <div>
              <h2>The system should learn from friction, not addiction.</h2>
              <p>Every improvement needs an observed problem, a bounded intervention and a human outcome. Engagement time is not the North Star.</p>
            </div>
          </div>
          <div className="hc-learning-flow">
            {["OBSERVE FRICTION", "FORM HYPOTHESIS", "BUILD FIX", "TECH + TRUTH QA", "TEST WITH HUMAN", "MEASURE TIME / VALUE", "CORRECT", "PROMOTE / HOLD / KILL", "WRITE TO BRAIN"].map((item, index) => (
              <article key={item}><small>{String(index + 1).padStart(2, "0")}</small><strong>{item}</strong></article>
            ))}
          </div>
          <div className="hc-learning-rules">
            <div><b>OPTIMISE FOR</b><p>hours returned · useful decisions · fair value · ownership · correction speed · voluntary contribution</p></div>
            <div><b>NEVER OPTIMISE FOR</b><p>platform dependence · compulsive engagement · hidden persuasion · unpaid labour volume · private-data capture</p></div>
          </div>
        </section>

        <section className="hc-closing">
          <span>WORKING THESIS</span>
          <h2>Free human capacity.<br/>Give it direction only by choice.</h2>
          <p>CREATOR is the first wedge. If the mechanism transfers, PEOPLE can become a distributed capacity layer for 4PLANET without turning 4PLANET into an employer of everyone it activates.</p>
          <div><Link to="/labs/creator">OPEN CREATOR GOLD →</Link><Link to="/labs">BACK TO LABS</Link></div>
        </section>
      </main>
    </PublicShell>
  );
}
