import { Link, Navigate, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import {
  ACTOR_GOLD_PROFILES,
  ACTOR_GOLD_RELEASE_RULES,
  ACTOR_GOLD_VISUAL_LADDER,
  actorBySlug,
  type ActorGoldProfile,
} from "@/content/actorGold";
import { GetInvolvedSection } from "@/pages/v5/Participation";
import "@/styles/actor-gold.css";

function RelationshipMark({ actor }: { actor: ActorGoldProfile }) {
  const label = actor.relationshipState === "DIRECT_DIALOGUE"
    ? "DIRECT DIALOGUE"
    : actor.relationshipState === "VERIFIED_PARTNER"
      ? "VERIFIED PARTNER"
      : "PUBLIC RECORD";
  return <span className="actor-gold-state" aria-label={`Relationship status: ${label}`}>{label}</span>;
}

function OrcaSignatureVisual({ actor }: { actor: ActorGoldProfile }) {
  return (
    <figure className="actor-gold-visual" aria-labelledby="actor-visual-caption">
      <div className="actor-gold-visual-head">
        <span>4PLANET ACTOR VISUAL 01</span>
        <span>PLACE + FIELD METHOD</span>
      </div>
      <svg className="actor-gold-route" viewBox="0 0 1000 620" role="img" aria-label="Illustrative monitoring corridor from England through the Bay of Biscay to Spain">
        <defs>
          <linearGradient id="ocean-field" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#071833" />
            <stop offset="0.52" stopColor="#052b57" />
            <stop offset="1" stopColor="#03101e" />
          </linearGradient>
          <radialGradient id="signal-field" cx="50%" cy="48%" r="60%">
            <stop offset="0" stopColor="#70d9ff" stopOpacity="0.2" />
            <stop offset="1" stopColor="#70d9ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="620" fill="url(#ocean-field)" />
        <rect width="1000" height="620" fill="url(#signal-field)" />
        <g className="actor-gold-grid" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, index) => <line key={`v-${index}`} x1={100 + index * 100} y1="0" x2={100 + index * 100} y2="620" />)}
          {Array.from({ length: 6 }).map((_, index) => <line key={`h-${index}`} x1="0" y1={100 + index * 100} x2="1000" y2={100 + index * 100} />)}
        </g>
        <path className="actor-gold-coast actor-gold-coast-west" d="M0 0H350C320 76 335 130 286 182C245 226 271 278 236 332C199 389 208 446 151 500C118 531 102 575 91 620H0Z" />
        <path className="actor-gold-coast actor-gold-coast-south" d="M410 620C474 552 529 538 599 520C681 500 724 455 784 441C849 425 915 432 1000 396V620Z" />
        <path className="actor-gold-corridor-shadow" d="M320 98C396 170 425 214 469 277C523 354 579 398 663 477" />
        <path className="actor-gold-corridor" d="M320 98C396 170 425 214 469 277C523 354 579 398 663 477" />
        <circle className="actor-gold-node" cx="320" cy="98" r="8" />
        <circle className="actor-gold-node" cx="470" cy="278" r="8" />
        <circle className="actor-gold-node" cx="663" cy="477" r="8" />
        <g className="actor-gold-map-labels">
          <text x="292" y="72">ENGLAND</text>
          <text x="492" y="264">BAY OF BISCAY</text>
          <text x="684" y="507">SPAIN</text>
          <text x="690" y="74" className="actor-gold-visual-word">SURVEY</text>
          <text x="690" y="112" className="actor-gold-visual-word">EFFORT</text>
          <text x="690" y="150" className="actor-gold-visual-word">→ EVIDENCE</text>
        </g>
      </svg>
      <figcaption id="actor-visual-caption">
        <strong>{actor.visual.label}</strong>
        <span>{actor.visual.truthBoundary}</span>
      </figcaption>
    </figure>
  );
}

function SectionIntro({ number, eyebrow, title, copy }: { number: string; eyebrow: string; title: string; copy: string }) {
  return (
    <header className="actor-gold-section-intro">
      <span className="actor-gold-section-number">{number}</span>
      <div>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <div className="actor-gold-rule" />
        <span>{copy}</span>
      </div>
    </header>
  );
}

