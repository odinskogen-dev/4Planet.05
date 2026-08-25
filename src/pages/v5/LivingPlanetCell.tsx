import { Link, Navigate, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import {
  BERGEN_GRAPH,
  BERGEN_MOBILITY_CHOICE,
  CAPITAL_DOGFOOD,
  DECISION_OBJECTS,
  FOLLOW_BERGEN_ITEMS,
  GET_INVOLVED_ACTIONS,
  LIVING_PLANET_SOURCES,
  RESEARCH_OBJECTS,
  researchById,
} from "@/content/livingPlanetCell";
import { GLOBAL_RESEARCH_FEED_ITEM, GLOBAL_RESEARCH_GOLD, RESEARCH_GOLD_SOURCES } from "@/content/researchGold";
import "@/styles/living-planet-cell.css";

const ALL_SOURCES = [...LIVING_PLANET_SOURCES, ...RESEARCH_GOLD_SOURCES];
const ALL_RESEARCH = [GLOBAL_RESEARCH_GOLD, ...RESEARCH_OBJECTS];
const sourceById = (id: string) => ALL_SOURCES.find((source) => source.id === id);

function LPNav() {
  return <nav className="lp-nav" aria-label="Living Planet navigation"><Link className="lp-brand" to="/">4PLANET_</Link><div><Link to="/places/bergen">BERGEN</Link><Link to="/research">RESEARCH</Link><Link to="/actors">ACTORS</Link><Link to="/get-involved">GET INVOLVED</Link></div></nav>;
}

function SourceLinks({ ids }: { ids: readonly string[] }) {
  const sources = ids.map(sourceById).filter(Boolean);
  if (!sources.length) return <span className="lp-source-empty">INTERNAL / NO PUBLIC SOURCE YET</span>;
  return <div className="lp-source-links">{sources.map((source) => <a key={source!.id} href={source!.url} target="_blank" rel="noreferrer"><span>{source!.publisher}</span>{source!.title}</a>)}</div>;
}

function QuestionBlock({ code, question, children }: { code: string; question: string; children: React.ReactNode }) {
  return <section className="lp-question"><header><span>{code}</span><h2>{question}</h2></header><div className="lp-question-body">{children}</div></section>;
}

function findResearch(id?: string) {
  if (id?.toLowerCase() === GLOBAL_RESEARCH_GOLD.id.toLowerCase()) return GLOBAL_RESEARCH_GOLD;
  return researchById(id);
}

function researchFunderText(item: any) {
  return item.funders.map((funder: any) => typeof funder === "string" ? funder : `${funder.name}${funder.programme ? ` · ${funder.programme} ${funder.projectNumber ?? ""}` : ""}`).join(" · ");
}

function researchPlaceText(item: any) {
  if (item.places) return item.places.map((place: any) => place.label).join(" · ");
  return item.placeIds.map((place: string) => place.replace("PLACE-", "")).join(" · ");
}

export function BergenPlaceGold() {
  const decision = DECISION_OBJECTS[0];
  const publicNodes = BERGEN_GRAPH.nodes.filter((node) => node.visibility === "PUBLIC_SAFE");
  return <main className="lp-shell">
    <Seo title="Bergen — Living Planet Place Gold | 4PLANET" description="A bounded living-planet intelligence cell connecting place, research, public decisions, actors, choices and action." path="/places/bergen" robots="noindex,follow" />
    <LPNav />
    <header className="lp-hero lp-hero-bergen"><div className="lp-eyebrow"><span>PLACE GOLD 01</span><span>DNA CELL</span><span>BERGEN_</span></div><h1>Understand a place.<br />Choose what happens next.</h1><p>Bergen is the first bounded proof of a living-planet intelligence, decision and coordination system.</p><div className="lp-loop" aria-label="Living Planet loop">{["SENSE", "UNDERSTAND", "CHOOSE", "COORDINATE", "ACT", "LEARN"].map((item, i) => <div key={item}><span>0{i + 1}</span><b>{item}</b></div>)}</div></header>

    <div className="lp-status-strip"><span>LIVE SOURCE WINDOW</span><b>KPA 2027 consultation</b><span>22 AUG → 06 OCT 2026</span><span>{publicNodes.length} source-backed public nodes in this cell</span></div>

    <QuestionBlock code="01" question="WHAT’S HAPPENING?">
      <div className="lp-lead-card"><div><p>LAND / MOBILITY / CLIMATE</p><h3>Bergen is deciding the rules that shape future land use.</h3><span>The proposed KPA 2027 provisions are on public consultation. Parking, climate-gas provisions and other planning choices are part of the evidence and consultation set.</span><div style={{ marginTop: 24 }}><Link to="/atlas?place=bergen&entity=DEC-BGO-KPA-2027" className="lp-atlas-link">OPEN BERGEN IN ATLAS →</Link></div></div><SourceLinks ids={["SRC-BGO-KPA-2027"]} /></div>
      <div className="lp-metric-grid"><article><span>STATUS</span><strong>CONSULTATION OPEN</strong><p>Not the final plan.</p></article><article><span>DECISION ACTOR</span><strong>Bergen kommune</strong><p>Canonical Actor P17-A1798.</p></article><article><span>COMMENT DEADLINE</span><strong>06 OCT 2026</strong><p>According to the official consultation page.</p></article></div>
    </QuestionBlock>

    <QuestionBlock code="02" question="WHAT DOES SCIENCE SAY?">
      <div className="lp-card-grid">{ALL_RESEARCH.map((item: any) => <Link className="lp-card" key={item.id} to={`/research/${item.id.toLowerCase()}`}><span>{item.type.replaceAll("_", " ")} · {item.status}</span><h3>{item.title}</h3><p>{item.humanFinding}</p><b>WHAT WE KNOW →</b></Link>)}</div>
      <div className="lp-truth-note"><strong>TRUTH BY DESIGN</strong><p>Published findings are explained with their limitations. Ongoing research such as Pro-Climate is shown as ongoing — 4PLANET does not manufacture results that the source has not published.</p></div>
    </QuestionBlock>

    <QuestionBlock code="03" question="WHY DOES IT MATTER?">
      <div className="lp-two"><article><span>FOR PEOPLE</span><h3>Planning and pollution both become everyday decisions.</h3><p>Accessibility, travel choices, time, cost, neighbourhood quality and environmental exposure can all matter. The right choice is not identical for every person or district.</p></article><article><span>FOR THE LIVING PLANET</span><h3>Land, mobility and persistent pollution cross system boundaries.</h3><p>The DNA cell connects human choices to environmental evidence instead of treating health, infrastructure, nature and climate as separate worlds.</p></article></div>
    </QuestionBlock>

    <QuestionBlock code="04" question="WHO IS INVOLVED?">
      <div className="lp-actor-row"><Link to="/actors/bergen-kommune"><span>PUBLIC ACTOR</span><h3>Bergen kommune</h3><p>Decision / consultation authority</p></Link><Link to="/actors/institute-of-marine-research"><span>RESEARCH ACTOR</span><h3>Institute of Marine Research</h3><p>Canonical research institution P17-A296</p></Link><Link to="/actors"><span>ACTOR INTELLIGENCE</span><h3>Explore the graph</h3><p>Monitoring · implementation · research · government · capital</p></Link></div>
    </QuestionBlock>

    <QuestionBlock code="05" question="WHAT IS BEING DECIDED?">
      <article className="lp-decision" id="decision"><div className="lp-decision-head"><span>{decision.state.replaceAll("_", " ")}</span><span>{decision.openedAt} → {decision.closesAt}</span></div><h3>{decision.title}</h3><p>{decision.summary}</p><div className="lp-decision-boundary"><strong>WHAT THIS DOES NOT MEAN</strong><span>{decision.whatIsActuallyBeingDecided}</span></div><SourceLinks ids={decision.sourceIds} /></article>
    </QuestionBlock>

    <QuestionBlock code="06" question="WHAT ARE OUR CHOICES?">
      <div className="lp-choice-preview"><div><span>BETTER CHOICES ENGINE 01</span><h3>{BERGEN_MOBILITY_CHOICE.question}</h3><p>{BERGEN_MOBILITY_CHOICE.context}</p></div><Link to="/choices/bergen-mobility">COMPARE OPTIONS →</Link></div>
    </QuestionBlock>

    <QuestionBlock code="07" question="WHAT CAN I DO?">
      <div className="lp-actions">{GET_INVOLVED_ACTIONS.filter((action) => action.context === "BERGEN").map((action) => action.state === "OPEN" ? (action.href.startsWith("http") ? <a key={action.id} href={action.href} target="_blank" rel="noreferrer"><span>{action.verb}</span><b>{action.label}</b><p>{action.truthNote}</p></a> : <Link key={action.id} to={action.href}><span>{action.verb}</span><b>{action.label}</b><p>{action.truthNote}</p></Link>) : <div className="lp-action-locked" key={action.id}><span>{action.verb}</span><b>{action.label}</b><p>{action.truthNote}</p></div>)}</div>
    </QuestionBlock>

    <section className="lp-follow-cta"><span>FOLLOW BERGEN</span><h2>One place. Research, decisions, signals and action.</h2><p>A minimal personalised living-planet feed — not a general news feed.</p><Link to="/follow/bergen">OPEN FOLLOW BERGEN →</Link></section>
  </main>;
}

export function NorwayCountryGold() {
  return <main className="lp-shell lp-country"><Seo title="Norway — Country Gold | 4PLANET" description="Country-level roll-up of place, evidence, actors, decisions and action." path="/places/norway" robots="noindex,follow" /><LPNav /><header className="lp-hero"><div className="lp-eyebrow"><span>COUNTRY GOLD 01</span><span>NORWAY_</span></div><h1>A country is a system of places, evidence and choices.</h1><p>Norway Gold proves the roll-up architecture. It does not duplicate Bergen: it summarises compatible place cells and preserves their source lineage.</p></header><section className="lp-country-map"><div className="lp-country-node"><span>NORWAY_</span><strong>COUNTRY</strong></div><div className="lp-country-line" /><Link className="lp-country-node active" to="/places/bergen"><span>BERGEN_</span><strong>PLACE GOLD 01</strong><p>Research + public decision + choice + action</p></Link><div className="lp-country-node muted"><span>NEXT PLACE</span><strong>NOT BUILT</strong><p>Scale is earned, not simulated.</p></div></section><section className="lp-rollup"><h2>The roll-up contract</h2><div className="lp-card-grid"><article className="lp-card"><span>NO DUPLICATION</span><h3>Place facts remain in the place cell.</h3><p>Country views reference canonical IDs and source lineage.</p></article><article className="lp-card"><span>COMPARABILITY</span><h3>Shared object grammar.</h3><p>Problems, Research, Actors, Decisions and Results stay typed across places.</p></article><article className="lp-card"><span>PROGRESSIVE SCALE</span><h3>One good cell before fifty empty ones.</h3><p>Only add a new place when it proves useful local intelligence or coordination.</p></article></div></section></main>;
}

export function ResearchIndex() {
  return <main className="lp-shell"><Seo title="Research Intelligence — 4PLANET" description="Global Research Intelligence translated into living-planet relevance and human explanation." path="/research" robots="noindex,follow" /><LPNav /><header className="lp-hero lp-research-hero"><div className="lp-eyebrow"><span>GLOBAL RESEARCH INTELLIGENCE</span></div><h1>Research is useful when people can understand what it actually says.</h1><p>Source → finding or scope → limitation → place → problem → actors → decisions. Funding is context, never an automatic accusation.</p></header><section className="lp-research-list">{ALL_RESEARCH.map((item: any) => <Link key={item.id} to={`/research/${item.id.toLowerCase()}`}><span>{item.status}</span><h2>{item.title}</h2><p>{item.whyItMatters}</p><b>OPEN HUMAN EXPLANATION →</b></Link>)}</section></main>;
}

export function ResearchDetail() {
  const { id } = useParams(); const item: any = findResearch(id); if (!item) return <Navigate to="/research" replace />;
  return <main className="lp-shell"><Seo title={`${item.title} — Research | 4PLANET`} description={item.whyItMatters} path={`/research/${item.id.toLowerCase()}`} robots="noindex,follow" /><LPNav /><header className="lp-hero lp-research-detail"><div className="lp-eyebrow"><span>RESEARCH OBJECT</span><span>{item.status}</span>{item.doi ? <span>DOI {item.doi}</span> : null}</div><h1>{item.title}</h1><p>Research Intelligence does not replace the source. It makes scope, meaning, provenance and uncertainty legible.</p></header><div className="lp-research-questions"><article><span>01</span><h2>What did they find?</h2><p>{item.humanFinding}</p></article><article><span>02</span><h2>Why does it matter?</h2><p>{item.whyItMatters}</p></article><article><span>03</span><h2>How sure are we?</h2><p>{item.confidence}</p></article><article><span>04</span><h2>What didn’t they prove?</h2><p>{item.didNotProve}</p></article><article><span>05</span><h2>Who did the research?</h2><p>{item.researchers.length ? item.researchers.map((person: any) => `${person.name}${person.canonicalState === "UNRESOLVED" ? " · author identity not yet resolved to P17" : ""}`).join(" · ") : "No individual researchers asserted in this evidence object."}</p><p>{item.institutions.map((org: any) => `${org.name}${org.actorId ? ` · ${org.actorId}` : ""}`).join(" · ")}</p></article><article><span>06</span><h2>Who funded it?</h2><p>{researchFunderText(item)}</p></article><article><span>07</span><h2>Where does it matter?</h2><p>{researchPlaceText(item)}</p></article><article><span>08</span><h2>What could change because of it?</h2><p>{item.potentialDecisionRelevance ?? "Research can inform choices and decisions. 4PLANET does not claim a policy effect unless a specific Decision object cites or uses the evidence."}</p></article></div>{item.truthBoundary ? <section className="lp-truth-note"><strong>FUNDING / PROVENANCE</strong><p>{item.truthBoundary}</p></section> : null}<section className="lp-source-panel"><p>SOURCES</p><SourceLinks ids={item.sourceIds} /></section></main>;
}

export function GetInvolvedGold() {
  const verbs = ["FOLLOW", "LEARN", "CHOOSE", "CONTRIBUTE", "JOIN", "VOLUNTEER", "PARTICIPATE", "SUPPORT", "FUND", "WORK", "RESEARCH", "PARTNER", "BUILD"];
  return <main className="lp-shell"><Seo title="Get Involved — 4PLANET" description="Context-aware ways to follow, learn, choose, participate, support, research, partner and build." path="/get-involved" robots="noindex,follow" /><LPNav /><header className="lp-hero lp-involved-hero"><div className="lp-eyebrow"><span>GET INVOLVED</span><span>4PLANET IS 4EVERYONE</span></div><h1>There is more than one way to help a living planet.</h1><p>Actions come from context. Open means a real route exists. Locked means the idea is useful but authority, delivery or workflow is not ready.</p></header><section className="lp-verb-rail">{verbs.map((verb) => <span key={verb}>{verb}</span>)}</section><section className="lp-actions lp-actions-global">{GET_INVOLVED_ACTIONS.map((action) => action.state === "OPEN" ? (action.href.startsWith("http") ? <a key={action.id} href={action.href} target="_blank" rel="noreferrer"><span>{action.context} · {action.verb}</span><b>{action.label}</b><p>{action.truthNote}</p></a> : <Link key={action.id} to={action.href}><span>{action.context} · {action.verb}</span><b>{action.label}</b><p>{action.truthNote}</p></Link>) : <div key={action.id} className="lp-action-locked"><span>{action.context} · {action.verb}</span><b>{action.label}</b><p>{action.truthNote}</p><em>LOCKED</em></div>)}</section></main>;
}

export function FollowBergen() {
  const items = [GLOBAL_RESEARCH_FEED_ITEM, ...FOLLOW_BERGEN_ITEMS];
  return <main className="lp-shell"><Seo title="Follow Bergen — 4PLANET" description="A minimal living-planet feed for Bergen: research, decisions, explanation and action." path="/follow/bergen" robots="noindex,follow" /><LPNav /><header className="lp-hero lp-feed-hero"><div className="lp-eyebrow"><span>FOLLOW BERGEN</span><span>FEED PROOF 01</span></div><h1>Follow what matters to a place.</h1><p>Evidence quality + relevance + public value + human wellbeing + living-planet relevance. Not an infinite news feed.</p></header><section className="lp-feed">{items.map((item) => <Link key={item.id} to={item.href}><div><span>{item.kind}</span><time>{item.date}</time><em>{item.confidence}</em></div><h2>{item.title}</h2><p>{item.summary}</p><b>OPEN →</b></Link>)}</section><section className="lp-truth-note"><strong>PROTOTYPE BOUNDARY</strong><p>This feed is curated from canonical records. Push notifications, user accounts and subscriptions are not claimed live yet.</p></section></main>;
}

export function BetterChoiceBergen() {
  return <main className="lp-shell"><Seo title="Better Choice — Bergen Mobility | 4PLANET" description="A transparent decision-support proof balancing human needs and living-planet consequences." path="/choices/bergen-mobility" robots="noindex,follow" /><LPNav /><header className="lp-hero lp-choice-hero"><div className="lp-eyebrow"><span>BETTER CHOICES ENGINE 01</span><span>PERSON</span></div><h1>{BERGEN_MOBILITY_CHOICE.question}</h1><p>{BERGEN_MOBILITY_CHOICE.context}</p></header><section className="lp-choice-loop">{["CONTEXT", "EVIDENCE", "OPTIONS", "TRADE-OFFS", "INCENTIVES", "CHOICE", "ACTION", "LEARNING"].map((item, index) => <div key={item}><span>0{index + 1}</span><b>{item}</b></div>)}</section><section className="lp-choice-options">{BERGEN_MOBILITY_CHOICE.options.map((option) => <article key={option.id}><span>{option.label}</span><h2>{option.bestWhen}</h2><div><strong>TRADE-OFF</strong><p>{option.tradeOff}</p></div><div><strong>LIVING PLANET</strong><p>{option.planetNote}</p></div><em>{option.evidenceState.replaceAll("_", " ")}</em></article>)}</section><section className="lp-truth-note"><strong>NO GUILT. NO FAKE PRECISION.</strong><p>The engine should recommend only after it has enough route and user context. A necessary car trip is not a moral failure; a credible better option should win because it works for the user.</p></section></main>;
}

export function CoordinationProof() {
  const { eligible, blocked } = CAPITAL_DOGFOOD;
  return <main className="lp-shell"><Seo title="Coordination Proof — 4PLANET" description="Explainable coordination proof for capital and canonical update propagation." path="/coordination-proof" robots="noindex,nofollow" /><LPNav /><header className="lp-hero"><div className="lp-eyebrow"><span>INTERNAL DOGFOOD PROJECTION</span></div><h1>Matching should explain itself.</h1><p>Good thematic fit cannot override eligibility, delivery truth, rights, freshness or authority.</p></header><section className="lp-two"><article className="lp-match pass"><span>{eligible.state}</span><h2>HMF × Plastic Behaviour / Reuse</h2>{eligible.explanation.map((line) => <p key={line}>{line}</p>)}</article><article className="lp-match blocked"><span>{blocked.state}</span><h2>Innovation Norway startup route × current entity</h2>{blocked.blockers.map((line) => <p key={line}>{line}</p>)}</article></section></main>;
}
