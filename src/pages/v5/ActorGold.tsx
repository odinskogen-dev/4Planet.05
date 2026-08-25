import { Link, Navigate, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { ACTOR_GOLD_PROFILES, ACTOR_GOLD_RELEASE_RULES, ACTOR_GOLD_VISUAL_LADDER, actorBySlug, type ActorGoldProfile } from "@/content/actorGold";
import "@/styles/actor-gold.css";

function RelationshipMark({ actor }: { actor: ActorGoldProfile }) {
  const label = actor.relationshipState === "DIRECT_DIALOGUE" ? "DIRECT DIALOGUE" : actor.relationshipState === "VERIFIED_PARTNER" ? "VERIFIED PARTNER" : "PUBLIC RECORD";
  return <span className="actor-gold-state">{label}</span>;
}

function ActorSignatureVisual({ actor }: { actor: ActorGoldProfile }) {
  const isOrca = actor.slug === "orca";
  return (
    <figure className="actor-gold-visual" aria-labelledby="actor-visual-caption">
      <div className="actor-gold-visual-head"><span>4PLANET ACTOR VISUAL {actor.goldIndex}</span><span>{actor.visual.primary.replaceAll("_", " ")}</span></div>
      <svg className="actor-gold-route" viewBox="0 0 1000 620" role="img" aria-label={actor.visual.label}>
        <defs>
          <linearGradient id={`actor-field-${actor.goldIndex}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#061527" /><stop offset="0.55" stopColor="#073c65" /><stop offset="1" stopColor="#05080d" /></linearGradient>
          <radialGradient id={`actor-signal-${actor.goldIndex}`} cx="50%" cy="45%" r="62%"><stop offset="0" stopColor="#8be2ff" stopOpacity="0.2" /><stop offset="1" stopColor="#8be2ff" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="1000" height="620" fill={`url(#actor-field-${actor.goldIndex})`} /><rect width="1000" height="620" fill={`url(#actor-signal-${actor.goldIndex})`} />
        <g className="actor-gold-grid" aria-hidden="true">{Array.from({ length: 9 }).map((_, i) => <line key={`v-${i}`} x1={100 + i * 100} y1="0" x2={100 + i * 100} y2="620" />)}{Array.from({ length: 6 }).map((_, i) => <line key={`h-${i}`} x1="0" y1={100 + i * 100} x2="1000" y2={100 + i * 100} />)}</g>
        {isOrca ? <>
          <path className="actor-gold-coast actor-gold-coast-west" d="M0 0H350C320 76 335 130 286 182C245 226 271 278 236 332C199 389 208 446 151 500C118 531 102 575 91 620H0Z" />
          <path className="actor-gold-coast actor-gold-coast-south" d="M410 620C474 552 529 538 599 520C681 500 724 455 784 441C849 425 915 432 1000 396V620Z" />
          <path className="actor-gold-corridor-shadow" d="M320 98C396 170 425 214 469 277C523 354 579 398 663 477" /><path className="actor-gold-corridor" d="M320 98C396 170 425 214 469 277C523 354 579 398 663 477" />
          <circle className="actor-gold-node" cx="320" cy="98" r="8" /><circle className="actor-gold-node" cx="470" cy="278" r="8" /><circle className="actor-gold-node" cx="663" cy="477" r="8" />
          <g className="actor-gold-map-labels"><text x="292" y="72">ENGLAND</text><text x="492" y="264">BAY OF BISCAY</text><text x="684" y="507">SPAIN</text><text x="690" y="74" className="actor-gold-visual-word">SURVEY</text><text x="690" y="112" className="actor-gold-visual-word">EFFORT</text><text x="690" y="150" className="actor-gold-visual-word">→ EVIDENCE</text></g>
        </> : <>
          <circle cx="500" cy="310" r="104" fill="none" stroke="rgba(139,226,255,.55)" strokeWidth="2" />
          <circle cx="500" cy="310" r="184" fill="none" stroke="rgba(139,226,255,.2)" strokeWidth="1" />
          <circle cx="500" cy="310" r="10" fill="#8be2ff" />
          {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([x,y], i) => <g key={i}><line x1="500" y1="310" x2={500 + x * 250} y2={310 + y * 175} stroke="rgba(139,226,255,.38)" strokeWidth="2" /><circle cx={500 + x * 250} cy={310 + y * 175} r="8" fill="#8be2ff" /></g>)}
          <g className="actor-gold-map-labels"><text x="455" y="290">ACTOR</text><text x="170" y="125">EVIDENCE</text><text x="690" y="125">PLACE</text><text x="165" y="515">ACTION</text><text x="690" y="515">PROOF</text></g>
        </>}
      </svg>
      <figcaption id="actor-visual-caption"><strong>{actor.visual.label}</strong><span>{actor.visual.truthBoundary}</span></figcaption>
    </figure>
  );
}

function SectionIntro({ number, eyebrow, title, copy }: { number: string; eyebrow: string; title: string; copy: string }) {
  return <header className="actor-gold-section-intro"><span className="actor-gold-section-number">{number}</span><div><p>{eyebrow}</p><h2>{title}</h2><div className="actor-gold-rule" /><span>{copy}</span></div></header>;
}

export function ActorsIndex() {
  return <main className="actor-index">
    <Seo title="Actors — 4PLANET" description="Source-aware intelligence profiles connecting actors to evidence, places, problems, decisions and action." path="/actors" robots="noindex,follow" />
    <header className="actor-index-hero"><Link className="actor-gold-brand" to="/">4PLANET_</Link><p>ACTOR INTELLIGENCE</p><h1>Who knows? Who can help?</h1><span>One canonical identity layer. Different actor types. Evidence before relationship theatre.</span></header>
    <section className="actor-index-grid" aria-label="Actor Gold profiles">{ACTOR_GOLD_PROFILES.map((actor) => <Link key={actor.id} className="actor-index-card" to={`/actors/${actor.slug}`}><div className="actor-index-card-top"><span>{actor.id}</span><RelationshipMark actor={actor} /></div><h2>{actor.name}</h2><p>{actor.actorType}</p><span>{actor.oneLine}</span><div className="actor-index-card-foot">OPEN GOLD {actor.goldIndex} <span aria-hidden>↗</span></div></Link>)}</section>
    <section className="actor-index-method"><p>GOLD METHOD</p><h2>One intelligence schema. Unlike actors.</h2><span>Monitoring, implementation, research, government and capital now stress-test the same identity/evidence/action grammar before x100 scale.</span></section>
  </main>;
}

export function ActorProfilePage() {
  const { slug } = useParams(); const actor = actorBySlug(slug); if (!actor) return <Navigate to="/actors" replace />;
  const contextItems = [...actor.species, ...actor.ecosystems, ...actor.systemTags];
  const linkedCount = Object.values(actor.intelligence).reduce((sum, list) => sum + list.length, 0);
  return <main className="actor-gold">
    <Seo title={`${actor.name} — Actor Profile | 4PLANET`} description={actor.oneLine} path={`/actors/${actor.slug}`} robots={actor.publicationState === "PUBLIC" ? "index,follow,max-image-preview:large" : "noindex,follow"} jsonLd={({ canonicalUrl }) => ({ "@context": "https://schema.org", "@type": "Organization", name: actor.name, description: actor.oneLine, url: canonicalUrl, identifier: actor.id })} />
    <nav className="actor-gold-nav" aria-label="Actor profile navigation"><Link className="actor-gold-brand" to="/">4PLANET_</Link><div><Link to="/actors">ACTORS</Link><Link to="/places/bergen">PLACE</Link><Link to="/research">RESEARCH</Link><Link to="/get-involved">GET INVOLVED</Link></div></nav>
    <header className="actor-gold-hero"><div className="actor-gold-kicker"><span>ACTOR GOLD {actor.goldIndex}</span><RelationshipMark actor={actor} /><span>{actor.publicationState}</span></div><h1>{actor.name}</h1><p>{actor.actorType}</p><div className="actor-gold-hero-copy">{actor.oneLine}</div><div className="actor-gold-hero-meta"><span>ID {actor.id}</span>{actor.systemTags.map((tag) => <span key={tag}>{tag}</span>)}</div></header>
    <section className="actor-gold-visual-wrap"><ActorSignatureVisual actor={actor} /></section>
    <section className="actor-gold-section actor-gold-section-light"><SectionIntro number="01" eyebrow="WHAT THEY ACTUALLY DO" title="Work before branding." copy="Observable work and public roles come before inferred intent, reputation or partnership." /><div className="actor-gold-list-grid">{actor.work.map((item, index) => <article key={item}><span>0{index + 1}</span><h3>{item}</h3></article>)}</div></section>
    <section className="actor-gold-section actor-gold-section-blue"><SectionIntro number="02" eyebrow="PLACE / JURISDICTION" title="Every role happens somewhere." copy="Geography is typed by role and precision. Jurisdiction, project site, research context and operating area are not interchangeable." /><div className="actor-gold-place-list">{actor.places.map((place) => <article key={`${place.label}-${place.role}`}><h3>{place.label}</h3><p>{place.role}</p><span>{place.precision}</span></article>)}</div></section>
    <section className="actor-gold-section actor-gold-section-dark"><SectionIntro number="03" eyebrow="SYSTEM CONTEXT" title="Identity becomes useful through relationships." copy="Species, ecosystems, research, problems, decisions and capital remain typed links — not decorative associations." /><div className="actor-gold-context-columns"><div><p>CONTEXT</p>{contextItems.length ? contextItems.map((item) => <span key={item}>{item}</span>) : <span>NO PUBLIC CONTEXT LINKS YET</span>}</div><div><p>INTELLIGENCE LINKS</p><span>{linkedCount} CONTROLLED LINKS</span><span>Research {actor.intelligence.researchIds.length}</span><span>Decisions {actor.intelligence.decisionIds.length}</span><span>Capital {actor.intelligence.capitalIds.length}</span></div></div></section>
    <section className="actor-gold-section actor-gold-section-paper"><SectionIntro number="04" eyebrow="LIVE / UPDATE FEED" title="Empty is better than invented." copy="Updates appear only after source, rights and release checks." />{actor.fieldFeed.length === 0 ? <div className="actor-gold-empty"><span>NO PUBLIC DISPATCHES YET</span><p>The profile remains useful through identity, evidence and relationships without manufacturing activity.</p></div> : actor.fieldFeed.map((dispatch) => <article key={dispatch.sourcePackId}>{dispatch.title}</article>)}</section>
    <section className="actor-gold-section actor-gold-section-dark"><SectionIntro number="05" eyebrow="RESEARCH / DECISIONS / PROJECTS" title="Do not collapse activity into outcome." copy="Evidence, project state, decision state, delivery and result remain separate." /><div className="actor-gold-project-grid">{actor.projects.map((project) => <article key={project.title}><span>{project.state}</span><h3>{project.title}</h3><p>{project.note}</p></article>)}{actor.evidence.map((item) => <article key={item.label} className="actor-gold-evidence"><span>{item.state}</span><h3>{item.label}</h3><p>{item.note}</p></article>)}</div></section>
    <section className="actor-gold-section actor-gold-section-action"><SectionIntro number="06" eyebrow="GET INVOLVED" title="Only real next moves." copy="Context-aware actions can be open or explicitly locked. The interface never manufactures urgency." /><div className="actor-gold-actions">{actor.actions.map((action) => action.path && action.state === "OPEN" ? <Link key={action.label} to={action.path}><span>{action.label}</span><b>↗</b></Link> : <div key={action.label} className="actor-gold-action-locked"><span>{action.label}</span><b>LOCKED</b><p>{action.note}</p></div>)}</div></section>
    <section className="actor-gold-trust"><div><p>DISCLOSURE</p><span>{actor.editorialDisclosure}</span></div><div><p>SOURCE AUTHORITY</p><span>{actor.sourceAuthority}</span></div><div><p>VISUAL TRUTH</p><span>{actor.visual.truthBoundary}</span></div><div><p>CORRECTIONS</p><Link to={actor.correctionsPath}>OPEN CORRECTIONS DESK →</Link></div></section>
    <section className="actor-gold-engine-note"><p>ACTOR INTELLIGENCE ENGINE</p><h2>Profile ≠ endorsement. Graph ≠ relationship.</h2><span>The value is identity + evidence + typed relationships + useful action, while uncertainty and missing evidence remain visible.</span><details><summary>VIEW VISUAL LADDER</summary>{ACTOR_GOLD_VISUAL_LADDER.map((rule) => <p key={rule}>{rule}</p>)}</details><details><summary>VIEW RELEASE RULES</summary>{ACTOR_GOLD_RELEASE_RULES.map((rule) => <p key={rule}>{rule}</p>)}</details></section>
  </main>;
}