export function ActorsIndex() {
  return (
    <main className="actor-index">
      <Seo
        title="Actors — 4PLANET"
        description="Source-aware profiles of organisations and people doing real work across the living planet."
        path="/actors"
        robots="noindex,follow"
      />
      <header className="actor-index-hero">
        <Link className="actor-gold-brand" to="/">4PLANET_</Link>
        <p>ACTORS</p>
        <h1>Who is doing the work?</h1>
        <span>Discover credible actors, understand what they actually do, then find a real way to help.</span>
        <Link className="participation-index-entry" to="/get-involved">FIND YOUR WAY TO HELP →</Link>
      </header>
      <section className="actor-index-grid" aria-label="Actor Gold profiles">
        {ACTOR_GOLD_PROFILES.map((actor) => (
          <Link key={actor.id} className="actor-index-card" to={`/actors/${actor.slug}`}>
            <div className="actor-index-card-top"><span>{actor.id}</span><RelationshipMark actor={actor} /></div>
            <h2>{actor.name}</h2>
            <p>{actor.actorType}</p>
            <span>{actor.oneLine}</span>
            <div className="actor-index-card-foot">OPEN GOLD PROFILE <span aria-hidden>↗</span></div>
          </Link>
        ))}
      </section>
      <section className="actor-index-method">
        <p>GOLD METHOD</p>
        <h2>One exceptional system. Ten unlike actors. Then scale.</h2>
        <span>ORCA is Gold 01. Get Involved is now part of the same profile grammar: identity → trust → real participation, with source and cost reality intact.</span>
      </section>
    </main>
  );
}

