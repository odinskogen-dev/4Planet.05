import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import "@/styles/cre4tors-home.css";

type CreatorKey = "photographer" | "artist" | "filmmaker" | "musician" | "writer";
type FrictionKey = "admin" | "opportunity" | "money" | "rights" | "coordination" | "distribution";

type CreatorProfile = {
  label: string;
  discipline: string;
  thesis: string;
  strengths: string[];
  interests: string[];
  rightsFocus: string;
  economyPattern: string;
  glow: string;
  friction: Record<FrictionKey, number>;
};

type Opportunity = {
  id: string;
  creators: CreatorKey[];
  mission: string;
  need: string;
  valueClass: "PAID" | "LICENSED" | "OPT-IN";
  fit: number;
  location: string;
  format: string;
  rights: string;
  timing: string;
  why: string;
};

const DISCIPLINES = ["PHOTOGRAPHER", "ARTIST", "FILMMAKER", "DESIGNER", "MUSICIAN", "WRITER"];

const CREATORS: Record<CreatorKey, CreatorProfile> = {
  photographer: {
    label: "Photographer",
    discipline: "Image · field · archive · licensing",
    thesis: "Spend less time chasing briefs and paperwork. Turn field skill and archive value into clearer, rights-safe opportunities.",
    strengths: ["Field work", "Editorial", "Wildlife", "Archive licensing"],
    interests: ["Whales", "Species", "Places", "Culture"],
    rightsFocus: "Usage scope · exclusivity · archive re-use",
    economyPattern: "Assignments + archive licences + repeat editorial",
    glow: "rgba(102,119,255,.26)",
    friction: { admin: 5, opportunity: 5, money: 3, rights: 3, coordination: 4, distribution: 3 },
  },
  artist: {
    label: "Artist",
    discipline: "Art · illustration · editions · objects",
    thesis: "Keep the studio for making. Let the operating layer handle catalogue, opportunity context, rights and economic visibility around the work.",
    strengths: ["Illustration", "Editions", "Visual narrative", "Original work"],
    interests: ["Species", "Food", "Oceans", "Living systems"],
    rightsFocus: "Ownership · editions · derivatives · reproduction",
    economyPattern: "Originals + editions + commissions + licensing",
    glow: "rgba(255,62,181,.28)",
    friction: { admin: 6, opportunity: 4, money: 4, rights: 3, coordination: 3, distribution: 5 },
  },
  filmmaker: {
    label: "Filmmaker",
    discipline: "Film · direction · edit · production",
    thesis: "Reduce coordination drag across briefs, contributors, approvals and rights so more of the project remains creative work rather than project recovery.",
    strengths: ["Direction", "Story", "Field production", "Editing"],
    interests: ["Oceans", "People", "Solutions", "Culture"],
    rightsFocus: "Contributor releases · music · footage · distribution",
    economyPattern: "Project fees + production budgets + licensing",
    glow: "rgba(185,255,47,.2)",
    friction: { admin: 5, opportunity: 4, money: 4, rights: 5, coordination: 7, distribution: 3 },
  },
  musician: {
    label: "Musician",
    discipline: "Music · composition · recording · performance",
    thesis: "Make master, composition, permission and opportunity states understandable enough that culture can move without sacrificing creator ownership.",
    strengths: ["Composition", "Recording", "Performance", "Sonic identity"],
    interests: ["Whales", "Soundscapes", "Film", "4PLAY"],
    rightsFocus: "Master · composition · sync · performance",
    economyPattern: "Performance + sync + licensing + releases",
    glow: "rgba(116,245,255,.22)",
    friction: { admin: 4, opportunity: 5, money: 4, rights: 6, coordination: 4, distribution: 5 },
  },
  writer: {
    label: "Writer",
    discipline: "Writing · journalism · research · narrative",
    thesis: "Protect deep work by reducing research re-contextualisation, commissioning friction, invoicing and repeated pitching around the writing itself.",
    strengths: ["Narrative", "Interview", "Research", "Editorial"],
    interests: ["Species", "Food", "Places", "People"],
    rightsFocus: "Publication · syndication · translation · archive",
    economyPattern: "Commissions + retainers + syndication + books",
    glow: "rgba(255,174,61,.2)",
    friction: { admin: 4, opportunity: 6, money: 3, rights: 2, coordination: 3, distribution: 4 },
  },
};

