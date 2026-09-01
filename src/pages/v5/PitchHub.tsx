import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { img } from "@/content/imageRegistry";
import { T } from "@/styles/tokens";
import "@/styles/pitch-hub.css";

type AudienceKey = "capital" | "field" | "science" | "companies" | "collaborators";

type Audience = {
  label: string;
  title: string;
  copy: string;
  action: string;
  to: string;
  accent: string;
};

const AUDIENCES: Record<AudienceKey, Audience> = {
  capital: {
    label: "CAPITAL",
    title: "Fund shared intelligence, not another isolated information silo.",
    copy: "4PLANET is building reusable public infrastructure that can strengthen species, places, decisions and action at the same time. The proof is the connected product family below.",
    action: "SEE FUNDING PATHS",
    to: "/funders",
    accent: T.blue,
  },
  field: {
    label: "FIELD",
    title: "Make credible field work easier to understand, find and follow.",
    copy: "Species, places, evidence and Actor profiles can connect field activity to the wider living system without turning a profile into a partnership or an intervention into an outcome claim.",
    action: "SEE ACTORS",
    to: "/actors",
    accent: T.acid,
  },
  science: {
    label: "SCIENCE + DATA",
    title: "Turn evidence into usable context without flattening uncertainty.",
    copy: "4PLANET keeps source, date, limitations and unknowns attached while translating fragmented records into human-readable species, place and relationship views.",
    action: "SEE THE METHOD",
    to: "/about/system",
    accent: T.pink,
  },
  companies: {
    label: "COMPANIES",
    title: "Connect products and decisions to the living systems behind them.",
    copy: "4SAPIEN and CHOICE are being built on the same evidence spine so human utility, economics and planetary consequences can stay visible without one moral score or paid ranking.",
    action: "OPEN 4SAPIEN",
    to: "/4sapien",
    accent: T.red,
  },
  collaborators: {
    label: "COLLABORATORS",
    title: "Help build a public intelligence layer for a living planet.",
    copy: "Design, engineering, research, storytelling and field expertise can strengthen one connected system instead of creating another disconnected tool.",
    action: "JOIN 4PLANET",
    to: "/join",
    accent: T.blue,
  },
};

const FLOW = [
  { key: "SEE", product: "ATLAS", line: "Observe species, places, events and human systems in spatial context." },
  { key: "UNDERSTAND", product: "LIVING SYSTEMS", line: "Reveal relationships, dependencies, pressures, evidence and unknowns." },
  { key: "CHOOSE", product: "4SAPIEN / EMBLA", line: "Turn evidence into clearer decisions and explicit trade-offs." },
  { key: "ACT", product: "IMPACT", line: "Connect understanding to participation only where a real pathway is ready." },
  { key: "PROVE", product: "PROOF", line: "Keep contribution, delivery, evidence and ecological outcome as separate states." },
  { key: "LEARN", product: "BRAIN", line: "Use corrections and verified outcomes to improve the next decision." },
] as const;

const PRODUCTS = [
  { name: "ATLAS", job: "SEE", line: "A spatial interface for source-aware living-planet intelligence.", to: "/atlas", state: "TEST KING", accent: T.blue },
  { name: "SPECIES", job: "MEET LIFE", line: "Start with one living being, then move into records, place and relationships.", to: "/species", state: "TEST KING", accent: T.acid },
  { name: "LIVING SYSTEMS", job: "UNDERSTAND", line: "Follow dependencies and pressures without hiding uncertainty.", to: "/living-systems", state: "TEST KING", accent: T.pink },
  { name: "4SAPIEN", job: "CHOOSE", line: "A personal decision product being pushed toward useful everyday choices.", to: "/4sapien", state: "DEVELOPMENT", accent: T.red },
  { name: "IMPACT", job: "ACT + PROVE", line: "A controlled path from participation toward delivery evidence and outcomes.", to: "/impact", state: "DELIVERY GATED", accent: T.blue },
] as const;

