import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { img } from "@/content/imageRegistry";
import { T } from "@/styles/tokens";
import "@/styles/pitch-hub.css";

type AudienceKey = "capital" | "field" | "science" | "companies" | "collaborators";

const AUDIENCES: Record<AudienceKey, { label: string; title: string; copy: string; action: string; to: string; accent: string }> = {
  capital: {
    label: "CAPITAL",
    title: "Back infrastructure that makes better planetary decisions possible.",
    copy: "4PLANET is building shared intelligence, public products and proof systems that can strengthen several ecological use cases at once — rather than funding another isolated information silo.",
    action: "EXPLORE THE FUNDING PATH",
    to: "/funders",
    accent: T.blue,
  },
  field: {
    label: "FIELD PARTNERS",
    title: "Make real field work easier to understand, find and follow.",
    copy: "Actor profiles, place context, Species, ATLAS and future Impact pathways can connect credible field activity to the people, evidence and support around it without inventing partnership or outcome claims.",
    action: "EXPLORE ACTORS",
    to: "/actors",
    accent: T.acid,
  },
  science: {
    label: "SCIENCE + DATA",
    title: "Turn trusted evidence into usable public context without flattening uncertainty.",
    copy: "4PLANET preserves source, date, limitations and uncertainty while translating fragmented records into species, place and relationship views ordinary people can actually navigate.",
    action: "EXPLORE THE SYSTEM",
    to: "/about/system",
    accent: T.pink,
  },
  companies: {
    label: "COMPANIES",
    title: "See dependencies, pressures and choices before making claims.",
    copy: "The same living-planet model can connect human products and companies to evidence, value chains, dependencies and better choices — with payment kept separate from truth and ranking.",
    action: "EXPLORE 4SAPIEN",
    to: "/4sapien",
    accent: T.red,
  },
  collaborators: {
    label: "COLLABORATORS",
    title: "Help build a public intelligence layer for a living planet.",
    copy: "Design, engineering, research, storytelling and field expertise can all strengthen one connected system — with one truth model and many controlled interfaces.",
    action: "JOIN 4PLANET",
    to: "/join",
    accent: T.blue,
  },
};

const FLOW = [
  { key: "SEE", line: "Observe species, places, events and human systems in context.", product: "ATLAS" },
  { key: "UNDERSTAND", line: "Reveal relationships, dependencies, pressures and uncertainty.", product: "LIVING SYSTEMS" },
  { key: "CHOOSE", line: "Turn evidence into clearer human decisions and trade-offs.", product: "EMBLA / 4SAPIEN" },
  { key: "ACT", line: "Connect understanding to credible participation when a pathway is ready.", product: "IMPACT" },
  { key: "PROVE", line: "Keep contribution, delivery, evidence and outcome as separate states.", product: "PROOF" },
  { key: "LEARN", line: "Use verified outcomes and corrections to improve the next decision.", product: "BRAIN" },
] as const;

const PRODUCTS = [
  { no: "01", name: "ATLAS", verb: "SEE", line: "Explore what is happening on the living planet through source-aware spatial data.", to: "/atlas", status: "PUBLIC PROTOTYPE", accent: T.blue },
  { no: "02", name: "SPECIES", verb: "MEET LIFE", line: "Start with a living being, then move into identity, place, records and relationships.", to: "/species", status: "PUBLIC PROTOTYPE", accent: T.acid },
  { no: "03", name: "LIVING SYSTEMS", verb: "UNDERSTAND", line: "See what depends on what — and where evidence, interpretation and unknowns diverge.", to: "/living-systems", status: "ORCA JOURNEY AVAILABLE", accent: T.pink },
  { no: "04", name: "EMBLA", verb: "CHOOSE", line: "A personal decision product being pushed toward one simple job: help me make a better choice right now.", to: "/4sapien/food", status: "FOOD PROTOTYPE", accent: T.red },
  { no: "05", name: "IMPACT", verb: "ACT + PROVE", line: "A transparent path from contribution toward delivery evidence and outcomes — only when real-world gates are satisfied.", to: "/impact", status: "DELIVERY GATED", accent: T.blue },
] as const;

