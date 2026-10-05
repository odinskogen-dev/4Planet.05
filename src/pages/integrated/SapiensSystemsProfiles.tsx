import { Link, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { ACTOR_PROFILES, actorBySlug } from "@/data/actorProfiles";
import "@/styles/sapiens-systems-profiles.css";

const needs = [
  { id: "food", label: "FOOD_", verb: "EAT", x: 50, y: 7, open: true },
  { id: "water", label: "WATER", verb: "DRINK", x: 17, y: 28, open: false },
  { id: "energy", label: "EN4RGY_", verb: "POWER", x: 83, y: 28, open: false },
  { id: "shelter", label: "BUILT SYSTEM", verb: "SHELTER", x: 16, y: 72, open: false },
  { id: "wear", label: "F4SHION_", verb: "WEAR", x: 84, y: 72, open: false },
  { id: "move", label: "MOBILITY", verb: "MOVE", x: 50, y: 93, open: false },
];

const architecture = ["UNDERSTANDING", "SOLUTIONS", "INNOVATIONS", "ACTORS", "ACTION"];

const innovation = {
  id: "INN-FOOD-001",
  slug: "precision-nutrient-management",
  status: "GOLD TEMPLATE · INNOVATION CLASS",
  name: "Precision nutrient management",
  problem: "Nutrient loss, inefficient fertiliser use and downstream pressure in food production.",
  solution: "Apply nutrients with higher spatial, temporal and crop-specific precision so fewer inputs are lost from the production system.",
  mechanism: ["Sense field / crop conditions", "Target input need", "Apply variable rate or timing", "Measure response", "Iterate"],
  adoption: ["Farm / grower", "Agronomy", "Equipment / software", "Input supplier", "Buyer / procurement", "Policy / incentive"],
  evidence: "This first profile demonstrates the Innovation grammar. It does not endorse a vendor, claim a universal outcome or treat the innovation class as sufficient evidence of local effectiveness.",
};

function HumanCard() {
  return (
    <div className="s4-human-card">
      <div className="s4-human-glyph" aria-hidden>
        <span className="s4-human-head" />
        <span className="s4-human-body" />
        <span className="s4-human-arm a" />
        <span className="s4-human-arm b" />
        <span className="s4-human-leg a" />
        <span className="s4-human-leg b" />
      </div>
      <span className="s4-kicker">SPECIES · HOMO SAPIENS</span>
      <strong>Human</strong>
      <small>GBIF 10856082</small>
    </div>
  );
}

export function SapiensFrontDoor() {
  return (
    <PublicShell>
      <main className="s4-system-page s4-front-door">
        <header className="s4-profile-header">
          <div>
            <span className="s4-kicker">S4PIENS_ · HUMAN SYSTEMS</span>
            <h1>One species. The systems around us.</h1>
          </div>
          <span className="s4-state">FOOD_ OPEN · OTHER SYSTEMS LOCKED</span>
        </header>

        <section className="s4-human-system" aria-label="Human systems map">
          <div className="s4-human-ring" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="s4-human-lines" aria-hidden>
            {needs.map((node) => <line key={node.id} x1="50" y1="50" x2={node.x} y2={node.y} className={node.open ? "is-open" : ""} />)}
          </svg>
          <HumanCard />
          {needs.map((node) => node.open ? (
            <Link key={node.id} className="s4-need-node is-open" style={{ left: `${node.x}%`, top: `${node.y}%` }} to="/food">
              <span>{node.verb}</span><strong>{node.label}</strong><small>OPEN →</small>
            </Link>
          ) : (
            <div key={node.id} className="s4-need-node is-locked" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
              <span>{node.verb}</span><strong>{node.label}</strong><small>NEXT</small>
            </div>
          ))}
        </section>

        <section className="s4-system-chain">
          <div className="s4-chain-origin"><span>HUMAN SYSTEM</span><strong>FOOD_</strong></div>
          {architecture.map((label, index) => (
            <div className="s4-chain-step" key={label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <small>{label === "INNOVATIONS" ? "Concrete technologies / methods / models" : label === "ACTORS" ? "Who can implement in this solution + geography" : label === "ACTION" ? "Adopt · fund · procure · pilot · participate" : ""}</small>
            </div>
          ))}
        </section>

        <section className="s4-front-actions">
          <Link to="/food" className="s4-primary-link">ENTER FOOD_</Link>
          <Link to="/innovations/precision-nutrient-management" className="s4-secondary-link">INNOVATION PROFILE · GOLD TEMPLATE</Link>
          <Link to="/actors" className="s4-secondary-link">ACTOR ENGINE · GOLD PAIR</Link>
        </section>
      </main>
    </PublicShell>
  );
}

export function ActorsIndex() {
  return (
    <PublicShell>
      <main className="s4-system-page">
        <header className="s4-profile-header">
          <div><span className="s4-kicker">4PLANET · ACTOR PROFILE ENGINE 01</span><h1>Who can actually implement the solution?</h1></div>
          <span className="s4-state">GOLD REFERENCES · INTERNAL PROTOTYPE</span>
        </header>
        <p className="s4-profile-lede">Actor is a distinct layer after Solution. Discovery resolves a credible actor by solution type, geography, system relevance, evidence and delivery capacity; Action then exposes what can actually be done through that actor.</p>
        <div className="s4-gold-grid">
          {ACTOR_PROFILES.map((actor) => (
            <Link className="s4-gold-card" to={`/actors/${actor.slug}`} key={actor.id}>
              <span className="s4-kicker">{actor.gold}</span>
              <h2>{actor.name}</h2>
              <p>{actor.oneLine}</p>
              <small>{actor.actorType} · {actor.id}</small>
              <strong>OPEN PROFILE →</strong>
            </Link>
          ))}
        </div>
        <section className="s4-schema-row">
          {['WHO','WHAT','WHERE','PROOF','LIVE','ACT'].map((item, i) => <div key={item}><span>0{i + 1}</span><strong>{item}</strong></div>)}
        </section>
      </main>
    </PublicShell>
  );
}

export function ActorProfilePage() {
  const { slug } = useParams();
  const actor = actorBySlug(slug);
  if (!actor) return <ActorsIndex />;
  return (
    <PublicShell>
      <main className="s4-system-page">
        <header className="s4-profile-header s4-actor-hero">
          <div>
            <span className="s4-kicker">{actor.gold} · {actor.id}</span>
            <h1>{actor.name}</h1>
            <p>{actor.oneLine}</p>
          </div>
          <div className="s4-actor-status"><span>RELATIONSHIP</span><strong>{actor.relationshipState}</strong></div>
        </header>

        <section className="s4-profile-grid">
          <article><span className="s4-kicker">01 · WHO</span><h2>{actor.actorType}</h2><p>{actor.oneLine}</p></article>
          <article><span className="s4-kicker">02 · WHAT</span><h2>Solution classes</h2><ul>{actor.solutionClasses.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span className="s4-kicker">03 · WHERE</span><h2>Geography</h2><ul>{actor.geographies.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span className="s4-kicker">04 · PROOF</span><h2>Evidence</h2><ul>{actor.proof.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span className="s4-kicker">05 · LIVE</span><h2>Current state</h2><ul>{actor.live.map((item) => <li key={item}>{item}</li>)}</ul></article>
        </section>

        <section className="s4-action-section">
          <div className="s4-section-heading"><span className="s4-kicker">06 · ACT</span><h2>Concrete routes from actor to action.</h2></div>
          <div className="s4-action-grid">{actor.actions.map((action) => <article key={action.label}><span>{action.state}</span><h3>{action.label}</h3><p>{action.detail}</p></article>)}</div>
        </section>

        <div className="s4-truth-boundary"><strong>TRUTH BOUNDARY</strong><p>{actor.truthBoundary}</p></div>
        <section className="s4-path-strip"><span>SPECIES / ECOSYSTEM / PROBLEM</span><b>→</b><span>UNDERSTANDING</span><b>→</b><span>SOLUTIONS</span><b>→</b><strong>ACTORS</strong><b>→</b><span>ACTION</span></section>
      </main>
    </PublicShell>
  );
}

export function InnovationProfilePage() {
  return (
    <PublicShell>
      <main className="s4-system-page">
        <header className="s4-profile-header s4-innovation-hero">
          <div><span className="s4-kicker">S4PIENS_ · INNOVATION PROFILE ENGINE 01 · {innovation.id}</span><h1>{innovation.name}</h1><p>{innovation.status}</p></div>
          <span className="s4-state">FOOD_ · SOLUTION → INNOVATION → ADOPTION</span>
        </header>
        <section className="s4-innovation-flow">
          <article><span>PROBLEM FIT</span><h2>What is broken?</h2><p>{innovation.problem}</p></article>
          <article><span>SOLUTION</span><h2>What changes?</h2><p>{innovation.solution}</p></article>
          <article><span>INNOVATION</span><h2>How does it work?</h2><ol>{innovation.mechanism.map((item) => <li key={item}>{item}</li>)}</ol></article>
          <article><span>ADOPTION SYSTEM</span><h2>Who must move?</h2><div className="s4-adoption-nodes">{innovation.adoption.map((item) => <b key={item}>{item}</b>)}</div></article>
        </section>
        <section className="s4-path-strip s4-path-strip-wide"><span>HUMAN SYSTEM / PROBLEM</span><b>→</b><span>UNDERSTANDING</span><b>→</b><span>SOLUTIONS</span><b>→</b><strong>INNOVATIONS</strong><b>→</b><span>ACTORS</span><b>→</b><span>ACTION / ADOPTION</span></section>
        <div className="s4-truth-boundary"><strong>TRUTH BOUNDARY</strong><p>{innovation.evidence}</p></div>
        <div className="s4-front-actions"><Link to="/food" className="s4-primary-link">BACK TO FOOD_</Link><Link to="/actors" className="s4-secondary-link">OPEN ACTOR ENGINE</Link></div>
      </main>
    </PublicShell>
  );
}