const FRICTION_META: Array<{ key: FrictionKey; label: string; note: string; recoverable: number; accent: string }> = [
  { key: "admin", label: "Admin tax", note: "Email, filing, routine documents, follow-up and context switching.", recoverable: .68, accent: "#ff3eb5" },
  { key: "opportunity", label: "Discovery tax", note: "Finding suitable work, repeated pitching and portfolio explanation.", recoverable: .56, accent: "#b9ff2f" },
  { key: "money", label: "Money tax", note: "Invoices, reserves, cash visibility, obligations and uncertainty.", recoverable: .45, accent: "#74f5ff" },
  { key: "rights", label: "Rights tax", note: "Ownership, permissions, scope, attribution and licence tracking.", recoverable: .42, accent: "#ff3eb5" },
  { key: "coordination", label: "Coordination tax", note: "Scheduling, approvals, collaborators, versions and handoffs.", recoverable: .58, accent: "#6677ff" },
  { key: "distribution", label: "Distribution tax", note: "Publishing prep, channel formatting and re-use of existing work.", recoverable: .5, accent: "#b9ff2f" },
];

const LOOP = [
  ["01", "ME", "Skills, interests, preferred work and the life you are actually trying to build."],
  ["02", "WORK", "Portfolio, archive, catalogue, formats and proof of what you can already do."],
  ["03", "DISCOVERY", "Fewer opportunities, ranked by real fit instead of a giant undifferentiated feed."],
  ["04", "RIGHTS", "Ownership, scope, attribution, term, compensation and permission remain explicit."],
  ["05", "MONEY", "Events become understandable cash, runway, reserves and decision states."],
  ["06", "AUTOPILOT", "Routine admin and coordination disappear unless the human actually needs to decide."],
  ["07", "TIME", "Measure the outcome the system exists to return: usable hours of your life."],
  ["08", "CHOICE", "Use recovered capacity for creation, rest, family, culture, community or missions you choose."],
] as const;

const SYSTEMS = [
  ["01", "ME", "Talent, interests, preferred work and the life you are actually trying to build."],
  ["02", "MY ECONOMY", "Turn scattered financial events into cash, runway, reserves and clear decisions."],
  ["03", "OPPORTUNITIES", "Fewer, better matches based on skill, values, availability, rights and real need."],
  ["04", "AUTOPILOT", "Remove routine admin, coordination, follow-up and context recovery from your head."],
  ["05", "RIGHTS", "Keep ownership visible. Make licence, attribution, scope and compensation explicit."],
  ["06", "TIME", "Measure the thing the system exists to return: hours of your life."],
] as const;

const OPPORTUNITIES: Opportunity[] = [
  { id: "whales-field", creators: ["photographer", "filmmaker", "writer"], mission: "WH4LES_", need: "Field story + visual evidence", valueClass: "PAID", fit: 95, location: "NORWAY / FIELD", format: "PHOTO · FILM · EDITORIAL", rights: "Creator-owned · bounded editorial/web licence", timing: "DEMO WINDOW", why: "Marine interest + field-ready storytelling + documentary proof." },
  { id: "species-archive", creators: ["photographer", "artist"], mission: "SPECIES_", need: "Rights-cleared archive material", valueClass: "LICENSED", fit: 91, location: "REMOTE", format: "IMAGE · ILLUSTRATION", rights: "Non-exclusive use · exact media/term required", timing: "DEMO NEED", why: "Existing work can create value again without a new production cycle." },
  { id: "food-system", creators: ["artist", "writer", "filmmaker"], mission: "FOOD_", need: "Human-systems explanation", valueClass: "PAID", fit: 88, location: "HYBRID", format: "ILLUSTRATION · STORY · FILM", rights: "Commission scope separate from creator ownership", timing: "CONCEPT", why: "Complex systems need creators who can make relationships understandable." },
  { id: "atlas-place", creators: ["photographer", "writer", "filmmaker", "musician"], mission: "ATLAS", need: "Place-based field layer", valueClass: "OPT-IN", fit: 84, location: "PLACE-BASED", format: "IMAGE · AUDIO · FILM · TEXT", rights: "Explicit permission before any use", timing: "CONCEPT", why: "Location-linked creative evidence can deepen the Planet Model without centralising every contributor." },
  { id: "sonic-whales", creators: ["musician"], mission: "SONIC × WH4LES_", need: "Listening-world collaboration", valueClass: "PAID", fit: 93, location: "REMOTE / STUDIO", format: "MUSIC · SOUND", rights: "Master + composition handled separately", timing: "CONCEPT", why: "A creator can interpret a living-world subject while explicit rights remain machine-readable." },
  { id: "magazine-essay", creators: ["writer", "photographer"], mission: "M4GAZINE_", need: "Species + place feature", valueClass: "PAID", fit: 86, location: "EDITORIAL", format: "TEXT · IMAGE", rights: "Publication + archive terms explicit", timing: "DEMO NEED", why: "Editorial depth can connect living systems to human relevance without generic campaign copy." },
];