const PROOFS = [
  {
    no: "01",
    name: "ORCA",
    meta: "SPECIES → PLACE → RELATIONSHIPS → FIELD CONTEXT",
    line: "A working guided journey that follows the animal honestly, preserving what is known, interpreted and unknown.",
    to: "/living-systems/orca",
    image: img("wh4lesHero"),
    status: "AVAILABLE",
    accent: T.blue,
  },
  {
    no: "02",
    name: "AMAZONIA",
    meta: "PLACE → FOREST → WATER → CLIMATE → LIFE",
    line: "A reusable place-system proof connecting rainforest relationships to the same shared planetary model.",
    to: "/living-systems/amazonia",
    image: img("amazoniaHero"),
    status: "IN DEVELOPMENT",
    accent: T.acid,
  },
  {
    no: "03",
    name: "OSLOFJORDEN",
    meta: "PLACE → PRESSURES → HABITATS → RECOVERY POSSIBILITIES",
    line: "A local-system proof for understanding cumulative pressure without pretending one actor or intervention explains the whole fjord.",
    to: "/living-systems/oslofjorden",
    image: img("rewildMarineHero"),
    status: "IN DEVELOPMENT",
    accent: T.pink,
  },
] as const;

const audienceKeys = Object.keys(AUDIENCES) as AudienceKey[];