const PROOFS = [
  {
    name: "ORCA",
    meta: "SPECIES → RELATIONSHIPS → EVIDENCE → BAY OF BISCAY",
    line: "The leading Human Gold candidate: meet one animal first, then follow the living system around it.",
    href: "/journey/orca/",
    staticRoute: true,
    image: img("wh4lesHero"),
    state: "HUMAN GOLD CANDIDATE",
    accent: T.blue,
  },
  {
    name: "AMAZONIA",
    meta: "PLACE → FOREST → WATER → CLIMATE → LIFE",
    line: "The land-system transfer case: a rainforest must use the shared intelligence grammar without becoming a copy of the ocean experience.",
    href: "/living-systems/amazonia",
    staticRoute: false,
    image: img("amazoniaHero"),
    state: "IN DEVELOPMENT",
    accent: T.acid,
  },
  {
    name: "OSLOFJORDEN",
    meta: "PLACE → PRESSURES → HABITATS → RESPONSE",
    line: "The local-system transfer case: cumulative pressure and possible recovery without pretending one cause or intervention explains the fjord.",
    href: "/living-systems/oslofjorden",
    staticRoute: false,
    image: img("rewildMarineHero"),
    state: "IN DEVELOPMENT",
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
        description="A private two-minute proof of the connected 4PLANET product system."
        path="/present"
        robots="noindex,follow"
      />

      <nav className="pitch-nav" aria-label="Presentation navigation">
        <Link to="/" className="pitch-brand">4PLANET_</Link>
        <div className="pitch-nav-meta"><span>PRIVATE PROOF</span><Link to="/">PUBLIC 4PLANET ↗</Link></div>
      </nav>

      <header className="pitch-hero">
        <picture className="pitch-hero-media" aria-hidden="true">
          {earth.srcMobile && <source media="(max-width: 680px)" srcSet={earth.srcMobile} />}
          <img src={earth.src} alt="" fetchPriority="high" />
        </picture>
        <div className="pitch-hero-scrim" />
        <div className="pitch-hero-copy">
          <div className="pitch-kicker">LIVING PLANET INTELLIGENCE</div>
          <h1>The living planet is connected.<br /><span>Our knowledge is not.</span></h1>
          <p>4PLANET connects evidence, life, places, human systems and action so people can see what matters, understand relationships and make better next decisions.</p>
          <a className="pitch-primary" href="#proof">SEE WHAT EXISTS <span>↓</span></a>
        </div>
      </header>

      <section className="pitch-audience" aria-labelledby="pitch-audience-title">
        <div className="pitch-section-label">YOUR PATH · 01</div>
        <h2 id="pitch-audience-title">Same system. Different reason to care.</h2>
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

      <section className="pitch-system" aria-labelledby="pitch-system-title">
        <div className="pitch-system-head">
          <div>
            <div className="pitch-section-label">HOW IT WORKS · 02</div>
            <h2 id="pitch-system-title">One loop from signal to learning.</h2>
          </div>
          <p>Not one giant dashboard. Shared evidence and relationships underneath; different human interfaces on top.</p>
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

      <section id="proof" className="pitch-proof">
        <div className="pitch-proof-intro">
          <div className="pitch-section-label">PROOF · 03</div>
          <h2>Open the actual system.</h2>
          <p>No deck-only claims. The strongest evidence is a working product with its uncertainty and current maturity visible.</p>
        </div>
        <div className="pitch-proof-stack">
          {PROOFS.map((proof) => {
            const content = (
              <>
                <img src={proof.image.src} alt={proof.image.alt} loading="lazy" decoding="async" />
                <div className="pitch-proof-scrim" />
                <div className="pitch-proof-top"><span>{proof.meta}</span><span>{proof.state}</span></div>
                <div className="pitch-proof-copy"><h3>{proof.name}</h3><p>{proof.line}</p><b>OPEN PROOF ↗</b></div>
              </>
            );

            return proof.staticRoute ? (
              <a key={proof.name} href={proof.href} className="pitch-proof-card" style={{ "--proof-accent": proof.accent } as React.CSSProperties}>{content}</a>
            ) : (
              <Link key={proof.name} to={proof.href} className="pitch-proof-card" style={{ "--proof-accent": proof.accent } as React.CSSProperties}>{content}</Link>
            );
          })}
        </div>
      </section>

      <section className="pitch-products">
        <div className="pitch-products-intro">
          <div className="pitch-section-label">PRODUCT FAMILY · 04</div>
          <h2>Different doors. Shared truth.</h2>
          <p>The products are separate experiences, not separate realities. A stronger species, place, source or Actor object can improve several interfaces at once.</p>
        </div>
        <div className="pitch-product-list">
          {PRODUCTS.map((product) => (
            <Link key={product.name} to={product.to} className="pitch-product" style={{ "--product-accent": product.accent } as React.CSSProperties}>
              <div className="pitch-product-main"><span>{product.job}</span><h3>{product.name}</h3><p>{product.line}</p></div>
              <div className="pitch-product-status"><span>{product.state}</span><b>OPEN ↗</b></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="pitch-invitation" style={{ "--invite-accent": audience.accent } as React.CSSProperties}>
        <div className="pitch-section-label">NEXT · 05</div>
        <h2>{audience.title}</h2>
        <p>{audience.copy}</p>
        <div className="pitch-invite-actions">
          <Link className="pitch-invite-primary" to={audience.to}>{audience.action} ↗</Link>
          <Link className="pitch-invite-secondary" to="/about/system">UNDERSTAND THE SYSTEM</Link>
        </div>
      </section>

      <footer className="pitch-footer">
        <div><strong>4PLANET_</strong><span>FOR A LIVING PLANET.</span></div>
        <div><span>PRIVATE PROOF · 2026</span><Link to="/">ENTER 4PLANET ↗</Link></div>
      </footer>
    </main>
  );
}