const RIGHTS = [
  ["OWNERSHIP", "Who owns the underlying work? Default: creator ownership remains visible."],
  ["USE", "Exactly what may the commissioner or platform do with it?"],
  ["TERM", "For how long does permission exist? Perpetual use is never silently inferred."],
  ["TERRITORY", "Where may the work be used? Global is not an automatic default."],
  ["ATTRIBUTION", "How should creator credit travel with the work?"],
  ["COMPENSATION", "Fee, licence, revenue share or contribution state remains explicit."],
] as const;

const ECONOMY_METRICS = [
  ["CASH", "SOURCE-BACKED", "What has actually arrived, not what is merely hoped for."],
  ["RUNWAY", "DECISION VIEW", "Translate available cash and obligations into time to make choices."],
  ["RESERVES", "VISIBLE", "Keep tax/VAT or other reserved amounts distinct from spendable cash."],
  ["CONCENTRATION", "DESCRIPTIVE", "See dependence on one customer without pretending the system can predict the future."],
] as const;

const FORCE = [
  ["WH4LES_", "Field story + visual evidence", "PAID"],
  ["SPECIES_", "Rights-cleared archive material", "LICENSED"],
  ["FOOD_", "Systems illustration + storytelling", "PAID"],
  ["ATLAS", "Place-based image / field contribution", "OPT-IN"],
] as const;

const CULTURE = [
  ["4RT_", "Art + editions", "Creator-owned work can enter curated cultural surfaces with explicit economics."],
  ["4FILM_", "Film + moving image", "Briefs, production, contributor rights and distribution can share one operating grammar."],
  ["4PLAY_", "Music + sonic culture", "Master, composition, sync and attribution need explicit permission states."],
  ["M4GAZINE_", "Editorial + narrative", "Writers, photographers and artists can meet structured editorial demand."],
] as const;