export function ActorProfilePage() {
  const { slug } = useParams();
  const actor = actorBySlug(slug);
  if (!actor) return <Navigate to="/actors" replace />;

  return (
    <main className="actor-gold">
      <Seo
        title={`${actor.name} — Actor Profile | 4PLANET`}
        description={actor.oneLine}
        path={`/actors/${actor.slug}`}
        robots={actor.publicationState === "PUBLIC" ? "index,follow,max-image-preview:large" : "noindex,follow"}
        jsonLd={({ canonicalUrl }) => ({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: actor.name,
          description: actor.oneLine,
          url: canonicalUrl,
          identifier: actor.id,
        })}
      />

      <nav className="actor-gold-nav" aria-label="Actor profile navigation">
        <Link className="actor-gold-brand" to="/">4PLANET_</Link>
        <div><Link to="/actors">ACTORS</Link><a href="#get-involved">GET INVOLVED</a><Link to="/atlas">ATLAS</Link></div>
      </nav>

      <header className="actor-gold-hero">
        <div className="actor-gold-kicker"><span>ACTOR GOLD 01</span><RelationshipMark actor={actor} /><span>{actor.publicationState}</span></div>
        <h1>{actor.name}</h1>
        <p>{actor.actorType}</p>
        <div className="actor-gold-hero-copy">{actor.oneLine}</div>
        <div className="actor-gold-hero-meta">
          <span>ID {actor.id}</span>
          <span>FIELD / MONITORING</span>
          <span>OCE4N_</span>
        </div>
        <a className="actor-gold-get-involved-jump" href="#get-involved">GET INVOLVED ↓</a>
      </header>

      <section className="actor-gold-visual-wrap">
        <OrcaSignatureVisual actor={actor} />
      </section>

      <section className="actor-gold-section actor-gold-section-light">
        <SectionIntro number="01" eyebrow="WHAT THEY ACTUALLY DO" title="Work before branding." copy="The profile starts with the work itself: observable methods, operating contexts and evidence boundaries." />
        <div className="actor-gold-list-grid">
          {actor.work.map((item, index) => <article key={item}><span>0{index + 1}</span><h3>{item}</h3></article>)}
        </div>
      </section>

      <section className="actor-gold-section actor-gold-section-blue">
        <SectionIntro number="02" eyebrow="PLACES / ATLAS" title="Work happens somewhere." copy="Geography is typed by role and precision. A route is not a migration path; a broad operating area is not an exact project site." />
        <div className="actor-gold-place-list">
          {actor.places.map((place) => (
            <article key={`${place.label}-${place.role}`}><h3>{place.label}</h3><p>{place.role}</p><span>{place.precision}</span></article>
          ))}
        </div>
      </section>

      <section className="actor-gold-section actor-gold-section-dark">
        <SectionIntro number="03" eyebrow="LIVING CONTEXT" title="The work sits inside a living system." copy="Species and ecosystems are context links, not decorations or implied outcome claims." />
        <div className="actor-gold-context-columns">
          <div><p>SPECIES</p>{actor.species.map((item) => <span key={item}>{item}</span>)}</div>
          <div><p>ECOSYSTEMS</p>{actor.ecosystems.map((item) => <span key={item}>{item}</span>)}</div>
        </div>
        <Link className="actor-gold-inline-link" to="/species/orca">EXPLORE ORCA IN SPECIES →</Link>
      </section>

      <section className="actor-gold-section actor-gold-section-paper">
        <SectionIntro number="04" eyebrow="FIELD FEED" title="A live page only when the field is live." copy="Partner material enters this feed only after source, rights and editorial release. Empty is more trustworthy than invented activity." />
        {actor.fieldFeed.length === 0 ? (
          <div className="actor-gold-empty"><span>NO PUBLIC FIELD DISPATCHES YET</span><p>Intake → source QA → editorial review → public. This profile will populate automatically when real dispatches clear those gates.</p></div>
        ) : actor.fieldFeed.map((dispatch) => <article key={dispatch.sourcePackId}>{dispatch.title}</article>)}
      </section>

      <section className="actor-gold-section actor-gold-section-light">
        <SectionIntro number="05" eyebrow="MAGAZINE" title="Reporting is a separate layer." copy="4PLANET editorial judgement remains independent of actor profile status, funding or partner relationships." />
        <div className="actor-gold-editorial-list">
          {actor.magazineCoverage.map((item) => (
            <Link key={item.title} to={item.path}><span>{item.state}</span><h3>{item.title}</h3><b>OPEN MAGAZINE →</b></Link>
          ))}
        </div>
      </section>

      <section className="actor-gold-section actor-gold-section-dark">
        <SectionIntro number="06" eyebrow="PROJECTS / DATA / PROOF" title="Do not collapse activity into outcome." copy="Delivery, survey effort, observed data and ecological outcome stay separate until the evidence supports each level." />
        <div className="actor-gold-project-grid">
          {actor.projects.map((project) => <article key={project.title}><span>{project.state}</span><h3>{project.title}</h3><p>{project.note}</p></article>)}
          {actor.evidence.map((item) => <article key={item.label} className="actor-gold-evidence"><span>{item.state}</span><h3>{item.label}</h3><p>{item.note}</p></article>)}
        </div>
      </section>

      <GetInvolvedSection actorId={actor.id} />

      <section className="actor-gold-section actor-gold-section-action">
        <SectionIntro number="08" eyebrow="FOLLOW / SUPPORT / ACT" title="One useful next move, when it is real." copy="Actions stay locked until authority and delivery are verified. The interface never manufactures urgency to fill space." />
        <div className="actor-gold-actions">
          {actor.actions.map((action) => action.path && action.state === "OPEN" ? (
            <Link key={action.label} to={action.path}><span>{action.label}</span><b>↗</b></Link>
          ) : (
            <div key={action.label} className="actor-gold-action-locked"><span>{action.label}</span><b>LOCKED</b><p>{action.note}</p></div>
          ))}
        </div>
      </section>

      <section className="actor-gold-trust">
        <div><p>RELATIONSHIP / EDITORIAL DISCLOSURE</p><span>{actor.editorialDisclosure}</span></div>
        <div><p>SOURCE AUTHORITY</p><span>{actor.sourceAuthority}</span></div>
        <div><p>VISUAL RIGHTS MODEL</p><span>Primary profile visual requires no third-party photography. Documentary media is additive only after rights clearance.</span></div>
        <div><p>CORRECTIONS</p><Link to={actor.correctionsPath}>OPEN CORRECTIONS DESK →</Link></div>
      </section>

      <section className="actor-gold-engine-note">
        <p>ACTOR ENGINE 01</p>
        <h2>Identity to action, without losing truth.</h2>
        <span>The profile now carries a reusable participation seam: source-backed opportunities live as separate objects and can be projected into Actor, matching and future Atlas/Impact surfaces without duplicating identity.</span>
        <details><summary>VIEW VISUAL LADDER</summary>{ACTOR_GOLD_VISUAL_LADDER.map((rule) => <p key={rule}>{rule}</p>)}</details>
        <details><summary>VIEW RELEASE RULES</summary>{ACTOR_GOLD_RELEASE_RULES.map((rule) => <p key={rule}>{rule}</p>)}</details>
      </section>
    </main>
  );
}