export default function PitchHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("for") as AudienceKey | null;
  const audienceKey: AudienceKey = requested && audienceKeys.includes(requested) ? requested : "capital";
  const audience = AUDIENCES[audienceKey];
  const [flowIndex, setFlowIndex] = useState(0);
  const selectedFlow = FLOW[flowIndex];
  const earth = useMemo(() => img("heroEarth"), []);

  const selectAudience = (key: AudienceKey) => {
    const next = new URLSearchParams(searchParams);
    next.set("for", key);
    setSearchParams(next, { replace: true });
  };

  return (
    <main className="pitch-hub" style={{ "--pitch-audience": audience.accent } as React.CSSProperties}>
      <Seo
        title="4PLANET — Living Planet Intelligence"
        description="A concise interactive introduction to 4PLANET and its connected public products."
        path="/present"
        robots="noindex,follow"
      />

      <nav className="pitch-nav" aria-label="Presentation navigation">
        <Link to="/" className="pitch-brand">4PLANET_</Link>
        <div className="pitch-nav-meta"><span>PRIVATE PREVIEW</span><Link to="/">PUBLIC 4PLANET ↗</Link></div>
      </nav>

      <header className="pitch-hero">
        <picture className="pitch-hero-media" aria-hidden="true">
          {earth.srcMobile && <source media="(max-width: 680px)" srcSet={earth.srcMobile} />}
          <img src={earth.src} alt="" />
        </picture>
        <div className="pitch-hero-scrim" />
        <div className="pitch-hero-copy">
          <div className="pitch-kicker">LIVING PLANET INTELLIGENCE</div>
          <h1>The living planet is one system.<br /><span>Human knowledge is not.</span></h1>
          <p>4PLANET connects evidence, life, places, human systems and action into public products people can actually understand and use.</p>
          <a className="pitch-primary" href="#system">SEE THE SYSTEM <span>↓</span></a>
        </div>
        <div className="pitch-hero-index" aria-hidden="true"><span>01</span><span>4P / 2026</span></div>
      </header>

      <section className="pitch-audience" aria-labelledby="pitch-audience-title">
        <div className="pitch-section-label">WHO ARE YOU?</div>
        <h2 id="pitch-audience-title">One core story. Your relevant path.</h2>
        <div className="pitch-audience-tabs" role="group" aria-label="Choose presentation audience">
          {audienceKeys.map((key) => (
            <button
              key={key}
              type="button"
              className={key === audienceKey ? "is-active" : ""}
              aria-pressed={key === audienceKey}
              onClick={() => selectAudience(key)}
            >
              {AUDIENCES[key].label}
            </button>
          ))}
        </div>
        <div className="pitch-audience-answer" aria-live="polite">
          <div className="pitch-audience-signal" />
          <div>
            <div className="pitch-mini">FOR {audience.label}</div>
            <h3>{audience.title}</h3>
            <p>{audience.copy}</p>
            <Link to={audience.to}>{audience.action} <span>↗</span></Link>
          </div>
        </div>
      </section>

      <section className="pitch-fragmentation">
        <div className="pitch-frag-top"><span>THE GAP</span><span>02</span></div>
        <div className="pitch-frag-grid">
          <h2>We already know an enormous amount about Earth.</h2>
          <div className="pitch-frag-statement">
            <p>Species records. Satellites. Research. Companies. Field organisations. Climate signals. Solutions.</p>
            <strong>The problem is that the knowledge is fragmented exactly where decisions are connected.</strong>
          </div>
        </div>
      </section>

      <section id="system" className="pitch-system">
        <div className="pitch-system-head">
          <div><div className="pitch-section-label">THE SYSTEM · 03</div><h2>From seeing the planet to making a better next decision.</h2></div>
          <p>Not one giant dashboard. A shared intelligence spine with different human interfaces.</p>
        </div>
        <div className="pitch-flow" role="tablist" aria-label="4PLANET intelligence loop">
          {FLOW.map((step, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={index === flowIndex}
              key={step.key}
              className={index === flowIndex ? "is-active" : ""}
              onClick={() => setFlowIndex(index)}
            >
              <span>0{index + 1}</span>{step.key}
            </button>
          ))}
        </div>
        <div className="pitch-flow-answer" role="tabpanel" aria-live="polite">
          <div className="pitch-flow-word">{selectedFlow.key}</div>
          <div><span>{selectedFlow.product}</span><p>{selectedFlow.line}</p></div>
        </div>
      </section>

      <section className="pitch-products">
        <div className="pitch-products-intro">
          <div className="pitch-section-label">WHAT EXISTS · 04</div>
          <h2>Five ways into the same living planet.</h2>
          <p>Each product has one clear job. They share context and truth rather than duplicating reality.</p>
        </div>
        <div className="pitch-product-list">
          {PRODUCTS.map((product) => (
            <Link key={product.name} to={product.to} className="pitch-product" style={{ "--product-accent": product.accent } as React.CSSProperties}>
              <div className="pitch-product-no">{product.no}</div>
              <div className="pitch-product-main"><span>{product.verb}</span><h3>{product.name}</h3><p>{product.line}</p></div>
              <div className="pitch-product-status"><span>{product.status}</span><b>OPEN ↗</b></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="pitch-proof">
        <div className="pitch-proof-intro"><div className="pitch-section-label">PROOF, NOT PROMISES · 05</div><h2>Start with real places and living systems.</h2></div>
        <div className="pitch-proof-stack">
          {PROOFS.map((proof) => (
            <Link key={proof.name} to={proof.to} className="pitch-proof-card" style={{ "--proof-accent": proof.accent } as React.CSSProperties}>
              <img src={proof.image.src} alt={proof.image.alt} loading="lazy" decoding="async" />
              <div className="pitch-proof-scrim" />
              <div className="pitch-proof-top"><span>{proof.no}</span><span>{proof.status}</span></div>
              <div className="pitch-proof-copy"><div>{proof.meta}</div><h3>{proof.name}</h3><p>{proof.line}</p><b>OPEN EXPERIENCE ↗</b></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="pitch-difference">
        <div className="pitch-difference-number">06</div>
        <div className="pitch-difference-copy">
          <div className="pitch-section-label">WHY 4PLANET</div>
          <h2>Not more environmental information.<br />A better way to connect what humanity already knows.</h2>
          <div className="pitch-difference-line">
            <span>TRUTH</span><span>RELATIONSHIPS</span><span>HUMAN UTILITY</span><span>ACTION</span><span>LEARNING</span>
          </div>
          <p>Sources remain inspectable. Uncertainty stays visible. The same species, place or actor can improve multiple products. A correction can propagate instead of being rediscovered five times.</p>
        </div>
      </section>

      <section className="pitch-now">
        <div className="pitch-now-side"><span>07</span><span>WHY NOW</span></div>
        <div>
          <h2>Planetary data is growing fast.<br />Human attention is not.</h2>
          <p>AI makes information easier to generate. That raises the value of trusted context: knowing what a record means, what it connects to, how certain it is and what a person can responsibly do with it.</p>
        </div>
      </section>

      <section className="pitch-invitation" style={{ "--invite-accent": audience.accent } as React.CSSProperties}>
        <div className="pitch-section-label">YOUR PATH · 08</div>
        <h2>{audience.title}</h2>
        <p>{audience.copy}</p>
        <div className="pitch-invite-actions">
          <Link className="pitch-invite-primary" to={audience.to}>{audience.action} ↗</Link>
          <Link className="pitch-invite-secondary" to="/about">UNDERSTAND 4PLANET</Link>
        </div>
      </section>

      <footer className="pitch-footer">
        <div><strong>4PLANET_</strong><span>FOR A LIVING PLANET.</span></div>
        <div><span>PUBLIC PROTOTYPE FAMILY · 2026</span><Link to="/">ENTER 4PLANET ↗</Link></div>
      </footer>
    </main>
  );
}
