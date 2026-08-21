import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import "@/styles/creator-engine-lab.css";

type CreatorKind = "artist" | "photographer";
type ViewKey = "overview" | "economy" | "opportunities" | "autopilot" | "independence" | "system";

type CreatorProfile = {
  id: CreatorKind;
  label: string;
  discipline: string;
  subtitle: string;
  income: number;
  need: number;
  cash: number;
  reserve: number;
  recurring: number;
  concentration: number;
  costs: number;
  strengths: string[];
  interests: string[];
};

type Opportunity = {
  id: string;
  creator: CreatorKind | "both";
  title: string;
  source: string;
  type: string;
  fit: number;
  value: string;
  why: string[];
  rights: string;
  status: string;
};

const PROFILES: Record<CreatorKind, CreatorProfile> = {
  artist: {
    id: "artist",
    label: "Visual Artist",
    discipline: "Art · illustration · editions",
    subtitle: "Build a stable creative income without turning the studio into an admin department.",
    income: 24000,
    need: 31000,
    cash: 90000,
    reserve: 18000,
    recurring: 28,
    concentration: 38,
    costs: 6500,
    strengths: ["Illustration", "Editions", "Colour", "Narrative"],
    interests: ["Species", "Oceans", "Food", "Living systems"],
  },
  photographer: {
    id: "photographer",
    label: "Photographer",
    discipline: "Photography · field work · licensing",
    subtitle: "Turn episodic assignments and archive value into a more predictable independent practice.",
    income: 18000,
    need: 30000,
    cash: 110000,
    reserve: 12000,
    recurring: 14,
    concentration: 55,
    costs: 8500,
    strengths: ["Wildlife", "Editorial", "Field work", "Licensing"],
    interests: ["Whales", "Species", "Places", "Culture"],
  },
};

const OPPORTUNITIES: Opportunity[] = [
  {
    id: "whales-field",
    creator: "photographer",
    title: "WH4LES_ field assignment",
    source: "4PLANET DEMO BRIEF",
    type: "Commission",
    fit: 94,
    value: "NOK 28–45k · demo range",
    why: ["Wildlife portfolio", "Marine interest", "Field-ready", "Editorial rights fit"],
    rights: "Limited editorial/web licence · creator retains ownership",
    status: "DEMO / NO REAL JOB",
  },
  {
    id: "species-license",
    creator: "photographer",
    title: "SPECIES_ archive licensing need",
    source: "4PLANET DEMO NEED",
    type: "Licence",
    fit: 88,
    value: "NOK 4–12k · demo range",
    why: ["Existing archive can earn again", "No travel required", "Species subject match"],
    rights: "Non-exclusive web/editorial use · exact scope required",
    status: "DEMO / NO RIGHTS REQUEST",
  },
  {
    id: "atlas-place",
    creator: "photographer",
    title: "ATLAS · Hear/See This Place contributor",
    source: "LABS CONCEPT",
    type: "Contribution + licence",
    fit: 82,
    value: "Fee model not defined",
    why: ["Place-based field skill", "Potential repeat assignments", "Connects image + location + source"],
    rights: "Future permission contract required",
    status: "CONCEPT ONLY",
  },
  {
    id: "4rt-edition",
    creator: "artist",
    title: "4RT_ limited living-planet edition",
    source: "4PLANET DEMO BRIEF",
    type: "Edition",
    fit: 96,
    value: "Revenue share · demo only",
    why: ["Edition-ready work", "Species interest", "Strong visual narrative", "Direct audience value"],
    rights: "Creator-owned work · edition terms separate",
    status: "DEMO / NO SALE",
  },
  {
    id: "food-illustration",
    creator: "artist",
    title: "FOOD_ systems illustration",
    source: "LABS CONCEPT",
    type: "Commission",
    fit: 87,
    value: "NOK 18–30k · demo range",
    why: ["Systems storytelling", "Illustration skill", "Food interest", "Reusable editorial asset"],
    rights: "Commission licence · ownership/derivatives explicit",
    status: "DEMO / NO REAL COMMISSION",
  },
  {
    id: "sonic-cover",
    creator: "artist",
    title: "SONIC_ listening-world artwork",
    source: "SYS-SONIC-01 CONCEPT",
    type: "Collaboration",
    fit: 84,
    value: "Fee / edition / distribution model open",
    why: ["Culture × nature fit", "Potential artist attribution", "Crosses 4PLAY + SPECIES"],
    rights: "Artwork permission separate from music/audio rights",
    status: "CONCEPT ONLY",
  },
];