export default function Cre4torsHome() {
  const [creator, setCreator] = useState<CreatorKey>("photographer");
  const [systemEffectiveness, setSystemEffectiveness] = useState(62);
  const [selectedOpportunity, setSelectedOpportunity] = useState("whales-field");

  const profile = CREATORS[creator];
  const frictionHours = useMemo(() => Object.values(profile.friction).reduce((sum, value) => sum + value, 0), [profile]);
  const recovered = useMemo(() => {
    const scale = systemEffectiveness / 100;
    return FRICTION_META.reduce((sum, item) => sum + profile.friction[item.key] * item.recoverable * scale, 0);
  }, [profile, systemEffectiveness]);
  const creatorOpportunities = useMemo(() => OPPORTUNITIES.filter((item) => item.creators.includes(creator)), [creator]);
  const activeOpportunity = creatorOpportunities.find((item) => item.id === selectedOpportunity) ?? creatorOpportunities[0];

  useEffect(() => {
    if (!creatorOpportunities.some((item) => item.id === selectedOpportunity)) {
      setSelectedOpportunity(creatorOpportunities[0]?.id ?? "");
    }
  }, [creator, creatorOpportunities, selectedOpportunity]);

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

    if (!robotsTarget) {
      robotsTarget = document.createElement("meta");
      robotsTarget.name = "robots";
      document.head.appendChild(robotsTarget);
      createdRobots = true;
    }
    if (!descriptionTarget) {
      descriptionTarget = document.createElement("meta");
      descriptionTarget.name = "description";
      document.head.appendChild(descriptionTarget);
      createdDescription = true;
    }

    robotsTarget.content = "noindex,nofollow";
    descriptionTarget.content = "CRE4TORS_ — infrastructure for creative independence. Create more. Operate less. Own your time.";
    document.title = "CRE4TORS_ — Own your time";

    return () => {
      document.title = previousTitle;
      if (createdRobots) robotsTarget?.remove();
      else if (robotsTarget && previousRobots != null) robotsTarget.content = previousRobots;
      if (createdDescription) descriptionTarget?.remove();
      else if (descriptionTarget && previousDescription != null) descriptionTarget.content = previousDescription;
    };
  }, []);

  return (
    <main className="c4-home">
      <div className="c4-noise" aria-hidden="true" />

      <header className="c4-nav">
        <Link className="c4-wordmark" to="/cre4tors" aria-label="CRE4TORS home">CRE4TORS<span>_</span></Link>
        <div className="c4-nav-meta"><span className="c4-status-dot" />EARLY STAGE · 4PLANET LABS</div>
        <nav aria-label="CRE4TORS prototype navigation">
          <a href="#engine">ENGINE</a>
          <a href="#force">FOR NATURE</a>
          <Link to="/labs/creator">OPEN GOLD</Link>
        </nav>
      </header>

      <section className="c4-hero">
        <div className="c4-projection" aria-hidden="true">
          <span className="c4-bloom c4-bloom-lime" />
          <span className="c4-bloom c4-bloom-pink" />
          <span className="c4-bloom c4-bloom-blue" />
          <span className="c4-projection-line" />
        </div>
        <div className="c4-hero-orbit" aria-hidden="true">
          <span className="c4-orbit c4-orbit-a" />
          <span className="c4-orbit c4-orbit-b" />
          <span className="c4-core">4</span>
        </div>
        <div className="c4-kicker">INFRASTRUCTURE FOR CREATIVE INDEPENDENCE · V2 LAB</div>
        <h1>Create more.<br/>Operate less.<br/><em>Own your time.</em></h1>
        <div className="c4-hero-bottom">
          <p>One operating layer around creative work — identity, economy, rights, opportunities and admin — designed to return capacity to the person instead of demanding more attention from them.</p>
          <div className="c4-actions">
            <Link className="c4-button c4-button-primary" to="/labs/creator">ENTER CREATOR GOLD <span>↗</span></Link>
            <Link className="c4-button" to="/labs/creator/capacity">HUMAN CAPACITY <span>→</span></Link>
          </div>
        </div>
        <div className="c4-discipline-rail" aria-label="Example creative disciplines">
          {DISCIPLINES.map((discipline) => <span key={discipline}>{discipline}</span>)}
        </div>
      </section>

      <section className="c4-manifesto">
        <div className="c4-section-label">THE THESIS</div>
        <div className="c4-manifesto-copy">
          <p>People are the infrastructure.</p>
          <h2>Human potential is abundant.<br/>Usable time is not.</h2>
          <p className="c4-manifesto-body"><strong>The infrastructure must serve the person first.</strong> Return time. Increase clarity. Protect ownership. Improve economic agency. Only then can recovered capacity be voluntarily directed toward creation, culture, communities and a living planet.</p>
          <div className="c4-manifesto-pull"><b>HUMAN BENEFIT FIRST</b><i>→</i><span>TIME</span><i>→</i><span>SAFETY</span><i>→</i><span>AGENCY</span><i>→</i><span>CHOICE</span></div>
        </div>
      </section>

      <section className="c4-tax" aria-labelledby="time-tax-heading">
        <div className="c4-section-heading">
          <div className="c4-section-label is-pink">01 · THE TIME TAX</div>
          <div><h2 id="time-tax-heading">Creative work is surrounded by operating work.</h2><p>Different disciplines lose time in different places. V2 makes the invisible friction explicit before trying to automate it.</p></div>
        </div>
        <div className="c4-tax-grid">
          <div className="c4-tax-panel">
            <span>MODELLED FOR · {profile.label.toUpperCase()}</span>
            <strong>{recovered.toFixed(1)}<small>h / WEEK RETURNED</small></strong>
            <p>{frictionHours} hours/week of synthetic operating friction in this archetype. At the selected demo effectiveness, roughly {Math.round(recovered * 4.33)} hours/month return to the person.</p>
            <label className="c4-tax-control">
              <span><span>SYSTEM EFFECTIVENESS · DEMO</span><b>{systemEffectiveness}%</b></span>
              <input aria-label="Demo system effectiveness" type="range" min="20" max="85" step="1" value={systemEffectiveness} onChange={(event) => setSystemEffectiveness(Number(event.target.value))} />
            </label>
          </div>
          <div className="c4-friction-grid">
            {FRICTION_META.map((item, index) => {
              const hours = profile.friction[item.key];
              const returned = hours * item.recoverable * (systemEffectiveness / 100);
              const width = Math.min(100, Math.round((hours / 7) * 100));
              const style = { "--friction-width": `${width}%`, "--friction-color": item.accent } as CSSProperties;
              return <article className="c4-friction-card" key={item.key} style={style}><small>{String(index + 1).padStart(2, "0")} · {hours}H / WEEK</small><h3>{item.label}</h3><p>{item.note}</p><b>{returned.toFixed(1)}H MODELLED RETURN</b></article>;
            })}
          </div>
        </div>
      </section>

      <section className="c4-archetypes" id="engine">
        <div className="c4-section-heading">
          <div className="c4-section-label">02 · WHO IS THE SYSTEM FOR?</div>
          <div><h2>One engine. Different creative lives.</h2><p>V2 tests whether the same operating primitives survive across unlike disciplines rather than assuming every creator has the same business.</p></div>
        </div>
        <div className="c4-archetype-tabs" role="tablist" aria-label="Creator archetypes">
          {(Object.keys(CREATORS) as CreatorKey[]).map((key) => <button key={key} type="button" role="tab" aria-selected={creator === key} className={creator === key ? "is-active" : ""} onClick={() => setCreator(key)}>{CREATORS[key].label.toUpperCase()}</button>)}
        </div>
        <div className="c4-archetype-stage">
          <div className="c4-archetype-main" style={{ "--profile-glow": profile.glow } as CSSProperties}>
            <small>{profile.discipline.toUpperCase()}</small>
            <h3>{profile.label}</h3>
            <p>{profile.thesis}</p>
          </div>
          <div className="c4-archetype-meta">
            <div className="c4-meta-row"><small>STRENGTH GRAPH</small><div className="c4-tag-row">{profile.strengths.map((item) => <span key={item}>{item}</span>)}</div></div>
            <div className="c4-meta-row"><small>INTEREST GRAPH</small><div className="c4-tag-row">{profile.interests.map((item) => <span key={item}>{item}</span>)}</div></div>
            <div className="c4-meta-row"><small>RIGHTS FOCUS</small><strong>{profile.rightsFocus}</strong></div>
            <div className="c4-meta-row"><small>ECONOMY PATTERN · HYPOTHESIS</small><strong>{profile.economyPattern}</strong></div>
          </div>
        </div>
      </section>

      <section className="c4-loop-section">
        <div className="c4-section-heading">
          <div className="c4-section-label is-lime">03 · CREATOR INDEPENDENCE LOOP</div>
          <div><h2>The work is one life-system.</h2><p>Portfolio, opportunity, rights, money and time are not separate problems to the person. The engine should preserve distinct truths while presenting one coherent operating loop.</p></div>
        </div>
        <div className="c4-loop-grid">
          {LOOP.map(([index, title, body]) => <article className="c4-loop-node" key={title}><small>{index}</small><h3>{title}</h3><p>{body}</p></article>)}
        </div>
        <div className="c4-loop-spine"><span>TALENT</span><i>→</i><span>WORK</span><i>→</i><span>DEMAND</span><i>→</i><span>RIGHTS</span><i>→</i><span>MONEY</span><i>→</i><span>SECURITY</span><i>→</i><span>TIME</span><i>→</i><span>BETTER WORK</span></div>
      </section>

      <section className="c4-opportunities">
        <div className="c4-section-heading">
          <div className="c4-section-label is-pink">04 · OPPORTUNITY INTELLIGENCE</div>
          <div><h2>Not more jobs.<br/>Better matches.</h2><p>The hypothesis is a small number of opportunities worth attention, with fit, rights and value visible before the creator spends time pursuing them. Every object below is DEMO / CONCEPT.</p></div>
        </div>
        <div className="c4-opportunity-shell">
          <div className="c4-opportunity-list">
            {creatorOpportunities.map((item) => <button key={item.id} type="button" className={activeOpportunity?.id === item.id ? "is-active" : ""} onClick={() => setSelectedOpportunity(item.id)}><div><small>{item.mission}</small><strong>{item.need}</strong></div><b>{item.valueClass}</b></button>)}
          </div>
          {activeOpportunity && <article className="c4-opportunity-detail">
            <small>{activeOpportunity.mission} · DEMO / NOT LIVE</small>
            <h3>{activeOpportunity.need}</h3>
            <div className="c4-fit"><span>DEMO FIT · {activeOpportunity.fit}%</span><div className="c4-fit-meter" style={{ "--fit": `${activeOpportunity.fit}%` } as CSSProperties}><span /></div></div>
            <div className="c4-opportunity-facts">
              <div><small>LOCATION</small><strong>{activeOpportunity.location}</strong></div>
              <div><small>FORMAT</small><strong>{activeOpportunity.format}</strong></div>
              <div><small>RIGHTS</small><strong>{activeOpportunity.rights}</strong></div>
              <div><small>WHY THIS MATCHES</small><strong>{activeOpportunity.why}</strong></div>
            </div>
          </article>}
        </div>
      </section>

      <section className="c4-rights">
        <div className="c4-rights-grid">
          <div className="c4-rights-copy"><div className="c4-section-label">05 · RIGHTS INTELLIGENCE</div><h2>Rights should not be a mystery.</h2><p>Independent work becomes safer when ownership and permission are first-class product states rather than legal text nobody can inspect later.</p></div>
          <div className="c4-rights-table">{RIGHTS.map(([label, body]) => <div className="c4-rights-row" key={label}><b>{label}</b><span>{body}</span></div>)}</div>
          <div className="c4-rights-callout">PAID ≠ LICENSED ≠ CONTRIBUTED. CONTRIBUTED ≠ FREE-FOR-ALL.</div>
        </div>
      </section>

      <section className="c4-economy">
        <div className="c4-section-label is-lime">06 · REALTIME ECONOMY SEAM</div>
        <h2>See the reality.<br/>Not the bookkeeping.</h2>
        <div className="c4-economy-map"><div><small>PRIVATE SOURCES</small><strong>bank · invoices · accounting · contracts</strong></div><i>→</i><div className="is-accent"><small>CREATOR ECONOMY</small><strong>event → state → reconciliation → forecast</strong></div><i>→</i><div><small>HUMAN DECISION</small><strong>say yes · wait · price · protect · take time</strong></div></div>
        <div className="c4-economy-metrics">{ECONOMY_METRICS.map(([title, state, body]) => <article key={title}><small>{state}</small><strong>{title}</strong><p>{body}</p></article>)}</div>
      </section>

      <section className="c4-system">
        <div className="c4-section-heading"><div className="c4-section-label">07 · THE CREATOR ENGINE</div><div><h2>One operating layer.<br/>Six core jobs.</h2></div></div>
        <div className="c4-system-grid">{SYSTEMS.map(([index, title, body]) => <article key={title}><small>{index}</small><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="c4-safety">
        <div className="c4-safety-title"><div className="c4-section-label">08 · SAFETY FLOOR</div><h2>Useful enough to lean on.<br/>Safe enough to leave.</h2></div>
        <div className="c4-safety-list">
          <div><span>01</span><b>YOUR WORK STAYS YOURS</b><p>Ownership and licence state stay explicit.</p></div>
          <div><span>02</span><b>PRIVATE ECONOMY STAYS PRIVATE</b><p>Creator finance is a separate data plane from 4PLANET organisational finance.</p></div>
          <div><span>03</span><b>HUMAN OVERRIDE</b><p>Material automation must be inspectable, correctable and reversible.</p></div>
          <div><span>04</span><b>ZERO DARK PATTERNS</b><p>The goal is less dependence on the product, not more screen time.</p></div>
          <div><span>05</span><b>MINIMUM DATA</b><p>Unknown is allowed. Useful software should not require total surveillance of a life.</p></div>
        </div>
      </section>

      <section className="c4-force" id="force">
        <div className="c4-force-head"><div className="c4-section-label">09 · CREATIVES AS A FORCE FOR NATURE</div><h2>Your abilities can meet<br/>real planetary needs.</h2><p>4PLANET can become the first differentiated demand layer: mission-linked creative work with explicit value, rights and choice. The examples below are prototype fixtures only.</p></div>
        <div className="c4-force-grid">{FORCE.map(([mission, need, valueClass]) => <article key={mission}><div><span>{mission}</span><b>{valueClass}</b></div><h3>{need}</h3><p>DEMO NEED · NOT A LIVE OPPORTUNITY</p></article>)}</div>
        <div className="c4-force-loop"><span>TALENT</span><i>→</i><span>VALUES</span><i>→</i><span>QUALIFIED NEED</span><i>→</i><span>FAIR VALUE</span><i>→</i><span>CREATE</span><i>→</i><span>PEOPLE + PLANET</span></div>
      </section>

      <section className="c4-culture">
        <div className="c4-culture-grid"><div className="c4-culture-copy"><div className="c4-section-label is-pink">10 · 4CULTURE × SONIC</div><h2>Culture is not decoration.<br/>It is capacity.</h2><p>Artists, filmmakers, musicians, writers and photographers already operate across rights, projects, money and distribution. 4CULTURE and SONIC are natural first seams where Creator Engine primitives can become useful inside real 4PLANET work.</p></div><div className="c4-culture-rail">{CULTURE.map(([title, subtitle, body]) => <article key={title}><small>{subtitle.toUpperCase()}</small><h3>{title}</h3><p>{body}</p></article>)}</div></div>
      </section>

      <section className="c4-proof">
        <div className="c4-section-heading"><div className="c4-section-label">11 · PROOF BEFORE SCALE</div><div><h2>Beautiful is not evidence.</h2><p>V2 remains a LABS instrument. Scale requires observed friction, real creator value and one complete rights-safe economic loop.</p></div></div>
        <div className="c4-proof-grid">
          <article><small>NOW</small><strong>DEMO SYSTEM</strong><p>Architecture, interactions and mental model. No live creator economy or opportunity feed.</p></article>
          <article><small>NEXT</small><strong>2 UNLIKE CREATORS</strong><p>Observe real time loss, decisions, missing controls and what transfers across disciplines.</p></article>
          <article><small>SCALE GATE</small><strong>1 COMPLETE LOOP</strong><p>Real need → rights → value → payment → admin control → measured human benefit.</p></article>
        </div>
      </section>

      <section className="c4-closing">
        <div className="c4-section-label is-pink">THE NORTH STAR</div><h2>More of your life<br/>belongs to you.</h2><div className="c4-northstar"><span>TIME RETURNED</span><i>×</i><span>SAFETY + AGENCY</span><i>×</i><span>MEANINGFUL OPPORTUNITY</span></div><div className="c4-closing-actions"><Link className="c4-button c4-button-primary" to="/labs/creator">OPEN CREATOR GOLD <span>↗</span></Link><Link className="c4-button c4-button-pink" to="/labs/creator/capacity">PEOPLE ARE THE INFRASTRUCTURE <span>→</span></Link></div>
      </section>

      <footer className="c4-footer"><Link className="c4-wordmark" to="/cre4tors">CRE4TORS<span>_</span></Link><p>EARLY-STAGE 4PLANET LAB · V2 · DEMO / NOT LIVE</p><a href="https://4planet.org" target="_blank" rel="noopener noreferrer">A 4PLANET EXPERIMENT ↗</a></footer>
    </main>
  );
}
