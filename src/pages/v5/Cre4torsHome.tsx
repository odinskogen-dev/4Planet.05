import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/cre4tors-home.css";

const DISCIPLINES = ["PHOTOGRAPHER", "ARTIST", "FILMMAKER", "DESIGNER", "MUSICIAN", "WRITER"];
const SYSTEMS = [
  ["01", "ME", "Talent, interests, preferred work and the life you are actually trying to build."],
  ["02", "MY ECONOMY", "Turn scattered financial events into cash, runway, reserves and clear decisions."],
  ["03", "OPPORTUNITIES", "Fewer, better matches based on skill, values, availability, rights and real need."],
  ["04", "AUTOPILOT", "Remove routine admin, coordination, follow-up and context recovery from your head."],
  ["05", "RIGHTS", "Keep ownership visible. Make licence, attribution, scope and compensation explicit."],
  ["06", "TIME", "Measure the thing the system exists to return: hours of your life."],
] as const;
const FORCE = [
  ["WH4LES_", "Field story + visual evidence", "PAID"],
  ["SPECIES_", "Rights-cleared archive material", "LICENSED"],
  ["FOOD_", "Systems illustration + storytelling", "PAID"],
  ["ATLAS", "Place-based image / field contribution", "OPT-IN"],
] as const;

export default function Cre4torsHome() {
  const [frictionHours, setFrictionHours] = useState(18);
  const [systemEffectiveness, setSystemEffectiveness] = useState(58);
  const recovered = useMemo(() => Math.round((frictionHours * (systemEffectiveness / 100)) * 10) / 10, [frictionHours, systemEffectiveness]);

  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const description = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const previousRobots = robots?.content;
    const previousDescription = description?.content;
    const previousTitle = document.title;
    let robotsTarget = robots;
    let descriptionTarget = description;
    let createdRobots = false;
    let createdDescription = false;
    if (!robotsTarget) { robotsTarget = document.createElement("meta"); robotsTarget.name = "robots"; document.head.appendChild(robotsTarget); createdRobots = true; }
    if (!descriptionTarget) { descriptionTarget = document.createElement("meta"); descriptionTarget.name = "description"; document.head.appendChild(descriptionTarget); createdDescription = true; }
    robotsTarget.content = "noindex,nofollow";
    descriptionTarget.content = "CRE4TORS_ — infrastructure for creative independence. Create more. Operate less. Own your time.";
    document.title = "CRE4TORS_ — Own your time";
    return () => {
      document.title = previousTitle;
      if (createdRobots) robotsTarget?.remove(); else if (robotsTarget && previousRobots != null) robotsTarget.content = previousRobots;
      if (createdDescription) descriptionTarget?.remove(); else if (descriptionTarget && previousDescription != null) descriptionTarget.content = previousDescription;
    };
  }, []);

  return <main className="c4-home">
    <div className="c4-noise" aria-hidden="true" />
    <header className="c4-nav">
      <Link className="c4-wordmark" to="/cre4tors" aria-label="CRE4TORS home">CRE4TORS<span>_</span></Link>
      <div className="c4-nav-meta">EARLY STAGE · 4PLANET LABS</div>
      <nav aria-label="CRE4TORS prototype navigation"><a href="#system">SYSTEM</a><a href="#force">FOR NATURE</a><Link to="/labs/creator">OPEN ENGINE</Link></nav>
    </header>
    <section className="c4-hero">
      <div className="c4-hero-orbit" aria-hidden="true"><span className="c4-orbit c4-orbit-a" /><span className="c4-orbit c4-orbit-b" /><span className="c4-core">4</span></div>
      <div className="c4-kicker">INFRASTRUCTURE FOR CREATIVE INDEPENDENCE</div>
      <h1>Create more.<br/>Operate less.<br/><em>Own your time.</em></h1>
      <div className="c4-hero-bottom"><p>CRE4TORS_ is an early-stage system for removing the friction around independent creative work — money, admin, rights, opportunity discovery and coordination — so more human capacity can return to the work itself.</p><div className="c4-actions"><Link className="c4-button c4-button-primary" to="/labs/creator">ENTER CREATOR ENGINE <span>↗</span></Link><Link className="c4-button" to="/labs/creator/capacity">HUMAN CAPACITY <span>→</span></Link></div></div>
      <div className="c4-discipline-rail" aria-label="Example creative disciplines">{DISCIPLINES.map((discipline) => <span key={discipline}>{discipline}</span>)}</div>
    </section>
    <section className="c4-manifesto"><div className="c4-section-label">THE THESIS</div><div className="c4-manifesto-copy"><p>People are the infrastructure.</p><h2>Human potential is abundant.<br/>Usable time is not.</h2><p className="c4-manifesto-body">The system should serve the person first: return time, increase clarity, protect ownership and improve economic agency. Only then can recovered capacity be voluntarily directed toward work, culture, communities and a living planet.</p></div></section>
    <section className="c4-time" aria-labelledby="c4-time-heading"><div className="c4-time-copy"><div className="c4-section-label">TIME RETURNED · DEMO MODEL</div><h2 id="c4-time-heading">What if software gave you part of your week back?</h2><p>This calculator is synthetic. It demonstrates the product objective, not a measured promise.</p></div><div className="c4-time-panel"><div className="c4-time-big"><span>MODELLED TIME RETURNED</span><strong>{recovered}<small>h / week</small></strong><p>{Math.round(recovered * 4.33)} hours / month back under your control.</p></div><label className="c4-range"><span><b>WEEKLY FRICTION</b><strong>{frictionHours}h</strong></span><input type="range" min="5" max="35" step="1" value={frictionHours} onChange={(event) => setFrictionHours(Number(event.target.value))} /></label><label className="c4-range"><span><b>SYSTEM EFFECTIVENESS</b><strong>{systemEffectiveness}%</strong></span><input type="range" min="20" max="85" step="1" value={systemEffectiveness} onChange={(event) => setSystemEffectiveness(Number(event.target.value))} /></label><div className="c4-time-flow"><span>FRICTION</span><i>→</i><span>SYSTEM</span><i>→</i><span>TIME</span><i>→</i><span>CHOICE</span></div></div></section>
    <section className="c4-system" id="system"><div className="c4-section-heading"><div className="c4-section-label">THE CREATOR ENGINE</div><h2>One operating layer.<br/>Six jobs.</h2></div><div className="c4-system-grid">{SYSTEMS.map(([index, title, body]) => <article key={title}><small>{index}</small><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className="c4-safety"><div className="c4-safety-title"><div className="c4-section-label">SAFETY FLOOR</div><h2>Useful enough to lean on.<br/>Safe enough to leave.</h2></div><div className="c4-safety-list"><div><span>01</span><b>YOUR WORK STAYS YOURS</b><p>Ownership and licence state stay explicit.</p></div><div><span>02</span><b>PRIVATE ECONOMY STAYS PRIVATE</b><p>Creator finance is a separate data plane from 4PLANET.</p></div><div><span>03</span><b>HUMAN OVERRIDE</b><p>Material automation must be inspectable and correctable.</p></div><div><span>04</span><b>ZERO DARK PATTERNS</b><p>The goal is less dependence on the product, not more screen time.</p></div><div><span>05</span><b>PAID ≠ LICENSED ≠ CONTRIBUTED</b><p>Compensation and contribution states never blur silently.</p></div></div></section>
    <section className="c4-force" id="force"><div className="c4-force-head"><div className="c4-section-label">CREATIVES AS A FORCE FOR NATURE</div><h2>Your abilities can meet<br/>real planetary needs.</h2><p>4PLANET can become the first differentiated demand layer: mission-linked creative work with explicit value, rights and choice. The examples below are prototype fixtures only.</p></div><div className="c4-force-grid">{FORCE.map(([mission, need, valueClass]) => <article key={mission}><div><span>{mission}</span><b>{valueClass}</b></div><h3>{need}</h3><p>DEMO NEED · NOT A LIVE OPPORTUNITY</p></article>)}</div><div className="c4-force-loop"><span>TALENT</span><i>→</i><span>VALUES</span><i>→</i><span>QUALIFIED NEED</span><i>→</i><span>FAIR VALUE</span><i>→</i><span>CREATE</span><i>→</i><span>PEOPLE + PLANET</span></div></section>
    <section className="c4-economy"><div className="c4-section-label">REALTIME ECONOMY SEAM</div><h2>Reuse the intelligence.<br/>Never merge the ledgers.</h2><div className="c4-economy-map"><div><small>PRIVATE SOURCES</small><strong>bank · invoices · accounting · contracts</strong></div><i>→</i><div className="is-accent"><small>CREATOR ECONOMY</small><strong>event → state → forecast → decision</strong></div><i>→</i><div><small>HUMAN DECISION</small><strong>say yes · wait · price · protect · take time</strong></div></div></section>
    <section className="c4-closing"><div className="c4-section-label">THE NORTH STAR</div><h2>More of your life<br/>belongs to you.</h2><div className="c4-northstar"><span>TIME RETURNED</span><i>×</i><span>SAFETY + AGENCY</span><i>×</i><span>MEANINGFUL OPPORTUNITY</span></div><div className="c4-closing-actions"><Link className="c4-button c4-button-primary" to="/labs/creator">OPEN CREATOR GOLD <span>↗</span></Link><Link className="c4-button" to="/labs/creator/capacity">SEE HUMAN CAPACITY <span>→</span></Link></div></section>
    <footer className="c4-footer"><Link className="c4-wordmark" to="/cre4tors">CRE4TORS<span>_</span></Link><p>EARLY-STAGE 4PLANET LAB · DEMO / NOT LIVE</p><a href="https://4planet.org" target="_blank" rel="noopener noreferrer">A 4PLANET EXPERIMENT ↗</a></footer>
  </main>;
}