const AUTOPILOT = [
  { id: "reserve", label: "Tax / VAT reserve checked", meta: "Demo control · not tax advice" },
  { id: "invoice", label: "Follow up overdue invoice #018", meta: "NOK 7,800 · demo receivable" },
  { id: "rights", label: "Rights status complete for portfolio", meta: "6 works still need ownership / licence notes" },
  { id: "safety", label: "Review sickness / insurance safety gap", meta: "External provider / professional route later" },
  { id: "recurring", label: "Create one recurring-revenue offer", meta: "Aim: reduce dependence on one-off work" },
];

const NAV: Array<{ id: ViewKey; label: string }> = [
  { id: "overview", label: "ME" },
  { id: "economy", label: "MY ECONOMY" },
  { id: "opportunities", label: "OPPORTUNITIES" },
  { id: "autopilot", label: "AUTOPILOT" },
  { id: "independence", label: "INDEPENDENCE" },
  { id: "system", label: "SYSTEM" },
];

const nok = (value: number) => `NOK ${Math.round(value).toLocaleString("nb-NO")}`;

export default function CreatorEngineLab() {
  const [creator, setCreator] = useState<CreatorKind>("artist");
  const [view, setView] = useState<ViewKey>("overview");
  const [income, setIncome] = useState(PROFILES.artist.income);
  const [target, setTarget] = useState(PROFILES.artist.need);
  const [done, setDone] = useState<string[]>(["reserve"]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);

  const profile = PROFILES[creator];

  useEffect(() => {
    setIncome(PROFILES[creator].income);
    setTarget(PROFILES[creator].need);
    setSelectedOpportunity(null);
  }, [creator]);

  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const previous = robots?.content;
    let targetMeta = robots;
    let created = false;
    if (!targetMeta) {
      targetMeta = document.createElement("meta");
      targetMeta.name = "robots";
      document.head.appendChild(targetMeta);
      created = true;
    }
    targetMeta.content = "noindex,nofollow";
    return () => {
      if (created) targetMeta?.remove();
      else if (targetMeta && previous != null) targetMeta.content = previous;
    };
  }, []);

  const model = useMemo(() => {
    const gap = Math.max(target - income, 0);
    const netBurn = Math.max(target + profile.costs - income, 1000);
    const runway = profile.cash / netBurn;
    const independencePct = Math.min(100, Math.round((income / Math.max(target, 1)) * 100));
    const monthsAtDemoGrowth = gap === 0 ? 0 : Math.ceil(gap / 2500);
    const availableAfterReserve = Math.max(profile.cash - profile.reserve, 0);
    return { gap, runway, independencePct, monthsAtDemoGrowth, availableAfterReserve };
  }, [income, target, profile]);

  const opportunities = OPPORTUNITIES.filter((item) => item.creator === creator || item.creator === "both");
  const selected = opportunities.find((item) => item.id === selectedOpportunity) ?? null;
  const autopilotPct = Math.round((done.length / AUTOPILOT.length) * 100);

  const toggleTask = (id: string) => {
    setDone((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <PublicShell>
      <main className="ce-lab">
        <section className="ce-hero">
          <div className="ce-eyebrow">4PLANET LABS · EARLY STAGE · CREATOR ENGINE v0.1</div>
          <h1>Build a safer creative life.</h1>
          <p>Infrastructure for creative independence — a working experiment connecting talent, rights, opportunity, money and the admin around independent work.</p>
          <div className="ce-truthbar">
            <strong>DEMO / NOT LIVE</strong>
            <span>No bank, accounting, tax, insurance or real opportunity data is connected. No livelihood outcome is promised.</span>
          </div>
          <div className="ce-hero-links">
            <Link to="/labs">ALL LABS</Link>
            <Link to="/labs/living-world">LIVING WORLD LAB</Link>
            <Link to="/">4PLANET</Link>
          </div>
        </section>

        <section className="ce-app-shell">
          <aside className="ce-sidebar">
            <div className="ce-brand-block">
              <span>CREATOR GOLD</span>
              <strong>INDEPENDENCE LOOP</strong>
            </div>

            <div className="ce-profile-switch" role="group" aria-label="Demo creator archetype">
              {(Object.keys(PROFILES) as CreatorKind[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={creator === key ? "is-active" : ""}
                  onClick={() => setCreator(key)}
                >
                  <span>{PROFILES[key].label}</span>
                  <small>{PROFILES[key].discipline}</small>
                </button>
              ))}
            </div>

            <nav className="ce-nav" aria-label="Creator Engine prototype views">
              {NAV.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={view === item.id ? "is-active" : ""}
                  onClick={() => setView(item.id)}
                >
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="ce-side-status">
              <span>PROTOTYPE STATE</span>
              <strong>EARLY STAGE</strong>
              <small>Local demo state only · no account</small>
            </div>
          </aside>

          <div className="ce-workspace">
            {view === "overview" && (
              <section className="ce-view" aria-labelledby="ce-overview-title">
                <div className="ce-view-head">
                  <div><span>01 · ME</span><h2 id="ce-overview-title">{profile.label}</h2></div>
                  <p>{profile.subtitle}</p>
                </div>

                <div className="ce-identity-grid">
                  <article className="ce-card ce-card-dark">
                    <span>DISCIPLINE</span>
                    <h3>{profile.discipline}</h3>
                    <div className="ce-tags">{profile.strengths.map((item) => <b key={item}>{item}</b>)}</div>
                  </article>
                  <article className="ce-card">
                    <span>INTEREST GRAPH</span>
                    <h3>Work you would actually want to do.</h3>
                    <div className="ce-tags ce-tags-light">{profile.interests.map((item) => <b key={item}>{item}</b>)}</div>
                  </article>
                  <article className="ce-card ce-card-accent">
                    <span>FREEDOM NUMBER</span>
                    <h3>{nok(target)}<small>/ month</small></h3>
                    <p>The demo threshold where creative income covers the selected monthly need. Not a financial recommendation.</p>
                  </article>
                </div>

                <div className="ce-loop">
                  {["TALENT", "WORK", "DEMAND", "RIGHTS", "MONEY", "SECURITY", "TIME"].map((item, index) => (
                    <div key={item}><small>{String(index + 1).padStart(2, "0")}</small><strong>{item}</strong></div>
                  ))}
                </div>
              </section>
            )}

            {view === "economy" && (
              <section className="ce-view" aria-labelledby="ce-economy-title">
                <div className="ce-view-head">
                  <div><span>02 · MY ECONOMY</span><h2 id="ce-economy-title">See the reality. Not the bookkeeping.</h2></div>
                  <p>Event-driven decision intelligence is the hypothesis. The source ledger stays somewhere appropriate; this layer translates it into choices.</p>
                </div>

                <div className="ce-control-grid">
                  <label>
                    <span>DEMO CREATIVE INCOME</span>
                    <strong>{nok(income)}</strong>
                    <input type="range" min="5000" max="60000" step="1000" value={income} onChange={(event) => setIncome(Number(event.target.value))} />
                  </label>
                  <label>
                    <span>MONTHLY FREEDOM NUMBER</span>
                    <strong>{nok(target)}</strong>
                    <input type="range" min="18000" max="50000" step="1000" value={target} onChange={(event) => setTarget(Number(event.target.value))} />
                  </label>
                </div>

                <div className="ce-metrics">
                  <article><span>CREATIVE INCOME COVERAGE</span><strong>{model.independencePct}%</strong><small>of selected freedom number</small></article>
                  <article><span>DEMO RUNWAY</span><strong>{model.runway.toFixed(1)} mo</strong><small>cash ÷ modelled net burn</small></article>
                  <article><span>RESERVED</span><strong>{nok(profile.reserve)}</strong><small>synthetic tax / VAT reserve</small></article>
                  <article><span>AVAILABLE AFTER RESERVE</span><strong>{nok(model.availableAfterReserve)}</strong><small>synthetic cash state</small></article>
                  <article><span>RECURRING REVENUE</span><strong>{profile.recurring}%</strong><small>demo share</small></article>
                  <article><span>LARGEST CLIENT</span><strong>{profile.concentration}%</strong><small>{profile.concentration >= 50 ? "concentration risk" : "watch concentration"}</small></article>
                </div>

                <div className="ce-event-flow">
                  <span>SALE / INVOICE</span><i>→</i><span>PAYMENT</span><i>→</i><span>RESERVE</span><i>→</i><span>CASH</span><i>→</i><span>RUNWAY</span><i>→</i><span>DECISION</span>
                </div>
              </section>
            )}

            {view === "opportunities" && (
              <section className="ce-view" aria-labelledby="ce-opportunities-title">
                <div className="ce-view-head">
                  <div><span>03 · OPPORTUNITIES</span><h2 id="ce-opportunities-title">Demand, not another creator directory.</h2></div>
                  <p>Match skill + work + interests + rights + location + economic value to a real need. Every object below is synthetic until explicitly proven otherwise.</p>
                </div>

                <div className="ce-opportunity-layout">
                  <div className="ce-opportunity-list">
                    {opportunities.map((item) => (
                      <button key={item.id} type="button" onClick={() => setSelectedOpportunity(item.id)} className={selectedOpportunity === item.id ? "is-active" : ""}>
                        <div><span>{item.type}</span><small>{item.source}</small></div>
                        <h3>{item.title}</h3>
                        <div className="ce-opportunity-bottom"><strong>{item.fit}% FIT</strong><b>{item.value}</b></div>
                      </button>
                    ))}
                  </div>
                  <aside className="ce-opportunity-detail">
                    {selected ? (
                      <>
                        <span>{selected.status}</span>
                        <h3>{selected.title}</h3>
                        <p className="ce-detail-value">{selected.value}</p>
                        <h4>WHY THIS MATCHES</h4>
                        <ul>{selected.why.map((item) => <li key={item}>{item}</li>)}</ul>
                        <h4>RIGHTS BOUNDARY</h4>
                        <p>{selected.rights}</p>
                      </>
                    ) : (
                      <>
                        <span>SELECT A DEMO OPPORTUNITY</span>
                        <h3>Opportunity Intelligence</h3>
                        <p>The product should explain why something fits, what value it could create, and what rights/constraints are involved — not just show another jobs feed.</p>
                      </>
                    )}
                  </aside>
                </div>
              </section>
            )}

            {view === "autopilot" && (
              <section className="ce-view" aria-labelledby="ce-autopilot-title">
                <div className="ce-view-head">
                  <div><span>04 · BUSINESS AUTOPILOT</span><h2 id="ce-autopilot-title">Keep the business safe by exception.</h2></div>
                  <p>The creator should not need to become an accountant, lawyer and operations manager. The system should surface only what needs attention.</p>
                </div>

                <div className="ce-autopilot-score">
                  <div><strong>{autopilotPct}%</strong><span>DEMO CONTROL COMPLETE</span></div>
                  <div className="ce-progress"><i style={{ width: `${autopilotPct}%` }} /></div>
                </div>

                <div className="ce-task-list">
                  {AUTOPILOT.map((task) => {
                    const checked = done.includes(task.id);
                    return (
                      <label key={task.id} className={checked ? "is-done" : ""}>
                        <input type="checkbox" checked={checked} onChange={() => toggleTask(task.id)} />
                        <span><strong>{task.label}</strong><small>{task.meta}</small></span>
                        <b>{checked ? "DONE" : "ATTENTION"}</b>
                      </label>
                    );
                  })}
                </div>
              </section>
            )}

            {view === "independence" && (
              <section className="ce-view" aria-labelledby="ce-independence-title">
                <div className="ce-view-head">
                  <div><span>05 · PATH TO INDEPENDENCE</span><h2 id="ce-independence-title">Turn uncertainty into a visible gap.</h2></div>
                  <p>This is a transparent demo model, not a forecast. It shows the type of decision support we want to test.</p>
                </div>

                <div className="ce-independence-grid">
                  <article className="ce-independence-main">
                    <span>CREATIVE INCOME COVERS</span>
                    <strong>{model.independencePct}%</strong>
                    <div className="ce-progress ce-progress-light"><i style={{ width: `${model.independencePct}%` }} /></div>
                    <p>{model.gap === 0 ? "The selected creative-income level meets the current demo freedom number." : `${nok(model.gap)} monthly gap remains in this scenario.`}</p>
                  </article>
                  <article>
                    <span>DEMO TRAJECTORY</span>
                    <strong>{model.monthsAtDemoGrowth === 0 ? "NOW" : `~${model.monthsAtDemoGrowth} MO`}</strong>
                    <p>Illustration only: assumes +NOK 2,500 monthly creative-income improvement per month until the gap closes.</p>
                  </article>
                </div>

                <div className="ce-levers">
                  <h3>Candidate levers</h3>
                  <div>
                    <article><span>01</span><strong>Recurring clients</strong><p>Increase predictable baseline before adding more one-off volume.</p></article>
                    <article><span>02</span><strong>Licensing</strong><p>Let existing work earn again without redoing the creative work.</p></article>
                    <article><span>03</span><strong>Products / editions</strong><p>Turn selected work into repeatable offers where economics make sense.</p></article>
                    <article><span>04</span><strong>Admin automation</strong><p>Reduce non-creative hours and missed obligations rather than only chasing more revenue.</p></article>
                  </div>
                </div>
              </section>
            )}

            {view === "system" && (
              <section className="ce-view" aria-labelledby="ce-system-title">
                <div className="ce-view-head">
                  <div><span>06 · SYSTEM</span><h2 id="ce-system-title">Why this belongs inside 4PLANET LABS.</h2></div>
                  <p>A bounded bridge across PEOPLE, 4CULTURE, ECONOMY and Incentive Design. It must earn the right to scale.</p>
                </div>

                <div className="ce-system-map">
                  <div className="ce-system-center"><span>CREATOR ENGINE</span><strong>CREATIVE INDEPENDENCE</strong></div>
                  <article><span>PEOPLE</span><strong>Distributed human capacity</strong><p>More people can contribute talent without default employment.</p></article>
                  <article><span>4CULTURE</span><strong>Demand + distribution</strong><p>Art, photography, film, music, design and editorial work become operational assets.</p></article>
                  <article><span>ECONOMY</span><strong>Decision intelligence</strong><p>Reuse methods, never private financial data. Separate creator data plane.</p></article>
                  <article><span>INCENTIVE DESIGN</span><strong>Mutual value</strong><p>Creator gets income, agency and meaningful work; 4PLANET gets capacity and culture.</p></article>
                </div>

                <div className="ce-gate">
                  <span>THE SCALE GATE</span>
                  <h3>One real complete loop before a marketplace.</h3>
                  <p>TALENT → OPPORTUNITY / SALE → RIGHTS → PAYMENT → ADMIN CONTROL → SAFER DECISION → MORE CREATIVE TIME. If that does not produce differentiated value, hold or kill the expansion.</p>
                </div>
              </section>
            )}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
